import React, { useState, useEffect } from 'react';
import './MirageStyle.css';

const MiragePanel = () => {
  const [isGhostMode, setIsGhostMode] = useState(false);
  const [stats, setStats] = useState({ download: 712, upload: 525, ping: 15 });

  // محاكاة تحديث السرعات حية
  useEffect(() => {
    const interval = setInterval(() => {
      setStats({
        download: (Math.random() * 100 + 650).toFixed(1),
        upload: (Math.random() * 50 + 500).toFixed(1),
        ping: Math.floor(Math.random() * 5 + 12)
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mirage-container">
      <div className={`glass-card ${isGhostMode ? 'ghost-active' : ''}`}>
        
        {/* Header: Name & Icon */}
        <div className="glass-header">
          <span className="lightning-icon">⚡</span>
          <h1 className="mirage-title">mirage</h1>
          <span className="arabic-status">إتصال</span>
        </div>

        <hr className="glass-divider" />

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-item">
            <span className="label">البنج:</span>
            <span className="value">{stats.ping} ms</span>
          </div>
          <div className="stat-item">
            <span className="label">تنزيل:</span>
            <span className="value">{stats.download} Mbps</span>
          </div>
          <div className="stat-item">
            <span className="label">تحميل:</span>
            <span className="value">{stats.upload} Mbps</span>
          </div>
        </div>

        {/* Ghost Mode Button (الطوارئ) */}
        <button 
          className={`ghost-button ${isGhostMode ? 'active' : ''}`}
          onClick={() => setIsGhostMode(!isGhostMode)}
        >
          <span className="emergency-icon">🚨</span>
          {isGhostMode ? 'تفعيل الشبح' : 'الشبح: مطفأ'}
        </button>

        <p className="status-text">
          {isGhostMode ? 'الشبح: مفعل' : 'اضغط للتفعيل'}
        </p>

        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar-fill"></div>
        </div>
      </div>
    </div>
  );
};

export default MiragePanel;
