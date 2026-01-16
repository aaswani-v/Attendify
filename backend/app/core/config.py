"""
Enterprise Configuration Management
Centralized configuration for all backend services
"""

import os
from typing import Dict, Any

class Config:
    # Database
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///attendance.db")
    DEBUG_MODE = os.getenv("DEBUG_MODE", "false").lower() == "true"
    
    # CORS Settings
    CORS_ORIGINS = ["*"]  # Admin mode - no restrictions
    
    # Timetable Generation
    DAYS_PER_WEEK = 5
    PERIODS_PER_DAY = 8
    PERIOD_DURATION = 60  # minutes
    START_TIME = "09:00"
    
    # Solver Configuration
    SOLVER_TIME_LIMIT = 120  # seconds
    
    # File Upload
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}
    
    @classmethod
    def get_config(cls) -> Dict[str, Any]:
        return {
            "database_url": cls.DATABASE_URL,
            "cors_origins": cls.CORS_ORIGINS,
            "timetable": {
                "days": cls.DAYS_PER_WEEK,
                "periods": cls.PERIODS_PER_DAY,
                "start_time": cls.START_TIME
            }
        }

config = Config()
