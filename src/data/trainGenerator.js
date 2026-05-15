/**
 * trainGenerator.js - Dynamic Train Schedule Generator
 * Links the raw accurate_timetable.json data to the app's internal station model.
 */
import { getStation, getStationsOnLine, findRoute, LINES } from './stations';
import timetableData from './accurate_timetable.json';

// Peak hour ranges
const PEAK_MORNING = { start: 7, end: 10.5 };
const PEAK_EVENING = { start: 17, end: 20.5 };

// Fast train stopping pattern - skips small stations
export const FAST_SKIP_WESTERN = ['mel', 'cyr', 'gtr', 'mx', 'lp', 'pbhd', 'mm', 'khar', 'snt', 'vlp', 'jgs', 'ram', 'mld', 'kdv', 'dic'];
export const FAST_SKIP_CENTRAL = ['msd', 'snrd', 'chp', 'crd', 'pr', 'vvh', 'vk', 'kjm', 'nhr', 'klw', 'mbq', 'tky', 'kop'];

function isPeakHour(hour) {
  const h = hour + (new Date().getMinutes() / 60);
  return (h >= PEAK_MORNING.start && h <= PEAK_MORNING.end) ||
         (h >= PEAK_EVENING.start && h <= PEAK_EVENING.end);
}

// Generate random delay based on conditions
function generateDelay(isFast, hour) {
  const h = hour;
  const peak = isPeakHour(h);
  const base = peak ? 0.3 : 0.1;
  if (Math.random() > base) return 0;
  const maxDelay = peak ? 8 : 4;
  return Math.floor(Math.random() * maxDelay) + 1;
}

// Estimate crowd level
function estimateCrowd(hour, isFast) {
  const peak = isPeakHour(hour);
  if (peak) return isFast ? (Math.random() > 0.3 ? 'heavy' : 'medium') : (Math.random() > 0.5 ? 'heavy' : 'medium');
  if (hour >= 11 && hour <= 15) return Math.random() > 0.3 ? 'low' : 'medium';
  return Math.random() > 0.5 ? 'medium' : 'low';
}

// Canonical alias map: timetable station name → app station name
// This handles all known differences between the official PDF names and our stations.js names
const STATION_ALIAS_MAP = {
  'mumbai csmt': 'csmt',
  'masjid': 'masjid',
  'sandhurst road': 'sandhurst road',
  'dockyard road': 'dockyard road',
  'reay road': 'reay road',
  'cotton green': 'cotton green',
  'sewri': 'sewri',
  'vadala road': 'wadala road',
  'kings circle': 'kings circle',
  'mahim jn': 'mahim junction',
  'mahim junction': 'mahim junction',
  'bandra': 'bandra',
  'khar road': 'khar road',
  'santacruz': 'santacruz',
  'vileparle': 'vile parle',
  'vile parle': 'vile parle',
  'andheri': 'andheri',
  'jogeshwari': 'jogeshwari',
  'ramnagar': 'ram mandir',
  'ram mandir': 'ram mandir',
  'goregaon': 'goregaon',
  'gtb nagar': 'gtb nagar',
  'chunabhatti': 'chunabhatti',
  'kurla': 'kurla',
  'tilaknagar': 'tilak nagar',
  'tilak nagar': 'tilak nagar',
  'chembur': 'chembur',
  'govandi': 'govandi',
  'mankhurd': 'mankhurd',
  'vashi': 'vashi',
  'sanpada': 'sanpada',
  'juinagar': 'juinagar',
  'nerul': 'nerul',
  'seawoods darave': 'seawoods-darave',
  'seawoods-darave': 'seawoods-darave',
  'seawoods darave karave': 'seawoods-darave',
  'belapur': 'cbd belapur',
  'belapur cbd': 'cbd belapur',
  'cbd belapur': 'cbd belapur',
  'kharghar': 'kharghar',
  'mansarovar': 'mansarovar',
  'khandeshwar': 'khandeshwar',
  'panvel': 'panvel',
  'thane': 'thane',
  'airoli': 'airoli',
  'rabale': 'rabale',
  'ghansoli': 'ghansoli',
  'koparkhairane': 'kopar khairane',
  'kopar khairane': 'kopar khairane',
  'turbhe': 'turbhe',
  'digha gaon': 'digha gaon',
};

// Helper: match station object against timetable stop name
const matchesStop = (appStation, stopName) => {
  if (!appStation || !stopName) return false;
  const sn = stopName.toLowerCase().replace(/['.()]/g, '').trim();
  const an = appStation.name.toLowerCase().replace(/['.()]/g, '').trim();
  
  // Direct exact match
  if (sn === an) return true;
  
  // Use alias map: normalize both sides then compare
  const normalizedStop = STATION_ALIAS_MAP[sn] || sn;
  const normalizedApp = STATION_ALIAS_MAP[an] || an;
  
  if (normalizedStop === normalizedApp) return true;
  if (normalizedStop === an || normalizedApp === sn) return true;
  
  // Code match
  const ac = appStation.code.toLowerCase();
  if (sn === ac) return true;
  
  return false;
};

export async function generateTrains(sourceId, destId, count = 25, baseTime = null, allDay = false) {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 500));

  const source = getStation(sourceId);
  const dest = getStation(destId);
  if (!source || !dest) return [];

  const route = findRoute(sourceId, destId);
  if (!route) return [];

  const now = baseTime || new Date();
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
  
  const trainsList = timetableData.trains || [];
  const results = [];

  // Determine the target destination for the first leg of the journey
  const firstLegDest = route.type === 'interchange' ? getStation(route.interchange.id) : dest;

  // 1. Filter Real Timetable Data
  for (const t of trainsList) {
    let bestSegment = null;
    let currentSIdx = -1;

    for (let i = 0; i < t.stops.length; i++) {
      if (matchesStop(source, t.stops[i].station)) {
        currentSIdx = i; // Found a source, start tracking
      } else if (currentSIdx !== -1 && matchesStop(firstLegDest, t.stops[i].station)) {
        // Found a destination after a source
        const sTime = t.stops[currentSIdx].time;
        const dTime = t.stops[i].time;
        const [sH, sM] = sTime.split(':').map(Number);
        const [dH, dM] = dTime.split(':').map(Number);
        let duration = (dH * 60 + dM) - (sH * 60 + sM);
        if (duration < 0) duration += 1440; // Midnight crossover
        
        // Mumbai local trips never exceed 4-5 hours. 
        // If > 300, it's a cross-journey false match.
        if (duration < 300 && duration > 0) {
          bestSegment = { sIdx: currentSIdx, dIdx: i };
          break; // Found a valid leg
        }
      }
    }

    if (bestSegment) {
      const { sIdx, dIdx } = bestSegment;
      const depTimeStr = t.stops[sIdx].time;
      const [h, m] = depTimeStr.split(':').map(Number);
      const trainTotalMins = h * 60 + m;

      // If allDay is true, include everything. Otherwise, include from 30 mins ago.
      if (allDay || trainTotalMins >= currentTotalMinutes - 30) {
        results.push({
          id: `${t.trainNo}_${depTimeStr}_${results.length}`,
          number: t.trainNo,
          source: source.name,
          sourceCode: source.code,
          destination: firstLegDest.name,
          destinationCode: firstLegDest.code,
          finalDestination: dest.name,
          route: route,
          line: t.line,
          departureTime: depTimeStr,
          arrivalTime: t.stops[dIdx].time,
          isFast: t.type === 'Fast',
          type: t.type,
          trainTotalMins,
          stops: dIdx - sIdx,
          fullStops: t.stops, // Pass the entire stop list for the timetable view
          h, m
        });
      }
    }
  }

  // Sort by time
  results.sort((a, b) => a.trainTotalMins - b.trainTotalMins);

  // Take requested count (default 25 to show more of the day)
  const sliced = results.slice(0, count);

  // 2. Map to UI Model
  return sliced.map(rt => {
    const [arrH, arrM] = rt.arrivalTime.split(':').map(Number);
    let duration = (arrH * 60 + arrM) - (rt.h * 60 + rt.m);
    if (duration < 0) duration += 1440;

    const delay = generateDelay(rt.isFast, rt.h);
    const crowd = estimateCrowd(rt.h, rt.isFast);
    
    const depDate = new Date(now.getTime());
    depDate.setHours(rt.h, rt.m + delay, 0, 0);
    if (depDate.getTime() < now.getTime() - 30 * 60 * 1000) {
      depDate.setDate(depDate.getDate() + 1);
    }
    
    const minsFromNow = Math.max(0, Math.round((depDate.getTime() - now.getTime()) / 60000));

    return {
      ...rt,
      id: `real_${rt.id}`,
      lineInfo: LINES[rt.line.toUpperCase().replace(/\s|-/g, '_')] || LINES.CENTRAL,
      duration,
      platform: Math.floor(Math.random() * 2) + 1,
      crowd,
      delay,
      minsFromNow,
      status: delay > 0 ? (delay > 5 ? 'delayed' : 'slight-delay') : 'on-time',
      name: `${rt.destination} ${rt.type}`,
      seatProbability: crowd === 'low' ? 85 : crowd === 'medium' ? 35 : 5,
      dataSource: 'Official Timetable'
    };
  });
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

export function refreshTrainTimes(trains) {
  const now = new Date();
  return trains.map(train => {
    const [h, m] = train.departureTime.split(':').map(Number);
    const depDate = new Date();
    depDate.setHours(h, m + (train.delay || 0), 0, 0);
    const minsFromNow = Math.max(0, Math.round((depDate - now) / 60000));
    return { ...train, minsFromNow };
  }).filter(t => t.minsFromNow >= -5); // Keep trains for 5 mins after departure
}
