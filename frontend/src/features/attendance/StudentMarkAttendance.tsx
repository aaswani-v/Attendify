import { useState } from 'react';
import './StudentMarkAttendance.css';

type AttendanceMethod = 'fingerprint' | 'radar' | 'facial' | null;
type VerificationStatus = 'idle' | 'scanning' | 'verifying' | 'success' | 'error';

const StudentMarkAttendance = () => {
    const [selectedMethod, setSelectedMethod] = useState<AttendanceMethod>(null);
    const [status, setStatus] = useState<VerificationStatus>('idle');

    // Mock current lecture
    const currentLecture = {
        subject: 'Computer Science',
        professor: 'Dr. Amit Verma',
        time: '2:00 PM - 3:00 PM',
        room: 'Lab 201'
    };

    // Mock verification data
    const verificationChecks = {
        geofence: true,
        cctv: null as boolean | null,
        biometric: null as boolean | null
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
                    <p>Choose a verification method to mark your attendance</p>
                </div>

                {/* Current Lecture Info */}
                <div className="current-lecture-card">
                    <div className="lecture-badge">
                        <i className='bx bx-radio-circle-marked'></i>
                        Currently Active
                    </div>
                    <div className="lecture-info">
                        <h3>{currentLecture.subject}</h3>
                        <div className="lecture-details">
                            <span><i className='bx bx-user'></i> {currentLecture.professor}</span>
                            <span><i className='bx bx-time-five'></i> {currentLecture.time}</span>
                            <span><i className='bx bx-map-pin'></i> {currentLecture.room}</span>
                        </div>
                    </div>
                </div>

                {/* Verification Methods */}
                <div className="methods-section">
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
                            <p>Scan your fingerprint for biometric verification</p>
                            <div className="method-checks">
                                <span className="check-item">
                                    <i className='bx bx-check-circle'></i> Biometric Scan
                                </span>
                                <span className="check-item">
                                    <i className='bx bx-check-circle'></i> Geofence Check
                                </span>
                                <span className="check-item">
                                    <i className='bx bx-check-circle'></i> CCTV Verification
                                </span>
                            </div>
                        </div>

                        {/* Radar Option */}
                        <div
                            className={`method-card ${selectedMethod === 'radar' ? 'selected' : ''}`}
                            onClick={() => handleMethodSelect('radar')}
                        >
                            <div className="method-icon radar">
                                <i className='bx bx-broadcast'></i>
                            </div>
                            <h3>Radar</h3>
                            <p>Connect to teacher's proximity radar</p>
                            <div className="method-checks">
                                <span className="check-item">
                                    <i className='bx bx-check-circle'></i> Teacher's Radar
                                </span>
                                <span className="check-item">
                                    <i className='bx bx-check-circle'></i> Bluetooth Range
                                </span>
                                <span className="check-item">
                                    <i className='bx bx-check-circle'></i> Auto Detection
                                </span>
                            </div>
                        </div>

                        {/* Facial Recognition Option */}
                        <div
                            className={`method-card ${selectedMethod === 'facial' ? 'selected' : ''}`}
                            onClick={() => handleMethodSelect('facial')}
                        >
                            <div className="method-icon facial">
                                <i className='bx bx-scan'></i>
                            </div>
                            <h3>Face Recognition</h3>
                            <p>Use facial recognition with location check</p>
                            <div className="method-checks">
                                <span className="check-item">
                                    <i className='bx bx-check-circle'></i> Face Scan
                                </span>
                                <span className="check-item">
                                    <i className='bx bx-check-circle'></i> Geofence Check
                                </span>
                                <span className="check-item">
                                    <i className='bx bx-check-circle'></i> Liveness Detection
                                </span>
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
