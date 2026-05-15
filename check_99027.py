import pdfplumber

pdf_path = "th_timetable.pdf"

def print_table_data():
    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages):
            tables = page.extract_tables()
            for t in tables:
                for row in t:
                    if row and "99027" in row:
                        print("Found 99027 row:", row)
                        idx = row.index("99027")
                        print("Index is:", idx)
                        print(f"--- Train 99027 (Page {i+1}) ---")
                        for r in t:
                            if r and len(r) > idx and r[0] and r[idx]:
                                station = r[0].replace('\n', '')
                                time_str = r[idx].replace('\n', '')
                                print(f"{station}: {time_str}")
                        return

print_table_data()
