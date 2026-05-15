// Mumbai Suburban Railway Stations Database
// Source: https://en.wikipedia.org/wiki/List_of_Mumbai_Suburban_Railway_stations
// Covers Western, Central (Main + Kasara + Khopoli branches), Harbour (Main + Goregaon branch), and Trans-Harbour lines

export const LINES = {
  WESTERN: { id: 'western', name: 'Western', color: '#22d3ee', shortName: 'WR' },
  CENTRAL: { id: 'central', name: 'Central', color: '#f43f5e', shortName: 'CR' },
  HARBOUR: { id: 'harbour', name: 'Harbour', color: '#a78bfa', shortName: 'HR' },
  TRANS_HARBOUR: { id: 'trans-harbour', name: 'Trans-Harbour', color: '#34d399', shortName: 'TH' },
  URAN: { id: 'uran', name: 'Uran', color: '#f59e0b', shortName: 'UL' },
};

// Helper to build station objects
const S = (id, name, code, line, platforms, interchange, x, y) => ({ id, name, code, line, platforms, interchange, x, y });

export const stations = [
  // ===== WESTERN LINE (Churchgate → Dahanu Road) =====
  S('cg','Churchgate','CCG','western',4,[],50,960),
  S('mel','Marine Lines','MEL','western',2,[],50,935),
  S('cyr','Charni Road','CYR','western',2,[],50,910),
  S('gtr','Grant Road','GTR','western',2,[],50,885),
  S('bct','Mumbai Central','BCT','western',4,[],50,860),
  S('mx','Mahalaxmi','MX','western',2,[],50,835),
  S('lp','Lower Parel','PL','western',2,['harbour'],50,810),
  S('pbhd','Prabhadevi','PBHD','western',2,[],50,785),
  S('dp','Dadar','DDR','western',4,['central','harbour'],50,760),
  S('mru','Matunga Road','MRU','western',2,[],50,735),
  S('mm','Mahim Junction','MM','western',2,['harbour'],50,710),
  S('ba','Bandra','BA','western',4,['harbour'],50,685),
  S('khar','Khar Road','KHAR','western',2,[],50,660),
  S('snt','Santacruz','STC','western',2,[],50,635),
  S('vlp','Vile Parle','VLP','western',2,[],50,610),
  S('adh','Andheri','ADH','western',4,['harbour'],50,585),
  S('jgs','Jogeshwari','JOS','western',2,[],50,560),
  S('ram','Ram Mandir','RMAR','western',2,[],50,540),
  S('gmn','Goregaon','GMN','western',2,[],50,520),
  S('mld','Malad','MDD','western',2,[],50,495),
  S('kdv','Kandivali','KILE','western',2,[],50,470),
  S('bvi','Borivali','BVI','western',4,[],50,445),
  S('dic','Dahisar','DIC','western',2,[],50,420),
  S('mira','Mira Road','MIRA','western',2,[],50,395),
  S('byr','Bhayandar','BYR','western',2,[],50,370),
  S('nig','Naigaon','NIG','western',2,[],50,345),
  S('bsr','Vasai Road','BSR','western',4,[],50,320),
  S('nsp','Nallasopara','NSP','western',2,[],50,295),
  S('vr','Virar','VR','western',4,[],50,270),
  S('vtn','Vaitarna','VTN','western',2,[],50,245),
  S('sah','Saphale','SAH','western',2,[],50,220),
  S('klv','Kelve Road','KLV','western',2,[],50,195),
  S('plg','Palghar','PLG','western',2,[],50,170),
  S('uoi','Umroli','UOI','western',2,[],50,145),
  S('bor','Boisar','BOR','western',2,[],50,120),
  S('vgn','Vangaon','VGN','western',2,[],50,95),
  S('drd','Dahanu Road','DRD','western',2,[],50,70),

  // ===== CENTRAL LINE — Main (CSMT → Kalyan) =====
  S('csmt','CSMT','CSMT','central',8,['harbour'],150,960),
  S('msd','Masjid','MSD','central',2,[],150,935),
  S('snrd','Sandhurst Road','SNRD','central',2,['harbour'],150,910),
  S('by','Byculla','BY','central',2,[],150,885),
  S('chp','Chinchpokli','CHP','central',2,[],150,860),
  S('crd','Currey Road','CRD','central',2,[],150,835),
  S('pr','Parel','PR','central',2,[],150,810),
  S('ddr','Dadar','DR','central',4,['western','harbour'],150,760),
  S('mtg','Matunga','MTN','central',2,[],150,735),
  S('sn','Sion','SIN','central',2,[],150,710),
  S('kla','Kurla','CLA','central',4,['harbour'],150,685),
  S('vvh','Vidyavihar','VVH','central',2,[],150,660),
  S('ghk','Ghatkopar','GC','central',4,[],150,635),
  S('vk','Vikhroli','VK','central',2,[],150,610),
  S('kjm','Kanjurmarg','KJRD','central',2,[],150,585),
  S('bnd','Bhandup','BND','central',2,[],150,560),
  S('nhr','Nahur','NHU','central',2,[],150,540),
  S('mln','Mulund','MLND','central',2,[],150,520),
  S('tna','Thane','TNA','central',6,['trans-harbour'],150,495),
  S('klw','Kalwa','KLVA','central',2,[],150,470),
  S('mbq','Mumbra','MBQ','central',2,[],150,445),
  S('dva','Diva Junction','DIVA','central',4,[],150,420),
  S('kop','Kopar','KOP','central',2,[],150,400),
  S('dbd','Dombivli','DI','central',4,[],150,380),
  S('tky','Thakurli','THK','central',2,[],150,360),
  S('kyn','Kalyan Junction','KYN','central',6,[],150,340),

  // ===== CENTRAL LINE — Kasara Branch (Kalyan → Kasara) =====
  S('shad','Shahad','SHAD','central',2,[],170,320),
  S('aby','Ambivli','ABY','central',2,[],170,300),
  S('tla','Titwala','TLA','central',2,[],170,280),
  S('kdvl','Khadavli','KDV','central',2,[],170,260),
  S('vsd','Vasind','VSD','central',2,[],170,240),
  S('aso','Asangaon','ASO','central',2,[],170,220),
  S('atg','Atgaon','ATG','central',2,[],170,200),
  S('ths','Thansit','THS','central',2,[],170,180),
  S('ke','Khardi','KE','central',2,[],170,160),
  S('omb','Umbermali','OMB','central',2,[],170,140),
  S('ksr','Kasara','KSRA','central',2,[],170,120),

  // ===== CENTRAL LINE — Khopoli Branch (Kalyan → Khopoli) =====
  S('vldi','Vitthalwadi','VLDI','central',2,[],130,320),
  S('ulnr','Ulhasnagar','ULNR','central',2,[],130,300),
  S('abh','Ambernath','ABH','central',2,[],130,280),
  S('bud','Badlapur','BUD','central',2,[],130,260),
  S('vgi','Vangani','VGI','central',2,[],130,240),
  S('shlu','Shelu','SHLU','central',2,[],130,220),
  S('nrl_c','Neral Junction','NRL','central',2,[],130,200),
  S('bvs','Bhivpuri Road','BVS','central',2,[],130,180),
  S('kjt','Karjat','KJT','central',3,[],130,160),
  S('pdi','Palasdari','PDI','central',2,[],130,140),
  S('kly','Kelavli','KLY','central',2,[],130,120),
  S('dvs','Dolavli','DVS','central',2,[],130,100),
  S('lwj','Lowjee','LWJ','central',2,[],130,80),
  S('khpi','Khopoli','KHPI','central',2,[],130,60),

  // ===== HARBOUR LINE — Main (CSMT → Panvel) =====
  S('h_csmt','CSMT','CSMT','harbour',4,['central'],250,960),
  S('h_msd','Masjid','MSD','harbour',2,[],250,935),
  S('h_snrd','Sandhurst Road','SNRD','harbour',2,['central'],250,910),
  S('h_dkrd','Dockyard Road','DKRD','harbour',2,[],250,885),
  S('h_rrd','Reay Road','RRD','harbour',2,[],250,860),
  S('h_ctgn','Cotton Green','CTGN','harbour',2,[],250,835),
  S('h_sve','Sewri','SVE','harbour',2,[],250,810),
  S('h_wdlr','Wadala Road','VDLR','harbour',2,[],250,785),
  S('h_gtbn','GTB Nagar','GTBN','harbour',2,[],250,760),
  S('h_chf','Chunabhatti','CHF','harbour',2,[],250,735),
  S('h_kla','Kurla','CLA','harbour',2,['central'],250,710),
  S('h_tkng','Tilak Nagar','TKNG','harbour',2,[],250,685),
  S('h_cmbr','Chembur','CMBR','harbour',2,[],250,660),
  S('h_gv','Govandi','GV','harbour',2,[],250,635),
  S('h_mnkd','Mankhurd','MNKD','harbour',2,[],250,610),
  S('h_vsh','Vashi','VASI','harbour',4,['trans-harbour'],250,585),
  S('h_snpd','Sanpada','SNPD','harbour',2,[],250,560),
  S('h_jung','Juinagar','JUNG','harbour',2,[],250,520),
  S('h_nrl','Nerul','NERL','harbour',4,['trans-harbour'],250,500),
  S('h_swd','Seawoods-Darave','SWD','harbour',2,[],250,480),
  S('h_bepr','CBD Belapur','BEPR','harbour',4,[],250,460),
  S('h_khgr','Kharghar','KHGR','harbour',2,[],250,440),
  S('h_mnsr','Mansarovar','MNSR','harbour',2,[],250,420),
  S('h_khdr','Khandeshwar','KHDR','harbour',2,[],250,400),
  S('h_pnl','Panvel','PNVL','harbour',6,[],250,380),

  // ===== HARBOUR LINE — Roha Extension (Panvel → Roha) =====
  S('h_rsyi','Rasayani','RSYI','harbour',2,[],250,360),
  S('h_apta','Apta','APTA','harbour',2,[],250,340),
  S('h_hmpr','Hamrapur','HMPR','harbour',2,[],250,320),
  S('h_pen','Pen','PEN','harbour',2,[],250,300),
  S('h_kasu','Kasu','KASU','harbour',2,[],250,280),
  S('h_ngtn','Nagothane','NGTN','harbour',2,[],250,260),
  S('h_roha','Roha','ROHA','harbour',3,[],250,240),

  // ===== HARBOUR LINE — Goregaon Branch (Wadala Road → Goregaon via Bandra) =====
  S('hg_kce','Kings Circle','KCE','harbour',2,[],280,785),
  S('hg_mm','Mahim Junction','MM','harbour',2,['western'],280,760),
  S('hg_ba','Bandra','BA','harbour',2,['western'],280,735),
  S('hg_khar','Khar Road','KHAR','harbour',2,[],280,710),
  S('hg_stc','Santacruz','STC','harbour',2,[],280,685),
  S('hg_vlp','Vile Parle','VLP','harbour',2,[],280,660),
  S('hg_adh','Andheri','ADH','harbour',2,['western'],280,635),
  S('hg_jgs','Jogeshwari','JOS','harbour',2,[],280,610),
  S('hg_ram','Ram Mandir','RMAR','harbour',2,[],280,590),
  S('hg_gmn','Goregaon','GMN','harbour',2,[],280,570),

  // ===== TRANS-HARBOUR LINE (Thane → Panvel) =====
  S('th_tna','Thane','TNA','trans-harbour',2,['central'],350,495),
  S('th_dgh','Digha Gaon','DIGH','trans-harbour',2,[],350,470),
  S('th_arl','Airoli','AIRL','trans-harbour',2,[],350,445),
  S('th_rbd','Rabale','RABE','trans-harbour',2,[],350,420),
  S('th_ghsl','Ghansoli','GNSL','trans-harbour',2,[],350,395),
  S('th_kpr','Kopar Khairane','KPHN','trans-harbour',2,[],350,370),
  S('th_trb','Turbhe','TUH','trans-harbour',2,['harbour'],350,345),
  S('th_snpd','Sanpada','SNPD','trans-harbour',2,['harbour'],350,320),
  S('th_vsh','Vashi','VASI','trans-harbour',2,['harbour'],350,295),
  S('th_jung','Juinagar','JUNG','trans-harbour',2,['harbour'],350,270),
  S('th_nrl','Nerul','NERL','trans-harbour',2,['harbour'],350,245),
  S('th_swd','Seawoods-Darave','SWD','trans-harbour',2,['harbour'],350,220),
  S('th_bepr','CBD Belapur','BEPR','trans-harbour',4,['harbour'],350,195),
  S('th_khgr','Kharghar','KHGR','trans-harbour',2,['harbour'],350,170),
  S('th_mnsr','Mansarovar','MNSR','trans-harbour',2,['harbour'],350,145),
  S('th_khdr','Khandeshwar','KHDR','trans-harbour',2,['harbour'],350,120),
  S('th_pnl','Panvel','PNVL','trans-harbour',6,['harbour'],350,95),
];

// Popular stations for quick selection
export const popularStations = [
  'csmt', 'ddr', 'tna', 'kla', 'h_vsh', 'h_pnl',
  'th_ghsl', 'th_arl', 'adh', 'bvi', 'cg',
  'h_nrl', 'h_bepr', 'h_swd', 'kyn', 'kjt', 'ksr',
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
    let routeStations = lineStations.slice(start, end + 1);
    
    // Trans-Harbour Panvel branch bypass
    if (source.line === 'trans-harbour') {
      const hasTurbhe = routeStations.some(s => s.code === 'TUH');
      const hasJuinagar = routeStations.some(s => s.code === 'JUNG');
      
      if (hasTurbhe && hasJuinagar) {
        // Remove Sanpada and Vashi from the route array
        routeStations = routeStations.filter(s => s.code !== 'SNPD' && s.code !== 'VASI');
      }
    }

    if (srcIdx > destIdx) routeStations.reverse();
    
    return {
      type: 'direct',
      line: source.line,
      stations: routeStations,
      stops: routeStations.length - 1,
      interchange: null
    };
  }

  // Different lines — check if source or dest exist on the other line (Shared Track logic)
  const sourceOnDestLine = stations.find(s => s.name === source.name && s.line === dest.line);
  const destOnSourceLine = stations.find(s => s.name === dest.name && s.line === source.line);

  if (sourceOnDestLine) {
    return findRoute(sourceOnDestLine.id, destId);
  }
  if (destOnSourceLine) {
    return findRoute(sourceId, destOnSourceLine.id);
  }

  // Still different lines — find interchange
  const interchangeMap = {
    'western-central': { station: 'Dadar', sourceId: 'dp', destId: 'ddr', name: 'Dadar' },
    'central-western': { station: 'Dadar', sourceId: 'ddr', destId: 'dp', name: 'Dadar' },
    'western-harbour': { station: 'Dadar+Kurla', sourceId: 'dp', destId: 'h_kla', via: 'central', name: 'Dadar & Kurla' },
    'harbour-western': { station: 'Kurla+Dadar', sourceId: 'h_kla', destId: 'dp', via: 'central', name: 'Kurla & Dadar' },
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
  if (interchange.via) {
    // 3-segment route (e.g. WR -> CR -> TH)
    const seg1 = findRoute(sourceId, interchange.sourceId);
    
    // Middle segment (e.g. Dadar CR to Thane CR)
    // We need to find the correct IDs for the middle line
    let midSrcId, midDestId;
    if (interchange.via === 'central') {
      if (source.line === 'western') {
        midSrcId = 'ddr'; 
        midDestId = 'tna';
      } else {
        midSrcId = 'tna'; 
        midDestId = 'ddr';
      }
    } else {
      midSrcId = interchange.sourceId;
      midDestId = interchange.destId;
    }
    
    const seg2 = findRoute(midSrcId, midDestId);
    const seg3 = findRoute(interchange.destId, destId);

    const totalStops = (seg1?.stops || 5) + (seg2?.stops || 5) + (seg3?.stops || 5);
    const allStations = [
      ...(seg1?.stations || []),
      ...(seg2?.stations || []),
      ...(seg3?.stations || [])
    ];

    return {
      type: 'interchange',
      line: source.line,
      line2: interchange.via,
      line3: dest.line,
      stations: allStations,
      stops: totalStops,
      interchange: {
        station: interchange.name,
        id: midSrcId,
        id2: interchange.destId,
        name: interchange.name,
        isMulti: true,
        midDestId: midDestId // Track the middle target
      },
      destId: destId
    };
  }

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
