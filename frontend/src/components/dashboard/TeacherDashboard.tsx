import './TeacherDashboard.css';

const TeacherDashboard = () => {
    // Mock data for the chart
    const weeklyData = [
        { day: 'Mon', present: 42, absent: 6 },
        { day: 'Tue', present: 45, absent: 3 },
        { day: 'Wed', present: 43, absent: 5 },
        { day: 'Thu', present: 46, absent: 4 }, // Highlighted in design
        { day: 'Fri', present: 38, absent: 10 },
        { day: 'Sat', present: 0, absent: 0 },
        { day: 'Sun', present: 0, absent: 0 },
    ];

    const maxVal = 60; // Max value for chart scale

    return (
        <div className="teacher-dashboard">
            <div className="td-header">
                <div className="td-header-content">
                    {/* Left side - Logo and App Name */}
                    <div className="td-brand">
                        <img src="/logo.png" alt="Attendify" className="app-logo" />
                        <span className="app-name">Attendify</span>
                    </div>

                    {/* Right side - User Info */}
                    <div className="td-user-section">
                        <div className="td-user-info">
                            <span className="user-name">Shaheen Ahmad</span>
                            <span className="user-role">Faculty</span>
                        </div>
                        <img
                            src="https://ui-avatars.com/api/?name=Shaheen+Ahmad&background=fff&color=3B753D&size=40"
                            alt="Profile"
                            className="user-avatar"
                        />
                    </div>
                </div>
            </div>

            <div className="td-main-content">
                {/* Summary Cards Row */}
                <div className="stats-row">
                    <div className="stat-card">
                        <div className="stat-header">
                            <span>Total Students</span>
                            <i className='bx bx-group'></i>
                        </div>
                        <div className="stat-value">8</div>
                        <div className="stat-sub">Registered in system</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-header">
                            <span>Present Today</span>
                            <i className='bx bx-check-circle success'></i>
                        </div>
                        <div className="stat-value">4</div>
                        <div className="stat-sub">Verified attendance</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-header">
                            <span>Absent Today</span>
                            <i className='bx bx-x-circle error'></i>
                        </div>
                        <div className="stat-value">1</div>
                        <div className="stat-sub">Not marked present</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-header">
                            <span>Attendance Rate</span>
                            <i className='bx bx-calendar'></i>
                        </div>
                        <div className="stat-value">50%</div>
                        <div className="stat-sub">Today's overall rate</div>
                    </div>
                </div>

                {/* Weekly Trend Chart */}
                <div className="chart-section">
                    <div className="chart-header">
                        <h3>Weekly Attendance Trend</h3>
                        <span>Last 7 days attendance overview</span>
                    </div>

                    <div className="chart-container">
                        <div className="y-axis">
                            <span>60</span>
                            <span>45</span>
                            <span>30</span>
                            <span>15</span>
                            <span>0</span>
                        </div>
                        <div className="bars-container">
                            {/* Grid lines */}
                            <div className="grid-lines">
                                <div className="line"></div>
                                <div className="line"></div>
                                <div className="line"></div>
                                <div className="line"></div>
                                <div className="line"></div>
                            </div>

                            {weeklyData.map((d, i) => (
                                <div className="bar-group" key={i}>
                                    <div className="bars-wrapper">
                                        <div
                                            className="bar present"
                                            style={{ height: `${(d.present / maxVal) * 100}%` }}
                                        ></div>
                                        <div
                                            className="bar absent"
                                            style={{ height: `${(d.absent / maxVal) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="day-label">{d.day}</span>

                                    {/* Tooltip for hover */}
                                    <div className="chart-tooltip">
                                        <h4>{d.day}</h4>
                                        <div className="tooltip-item present">Present: {d.present}</div>
                                        <div className="tooltip-item absent">Absent: {d.absent}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
