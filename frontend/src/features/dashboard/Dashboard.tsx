import TeacherDashboard from './TeacherDashboard';

const Dashboard = () => {
    // In a real app, this comes from context/auth
    const role = 'faculty';

    if (role === 'faculty') {
        return <TeacherDashboard />;
    }

    return (
        <div>
            <h1>Student Dashboard</h1>
            <p>Welcome to the Attendify Dashboard.</p>
            {/* ... Existing Student/Default View ... */}
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
                <div className="card" style={{ padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <h3>Total Attendance</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3B753D' }}>85%</p>
                </div>
                <div className="card" style={{ padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <h3>Average Score</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3B753D' }}>92%</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
