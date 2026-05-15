import pdfplumber

with pdfplumber.open("central_dn.pdf") as pdf:
    table = pdf.pages[0].extract_tables()[0]
    print(f"Header: {repr(table[1][6])}")
    for r in range(2, len(table)):
        stn = table[r][0].strip() if table[r][0] else ""
        val = table[r][6]
        if val:
            print(f"Row {r} ({stn}): repr({val})")
