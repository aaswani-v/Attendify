import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';

const Dashboard = () => {
    // In a real app, this comes from context/auth
    // Change this to 'student' to see the student dashboard
    const role = 'student';

    if (role === 'faculty') {
        return <TeacherDashboard />;
    }

    return <StudentDashboard />;
};

export default Dashboard;
