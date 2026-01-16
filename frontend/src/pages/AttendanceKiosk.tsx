/**
 * Enhanced Attendance Kiosk Component
 * Features:
 * - Session selection for attendance
 * - Multi-frame capture for temporal verification
 * - Confidence score display
 * - Proxy risk indicators
 * - Liveness detection status
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import Webcam from 'react-webcam';
import { GlassCard, GlassButton, GlassInput, SuccessBanner, ErrorBanner, Grid } from '../styles/glassmorphism';
import { API_ENDPOINTS } from '../utils/api';

// Types
interface Session {
  id: number;
  name: string;
  status: string;
  attendance_count: number;
  require_liveness: boolean;
}

interface AttendanceResult {
  success: boolean;
  status: string;
  student_name?: string;
  confidence: number;
  confidence_label: string;
  proxy_suspected: boolean;
  proxy_reason?: string;
  liveness_passed: boolean;
  log_id?: number;
  notes: string[];
}

// Styled Components
const Container = styled.div`
  padding: 32px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 32px;
`;

const ModeToggle = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
`;

const WebcamContainer = styled(GlassCard)`
  display: inline-block;
  padding: 16px;
  margin-bottom: 16px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
  }
`;

const SessionSelector = styled.select`
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: inherit;
  font-size: 14px;
  outline: none;
  
  &:focus {
    border-color: rgba(124, 58, 237, 0.5);
  }
  
  option {
    background: #1a1a2e;
    color: white;
  }
`;

const ConfidenceBar = styled.div<{ confidence: number; label: string }>`
  width: 100%;
  height: 24px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
  position: relative;
  margin: 12px 0;
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${props => Math.min(100, props.confidence)}%;
    background: ${props => {
      if (props.label === 'HIGH') return 'linear-gradient(90deg, #10b981, #34d399)';
      if (props.label === 'MEDIUM') return 'linear-gradient(90deg, #f59e0b, #fbbf24)';
      if (props.label === 'LOW') return 'linear-gradient(90deg, #ef4444, #f87171)';
      return 'linear-gradient(90deg, #6b7280, #9ca3af)';
    }};
    transition: width 0.5s ease-out;
  }
`;

const ConfidenceLabel = styled.span<{ label: string }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => {
    if (props.label === 'HIGH') return 'rgba(16, 185, 129, 0.2)';
    if (props.label === 'MEDIUM') return 'rgba(245, 158, 11, 0.2)';
    if (props.label === 'LOW') return 'rgba(239, 68, 68, 0.2)';
    return 'rgba(107, 114, 128, 0.2)';
  }};
  color: ${props => {
    if (props.label === 'HIGH') return '#10b981';
    if (props.label === 'MEDIUM') return '#f59e0b';
    if (props.label === 'LOW') return '#ef4444';
    return '#6b7280';
  }};
`;

const ProxyWarning = styled.div`
  padding: 12px 16px;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  margin: 12px 0;
  
  strong {
    color: #ef4444;
  }
`;

const LivenessIndicator = styled.div<{ passed: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  background: ${props => props.passed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)'};
  color: ${props => props.passed ? '#10b981' : '#f59e0b'};
  font-size: 14px;
`;

const ResultCard = styled(GlassCard)<{ success: boolean }>`
  border: 2px solid ${props => props.success ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'};
  margin-top: 16px;
`;

export const AttendanceKiosk: React.FC = () => {
  const [mode, setMode] = useState<'register' | 'attendance'>('attendance');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [lastResult, setLastResult] = useState<AttendanceResult | null>(null);
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [capturing, setCapturing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [useMultiFrame, setUseMultiFrame] = useState(true);
  const webcamRef = useRef<Webcam>(null);

  // Fetch active sessions on mount
  useEffect(() => {
    fetchActiveSessions();
    const interval = setInterval(fetchActiveSessions, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchActiveSessions = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.GET_ACTIVE_SESSIONS);
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
        // Auto-select first session if none selected
        if (data.length > 0 && !selectedSession) {
          setSelectedSession(data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  };

  const captureMultipleFrames = async (count: number, intervalMs: number): Promise<Blob[]> => {
    const frames: Blob[] = [];
    
    for (let i = 0; i < count; i++) {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (imageSrc) {
        frames.push(dataURLToBlob(imageSrc));
      }
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    }
    
    return frames;
  };

  const capture = useCallback(async () => {
    setLastResult(null);
    
    if (mode === 'register') {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (imageSrc) {
        const blob = dataURLToBlob(imageSrc);
        handleRegister(blob);
      } else {
        setFeedback({ type: 'error', message: 'Failed to capture image' });
      }
    } else {
      // Attendance mode
      if (useMultiFrame) {
        setCapturing(true);
        setFeedback({ type: 'success', message: '📸 Capturing multiple frames...' });
        
        try {
          const frames = await captureMultipleFrames(5, 300); // 5 frames, 300ms apart
          if (frames.length >= 3) {
            handleMultiFrameAttendance(frames);
          } else {
            setFeedback({ type: 'error', message: 'Failed to capture enough frames' });
            setCapturing(false);
          }
        } catch (error) {
          setFeedback({ type: 'error', message: 'Capture failed' });
          setCapturing(false);
        }
      } else {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
          const blob = dataURLToBlob(imageSrc);
          handleAttendance(blob);
        } else {
          setFeedback({ type: 'error', message: 'Failed to capture image' });
        }
      }
    }
  }, [mode, name, rollNumber, selectedSession, useMultiFrame]);

  const requestCameraPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasPermission(true);
      setCameraError(null);
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      setHasPermission(false);
      setCameraError('Camera access denied. Please allow camera permissions.');
    }
  }, []);

  const handleUserMedia = useCallback(() => {
    setHasPermission(true);
    setCameraError(null);
  }, []);

  const handleUserMediaError = useCallback(() => {
    setHasPermission(false);
    setCameraError('Unable to access camera.');
  }, []);

  useEffect(() => {
    requestCameraPermission();
  }, [requestCameraPermission]);

  const dataURLToBlob = (dataURL: string): Blob => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const handleRegister = async (blob: Blob) => {
    if (!name || !rollNumber) {
      setFeedback({ type: 'error', message: 'Please enter name and roll number' });
      return;
    }
    setCapturing(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('roll_number', rollNumber);
    formData.append('file', blob, 'photo.jpg');

    try {
      const response = await fetch(API_ENDPOINTS.REGISTER_STUDENT, {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        setFeedback({ type: 'success', message: '✅ Student registered successfully!' });
        setName('');
        setRollNumber('');
      } else {
        const error = await response.json();
        setFeedback({ type: 'error', message: error.detail || 'Registration failed' });
      }
    } catch (error) {
      setFeedback({ type: 'error', message: 'Network error' });
    } finally {
      setCapturing(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const handleAttendance = async (blob: Blob) => {
    setCapturing(true);
    const formData = new FormData();
    formData.append('file', blob, 'photo.jpg');
    if (selectedSession) {
      formData.append('session_id', selectedSession.toString());
    }

    try {
      const response = await fetch(API_ENDPOINTS.MARK_ATTENDANCE, {
        method: 'POST',
        body: formData,
      });
      const data: AttendanceResult = await response.json();
      setLastResult(data);
      
      if (data.success) {
        setFeedback({ type: 'success', message: `✅ Welcome, ${data.student_name}!` });
      } else {
        setFeedback({ type: 'error', message: data.status });
      }
    } catch (error) {
      setFeedback({ type: 'error', message: 'Network error' });
    } finally {
      setCapturing(false);
      setTimeout(() => setFeedback(null), 8000);
    }
  };

  const handleMultiFrameAttendance = async (frames: Blob[]) => {
    const formData = new FormData();
    frames.forEach((frame, i) => {
      formData.append('files', frame, `frame_${i}.jpg`);
    });
    if (selectedSession) {
      formData.append('session_id', selectedSession.toString());
    }
    formData.append('check_liveness', 'true');

    try {
      const response = await fetch(API_ENDPOINTS.MARK_ATTENDANCE_MULTI, {
        method: 'POST',
        body: formData,
      });
      const data: AttendanceResult = await response.json();
      setLastResult(data);
      
      if (data.success) {
        setFeedback({ type: 'success', message: `✅ Welcome, ${data.student_name}!` });
      } else {
        setFeedback({ type: 'error', message: data.status });
      }
    } catch (error) {
      setFeedback({ type: 'error', message: 'Network error' });
    } finally {
      setCapturing(false);
      setTimeout(() => setFeedback(null), 8000);
    }
  };

  const selectedSessionData = sessions.find(s => s.id === selectedSession);

  return (
    <Container>
      <Title>✅ Intelligent Attendance Kiosk</Title>

      <ModeToggle>
        <GlassButton
          variant={mode === 'attendance' ? 'primary' : 'secondary'}
          onClick={() => setMode('attendance')}
        >
          Mark Attendance
        </GlassButton>
        <GlassButton
          variant={mode === 'register' ? 'primary' : 'secondary'}
          onClick={() => setMode('register')}
        >
          Register Student
        </GlassButton>
      </ModeToggle>

      <Grid columns={2}>
        <GlassCard>
          <h3 style={{ marginBottom: '16px' }}>
            {mode === 'register' ? '📝 Register New Student' : '📸 Mark Attendance'}
          </h3>

          {mode === 'attendance' && (
            <FormGroup>
              <label>Active Session</label>
              <SessionSelector
                value={selectedSession || ''}
                onChange={(e) => setSelectedSession(Number(e.target.value) || null)}
              >
                <option value="">No Session (Standalone)</option>
                {sessions.map(session => (
                  <option key={session.id} value={session.id}>
                    {session.name} ({session.attendance_count} marked)
                    {session.require_liveness && ' 🔒'}
                  </option>
                ))}
              </SessionSelector>
              {selectedSessionData?.require_liveness && (
                <small style={{ color: '#f59e0b', display: 'block', marginTop: '4px' }}>
                  🔒 This session requires liveness verification
                </small>
              )}
            </FormGroup>
          )}

          {mode === 'register' && (
            <>
              <FormGroup>
                <label>Name</label>
                <GlassInput
                  type="text"
                  placeholder="Enter student name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </FormGroup>
              <FormGroup>
                <label>Roll Number</label>
                <GlassInput
                  type="text"
                  placeholder="Enter roll number"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                />
              </FormGroup>
            </>
          )}

          <WebcamContainer>
            {cameraError ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#ef4444' }}>
                <p>📷 {cameraError}</p>
                <GlassButton onClick={requestCameraPermission} style={{ marginTop: '12px' }}>
                  🔄 Request Camera Access
                </GlassButton>
              </div>
            ) : (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width={480}
                height={360}
                style={{ borderRadius: '8px' }}
                onUserMedia={handleUserMedia}
                onUserMediaError={handleUserMediaError}
                videoConstraints={{ width: 480, height: 360, facingMode: "user" }}
              />
            )}
          </WebcamContainer>

          {mode === 'attendance' && (
            <FormGroup>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={useMultiFrame}
                  onChange={(e) => setUseMultiFrame(e.target.checked)}
                />
                Multi-Frame Verification (Recommended)
              </label>
              <small style={{ opacity: 0.7, display: 'block', marginTop: '4px' }}>
                Captures 5 frames for higher accuracy and anti-spoofing
              </small>
            </FormGroup>
          )}

          <GlassButton 
            onClick={capture} 
            disabled={capturing || hasPermission === false} 
            style={{ width: '100%' }}
          >
            {capturing ? '⏳ Processing...' : mode === 'register' ? '📸 Capture & Register' : '✅ Capture & Mark'}
          </GlassButton>

          {feedback && (
            feedback.type === 'success' ? (
              <SuccessBanner style={{ marginTop: '16px' }}>
                <span>✓</span> {feedback.message}
              </SuccessBanner>
            ) : (
              <ErrorBanner style={{ marginTop: '16px' }}>
                <span>⚠</span> {feedback.message}
              </ErrorBanner>
            )
          )}

          {/* Detailed Result Display */}
          {lastResult && (
            <ResultCard success={lastResult.success}>
              <h4 style={{ marginBottom: '12px' }}>
                {lastResult.success ? '✅ Verification Result' : '❌ Verification Failed'}
              </h4>
              
              <p><strong>Status:</strong> {lastResult.status}</p>
              {lastResult.student_name && (
                <p><strong>Student:</strong> {lastResult.student_name}</p>
              )}
              
              <div style={{ marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Confidence</span>
                  <ConfidenceLabel label={lastResult.confidence_label}>
                    {lastResult.confidence_label} ({lastResult.confidence.toFixed(1)}%)
                  </ConfidenceLabel>
                </div>
                <ConfidenceBar 
                  confidence={lastResult.confidence} 
                  label={lastResult.confidence_label}
                />
              </div>

              {lastResult.proxy_suspected && (
                <ProxyWarning>
                  <strong>⚠️ Proxy Risk Detected</strong>
                  <p>{lastResult.proxy_reason || 'Identity verification mismatch'}</p>
                </ProxyWarning>
              )}

              {useMultiFrame && (
                <LivenessIndicator passed={lastResult.liveness_passed}>
                  {lastResult.liveness_passed ? '✓ Liveness Verified' : '○ Liveness Not Verified'}
                </LivenessIndicator>
              )}

              {lastResult.notes && lastResult.notes.length > 0 && (
                <div style={{ marginTop: '12px', opacity: 0.8 }}>
                  <strong>Notes:</strong>
                  <ul style={{ marginTop: '4px', paddingLeft: '20px' }}>
                    {lastResult.notes.map((note, i) => (
                      <li key={i}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </ResultCard>
          )}
        </GlassCard>

        <GlassCard>
          <h3 style={{ marginBottom: '16px' }}>ℹ️ System Information</h3>
          
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ marginBottom: '8px', color: '#60a5fa' }}>🔐 Security Features</h4>
            <ul style={{ paddingLeft: '20px', lineHeight: 1.8, opacity: 0.9 }}>
              <li><strong>Multi-Frame Verification</strong> - 5 frames for accuracy</li>
              <li><strong>Facial Recognition</strong> - LBPH-based matching</li>
              <li><strong>Proxy Detection</strong> - Multiple face detection</li>
              <li><strong>Liveness Check</strong> - Blink detection anti-spoofing</li>
              <li><strong>Duplicate Prevention</strong> - Per-session deduplication</li>
            </ul>
          </div>

          {mode === 'attendance' ? (
            <div style={{ opacity: 0.8, lineHeight: 1.6 }}>
              <p><strong>Attendance Marking Steps:</strong></p>
              <ol style={{ paddingLeft: '20px', marginTop: '12px' }}>
                <li>Select an active session (if available)</li>
                <li>Position your face in the camera center</li>
                <li>Ensure good lighting on your face</li>
                <li>Click "Capture & Mark"</li>
                <li>Hold still for multi-frame capture</li>
                <li>View your verification result</li>
              </ol>
              <p style={{ marginTop: '16px', color: '#60a5fa' }}>
                💡 Registration required before marking attendance
              </p>
            </div>
          ) : (
            <div style={{ opacity: 0.8, lineHeight: 1.6 }}>
              <p><strong>Registration Steps:</strong></p>
              <ol style={{ paddingLeft: '20px', marginTop: '12px' }}>
                <li>Enter your full name</li>
                <li>Enter your roll number</li>
                <li>Position face clearly in camera</li>
                <li>Ensure good, even lighting</li>
                <li>Click "Capture & Register"</li>
              </ol>
              <p style={{ marginTop: '16px', color: '#fbbf24' }}>
                ⚠️ Face must be clearly visible and well-lit
              </p>
            </div>
          )}
          
          {/* Active Sessions Info */}
          {sessions.length > 0 && (
            <div style={{ marginTop: '24px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <h4 style={{ marginBottom: '8px' }}>📋 Active Sessions</h4>
              {sessions.map(s => (
                <div key={s.id} style={{ 
                  padding: '8px', 
                  marginBottom: '4px',
                  background: s.id === selectedSession ? 'rgba(124, 58, 237, 0.2)' : 'transparent',
                  borderRadius: '4px'
                }}>
                  <strong>{s.name}</strong>
                  <span style={{ marginLeft: '8px', opacity: 0.7 }}>
                    ({s.attendance_count} students)
                  </span>
                  {s.require_liveness && <span style={{ marginLeft: '8px' }}>🔒</span>}
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </Grid>
    </Container>
  );
};
