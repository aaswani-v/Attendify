from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models.attendance import Student, AttendanceLog
from services import get_encoding, verify_identity

app = FastAPI()

@app.post("/register")
async def register(name: str = Form(...), roll_number: str = Form(...), file: UploadFile = File(...)):
    db = SessionLocal()
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
    finally:
        db.close()

@app.post("/mark_attendance")
async def mark_attendance(file: UploadFile = File(...)):
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
        return {"name": name, "status": status}
    finally:
        db.close()

@app.get("/logs")
def get_logs():
    db = SessionLocal()
    try:
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
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)