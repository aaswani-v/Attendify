import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../features/profile/ProfilePage.css';

const ProfilePage = () => {
    const navigate = useNavigate();
    // In a real app, you'd get the role and user data from context
    const role = 'student';

    const [isDarkMode, setIsDarkMode] = useState(() => document.body.classList.contains('dark-mode'));

    const toggleTheme = () => {
        document.body.classList.toggle('dark-mode');
        setIsDarkMode(!isDarkMode);
    };

    const handleLogout = () => {
        // Logic to clear session/local storage if needed
        // localStorage.clear();
        navigate('/');
    };

    const user = {
        name: "Alisha Khan",
        id: "STU-2024-001",
        email: "alisha.khan@attendify.edu",
        department: "Computer Science & Engineering",
        avatar: "https://ui-avatars.com/api/?name=Alisha+Khan&background=fff&color=3B753D&size=128"
    };

    return (
        <div className="profile-page">
            <div className="profile-header-card">
                <div className="profile-avatar-large">
                    <img src={user.avatar} alt="Profile" />
                </div>
                <h2 className="profile-name">{user.name}</h2>
                <span className="profile-role-badge">{role}</span>
            </div>

            <div className="profile-grid">
                <div className="glass-card">
                    <h3>
                        <i className='bx bx-id-card'></i>
                        Personal Information
                    </h3>
                    <div className="info-list">
                        <div className="info-group">
                            <span className="info-label">Full Name</span>
                            <span className="info-value">{user.name}</span>
                        </div>
                        <div className="info-group">
                            <span className="info-label">User ID / Roll Number</span>
                            <span className="info-value">{user.id}</span>
                        </div>
                        <div className="info-group">
                            <span className="info-label">Email</span>
                            <span className="info-value">{user.email}</span>
                        </div>
                        <div className="info-group">
                            <span className="info-label">Department</span>
                            <span className="info-value">{user.department}</span>
                        </div>
                    </div>
                </div>

                <div className="glass-card">
                    <h3>
                        <i className='bx bx-cog'></i>
                        Settings
                    </h3>
                    <div className="settings-list">
                        <button className="setting-btn">
                            <span>Change Password</span>
                            <i className='bx bx-chevron-right'></i>
                        </button>
                        <button className="setting-btn">
                            <span>Notification Preferences</span>
                            <i className='bx bx-chevron-right'></i>
                        </button>
                        <button className="setting-btn" onClick={toggleTheme}>
                            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                            <i className={`bx ${isDarkMode ? 'bx-sun' : 'bx-moon'}`}></i>
                        </button>
                        <button className="setting-btn">
                            <span>Privacy Settings</span>
                            <i className='bx bx-chevron-right'></i>
                        </button>
                        <button className="setting-btn danger" onClick={handleLogout}>
                            <span>Log Out</span>
                            <i className='bx bx-log-out'></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
