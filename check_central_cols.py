import pdfplumber

with pdfplumber.open("central_dn.pdf") as pdf:
    table = pdf.pages[0].extract_tables()[0]
    print("Col 5 (T 1 - Slow):")
    for r in range(2, 21):
        print(f"{table[r][0]:15}: {repr(table[r][5])}")
    print("\nCol 6 (SKP 1 - Fast):")
    for r in range(2, 21):
        print(f"{table[r][0]:15}: {repr(table[r][6])}")
