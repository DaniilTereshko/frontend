import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

function ValidationErrorList({ fieldErrors }) {
  if (!fieldErrors || !fieldErrors.length) return null;
  return (
    <div style={{
      background: '#fff7e6',
      border: '1.5px solid #ff9800',
      borderRadius: 8,
      padding: '14px 18px',
      marginTop: 16,
      marginBottom: 0,
      color: '#d84315',
      fontSize: '1.05rem',
      boxShadow: '0 2px 8px rgba(255,152,0,0.07)'
    }}>
      <div style={{fontWeight: 600, marginBottom: 8, color: '#ff9800'}}>Проверьте поля формы:</div>
      <ul style={{listStyle:'none',paddingLeft:0,margin:0}}>
        {fieldErrors.map((err, idx) => (
          <li key={idx} style={{marginBottom:6,display:'flex',alignItems:'center'}}>
            <span style={{color:'#ff9800',fontWeight:600,marginRight:6}}>{err.field}:</span>
            <span>{err.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState([]);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors([]);
    setSuccess(false);
    try {
      await api.post('/api/v1/auth/register', { username, email, password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      const data = err.response && err.response.data;
      if (data && data.errorCode === 'VALIDATION_ERROR' && Array.isArray(data.fieldErrors)) {
        setFieldErrors(data.fieldErrors);
      } else if (data && data.message) {
        setError(data.message);
      } else {
        setError('Ошибка регистрации. Проверьте данные.');
      }
    }
  };

  return (
    <div className="container">
      <h2 style={{textAlign: 'center', marginBottom: 24}}>Регистрация</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Имя пользователя</label>
          <input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} required placeholder="Введите имя пользователя" />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Введите email" />
        </div>
        <div>
          <label htmlFor="password">Пароль</label>
          <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Придумайте пароль" />
        </div>
        <button type="submit">Зарегистрироваться</button>
        {error && <div className="error-message">{error}</div>}
        <ValidationErrorList fieldErrors={fieldErrors} />
        {success && <div style={{color:'#388e3c',marginTop:8}}>Успешно! Перенаправление...</div>}
      </form>
      <div style={{textAlign: 'center'}}>
        <Link className="link" to="/login">Уже есть аккаунт? Войти</Link>
      </div>
    </div>
  );
}

export default RegisterPage; 