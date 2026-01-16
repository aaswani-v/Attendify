import './StudentNotices.css';

const StudentNotices = () => {
    // Mock notices from teachers
    const notices = [
        {
            id: 1,
            title: 'Mid-Term Examination Schedule',
            content: 'The mid-term examinations will be held from February 1st to February 10th, 2026. Please check the detailed schedule on the notice board. All students are required to carry their ID cards during the examination.',
            postedBy: 'Dr. Rajesh Kumar',
            department: 'Mathematics',
            date: '2026-01-16',
            time: '10:30 AM',
            priority: 'high',
            isNew: true
        },
        {
            id: 2,
            title: 'Workshop on Machine Learning',
            content: 'A two-day workshop on Machine Learning and AI will be conducted on January 20-21, 2026. Interested students can register at the Computer Science department. Limited seats available.',
            postedBy: 'Dr. Amit Verma',
            department: 'Computer Science',
            date: '2026-01-15',
            time: '3:00 PM',
            priority: 'normal',
            isNew: true
        },
        {
            id: 3,
            title: 'Library Hours Extended',
            content: 'The college library will remain open until 9:00 PM during the examination period. Students are encouraged to utilize this facility for their preparation.',
            postedBy: 'Prof. Anita Sharma',
            department: 'Administration',
            date: '2026-01-14',
            time: '11:00 AM',
            priority: 'normal',
            isNew: false
        },
        {
            id: 4,
            title: 'Attendance Requirement Reminder',
            content: 'This is a reminder that students must maintain a minimum of 75% attendance to be eligible for the final examinations. Students with less than 70% attendance will be marked as detained.',
            postedBy: 'Prof. Meena Iyer',
            department: 'Academic Affairs',
            date: '2026-01-12',
            time: '9:00 AM',
            priority: 'high',
            isNew: false
        },
        {
            id: 5,
            title: 'Sports Day Announcement',
            content: 'Annual Sports Day will be celebrated on January 26th, 2026. All students are encouraged to participate in various events. Registration starts from January 18th at the Sports Department.',
            postedBy: 'Mr. Suresh Patel',
            department: 'Sports',
            date: '2026-01-10',
            time: '2:00 PM',
            priority: 'normal',
            isNew: false
        }
    ];

    return (
        <div className="student-notices-page">
            {/* Header */}
            <div className="sn-header">
                <div className="sn-header-content">
                    <div className="sn-brand">
                        <img src="/logo.png" alt="Attendify" className="app-logo" />
                        <span className="app-name">Attendify</span>
                    </div>
                    <div className="sn-user-section">
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
            <div className="sn-main-content">
                <div className="sn-page-header">
                    <h1>
                        <i className='bx bx-bell'></i>
                        Notices
                    </h1>
                    <p>Important announcements from your teachers</p>
                </div>

                {/* Notice Stats */}
                <div className="notice-stats">
                    <div className="stat-pill">
                        <i className='bx bx-news'></i>
                        <span>{notices.length} Total Notices</span>
                    </div>
                    <div className="stat-pill new">
                        <i className='bx bxs-bell-ring'></i>
                        <span>{notices.filter(n => n.isNew).length} New</span>
                    </div>
                    <div className="stat-pill urgent">
                        <i className='bx bx-error-circle'></i>
                        <span>{notices.filter(n => n.priority === 'high').length} Important</span>
                    </div>
                </div>

                {/* Notices List */}
                <div className="notices-list">
                    {notices.map((notice) => (
                        <div className={`notice-card ${notice.priority === 'high' ? 'priority-high' : ''} ${notice.isNew ? 'is-new' : ''}`} key={notice.id}>
                            {notice.isNew && <div className="new-badge">NEW</div>}
                            {notice.priority === 'high' && (
                                <div className="priority-indicator">
                                    <i className='bx bx-error-circle'></i>
                                </div>
                            )}
                            <div className="notice-header">
                                <h3>{notice.title}</h3>
                                <div className="notice-meta">
                                    <span className="notice-date">
                                        <i className='bx bx-calendar'></i>
                                        {notice.date}
                                    </span>
                                    <span className="notice-time">
                                        <i className='bx bx-time-five'></i>
                                        {notice.time}
                                    </span>
                                </div>
                            </div>
                            <p className="notice-content">{notice.content}</p>
                            <div className="notice-footer">
                                <div className="posted-by">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${notice.postedBy.replace(/\s+/g, '+')}&background=3B753D&color=fff&size=32`}
                                        alt={notice.postedBy}
                                        className="teacher-avatar"
                                    />
                                    <div className="teacher-info">
                                        <span className="teacher-name">{notice.postedBy}</span>
                                        <span className="department">{notice.department}</span>
                                    </div>
                                </div>
                                <button className="view-details-btn">
                                    <i className='bx bx-right-arrow-alt'></i>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StudentNotices;
