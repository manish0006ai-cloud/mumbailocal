import pdfplumber

with pdfplumber.open("central_dn.pdf") as pdf:
    table = pdf.pages[0].extract_tables()[0]
    print(f"Total columns in table: {len(table[1])}")
    for i, h in enumerate(table[1]):
        print(f"{i}: {repr(h)}")
