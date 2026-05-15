import requests

url = "https://cr.indianrailways.gov.in/cris//uploads/files/1707135434187-TRANS%20HB%20PTT%20WEF%2013%20JAN%202024.pdf"
print("Downloading...")
r = requests.get(url, verify=False)
with open("th_timetable.pdf", "wb") as f:
    f.write(r.content)
print("Done. File size:", len(r.content))
