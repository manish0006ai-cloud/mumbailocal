import { useEffect, useState, useMemo } from 'react';
import { getLineInfo, getStationsOnLine } from '../data/stations';
import { FAST_SKIP_WESTERN, FAST_SKIP_CENTRAL } from '../data/trainGenerator';
import './RouteMap.css';

export default function RouteMap({ route, source, destination, isFast = false, train }) {
  const [trainPosition, setTrainPosition] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Calculate actual train position based on time
  useEffect(() => {
    if (!train || !route || !route.stations) return;
    
    const updatePosition = () => {
      const now = new Date();
      const [depH, depM] = train.departureTime.split(':').map(Number);
      const depDate = new Date();
      depDate.setHours(depH, depM + (train.delay || 0), 0, 0);
      
      const elapsedMs = now - depDate;
      const durationMs = train.duration * 60 * 1000;
      
      if (elapsedMs < 0) {
        // Train is approaching. Calculate how far back it is based on average time between stations.
        const minsAway = Math.abs(elapsedMs) / 60000;
        const avgMinsBetweenStops = train.duration / (route.stations.length - 1);
        const stopsAway = minsAway / avgMinsBetweenStops;
        setTrainPosition(- (stopsAway / (route.stations.length - 1)) * 100);
      } else if (elapsedMs >= durationMs) {
        setTrainPosition(100); // Reached destination
      } else {
        setTrainPosition((elapsedMs / durationMs) * 100);
      }
    };

    updatePosition();
    const interval = setInterval(updatePosition, 1000); // Update every second
    return () => clearInterval(interval);
  }, [train, route]);

  const handleGPS = () => {
    setGpsLoading(true);
    // Simulate GPS fetch
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setTimeout(() => {
            setGpsLoading(false);
            setIsTracking(true);
          }, 1500);
        },
        () => {
          setTimeout(() => {
            setGpsLoading(false);
            setIsTracking(true);
          }, 1000);
        },
        { timeout: 5000 } // Added timeout to prevent hanging if system location is disabled
      );
    } else {
      setTimeout(() => {
        setGpsLoading(false);
        setIsTracking(true);
      }, 1000);
    }
  };

  const approachingText = useMemo(() => {
    if (trainPosition >= 0 || !route || !route.stations || !train) return '';
    
    const lineStations = getStationsOnLine(route.line);
    const srcIdx = lineStations.findIndex(s => s.name === train.source);
    const dstIdx = lineStations.findIndex(s => s.name === train.destination);
    
    if (srcIdx === -1 || dstIdx === -1) return 'Approaching...';
    
    const direction = srcIdx < dstIdx ? -1 : 1;
    
    // Calculate how many actual stops away the train is based on time.
    const routeTotalStops = route.stations.length - 1;
    const stopsAwayRound = Math.max(1, Math.floor((Math.abs(trainPosition) / 100) * routeTotalStops));
    
    const prevIdx = srcIdx + (direction * stopsAwayRound);
    
    if (prevIdx >= 0 && prevIdx < lineStations.length) {
      return `Passed ${lineStations[prevIdx].name}`;
    } else {
      return 'Leaving Yard';
    }
  }, [trainPosition, route, train]);

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

  const spacing = 110; 
  const width = Math.max(totalStations * spacing, 300);

  // Train actual visual X position (clamped so it doesn't go off screen)
  const trainVisualXRaw = 60 + (totalStations - 1) * spacing * (trainPosition / 100);
  const trainVisualX = Math.max(-40, trainVisualXRaw);
  
  // User visual X position (waits at origin until train arrives, then boards and travels)
  const userVisualX = 60 + (totalStations - 1) * spacing * (Math.max(0, trainPosition) / 100);

  const calculateStationTime = (index, total) => {
    if (!train || !train.departureTime) return '';
    const [h, m] = train.departureTime.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m + (train.delay || 0), 0, 0);
    
    // Add proportional duration
    const progress = index / Math.max(1, total - 1);
    const minsToAdd = Math.round(progress * train.duration);
    
    date.setMinutes(date.getMinutes() + minsToAdd);
    
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="route-map">
      <div className="route-map-header">
        <h3 className="route-map-title">Live Train Tracking</h3>
        <div className="route-map-meta">
          <button 
            className={`gps-btn ${gpsLoading ? 'loading' : ''} ${isTracking ? 'active' : ''}`}
            onClick={handleGPS}
            disabled={gpsLoading}
          >
            {gpsLoading ? 'Locating...' : isTracking ? '📍 Location Found' : '📍 Track My Train'}
          </button>
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
            viewBox={`-80 0 ${width + 140} 120`}
            preserveAspectRatio="xMinYMid meet"
          >
            {/* Main Route Line (extended to the left for approaching trains) */}
            <line
              x1="-80" y1="60"
              x2={60 + (totalStations - 1) * spacing} y2="60"
              stroke={lineColor}
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.2"
            />

            {/* Traveled progress line (only draws if train has reached at least the start) */}
            {trainPosition >= 0 && (
              <line
                x1="60" y1="60"
                x2={trainVisualX} y2="60"
                stroke={lineColor}
                strokeWidth="4"
                strokeLinecap="round"
              />
            )}

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
                  <text
                    x={x} y={i % 2 === 0 ? 25 : 105}
                    textAnchor="middle"
                    fill={isFirst || isLast ? 'var(--text-primary)' : stops ? 'var(--text-secondary)' : 'var(--text-muted)'}
                    fontSize={isFirst || isLast ? "11" : "9"}
                    fontWeight={isFirst || isLast ? "800" : "600"}
                    fontFamily="Outfit, sans-serif"
                    className="station-label"
                  >
                    {station.name}
                  </text>

                  {/* Station Arrival Time */}
                  <text
                    x={x} y={i % 2 === 0 ? 39 : 91}
                    textAnchor="middle"
                    fill="var(--text-secondary)"
                    fontSize="10"
                    fontWeight="500"
                    fontFamily="Outfit, monospace"
                    opacity="0.85"
                  >
                    {calculateStationTime(i, totalStations)}
                  </text>
                  
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

                  {isInterchange && stops && (
                    <circle cx={x} cy={60} r="12" fill="none" stroke={lineColor} strokeWidth="0.5" opacity="0.3">
                      <animate attributeName="r" values="10;14;10" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* GPS User Indicator */}
            {isTracking && (
              <g transform={`translate(${userVisualX}, 40)`} className="user-gps-marker">
                <circle r="14" fill="var(--accent-green)" opacity="0.2">
                  <animate attributeName="r" values="14;20;14" dur="2s" repeatCount="indefinite"/>
                </circle>
                <text y="2" textAnchor="middle" fontSize="16" dominantBaseline="central">🧍</text>
              </g>
            )}

            {/* Train indicator */}
            <g transform={`translate(${trainVisualX}, 60)`} className="live-train-marker">
              <circle r="10" fill={lineColor} opacity="0.4">
                <animate attributeName="r" values="10;16;10" dur="1.5s" repeatCount="indefinite"/>
              </circle>
              <circle r="6" fill={lineColor} />
              <text y="1" textAnchor="middle" fontSize="16" dominantBaseline="central">🚆</text>
              {trainPosition < 0 && (
                <text y="-20" textAnchor="middle" fontSize="11" fill="var(--accent-yellow)" fontWeight="600" style={{ whiteSpace: 'nowrap' }}>
                  {approachingText}
                </text>
              )}
            </g>
          </svg>
        </div>
      </div>

      <div className="route-map-footer">
        <div className="stopping-legend">
          <div className="legend-item">
            <span className="legend-dot" style={{ background: lineColor }}></span>
            <span>Stops</span>
          </div>
          <div className="legend-item">
            <span className="legend-skip">❌</span>
            <span>Skips</span>
          </div>
          <div className="legend-item">
            <span style={{ fontSize: '12px' }}>🧍</span>
            <span>You</span>
          </div>
        </div>
        
        <div className="route-line-label">
          <div className="line-dot" style={{ background: lineColor }}></div>
          <span>{lineInfo?.name} Line</span>
        </div>
      </div>
    </div>
  );
}
