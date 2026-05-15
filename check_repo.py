import requests

r = requests.get('https://api.github.com/repos/guru809/MumbaiLocalTrainsJSON/contents')
for f in r.json():
    print(f['name'], f['type'])
