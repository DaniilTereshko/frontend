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
      boxShadow: '0 4px 24px rgba(255,152,0,0.13)',
      borderRadius: '0 0 24px 24px',
      marginBottom: 32,
      position: 'relative',
      zIndex: 10
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '18px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 32
      }}>
        <div style={{display:'flex',alignItems:'center',gap:18,cursor:'pointer'}} onClick={()=>navigate('/')}> 
          <span style={{fontSize: '2.3rem',marginRight:8}}>🎓</span>
          <span style={{fontSize: '2.1rem', fontWeight: 800, letterSpacing: '1px', color: '#fff', fontFamily: 'Inter, Arial, sans-serif', textShadow:'0 2px 8px rgba(255,152,0,0.10)'}}>Modsen LMS</span>
        </div>
        {user && (
          <div style={{display: 'flex', alignItems: 'center', gap: 22, background: 'rgba(255,255,255,0.13)', borderRadius: 16, padding: '10px 28px 10px 18px', boxShadow: '0 2px 12px rgba(255,152,0,0.13)', transition:'background 0.2s'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#fff3e0 60%,#ffe0b2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, color: '#ff9800', fontWeight: 800, boxShadow: '0 2px 8px rgba(255,152,0,0.10)', border: '2.5px solid #fff', transition:'box-shadow 0.2s'
              }}>
                {user.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div style={{lineHeight: 1.25, minWidth: 120}}>
                <div style={{fontWeight: 800, fontSize: '1.18rem', color: '#fff', letterSpacing: '0.5px'}}>{user.username}</div>
                <div style={{fontSize: '0.99rem', color: '#ffe0b2', fontWeight: 500, opacity:0.93}}>
                  <span style={{color:'#fff', opacity:0.7, fontWeight:400}}>Email:</span> {user.email}
                </div>
                <div style={{fontSize: '0.97rem', color: '#fff', opacity: 0.85}}>
                  <span style={{color:'#fff', opacity:0.7, fontWeight:400}}>Роль:</span> {user.role}
                </div>
              </div>
            </div>
            <button
              style={{
                marginLeft: 18,
                fontWeight: 700,
                fontSize: '1.13rem',
                padding: '10px 28px',
                borderRadius: 10,
                background: 'linear-gradient(90deg, #fff3e0 60%, #ffe0b2 100%)',
                color: '#ff9800',
                border: 'none',
                boxShadow: '0 2px 8px rgba(255,152,0,0.10)',
                letterSpacing: '0.5px',
                cursor: 'pointer',
                transition: 'background 0.2s, box-shadow 0.2s',
                outline: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
              onClick={handleLogout}
              onMouseOver={e=>e.currentTarget.style.background='linear-gradient(90deg,#ffe0b2 60%,#fff3e0 100%)'}
              onMouseOut={e=>e.currentTarget.style.background='linear-gradient(90deg, #fff3e0 60%, #ffe0b2 100%)'}
            >
              <span style={{fontSize:'1.25rem'}}>🚪</span> Выйти
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