"""
Entry point for the Attendify backend application.
"""

<<<<<<< HEAD
from app.main import app
=======
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal, Base, engine
from models.attendance import Student, AttendanceLog
from models.timetable import Teacher, Room, Subject, ClassGroup, TimetableEntry, teacher_subject
from services import get_encoding, verify_identity
from timetable_routes import router as timetable_router
from config import config
import uvicorn

# Initialize database
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="Attendify - Enterprise Student Management System",
    description="Unified platform for Attendance Verification & Timetable Generation",
    version="2.0.0"
)

# CORS Configuration (Admin Mode - No restrictions)
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include timetable routes
app.include_router(timetable_router)

# ==================== ATTENDANCE ENDPOINTS ====================

@app.post("/api/attendance/register")
async def register_student(name: str = Form(...), roll_number: str = Form(...), file: UploadFile = File(...)):
    """Register a new student with face encoding"""
    db = SessionLocal()
    try:
        encoding = get_encoding(file)
        existing = db.query(Student).filter(Student.roll_number == roll_number).first()
        if existing:
            raise HTTPException(400, "Roll number already exists")
        student = Student(name=name, roll_number=roll_number, face_encoding=encoding)
        db.add(student)
        db.commit()
        return {"message": "Student registered successfully", "student_id": student.id}
    except ValueError as e:
        raise HTTPException(400, str(e))
    finally:
        db.close()

@app.post("/api/attendance/mark")
async def mark_attendance(file: UploadFile = File(...)):
    """Mark attendance by verifying face"""
    db = SessionLocal()
    try:
        student = verify_identity(file, db)
        if student:
            log = AttendanceLog(student_id=student.id, status="Present")
            name = student.name
            status = "Present"
        else:
            log = AttendanceLog(status="Unknown")
            name = "Unknown"
            status = "Unknown"
        db.add(log)
        db.commit()
        return {"name": name, "status": status, "message": f"Attendance marked: {status}"}
    finally:
        db.close()

@app.get("/api/attendance/logs")
def get_attendance_logs():
    """Get all attendance logs"""
    db = SessionLocal()
    try:
        logs = db.query(AttendanceLog).join(Student, AttendanceLog.student_id == Student.id, isouter=True).all()
        result = []
        for log in logs:
            result.append({
                "id": log.id,
                "student_name": log.student.name if log.student else None,
                "roll_number": log.student.roll_number if log.student else None,
                "timestamp": log.timestamp.isoformat(),
                "status": log.status
            })
        return result
    finally:
        db.close()

@app.get("/api/attendance/students")
def get_students():
    """Get all registered students"""
    db = SessionLocal()
    try:
        students = db.query(Student).all()
        return [{
            "id": s.id,
            "name": s.name,
            "roll_number": s.roll_number
        } for s in students]
    finally:
        db.close()

# ==================== SEEDING & UTILITIES ====================

@app.post("/api/seed")
def seed_database():
    """Seed database with sample data for testing"""
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(Teacher).count() > 0:
            return {"message": "Database already seeded"}
        
        # Create Teachers
        teachers = [
            Teacher(name="Dr. John Smith", email="john@university.edu", max_hours_per_day=6),
            Teacher(name="Prof. Emily Davis", email="emily@university.edu", max_hours_per_day=5),
            Teacher(name="Dr. Michael Brown", email="michael@university.edu", max_hours_per_day=6),
            Teacher(name="Prof. Sarah Wilson", email="sarah@university.edu", max_hours_per_day=6),
            Teacher(name="Dr. Robert Taylor", email="robert@university.edu", max_hours_per_day=5),
        ]
        db.add_all(teachers)
        db.commit()
        
        # Create Rooms
        rooms = [
            Room(room_number="101", capacity=60, is_lab=False, room_type="Classroom"),
            Room(room_number="102", capacity=60, is_lab=False, room_type="Classroom"),
            Room(room_number="201", capacity=40, is_lab=True, room_type="Computer Lab"),
            Room(room_number="202", capacity=40, is_lab=True, room_type="Computer Lab"),
            Room(room_number="301", capacity=50, is_lab=False, room_type="Classroom"),
        ]
        db.add_all(rooms)
        db.commit()
        
        # Create Subjects
        subjects = [
            Subject(name="Data Structures", code="CS201", weekly_sessions=4, requires_lab=True),
            Subject(name="Database Management", code="CS202", weekly_sessions=3, requires_lab=True),
            Subject(name="Operating Systems", code="CS301", weekly_sessions=4, requires_lab=False),
            Subject(name="Computer Networks", code="CS302", weekly_sessions=3, requires_lab=True),
            Subject(name="Software Engineering", code="CS401", weekly_sessions=3, requires_lab=False),
        ]
        db.add_all(subjects)
        db.commit()
        
        # Assign teachers to subjects
        subjects[0].teachers.extend([teachers[0], teachers[1]])
        subjects[1].teachers.extend([teachers[1], teachers[2]])
        subjects[2].teachers.extend([teachers[2], teachers[3]])
        subjects[3].teachers.extend([teachers[3], teachers[4]])
        subjects[4].teachers.extend([teachers[0], teachers[4]])
        db.commit()
        
        # Create Class Groups
        class_groups = [
            ClassGroup(name="CSE-A", semester=4, strength=60),
            ClassGroup(name="CSE-B", semester=4, strength=60),
        ]
        db.add_all(class_groups)
        db.commit()
        
        return {
            "message": "Database seeded successfully",
            "summary": {
                "teachers": len(teachers),
                "rooms": len(rooms),
                "subjects": len(subjects),
                "class_groups": len(class_groups)
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(500, f"Seeding failed: {str(e)}")
    finally:
        db.close()

@app.get("/")
def root():
    """API Health Check"""
    return {
        "service": "Attendify Enterprise System",
        "version": "2.0.0",
        "status": "operational",
        "features": ["Face Recognition Attendance", "AI-Powered Timetable Generation"],
        "endpoints": {
            "attendance": "/api/attendance/*",
            "timetable": "/api/timetable/*",
            "docs": "/docs"
        }
    }

@app.get("/api/config")
def get_config():
    """Get system configuration"""
    return config.get_config()
>>>>>>> f873dcb4c3c138d525538d150ccce98cb30cf32f

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)