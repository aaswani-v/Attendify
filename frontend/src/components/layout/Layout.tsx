import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import './Layout.css';

const Layout = () => {
    // In a real app, you'd get the role from Context or Redux
    const role = 'faculty'; // Defaulting to faculty for dev, or toggle manually

    return (
        <div className="dashboard-layout">
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
