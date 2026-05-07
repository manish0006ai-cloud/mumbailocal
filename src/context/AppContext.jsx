import { createContext, useContext, useReducer, useEffect } from 'react';
import { loadFavorites, saveFavorites, loadLastSearch, saveLastSearch } from '../utils/offlineManager';

const AppContext = createContext(null);

const initialState = {
  source: null,
  destination: null,
  trains: [],
  view: 'home', // 'home' | 'results'
  favorites: [],
  lastSearches: [],
  alerts: [],
  isOnline: true,
  isListening: false,
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_SOURCE':
      return { ...state, source: action.payload };
    case 'SET_DESTINATION':
      return { ...state, destination: action.payload };
    case 'SWAP_STATIONS':
      return { ...state, source: state.destination, destination: state.source };
    case 'SET_TRAINS':
      return { ...state, trains: action.payload };
    case 'SET_VIEW':
      return { ...state, view: action.payload };
    case 'ADD_FAVORITE': {
      const exists = state.favorites.some(
        f => f.source?.id === action.payload.source?.id && f.destination?.id === action.payload.destination?.id
      );
      if (exists) return state;
      const newFavs = [action.payload, ...state.favorites].slice(0, 10);
      return { ...state, favorites: newFavs };
    }
    case 'REMOVE_FAVORITE': {
      const newFavs = state.favorites.filter((_, i) => i !== action.payload);
      return { ...state, favorites: newFavs };
    }
    case 'SET_FAVORITES':
      return { ...state, favorites: action.payload };
    case 'ADD_LAST_SEARCH': {
      const filtered = state.lastSearches.filter(
        s => !(s.source?.id === action.payload.source?.id && s.destination?.id === action.payload.destination?.id)
      );
      const newSearches = [action.payload, ...filtered].slice(0, 5);
      return { ...state, lastSearches: newSearches };
    }
    case 'SET_LAST_SEARCHES':
      return { ...state, lastSearches: action.payload };
    case 'SET_ALERTS':
      return { ...state, alerts: action.payload };
    case 'SET_ONLINE':
      return { ...state, isOnline: action.payload };
    case 'SET_LISTENING':
      return { ...state, isListening: action.payload };
    case 'RESET':
      return { ...initialState, favorites: state.favorites, lastSearches: state.lastSearches };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load saved data on mount
  useEffect(() => {
    const favs = loadFavorites();
    if (favs.length > 0) dispatch({ type: 'SET_FAVORITES', payload: favs });
    
    const lastSearches = loadLastSearch();
    if (lastSearches.length > 0) dispatch({ type: 'SET_LAST_SEARCHES', payload: lastSearches });

    // Online/offline detection
    const handleOnline = () => dispatch({ type: 'SET_ONLINE', payload: true });
    const handleOffline = () => dispatch({ type: 'SET_ONLINE', payload: false });
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    dispatch({ type: 'SET_ONLINE', payload: navigator.onLine });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Persist favorites
  useEffect(() => {
    saveFavorites(state.favorites);
  }, [state.favorites]);

  // Persist last searches
  useEffect(() => {
    saveLastSearch(state.lastSearches);
  }, [state.lastSearches]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
