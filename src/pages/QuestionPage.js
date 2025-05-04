import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { getUserFromToken } from '../utils/auth';
import Alert from '../components/Alert';
import SidePanel from '../components/SidePanel';
import ValidationErrorList from '../components/ValidationErrorList';

function ConfirmModal({ open, onConfirm, onCancel, text }) {
  if (!open) return null;
  return (
    <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.18)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'#fff',borderRadius:14,padding:'36px 32px',boxShadow:'0 4px 32px rgba(255,152,0,0.13)',minWidth:340,maxWidth:'90vw',textAlign:'center'}}>
        <div style={{fontWeight:800,fontSize:'1.25rem',color:'#c62828',marginBottom:18}}>Удалить вопрос?</div>
        <div style={{fontSize:'1.08rem',color:'#444',marginBottom:28}}>{text || 'Вы действительно хотите удалить этот вопрос? Это действие необратимо.'}</div>
        <div style={{display:'flex',gap:18,justifyContent:'center'}}>
          <button onClick={onCancel} style={{fontWeight:700,fontSize:'1.08rem',padding:'12px 32px',borderRadius:8,background:'#eee',color:'#ff9800',border:'none',boxShadow:'0 2px 8px rgba(255,152,0,0.04)',cursor:'pointer'}}>Отмена</button>
          <button onClick={onConfirm} style={{fontWeight:700,fontSize:'1.08rem',padding:'12px 32px',borderRadius:8,background:'#ffebee',color:'#c62828',border:'none',boxShadow:'0 2px 8px rgba(255,152,0,0.08)',cursor:'pointer'}}>Удалить</button>
        </div>
      </div>
    </div>
  );
}

function QuestionPage() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const user = getUserFromToken();
  const isManager = user?.role === 'MANAGER';
  const [questionPage, setQuestionPage] = useState(0);
  const [questionData, setQuestionData] = useState({ content: [], totalPages: 1, number: 0 });
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [alertType, setAlertType] = useState('error');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormLoading, setCreateFormLoading] = useState(false);
  const [createFormErrors, setCreateFormErrors] = useState([]);
  const [form, setForm] = useState({
    questionText: '',
    questionType: 'SINGLE_CHOICE',
    points: 1,
    answers: [{ answerText: '', isCorrect: false }],
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!isManager) {
      setAlert('Доступ только для менеджера');
      setLoading(false);
      return;
    }
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/v1/questions/tests/${testId}`, { params: { page: questionPage, size: 1 } });
        setQuestionData(res.data || { content: [], totalPages: 1, number: 0 });
      } catch (err) {
        setAlert(err.response?.data?.message || 'Ошибка загрузки вопросов');
        setAlertType('error');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [testId, questionPage, isManager]);

  const question = questionData.content && questionData.content[0];

  const handleAddAnswer = () => {
    setForm(f => ({ ...f, answers: [...f.answers, { answerText: '', isCorrect: false }] }));
  };
  const handleRemoveAnswer = (idx) => {
    setForm(f => ({ ...f, answers: f.answers.filter((_, i) => i !== idx) }));
  };
  const handleAnswerChange = (idx, field, value) => {
    setForm(f => {
      if (field === 'isCorrect' && f.questionType === 'SINGLE_CHOICE') {
        // Только один правильный
        return {
          ...f,
          answers: f.answers.map((a, i) => ({ ...a, isCorrect: i === idx ? true : false }))
        };
      }
      return {
        ...f,
        answers: f.answers.map((a, i) => i === idx ? { ...a, [field]: value } : a)
      };
    });
  };
  const handleFormChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (field === 'questionType' && value === 'TEXT') {
      setForm(f => ({ ...f, answers: [{ answerText: '', isCorrect: true }] }));
    }
  };
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateFormLoading(true);
    setCreateFormErrors([]);
    try {
      const payload = {
        ...form,
        answers: form.answers.map(a => ({ ...a, isCorrect: !!a.isCorrect })),
        points: Number(form.points),
      };
      await api.post(`/api/v1/questions/tests/${testId}`, payload);
      setShowCreateForm(false);
      setAlert('Вопрос успешно добавлен!');
      setAlertType('success');
      setQuestionPage(0); // обновить список, показать первый вопрос
    } catch (err) {
      const resp = err.response && err.response.data;
      if (resp && resp.errorCode === 'VALIDATION_ERROR' && Array.isArray(resp.fieldErrors)) {
        setCreateFormErrors(resp.fieldErrors);
      } else {
        setAlert(resp?.message || 'Ошибка создания вопроса');
        setAlertType('error');
      }
    } finally {
      setCreateFormLoading(false);
    }
  };
  const handleDeleteQuestion = async () => {
    if (!question) return;
    setShowDeleteModal(true);
  };
  const confirmDelete = async () => {
    setShowDeleteModal(false);
    try {
      await api.delete(`/api/v1/questions/${question.id}`);
      setAlert('Вопрос удалён!');
      setAlertType('success');
      if (questionData.currentPage + 1 >= questionData.totalPages && questionData.currentPage > 0) {
        setQuestionPage(questionData.currentPage - 1);
      } else {
        setQuestionPage(questionData.currentPage);
      }
    } catch (err) {
      setAlert('Ошибка удаления вопроса');
      setAlertType('error');
    }
  };

  return (
    <div className="container" style={{maxWidth: 700, margin: '40px auto 0 auto'}}>
      {alert && <Alert message={alert} type={alertType} onClose={() => setAlert(null)} side="left" />}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <button onClick={() => navigate(-1)} style={{background:'#eee',color:'#ff9800',fontWeight:700,fontSize:'1.08rem',border:'none',borderRadius:8,padding:'10px 28px',cursor:'pointer'}}>← Назад</button>
        <div style={{display:'flex',gap:12}}>
          {isManager && (
            <>
              <button className="btn" style={{fontWeight:700,fontSize:'1.08rem',padding:'10px 24px',borderRadius:8,background:'linear-gradient(90deg, #ff9800 60%, #ffa726 100%)',color:'#fff',border:'none',boxShadow:'0 2px 8px rgba(255,152,0,0.10)',letterSpacing:'0.5px',cursor:'pointer',transition:'background 0.2s, box-shadow 0.2s'}} onClick={()=>{setShowCreateForm(true);setForm({questionText:'',questionType:'SINGLE_CHOICE',points:1,answers:[{answerText:'',isCorrect:false}]});}}>Добавить вопрос</button>
              <button onClick={handleDeleteQuestion} title="Удалить вопрос" style={{background:'#ffebee',color:'#c62828',border:'none',borderRadius:8,padding:'10px 18px',fontWeight:700,boxShadow:'0 2px 8px rgba(255,152,0,0.04)',fontSize:'1.01rem',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="20" rx="10" fill="#ffebee"/><path d="M7.5 7.5L12.5 12.5M12.5 7.5L7.5 12.5" stroke="#c62828" strokeWidth="2" strokeLinecap="round"/></svg>
                <span style={{fontWeight:600}}>Удалить</span>
              </button>
            </>
          )}
        </div>
      </div>
      <h2 style={{fontWeight:800,fontSize:'1.5rem',color:'#ff9800',marginBottom:18}}>Вопросы теста</h2>
      {loading ? (
        <div style={{textAlign:'center',fontSize:'1.3rem',color:'#ff9800',marginTop:60}}>Загрузка...</div>
      ) : (!question || questionData.totalPages === 0 || !questionData.content.length) ? (
        <div style={{color:'#ff9800',fontWeight:700,fontSize:'1.15rem'}}>Вопросов нет</div>
      ) : (
        <div style={{background:'#fff',borderRadius:18,boxShadow:'0 4px 24px rgba(255,152,0,0.13)',padding:'36px 32px',marginBottom:32,position:'relative',transition:'box-shadow 0.2s'}}>
          <div style={{position:'absolute',top:18,right:28,fontSize:'1.08rem',color:'#ff9800',fontWeight:700,opacity:0.85,letterSpacing:'0.5px'}}>Вопрос {questionData.currentPage+1} из {questionData.totalPages}</div>
          <div style={{fontWeight:800,fontSize:'1.35rem',marginBottom:10,color:'#ff9800',letterSpacing:'0.5px',lineHeight:1.25}}>{question.questionText}</div>
          <div style={{fontSize:'1.08rem',color:'#888',fontWeight:600,marginBottom:18}}>Баллы за вопрос: <span style={{color:'#ff9800',fontWeight:800}}>{question.points}</span></div>
          {(question.questionType === 'SINGLE_CHOICE' || question.questionType === 'MULTIPLE_CHOICE') ? (
            <div style={{marginTop:18}}>
              <b style={{fontSize:'1.08rem',color:'#888'}}>Варианты ответа:</b>
              <div style={{display:'flex',flexDirection:'column',gap:14,marginTop:14}}>
                {question.answers && question.answers.length > 0 ? question.answers.map(opt => (
                  <div key={opt.id} style={{
                    display:'flex',alignItems:'center',gap:10,padding:'12px 18px',
                    borderRadius:10,
                    background: opt.isCorrect ? 'linear-gradient(90deg,#e3fcec 60%,#b9f6ca 100%)' : '#fffdfa',
                    color: opt.isCorrect ? '#2e7d32' : '#222',
                    fontWeight: opt.isCorrect ? 800 : 500,
                    fontSize:'1.09rem',
                    boxShadow: opt.isCorrect ? '0 2px 12px rgba(67,160,71,0.10)' : '0 1px 4px rgba(255,152,0,0.04)',
                    border: opt.isCorrect ? '2px solid #43a047' : '2px solid #ffe0b2',
                    position:'relative',
                    transition:'all 0.2s',
                  }}>
                    {opt.isCorrect && (
                      <span style={{fontSize:'1.25rem',color:'#43a047',marginRight:6,display:'flex',alignItems:'center'}}>
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="11" fill="#43a047"/><path d="M6.5 11.5L10 15L15.5 8.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </span>
                    )}
                    <span>{opt.answerText}</span>
                  </div>
                )) : <div style={{color:'#888',fontSize:'1.05rem'}}>Нет вариантов ответа</div>}
              </div>
            </div>
          ) : question.questionType === 'TEXT' ? (
            <div style={{marginTop:18,display:'flex',alignItems:'center',gap:12}}>
              <span style={{fontSize:'1.18rem',color:'#43a047',display:'flex',alignItems:'center'}}>
                <svg width="24" height="24" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="11" fill="#43a047"/><path d="M6.5 11.5L10 15L15.5 8.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
              <span style={{fontSize:'1.13rem',color:'#222',fontWeight:700}}>Правильный ответ:</span>
              <span style={{fontSize:'1.13rem',color:'#222',fontWeight:500}}>{question.answers?.find(a => a.isCorrect)?.answerText || '—'}</span>
            </div>
          ) : null}
        </div>
      )}
      <div style={{display:'flex',justifyContent:'center',alignItems:'center',gap:18,marginTop:32}}>
        <button className="btn" style={{fontWeight:700,fontSize:'1.08rem',padding:'10px 24px',borderRadius:8,background:'#eee',color:'#ff9800',border:'none',boxShadow:'0 2px 8px rgba(255,152,0,0.04)',letterSpacing:'0.5px',cursor:'pointer'}} disabled={questionData.currentPage===0} onClick={()=>setQuestionPage(questionData.currentPage-1)}>Назад</button>
        <span style={{alignSelf:'center',fontWeight:600,fontSize:'1.08rem',color:'#888'}}>Вопрос {questionData.currentPage+1} из {questionData.totalPages}</span>
        <button className="btn" style={{fontWeight:700,fontSize:'1.08rem',padding:'10px 24px',borderRadius:8,background:'#eee',color:'#ff9800',border:'none',boxShadow:'0 2px 8px rgba(255,152,0,0.04)',letterSpacing:'0.5px',cursor:'pointer'}} disabled={questionData.currentPage+1>=questionData.totalPages} onClick={()=>setQuestionPage(questionData.currentPage+1)}>Вперёд</button>
      </div>
      <SidePanel open={showCreateForm} onClose={()=>setShowCreateForm(false)}>
        <form onSubmit={handleCreateSubmit} style={{maxWidth:480,margin:'40px auto 0 auto',background:'#fffdfa',borderRadius:16,boxShadow:'0 2px 16px rgba(255,152,0,0.10)',padding:'36px 32px',display:'flex',flexDirection:'column',gap:22,alignItems:'center'}}>
          <h2 style={{marginTop:0,marginBottom:24,color:'#ff9800',fontWeight:800,fontSize:'2rem',letterSpacing:'0.5px',textAlign:'center'}}>Добавить вопрос</h2>
          <div style={{width:'100%'}}>
            <label style={{fontWeight:700,fontSize:'1.13rem',marginBottom:6,display:'block'}}>Текст вопроса</label>
            <input value={form.questionText} onChange={e=>handleFormChange('questionText',e.target.value)} required maxLength={300} style={{width:'100%',padding:'12px 14px',borderRadius:8,border:'2px solid #ff9800',fontSize:'1.13rem',fontWeight:600,marginBottom:0}} />
          </div>
          <div style={{width:'100%'}}>
            <label style={{fontWeight:700,fontSize:'1.13rem',marginBottom:6,display:'block'}}>Тип вопроса</label>
            <select value={form.questionType} onChange={e=>handleFormChange('questionType',e.target.value)} style={{width:'100%',padding:'12px 14px',borderRadius:8,border:'2px solid #ff9800',fontSize:'1.13rem',fontWeight:600}}>
              <option value="SINGLE_CHOICE">Один правильный</option>
              <option value="MULTIPLE_CHOICE">Несколько правильных</option>
              <option value="TEXT">Текстовый</option>
            </select>
          </div>
          <div style={{width:'100%'}}>
            <label style={{fontWeight:700,fontSize:'1.13rem',marginBottom:6,display:'block'}}>Баллы</label>
            <input type="number" min={1} max={100} value={form.points} onChange={e=>handleFormChange('points',e.target.value)} required style={{width:'100%',padding:'12px 14px',borderRadius:8,border:'2px solid #ff9800',fontSize:'1.13rem',fontWeight:600}} />
          </div>
          {(form.questionType === 'SINGLE_CHOICE' || form.questionType === 'MULTIPLE_CHOICE') && (
            <div style={{width:'100%'}}>
              <label style={{fontWeight:700,fontSize:'1.13rem',marginBottom:6,display:'block'}}>Варианты ответа</label>
              {form.answers.map((a, idx) => (
                <div key={idx} style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                  <input value={a.answerText} onChange={e=>handleAnswerChange(idx,'answerText',e.target.value)} required maxLength={200} style={{flex:1,padding:'10px',borderRadius:8,border:'1.5px solid #ff9800',fontSize:'1.08rem',fontWeight:500}} placeholder={`Вариант ${idx+1}`} />
                  <input type={form.questionType==='SINGLE_CHOICE'?'radio':'checkbox'} name="correct" checked={!!a.isCorrect} onChange={e=>handleAnswerChange(idx,'isCorrect',form.questionType==='SINGLE_CHOICE'?true:!a.isCorrect)} style={{width:18,height:18}} />
                  <button type="button" onClick={()=>handleRemoveAnswer(idx)} style={{background:'#ffebee',color:'#c62828',border:'none',borderRadius:6,padding:'4px 10px',fontWeight:700,cursor:'pointer'}}>✕</button>
                </div>
              ))}
              <button type="button" onClick={handleAddAnswer} disabled={form.answers.length>=8} style={{background:'#fff3e0',color:form.answers.length>=8?'#bbb':'#ff9800',border:'none',borderRadius:6,padding:'8px 18px',fontWeight:700,cursor:form.answers.length>=8?'not-allowed':'pointer',marginTop:6,opacity:form.answers.length>=8?0.6:1}}>Добавить вариант</button>
              {form.answers.length>=8 && <div style={{color:'#c62828',fontSize:'0.98rem',marginTop:6}}>Максимум 8 вариантов</div>}
            </div>
          )}
          {form.questionType === 'TEXT' && (
            <div style={{width:'100%'}}>
              <label style={{fontWeight:700,fontSize:'1.13rem',marginBottom:6,display:'block'}}>Правильный ответ</label>
              <input value={form.answers[0].answerText} onChange={e=>handleAnswerChange(0,'answerText',e.target.value)} required maxLength={200} style={{width:'100%',padding:'10px',borderRadius:8,border:'1.5px solid #ff9800',fontSize:'1.08rem',fontWeight:500}} placeholder="Правильный ответ" />
            </div>
          )}
          <div style={{width:'100%'}}>
            <ValidationErrorList fieldErrors={createFormErrors} />
          </div>
          <div style={{display:'flex',gap:16,marginTop:8,justifyContent:'center',width:'100%'}}>
            <button type="submit" disabled={createFormLoading} style={{flex:1,fontWeight:700,fontSize:'1.13rem',padding:'12px 0',borderRadius:8,background:'linear-gradient(90deg, #ff9800 60%, #ffa726 100%)',color:'#fff',border:'none',boxShadow:'0 2px 8px rgba(255,152,0,0.10)',letterSpacing:'0.5px',cursor:'pointer'}}>Создать</button>
            <button type="button" className="btn" style={{flex:1,background:'#eee',color:'#ff9800',fontWeight:700,fontSize:'1.13rem',borderRadius:8,padding:'12px 0',border:'none',boxShadow:'0 2px 8px rgba(255,152,0,0.04)',letterSpacing:'0.5px',cursor:'pointer'}} onClick={()=>setShowCreateForm(false)}>Отмена</button>
          </div>
        </form>
      </SidePanel>
      <ConfirmModal open={showDeleteModal} onConfirm={confirmDelete} onCancel={()=>setShowDeleteModal(false)} />
    </div>
  );
}

export default QuestionPage; 