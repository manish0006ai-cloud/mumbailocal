import requests
import urllib3
urllib3.disable_warnings()

pdfs = {
    "wr_dn.pdf": "https://wr.indianrailways.gov.in/cris//uploads/files/1777701123504-DN%20PTT%20W.E.F.%20%2001.05.2026.pdf",
    "wr_up.pdf": "https://wr.indianrailways.gov.in/cris//uploads/files/1777701192855-UP%20PTT%20W.E.F%2001.05.2026.pdf",
    "wr_ac_dn.pdf": "https://wr.indianrailways.gov.in/cris//uploads/files/1777701279370-DN%20AC%20%20PTT%20%20%2001.05.2026.pdf",
    "wr_ac_up.pdf": "https://wr.indianrailways.gov.in/cris//uploads/files/1777701330288-UP%20AC%20PTT%20%2001.05.2026.pdf"
}

for name, url in pdfs.items():
    print(f"Downloading {name}...")
    r = requests.get(url, verify=False)
    with open(name, "wb") as f:
        f.write(r.content)
    print(f"Saved {name} ({len(r.content)} bytes)")
