import pdfplumber

with pdfplumber.open("central_dn.pdf") as pdf:
    table = pdf.pages[0].extract_tables()[0]
    print("Row headers (Stations):")
    for row in table:
        if row[0]:
            print(repr(row[0].strip()))
