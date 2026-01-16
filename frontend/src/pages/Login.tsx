import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  // Determine role based on passed state or path, defaulting to Student
  const role = location.state?.role || 'Student';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Logging in as ${role}:`, { username, password });
    // TODO: Connect to backend
    navigate('/dashboard'); // Mock redirect
  };

  return (
    <div className="login-container">
      <div className="wrapper">
        <div className="form-box login">
          <h2 className="animation" style={{ '--i': 0 } as React.CSSProperties}>
            {role} Login
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="input-box animation" style={{ '--i': 1 } as React.CSSProperties}>
              <input 
                type="text" 
                required 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <label>Username</label>
              <i className='bx bxs-user icon'></i>
            </div>
            <div className="input-box animation" style={{ '--i': 2 } as React.CSSProperties}>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label>Password</label>
              <i className='bx bxs-lock-alt icon'></i>
            </div>
            <button type="submit" className="btn animation" style={{ '--i': 3 } as React.CSSProperties}>
              Login
            </button>
            <div className="logreg-link animation" style={{ '--i': 4 } as React.CSSProperties}>
              <p>Don't have an account? <a href="#" className="register-link">Sign Up</a></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
