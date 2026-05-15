import './TrainList.css';

export default function TrainList({ trains, badges, onTrainSelect, onViewSchedule }) {
  if (!trains || trains.length === 0) return null;

  const crowdConfig = {
    low: { label: 'Low', color: 'var(--crowd-low)' },
    medium: { label: 'Med', color: 'var(--crowd-medium)' },
    heavy: { label: 'Heavy', color: 'var(--crowd-heavy)' },
  };

  return (
    <div className="train-list">
      <div className="train-list-header">
        <h3 className="train-list-title">Upcoming Trains</h3>
        <span className="train-list-count">{trains.length} trains</span>
      </div>

      <div className="train-list-items">
        {trains.map((train, index) => {
          const crowd = crowdConfig[train.crowd] || crowdConfig.medium;
          const badge = badges?.[train.id];
          
          return (
            <div
              key={train.id}
              className={`train-card ${train.isFast ? 'train-fast' : 'train-slow'}`}
              style={{ animationDelay: `${index * 0.06}s`, cursor: 'pointer' }}
              onClick={() => onTrainSelect?.(train)}
            >
              {/* Left color strip */}
              <div className={`train-strip ${train.isFast ? 'strip-fast' : 'strip-slow'}`}></div>
              
              <div className="train-card-body">
                {/* Top row */}
                <div className="train-top-row">
                  <div className="train-times">
                    <span className="train-dep-time">{train.departureTime}</span>
                    <svg className="train-arrow-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14m-4-4 4 4-4 4"/>
                    </svg>
                    <span className="train-arr-time">{train.arrivalTime}</span>
                  </div>
                  <div className="train-info-text">
                    <span className="train-name-display">{train.name}</span>
                    <span className="train-num-display">{train.number}</span>
                  </div>
                  <div className="train-badges-row">
                    <button 
                      className="list-schedule-btn" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewSchedule?.(train);
                      }}
                      title="View full schedule"
                    >
                      🕒
                    </button>
                    <span className={`badge-sm ${train.isFast ? 'badge-sm-fast' : 'badge-sm-slow'}`}>
                      {train.isFast ? 'FAST' : 'SLOW'}
                    </span>
                    {badge && <span className="badge-sm badge-sm-ai">✨ {badge}</span>}
                  </div>
                </div>

                {/* Bottom row */}
                <div className="train-bottom-row">
                  <div className="train-meta-items">
                    <span className="train-meta-item">
                      🚉 P{train.platform}
                    </span>
                    <span className="train-meta-item" style={{ color: crowd.color }}>
                      {crowd.label}
                    </span>
                    <span className="train-meta-item">
                      {train.duration}m
                    </span>
                    <span className="train-meta-item">
                      {train.stops} stops
                    </span>
                    {train.delay > 0 && (
                      <span className="train-meta-item train-delay">
                        +{train.delay}m
                      </span>
                    )}
                  </div>
                  <div className="train-mins-away">
                    <span className="mins-number">{train.minsFromNow}</span>
                    <span className="mins-label">min</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
