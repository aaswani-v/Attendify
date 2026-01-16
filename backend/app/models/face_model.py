"""
Face Detection and Recognition System
Enterprise-Grade OpenCV Implementation
Features:
- Histogram Equalization for lighting invariance
- Model persistence (save/load trained model)
- Confidence score mapping
- Robust error handling
"""

import os
import cv2
import numpy as np
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Tuple, Optional
import pickle
from app.core.logging import logger

# Path to store face data and models
DATA_DIR = Path(__file__).parent
DATA_FACE_DIR = DATA_DIR / "_data-face"
MODEL_FILE = DATA_DIR / "lbph_model.yml"
LABELS_FILE = DATA_DIR / "labels.pickle"

class FaceDetector:
    """
    Enterprise-grade Face Recognition Wrapper using OpenCV LBPH.
    """
    
    def __init__(self, distance_threshold: float = 120.0):
        """
        Initialize the face detector.
        Args:
            distance_threshold: Max LBPH distance to consider a possible match.
        """
        self.distance_threshold = distance_threshold
        self.known_face_labels: Dict[int, str] = {}
        self.label_counter = 0
        
        # Load Haar Cascade
        cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        self.face_cascade = cv2.CascadeClassifier(cascade_path)
        
        # Initialize LBPH Recognizer
        # grid_x/grid_y=8 (default) - increasing to 10 might capture more detail but is slower
        self.recognizer = cv2.face.LBPHFaceRecognizer_create(radius=1, neighbors=8, grid_x=8, grid_y=8)
        self.is_trained = False
        
        # Ensure data directory exists
        DATA_FACE_DIR.mkdir(parents=True, exist_ok=True)
        
        # Try to load existing model first for speed
        self._load_model_from_disk()

    def _load_model_from_disk(self):
        """Attempt to load trained model and labels from disk."""
        if MODEL_FILE.exists() and LABELS_FILE.exists():
            try:
                self.recognizer.read(str(MODEL_FILE))
                with open(LABELS_FILE, 'rb') as f:
                    data = pickle.load(f)
                    self.known_face_labels = data.get('labels', {})
                    self.label_counter = data.get('counter', 0)
                self.is_trained = True
                logger.info("Loaded pre-trained face model from disk.")
            except Exception as e:
                logger.warning(f"Failed to load model from disk: {e}. Retraining...")
                self.train_model()
        else:
            self.train_model()

    def _save_model_to_disk(self):
        """Save trained model and labels to disk."""
        try:
            self.recognizer.save(str(MODEL_FILE))
            with open(LABELS_FILE, 'wb') as f:
                pickle.dump({
                    'labels': self.known_face_labels,
                    'counter': self.label_counter
                }, f)
            logger.info("Saved trained model to disk.")
        except Exception as e:
            logger.error(f"Failed to save model: {e}")

    def preprocess_face(self, face_img: np.ndarray) -> np.ndarray:
        """
        Apply preprocessing to a face image before training/recognition.
        1. Convert to Grayscale (if needed)
        2. Resize to standard size
        3. Histogram Equalization (improves lighting invariance)
        """
        if len(face_img.shape) == 3:
            gray = cv2.cvtColor(face_img, cv2.COLOR_BGR2GRAY)
        else:
            gray = face_img
            
        # Standardize size
        resized = cv2.resize(gray, (100, 100))
        
        # Apply Histogram Equalization
        # This increases contrast and helps with varying lighting conditions
        equalized = cv2.equalizeHist(resized)
        
        return equalized

    def train_model(self) -> int:
        """
        Load all known faces and train the recognizer.
        """
        logger.info("Starting model training...")
        self.known_face_labels = {}
        self.label_counter = 0
        faces = []
        labels = []
        name_to_label: Dict[str, int] = {}
        
        if not DATA_FACE_DIR.exists():
            return 0
        
        loaded_count = 0
        for image_path in DATA_FACE_DIR.iterdir():
            if image_path.suffix.lower() not in ['.jpg', '.jpeg', '.png']:
                continue
            if image_path.stem.startswith('unknown_'):
                continue
            
            try:
                # Load image
                image = cv2.imread(str(image_path))
                if image is None:
                    continue
                
                # Detect face (use lenient settings for training data)
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
                face_rects = self.face_cascade.detectMultiScale(
                    gray, scaleFactor=1.05, minNeighbors=3, minSize=(30, 30)
                )
                
                if len(face_rects) == 0:
                    logger.warning(f"Skipped {image_path.name} - No face detected")
                    continue
                
                # Use the largest face
                x, y, w, h = max(face_rects, key=lambda r: r[2]*r[3])
                face_roi = image[y:y+h, x:x+w]
                
                # Preprocess
                processed_face = self.preprocess_face(face_roi)
                
                # Extract Label
                # Filename format: {id}_{name}.jpg or just {name}.jpg
                stem = image_path.stem
                if '_' in stem:
                    # If ID is present, try to use it to group same person
                    parts = stem.split('_')
                    name_key = parts[0] # Using ID as key if available, else first part
                else:
                    name_key = stem
                
                name_key = name_key.lower().strip()
                
                if name_key not in name_to_label:
                    name_to_label[name_key] = self.label_counter
                    self.known_face_labels[self.label_counter] = name_key
                    self.label_counter += 1
                
                label = name_to_label[name_key]
                faces.append(processed_face)
                labels.append(label)
                loaded_count += 1
                    
            except Exception as e:
                logger.error(f"Error processing {image_path.name}: {e}")
        
        if faces:
            self.recognizer.train(faces, np.array(labels))
            self.is_trained = True
            self._save_model_to_disk()
            logger.info(f"Training complete. Trained on {loaded_count} images.")
        else:
            self.is_trained = False
            logger.info("No valid faces found to train on.")
        
        return loaded_count
    
    def detect_faces(self, frame: np.ndarray) -> List[Tuple[int, int, int, int]]:
        """Detect faces in frame."""
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        # Moderate settings for realtime detection (balance speed/accuracy)
        faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=4, 
            minSize=(30, 30)
        )
        return list(faces)
    
    def recognize_face(self, frame: np.ndarray, face_rect: Tuple[int, int, int, int]) -> Tuple[str, float, float]:
        """
        Recognize a face.
        Returns: (Name/ID, Distance, Confidence%)
        """
        if not self.is_trained:
            return "Unknown", 0.0, 0.0
        
        x, y, w, h = face_rect
        face_roi = frame[y:y+h, x:x+w]
        
        # Apply SAME preprocessing as training
        processed_face = self.preprocess_face(face_roi)
        
        try:
            label, distance = self.recognizer.predict(processed_face)
            
            # Distance mapping to Confidence %
            # LBPH Distance 0 is perfect match. ~50 is good. >100 is bad.
            # Simple formula: max(0, 100 - distance) is too linear.
            # Let's use a slightly non-linear mapping.
            # If dist=0, conf=100. If dist=50, conf=80. If dist=100, conf=10.
            
            if distance > 100:
                # Rapid falloff
                confidence = max(0, (150 - distance) * 0.5) 
            else:
                # Linear-ish in good range
                confidence = max(0, 100 - (distance * 0.8))
            
            name = self.known_face_labels.get(label, "Unknown")
            
            logger.debug(f"Result: ID={name}, Dist={distance:.2f}, Conf={confidence:.1f}%")
            return name, distance, confidence
            
        except Exception as e:
            logger.error(f"Recognition error: {e}")
            return "Unknown", 999.0, 0.0

    def load_known_faces(self):
        """Legacy alias -> train_model"""
        return self.train_model()
