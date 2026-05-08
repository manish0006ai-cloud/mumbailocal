import { useEffect, useState, useMemo } from 'react';
import { getLineInfo } from '../data/stations';
import { FAST_SKIP_WESTERN, FAST_SKIP_CENTRAL } from '../data/trainGenerator';
import './RouteMap.css';

export default function RouteMap({ route, source, destination, isFast = false }) {
  const [trainPosition, setTrainPosition] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTrainPosition(prev => (prev >= 100 ? 0 : prev + 0.5));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  if (!route || !route.stations || route.stations.length < 2) return null;

  const lineInfo = getLineInfo(route.line);
  const lineColor = lineInfo?.color || '#22d3ee';
  const stations = route.stations;
  const totalStations = stations.length;

  const skipList = useMemo(() => {
    if (!isFast) return [];
    if (route.line === 'western') return FAST_SKIP_WESTERN;
    if (route.line === 'central') return FAST_SKIP_CENTRAL;
    return [];
  }, [isFast, route.line]);

  const spacing = 110; // Increased spacing for text readability
  const width = Math.max(totalStations * spacing, 300);

  return (
    <div className="route-map">
      <div className="route-map-header">
        <h3 className="route-map-title">Route Map</h3>
        <div className="route-map-meta">
          <span className="route-stops">{route.stops} stops</span>
          {route.type === 'interchange' && (
            <span className="route-interchange-badge">🔄 {route.interchange?.note}</span>
          )}
        </div>
      </div>

      <div className="route-scroll-container">
        <div className="route-map-visual">
          <svg 
            className="route-svg" 
            viewBox={`0 0 ${width + 60} 120`}
            preserveAspectRatio="xMinYMid meet"
          >
            {/* Main Route Line */}
            <line
              x1="60" y1="60"
              x2={60 + (totalStations - 1) * spacing} y2="60"
              stroke={lineColor}
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.2"
            />

            {/* Animated progress line */}
            <line
              x1="60" y1="60"
              x2={60 + (totalStations - 1) * spacing * (trainPosition / 100)} y2="60"
              stroke={lineColor}
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Station Dots */}
            {stations.map((station, i) => {
              const x = 60 + i * spacing;
              const isFirst = i === 0;
              const isLast = i === totalStations - 1;
              const stops = !skipList.includes(station.id);
              const isInterchange = station.interchange?.length > 0;
              const passed = (i / (totalStations - 1)) * 100 <= trainPosition;

              return (
                <g key={station.id || i}>
                  {/* Station name (Full name now visible) */}
                  <text
                    x={x} y={i % 2 === 0 ? 30 : 100}
                    textAnchor="middle"
                    fill={isFirst || isLast ? 'var(--text-primary)' : stops ? 'var(--text-secondary)' : 'var(--text-muted)'}
                    fontSize={isFirst || isLast ? "11" : "9"}
                    fontWeight={isFirst || isLast ? "800" : "600"}
                    fontFamily="Outfit, sans-serif"
                    className="station-label"
                  >
                    {station.name}
                  </text>
                  
                  {/* Station dot or skip marker */}
                  {stops ? (
                    <circle
                      cx={x} cy={60}
                      r={isFirst || isLast ? 8 : isInterchange ? 6 : 5}
                      fill={passed ? lineColor : 'var(--bg-secondary)'}
                      stroke={lineColor}
                      strokeWidth={isFirst || isLast ? 3 : 2}
                      className={passed ? 'dot-active' : ''}
                    />
                  ) : (
                    <g className="skip-marker">
                      <circle
                        cx={x} cy={60} r="4"
                        fill="none"
                        stroke="var(--text-muted)"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />
                      <line x1={x-3} y1="57" x2={x+3} y2="63" stroke="var(--accent-red)" strokeWidth="1" />
                      <line x1={x-3} y1="63" x2={x+3} y2="57" stroke="var(--accent-red)" strokeWidth="1" />
                    </g>
                  )}

                  {/* Interchange marker */}
                  {isInterchange && stops && (
                    <circle cx={x} cy={60} r="12" fill="none" stroke={lineColor} strokeWidth="0.5" opacity="0.3">
                      <animate attributeName="r" values="10;14;10" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* Moving train indicator */}
            <g transform={`translate(${60 + (totalStations - 1) * spacing * (trainPosition / 100)}, 60)`}>
              <circle r="6" fill={lineColor} opacity="0.3">
                <animate attributeName="r" values="6;12;6" dur="1.5s" repeatCount="indefinite"/>
              </circle>
              <text y="1" textAnchor="middle" fontSize="14" dominantBaseline="central">🚆</text>
            </g>
          </svg>
        </div>
      </div>

      {/* Stopping Pattern Legend */}
      <div className="route-map-footer">
        <div className="stopping-legend">
          <div className="legend-item">
            <span className="legend-dot" style={{ background: lineColor }}></span>
            <span>Stops</span>
          </div>
          <div className="legend-item">
            <span className="legend-skip">❌</span>
            <span>Skips (Fast)</span>
          </div>
        </div>
        
        <div className="route-line-label">
          <div className="line-dot" style={{ background: lineColor }}></div>
          <span>{lineInfo?.name} Line</span>
          {route.line2 && (
            <>
              <span className="line-separator">→</span>
              <div className="line-dot" style={{ background: getLineInfo(route.line2)?.color }}></div>
              <span>{getLineInfo(route.line2)?.name} Line</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
