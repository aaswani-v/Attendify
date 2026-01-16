from sqlalchemy import create_engine, Column, Integer, String, DateTime, LargeBinary, ForeignKey
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker, relationship
from datetime import datetime

class Base(DeclarativeBase):
    pass

class Student(Base):
    __tablename__ = 'students'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    roll_number: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    face_encoding: Mapped[bytes] = mapped_column(LargeBinary, nullable=False)
    
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

# Database setup
engine = create_engine('sqlite:///attendance.db')
Base.metadata.create_all(engine)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)