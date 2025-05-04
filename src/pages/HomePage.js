import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { getUserFromToken } from '../utils/auth';
import ValidationErrorList from '../components/ValidationErrorList';
import Alert from '../components/Alert';
import SidePanel from '../components/SidePanel';
import { useNavigate } from 'react-router-dom';

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

function UserCard({ user, onAssign }) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:18,background:'#fff',borderRadius:12,boxShadow:'0 2px 8px rgba(255,152,0,0.07)',padding:'18px 22px',marginBottom:18}}>
      <div style={{width:44,height:44,borderRadius:'50%',background:'#fff3e0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,color:'#ff9800',fontWeight:700,boxShadow:'0 1px 4px rgba(255,152,0,0.10)'}}>
        {user.username?.[0]?.toUpperCase() || 'U'}
      </div>
      <div style={{flex:1}}>
        <div style={{fontWeight:700,fontSize:'1.08rem',color:'#222'}}>{user.username}</div>
        <div style={{fontSize:'0.97rem',color:'#888'}}>{user.email}</div>
        <div style={{fontSize:'0.97rem',color:'#ff9800',fontWeight:500}}>{user.role}</div>
      </div>
      <button
        className="btn"
        style={{fontWeight:700,fontSize:'1.08rem',padding:'10px 24px',borderRadius:8,background:'linear-gradient(90deg, #ff9800 60%, #ffa726 100%)',color:'#fff',border:'none',boxShadow:'0 2px 8px rgba(255,152,0,0.10)',letterSpacing:'0.5px',cursor:'pointer',transition:'background 0.2s, box-shadow 0.2s'}}
        onClick={onAssign}
      >Назначить</button>
    </div>
  );
}

function AssignCoursePanel({ open, onClose, courseId, onAssigned, showAlert }) {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(null);

  const fetchUsers = async (pageNum = 0) => {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/users', { params: { page: pageNum, size: 6 } });
      setUsers(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
      setPage(res.data.currentPage || 0);
    } catch (err) {
      const msg = err.response?.data?.message || 'Ошибка загрузки пользователей';
      showAlert(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchUsers(0);
  }, [open]);

  const handleAssign = async (userId) => {
    setAssigning(userId);
    try {
      await api.post(`/api/v1/courses/${courseId}/assign/${userId}`);
      showAlert('Курс назначен пользователю!', 'success');
      onAssigned && onAssigned();
    } catch (err) {
      const msg = err.response?.data?.message || 'Ошибка назначения курса';
      showAlert(msg, 'error');
    } finally {
      setAssigning(null);
    }
  };

  return (
    <SidePanel open={open} onClose={onClose} width={480}>
      <h2 style={{marginTop:0,marginBottom:24,color:'#ff9800',fontWeight:800,fontSize:'1.6rem'}}>Назначить курс пользователю</h2>
      {loading ? (
        <div style={{textAlign:'center',color:'#ff9800',fontSize:'1.15rem',marginTop:40}}>Загрузка пользователей...</div>
      ) : (
        <>
          {users.length === 0 ? (
            <div style={{textAlign:'center',color:'#ff9800',fontWeight:700,fontSize:'1.15rem',marginTop:40}}>Нет пользователей</div>
          ) : (
            users.map(user => (
              <UserCard key={user.id} user={user} onAssign={() => handleAssign(user.id)} />
            ))
          )}
          <div style={{display:'flex',justifyContent:'center',gap:16,marginTop:18}}>
            <button className="btn" style={{fontWeight:700,fontSize:'1.08rem',padding:'10px 24px',borderRadius:8,background:'#eee',color:'#ff9800',border:'none',boxShadow:'0 2px 8px rgba(255,152,0,0.04)',letterSpacing:'0.5px',cursor:'pointer'}} disabled={page===0} onClick={()=>fetchUsers(page-1)}>Назад</button>
            <span style={{alignSelf:'center',fontWeight:600,fontSize:'1.08rem',color:'#888'}}>Стр. {page+1} из {totalPages}</span>
            <button className="btn" style={{fontWeight:700,fontSize:'1.08rem',padding:'10px 24px',borderRadius:8,background:'#eee',color:'#ff9800',border:'none',boxShadow:'0 2px 8px rgba(255,152,0,0.04)',letterSpacing:'0.5px',cursor:'pointer'}} disabled={page+1>=totalPages} onClick={()=>fetchUsers(page+1)}>Вперёд</button>
          </div>
        </>
      )}
    </SidePanel>
  );
}

function CourseCard({ course, canEdit, onEdit, onDelete, onAssign }) {
  const navigate = useNavigate();
  return (
    <div style={{background:'#fff',borderRadius:16,boxShadow:'0 2px 16px rgba(255,152,0,0.10)',padding:32,marginBottom:28,position:'relative',display:'flex',flexDirection:'column',gap:18, fontFamily:'Inter, Arial, sans-serif', minWidth:0, maxWidth: '100%'}}>
      <div style={{fontSize:'1.35rem',fontWeight:800,color:'#ff9800',marginBottom:4,letterSpacing:'0.5px'}}>{course.title}</div>
      <div style={{color:'#444',marginBottom:8, fontSize:'1.08rem', fontWeight:500}}>{course.description}</div>
      <div style={{fontSize:'0.99rem',color:'#888'}}>Создан: {new Date(course.createdAt).toLocaleString()} — <span style={{color:'#ff9800', fontWeight:600}}>{course.createdBy?.username}</span></div>
      <div style={{display:'flex',gap:18,justifyContent:'center',alignItems:'center',marginTop:24}}>
        {canEdit && <>
          <button className="btn" style={{flex:1, fontWeight:700, fontSize:'1.08rem', padding:'12px 0', borderRadius:8, background:'linear-gradient(90deg, #ff9800 60%, #ffa726 100%)', color:'#fff', border:'none', boxShadow:'0 2px 8px rgba(255,152,0,0.10)', letterSpacing:'0.5px', cursor:'pointer', transition:'background 0.2s, box-shadow 0.2s'}} onClick={onEdit}>Редактировать</button>
          <button className="btn" style={{flex:1, fontWeight:700, fontSize:'1.08rem', padding:'12px 0', borderRadius:8, background:'#ffebee', color:'#c62828', border:'none', boxShadow:'0 2px 8px rgba(255,152,0,0.04)', letterSpacing:'0.5px', cursor:'pointer'}} onClick={onDelete}>Удалить</button>
          <button className="btn" style={{flex:1, fontWeight:700, fontSize:'1.08rem', padding:'12px 0', borderRadius:8, background:'#e3fcec', color:'#43a047', border:'none', boxShadow:'0 2px 8px rgba(67,160,71,0.08)', letterSpacing:'0.5px', cursor:'pointer'}} onClick={onAssign}>Назначить</button>
        </>}
        <button className="btn" style={{flex:1, fontWeight:700, fontSize:'1.08rem', padding:'12px 0', borderRadius:8, background:'#fff3e0', color:'#ff9800', border:'none', boxShadow:'0 2px 8px rgba(255,152,0,0.04)', letterSpacing:'0.5px', cursor:'pointer'}} onClick={() => navigate(`/courses/${course.id}`)}>Перейти к курсу</button>
      </div>
    </div>
  );
}

function HomePage() {
  const user = getUserFromToken();
  const isManager = user?.role === 'MANAGER';
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [formErrors, setFormErrors] = useState([]);
  const [alert, setAlert] = useState(null);
  const [alertType, setAlertType] = useState('error');
  const [actionLoading, setActionLoading] = useState(false);
  const [assignCourseId, setAssignCourseId] = useState(null);
  const [alertSide, setAlertSide] = useState('right');
  const [coursePage, setCoursePage] = useState(0);
  const [courseTotalPages, setCourseTotalPages] = useState(1);
  const pageSize = 6;

  const fetchCourses = async (pageNum = 0) => {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/courses', { params: { page: pageNum, size: pageSize } });
      setCourses(res.data.content || []);
      setCourseTotalPages(res.data.totalPages || 1);
      setCoursePage(res.data.currentPage || 0);
    } catch (e) {
      setAlert('Ошибка загрузки курсов');
      setAlertType('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(0);
  }, []);

  const handleCreate = async (data) => {
    setActionLoading(true);
    setFormErrors([]);
    try {
      await api.post('/api/v1/courses', data);
      setShowForm(false);
      fetchCourses();
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

  const handleEdit = (course) => {
    setEditCourse(course);
    setShowForm(true);
    setFormErrors([]);
  };

  const handleUpdate = async (data) => {
    setActionLoading(true);
    setFormErrors([]);
    try {
      await api.put(`/api/v1/courses/${editCourse.id}`, data);
      setShowForm(false);
      setEditCourse(null);
      fetchCourses();
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

  const handleDelete = async (course) => {
    if (!window.confirm(`Удалить курс "${course.title}"?`)) return;
    setActionLoading(true);
    try {
      await api.delete(`/api/v1/courses/${course.id}`);
      fetchCourses();
      setAlert('Курс удалён!');
      setAlertType('success');
    } catch (err) {
      setAlert('Ошибка удаления курса');
      setAlertType('error');
    } finally {
      setActionLoading(false);
    }
  };

  const showAlert = (msg, type, side = 'right') => {
    setAlert(msg);
    setAlertType(type);
    setAlertSide(side);
  };

  return (
    <div className="container" style={{maxWidth: 1100}}>
      {alert && <Alert message={alert} type={alertType} onClose={() => setAlert(null)} side={alertSide} />}
      <AssignCoursePanel open={!!assignCourseId} onClose={()=>setAssignCourseId(null)} courseId={assignCourseId} showAlert={(msg, type) => showAlert(msg, type, 'left')} />
      {isManager && (
        <div style={{display:'flex',justifyContent:'flex-end',marginBottom:24}}>
          <button
            className="btn"
            style={{
              fontWeight:700,
              fontSize:'1.13rem',
              padding:'12px 32px',
              borderRadius:8,
              background:'linear-gradient(90deg, #ff9800 60%, #ffa726 100%)',
              color:'#fff',
              border:'none',
              boxShadow:'0 2px 8px rgba(255,152,0,0.10)',
              letterSpacing:'0.5px',
              cursor:'pointer',
              transition:'background 0.2s, box-shadow 0.2s'
            }}
            onClick={() => {setShowForm(true);setEditCourse(null);}}
          >
            Создать курс
          </button>
        </div>
      )}
      <SidePanel open={showForm} onClose={() => {setShowForm(false);setEditCourse(null);setFormErrors([]);}}>
        <CourseForm
          onSubmit={editCourse ? handleUpdate : handleCreate}
          onCancel={() => {setShowForm(false);setEditCourse(null);setFormErrors([]);}}
          initial={editCourse}
          loading={actionLoading}
          errors={formErrors}
        />
      </SidePanel>
      {loading ? (
        <div style={{textAlign:'center',fontSize:'1.3rem',color:'#ff9800',marginTop:60}}>Загрузка курсов...</div>
      ) : courses.length === 0 ? (
        <div style={{textAlign:'center',fontSize:'2rem',color:'#ff9800',marginTop:60,fontWeight:700}}>У вас пока нет курсов</div>
      ) : (
        <>
          <div style={{display:'flex',flexDirection:'column',gap:0}}>
            {courses.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                canEdit={isManager}
                onEdit={() => handleEdit(course)}
                onDelete={() => handleDelete(course)}
                onAssign={() => setAssignCourseId(course.id)}
              />
            ))}
          </div>
          <div style={{display:'flex',justifyContent:'center',alignItems:'center',gap:18,marginTop:32}}>
            <button className="btn" style={{fontWeight:700,fontSize:'1.08rem',padding:'10px 24px',borderRadius:8,background:'#eee',color:'#ff9800',border:'none',boxShadow:'0 2px 8px rgba(255,152,0,0.04)',letterSpacing:'0.5px',cursor:'pointer'}} disabled={coursePage===0} onClick={()=>fetchCourses(coursePage-1)}>Назад</button>
            <span style={{alignSelf:'center',fontWeight:600,fontSize:'1.08rem',color:'#888'}}>Стр. {coursePage+1} из {courseTotalPages}</span>
            <button className="btn" style={{fontWeight:700,fontSize:'1.08rem',padding:'10px 24px',borderRadius:8,background:'#eee',color:'#ff9800',border:'none',boxShadow:'0 2px 8px rgba(255,152,0,0.04)',letterSpacing:'0.5px',cursor:'pointer'}} disabled={coursePage+1>=courseTotalPages} onClick={()=>fetchCourses(coursePage+1)}>Вперёд</button>
          </div>
        </>
      )}
    </div>
  );
}

export default HomePage; 