import pdfplumber

with pdfplumber.open("wr_dn.pdf") as pdf:
    print(f"wr_dn.pdf total pages: {len(pdf.pages)}")
    text = pdf.pages[0].extract_text()
    print("--- wr_dn.pdf Page 0 Preview ---")
    print(text[:2000])
    
    tables = pdf.pages[0].extract_tables()
    if tables:
        t = tables[0]
        print("\nTable Rows count:", len(t))
        print("First row (Headers/Stns):", [r[0] for r in t[:30] if r[0]])
