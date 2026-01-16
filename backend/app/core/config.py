"""
Enterprise Configuration Management
Centralized configuration for all backend services
"""

import os
from typing import Dict, Any
from dotenv import load_dotenv

# Load .env file
load_dotenv()

class Config:
    # Database
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///attendance.db")
    DEBUG_MODE = os.getenv("DEBUG_MODE", "false").lower() == "true"
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    
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

    # Geofencing (Default: College Location)
    # Example: Central Park, NY (Lat: 40.785091, Long: -73.968285)
    COLLEGE_LATITUDE = float(os.getenv("COLLEGE_LATITUDE", "40.785091"))
    COLLEGE_LONGITUDE = float(os.getenv("COLLEGE_LONGITUDE", "-73.968285"))
    GEOFENCE_RADIUS_METERS = float(os.getenv("GEOFENCE_RADIUS_METERS", "500.0"))

    # Biometrics
    FINGERPRINT_MATCH_THRESHOLD = 70.0 # Mock threshold implementation
    
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
