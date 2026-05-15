import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'dart:async';

/// Core location tracking service.
/// Handles GPS permissions, background tracking, and position updates.
class LocationService extends ChangeNotifier {
  Position? _currentPosition;
  double _speed = 0; // in km/h
  double _heading = 0; // degrees
  bool _isTracking = false;
  bool _hasPermission = false;
  StreamSubscription<Position>? _positionStream;
  String _status = 'idle'; // idle, requesting_permission, tracking, error

  // Mumbai bounding box for quick validation
  static const double _mumbaiMinLat = 18.85;
  static const double _mumbaiMaxLat = 19.35;
  static const double _mumbaiMinLng = 72.75;
  static const double _mumbaiMaxLng = 73.05;

  Position? get currentPosition => _currentPosition;
  double get speed => _speed;
  double get heading => _heading;
  bool get isTracking => _isTracking;
  bool get hasPermission => _hasPermission;
  String get status => _status;

  bool get isInMumbaiRegion {
    if (_currentPosition == null) return false;
    return _currentPosition!.latitude >= _mumbaiMinLat &&
        _currentPosition!.latitude <= _mumbaiMaxLat &&
        _currentPosition!.longitude >= _mumbaiMinLng &&
        _currentPosition!.longitude <= _mumbaiMaxLng;
  }

  /// Request location permissions
  Future<bool> requestPermission() async {
    _status = 'requesting_permission';
    notifyListeners();

    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      _status = 'error';
      notifyListeners();
      return false;
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        _status = 'error';
        _hasPermission = false;
        notifyListeners();
        return false;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      _status = 'error';
      _hasPermission = false;
      notifyListeners();
      return false;
    }

    _hasPermission = true;
    _status = 'idle';
    notifyListeners();
    return true;
  }

  /// Start tracking position at optimized intervals
  Future<void> startTracking() async {
    if (_isTracking) return;

    final hasPerms = await requestPermission();
    if (!hasPerms) return;

    _isTracking = true;
    _status = 'tracking';
    notifyListeners();

    // Optimized settings for train tracking:
    // - 5 second intervals (trains move ~25m/s at 90kmph)
    // - 20m distance filter to avoid noisy updates when stationary
    // - Best accuracy when actively tracking
    const LocationSettings locationSettings = LocationSettings(
      accuracy: LocationAccuracy.high,
      distanceFilter: 20, // Only trigger on 20m+ movement
    );

    _positionStream =
        Geolocator.getPositionStream(locationSettings: locationSettings).listen(
      (Position position) {
        _currentPosition = position;
        _speed = position.speed * 3.6; // m/s to km/h
        _heading = position.heading;
        notifyListeners();
      },
      onError: (error) {
        _status = 'error';
        notifyListeners();
      },
    );
  }

  /// Stop tracking
  void stopTracking() {
    _positionStream?.cancel();
    _positionStream = null;
    _isTracking = false;
    _status = 'idle';
    notifyListeners();
  }

  @override
  void dispose() {
    _positionStream?.cancel();
    super.dispose();
  }
}
