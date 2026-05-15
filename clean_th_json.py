import json

with open('src/data/accurate_timetable.json', 'r', encoding='utf-8') as f:
    app_data = json.load(f)

fixed_count = 0
for train in app_data['trains']:
    if train.get('line') == 'Trans Harbour':
        # Filter out 'Number' and 'Name'
        new_stops = [s for s in train['stops'] if s['station'].lower() not in ['number', 'name']]
        if len(new_stops) != len(train['stops']):
            train['stops'] = new_stops
            fixed_count += 1

with open('src/data/accurate_timetable.json', 'w', encoding='utf-8') as f:
    json.dump(app_data, f, indent=2, ensure_ascii=False)

print(f"Fixed {fixed_count} Trans-Harbour trains by removing 'Number' and 'Name' keys.")
