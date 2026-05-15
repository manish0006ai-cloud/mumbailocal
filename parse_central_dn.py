import pdfplumber
import json
import re

pdf_path = "central_dn.pdf"
output_path = "src/data/central_dn_parsed.json"

def get_train_path(start_r, end_r):
    if end_r <= 27:
        return list(range(start_r, end_r + 1))
    elif 28 <= end_r <= 41:
        path = []
        if start_r <= 27:
            path.extend(range(start_r, 28))
            path.extend(range(max(28, start_r), end_r + 1))
        else:
            path.extend(range(start_r, end_r + 1))
        return path
    else:
        path = []
        if start_r <= 27:
            path.extend(range(start_r, 28))
            path.extend(range(max(42, start_r), end_r + 1))
        else:
            path.extend(range(start_r, end_r + 1))
        return path

def parse_header(header_text):
    parts = header_text.strip().split('\n')
    train_no = parts[0].strip()
    code_part = parts[1].strip() if len(parts) > 1 else ""
    
    # Destination parsing from code prefix
    # A = Ambernath, AN = Asangaon, BL = Badlapur, C = Kurla, CBL = Vidyavihar-Badlapur?, 
    # CK = Vidyavihar-Kalyan, CTL = Vidyavihar-Titwala, CT = Kurla-Thane, DA = Dadar-Ambernath,
    # DK = Dadar-Kalyan, DL = Dadar-Badlapur, K = Kalyan, KAN = Kalyan-Asangaon, 
    # KP = Khopoli, N = Kasara, S = Karjat, SKP = Karjat-Khopoli, T = Thane, 
    # TAN = Thane-Asangaon, TDL = Thane-Dombivli, TLA = Titwala, TL = Titwala, 
    # TK = Thane-Kalyan, TS = Thane-Karjat, TTL = Thane-Titwala
    dest = "Kalyan" # default
    code_upper = code_part.upper()
    
    if code_upper.startswith('A ') or code_upper.startswith('A\t') or code_upper.startswith('DA') or code_upper == 'A':
        dest = "Ambernath"
    elif code_upper.startswith('AN'):
        dest = "Asangaon"
    elif code_upper.startswith('BL') or code_upper.startswith('CBL') or code_upper.startswith('DL'):
        dest = "Badlapur"
    elif code_upper.startswith('C ') or code_upper.startswith('C\t') or code_upper == 'C':
        dest = "Kurla"
    elif code_upper.startswith('K ') or code_upper.startswith('K\t') or code_upper.startswith('CK') or code_upper.startswith('DK') or code_upper.startswith('TK') or code_upper == 'K':
        dest = "Kalyan"
    elif code_upper.startswith('KP') or code_upper.startswith('SKP'):
        dest = "Khopoli"
    elif code_upper.startswith('N ') or code_upper.startswith('N\t') or code_upper == 'N':
        dest = "Kasara"
    elif code_upper.startswith('S ') or code_upper.startswith('S\t') or code_upper.startswith('TS') or code_upper == 'S':
        dest = "Karjat"
    elif code_upper.startswith('T ') or code_upper.startswith('T\t') or code_upper.startswith('CT') or code_upper == 'T':
        dest = "Thane"
    elif code_upper.startswith('TAN'):
        dest = "Asangaon"
    elif code_upper.startswith('TDL'):
        dest = "Dombivli"
    elif code_upper.startswith('TL') or code_upper.startswith('CTL') or code_upper.startswith('TTL'):
        dest = "Titwala"
    elif code_upper.startswith('KAN'):
        dest = "Asangaon"
        
    is_ac = 'AC' in header_text.upper()
    return train_no, code_part, dest, is_ac

all_trains = []

with pdfplumber.open(pdf_path) as pdf:
    for page in pdf.pages:
        tables = page.extract_tables()
        if not tables:
            continue
        table = tables[0]
        
        # Row 0 = Title, Row 1 = Headers, Rows 2-52 = Station times
        for c in range(1, len(table[1])):
            header = table[1][c]
            if not header or not header.strip():
                continue
                
            train_no, code_str, dest, is_ac = parse_header(header)
            if not train_no or not train_no.isdigit():
                continue
                
            stops_r = []
            for r in range(2, len(table)):
                val = table[r][c]
                if val and ':' in val:
                    stops_r.append(r)
            
            if len(stops_r) < 2:
                continue
                
            start_r = stops_r[0]
            end_r = stops_r[-1]
            
            expected_path = get_train_path(start_r, end_r)
            actual_stops = set(stops_r)
            skipped = [r for r in expected_path if r not in actual_stops]
            t_type = "Fast" if skipped else "Slow"
            
            # Override destination with exact actual terminal station to be absolutely accurate
            actual_dest_stn = table[end_r][0].strip()
            # Canonicalize dest string
            if actual_dest_stn == 'CSMT': dest = 'CSMT'
            elif actual_dest_stn == 'Thane': dest = 'Thane'
            elif actual_dest_stn == 'Dombivli': dest = 'Dombivli'
            elif actual_dest_stn == 'Kalyan': dest = 'Kalyan'
            elif actual_dest_stn == 'Ambernath': dest = 'Ambernath'
            elif actual_dest_stn == 'Badlapur': dest = 'Badlapur'
            elif actual_dest_stn == 'Karjat': dest = 'Karjat'
            elif actual_dest_stn == 'Khopoli': dest = 'Khopoli'
            elif actual_dest_stn == 'Titwala': dest = 'Titwala'
            elif actual_dest_stn == 'Asangaon': dest = 'Asangaon'
            elif actual_dest_stn == 'Kasara': dest = 'Kasara'
            elif actual_dest_stn == 'Kurla': dest = 'Kurla'
            
            stops = []
            for r in stops_r:
                stn_name = table[r][0].strip()
                # Ensure canonical naming
                if stn_name == 'Kanjur Marg': stn_name = 'Kanjurmarg'
                elif stn_name == 'Ulhas Nagar': stn_name = 'Ulhasnagar'
                
                time_str = table[r][c].strip()
                # Fix single digit hours if any (e.g. "5:43" -> "05:43")
                if len(time_str) == 4 and time_str[1] == ':':
                    time_str = '0' + time_str
                    
                stops.append({
                    "station": stn_name,
                    "time": time_str
                })
                
            all_trains.append({
                "trainNo": train_no,
                "code": code_str.replace('\n', ' '),
                "line": "Central",
                "direction": "DN",
                "destination": dest,
                "type": t_type,
                "isAC": is_ac,
                "stops": stops
            })

# Deduplicate by trainNo, keeping first occurrence
seen = set()
unique_trains = []
for t in all_trains:
    if t['trainNo'] not in seen:
        seen.add(t['trainNo'])
        unique_trains.append(t)

# Sort by departure time
def dep_mins(t):
    parts = t['stops'][0]['time'].split(':')
    return int(parts[0])*60 + int(parts[1])

unique_trains.sort(key=dep_mins)

print(f"Successfully extracted {len(unique_trains)} Central Line DOWN trains.")
fasts = [t for t in unique_trains if t['type']=='Fast']
print(f"Fast trains: {len(fasts)}, Slow trains: {len(unique_trains)-len(fasts)}")

with open(output_path, 'w', encoding='utf-8') as f:
    json.dump({"trains": unique_trains}, f, indent=2, ensure_ascii=False)
