import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import '../services/location_service.dart';
import '../services/session_service.dart';
import '../data/railway_corridors.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  final MapController _mapController = MapController();
  
  // Mumbai center
  static const LatLng _mumbaiCenter = LatLng(19.076, 72.877);
  
  @override
  Widget build(BuildContext context) {
    final location = context.watch<LocationService>();
    final session = context.watch<SessionService>();

    return Scaffold(
      body: Stack(
        children: [
          // Map
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: location.currentPosition != null
                  ? LatLng(
                      location.currentPosition!.latitude,
                      location.currentPosition!.longitude,
                    )
                  : _mumbaiCenter,
              initialZoom: 12,
              maxZoom: 18,
              minZoom: 10,
            ),
            children: [
              // Dark tile layer
              TileLayer(
                urlTemplate: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
                subdomains: const ['a', 'b', 'c', 'd'],
                userAgentPackageName: 'com.localpulse.crowd_gps',
              ),

              // Railway corridor polylines
              PolylineLayer(
                polylines: _buildCorridorPolylines(),
              ),

              // Station markers
              MarkerLayer(
                markers: _buildStationMarkers(),
              ),

              // User location marker
              if (location.currentPosition != null)
                MarkerLayer(
                  markers: [
                    Marker(
                      point: LatLng(
                        location.currentPosition!.latitude,
                        location.currentPosition!.longitude,
                      ),
                      width: 24,
                      height: 24,
                      child: Container(
                        decoration: BoxDecoration(
                          color: const Color(0xFF00E5FF),
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 2),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF00E5FF).withValues(alpha: 0.5),
                              blurRadius: 12,
                              spreadRadius: 4,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
            ],
          ),

          // Top overlay - Back button & status
          Positioned(
            top: MediaQuery.of(context).padding.top + 8,
            left: 16,
            right: 16,
            child: Row(
              children: [
                // Back button
                GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0A0E1A).withValues(alpha: 0.9),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.grey.withValues(alpha: 0.3)),
                    ),
                    child: const Icon(Icons.arrow_back, color: Colors.white, size: 20),
                  ),
                ),
                const SizedBox(width: 12),
                // Status badge
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0A0E1A).withValues(alpha: 0.9),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: session.isSharingEnabled
                            ? const Color(0xFF00E5FF).withValues(alpha: 0.3)
                            : Colors.grey.withValues(alpha: 0.3),
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          session.isSharingEnabled ? Icons.share_location : Icons.location_off,
                          color: session.isSharingEnabled
                              ? const Color(0xFF00E5FF)
                              : Colors.grey,
                          size: 18,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            session.isSharingEnabled
                                ? 'Sharing • ${session.probableLine.toUpperCase()} Line'
                                : 'GPS Sharing Off',
                            style: TextStyle(
                              fontSize: 13,
                              color: session.isSharingEnabled
                                  ? Colors.white
                                  : Colors.grey,
                              fontWeight: FontWeight.w500,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (location.isTracking)
                          Text(
                            '${location.speed.toStringAsFixed(0)} km/h',
                            style: const TextStyle(
                              fontSize: 13,
                              color: Color(0xFF00E5FF),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Bottom panel - Line legend
          Positioned(
            bottom: MediaQuery.of(context).padding.bottom + 16,
            left: 16,
            right: 16,
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF0A0E1A).withValues(alpha: 0.95),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.withValues(alpha: 0.2)),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.train, color: Colors.white, size: 16),
                      SizedBox(width: 8),
                      Text(
                        'Railway Lines',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _LineLegend(color: Colors.blue, label: 'Western'),
                      _LineLegend(color: Colors.red, label: 'Central'),
                      _LineLegend(color: Colors.green, label: 'Harbour'),
                      _LineLegend(color: Colors.purple, label: 'Trans-HB'),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // Recenter FAB
          Positioned(
            bottom: MediaQuery.of(context).padding.bottom + 100,
            right: 16,
            child: FloatingActionButton.small(
              onPressed: () {
                if (location.currentPosition != null) {
                  _mapController.move(
                    LatLng(
                      location.currentPosition!.latitude,
                      location.currentPosition!.longitude,
                    ),
                    14,
                  );
                } else {
                  _mapController.move(_mumbaiCenter, 12);
                }
              },
              backgroundColor: const Color(0xFF111827),
              child: const Icon(Icons.my_location, color: Color(0xFF00E5FF), size: 20),
            ),
          ),
        ],
      ),
    );
  }

  List<Polyline> _buildCorridorPolylines() {
    final corridors = RailwayCorridors.corridors;
    final List<Polyline> polylines = [];

    for (final corridor in corridors) {
      polylines.add(
        Polyline(
          points: (corridor['stations'] as List).map((s) {
            return LatLng(s['lat'] as double, s['lng'] as double);
          }).toList(),
          color: _lineColor(corridor['id'] as String),
          strokeWidth: 3,
        ),
      );
    }

    return polylines;
  }

  List<Marker> _buildStationMarkers() {
    final corridors = RailwayCorridors.corridors;
    final List<Marker> markers = [];

    for (final corridor in corridors) {
      final color = _lineColor(corridor['id'] as String);
      for (final station in (corridor['stations'] as List)) {
        markers.add(
          Marker(
            point: LatLng(station['lat'] as double, station['lng'] as double),
            width: 8,
            height: 8,
            child: Container(
              decoration: BoxDecoration(
                color: color,
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white.withValues(alpha: 0.5), width: 0.5),
              ),
            ),
          ),
        );
      }
    }

    return markers;
  }

  Color _lineColor(String lineId) {
    switch (lineId) {
      case 'western': return Colors.blue;
      case 'central': return Colors.red;
      case 'harbour': return Colors.green;
      case 'trans_harbour': return Colors.purple;
      default: return Colors.grey;
    }
  }
}

class _LineLegend extends StatelessWidget {
  final Color color;
  final String label;

  const _LineLegend({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 12,
          height: 3,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(width: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            color: Colors.grey[400],
          ),
        ),
      ],
    );
  }
}
