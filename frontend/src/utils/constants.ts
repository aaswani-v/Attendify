/**
 * Application Constants
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

export const TOKEN_KEY = 'auth_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const USER_KEY = 'user_data';

export const API_TIMEOUT = 30000; // 30 seconds

export const ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
  },
  STUDENTS: {
    LIST: '/students',
    CREATE: '/students',
    GET: (id: string) => `/students/${id}`,
    UPDATE: (id: string) => `/students/${id}`,
    DELETE: (id: string) => `/students/${id}`,
  },
  ATTENDANCE: {
    MARK: '/attendance/mark',
    FACE: '/attendance/face',
    STUDENT: (id: string) => `/attendance/student/${id}`,
    COURSE: (id: string) => `/attendance/course/${id}`,
  },
  NOTICES: {
    LIST: '/notices',
    CREATE: '/notices',
    DELETE: (id: string) => `/notices/${id}`,
  },
  COURSES: {
    LIST: '/courses',
    CREATE: '/courses',
    GET: (id: string) => `/courses/${id}`,
    UPDATE: (id: string) => `/courses/${id}`,
    DELETE: (id: string) => `/courses/${id}`,
  },
  TIMETABLE: {
    GET: (id: string) => `/timetable/${id}`,
    GENERATE: '/timetable/generate',
  },
} as const;

// Legacy API_ENDPOINTS for backward compatibility
export const API_ENDPOINTS = {
  REGISTER_STUDENT: `${API_BASE_URL}/api/attendance/register`,
  MARK_ATTENDANCE: `${API_BASE_URL}/api/attendance/mark`,
  GET_STUDENTS: `${API_BASE_URL}/api/attendance/students`,
  GET_LOGS: `${API_BASE_URL}/api/attendance/logs`,
  
  // Timetable
  GET_SCHEDULE: `${API_BASE_URL}/api/timetable/schedule`,
  GENERATE_TIMETABLE: `${API_BASE_URL}/api/timetable/generate`,
  CLEAR_SCHEDULE: `${API_BASE_URL}/api/timetable/clear`,
  
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
} as const;
