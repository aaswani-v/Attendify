import React from 'react';
import { NavLink } from 'react-router-dom';
import './BottomNav.css';

interface BottomNavProps {
    role: 'student' | 'faculty';
}

const BottomNav: React.FC<BottomNavProps> = ({ role }) => {
    return (
        <div className="bottom-nav-container">
            <nav className="bottom-nav">
                <NavLink to="/dashboard" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <i className='bx bxs-dashboard'></i>
                    <span>Dashboard</span>
                </NavLink>

                {role === 'faculty' && (
                    <>
                        <NavLink to="/dashboard/mark-attendance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <i className='bx bx-scan'></i>
                            <span>Mark Attendance</span>
                        </NavLink>
                        <NavLink to="/dashboard/students" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <i className='bx bx-user'></i>
                            <span>Students</span>
                        </NavLink>
                        <NavLink to="/dashboard/reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <i className='bx bx-bar-chart-alt-2'></i>
                            <span>Reports</span>
                        </NavLink>
                        <NavLink to="/dashboard/notices" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <i className='bx bx-bell'></i>
                            <span>Notices</span>
                        </NavLink>
                        {/* Adding Schedule if requested, though originally student only */}
                        <NavLink to="/dashboard/schedule" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <i className='bx bx-calendar'></i>
                            <span>Schedule</span>
                        </NavLink>
                    </>
                )}
                {role === 'student' && (
                    <>
                        <NavLink to="/dashboard/mark-attendance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <i className='bx bx-scan'></i>
                            <span>Mark Attendance</span>
                        </NavLink>
                        <NavLink to="/dashboard/schedule" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <i className='bx bx-calendar'></i>
                            <span>Schedule</span>
                        </NavLink>
                        <NavLink to="/dashboard/notices" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <i className='bx bx-bell'></i>
                            <span>Notices</span>
                        </NavLink>
                    </>
                )}

                <div className="nav-divider"></div>

                <NavLink to="/dashboard/profile" className={({ isActive }) => `nav-item profile-item ${isActive ? 'active' : ''}`}>
                    <div className="nav-profile-info">
                        <span className="nav-profile-name">My Profile</span>
                    </div>
                    <img src="https://ui-avatars.com/api/?name=User&background=3B753D&color=fff" alt="Profile" className="nav-avatar" />
                </NavLink>
            </nav>
        </div>
    );
};

export default BottomNav;
