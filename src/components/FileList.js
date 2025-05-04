import React, { useState, useRef } from 'react';

function FileList({ files, onUpload, isManager, loading, onDownload, onDelete }) {
  const fileInputRef = useRef();

  const handleUploadClick = () => {
    fileInputRef.current && fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
      e.target.value = '';
    }
  };

  return (
    <div style={{background:'#fff7e6',border:'1.5px solid #ff9800',borderRadius:8,padding:'14px 18px',marginTop:16,marginBottom:0,color:'#d84315',fontSize:'1.05rem',boxShadow:'0 2px 8px rgba(255,152,0,0.07)'}}>
      <div style={{fontWeight:600,marginBottom:8,color:'#ff9800',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span>Файлы курса:</span>
        {isManager && (
          <button onClick={handleUploadClick} disabled={loading} style={{background:'#ff9800',color:'#fff',border:'none',borderRadius:6,padding:'6px 16px',fontWeight:700,cursor:'pointer',fontSize:'1rem'}}>
            {loading ? 'Загрузка...' : 'Загрузить файл'}
          </button>
        )}
        <input type="file" ref={fileInputRef} style={{display:'none'}} onChange={handleFileChange} />
      </div>
      {(!files || files.length === 0) ? (
        <div style={{color:'#ff9800',fontWeight:500,fontSize:'1.08rem',marginTop:8}}>Файлы ещё не загружены</div>
      ) : (
        <ul style={{listStyle:'none',paddingLeft:0,margin:0}}>
          {files.map(file => (
            <li key={file.id} style={{marginBottom:6,display:'flex',alignItems:'center'}}>
              <button
                onClick={onDownload ? () => onDownload(file) : undefined}
                style={{background:'none',border:'none',padding:0,margin:0,cursor:'pointer',display:'flex',alignItems:'center',color:'#ff9800',fontWeight:600,textDecoration:'underline'}}
                title="Скачать файл"
              >
                <span>{file.fileName}</span>
                <svg style={{marginLeft:6}} width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 3v10m0 0l-4-4m4 4l4-4" stroke="#ff9800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="3" y="15" width="14" height="2" rx="1" fill="#ff9800"/></svg>
              </button>
              {isManager && onDelete && (
                <button
                  onClick={() => onDelete(file)}
                  style={{background:'none',border:'none',padding:0,marginLeft:6,cursor:'pointer',display:'flex',alignItems:'center'}}
                  title="Удалить файл"
                >
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><rect x="5" y="8" width="10" height="7" rx="2" fill="#ff9800"/><rect x="8" y="4" width="4" height="2" rx="1" fill="#ff9800"/><path d="M7 8V6a3 3 0 0 1 6 0v2" stroke="#ff9800" strokeWidth="1.5" strokeLinecap="round"/><path d="M8.5 11v3m3-3v3" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/></svg>
                </button>
              )}
              <span style={{color:'#888',fontSize:'0.98rem',marginLeft:8}}>{new Date(file.uploadedAt).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default FileList; 