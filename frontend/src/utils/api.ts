/**
 * API Configuration and Utilities
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Attendance
  REGISTER_STUDENT: `${API_BASE_URL}/api/attendance/register`,
  MARK_ATTENDANCE: `${API_BASE_URL}/api/attendance/mark`,
  MARK_ATTENDANCE_MULTI: `${API_BASE_URL}/api/attendance/mark-multi`,
  MANUAL_OVERRIDE: `${API_BASE_URL}/api/attendance/override`,
  GET_ATTENDANCE_LOGS: `${API_BASE_URL}/api/attendance/logs`,
  GET_STUDENTS: `${API_BASE_URL}/api/attendance/students`,
  GET_THRESHOLDS: `${API_BASE_URL}/api/attendance/thresholds`,
  
  // Sessions (NEW)
  START_SESSION: `${API_BASE_URL}/api/sessions/start`,
  END_SESSION: (id: number) => `${API_BASE_URL}/api/sessions/${id}/end`,
  GET_SESSIONS: `${API_BASE_URL}/api/sessions`,
  GET_ACTIVE_SESSIONS: `${API_BASE_URL}/api/sessions/active`,
  GET_SESSION_SUMMARY: (id: number) => `${API_BASE_URL}/api/sessions/${id}/summary`,
  
  // Timetable
  GENERATE_TIMETABLE: `${API_BASE_URL}/api/timetable/generate`,
  GET_SCHEDULE: `${API_BASE_URL}/api/timetable/schedule`,
  CLEAR_SCHEDULE: `${API_BASE_URL}/api/timetable/schedule`,
  
  // Resources
  GET_TEACHERS: `${API_BASE_URL}/api/timetable/teachers`,
  CREATE_TEACHER: `${API_BASE_URL}/api/timetable/teachers`,
  DELETE_TEACHER: (id: number) => `${API_BASE_URL}/api/timetable/teachers/${id}`,
  
  GET_ROOMS: `${API_BASE_URL}/api/timetable/rooms`,
  CREATE_ROOM: `${API_BASE_URL}/api/timetable/rooms`,
  DELETE_ROOM: (id: number) => `${API_BASE_URL}/api/timetable/rooms/${id}`,
  
  GET_SUBJECTS: `${API_BASE_URL}/api/timetable/subjects`,
  CREATE_SUBJECT: `${API_BASE_URL}/api/timetable/subjects`,
  DELETE_SUBJECT: (id: number) => `${API_BASE_URL}/api/timetable/subjects/${id}`,
  
  GET_CLASS_GROUPS: `${API_BASE_URL}/api/timetable/class-groups`,
  CREATE_CLASS_GROUP: `${API_BASE_URL}/api/timetable/class-groups`,
  DELETE_CLASS_GROUP: (id: number) => `${API_BASE_URL}/api/timetable/class-groups/${id}`,
  
  GET_RESOURCES: `${API_BASE_URL}/api/timetable/resources`,
  
  // System
  SEED_DATABASE: `${API_BASE_URL}/api/seed`,
  GET_CONFIG: `${API_BASE_URL}/api/config`,
};

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
export const PERIODS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

export const formatTime = (period: number): string => {
  return PERIODS[period] || '';
};

export const formatDay = (day: number): string => {
  return DAYS[day] || '';
};
