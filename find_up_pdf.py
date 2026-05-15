import requests
import re
import urllib3
urllib3.disable_warnings()

r = requests.get('https://cr.indianrailways.gov.in/view_section.jsp?lang=0&id=0,4,332,333', verify=False)
links = re.findall(r'href=[\"\']([^\"\']+\.pdf)[\"\']', r.text, re.I)
for link in set(links):
    print("Found:", link)
