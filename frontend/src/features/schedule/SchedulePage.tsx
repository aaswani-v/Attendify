import React, { useState, useRef } from 'react';
import './SchedulePage.css';
import './StudentSchedule.css';

const SchedulePage = () => {
    // In a real app, this would come from a context hook
    const role = 'student'; // Currently hardcoded to student for demo

    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploaded, setUploaded] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Mock Timetable Data for Student
    const timeSlots = ['9:00 - 10:00', '10:00 - 11:00', '11:00 - 11:30', '11:30 - 12:30', '12:30 - 1:30'];
    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    const scheduleData: any = {
        'Monday': {
            '9:00 - 10:00': { subject: 'Mathematics', room: '201', professor: 'Dr. Rajesh' },
            '10:00 - 11:00': { subject: 'Physics', room: '102', professor: 'Prof. Anita' },
            '11:30 - 12:30': { subject: 'Computer Science', room: 'Lab 1', professor: 'Dr. Amit' },
        },
        'Tuesday': {
            '9:00 - 10:00': { subject: 'Chemistry', room: '305', professor: 'Dr. Suresh' },
            '11:30 - 12:30': { subject: 'English', room: '101', professor: 'Ms. Priya' },
            '12:30 - 1:30': { subject: 'History', room: '402', professor: 'Prof. Meena' },
        },
        'Wednesday': {
            '9:00 - 10:00': { subject: 'Mathematics', room: '201', professor: 'Dr. Rajesh' },
            '10:00 - 11:00': { subject: 'Physics', room: '102', professor: 'Prof. Anita' },
            '12:30 - 1:30': { subject: 'Computer Science', room: 'Lab 1', professor: 'Dr. Amit' },
        },
        'Thursday': {
            '9:00 - 10:00': { subject: 'Mathematics', room: '201', professor: 'Dr. Rajesh' },
            '10:00 - 11:00': { subject: 'Physics', room: '102', professor: 'Prof. Anita' },
            '11:30 - 12:30': { subject: 'Chemistry', room: '305', professor: 'Dr. Suresh' },
            '12:30 - 1:30': { subject: 'English', room: '101', professor: 'Ms. Priya' },
        },
        'Friday': {
            '9:00 - 10:00': { subject: 'Computer Science', room: 'Lab 1', professor: 'Dr. Amit' },
            '10:00 - 11:00': { subject: 'History', room: '402', professor: 'Prof. Meena' },
            '11:30 - 12:30': { subject: 'Sports', room: 'Ground', professor: 'Mr. Suresh' },
        }
    };

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
        setTimeout(() => {
            setUploading(false);
            setUploaded(true);
        }, 2000);
    };

    const openFileDialog = () => {
        inputRef.current?.click();
    };

    if (role === 'student') {
        return (
            <div className="student-schedule-container">
                <div className="ss-header">
                    <h2>Weekly Timetable</h2>
                    <p>View your complete class schedule for the week</p>
                </div>

                <div className="schedule-grid-container">
                    <table className="schedule-table">
                        <thead>
                            <tr>
                                <th>Day / Time</th>
                                {timeSlots.map((time, index) => (
                                    <th key={index}>{time}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {weekDays.map((day) => (
                                <tr key={day}>
                                    <td>{day}</td>
                                    {timeSlots.map((time, index) => {
                                        // Specific logic for break time
                                        if (time === '11:00 - 11:30') {
                                            return index === 2 && day === 'Monday' ? (
                                                <td key={time} rowSpan={5} className="break-cell vertical-text">Break</td>
                                            ) : null;
                                        }

                                        const classInfo = scheduleData[day]?.[time];

                                        if (time === '11:00 - 11:30') {
                                            // Break column handling is weird in standard tables without full rowspan logic
                                            // Simplified: Just rendering a break cell for each row for now if not using fancy rowspan
                                            return <td key={time} className="break-cell">Break</td>;
                                        }

                                        return (
                                            <td key={time}>
                                                {classInfo ? (
                                                    <div className="class-cell-content">
                                                        <span className="class-subject">{classInfo.subject}</span>
                                                        <div className="class-meta">
                                                            <span className="class-room">
                                                                <i className='bx bx-map'></i> {classInfo.room}
                                                            </span>
                                                            <span className="class-prof">
                                                                <i className='bx bx-user'></i> {classInfo.professor.split(' ')[1]}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="empty-cell">Free</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

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
