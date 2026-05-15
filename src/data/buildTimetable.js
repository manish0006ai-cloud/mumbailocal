/**
 * buildTimetable.js
 * 
 * Parses official Mumbai local train CSV timetable data 
 * from the Mumbai-Local-TimeTable-Extractor repository
 * and produces a clean JSON file for the app.
 * 
 * Usage: node buildTimetable.js
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'Mumbai-Local-TimeTable-Extractor', 'data');
const OUTPUT_FILE = path.join(__dirname, 'accurate_timetable.json');

// ─── Station name normalisation map ───
// CSV name → app station id
const WESTERN_STATION_MAP = {
  'CHURCHGATE': 'CCG',
  'Marine Lines': 'MRL',
  'Charni Road': 'CRD',
  'Charni Rd': 'CRD',
  'Grant Road': 'GRD',
  'Grant Rd': 'GRD',
  "M'BAI CENTRAL (L)": 'BCL',
  "M'BAI CENTRAL(L": 'BCL',
  'Mumbai Central': 'BCL',
  'Mahalakshmi': 'MX',
  'Lower Parel': 'LPR',
  'Prabhadevi': 'PBD',
  'DADAR': 'DDR',
  'Dadar': 'DDR',
  'Matunga Road': 'MTR',
  'Matunga Rd': 'MTR',
  'Mahim Jn.': 'MM',
  'Mahim': 'MM',
  'BANDRA': 'BDR',
  'Bandra': 'BDR',
  'Khar Road': 'KHR',
  'Khar Rd': 'KHR',
  'Santa Cruz': 'STC',
  'Vile Parle': 'VLP',
  'ANDHERI': 'ADH',
  'Andheri': 'ADH',
  'Jogeshwari': 'JGW',
  'Ram Mandir': 'RMD',
  'Goregaon': 'GRG',
  'Goregoan': 'GRG',
  'Malad': 'MLD',
  'Kandivli': 'KDV',
  'Kandivali': 'KDV',
  'BORIVALI': 'BVI',
  'Borivali': 'BVI',
  'Dahisar': 'DHS',
  'Mira Road': 'MRD',
  'Mira Rd': 'MRD',
  'Bhayandar': 'BYR',
  'Bhayander': 'BYR',
  'BHAYANDAR': 'BYR',
  'Naigaon': 'NGN',
  'Vasai Road': 'VSR',
  'Vasai Rd': 'VSR',
  'Nalla Sopara': 'NSP',
  'Nallasopara': 'NSP',
  'VIRAR': 'VR',
  'Virar': 'VR',
  'Dahanu Road': 'DRD',
};

const CENTRAL_STATION_MAP = {
  'CSMT': 'CSMT',
  'Masjid': 'MJD',
  'Sandhurst Road': 'SRD',
  'Byculla': 'BYC',
  'Chinchpokli': 'CHP',
  'Currey Road': 'CRR',
  'Parel': 'PRL',
  'Dadar': 'DR',
  'Matunga': 'MTG',
  'Sion': 'SIN',
  'Kurla': 'KRL',
  'Vidyavihar': 'VVH',
  'Ghatkopar': 'GKP',
  'Vikhroli': 'VKL',
  'Kanjur Marg': 'KMG',
  'Kanjurmarg': 'KMG',
  'Bhandup': 'BDP',
  'Nahur': 'NHR',
  'Mulund': 'MLD_CR',
  'Thane': 'TNA',
  'Kalva': 'KLV',
  'Mumbra': 'MBR',
  'Diva': 'DVA',
  'Kopar': 'KPR',
  'Dombivli': 'DBI',
  'Thakurli': 'TKL',
  'Kalyan': 'KYN',
  'Vithalwadi': 'VTW',
  'Ulhas Nagar': 'ULN',
  'Ambernath': 'AMB',
  'Badlapur': 'BPR',
  'Vangani': 'VGN',
  'Shelu': 'SHE',
  'Neral': 'NRL',
  'Bhivpuri Road': 'BVP',
  'Karjat': 'KJT',
  'Palasdhari': 'PLS',
  'Kelavli': 'KLV_CR',
  'Dolavli': 'DLV',
  'Lowjee': 'LWJ',
  'Khopoli': 'KPL',
  'Shahad': 'SHD',
  'Ambivli': 'ABV',
  'Titwala': 'TTW',
  'Khadavli': 'KDW',
  'Vasind': 'VSD',
  'Asangaon': 'ASG',
  'Atgaon': 'ATG',
  'Khardi': 'KHD',
  'Kasara': 'KSR',
};

const HARBOUR_STATION_MAP = {
  'GOREGAON': 'GRG_H',
  'RAM MANDIR': 'RMD_H',
  'JOGESWARI': 'JGW_H',
  'ANDHERI': 'ADH_H',
  'VILEPARLE': 'VLP_H',
  'SANTACURTZ': 'STC_H',
  'KHAR': 'KHR_H',
  'BANDRA': 'BDR_H',
  'MAHIM JN.': 'MM_H',
  "KING'S CIRCLE": 'KC',
  'VADALA ROAD': 'VDR',
  'SEWERI': 'SWR',
  'COTTON GREEN': 'CTG',
  'REAY ROAD': 'RRD',
  'DOCK YARD ROAD': 'DYR',
  'SANDHURST ROAD': 'SRD_H',
  'MASJID': 'MJD_H',
  'MUMBAI CSMT': 'CSMT_H',
};

// ─── Helpers ───

function parseCSV(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return raw.split(/\r?\n/).map(line => {
    // Simple CSV parse (no quoted commas in this data)
    return line.split(',');
  });
}

function isTimeStr(s) {
  if (!s) return false;
  const t = s.trim();
  return /^\d{1,2}:\d{2}$/.test(t);
}

function normalizeTime(t) {
  const m = t.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = m[2];
  // Pad hour
  return `${String(h).padStart(2, '0')}:${min}`;
}

// ─── Parse Western Line CSVs ───
// Tables 24-39 contain Western line data

function parseWesternTable(filePath) {
  const rows = parseCSV(filePath);
  const trains = [];
  
  let currentSection = null; // 'UP' or 'DN'
  let trainHeaders = [];  // train info from header row
  let sectionRows = [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const firstCell = (row[0] || '').trim();
    
    // Detect section headers
    if (firstCell.startsWith('STATIONS UP TRAINS') || firstCell.startsWith('STATIONS DN TRAINS')) {
      // Save previous section
      if (currentSection && trainHeaders.length > 0) {
        const parsed = extractTrainsFromSection(currentSection, trainHeaders, sectionRows, WESTERN_STATION_MAP, 'Western');
        trains.push(...parsed);
      }
      
      currentSection = firstCell.includes('UP') ? 'UP' : 'DN';
      
      // Parse train headers from this row
      trainHeaders = [];
      for (let c = 1; c < row.length; c++) {
        const cell = (row[c] || '').trim();
        if (cell) {
          // Parse "Destination TrainNo CarInfo" or "Virar 90021 12 CAR"
          const parts = cell.match(/^(.+?)\s+(\d{5})\s+(.*)$/);
          if (parts) {
            trainHeaders.push({ col: c, dest: parts[1].trim(), trainNo: parts[2], carInfo: parts[3].trim() });
          }
        }
      }
      sectionRows = [];
      continue;
    }
    
    // Detect DN/UP header that lists train numbers
    if (firstCell === 'DN TRAINS' || firstCell === 'UP TRAINS' || firstCell.startsWith('DN TRAINS') || firstCell === 'STATIONS') {
      // Could be a sub-header in Table 24 style
      if (firstCell === 'STATIONS' || firstCell === 'DN TRAINS') {
        // Parse train destinations from header
        if (currentSection === null) {
          // Table 24 style: first row is STATIONS with destinations
          currentSection = 'DN';
        }
        // Parse train numbers from next row
        const nextRow = rows[i + 1];
        if (nextRow && (nextRow[0] || '').trim() === 'DN TRAINS') {
          trainHeaders = [];
          for (let c = 1; c < nextRow.length; c++) {
            const num = (nextRow[c] || '').trim();
            if (num && /^\d{5}$/.test(num)) {
              const dest = (row[c] || '').trim();
              trainHeaders.push({ col: c, dest: dest, trainNo: num, carInfo: '' });
            }
          }
          i++; // skip next row
          // Skip car info row
          if (rows[i + 1]) {
            const carRow = rows[i + 1];
            const isCarRow = carRow.some(c => (c || '').trim().includes('CAR'));
            if (isCarRow) i++;
          }
          sectionRows = [];
          continue;
        }
      }
      continue;
    }
    
    // Skip empty rows
    if (!firstCell || firstCell === '' || firstCell.startsWith('AC ON') || firstCell.startsWith('# NON')) {
      continue;
    }
    
    // This is a station row
    if (currentSection && trainHeaders.length > 0) {
      sectionRows.push(row);
    }
  }
  
  // Save last section
  if (currentSection && trainHeaders.length > 0) {
    const parsed = extractTrainsFromSection(currentSection, trainHeaders, sectionRows, WESTERN_STATION_MAP, 'Western');
    trains.push(...parsed);
  }
  
  return trains;
}

function extractTrainsFromSection(direction, trainHeaders, stationRows, stationMap, line) {
  const trains = [];
  const seen = new Set();
  
  for (const th of trainHeaders) {
    const trainNo = th.trainNo;
    if (seen.has(trainNo)) continue; // skip duplicate columns
    seen.add(trainNo);
    
    const stops = [];
    for (const row of stationRows) {
      const stationName = (row[0] || '').trim();
      const stationId = stationMap[stationName];
      if (!stationId) continue;
      
      const timeCell = (row[th.col] || '').trim();
      if (isTimeStr(timeCell)) {
        stops.push({
          station: stationId,
          stationName: stationName,
          time: normalizeTime(timeCell)
        });
      }
    }
    
    if (stops.length >= 2) {
      // Determine if fast: fast trains skip many stations
      const isFast = determineFastTrain(stops, line);
      
      trains.push({
        trainNo,
        line,
        direction,
        destination: th.dest,
        carInfo: th.carInfo,
        type: isFast ? 'Fast' : 'Slow',
        stops
      });
    }
  }
  
  return trains;
}

function determineFastTrain(stops, line) {
  if (line === 'Western') {
    // Western line has ~28 stations from Churchgate to Virar
    // A slow train stops at all stations it passes through
    // A fast train skips stations like Marine Lines, Charni Road, etc.
    // Check if common "skip" stations are missing
    const stationIds = new Set(stops.map(s => s.station));
    
    // Fast trains from Churchgate typically skip: Marine Lines, Charni Rd, Grant Rd, Mahalakshmi, Lower Parel, Prabhadevi, Matunga Rd, Mahim
    // If train goes through Dadar but skips Matunga Road → fast
    if (stationIds.has('DDR') && stationIds.has('BDR') && !stationIds.has('MTR')) return true;
    if (stationIds.has('BCL') && stationIds.has('DDR') && !stationIds.has('MX')) return true;
    if (stationIds.has('ADH') && stationIds.has('BVI') && !stationIds.has('JGW')) return true;
    
    return false;
  }
  
  if (line === 'Central') {
    const stationIds = new Set(stops.map(s => s.station));
    // Fast trains skip: Matunga, Sion, Vidyavihar, Vikhroli, Kanjur Marg, Bhandup, Nahur
    if (stationIds.has('DR') && stationIds.has('KRL') && !stationIds.has('SIN')) return true;
    if (stationIds.has('GKP') && stationIds.has('TNA') && !stationIds.has('VKL')) return true;
    
    return false;
  }
  
  return false;
}

// ─── Parse Central Line CSVs ───
// Tables 17, 18 contain Central line data

function parseCentralTable(filePath) {
  const rows = parseCSV(filePath);
  const trains = [];
  let i = 0;
  
  while (i < rows.length) {
    const row = rows[i];
    const firstCell = (row[0] || '').trim();
    
    // Look for "Train No" header rows
    if (firstCell === 'Train No' || firstCell === 'Stations') {
      const isTrainNoRow = firstCell === 'Train No';
      
      if (isTrainNoRow) {
        // This row has train numbers
        const trainNos = [];
        for (let c = 1; c < row.length; c++) {
          trainNos.push((row[c] || '').trim());
        }
        
        // Next row has train codes
        i++;
        const codeRow = rows[i] || [];
        
        // Then station rows until next "Train No" header
        i++;
        const stationRows = [];
        while (i < rows.length) {
          const r = rows[i];
          const fc = (r[0] || '').trim();
          if (fc === 'Train No' || fc === 'Stations') break;
          if (fc && fc !== '' && !fc.startsWith(',')) {
            stationRows.push(r);
          }
          i++;
        }
        
        // Extract trains
        for (let c = 0; c < trainNos.length; c++) {
          const trainNo = trainNos[c];
          if (!trainNo || !/^\d{5}$/.test(trainNo)) continue;
          
          const colIdx = c + 1;
          const stops = [];
          
          for (const sr of stationRows) {
            const stationName = (sr[0] || '').trim();
            const stationId = CENTRAL_STATION_MAP[stationName];
            if (!stationId) continue;
            
            const timeCell = (sr[colIdx] || '').trim();
            if (isTimeStr(timeCell)) {
              stops.push({
                station: stationId,
                stationName: stationName,
                time: normalizeTime(timeCell)
              });
            }
          }
          
          if (stops.length >= 2) {
            // Determine direction: if first stop is CSMT → DN (away from CSMT), else UP (towards CSMT)
            const firstStation = stops[0].station;
            const lastStation = stops[stops.length - 1].station;
            const direction = firstStation === 'CSMT' ? 'DN' : 'UP';
            
            const isFast = determineFastTrain(stops, 'Central');
            const dest = stops[stops.length - 1].stationName;
            
            trains.push({
              trainNo,
              line: 'Central',
              direction,
              destination: dest,
              type: isFast ? 'Fast' : 'Slow',
              stops
            });
          }
        }
        continue;
      }
      
      // "Stations" header for DN direction tables
      if (firstCell === 'Stations') {
        const trainInfoRow = rows[i];
        const trainNos = [];
        const trainCodes = [];
        
        // Parse "trainNo trainCode" from header cells
        for (let c = 1; c < trainInfoRow.length; c++) {
          const cell = (trainInfoRow[c] || '').trim();
          const parts = cell.match(/^(\d{5})\s+(.*)$/);
          if (parts) {
            trainNos.push({ col: c, trainNo: parts[1], code: parts[2] });
          } else {
            // Sometimes the format is "trainNo" alone
            const numMatch = cell.match(/^(\d{5})$/);
            if (numMatch) {
              trainNos.push({ col: c, trainNo: numMatch[1], code: '' });
            }
          }
        }
        
        // Skip additional header rows (AC, X markers etc.)
        i++;
        while (i < rows.length) {
          const r = rows[i];
          const fc = (r[0] || '').trim();
          if (fc === '' || fc.startsWith(',') || fc === 'AC' || fc === 'X') {
            i++;
            continue;
          }
          break;
        }
        
        // Station rows
        const stationRows = [];
        while (i < rows.length) {
          const r = rows[i];
          const fc = (r[0] || '').trim();
          if (fc === 'Stations' || fc === 'Train No') break;
          if (fc && fc !== '') {
            stationRows.push(r);
          }
          i++;
        }
        
        // Extract trains
        for (const tn of trainNos) {
          const stops = [];
          for (const sr of stationRows) {
            const stationName = (sr[0] || '').trim();
            const stationId = CENTRAL_STATION_MAP[stationName];
            if (!stationId) continue;
            
            const timeCell = (sr[tn.col] || '').trim();
            if (isTimeStr(timeCell)) {
              stops.push({
                station: stationId,
                stationName: stationName,
                time: normalizeTime(timeCell)
              });
            }
          }
          
          if (stops.length >= 2) {
            const firstStation = stops[0].station;
            const direction = firstStation === 'CSMT' ? 'DN' : 'UP';
            const isFast = determineFastTrain(stops, 'Central');
            const dest = stops[stops.length - 1].stationName;
            
            trains.push({
              trainNo: tn.trainNo,
              line: 'Central',
              direction,
              destination: dest,
              type: isFast ? 'Fast' : 'Slow',
              stops
            });
          }
        }
        continue;
      }
    }
    
    i++;
  }
  
  return trains;
}

// ─── Parse Harbour Line CSVs ───

function parseHarbourTable(filePath) {
  const rows = parseCSV(filePath);
  const trains = [];
  let i = 0;
  
  while (i < rows.length) {
    const row = rows[i];
    const firstCell = (row[0] || '').trim();
    
    if (firstCell === 'Train No.' || firstCell.startsWith('UP HBR TRAINS')) {
      // Parse train numbers
      if (firstCell === 'Train No.') {
        const trainInfos = [];
        for (let c = 1; c < row.length; c++) {
          const cell = (row[c] || '').trim();
          const parts = cell.match(/^(\d{5})\s+(.*)$/);
          if (parts) {
            trainInfos.push({ col: c, trainNo: parts[1], code: parts[2] });
          }
        }
        
        // Skip "Stations" header row and any marker rows
        i++;
        while (i < rows.length) {
          const r = rows[i];
          const fc = (r[0] || '').trim();
          if (fc === 'Stations' || fc === '' || fc === 'X' || fc === '*') {
            i++;
            continue;
          }
          break;
        }
        
        // Station rows
        const stationRows = [];
        while (i < rows.length) {
          const r = rows[i];
          const fc = (r[0] || '').trim();
          if (fc === 'Train No.' || fc.startsWith('UP HBR') || fc === '') break;
          stationRows.push(r);
          i++;
        }
        
        // Deduplicate and extract
        const seen = new Set();
        for (const tn of trainInfos) {
          if (seen.has(tn.trainNo)) continue;
          seen.add(tn.trainNo);
          
          const stops = [];
          for (const sr of stationRows) {
            const stationName = (sr[0] || '').trim();
            const stationId = HARBOUR_STATION_MAP[stationName];
            if (!stationId) continue;
            
            const timeCell = (sr[tn.col] || '').trim();
            if (isTimeStr(timeCell)) {
              stops.push({
                station: stationId,
                stationName: stationName,
                time: normalizeTime(timeCell)
              });
            }
          }
          
          if (stops.length >= 2) {
            const firstStation = stops[0].station;
            const direction = firstStation === 'CSMT_H' ? 'DN' : 'UP';
            const dest = stops[stops.length - 1].stationName;
            
            trains.push({
              trainNo: tn.trainNo,
              line: 'Harbour',
              direction,
              destination: dest,
              type: 'Slow', // Harbour line doesn't have fast/slow distinction
              stops
            });
          }
        }
        continue;
      }
    }
    
    i++;
  }
  
  return trains;
}

// ─── Main ───

function main() {
  console.log('🚂 Building accurate Mumbai local train timetable...\n');
  
  const allTrains = [];
  
  // Parse Western Line tables (24-39)
  console.log('📋 Parsing Western Line...');
  for (let t = 24; t <= 39; t++) {
    const filePath = path.join(DATA_DIR, `Table - ${t}.csv`);
    if (fs.existsSync(filePath)) {
      const trains = parseWesternTable(filePath);
      allTrains.push(...trains);
      console.log(`  Table ${t}: ${trains.length} trains`);
    }
  }
  
  // Parse Central Line tables (17, 18)
  console.log('\n📋 Parsing Central Line...');
  for (const t of [17, 18]) {
    const filePath = path.join(DATA_DIR, `Table - ${t}.csv`);
    if (fs.existsSync(filePath)) {
      const trains = parseCentralTable(filePath);
      allTrains.push(...trains);
      console.log(`  Table ${t}: ${trains.length} trains`);
    }
  }
  
  // Parse Harbour Line table (52)
  console.log('\n📋 Parsing Harbour Line...');
  const harbourFile = path.join(DATA_DIR, 'Table - 52.csv');
  if (fs.existsSync(harbourFile)) {
    const trains = parseHarbourTable(harbourFile);
    allTrains.push(...trains);
    console.log(`  Table 52: ${trains.length} trains`);
  }
  
  // Deduplicate by trainNo
  const uniqueTrains = [];
  const seenTrainNos = new Set();
  for (const t of allTrains) {
    if (!seenTrainNos.has(t.trainNo)) {
      seenTrainNos.add(t.trainNo);
      uniqueTrains.push(t);
    }
  }
  
  // Build summary
  const western = uniqueTrains.filter(t => t.line === 'Western');
  const central = uniqueTrains.filter(t => t.line === 'Central');
  const harbour = uniqueTrains.filter(t => t.line === 'Harbour');
  
  const timetable = {
    metadata: {
      source: 'TrainHelp.in via Mumbai-Local-TimeTable-Extractor',
      generatedAt: new Date().toISOString(),
      totalTrains: uniqueTrains.length,
      lines: {
        Western: { total: western.length, fast: western.filter(t => t.type === 'Fast').length, slow: western.filter(t => t.type === 'Slow').length },
        Central: { total: central.length, fast: central.filter(t => t.type === 'Fast').length, slow: central.filter(t => t.type === 'Slow').length },
        Harbour: { total: harbour.length }
      }
    },
    trains: uniqueTrains
  };
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(timetable, null, 2));
  
  console.log(`\n✅ Done! ${uniqueTrains.length} unique trains written to accurate_timetable.json`);
  console.log(`   Western: ${western.length} (${western.filter(t=>t.type==='Fast').length} fast, ${western.filter(t=>t.type==='Slow').length} slow)`);
  console.log(`   Central: ${central.length} (${central.filter(t=>t.type==='Fast').length} fast, ${central.filter(t=>t.type==='Slow').length} slow)`);
  console.log(`   Harbour: ${harbour.length}`);
}

main();
