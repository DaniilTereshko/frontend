import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { getUserFromToken } from '../utils/auth';
import Alert from '../components/Alert';
import SidePanel from '../components/SidePanel';
import ValidationErrorList from '../components/ValidationErrorList';
import TestForm from '../components/TestForm';
import TestTile from '../components/TestTile';

function CreatorInfo({ creator }) {
  if (!creator) return null;
  return (
    <div style={{display:'flex',alignItems:'center',gap:16}}>
      <div style={{width:44,height:44,borderRadius:'50%',background:'#fff3e0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,color:'#ff9800',fontWeight:700,boxShadow:'0 1px 4px rgba(255,152,0,0.10)'}}>
        {creator.username?.[0]?.toUpperCase() || 'U'}
      </div>
      <div>
        <div style={{fontWeight:700,fontSize:'1.08rem',color:'#222'}}>{creator.username}</div>
        <div style={{fontSize:'0.97rem',color:'#888'}}>{creator.email}</div>
        <div style={{fontSize:'0.97rem',color:'#ff9800',fontWeight:500}}>{creator.role}</div>
      </div>
    </div>
  );
}

function CourseForm({ onSubmit, onCancel, initial, loading, errors }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ title, description });
  };

  return (
    <form onSubmit={handleSubmit} style={{marginBottom: 0, background: 'none', borderRadius: 0, boxShadow: 'none', padding: 0, fontFamily: 'Inter, Arial, sans-serif', display:'flex', flexDirection:'column', alignItems:'center'}}>
      <h2 style={{marginTop:0, marginBottom: 24, color: '#ff9800', fontWeight: 800, fontSize: '2rem', letterSpacing: '0.5px'}}> {initial ? 'Редактировать курс' : 'Создать курс'} </h2>
      <div style={{width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 18}}>
        <div>
          <label style={{fontWeight:700, fontSize:'1.13rem', marginBottom: 6, display:'block'}}>Название курса</label>
          <input style={{width:'100%', fontWeight:600, fontSize:'1.13rem', borderWidth:2, borderColor:'#ff9800', borderRadius:8, padding:'12px 14px', fontFamily:'Inter, Arial, sans-serif', boxSizing:'border-box'}} value={title} onChange={e => setTitle(e.target.value)} required maxLength={100} placeholder="Введите название курса" />
        </div>
        <div>
          <label style={{fontWeight:700, fontSize:'1.13rem', marginBottom: 6, display:'block'}}>Описание курса</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} required maxLength={500} placeholder="Введите описание курса" style={{width:'100%', minHeight: 110, resize: 'vertical', fontSize:'1.08rem', fontWeight:500, border:'2px solid #ff9800', borderRadius:8, padding:'12px 14px', background:'#fffdfa', outline:'none', boxShadow:'0 1px 4px rgba(255,152,0,0.04)', transition:'border 0.2s, box-shadow 0.2s', fontFamily:'Inter, Arial, sans-serif', boxSizing:'border-box'}} />
        </div>
        <div style={{display:'flex',gap:16,marginTop:8, width:'100%', justifyContent:'center'}}>
          <button type="submit" disabled={loading} style={{flex:1, fontWeight:700, fontSize:'1.13rem', padding:'12px 0', borderRadius:8, background:'linear-gradient(90deg, #ff9800 60%, #ffa726 100%)', color:'#fff', border:'none', boxShadow:'0 2px 8px rgba(255,152,0,0.10)', letterSpacing:'0.5px', cursor:'pointer', transition:'background 0.2s, box-shadow 0.2s'}}> {initial ? 'Сохранить' : 'Создать'} </button>
          <button type="button" className="btn" style={{flex:1, background:'#eee',color:'#ff9800',fontWeight:700, fontSize:'1.13rem', borderRadius:8, padding:'12px 0', border:'none', boxShadow:'0 2px 8px rgba(255,152,0,0.04)', letterSpacing:'0.5px', cursor:'pointer'}} onClick={onCancel}>Отмена</button>
        </div>
        <div>
          <ValidationErrorList fieldErrors={errors} />
        </div>
      </div>
    </form>
  );
}

function CoursePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getUserFromToken();
  const isManager = user?.role === 'MANAGER';
  const [course, setCourse] = useState(null);
  const [tests, setTests] = useState({ content: [], totalPages: 1, number: 0 });
  const [testPage, setTestPage] = useState(0);
  const [testPageSize] = useState(6);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [alertType, setAlertType] = useState('error');
  const [showForm, setShowForm] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [formErrors, setFormErrors] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [editTest, setEditTest] = useState(null);
  const [showTestForm, setShowTestForm] = useState(false);
  const [testFormErrors, setTestFormErrors] = useState([]);
  const [testFormLoading, setTestFormLoading] = useState(false);
  const [showCreateTestForm, setShowCreateTestForm] = useState(false);
  const [createTestFormErrors, setCreateTestFormErrors] = useState([]);
  const [createTestFormLoading, setCreateTestFormLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/v1/courses/${id}`);
        setCourse(res.data);
        const testsRes = await api.get(`/api/v1/tests/course/${id}`, { params: { page: testPage, size: testPageSize } });
        setTests(testsRes.data || { content: [], totalPages: 1, number: 0 });
      } catch (err) {
        setAlert(err.response?.data?.message || 'Ошибка загрузки курса');
        setAlertType('error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, testPage, testPageSize]);

  const handleEdit = () => {
    setEditCourse(course);
    setShowForm(true);
    setFormErrors([]);
  };

  const handleUpdate = async (data) => {
    setActionLoading(true);
    setFormErrors([]);
    try {
      await api.put(`/api/v1/courses/${course.id}`, data);
      setShowForm(false);
      setEditCourse(null);
      setCourse({ ...course, ...data });
      setAlert('Курс успешно обновлён!');
      setAlertType('success');
    } catch (err) {
      const resp = err.response && err.response.data;
      if (resp && resp.errorCode === 'VALIDATION_ERROR' && Array.isArray(resp.fieldErrors)) {
        setFormErrors(resp.fieldErrors);
      } else {
        setAlert(resp?.message || 'Ошибка обновления курса');
        setAlertType('error');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreate = () => {
    setEditCourse(null);
    setShowForm(true);
    setFormErrors([]);
  };

  const handleCreateSubmit = async (data) => {
    setActionLoading(true);
    setFormErrors([]);
    try {
      await api.post('/api/v1/courses', data);
      setShowForm(false);
      setEditCourse(null);
      setAlert('Курс успешно создан!');
      setAlertType('success');
    } catch (err) {
      const resp = err.response && err.response.data;
      if (resp && resp.errorCode === 'VALIDATION_ERROR' && Array.isArray(resp.fieldErrors)) {
        setFormErrors(resp.fieldErrors);
      } else {
        setAlert(resp?.message || 'Ошибка создания курса');
        setAlertType('error');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Удалить курс "${course.title}"?`)) return;
    setActionLoading(true);
    try {
      await api.delete(`/api/v1/courses/${course.id}`);
      setAlert('Курс удалён!');
      setAlertType('success');
      navigate('/');
    } catch (err) {
      setAlert('Ошибка удаления курса');
      setAlertType('error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTestEdit = (test) => {
    setEditTest(test);
    setShowTestForm(true);
    setTestFormErrors([]);
  };

  const handleTestUpdate = async (data) => {
    setTestFormLoading(true);
    setTestFormErrors([]);
    try {
      await api.put(`/api/v1/tests/${editTest.id}`, data);
      setTests(prev => ({
        ...prev,
        content: prev.content.map(t => t.id === editTest.id ? { ...t, ...data } : t)
      }));
      setShowTestForm(false);
      setEditTest(null);
      setAlert('Тест успешно обновлён!');
      setAlertType('success');
    } catch (err) {
      const resp = err.response && err.response.data;
      if (resp && resp.errorCode === 'VALIDATION_ERROR' && Array.isArray(resp.fieldErrors)) {
        setTestFormErrors(resp.fieldErrors);
      } else {
        setAlert(resp?.message || 'Ошибка обновления теста');
        setAlertType('error');
      }
    } finally {
      setTestFormLoading(false);
    }
  };

  const handleTestCreate = () => {
    setShowCreateTestForm(true);
    setCreateTestFormErrors([]);
  };

  const handleTestCreateSubmit = async (data) => {
    setCreateTestFormLoading(true);
    setCreateTestFormErrors([]);
    try {
      const res = await api.post(`/api/v1/tests/courses/${course.id}`, data);
      setTests(prev => ({
        ...prev,
        content: [res.data, ...prev.content],
      }));
      setShowCreateTestForm(false);
      setAlert('Тест успешно создан!');
      setAlertType('success');
    } catch (err) {
      const resp = err.response && err.response.data;
      if (resp && resp.errorCode === 'VALIDATION_ERROR' && Array.isArray(resp.fieldErrors)) {
        setCreateTestFormErrors(resp.fieldErrors);
      } else {
        setAlert(resp?.message || 'Ошибка создания теста');
        setAlertType('error');
      }
    } finally {
      setCreateTestFormLoading(false);
    }
  };

  // TODO: handleAssign logic if needed

  return (
    <div className="container" style={{maxWidth: 900, position:'relative'}}>
      {alert && <Alert message={alert} type={alertType} onClose={() => setAlert(null)} side="left" />}
      <SidePanel open={showForm} onClose={() => {setShowForm(false);setEditCourse(null);setFormErrors([]);}}>
        <CourseForm
          onSubmit={editCourse ? handleUpdate : handleCreateSubmit}
          onCancel={() => {setShowForm(false);setEditCourse(null);setFormErrors([]);}}
          initial={editCourse}
          loading={actionLoading}
          errors={formErrors}
        />
      </SidePanel>
      <SidePanel open={showTestForm} onClose={() => {setShowTestForm(false);setEditTest(null);setTestFormErrors([]);}}>
        <TestForm
          initial={editTest}
          onSubmit={handleTestUpdate}
          onCancel={() => {setShowTestForm(false);setEditTest(null);setTestFormErrors([]);}}
          loading={testFormLoading}
          errors={testFormErrors}
          title="Редактировать тест"
        />
      </SidePanel>
      <SidePanel open={showCreateTestForm} onClose={() => {setShowCreateTestForm(false);setCreateTestFormErrors([]);}}>
        <TestForm
          initial={null}
          onSubmit={handleTestCreateSubmit}
          onCancel={() => {setShowCreateTestForm(false);setCreateTestFormErrors([]);}}
          loading={createTestFormLoading}
          errors={createTestFormErrors}
          title="Создать тест"
        />
      </SidePanel>
      <button onClick={() => navigate(-1)} style={{marginBottom:24,background:'#eee',color:'#ff9800',fontWeight:700,fontSize:'1.08rem',border:'none',borderRadius:8,padding:'10px 28px',cursor:'pointer'}}>← Назад</button>
      {loading ? (
        <div style={{textAlign:'center',fontSize:'1.3rem',color:'#ff9800',marginTop:60}}>Загрузка...</div>
      ) : course ? (
        <div style={{background:'#fff',borderRadius:16,boxShadow:'0 2px 16px rgba(255,152,0,0.10)',padding:32,marginBottom:32,position:'relative'}}>
          {/* Creator info in top right */}
          <div style={{position:'absolute',top:24,right:32}}>
            <CreatorInfo creator={course.createdBy} />
          </div>
          <div style={{fontSize:'2rem',fontWeight:800,color:'#ff9800',marginBottom:8,letterSpacing:'0.5px'}}>{course.title}</div>
          <div style={{color:'#444',marginBottom:12, fontSize:'1.13rem', fontWeight:500}}>{course.description}</div>
          <div style={{fontSize:'1.01rem',color:'#888'}}>Создан: {new Date(course.createdAt).toLocaleString()}</div>
          {isManager && (
            <div style={{display:'flex',gap:18,justifyContent:'center',alignItems:'center',marginTop:24}}>
              <button className="btn" style={{flex:1, fontWeight:700, fontSize:'1.08rem', padding:'12px 0', borderRadius:8, background:'linear-gradient(90deg, #ff9800 60%, #ffa726 100%)', color:'#fff', border:'none', boxShadow:'0 2px 8px rgba(255,152,0,0.10)', letterSpacing:'0.5px', cursor:'pointer', transition:'background 0.2s, box-shadow 0.2s'}} onClick={handleEdit}>Редактировать</button>
              <button className="btn" style={{flex:1, fontWeight:700, fontSize:'1.08rem', padding:'12px 0', borderRadius:8, background:'#ffebee', color:'#c62828', border:'none', boxShadow:'0 2px 8px rgba(255,152,0,0.04)', letterSpacing:'0.5px', cursor:'pointer'}} onClick={handleDelete}>Удалить</button>
              {/* <button className="btn" style={{flex:1, fontWeight:700, fontSize:'1.08rem', padding:'12px 0', borderRadius:8, background:'#e3fcec', color:'#43a047', border:'none', boxShadow:'0 2px 8px rgba(67,160,71,0.08)', letterSpacing:'0.5px', cursor:'pointer'}}>Назначить</button> */}
            </div>
          )}
        </div>
      ) : null}
      <h3 style={{fontWeight:800,fontSize:'1.3rem',color:'#ff9800',marginBottom:18,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        Тесты курса
        {isManager && (
          <button
            className="btn"
            style={{fontWeight:700,fontSize:'1.08rem',padding:'10px 24px',borderRadius:8,background:'linear-gradient(90deg, #ff9800 60%, #ffa726 100%)',color:'#fff',border:'none',boxShadow:'0 2px 8px rgba(255,152,0,0.10)',letterSpacing:'0.5px',cursor:'pointer',transition:'background 0.2s, box-shadow 0.2s'}}
            onClick={handleTestCreate}
          >
            Создать тест
          </button>
        )}
      </h3>
      <div style={{display:'flex',flexWrap:'wrap',gap:24}}>
        {(!tests.content || tests.content.length === 0) ? (
          <div style={{color:'#ff9800',fontWeight:700,fontSize:'1.15rem'}}>Нет тестов для этого курса</div>
        ) : (
          tests.content.map(test => (
            <TestTile key={test.id} test={test} canEdit={isManager} onEdit={()=>handleTestEdit(test)} onDelete={()=>{}} />
          ))
        )}
      </div>
      <div style={{display:'flex',justifyContent:'center',alignItems:'center',gap:18,marginTop:32}}>
        <button className="btn" style={{fontWeight:700,fontSize:'1.08rem',padding:'10px 24px',borderRadius:8,background:'#eee',color:'#ff9800',border:'none',boxShadow:'0 2px 8px rgba(255,152,0,0.04)',letterSpacing:'0.5px',cursor:'pointer'}} disabled={testPage===0} onClick={()=>setTestPage(testPage-1)}>Назад</button>
        <span style={{alignSelf:'center',fontWeight:600,fontSize:'1.08rem',color:'#888'}}>Стр. {testPage+1} из {tests.totalPages}</span>
        <button className="btn" style={{fontWeight:700,fontSize:'1.08rem',padding:'10px 24px',borderRadius:8,background:'#eee',color:'#ff9800',border:'none',boxShadow:'0 2px 8px rgba(255,152,0,0.04)',letterSpacing:'0.5px',cursor:'pointer'}} disabled={testPage+1>=tests.totalPages} onClick={()=>setTestPage(testPage+1)}>Вперёд</button>
      </div>
    </div>
  );
}

export default CoursePage; 