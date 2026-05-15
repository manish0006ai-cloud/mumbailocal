import pdfplumber
import json
import re

pdf_path = "th_timetable.pdf"

def un_double(text):
    if ":" in text and len(text) > 5:
        # Check if it's double printed like 1133::2244
        if len(text) == 10 and text[4:6] == "::":
            return text[::2]
        # sometimes it might be slightly offset
        clean = ""
        for i in range(0, len(text), 2):
            if i < len(text):
                clean += text[i]
        if re.match(r'\d{2}:\d{2}', clean):
            return clean
    return text

def parse_pdf():
    all_trains = {}
    
    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages):
            words = page.extract_words(x_tolerance=2, y_tolerance=2)
            
            # Group words by approx Y coordinate
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
            
            train_numbers = []
            train_x_coords = []
            
            stations_data = {} # y_coord -> {"station": name, "times": [(x, time), ...]}
            
            # First pass: find train numbers and station rows
            for y in sorted_y:
                line_words = sorted(lines[y], key=lambda w: w['x0'])
                text = " ".join([w['text'] for w in line_words])
                
                # Train numbers row
                if "Train No." in text:
                    for w in line_words:
                        if w['text'].isdigit() and len(w['text']) == 5:
                            train_numbers.append(w['text'])
                            train_x_coords.append(w['x0'])
                
                # Station names
                elif any(s in text for s in ["THANE", "DIGHA GAON", "AIRAVALI", "RABADA", "GHANSOLI", "GGHHAANNSSOOLLII", "KOPAR KHAIRNA", "TURBHE", "SANPADA", "VASHI", "JUINAGAR", "NERUL", "SEAWOODS DARAWE", "BELAPUR", "KHARGHAR", "MANSAROVAR", "KHANDESHWAR", "PANVEL"]):
                    station_name = text.replace("AIRAVALI", "Airoli").replace("RABADA", "Rabale").replace("GGHHAANNSSOOLLII", "Ghansoli").replace("KOPAR KHAIRNA", "Kopar Khairane").replace("SEAWOODS DARAWE", "Seawoods-Darave").replace("THANE", "Thane").replace("DIGHA GAON", "Digha Gaon").replace("TURBHE", "Turbhe").replace("SANPADA", "Sanpada").replace("VASHI", "Vashi").replace("JUINAGAR", "Juinagar").replace("NERUL", "Nerul").replace("BELAPUR", "CBD Belapur").replace("KHARGHAR", "Kharghar").replace("MANSAROVAR", "Mansarovar").replace("KHANDESHWAR", "Khandeshwar").replace("PANVEL", "Panvel").strip()
                    
                    # Clean up double printed stations
                    if station_name == "GGHHAANNSSOOLLII": station_name = "Ghansoli"
                    elif "AAIIRROOLLII" in station_name: station_name = "Airoli"
                    
                    # The station name row might just be the name, and the times are in the row ABOVE it.
                    # Or times are on the same row. Let's look at the previous row for times.
                    prev_y = sorted_y[sorted_y.index(y) - 1]
                    prev_line = sorted(lines[prev_y], key=lambda w: w['x0'])
                    
                    times = []
                    for w in prev_line:
                        # un-double the text
                        t = un_double(w['text'])
                        if re.match(r'\d{2}:\d{2}', t):
                            times.append((w['x0'], t))
                    
                    if len(times) == 0:
                        # Check same row
                        for w in line_words:
                            t = un_double(w['text'])
                            if re.match(r'\d{2}:\d{2}', t):
                                times.append((w['x0'], t))
                                
                    stations_data[y] = {"station": station_name, "times": times}
            
            # Now map times to train numbers by X coordinate
            for t_idx, t_num in enumerate(train_numbers):
                if t_num not in all_trains:
                    all_trains[t_num] = []
                
                t_x = train_x_coords[t_idx]
                
                for y, sdata in stations_data.items():
                    station = sdata["station"]
                    # Find the time closest to t_x
                    closest_time = None
                    min_dist = 20 # Max 20 points diff
                    for x, t_str in sdata["times"]:
                        if abs(x - t_x) < min_dist:
                            closest_time = t_str
                            min_dist = abs(x - t_x)
                    
                    if closest_time:
                        all_trains[t_num].append({"station": station, "time": closest_time})

    # Save to file
    with open('parsed_th_down.json', 'w') as f:
        json.dump(all_trains, f, indent=2)
    print(f"Parsed {len(all_trains)} DOWN trains.")

parse_pdf()
