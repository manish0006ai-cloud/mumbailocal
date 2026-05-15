import { getStation, getStationsOnLine, findRoute, LINES, getLineInfo, stations } from './stations';

// AI Recommendation Engine for Mumbai Local Trains
// Provides intelligent suggestions based on train data and conditions

const PEAK_MORNING = { start: 7, end: 10.5 };
const PEAK_EVENING = { start: 17, end: 20.5 };

function getCurrentHourDecimal() {
  const now = new Date();
  return now.getHours() + now.getMinutes() / 60;
}

function isPeak() {
  const h = getCurrentHourDecimal();
  return (h >= PEAK_MORNING.start && h <= PEAK_MORNING.end) ||
         (h >= PEAK_EVENING.start && h <= PEAK_EVENING.end);
}

function isWeekend() {
  const day = new Date().getDay();
  return day === 0 || day === 6;
}

// Score a train (lower = better)
function scoreTrain(train) {
  let score = 0;
  
  // Time factor — prefer sooner departures
  score += train.minsFromNow * 2;
  
  // Speed factor — prefer fast
  if (train.isFast) score -= 15;
  
  // Crowd factor
  if (train.crowd === 'heavy') score += 20;
  if (train.crowd === 'medium') score += 8;
  if (train.crowd === 'low') score -= 5;
  
  // Delay factor
  score += train.delay * 5;
  
  // Duration factor
  score += train.duration * 0.5;
  
  return score;
}

// Get best train recommendation
export function getBestTrain(trains) {
  if (!trains || trains.length === 0) return null;
  
  let bestScore = Infinity;
  let bestTrain = trains[0];
  
  trains.forEach(train => {
    const s = scoreTrain(train);
    if (s < bestScore) {
      bestScore = s;
      bestTrain = train;
    }
  });
  
  return bestTrain;
}

// Get least crowded train
export function getLeastCrowded(trains) {
  const sorted = [...trains].sort((a, b) => {
    const crowdOrder = { low: 0, medium: 1, heavy: 2 };
    return (crowdOrder[a.crowd] || 1) - (crowdOrder[b.crowd] || 1);
  });
  return sorted[0] || null;
}

// Generate AI recommendation badges for trains
export function getTrainBadges(trains) {
  const badges = {};
  if (!trains || trains.length === 0) return badges;
  
  const best = getBestTrain(trains);
  if (best) badges[best.id] = 'Best Option';
  
  const leastCrowded = getLeastCrowded(trains);
  if (leastCrowded && leastCrowded.id !== best?.id) {
    badges[leastCrowded.id] = 'Less Crowded';
  }
  
  // Find fastest (by duration)
  const fastest = [...trains].sort((a, b) => a.duration - b.duration)[0];
  if (fastest && fastest.id !== best?.id && fastest.id !== leastCrowded?.id) {
    badges[fastest.id] = 'Fastest Route';
  }
  
  return badges;
}

// Generate AI insight messages
export async function generateInsights(trains, source, destination, generateTrainsFn) {
  const insights = [];
  if (!trains || trains.length === 0) return insights;
  
  const peak = isPeak();
  const weekend = isWeekend();
  const best = getBestTrain(trains);
  const leastCrowded = getLeastCrowded(trains);
  
  // Best train recommendation
  if (best) {
    const crowdText = best.crowd === 'low' ? 'Less crowded' : 
                      best.crowd === 'medium' ? 'Moderate crowd' : 'Expect heavy crowd';
    insights.push({
      type: 'recommendation',
      icon: '🎯',
      title: 'Best Train',
      message: `Take the ${best.departureTime} ${best.type} from ${source}. ${crowdText} and reaches ${destination} in ~${best.duration} mins.`,
      priority: 1
    });
  }
  
  // Less crowded alternative
  if (leastCrowded && leastCrowded.id !== best?.id) {
    insights.push({
      type: 'crowd',
      icon: '👥',
      title: 'Less Crowded Option',
      message: `${leastCrowded.departureTime} ${leastCrowded.type} has lower crowd. Good chance of getting a seat.`,
      priority: 2
    });
  }
  
  // Peak hour warning
  if (peak && !weekend) {
    insights.push({
      type: 'warning',
      icon: '⚡',
      title: 'Peak Hour',
      message: 'Currently peak hours. Expect heavy crowd and possible delays. Consider first or last coach for more space.',
      priority: 3
    });
  }
  
  // Weekend info
  if (weekend) {
    insights.push({
      type: 'info',
      icon: '🌤️',
      title: 'Weekend Schedule',
      message: 'Weekend trains run at reduced frequency. Less crowded overall. Check for mega block announcements.',
      priority: 3
    });
  }
  
  // Delay detection
  const delayedTrains = trains.filter(t => t.delay > 0);
  if (delayedTrains.length > 2) {
    insights.push({
      type: 'alert',
      icon: '⚠️',
      title: 'Delays Detected',
      message: `Multiple trains showing delays on this route. Average delay: ~${Math.round(delayedTrains.reduce((s, t) => s + t.delay, 0) / delayedTrains.length)} mins.`,
      priority: 1
    });
  }
  
  // Fast vs slow comparison
  const fastTrains = trains.filter(t => t.isFast);
  const slowTrains = trains.filter(t => !t.isFast);
  if (fastTrains.length > 0 && slowTrains.length > 0) {
    const avgFastDuration = Math.round(fastTrains.reduce((s, t) => s + t.duration, 0) / fastTrains.length);
    const avgSlowDuration = Math.round(slowTrains.reduce((s, t) => s + t.duration, 0) / slowTrains.length);
    const diff = avgSlowDuration - avgFastDuration;
    if (diff > 5) {
      insights.push({
        type: 'info',
        icon: '🚄',
        title: 'Fast Train Advantage',
        message: `Fast trains save ~${diff} mins compared to slow trains on this route.`,
        priority: 4
      });
    }
  }
  
  // Interchange guidance
  if (trains[0]?.route?.type === 'interchange') {
    const route = trains[0].route;
    const firstTrain = trains[0];
    
    // Calculate connecting train
    // First train arrives at interchange after 'duration' mins
    const arrTimeStr = firstTrain.arrivalTime; // e.g. "10:30"
    const [arrH, arrM] = arrTimeStr.split(':').map(Number);
    const arrDate = new Date();
    arrDate.setHours(arrH, arrM + 5, 0); // 5 min buffer for platform change
    
    // Find next connecting trains from interchange to final destination
    if (route.interchange && route.destId && generateTrainsFn) {
      const arrTimeStr = firstTrain.arrivalTime; // e.g. "10:30"
      const [arrH, arrM] = arrTimeStr.split(':').map(Number);
      const arrivalDate = new Date();
      arrivalDate.setHours(arrH, arrM + 7, 0, 0); // 7 min buffer for platform change
      
      // For multi-interchange, leg 2 goes to the middle hub (e.g. Thane)
      const leg2DestId = route.interchange.isMulti ? route.interchange.midDestId : route.destId;
      const connections = await generateTrainsFn(route.interchange.id, leg2DestId, 5, arrivalDate, true);
      const nextConnection = connections[0]; // First train after buffer
      
      // If 2 interchanges exist (3-leg route)
      let thirdLeg = null;
      if (route.interchange.isMulti && route.interchange.id2 && nextConnection) {
        const [arrH2, arrM2] = nextConnection.arrivalTime.split(':').map(Number);
        const arrivalDate2 = new Date();
        arrivalDate2.setHours(arrH2, arrM2 + 7, 0, 0);
        
        const connections2 = await generateTrainsFn(route.interchange.id2, route.destId, 5, arrivalDate2, true);
        thirdLeg = connections2[0];
      }

      insights.push({
        type: 'interchange',
        priority: 1,
        text: route.interchange.isMulti 
          ? `Change at Dadar to Central Line, then at Thane to Trans-Harbour Line. Catch the ${nextConnection?.departureTime} train.`
          : `Change at ${route.interchange.name}. Catch the ${nextConnection?.departureTime} ${nextConnection?.type} train.`,
        connection: nextConnection,
        connection2: thirdLeg
      });
    }
  }

  // Coach suggestion during peak
  if (peak && !weekend) {
    insights.push({
      type: 'tip',
      icon: '💡',
      title: 'Smart Tip',
      message: 'First class coaches and ladies compartments are less crowded during peak. Board from front or rear of platform for easier access.',
      priority: 5
    });
  }

  // Seat probability
  const nextTrain = trains[0];
  if (nextTrain) {
    if (nextTrain.seatProbability > 60) {
      insights.push({
        type: 'info',
        icon: '💺',
        title: 'Seating Available',
        message: `~${nextTrain.seatProbability}% chance of getting a seat on the next train.`,
        priority: 4
      });
    }
  }
  
  return insights.sort((a, b) => a.priority - b.priority);
}

// Generate live alerts (simulated)
export function generateAlerts() {
  const alerts = [];
  const hour = new Date().getHours();
  const rand = Math.random();
  
  // Simulated alerts based on time
  if (hour >= 7 && hour <= 10) {
    alerts.push({
      id: 'peak_morning',
      type: 'info',
      severity: 'medium',
      icon: '🕐',
      title: 'Morning Rush',
      message: 'Peak morning hours active. Expect heavy crowd on all lines.',
      color: 'orange'
    });
  }
  
  if (hour >= 17 && hour <= 20) {
    alerts.push({
      id: 'peak_evening',
      type: 'info',
      severity: 'medium',
      icon: '🌆',
      title: 'Evening Rush',
      message: 'Peak evening hours. Trains may be running at full capacity.',
      color: 'orange'
    });
  }
  
  // Random alerts
  if (rand < 0.15) {
    alerts.push({
      id: 'rain',
      type: 'weather',
      severity: 'high',
      icon: '🌧️',
      title: 'Rain Alert',
      message: 'Light rain reported. Harbour line may face waterlogging delays.',
      color: 'red'
    });
  }
  
  if (rand > 0.85) {
    alerts.push({
      id: 'megablock',
      type: 'block',
      severity: 'high',
      icon: '🚧',
      title: 'Mega Block',
      message: 'Scheduled mega block on Central line between Thane-Kalyan. Trains diverted.',
      color: 'red'
    });
  }
  
  if (rand > 0.7 && rand <= 0.85) {
    alerts.push({
      id: 'platform',
      type: 'platform',
      severity: 'medium',
      icon: '📢',
      title: 'Platform Change',
      message: 'Some Harbour line trains departing from Platform 2 instead of Platform 1 at CSMT.',
      color: 'orange'
    });
  }
  
  // Always show on-time if no major alerts
  if (alerts.length === 0) {
    alerts.push({
      id: 'ontime',
      type: 'status',
      severity: 'low',
      icon: '✅',
      title: 'All Lines Normal',
      message: 'All lines running on schedule. No disruptions reported.',
      color: 'green'
    });
  }
  
  return alerts;
}

// Parse voice query
export function parseVoiceQuery(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  
  // Patterns to match
  const patterns = [
    /(?:train\s+)?from\s+(\w[\w\s]*?)\s+to\s+(\w[\w\s]*?)$/i,
    /(\w[\w\s]*?)\s+to\s+(\w[\w\s]*?)$/i,
    /next\s+(?:fast\s+)?train\s+(?:from\s+)?(\w[\w\s]*?)\s+to\s+(\w[\w\s]*?)$/i,
    /(\w[\w\s]*?)\s+se\s+(\w[\w\s]*?)$/i, // Hindi pattern
  ];
  
  for (const pattern of patterns) {
    const match = lower.match(pattern);
    if (match) {
      return {
        source: match[1].trim(),
        destination: match[2].trim()
      };
    }
  }
  
  return null;
}

// Process natural language queries for the Timetable Agent
export async function processAgentQuery(text, timetableData) {
  if (!text) return { message: "How can I help you with the Mumbai Local timetable today?" };
  
  const lower = text.toLowerCase();
  
  // Improved station matching
  const foundStations = [];
  const queryWords = lower.split(/[\s,]+/);
  
  stations.forEach(s => {
    const sName = s.name.toLowerCase();
    const sCode = s.code.toLowerCase();
    
    // 1. Direct match in query
    if (lower.includes(sName) || lower.includes(sCode)) {
      foundStations.push(s);
      return;
    }
    
    // 2. Word-based match (e.g. "Kalyan" matches "Kalyan Junction")
    // Only match if the word is long enough to avoid false positives (e.g. "V" for Vashi)
    if (queryWords.some(w => w.length > 3 && (sName.startsWith(w) || sName.includes(" " + w)))) {
      foundStations.push(s);
    }
  });

  // Unique stations by name to avoid duplicates from different lines
  const uniqueStations = [];
  const seenNames = new Set();
  foundStations.forEach(s => {
    if (!seenNames.has(s.name.toLowerCase())) {
      seenNames.add(s.name.toLowerCase());
      uniqueStations.push(s);
    }
  });

  // 2. Identify Intent
  const isLastTrainQuery = lower.includes('last') || lower.includes('aakhri');
  const isFirstTrainQuery = lower.includes('first') || lower.includes('pehli');
  const isFastQuery = lower.includes('fast') || lower.includes('express') || lower.includes('tej');
  const isSlowQuery = lower.includes('slow') || lower.includes('dheemi');
  
  // 3. Handle Source/Destination
  let source = null;
  let destination = null;

  if (uniqueStations.length >= 2) {
    // Try to determine order (from X to Y)
    const fromIdx = lower.indexOf('from');
    const toIdx = lower.indexOf('to');
    const seIdx = lower.indexOf(' se ');
    
    if (fromIdx !== -1 && toIdx !== -1) {
      const s1 = uniqueStations.find(s => lower.indexOf(s.name.toLowerCase()) >= fromIdx && lower.indexOf(s.name.toLowerCase()) < toIdx);
      const s2 = uniqueStations.find(s => lower.indexOf(s.name.toLowerCase()) >= toIdx);
      if (s1 && s2) { source = s1; destination = s2; }
    } else if (seIdx !== -1) {
       // Hindi "X se Y"
       source = uniqueStations.find(s => lower.indexOf(s.name.toLowerCase()) < seIdx);
       destination = uniqueStations.find(s => lower.indexOf(s.name.toLowerCase()) > seIdx);
    }
    
    // Fallback: just pick the first two found if order is unclear
    if (!source) {
      source = uniqueStations[0];
      destination = uniqueStations[1];
    }
  } else if (uniqueStations.length === 1) {
    // Only one station mentioned, maybe "trains to X" or "trains from X"
    if (lower.includes(' to ') || lower.includes('ko ') || lower.includes('taraf')) {
      destination = uniqueStations[0];
      // Default source for major lines if heading to terminus or away
      if (destination.line === 'western') source = getStation('cg'); // Churchgate
      else if (destination.line === 'central') source = getStation('csmt'); // CSMT
      else if (destination.line === 'harbour') source = getStation('h_csmt'); // Harbour CSMT
    } else {
      source = uniqueStations[0];
    }
  }

  if (!source && !destination) {
    return { 
      message: "I couldn't quite catch the stations. Which route are you looking for? (e.g., 'Trains from Borivali to Churchgate')" 
    };
  }

  // 4. Query Timetable using accurate CSV-parsed data
  // The new format: timetableData = { metadata, trains: [{ trainNo, line, direction, type, stops: [{ station, time }] }] }
  const trainsList = timetableData.trains || timetableData;
  const results = [];

  // Helper: fuzzy match a station object against a timetable stop name
  const matchesStop = (appStation, stopName) => {
    const sn = stopName.toLowerCase().replace(/['.()]/g, '');
    const an = appStation.name.toLowerCase().replace(/['.()]/g, '');
    const ac = appStation.code.toLowerCase();
    // Direct match
    if (sn === an || sn.includes(an) || an.includes(sn)) return true;
    // Code match
    if (sn === ac) return true;
    // Partial word match (e.g. "churchgate" matches "CHURCHGATE", "borivali" matches "BORIVALI")
    const snWords = sn.split(/\s+/);
    const anWords = an.split(/\s+/);
    if (anWords.some(w => w.length > 3 && snWords.some(sw => sw.includes(w) || w.includes(sw)))) return true;
    // Special cases
    if (an.includes('mumbai central') && sn.includes('bai central')) return true;
    if (an === 'csmt' && (sn.includes('csmt') || sn.includes('mumbai csmt'))) return true;
    return false;
  };

  if (source && destination) {
    for (const t of trainsList) {
      const sIdx = t.stops.findIndex(s => matchesStop(source, s.station));
      const dIdx = t.stops.findIndex(s => matchesStop(destination, s.station));
      
      if (sIdx !== -1 && dIdx !== -1 && sIdx < dIdx) {
        const isFast = t.type === 'Fast';
        
        if (isFastQuery && !isFast) continue;
        if (isSlowQuery && isFast) continue;
        
        results.push({
          id: t.trainNo,
          departure: t.stops[sIdx].time,
          arrival: t.stops[dIdx].time,
          isFast,
          line: t.line,
          stopsCount: dIdx - sIdx
        });
      }
    }
  } else if (source) {
     return { message: `Where would you like to go from ${source.name}?` };
  } else if (destination) {
     return { message: `Where are you starting from to go to ${destination.name}?` };
  }

  if (results.length === 0) {
    return { message: `I couldn't find any direct trains from ${source.name} to ${destination.name} in my records.` };
  }

  // Sort by departure time
  results.sort((a, b) => a.departure.localeCompare(b.departure));

  // 5. Format Response
  if (isLastTrainQuery) {
    const last = results[results.length - 1];
    return {
      message: `🚂 The **last train** from ${source.name} to ${destination.name} departs at **${last.departure}** (arrives ${last.arrival}). Train #${last.id} — ${last.isFast ? '⚡ Fast' : '🐌 Slow'}.`,
      data: [last]
    };
  }

  if (isFirstTrainQuery) {
    const first = results[0];
    return {
      message: `🚂 The **first train** from ${source.name} to ${destination.name} departs at **${first.departure}** (arrives ${first.arrival}). Train #${first.id} — ${first.isFast ? '⚡ Fast' : '🐌 Slow'}.`,
      data: [first]
    };
  }

  // Next trains based on current time
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const upcoming = results.filter(r => r.departure >= currentTime).slice(0, 5);

  if (upcoming.length === 0) {
    return {
      message: `No more trains today from ${source.name} to ${destination.name}. First tomorrow: **${results[0].departure}** (Train #${results[0].id}).`,
      data: [results[0]]
    };
  }

  const list = upcoming.map(u => `• **${u.departure}** → ${u.arrival} — ${u.isFast ? '⚡Fast' : '🐌Slow'} (Train #${u.id})`).join('\n');
  const total = results.length;
  return {
    message: `🚉 Next trains from **${source.name}** to **${destination.name}** (${total} total today):\n\n${list}`,
    data: upcoming
  };
}


// Crowd prediction over time
export function getCrowdTimeline() {
  const timeline = [];
  for (let h = 5; h <= 23; h++) {
    let level;
    if (h >= 7 && h <= 10) level = h >= 8 && h <= 9.5 ? 95 : 75;
    else if (h >= 17 && h <= 20) level = h >= 18 && h <= 19 ? 90 : 70;
    else if (h >= 11 && h <= 15) level = 30;
    else if (h >= 21) level = 25;
    else level = 40;
    
    if (isWeekend()) level = Math.round(level * 0.5);
    
    timeline.push({
      hour: h,
      label: `${h > 12 ? h - 12 : h}${h >= 12 ? 'PM' : 'AM'}`,
      level
    });
  }
  return timeline;
}

