import { PlantType } from '../types';
import { PLANT_METADATA } from './plants-meta';
import plantDataFr from '../i18n/plants-data/fr.json';
import plantDataEn from '../i18n/plants-data/en.json';
import plantDataEs from '../i18n/plants-data/es.json';
import i18next from '../i18n/config';

export interface PlantInfo {
  frenchName: string;
  icon: string;
  dailyWaterNeed: number;
  wateringFrequencyDays: number;
  germinationDays: number;
  harvestDays: number;
  sunExposure: 'full' | 'partial' | 'shade';
  tips: {
    permaculture: string;
    conventionnel: string;
    naturel: string;
    industriel: string;
  };
  commonIssues: string[];
  seasonalAdvice: {
    spring: string;
    summer: string;
    autumn: string;
    winter: string;
  };
  fertilizerSchedule: {
    naturel: string;
    industriel: string;
  };
}

const PLANT_TRANSLATIONS = {
  fr: plantDataFr,
  en: plantDataEn,
  es: plantDataEs,
};

export const PLANT_TYPES = [
  'tomato', 'pepper', 'zucchini', 'cucumber', 'lettuce', 'carrot', 'radish',
  'beans', 'peas', 'basil', 'parsley', 'mint', 'strawberry', 'potato',
  'onion', 'garlic', 'leek', 'spinach', 'chard', 'beet', 'broccoli',
  'corn', 'sunflower', 'other'
] as PlantType[];

function getTranslationData() {
  const lang = i18next.language || 'en';
  if (lang === 'fr') return PLANT_TRANSLATIONS.fr;
  if (lang === 'es') return PLANT_TRANSLATIONS.es;
  return PLANT_TRANSLATIONS.en;
}

export function getPlantInfo(type: PlantType): PlantInfo {
  const meta = PLANT_METADATA[type];
  const translations = getTranslationData();
  const plantData = translations[type] || translations.other;

  if (!meta) {
    return {
      frenchName: 'Unknown',
      icon: '🌱',
      dailyWaterNeed: 2.5,
      wateringFrequencyDays: 2,
      germinationDays: 10,
      harvestDays: 60,
      sunExposure: 'full',
      tips: {
        permaculture: '',
        conventionnel: '',
        naturel: '',
        industriel: '',
      },
      commonIssues: [],
      seasonalAdvice: { spring: '', summer: '', autumn: '', winter: '' },
      fertilizerSchedule: { naturel: '', industriel: '' },
    };
  }

  return {
    frenchName: plantData.name || type,
    icon: meta.icon,
    dailyWaterNeed: meta.dailyWaterNeed,
    wateringFrequencyDays: meta.wateringFrequencyDays,
    germinationDays: meta.germinationDays,
    harvestDays: meta.harvestDays,
    sunExposure: meta.sunExposure,
    tips: plantData.tips || { permaculture: '', conventionnel: '', naturel: '', industriel: '' },
    commonIssues: plantData.commonIssues || [],
    seasonalAdvice: plantData.seasonalAdvice || { spring: '', summer: '', autumn: '', winter: '' },
    fertilizerSchedule: plantData.fertilizerSchedule || { naturel: '', industriel: '' },
  };
}

export function getPlantName(type: PlantType): string {
  return getPlantInfo(type).frenchName || type;
}

export function getPlantIcon(type: PlantType): string {
  return getPlantInfo(type).icon || '🌿';
}

export function getGrowthStage(daysSincePlanting: number, plantType: PlantType): {
  name: string;
  waterMultiplier: number;
  label: string;
} {
  const info = getPlantInfo(plantType);
  const lang = i18next.language || 'en';
  const translations = getTranslationData();
  const stages = translations.growthStages || {};

  if (daysSincePlanting < info.germinationDays) {
    return { name: 'germination', label: stages.germination || 'Germination', waterMultiplier: 0.5 };
  } else if (daysSincePlanting < info.germinationDays * 2.5) {
    return { name: 'seedling', label: stages.seedling || 'Seedling', waterMultiplier: 0.75 };
  } else if (daysSincePlanting < info.harvestDays * 0.65) {
    return { name: 'vegetative', label: stages.vegetative || 'Vegetative', waterMultiplier: 1.0 };
  } else {
    return { name: 'flowering', label: stages.flowering || 'Flowering/Harvest', waterMultiplier: 1.2 };
  }
}

// Regional average harvest per plant type (kg per plant per season)
export const REGIONAL_AVERAGES: Record<PlantType, number> = {
  tomato: 5,
  pepper: 2,
  zucchini: 8,
  cucumber: 4,
  lettuce: 0.5,
  carrot: 1.5,
  radish: 0.3,
  beans: 1.5,
  peas: 1,
  basil: 0.3,
  parsley: 0.2,
  mint: 0.2,
  strawberry: 1,
  potato: 4,
  onion: 2,
  garlic: 0.5,
  leek: 1.5,
  spinach: 0.5,
  chard: 1.5,
  beet: 2,
  broccoli: 1,
  corn: 1,
  sunflower: 0.5,
  other: 1,
};

// Backward compatibility - PLANT_DATABASE is deprecated, use getPlantInfo() instead
export const PLANT_DATABASE: Record<PlantType, PlantInfo> = new Proxy({}, {
  get: (target, prop) => {
    if (typeof prop === 'string' && PLANT_TYPES.includes(prop as PlantType)) {
      return getPlantInfo(prop as PlantType);
    }
    return undefined;
  },
}) as any;
