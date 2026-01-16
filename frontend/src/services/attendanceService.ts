/**
 * Attendance Service
 * Handles attendance marking and logs
 */

import { apiClient } from '../utils/api';
import { AttendanceRecord, ApiResponse } from '../types';

export const attendanceService = {
    /**
     * Mark attendance using face recognition
     */
    async markWithFace(faceImage: Blob, latitude?: number, longitude?: number): Promise<ApiResponse<AttendanceRecord>> {
        const formData = new FormData();
        formData.append('file', faceImage, 'face.jpg');
        if (latitude !== undefined) formData.append('latitude', latitude.toString());
        if (longitude !== undefined) formData.append('longitude', longitude.toString());

        const response = await apiClient.post<ApiResponse<AttendanceRecord>>(
            '/api/attendance/mark',
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
     * Get all attendance logs
     */
    async getLogs(): Promise<AttendanceRecord[]> {
        const response = await apiClient.get<AttendanceRecord[]>('/api/attendance/logs');
        return response.data;
    },
};
