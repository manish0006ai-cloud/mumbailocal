import pdfplumber
import json

files = [
    {"path": "wr_dn.pdf", "dir": "DN", "ac": False},
    {"path": "wr_ac_dn.pdf", "dir": "DN", "ac": True},
    {"path": "wr_up.pdf", "dir": "UP", "ac": False},
    {"path": "wr_ac_up.pdf", "dir": "UP", "ac": True}
]

output_path = "src/data/western_parsed_all.json"

STNS_DN = [
    'Churchgate', 'Marine Lines', 'Charni Road', 'Grant Road', 'Mumbai Central',
    'Mahalaxmi', 'Lower Parel', 'Prabhadevi', 'Dadar', 'Matunga Road',
    'Mahim Junction', 'Bandra', 'Khar Road', 'Santacruz', 'Vile Parle',
    'Andheri', 'Jogeshwari', 'Ram Mandir', 'Goregaon', 'Malad', 'Kandivali',
    'Borivali', 'Dahisar', 'Mira Road', 'Bhayandar', 'Naigaon', 'Vasai Road',
    'Nallasopara', 'Virar'
]

STNS_UP = list(reversed(STNS_DN))

def get_canonical_wr_station(line_str):
    s = line_str.upper()
    if 'CHURCHGATE' in s: return 'Churchgate'
    if 'MARINE' in s: return 'Marine Lines'
    if 'CHARNI' in s: return 'Charni Road'
    if 'GRANT' in s: return 'Grant Road'
    if 'CENTRAL' in s: return 'Mumbai Central'
    if 'MAHALAKSHMI' in s or 'MAHALAXMI' in s: return 'Mahalaxmi'
    if 'LOWER' in s: return 'Lower Parel'
    if 'PRABHADEVI' in s: return 'Prabhadevi'
    if 'DADAR' in s: return 'Dadar'
    if 'MATUNGA' in s: return 'Matunga Road'
    if 'MAHIM' in s: return 'Mahim Junction'
    if 'BANDRA' in s: return 'Bandra'
    if 'KHAR' in s: return 'Khar Road'
    if 'SANTA' in s: return 'Santacruz'
    if 'VILE' in s: return 'Vile Parle'
    if 'ANDHERI' in s: return 'Andheri'
    if 'JOGESHWARI' in s: return 'Jogeshwari'
    if 'RAM' in s: return 'Ram Mandir'
    if 'GOREGAON' in s: return 'Goregaon'
    if 'MALAD' in s: return 'Malad'
    if 'KANDIV' in s: return 'Kandivali'
    if 'BORIVALI' in s: return 'Borivali'
    if 'DAHISAR' in s: return 'Dahisar'
    if 'MIRA' in s: return 'Mira Road'
    if 'BHAYANDAR' in s: return 'Bhayandar'
    if 'NAIGAON' in s: return 'Naigaon'
    if 'VASAI' in s: return 'Vasai Road'
    if 'NALLA' in s: return 'Nallasopara'
    if 'VIRAR' in s: return 'Virar'
    return None

def is_time_word(w_text):
    s = w_text.strip().upper()
    if any(k in s for k in ('AIR', 'CONDITION', 'NOT', 'SAT', 'SUN', 'ONLY', 'NON', 'CAR', 'W.E.F', 'STATIONS', 'TRAINS')):
        return False
    if any(c.isdigit() or c == ':' for c in s):
        return True
    return False

all_trains = []

for f_info in files:
    print(f"\nProcessing {f_info['path']}...")
    stns_order = STNS_DN if f_info['dir'] == 'DN' else STNS_UP
    
    with pdfplumber.open(f_info['path']) as pdf:
        for p_idx, page in enumerate(pdf.pages):
            words = page.extract_words()
            lines = {}
            for w in words:
                y = round(w['top'], 1)
                found = None
                for ey in lines:
                    if abs(ey - y) < 3:
                        found = ey
                        break
                if found is None:
                    lines[y] = []
                    found = y
                lines[found].append(w)
                
            sorted_y = sorted(lines)
            
            # Find TRAINS row
            trains_row_idx = -1
            train_cols = []
            for idx, y in enumerate(sorted_y):
                lw = sorted(lines[y], key=lambda x: x['x0'])
                txt = " ".join(w['text'] for w in lw).upper()
                if 'DN TRAINS' in txt or 'UP TRAINS' in txt:
                    trains_row_idx = idx
                    for w in lw:
                        if any(c.isdigit() for c in w['text']):
                            mid = (w['x0'] + w['x1']) / 2
                            train_cols.append({"no": w['text'], "mid": mid, "code": ""})
                    break
                    
            if not train_cols:
                continue
                
            # Find Destination/Origin codes row above
            if trains_row_idx > 0:
                code_lw = sorted(lines[sorted_y[trains_row_idx - 1]], key=lambda x: x['x0'])
                codes = [w['text'] for w in code_lw if 'STATIONS' not in w['text'].upper()]
                if len(codes) == len(train_cols):
                    for idx, tc in enumerate(train_cols):
                        tc['code'] = codes[idx]
                else:
                    for tc in train_cols:
                        # find closest code word by X midpoint
                        valid_cw = [w for w in code_lw if 'STATIONS' not in w['text'].upper()]
                        if valid_cw:
                            best_cw = min(valid_cw, key=lambda w: abs((w['x0']+w['x1'])/2 - tc['mid']))
                            tc['code'] = best_cw['text']
                            
            # Capture times per station row
            page_stops = {tc['no']: [] for tc in train_cols}
            
            for idx in range(trains_row_idx + 1, len(sorted_y)):
                y = sorted_y[idx]
                lw = sorted(lines[y], key=lambda x: x['x0'])
                
                # Check station
                left_txt = " ".join(w['text'] for w in lw if w['x0'] < 140)
                stn_canonical = get_canonical_wr_station(left_txt)
                if not stn_canonical:
                    # sometimes narrow station labels extend or fall on left margin
                    stn_canonical = get_canonical_wr_station(lw[0]['text']) if lw else None
                    
                if not stn_canonical:
                    continue
                    
                # Assign words to train columns
                captured = {tc['no']: [] for tc in train_cols}
                for w in lw:
                    if w['x0'] < 120 and not any(c.isdigit() for c in w['text']):
                        continue # skip station label text
                    if not is_time_word(w['text']):
                        continue
                    w_mid = (w['x0'] + w['x1']) / 2
                    best_tc = min(train_cols, key=lambda tc: abs(tc['mid'] - w_mid))
                    if abs(best_tc['mid'] - w_mid) < 22:
                        captured[best_tc['no']].append(w['text'])
                        
                for t_no, w_list in captured.items():
                    if w_list:
                        combined = "".join(w_list).replace(' ', '')
                        # check if valid time string
                        if ':' in combined and len(combined) >= 4:
                            # pad single digit hour if any
                            if len(combined) == 4 and combined[1] == ':':
                                combined = '0' + combined
                            page_stops[t_no].append({
                                "station": stn_canonical,
                                "time": combined[:5] # keep pure HH:MM
                            })
                            
            # Build train objects
            for tc in train_cols:
                stops = page_stops[tc['no']]
                if len(stops) < 2:
                    continue
                    
                # Sort stops strictly by line sequence ordering
                stops.sort(key=lambda s: stns_order.index(s['station']))
                
                start_idx = stns_order.index(stops[0]['station'])
                end_idx = stns_order.index(stops[-1]['station'])
                
                # Check if skips stops
                actual_stns = {s['station'] for s in stops}
                expected_stns = set(stns_order[start_idx : end_idx + 1])
                skipped = expected_stns - actual_stns
                t_type = "Fast" if skipped else "Slow"
                
                dest_stn = stops[-1]['station']
                is_ac = f_info['ac'] or 'AC' in tc['code'].upper()
                
                all_trains.append({
                    "trainNo": tc['no'],
                    "code": tc['code'],
                    "line": "Western",
                    "direction": f_info['dir'],
                    "destination": dest_stn,
                    "type": t_type,
                    "isAC": is_ac,
                    "stops": stops
                })

# Deduplicate keeping higher fidelity/AC versions if duplicates exist
trains_map = {}
for t in all_trains:
    no = t['trainNo']
    if no not in trains_map:
        trains_map[no] = t
    else:
        # If existing is not AC but new is AC, override
        if t['isAC'] and not trains_map[no]['isAC']:
            trains_map[no] = t
        elif len(t['stops']) > len(trains_map[no]['stops']):
            trains_map[no] = t

unique_trains = list(trains_map.values())

# Sort by departure time
def dep_mins(t):
    p = t['stops'][0]['time'].split(':')
    return int(p[0])*60 + int(p[1])

unique_trains.sort(key=dep_mins)

print(f"\nTotal unique Western Railway trains extracted: {len(unique_trains)}")
dn_c = sum(1 for t in unique_trains if t['direction']=='DN')
up_c = sum(1 for t in unique_trains if t['direction']=='UP')
ac_c = sum(1 for t in unique_trains if t['isAC'])
fast_c = sum(1 for t in unique_trains if t['type']=='Fast')

print(f"DOWN trains: {dn_c}, UP trains: {up_c}")
print(f"AC trains: {ac_c}, Fast trains: {fast_c}")

with open(output_path, 'w', encoding='utf-8') as f:
    json.dump({"trains": unique_trains}, f, indent=2, ensure_ascii=False)
