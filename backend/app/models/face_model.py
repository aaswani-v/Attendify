"""
Face Detection and Recognition System
Uses OpenCV for detection and recognition.
Stores unknown faces in _data-face folder for labeling.
"""

import os
import cv2
import numpy as np
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Tuple, Optional

# Path to store face data
DATA_FACE_DIR = Path(__file__).parent / "_data-face"


class FaceDetector:
    """
    Real-time face detection and recognition system using OpenCV.
    
    Workflow:
    1. Loads known faces from _data-face folder on initialization
    2. Detects faces in camera feed using OpenCV Haar Cascade
    3. Recognizes known faces using LBPH Face Recognizer
    4. Saves unknown faces for later labeling
    """
    
    def __init__(self, confidence_threshold: float = 70.0):
        """
        Initialize the face detector.
        
        Args:
            confidence_threshold: Minimum confidence to consider a match (0-100).
                                  Lower value = stricter matching.
        """
        self.confidence_threshold = confidence_threshold
        self.known_face_labels: Dict[int, str] = {}  # label_id -> name
        self.label_counter = 0
        
        # Initialize OpenCV face detector (Haar Cascade)
        cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        self.face_cascade = cv2.CascadeClassifier(cascade_path)
        
        # Initialize LBPH Face Recognizer
        self.recognizer = cv2.face.LBPHFaceRecognizer_create()
        self.is_trained = False
        
        # Ensure data directory exists
        DATA_FACE_DIR.mkdir(parents=True, exist_ok=True)
        
        # Load and train on known faces
        self.load_known_faces()
    
    def load_known_faces(self) -> int:
        """
        Load all known faces from the _data-face directory and train recognizer.
        
        File naming convention:
        - {person_name}.jpg or {person_name}.png
        - {person_name}_1.jpg for multiple images of same person
        - Files starting with 'unknown_' are skipped
        
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
        for image_path in DATA_FACE_DIR.iterdir():
            # Skip non-image files
            if image_path.suffix.lower() not in ['.jpg', '.jpeg', '.png']:
                continue
            
            # Skip unknown/unlabeled faces
            if image_path.stem.startswith('unknown_'):
                continue
            
            try:
                # Load image in grayscale
                image = cv2.imread(str(image_path), cv2.IMREAD_GRAYSCALE)
                if image is None:
                    continue
                
                # Detect face in image
                face_rects = self.face_cascade.detectMultiScale(
                    image, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30)
                )
                
                if len(face_rects) == 0:
                    print(f"[WARNING] No face found in: {image_path.name}")
                    continue
                
                # Use the first detected face
                x, y, w, h = face_rects[0]
                face_roi = image[y:y+h, x:x+w]
                face_roi = cv2.resize(face_roi, (100, 100))
                
                # Extract name from filename
                name = image_path.stem.split('_')[0] if '_' in image_path.stem else image_path.stem
                name = name.replace('-', ' ').title()
                
                # Assign label
                if name not in name_to_label:
                    name_to_label[name] = self.label_counter
                    self.known_face_labels[self.label_counter] = name
                    self.label_counter += 1
                
                label = name_to_label[name]
                faces.append(face_roi)
                labels.append(label)
                loaded_count += 1
                print(f"[INFO] Loaded face: {name} from {image_path.name}")
                    
            except Exception as e:
                print(f"[ERROR] Failed to load {image_path.name}: {e}")
        
        # Train the recognizer
        if faces:
            self.recognizer.train(faces, np.array(labels))
            self.is_trained = True
            print(f"[INFO] Trained on {loaded_count} faces")
        else:
            self.is_trained = False
            print("[INFO] No faces to train on")
        
        return loaded_count
    
    def detect_faces(self, frame: np.ndarray) -> List[Tuple[int, int, int, int]]:
        """
        Detect faces in a frame using OpenCV Haar Cascade.
        
        Args:
            frame: BGR image from OpenCV
            
        Returns:
            List of face locations as (x, y, w, h) tuples
        """
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(60, 60)
        )
        
        return list(faces) if len(faces) > 0 else []
    
    def recognize_face(self, frame: np.ndarray, face_rect: Tuple[int, int, int, int]) -> Tuple[str, float]:
        """
        Recognize a face and return the name.
        
        Args:
            frame: BGR image from OpenCV
            face_rect: (x, y, w, h) tuple
            
        Returns:
            Tuple of (name, confidence) where confidence is 0-100 (higher is better)
        """
        if not self.is_trained:
            return "Unknown", 0.0
        
        x, y, w, h = face_rect
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        face_roi = gray[y:y+h, x:x+w]
        face_roi = cv2.resize(face_roi, (100, 100))
        
        try:
            label, distance = self.recognizer.predict(face_roi)
            # Convert distance to confidence (lower distance = higher confidence)
            confidence = max(0, 100 - distance)
            
            if confidence >= self.confidence_threshold:
                name = self.known_face_labels.get(label, "Unknown")
                return name, confidence
        except Exception as e:
            print(f"[ERROR] Recognition failed: {e}")
        
        return "Unknown", 0.0
    
    def save_unknown_face(self, frame: np.ndarray, face_rect: Tuple[int, int, int, int]) -> str:
        """
        Save an unknown face to the _data-face directory.
        
        Args:
            frame: BGR image from OpenCV
            face_rect: (x, y, w, h) tuple
            
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
        
        # Generate filename with timestamp
        timestamp = int(datetime.now().timestamp())
        filename = f"unknown_{timestamp}.jpg"
        filepath = DATA_FACE_DIR / filename
        
        # Save the image
        cv2.imwrite(str(filepath), face_image)
        print(f"[INFO] Saved unknown face to: {filepath}")
        
        return str(filepath)
    
    def run_camera_feed(self, camera_index: int = 0, save_unknown: bool = True, 
                        save_interval: float = 5.0) -> None:
        """
        Run the real-time camera feed with face detection and recognition.
        
        Args:
            camera_index: Camera device index (default 0 for built-in webcam)
            save_unknown: Whether to save unknown faces automatically
            save_interval: Minimum seconds between saving the same unknown face
        """
        print("[INFO] Starting camera feed... Press 'q' to quit, 'r' to reload faces")
        
        # Use DirectShow backend on Windows for better compatibility
        print("[INFO] Attempting to open camera...")
        cap = cv2.VideoCapture(camera_index, cv2.CAP_DSHOW)
        
        if not cap.isOpened():
            print("[WARNING] DirectShow failed, trying default backend...")
            cap = cv2.VideoCapture(camera_index)
        
        if not cap.isOpened():
            print("[ERROR] Could not open camera. Make sure:")
            print("  1. You have a webcam connected")
            print("  2. No other app is using the camera")
            print("  3. Camera permissions are granted")
            return
        
        print("[INFO] Camera opened successfully!")
        
        # Create a named window and bring it to front
        window_name = 'Face Detection - Press Q to quit, R to reload'
        cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
        cv2.resizeWindow(window_name, 800, 600)
        cv2.moveWindow(window_name, 100, 100)
        
        # Track when we last saved an unknown face
        last_save_time: float = 0
        frame_count = 0
        
        while True:
            ret, frame = cap.read()
            if not ret:
                print("[ERROR] Failed to grab frame")
                break
            
            frame_count += 1
            if frame_count % 30 == 0:  # Print every 30 frames
                print(f"[DEBUG] Processing frame {frame_count}...")
            
            # Detect faces
            face_rects = self.detect_faces(frame)
            
            for face_rect in face_rects:
                x, y, w, h = face_rect
                name, confidence = self.recognize_face(frame, face_rect)
                
                # Choose color based on recognition
                if name == "Unknown":
                    color = (0, 0, 255)  # Red for unknown
                    
                    # Save unknown faces
                    if save_unknown:
                        current_time = datetime.now().timestamp()
                        if (current_time - last_save_time) > save_interval:
                            self.save_unknown_face(frame, face_rect)
                            last_save_time = current_time
                else:
                    color = (0, 255, 0)  # Green for known
                
                # Draw rectangle around face
                cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
                
                # Draw label
                label = f"{name}" if name == "Unknown" else f"{name} ({confidence:.0f}%)"
                label_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)[0]
                cv2.rectangle(frame, (x, y + h), (x + label_size[0], y + h + 25), color, -1)
                cv2.putText(frame, label, (x, y + h + 18), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
            
            # Display frame
            cv2.imshow(window_name, frame)
            
            # Handle key presses
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            elif key == ord('r'):
                print("[INFO] Reloading known faces...")
                self.load_known_faces()
        
        cap.release()
        cv2.destroyAllWindows()
        print("[INFO] Camera feed stopped")


def get_data_folder_path() -> str:
    """Get the path to the _data-face folder."""
    return str(DATA_FACE_DIR)


def list_known_faces() -> List[str]:
    """List all known (labeled) faces in the data folder."""
    detector = FaceDetector()
    return list(detector.known_face_labels.values())


def list_unknown_faces() -> List[str]:
    """List all unknown (unlabeled) faces in the data folder."""
    unknown_faces = []
    if DATA_FACE_DIR.exists():
        for image_path in DATA_FACE_DIR.iterdir():
            if image_path.suffix.lower() in ['.jpg', '.jpeg', '.png']:
                if image_path.stem.startswith('unknown_'):
                    unknown_faces.append(image_path.name)
    return unknown_faces


# Main entry point
if __name__ == "__main__":
    print("=" * 50)
    print("Face Detection and Recognition System")
    print("=" * 50)
    print(f"Data folder: {DATA_FACE_DIR}")
    print()
    print("Instructions:")
    print("1. Unknown faces will be saved to the _data-face folder")
    print("2. Rename 'unknown_*.jpg' files to '{person_name}.jpg' to label them")
    print("3. Press 'r' while running to reload known faces")
    print("4. Press 'q' to quit")
    print("=" * 50)
    
    detector = FaceDetector()
    detector.run_camera_feed()
