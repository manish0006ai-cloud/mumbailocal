import { useEffect, useState } from 'react';
import { getLineInfo } from '../data/stations';
import './RouteMap.css';

export default function RouteMap({ route, source, destination }) {
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

      <div className="route-map-visual">
        <svg 
          className="route-svg" 
          viewBox={`0 0 ${Math.max(totalStations * 60, 300)} 80`}
          preserveAspectRatio="xMinYMid meet"
        >
          {/* Main Route Line */}
          <line
            x1="30" y1="40"
            x2={30 + (totalStations - 1) * 55} y2="40"
            stroke={lineColor}
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.3"
          />

          {/* Animated progress line */}
          <line
            x1="30" y1="40"
            x2={30 + (totalStations - 1) * 55 * (trainPosition / 100)} y2="40"
            stroke={lineColor}
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Station Dots */}
          {stations.map((station, i) => {
            const x = 30 + i * 55;
            const isFirst = i === 0;
            const isLast = i === totalStations - 1;
            const isInterchange = station.interchange?.length > 0;
            const passed = (i / (totalStations - 1)) * 100 <= trainPosition;

            return (
              <g key={station.id || i}>
                {/* Outer glow for endpoints */}
                {(isFirst || isLast) && (
                  <circle
                    cx={x} cy={40} r={10}
                    fill="none"
                    stroke={lineColor}
                    strokeWidth="1"
                    opacity="0.3"
                  />
                )}
                
                {/* Station dot */}
                <circle
                  cx={x} cy={40}
                  r={isFirst || isLast ? 7 : isInterchange ? 6 : 4}
                  fill={passed ? lineColor : 'var(--bg-secondary)'}
                  stroke={lineColor}
                  strokeWidth={isFirst || isLast ? 2.5 : 1.5}
                />
                
                {/* Station name */}
                <text
                  x={x} y={isFirst || isLast || i % 2 === 0 ? 16 : 65}
                  textAnchor="middle"
                  fill={isFirst || isLast ? 'var(--text-primary)' : 'var(--text-tertiary)'}
                  fontSize={isFirst || isLast ? "9" : "7.5"}
                  fontWeight={isFirst || isLast ? "700" : "400"}
                  fontFamily="Inter, sans-serif"
                >
                  {station.code || station.name?.substring(0, 4)}
                </text>
              </g>
            );
          })}

          {/* Moving train indicator */}
          <g transform={`translate(${30 + (totalStations - 1) * 55 * (trainPosition / 100)}, 40)`}>
            <circle r="5" fill={lineColor} opacity="0.2">
              <animate attributeName="r" values="5;10;5" dur="1.5s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.3;0;0.3" dur="1.5s" repeatCount="indefinite"/>
            </circle>
            <text y="1" textAnchor="middle" fontSize="10" dominantBaseline="central">🚆</text>
          </g>
        </svg>
      </div>

      {/* Line Label */}
      <div className="route-line-label">
        <div className="line-dot" style={{ background: lineColor }}></div>
        <span>{lineInfo?.name || 'Line'} Line</span>
        {route.line2 && (
          <>
            <span className="line-separator">→</span>
            <div className="line-dot" style={{ background: getLineInfo(route.line2)?.color }}></div>
            <span>{getLineInfo(route.line2)?.name} Line</span>
          </>
        )}
      </div>
    </div>
  );
}
