import requests
import re
import urllib3
urllib3.disable_warnings()

print("Fetching Western Railway Timetable page...")
headers = {'User-Agent': 'Mozilla/5.0'}
try:
    r = requests.get('https://wr.indianrailways.gov.in/view_section.jsp?lang=0&id=0,4,501', headers=headers, verify=False, timeout=10)
    links = re.findall(r'href=[\"\']([^\"\']+\.pdf)[\"\']', r.text, re.IGNORECASE)
    print(f"Found {len(links)} PDF links")
    for link in set(links):
        if 'time' in link.lower() or 'train' in link.lower() or 'suburban' in link.lower():
            print(f"Potential Timetable: {link}")
except Exception as e:
    print(f"Error: {e}")
