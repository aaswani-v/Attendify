import './TeacherDashboard.css';

const TeacherDashboard = () => {
    const cards = [
        { title: 'Create Student', icon: 'bx-user-plus' },
        { title: 'Students List', icon: 'bx-list-ul' },
        { title: "Teacher's Attendance", icon: 'bx-calendar-check' },
        { title: 'Task List', icon: 'bx-task' },
        { title: 'Support', icon: 'bx-support' },
    ];

    return (
        <div className="teacher-dashboard">
            <div className="td-header">
                <div className="td-top-row">
                    <div className="td-app-name">
                        <i className='bx bxs-graduation'></i> Attendance Tracker
                    </div>
                    <i className='bx bx-cog' style={{ fontSize: '24px', cursor: 'pointer' }}></i>
                </div>

                <div className="td-profile">
                    <img src="https://ui-avatars.com/api/?name=Teacher+User&background=fff&color=3B753D" alt="Profile" className="td-avatar" />
                    <div className="td-user-info">
                        <h2>Shaheen Uddin Ahmad</h2>
                        <span>Artificial Soft</span>
                        <br />
                        <div className="td-badge">Leader</div>
                    </div>
                </div>
            </div>

            <div className="td-grid-container">
                {cards.map((card, index) => (
                    <div className="td-card" key={index}>
                        <div className="td-icon-con">
                            <i className={`bx ${card.icon}`}></i>
                        </div>
                        <h3>{card.title}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TeacherDashboard;
