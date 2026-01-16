import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const AuthPage = () => {
    // True = "Right Panel Active" = Faculty Login
    // False = Student Login
    const [isFaculty, setIsFaculty] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false); // Admin Toggle

    // Theme state
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    // Form States
    const [studentUser, setStudentUser] = useState('');
    const [studentPass, setStudentPass] = useState('');
    const [facultyUser, setFacultyUser] = useState('');
    const [facultyPass, setFacultyPass] = useState('');
    const [adminUser, setAdminUser] = useState('');
    const [adminPass, setAdminPass] = useState('');

    const navigate = useNavigate();

    // Effect to apply theme to body/root
    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const handleStudentLogin = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Student Login:', { studentUser, studentPass });
        localStorage.setItem('userRole', 'student');
        navigate('/dashboard');
    };

    const handleFacultyLogin = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Faculty Login:', { facultyUser, facultyPass });
        localStorage.setItem('userRole', 'faculty');
        navigate('/dashboard');
    };

    const handleAdminLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would implement actual Admin Authentication
        console.log('Admin Login:', { adminUser, adminPass });
        localStorage.setItem('userRole', 'admin');
        navigate('/dashboard'); // Proceed to dashboard (or special admin route)
    };

    if (isAdmin) {
        return (
            <div className="container" id="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                 <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme">
                    {theme === 'light' ? <i className='bx bxs-moon'></i> : <i className='bx bxs-sun'></i>}
                </button>
                <div className="form-container" style={{ position: 'relative', width: '100%', height: '100%', zIndex: 10 }}>
                    <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <h1 style={{ marginBottom: '20px' }}>Admin Portal</h1>
                        <input
                            type="text"
                            placeholder="Admin Username"
                            value={adminUser}
                            onChange={(e) => setAdminUser(e.target.value)}
                            style={{ margin: '10px 0', padding: '12px 15px', width: '100%' }}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={adminPass}
                            onChange={(e) => setAdminPass(e.target.value)}
                            style={{ margin: '10px 0', padding: '12px 15px', width: '100%' }}
                        />
                        <button style={{ marginTop: '20px' }}>Login to Dashboard</button>
                        <button 
                            type="button" 
                            onClick={() => setIsAdmin(false)}
                            style={{ marginTop: '10px', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--text-secondary)' }}
                        >
                            Back to Standard Login
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        // Note: 'right-panel-active' is the class from the original template logic often used for this slider
        <div className={`container ${isFaculty ? 'right-panel-active' : ''}`} id="container">

            {/* Theme Toggle Button */}
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme">
                {theme === 'light' ? (
                    <i className='bx bxs-moon'></i>
                ) : (
                    <i className='bx bxs-sun'></i>
                )}
            </button>

            {/* Admin Toggle (Added) */}
            <button 
                onClick={() => setIsAdmin(true)}
                style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    zIndex: 100,
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '12px'
                }}
            >
                <i className='bx bxs-lock-alt'></i> Admin Login
            </button>

            {/* Faculty Form Container (Sign Up position) */}
            <div className="form-container sign-up-container">
                <form onSubmit={handleFacultyLogin}>
                    <h1>Faculty Login</h1>
                    <div className="social-container">
                        <a href="#" className="social"><i className='bx bxl-google'></i></a>
                        <a href="#" className="social"><i className='bx bxl-linkedin'></i></a>
                    </div>
                    <span>or use your email for registration</span>
                    <input
                        type="text"
                        placeholder="Faculty ID / Username"
                        value={facultyUser}
                        onChange={(e) => setFacultyUser(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={facultyPass}
                        onChange={(e) => setFacultyPass(e.target.value)}
                    />
                    <a href="#">Forgot your password?</a>
                    <button>Sign In</button>
                </form>
            </div>

            {/* Student Form Container (Sign In position) */}
            <div className="form-container sign-in-container">
                <form onSubmit={handleStudentLogin}>
                    <h1>Student Login</h1>
                    <div className="social-container">
                        <a href="#" className="social"><i className='bx bxl-google'></i></a>
                        <a href="#" className="social"><i className='bx bxl-linkedin'></i></a>
                    </div>
                    <span>or use your account</span>
                    <input
                        type="text"
                        placeholder="Student ID / Username"
                        value={studentUser}
                        onChange={(e) => setStudentUser(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={studentPass}
                        onChange={(e) => setStudentPass(e.target.value)}
                    />
                    <a href="#">Forgot your password?</a>
                    <button>Sign In</button>
                </form>
            </div>

            {/* Overlay Container */}
            <div className="overlay-container">
                <div className="overlay">
                    {/* Left Overlay Panel (Visible when Faculty Active) */}
                    <div className="overlay-panel overlay-left">
                        <h1>Welcome Student!</h1>
                        <p>To keep connected with us please login with your personal info</p>
                        <button
                            className="ghost"
                            id="signIn"
                            onClick={() => setIsFaculty(false)}
                        >
                            Sign In (Student)
                        </button>
                    </div>

                    {/* Right Overlay Panel (Visible when Student Active) */}
                    <div className="overlay-panel overlay-right">
                        <h1>Welcome Faculty!</h1>
                        <p>Enter your personal details and start journey with us</p>
                        <button
                            className="ghost"
                            id="signUp"
                            onClick={() => setIsFaculty(true)}
                        >
                            Sign In (Faculty)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
