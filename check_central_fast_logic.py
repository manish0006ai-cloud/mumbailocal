import pdfplumber

def get_train_path(start_r, end_r):
    if end_r <= 27:
        return list(range(start_r, end_r + 1))
    elif 28 <= end_r <= 41:
        # Khopoli branch
        path = []
        if start_r <= 27:
            path.extend(range(start_r, 28))
            path.extend(range(max(28, start_r), end_r + 1))
        else:
            path.extend(range(start_r, end_r + 1))
        return path
    else:
        # Kasara branch (42 to 52)
        path = []
        if start_r <= 27:
            path.extend(range(start_r, 28))
            path.extend(range(max(42, start_r), end_r + 1))
        else:
            path.extend(range(start_r, end_r + 1))
        return path

with pdfplumber.open("central_dn.pdf") as pdf:
    for p_idx in range(min(4, len(pdf.pages))):
        table = pdf.pages[p_idx].extract_tables()[0]
        print(f"\n--- Page {p_idx} ---")
        for c in range(1, len(table[1])):
            header = table[1][c].replace('\n', ' ') if table[1][c] else ""
            if not header.strip():
                continue
            
            # Find start and end row
            stops_r = []
            for r in range(2, len(table)):
                val = table[r][c]
                if val and val.strip() and val.strip() not in ('', '|'):
                    stops_r.append(r)
            
            if not stops_r:
                continue
                
            start_r = stops_r[0]
            end_r = stops_r[-1]
            
            expected_path = get_train_path(start_r, end_r)
            actual_stops = set(stops_r)
            skipped_rows = [r for r in expected_path if r not in actual_stops]
            
            t_type = "Fast" if skipped_rows else "Slow"
            stn_start = table[start_r][0].strip()
            stn_end = table[end_r][0].strip()
            
            if t_type == "Fast":
                print(f"Col {c:2} [{header:15}]: {t_type} | {stn_start} -> {stn_end} | Skipped {len(skipped_rows)} stops")
