/**
 * Attendance Types
 */

export interface Student {
  id: string;
  name: string;
  email: string;
  student_id: string;
  department: string;
  face_encoding?: string;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  course_id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  marked_by?: string;
  marked_at: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  recognition_confidence?: number;
}

export interface MarkAttendanceRequest {
  student_id: string;
  course_id: string;
  status: 'present' | 'absent' | 'late';
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface FaceAttendanceRequest {
  course_id: string;
  image: string; // base64
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface FaceAttendanceResponse {
  success: boolean;
  student?: Student;
  attendance?: AttendanceRecord;
  confidence?: number;
  message: string;
}
