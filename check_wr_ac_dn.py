import pdfplumber

with pdfplumber.open("wr_ac_dn.pdf") as pdf:
    print(f"wr_ac_dn.pdf total pages: {len(pdf.pages)}")
    text = pdf.pages[0].extract_text()
    print("--- wr_ac_dn.pdf Page 0 Preview ---")
    print(text[:2000])
