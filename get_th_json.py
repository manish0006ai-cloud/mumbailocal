import requests

r = requests.get('https://api.github.com/repos/guru809/MumbaiLocalTrainsJSON/contents/Thane-Panvel')
for f in r.json():
    print(f['name'], f['type'], f.get('download_url', ''))

# Download the first JSON file
json_url = next(f['download_url'] for f in r.json() if f['name'].endswith('.json'))
content = requests.get(json_url).json()

print(f"\nFirst 2 trains from {json_url}:")
for t in content[:2]:
    print(t)
