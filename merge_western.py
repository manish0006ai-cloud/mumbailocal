import json

with open('src/data/accurate_timetable.json', 'r', encoding='utf-8') as f:
    app_data = json.load(f)

kept_trains = []
removed = 0
for t in app_data['trains']:
    if t.get('line') == 'Western':
        removed += 1
        continue
    kept_trains.append(t)

print(f"Removed {removed} legacy Western line trains.")

with open('src/data/western_parsed_all.json', 'r', encoding='utf-8') as f:
    wr_trains = json.load(f)['trains']

print(f"Injecting {len(wr_trains)} verified ground-truth Western line trains (DN, UP, AC).")

all_trains = kept_trains + wr_trains

# Recompute metadata breakdown
lines = {}
for t in all_trains:
    l = t.get('line', 'Unknown')
    lines[l] = lines.get(l, 0) + 1

app_data['metadata']['totalTrains'] = len(all_trains)
app_data['metadata']['lines'] = lines
app_data['metadata']['westernSource'] = "Official WR PDFs - DN, UP, AC W.E.F. 01.05.2026"
app_data['trains'] = all_trains

with open('src/data/accurate_timetable.json', 'w', encoding='utf-8') as f:
    json.dump(app_data, f, indent=2, ensure_ascii=False)

print(f"\nSuccessfully updated accurate_timetable.json. Total trains: {len(all_trains)}")
print("Final Application Line Breakdown:")
for k, v in sorted(lines.items()):
    print(f"  {k}: {v}")
