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
        
    for y in sorted(lines):
        lw = sorted(lines[y], key=lambda x: x['x0'])
        line_str = " ".join(w['text'] for w in lw)
        if 'DN TRAINS' in line_str:
            print("--- TRAINS ---")
            for w in lw:
                print(f"{w['text']:8} X: {w['x0']:5.1f} - {w['x1']:5.1f}")
        elif 'CHURCHGATE' in line_str or 'VIRAR' in line_str:
            print(f"\n--- {lw[0]['text']} ---")
            for w in lw[1:]:
                print(f"{w['text']:8} X: {w['x0']:5.1f} - {w['x1']:5.1f}")
