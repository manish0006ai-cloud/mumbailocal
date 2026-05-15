import pdfplumber

with pdfplumber.open("central_dn.pdf") as pdf:
    table = pdf.pages[0].extract_tables()[0]
    for c, val in enumerate(table[2]):
        if val:
            h_str = table[1][c].replace('\n', ' ') if c > 0 else 'STN'
            print(f"Col {c} ({repr(h_str)}): repr({val})")
