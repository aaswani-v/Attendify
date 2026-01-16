import { useState, useRef, useEffect } from 'react';
import './MarkAttendancePage.css';

const MarkAttendancePage = () => {
    const [mode, setMode] = useState<'camera' | 'manual'>('camera');
    const [cameraError, setCameraError] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [detectedStudents, setDetectedStudents] = useState<string[]>([]);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Mock student data for manual mode
    const [students, setStudents] = useState([
        { id: 1, name: 'John Doe', rollNo: 'CS101', status: 'not-marked' },
        { id: 2, name: 'Jane Smith', rollNo: 'CS102', status: 'not-marked' },
        { id: 3, name: 'Mike Johnson', rollNo: 'CS103', status: 'not-marked' },
        { id: 4, name: 'Emily Davis', rollNo: 'CS104', status: 'not-marked' },
        { id: 5, name: 'Chris Brown', rollNo: 'CS105', status: 'not-marked' },
    ]);

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

        if (mode === 'camera') {
            startCamera();
        }
        return () => stopCamera();
    }, [mode]);

    const handleStartScan = () => {
        setScanning(true);
        // Simulate face detection
        setTimeout(() => {
            setDetectedStudents(['John Doe', 'Jane Smith', 'Emily Davis']);
            setScanning(false);
        }, 3000);
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
                                    <button className="btn-confirm">
                                        <i className='bx bx-check'></i> Confirm Attendance
                                    </button>
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
                                        <td>{student.rollNo}</td>
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
