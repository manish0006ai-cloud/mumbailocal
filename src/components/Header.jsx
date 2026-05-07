import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import './Header.css';

export default function Header() {
  const { state } = useApp();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (d) => {
    return d.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (d) => {
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-brand">
          <div className="header-logo">
            <div className="logo-icon">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M14 2L4 8v12l10 6 10-6V8L14 2z" stroke="url(#logo-grad)" strokeWidth="1.5" fill="none"/>
                <path d="M7 12h14M7 16h14" stroke="url(#logo-grad)" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="10" cy="12" r="1.5" fill="#00d4ff"/>
                <circle cx="18" cy="16" r="1.5" fill="#22d3ee"/>
                <defs>
                  <linearGradient id="logo-grad" x1="4" y1="2" x2="24" y2="26">
                    <stop stopColor="#00d4ff"/>
                    <stop offset="1" stopColor="#a78bfa"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="brand-text">
              <h1 className="app-title">LocalPulse<span className="ai-text">AI</span></h1>
              <p className="app-tagline">Your smart Mumbai local companion</p>
            </div>
          </div>
          <div className="header-right">
            <div className="header-time">
              <span className="time-value">{formatTime(time)}</span>
              <span className="time-date">{formatDate(time)}</span>
            </div>
            <div className={`connection-status ${state.isOnline ? 'online' : 'offline'}`}>
              <span className="status-dot-header"></span>
              <span className="status-label">{state.isOnline ? 'Live' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
