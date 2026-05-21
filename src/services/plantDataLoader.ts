import i18next from '../i18n/config';
import type { PlantType } from '../types';

const plantDataCache: Record<string, any> = {};

async function loadPlantData(language: string) {
  const cacheKey = `plants-${language}`;

  if (plantDataCache[cacheKey]) {
    return plantDataCache[cacheKey];
  }

  try {
    let plantData;

    if (language === 'fr') {
      plantData = await import('../i18n/plants-data/fr.json');
    } else if (language === 'es') {
      plantData = await import('../i18n/plants-data/es.json');
    } else {
      plantData = await import('../i18n/plants-data/en.json');
    }

    plantDataCache[cacheKey] = plantData.default || plantData;
    return plantDataCache[cacheKey];
  } catch (error) {
    console.error(`Failed to load plant data for language: ${language}`, error);
    // Fallback to English
    const fallback = await import('../i18n/plants-data/en.json');
    return fallback.default || fallback;
  }
}

export async function getTranslatedPlantInfo(type: PlantType) {
  const currentLanguage = i18next.language || 'en';
  const plantData = await loadPlantData(currentLanguage);
  return plantData[type];
}

export async function getTranslatedPlantName(type: PlantType): Promise<string> {
  const info = await getTranslatedPlantInfo(type);
  return info?.name || type;
}

export async function getGrowthStageLabel(stageName: string): Promise<string> {
  const currentLanguage = i18next.language || 'en';
  const plantData = await loadPlantData(currentLanguage);
  const stages = plantData.growthStages || {};
  return stages[stageName] || stageName;
}
