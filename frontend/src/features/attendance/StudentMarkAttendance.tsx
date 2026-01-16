import { useState, useRef } from 'react';
import './StudentMarkAttendance.css';

type AttendanceMethod = 'fingerprint' | 'radar' | 'facial' | null;
type VerificationStatus = 'idle' | 'scanning' | 'verifying' | 'success' | 'error';

const StudentMarkAttendance = () => {
    const [selectedMethod, setSelectedMethod] = useState<AttendanceMethod>(null);
    const [status, setStatus] = useState<VerificationStatus>('idle');
    const verificationSectionRef = useRef<HTMLDivElement>(null);

    // Today's schedule - lectures for the day (Moved from Dashboard)
    const todaySchedule = [
        {
            time: '9:00 AM - 10:00 AM',
            subject: 'Mathematics',
            professor: 'Dr. Rajesh Kumar',
            room: 'Room 201',
            status: 'completed',
            attended: true
        },
        {
            time: '10:30 AM - 11:30 AM',
            subject: 'Physics',
            professor: 'Prof. Anita Sharma',
            room: 'Lab 102',
            status: 'completed',
            attended: true
        },
        {
            time: '12:00 PM - 1:00 PM',
            subject: 'Chemistry',
            professor: 'Dr. Suresh Patel',
            room: 'Room 305',
            status: 'completed',
            attended: false
        },
        {
            time: '2:00 PM - 3:00 PM',
            subject: 'English',
            professor: 'Ms. Priya Singh',
            room: 'Room 101',
            status: 'ongoing',
            attended: null
        },
        {
            time: '3:30 PM - 4:30 PM',
            subject: 'Computer Science',
            professor: 'Dr. Amit Verma',
            room: 'Lab 201',
            status: 'upcoming',
            attended: null
        },
        {
            time: '5:00 PM - 6:00 PM',
            subject: 'History',
            professor: 'Prof. Meena Iyer',
            room: 'Room 402',
            status: 'upcoming',
            attended: null
        },
    ];

    // Mock verification data
    const verificationChecks = {
        geofence: true,
        cctv: null as boolean | null,
        biometric: null as boolean | null
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'completed': return 'Completed';
            case 'ongoing': return 'Ongoing';
            case 'upcoming': return 'Upcoming';
            default: return status;
        }
    };

    const handleMethodSelect = (method: AttendanceMethod) => {
        setSelectedMethod(method);
        setStatus('idle');
    };

    const simulateVerification = () => {
        setStatus('scanning');

        setTimeout(() => {
            setStatus('verifying');

            setTimeout(() => {
                const success = Math.random() > 0.2; // 80% success rate for demo
                if (success) {
                    setStatus('success');
                } else {
                    setStatus('error');
                }
            }, 2000);
        }, 1500);
    };

    const handleMarkClick = () => {
        verificationSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="mark-attendance-page">
            {/* Header */}
            <div className="ma-header">
                <div className="ma-header-content">
                    <div className="ma-brand">
                        <img src="/logo.png" alt="Attendify" className="app-logo" />
                        <span className="app-name">Attendify</span>
                    </div>
                    <div className="ma-user-section">
                        <span className="user-name">Alisha Khan</span>
                        <img
                            src="https://ui-avatars.com/api/?name=Alisha+Khan&background=fff&color=3B753D&size=40"
                            alt="Profile"
                            className="user-avatar"
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="ma-main-content">
                <div className="ma-page-header">
                    <h1>Mark Attendance</h1>
                    <p>Select a class and verify your presence</p>
                </div>

                {/* Today's Schedule Section (Moved here) */}
                <div className="sd-card schedule-card" style={{ marginBottom: '30px' }}>
                    <div className="card-header">
                        <div className="header-with-icon">
                            <i className='bx bx-calendar-event'></i>
                            <div>
                                <h3>Today's Schedule</h3>
                                <p>Select your ongoing class to mark attendance</p>
                            </div>
                        </div>
                        <span className="schedule-count">{todaySchedule.length} lectures</span>
                    </div>
                    <div className="schedule-list">
                        {todaySchedule.map((lecture, index) => (
                            <div className={`schedule-item ${lecture.status}`} key={index}>
                                <div className="schedule-time-block">
                                    <span className="schedule-time">{lecture.time}</span>
                                    <span className={`schedule-status ${lecture.status}`}>
                                        {getStatusLabel(lecture.status)}
                                    </span>
                                </div>
                                <div className="schedule-details">
                                    <div className="schedule-main">
                                        <span className="schedule-subject">{lecture.subject}</span>
                                        <span className="schedule-room">
                                            <i className='bx bx-map-pin'></i>
                                            {lecture.room}
                                        </span>
                                    </div>
                                    <span className="schedule-professor">
                                        <i className='bx bx-user'></i>
                                        {lecture.professor}
                                    </span>
                                </div>
                                <div className="attendance-indicator">
                                    {lecture.status === 'completed' && (
                                        <div className={`indicator-dot ${lecture.attended ? 'present' : 'absent'}`}>
                                            <i className={`bx ${lecture.attended ? 'bx-check' : 'bx-x'}`}></i>
                                        </div>
                                    )}
                                    {lecture.status === 'ongoing' && (
                                        <div
                                            className="indicator-dot ongoing pulse"
                                            style={{ cursor: 'pointer' }}
                                            onClick={handleMarkClick}
                                        >
                                            <i className='bx bx-radio-circle-marked'></i>
                                        </div>
                                    )}
                                    {lecture.status === 'upcoming' && (
                                        <div className="indicator-dot upcoming">
                                            <i className='bx bx-time-five'></i>
                                        </div>
                                    )}
                                    <span className="indicator-label">
                                        {lecture.status === 'completed'
                                            ? (lecture.attended ? 'Present' : 'Absent')
                                            : lecture.status === 'ongoing'
                                                ? 'Mark Now'
                                                : 'Pending'
                                        }
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Verification Methods */}
                <div ref={verificationSectionRef} className="methods-section">
                    <h2>Select Verification Method</h2>
                    <div className="methods-grid">
                        {/* Fingerprint Option */}
                        <div
                            className={`method-card ${selectedMethod === 'fingerprint' ? 'selected' : ''}`}
                            onClick={() => handleMethodSelect('fingerprint')}
                        >
                            <div className="method-icon fingerprint">
                                <i className='bx bx-fingerprint'></i>
                            </div>
                            <h3>Fingerprint</h3>
                            <p>Scan your finger on the device to verify your identity locally.</p>
                            <div className="method-checks">
                                <div className="check-item"><i className='bx bx-check-circle'></i> Biometric Scan</div>
                                <div className="check-item"><i className='bx bx-check-circle'></i> Geofence Check</div>
                                <div className="check-item"><i className='bx bx-check-circle'></i> CCTV Verification</div>
                            </div>
                        </div>

                        {/* Radar Option */}
                        <div
                            className={`method-card ${selectedMethod === 'radar' ? 'selected' : ''}`}
                            onClick={() => handleMethodSelect('radar')}
                        >
                            <div className="method-icon radar">
                                <i className='bx bx-radar'></i>
                            </div>
                            <h3>Radar</h3>
                            <p>Use your device's proximity sensor to detect the teacher's signal.</p>
                            <div className="method-checks">
                                <div className="check-item"><i className='bx bx-check-circle'></i> Teacher's Radar</div>
                                <div className="check-item"><i className='bx bx-check-circle'></i> Bluetooth Range</div>
                                <div className="check-item"><i className='bx bx-check-circle'></i> Auto Detection</div>
                            </div>
                        </div>

                        {/* Facial Recognition Option */}
                        <div
                            className={`method-card ${selectedMethod === 'facial' ? 'selected' : ''}`}
                            onClick={() => handleMethodSelect('facial')}
                        >
                            <div className="method-icon facial">
                                <i className='bx bx-face'></i>
                            </div>
                            <h3>Facial Recognition</h3>
                            <p>Verify your attendance by scanning your face with the camera.</p>
                            <div className="method-checks">
                                <div className="check-item"><i className='bx bx-check-circle'></i> Face Scan</div>
                                <div className="check-item"><i className='bx bx-check-circle'></i> Geofence Check</div>
                                <div className="check-item"><i className='bx bx-check-circle'></i> Liveness Detection</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Verification Area */}
                {selectedMethod && (
                    <div className="verification-section">
                        <div className="verification-card">
                            {/* Fingerprint Verification */}
                            {selectedMethod === 'fingerprint' && (
                                <div className="verification-content">
                                    <div className={`fingerprint-scanner ${status}`}>
                                        <div className="scanner-ring"></div>
                                        <div className="scanner-ring delay-1"></div>
                                        <div className="scanner-ring delay-2"></div>
                                        <i className='bx bx-fingerprint'></i>
                                    </div>
                                    <h3>
                                        {status === 'idle' && 'Place your finger on the scanner'}
                                        {status === 'scanning' && 'Scanning fingerprint...'}
                                        {status === 'verifying' && 'Verifying identity...'}
                                        {status === 'success' && 'Verified Successfully!'}
                                        {status === 'error' && 'Verification Failed'}
                                    </h3>
                                    <div className="verification-checks">
                                        <div className={`check ${verificationChecks.geofence ? 'passed' : ''}`}>
                                            <i className='bx bx-map'></i>
                                            <span>Geofence</span>
                                            <i className={`bx ${verificationChecks.geofence ? 'bx-check-circle' : 'bx-loader-circle'}`}></i>
                                        </div>
                                        <div className={`check ${status === 'success' ? 'passed' : ''}`}>
                                            <i className='bx bx-cctv'></i>
                                            <span>CCTV Match</span>
                                            <i className={`bx ${status === 'success' ? 'bx-check-circle' : 'bx-loader-circle'}`}></i>
                                        </div>
                                        <div className={`check ${status === 'success' ? 'passed' : ''}`}>
                                            <i className='bx bx-fingerprint'></i>
                                            <span>Biometric</span>
                                            <i className={`bx ${status === 'success' ? 'bx-check-circle' : 'bx-loader-circle'}`}></i>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Radar Verification */}
                            {selectedMethod === 'radar' && (
                                <div className="verification-content">
                                    <div className={`radar-scanner ${status}`}>
                                        <div className="radar-sweep"></div>
                                        <div className="radar-circle"></div>
                                        <div className="radar-circle delay-1"></div>
                                        <div className="radar-circle delay-2"></div>
                                        <div className="radar-dot"></div>
                                    </div>
                                    <h3>
                                        {status === 'idle' && 'Searching for teacher\'s radar'}
                                        {status === 'scanning' && 'Connecting to radar...'}
                                        {status === 'verifying' && 'Verifying proximity...'}
                                        {status === 'success' && 'Connected & Verified!'}
                                        {status === 'error' && 'Out of Range'}
                                    </h3>
                                    <div className="radar-info">
                                        <div className="radar-status">
                                            <i className='bx bx-broadcast'></i>
                                            <span>Teacher's Radar: <strong>{status === 'success' ? 'Active' : 'Searching...'}</strong></span>
                                        </div>
                                        <div className="radar-status">
                                            <i className='bx bx-wifi'></i>
                                            <span>Signal Strength: <strong>{status === 'success' ? 'Excellent' : '---'}</strong></span>
                                        </div>
                                        <div className="radar-status">
                                            <i className='bx bx-target-lock'></i>
                                            <span>Distance: <strong>{status === 'success' ? '5m' : '---'}</strong></span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Facial Recognition Verification */}
                            {selectedMethod === 'facial' && (
                                <div className="verification-content">
                                    <div className={`face-scanner ${status}`}>
                                        <div className="face-frame">
                                            <div className="corner top-left"></div>
                                            <div className="corner top-right"></div>
                                            <div className="corner bottom-left"></div>
                                            <div className="corner bottom-right"></div>
                                            {status === 'scanning' && <div className="scan-line"></div>}
                                        </div>
                                        <i className='bx bx-user'></i>
                                    </div>
                                    <h3>
                                        {status === 'idle' && 'Position your face in the frame'}
                                        {status === 'scanning' && 'Scanning face...'}
                                        {status === 'verifying' && 'Analyzing features...'}
                                        {status === 'success' && 'Face Verified!'}
                                        {status === 'error' && 'Face Not Recognized'}
                                    </h3>
                                    <div className="verification-checks">
                                        <div className={`check ${verificationChecks.geofence ? 'passed' : ''}`}>
                                            <i className='bx bx-map'></i>
                                            <span>College Geofence</span>
                                            <i className={`bx ${verificationChecks.geofence ? 'bx-check-circle' : 'bx-loader-circle'}`}></i>
                                        </div>
                                        <div className={`check ${status === 'success' ? 'passed' : ''}`}>
                                            <i className='bx bx-face'></i>
                                            <span>Face Match</span>
                                            <i className={`bx ${status === 'success' ? 'bx-check-circle' : 'bx-loader-circle'}`}></i>
                                        </div>
                                        <div className={`check ${status === 'success' ? 'passed' : ''}`}>
                                            <i className='bx bx-shield-quarter'></i>
                                            <span>Liveness</span>
                                            <i className={`bx ${status === 'success' ? 'bx-check-circle' : 'bx-loader-circle'}`}></i>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Button */}
                            <button
                                className={`verify-btn ${status}`}
                                onClick={simulateVerification}
                                disabled={status === 'scanning' || status === 'verifying'}
                            >
                                {status === 'idle' && 'Start Verification'}
                                {status === 'scanning' && 'Scanning...'}
                                {status === 'verifying' && 'Verifying...'}
                                {status === 'success' && (
                                    <>
                                        <i className='bx bx-check'></i> Attendance Marked
                                    </>
                                )}
                                {status === 'error' && 'Try Again'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentMarkAttendance;
