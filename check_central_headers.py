import pdfplumber

with pdfplumber.open("central_dn.pdf") as pdf:
    table = pdf.pages[0].extract_tables()[0]
    for col_idx in range(1, min(10, len(table[1]))):
        print(f"Col {col_idx}: {repr(table[1][col_idx])}")
