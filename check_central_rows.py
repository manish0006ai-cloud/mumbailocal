import pdfplumber

with pdfplumber.open("central_dn.pdf") as pdf:
    table = pdf.pages[0].extract_tables()[0]
    for idx, row in enumerate(table):
        stn = row[0].strip() if row[0] else ""
        print(f"{idx}: {repr(stn)}")
