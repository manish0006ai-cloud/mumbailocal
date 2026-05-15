import json

with open('src/data/harbour_dn_timetable.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

th_trains = [t for t in d['trains'] if t.get('line') == 'Trans Harbour']
print(f"Total TH trains: {len(th_trains)}")

# Show first 3 TH trains
for t in th_trains[:3]:
    print(f"\nTrain {t['trainNo']} ({t['code']}):")
    print(f"  Stops ({len(t['stops'])}): ", end="")
    for s in t['stops'][:5]:
        print(f"{s['station']}({s['time']}), ", end="")
    print("...")

# Check if any TH train has Thane in stops
has_thane = sum(1 for t in th_trains if any('thane' in s['station'].lower() for s in t['stops']))
print(f"\nTH trains with 'Thane' in stops: {has_thane}/{len(th_trains)}")

# Check what the first station is for TH trains  
first_stations = set(t['stops'][0]['station'] for t in th_trains)
print(f"First stations of TH trains: {first_stations}")

# Check station IDs used in app
from_stations_js = ['Thane', 'thane', 'TNA', 'Airoli', 'Rabale', 'Ghansoli', 'Kopar Khairane']
print(f"\nLooking for these station names in TH stops: {from_stations_js}")
for name in from_stations_js:
    count = sum(1 for t in th_trains if any(name.lower() in s['station'].lower() for s in t['stops']))
    print(f"  '{name}': found in {count} trains")
