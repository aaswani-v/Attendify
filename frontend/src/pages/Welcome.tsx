import { useNavigate } from 'react-router-dom';
import './Login.css'; // Reusing styles for consistency

const Welcome = () => {
    const navigate = useNavigate();

    const handleRoleSelect = (role: 'Student' | 'Faculty') => {
        navigate('/login', { state: { role } });
    };

    return (
        <div className="login-container">
            <div className="wrapper" style={{ height: '350px' }}>
                <div className="form-box">
                    <h2 className="animation" style={{ '--i': 0 } as React.CSSProperties}>
                        Attendify
                    </h2>
                    <p className="animation" style={{ '--i': 1, textAlign: 'center', margin: '10px 0', color: '#fff' } as React.CSSProperties}>
                        Welcome! Please select your role.
                    </p>

                    <div style={{ marginTop: '40px' }}>
                        <button
                            className="btn animation"
                            style={{ '--i': 2, marginBottom: '20px' } as React.CSSProperties}
                            onClick={() => handleRoleSelect('Student')}
                        >
                            Student Login
                        </button>
                        <button
                            className="btn animation"
                            style={{ '--i': 3 } as React.CSSProperties}
                            onClick={() => handleRoleSelect('Faculty')}
                        >
                            Faculty Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Welcome;
