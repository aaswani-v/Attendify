import { NavLink } from 'react-router-dom';
import './Sidebar.css';

interface SidebarProps {
    role: 'student' | 'faculty' | 'admin';
}

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
    return (
        <aside className="sidebar">
            <div className="logo">
                <h2>Attendify</h2>
            </div>
            <nav>
                <ul>
                    <li>
                        <NavLink to="/dashboard" end className={({ isActive }) => isActive ? 'active' : ''}>
                            <i className='bx bxs-dashboard'></i> Dashboard
                        </NavLink>
                    </li>
                    {role === 'student' && (
                        <>
                            <li>
                                <NavLink to="/dashboard/schedule" className={({ isActive }) => isActive ? 'active' : ''}>
                                    <i className='bx bx-calendar'></i> Schedule
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/dashboard/attendance" className={({ isActive }) => isActive ? 'active' : ''}>
                                    <i className='bx bx-check-circle'></i> Attendance
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/dashboard/notices" className={({ isActive }) => isActive ? 'active' : ''}>
                                    <i className='bx bx-bell'></i> Notices
                                </NavLink>
                            </li>
                        </>
                    )}
                    {(role === 'faculty' || role === 'admin') && (
                        <>
                            <li>
                                <NavLink to="/dashboard/mark-attendance" className={({ isActive }) => isActive ? 'active' : ''}>
                                    <i className='bx bx-edit'></i> Mark Attendance
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/dashboard/notices" className={({ isActive }) => isActive ? 'active' : ''}>
                                    <i className='bx bx-bell'></i> Post Notices
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/dashboard/reports" className={({ isActive }) => isActive ? 'active' : ''}>
                                    <i className='bx bx-bar-chart-alt-2'></i> Reports
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/dashboard/analytics" className={({ isActive }) => isActive ? 'active' : ''}>
                                    <i className='bx bx-line-chart'></i> Analytics
                                </NavLink>
                            </li>
                        </>
                    )}
                    <li>
                        <NavLink to="/dashboard/profile" className={({ isActive }) => isActive ? 'active' : ''}>
                            <i className='bx bx-user'></i> Profile
                        </NavLink>
                    </li>
                </ul>
            </nav>
            <div className="logout">
                <NavLink to="/login">
                    <i className='bx bx-log-out'></i> Logout
                </NavLink>
            </div>
        </aside>
    );
};

export default Sidebar;
