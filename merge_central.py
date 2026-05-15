import json

with open('src/data/accurate_timetable.json', 'r', encoding='utf-8') as f:
    app_data = json.load(f)

# Filter out old Central DN trains
kept_trains = []
removed = 0
for t in app_data['trains']:
    if t.get('line') == 'Central' and t.get('direction') == 'DN':
        removed += 1
        continue
    kept_trains.append(t)

print(f"Removed {removed} legacy Central Line DOWN trains.")

with open('src/data/central_dn_parsed.json', 'r', encoding='utf-8') as f:
    new_central = json.load(f)['trains']

print(f"Injecting {len(new_central)} highly accurate parsed Central Line DOWN trains.")

all_trains = kept_trains + new_central

# Rebuild metadata counts
lines = {}
for t in all_trains:
    l = t.get('line', 'Unknown')
    lines[l] = lines.get(l, 0) + 1

app_data['metadata']['totalTrains'] = len(all_trains)
app_data['metadata']['lines'] = lines
app_data['metadata']['centralSource'] = "Official CR PDF - SUB PTT DN ML'24"
app_data['trains'] = all_trains

with open('src/data/accurate_timetable.json', 'w', encoding='utf-8') as f:
    json.dump(app_data, f, indent=2, ensure_ascii=False)

print(f"\nSuccessfully saved accurate_timetable.json with {len(all_trains)} total trains.")
print("Updated Line Breakdown:")
for k, v in sorted(lines.items()):
    print(f"  {k}: {v}")
