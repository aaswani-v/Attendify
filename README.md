#created by neetu
# Attendify - Enterprise Student Management System

Complete unified platform for **Face Recognition Attendance** and **AI-Powered Timetable Generation**.

## 🚀 Features

### 📸 Attendance System
- Face recognition-based student verification
- Real-time attendance marking
- Automated attendance logging
- Student registration with biometric data

### 🗓️ Timetable Generator
- Constraint-based scheduling using Google OR-Tools
- Automated conflict resolution
- Teacher, room, and subject management
- Multi-class support with optimal slot allocation

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database management
- **face_recognition** - Biometric verification
- **Google OR-Tools** - Constraint programming solver
- **SQLite** - Lightweight database

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Styled Components** - CSS-in-JS styling
- **React Webcam** - Camera integration

## 📦 Installation

### Backend Setup

```bash
cd backend
pip install -r ../requirements.txt
python main.py
```

Server runs on `http://localhost:8000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## 🎯 Quick Start

1. **Start Backend**: Navigate to project root and run `python backend/main.py`
2. **Start Frontend**: In a new terminal, navigate to `frontend` and run `npm run dev`
3. **Seed Database**: Open the app, go to Dashboard, and click "Seed Database"
4. **Generate Timetable**: Navigate to Timetable View and click the + button
5. **Mark Attendance**: Go to Attendance Kiosk and register/mark attendance

## 📡 API Endpoints

### Attendance
- `POST /api/attendance/register` - Register student with face
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance/logs` - Get attendance records

### Timetable
- `POST /api/timetable/generate` - Generate timetable
- `GET /api/timetable/schedule` - Get current schedule
- `GET /api/timetable/teachers` - List teachers
- `GET /api/timetable/rooms` - List rooms
- `GET /api/timetable/subjects` - List subjects
- `GET /api/timetable/class-groups` - List classes

## 🏗️ Project Structure

```
attendify/
├── backend/
│   ├── main.py                    # FastAPI application entry
│   ├── models.py                  # Student & Attendance models
│   ├── timetable_models.py        # Timetable database models
│   ├── services.py                # Face recognition logic
│   ├── solver.py                  # OR-Tools constraint solver
│   ├── timetable_routes.py        # Timetable API endpoints
│   ├── schemas.py                 # Pydantic validation schemas
│   └── config.py                  # Configuration management
├── frontend/
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   ├── pages/                 # Main application pages
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── styles/                # Glassmorphism design system
│   │   ├── utils/                 # API & type definitions
│   │   ├── App.tsx                # Main application component
│   │   └── main.tsx               # React entry point
│   ├── package.json
│   └── vite.config.ts
└── requirements.txt               # Python dependencies
```

## 🎨 UI Components

- **Dashboard**: System overview and statistics
- **Timetable View**: Grid-based schedule visualization
- **Resource Management**: CRUD for teachers, rooms, subjects, classes
- **Attendance Kiosk**: Face capture and verification
- **Attendance Logs**: Historical attendance records

## 🧠 Solver Constraints

### Hard Constraints
1. Teacher cannot teach 2 classes simultaneously
2. Room cannot host 2 classes simultaneously
3. Lab subjects must use lab rooms
4. Subject-teacher compatibility
5. Weekly session requirements

### Optimization
- Minimize gaps in student schedules
- Distribute teacher load evenly

## 📝 License

MIT License - Open source and free to use

## 👥 Contributors

Built for HC-301 & HC-304 hackathon challenges

---

**Attendify** - Making attendance and scheduling effortless 🚀
