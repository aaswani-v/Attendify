from sqlalchemy import Column, Integer, String, DateTime, LargeBinary, ForeignKey, Float, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from app.core.database import Base

class Student(Base):
    __tablename__ = 'students'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    roll_number: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    
    # Biometric Data (Simulated & Actual)
    photo_folder_path: Mapped[str] = mapped_column(String, nullable=False) # e.g. "ash" -> link to _data-face/ash
    fingerprint_id: Mapped[str] = mapped_column(String, unique=True, nullable=True) # Simulated hash
    id_card_code: Mapped[str] = mapped_column(String, unique=True, nullable=True)   # Simulated card ID
    
    # Relationship
    attendance_logs: Mapped[list["AttendanceLog"]] = relationship("AttendanceLog", back_populates="student")

class AttendanceLog(Base):
    """
    Attendance log entry with enhanced verification tracking.
    Now supports session-based attendance and multi-frame verification.
    """
    __tablename__ = 'attendance_logs'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(Integer, ForeignKey('students.id'), nullable=True)
    
    # Session reference (NEW - links to class session)
    session_id: Mapped[int] = mapped_column(
        Integer, ForeignKey('attendance_sessions.id'), nullable=True
    )
    
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    status: Mapped[str] = mapped_column(String, nullable=False)  # e.g. "Verified", "Proxy Suspected"
    confidence: Mapped[float] = mapped_column(Float, default=0.0)
    
    # Enhanced verification details
    verification_method: Mapped[str] = mapped_column(String, nullable=True)  # e.g. "Face+Fingerprint"
    is_proxy_suspected: Mapped[bool] = mapped_column(Boolean, default=False)
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    
    # Multi-frame verification tracking (NEW)
    frame_count: Mapped[int] = mapped_column(Integer, default=1)  # Frames used for verification
    avg_confidence: Mapped[float] = mapped_column(Float, default=0.0)  # Average across frames
    liveness_passed: Mapped[bool] = mapped_column(Boolean, default=False)  # Anti-spoofing result
    confidence_label: Mapped[str] = mapped_column(String, nullable=True)  # "HIGH"/"MEDIUM"/"LOW"
    
    # Relationships
    student: Mapped["Student"] = relationship("Student", back_populates="attendance_logs")
    session = relationship("AttendanceSession", back_populates="attendance_logs")
