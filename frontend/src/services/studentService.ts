/**
 * Student Service
 * Handles student registration and retrieval
 */

import { apiClient } from '../utils/api';
import { Student, ApiResponse } from '../types';

export const studentService = {
    /**
     * Register a new student with face image
     */
    async register(name: string, rollNumber: string, faceImage: Blob): Promise<ApiResponse<{ student_id: number; message: string }>> {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('roll_number', rollNumber);
        formData.append('file', faceImage, 'face.jpg');

        const response = await apiClient.post<ApiResponse<{ student_id: number; message: string }>>(
            '/api/attendance/register',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    },

    /**
     * Get all registered students
     */
    async getAll(): Promise<Student[]> {
        const response = await apiClient.get<Student[]>('/api/attendance/students');
        return response.data;
    },
};
