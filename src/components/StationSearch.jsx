import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { searchStations, getStation, popularStations, getLineInfo } from '../data/stations';
import { parseVoiceQuery } from '../data/aiEngine';
import './StationSearch.css';

export default function StationSearch({ onSearch }) {
  const { state, dispatch } = useApp();
  const [sourceQuery, setSourceQuery] = useState('');
  const [destQuery, setDestQuery] = useState('');
  const [sourceResults, setSourceResults] = useState([]);
  const [destResults, setDestResults] = useState([]);
  const [activeField, setActiveField] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const sourceRef = useRef(null);
  const destRef = useRef(null);
  const recognitionRef = useRef(null);

  // Search stations on query change
  useEffect(() => {
    if (activeField === 'source') {
      if (sourceQuery.length > 0) {
        setSourceResults(searchStations(sourceQuery));
      } else {
        // Show popular stations if empty but focused
        setSourceResults(popularStationsList);
      }
    } else {
      setSourceResults([]);
    }
  }, [sourceQuery, activeField, popularStationsList]);

  useEffect(() => {
    if (activeField === 'dest') {
      if (destQuery.length > 0) {
        setDestResults(searchStations(destQuery));
      } else {
        // Show popular stations if empty but focused
        setDestResults(popularStationsList);
      }
    } else {
      setDestResults([]);
    }
  }, [destQuery, activeField, popularStationsList]);

  const selectStation = (station, field) => {
    if (field === 'source') {
      dispatch({ type: 'SET_SOURCE', payload: station });
      setSourceQuery(station.name);
      setSourceResults([]);
      setActiveField(null);
      // Auto-focus destination
      setTimeout(() => destRef.current?.focus(), 100);
    } else {
      dispatch({ type: 'SET_DESTINATION', payload: station });
      setDestQuery(station.name);
      setDestResults([]);
      setActiveField(null);
    }
  };

  const handleSwap = () => {
    dispatch({ type: 'SWAP_STATIONS' });
    const tempQuery = sourceQuery;
    setSourceQuery(destQuery);
    setDestQuery(tempQuery);
  };

  const handleSearch = () => {
    if (state.source && state.destination) {
      dispatch({ type: 'ADD_LAST_SEARCH', payload: { source: state.source, destination: state.destination } });
      onSearch();
    }
  };

  const handlePopularStation = (stationId, field) => {
    const station = getStation(stationId);
    if (station) selectStation(station, field);
  };

  // Voice search
  const startVoiceSearch = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search not supported in this browser. Try Chrome.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const parsed = parseVoiceQuery(transcript);
      
      if (parsed) {
        const srcResults = searchStations(parsed.source);
        const destResultsV = searchStations(parsed.destination);
        
        if (srcResults.length > 0) selectStation(srcResults[0], 'source');
        if (destResultsV.length > 0) selectStation(destResultsV[0], 'dest');
        
        if (srcResults.length > 0 && destResultsV.length > 0) {
          setTimeout(() => handleSearch(), 300);
        }
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.start();
    recognitionRef.current = recognition;
  }, []);

  const getLineColor = (lineId) => {
    const info = getLineInfo(lineId);
    return info?.color || '#64748b';
  };

  const getLineLabel = (lineId) => {
    const info = getLineInfo(lineId);
    return info?.shortName || '';
  };

  const popularStationsList = popularStations.slice(0, 8).map(id => getStation(id)).filter(Boolean);

  return (
    <div className="station-search">
      <div className="search-card glass">
        <div className="search-inputs">
          {/* Source Input */}
          <div className="search-field">
            <div className="field-icon source-icon">
              <div className="dot-source"></div>
            </div>
            <div className="field-wrapper">
              <label className="field-label">From</label>
              <input
                ref={sourceRef}
                type="text"
                placeholder="Search station..."
                value={sourceQuery}
                onChange={(e) => setSourceQuery(e.target.value)}
                onFocus={() => setActiveField('source')}
                onBlur={() => setTimeout(() => setActiveField(null), 200)}
                className="search-input"
                id="source-station-input"
              />
            </div>
            {sourceQuery && (
              <button className="clear-btn" onClick={() => { setSourceQuery(''); dispatch({ type: 'SET_SOURCE', payload: null }); }}>
                ✕
              </button>
            )}
          </div>

          {/* Connector Line + Swap Button */}
          <div className="search-connector">
            <div className="connector-line"></div>
            <button className="swap-btn btn-icon" onClick={handleSwap} title="Swap stations" id="swap-stations-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/>
              </svg>
            </button>
            <div className="connector-line"></div>
          </div>

          {/* Destination Input */}
          <div className="search-field">
            <div className="field-icon dest-icon">
              <div className="dot-dest"></div>
            </div>
            <div className="field-wrapper">
              <label className="field-label">To</label>
              <input
                ref={destRef}
                type="text"
                placeholder="Search destination..."
                value={destQuery}
                onChange={(e) => setDestQuery(e.target.value)}
                onFocus={() => setActiveField('dest')}
                onBlur={() => setTimeout(() => setActiveField(null), 200)}
                className="search-input"
                id="dest-station-input"
              />
            </div>
            {destQuery && (
              <button className="clear-btn" onClick={() => { setDestQuery(''); dispatch({ type: 'SET_DESTINATION', payload: null }); }}>
                ✕
              </button>
            )}
          </div>

          {/* Autocomplete Dropdowns */}
          {activeField === 'source' && sourceResults.length > 0 && (
            <div className="autocomplete-dropdown source-dropdown">
              {sourceQuery.length === 0 && <div className="dropdown-label">Popular Stations</div>}
              {sourceResults.map(station => (
                <button
                  key={station.id}
                  className="autocomplete-item"
                  onMouseDown={() => selectStation(station, 'source')}
                >
                  <div className="station-line-dot" style={{ background: getLineColor(station.line) }}></div>
                  <div className="station-info">
                    <span className="station-name">{station.name}</span>
                    <span className="station-meta">{station.code} • {getLineLabel(station.line)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {activeField === 'dest' && destResults.length > 0 && (
            <div className="autocomplete-dropdown dest-dropdown">
              {destQuery.length === 0 && <div className="dropdown-label">Popular Stations</div>}
              {destResults.map(station => (
                <button
                  key={station.id}
                  className="autocomplete-item"
                  onMouseDown={() => selectStation(station, 'dest')}
                >
                  <div className="station-line-dot" style={{ background: getLineColor(station.line) }}></div>
                  <div className="station-info">
                    <span className="station-name">{station.name}</span>
                    <span className="station-meta">{station.code} • {getLineLabel(station.line)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="search-actions">
          <button
            className={`voice-btn btn-icon ${isListening ? 'listening' : ''}`}
            onClick={startVoiceSearch}
            title="Voice search"
            id="voice-search-btn"
          >
            {isListening ? (
              <div className="voice-waves">
                <span></span><span></span><span></span>
              </div>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="22"/>
              </svg>
            )}
          </button>
          <button
            className="search-btn btn btn-primary"
            onClick={handleSearch}
            disabled={!state.source || !state.destination}
            id="search-trains-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            Search Trains
          </button>
        </div>
      </div>

      {/* Popular Stations (show if one field is empty and not focused) */}
      {(!state.source || !state.destination) && activeField === null && (
        <div className="popular-stations">
          <p className="popular-label">Popular Stations</p>
          <div className="popular-chips">
            {popularStationsList.map(station => (
              <button
                key={station.id}
                className="popular-chip"
                onClick={() => {
                  if (!state.source) {
                    selectStation(station, 'source');
                  } else {
                    selectStation(station, 'dest');
                  }
                }}
              >
                <span className="chip-dot" style={{ background: getLineColor(station.line) }}></span>
                {station.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
