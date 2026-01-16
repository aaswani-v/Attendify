import { useState, useEffect } from 'react';
import './ProfilePage.css';

const ProfilePage = () => {
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved === 'true';
    });

    useEffect(() => {
        document.body.classList.toggle('dark-mode', darkMode);
        localStorage.setItem('darkMode', String(darkMode));
    }, [darkMode]);

    return (
        <div className="profile-page">
            <div className="pp-header">
                <h2>Profile Settings</h2>
                <p>Manage your account and preferences</p>
            </div>

            {/* Profile Card */}
            <div className="profile-card">
                <div className="avatar-section">
                    <img
                        src="https://ui-avatars.com/api/?name=Shaheen+Ahmad&background=22c55e&color=fff&size=120"
                        alt="Profile"
                        className="profile-avatar"
                    />
                    <button className="btn-change-avatar">
                        <i className='bx bx-camera'></i>
                    </button>
                </div>
                <div className="profile-info">
                    <h3>Shaheen Uddin Ahmad</h3>
                    <span className="role-badge">Faculty</span>
                    <p className="email"><i className='bx bx-envelope'></i> shaheen@attendify.com</p>
                    <p className="phone"><i className='bx bx-phone'></i> +91 9876543210</p>
                </div>
            </div>

            {/* Settings Sections */}
            <div className="settings-section">
                <h4>Appearance</h4>
                <div className="setting-item">
                    <div className="setting-info">
                        <i className='bx bx-moon'></i>
                        <div>
                            <span className="setting-title">Dark Mode</span>
                            <span className="setting-desc">Switch between light and dark theme</span>
                        </div>
                    </div>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={darkMode}
                            onChange={() => setDarkMode(!darkMode)}
                        />
                        <span className="slider"></span>
                    </label>
                </div>
            </div>

            <div className="settings-section">
                <h4>Account</h4>
                <div className="setting-item clickable">
                    <div className="setting-info">
                        <i className='bx bx-user'></i>
                        <div>
                            <span className="setting-title">Edit Profile</span>
                            <span className="setting-desc">Update your personal information</span>
                        </div>
                    </div>
                    <i className='bx bx-chevron-right'></i>
                </div>
                <div className="setting-item clickable">
                    <div className="setting-info">
                        <i className='bx bx-lock-alt'></i>
                        <div>
                            <span className="setting-title">Change Password</span>
                            <span className="setting-desc">Update your security credentials</span>
                        </div>
                    </div>
                    <i className='bx bx-chevron-right'></i>
                </div>
                <div className="setting-item clickable">
                    <div className="setting-info">
                        <i className='bx bx-bell'></i>
                        <div>
                            <span className="setting-title">Notifications</span>
                            <span className="setting-desc">Manage notification preferences</span>
                        </div>
                    </div>
                    <i className='bx bx-chevron-right'></i>
                </div>
            </div>

            <div className="settings-section">
                <h4>Support</h4>
                <div className="setting-item clickable">
                    <div className="setting-info">
                        <i className='bx bx-help-circle'></i>
                        <div>
                            <span className="setting-title">Help & Support</span>
                            <span className="setting-desc">Get help with using Attendify</span>
                        </div>
                    </div>
                    <i className='bx bx-chevron-right'></i>
                </div>
                <div className="setting-item clickable">
                    <div className="setting-info">
                        <i className='bx bx-info-circle'></i>
                        <div>
                            <span className="setting-title">About</span>
                            <span className="setting-desc">Version 1.0.0</span>
                        </div>
                    </div>
                    <i className='bx bx-chevron-right'></i>
                </div>
            </div>

            <button className="btn-logout">
                <i className='bx bx-log-out'></i> Logout
            </button>
        </div>
    );
};

export default ProfilePage;
