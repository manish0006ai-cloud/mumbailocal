import pdfplumber

with pdfplumber.open("central_dn.pdf") as pdf:
    table = pdf.pages[0].extract_tables()[0]
    for c in range(1, len(table[1])):
        header = table[1][c].replace('\n', ' ') if table[1][c] else ""
        if not header.strip():
            continue
        
        stops = []
        for r in range(2, len(table)):
            val = table[r][c]
            if val and val.strip() and val.strip() not in ('', '|'):
                stn = table[r][0].strip() if table[r][0] else ""
                stops.append((stn, val.strip()))
        
        if stops:
            print(f"Col {c:2} [{header:15}]: {len(stops):2} stops | Start: {stops[0][0]} ({stops[0][1]}) -> End: {stops[-1][0]} ({stops[-1][1]})")
