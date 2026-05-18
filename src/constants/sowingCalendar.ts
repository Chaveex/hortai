import { PlantType } from '../types';

export type ClimateZone = 'mediterranean' | 'oceanic' | 'semi-oceanic' | 'continental' | 'mountain';

export interface SowingInfo {
  sowIndoor?: number[];
  sowOutdoor?: number[];
  transplant?: number[];
  harvest?: number[];
}

export const ZONE_LABELS: Record<ClimateZone, string> = {
  mediterranean: '☀️ Méditerranéen',
  oceanic: '🌊 Océanique',
  'semi-oceanic': '🌤️ Semi-océanique',
  continental: '❄️ Continental',
  mountain: '⛰️ Montagne',
};

export function detectZone(lat: number, lon: number): ClimateZone {
  // Pyrénées
  if (lat > 42 && lat < 43.5 && lon > -2 && lon < 3.5) return 'mountain';
  // Alpes / Massif Central
  if (lat > 44 && lat < 46.5 && lon > 5.5) return 'mountain';
  // Méditerranée
  if (lat < 44.5 && lon > 2.5) return 'mediterranean';
  // Océanique : ouest
  if (lon < 1 && lat > 43) return 'oceanic';
  // Continental : est
  if (lon > 5 && lat > 46) return 'continental';
  return 'semi-oceanic';
}

// Données par zone. Mois = 1-12.
const CALENDAR: Partial<Record<PlantType, Record<ClimateZone, SowingInfo>>> = {
  tomato: {
    mediterranean: { sowIndoor: [1, 2], transplant: [3, 4], harvest: [6, 7, 8, 9, 10] },
    oceanic:       { sowIndoor: [3, 4], transplant: [5], harvest: [7, 8, 9, 10] },
    'semi-oceanic':{ sowIndoor: [2, 3, 4], transplant: [5], harvest: [7, 8, 9] },
    continental:   { sowIndoor: [3, 4], transplant: [5, 6], harvest: [8, 9] },
    mountain:      { sowIndoor: [3, 4], transplant: [6], harvest: [8, 9] },
  },
  pepper: {
    mediterranean: { sowIndoor: [1, 2], transplant: [4], harvest: [7, 8, 9, 10] },
    oceanic:       { sowIndoor: [3], transplant: [5, 6], harvest: [8, 9] },
    'semi-oceanic':{ sowIndoor: [2, 3], transplant: [5, 6], harvest: [8, 9] },
    continental:   { sowIndoor: [3, 4], transplant: [6], harvest: [8, 9] },
    mountain:      { sowIndoor: [4], transplant: [6], harvest: [9] },
  },
  zucchini: {
    mediterranean: { sowIndoor: [3], sowOutdoor: [4], harvest: [6, 7, 8, 9] },
    oceanic:       { sowIndoor: [4], sowOutdoor: [5], harvest: [7, 8, 9] },
    'semi-oceanic':{ sowIndoor: [4], sowOutdoor: [5], harvest: [7, 8, 9] },
    continental:   { sowIndoor: [4, 5], sowOutdoor: [5], harvest: [7, 8, 9] },
    mountain:      { sowIndoor: [4, 5], transplant: [6], harvest: [8, 9] },
  },
  cucumber: {
    mediterranean: { sowIndoor: [3], sowOutdoor: [4], harvest: [6, 7, 8] },
    oceanic:       { sowIndoor: [4], sowOutdoor: [5], harvest: [7, 8] },
    'semi-oceanic':{ sowIndoor: [4], sowOutdoor: [5], harvest: [7, 8] },
    continental:   { sowIndoor: [4, 5], sowOutdoor: [5], harvest: [7, 8] },
    mountain:      { sowIndoor: [5], transplant: [6], harvest: [8] },
  },
  lettuce: {
    mediterranean: { sowOutdoor: [2, 3, 4, 9, 10], harvest: [4, 5, 6, 11, 12] },
    oceanic:       { sowOutdoor: [3, 4, 5, 8, 9], harvest: [5, 6, 7, 10, 11] },
    'semi-oceanic':{ sowOutdoor: [3, 4, 5, 8, 9], harvest: [5, 6, 7, 10, 11] },
    continental:   { sowOutdoor: [4, 5, 8], harvest: [6, 7, 10] },
    mountain:      { sowOutdoor: [5, 6], harvest: [7, 8] },
  },
  carrot: {
    mediterranean: { sowOutdoor: [2, 3, 8, 9], harvest: [5, 6, 11, 12] },
    oceanic:       { sowOutdoor: [3, 4, 7, 8], harvest: [6, 7, 10, 11] },
    'semi-oceanic':{ sowOutdoor: [3, 4, 5, 7], harvest: [6, 7, 8, 10] },
    continental:   { sowOutdoor: [4, 5], harvest: [8, 9, 10] },
    mountain:      { sowOutdoor: [5, 6], harvest: [9, 10] },
  },
  radish: {
    mediterranean: { sowOutdoor: [2, 3, 9, 10], harvest: [3, 4, 10, 11] },
    oceanic:       { sowOutdoor: [3, 4, 5, 8, 9], harvest: [4, 5, 6, 9, 10] },
    'semi-oceanic':{ sowOutdoor: [3, 4, 5, 8, 9], harvest: [4, 5, 6, 9, 10] },
    continental:   { sowOutdoor: [4, 5, 8], harvest: [5, 6, 9] },
    mountain:      { sowOutdoor: [5, 6], harvest: [6, 7] },
  },
  beans: {
    mediterranean: { sowOutdoor: [4, 5, 6], harvest: [6, 7, 8, 9] },
    oceanic:       { sowOutdoor: [5, 6], harvest: [7, 8, 9] },
    'semi-oceanic':{ sowOutdoor: [5, 6], harvest: [7, 8, 9] },
    continental:   { sowOutdoor: [5, 6], harvest: [8, 9] },
    mountain:      { sowOutdoor: [6], harvest: [8, 9] },
  },
  peas: {
    mediterranean: { sowOutdoor: [10, 11, 2, 3], harvest: [3, 4, 5, 6] },
    oceanic:       { sowOutdoor: [2, 3, 10], harvest: [5, 6, 7] },
    'semi-oceanic':{ sowOutdoor: [3, 4], harvest: [6, 7] },
    continental:   { sowOutdoor: [3, 4], harvest: [6, 7] },
    mountain:      { sowOutdoor: [4, 5], harvest: [7, 8] },
  },
  basil: {
    mediterranean: { sowIndoor: [3], sowOutdoor: [4, 5], harvest: [6, 7, 8, 9] },
    oceanic:       { sowIndoor: [4], transplant: [5, 6], harvest: [7, 8, 9] },
    'semi-oceanic':{ sowIndoor: [3, 4], transplant: [5], harvest: [6, 7, 8, 9] },
    continental:   { sowIndoor: [4], transplant: [6], harvest: [7, 8, 9] },
    mountain:      { sowIndoor: [4], transplant: [6], harvest: [7, 8] },
  },
  parsley: {
    mediterranean: { sowOutdoor: [2, 3, 9], harvest: [4, 5, 6, 10, 11, 12] },
    oceanic:       { sowOutdoor: [3, 4, 8], harvest: [5, 6, 10, 11] },
    'semi-oceanic':{ sowOutdoor: [3, 4, 8], harvest: [5, 6, 10, 11] },
    continental:   { sowOutdoor: [4, 5], harvest: [6, 7, 8] },
    mountain:      { sowOutdoor: [5], harvest: [7, 8] },
  },
  mint: {
    mediterranean: { sowOutdoor: [3, 4], transplant: [4, 5], harvest: [5, 6, 7, 8, 9, 10] },
    oceanic:       { transplant: [4, 5], harvest: [5, 6, 7, 8, 9] },
    'semi-oceanic':{ transplant: [4, 5], harvest: [5, 6, 7, 8, 9] },
    continental:   { transplant: [5], harvest: [6, 7, 8, 9] },
    mountain:      { transplant: [5, 6], harvest: [7, 8] },
  },
  strawberry: {
    mediterranean: { transplant: [9, 10, 3], harvest: [4, 5, 6] },
    oceanic:       { transplant: [9, 10, 3, 4], harvest: [5, 6, 7] },
    'semi-oceanic':{ transplant: [3, 4, 9, 10], harvest: [5, 6, 7] },
    continental:   { transplant: [4, 9], harvest: [6, 7] },
    mountain:      { transplant: [5], harvest: [7, 8] },
  },
  potato: {
    mediterranean: { sowOutdoor: [2, 3], harvest: [5, 6, 7] },
    oceanic:       { sowOutdoor: [3, 4], harvest: [7, 8] },
    'semi-oceanic':{ sowOutdoor: [3, 4], harvest: [7, 8] },
    continental:   { sowOutdoor: [4, 5], harvest: [8, 9] },
    mountain:      { sowOutdoor: [5], harvest: [9] },
  },
  onion: {
    mediterranean: { sowOutdoor: [2, 3, 9], harvest: [6, 7, 12] },
    oceanic:       { sowOutdoor: [3, 4], harvest: [7, 8] },
    'semi-oceanic':{ sowOutdoor: [3, 4], harvest: [7, 8] },
    continental:   { sowOutdoor: [4], harvest: [8, 9] },
    mountain:      { sowOutdoor: [4, 5], harvest: [9] },
  },
  garlic: {
    mediterranean: { sowOutdoor: [10, 11], harvest: [5, 6] },
    oceanic:       { sowOutdoor: [10, 11], harvest: [6, 7] },
    'semi-oceanic':{ sowOutdoor: [10, 11], harvest: [6, 7] },
    continental:   { sowOutdoor: [10, 11], harvest: [7] },
    mountain:      { sowOutdoor: [10], harvest: [7, 8] },
  },
  leek: {
    mediterranean: { sowIndoor: [2, 3], transplant: [5, 6], harvest: [9, 10, 11, 12, 1] },
    oceanic:       { sowIndoor: [3, 4], transplant: [6], harvest: [10, 11, 12, 1] },
    'semi-oceanic':{ sowIndoor: [3, 4], transplant: [6], harvest: [10, 11, 12, 1] },
    continental:   { sowIndoor: [3, 4], transplant: [6, 7], harvest: [10, 11, 12] },
    mountain:      { sowIndoor: [4], transplant: [7], harvest: [10, 11] },
  },
  spinach: {
    mediterranean: { sowOutdoor: [9, 10, 2, 3], harvest: [11, 12, 1, 4, 5] },
    oceanic:       { sowOutdoor: [3, 4, 8, 9], harvest: [5, 6, 10, 11] },
    'semi-oceanic':{ sowOutdoor: [3, 4, 8, 9], harvest: [5, 6, 10, 11] },
    continental:   { sowOutdoor: [4, 8], harvest: [6, 10] },
    mountain:      { sowOutdoor: [5, 8], harvest: [7, 10] },
  },
  chard: {
    mediterranean: { sowOutdoor: [3, 4, 8], harvest: [5, 6, 7, 10, 11] },
    oceanic:       { sowOutdoor: [4, 5], harvest: [6, 7, 8, 9] },
    'semi-oceanic':{ sowOutdoor: [4, 5], harvest: [6, 7, 8, 9] },
    continental:   { sowOutdoor: [5], harvest: [7, 8, 9] },
    mountain:      { sowOutdoor: [5, 6], harvest: [8, 9] },
  },
  beet: {
    mediterranean: { sowOutdoor: [2, 3, 8], harvest: [5, 6, 11] },
    oceanic:       { sowOutdoor: [4, 5], harvest: [7, 8, 9] },
    'semi-oceanic':{ sowOutdoor: [4, 5], harvest: [7, 8, 9] },
    continental:   { sowOutdoor: [4, 5], harvest: [8, 9] },
    mountain:      { sowOutdoor: [5], harvest: [9] },
  },
  broccoli: {
    mediterranean: { sowIndoor: [2, 3, 7], transplant: [4, 5, 9], harvest: [6, 7, 11, 12] },
    oceanic:       { sowIndoor: [3, 4, 7], transplant: [5, 6, 9], harvest: [7, 8, 11, 12] },
    'semi-oceanic':{ sowIndoor: [3, 4, 7], transplant: [5, 6, 9], harvest: [7, 8, 11] },
    continental:   { sowIndoor: [4, 7], transplant: [6, 9], harvest: [8, 9, 11] },
    mountain:      { sowIndoor: [4, 5], transplant: [6], harvest: [9, 10] },
  },
  corn: {
    mediterranean: { sowIndoor: [4], sowOutdoor: [5], harvest: [8, 9] },
    oceanic:       { sowIndoor: [4, 5], sowOutdoor: [5], harvest: [9] },
    'semi-oceanic':{ sowIndoor: [4, 5], sowOutdoor: [5], harvest: [8, 9] },
    continental:   { sowIndoor: [5], sowOutdoor: [5, 6], harvest: [9] },
    mountain:      { sowIndoor: [5], transplant: [6], harvest: [9] },
  },
  sunflower: {
    mediterranean: { sowOutdoor: [4, 5], harvest: [8, 9] },
    oceanic:       { sowOutdoor: [5], harvest: [9, 10] },
    'semi-oceanic':{ sowOutdoor: [5], harvest: [9] },
    continental:   { sowOutdoor: [5], harvest: [9] },
    mountain:      { sowOutdoor: [5, 6], harvest: [9, 10] },
  },
  other: {
    mediterranean: { sowOutdoor: [3, 4, 5], harvest: [7, 8, 9] },
    oceanic:       { sowOutdoor: [4, 5], harvest: [7, 8, 9] },
    'semi-oceanic':{ sowOutdoor: [4, 5], harvest: [7, 8, 9] },
    continental:   { sowOutdoor: [5], harvest: [8, 9] },
    mountain:      { sowOutdoor: [5, 6], harvest: [8, 9] },
  },
};

export function getSowingInfo(type: PlantType, zone: ClimateZone): SowingInfo {
  return CALENDAR[type]?.[zone] ?? {};
}

export function getPlantsForMonth(
  month: number,
  zone: ClimateZone,
): {
  sowIndoor: PlantType[];
  sowOutdoor: PlantType[];
  transplant: PlantType[];
  harvest: PlantType[];
} {
  const result = { sowIndoor: [] as PlantType[], sowOutdoor: [] as PlantType[], transplant: [] as PlantType[], harvest: [] as PlantType[] };

  for (const [type, zones] of Object.entries(CALENDAR) as [PlantType, Record<ClimateZone, SowingInfo>][]) {
    const info = zones[zone];
    if (!info) continue;
    if (info.sowIndoor?.includes(month)) result.sowIndoor.push(type);
    if (info.sowOutdoor?.includes(month)) result.sowOutdoor.push(type);
    if (info.transplant?.includes(month)) result.transplant.push(type);
    if (info.harvest?.includes(month)) result.harvest.push(type);
  }

  return result;
}
