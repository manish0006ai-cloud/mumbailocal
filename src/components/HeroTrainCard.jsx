import { useState, useEffect, useRef, useMemo } from 'react';
import { getCountdownText } from '../data/trainGenerator';
import './HeroTrainCard.css';

export default function HeroTrainCard({ train, badge, insights = [] }) {
  const [now, setNow] = useState(Date.now());
  const [departed, setDeparted] = useState(false);
  
  // Find interchange info if it exists
  const interchangeInsight = useMemo(() => {
    return insights.find(i => i.type === 'interchange');
  }, [insights]);
  
  // The target departure time = when this train was loaded + minsFromNow offset
  // We use a ref so it survives re-renders but can be reset on train change
  const targetRef = useRef(Date.now() + train.minsFromNow * 60 * 1000 + 59 * 1000);

  // Reset when a different train is loaded
  useEffect(() => {
    targetRef.current = Date.now() + train.minsFromNow * 60 * 1000 + 59 * 1000;
    setDeparted(false);
    setNow(Date.now());
  }, [train.id]);

  // Tick the clock every second
  useEffect(() => {
    if (departed) return;

    const interval = setInterval(() => {
      const current = Date.now();
      setNow(current);

      if (current >= targetRef.current) {
        setDeparted(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [departed]);

  // Derive countdown and seconds from clock vs target
  const diffMs = Math.max(0, targetRef.current - now);
  const totalSeconds = Math.ceil(diffMs / 1000);
  const countdown = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const crowdConfig = {
    low: { label: 'Low Crowd', color: 'var(--crowd-low)', icon: '👤' },
    medium: { label: 'Medium Crowd', color: 'var(--crowd-medium)', icon: '👥' },
    heavy: { label: 'Heavy Crowd', color: 'var(--crowd-heavy)', icon: '🧑‍🤝‍🧑' },
  };

  const crowd = crowdConfig[train.crowd] || crowdConfig.medium;

  return (
    <div className={`hero-card ${train.isFast ? 'hero-fast' : 'hero-slow'} ${departed ? 'hero-departed' : ''}`}>
      {/* Glow Background */}
      <div className="hero-glow"></div>

      {/* Departed Overlay */}
      {departed && (
        <div className="departed-overlay">
          <div className="departed-content">
            {/* Railway Track */}
            <div className="departed-railway">
              <div className="railway-track">
                <div className="track-sleepers">
                  {[...Array(24)].map((_, i) => <span key={i} className="sleeper"></span>)}
                </div>
                <div className="track-rail track-rail-top"></div>
                <div className="track-rail track-rail-bottom"></div>
              </div>

              {/* Locomotive - enters first */}
              <div className="train-part locomotive-part">
                {/* Smoke Puffs */}
                <div className="smoke-stack">
                  <div className="smoke-puff puff-1"></div>
                  <div className="smoke-puff puff-2"></div>
                  <div className="smoke-puff puff-3"></div>
                  <div className="smoke-puff puff-4"></div>
                  <div className="smoke-puff puff-5"></div>
                </div>

                <div className="train-engine">
                  <div className="engine-chimney"></div>
                  <div className="engine-dome"></div>
                  <div className="engine-body">
                    <div className="engine-window"></div>
                    <div className="engine-detail"></div>
                  </div>
                  <div className="engine-front"></div>
                  <div className="engine-wheels">
                    <div className="wheel wheel-lg"><div className="wheel-spoke"></div></div>
                    <div className="wheel wheel-lg"><div className="wheel-spoke"></div></div>
                    <div className="wheel wheel-sm"><div className="wheel-spoke"></div></div>
                  </div>
                  <div className="cow-catcher"></div>
                </div>
              </div>

              {/* Coach 1 - follows locomotive */}
              <div className="train-part coach-part coach-1-part">
                <div className="train-bogie bogie-1">
                  <div className="bogie-body">
                    <div className="bogie-window"></div>
                    <div className="bogie-window"></div>
                    <div className="bogie-window"></div>
                  </div>
                  <div className="bogie-connector"></div>
                  <div className="bogie-wheels">
                    <div className="wheel wheel-md"><div className="wheel-spoke"></div></div>
                    <div className="wheel wheel-md"><div className="wheel-spoke"></div></div>
                  </div>
                </div>
              </div>

              {/* Coach 2 - follows coach 1 */}
              <div className="train-part coach-part coach-2-part">
                <div className="train-bogie bogie-2">
                  <div className="bogie-body">
                    <div className="bogie-window"></div>
                    <div className="bogie-window"></div>
                    <div className="bogie-window"></div>
                  </div>
                  <div className="bogie-connector"></div>
                  <div className="bogie-wheels">
                    <div className="wheel wheel-md"><div className="wheel-spoke"></div></div>
                    <div className="wheel wheel-md"><div className="wheel-spoke"></div></div>
                  </div>
                </div>
              </div>

              {/* Coach 3 - last to leave */}
              <div className="train-part coach-part coach-3-part">
                <div className="train-bogie bogie-3">
                  <div className="bogie-body">
                    <div className="bogie-window"></div>
                    <div className="bogie-window"></div>
                    <div className="bogie-window"></div>
                  </div>
                  <div className="bogie-wheels">
                    <div className="wheel wheel-md"><div className="wheel-spoke"></div></div>
                    <div className="wheel wheel-md"><div className="wheel-spoke"></div></div>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="departed-title">Train has departed</h3>
            <p className="departed-sub">
              {train.departureTime} {train.type} to {train.destination}
            </p>
            <p className="departed-warning">
              ⚠️ Don't try to catch a running train, it might be dangerous!
            </p>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="hero-header">
        <div className="hero-header-left">
          <span className="hero-label">{departed ? 'DEPARTED' : 'NEXT TRAIN'}</span>
          <div className="hero-status-row">
            <span className={`status-dot ${departed ? 'departed' : train.status}`}></span>
            <span className="hero-status-text">
              {departed ? 'Left the station' : train.status === 'on-time' ? 'On Time' : train.status === 'slight-delay' ? `~${train.delay} min delay` : `${train.delay} min delay`}
            </span>
          </div>
          <div className="hero-train-ident">
            <span className="hero-train-name">{train.name}</span>
            <span className="hero-train-number">{train.number}</span>
          </div>
        </div>
        <div className="hero-badges">
          <span className={`badge ${train.isFast ? 'badge-fast' : 'badge-slow'}`}>
            {train.isFast ? '⚡ FAST' : '🔵 SLOW'}
          </span>
          {train.route?.type === 'interchange' && !departed && (
            <span className="badge badge-interchange">🔄 INTERCHANGE</span>
          )}
          {badge && !departed && <span className="badge badge-ai">✨ {badge}</span>}
        </div>
      </div>

      {/* Countdown — The HERO Element */}
      {!departed && (
        <div className="hero-countdown-section">
          <div className="hero-countdown" key={countdown}>
            <span className="countdown-number">{countdown}</span>
            <div className="countdown-meta">
              <span className="countdown-unit">min</span>
              <span className="countdown-seconds">{String(seconds).padStart(2, '0')}s</span>
            </div>
          </div>
          <p className="countdown-text">{getCountdownText(countdown)}</p>
        </div>
      )}

      {/* Route Info */}
      <div className="hero-route">
        <div className="hero-station">
          <span className="hero-time">{train.departureTime}</span>
          <span className="hero-station-name">{train.source}</span>
        </div>
        <div className="hero-arrow">
          <div className="arrow-line">
            <div className="arrow-train-icon">🚆</div>
          </div>
          <span className="arrow-duration">{train.duration} min</span>
        </div>
        <div className="hero-station">
          <span className="hero-time">{train.arrivalTime}</span>
          <span className="hero-station-name">{train.destination}</span>
        </div>
      </div>

      {/* Interchange Guide Section */}
      {interchangeInsight && !departed && (
        <div className="hero-interchange-guide">
          <div className="interchange-header">
            <span className="interchange-icon">🔄</span>
            <span className="interchange-title">Interchange Guide</span>
          </div>
          <div className="interchange-content">
            <div className="interchange-step">
              <div className="step-marker">1</div>
              <div className="step-text">Get off at <span className="highlight">{train.destination}</span></div>
            </div>
            <div className="interchange-connector-v"></div>
            <div className="interchange-step">
              <div className="step-marker">2</div>
              <div className="step-text">
                {interchangeInsight.connection ? (
                  <>Catch the <span className="highlight">{interchangeInsight.connection.departureTime} {interchangeInsight.connection.type}</span> train to <span className="highlight">{interchangeInsight.connection.destination}</span>.</>
                ) : (
                  <>Check indicators for the next train to <span className="highlight">{train.finalDestination || 'your destination'}</span>.</>
                )}
              </div>
            </div>
            
            {interchangeInsight.connection2 && (
              <>
                <div className="interchange-connector-v"></div>
                <div className="interchange-step">
                  <div className="step-marker">3</div>
                  <div className="step-text">
                    Catch the <span className="highlight">{interchangeInsight.connection2.departureTime} {interchangeInsight.connection2.type}</span> train to <span className="highlight">{train.finalDestination}</span>.
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Connecting Train Tracker - Leg 2 */}
          {interchangeInsight.connection && (
            <div className="hero-route connection-route">
              <div className="hero-station">
                <span className="hero-time">{interchangeInsight.connection.departureTime}</span>
                <span className="hero-station-name">{interchangeInsight.connection.source}</span>
              </div>
              <div className="hero-arrow">
                <div className="arrow-line connection-line">
                  <div className="arrow-train-icon">🚆</div>
                </div>
                <span className="arrow-duration">{interchangeInsight.connection.duration} min</span>
              </div>
              <div className="hero-station">
                <span className="hero-time">{interchangeInsight.connection.arrivalTime}</span>
                <span className="hero-station-name">{interchangeInsight.connection.destination}</span>
              </div>
            </div>
          )}

          {/* Connecting Train Tracker - Leg 3 */}
          {interchangeInsight.connection2 && (
            <div className="hero-route connection-route leg-3">
              <div className="hero-station">
                <span className="hero-time">{interchangeInsight.connection2.departureTime}</span>
                <span className="hero-station-name">{interchangeInsight.connection2.source}</span>
              </div>
              <div className="hero-arrow">
                <div className="arrow-line connection-line">
                  <div className="arrow-train-icon">🚆</div>
                </div>
                <span className="arrow-duration">{interchangeInsight.connection2.duration} min</span>
              </div>
              <div className="hero-station">
                <span className="hero-time">{interchangeInsight.connection2.arrivalTime}</span>
                <span className="hero-station-name">{interchangeInsight.connection2.destination}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Info */}
      <div className="hero-footer">
        <div className="hero-info-chip">
          <span className="chip-icon">🚉</span>
          <span>Platform {train.platform}</span>
        </div>
        <div className="hero-info-chip">
          <span className="chip-icon" style={{ color: crowd.color }}>{crowd.icon}</span>
          <span style={{ color: crowd.color }}>{crowd.label}</span>
        </div>
        <div className="hero-info-chip">
          <span className="chip-icon">📍</span>
          <span>{train.stops} stops</span>
        </div>
      </div>

      {/* Seat Probability Bar */}
      <div className="hero-seat-bar">
        <div className="seat-bar-label">
          <span>💺 Seat Probability</span>
          <span className="seat-percentage">{train.seatProbability}%</span>
        </div>
        <div className="seat-bar-track">
          <div 
            className="seat-bar-fill" 
            style={{ 
              width: `${train.seatProbability}%`,
              background: train.seatProbability > 50 ? 'var(--accent-green)' : train.seatProbability > 20 ? 'var(--accent-yellow)' : 'var(--accent-red)'
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
