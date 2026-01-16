import React, { useState, useRef } from 'react';
import './SchedulePage.css';

const SchedulePage = () => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploaded, setUploaded] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (selectedFile: File) => {
        setFile(selectedFile);
        setUploaded(false);
    };

    const handleUpload = () => {
        if (!file) return;
        setUploading(true);
        // Simulate upload and parsing delay
        setTimeout(() => {
            setUploading(false);
            setUploaded(true);
        }, 2000);
    };

    const openFileDialog = () => {
        inputRef.current?.click();
    };

    return (
        <div className="schedule-page">
            <div className="sp-header">
                <h2>Upload Timetable</h2>
                <p>Upload a PDF or image of the timetable to automatically update student schedules</p>
            </div>

            <div className="upload-card">
                <div
                    className={`drop-zone ${dragActive ? 'active' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={openFileDialog}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept=".pdf,image/*"
                        onChange={handleChange}
                        style={{ display: 'none' }}
                    />
                    <div className="drop-icon">
                        <i className='bx bx-cloud-upload'></i>
                    </div>
                    <p className="drop-text">
                        Drag and drop your timetable here, or <span>browse</span>
                    </p>
                    <p className="drop-hint">Supports PDF, PNG, JPG (Max 10MB)</p>
                </div>

                {file && (
                    <div className="file-preview">
                        <div className="file-info">
                            <i className='bx bx-file'></i>
                            <div className="file-details">
                                <span className="file-name">{file.name}</span>
                                <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                            </div>
                        </div>
                        <button
                            className={`btn-upload ${uploading ? 'uploading' : ''} ${uploaded ? 'uploaded' : ''}`}
                            onClick={handleUpload}
                            disabled={uploading || uploaded}
                        >
                            {uploading ? (
                                <>
                                    <i className='bx bx-loader-alt bx-spin'></i> Processing...
                                </>
                            ) : uploaded ? (
                                <>
                                    <i className='bx bx-check'></i> Uploaded & Parsed
                                </>
                            ) : (
                                <>
                                    <i className='bx bx-upload'></i> Upload & Parse
                                </>
                            )}
                        </button>
                    </div>
                )}

                {uploaded && (
                    <div className="success-message">
                        <i className='bx bx-check-circle'></i>
                        <span>Timetable successfully parsed! Student schedules have been updated.</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SchedulePage;
