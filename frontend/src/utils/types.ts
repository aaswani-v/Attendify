/**
 * TypeScript Type Definitions for the Application
 */

// Attendance Types
export interface Student {
  id: number;
  name: string;
  roll_number: string;
}

export interface AttendanceLog {
  id: number;
  student_name: string | null;
  roll_number: string | null;
  timestamp: string;
  status: string;
}

// Timetable Types
export interface Teacher {
  id: number;
  name: string;
  email: string | null;
  max_hours_per_day: number;
  subjects?: Subject[];
}

export interface Room {
  id: number;
  room_number: string;
  capacity: number;
  is_lab: boolean;
  room_type: string;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  weekly_sessions: number;
  requires_lab: boolean;
  teachers?: Teacher[];
}

export interface ClassGroup {
  id: number;
  name: string;
  semester: number;
  strength: number;
}

export interface TimetableEntry {
  id: number;
  day: number;
  period: number;
  teacher_id: number;
  teacher_name: string;
  room_id: number;
  room_number: string;
  subject_id: number;
  subject_name: string;
  subject_code: string;
  class_group_id: number;
  class_group_name: string;
}

export interface GenerateResponse {
  status: string;
  message: string;
  schedule: TimetableEntry[];
  stats?: {
    solve_time: number;
    conflicts: number;
    branches: number;
  };
}

// Form Types
export interface TeacherFormData {
  name: string;
  email?: string;
  max_hours_per_day: number;
  subject_ids: number[];
}

export interface RoomFormData {
  room_number: string;
  capacity: number;
  is_lab: boolean;
  room_type: string;
}

export interface SubjectFormData {
  name: string;
  code: string;
  weekly_sessions: number;
  requires_lab: boolean;
  teacher_ids: number[];
}

export interface ClassGroupFormData {
  name: string;
  semester: number;
  strength: number;
}
