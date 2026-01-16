"""
Main FastAPI Application Entry Point
Enterprise-grade unified system: Attendance + Timetable Generation
"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.models.attendance import Student, AttendanceLog, Base, engine
from app.models.timetable import Teacher, Room, Subject, ClassGroup, TimetableEntry, teacher_subject
from app.services.face_recognition import get_encoding, verify_identity
from app.api.routes.timetable import router as timetable_router
from app.api.routes.attendance import router as attendance_router
from app.core.config import config
from app.core.database import create_tables
from app.core.logging import logger
import uvicorn

# Initialize database
logger.info("Initializing database...")
create_tables()
logger.info("Database initialized successfully")

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

# Include routers
app.include_router(timetable_router)
app.include_router(attendance_router, prefix="/api/attendance")

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

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
