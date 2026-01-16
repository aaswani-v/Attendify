"""
Face Detection and Recognition System
Uses YOLO for fast face detection and LBPH for recognition.
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

# Try to import YOLO, fallback to Haar if not available
try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False
    print("[WARNING] ultralytics not installed, using Haar Cascade fallback")

# Path to store face data
DATA_FACE_DIR = Path(__file__).parent / "_data-face"
UNKNOWN_DIR = DATA_FACE_DIR / "unknown"


class FaceDetector:
    """
    Real-time face detection and recognition system.
    
    Features:
    - YOLO-based face detection (fast and accurate)
    - LBPH face recognition
    - Person-specific folder organization
    - Automatic saving of recognized faces for continuous learning
    """
    
    def __init__(self, max_distance: float = 80.0, use_yolo: bool = True):
        """
        Initialize the face detector.
        
        Args:
            max_distance: Maximum LBPH distance to consider a match.
                         Higher = more lenient, lower = stricter.
            use_yolo: Whether to use YOLO for detection (recommended).
        """
        self.max_distance = max_distance
        self.use_yolo = use_yolo and YOLO_AVAILABLE
        self.known_face_labels: Dict[int, str] = {}  # label_id -> name
        self.label_counter = 0
        
        # Initialize YOLO face detector
        if self.use_yolo:
            print("[INFO] Loading YOLO face detection model...")
            # Use YOLOv8 nano for face detection (smaller and faster)
            self.yolo_model = YOLO('yolov8n-face.pt')
            print("[INFO] YOLO model loaded successfully")
        else:
            # Fallback to Haar Cascade
            cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            self.face_cascade = cv2.CascadeClassifier(cascade_path)
            alt_cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_alt2.xml'
            self.alt_cascade = cv2.CascadeClassifier(alt_cascade_path)
        
        # Initialize LBPH Face Recognizer
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
        
        # Load and train on known faces
        self.load_known_faces()
    
    def preprocess_face(self, face_roi: np.ndarray) -> np.ndarray:
        """
        Preprocess face for better recognition.
        """
        # Resize to standard size
        face = cv2.resize(face_roi, (100, 100))
        
        # Apply histogram equalization to normalize lighting
        face = cv2.equalizeHist(face)
        
        return face
    
    def load_known_faces(self) -> int:
        """
        Load all known faces from person-specific folders.
        
        Each subfolder in _data-face/ is treated as a person's name.
        All images in that folder are used for training.
        
        Returns:
            Number of faces loaded
        """
        self.known_face_labels = {}
        self.label_counter = 0
        faces = []
        labels = []
        name_to_label: Dict[str, int] = {}
        
        if not DATA_FACE_DIR.exists():
            print(f"[INFO] Data directory not found: {DATA_FACE_DIR}")
            return 0
        
        loaded_count = 0
        persons_count = 0
        
        # Iterate through person folders
        for person_folder in DATA_FACE_DIR.iterdir():
            # Skip if not a directory or if it's the unknown folder
            if not person_folder.is_dir():
                continue
            if person_folder.name.lower() == "unknown":
                continue
            
            # Person name from folder name
            person_name = person_folder.name.replace('_', ' ').title()
            
            # Assign label for this person
            if person_name not in name_to_label:
                name_to_label[person_name] = self.label_counter
                self.known_face_labels[self.label_counter] = person_name
                self.label_counter += 1
                persons_count += 1
            
            label = name_to_label[person_name]
            
            # Load all images from this person's folder
            for image_path in person_folder.iterdir():
                if image_path.suffix.lower() not in ['.jpg', '.jpeg', '.png']:
                    continue
                
                try:
                    # Load image in grayscale
                    image = cv2.imread(str(image_path), cv2.IMREAD_GRAYSCALE)
                    if image is None:
                        continue
                    
                    # Try to detect face, or use whole image if already cropped
                    face_roi = self._extract_face_from_image(image)
                    if face_roi is None:
                        # Use entire image as face (assume pre-cropped)
                        face_roi = image
                    
                    # Preprocess
                    face_roi = self.preprocess_face(face_roi)
                    
                    faces.append(face_roi)
                    labels.append(label)
                    loaded_count += 1
                    
                except Exception as e:
                    print(f"[ERROR] Failed to load {image_path.name}: {e}")
            
            if loaded_count > 0:
                print(f"[INFO] Loaded {loaded_count} images for: {person_name}")
        
        # Also check for legacy flat files (backwards compatibility)
        for image_path in DATA_FACE_DIR.iterdir():
            if not image_path.is_file():
                continue
            if image_path.suffix.lower() not in ['.jpg', '.jpeg', '.png']:
                continue
            if image_path.stem.startswith('unknown'):
                continue
            
            try:
                image = cv2.imread(str(image_path), cv2.IMREAD_GRAYSCALE)
                if image is None:
                    continue
                
                face_roi = self._extract_face_from_image(image)
                if face_roi is None:
                    face_roi = image
                
                face_roi = self.preprocess_face(face_roi)
                
                # Extract name from filename
                stem = image_path.stem
                parts = stem.rsplit('_', 1)
                if len(parts) == 2 and parts[1].isdigit():
                    name = parts[0]
                else:
                    name = stem
                name = name.replace('_', ' ').title()
                
                if name not in name_to_label:
                    name_to_label[name] = self.label_counter
                    self.known_face_labels[self.label_counter] = name
                    self.label_counter += 1
                    persons_count += 1
                
                label = name_to_label[name]
                faces.append(face_roi)
                labels.append(label)
                loaded_count += 1
                print(f"[INFO] Loaded legacy file: {image_path.name} as {name}")
                
            except Exception as e:
                print(f"[ERROR] Failed to load {image_path.name}: {e}")
        
        # Train the recognizer
        if faces:
            self.recognizer.train(faces, np.array(labels))
            self.is_trained = True
            print(f"[INFO] Trained on {loaded_count} faces for {persons_count} person(s)")
        else:
            self.is_trained = False
            print("[INFO] No faces to train on")
        
        return loaded_count
    
    def _extract_face_from_image(self, image: np.ndarray) -> Optional[np.ndarray]:
        """Extract face region from an image using Haar Cascade."""
        if not hasattr(self, 'face_cascade'):
            cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            self._haar_cascade = cv2.CascadeClassifier(cascade_path)
        else:
            self._haar_cascade = self.face_cascade
        
        face_rects = self._haar_cascade.detectMultiScale(
            image, scaleFactor=1.1, minNeighbors=3, minSize=(20, 20)
        )
        
        if len(face_rects) == 0:
            return None
        
        x, y, w, h = max(face_rects, key=lambda r: r[2] * r[3])
        return image[y:y+h, x:x+w]
    
    def detect_faces(self, frame: np.ndarray) -> List[Tuple[int, int, int, int]]:
        """
        Detect faces in a frame.
        
        Args:
            frame: BGR image from OpenCV
            
        Returns:
            List of face locations as (x, y, w, h) tuples
        """
        if self.use_yolo:
            return self._detect_faces_yolo(frame)
        else:
            return self._detect_faces_haar(frame)
    
    def _detect_faces_yolo(self, frame: np.ndarray) -> List[Tuple[int, int, int, int]]:
        """Detect faces using YOLO."""
        results = self.yolo_model(frame, verbose=False)
        
        faces = []
        for result in results:
            for box in result.boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                w, h = x2 - x1, y2 - y1
                faces.append((x1, y1, w, h))
        
        return faces
    
    def _detect_faces_haar(self, frame: np.ndarray) -> List[Tuple[int, int, int, int]]:
        """Detect faces using Haar Cascade (fallback)."""
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        faces = self.face_cascade.detectMultiScale(
            gray, scaleFactor=1.1, minNeighbors=4, minSize=(50, 50)
        )
        
        if len(faces) == 0:
            faces = self.alt_cascade.detectMultiScale(
                gray, scaleFactor=1.1, minNeighbors=4, minSize=(50, 50)
            )
        
        return list(faces) if len(faces) > 0 else []
    
    def recognize_face(self, frame: np.ndarray, face_rect: Tuple[int, int, int, int]) -> Tuple[str, float, float]:
        """
        Recognize a face and return the name.
        
        Returns:
            Tuple of (name, confidence, distance)
        """
        if not self.is_trained:
            return "Unknown", 0.0, 999.0
        
        x, y, w, h = face_rect
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        face_roi = gray[y:y+h, x:x+w]
        face_roi = self.preprocess_face(face_roi)
        
        try:
            label, distance = self.recognizer.predict(face_roi)
            confidence = max(0, min(100, 100 - (distance * 0.7)))
            
            if distance <= self.max_distance:
                name = self.known_face_labels.get(label, "Unknown")
                return name, confidence, distance
                
        except Exception as e:
            print(f"[ERROR] Recognition failed: {e}")
        
        return "Unknown", 0.0, 999.0
    
    def save_face(self, frame: np.ndarray, face_rect: Tuple[int, int, int, int], 
                  name: str = None) -> str:
        """
        Save a face to the appropriate folder.
        
        - Known faces: saved to _data-face/{person_name}/
        - Unknown faces: saved to _data-face/unknown/
        
        Args:
            frame: BGR image from OpenCV
            face_rect: (x, y, w, h) tuple
            name: Person's name (if known) or None for unknown
            
        Returns:
            Path to the saved image
        """
        x, y, w, h = face_rect
        
        # Add padding around the face
        padding = 30
        height, width = frame.shape[:2]
        x1 = max(0, x - padding)
        y1 = max(0, y - padding)
        x2 = min(width, x + w + padding)
        y2 = min(height, y + h + padding)
        
        # Extract face region
        face_image = frame[y1:y2, x1:x2]
        
        if name and name != "Unknown":
            # Save to person's folder
            folder_name = name.lower().replace(' ', '_')
            person_folder = DATA_FACE_DIR / folder_name
            person_folder.mkdir(parents=True, exist_ok=True)
            
            # Find next available number
            existing = list(person_folder.glob("*.jpg"))
            next_num = len(existing) + 1
            filename = f"{next_num}.jpg"
            filepath = person_folder / filename
        else:
            # Save to unknown folder
            timestamp = int(datetime.now().timestamp())
            filename = f"{timestamp}.jpg"
            filepath = UNKNOWN_DIR / filename
        
        cv2.imwrite(str(filepath), face_image)
        print(f"[INFO] Saved: {filepath.relative_to(DATA_FACE_DIR)}")
        
        return str(filepath)
    
    def run_camera_feed(self, camera_index: int = 0, save_unknown: bool = True, 
                        save_recognized: bool = True, save_interval: float = 5.0) -> None:
        """
        Run the real-time camera feed with face detection and recognition.
        """
        print("[INFO] Starting camera feed...")
        print("Controls: Q=quit, R=reload faces, S=manual save")
        
        cap = cv2.VideoCapture(camera_index, cv2.CAP_DSHOW)
        
        if not cap.isOpened():
            cap = cv2.VideoCapture(camera_index)
        
        if not cap.isOpened():
            print("[ERROR] Could not open camera")
            return
        
        print("[INFO] Camera opened successfully!")
        
        window_name = 'Face Detection - Q:quit R:reload S:save'
        cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
        cv2.resizeWindow(window_name, 800, 600)
        
        last_save_time: Dict[str, float] = {}
        frame_count = 0
        debug_count = 0
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            frame_count += 1
            
            # Detect faces
            face_rects = self.detect_faces(frame)
            
            for face_rect in face_rects:
                x, y, w, h = face_rect
                name, confidence, distance = self.recognize_face(frame, face_rect)
                
                current_time = datetime.now().timestamp()
                
                # Debug output for first few detections
                if debug_count < 10:
                    print(f"[DEBUG] Distance: {distance:.1f}, Confidence: {confidence:.1f}%, Name: {name}")
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
                cv2.rectangle(frame, (x, y + h), (x + label_size[0] + 10, y + h + 25), color, -1)
                cv2.putText(frame, label, (x + 5, y + h + 18), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
            
            cv2.imshow(window_name, frame)
            
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            elif key == ord('r'):
                print("[INFO] Reloading faces...")
                self.load_known_faces()
                debug_count = 0
            elif key == ord('s'):
                for face_rect in face_rects:
                    self.save_face(frame, face_rect, None)
        
        cap.release()
        cv2.destroyAllWindows()
        print("[INFO] Camera feed stopped")


def migrate_flat_to_folders():
    """
    Migrate existing flat files to folder structure.
    Moves ash.jpg, ash_1.jpg etc to ash/ folder.
    """
    if not DATA_FACE_DIR.exists():
        print("[INFO] No data folder to migrate")
        return
    
    migrated = 0
    for image_path in list(DATA_FACE_DIR.iterdir()):
        if not image_path.is_file():
            continue
        if image_path.suffix.lower() not in ['.jpg', '.jpeg', '.png']:
            continue
        if image_path.stem.startswith('unknown'):
            # Move to unknown folder
            UNKNOWN_DIR.mkdir(exist_ok=True)
            new_path = UNKNOWN_DIR / image_path.name
            image_path.rename(new_path)
            print(f"[MIGRATE] {image_path.name} -> unknown/{image_path.name}")
            migrated += 1
            continue
        
        # Extract person name
        stem = image_path.stem
        parts = stem.rsplit('_', 1)
        if len(parts) == 2 and parts[1].isdigit():
            person_name = parts[0]
        else:
            person_name = stem
        
        # Create person folder and move
        person_folder = DATA_FACE_DIR / person_name.lower()
        person_folder.mkdir(exist_ok=True)
        
        # Find next number
        existing = list(person_folder.glob("*.jpg"))
        next_num = len(existing) + 1
        new_name = f"{next_num}.jpg"
        new_path = person_folder / new_name
        
        image_path.rename(new_path)
        print(f"[MIGRATE] {image_path.name} -> {person_name.lower()}/{new_name}")
        migrated += 1
    
    print(f"[MIGRATE] Migrated {migrated} files to folder structure")


def get_data_folder_path() -> str:
    """Get the path to the _data-face folder."""
    return str(DATA_FACE_DIR)


def list_known_faces() -> List[str]:
    """List all known (labeled) faces."""
    detector = FaceDetector(use_yolo=False)  # Don't load YOLO just for listing
    return list(detector.known_face_labels.values())


def list_unknown_faces() -> List[str]:
    """List all unknown faces."""
    if UNKNOWN_DIR.exists():
        return [f.name for f in UNKNOWN_DIR.iterdir() if f.suffix.lower() in ['.jpg', '.jpeg', '.png']]
    return []


if __name__ == "__main__":
    import sys
    
    print("=" * 50)
    print("Face Detection and Recognition System")
    print("=" * 50)
    print(f"Data folder: {DATA_FACE_DIR}")
    print(f"YOLO available: {YOLO_AVAILABLE}")
    print()
    
    # Check for migrate command
    if len(sys.argv) > 1 and sys.argv[1] == "--migrate":
        print("[INFO] Running migration...")
        migrate_flat_to_folders()
        print("[INFO] Migration complete. Run again without --migrate to start detection.")
        sys.exit(0)
    
    print("Folder Structure:")
    print("  _data-face/{person_name}/  - Put 4-5 photos for each team member")
    print("  _data-face/unknown/        - Unknown faces are saved here")
    print()
    print("Controls:")
    print("  Q - Quit")
    print("  R - Reload faces (after adding new photos)")
    print("  S - Manual save snapshot")
    print()
    print("Run with --migrate to convert old flat files to folder structure")
    print("=" * 50)
    
    detector = FaceDetector()
    detector.run_camera_feed()
