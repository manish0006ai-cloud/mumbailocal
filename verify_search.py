import json

with open('src/data/accurate_timetable.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Check DN TH trains
th_dn = [t for t in data['trains'] if t.get('line') == 'Trans Harbour' and t.get('direction') == 'DN']
print(f"TH DN trains: {len(th_dn)}")

for t in th_dn[:3]:
    print(f"\nTrain {t['trainNo']}:")
    for s in t['stops']:
        print(f"  {s['station']:25s} {s['time']}")

# Also check CSMT to Kharghar search simulation
print("\n\n=== Simulating CSMT -> Panvel search ===")
csmt_names = ['mumbai csmt', 'csmt']
panvel_names = ['panvel']
count = 0
for t in data['trains']:
    stops = t['stops']
    s_idx = None
    d_idx = None
    for i, s in enumerate(stops):
        sn = s['station'].lower()
        if any(n in sn for n in csmt_names):
            s_idx = i
        if any(n in sn for n in panvel_names):
            d_idx = i
    if s_idx is not None and d_idx is not None and s_idx < d_idx:
        count += 1
if count == 0:
    print("  NO trains found for CSMT -> Panvel!")
else:
    print(f"  Found {count} trains for CSMT -> Panvel")

# Check Thane -> Panvel
print("\n=== Simulating Thane -> Panvel search ===")
thane_names = ['thane']
count = 0
for t in data['trains']:
    stops = t['stops']
    s_idx = None
    d_idx = None
    for i, s in enumerate(stops):
        sn = s['station'].lower()
        if any(n in sn for n in thane_names):
            s_idx = i
        if any(n in sn for n in panvel_names):
            d_idx = i
    if s_idx is not None and d_idx is not None and s_idx < d_idx:
        count += 1
        if count <= 3:
            dep = stops[s_idx]['time']
            arr = stops[d_idx]['time']
            print(f"  Train {t['trainNo']}: Thane {dep} -> Panvel {arr}")
print(f"  Total: {count} trains")

# Check Belapur -> Kharghar
print("\n=== Simulating Belapur -> Kharghar search ===")
count = 0
for t in data['trains']:
    stops = t['stops']
    s_idx = None
    d_idx = None
    for i, s in enumerate(stops):
        sn = s['station'].lower()
        if 'belapur' in sn:
            s_idx = i
        if 'kharghar' in sn:
            d_idx = i
    if s_idx is not None and d_idx is not None and s_idx < d_idx:
        count += 1
print(f"  Total: {count} trains for Belapur -> Kharghar")
