import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { getUserFromToken, removeToken } from './utils/auth';

function AppHeader() {
  const [user, setUser] = useState(getUserFromToken());
  const navigate = useNavigate();

  useEffect(() => {
    const updateUser = () => setUser(getUserFromToken());
    window.addEventListener('storage', updateUser);
    // Для локального обновления (логин/логаут в этом окне)
    window.addEventListener('tokenChanged', updateUser);
    return () => {
      window.removeEventListener('storage', updateUser);
      window.removeEventListener('tokenChanged', updateUser);
    };
  }, []);

  // Вызов события для обновления в этом окне
  const notifyTokenChange = () => {
    window.dispatchEvent(new Event('tokenChanged'));
  };

  const handleLogout = () => {
    removeToken();
    notifyTokenChange();
    navigate('/login');
  };
  return (
    <header className="app-header" style={{padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
      <div style={{fontSize: '2.2rem', fontWeight: 700, letterSpacing: '1px', color: '#fff', fontFamily: 'Inter, Arial, sans-serif'}}>
        Modsen LMS
      </div>
      {user && (
        <div style={{display: 'flex', alignItems: 'center', gap: 28, background: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: '10px 24px 10px 18px', boxShadow: '0 2px 8px rgba(255,152,0,0.10)'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%', background: '#fff3e0', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, color: '#ff9800', fontWeight: 700, boxShadow: '0 1px 4px rgba(255,152,0,0.10)'}}>
              {user.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{lineHeight: 1.25}}>
              <div style={{fontWeight: 700, fontSize: '1.13rem', color: '#fff'}}>{user.username}</div>
              <div style={{fontSize: '0.98rem', color: '#ffe0b2', fontWeight: 500}}>
                <span style={{color:'#fff', opacity:0.7, fontWeight:400}}>Email:</span> {user.email}
              </div>
              <div style={{fontSize: '0.97rem', color: '#fff', opacity: 0.85}}>
                <span style={{color:'#fff', opacity:0.7, fontWeight:400}}>Роль:</span> {user.role}
              </div>
            </div>
          </div>
          <button style={{marginLeft: 18}} onClick={handleLogout}>Выйти</button>
        </div>
      )}
    </header>
  );
}

function HomePage() {
  return <div className="container"></div>;
}

function App() {
  return (
    <>
      <AppHeader />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<HomePage />} />
      </Routes>
    </>
  );
}

export default App; 