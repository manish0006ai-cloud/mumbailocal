import pdfplumber

with pdfplumber.open("central_dn.pdf") as pdf:
    print(f"Total pages: {len(pdf.pages)}")
    text = pdf.pages[0].extract_text()
    print("--- Page 1 Preview ---")
    print(text[:2000])
