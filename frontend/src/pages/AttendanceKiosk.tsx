/**
 * Attendance Kiosk Component
 * Face recognition attendance marking
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

export const AttendanceKiosk: React.FC = () => {
  const [mode, setMode] = useState<'register' | 'attendance'>('attendance');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [capturing, setCapturing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      const blob = dataURLToBlob(imageSrc);
      if (mode === 'register') {
        handleRegister(blob);
      } else {
        handleAttendance(blob);
      }
    } else {
      setFeedback({ type: 'error', message: 'Failed to capture image. Please check camera permissions.' });
    }
  }, [mode, name, rollNumber]);

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
      console.error('Camera permission error:', error);
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

    try {
      const response = await fetch(API_ENDPOINTS.REGISTER_STUDENT, {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        setFeedback({ type: 'success', message: 'Student registered successfully' });
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

    try {
      const response = await fetch(API_ENDPOINTS.MARK_ATTENDANCE, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.status === 'Present') {
        setFeedback({ type: 'success', message: `Welcome, ${data.name}!` });
      } else {
        setFeedback({ type: 'error', message: 'Unknown User - Please register first' });
      }
    } catch (error) {
      setFeedback({ type: 'error', message: 'Network error' });
    } finally {
      setCapturing(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  return (
    <Container>
      <Title>✅ Attendance Kiosk</Title>

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
            disabled={capturing || hasPermission === false || cameraError !== null} 
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
        </GlassCard>

        <GlassCard>
          <h3 style={{ marginBottom: '16px' }}>ℹ️ Instructions</h3>
          {mode === 'register' ? (
            <div style={{ opacity: 0.8, lineHeight: 1.6 }}>
              <p><strong>Registration Steps:</strong></p>
              <ol style={{ paddingLeft: '20px', marginTop: '12px' }}>
                <li>Allow camera access when prompted</li>
                <li>Enter student name and roll number</li>
                <li>Position your face in the center of the camera</li>
                <li>Ensure good lighting</li>
                <li>Click "Capture & Register"</li>
                <li>Wait for confirmation</li>
              </ol>
              <p style={{ marginTop: '16px', color: '#fbbf24' }}>
                ⚠️ Make sure your face is clearly visible and well-lit
              </p>
              {cameraError && (
                <p style={{ marginTop: '12px', color: '#ef4444' }}>
                  🔴 Camera Error: {cameraError}
                </p>
              )}
            </div>
          ) : (
            <div style={{ opacity: 0.8, lineHeight: 1.6 }}>
              <p><strong>Attendance Marking:</strong></p>
              <ol style={{ paddingLeft: '20px', marginTop: '12px' }}>
                <li>Allow camera access when prompted</li>
                <li>Position your face in the center of the camera</li>
                <li>Click "Capture & Mark"</li>
                <li>System will verify your identity</li>
                <li>Attendance will be marked automatically</li>
              </ol>
              <p style={{ marginTop: '16px', color: '#60a5fa' }}>
                💡 You must be registered before marking attendance
              </p>
              {cameraError && (
                <p style={{ marginTop: '12px', color: '#ef4444' }}>
                  🔴 Camera Error: {cameraError}
                </p>
              )}
            </div>
          )}
        </GlassCard>
      </Grid>
    </Container>
  );
};
