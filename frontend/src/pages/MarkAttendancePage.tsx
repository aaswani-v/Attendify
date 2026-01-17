import { useState, useRef, useEffect } from 'react';
import { attendanceService } from '../services/attendanceService';
import { studentService } from '../services/studentService';
import { fingerprintScanner, fingerprintUtils } from '../services/fingerprintScanner';
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
    const [requireBiometric, setRequireBiometric] = useState(false);
    const [fingerprintData, setFingerprintData] = useState('');
    const [idCardData, setIdCardData] = useState('');
    const [scannedFingerprint, setScannedFingerprint] = useState<{
        template: string;
        quality: number;
        timestamp: number;
    } | null>(null);
    const [scannerConnected, setScannerConnected] = useState(false);
    const [scanningFingerprint, setScanningFingerprint] = useState(false);
    const [pendingFaceData, setPendingFaceData] = useState<{blob: Blob, latitude?: number, longitude?: number} | null>(null);
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

    // Cleanup fingerprint scanner on unmount
    useEffect(() => {
        return () => {
            fingerprintScanner.disconnect();
        };
    }, []);

    const handleStartScan = async () => {
        setScanning(true);
        setStatusMessage("Capturing and analyzing face...");
        setRequireBiometric(false);
        setPendingFaceData(null);
        setFingerprintData('');
        setScannedFingerprint(null);
        setScanningFingerprint(false);
        
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
                setRequireBiometric(false);
                setPendingFaceData(null);
            } else {
                if (response.status === "Biometric Required") {
                    setRequireBiometric(true);
                    setPendingFaceData({blob, latitude, longitude});
                    const reason = response.notes?.[0] || "Biometric verification required";
                    setStatusMessage(`🔐 ${reason}`);
                } else {
                    setStatusMessage(`❌ Error: ${response.message || response.status}`);
                    setRequireBiometric(false);
                    setPendingFaceData(null);
                }
                setDetectedStudents([]);
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || "Face detection failed";
            setStatusMessage("❌ Error: " + errorMsg);
            setDetectedStudents([]);
            setRequireBiometric(false);
            setPendingFaceData(null);
        } finally {
            setScanning(false);
        }
    };

    const connectFingerprintScanner = async () => {
        try {
            setStatusMessage("🔌 Connecting to fingerprint scanner...");
            const connected = await fingerprintScanner.requestScanner();
            if (connected) {
                setScannerConnected(true);
                setStatusMessage("✅ Fingerprint scanner connected successfully");
            } else {
                setStatusMessage("❌ Failed to connect to fingerprint scanner");
            }
        } catch (error: any) {
            setStatusMessage("❌ Scanner connection failed: " + error.message);
        }
    };

    const scanFingerprint = async () => {
        if (!scannerConnected) {
            setStatusMessage("❌ Please connect fingerprint scanner first");
            return;
        }

        try {
            setScanningFingerprint(true);
            setStatusMessage("👆 Place finger on scanner...");

            const fingerprint = await fingerprintScanner.scanFingerprint();
            setScannedFingerprint(fingerprint);

            const qualityLabel = fingerprintUtils.getQualityLabel(fingerprint.quality);
            setStatusMessage(`✅ Fingerprint scanned successfully (${qualityLabel} quality)`);

        } catch (error: any) {
            setStatusMessage("❌ Fingerprint scan failed: " + error.message);
            setScannedFingerprint(null);
        } finally {
            setScanningFingerprint(false);
        }
    };

    const submitWithFingerprint = async () => {
        if (!pendingFaceData || (!scannedFingerprint && !fingerprintData.trim() && !idCardData.trim())) {
            setStatusMessage("❌ Please scan fingerprint or enter ID");
            return;
        }

        try {
            setScanning(true);
            setStatusMessage("🔐 Verifying biometrics...");

            // Mark attendance with both face and fingerprint/ID
            // Use scanned fingerprint template if available, otherwise use manual data
            const fpData = scannedFingerprint ? scannedFingerprint.template : fingerprintData;

            const response = await attendanceService.markWithFaceAndFingerprint(
                pendingFaceData.blob,
                fpData,
                idCardData,
                pendingFaceData.latitude,
                pendingFaceData.longitude
            );

            if (response.success) {
                setDetectedStudents([response.name]);
                setStatusMessage(`✅ Biometric verification successful for ${response.name}`);
                setRequireBiometric(false);
                setPendingFaceData(null);
                setScannedFingerprint(null);
                setFingerprintData('');
                setIdCardData('');
            } else {
                setStatusMessage(`❌ Biometric verification failed: ${response.message || response.status}`);
                setDetectedStudents([]);
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || "Biometric verification failed";
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
                                    className="btn-control btn-scan"
                                    onClick={handleStartScan}
                                    disabled={scanning}
                                >
                                    {scanning ? (
                                        <><i className='bx bx-loader-alt bx-spin'></i> Scanning...</>
                                    ) : (
                                        <><i className='bx bx-scan'></i> Start Scan</>
                                    )}
                                </button>
                                {/* Temporary test button */}
                                <button
                                    className="btn-control btn-biometric"
                                    onClick={() => setRequireBiometric(true)}
                                >
                                    Test Biometric
                                </button>
                                {/* Test scanner connection */}
                                <button
                                    className="btn-control btn-scanner"
                                    style={{
                                        background: scannerConnected
                                            ? '#10b981'
                                            : fingerprintScanner.isSupported()
                                                ? '#0ea5e9'
                                                : '#ef4444'
                                    }}
                                    onClick={connectFingerprintScanner}
                                    disabled={!fingerprintScanner.isSupported()}
                                >
                                    {scannerConnected ? 'Scanner Connected' : 'Test Scanner'}
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

                            {requireBiometric && (
                                <div className="biometric-input-card" style={{
                                    padding: '16px',
                                    margin: '10px 0',
                                    borderRadius: '8px',
                                    background: '#3b82f622',
                                    border: '1px solid #3b82f6'
                                }}>
                                    <h4 style={{ margin: '0 0 12px 0', color: '#3b82f6' }}>
                                        <i className='bx bx-fingerprint'></i> Fingerprint Verification Required
                                    </h4>

                                    {/* Scanner Connection */}
                                    {!fingerprintScanner.isSupported() && (
                                        <div style={{
                                            padding: '8px',
                                            margin: '8px 0',
                                            borderRadius: '4px',
                                            background: '#ef444422',
                                            color: '#ef4444',
                                            fontSize: '14px'
                                        }}>
                                            ⚠️ Fingerprint scanning not supported in this browser. Please use Chrome or Edge.
                                        </div>
                                    )}

                                    {!scannerConnected && fingerprintScanner.isSupported() && (
                                        <div style={{ marginBottom: '12px' }}>
                                            <button
                                                onClick={connectFingerprintScanner}
                                                style={{
                                                    padding: '8px 16px',
                                                    background: '#6b7280',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <i className='bx bx-usb'></i> Connect Scanner
                                            </button>
                                        </div>
                                    )}

                                    {scannerConnected && (
                                        <div style={{ marginBottom: '12px' }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                marginBottom: '8px',
                                                fontSize: '14px',
                                                color: '#059669'
                                            }}>
                                                <i className='bx bx-check-circle'></i>
                                                Scanner Connected
                                            </div>

                                            {/* Fingerprint Scan Button */}
                                            <button
                                                onClick={scanFingerprint}
                                                disabled={scanningFingerprint}
                                                style={{
                                                    padding: '8px 16px',
                                                    background: scanningFingerprint ? '#9ca3af' : '#3b82f6',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: scanningFingerprint ? 'not-allowed' : 'pointer',
                                                    marginRight: '8px'
                                                }}
                                            >
                                                {scanningFingerprint ? (
                                                    <><i className='bx bx-loader-alt bx-spin'></i> Scanning...</>
                                                ) : (
                                                    <><i className='bx bx-fingerprint'></i> Scan Fingerprint</>
                                                )}
                                            </button>
                                        </div>
                                    )}

                                    {/* Scanned Fingerprint Display */}
                                    {scannedFingerprint && (
                                        <div style={{
                                            padding: '8px',
                                            margin: '8px 0',
                                            borderRadius: '4px',
                                            background: '#f3f4f622',
                                            border: '1px solid #d1d5db'
                                        }}>
                                            <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                                                <strong>Fingerprint Captured</strong>
                                            </div>
                                            <div style={{
                                                fontSize: '12px',
                                                color: '#6b7280',
                                                fontFamily: 'monospace'
                                            }}>
                                                Template: {fingerprintUtils.formatTemplate(scannedFingerprint.template)}
                                            </div>
                                            <div style={{
                                                fontSize: '12px',
                                                color: fingerprintUtils.getQualityColor(scannedFingerprint.quality),
                                                marginTop: '4px'
                                            }}>
                                                Quality: {fingerprintUtils.getQualityLabel(scannedFingerprint.quality)} ({scannedFingerprint.quality}%)
                                            </div>
                                        </div>
                                    )}

                                    {/* ID Card Scanner Section */}
                                    <div style={{ marginTop: '16px', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                                        <div style={{ fontWeight: 500, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>
                                            <i className='bx bx-barcode-reader'></i> Scan Student ID Card
                                        </div>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type="text"
                                                placeholder="Scan barcode or enter ID..."
                                                value={idCardData}
                                                autoFocus={!scannedFingerprint}
                                                onChange={(e) => setIdCardData(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        submitWithFingerprint();
                                                    }
                                                }}
                                                style={{
                                                    width: '100%',
                                                    padding: '10px 12px 10px 36px',
                                                    border: '2px solid #3b82f6',
                                                    borderRadius: '6px',
                                                    fontSize: '16px',
                                                    marginBottom: '4px',
                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                                }}
                                            />
                                            <i className='bx bx-qr-scan' style={{ position: 'absolute', left: '12px', top: '13px', color: '#6b7280', fontSize: '18px' }}></i>
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px', fontStyle: 'italic', paddingLeft: '4px' }}>
                                            * Ready for handheld scanner input
                                        </div>
                                    </div>

                                    {/* Manual Fingerprint Entry (Debug) */}
                                    <div style={{ marginTop: '8px' }}>
                                         <details>
                                            <summary style={{fontSize: '11px', cursor: 'pointer', color: '#9ca3af', userSelect: 'none'}}>Advanced: Manual Fingerprint ID</summary>
                                            <input
                                                type="text"
                                                placeholder="Fingerprint ID (e.g., student1_thumb)"
                                                value={fingerprintData}
                                                onChange={(e) => setFingerprintData(e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    marginTop: '4px',
                                                    padding: '6px',
                                                    fontSize: '12px',
                                                    border: '1px solid #d1d5db', 
                                                    borderRadius: '4px',
                                                    color: '#6b7280'
                                                }}
                                            />
                                         </details>
                                    </div>

                                    {/* Verify Button */}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                                        <button
                                            className="btn-scan"
                                            onClick={submitWithFingerprint}
                                            disabled={scanning || (!scannedFingerprint && !fingerprintData.trim() && !idCardData.trim())}
                                            style={{
                                                padding: '8px 16px',
                                                background: (scannedFingerprint || fingerprintData.trim() || idCardData.trim()) ? '#059669' : '#9ca3af',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: (scanning || (!scannedFingerprint && !fingerprintData.trim() && !idCardData.trim())) ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            {scanning ? (
                                                <><i className='bx bx-loader-alt bx-spin'></i> Verifying...</>
                                            ) : (
                                                <><i className='bx bx-check'></i> Verify Attendance</>
                                            )}
                                        </button>
                                    </div>
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
