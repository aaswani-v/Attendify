import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import './Layout.css';

const Layout = () => {
<<<<<<< HEAD
    // In a real app, you'd get the role from Context or Redux
    const role = 'student'; // Currently showing student view
=======
    // Get role from localStorage or default to student for safety
    const role = localStorage.getItem('userRole') || 'student';
>>>>>>> f9bf0a78101de8e9c892e83bb70328ca86c38edb

    return (
        <div className="dashboard-layout">
            <Sidebar role={role as any} />
            <main className="dashboard-content">
                <div className="content-area">
                    <Outlet />
                </div>
            </main>
            <BottomNav role={role} />
        </div>
    );
};

export default Layout;
