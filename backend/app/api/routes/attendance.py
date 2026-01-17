from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date, desc, or_
from datetime import timedelta
from pydantic import BaseModel
from typing import Optional, List
from app.core.database import get_db
from app.core.config_thresholds import thresholds
from app.models.attendance import Student, AttendanceLog
from app.models.session import AttendanceSession, SessionStatus
from app.services.face_service import face_service
from app.services.verification_service import verification_service
from app.services.liveness_service import liveness_service
from datetime import datetime
import os
import shutil
from pathlib import Path

router = APIRouter()

# Base path for face images
# backend/app/api/routes -> backend/app -> backend/app/models
DATA_FACE_DIR = Path(__file__).resolve().parent.parent.parent / "models" / "_data-face"


# ========== Pydantic Schemas ==========

class OverrideRequest(BaseModel):
    """Manual attendance override by faculty"""
    student_id: int
    session_id: int | None = None
    reason: str
    override_by: str  # Faculty name/ID


class ManualSubmitItem(BaseModel):
    student_id: int
    status: str  # present | absent
    note: str | None = None


class ManualSubmitRequest(BaseModel):
    entries: list[ManualSubmitItem]
    session_id: int | None = None
    submitted_by: str | None = None


class AttendanceMarkResponse(BaseModel):
    """Response for attendance marking"""
    success: bool
    status: str
    student_name: Optional[str] = None
    confidence: float = 0.0
    confidence_label: str = "UNKNOWN"
    proxy_suspected: bool = False
    proxy_reason: Optional[str] = None
    liveness_passed: bool = False
    log_id: Optional[int] = None
    session_id: Optional[int] = None
    notes: List[str] = []
    face_rect: Optional[List[int]] = None  # [x, y, width, height] for bounding box


# ========== Registration Endpoint ==========

@router.post("/register")
async def register(
    name: str = Form(...), 
    roll_number: str = Form(...), 
    fingerprint_id: str = Form(None),
    id_card_code: str = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Register a new student with face, fingerprint, and ID card.
    Creates a folder in _data-face/{name} and saves the initial image.
    """
    try:
        # Check if student exists
        existing = db.query(Student).filter(
            (Student.roll_number == roll_number) | (Student.name == name)
        ).first()
        if existing:
            raise HTTPException(400, "Student already registered (Roll No or Name exists)")
        
        # Create folder
        clean_name = name.lower().replace(" ", "_")
        folder_path = DATA_FACE_DIR / clean_name
        folder_path.mkdir(parents=True, exist_ok=True)
        
        # Save image
        file_path = folder_path / "1.jpg"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Create DB entry
        new_student = Student(
            name=name,
            roll_number=roll_number,
            photo_folder_path=str(folder_path),
            fingerprint_id=fingerprint_id,
            id_card_code=id_card_code
        )
        db.add(new_student)
        db.commit()
        db.refresh(new_student)
        
        return {
            "message": "Student registered successfully", 
            "student_id": new_student.id,
            "folder": str(folder_path)
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(500, f"Registration failed: {str(e)}")


# ========== Single-Frame Attendance (Legacy) ==========

@router.post("/mark", response_model=AttendanceMarkResponse)
async def mark_attendance(
    file: UploadFile = File(...),
    session_id: Optional[int] = Form(None),
    student_id: str = Form(None),       # Claimed Identity
    fingerprint_data: str = Form(None), # Simulated Fingerprint
    id_card_scan: str = Form(None),     # Simulated Card Code
    db: Session = Depends(get_db)
):
    """
    Mark attendance with single-frame face verification.
    
    Enhanced with:
    - Session validation
    - Duplicate prevention
    - Proxy detection
    - Configurable thresholds
    """
    try:
        # Validate session if provided
        session = None
        if session_id:
            session = db.query(AttendanceSession).filter(
                AttendanceSession.id == session_id
            ).first()
            if not session:
                raise HTTPException(404, "Session not found")
            if not session.is_active:
                raise HTTPException(400, f"Session is not active (status: {session.status})")
        
        # Read image bytes
        frame_bytes = await file.read()
        
        # Face Verification
        verify_result = face_service.verify_student(frame_bytes)
        
        # Initialize response values
        status = "Unknown"
        confidence = verify_result.get("confidence", 0.0)
        recognized_name = verify_result.get("student_name")
        face_rect = verify_result.get("face_rect")  # [x, y, w, h] for bounding box
        proxy_suspected = False
        proxy_reason = None
        verification_method = "Face"
        notes = []
        db_student = None
        
        # Process verification result
        biometric_fallback = False
        
        if verify_result["status"] == "no_face":
            biometric_fallback = True
            status = "Biometric Required"
            notes.append("No face detected - please use fingerprint for verification")
        elif verify_result["status"] == "multiple_faces":
            biometric_fallback = True
            status = "Biometric Required"
            proxy_suspected = True
            proxy_reason = f"Detected {verify_result.get('face_count', 2)} faces - please verify with fingerprint"
            notes.append("Multiple faces detected - fingerprint verification required")
        elif verify_result["status"] == "error":
            biometric_fallback = True
            status = "Biometric Required"
            notes.append(f"Face detection error: {verify_result.get('message', verify_result.get('error', 'Unknown error'))} - please use fingerprint for verification")
        elif recognized_name:
            # Face recognized - find in DB
            db_student = db.query(Student).filter(Student.name == recognized_name).first()
            
            if not db_student:
                biometric_fallback = True
                status = "Biometric Required"
                notes.append(f"Face recognized ({recognized_name}) but not in database - please verify with fingerprint")
            else:
                # Check confidence threshold
                confidence_label = thresholds.get_confidence_label(confidence)
                
                if confidence < thresholds.FACE_CONFIDENCE_REJECT:
                    biometric_fallback = True
                    status = "Biometric Required"
                    notes.append(f"Face confidence {confidence:.1f}% too low - please verify with fingerprint")
                elif confidence < thresholds.FACE_CONFIDENCE_BIOMETRIC_REQUIRED:
                    # Face confidence between 40-60%: Require biometric verification
                    biometric_fallback = True
                    status = "Biometric Required"
                    notes.append(f"Face confidence {confidence:.1f}% < 60% - please verify with fingerprint")
                else:
                    # Face confidence >= 60%: Accept with face only
                    status = "Face Verified"
                    
                    # Multi-factor checks (optional additional verification)
                    if student_id:
                        if str(db_student.roll_number) != str(student_id) and str(db_student.id) != str(student_id):
                            status = "Proxy Suspected: ID Mismatch"
                            proxy_suspected = True
                            proxy_reason = f"Claimed {student_id}, recognized as {recognized_name}"
                    
                    if fingerprint_data:
                        verification_method += "+Fingerprint"
                        if db_student.fingerprint_id != fingerprint_data:
                            status = "Proxy Suspected: Fingerprint Mismatch"
                            proxy_suspected = True
                            proxy_reason = f"Fingerprint mismatch for {recognized_name}"
                    
                    if id_card_scan:
                        verification_method += "+IDCard"
                        if db_student.id_card_code != id_card_scan:
                            status = "Proxy Suspected: ID Card Mismatch"
                            proxy_suspected = True
                            proxy_reason = f"ID card mismatch for {recognized_name}"
                
                # Check duplicate in session
                if session_id and db_student and "Verified" in status:
                    existing = db.query(AttendanceLog).filter(
                        AttendanceLog.student_id == db_student.id,
                        AttendanceLog.session_id == session_id,
                        AttendanceLog.status.contains("Verified")
                    ).first()
                    if existing:
                        return AttendanceMarkResponse(
                            success=False,
                            status="Already Marked",
                            student_name=recognized_name,
                            confidence=confidence,
                            confidence_label=thresholds.get_confidence_label(confidence),
                            notes=[f"Already marked at {existing.timestamp}"],
                            session_id=session_id
                        )
        
        # Handle biometric fallback - fingerprint or ID card authentication
        if biometric_fallback:
            if fingerprint_data:
                # Try to find student by fingerprint
                fingerprint_student = db.query(Student).filter(Student.fingerprint_id == fingerprint_data).first()
                if fingerprint_student:
                    verification_method = "Fingerprint"
                    status = "Biometrically Verified"
                    db_student = fingerprint_student
                    recognized_name = fingerprint_student.name
                    confidence = 100.0  # Fingerprint is considered 100% confident
                    notes.append("Verified by fingerprint only")
                else:
                    status = "Rejected: Fingerprint Not Found"
                    notes.append("Fingerprint not registered in database")
            
            elif id_card_scan:
                # Try to find student by ID card
                card_student = db.query(Student).filter(Student.id_card_code == id_card_scan).first()
                if card_student:
                    verification_method = "ID Card"
                    status = "ID Card Verified"
                    db_student = card_student
                    recognized_name = card_student.name
                    confidence = 100.0
                    notes.append("Verified by ID Card only")
                else:
                    status = "Rejected: ID Card Not Found"
                    notes.append("ID Card not registered in database")
        
        # Handle case where biometric is required but no verification provided
        if biometric_fallback and not fingerprint_data and not id_card_scan:
            return AttendanceMarkResponse(
                success=False,
                status="Biometric Required",
                student_name=recognized_name,
                confidence=confidence,
                confidence_label=thresholds.get_confidence_label(confidence) if confidence > 0 else "UNKNOWN",
                notes=notes,
                session_id=session_id
            )
        
        # Create attendance log
        log = AttendanceLog(
            student_id=db_student.id if db_student else None,
            session_id=session_id,
            status=status,
            confidence=confidence,
            avg_confidence=confidence,
            confidence_label=thresholds.get_confidence_label(confidence),
            is_proxy_suspected=proxy_suspected,
            verification_method=verification_method,
            notes=", ".join(notes) if notes else None,
            frame_count=1
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        
        return AttendanceMarkResponse(
            success="Verified" in status and not proxy_suspected,
            status=status,
            student_name=recognized_name,
            confidence=confidence,
            confidence_label=thresholds.get_confidence_label(confidence),
            proxy_suspected=proxy_suspected,
            proxy_reason=proxy_reason,
            log_id=log.id,
            session_id=session_id,
            notes=notes,
            face_rect=list(face_rect) if face_rect else None
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Mark API: {e}")
        raise HTTPException(500, f"Internal Error: {str(e)}")


# ========== Multi-Frame Attendance (Enhanced) ==========

@router.post("/mark-multi", response_model=AttendanceMarkResponse)
async def mark_attendance_multi(
    files: List[UploadFile] = File(...),
    session_id: Optional[int] = Form(None),
    student_id: str = Form(None),
    check_liveness: bool = Form(False),
    db: Session = Depends(get_db)
):
    """
    Mark attendance with multi-frame temporal verification.
    
    Accepts 3+ frames captured over ~1.5 seconds for:
    - Identity consistency check
    - Higher confidence through averaging
    - Optional liveness (blink) detection
    """
    try:
        # Validate session
        session = None
        if session_id:
            session = db.query(AttendanceSession).filter(
                AttendanceSession.id == session_id
            ).first()
            if not session:
                raise HTTPException(404, "Session not found")
            if not session.is_active:
                raise HTTPException(400, "Session is not active")
            
            # Override check_liveness with session setting
            if session.require_liveness:
                check_liveness = True
        
        # Read all frames
        frames = []
        for f in files:
            frame_bytes = await f.read()
            frames.append(frame_bytes)
        
        if len(frames) < thresholds.REQUIRED_CONSISTENT_FRAMES:
            return AttendanceMarkResponse(
                success=False,
                status=f"Need {thresholds.REQUIRED_CONSISTENT_FRAMES}+ frames",
                notes=[f"Received {len(frames)} frames"]
            )
        
        # Run multi-frame verification
        result = verification_service.verify_multi_frame(
            frames=frames,
            session_id=session_id,
            claimed_student_id=student_id,
            db=db
        )
        
        # Liveness check if enabled
        liveness_passed = False
        if check_liveness and result.success:
            liveness_result = liveness_service.check_liveness(frames)
            liveness_passed = liveness_result.passed
            
            if not liveness_passed:
                result.success = False
                result.status = "Liveness Failed"
                result.notes.append(liveness_result.message)
        
        # Find student for DB record
        db_student = None
        if result.student_name:
            db_student = db.query(Student).filter(
                Student.name == result.student_name
            ).first()
        
        # Create attendance log
        log = AttendanceLog(
            student_id=db_student.id if db_student else None,
            session_id=session_id,
            status=result.status,
            confidence=result.avg_confidence,
            avg_confidence=result.avg_confidence,
            confidence_label=result.confidence_label,
            is_proxy_suspected=result.is_proxy_suspected,
            verification_method="Face+MultiFrame",
            notes=", ".join(result.notes) if result.notes else None,
            frame_count=result.frame_count,
            liveness_passed=liveness_passed
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        
        return AttendanceMarkResponse(
            success=result.success,
            status=result.status,
            student_name=result.student_name,
            confidence=result.avg_confidence,
            confidence_label=result.confidence_label,
            proxy_suspected=result.is_proxy_suspected,
            proxy_reason=result.proxy_reason,
            liveness_passed=liveness_passed,
            log_id=log.id,
            session_id=session_id,
            notes=result.notes
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Mark-Multi API: {e}")
        raise HTTPException(500, f"Internal Error: {str(e)}")


# ========== Manual Override (Faculty) ==========

@router.post("/override")
async def manual_override(
    data: OverrideRequest,
    db: Session = Depends(get_db)
):
    """
    Manual attendance override by faculty.
    
    Used when:
    - Face recognition fails repeatedly
    - Student has changed appearance
    - Technical issues prevent normal marking
    
    Creates an audit trail with override reason and faculty ID.
    """
    # Validate student
    student = db.query(Student).filter(Student.id == data.student_id).first()
    if not student:
        raise HTTPException(404, "Student not found")
    
    session = None
    if data.session_id:
        session = db.query(AttendanceSession).filter(
            AttendanceSession.id == data.session_id
        ).first()
        if not session:
            raise HTTPException(404, "Session not found")
    
    # Check for existing attendance
    existing = db.query(AttendanceLog).filter(
        AttendanceLog.student_id == data.student_id,
        AttendanceLog.session_id == data.session_id,
        AttendanceLog.status.contains("Verified")
    ).first()
    
    if existing:
        return {
            "message": "Attendance already marked",
            "existing_log_id": existing.id,
            "timestamp": existing.timestamp
        }
    
    # Create manual override log
    log = AttendanceLog(
        student_id=data.student_id,
        session_id=data.session_id,
        status="Verified (Manual Override)",
        confidence=100.0,  # Manual = 100% by definition
        avg_confidence=100.0,
        confidence_label="MANUAL",
        is_proxy_suspected=False,
        verification_method="Manual Override",
        notes=f"Override by {data.override_by}: {data.reason}",
        frame_count=0,
        liveness_passed=False
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    
    return {
        "message": "Manual override successful",
        "log_id": log.id,
        "student_name": student.name,
        "override_by": data.override_by
    }


@router.post("/manual/submit")
async def manual_bulk_submit(
    payload: ManualSubmitRequest,
    db: Session = Depends(get_db)
):
    """Bulk manual attendance submission (present/absent) with audit."""

    if not payload.entries:
        raise HTTPException(400, "No entries provided")

    session = None
    if payload.session_id:
        session = db.query(AttendanceSession).filter(AttendanceSession.id == payload.session_id).first()
        if not session:
            raise HTTPException(404, "Session not found")

    created = 0
    updated = 0

    for entry in payload.entries:
        student = db.query(Student).filter(Student.id == entry.student_id).first()
        if not student:
            continue  # skip invalid

        status_label = "Present (Manual)" if entry.status.lower() == "present" else "Absent (Manual)"

        existing = db.query(AttendanceLog).filter(
            AttendanceLog.student_id == entry.student_id,
            AttendanceLog.session_id == payload.session_id,
        ).first()

        if existing:
            existing.status = status_label
            existing.timestamp = datetime.utcnow()
            existing.notes = entry.note or existing.notes
            existing.verification_method = "Manual Entry"
            updated += 1
        else:
            log = AttendanceLog(
                student_id=entry.student_id,
                session_id=payload.session_id,
                status=status_label,
                confidence=100.0,
                avg_confidence=100.0,
                confidence_label="MANUAL",
                is_proxy_suspected=False,
                verification_method="Manual Entry",
                notes=entry.note or f"Manual submit by {payload.submitted_by or 'manual UI'}",
                frame_count=0,
                liveness_passed=False,
            )
            db.add(log)
            created += 1

    db.commit()

    return {
        "message": "Manual attendance submitted",
        "created": created,
        "updated": updated,
        "session_id": payload.session_id,
    }


# ========== Utility Endpoints ==========

@router.get("/logs")
def get_logs(
    session_id: Optional[int] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get attendance logs, optionally filtered by session."""
    query = db.query(AttendanceLog)
    
    if session_id:
        query = query.filter(AttendanceLog.session_id == session_id)
    
    logs = query.order_by(AttendanceLog.timestamp.desc()).limit(limit).all()
    
    # Enrich with student names
    results = []
    for log in logs:
        student_name = None
        if log.student_id:
            student = db.query(Student).filter(Student.id == log.student_id).first()
            student_name = student.name if student else None
        
        results.append({
            "id": log.id,
            "student_id": log.student_id,
            "student_name": student_name,
            "session_id": log.session_id,
            "timestamp": log.timestamp.isoformat(),
            "status": log.status,
            "confidence": log.confidence,
            "confidence_label": log.confidence_label,
            "is_proxy_suspected": log.is_proxy_suspected,
            "verification_method": log.verification_method,
            "frame_count": log.frame_count,
            "liveness_passed": log.liveness_passed
        })
    
    return results


@router.get("/students")
def get_students(db: Session = Depends(get_db)):
    """Get all registered students."""
    return db.query(Student).all()


@router.get("/stats")
def get_attendance_stats(db: Session = Depends(get_db)):
    """
    Get attendance statistics for dashboard.
    Returns total students, present today, absent today, and attendance rate.
    """
    from datetime import date, timedelta
    from sqlalchemy import func
    
    total_students = db.query(func.count(Student.id)).scalar()
    
    # Get today's logs (verified students)
    today_start = datetime.combine(date.today(), datetime.min.time())
    today_end = datetime.combine(date.today(), datetime.max.time())
    
    present_today = db.query(func.count(AttendanceLog.id.distinct())).filter(
        AttendanceLog.timestamp >= today_start,
        AttendanceLog.timestamp <= today_end,
        AttendanceLog.status.contains("Verified")
    ).scalar()
    
    absent_today = total_students - present_today if total_students > 0 else 0
    attendance_rate = (present_today / total_students * 100) if total_students > 0 else 0
    
    # Weekly trend (last 7 days)
    weekly_data = []
    for i in range(7):
        day = date.today() - timedelta(days=6 - i)
        day_start = datetime.combine(day, datetime.min.time())
        day_end = datetime.combine(day, datetime.max.time())
        
        day_present = db.query(func.count(AttendanceLog.id.distinct())).filter(
            AttendanceLog.timestamp >= day_start,
            AttendanceLog.timestamp <= day_end,
            AttendanceLog.status.contains("Verified")
        ).scalar()
        
        day_absent = total_students - day_present if total_students > 0 else 0
        
        weekly_data.append({
            "day": day.strftime("%a"),  # Mon, Tue, etc.
            "present": day_present,
            "absent": day_absent
        })
    
    return {
        "total_students": total_students,
        "present_today": present_today,
        "absent_today": absent_today,
        "attendance_rate": round(attendance_rate, 1),
        "weekly_data": weekly_data
    }


@router.get("/thresholds")
def get_thresholds():
    """
    Get current verification thresholds.
    Useful for transparency and debugging.
    """
    return thresholds.to_dict()
