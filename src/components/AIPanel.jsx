import { useState } from 'react';
import './AIPanel.css';

export default function AIPanel({ insights }) {
  const [expanded, setExpanded] = useState(true);

  if (!insights || insights.length === 0) return null;

  return (
    <div className="ai-panel">
      <button className="ai-panel-header" onClick={() => setExpanded(!expanded)}>
        <div className="ai-panel-title">
          <span className="ai-sparkle">✨</span>
          <h3>AI Insights</h3>
        </div>
        <svg 
          className={`ai-chevron ${expanded ? 'expanded' : ''}`} 
          width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      {expanded && (
        <div className="ai-panel-body">
          {insights.map((insight, index) => (
            <div 
              key={index} 
              className={`ai-insight ai-insight-${insight.type}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className="insight-icon">{insight.icon}</span>
              <div className="insight-content">
                <span className="insight-title">{insight.title}</span>
                <p className="insight-message">{insight.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
