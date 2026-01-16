from sqlalchemy import Column, Integer, String, DateTime, LargeBinary, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from app.core.database import Base

class Student(Base):
    __tablename__ = 'students'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    roll_number: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    face_encoding: Mapped[bytes] = mapped_column(LargeBinary, nullable=False)
    fingerprint_template: Mapped[bytes] = mapped_column(LargeBinary, nullable=True) # Binary template data
    
    # Relationship
    attendance_logs: Mapped[list["AttendanceLog"]] = relationship("AttendanceLog", back_populates="student")

class AttendanceLog(Base):
    __tablename__ = 'attendance_logs'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(Integer, ForeignKey('students.id'), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    status: Mapped[str] = mapped_column(String, nullable=False)
    
    # Relationship
    student: Mapped["Student"] = relationship("Student", back_populates="attendance_logs")

class Notice(Base):
    __tablename__ = 'notices'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    content: Mapped[str] = mapped_column(String, nullable=False)
    date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    author: Mapped[str] = mapped_column(String, default="Admin")
