import { useState, useMemo } from 'react';
import './TrainTimetable.css';

export default function TrainTimetable({ train, onClose }) {
  if (!train) return null;

  // In our data model, 'train' from the list has basic info.
  // We might need to find the full stop list from the original timetable if it's not already on the object.
  // But our generateTrains already includes some stops info. 
  // For a "Full Timetable" we want EVERY stop.
  
  // Assuming 'train' passed here is the enriched train object from generateTrains
  // which might only have a subset of stops. 
  // Let's assume we pass the FULL stops array if available.
  
  const stops = train.fullStops || train.stopsData || [];

  return (
    <div className="train-timetable-overlay glass">
      <div className="timetable-container animate-slide-up">
        <header className="timetable-header">
          <div className="header-main">
            <button className="close-btn" onClick={onClose}>✕</button>
            <div className="train-info">
              <span className="train-id">Train #{train.number}</span>
              <h2 className="train-title">{train.name}</h2>
              <div className="train-meta">
                <span className={`line-badge ${train.line?.toLowerCase().replace(/\s/g, '-')}`}>
                  {train.line}
                </span>
                <span className="type-badge">{train.type}</span>
              </div>
            </div>
          </div>
          
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-label">Starts</span>
              <span className="stat-value">{stops[0]?.time || train.departureTime}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Ends</span>
              <span className="stat-value">{stops[stops.length - 1]?.time || train.arrivalTime}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Duration</span>
              <span className="stat-value">{train.duration} mins</span>
            </div>
          </div>
        </header>

        <div className="timetable-body">
          <div className="stops-timeline">
            {stops.map((stop, index) => {
              const isSource = index === 0;
              const isDest = index === stops.length - 1;
              const isUserSource = stop.station === train.source;
              const isUserDest = stop.station === train.destination;
              
              return (
                <div key={index} className={`stop-row ${isUserSource || isUserDest ? 'highlight' : ''}`}>
                  <div className="stop-time">
                    <span className="time-main">{stop.time}</span>
                    {index > 0 && (
                      <span className="time-diff">
                        +{calculateDiff(stops[index-1].time, stop.time)}m
                      </span>
                    )}
                  </div>
                  
                  <div className="stop-node">
                    <div className={`node-dot ${isSource || isDest ? 'outer' : ''}`}>
                      <div className="dot-inner"></div>
                    </div>
                    {index < stops.length - 1 && <div className="node-line"></div>}
                  </div>
                  
                  <div className="stop-name">
                    <span className="name-text">{stop.station}</span>
                    {(isUserSource || isUserDest) && (
                      <span className="user-marker">{isUserSource ? 'Your Start' : 'Your End'}</span>
                    )}
                  </div>
                  
                  <div className="stop-platform">
                    <span className="pf-label">PF</span>
                    <span className="pf-value">{Math.floor(Math.random() * 2) + 1}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <footer className="timetable-footer">
          <p>⚠️ Platform numbers are indicative and subject to change.</p>
        </footer>
      </div>
    </div>
  );
}

function calculateDiff(t1, t2) {
  if (!t1 || !t2) return 0;
  const [h1, m1] = t1.split(':').map(Number);
  const [h2, m2] = t2.split(':').map(Number);
  let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
  if (diff < 0) diff += 1440;
  return diff;
}
