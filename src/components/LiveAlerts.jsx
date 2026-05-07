import { useEffect, useState } from 'react';
import './LiveAlerts.css';

export default function LiveAlerts({ alerts }) {
  const [visibleAlerts, setVisibleAlerts] = useState([]);

  useEffect(() => {
    setVisibleAlerts(alerts);
  }, [alerts]);

  const dismissAlert = (id) => {
    setVisibleAlerts(prev => prev.filter(a => a.id !== id));
  };

  if (!visibleAlerts || visibleAlerts.length === 0) return null;

  return (
    <div className="live-alerts">
      <div className="live-alerts-header">
        <h3 className="live-alerts-title">📡 Live Status</h3>
      </div>

      <div className="alerts-list">
        {visibleAlerts.map((alert, index) => (
          <div
            key={alert.id}
            className={`alert-banner alert-${alert.color}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="alert-indicator">
              <span className={`alert-dot alert-dot-${alert.color}`}></span>
            </div>
            <div className="alert-body">
              <div className="alert-top-row">
                <span className="alert-icon">{alert.icon}</span>
                <span className="alert-title">{alert.title}</span>
              </div>
              <p className="alert-message">{alert.message}</p>
            </div>
            {alert.severity !== 'low' && (
              <button className="alert-dismiss" onClick={() => dismissAlert(alert.id)}>✕</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
