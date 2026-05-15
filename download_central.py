import requests
import urllib3
urllib3.disable_warnings()

url = "https://cr.indianrailways.gov.in/cris//uploads/files/1728294831372-SUB%20PTT%20DN%20ML'24.pdf"
print("Downloading Central Line Down PDF...")
r = requests.get(url, verify=False)
with open("central_dn.pdf", "wb") as f:
    f.write(r.content)
print(f"Done. Saved central_dn.pdf, size: {len(r.content)} bytes")
