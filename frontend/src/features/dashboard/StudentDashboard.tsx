import './StudentDashboard.css';

const StudentDashboard = () => {
    // Mock student data
    const studentName = "Alisha Khan";

    // Stats data
    const stats = {
        totalClasses: 45,
        classesAttended: 38,
        attendanceRate: 84.4,
        rateChange: 2.3
    };

    // Today's schedule - lectures for the day
    const todaySchedule = [
        {
            time: '9:00 AM - 10:00 AM',
            subject: 'Mathematics',
            professor: 'Dr. Rajesh Kumar',
            room: 'Room 201',
            status: 'completed',
            attended: true
        },
        {
            time: '10:30 AM - 11:30 AM',
            subject: 'Physics',
            professor: 'Prof. Anita Sharma',
            room: 'Lab 102',
            status: 'completed',
            attended: true
        },
        {
            time: '12:00 PM - 1:00 PM',
            subject: 'Chemistry',
            professor: 'Dr. Suresh Patel',
            room: 'Room 305',
            status: 'completed',
            attended: false
        },
        {
            time: '2:00 PM - 3:00 PM',
            subject: 'English',
            professor: 'Ms. Priya Singh',
            room: 'Room 101',
            status: 'ongoing',
            attended: null
        },
        {
            time: '3:30 PM - 4:30 PM',
            subject: 'Computer Science',
            professor: 'Dr. Amit Verma',
            room: 'Lab 201',
            status: 'upcoming',
            attended: null
        },
        {
            time: '5:00 PM - 6:00 PM',
            subject: 'History',
            professor: 'Prof. Meena Iyer',
            room: 'Room 402',
            status: 'upcoming',
            attended: null
        },
    ];

    // Recent attendance records
    const recentAttendance = [
        { subject: 'Mathematics', date: '2026-01-16', time: '9:00 AM', status: 'present' },
        { subject: 'Physics', date: '2026-01-15', time: '11:00 AM', status: 'present' },
        { subject: 'Chemistry', date: '2026-01-15', time: '2:00 PM', status: 'absent' },
        { subject: 'English', date: '2026-01-14', time: '10:00 AM', status: 'present' },
        { subject: 'Computer Science', date: '2026-01-14', time: '1:00 PM', status: 'present' },
    ];

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'completed': return 'Completed';
            case 'ongoing': return 'Ongoing';
            case 'upcoming': return 'Upcoming';
            default: return status;
        }
    };

    return (
        <div className="student-dashboard">
            {/* Header */}
            <div className="sd-header">
                <div className="sd-header-content">
                    <div className="sd-brand">
                        <img src="/logo.png" alt="Attendify" className="app-logo" />
                        <span className="app-name">Attendify</span>
                    </div>
                    <div className="sd-user-section">
                        <div className="sd-user-info">
                            <span className="user-name">{studentName}</span>
                            <span className="user-role">Student</span>
                        </div>
                        <img
                            src={`https://ui-avatars.com/api/?name=${studentName.replace(' ', '+')}&background=fff&color=3B753D&size=40`}
                            alt="Profile"
                            className="user-avatar"
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="sd-main-content">
                {/* Top Navigation Pills */}
                <div className="sd-nav-pills">
                    <button className="nav-pill active">
                        <i className='bx bxs-dashboard'></i>
                        Dashboard
                    </button>
                    <button className="nav-pill">
                        <i className='bx bx-calendar'></i>
                        Schedule
                    </button>
                    <button className="nav-pill">
                        <i className='bx bx-user'></i>
                        Profile
                    </button>
                </div>

                {/* Welcome Section */}
                <div className="sd-welcome">
                    <h1>Welcome back, {studentName.split(' ')[0]}!</h1>
                    <p>Here's your attendance overview</p>
                </div>

                {/* Stats Cards */}
                <div className="sd-stats-row">
                    <div className="sd-stat-card">
                        <div className="stat-header">
                            <span>Total Classes</span>
                            <i className='bx bx-calendar'></i>
                        </div>
                        <div className="stat-value">{stats.totalClasses}</div>
                        <div className="stat-sub">This semester</div>
                    </div>
                    <div className="sd-stat-card">
                        <div className="stat-header">
                            <span>Classes Attended</span>
                            <i className='bx bx-check-circle success'></i>
                        </div>
                        <div className="stat-value">{stats.classesAttended}</div>
                        <div className="stat-sub">Verified attendance</div>
                    </div>
                    <div className="sd-stat-card">
                        <div className="stat-header">
                            <span>Attendance Rate</span>
                            <i className='bx bx-trending-up'></i>
                        </div>
                        <div className="stat-value">{stats.attendanceRate}%</div>
                        <div className="stat-sub positive">+{stats.rateChange}% from last month</div>
                    </div>
                </div>

                {/* Today's Schedule Section */}
                <div className="sd-card schedule-card">
                    <div className="card-header">
                        <div className="header-with-icon">
                            <i className='bx bx-calendar-event'></i>
                            <div>
                                <h3>Today's Schedule</h3>
                                <p>Your lectures for today - Thursday, Jan 16</p>
                            </div>
                        </div>
                        <span className="schedule-count">{todaySchedule.length} lectures</span>
                    </div>
                    <div className="schedule-list">
                        {todaySchedule.map((lecture, index) => (
                            <div className={`schedule-item ${lecture.status}`} key={index}>
                                <div className="schedule-time-block">
                                    <span className="schedule-time">{lecture.time}</span>
                                    <span className={`schedule-status ${lecture.status}`}>
                                        {getStatusLabel(lecture.status)}
                                    </span>
                                </div>
                                <div className="schedule-details">
                                    <div className="schedule-main">
                                        <span className="schedule-subject">{lecture.subject}</span>
                                        <span className="schedule-room">
                                            <i className='bx bx-map-pin'></i>
                                            {lecture.room}
                                        </span>
                                    </div>
                                    <span className="schedule-professor">
                                        <i className='bx bx-user'></i>
                                        {lecture.professor}
                                    </span>
                                </div>
                                <div className="attendance-indicator">
                                    {lecture.status === 'completed' && (
                                        <div className={`indicator-dot ${lecture.attended ? 'present' : 'absent'}`}>
                                            <i className={`bx ${lecture.attended ? 'bx-check' : 'bx-x'}`}></i>
                                        </div>
                                    )}
                                    {lecture.status === 'ongoing' && (
                                        <div className="indicator-dot ongoing pulse">
                                            <i className='bx bx-radio-circle-marked'></i>
                                        </div>
                                    )}
                                    {lecture.status === 'upcoming' && (
                                        <div className="indicator-dot upcoming">
                                            <i className='bx bx-time-five'></i>
                                        </div>
                                    )}
                                    <span className="indicator-label">
                                        {lecture.status === 'completed'
                                            ? (lecture.attended ? 'Present' : 'Absent')
                                            : lecture.status === 'ongoing'
                                                ? 'Mark Now'
                                                : 'Pending'
                                        }
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Attendance Progress */}
                <div className="sd-card">
                    <div className="card-header">
                        <h3>Attendance Progress</h3>
                        <p>Your overall attendance for this semester</p>
                    </div>
                    <div className="progress-section">
                        <div className="progress-label">
                            <span>Overall Progress</span>
                            <span className="progress-value">{stats.classesAttended} / {stats.totalClasses}</span>
                        </div>
                        <div className="progress-bar-container">
                            <div
                                className="progress-bar-fill"
                                style={{ width: `${(stats.classesAttended / stats.totalClasses) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Recent Attendance */}
                <div className="sd-card">
                    <div className="card-header">
                        <h3>Recent Attendance</h3>
                        <p>Your attendance record for recent classes</p>
                    </div>
                    <div className="attendance-list">
                        {recentAttendance.map((record, index) => (
                            <div className="attendance-item" key={index}>
                                <div className="attendance-info">
                                    <span className="subject-name">{record.subject}</span>
                                    <span className="attendance-datetime">{record.date} • {record.time}</span>
                                </div>
                                <span className={`status-badge ${record.status}`}>
                                    <i className={`bx ${record.status === 'present' ? 'bx-check-circle' : 'bx-x-circle'}`}></i>
                                    {record.status === 'present' ? 'Present' : 'Absent'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
