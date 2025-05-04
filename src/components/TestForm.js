import React, { useState } from 'react';
import ValidationErrorList from './ValidationErrorList';

function TestForm({ initial, onSubmit, onCancel, loading, errors, title }) {
  const [testTitle, setTestTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [passingScore, setPassingScore] = useState(
    typeof initial?.passingScore === 'number' ? initial.passingScore : ''
  );
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(
    typeof initial?.timeLimitMinutes === 'number' ? initial.timeLimitMinutes : ''
  );
  const [maxAttempts, setMaxAttempts] = useState(
    typeof initial?.maxAttempts === 'number' ? initial.maxAttempts : ''
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      title: testTitle,
      description,
      passingScore: passingScore === '' ? null : Number(passingScore),
      timeLimitMinutes: timeLimitMinutes === '' ? null : Number(timeLimitMinutes),
      maxAttempts: maxAttempts === '' ? null : Number(maxAttempts),
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{marginBottom: 0, background: 'none', borderRadius: 0, boxShadow: 'none', padding: 0, fontFamily: 'Inter, Arial, sans-serif', display:'flex', flexDirection:'column', alignItems:'center'}}>
      <h2 style={{marginTop:0, marginBottom: 24, color: '#ff9800', fontWeight: 800, fontSize: '2rem', letterSpacing: '0.5px'}}>{title}</h2>
      <div style={{width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 18}}>
        <div>
          <label style={{fontWeight:700, fontSize:'1.13rem', marginBottom: 6, display:'block'}}>Название теста</label>
          <input style={{width:'100%', fontWeight:600, fontSize:'1.13rem', borderWidth:2, borderColor:'#ff9800', borderRadius:8, padding:'12px 14px', fontFamily:'Inter, Arial, sans-serif', boxSizing:'border-box'}} value={testTitle} onChange={e => setTestTitle(e.target.value)} required maxLength={100} placeholder="Введите название теста" />
        </div>
        <div>
          <label style={{fontWeight:700, fontSize:'1.13rem', marginBottom: 6, display:'block'}}>Описание теста</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} required maxLength={500} placeholder="Введите описание теста" style={{width:'100%', minHeight: 80, resize: 'vertical', fontSize:'1.08rem', fontWeight:500, border:'2px solid #ff9800', borderRadius:8, padding:'12px 14px', background:'#fffdfa', outline:'none', boxShadow:'0 1px 4px rgba(255,152,0,0.04)', transition:'border 0.2s, box-shadow 0.2s', fontFamily:'Inter, Arial, sans-serif', boxSizing:'border-box'}} />
        </div>
        <div>
          <label style={{fontWeight:700, fontSize:'1.13rem', marginBottom: 6, display:'block'}}>Проходной балл</label>
          <input type="number" min="0" max="1000" value={passingScore} onChange={e => setPassingScore(e.target.value)} placeholder="Проходной балл" style={{width:'100%', fontWeight:600, fontSize:'1.13rem', borderWidth:2, borderColor:'#ff9800', borderRadius:8, padding:'12px 14px', fontFamily:'Inter, Arial, sans-serif', boxSizing:'border-box'}} />
        </div>
        <div>
          <label style={{fontWeight:700, fontSize:'1.13rem', marginBottom: 6, display:'block'}}>Ограничение по времени (минуты)</label>
          <input type="number" min="0" max="1000" value={timeLimitMinutes} onChange={e => setTimeLimitMinutes(e.target.value)} placeholder="Ограничение в минутах" style={{width:'100%', fontWeight:600, fontSize:'1.13rem', borderWidth:2, borderColor:'#ff9800', borderRadius:8, padding:'12px 14px', fontFamily:'Inter, Arial, sans-serif', boxSizing:'border-box'}} />
        </div>
        <div>
          <label style={{fontWeight:700, fontSize:'1.13rem', marginBottom: 6, display:'block'}}>Максимум попыток</label>
          <input type="number" min="0" max="1000" value={maxAttempts} onChange={e => setMaxAttempts(e.target.value)} placeholder="Не ограничено" style={{width:'100%', fontWeight:600, fontSize:'1.13rem', borderWidth:2, borderColor:'#ff9800', borderRadius:8, padding:'12px 14px', fontFamily:'Inter, Arial, sans-serif', boxSizing:'border-box'}} />
        </div>
        <div style={{display:'flex',gap:16,marginTop:8, width:'100%', justifyContent:'center'}}>
          <button type="submit" disabled={loading} style={{flex:1, fontWeight:700, fontSize:'1.13rem', padding:'12px 0', borderRadius:8, background:'linear-gradient(90deg, #ff9800 60%, #ffa726 100%)', color:'#fff', border:'none', boxShadow:'0 2px 8px rgba(255,152,0,0.10)', letterSpacing:'0.5px', cursor:'pointer', transition:'background 0.2s, box-shadow 0.2s'}}>Сохранить</button>
          <button type="button" className="btn" style={{flex:1, background:'#eee',color:'#ff9800',fontWeight:700, fontSize:'1.13rem', borderRadius:8, padding:'12px 0', border:'none', boxShadow:'0 2px 8px rgba(255,152,0,0.04)', letterSpacing:'0.5px', cursor:'pointer'}} onClick={onCancel}>Отмена</button>
        </div>
        <div>
          <ValidationErrorList fieldErrors={errors} />
        </div>
      </div>
    </form>
  );
}

export default TestForm;
