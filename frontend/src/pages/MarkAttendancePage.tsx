import { useState, useRef, useEffect } from 'react';
import { attendanceService } from '../services/attendanceService';
import { studentService } from '../services/studentService';
import type { Student } from '../types';
import './MarkAttendancePage.css';

// Manual student type for UI state management
interface ManualStudent extends Student {
    status?: 'present' | 'absent' | 'not-marked';
}

const MarkAttendancePage = () => {
    const [mode, setMode] = useState<'camera' | 'manual'>('camera');
    const [cameraError, setCameraError] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [detectedStudents, setDetectedStudents] = useState<string[]>([]);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Students data for manual mode
    const [students, setStudents] = useState<ManualStudent[]>([]);

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
        }
    };

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setCameraError(false);
            } catch (err) {
                console.error('Camera access denied:', err);
                setCameraError(true);
            }
        };

        const loadStudents = async () => {
            try {
                const data = await studentService.getAll();
                // Initialize with not-marked status
                const manualData: ManualStudent[] = data.map(s => ({ ...s, status: 'not-marked' }));
                setStudents(manualData);
            } catch (error) {
                console.error('Failed to load students:', error);
            }
        };

        if (mode === 'camera') {
            startCamera();
        } else {
            loadStudents();
        }
        return () => stopCamera();
    }, [mode]);

    const handleStartScan = async () => {
        setScanning(true);
        setStatusMessage("Capturing and analyzing face...");
        
        try {
            // Capture image from video
            if (!videoRef.current) return;
            
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
            
            const blob = await new Promise<Blob>((resolve) => {
                canvas.toBlob((b) => resolve(b!), 'image/jpeg');
            });

            // Get user location (optional)
            let latitude, longitude;
            try {
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject);
                });
                latitude = position.coords.latitude;
                longitude = position.coords.longitude;
            } catch (err) {
                console.log('Location not available');
            }

            // Mark attendance via API
            const response = await attendanceService.markWithFace(blob, latitude, longitude);
            
            if (response.success) {
                setDetectedStudents([response.name]);
                setStatusMessage(`✅ Attendance marked for ${response.name} (${response.confidence})`);
            } else {
                if (response.require_biometric) {
                    setStatusMessage(`⚠️ Low Confidence (${response.confidence}). Please use fingerprint.`);
                } else {
                    setStatusMessage(`❌ Error: ${response.message}`);
                }
                setDetectedStudents([]);
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || "Face detection failed";
            setStatusMessage("❌ Error: " + errorMsg);
            setDetectedStudents([]);
        } finally {
            setScanning(false);
        }
    };

    const markAttendance = (id: number, status: 'present' | 'absent') => {
        setStudents(prev =>
            prev.map(s => s.id === id ? { ...s, status } : s)
        );
    };

    const markAllPresent = () => {
        setStudents(prev => prev.map(s => ({ ...s, status: 'present' })));
    };

    return (
        <div className="mark-attendance-page">
            <div className="ma-header">
                <div className="ma-title">
                    <h2>Mark Attendance</h2>
                    <p>Use camera detection or mark manually</p>
                </div>
                <div className="mode-toggle">
                    <button
                        className={mode === 'camera' ? 'active' : ''}
                        onClick={() => setMode('camera')}
                    >
                        <i className='bx bx-camera'></i> Camera
                    </button>
                    <button
                        className={mode === 'manual' ? 'active' : ''}
                        onClick={() => setMode('manual')}
                    >
                        <i className='bx bx-edit'></i> Manual
                    </button>
                </div>
            </div>

            {/* Camera Mode */}
            {mode === 'camera' && (
                <div className="camera-section">
                    {cameraError ? (
                        <div className="camera-error-card">
                            <div className="error-icon">
                                <i className='bx bx-camera-off'></i>
                            </div>
                            <h3>Camera Not Available</h3>
                            <p>Unable to access camera. Please check permissions or use manual mode.</p>
                            <button className="btn-switch-manual" onClick={() => setMode('manual')}>
                                <i className='bx bx-edit'></i> Switch to Manual Mode
                            </button>
                        </div>
                    ) : (
                        <div className="camera-feed-card">
                            <div className="video-container">
                                <video ref={videoRef} autoPlay playsInline muted />
                                {scanning && (
                                    <div className="scan-overlay">
                                        <div className="scan-line"></div>
                                        <span>Scanning for faces...</span>
                                    </div>
                                )}
                            </div>
                            <div className="camera-controls">
                                <button
                                    className="btn-scan"
                                    onClick={handleStartScan}
                                    disabled={scanning}
                                >
                                    {scanning ? (
                                        <><i className='bx bx-loader-alt bx-spin'></i> Scanning...</>
                                    ) : (
                                        <><i className='bx bx-scan'></i> Start Scan</>
                                    )}
                                </button>
                            </div>

                            {statusMessage && (
                                <div style={{ 
                                    padding: '12px', 
                                    margin: '10px 0',
                                    borderRadius: '8px',
                                    background: statusMessage.includes('✅') ? '#16a34a22' : statusMessage.includes('⚠️') ? '#f59e0b22' : '#dc262622',
                                    color: statusMessage.includes('✅') ? '#16a34a' : statusMessage.includes('⚠️') ? '#f59e0b' : '#dc2626',
                                    textAlign: 'center'
                                }}>
                                    {statusMessage}
                                </div>
                            )}

                            {detectedStudents.length > 0 && (
                                <div className="detected-list">
                                    <h4>Detected Students ({detectedStudents.length})</h4>
                                    <ul>
                                        {detectedStudents.map((name, idx) => (
                                            <li key={idx}>
                                                <i className='bx bx-check-circle'></i> {name}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Manual Mode */}
            {mode === 'manual' && (
                <div className="manual-section">
                    <div className="manual-card">
                        <div className="manual-header">
                            <h3>Student List</h3>
                            <button className="btn-mark-all" onClick={markAllPresent}>
                                Mark All Present
                            </button>
                        </div>
                        <table className="students-table">
                            <thead>
                                <tr>
                                    <th>Roll No</th>
                                    <th>Name</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(student => (
                                    <tr key={student.id}>
                                        <td>{student.roll_number}</td>
                                        <td>{student.name}</td>
                                        <td>
                                            <span className={`status-badge ${student.status}`}>
                                                {student.status === 'present' ? 'Present' :
                                                    student.status === 'absent' ? 'Absent' : 'Not Marked'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-present"
                                                    onClick={() => markAttendance(student.id, 'present')}
                                                >
                                                    <i className='bx bx-check'></i>
                                                </button>
                                                <button
                                                    className="btn-absent"
                                                    onClick={() => markAttendance(student.id, 'absent')}
                                                >
                                                    <i className='bx bx-x'></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="submit-section">
                            <button className="btn-submit">
                                <i className='bx bx-save'></i> Submit Attendance
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarkAttendancePage;
