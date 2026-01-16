"""
Core Model Factory
Centralized model management and integration with FaceDetector
"""

import cv2
import numpy as np
import io
from typing import Optional, List
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.attendance import Student, AttendanceLog
from app.models.timetable import Teacher, Room, Subject, ClassGroup, TimetableEntry
from app.models.face_model import FaceDetector, DATA_FACE_DIR

# Initialize global FaceDetector
# The detector loads faces from disk on init.
face_detector = FaceDetector()

class ModelFactory:
    """Centralized model factory for all database operations"""

    @staticmethod
    def get_db_session():
        """Get database session"""
        return SessionLocal()

    @staticmethod
    def create_student(name: str, roll_number: str) -> Student:
        """Create a new student object (without encoding initially)"""
        return Student(
            name=name,
            roll_number=roll_number,
            face_encoding=b"LBPH_FILE_BASED" # Placeholder
        )

    @staticmethod
    def create_attendance_log(student_id: Optional[int], status: str = "Present") -> AttendanceLog:
        """Create attendance log entry"""
        return AttendanceLog(student_id=student_id, status=status)

    @staticmethod
    def register_student(name: str, roll_number: str, image_file) -> dict:
        """Register a new student and train face model"""
        db = ModelFactory.get_db_session()
        try:
            # Check if roll number already exists
            existing = db.query(Student).filter(Student.roll_number == roll_number).first()
            if existing:
                return {"success": False, "message": "Roll number already exists"}

            # Create student to get ID
            student = ModelFactory.create_student(name, roll_number)
            db.add(student)
            db.flush() # distinct from commit - gets the ID

            # Save image to models folder
            image_bytes = image_file.file.read()
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR) 
            
            if img is None:
                raise ValueError("Could not decode image")

            # Validate face presence before saving
            faces = face_detector.detect_faces(img)
            if not faces:
                raise ValueError("No face detected in the image - please ensure good lighting and clear view")

            # Naming convention: {student_id}_{name}.jpg
            # This ensures we can recover the ID from the filename during recognition
            # FaceDetector splits by '_' and takes the first part as the label/name
            safe_name = "".join(x for x in name if x.isalnum() or x in (' ', '-', '_')).strip()
            filename = f"{student.id}_{safe_name}.jpg"
            save_path = DATA_FACE_DIR / filename
            
            # Save image
            cv2.imwrite(str(save_path), img)
            
            # Reload/Train the detector to include the new face
            face_detector.load_known_faces()
            
            db.commit()
            return {"success": True, "message": "Student registered successfully", "student_id": student.id}

        except Exception as e:
            db.rollback()
            return {"success": False, "message": str(e)}
        finally:
            db.close()

    @staticmethod
    def mark_attendance(image_file) -> dict:
        """Mark attendance using face recognition"""
        db = ModelFactory.get_db_session()
        try:
            image_bytes = image_file.file.read()
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                 return {"success": False, "message": "Invalid image format"}

            faces = face_detector.detect_faces(img)
            if not faces:
                 return {"success": False, "message": "No face detected"}

            # Use the largest face
            largest_face = max(faces, key=lambda rect: rect[2] * rect[3])
            
            # Recognize
            name_label, confidence = face_detector.recognize_face(img, largest_face)
            
            student = None
            if name_label != "Unknown":
                # Try to interpret the label as a Student ID
                if name_label.isdigit():
                    student_id = int(name_label)
                    student = db.query(Student).filter(Student.id == student_id).first()
                else:
                    # Fallback: maybe it's a name?
                     student = db.query(Student).filter(Student.name == name_label).first()

            if student:
                log = ModelFactory.create_attendance_log(student.id, "Present")
                db.add(log)
                db.commit()
                return {
                    "success": True,
                    "name": student.name,
                    "status": "Present",
                    "message": f"Welcome, {student.name}!"
                }
            else:
                log = ModelFactory.create_attendance_log(None, "Unknown")
                db.add(log)
                db.commit()
                return {
                    "success": False,
                    "name": "Unknown",
                    "status": "Unknown",
                    "message": "Unknown User - Please register first"
                }

        except Exception as e:
            db.rollback()
            return {"success": False, "message": f"Error: {str(e)}"}
        finally:
            db.close()

    @staticmethod
    def get_students() -> List[dict]:
        """Get all registered students"""
        db = ModelFactory.get_db_session()
        try:
            students = db.query(Student).all()
            return [{
                "id": s.id,
                "name": s.name,
                "roll_number": s.roll_number
            } for s in students]
        finally:
            db.close()

    @staticmethod
    def get_attendance_logs() -> List[dict]:
        """Get all attendance logs"""
        db = ModelFactory.get_db_session()
        try:
            logs = db.query(AttendanceLog).join(Student, AttendanceLog.student_id == Student.id, isouter=True).order_by(AttendanceLog.timestamp.desc()).all()
            result = []
            for log in logs:
                result.append({
                    "id": log.id,
                    "student_name": log.student.name if log.student else "Unknown",
                    "roll_number": log.student.roll_number if log.student else "-",
                    "timestamp": log.timestamp.isoformat(),
                    "status": log.status
                })
            return result
        finally:
            db.close()

# Export all models and factory
__all__ = [
    'ModelFactory',
    'Student',
    'AttendanceLog',
    'Teacher',
    'Room',
    'Subject',
    'ClassGroup',
    'TimetableEntry'
]
