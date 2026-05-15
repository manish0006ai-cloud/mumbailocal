/**
 * Train Simulation Engine
 * Generates realistic live train positions from actual timetable data.
 * Simulates anonymous crowd GPS sessions for the Crowd GPS dashboard.
 */
import { RAILWAY_CORRIDORS } from './railwayCorridors';

// Interpolate GPS position between two stations based on progress (0-1)
function interpolate(stationA, stationB, progress) {
  return {
    lat: stationA.lat + (stationB.lat - stationA.lat) * progress,
    lng: stationA.lng + (stationB.lng - stationA.lng) * progress,
  };
}

// Calculate bearing between two points
function bearing(from, to) {
  const dLng = (to.lng - from.lng) * Math.PI / 180;
  const lat1 = from.lat * Math.PI / 180;
  const lat2 = to.lat * Math.PI / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
}

// Parse "HH:MM" to minutes since midnight
function parseTime(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// Get current time in minutes since midnight (IST)
function nowMinutes() {
  const now = new Date();
  // Convert to IST
  const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  return ist.getHours() * 60 + ist.getMinutes() + ist.getSeconds() / 60;
}

// Generate random crowd count per train (simulated anonymous sessions)
function randomCrowd(lineId, hour) {
  // Peak hours have more users
  const isPeak = (hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 21);
  const isMidPeak = (hour >= 11 && hour <= 16);
  
  const base = isPeak ? 25 : (isMidPeak ? 12 : 5);
  const variance = Math.floor(Math.random() * base * 0.6);
  return base + variance;
}

// Map crowd count to level
function crowdLevel(count) {
  if (count <= 8) return 'low';
  if (count <= 20) return 'medium';
  if (count <= 40) return 'heavy';
  return 'extreme';
}

// Find corridor stations for a given line
function getCorridorStations(lineId) {
  const corridorMap = {
    'Western': 'western',
    'Central': 'central',
    'Harbour': 'harbour',
    'Trans Harbour': 'transHarbour',
  };
  const key = corridorMap[lineId];
  return key ? RAILWAY_CORRIDORS[key]?.stations : null;
}

// Match a station name to corridor GPS coordinates (fuzzy)
function findStationCoords(stationName, corridorStations) {
  if (!corridorStations) return null;
  const normalized = stationName.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  for (const s of corridorStations) {
    const sNorm = s.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (sNorm === normalized || sNorm.includes(normalized) || normalized.includes(sNorm)) {
      return s;
    }
  }
  
  // Partial match
  for (const s of corridorStations) {
    const sNorm = s.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (sNorm.slice(0, 4) === normalized.slice(0, 4)) {
      return s;
    }
  }
  
  return null;
}

/**
 * Generate active train positions based on real timetable data.
 * Returns an array of train cluster objects for the live map.
 */
export function generateLiveTrainClusters(timetableTrains) {
  const now = nowMinutes();
  const currentHour = Math.floor(now / 60);
  const clusters = [];

  if (!timetableTrains || !Array.isArray(timetableTrains)) return clusters;

  for (const train of timetableTrains) {
    if (!train.stops || train.stops.length < 2) continue;
    
    const line = train.line || 'Unknown';
    const corridorStations = getCorridorStations(line);
    if (!corridorStations) continue;
    
    const firstStop = train.stops[0];
    const lastStop = train.stops[train.stops.length - 1];
    const depTime = parseTime(firstStop.time);
    const arrTime = parseTime(lastStop.time);
    
    // Handle overnight trains
    let adjustedArr = arrTime;
    if (arrTime < depTime) adjustedArr += 1440;
    
    let adjustedNow = now;
    if (now < depTime && depTime > 1380) adjustedNow += 1440;
    
    // Check if train is currently running
    if (adjustedNow < depTime || adjustedNow > adjustedArr) continue;
    
    // Find which segment the train is on
    let prevStop = null;
    let nextStop = null;
    let segmentProgress = 0;
    
    for (let i = 0; i < train.stops.length - 1; i++) {
      const sDep = parseTime(train.stops[i].time);
      const sArr = parseTime(train.stops[i + 1].time);
      let adjSDep = sDep;
      let adjSArr = sArr;
      if (adjSArr < adjSDep) adjSArr += 1440;
      
      let checkNow = adjustedNow;
      if (checkNow >= adjSDep && checkNow <= adjSArr) {
        prevStop = train.stops[i];
        nextStop = train.stops[i + 1];
        const segDuration = adjSArr - adjSDep;
        segmentProgress = segDuration > 0 ? (checkNow - adjSDep) / segDuration : 0;
        break;
      }
    }
    
    if (!prevStop || !nextStop) continue;
    
    const prevCoords = findStationCoords(prevStop.station, corridorStations);
    const nextCoords = findStationCoords(nextStop.station, corridorStations);
    
    if (!prevCoords || !nextCoords) continue;
    
    // Interpolate position
    const pos = interpolate(prevCoords, nextCoords, segmentProgress);
    const dir = bearing(prevCoords, nextCoords);
    
    // Simulate speed based on distance and time
    const segDuration = parseTime(nextStop.time) - parseTime(prevStop.time);
    const distKm = Math.sqrt(
      Math.pow((nextCoords.lat - prevCoords.lat) * 111, 2) + 
      Math.pow((nextCoords.lng - prevCoords.lng) * 111 * Math.cos(prevCoords.lat * Math.PI / 180), 2)
    );
    const speedKmh = segDuration > 0 ? (distKm / (segDuration / 60)) : 40;
    
    // Crowd simulation
    const crowd = randomCrowd(line, currentHour);
    const level = crowdLevel(crowd);
    
    clusters.push({
      id: `cluster_${train.trainNo}_${train.direction}`,
      trainNo: train.trainNo,
      line,
      lineId: line.toLowerCase().replace(/\s+/g, '-'),
      direction: train.direction || 'DN',
      type: train.type || 'Slow',
      isAC: train.isAC || false,
      lat: pos.lat,
      lng: pos.lng,
      speed: Math.round(speedKmh * 10) / 10,
      bearing: Math.round(dir),
      lastStation: prevStop.station,
      nextStation: nextStop.station,
      progress: Math.round(segmentProgress * 100),
      activeUsers: crowd,
      crowdLevel: level,
      confidence: 0.75 + Math.random() * 0.2,
      timestamp: Date.now(),
    });
  }
  
  return clusters;
}

/**
 * Generate station crowd summary from active clusters
 */
export function generateStationCrowdSummary(clusters) {
  const stationMap = {};
  
  for (const c of clusters) {
    // Station approaching
    if (!stationMap[c.nextStation]) {
      stationMap[c.nextStation] = { 
        name: c.nextStation, 
        line: c.line, 
        approaching: 0, 
        totalCrowd: 0, 
        trains: [] 
      };
    }
    stationMap[c.nextStation].approaching++;
    stationMap[c.nextStation].totalCrowd += c.activeUsers;
    stationMap[c.nextStation].trains.push(c.trainNo);
  }
  
  return Object.values(stationMap).sort((a, b) => b.totalCrowd - a.totalCrowd);
}

/**
 * Generate line-wise summary stats
 */
export function generateLineSummary(clusters) {
  const lines = {};
  
  for (const c of clusters) {
    if (!lines[c.line]) {
      lines[c.line] = {
        name: c.line,
        lineId: c.lineId,
        activeTrains: 0,
        totalUsers: 0,
        avgSpeed: 0,
        speeds: [],
        crowdLevels: { low: 0, medium: 0, heavy: 0, extreme: 0 },
      };
    }
    const l = lines[c.line];
    l.activeTrains++;
    l.totalUsers += c.activeUsers;
    l.speeds.push(c.speed);
    l.crowdLevels[c.crowdLevel]++;
  }
  
  // Compute averages
  for (const l of Object.values(lines)) {
    l.avgSpeed = l.speeds.length > 0 
      ? Math.round(l.speeds.reduce((a, b) => a + b, 0) / l.speeds.length) 
      : 0;
    delete l.speeds;
    
    // Dominant crowd level
    const maxLevel = Object.entries(l.crowdLevels).sort((a, b) => b[1] - a[1])[0];
    l.dominantCrowd = maxLevel ? maxLevel[0] : 'low';
  }
  
  return Object.values(lines);
}
