import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import './Layout.css';

const Layout = () => {
    // Get role from localStorage or default to student for safety
    const role = localStorage.getItem('userRole') || 'student';

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
