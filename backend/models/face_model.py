"""
Face Detection and Recognition System
Uses YOLO for fast person detection + Haar for face cropping.
Uses LBPH for face recognition.
Organizes face images into person-specific folders.

Folder Structure:
    _data-face/
        ash/           # Known person folder
            1.jpg
            2.jpg
        john_doe/      # Another person
            1.jpg
        unknown/       # Single folder for all unknown faces
            1705123456.jpg
"""

import os
import cv2
import numpy as np
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Tuple, Optional

# Try to import YOLO
try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False
    print("[WARNING] ultralytics not installed, using Haar Cascade only")

# Path to store face data
DATA_FACE_DIR = Path(__file__).parent / "_data-face"
UNKNOWN_DIR = DATA_FACE_DIR / "unknown"


class FaceDetector:
    """
    Face detection and recognition system using YOLO + LBPH.
    
    Detection Pipeline:
    1. YOLO detects people in frame
    2. Haar Cascade finds faces within person regions
    3. LBPH recognizes faces against known database
    """
    
    def __init__(self, max_distance: float = 80.0):
        """
        Initialize the face detector.
        
        Args:
            max_distance: Maximum LBPH distance to consider a match (lower = stricter).
        """
        self.max_distance = max_distance
        self.known_face_labels: Dict[int, str] = {}
        self.label_counter = 0
        
        # Initialize Haar Cascade for face detection
        print("[INFO] Loading face detection cascades...")
        cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        self.face_cascade = cv2.CascadeClassifier(cascade_path)
        
        alt_cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_alt2.xml'
        self.alt_cascade = cv2.CascadeClassifier(alt_cascade_path)
        
        # Initialize YOLO for person detection (faster initial filtering)
        self.yolo_model = None
        if YOLO_AVAILABLE:
            print("[INFO] Loading YOLO model...")
            try:
                self.yolo_model = YOLO('yolov8n.pt')
                print("[INFO] YOLO loaded - using hybrid detection")
            except Exception as e:
                print(f"[WARNING] YOLO failed: {e}")
                self.yolo_model = None
        
        # Initialize LBPH Face Recognizer
        print("[INFO] Initializing face recognizer...")
        self.recognizer = cv2.face.LBPHFaceRecognizer_create(
            radius=1,
            neighbors=8,
            grid_x=8,
            grid_y=8,
            threshold=200.0
        )
        self.is_trained = False
        
        # Ensure directories exist
        DATA_FACE_DIR.mkdir(parents=True, exist_ok=True)
        UNKNOWN_DIR.mkdir(parents=True, exist_ok=True)
        
        # Load known faces
        self.load_known_faces()
    
    def preprocess_face(self, face_roi: np.ndarray) -> np.ndarray:
        """Preprocess face for recognition."""
        face = cv2.resize(face_roi, (100, 100))
        face = cv2.equalizeHist(face)
        return face
    
    def load_known_faces(self) -> int:
        """
        Load faces from person-specific folders.
        
        Folder structure:
            _data-face/ash/1.jpg, 2.jpg, ...
            _data-face/john_doe/1.jpg, ...
        """
        self.known_face_labels = {}
        self.label_counter = 0
        faces = []
        labels = []
        name_to_label: Dict[str, int] = {}
        
        if not DATA_FACE_DIR.exists():
            print(f"[INFO] No data folder: {DATA_FACE_DIR}")
            return 0
        
        loaded_count = 0
        
        # Load from person folders
        for person_folder in DATA_FACE_DIR.iterdir():
            if not person_folder.is_dir() or person_folder.name.lower() == "unknown":
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
                    
                    # Try to detect face, or use whole image
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
                    print(f"[ERROR] Failed: {image_path.name} - {e}")
            
            if person_loaded > 0:
                print(f"[INFO] Loaded {person_loaded} images for: {person_name}")
                loaded_count += person_loaded
        
        # Train recognizer
        if faces:
            self.recognizer.train(faces, np.array(labels))
            self.is_trained = True
            print(f"[INFO] Trained on {loaded_count} faces, {len(name_to_label)} person(s)")
        else:
            self.is_trained = False
            print("[INFO] No faces to train on")
        
        return loaded_count
    
    def detect_faces(self, frame: np.ndarray) -> List[Tuple[int, int, int, int]]:
        """
        Detect faces using YOLO + Haar Cascade.
        
        If YOLO is available:
            1. YOLO detects people
            2. Haar finds faces in person regions
        
        If YOLO not available:
            - Use Haar Cascade directly on whole frame
        """
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        all_faces = []
        
        if self.yolo_model is not None:
            # Use YOLO to find people first
            results = self.yolo_model(frame, verbose=False, classes=[0])  # class 0 = person
            
            for result in results:
                for box in result.boxes:
                    # Get person bounding box
                    px1, py1, px2, py2 = map(int, box.xyxy[0])
                    
                    # Ensure valid region
                    px1, py1 = max(0, px1), max(0, py1)
                    px2, py2 = min(frame.shape[1], px2), min(frame.shape[0], py2)
                    
                    if px2 <= px1 or py2 <= py1:
                        continue
                    
                    # Search for face in person region
                    person_gray = gray[py1:py2, px1:px2]
                    
                    faces = self.face_cascade.detectMultiScale(
                        person_gray,
                        scaleFactor=1.1,
                        minNeighbors=4,
                        minSize=(30, 30)
                    )
                    
                    # Try alt cascade if no faces found
                    if len(faces) == 0:
                        faces = self.alt_cascade.detectMultiScale(
                            person_gray,
                            scaleFactor=1.1,
                            minNeighbors=4,
                            minSize=(30, 30)
                        )
                    
                    # Convert face coords to frame coords
                    for (fx, fy, fw, fh) in faces:
                        all_faces.append((px1 + fx, py1 + fy, fw, fh))
            
            # If YOLO found people but no faces, also check full frame
            if len(all_faces) == 0:
                faces = self.face_cascade.detectMultiScale(
                    gray, scaleFactor=1.1, minNeighbors=5, minSize=(50, 50)
                )
                all_faces.extend(list(faces))
        else:
            # Haar Cascade only
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
        """Recognize a face and return (name, confidence, distance)."""
        if not self.is_trained:
            return "Unknown", 0.0, 999.0
        
        x, y, w, h = face_rect
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Ensure valid region
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
        except Exception as e:
            print(f"[ERROR] Recognition: {e}")
        
        return "Unknown", 0.0, 999.0
    
    def save_face(self, frame: np.ndarray, face_rect: Tuple[int, int, int, int], 
                  name: str = None) -> str:
        """
        Save face to appropriate folder.
        Known faces -> _data-face/{name}/
        Unknown faces -> _data-face/unknown/
        """
        x, y, w, h = face_rect
        
        # Add padding
        padding = 30
        height, width = frame.shape[:2]
        x1 = max(0, x - padding)
        y1 = max(0, y - padding)
        x2 = min(width, x + w + padding)
        y2 = min(height, y + h + padding)
        
        face_image = frame[y1:y2, x1:x2]
        
        if name and name != "Unknown":
            # Save to person's folder
            folder_name = name.lower().replace(' ', '_')
            person_folder = DATA_FACE_DIR / folder_name
            person_folder.mkdir(parents=True, exist_ok=True)
            
            existing = list(person_folder.glob("*.jpg"))
            next_num = len(existing) + 1
            filepath = person_folder / f"{next_num}.jpg"
        else:
            # Save to unknown folder
            timestamp = int(datetime.now().timestamp())
            filepath = UNKNOWN_DIR / f"{timestamp}.jpg"
        
        cv2.imwrite(str(filepath), face_image)
        print(f"[SAVED] {filepath.relative_to(DATA_FACE_DIR)}")
        
        return str(filepath)
    
    def run_camera_feed(self, camera_index: int = 0, save_unknown: bool = True, 
                        save_recognized: bool = True, save_interval: float = 5.0) -> None:
        """Run real-time camera feed with detection and recognition."""
        print("\n" + "=" * 50)
        print("Starting Camera Feed")
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
            
            # Detect faces
            face_rects = self.detect_faces(frame)
            
            for face_rect in face_rects:
                x, y, w, h = face_rect
                name, confidence, distance = self.recognize_face(frame, face_rect)
                
                current_time = datetime.now().timestamp()
                
                # Debug output
                if debug_count < 15:
                    print(f"[DEBUG] Dist: {distance:.1f}, Conf: {confidence:.1f}%, Name: {name}")
                    debug_count += 1
                
                if name == "Unknown":
                    color = (0, 0, 255)  # Red
                    if save_unknown:
                        last_save = last_save_time.get("unknown", 0)
                        if (current_time - last_save) > save_interval:
                            self.save_face(frame, face_rect, None)
                            last_save_time["unknown"] = current_time
                else:
                    color = (0, 255, 0)  # Green
                    if save_recognized:
                        last_save = last_save_time.get(name, 0)
                        if (current_time - last_save) > save_interval * 2:
                            self.save_face(frame, face_rect, name)
                            last_save_time[name] = current_time
                
                # Draw rectangle and label
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
                print("\n[INFO] Reloading faces...")
                self.load_known_faces()
                debug_count = 0
            elif key == ord('s'):
                for face_rect in face_rects:
                    self.save_face(frame, face_rect, None)
        
        cap.release()
        cv2.destroyAllWindows()
        print("[INFO] Camera stopped")


def migrate_flat_to_folders():
    """Migrate flat files to folder structure."""
    if not DATA_FACE_DIR.exists():
        return 0
    
    migrated = 0
    UNKNOWN_DIR.mkdir(exist_ok=True)
    
    for image_path in list(DATA_FACE_DIR.iterdir()):
        if not image_path.is_file():
            continue
        if image_path.suffix.lower() not in ['.jpg', '.jpeg', '.png']:
            continue
        
        if image_path.stem.startswith('unknown'):
            new_path = UNKNOWN_DIR / image_path.name
            image_path.rename(new_path)
            print(f"[MIGRATE] {image_path.name} -> unknown/")
            migrated += 1
        else:
            stem = image_path.stem
            parts = stem.rsplit('_', 1)
            if len(parts) == 2 and parts[1].isdigit():
                person_name = parts[0]
            else:
                person_name = stem
            
            person_folder = DATA_FACE_DIR / person_name.lower()
            person_folder.mkdir(exist_ok=True)
            
            existing = list(person_folder.glob("*.jpg"))
            new_path = person_folder / f"{len(existing) + 1}.jpg"
            image_path.rename(new_path)
            print(f"[MIGRATE] {image_path.name} -> {person_name.lower()}/")
            migrated += 1
    
    return migrated


if __name__ == "__main__":
    import sys
    
    print("=" * 50)
    print("Face Detection & Recognition System")
    print("=" * 50)
    print(f"Data: {DATA_FACE_DIR}")
    print(f"YOLO: {'Available' if YOLO_AVAILABLE else 'Not installed'}")
    print()
    
    if len(sys.argv) > 1 and sys.argv[1] == "--migrate":
        count = migrate_flat_to_folders()
        print(f"\n[DONE] Migrated {count} files")
        sys.exit(0)
    
    print("Usage:")
    print("  1. Create folder: _data-face/{person_name}/")
    print("  2. Add 4-5 clear face photos to that folder")
    print("  3. Run this script to start detection")
    print()
    print("Run with --migrate to convert old files")
    print("=" * 50 + "\n")
    
    detector = FaceDetector()
    detector.run_camera_feed()
