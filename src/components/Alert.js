import React, { useEffect } from 'react';

function Alert({ message, type = 'error', onClose, duration = 4000, side = 'right' }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose && onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 32,
      [side]: 32,
      zIndex: 1000,
      background: type === 'error' ? '#ffebee' : '#e3fcec',
      color: type === 'error' ? '#c62828' : '#256029',
      border: `1.5px solid ${type === 'error' ? '#ff5252' : '#43a047'}`,
      borderRadius: 10,
      padding: '18px 32px',
      fontSize: '1.08rem',
      fontWeight: 500,
      boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
      minWidth: 260,
      maxWidth: 400,
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }}>
      <span style={{fontSize: 22}}>{type === 'error' ? '⛔' : '✅'}</span>
      <span>{message}</span>
      <button onClick={onClose} style={{marginLeft: 'auto', background: 'none', border: 'none', color: '#888', fontSize: 22, cursor: 'pointer'}}>×</button>
    </div>
  );
}

export default Alert; 