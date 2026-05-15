import pdfplumber

with pdfplumber.open("wr_dn.pdf") as pdf:
    words = pdf.pages[0].extract_words()
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
        
    trains = []
    for y in sorted(lines):
        lw = sorted(lines[y], key=lambda x: x['x0'])
        txt = " ".join(w['text'] for w in lw)
        if 'DN TRAINS' in txt:
            for w in lw:
                if w['text'].isdigit() or any(c.isdigit() for c in w['text']):
                    mid = (w['x0'] + w['x1']) / 2
                    trains.append({"no": w['text'], "mid": mid})
            break
            
    print(f"Extracted {len(trains)} trains columns.")
    
    for y in sorted(lines):
        lw = sorted(lines[y], key=lambda x: x['x0'])
        txt = " ".join(w['text'] for w in lw)
        if 'RAM MANDIR' in txt.upper():
            print(f"\n--- RAM MANDIR row (Y={y}) ---")
            # Capture per train
            captured = {t['no']: [] for t in trains}
            for w in lw:
                if w['x0'] < 140:  # skip station label words
                    continue
                w_mid = (w['x0'] + w['x1']) / 2
                # find closest train
                closest_t = min(trains, key=lambda t: abs(t['mid'] - w_mid))
                if abs(closest_t['mid'] - w_mid) < 22:
                    captured[closest_t['no']].append(w['text'])
                    
            for t_no, w_list in captured.items():
                combined = "".join(w_list)
                print(f"Train {t_no:6}: repr({combined}) from words: {w_list}")
