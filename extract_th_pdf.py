import pdfplumber
import json

pdf_path = "th_timetable.pdf"
output_file = "th_pdf_output.txt"

with pdfplumber.open(pdf_path) as pdf:
    with open(output_file, 'w', encoding='utf-8') as out:
        for i, page in enumerate(pdf.pages):
            out.write(f"--- PAGE {i+1} ---\n")
            # Extract plain text
            text = page.extract_text()
            if text:
                out.write(text)
            out.write("\n\n")

print(f"Extracted to {output_file}")
