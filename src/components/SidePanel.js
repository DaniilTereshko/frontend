import React from 'react';

function SidePanel({ open, onClose, children, width = 420 }) {
  if (!open) return null;
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.18)',
          zIndex: 1200,
          animation: 'fadeInOverlay 0.4s ease'
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width,
          maxWidth: '100vw',
          background: '#fff',
          boxShadow: '-4px 0 32px rgba(255,152,0,0.13)',
          zIndex: 1300,
          display: 'flex',
          flexDirection: 'column',
          padding: '36px 32px 32px 32px',
          animation: 'slideInPanel 0.4s cubic-bezier(.4,1.6,.6,1)'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            background: 'none',
            border: 'none',
            fontSize: 28,
            color: '#ff9800',
            cursor: 'pointer',
            fontWeight: 700
          }}
          aria-label="Закрыть"
        >×</button>
        <div style={{marginTop: 12}}>{children}</div>
      </div>
      <style>{`
        @keyframes slideInPanel {
          from { transform: translateX(100%); opacity: 0.5; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}

export default SidePanel; 