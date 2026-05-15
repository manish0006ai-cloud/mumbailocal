import pdfplumber
import json
import re

pdf_path = "th_timetable.pdf"
output = []

def parse_pdf():
    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages):
            words = page.extract_words(x_tolerance=2, y_tolerance=2)
            
            # Group words by approx Y coordinate
            lines = {}
            for w in words:
                y = round(w['top'], 1) # Round to 1 decimal to group same line
                # Find if there is an existing line within 2 points
                found_y = None
                for ey in lines.keys():
                    if abs(ey - y) < 3:
                        found_y = ey
                        break
                if found_y is None:
                    lines[y] = []
                    found_y = y
                lines[found_y].append(w)
            
            # Sort lines by Y
            sorted_y = sorted(lines.keys())
            
            print(f"--- Page {page_num+1} ---")
            for y in sorted_y:
                # Sort words in line by X
                line_words = sorted(lines[y], key=lambda w: w['x0'])
                text = " ".join([w['text'] for w in line_words])
                if "99" in text or "THANE" in text or "GHANSOLI" in text:
                    print(f"Y={y}: {text}")

parse_pdf()
