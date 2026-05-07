// Mumbai Suburban Railway Stations Database
// Covers Western, Central, Harbour, and Trans-Harbour lines

export const LINES = {
  WESTERN: { id: 'western', name: 'Western', color: '#22d3ee', shortName: 'WR' },
  CENTRAL: { id: 'central', name: 'Central', color: '#f43f5e', shortName: 'CR' },
  HARBOUR: { id: 'harbour', name: 'Harbour', color: '#a78bfa', shortName: 'HR' },
  TRANS_HARBOUR: { id: 'trans-harbour', name: 'Trans-Harbour', color: '#34d399', shortName: 'TH' },
};

export const stations = [
  // ===== WESTERN LINE =====
  { id: 'cg', name: 'Churchgate', code: 'CG', line: 'western', platforms: 4, interchange: [], x: 50, y: 920 },
  { id: 'mr', name: 'Marine Lines', code: 'MR', line: 'western', platforms: 2, interchange: [], x: 50, y: 890 },
  { id: 'cc', name: 'Charni Road', code: 'CC', line: 'western', platforms: 2, interchange: [], x: 50, y: 860 },
  { id: 'gr', name: 'Grant Road', code: 'GR', line: 'western', platforms: 2, interchange: [], x: 50, y: 830 },
  { id: 'mbc', name: 'Mumbai Central', code: 'BCT', line: 'western', platforms: 4, interchange: [], x: 50, y: 800 },
  { id: 'el', name: 'Elphinstone Road', code: 'EP', line: 'western', platforms: 2, interchange: ['harbour'], x: 50, y: 770 },
  { id: 'dp', name: 'Dadar', code: 'DDR', line: 'western', platforms: 4, interchange: ['central', 'harbour'], x: 50, y: 740 },
  { id: 'mm', name: 'Matunga Road', code: 'MTR', line: 'western', platforms: 2, interchange: [], x: 50, y: 710 },
  { id: 'mhd', name: 'Mahim', code: 'MM', line: 'western', platforms: 2, interchange: [], x: 50, y: 680 },
  { id: 'ba', name: 'Bandra', code: 'BA', line: 'western', platforms: 4, interchange: ['harbour'], x: 50, y: 650 },
  { id: 'khr', name: 'Khar Road', code: 'KHR', line: 'western', platforms: 2, interchange: [], x: 50, y: 620 },
  { id: 'snt', name: 'Santacruz', code: 'STC', line: 'western', platforms: 2, interchange: [], x: 50, y: 590 },
  { id: 'vm', name: 'Vile Parle', code: 'VP', line: 'western', platforms: 2, interchange: [], x: 50, y: 560 },
  { id: 'adh', name: 'Andheri', code: 'ADH', line: 'western', platforms: 4, interchange: ['harbour'], x: 50, y: 530 },
  { id: 'jgr', name: 'Jogeshwari', code: 'JGS', line: 'western', platforms: 2, interchange: [], x: 50, y: 500 },
  { id: 'ram', name: 'Ram Mandir', code: 'RAM', line: 'western', platforms: 2, interchange: [], x: 50, y: 475 },
  { id: 'grd', name: 'Goregaon', code: 'GRG', line: 'western', platforms: 2, interchange: [], x: 50, y: 450 },
  { id: 'mld', name: 'Malad', code: 'MLD', line: 'western', platforms: 2, interchange: [], x: 50, y: 420 },
  { id: 'knd', name: 'Kandivali', code: 'KDV', line: 'western', platforms: 2, interchange: [], x: 50, y: 390 },
  { id: 'bvi', name: 'Borivali', code: 'BVI', line: 'western', platforms: 4, interchange: [], x: 50, y: 360 },
  { id: 'dhn', name: 'Dahisar', code: 'DHS', line: 'western', platforms: 2, interchange: [], x: 50, y: 330 },
  { id: 'mra', name: 'Mira Road', code: 'MIR', line: 'western', platforms: 2, interchange: [], x: 50, y: 300 },
  { id: 'byr', name: 'Bhayandar', code: 'BYR', line: 'western', platforms: 2, interchange: [], x: 50, y: 270 },
  { id: 'nsg', name: 'Naigaon', code: 'NSG', line: 'western', platforms: 2, interchange: [], x: 50, y: 240 },
  { id: 'vr', name: 'Vasai Road', code: 'VSR', line: 'western', platforms: 4, interchange: [], x: 50, y: 210 },
  { id: 'nlsp', name: 'Nalla Sopara', code: 'NLS', line: 'western', platforms: 2, interchange: [], x: 50, y: 180 },
  { id: 'vrr', name: 'Virar', code: 'VR', line: 'western', platforms: 4, interchange: [], x: 50, y: 150 },

  // ===== CENTRAL LINE =====
  { id: 'csmt', name: 'CSMT', code: 'CSMT', line: 'central', platforms: 8, interchange: ['harbour'], x: 150, y: 920 },
  { id: 'msjd', name: 'Masjid', code: 'MSD', line: 'central', platforms: 2, interchange: [], x: 150, y: 890 },
  { id: 'snhst', name: 'Sandhurst Road', code: 'SNRD', line: 'central', platforms: 2, interchange: ['harbour'], x: 150, y: 860 },
  { id: 'by', name: 'Byculla', code: 'BY', line: 'central', platforms: 2, interchange: [], x: 150, y: 830 },
  { id: 'cpr', name: 'Chinchpokli', code: 'CPC', line: 'central', platforms: 2, interchange: [], x: 150, y: 800 },
  { id: 'cr', name: 'Currey Road', code: 'CRD', line: 'central', platforms: 2, interchange: [], x: 150, y: 770 },
  { id: 'ddr', name: 'Dadar', code: 'DR', line: 'central', platforms: 4, interchange: ['western', 'harbour'], x: 150, y: 740 },
  { id: 'mtg', name: 'Matunga', code: 'MTG', line: 'central', platforms: 2, interchange: [], x: 150, y: 710 },
  { id: 'sc', name: 'Sion', code: 'SN', line: 'central', platforms: 2, interchange: [], x: 150, y: 680 },
  { id: 'kla', name: 'Kurla', code: 'KLA', line: 'central', platforms: 4, interchange: ['harbour'], x: 150, y: 650 },
  { id: 'vnk', name: 'Vidyavihar', code: 'VVH', line: 'central', platforms: 2, interchange: [], x: 150, y: 620 },
  { id: 'ghk', name: 'Ghatkopar', code: 'GHK', line: 'central', platforms: 4, interchange: [], x: 150, y: 590 },
  { id: 'vik', name: 'Vikhroli', code: 'VK', line: 'central', platforms: 2, interchange: [], x: 150, y: 560 },
  { id: 'knp', name: 'Kanjurmarg', code: 'KJM', line: 'central', platforms: 2, interchange: [], x: 150, y: 530 },
  { id: 'bnd', name: 'Bhandup', code: 'BND', line: 'central', platforms: 2, interchange: [], x: 150, y: 500 },
  { id: 'nhr', name: 'Nahur', code: 'NHR', line: 'central', platforms: 2, interchange: [], x: 150, y: 475 },
  { id: 'mly', name: 'Mulund', code: 'MLD', line: 'central', platforms: 2, interchange: [], x: 150, y: 450 },
  { id: 'tna', name: 'Thane', code: 'TNA', line: 'central', platforms: 6, interchange: ['trans-harbour'], x: 150, y: 420 },
  { id: 'klw', name: 'Kalwa', code: 'KLW', line: 'central', platforms: 2, interchange: [], x: 150, y: 390 },
  { id: 'mmk', name: 'Mumbra', code: 'MMK', line: 'central', platforms: 2, interchange: [], x: 150, y: 360 },
  { id: 'dvy', name: 'Diva', code: 'DVA', line: 'central', platforms: 4, interchange: [], x: 150, y: 330 },
  { id: 'dbd', name: 'Dombivli', code: 'DBD', line: 'central', platforms: 4, interchange: [], x: 150, y: 300 },
  { id: 'tky', name: 'Thakurli', code: 'TKY', line: 'central', platforms: 2, interchange: [], x: 150, y: 270 },
  { id: 'kyn', name: 'Kalyan', code: 'KYN', line: 'central', platforms: 6, interchange: [], x: 150, y: 240 },
  { id: 'vtk', name: 'Vitthalwadi', code: 'VTK', line: 'central', platforms: 2, interchange: [], x: 150, y: 210 },
  { id: 'ulp', name: 'Ulhasnagar', code: 'ULP', line: 'central', platforms: 2, interchange: [], x: 150, y: 190 },
  { id: 'abd', name: 'Ambernath', code: 'ABD', line: 'central', platforms: 2, interchange: [], x: 150, y: 170 },
  { id: 'bdn', name: 'Badlapur', code: 'BDN', line: 'central', platforms: 2, interchange: [], x: 150, y: 150 },
  { id: 'krj', name: 'Karjat', code: 'KRJ', line: 'central', platforms: 3, interchange: [], x: 150, y: 110 },
  { id: 'ksr', name: 'Kasara', code: 'KSR', line: 'central', platforms: 2, interchange: [], x: 170, y: 80 },

  // ===== HARBOUR LINE =====
  { id: 'h_csmt', name: 'CSMT', code: 'CSMT', line: 'harbour', platforms: 4, interchange: ['central'], x: 250, y: 920 },
  { id: 'h_msjd', name: 'Masjid', code: 'MSD', line: 'harbour', platforms: 2, interchange: [], x: 250, y: 890 },
  { id: 'h_snrd', name: 'Sandhurst Road', code: 'SNRD', line: 'harbour', platforms: 2, interchange: ['central'], x: 250, y: 860 },
  { id: 'h_dock', name: 'Dockyard Road', code: 'DYR', line: 'harbour', platforms: 2, interchange: [], x: 250, y: 830 },
  { id: 'h_rly', name: 'Reay Road', code: 'RRD', line: 'harbour', platforms: 2, interchange: [], x: 250, y: 800 },
  { id: 'h_ctng', name: 'Cotton Green', code: 'CTG', line: 'harbour', platforms: 2, interchange: [], x: 250, y: 770 },
  { id: 'h_swri', name: 'Sewri', code: 'SWR', line: 'harbour', platforms: 2, interchange: [], x: 250, y: 740 },
  { id: 'h_wdla', name: 'Wadala Road', code: 'WDR', line: 'harbour', platforms: 2, interchange: [], x: 250, y: 710 },
  { id: 'h_gtb', name: 'GTB Nagar', code: 'GTB', line: 'harbour', platforms: 2, interchange: [], x: 250, y: 680 },
  { id: 'h_cng', name: 'Chunabhatti', code: 'CHB', line: 'harbour', platforms: 2, interchange: [], x: 250, y: 650 },
  { id: 'h_kla', name: 'Kurla', code: 'KLA', line: 'harbour', platforms: 2, interchange: ['central'], x: 250, y: 620 },
  { id: 'h_tlk', name: 'Tilak Nagar', code: 'TLN', line: 'harbour', platforms: 2, interchange: [], x: 250, y: 590 },
  { id: 'h_chbr', name: 'Chembur', code: 'CMB', line: 'harbour', platforms: 2, interchange: [], x: 250, y: 560 },
  { id: 'h_gnb', name: 'Govandi', code: 'GVD', line: 'harbour', platforms: 2, interchange: [], x: 250, y: 530 },
  { id: 'h_mne', name: 'Mankhurd', code: 'MNK', line: 'harbour', platforms: 2, interchange: [], x: 250, y: 500 },
  { id: 'h_vsh', name: 'Vashi', code: 'VSH', line: 'harbour', platforms: 4, interchange: ['trans-harbour'], x: 250, y: 470 },
  { id: 'h_swd', name: 'Sanpada', code: 'SPD', line: 'harbour', platforms: 2, interchange: [], x: 250, y: 440 },
  { id: 'h_trb', name: 'Turbhe', code: 'TRB', line: 'harbour', platforms: 2, interchange: [], x: 250, y: 415 },
  { id: 'h_jui', name: 'Juinagar', code: 'JUI', line: 'harbour', platforms: 2, interchange: [], x: 250, y: 390 },
  { id: 'h_nrl', name: 'Nerul', code: 'NRL', line: 'harbour', platforms: 4, interchange: ['trans-harbour'], x: 250, y: 365 },
  { id: 'h_swd2', name: 'Seawoods Darave', code: 'SWD', line: 'harbour', platforms: 2, interchange: [], x: 250, y: 340 },
  { id: 'h_cbd', name: 'CBD Belapur', code: 'CBD', line: 'harbour', platforms: 4, interchange: [], x: 250, y: 315 },
  { id: 'h_kpn', name: 'Kharghar', code: 'KPR', line: 'harbour', platforms: 2, interchange: [], x: 250, y: 290 },
  { id: 'h_mnsr', name: 'Mansarovar', code: 'MSR', line: 'harbour', platforms: 2, interchange: [], x: 250, y: 265 },
  { id: 'h_knj', name: 'Khandeshwar', code: 'KHS', line: 'harbour', platforms: 2, interchange: [], x: 250, y: 240 },
  { id: 'h_pnl', name: 'Panvel', code: 'PNL', line: 'harbour', platforms: 6, interchange: [], x: 250, y: 215 },

  // ===== TRANS-HARBOUR LINE =====
  { id: 'th_tna', name: 'Thane', code: 'TNA', line: 'trans-harbour', platforms: 2, interchange: ['central'], x: 350, y: 420 },
  { id: 'th_arl', name: 'Airoli', code: 'ARL', line: 'trans-harbour', platforms: 2, interchange: [], x: 350, y: 395 },
  { id: 'th_rbd', name: 'Rabale', code: 'RBD', line: 'trans-harbour', platforms: 2, interchange: [], x: 350, y: 370 },
  { id: 'th_ghsl', name: 'Ghansoli', code: 'GHL', line: 'trans-harbour', platforms: 2, interchange: [], x: 350, y: 345 },
  { id: 'th_kpr', name: 'Kopar Khairane', code: 'KPK', line: 'trans-harbour', platforms: 2, interchange: [], x: 350, y: 320 },
  { id: 'th_trb', name: 'Turbhe', code: 'TRB', line: 'trans-harbour', platforms: 2, interchange: ['harbour'], x: 350, y: 295 },
  { id: 'th_jui', name: 'Juinagar', code: 'JUI', line: 'trans-harbour', platforms: 2, interchange: ['harbour'], x: 350, y: 270 },
  { id: 'th_swd', name: 'Sanpada', code: 'SPD', line: 'trans-harbour', platforms: 2, interchange: ['harbour'], x: 350, y: 245 },
  { id: 'th_vsh', name: 'Vashi', code: 'VSH', line: 'trans-harbour', platforms: 2, interchange: ['harbour'], x: 350, y: 220 },
  { id: 'th_nrl', name: 'Nerul', code: 'NRL', line: 'trans-harbour', platforms: 2, interchange: ['harbour'], x: 350, y: 195 },
];

// Popular stations for quick selection
export const popularStations = [
  'csmt', 'ddr', 'tna', 'kla', 'h_vsh', 'h_pnl',
  'th_ghsl', 'th_arl', 'adh', 'bvi', 'cg',
  'h_nrl', 'h_cbd', 'h_swd2', 'kyn', 'krj', 'ksr',
  'th_kpr', 'ghk', 'dbd'
];

// Get station by ID
export function getStation(id) {
  return stations.find(s => s.id === id);
}

// Search stations by query (fuzzy)
export function searchStations(query) {
  if (!query || query.length === 0) return [];
  const q = query.toLowerCase().trim();
  
  return stations.filter(s => {
    const lineSuffix = s.line === 'western' ? 'WR' : s.line === 'central' ? 'CR' : s.line === 'harbour' ? 'HR' : 'TH';
    return (
      s.name.toLowerCase().includes(q) ||
      `${s.name} (${lineSuffix})`.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q)
    );
  }).slice(0, 10);
}

// Get line info
export function getLineInfo(lineId) {
  return Object.values(LINES).find(l => l.id === lineId);
}

// Get stations on a specific line
export function getStationsOnLine(lineId) {
  return stations.filter(s => s.line === lineId);
}

// Find route between two stations
export function findRoute(sourceId, destId) {
  const source = getStation(sourceId);
  const dest = getStation(destId);
  if (!source || !dest) return null;

  // Same line — direct route
  if (source.line === dest.line) {
    const lineStations = getStationsOnLine(source.line);
    const srcIdx = lineStations.findIndex(s => s.id === sourceId);
    const destIdx = lineStations.findIndex(s => s.id === destId);
    if (srcIdx === -1 || destIdx === -1) return null;
    
    const start = Math.min(srcIdx, destIdx);
    const end = Math.max(srcIdx, destIdx);
    const routeStations = lineStations.slice(start, end + 1);
    if (srcIdx > destIdx) routeStations.reverse();
    
    return {
      type: 'direct',
      line: source.line,
      stations: routeStations,
      stops: routeStations.length - 1,
      interchange: null
    };
  }

  // Different lines — find interchange
  const interchangeMap = {
    'western-central': { station: 'Dadar', sourceId: 'dp', destId: 'ddr', name: 'Dadar' },
    'central-western': { station: 'Dadar', sourceId: 'ddr', destId: 'dp', name: 'Dadar' },
    'western-harbour': { station: 'Bandra', sourceId: 'ba', destId: 'h_kla', name: 'Bandra/Kurla' },
    'harbour-western': { station: 'Kurla', sourceId: 'h_kla', destId: 'ba', name: 'Kurla/Bandra' },
    'central-harbour': { station: 'Kurla', sourceId: 'kla', destId: 'h_kla', name: 'Kurla' },
    'harbour-central': { station: 'Kurla', sourceId: 'h_kla', destId: 'kla', name: 'Kurla' },
    'central-trans-harbour': { station: 'Thane', sourceId: 'tna', destId: 'th_tna', name: 'Thane' },
    'trans-harbour-central': { station: 'Thane', sourceId: 'th_tna', destId: 'tna', name: 'Thane' },
    'harbour-trans-harbour': { station: 'Vashi', sourceId: 'h_vsh', destId: 'th_vsh', name: 'Vashi' },
    'trans-harbour-harbour': { station: 'Vashi', sourceId: 'th_vsh', destId: 'h_vsh', name: 'Vashi' },
    'western-trans-harbour': { station: 'Dadar+Thane', sourceId: 'dp', destId: 'th_tna', via: 'central', name: 'Dadar & Thane' },
    'trans-harbour-western': { station: 'Thane+Dadar', sourceId: 'th_tna', destId: 'dp', via: 'central', name: 'Thane & Dadar' },
  };

  const key = `${source.line}-${dest.line}`;
  const interchange = interchangeMap[key];
  
  if (!interchange) {
    // Fallback — use Dadar as universal interchange
    return {
      type: 'interchange',
      line: source.line,
      line2: dest.line,
      stations: [source, dest],
      stops: 15, // estimate
      interchange: { station: 'Dadar', note: 'Change at Dadar' }
    };
  }

  // Build the route segments
  const seg1 = findRoute(sourceId, interchange.sourceId);
  const seg2Src = interchange.destId || interchange.sourceId;
  const seg2 = findRoute(seg2Src, destId);

  const totalStops = (seg1?.stops || 5) + (seg2?.stops || 5);
  const allStations = [
    ...(seg1?.stations || [source]),
    ...(seg2?.stations || [dest])
  ];

  return {
    type: 'interchange',
    line: source.line,
    line2: dest.line,
    stations: allStations,
    stops: totalStops,
    interchange: {
      station: interchange.name,
      id: interchange.destId || interchange.sourceId,
      note: `Change at ${interchange.name}`
    },
    destId: destId
  };
}
