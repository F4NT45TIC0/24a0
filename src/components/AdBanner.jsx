import React from 'react';

export default function AdBanner({ type = 'leaderboard' }) {
  const styles = {
    leaderboard: {
      width: '100%',
      height: '90px',
      maxWidth: '728px',
      margin: '1.5rem auto'
    },
    square: {
      width: '300px',
      height: '250px',
      margin: '1rem auto'
    }
  };

  const currentStyle = styles[type] || styles.leaderboard;

  return (
    <div 
      style={{
        ...currentStyle,
        background: 'rgba(0,0,0,0.03)',
        border: '1px dashed var(--border-color-default)',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.8rem',
        textAlign: 'center',
        boxSizing: 'border-box',
        padding: '0.5rem'
      }}
    >
      <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.5 }}>
        Espaço Publicitário (AdSense / Monetag)
      </span>
      <span style={{ fontSize: '0.75rem', marginTop: '0.2rem', color: 'var(--text-muted)', opacity: 0.8 }}>
        {type === 'leaderboard' ? '728 x 90 Banner' : '300 x 250 Retângulo'}
      </span>
    </div>
  );
}
