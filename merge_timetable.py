"""
Merge the newly parsed harbour_dn_timetable.json into the main accurate_timetable.json.
This replaces all existing Harbour and Trans Harbour DN trains with the verified PDF data.
"""
import json

# Load existing timetable
with open('src/data/accurate_timetable.json', 'r', encoding='utf-8') as f:
    existing = json.load(f)

# Load new harbour data
with open('src/data/harbour_dn_timetable.json', 'r', encoding='utf-8') as f:
    harbour = json.load(f)

# Keep non-Harbour/Trans-Harbour trains, and keep UP direction harbour trains
kept_trains = []
removed_count = 0
for t in existing['trains']:
    line = t.get('line', '').lower()
    direction = t.get('direction', '')
    
    # Remove old Harbour/Trans-Harbour DN trains (we're replacing them)
    if line in ('harbour', 'trans harbour') and direction == 'DN':
        removed_count += 1
        continue
    
    kept_trains.append(t)

print(f"Removed {removed_count} old Harbour/Trans-Harbour DN trains")
print(f"Keeping {len(kept_trains)} other trains (Western, Central, UP direction, etc.)")

# Add new verified harbour trains
new_trains = harbour['trains']
print(f"Adding {len(new_trains)} new verified Harbour/Trans-Harbour DN trains")

all_trains = kept_trains + new_trains

# Rebuild metadata
line_counts = {}
for t in all_trains:
    line = t.get('line', 'Unknown')
    line_counts[line] = line_counts.get(line, 0) + 1

merged = {
    "metadata": {
        "generatedAt": "2026-05-14T05:55:00.000Z",
        "totalTrains": len(all_trains),
        "lines": line_counts,
        "harbourSource": "Official CR PDF - DN HB REVISED PTT WEF 01.05.2026"
    },
    "trains": all_trains
}

# Write merged timetable
with open('src/data/accurate_timetable.json', 'w', encoding='utf-8') as f:
    json.dump(merged, f, indent=2, ensure_ascii=False)

print(f"\n[OK] Merged timetable: {len(all_trains)} total trains")
print("Line breakdown:")
for k, v in sorted(line_counts.items()):
    print(f"  {k}: {v}")
