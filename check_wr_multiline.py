import pdfplumber

with pdfplumber.open("wr_dn.pdf") as pdf:
    t = pdf.pages[0].extract_tables()[0]
    print("Row 1 Col 1 (Header):", repr(t[1][1]))
    print("Row 2 Col 0 (Stations):\n", t[2][0])
    print("\nRow 2 Col 1 (Times):\n", t[2][1])
