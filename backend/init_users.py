"""
Initialize test users for authentication testing
"""

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.user import User, UserRole, Base
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def init_users():
    """Create test users for authentication"""
    # Create users table
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if users already exist
        if db.query(User).count() > 0:
            print("Users already exist, skipping initialization")
            return
        
        # Create test users
        test_users = [
            User(
                username="admin",
                email="admin@attendify.com",
                full_name="System Administrator",
                hashed_password=pwd_context.hash("admin123"),
                role=UserRole.ADMIN,
                is_active=True
            ),
            User(
                username="faculty1",
                email="faculty1@attendify.com",
                full_name="Dr. John Smith",
                hashed_password=pwd_context.hash("faculty123"),
                role=UserRole.FACULTY,
                is_active=True
            ),
            User(
                username="student1",
                email="student1@attendify.com",
                full_name="Alice Johnson",
                hashed_password=pwd_context.hash("student123"),
                role=UserRole.STUDENT,
                is_active=True
            ),
            User(
                username="student2",
                email="student2@attendify.com",
                full_name="Bob Williams",
                hashed_password=pwd_context.hash("student123"),
                role=UserRole.STUDENT,
                is_active=True
            ),
        ]
        
        db.add_all(test_users)
        db.commit()
        
        print("✅ Test users created successfully:")
        print("   Admin: admin / admin123")
        print("   Faculty: faculty1 / faculty123")
        print("   Student: student1 / student123")
        print("   Student: student2 / student123")
        
    except Exception as e:
        print(f"❌ Error creating users: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_users()
