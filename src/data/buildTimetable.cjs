/**
 * buildTimetable.cjs - Parses Mumbai local train CSV timetables into JSON
 * Usage: node buildTimetable.cjs
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'Mumbai-Local-TimeTable-Extractor', 'data');
const OUTPUT = path.join(__dirname, 'accurate_timetable.json');

// Time validation
const isTime = s => s && /^\d{1,2}:\d{2}$/.test(s.trim());
const normTime = s => {
  const m = s.trim().match(/^(\d{1,2}):(\d{2})$/);
  return m ? `${String(m[1]).padStart(2,'0')}:${m[2]}` : null;
};

// Trans Harbour Station Map
const TRANS_STATION_MAP = {
  'TNA': 'Thane', 'Thane': 'Thane',
  'DIGH': 'Digha Gaon', 'AIRL': 'Airoli', 'RABE': 'Rabale',
  'GNSL': 'Ghansoli', 'KPHN': 'Kopar Khairane', 'TUH': 'Turbhe',
  'SNPD': 'Sanpada', 'VSH': 'Vashi', 'JNJ': 'Juinagar',
  'NEU': 'Nerul', 'SWDV': 'Seawoods Darave', 'BEPR': 'Belapur CBD',
  'KHAG': 'Kharghar', 'MANR': 'Mansarovar', 'KNDS': 'Khandeshwar',
  'PNVL': 'Panvel'
};

// ── Western Line Parser ──
function parseWestern(file) {
  const rows = fs.readFileSync(file,'utf-8').split(/\r?\n/).map(r => r.split(','));
  const trains = [];
  let headers = [], stationRows = [], direction = null;

  function flush() {
    if (!headers.length || !stationRows.length) return;
    const seen = new Set();
    for (const h of headers) {
      if (seen.has(h.no)) continue;
      seen.add(h.no);
      const stops = [];
      for (const row of stationRows) {
        const name = (row[0]||'').trim();
        if (!name) continue;
        const val = (row[h.col]||'').trim();
        if (isTime(val)) stops.push({ station: name, time: normTime(val) });
      }
      if (stops.length >= 2) {
        trains.push({ trainNo: h.no, line: 'Western', direction, destination: h.dest, type: 'Slow', stops });
      }
    }
  }

  for (const row of rows) {
    const fc = (row[0]||'').trim();
    if (fc.startsWith('STATIONS UP') || fc.startsWith('STATIONS DN') || fc.startsWith('UP TRAINS STATIONS') || fc.startsWith('DN TRAINS STATIONS')) {
      flush();
      direction = fc.includes('UP') ? 'UP' : 'DN';
      headers = [];
      stationRows = [];
      for (let c = 1; c < row.length; c++) {
        const cell = (row[c]||'').trim();
        const m = cell.match(/^([A-Za-z#*. ]+?)\s+(\d{4,6}[A-Za-z]?)\s+\d+\s+CAR$/);
        if (m && !cell.includes('.')) {
          headers.push({ col: c, dest: m[1].replace(/[#*]/g,'').trim(), no: m[2] });
        }
      }
      continue;
    }
    if (fc && !fc.startsWith('#') && !fc.startsWith('AC ON') && !fc.startsWith('*') && !fc.startsWith('Unnamed') && headers.length) {
      stationRows.push(row);
    }
  }
  flush();
  return trains;
}

// ── Central/Harbour Line Parser (Format 17, 18, 19, 20) ──
function parseCentralOrHarbour(file) {
  const content = fs.readFileSync(file,'utf-8');
  const defaultLine = content.includes('HARBOUR') ? 'Harbour' : 'Central';
  const rows = content.split(/\r?\n/).map(r => r.split(','));
  const trains = [];
  let i = 0;

  while (i < rows.length) {
    const fc = (rows[i][0]||'').trim();

    if (fc === 'Train No' || fc === 'Train No.') {
      const trainNos = rows[i].slice(1).map(c => (c||'').trim());
      i += 1;
      // might have a code row or skip to station
      const stRows = [];
      while (i < rows.length) {
        const f = (rows[i][0]||'').trim();
        if (f === 'Train No' || f === 'Stations' || f === 'Stations.' || f === 'Train No.') break;
        if (f && !f.match(/^\d{5}$/)) stRows.push(rows[i]);
        i++;
      }
      for (let c = 0; c < trainNos.length; c++) {
        const no = trainNos[c];
        if (!/^\d{5}/.test(no)) continue;
        const cleanNo = no.match(/^\d{5}/)[0];
        const stops = [];
        for (const sr of stRows) {
          const name = (sr[0]||'').trim();
          const val = (sr[c+1]||'').trim();
          if (name && isTime(val)) stops.push({ station: name, time: normTime(val) });
        }
        if (stops.length >= 2) {
          const first = stops[0].station.toUpperCase();
          const last = stops[stops.length-1].station.toUpperCase();
          const dir = (first.includes('CSMT')) ? 'DN' : 'UP';
          trains.push({ trainNo: cleanNo, line: defaultLine, direction: dir, destination: stops[stops.length-1].station, type: 'Slow', stops });
        }
      }
      continue;
    }

    if (fc === 'Stations' || fc === 'Stations.') {
      const hdrs = [];
      for (let c = 1; c < rows[i].length; c++) {
        const cell = (rows[i][c]||'').trim();
        const m = cell.match(/^(\d{5})/);
        if (m) hdrs.push({ col: c, no: m[1] });
      }
      i++;
      const stRows = [];
      while (i < rows.length) {
        const f = (rows[i][0]||'').trim();
        if (f === 'Stations' || f === 'Train No' || f === 'Stations.' || f === 'Train No.') break;
        if (f) stRows.push(rows[i]);
        i++;
      }
      const seen = new Set();
      for (const h of hdrs) {
        if (seen.has(h.no)) continue;
        seen.add(h.no);
        const stops = [];
        for (const sr of stRows) {
          const name = (sr[0]||'').trim();
          const val = (sr[h.col]||'').trim();
          if (name && isTime(val)) stops.push({ station: name, time: normTime(val) });
        }
        if (stops.length >= 2) {
          const first = stops[0].station.toUpperCase();
          const last = stops[stops.length-1].station.toUpperCase();
          const dir = (first.includes('CSMT')) ? 'DN' : 'UP';
          trains.push({ trainNo: h.no, line: defaultLine, direction: dir, destination: stops[stops.length-1].station, type: 'Slow', stops });
        }
      }
      continue;
    }
    i++;
  }
  return trains;
}

// ── Trans Harbour Line Parser ──
function parseTransHarbour(file) {
  const rows = fs.readFileSync(file,'utf-8').split(/\r?\n/).map(r => r.split(','));
  const trains = [];
  let i = 0;

  while (i < rows.length) {
    const fc = (rows[i][0]||'').trim();
    if (fc.startsWith('Train No. Train Code') || fc.startsWith('TR.NO TR.CODE')) {
      const hdrs = [];
      for (let c = 1; c < rows[i].length; c++) {
        const cell = (rows[i][c]||'').trim();
        const m = cell.match(/^(\d{5})/);
        if (m) hdrs.push({ col: c, no: m[1] });
      }
      i++;
      const stRows = [];
      while (i < rows.length) {
        const f = (rows[i][0]||'').trim();
        if (f && (f.startsWith('Train No') || f.startsWith('TR.NO'))) break;
        if (f) stRows.push(rows[i]);
        i++;
      }
      for (const h of hdrs) {
        const stops = [];
        for (const sr of stRows) {
          const rawName = (sr[0]||'').trim();
          const name = TRANS_STATION_MAP[rawName] || rawName;
          const val = (sr[h.col]||'').trim();
          if (name && isTime(val)) stops.push({ station: name, time: normTime(val) });
        }
        if (stops.length >= 2) {
          const first = stops[0].station;
          const dir = (first === 'Thane' || first === 'Nerul' || first === 'Belapur') ? 'DN' : 'UP';
          const line = file.includes('Table - 15') || file.includes('Table - 16') ? 'Uran' : 'Trans Harbour';
          trains.push({ trainNo: h.no, line, direction: dir, destination: stops[stops.length-1].station, type: 'Slow', stops });
        }
      }
      continue;
    }
    i++;
  }
  return trains;
}

// ── Harbour Up Parser (Table 52) ──
function parseHarbourUp(file) {
  const rows = fs.readFileSync(file,'utf-8').split(/\r?\n/).map(r => r.split(','));
  const trains = [];
  let i = 0;

  while (i < rows.length) {
    const fc = (rows[i][0]||'').trim();
    if (fc === 'Train No.' || fc.startsWith('Train No')) {
      const hdrs = [];
      for (let c = 1; c < rows[i].length; c++) {
        const cell = (rows[i][c]||'').trim();
        const m = cell.match(/^(\d{5})/);
        if (m) hdrs.push({ col: c, no: m[1] });
      }
      i++;
      while (i < rows.length) {
        const f = (rows[i][0]||'').trim();
        if (f === 'Stations' || f === '' || f === 'X' || f === '*') { i++; continue; }
        break;
      }
      const stRows = [];
      while (i < rows.length) {
        const f = (rows[i][0]||'').trim();
        if (f === 'Train No.' || f.startsWith('Train No') || f.startsWith('UP HBR') || f.startsWith('DN HBR') || f === '') break;
        stRows.push(rows[i]);
        i++;
      }
      for (const h of hdrs) {
        const stops = [];
        for (const sr of stRows) {
          const name = (sr[0]||'').trim();
          const val = (sr[h.col]||'').trim();
          if (name && isTime(val)) stops.push({ station: name, time: normTime(val) });
        }
        if (stops.length >= 2) {
          const last = stops[stops.length-1].station;
          const dir = last.includes('CSMT') ? 'UP' : 'DN';
          trains.push({ trainNo: h.no, line: 'Harbour', direction: dir, destination: last, type: 'Slow', stops });
        }
      }
      continue;
    }
    i++;
  }
  return trains;
}

// ── Fast train detection ──
function markFastTrains(trains) {
  for (const t of trains) {
    const names = new Set(t.stops.map(s => s.station.toUpperCase()));
    if (t.line === 'Western') {
      if (names.has('DADAR') && names.has('BANDRA') && !names.has('MATUNGA ROAD')) t.type = 'Fast';
      else if (names.has('ANDHERI') && names.has('BORIVALI') && !names.has('JOGESHWARI')) t.type = 'Fast';
      else if (names.has("M'BAI CENTRAL (L") && names.has('DADAR') && !names.has('MAHALAKSHMI')) t.type = 'Fast';
    }
    if (t.line === 'Central') {
      if (names.has('DADAR') && names.has('KURLA') && !names.has('SION')) t.type = 'Fast';
      else if (names.has('GHATKOPAR') && names.has('THANE') && !names.has('VIKHROLI')) t.type = 'Fast';
    }
  }
}

// ── Main ──
function main() {
  console.log('🚂 Building Mumbai local train timetable...\n');
  const all = [];

  for (let t = 1; t <= 54; t++) {
    const f = path.join(DATA_DIR, `Table - ${t}.csv`);
    if (!fs.existsSync(f)) continue;

    const content = fs.readFileSync(f, 'utf-8');
    let tr = [];
    
    if (content.includes('STATIONS UP') || content.includes('STATIONS DN') || content.includes('UP TRAINS STATIONS')) {
      tr = parseWestern(f);
    } else if (content.includes('Train No. Train Code') || content.includes('TR.NO TR.CODE')) {
      tr = parseTransHarbour(f);
    } else if (content.includes('UP HBR TRAINS') || content.includes('DN HBR TRAINS')) {
      tr = parseHarbourUp(f);
    } else if (content.includes('Train No') || content.includes('Stations')) {
      tr = parseCentralOrHarbour(f);
    }

    if (tr.length) {
      all.push(...tr);
      console.log(`  Table ${t}: ${tr.length} trains [${tr[0].line}]`);
    }
  }

  // Deduplicate
  const unique = [];
  const seen = new Set();
  for (const t of all) {
    const key = t.trainNo + t.line;
    if (!seen.has(key)) { seen.add(key); unique.push(t); }
  }

  markFastTrains(unique);

  const lines = {};
  for (const t of unique) {
    lines[t.line] = (lines[t.line] || 0) + 1;
  }

  const result = {
    metadata: {
      generatedAt: new Date().toISOString(),
      totalTrains: unique.length,
      lines
    },
    trains: unique
  };

  fs.writeFileSync(OUTPUT, JSON.stringify(result, null, 2));
  console.log(`\n✅ ${unique.length} total unique trains → accurate_timetable.json`);
  for (const l in lines) {
    console.log(`   ${l}: ${lines[l]}`);
  }
}

main();
