import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { GlassCard, GlassButton, GlassInput } from '../../styles/glassmorphism';
import { API_ENDPOINTS } from '../../utils/api';

const Container = styled.div`
  padding: 32px;
  max-width: 800px;
  margin: 0 auto;
`;

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [rollNo, setRollNo] = useState('');
    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [capturedImage, setCapturedImage] = useState<Blob | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (err) {
            console.error("Camera error", err);
        }
    };

    const capturePhoto = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
            
            canvas.toBlob(blob => {
                if (blob) {
                    setCapturedImage(blob);
                    setPreviewUrl(URL.createObjectURL(blob));
                    // Stop camera
                    const stream = videoRef.current?.srcObject as MediaStream;
                    stream?.getTracks().forEach(track => track.stop());
                }
            }, 'image/jpeg');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!capturedImage) {
            alert("Please capture a face photo first");
            return;
        }

        setLoading(true);
        setStatus("Registering...");

        const formData = new FormData();
        formData.append('name', name);
        formData.append('roll_number', rollNo);
        formData.append('file', capturedImage, 'face.jpg');

        try {
            const res = await fetch(API_ENDPOINTS.REGISTER_STUDENT, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            
            if (res.ok) {
                setStatus("Success: " + data.message);
                setName('');
                setRollNo('');
                setCapturedImage(null);
                setPreviewUrl(null);
            } else {
                setStatus("Error: " + data.detail);
            }
        } catch (error) {
            setStatus("Network Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <h1>👤 Register New Student</h1>
            <GlassCard>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label>Student Name</label>
                        <GlassInput value={name} onChange={e => setName(e.target.value)} required placeholder="John Doe" />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label>Roll Number / ID</label>
                        <GlassInput value={rollNo} onChange={e => setRollNo(e.target.value)} required placeholder="STU-001" />
                    </div>

                    <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                        <label>Face Registration</label>
                        <div style={{ margin: '10px 0', background: '#000', height: '300px', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
                            {previewUrl ? (
                                <img src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            )}
                        </div>
                        {!previewUrl ? (
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                <GlassButton type="button" onClick={startCamera}>Start Camera</GlassButton>
                                <GlassButton type="button" onClick={capturePhoto}>Capture Photo</GlassButton>
                            </div>
                        ) : (
                            <GlassButton type="button" onClick={() => { setPreviewUrl(null); setCapturedImage(null); startCamera(); }}>Retake</GlassButton>
                        )}
                    </div>

                    <GlassButton type="submit" disabled={loading} style={{ width: '100%', background: 'linear-gradient(135deg, #16a34a, #15803d)' }}>
                        {loading ? 'Registering...' : 'Complete Registration'}
                    </GlassButton>
                    
                    {status && <p style={{ marginTop: '15px', textAlign: 'center', fontWeight: 'bold' }}>{status}</p>}
                </form>
            </GlassCard>
        </Container>
    );
};

export default RegisterPage;
