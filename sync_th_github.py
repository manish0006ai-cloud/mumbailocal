import requests
import json
import time

repo_api_url = "https://api.github.com/repos/guru809/MumbaiLocalTrainsJSON/contents"
routes = ['Thane-Panvel', 'Panvel-Thane', 'Thane-Vashi', 'Vashi-Thane', 'Thane-Nerul', 'Nerul -Thane']

# Get existing timetable
with open('src/data/accurate_timetable.json', 'r', encoding='utf-8') as f:
    app_data = json.load(f)

# Create a map of trainNo -> train object in our app for easy updating
train_map = {t['trainNo']: t for t in app_data['trains'] if t.get('line') == 'Trans Harbour'}
print(f"Loaded {len(train_map)} TH trains from app data")

updated_count = 0
added_count = 0

for route in routes:
    print(f"Fetching {route}...")
    try:
        r = requests.get(f"{repo_api_url}/{route}")
        files = r.json()
        
        for f in files:
            if not f['name'].endswith('.json'):
                continue
            
            train_no = f['name'].replace('.json', '')
            
            # Fetch the actual train json
            train_r = requests.get(f['download_url'])
            train_data = train_r.json()
            
            # The structure is likely {"Thane": "00:11", "Airoli": "00:16", ...}
            # Or something similar. Let's convert it to our format
            stops = []
            for stn, time_str in train_data.items():
                if time_str and time_str != "-":
                    stops.append({"station": stn, "time": time_str})
            
            # If train exists in our data, update stops
            if train_no in train_map:
                train_map[train_no]['stops'] = stops
                updated_count += 1
            else:
                # Add it!
                # Determine direction based on route
                direction = "DN" if route.startswith("Thane-") else "UP"
                
                new_train = {
                    "trainNo": train_no,
                    "code": f"TH {train_no}",
                    "line": "Trans Harbour",
                    "direction": direction,
                    "type": "Slow", # All TH are slow
                    "stops": stops
                }
                app_data['trains'].append(new_train)
                train_map[train_no] = new_train
                added_count += 1
            
            # Sleep tiny bit to avoid rate limits
            time.sleep(0.05)
    except Exception as e:
        print(f"Error on {route}: {e}")

print(f"Updated {updated_count} existing TH trains.")
print(f"Added {added_count} new TH trains.")

with open('src/data/accurate_timetable.json', 'w', encoding='utf-8') as f:
    json.dump(app_data, f, indent=2, ensure_ascii=False)
