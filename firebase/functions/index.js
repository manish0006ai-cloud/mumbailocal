const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

// Geo-utilities
function getDistanceInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; // Distance in km
}

/**
 * Triggered on write to /active_sessions/{sessionId}
 * Detects spatiotemporal clusters to identify train movement.
 */
exports.detectTrainClusters = functions.firestore
  .document('active_sessions/{sessionId}')
  .onWrite(async (change, context) => {
    // If deleted, just exit
    if (!change.after.exists) return null;

    const sessionData = change.after.data();
    if (!sessionData.lat || !sessionData.lng) return null;

    // We only process if confidence is high and moving
    if (sessionData.speed < 10) return null; // Assuming stationary
    
    const CLUSTER_RADIUS_KM = 0.5; // 500m
    const MAX_AGE_SECONDS = 60; // 1 min

    const now = admin.firestore.Timestamp.now();
    const cutoffTimestamp = new admin.firestore.Timestamp(now.seconds - MAX_AGE_SECONDS, now.nanoseconds);

    // Query active sessions
    // Note: In a production app, we would use GeoFirestore for efficient spatial querying.
    // For this prototype, we query recent sessions on the same line and filter by distance.
    const sessionsRef = db.collection('active_sessions');
    const recentSessionsQuery = await sessionsRef
      .where('probable_line', '==', sessionData.probable_line)
      .where('timestamp', '>=', cutoffTimestamp)
      .get();

    let clusterUsers = [];
    let avgSpeed = 0;
    let avgDirection = 0;

    recentSessionsQuery.forEach(doc => {
      const data = doc.data();
      const dist = getDistanceInKm(sessionData.lat, sessionData.lng, data.lat, data.lng);
      
      // Filter by radius, similar speed (±15km/h), and similar direction (±30 degrees)
      if (dist <= CLUSTER_RADIUS_KM && 
          Math.abs(data.speed - sessionData.speed) < 15) {
          
          let dirDiff = Math.abs(data.direction - sessionData.direction);
          if (dirDiff > 180) dirDiff = 360 - dirDiff;
          
          if (dirDiff < 30) {
              clusterUsers.push(data);
              avgSpeed += data.speed;
              avgDirection += data.direction;
          }
      }
    });

    // Need at least 3 users to form a confident cluster
    if (clusterUsers.length >= 3) {
      avgSpeed /= clusterUsers.length;
      avgDirection /= clusterUsers.length;

      // Determine crowd level
      let crowdLevel = 'low';
      if (clusterUsers.length > 40) crowdLevel = 'extreme';
      else if (clusterUsers.length > 15) crowdLevel = 'heavy';
      else if (clusterUsers.length > 5) crowdLevel = 'medium';

      // Create a deterministic cluster ID based on location grid and line
      const gridLat = Math.round(sessionData.lat * 100) / 100; // ~1.1km grid
      const gridLng = Math.round(sessionData.lng * 100) / 100;
      const clusterId = `cluster_${sessionData.probable_line}_${gridLat}_${gridLng}`;

      await db.collection('movement_clusters').doc(clusterId).set({
        cluster_id: clusterId,
        route: sessionData.probable_line,
        avg_speed: avgSpeed,
        direction: avgDirection,
        active_users: clusterUsers.length,
        crowd_level: crowdLevel,
        confidence_score: 0.8 + (clusterUsers.length * 0.01), // Maxes out
        head_lat: sessionData.lat, // Simplification
        head_lng: sessionData.lng,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      
      console.log(`Updated cluster ${clusterId} with ${clusterUsers.length} users.`);
    }

    return null;
  });

/**
 * Scheduled function to clean up stale sessions and clusters
 * Runs every 5 minutes
 */
exports.cleanupStaleData = functions.pubsub.schedule('every 5 minutes').onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();
    
    // Cleanup sessions older than 5 minutes
    const sessionCutoff = new admin.firestore.Timestamp(now.seconds - 300, now.nanoseconds);
    const oldSessions = await db.collection('active_sessions').where('timestamp', '<', sessionCutoff).get();
    
    const batch = db.batch();
    oldSessions.forEach(doc => {
        batch.delete(doc.ref);
    });

    // Cleanup clusters older than 10 minutes
    const clusterCutoff = new admin.firestore.Timestamp(now.seconds - 600, now.nanoseconds);
    const oldClusters = await db.collection('movement_clusters').where('updated_at', '<', clusterCutoff).get();
    
    oldClusters.forEach(doc => {
        batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Cleaned up ${oldSessions.size} sessions and ${oldClusters.size} clusters.`);
    return null;
});
