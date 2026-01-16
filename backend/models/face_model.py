"""
Face Detection and Recognition System with Face Clustering
Uses YOLO for fast person detection + Haar for face cropping.
Uses LBPH for face recognition and clustering.
Groups similar unknown faces together (Google Photos style).

Folder Structure:
    _data-face/
        ash/                  # Known person
        john_doe/             # Known person
        unknown_person_1/     # Clustered unknown #1
        unknown_person_2/     # Clustered unknown #2
        ...
"""

import os
import cv2
import numpy as np
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Tuple, Optional
import shutil

# Try to import YOLO
try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False
    print("[WARNING] ultralytics not installed, using Haar Cascade only")

# Path to store face data
DATA_FACE_DIR = Path(__file__).parent / "_data-face"


class FaceCluster:
    """Represents a cluster of similar faces (known or unknown person)."""
    def __init__(self, folder_path: Path, representative_face: np.ndarray = None):
        self.folder_path = folder_path
        self.representative_face = representative_face  # Preprocessed grayscale face
        self.name = folder_path.name.replace('_', ' ').title()
        self.is_unknown = folder_path.name.startswith('unknown_person')


class FaceDetector:
    """
    Face detection, recognition, and clustering system.
    
    Features:
    - YOLO + Haar detection
    - LBPH recognition
    - Face clustering: similar unknown faces grouped together
    """
    
    def __init__(self, max_distance: float = 80.0, cluster_threshold: float = 70.0):
        """
        Initialize the face detector.
        
        Args:
            max_distance: Max LBPH distance for recognition (lower = stricter).
            cluster_threshold: Max distance to consider same unknown person.
        """
        self.max_distance = max_distance
        self.cluster_threshold = cluster_threshold
        self.known_face_labels: Dict[int, str] = {}
        self.label_counter = 0
        
        # Face clusters for unknown persons
        self.unknown_clusters: List[FaceCluster] = []
        
        # Initialize Haar Cascade
        print("[INFO] Loading face detection cascades...")
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        self.alt_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_alt2.xml'
        )
        
        # Initialize YOLO
        self.yolo_model = None
        if YOLO_AVAILABLE:
            print("[INFO] Loading YOLO model...")
            try:
                self.yolo_model = YOLO('yolov8n.pt')
                print("[INFO] YOLO loaded - using hybrid detection")
            except Exception as e:
                print(f"[WARNING] YOLO failed: {e}")
        
        # Initialize LBPH Face Recognizer
        print("[INFO] Initializing face recognizer...")
        self.recognizer = cv2.face.LBPHFaceRecognizer_create(
            radius=1, neighbors=8, grid_x=8, grid_y=8, threshold=200.0
        )
        self.is_trained = False
        
        # Cluster recognizer for unknown faces
        self.cluster_recognizer = cv2.face.LBPHFaceRecognizer_create(
            radius=1, neighbors=8, grid_x=8, grid_y=8, threshold=200.0
        )
        self.cluster_trained = False
        
        # Ensure directories exist
        DATA_FACE_DIR.mkdir(parents=True, exist_ok=True)
        
        # Load known faces and clusters
        self.load_known_faces()
        self.load_unknown_clusters()
    
    def preprocess_face(self, face_roi: np.ndarray) -> np.ndarray:
        """Preprocess face for recognition."""
        face = cv2.resize(face_roi, (100, 100))
        face = cv2.equalizeHist(face)
        return face
    
    def load_known_faces(self) -> int:
        """Load faces from known person folders."""
        self.known_face_labels = {}
        self.label_counter = 0
        faces = []
        labels = []
        name_to_label: Dict[str, int] = {}
        
        loaded_count = 0
        
        for person_folder in DATA_FACE_DIR.iterdir():
            if not person_folder.is_dir():
                continue
            # Skip unknown_person clusters
            if person_folder.name.startswith('unknown_person'):
                continue
            
            person_name = person_folder.name.replace('_', ' ').title()
            
            if person_name not in name_to_label:
                name_to_label[person_name] = self.label_counter
                self.known_face_labels[self.label_counter] = person_name
                self.label_counter += 1
            
            label = name_to_label[person_name]
            person_loaded = 0
            
            for image_path in person_folder.iterdir():
                if image_path.suffix.lower() not in ['.jpg', '.jpeg', '.png']:
                    continue
                
                try:
                    image = cv2.imread(str(image_path), cv2.IMREAD_GRAYSCALE)
                    if image is None:
                        continue
                    
                    face_rects = self.face_cascade.detectMultiScale(
                        image, scaleFactor=1.1, minNeighbors=3, minSize=(20, 20)
                    )
                    
                    if len(face_rects) > 0:
                        x, y, w, h = max(face_rects, key=lambda r: r[2] * r[3])
                        face_roi = image[y:y+h, x:x+w]
                    else:
                        face_roi = image
                    
                    face_roi = self.preprocess_face(face_roi)
                    faces.append(face_roi)
                    labels.append(label)
                    person_loaded += 1
                except Exception as e:
                    print(f"[ERROR] {image_path.name}: {e}")
            
            if person_loaded > 0:
                print(f"[INFO] Loaded {person_loaded} images for: {person_name}")
                loaded_count += person_loaded
        
        if faces:
            self.recognizer.train(faces, np.array(labels))
            self.is_trained = True
            print(f"[INFO] Trained on {loaded_count} faces, {len(name_to_label)} person(s)")
        else:
            self.is_trained = False
        
        return loaded_count
    
    def load_unknown_clusters(self) -> int:
        """Load unknown person clusters and train cluster recognizer."""
        self.unknown_clusters = []
        faces = []
        labels = []
        
        cluster_idx = 0
        for folder in DATA_FACE_DIR.iterdir():
            if not folder.is_dir() or not folder.name.startswith('unknown_person'):
                continue
            
            # Get representative face from first image
            images = list(folder.glob("*.jpg"))
            if not images:
                continue
            
            rep_face = None
            folder_faces = []
            
            for img_path in images:
                try:
                    image = cv2.imread(str(img_path), cv2.IMREAD_GRAYSCALE)
                    if image is None:
                        continue
                    
                    face_rects = self.face_cascade.detectMultiScale(
                        image, scaleFactor=1.1, minNeighbors=3, minSize=(20, 20)
                    )
                    
                    if len(face_rects) > 0:
                        x, y, w, h = max(face_rects, key=lambda r: r[2] * r[3])
                        face_roi = image[y:y+h, x:x+w]
                    else:
                        face_roi = image
                    
                    face_roi = self.preprocess_face(face_roi)
                    folder_faces.append(face_roi)
                    
                    if rep_face is None:
                        rep_face = face_roi
                except:
                    pass
            
            if rep_face is not None:
                cluster = FaceCluster(folder, rep_face)
                self.unknown_clusters.append(cluster)
                
                for face in folder_faces:
                    faces.append(face)
                    labels.append(cluster_idx)
                
                print(f"[INFO] Loaded cluster: {folder.name} ({len(folder_faces)} images)")
                cluster_idx += 1
        
        if faces:
            self.cluster_recognizer.train(faces, np.array(labels))
            self.cluster_trained = True
            print(f"[INFO] {len(self.unknown_clusters)} unknown person clusters")
        
        return len(self.unknown_clusters)
    
    def find_cluster_for_face(self, face_gray: np.ndarray) -> Optional[FaceCluster]:
        """Find which cluster an unknown face belongs to."""
        if not self.cluster_trained or not self.unknown_clusters:
            return None
        
        face = self.preprocess_face(face_gray)
        
        try:
            label, distance = self.cluster_recognizer.predict(face)
            if distance <= self.cluster_threshold and label < len(self.unknown_clusters):
                return self.unknown_clusters[label]
        except:
            pass
        
        return None
    
    def create_new_cluster(self, face_image: np.ndarray, face_gray: np.ndarray) -> Path:
        """Create a new unknown person cluster folder."""
        # Find next cluster number
        existing = [
            int(d.name.replace('unknown_person_', ''))
            for d in DATA_FACE_DIR.iterdir()
            if d.is_dir() and d.name.startswith('unknown_person_')
        ]
        next_num = max(existing) + 1 if existing else 1
        
        folder = DATA_FACE_DIR / f"unknown_person_{next_num}"
        folder.mkdir(parents=True, exist_ok=True)
        
        # Save face
        filepath = folder / "1.jpg"
        cv2.imwrite(str(filepath), face_image)
        
        # Create cluster object
        face_processed = self.preprocess_face(face_gray)
        cluster = FaceCluster(folder, face_processed)
        self.unknown_clusters.append(cluster)
        
        # Retrain cluster recognizer
        self._retrain_cluster_recognizer()
        
        print(f"[NEW CLUSTER] Created: {folder.name}")
        return folder
    
    def _retrain_cluster_recognizer(self):
        """Retrain cluster recognizer with current clusters."""
        if not self.unknown_clusters:
            self.cluster_trained = False
            return
        
        faces = []
        labels = []
        
        for idx, cluster in enumerate(self.unknown_clusters):
            # Load all faces from cluster folder
            for img_path in cluster.folder_path.glob("*.jpg"):
                try:
                    image = cv2.imread(str(img_path), cv2.IMREAD_GRAYSCALE)
                    if image is None:
                        continue
                    
                    face_rects = self.face_cascade.detectMultiScale(
                        image, scaleFactor=1.1, minNeighbors=3, minSize=(20, 20)
                    )
                    
                    if len(face_rects) > 0:
                        x, y, w, h = max(face_rects, key=lambda r: r[2] * r[3])
                        face_roi = image[y:y+h, x:x+w]
                    else:
                        face_roi = image
                    
                    face_roi = self.preprocess_face(face_roi)
                    faces.append(face_roi)
                    labels.append(idx)
                except:
                    pass
        
        if faces:
            self.cluster_recognizer = cv2.face.LBPHFaceRecognizer_create(
                radius=1, neighbors=8, grid_x=8, grid_y=8, threshold=200.0
            )
            self.cluster_recognizer.train(faces, np.array(labels))
            self.cluster_trained = True
    
    def detect_faces(self, frame: np.ndarray) -> List[Tuple[int, int, int, int]]:
        """Detect faces using YOLO + Haar."""
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        all_faces = []
        
        if self.yolo_model is not None:
            results = self.yolo_model(frame, verbose=False, classes=[0])
            
            for result in results:
                for box in result.boxes:
                    px1, py1, px2, py2 = map(int, box.xyxy[0])
                    px1, py1 = max(0, px1), max(0, py1)
                    px2, py2 = min(frame.shape[1], px2), min(frame.shape[0], py2)
                    
                    if px2 <= px1 or py2 <= py1:
                        continue
                    
                    person_gray = gray[py1:py2, px1:px2]
                    faces = self.face_cascade.detectMultiScale(
                        person_gray, scaleFactor=1.1, minNeighbors=4, minSize=(30, 30)
                    )
                    
                    if len(faces) == 0:
                        faces = self.alt_cascade.detectMultiScale(
                            person_gray, scaleFactor=1.1, minNeighbors=4, minSize=(30, 30)
                        )
                    
                    for (fx, fy, fw, fh) in faces:
                        all_faces.append((px1 + fx, py1 + fy, fw, fh))
            
            if len(all_faces) == 0:
                faces = self.face_cascade.detectMultiScale(
                    gray, scaleFactor=1.1, minNeighbors=5, minSize=(50, 50)
                )
                all_faces.extend(list(faces))
        else:
            faces = self.face_cascade.detectMultiScale(
                gray, scaleFactor=1.1, minNeighbors=5, minSize=(50, 50)
            )
            if len(faces) == 0:
                faces = self.alt_cascade.detectMultiScale(
                    gray, scaleFactor=1.1, minNeighbors=5, minSize=(50, 50)
                )
            all_faces = list(faces)
        
        return all_faces
    
    def recognize_face(self, frame: np.ndarray, face_rect: Tuple[int, int, int, int]) -> Tuple[str, float, float]:
        """Recognize a face."""
        if not self.is_trained:
            return "Unknown", 0.0, 999.0
        
        x, y, w, h = face_rect
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        x, y = max(0, x), max(0, y)
        x2, y2 = min(gray.shape[1], x + w), min(gray.shape[0], y + h)
        
        if x2 <= x or y2 <= y:
            return "Unknown", 0.0, 999.0
        
        face_roi = gray[y:y2, x:x2]
        face_roi = self.preprocess_face(face_roi)
        
        try:
            label, distance = self.recognizer.predict(face_roi)
            confidence = max(0, min(100, 100 - (distance * 0.7)))
            
            if distance <= self.max_distance:
                name = self.known_face_labels.get(label, "Unknown")
                return name, confidence, distance
        except:
            pass
        
        return "Unknown", 0.0, 999.0
    
    def save_face(self, frame: np.ndarray, face_rect: Tuple[int, int, int, int], 
                  name: str = None) -> str:
        """
        Save face to appropriate folder with clustering.
        
        Known faces -> {name}/
        Unknown faces -> clustered into unknown_person_X/
        """
        x, y, w, h = face_rect
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Add padding
        padding = 30
        height, width = frame.shape[:2]
        x1, y1 = max(0, x - padding), max(0, y - padding)
        x2, y2 = min(width, x + w + padding), min(height, y + h + padding)
        
        face_image = frame[y1:y2, x1:x2]
        face_gray = gray[max(0, y):min(gray.shape[0], y+h), max(0, x):min(gray.shape[1], x+w)]
        
        if name and name != "Unknown":
            # Save to known person's folder
            folder_name = name.lower().replace(' ', '_')
            person_folder = DATA_FACE_DIR / folder_name
            person_folder.mkdir(parents=True, exist_ok=True)
            
            existing = list(person_folder.glob("*.jpg"))
            filepath = person_folder / f"{len(existing) + 1}.jpg"
        else:
            # Find or create cluster for this unknown face
            cluster = self.find_cluster_for_face(face_gray)
            
            if cluster is not None:
                # Add to existing cluster
                existing = list(cluster.folder_path.glob("*.jpg"))
                filepath = cluster.folder_path / f"{len(existing) + 1}.jpg"
            else:
                # Create new cluster
                folder = self.create_new_cluster(face_image, face_gray)
                return str(folder / "1.jpg")
        
        cv2.imwrite(str(filepath), face_image)
        print(f"[SAVED] {filepath.relative_to(DATA_FACE_DIR)}")
        return str(filepath)
    
    def run_camera_feed(self, camera_index: int = 0, save_unknown: bool = True, 
                        save_recognized: bool = True, save_interval: float = 5.0) -> None:
        """Run real-time camera feed."""
        print("\n" + "=" * 50)
        print("Face Detection with Clustering")
        print("=" * 50)
        print("Controls: Q=quit, R=reload, S=save")
        print("=" * 50 + "\n")
        
        cap = cv2.VideoCapture(camera_index, cv2.CAP_DSHOW)
        if not cap.isOpened():
            cap = cv2.VideoCapture(camera_index)
        
        if not cap.isOpened():
            print("[ERROR] Could not open camera")
            return
        
        print("[INFO] Camera ready!")
        
        window_name = 'Face Detection [Q:quit R:reload S:save]'
        cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
        cv2.resizeWindow(window_name, 800, 600)
        
        last_save_time: Dict[str, float] = {}
        debug_count = 0
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            face_rects = self.detect_faces(frame)
            
            for face_rect in face_rects:
                x, y, w, h = face_rect
                name, confidence, distance = self.recognize_face(frame, face_rect)
                current_time = datetime.now().timestamp()
                
                if debug_count < 15:
                    print(f"[DEBUG] Dist: {distance:.1f}, Conf: {confidence:.1f}%, Name: {name}")
                    debug_count += 1
                
                if name == "Unknown":
                    color = (0, 0, 255)
                    if save_unknown:
                        last_save = last_save_time.get("unknown", 0)
                        if (current_time - last_save) > save_interval:
                            self.save_face(frame, face_rect, None)
                            last_save_time["unknown"] = current_time
                else:
                    color = (0, 255, 0)
                    if save_recognized:
                        last_save = last_save_time.get(name, 0)
                        if (current_time - last_save) > save_interval * 2:
                            self.save_face(frame, face_rect, name)
                            last_save_time[name] = current_time
                
                cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
                label = "Unknown" if name == "Unknown" else f"{name} ({confidence:.0f}%)"
                label_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)[0]
                cv2.rectangle(frame, (x, y - 25), (x + label_size[0] + 10, y), color, -1)
                cv2.putText(frame, label, (x + 5, y - 7), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
            
            cv2.imshow(window_name, frame)
            
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            elif key == ord('r'):
                print("\n[INFO] Reloading...")
                self.load_known_faces()
                self.load_unknown_clusters()
                debug_count = 0
            elif key == ord('s'):
                for face_rect in face_rects:
                    self.save_face(frame, face_rect, None)
        
        cap.release()
        cv2.destroyAllWindows()
        print("[INFO] Camera stopped")


def rename_cluster_folder(old_name: str, new_name: str) -> bool:
    """
    Rename a cluster folder and renumber all files inside.
    
    Args:
        old_name: Current folder name (e.g., 'unknown_person_1')
        new_name: New person name (e.g., 'john_doe')
    
    Returns:
        True if successful
    """
    old_folder = DATA_FACE_DIR / old_name
    if not old_folder.exists():
        print(f"[ERROR] Folder not found: {old_name}")
        return False
    
    # Sanitize new name
    new_name_clean = new_name.lower().strip().replace(' ', '_')
    new_name_clean = ''.join(c for c in new_name_clean if c.isalnum() or c == '_')
    
    new_folder = DATA_FACE_DIR / new_name_clean
    
    if new_folder.exists():
        print(f"[ERROR] Folder already exists: {new_name_clean}")
        return False
    
    # Rename folder
    old_folder.rename(new_folder)
    
    # Renumber files
    images = sorted(new_folder.glob("*.jpg"))
    for i, img_path in enumerate(images, 1):
        new_path = new_folder / f"{i}.jpg"
        if img_path != new_path:
            img_path.rename(new_path)
    
    print(f"[RENAMED] {old_name} -> {new_name_clean}/ ({len(images)} files)")
    return True


def list_clusters():
    """List all person folders and their image counts."""
    print("\n" + "=" * 50)
    print("Face Data Folders")
    print("=" * 50)
    
    known = []
    unknown = []
    
    for folder in sorted(DATA_FACE_DIR.iterdir()):
        if not folder.is_dir():
            continue
        
        count = len(list(folder.glob("*.jpg")))
        if folder.name.startswith('unknown_person'):
            unknown.append((folder.name, count))
        else:
            known.append((folder.name, count))
    
    if known:
        print("\n[KNOWN PERSONS]")
        for name, count in known:
            display_name = name.replace('_', ' ').title()
            print(f"  {name}/ ({count} images) -> {display_name}")
    
    if unknown:
        print("\n[UNKNOWN CLUSTERS] - Rename to identify:")
        for name, count in unknown:
            print(f"  {name}/ ({count} images)")
        print("\n  To rename: python face_model.py --rename unknown_person_1 john_doe")
    
    print("=" * 50 + "\n")


if __name__ == "__main__":
    import sys
    
    print("=" * 50)
    print("Face Detection & Clustering System")
    print("=" * 50)
    print(f"Data: {DATA_FACE_DIR}")
    print(f"YOLO: {'Available' if YOLO_AVAILABLE else 'Not installed'}")
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "--list":
            list_clusters()
            sys.exit(0)
        elif sys.argv[1] == "--rename" and len(sys.argv) >= 4:
            rename_cluster_folder(sys.argv[2], sys.argv[3])
            sys.exit(0)
    
    print("\nUsage:")
    print("  1. Run to detect faces - similar unknowns grouped together")
    print("  2. --list to see all folders")
    print("  3. --rename unknown_person_X john_doe to identify a person")
    print("=" * 50 + "\n")
    
    detector = FaceDetector()
    detector.run_camera_feed()
