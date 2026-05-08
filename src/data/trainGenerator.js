// Dynamic Train Schedule Generator
// Creates realistic Mumbai local train timetables based on current time

import { getStation, getStationsOnLine, findRoute, LINES } from './stations';

// Peak hour ranges
const PEAK_MORNING = { start: 7, end: 10.5 }; // 7:00 AM - 10:30 AM
const PEAK_EVENING = { start: 17, end: 20.5 }; // 5:00 PM - 8:30 PM

function isPeakHour(hour) {
  const h = hour + (new Date().getMinutes() / 60);
  return (h >= PEAK_MORNING.start && h <= PEAK_MORNING.end) ||
         (h >= PEAK_EVENING.start && h <= PEAK_EVENING.end);
}

function isWeekend() {
  const day = new Date().getDay();
  return day === 0 || day === 6;
}

// Generate random delay based on conditions
function generateDelay(isFast, hour) {
  const peak = isPeakHour(hour);
  const base = peak ? 0.3 : 0.1; // 30% chance in peak, 10% off-peak
  if (Math.random() > base) return 0;
  
  const maxDelay = peak ? 8 : 4;
  return Math.floor(Math.random() * maxDelay) + 1;
}

// Estimate travel time between stations (in minutes)
function estimateTravelTime(stops, isFast) {
  if (isFast) {
    // Fast trains skip ~40% of stops
    const effectiveStops = Math.ceil(stops * 0.6);
    return effectiveStops * 2.5 + 2; // ~2.5 min per stop + buffer
  }
  return stops * 2.8 + 1; // ~2.8 min per stop for slow
}

// Crowd level estimation
function estimateCrowd(hour, isFast, dayOfWeek) {
  const weekend = dayOfWeek === 0 || dayOfWeek === 6;
  if (weekend) return Math.random() > 0.5 ? 'low' : 'medium';
  
  const peak = isPeakHour(hour);
  if (peak) {
    if (isFast) return Math.random() > 0.3 ? 'heavy' : 'medium';
    return Math.random() > 0.5 ? 'heavy' : 'medium';
  }
  
  // Off-peak
  if (hour >= 11 && hour <= 15) return Math.random() > 0.3 ? 'low' : 'medium';
  return Math.random() > 0.5 ? 'medium' : 'low';
}

// Generate platform number
function generatePlatform(station, direction) {
  const maxPlatforms = station?.platforms || 2;
  if (direction === 'up') {
    return Math.min(2, maxPlatforms);
  }
  return 1;
}

// Fast train stopping pattern - skips small stations
const FAST_SKIP_WESTERN = ['mr', 'cc', 'gr', 'el', 'mm', 'mhd', 'khr', 'snt', 'vm', 'jgr', 'ram', 'mld', 'knd', 'dhn'];
const FAST_SKIP_CENTRAL = ['msjd', 'snhst', 'cpr', 'cr', 'vnk', 'vik', 'knp', 'nhr', 'klw', 'mmk', 'tky', 'vtk'];

// Generate train schedule (Async to simulate real API)
export async function generateTrains(sourceId, destId, count = 12, baseTime = null) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));

  const source = getStation(sourceId);
  const dest = getStation(destId);
  if (!source || !dest) return [];

  const route = findRoute(sourceId, destId);
  if (!route) return [];

  const now = baseTime || new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const dayOfWeek = now.getDay();
  
  const trains = [];
  let baseMinute = currentMinute;
  let baseHour = currentHour;

  // First train should depart very soon (1-4 mins)
  baseMinute += Math.floor(Math.random() * 3) + 1;

  for (let i = 0; i < count; i++) {
    const peak = isPeakHour(baseHour);
    
    // Train frequency: 3-6 min peak, 7-15 min off-peak
    const interval = peak 
      ? Math.floor(Math.random() * 4) + 3
      : Math.floor(Math.random() * 9) + 7;

    if (i > 0) baseMinute += interval;
    
    // Normalize time
    while (baseMinute >= 60) {
      baseMinute -= 60;
      baseHour++;
    }
    if (baseHour >= 24) baseHour -= 24;

    const isFast = Math.random() > (peak ? 0.4 : 0.6); // More fast trains in peak
    const stops = route.stops || 10;
    const travelTime = Math.round(estimateTravelTime(stops, isFast));
    const delay = generateDelay(isFast, baseHour);
    const crowd = estimateCrowd(baseHour, isFast, dayOfWeek);
    
    // Calculate arrival time
    let arrHour = baseHour;
    let arrMin = baseMinute + travelTime;
    while (arrMin >= 60) {
      arrMin -= 60;
      arrHour++;
    }
    if (arrHour >= 24) arrHour -= 24;

    const depTime = `${String(baseHour).padStart(2, '0')}:${String(baseMinute).padStart(2, '0')}`;
    const arrTime = `${String(arrHour).padStart(2, '0')}:${String(arrMin).padStart(2, '0')}`;

    // Handle interchange destination for the first leg
    let displayDest = dest;
    if (route.type === 'interchange' && route.interchange) {
      const interchangeStation = getStation(route.interchange.id);
      if (interchangeStation) displayDest = interchangeStation;
    }

    // Direction for platform assignment
    const lineStations = getStationsOnLine(source.line);
    const srcIdx = lineStations.findIndex(s => s.id === sourceId);
    const dstIdx = lineStations.findIndex(s => s.id === displayDest.id);
    const direction = srcIdx < dstIdx ? 'down' : 'up';

    const platform = generatePlatform(source, direction);

    // Determine fast stops count
    const fastStops = isFast ? Math.ceil(stops * 0.6) : stops;

    // Calculate minutes from now
    const depDate = new Date();
    depDate.setHours(baseHour, baseMinute, 0, 0);
    const minsFromNow = Math.max(0, Math.round((depDate - now) / 60000));

    trains.push({
      id: `train_${i}_${Date.now()}`,
      number: `9${source.line === 'western' ? '0' : source.line === 'central' ? '5' : source.line === 'harbour' ? '8' : '7'}${Math.floor(Math.random() * 900) + 100}`,
      source: source.name,
      sourceCode: source.code,
      destination: displayDest.name,
      destinationCode: displayDest.code,
      finalDestination: dest.name, // Keep track of final destination
      line: source.line,
      lineInfo: LINES[source.line.toUpperCase().replace('-', '_')] || LINES.CENTRAL,
      departureTime: depTime,
      arrivalTime: arrTime,
      duration: travelTime,
      platform,
      isFast,
      type: isFast ? 'Fast' : 'Slow',
      crowd,
      delay,
      stops: fastStops,
      totalStops: stops,
      minsFromNow,
      status: delay > 0 ? (delay > 5 ? 'delayed' : 'slight-delay') : 'on-time',
      name: `${displayDest.name} ${isFast ? 'Fast' : 'Slow'}`,
      seatProbability: crowd === 'low' ? 85 : crowd === 'medium' ? 35 : 5,
      standingProbability: crowd === 'low' ? 15 : crowd === 'medium' ? 65 : 95,
      coachSuggestion: crowd === 'heavy' ? 'First or Last coach recommended' : 'Any coach',
      route: route,
    });
  }

  return trains;
}

// Get countdown text
export function getCountdownText(minsFromNow) {
  if (minsFromNow <= 0) return 'Departing Now';
  if (minsFromNow === 1) return 'Arriving in 1 min';
  if (minsFromNow <= 60) return `Arriving in ${minsFromNow} mins`;
  const hrs = Math.floor(minsFromNow / 60);
  const mins = minsFromNow % 60;
  return `In ${hrs}h ${mins}m`;
}

// Refresh train times (recalculate minsFromNow)
export function refreshTrainTimes(trains) {
  const now = new Date();
  return trains.map(train => {
    const [h, m] = train.departureTime.split(':').map(Number);
    const depDate = new Date();
    depDate.setHours(h, m, 0, 0);
    const minsFromNow = Math.max(0, Math.round((depDate - now) / 60000));
    return { ...train, minsFromNow };
  }).filter(t => t.minsFromNow >= 0);
}
