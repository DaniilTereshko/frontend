import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Alert from './Alert';

function ConfirmModal({ open, onConfirm, onCancel, text }) {
  if (!open) return null;
  return (
    <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.18)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'#fff',borderRadius:14,padding:'36px 32px',boxShadow:'0 4px 32px rgba(255,152,0,0.13)',minWidth:340,maxWidth:'90vw',textAlign:'center'}}>
        <div style={{fontWeight:800,fontSize:'1.25rem',color:'#ff9800',marginBottom:18}}>Начать попытку?</div>
        <div style={{fontSize:'1.08rem',color:'#444',marginBottom:28}}>{text || 'Вы действительно хотите начать попытку прохождения теста? После начала попытки она будет засчитана.'}</div>
        <div style={{display:'flex',gap:18,justifyContent:'center'}}>
          <button onClick={onCancel} style={{fontWeight:700,fontSize:'1.08rem',padding:'12px 32px',borderRadius:8,background:'#eee',color:'#ff9800',border:'none',boxShadow:'0 2px 8px rgba(255,152,0,0.04)',cursor:'pointer'}}>Отмена</button>
          <button onClick={onConfirm} style={{fontWeight:700,fontSize:'1.08rem',padding:'12px 32px',borderRadius:8,background:'linear-gradient(90deg, #ff9800 60%, #ffa726 100%)',color:'#fff',border:'none',boxShadow:'0 2px 8px rgba(255,152,0,0.10)',cursor:'pointer'}}>Начать</button>
        </div>
      </div>
    </div>
  );
}

function TestTile({ test, canEdit, onEdit, onDelete }) {
  const navigate = useNavigate();
  const [alert, setAlert] = useState(null);
  const [alertType, setAlertType] = useState('success');
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleStartAttempt = async () => {
    setShowConfirm(true);
  };

  const confirmStart = async () => {
    setShowConfirm(false);
    navigate(`/tests/${test.id}/start`);
  };

  return (
    <div style={{background:'#fffdfa',borderRadius:12,boxShadow:'0 2px 8px rgba(255,152,0,0.07)',padding:24,display:'flex',flexDirection:'column',gap:8,alignItems:'flex-start',minWidth:220,maxWidth:320,position:'relative'}}>
      {alert && <Alert message={alert} type={alertType} onClose={()=>setAlert(null)} side="left" />}
      <div style={{fontWeight:700,fontSize:'1.13rem',color:'#ff9800',marginBottom:4}}>{test.title}</div>
      <div style={{color:'#444',fontSize:'1.01rem',marginBottom:6}}>{test.description}</div>
      <div style={{fontSize:'0.97rem',color:'#888'}}>Проходной балл: {typeof test.passingScore === 'number' ? test.passingScore : 'не задан'}</div>
      <div style={{fontSize:'0.97rem',color:'#888'}}>Ограничение: {test.timeLimitMinutes ? test.timeLimitMinutes + ' мин.' : 'нет'}</div>
      {canEdit && (
        <div style={{display:'flex',gap:10,marginTop:10}}>
          <button className="btn" style={{fontWeight:700,fontSize:'1.01rem',padding:'7px 18px',borderRadius:8,background:'#fff3e0',color:'#ff9800',border:'none',boxShadow:'0 2px 8px rgba(255,152,0,0.04)',letterSpacing:'0.5px',cursor:'pointer'}} onClick={onEdit}>Редактировать</button>
          <button className="btn" style={{fontWeight:700,fontSize:'1.01rem',padding:'7px 18px',borderRadius:8,background:'#e3fcec',color:'#43a047',border:'none',boxShadow:'0 2px 8px rgba(67,160,71,0.08)',letterSpacing:'0.5px',cursor:'pointer'}} onClick={()=>navigate(`/tests/${test.id}/questions`)}>Перейти к вопросам</button>
        </div>
      )}
      {!canEdit && (
        <>
          <button className="btn" style={{marginTop:14,fontWeight:700,fontSize:'1.01rem',padding:'10px 24px',borderRadius:8,background:'linear-gradient(90deg, #ff9800 60%, #ffa726 100%)',color:'#fff',border:'none',boxShadow:'0 2px 8px rgba(255,152,0,0.10)',letterSpacing:'0.5px',cursor:'pointer',transition:'background 0.2s, box-shadow 0.2s'}} onClick={handleStartAttempt} disabled={loading}>{loading ? 'Запуск...' : 'Начать попытку'}</button>
          <ConfirmModal open={showConfirm} onConfirm={confirmStart} onCancel={()=>setShowConfirm(false)} />
        </>
      )}
    </div>
  );
}

export default TestTile;
