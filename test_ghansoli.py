import pdfplumber
import re

def un_double(text):
    if ":" in text and len(text) > 5:
        if len(text) == 10 and text[4:6] == "::":
            return text[::2]
        clean = ""
        for i in range(0, len(text), 2):
            if i < len(text):
                clean += text[i]
        if re.match(r'\d{2}:\d{2}', clean):
            return clean
    return text

with pdfplumber.open("th_timetable.pdf") as pdf:
    page = pdf.pages[3]
    words = page.extract_words(x_tolerance=2, y_tolerance=2)
    lines = {}
    for w in words:
        y = round(w['top'], 1)
        found_y = None
        for ey in lines.keys():
            if abs(ey - y) < 3:
                found_y = ey
                break
        if found_y is None:
            lines[y] = []
            found_y = y
        lines[found_y].append(w)
        
    sorted_y = sorted(lines.keys())
    
    for y in sorted_y:
        text = " ".join([w['text'] for w in sorted(lines[y], key=lambda w: w['x0'])])
        if "GGHH" in text:
            print("Found station text:", text)
            prev_y = sorted_y[sorted_y.index(y) - 1]
            prev_line = sorted(lines[prev_y], key=lambda w: w['x0'])
            print("Previous line text:", " ".join(w['text'] for w in prev_line))
            times = []
            for w in prev_line:
                t = un_double(w['text'])
                if re.match(r'\d{2}:\d{2}', t):
                    times.append(t)
            print("Extracted times:", times)
