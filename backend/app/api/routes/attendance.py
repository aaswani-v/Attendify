from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.models import ModelFactory
from app.core.database import get_db

router = APIRouter()

@router.post("/register")
async def register(
    name: str = Form(...), 
    roll_number: str = Form(...), 
    file: UploadFile = File(...),
    fingerprint: UploadFile = File(None), # Optional fingerprint upload
    db: Session = Depends(get_db)
):
    result = ModelFactory.register_student(db, name, roll_number, file, fingerprint)
    if not result["success"]:
        raise HTTPException(400, result["message"])
    return {"message": result["message"], "student_id": result.get("student_id")}

@router.post("/mark")
async def mark_attendance(
    file: UploadFile = File(None),
    fingerprint: UploadFile = File(None),
    latitude: float = Form(0.0),
    longitude: float = Form(0.0),
    db: Session = Depends(get_db)
):
    # Ensure at least one biometric is provided
    if not file and not fingerprint:
        raise HTTPException(400, "Either face image or fingerprint must be provided")

    result = ModelFactory.mark_attendance(db, file, fingerprint, latitude, longitude)
    return result

@router.get("/logs")
def get_logs(db: Session = Depends(get_db)):
    return ModelFactory.get_attendance_logs(db)

@router.get("/students")
def get_students(db: Session = Depends(get_db)):
    return ModelFactory.get_students(db)
