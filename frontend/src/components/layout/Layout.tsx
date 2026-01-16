import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Layout.css';

const Layout = () => {
    // In a real app, you'd get the role from Context or Redux
    const role = 'faculty'; // Defaulting to faculty for dev, or toggle manually

    return (
        <div className="dashboard-layout">
            <Sidebar role={role} />
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
