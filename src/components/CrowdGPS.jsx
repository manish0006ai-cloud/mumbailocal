import { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RAILWAY_CORRIDORS } from '../data/railwayCorridors';
import { generateLiveTrainClusters, generateLineSummary, generateStationCrowdSummary } from '../data/trainSimulator';
import accurateTimetable from '../data/accurate_timetable.json';
import './CrowdGPS.css';

const LINE_COLORS = {
  'Western': '#22d3ee',
  'Central': '#f43f5e',
  'Harbour': '#a78bfa',
  'Trans Harbour': '#34d399',
};

const CROWD_ICONS = { low: '🟢', medium: '🟡', heavy: '🟠', extreme: '🔴' };
const CROWD_LABELS = { low: 'Low', medium: 'Medium', heavy: 'Heavy', extreme: 'Extreme' };

function createTrainIcon(color, crowdLevel, isTracked = false) {
  const size = crowdLevel === 'extreme' ? 18 : crowdLevel === 'heavy' ? 15 : 12;
  const extraClass = crowdLevel === 'extreme' ? ' extreme' : '';
  const trackedClass = isTracked ? ' tracked-train' : '';
  return L.divIcon({
    className: '',
    html: `<div class="train-marker${extraClass}${trackedClass}" style="width:${size}px;height:${size}px;background:${color};"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function createStationIcon() {
  return L.divIcon({
    className: '',
    html: `<div class="station-marker-dot"></div>`,
    iconSize: [8, 8],
    iconAnchor: [4, 4],
  });
}

export default function CrowdGPS({ onClose, trackedTrainNo }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const trainLayerRef = useRef(null);

  const [gpsSharing, setGpsSharing] = useState(true);
  const [clusters, setClusters] = useState([]);
  const [lineSummary, setLineSummary] = useState([]);
  const [stationAlerts, setStationAlerts] = useState([]);
  const [panelExpanded, setPanelExpanded] = useState(true);
  const [trackedStatus, setTrackedStatus] = useState(null);

  // Initialize map
  useEffect(() => {
    if (mapInstanceRef.current) return;
    if (!mapRef.current) return;

    const map = L.map(mapRef.current, {
      center: [19.076, 72.877],
      zoom: 11,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
    }).addTo(map);

    // Draw railway corridors
    Object.values(RAILWAY_CORRIDORS).forEach(corridor => {
      const latlngs = corridor.stations.map(s => [s.lat, s.lng]);
      L.polyline(latlngs, {
        color: corridor.color,
        weight: 3,
        opacity: 0.5,
        dashArray: '8,6',
      }).addTo(map);

      // Station dots
      corridor.stations.forEach(stn => {
        L.marker([stn.lat, stn.lng], { icon: createStationIcon() })
          .bindTooltip(stn.name, {
            permanent: false,
            direction: 'top',
            className: 'station-tooltip',
            offset: [0, -6],
          })
          .addTo(map);
      });
    });

    trainLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update train positions
  const updateTrains = useCallback(() => {
    const allTrains = accurateTimetable?.trains || [];
    const newClusters = generateLiveTrainClusters(allTrains);
    setClusters(newClusters);
    setLineSummary(generateLineSummary(newClusters));
    setStationAlerts(generateStationCrowdSummary(newClusters).slice(0, 8));

    // Update map markers
    if (trainLayerRef.current) {
      trainLayerRef.current.clearLayers();

      // Open popup and center if this is the tracked train
      let trackedFound = false;
      newClusters.forEach(c => {
        const color = LINE_COLORS[c.line] || '#94a3b8';
        const isTracked = trackedTrainNo && String(c.trainNo) === String(trackedTrainNo);
        const icon = createTrainIcon(color, c.crowdLevel, isTracked);

        const popupHtml = `
          <div class="train-popup">
            <div class="train-popup-header">${c.trainNo} ${c.type}${c.isAC ? ' AC' : ''}</div>
            <div class="train-popup-line" style="background:${color}">${c.line} ${c.direction}</div>
            <div class="train-popup-detail">
              <b>${c.lastStation}</b> → <b>${c.nextStation}</b><br/>
              Speed: <b>${c.speed} km/h</b><br/>
              Crowd: <b>${CROWD_LABELS[c.crowdLevel]}</b> (${c.activeUsers} users)<br/>
              Confidence: <b>${Math.round(c.confidence * 100)}%</b>
            </div>
          </div>
        `;

        const marker = L.marker([c.lat, c.lng], { icon })
          .bindPopup(popupHtml, { maxWidth: 200 })
          .addTo(trainLayerRef.current);

        if (isTracked) {
          trackedFound = true;
          // Only center once on first load or if explicitly tracked
          if (mapInstanceRef.current && !trackedStatus) {
            mapInstanceRef.current.setView([c.lat, c.lng], 14);
            marker.openPopup();
            setTrackedStatus(`Tracking ${c.trainNo}`);
          }
        }
      });
      
      if (trackedTrainNo && !trackedFound && !trackedStatus) {
        setTrackedStatus(`Train ${trackedTrainNo} is not currently running.`);
      }
    }
  }, [trackedTrainNo, trackedStatus]);

  // Periodic refresh
  useEffect(() => {
    updateTrains();
    const interval = setInterval(updateTrains, 8000);
    return () => clearInterval(interval);
  }, [updateTrains]);

  const totalUsers = clusters.reduce((s, c) => s + c.activeUsers, 0);

  return (
    <div className="crowd-gps-overlay">
      {/* Top Bar */}
      <div className="crowd-gps-topbar">
        <div className="crowd-gps-topbar-left">
          <button className="crowd-gps-back-btn" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5m0 0 7 7m-7-7 7-7"/>
            </svg>
          </button>
          <div>
            <div className="crowd-gps-title">Crowd <span>GPS</span></div>
            <div className="crowd-gps-subtitle">Live Train Tracking</div>
          </div>
        </div>
        <div className="crowd-gps-topbar-right">
          <div className="live-pulse">
            <div className="live-dot"></div>
            LIVE
          </div>
          <div className="gps-toggle-container">
            <span className="gps-toggle-label">Share</span>
            <div
              className={`gps-toggle ${gpsSharing ? 'active' : ''}`}
              onClick={() => setGpsSharing(!gpsSharing)}
            >
              <div className="gps-toggle-knob"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="crowd-map-container">
        <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>

        {/* Floating badge */}
        <div className="crowd-gps-float-badge">
          {trackedStatus ? (
            <span style={{color: 'var(--accent-cyan)', fontWeight: 'bold'}}>📍 {trackedStatus}</span>
          ) : (
            <>
              <span>🚆</span>
              <strong>{clusters.length}</strong>
              <span>trains</span>
              <span>•</span>
              <strong>{totalUsers.toLocaleString()}</strong>
              <span>users</span>
            </>
          )}
        </div>
      </div>

      {/* Bottom Stats Panel */}
      <div className="crowd-stats-panel">
        <div className="crowd-panel-handle" onClick={() => setPanelExpanded(!panelExpanded)}></div>
        
        {panelExpanded && (
          <>
            <div className="crowd-stats-header">
              <div className="crowd-stats-title">Network Status</div>
              <div className="crowd-stats-count">{clusters.length} active clusters</div>
            </div>

            {/* Line Cards */}
            <div className="crowd-line-cards">
              {lineSummary.map(line => (
                <div className="crowd-line-card" key={line.name}>
                  <div className="crowd-line-card-header">
                    <div className="crowd-line-dot" style={{ background: LINE_COLORS[line.name] || '#94a3b8' }}></div>
                    <div className="crowd-line-name">{line.name}</div>
                  </div>
                  <div className="crowd-line-stats">
                    <div className="crowd-line-stat">
                      <span className="crowd-line-stat-label">Trains</span>
                      <span className="crowd-line-stat-value">{line.activeTrains}</span>
                    </div>
                    <div className="crowd-line-stat">
                      <span className="crowd-line-stat-label">Users</span>
                      <span className="crowd-line-stat-value">{line.totalUsers}</span>
                    </div>
                    <div className="crowd-line-stat">
                      <span className="crowd-line-stat-label">Avg Speed</span>
                      <span className="crowd-line-stat-value">{line.avgSpeed} km/h</span>
                    </div>
                    <div className="crowd-line-stat">
                      <span className="crowd-line-stat-label">Crowd</span>
                      <span className={`crowd-badge ${line.dominantCrowd}`}>
                        {CROWD_ICONS[line.dominantCrowd]} {CROWD_LABELS[line.dominantCrowd]}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Station Alerts */}
            {stationAlerts.length > 0 && (
              <div className="crowd-station-alerts">
                <div className="crowd-station-alert-title">🔥 Busiest Stations Right Now</div>
                <div className="crowd-station-list">
                  {stationAlerts.map((stn, i) => {
                    const lvl = stn.totalCrowd > 60 ? 'extreme' : stn.totalCrowd > 30 ? 'heavy' : stn.totalCrowd > 15 ? 'medium' : 'low';
                    return (
                      <div className="crowd-station-item" key={i}>
                        <span className="crowd-station-name">{stn.name}</span>
                        <div className="crowd-station-meta">
                          <span className="crowd-station-trains">{stn.approaching} trains approaching</span>
                          <span className={`crowd-badge ${lvl}`}>
                            {CROWD_ICONS[lvl]} {stn.totalCrowd}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
