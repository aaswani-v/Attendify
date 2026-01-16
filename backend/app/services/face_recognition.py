"""
Simplified Face Recognition Service (Development Mode)
For production, install: pip install cmake dlib face_recognition
"""

import pickle
import io
import hashlib
from PIL import Image
from sqlalchemy.orm import Session
from app.models.attendance import Student

# Mock face recognition for development
class MockFaceRecognition:
    """Mock implementation when face_recognition is not available"""
    
    @staticmethod
    def generate_mock_encoding(image_bytes):
        """Generate a deterministic 'encoding' based on image hash"""
        image_hash = hashlib.md5(image_bytes).digest()
        encoding = [float(b) for b in image_hash] + [0.0] * (128 - len(image_hash))
        return encoding[:128]
    
    @staticmethod
    def compare_encodings(known, unknown, tolerance=0.5):
        """Compare two encodings"""
        return known == unknown

try:
    import face_recognition as fr
    USE_REAL_FR = True
except ImportError:
    USE_REAL_FR = False
    print("⚠️  WARNING: face_recognition not installed. Using mock implementation.")
    print("   For production, install: pip install cmake dlib face_recognition")

def get_encoding(image_file) -> bytes:
    """Get face encoding from uploaded image"""
    # Read the uploaded file as bytes
    image_bytes = image_file.file.read()
    
    if USE_REAL_FR:
        # Use real face_recognition library
        image = Image.open(io.BytesIO(image_bytes))
        image = image.convert('RGB')
        face_locations = fr.face_locations(image)
        if not face_locations:
            raise ValueError("No face found in the image")
        encodings = fr.face_encodings(image, face_locations)
        if not encodings:
            raise ValueError("Could not encode face")
        return pickle.dumps(encodings[0])
    else:
        # Use mock implementation for development
        if len(image_bytes) < 1000:  # Basic validation
            raise ValueError("Image file too small or invalid")
        encoding = MockFaceRecognition.generate_mock_encoding(image_bytes)
        return pickle.dumps(encoding)

def verify_identity(image_file, db_session: Session) -> Student | None:
    """Verify identity against database"""
    try:
        unknown_encoding_bytes = get_encoding(image_file)
        unknown_encoding = pickle.loads(unknown_encoding_bytes)
    except ValueError:
        return None
    
    # Fetch all students
    students = db_session.query(Student).all()
    if not students:
        return None
    
    if USE_REAL_FR:
        # Use real face_recognition
        known_encodings = []
        student_list = []
        for student in students:
            try:
                encoding = pickle.loads(student.face_encoding)
                known_encodings.append(encoding)
                student_list.append(student)
            except:
                continue
        
        if not known_encodings:
            return None
        
        matches = fr.compare_faces(known_encodings, unknown_encoding, tolerance=0.5)
        for i, match in enumerate(matches):
            if match:
                return student_list[i]
    else:
        # Use mock comparison for development
        for student in students:
            try:
                stored_encoding = pickle.loads(student.face_encoding)
                if MockFaceRecognition.compare_encodings(stored_encoding, unknown_encoding):
                    return student
            except:
                continue
    
    return None