"""
Parse the official CR Harbour/Trans-Harbour DN timetable PDF into JSON.
This replaces the Harbour line data in accurate_timetable.json with
verified data from the official Railway PDF (WEF 01.05.2026).
"""
import pdfplumber
import json
import re

pdf_path = "timetable.pdf"
output_path = "src/data/harbour_dn_timetable.json"

# Station names in the PDF → our canonical names
# The PDF has these stations in order (rows 3-37)
STATION_ORDER = [
    "Mumbai CSMT",
    "Masjid",
    "Sandhurst Road",
    "Dockyard Road",
    "Reay Road",
    "Cotton Green",
    "Sewri",
    "Vadala Road",
    "King's Circle",
    "Mahim Jn",
    "Bandra",
    "Khar Road",
    "Santacruz",
    "Vileparle",
    "Andheri",
    "Jogeshwari",
    "Ramnagar",
    "Goregaon",
    "GTB Nagar",
    "Chunabhatti",
    "Kurla",
    "Tilaknagar",
    "Chembur",
    "Govandi",
    "Mankhurd",
    "Vashi",
    "Sanpada",
    "Juinagar",
    "Nerul",
    "Seawoods Darave",
    "Belapur CBD",
    "Kharghar",
    "Mansarovar",
    "Khandeshwar",
    "Panvel"
]

def parse_train_header(header_cell):
    """Parse train number and type from header cell like '98301\\nBR 1' or '99003\\nTPL 3'"""
    parts = header_cell.strip().split('\n')
    train_no = parts[0].strip()
    
    train_code = parts[1].strip() if len(parts) > 1 else ''
    
    # Determine line type based on code prefix
    # PL/PLVD = Panvel Local, BR/BRVD = Belapur Local, 
    # GN/GNPL/PLGN = Goregaon, B = Bandra, V/VVD = Vashi, 
    # TPL = Trans-harbour (Thane-Panvel), CM = Chembur, WGN/WBO = special
    line = "Harbour"
    destination = "Panvel"
    train_type = "Slow"
    
    code_upper = train_code.upper()
    
    if code_upper.startswith('TPL'):
        line = "Trans Harbour"
        destination = "Panvel"
    elif code_upper.startswith('BR') or code_upper.startswith('BRVD'):
        destination = "Belapur CBD"
    elif code_upper.startswith('GN') or code_upper.startswith('GNPL') or code_upper.startswith('PLGN'):
        destination = "Goregaon"
    elif code_upper.startswith('B ') or code_upper.startswith('B\t'):
        destination = "Bandra"
    elif code_upper.startswith('V ') or code_upper.startswith('VVD') or code_upper.startswith('V\t'):
        destination = "Vashi"
    elif code_upper.startswith('PL') or code_upper.startswith('PLVD'):
        destination = "Panvel"
    elif code_upper.startswith('CM'):
        destination = "Chembur"
    elif code_upper.startswith('WGN'):
        destination = "Goregaon"
        line = "Harbour"
    elif code_upper.startswith('WBO'):
        destination = "Bandra"
        line = "Harbour"
    
    # Check for AC flag
    is_ac = 'AC' in parts[2].upper() if len(parts) > 2 else ('AC' in parts[1].upper() if len(parts) > 1 else False)
    
    return {
        'trainNo': train_no,
        'code': train_code,
        'line': line,
        'destination': destination,
        'type': train_type,
        'direction': 'DN',
        'isAC': is_ac
    }

def extract_trains_from_page(page):
    """Extract all train columns from a single page table."""
    tables = page.extract_tables()
    if not tables:
        return []
    
    table = tables[0]  # Each page has exactly 1 table
    
    # Row 0 = title, Row 1 = headers, Row 2 = zeros, Rows 3-37 = station times, Row 38 = empty
    header_row = table[1]
    
    trains = []
    
    # Each column after the first (station names) is a train
    for col_idx in range(1, len(header_row)):
        header_cell = header_row[col_idx]
        if not header_cell or not header_cell.strip():
            continue
        
        train_info = parse_train_header(header_cell)
        
        # Check if this is a Trans-Harbour train starting from Thane (marked 'TNA' in CSMT row)
        csmt_time = table[3][col_idx] if col_idx < len(table[3]) else ''
        is_thane_origin = csmt_time and csmt_time.strip() == 'TNA'
        
        if is_thane_origin:
            train_info['line'] = 'Trans Harbour'
        
        # Extract stops
        stops = []
        for row_idx in range(3, 38):  # rows 3-37 are station data
            if row_idx >= len(table):
                break
            
            row = table[row_idx]
            if col_idx >= len(row):
                continue
            
            station_name = row[0].strip() if row[0] else ''
            time_val = row[col_idx].strip() if row[col_idx] else ''
            
            if not station_name or not time_val:
                continue
            
            # Skip special markers
            if time_val in ('TNA', 'BVI', '0'):
                continue
            
            # Validate time format (HH:MM)
            if not re.match(r'^\d{1,2}:\d{2}$', time_val):
                continue
            
            # Normalize station name
            clean_name = station_name
            if clean_name == "Seawoods Darave Karave":
                clean_name = "Seawoods Darave"
            elif clean_name == "King's Circle":
                clean_name = "Kings Circle"
            
            stops.append({
                'station': clean_name,
                'time': time_val
            })
        
        if len(stops) >= 2:  # Need at least 2 stops for a valid train
            train_info['stops'] = stops
            trains.append(train_info)
    
    return trains

# Parse all pages
all_trains = []

with pdfplumber.open(pdf_path) as pdf:
    for page in pdf.pages:
        page_trains = extract_trains_from_page(page)
        all_trains.extend(page_trains)

# Remove duplicates by train number
seen = set()
unique_trains = []
for t in all_trains:
    if t['trainNo'] not in seen:
        seen.add(t['trainNo'])
        unique_trains.append(t)

# Sort by first departure time
def first_dep_mins(train):
    t = train['stops'][0]['time']
    h, m = t.split(':')
    return int(h) * 60 + int(m)

unique_trains.sort(key=first_dep_mins)

# Build output
output = {
    "metadata": {
        "source": "Central Railway Official PDF - DN HB REVISED PTT WEF 01.05.2026",
        "url": "https://cr.indianrailways.gov.in/cris//uploads/files/1777550323377-DN%20HB%20REVISED%20PTT%20WEF%2001.05.2026.pdf",
        "direction": "DN (Down - CSMT to Panvel/Goregaon/Bandra)",
        "totalTrains": len(unique_trains),
        "generatedAt": "2026-05-14"
    },
    "trains": unique_trains
}

# Write JSON
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

print(f"[OK] Parsed {len(unique_trains)} trains from {len(all_trains)} total entries")
print(f"   Written to: {output_path}")

# Print summary
lines = {}
for t in unique_trains:
    key = f"{t['line']} -> {t['destination']}"
    lines[key] = lines.get(key, 0) + 1
    
print("\nBreakdown:")
for k, v in sorted(lines.items()):
    print(f"  {k}: {v} trains")

# Verify Kharghar times around 10:00-11:00
print("\n[CHECK] Kharghar arrival times (10:00-11:30):")
for t in unique_trains:
    for s in t['stops']:
        if s['station'] in ('Kharghar',) and s['time'] >= '10:00' and s['time'] <= '11:30':
            origin_time = t['stops'][0]['time']
            print(f"  Train {t['trainNo']}: CSMT dep {origin_time} -> Kharghar arr {s['time']} ({t['line']}, {t['destination']})")
