import React from 'react';

export default function AdBanner({ type = 'leaderboard' }) {
  const bannerClass = type === 'square' ? 'ad-banner-square' : 'ad-banner-leaderboard';

  return (
    <div className={`ad-banner-container ${bannerClass}`}>
      <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.5 }}>
        Espaço Publicitário (AdSense / Monetag)
      </span>
      <span style={{ fontSize: '0.75rem', marginTop: '0.2rem', color: 'var(--text-muted)', opacity: 0.8 }}>
        {type === 'leaderboard' ? '728 x 90 Banner' : '300 x 250 Retângulo'}
      </span>
    </div>
  );
}
