import React, { useState } from 'react';
import api from '../api/axios';
import { setTokens } from '../utils/auth';
import { useNavigate, Link } from 'react-router-dom';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.post('/api/v1/auth/login', { username, password });
      setTokens(res.data.access, res.data.refresh);
      window.dispatchEvent(new Event('tokenChanged'));
      navigate('/');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Ошибка входа. Проверьте данные.');
      }
    }
  };

  return (
    <div className="container">
      <h2 style={{textAlign: 'center', marginBottom: 24}}>Вход в систему</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Имя пользователя</label>
          <input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} required placeholder="Введите имя пользователя" />
        </div>
        <div>
          <label htmlFor="password">Пароль</label>
          <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Введите пароль" />
        </div>
        <button type="submit">Войти</button>
        {error && <div className="error-message">{error}</div>}
      </form>
      <div style={{textAlign: 'center'}}>
        <Link className="link" to="/register">Нет аккаунта? Зарегистрироваться</Link>
      </div>
    </div>
  );
}

export default LoginPage; 