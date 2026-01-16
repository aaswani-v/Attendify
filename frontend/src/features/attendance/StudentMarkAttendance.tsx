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

                {/* Active Verification Area (Scanner) - Moved here */}
                {selectedMethod && (
                    <div className="verification-section">
                        {selectedMethod === 'fingerprint' && (
                            <div
                                className="scanner-container"
                                onClick={status === 'idle' ? simulateVerification : undefined}
                                style={{ cursor: status === 'idle' ? 'pointer' : 'default' }}
                            >
                                <div className={`fingerprint-scanner ${status === 'verifying' ? 'scanning' : ''} ${status === 'success' ? 'success' : ''}`}>
                                    <i className='bx bx-fingerprint'></i>
                                    {status === 'verifying' && <div className="scan-line"></div>}
                                </div>
                                <p>{status === 'idle' ? 'Tap to scan finger' :
                                    status === 'verifying' ? 'Verifying identity...' :
                                        status === 'success' ? 'Verified Successfully' : 'Verification Failed'}</p>
                            </div>
                        )}

                        {selectedMethod === 'radar' && (
                            <div
                                className="scanner-container"
                                onClick={status === 'idle' ? simulateVerification : undefined}
                                style={{ cursor: status === 'idle' ? 'pointer' : 'default' }}
                            >
                                <div className={`radar-scanner ${status === 'verifying' ? 'scanning' : ''} ${status === 'success' ? 'success' : ''}`}>
                                    <div className="radar-circle"></div>
                                    <div className="radar-circle"></div>
                                    <div className="radar-sweep"></div>
                                    <i className='bx bx-radar'></i>
                                </div>
                                <p>{status === 'idle' ? 'Tap to search signal' :
                                    status === 'verifying' ? 'Signal detected, verifying...' :
                                        status === 'success' ? 'Connected Successfully' : 'Signal Lost'}</p>
                            </div>
                        )}

                        {selectedMethod === 'facial' && (
                            <div
                                className="scanner-container"
                                onClick={status === 'idle' ? simulateVerification : undefined}
                                style={{ cursor: status === 'idle' ? 'pointer' : 'default' }}
                            >
                                <div className={`face-scanner ${status === 'verifying' ? 'scanning' : ''} ${status === 'success' ? 'success' : ''}`}>
                                    <div className="face-frame"></div>
                                    <i className='bx bx-face'></i>
                                    {status === 'verifying' && <div className="face-grid"></div>}
                                </div>
                                <p>{status === 'idle' ? 'Tap to start face scan' :
                                    status === 'verifying' ? 'Scanning facial features...' :
                                        status === 'success' ? 'Identity Verified' : 'Face Not Recognized'}</p>
                            </div>
                        )}

                        <div className="verification-status">
                            <div className={`status-step ${verificationChecks.biometric ? 'completed' : 'pending'}`}>
                                <div className="step-icon">
                                    {selectedMethod === 'radar' ? <i className='bx bx-broadcast'></i> :
                                        selectedMethod === 'facial' ? <i className='bx bx-face'></i> :
                                            <i className='bx bx-fingerprint'></i>}
                                </div>
                                <span>{selectedMethod === 'radar' ? 'Signal Check' :
                                    selectedMethod === 'facial' ? 'Face Scan' : 'Biometric'}</span>
                                {verificationChecks.biometric ? <i className='bx bx-check-circle success-icon'></i> : <i className='bx bx-loader-alt bx-spin'></i>}
                            </div>
                            <div className={`status-step ${verificationChecks.geofence ? 'completed' : 'pending'}`}>
                                <div className="step-icon"><i className='bx bx-map-pin'></i></div>
                                <span>Geofence</span>
                                {verificationChecks.geofence ? <i className='bx bx-check-circle success-icon'></i> : <i className='bx bx-loader-alt bx-spin'></i>}
                            </div>
                            <div className={`status-step ${verificationChecks.cctv ? 'completed' : 'pending'}`}>
                                <div className="step-icon"><i className='bx bx-cctv'></i></div>
                                <span>CCTV Match</span>
                                {verificationChecks.cctv ? <i className='bx bx-check-circle success-icon'></i> : <i className='bx bx-loader-alt bx-spin'></i>}
                            </div>
                        </div>

                        {status === 'success' && (
                            <div className="success-message-container">
                                <div className="success-icon-large">
                                    <i className='bx bx-check'></i>
                                </div>
                                <h3>Attendance Marked!</h3>
                                <p>Your attendance has been recorded for Computer Science at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        )}
                    </div>
                )}

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


            </div>
        </div>
    );
};

export default StudentMarkAttendance;
