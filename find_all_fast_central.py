import pdfplumber

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

fast_count = 0
slow_count = 0

with pdfplumber.open("central_dn.pdf") as pdf:
    for p_idx, page in enumerate(pdf.pages):
        tables = page.extract_tables()
        if not tables:
            continue
        table = tables[0]
        for c in range(1, len(table[1])):
            header = table[1][c].replace('\n', ' ') if table[1][c] else ""
            if not header.strip():
                continue
            
            stops_r = []
            for r in range(2, len(table)):
                val = table[r][c]
                if val and ':' in val:
                    stops_r.append(r)
            
            if not stops_r:
                continue
                
            start_r = stops_r[0]
            end_r = stops_r[-1]
            
            expected_path = get_train_path(start_r, end_r)
            actual_stops = set(stops_r)
            skipped_rows = [r for r in expected_path if r not in actual_stops]
            
            if skipped_rows:
                fast_count += 1
                if fast_count <= 10:
                    stn_start = table[start_r][0].strip()
                    stn_end = table[end_r][0].strip()
                    print(f"Page {p_idx:2} Col {c:2} [{header:15}]: Fast | {stn_start} -> {stn_end} | Skipped {len(skipped_rows)} stops")
            else:
                slow_count += 1

print(f"\nTotal Fast trains: {fast_count}")
print(f"Total Slow trains: {slow_count}")
