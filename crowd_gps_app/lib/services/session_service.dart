import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';

/// Anonymous session management for crowd GPS sharing.
/// No personal data is stored — only anonymous session IDs with TTL.
class SessionService extends ChangeNotifier {
  final SharedPreferences _prefs;
  String? _sessionId;
  bool _isSharingEnabled = false;
  DateTime? _sessionStart;
  String _probableLine = 'unknown';
  int _activeUsers = 0; // From Firestore aggregation
  String _crowdLevel = 'unknown'; // low, medium, heavy, extreme

  // Railway line geofences (simplified bounding boxes)
  static const Map<String, Map<String, double>> _lineGeofences = {
    'western': {
      'minLat': 18.93, 'maxLat': 19.43,
      'minLng': 72.81, 'maxLng': 72.86,
    },
    'central': {
      'minLat': 18.96, 'maxLat': 19.18,
      'minLng': 72.83, 'maxLng': 72.98,
    },
    'harbour': {
      'minLat': 18.93, 'maxLat': 19.08,
      'minLng': 72.83, 'maxLng': 73.02,
    },
    'trans_harbour': {
      'minLat': 19.00, 'maxLat': 19.10,
      'minLng': 72.98, 'maxLng': 73.05,
    },
  };

  SessionService(this._prefs) {
    _isSharingEnabled = _prefs.getBool('gps_sharing_enabled') ?? false;
  }

  String? get sessionId => _sessionId;
  bool get isSharingEnabled => _isSharingEnabled;
  DateTime? get sessionStart => _sessionStart;
  String get probableLine => _probableLine;
  int get activeUsers => _activeUsers;
  String get crowdLevel => _crowdLevel;

  /// Toggle GPS sharing on/off
  Future<void> toggleSharing(bool enabled) async {
    _isSharingEnabled = enabled;
    await _prefs.setBool('gps_sharing_enabled', enabled);

    if (enabled) {
      _startSession();
    } else {
      _endSession();
    }
    notifyListeners();
  }

  /// Start a new anonymous session
  void _startSession() {
    const uuid = Uuid();
    _sessionId = 'anon_${uuid.v4().substring(0, 8)}';
    _sessionStart = DateTime.now();
    notifyListeners();
  }

  /// End current session
  void _endSession() {
    // In production: delete the Firestore session doc here
    _sessionId = null;
    _sessionStart = null;
    _probableLine = 'unknown';
    notifyListeners();
  }

  /// Detect which railway line the user is probably on
  String detectLine(double lat, double lng) {
    for (final entry in _lineGeofences.entries) {
      final bounds = entry.value;
      if (lat >= bounds['minLat']! &&
          lat <= bounds['maxLat']! &&
          lng >= bounds['minLng']! &&
          lng <= bounds['maxLng']!) {
        _probableLine = entry.key;
        notifyListeners();
        return entry.key;
      }
    }
    _probableLine = 'unknown';
    notifyListeners();
    return 'unknown';
  }

  /// Update crowd data from Firestore (called periodically)
  void updateCrowdData(int users, String level) {
    _activeUsers = users;
    _crowdLevel = level;
    notifyListeners();
  }

  @override
  void dispose() {
    _endSession();
    super.dispose();
  }
}
