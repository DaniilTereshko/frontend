import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Alert from '../components/Alert';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString();
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m} мин. ${s} сек.`;
}

function TestResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState({ content: [], totalPages: 1, currentPage: 0 });
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [alertType, setAlertType] = useState('error');

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/v1/tests/${id}/results`, { params: { page, size: 8 } });
        setResults(res.data || { content: [], totalPages: 1, currentPage: 0 });
      } catch (err) {
        setAlert(err.response?.data?.message || 'Ошибка загрузки результатов');
        setAlertType('error');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [id, page]);

  return (
    <div className="container" style={{maxWidth: 700, margin: '60px auto 0 auto', padding: '32px 0'}}>
      <h2 style={{fontWeight:800,fontSize:'2.1rem',color:'#ff9800',marginBottom:32,letterSpacing:'0.5px',textAlign:'center'}}>История прохождений теста</h2>
      {alert && <Alert message={alert} type={alertType} onClose={()=>setAlert(null)} side="left" />}
      {loading ? (
        <div style={{color:'#ff9800',fontWeight:700,fontSize:'1.15rem',textAlign:'center'}}>Загрузка...</div>
      ) : results.content.length === 0 ? (
        <div style={{color:'#ff9800',fontWeight:700,fontSize:'1.15rem',textAlign:'center'}}>Нет результатов для этого теста</div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:18}}>
          {results.content.map(result => (
            <div key={result.id} style={{background:'#fffdfa',borderRadius:12,boxShadow:'0 2px 8px rgba(255,152,0,0.07)',padding:20,display:'flex',flexDirection:'row',alignItems:'center',gap:24,justifyContent:'space-between'}}>
              <div>
                <div style={{fontWeight:700,fontSize:'1.13rem',color:'#ff9800'}}>Дата: {formatDate(result.completedAt)}</div>
                <div style={{fontSize:'1.01rem',color:'#444'}}>Баллы: <span style={{fontWeight:700}}>{result.score}</span></div>
                <div style={{fontSize:'0.97rem',color:'#888'}}>Время: {formatTime(result.timeSpentSeconds)}</div>
              </div>
              {/* Можно добавить больше информации, если есть */}
            </div>
          ))}
        </div>
      )}
      <div style={{display:'flex',justifyContent:'center',alignItems:'center',gap:18,marginTop:32}}>
        <button className="btn" style={{fontWeight:700,fontSize:'1.08rem',padding:'10px 24px',borderRadius:8,background:'#eee',color:'#ff9800',border:'none',boxShadow:'0 2px 8px rgba(255,152,0,0.04)',letterSpacing:'0.5px',cursor:'pointer'}} disabled={page===0} onClick={()=>setPage(page-1)}>Назад</button>
        <span style={{alignSelf:'center',fontWeight:600,fontSize:'1.08rem',color:'#888'}}>Стр. {page+1} из {results.totalPages}</span>
        <button className="btn" style={{fontWeight:700,fontSize:'1.08rem',padding:'10px 24px',borderRadius:8,background:'#eee',color:'#ff9800',border:'none',boxShadow:'0 2px 8px rgba(255,152,0,0.04)',letterSpacing:'0.5px',cursor:'pointer'}} disabled={page+1>=results.totalPages} onClick={()=>setPage(page+1)}>Вперёд</button>
      </div>
      <div style={{marginTop:32, textAlign:'center'}}>
        <button className="btn" style={{fontWeight:700,fontSize:'1.08rem',padding:'10px 24px',borderRadius:8,background:'#eee',color:'#ff9800',border:'none',boxShadow:'0 2px 8px rgba(255,152,0,0.04)',letterSpacing:'0.5px',cursor:'pointer'}} onClick={()=>navigate(-1)}>Назад</button>
      </div>
    </div>
  );
}

export default TestResultsPage; 