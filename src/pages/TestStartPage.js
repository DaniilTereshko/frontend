import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Alert from '../components/Alert';

function TestStartPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [alertType, setAlertType] = useState('success');
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState({ content: [], currentPage: 0, totalPages: 1 });
  const [questionPage, setQuestionPage] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: value }
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [allQuestions, setAllQuestions] = useState([]); // Для номеров
  const [inProgressAttempt, setInProgressAttempt] = useState(null);

  useEffect(() => {
    // Проверяем есть ли активная попытка
    const fetchInProgress = async () => {
      try {
        const res = await api.get(`/api/v1/tests/${id}/in-progress-attempt`);
        if (res.data) setInProgressAttempt(res.data);
      } catch (e) {
        // Не показываем ошибку если 404
      }
    };
    fetchInProgress();
  }, [id]);

  const handleStart = async () => {
    setLoading(true);
    setAlert(null);
    try {
      // Получаем все вопросы для навигации
      const allRes = await api.get(`/api/v1/questions/tests/${id}`, { params: { page: 0, size: 100 } });
      const questionsArr = allRes.data?.content || [];
      if (questionsArr.length === 0) {
        setAlert('Тест пока не содержит вопросов');
        setAlertType('error');
        setLoading(false);
        return;
      }
      await api.post(`/api/v1/tests/${id}/start`);
      setAllQuestions(questionsArr);
      setStarted(true);
      fetchQuestions(0);
    } catch (err) {
      setAlert(err.response?.data?.message || 'Ошибка при старте теста');
      setAlertType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    setLoading(true);
    setAlert(null);
    try {
      // Получаем все вопросы для навигации
      const allRes = await api.get(`/api/v1/questions/tests/${id}`, { params: { page: 0, size: 100 } });
      setAllQuestions(allRes.data?.content || []);
      setStarted(true);
      fetchQuestions(0);
    } catch (err) {
      setAlert('Ошибка при продолжении попытки');
      setAlertType('error');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (pageNum) => {
    setQuestionsLoading(true);
    try {
      const res = await api.get(`/api/v1/questions/tests/${id}`, { params: { page: pageNum, size: 1 } });
      setQuestions(res.data || { content: [], currentPage: 0, totalPages: 1 });
      setQuestionPage(pageNum);
    } catch (err) {
      setAlert('Ошибка загрузки вопросов');
      setAlertType('error');
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(a => ({ ...a, [questionId]: value }));
  };

  const handleSubmit = async () => {
    const prepared = (allQuestions.length ? allQuestions : questions.content).map(q => {
      if (q.questionType === 'TEXT') {
        return {
          questionId: q.id,
          answer: answers[q.id] || ''
        };
      } else {
        let ids = answers[q.id];
        if (!Array.isArray(ids)) ids = ids ? [ids] : [];
        return {
          questionId: q.id,
          userAnswerIds: ids
        };
      }
    });
    setLoading(true);
    setAlert(null);
    try {
      await api.post(`/api/v1/tests/${id}/submit`, { answers: prepared });
      setAlert('Тест успешно завершён!');
      setAlertType('success');
      setTimeout(() => {
        navigate(-1); // Вернуться на одну страницу назад
      }, 1200);
    } catch (err) {
      setAlert(err.response?.data?.message || 'Ошибка при отправке теста');
      setAlertType('error');
    } finally {
      setLoading(false);
    }
  };

  const question = questions.content[0];

  return (
    <div className="container" style={{maxWidth: 600, margin: '60px auto 0 auto', display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
      {alert && <Alert message={alert} type={alertType} onClose={()=>setAlert(null)} side="left" />}
      {!started ? (
        <div style={{width:'100%',maxWidth:520,background:'#fffdfa',borderRadius:16,boxShadow:'0 2px 16px rgba(255,152,0,0.10)',padding:'36px 32px',marginTop:0,position:'relative',display:'flex',flexDirection:'column',alignItems:'center'}}>
          <button
            className="btn"
            style={{position:'absolute',left:24,top:24,fontWeight:700,fontSize:'1.08rem',padding:'8px 22px',borderRadius:8,background:'#eee',color:'#ff9800',border:'none',boxShadow:'0 2px 8px rgba(255,152,0,0.04)',letterSpacing:'0.5px',cursor:'pointer',zIndex:2}}
            onClick={()=>navigate(-1)}
          >
            Назад
          </button>
          <h2 style={{fontWeight:800,fontSize:'2.1rem',color:'#ff9800',marginBottom:40,letterSpacing:'0.5px',textAlign:'center'}}>Начать тест</h2>
          {inProgressAttempt && (
            <button
              className="btn"
              style={{width:'100%',marginBottom:24,fontWeight:800,fontSize:'1.5rem',padding:'32px 64px',borderRadius:16,background:'linear-gradient(90deg, #e3e7fc 60%, #b3bcf7 100%)',color:'#3f51b5',border:'none',boxShadow:'0 4px 24px rgba(63,81,181,0.13)',letterSpacing:'1px',cursor:'pointer',transition:'background 0.2s, box-shadow 0.2s'}}
              onClick={handleContinue}
            >
              Продолжить текущую попытку
            </button>
          )}
          <button
            className="btn"
            style={{width:'100%',fontWeight:800,fontSize:'1.5rem',padding:'32px 64px',borderRadius:16,background:'linear-gradient(90deg, #ff9800 60%, #ffa726 100%)',color:'#fff',border:'none',boxShadow:'0 4px 24px rgba(255,152,0,0.13)',letterSpacing:'1px',cursor:'pointer',transition:'background 0.2s, box-shadow 0.2s',marginBottom:24}}
            onClick={handleStart}
            disabled={loading}
          >
            {loading ? 'Запуск...' : 'Начать тест'}
          </button>
        </div>
      ) : (
        <div style={{width:'100%',maxWidth:520,background:'#fffdfa',borderRadius:16,boxShadow:'0 2px 16px rgba(255,152,0,0.10)',padding:'36px 32px',marginTop:0,position:'relative'}}>
          <button
            className="btn"
            style={{position:'absolute',left:24,top:24,fontWeight:700,fontSize:'1.08rem',padding:'8px 22px',borderRadius:8,background:'#eee',color:'#ff9800',border:'none',boxShadow:'0 2px 8px rgba(255,152,0,0.04)',letterSpacing:'0.5px',cursor:'pointer',zIndex:2}}
            onClick={()=>navigate(-1)}
          >
            Назад
          </button>
          {/* Плашка с номерами вопросов */}
          {allQuestions.length > 0 && (
            <div style={{display:'flex',flexWrap:'wrap',gap:10,marginBottom:28,justifyContent:'center'}}>
              {allQuestions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={()=>fetchQuestions(idx)}
                  style={{
                    width:40,height:40,borderRadius:'50%',
                    background: answers[q.id] ? 'linear-gradient(90deg, #ff9800 60%, #ffa726 100%)' : '#eee',
                    color: answers[q.id] ? '#fff' : '#888',
                    fontWeight:800,fontSize:'1.18rem',border:'none',
                    boxShadow: answers[q.id] ? '0 2px 8px rgba(255,152,0,0.10)' : '0 1px 4px rgba(255,152,0,0.04)',
                    cursor:'pointer',
                    outline: questions.currentPage === idx ? '3px solid #ff9800' : 'none',
                    display:'flex',alignItems:'center',justifyContent:'center',
                    transition:'all 0.18s',
                    marginBottom:4
                  }}
                >{idx+1}</button>
              ))}
            </div>
          )}
          {questionsLoading ? (
            <div style={{textAlign:'center',fontSize:'1.2rem',color:'#ff9800',marginTop:40}}>Загрузка вопроса...</div>
          ) : !question ? (
            <div style={{color:'#ff9800',fontWeight:700,fontSize:'1.15rem'}}>Вопросов нет</div>
          ) : (
            <>
              <div style={{fontWeight:800,fontSize:'1.25rem',color:'#ff9800',marginBottom:18}}>Вопрос {questions.currentPage+1} из {questions.totalPages}</div>
              <div style={{fontWeight:700,fontSize:'1.18rem',marginBottom:18}}>{question.questionText}</div>
              <div style={{fontSize:'1.08rem',color:'#888',fontWeight:600,marginBottom:18}}>Баллы за вопрос: <span style={{color:'#ff9800',fontWeight:800}}>{question.points}</span></div>
              {(question.questionType === 'SINGLE_CHOICE' || question.questionType === 'MULTIPLE_CHOICE') ? (
                <div style={{marginTop:12}}>
                  <b style={{fontSize:'1.08rem',color:'#888'}}>Варианты ответа:</b>
                  <div style={{display:'flex',flexDirection:'column',gap:14,marginTop:14}}>
                    {question.answers && question.answers.length > 0 ? question.answers.map(opt => (
                      <label key={opt.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 0',cursor:'pointer'}}>
                        <input
                          type={question.questionType==='SINGLE_CHOICE'?'radio':'checkbox'}
                          name={`answer_${question.id}`}
                          checked={question.questionType==='SINGLE_CHOICE' ? answers[question.id] === opt.id : Array.isArray(answers[question.id]) && answers[question.id]?.includes(opt.id)}
                          onChange={e => {
                            if (question.questionType==='SINGLE_CHOICE') handleAnswerChange(question.id, opt.id);
                            else {
                              let arr = Array.isArray(answers[question.id]) ? answers[question.id] : [];
                              if (e.target.checked) arr = [...arr, opt.id];
                              else arr = arr.filter(i => i !== opt.id);
                              handleAnswerChange(question.id, arr);
                            }
                          }}
                          style={{width:18,height:18}}
                        />
                        <span style={{fontSize:'1.09rem'}}>{opt.answerText}</span>
                      </label>
                    )) : <div style={{color:'#888',fontSize:'1.05rem'}}>Нет вариантов ответа</div>}
                  </div>
                </div>
              ) : question.questionType === 'TEXT' ? (
                <div style={{marginTop:18}}>
                  <label style={{fontWeight:700,fontSize:'1.08rem',marginBottom:6,display:'block'}}>Ваш ответ:</label>
                  <input
                    value={answers[question.id] || ''}
                    onChange={e=>handleAnswerChange(question.id, e.target.value)}
                    style={{width:'100%',padding:'10px',borderRadius:8,border:'1.5px solid #ff9800',fontSize:'1.08rem',fontWeight:500}}
                    placeholder="Введите ответ"
                  />
                </div>
              ) : null}
              <div style={{display:'flex',justifyContent:'center',alignItems:'center',gap:18,marginTop:32}}>
                <button className="btn" style={{fontWeight:700,fontSize:'1.08rem',padding:'10px 24px',borderRadius:8,background:'#eee',color:'#ff9800',border:'none',boxShadow:'0 2px 8px rgba(255,152,0,0.04)',letterSpacing:'0.5px',cursor:'pointer'}} disabled={questions.currentPage===0} onClick={()=>fetchQuestions(questions.currentPage-1)}>Назад</button>
                <span style={{alignSelf:'center',fontWeight:600,fontSize:'1.08rem',color:'#888'}}>Вопрос {questions.currentPage+1} из {questions.totalPages}</span>
                <button className="btn" style={{fontWeight:700,fontSize:'1.08rem',padding:'10px 24px',borderRadius:8,background:'#eee',color:'#ff9800',border:'none',boxShadow:'0 2px 8px rgba(255,152,0,0.04)',letterSpacing:'0.5px',cursor:'pointer'}} disabled={questions.currentPage+1>=questions.totalPages} onClick={()=>fetchQuestions(questions.currentPage+1)}>Вперёд</button>
              </div>
              <button className="btn" style={{margin:'32px auto 0 auto',display:'block',fontWeight:800,fontSize:'1.18rem',padding:'18px 44px',borderRadius:12,background:'linear-gradient(90deg, #ff9800 60%, #ffa726 100%)',color:'#fff',border:'none',boxShadow:'0 4px 24px rgba(255,152,0,0.13)',letterSpacing:'1px',cursor:'pointer',transition:'background 0.2s, box-shadow 0.2s'}} onClick={handleSubmit} disabled={loading || Object.keys(answers).length===0}>{loading ? 'Отправка...' : 'Завершить тест'}</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default TestStartPage; 