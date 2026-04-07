import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Login({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isLogin) {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        navigate('/dashboard');
      } else {
        const res = await api.post('/auth/register', { name, email, password, role });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box glass-panel animate-fade-in">
        <h2 className="text-center mb-4">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        
        {error && <div className="badge pending mb-4" style={{ display: 'block', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <label>Full Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" />
              
              <label>Role</label>
              <select value={role} onChange={e => setRole(e.target.value)}>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="industry">Industry Mentor</option>
                <option value="admin">Administrator</option>
              </select>
            </>
          )}

          <label>Email ID</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="user@example.com" />
          
          <label>Password</label>
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            {isLogin ? 'Sign In' : 'Register'}
          </button>
        </form>

        <p className="text-center mt-4 text-muted">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span style={{ cursor: 'pointer', color: 'var(--primary-color)' }} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Register Here' : 'Log In Here'}
          </span>
        </p>
      </div>
    </div>
  );
}
