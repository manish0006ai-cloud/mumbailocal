import { useApp } from '../context/AppContext';
import { getLineInfo } from '../data/stations';
import './Favorites.css';

export default function Favorites({ onRouteSelect }) {
  const { state, dispatch } = useApp();

  const handleFavoriteClick = (fav) => {
    dispatch({ type: 'SET_SOURCE', payload: fav.source });
    dispatch({ type: 'SET_DESTINATION', payload: fav.destination });
    onRouteSelect(fav.source, fav.destination);
  };

  const handleRemoveFavorite = (e, index) => {
    e.stopPropagation();
    dispatch({ type: 'REMOVE_FAVORITE', payload: index });
  };

  const handleReverseRoute = (e, fav) => {
    e.stopPropagation();
    dispatch({ type: 'SET_SOURCE', payload: fav.destination });
    dispatch({ type: 'SET_DESTINATION', payload: fav.source });
    onRouteSelect(fav.destination, fav.source);
  };

  const hasData = state.favorites.length > 0 || state.lastSearches.length > 0;
  if (!hasData) return null;

  return (
    <div className="favorites">
      {/* Favorite Routes */}
      {state.favorites.length > 0 && (
        <div className="favorites-section">
          <h3 className="fav-section-title">⭐ Saved Routes</h3>
          <div className="fav-cards">
            {state.favorites.map((fav, index) => (
              <div key={index} className="fav-card" onClick={() => handleFavoriteClick(fav)}>
                <div className="fav-route">
                  <div className="fav-station">
                    <span className="fav-dot" style={{ background: getLineInfo(fav.source?.line)?.color }}></span>
                    <span className="fav-name">{fav.source?.name}</span>
                  </div>
                  <span className="fav-arrow">→</span>
                  <div className="fav-station">
                    <span className="fav-dot" style={{ background: getLineInfo(fav.destination?.line)?.color }}></span>
                    <span className="fav-name">{fav.destination?.name}</span>
                  </div>
                </div>
                <div className="fav-actions">
                  <button className="fav-action-btn" onClick={(e) => handleReverseRoute(e, fav)} title="Reverse route">
                    🔄
                  </button>
                  <button className="fav-action-btn fav-remove" onClick={(e) => handleRemoveFavorite(e, index)} title="Remove">
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Searched */}
      {state.lastSearches.length > 0 && (
        <div className="favorites-section">
          <h3 className="fav-section-title">🕐 Recent Searches</h3>
          <div className="fav-chips-row">
            {state.lastSearches.map((search, index) => (
              <button
                key={index}
                className="recent-chip"
                onClick={() => handleFavoriteClick(search)}
              >
                <span>{search.source?.code}</span>
                <span className="chip-arrow">→</span>
                <span>{search.destination?.code}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
