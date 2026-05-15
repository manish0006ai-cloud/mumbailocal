import pdfplumber

with pdfplumber.open("wr_up.pdf") as pdf:
    print(f"wr_up.pdf total pages: {len(pdf.pages)}")
    text = pdf.pages[0].extract_text()
    print("--- wr_up.pdf Page 0 Preview ---")
    print(text[:2000])
