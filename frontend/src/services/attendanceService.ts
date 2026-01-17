/**
 * Attendance Service
 * Handles attendance marking and logs
 */

import { apiClient } from '../utils/api';
import type { AttendanceLogEntry, FaceAttendanceResponse } from '../types';

export const attendanceService = {
    /**
     * Mark attendance using face recognition
     */
    async markWithFace(faceImage: Blob, latitude?: number, longitude?: number): Promise<FaceAttendanceResponse> {
        const formData = new FormData();
        formData.append('file', faceImage, 'face.jpg');
        if (latitude !== undefined) formData.append('latitude', latitude.toString());
        if (longitude !== undefined) formData.append('longitude', longitude.toString());

        const response = await apiClient.post<FaceAttendanceResponse>(
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
     * Mark attendance using face recognition with fingerprint verification (and optional ID card)
     */
    async markWithFaceAndFingerprint(faceImage: Blob, fingerprintData: string, idCardScan?: string, latitude?: number, longitude?: number): Promise<FaceAttendanceResponse> {
        const formData = new FormData();
        formData.append('file', faceImage, 'face.jpg');
        formData.append('fingerprint_data', fingerprintData);
        if (idCardScan) formData.append('id_card_scan', idCardScan);
        if (latitude !== undefined) formData.append('latitude', latitude.toString());
        if (longitude !== undefined) formData.append('longitude', longitude.toString());

        const response = await apiClient.post<FaceAttendanceResponse>(
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
    async getLogs(): Promise<AttendanceLogEntry[]> {
        const response = await apiClient.get<AttendanceLogEntry[]>('/api/attendance/logs');
        return response.data;
    },
};
