// Offline Manager — localStorage persistence for favorites, cache, and last searches

const FAVORITES_KEY = 'localpulse_favorites';
const LAST_SEARCH_KEY = 'localpulse_last_searches';
const CACHE_KEY = 'localpulse_train_cache';

export function loadFavorites() {
  try {
    const data = localStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveFavorites(favorites) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch {
    // Storage full — ignore
  }
}

export function loadLastSearch() {
  try {
    const data = localStorage.getItem(LAST_SEARCH_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveLastSearch(searches) {
  try {
    localStorage.setItem(LAST_SEARCH_KEY, JSON.stringify(searches));
  } catch {}
}

export function cacheTrains(sourceId, destId, trains) {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    cache[`${sourceId}_${destId}`] = {
      trains,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

export function getCachedTrains(sourceId, destId) {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    const entry = cache[`${sourceId}_${destId}`];
    if (entry && Date.now() - entry.timestamp < 30 * 60 * 1000) { // 30 min cache
      return entry.trains;
    }
    return null;
  } catch {
    return null;
  }
}
