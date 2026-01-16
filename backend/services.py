import face_recognition
import pickle
import io
from PIL import Image
from sqlalchemy.orm import Session
from models.attendance import Student

def get_encoding(image_file) -> bytes:
    # Read the uploaded file as bytes
    image_bytes = image_file.file.read()
    # Load image from bytes
    image = Image.open(io.BytesIO(image_bytes))
    # Convert to RGB if necessary
    image = image.convert('RGB')
    # Find faces
    face_locations = face_recognition.face_locations(image)
    if not face_locations:
        raise ValueError("No face found in the image")
    # Get encodings
    encodings = face_recognition.face_encodings(image, face_locations)
    if not encodings:
        raise ValueError("Could not encode face")
    # Return pickled first encoding
    return pickle.dumps(encodings[0])

def verify_identity(image_file, db_session: Session) -> Student | None:
    # Get encoding from image
    try:
        unknown_encoding = pickle.loads(get_encoding(image_file))
    except ValueError:
        return None
    
    # Fetch all students
    students = db_session.query(Student).all()
    if not students:
        return None
    
    known_encodings = []
    student_list = []
    for student in students:
        try:
            encoding = pickle.loads(student.face_encoding)
            known_encodings.append(encoding)
            student_list.append(student)
        except:
            continue  # Skip invalid encodings
    
    if not known_encodings:
        return None
    
    # Compare
    matches = face_recognition.compare_faces(known_encodings, unknown_encoding, tolerance=0.5)
    
    # Find first match
    for i, match in enumerate(matches):
        if match:
            return student_list[i]
    
    return None