import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from './api';
import './index.css';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
        } catch (err) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) return <div className="flex justify-center items-center" style={{ height: '100vh' }}>Loading...</div>;

  return (
    <BrowserRouter>
      <div className="app-container">
        {user && (
          <nav className="navbar">
            <div className="navbar-brand">ISPS Portal</div>
            <div className="nav-links flex items-center gap-4">
              <span>Welcome, {user.name} ({user.role})</span>
              <button className="btn btn-secondary" onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/login';
              }}>Logout</button>
            </div>
          </nav>
        )}
        
        <main className="main-content">
          <Routes>
            <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
            <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
