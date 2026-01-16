from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models.attendance import Student, AttendanceLog
from app.services.face_recognition import get_encoding, verify_identity
from app.core.database import get_db

router = APIRouter()

@router.post("/register")
async def register(name: str = Form(...), roll_number: str = Form(...), file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        encoding = get_encoding(file)
        # Check if roll_number already exists
        existing = db.query(Student).filter(Student.roll_number == roll_number).first()
        if existing:
            raise HTTPException(400, "Roll number already exists")
        student = Student(name=name, roll_number=roll_number, face_encoding=encoding)
        db.add(student)
        db.commit()
        return {"message": "Student registered successfully"}
    except ValueError as e:
        raise HTTPException(400, str(e))

@router.post("/mark_attendance")
async def mark_attendance(file: UploadFile = File(...), db: Session = Depends(get_db)):
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
    return {"name": name, "status": status}

@router.get("/logs")
def get_logs(db: Session = Depends(get_db)):
    logs = db.query(AttendanceLog).join(Student, AttendanceLog.student_id == Student.id, isouter=True).all()
    result = []
    for log in logs:
        result.append({
            "id": log.id,
            "student_name": log.student.name if log.student else None,
            "timestamp": log.timestamp.isoformat(),
            "status": log.status
        })
    return result

@router.get("/students")
def get_students(db: Session = Depends(get_db)):
    students = db.query(Student).all()
    return [{
        "id": s.id,
        "name": s.name,
        "roll_number": s.roll_number
    } for s in students]