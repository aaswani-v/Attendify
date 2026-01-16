import React, { useState } from 'react';
import './PostNoticesPage.css';

const PostNoticesPage = () => {
    const [isCreating, setIsCreating] = useState(false);

    // Mock data based on design
    const [notices, setNotices] = useState([
        {
            id: 1,
            title: 'Mid-term Exam Schedule',
            date: '2026-01-10',
            author: 'Admin Department',
            content: 'Mid-term examinations will be held from March 1-15. Please check the detailed schedule on the portal.',
            priority: 'High'
        },
        {
            id: 2,
            title: 'Parent-Teacher Meeting',
            date: '2026-01-12',
            author: 'Principal Office',
            content: 'Parent-teacher meeting scheduled for February 20. All parents are requested to attend.',
            priority: 'Medium'
        },
        {
            id: 3,
            title: 'Library Hours Extended',
            date: '2026-01-14',
            author: 'Library Department',
            content: 'Library hours have been extended till 6 PM for exam preparation.',
            priority: 'Low'
        }
    ]);

    const getPriorityClass = (priority: string) => {
        switch (priority) {
            case 'High': return 'priority-badge high';
            case 'Medium': return 'priority-badge medium';
            default: return 'priority-badge low';
        }
    };

    return (
        <div className="notices-page">
            {/* Header */}
            <div className="np-header-row">
                <div className="np-title">
                    <h2>Notice Board</h2>
                    <p>Post and manage announcements</p>
                </div>
                {!isCreating && (
                    <button className="btn-new-notice" onClick={() => setIsCreating(true)}>
                        <i className='bx bx-plus'></i> New Notice
                    </button>
                )}
            </div>

            {/* List View */}
            {!isCreating && (
                <div className="notices-list">
                    {notices.map((notice) => (
                        <div className="notice-card" key={notice.id}>
                            <div className="notice-header">
                                <div className="notice-meta-top">
                                    <h3>{notice.title}</h3>
                                    <span className={getPriorityClass(notice.priority)}>
                                        {notice.priority} Priority
                                    </span>
                                </div>
                                <div className="notice-meta-sub">
                                    <i className='bx bx-calendar'></i> {notice.date} • Posted by {notice.author}
                                </div>
                            </div>
                            <div className="notice-content">
                                <p>{notice.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create View */}
            {isCreating && (
                <div className="create-notice-form">
                    <div className="form-card">
                        <div className="form-header">
                            <h3>Create New Notice</h3>
                            <p>Post an announcement for students</p>
                        </div>

                        <div className="form-group">
                            <label>Title</label>
                            <input type="text" placeholder="Enter notice title" />
                        </div>

                        <div className="form-group">
                            <label>Content</label>
                            <textarea rows={4} placeholder="Enter notice content"></textarea>
                        </div>

                        <div className="form-group">
                            <label>Priority</label>
                            <select>
                                <option>High Priority</option>
                                <option>Medium Priority</option>
                                <option>Low Priority</option>
                            </select>
                        </div>

                        <div className="form-actions">
                            <button className="btn-post" onClick={() => setIsCreating(false)}>
                                <i className='bx bx-send'></i> Post Notice
                            </button>
                            <button className="btn-cancel" onClick={() => setIsCreating(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostNoticesPage;
