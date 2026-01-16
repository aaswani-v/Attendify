/**
 * Attendance Kiosk Component
 * Face recognition attendance marking with Biometric & Geofence Support
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import Webcam from 'react-webcam';
import { GlassCard, GlassButton, GlassInput, SuccessBanner, ErrorBanner, Grid } from '../styles/glassmorphism';
import { API_ENDPOINTS } from '../utils/api';

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

const FileInput = styled.input`
  display: block;
  margin-top: 8px;
  padding: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  width: 100%;
  color: inherit;
`;

export const AttendanceKiosk: React.FC = () => {
  const [mode, setMode] = useState<'register' | 'attendance'>('attendance');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [fingerprint, setFingerprint] = useState<File | null>(null);
  const [biometricRequired, setBiometricRequired] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    // If strict biometric is required, we might skip face capture if fingerprint is the only allowed method
    // But usually we can send both.
    const imageSrc = webcamRef.current?.getScreenshot();
    
    if (imageSrc) {
      const blob = dataURLToBlob(imageSrc);
      if (mode === 'register') {
        handleRegister(blob);
      } else {
        handleAttendance(blob);
      }
    } else {
        // If webcam failed but we have fingerprint in fallback mode
        if (mode === 'attendance' && biometricRequired && fingerprint) {
             // Mock blob for face if skipping
             handleAttendance(new Blob([])); 
        } else {
             setFeedback({ type: 'error', message: 'Failed to capture image. Please check camera permissions.' });
        }
    }
  }, [mode, name, rollNumber, fingerprint, biometricRequired]);

  const requestCameraPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasPermission(true);
      setCameraError(null);
      // Stop the stream immediately after getting permission
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      setHasPermission(false);
      setCameraError('Camera access denied. Please allow camera permissions and refresh the page.');
    }
  }, []);

  const handleUserMedia = useCallback(() => {
    setHasPermission(true);
    setCameraError(null);
  }, []);

  const handleUserMediaError = useCallback((error: string | DOMException) => {
    setHasPermission(false);
    setCameraError('Unable to access camera. Please check your camera and permissions.');
    console.error('Camera error:', error);
  }, []);

  // Request camera permission on component mount
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
    if (fingerprint) {
      formData.append('fingerprint', fingerprint);
    }

    try {
      const response = await fetch(API_ENDPOINTS.REGISTER_STUDENT, {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        setFeedback({ type: 'success', message: 'Student registered successfully' });
        setName('');
        setRollNumber('');
        setFingerprint(null);
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
    
    // Get Geolocation
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          await submitAttendance(blob, latitude, longitude);
      }, async (error) => {
          console.warn("Geolocation failed or denied, assuming test environment (0,0):", error);
          await submitAttendance(blob, 0.0, 0.0);
      });
    } else {
       await submitAttendance(blob, 0.0, 0.0);
    }
  };

  const submitAttendance = async (blob: Blob, lat, lon) => {
    const formData = new FormData();
    if (blob.size > 0) {
        formData.append('file', blob, 'photo.jpg');
    }
    formData.append('latitude', String(lat));
    formData.append('longitude', String(lon));
    
    if (fingerprint && biometricRequired) {
        formData.append('fingerprint', fingerprint);
    }

    try {
      const response = await fetch(API_ENDPOINTS.MARK_ATTENDANCE, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      
      if (data.success) {
        setFeedback({ type: 'success', message: `${data.message} ${data.confidence ? '('+data.confidence+')' : ''}` });
        setBiometricRequired(false);
        setFingerprint(null);
      } else {
        if (data.require_biometric) {
           setBiometricRequired(true);
           setFeedback({ type: 'error', message: data.message });
        } else {
           setFeedback({ type: 'error', message: data.message || 'Unknown User' });
        }
      }
    } catch (error) {
      setFeedback({ type: 'error', message: 'Network error' });
    } finally {
      setCapturing(false);
      setTimeout(() => {
        if (!biometricRequired) setFeedback(null);
      }, 5000);
    }
  };

  return (
    <Container>
      <Title>✅ Attendance Kiosk</Title>

      <ModeToggle>
        <GlassButton
          variant={mode === 'attendance' ? 'primary' : 'secondary'}
          onClick={() => { setMode('attendance'); setBiometricRequired(false); }}
        >
          Mark Attendance
        </GlassButton>
        <GlassButton
          variant={mode === 'register' ? 'primary' : 'secondary'}
          onClick={() => { setMode('register'); setBiometricRequired(false); }}
        >
          Register Student
        </GlassButton>
      </ModeToggle>

      <Grid columns={2}>
        <GlassCard>
          <h3 style={{ marginBottom: '16px' }}>
            {mode === 'register' ? '📝 Register New Student' : '📸 Mark Attendance'}
          </h3>

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
              <FormGroup>
                  <label>Fingerprint File (Optional Biometric)</label>
                  <FileInput 
                    type="file" 
                    onChange={(e) => setFingerprint(e.target.files ? e.target.files[0] : null)} 
                  />
              </FormGroup>
            </>
          )}

          {mode === 'attendance' && biometricRequired && (
              <div style={{ padding: '15px', background: 'rgba(255,100,100,0.1)', borderRadius: '8px', marginBottom: '15px' }}>
                  <h4 style={{ color: '#ff6b6b', marginBottom: '10px' }}>⚠️ Biometric Verification Required</h4>
                  <p style={{ fontSize: '14px', marginBottom: '10px' }}>Face confidence is low. Please upload fingerprint to verify.</p>
                  <FileInput 
                    type="file" 
                    onChange={(e) => setFingerprint(e.target.files ? e.target.files[0] : null)} 
                  />
              </div>
          )}

          <WebcamContainer>
            {cameraError ? (
              <div style={{ 
                padding: '20px', 
                textAlign: 'center', 
                color: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <p>📷 {cameraError}</p>
                <GlassButton 
                  onClick={requestCameraPermission}
                  style={{ marginTop: '12px' }}
                >
                  🔄 Request Camera Access
                </GlassButton>
              </div>
            ) : hasPermission === false ? (
              <div style={{ 
                padding: '20px', 
                textAlign: 'center', 
                color: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <p>📷 Camera access required</p>
                <GlassButton 
                  onClick={requestCameraPermission}
                  style={{ marginTop: '12px' }}
                >
                  🎥 Enable Camera
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
                videoConstraints={{
                  width: 480,
                  height: 360,
                  facingMode: "user"
                }}
              />
            )}
          </WebcamContainer>

          <GlassButton 
            onClick={capture} 
            disabled={capturing || (mode==='register' && !name) || (biometricRequired && !fingerprint && !cameraError)} 
            style={{ width: '100%' }}
          >
            {capturing ? '⏳ Processing...' : 
                mode === 'register' ? '📸 Capture & Register' : 
                biometricRequired ? '👆 Verify Fingerprint' : '✅ Capture & Mark'}
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
        </GlassCard>
        
        <GlassCard>
          <h3 style={{ marginBottom: '16px' }}>ℹ️ Instructions</h3>
          {mode === 'register' ? (
            <div style={{ opacity: 0.8, lineHeight: 1.6 }}>
              <p><strong>Registration Steps:</strong></p>
              <ol style={{ paddingLeft: '20px', marginTop: '12px' }}>
                <li>Allow camera access when prompted</li>
                <li>Enter student name and roll number</li>
                <li>(Optional) Upload Fingerprint file for backup biometric</li>
                <li>Position your face in the center of the camera</li>
                <li>Click "Capture & Register"</li>
              </ol>
            </div>
          ) : (
             <div style={{ opacity: 0.8, lineHeight: 1.6 }}>
              <p><strong>Attendance Marking:</strong></p>
              <ul style={{ paddingLeft: '20px', marginTop: '12px' }}>
                <li>Ensure you are within campus geofence</li>
                <li>Position face in camera</li>
                <li>If face is unclear, system will ask for fingerprint</li>
              </ul>
            </div>
          )}
        </GlassCard>
      </Grid>
    </Container>
  );
};
