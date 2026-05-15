import json

with open('src/data/accurate_timetable.json', 'r', encoding='utf-8') as f:
    app_data = json.load(f)

# Filter out old DN Trans Harbour trains
new_trains = [t for t in app_data['trains'] if not (t.get('line') == 'Trans Harbour' and t.get('direction') == 'DN')]

with open('parsed_th_down.json', 'r', encoding='utf-8') as f:
    parsed_down = json.load(f)

for t_num, stops in parsed_down.items():
    new_train = {
        "trainNo": t_num,
        "code": f"TH {t_num}",
        "line": "Trans Harbour",
        "direction": "DN",
        "type": "Slow",
        "stops": stops
    }
    new_trains.append(new_train)

app_data['trains'] = new_trains

with open('src/data/accurate_timetable.json', 'w', encoding='utf-8') as f:
    json.dump(app_data, f, indent=2, ensure_ascii=False)

print(f"Injected {len(parsed_down)} DOWN Trans-Harbour trains.")
