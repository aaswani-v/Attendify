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
    db: Session = Depends(get_db)
):
    result = ModelFactory.register_student(db, name, roll_number, file)
    if not result["success"]:
        raise HTTPException(400, result["message"])
    return {"message": result["message"], "student_id": result.get("student_id")}

@router.post("/mark")
async def mark_attendance(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    result = ModelFactory.mark_attendance(db, file)
    return result

@router.get("/logs")
def get_logs(db: Session = Depends(get_db)):
    return ModelFactory.get_attendance_logs(db)

@router.get("/students")
def get_students(db: Session = Depends(get_db)):
    return ModelFactory.get_students(db)
