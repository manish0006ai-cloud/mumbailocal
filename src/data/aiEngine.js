import { getStation, getStationsOnLine, findRoute, LINES, getLineInfo } from './stations';

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
export function generateInsights(trains, source, destination, generateTrainsFn) {
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
      const connections = generateTrainsFn(route.interchange.id, route.destId, 5);
      const nextConnection = connections.find(c => {
        const [depH, depM] = c.departureTime.split(':').map(Number);
        const depDate = new Date();
        depDate.setHours(depH, depM, 0);
        return depDate > arrDate;
      }) || connections[0];

      insights.push({
        type: 'interchange',
        icon: '🔄',
        title: 'Next Catching Train',
        message: nextConnection 
          ? `Change at ${route.interchange.station}. After arriving, catch the ${nextConnection.departureTime} ${nextConnection.type} train to your destination.`
          : `Change at ${route.interchange.station}. Check local indicators for the next connection to your destination.`,
        priority: 0,
        connection: nextConnection
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
