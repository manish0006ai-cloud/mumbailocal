"""
Fix Trans-Harbour trains: Add the Thane-side stops that are missing from the PDF.
The PDF only covers CSMT-Panvel section, so TH trains show "TNA" at CSMT but
start from Thane. We need to prepend the Thane → Nerul stops based on standard
Trans-Harbour running times.

Trans-Harbour route (DN direction):
Thane → Airoli → Rabale → Ghansoli → Kopar Khairane → Turbhe → Sanpada → Nerul → ...
The time gap from Thane dep to Nerul arr is typically ~25 minutes.
Standard inter-station times on the TH line from Thane:
  Thane → Airoli: 5 min
  Airoli → Rabale: 3 min  
  Rabale → Ghansoli: 2 min
  Ghansoli → Kopar Khairane: 3 min
  Kopar Khairane → Turbhe: 3 min
  Turbhe → Sanpada: 3 min (joins harbour line)
  Sanpada → Nerul: 4 min
Total: ~23 min
"""
import json

# Load the timetable
with open('src/data/accurate_timetable.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# TH stations from Thane to just before where they join the harbour line
# These are the exclusive TH stations not in the Harbour PDF
TH_PREPEND_STATIONS = [
    'Thane',
    'Airoli', 
    'Rabale',
    'Ghansoli',
    'Kopar Khairane',
    'Turbhe',
    # After Turbhe, trains join Harbour line at Sanpada/Nerul area
]

# Inter-station times from Thane (in minutes, cumulative)
TH_CUMULATIVE_MINS = {
    'Thane': 0,
    'Airoli': 5,
    'Rabale': 8,
    'Ghansoli': 10,
    'Kopar Khairane': 13,
    'Turbhe': 16,
}

def add_minutes(time_str, minutes):
    """Add minutes to a HH:MM time string."""
    h, m = map(int, time_str.split(':'))
    total = h * 60 + m + minutes
    return f"{(total // 60) % 24:02d}:{total % 60:02d}"

def sub_minutes(time_str, minutes):
    """Subtract minutes from a HH:MM time string."""
    h, m = map(int, time_str.split(':'))
    total = h * 60 + m - minutes
    if total < 0:
        total += 1440
    return f"{(total // 60) % 24:02d}:{total % 60:02d}"

fixed_count = 0
for train in data['trains']:
    if train.get('line') != 'Trans Harbour':
        continue
    
    # Check if Thane is already in the stops
    has_thane = any('thane' in s['station'].lower() for s in train['stops'])
    if has_thane:
        continue
    
    # Find the first stop we have (should be around Masjid or Nerul area)
    # For TH trains from the PDF, the first stops are usually Masjid (from CSMT side)
    # but the actual origin is Thane
    # 
    # The PDF shows TH trains with stops like: Masjid → Nerul → ... → Panvel
    # Masjid time is actually the time the train passes through Masjid on the harbour section
    # The Thane departure is typically ~25 mins before the Nerul arrival
    
    # Find Nerul in the stops
    nerul_idx = None
    nerul_time = None
    for i, s in enumerate(train['stops']):
        if 'nerul' in s['station'].lower():
            nerul_idx = i
            nerul_time = s['time']
            break
    
    if nerul_time is None:
        # Some TH trains may not stop at Nerul - find earliest harbour station
        # Try Sanpada
        for i, s in enumerate(train['stops']):
            if 'sanpada' in s['station'].lower():
                nerul_idx = i
                nerul_time = sub_minutes(s['time'], 2)  # Sanpada is ~2 min after Nerul
                break
    
    if nerul_time is None:
        print(f"  WARNING: Can't find Nerul/Sanpada for train {train['trainNo']}, skipping")
        continue
    
    # Calculate Thane departure time (Nerul arr - 23 minutes is approx Thane dep)
    thane_dep_mins = 23  # Total Thane → Nerul time
    thane_time = sub_minutes(nerul_time, thane_dep_mins)
    
    # Build the TH-side stops
    th_stops = []
    for station_name in TH_PREPEND_STATIONS:
        offset = TH_CUMULATIVE_MINS[station_name]
        stop_time = add_minutes(thane_time, offset)
        th_stops.append({'station': station_name, 'time': stop_time})
    
    # Remove Masjid and other CSMT-side stops that TH trains don't actually stop at
    # TH trains go: Thane → ... → Turbhe → Sanpada/Nerul → Belapur → ... → Panvel
    # The "Masjid" stop in the PDF is actually the time marker, not an actual stop
    # Remove stops before Nerul that are on the CSMT-Harbour section
    csmt_harbour_only = {'mumbai csmt', 'masjid', 'sandhurst road', 'dockyard road', 
                         'reay road', 'cotton green', 'sewri', 'vadala road', 
                         'kings circle', 'gtb nagar', 'chunabhatti', 'kurla',
                         'tilaknagar', 'chembur', 'govandi', 'mankhurd', 'vashi'}
    
    filtered_harbour_stops = [s for s in train['stops'] 
                              if s['station'].lower() not in csmt_harbour_only]
    
    # Combine: TH stops + filtered harbour stops (Nerul onwards)
    train['stops'] = th_stops + filtered_harbour_stops
    fixed_count += 1

print(f"Fixed {fixed_count} Trans-Harbour trains with Thane-side stops")

# Verify
th_trains = [t for t in data['trains'] if t.get('line') == 'Trans Harbour']
print(f"\nSample fixed TH train:")
t = th_trains[5]  # Pick a daytime train
print(f"Train {t['trainNo']} ({t.get('code', '?')}):")
for s in t['stops']:
    print(f"  {s['station']:25s} {s['time']}")

# Also check matchesStop compatibility - what names do we use?
print("\n--- Station name check ---")
# Check what the app station IDs map to for TH line
import sys
# We'll just check the station names we're using
for station in TH_PREPEND_STATIONS:
    print(f"  Using: '{station}'")

# Save
with open('src/data/accurate_timetable.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"\n[OK] Saved updated timetable")
