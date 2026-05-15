import pdfplumber

stns = []
with pdfplumber.open("wr_dn.pdf") as pdf:
    for page in pdf.pages:
        words = page.extract_words()
        lines = {}
        for w in words:
            y = round(w['top'], 1)
            found = None
            for ey in lines:
                if abs(ey - y) < 3:
                    found = ey
                    break
            if found is None:
                lines[y] = []
                found = y
            lines[found].append(w)
            
        for y in sorted(lines):
            lw = sorted(lines[y], key=lambda x: x['x0'])
            if lw[0]['x0'] < 100:  # Station labels usually start on the left
                txt = " ".join(w['text'] for w in lw[:3])
                if any(k in txt.upper() for k in ('CHURCHGATE', 'MARINE', 'CHARNI', 'GRANT', 'CENTRAL', 'MAHALAKSHMI', 'LOWER', 'PRABHADEVI', 'DADAR', 'MATUNGA', 'MAHIM', 'BANDRA', 'KHAR', 'SANTA', 'VILE', 'ANDHERI', 'JOGESHWARI', 'RAM', 'GOREGAON', 'MALAD', 'KANDIVLI', 'BORIVALI', 'DAHISAR', 'MIRA', 'BHAYANDAR', 'NAIGAON', 'VASAI', 'NALLA', 'VIRAR', 'VAITARNA', 'SAPHALE', 'KELVE', 'PALGHAR', 'UMROLI', 'BOISAR', 'VANGAON', 'DAHANU')):
                    full_stn = " ".join(w['text'] for w in lw if w['x0'] < 140)
                    if full_stn not in stns:
                        stns.append(full_stn)

print("Unique station rows identified:")
for s in stns:
    print(repr(s))
