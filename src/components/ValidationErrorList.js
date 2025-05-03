import React from 'react';

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

export default ValidationErrorList; 