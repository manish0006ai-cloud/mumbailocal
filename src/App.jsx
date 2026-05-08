import { useState, useEffect, useCallback } from 'react';
import { useApp } from './context/AppContext';
import { generateTrains, refreshTrainTimes } from './data/trainGenerator';
import { generateInsights, getTrainBadges, generateAlerts } from './data/aiEngine';
import Header from './components/Header';
import StationSearch from './components/StationSearch';
import HeroTrainCard from './components/HeroTrainCard';
import TrainList from './components/TrainList';
import AIPanel from './components/AIPanel';
import RouteMap from './components/RouteMap';
import CrowdPrediction from './components/CrowdPrediction';
import LiveAlerts from './components/LiveAlerts';
import Favorites from './components/Favorites';
import './App.css';

function AppContent() {
  const { state, dispatch } = useApp();
  
  // Safety check for context
  if (!state || !dispatch) {
    return <div style={{ color: 'white', padding: '20px' }}>Error: App Context not found. Please refresh.</div>;
  }

  const [trains, setTrains] = useState([]);
  const [insights, setInsights] = useState([]);
  const [badges, setBadges] = useState({});
  const [alerts, setAlerts] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  const performSearch = useCallback(async (source, destination) => {
    if (!source || !destination) return;
    
    setIsLoading(true);
    try {
      const generatedTrains = await generateTrains(source.id, destination.id, 12);
      setTrains(generatedTrains);
      
      const generatedInsights = await generateInsights(generatedTrains, source.name, destination.name, generateTrains);
      setInsights(generatedInsights);
      
      const generatedBadges = getTrainBadges(generatedTrains);
      setBadges(generatedBadges);
      
      const generatedAlerts = generateAlerts();
      setAlerts(generatedAlerts);
      
      dispatch({ type: 'SET_VIEW', payload: 'results' });
      dispatch({ type: 'ADD_LAST_SEARCH', payload: { source, destination } });
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  const handleSearch = useCallback(() => {
    performSearch(state.source, state.destination);
  }, [state.source, state.destination, performSearch]);

  const handleFavoriteSelect = useCallback((source, destination) => {
    performSearch(source, destination);
  }, [performSearch]);

  // Auto-refresh train times every 30 seconds
  useEffect(() => {
    if (state.view !== 'results' || trains.length === 0) return;
    
    const interval = setInterval(() => {
      setTrains(prev => refreshTrainTimes(prev));
    }, 30000);
    
    return () => clearInterval(interval);
  }, [state.view, trains.length]);

  const handleBack = () => {
    dispatch({ type: 'SET_VIEW', payload: 'home' });
    setTrains([]);
    setInsights([]);
    setBadges({});
  };

  const handleSaveRoute = () => {
    if (state.source && state.destination) {
      dispatch({ type: 'ADD_FAVORITE', payload: { source: state.source, destination: state.destination } });
    }
  };

  const heroTrain = trains[0];
  const remainingTrains = trains.slice(1);

  return (
    <div className="app-container">
      <Header />

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p>Pulling Live Data...</p>
          </div>
        </div>
      )}
      
      {state.view === 'home' && (
        <main className="home-view">
          {/* Hero Section */}
          <div className="home-hero">
            <h2 className="home-greeting">Where are you<br/><span className="text-gradient">heading today?</span></h2>
          </div>

          <StationSearch onSearch={handleSearch} />
          <Favorites onRouteSelect={handleFavoriteSelect} />
          
          {/* Quick Info Cards */}
          <div className="home-info-grid">
            <div className="info-card glass">
              <span className="info-icon">🚉</span>
              <span className="info-label">4 Lines</span>
              <span className="info-value">WR • CR • HR • TH</span>
            </div>
            <div className="info-card glass">
              <span className="info-icon">🚆</span>
              <span className="info-label">Real-time</span>
              <span className="info-value">AI Powered</span>
            </div>
          </div>

          {/* Bottom Tagline */}
          <div className="home-footer">
            <p className="footer-text">Powered by <span className="text-gradient">LocalPulse AI</span></p>
            <p className="footer-subtext">Mumbai • Navi Mumbai • Thane</p>
          </div>
        </main>
      )}

      {state.view === 'results' && (
        <main className="results-view">
          {/* Back + Save Row */}
          <div className="results-top-bar">
            <button className="back-btn" onClick={handleBack} id="back-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5m0 0 7 7m-7-7 7-7"/>
              </svg>
              <span>Back</span>
            </button>
            <div className="results-route-label">
              <div className="route-node">
                <span className="route-code">{state.source?.code}</span>
                <span className="route-line-tag">{state.source?.line === 'western' ? 'WR' : state.source?.line === 'central' ? 'CR' : state.source?.line === 'harbour' ? 'HR' : 'TH'}</span>
              </div>
              <span className="route-separator">→</span>
              <div className="route-node">
                <span className="route-code">{state.destination?.code}</span>
                <span className="route-line-tag">{state.destination?.line === 'western' ? 'WR' : state.destination?.line === 'central' ? 'CR' : state.destination?.line === 'harbour' ? 'HR' : 'TH'}</span>
              </div>
            </div>
            <button className="save-route-btn" onClick={handleSaveRoute} title="Save route" id="save-route-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </button>
          </div>

          {/* Refresh Button — Top */}
          <div className="results-refresh-top">
            <button className="btn btn-ghost refresh-btn" onClick={handleSearch} id="refresh-trains-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
              </svg>
              Refresh Trains
            </button>
          </div>

          {/* Hero Train Card */}
          {heroTrain && (
            <HeroTrainCard train={heroTrain} badge={badges[heroTrain.id]} />
          )}

          {/* AI Panel */}
          <AIPanel insights={insights} />

          {/* Route Map */}
          {heroTrain?.route && (
            <RouteMap 
              route={heroTrain.route} 
              source={state.source?.name} 
              destination={state.destination?.name} 
            />
          )}

          {/* Live Alerts */}
          <LiveAlerts alerts={alerts} />

          {/* Upcoming Trains */}
          <TrainList trains={remainingTrains} badges={badges} />

          {/* Crowd Prediction */}
          {heroTrain && <CrowdPrediction train={heroTrain} />}
          
          <div className="version-indicator">v2.0 Interchange Active</div>
        </main>
      )}
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
