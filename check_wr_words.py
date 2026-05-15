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
        if any(st in line_str.upper() for st in ('CHURCHGATE', 'MARINE LINES', 'VIRAR', 'BORIVALI', 'DN TRAINS')):
            print(f"Y={y:5.1f}: {line_str}")
