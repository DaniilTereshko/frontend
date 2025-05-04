import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import CoursePage from './pages/CoursePage';
import QuestionPage from './pages/QuestionPage';
import TestStartPage from './pages/TestStartPage';
import TestResultsPage from './pages/TestResultsPage';
import { getUserFromToken, removeToken } from './utils/auth';

function AppHeader() {
  const [user, setUser] = useState(getUserFromToken());
  const navigate = useNavigate();

  useEffect(() => {
    const updateUser = () => setUser(getUserFromToken());
    window.addEventListener('storage', updateUser);
    window.addEventListener('tokenChanged', updateUser);
    return () => {
      window.removeEventListener('storage', updateUser);
      window.removeEventListener('tokenChanged', updateUser);
    };
  }, []);

  const notifyTokenChange = () => {
    window.dispatchEvent(new Event('tokenChanged'));
  };

  const handleLogout = () => {
    removeToken();
    notifyTokenChange();
    navigate('/login');
  };
  return (
    <header className="app-header" style={{
      padding: '0',
      background: 'linear-gradient(90deg, #ff9800 0%, #ffa726 100%)',
      boxShadow: '0 2px 8px rgba(255,152,0,0.10)',
      borderRadius: '0 0 16px 16px',
      marginBottom: 18,
      position: 'relative',
      zIndex: 10,
      minHeight: 56,
    }}>
      <div style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 56,
        padding: '0 28px',
      }}>
        <div style={{display:'flex',alignItems:'center',gap:12,cursor:'pointer', minWidth: 0}} onClick={()=>navigate('/')}> 
          <span style={{fontSize: '1.5rem',marginRight:6}}>🎓</span>
          <span style={{fontSize: '1.18rem', fontWeight: 800, letterSpacing: '0.5px', color: '#fff', fontFamily: 'Inter, Arial, sans-serif', whiteSpace: 'nowrap'}}>Modsen LMS</span>
        </div>
        {user && (
          <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', background: '#fff3e0', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, color: '#ff9800', fontWeight: 800, boxShadow: '0 1px 4px rgba(255,152,0,0.10)', border: '1.5px solid #fff',
            }}>
              {user.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{lineHeight: 1.1, minWidth: 120}}>
              <div style={{fontWeight: 700, fontSize: '1.01rem', color: '#fff', letterSpacing: '0.3px'}}>{user.username}</div>
              <div style={{fontSize: '0.93rem', color: '#ffe0b2', fontWeight: 500, opacity:0.93}}>{user.email}</div>
              <div style={{fontSize: '0.91rem', color: '#fff', opacity: 0.85}}>{user.role}</div>
            </div>
            <button
              style={{
                fontWeight: 700,
                fontSize: '1rem',
                padding: '6px 12px',
                borderRadius: 8,
                background: '#fff3e0',
                color: '#ff9800',
                border: 'none',
                boxShadow: '0 1px 4px rgba(255,152,0,0.08)',
                letterSpacing: '0.5px',
                cursor: 'pointer',
                transition: 'background 0.2s, box-shadow 0.2s',
                outline: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginLeft: 10
              }}
              onClick={handleLogout}
              title="Выйти"
            >
              <span style={{fontSize:'1.1rem'}}>🚪</span> Выйти
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

function App() {
  return (
    <>
      <AppHeader />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/courses/:id" element={<CoursePage />} />
        <Route path="/tests/:testId/questions" element={<QuestionPage />} />
        <Route path="/tests/:id/start" element={<TestStartPage />} />
        <Route path="/tests/:id/results" element={<TestResultsPage />} />
        <Route path="/" element={<HomePage />} />
      </Routes>
    </>
  );
}

export default App; 