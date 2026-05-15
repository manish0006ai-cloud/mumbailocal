import requests
import re

r = requests.get('https://m-indicator.mobond.com/desktop/index.html')
links = re.findall(r'href=[\"\']([^\"\']+)[\"\']', r.text)

for link in sorted(set(links)):
    print(link)
