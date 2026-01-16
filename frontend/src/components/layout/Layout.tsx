import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Layout.css';

const Layout = () => {
    // Get role from localStorage or default to student for safety
    const role = localStorage.getItem('userRole') || 'student';

    return (
        <div className="dashboard-layout">
            <Sidebar role={role as any} />
            <main className="dashboard-content">
                <header className="topbar">
                    <h3>Dashboard</h3>
                    <div className="user-info">
                        <span>User Name</span>
                        <div className="avatar">U</div>
                    </div>
                </header>
                <div className="content-area">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
