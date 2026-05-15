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
        
    sorted_y = sorted(lines)
    for idx, y in enumerate(sorted_y):
        lw = sorted(lines[y], key=lambda x: x['x0'])
        txt = " ".join(w['text'] for w in lw)
        if 'DN TRAINS' in txt:
            prev_y = sorted_y[idx - 1]
            prev_lw = sorted(lines[prev_y], key=lambda x: x['x0'])
            print("Row above DN TRAINS:", " ".join(w['text'] for w in prev_lw))
            for w in prev_lw:
                print(f"Code: {w['text']:6} X: {w['x0']:5.1f} - {w['x1']:5.1f}")
            print("\nDN TRAINS row:")
            for w in lw:
                if w['text'].isdigit() or any(c.isdigit() for c in w['text']):
                    print(f"Train: {w['text']:5} X: {w['x0']:5.1f} - {w['x1']:5.1f}")
