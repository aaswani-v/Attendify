from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.core.models import ModelFactory

router = APIRouter()

@router.post("/register")
async def register(name: str = Form(...), roll_number: str = Form(...), file: UploadFile = File(...)):
    result = ModelFactory.register_student(name, roll_number, file)
    if not result["success"]:
        raise HTTPException(400, result["message"])
    return {"message": result["message"], "student_id": result["student_id"]}

@router.post("/mark_attendance")
async def mark_attendance(file: UploadFile = File(...)):
    result = ModelFactory.mark_attendance(file)
    return result

@router.get("/logs")
def get_logs():
    return ModelFactory.get_attendance_logs()

@router.get("/students")
def get_students():
    return ModelFactory.get_students()
