import { getCrowdTimeline } from '../data/aiEngine';
import './CrowdPrediction.css';

export default function CrowdPrediction({ train }) {
  const timeline = getCrowdTimeline();
  const currentHour = new Date().getHours();

  return (
    <div className="crowd-prediction">
      <div className="crowd-header">
        <h3 className="crowd-title">📊 Crowd Prediction</h3>
        <span className="crowd-subtitle">Today's forecast</span>
      </div>

      {/* Current Train Crowd Gauge */}
      {train && (
        <div className="crowd-gauge-section">
          <div className="gauge-row">
            <div className="gauge-item">
              <div className="gauge-circle">
                <svg viewBox="0 0 36 36" className="gauge-svg">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={train.seatProbability > 50 ? 'var(--accent-green)' : train.seatProbability > 20 ? 'var(--accent-yellow)' : 'var(--accent-red)'}
                    strokeWidth="3"
                    strokeDasharray={`${train.seatProbability}, 100`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 1s ease' }}
                  />
                </svg>
                <div className="gauge-value">
                  <span className="gauge-number">{train.seatProbability}%</span>
                </div>
              </div>
              <span className="gauge-label">💺 Seat</span>
            </div>
            <div className="gauge-item">
              <div className="gauge-circle">
                <svg viewBox="0 0 36 36" className="gauge-svg">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="var(--accent-orange)"
                    strokeWidth="3"
                    strokeDasharray={`${train.standingProbability}, 100`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 1s ease' }}
                  />
                </svg>
                <div className="gauge-value">
                  <span className="gauge-number">{train.standingProbability}%</span>
                </div>
              </div>
              <span className="gauge-label">🧍 Standing</span>
            </div>
          </div>
          <div className="coach-suggestion">
            <span className="coach-icon">💡</span>
            <span className="coach-text">{train.coachSuggestion}</span>
          </div>
        </div>
      )}

      {/* Timeline Chart */}
      <div className="crowd-timeline">
        <div className="timeline-bars">
          {timeline.map((entry) => {
            const isCurrent = entry.hour === currentHour;
            return (
              <div key={entry.hour} className={`timeline-bar-wrapper ${isCurrent ? 'current' : ''}`}>
                <div 
                  className="timeline-bar"
                  style={{ 
                    height: `${entry.level}%`,
                    background: entry.level > 70 ? 'var(--accent-red)' : entry.level > 40 ? 'var(--accent-yellow)' : 'var(--accent-green)',
                    opacity: isCurrent ? 1 : 0.5
                  }}
                ></div>
                <span className="timeline-label">{entry.label}</span>
                {isCurrent && <div className="timeline-now-dot"></div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
