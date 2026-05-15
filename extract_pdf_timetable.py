"""
Extract timetable data from the official CR Harbour/Trans-Harbour PDF.
This script reads the PDF, extracts all tables, and outputs raw text
so we can understand the structure before parsing.
"""
import pdfplumber
import json
import sys

pdf_path = "timetable.pdf"

with pdfplumber.open(pdf_path) as pdf:
    print(f"Total pages: {len(pdf.pages)}")
    
    for i, page in enumerate(pdf.pages):
        print(f"\n{'='*80}")
        print(f"PAGE {i+1}")
        print(f"{'='*80}")
        
        # Extract tables
        tables = page.extract_tables()
        if tables:
            for ti, table in enumerate(tables):
                print(f"\n--- Table {ti+1} ({len(table)} rows) ---")
                for ri, row in enumerate(table):
                    # Clean up None values
                    cleaned = [str(cell).strip() if cell else '' for cell in row]
                    print(f"  Row {ri}: {cleaned}")
        else:
            # Fall back to text extraction
            text = page.extract_text()
            if text:
                print("No tables found, raw text:")
                print(text[:2000])
            else:
                print("No content found on this page")
