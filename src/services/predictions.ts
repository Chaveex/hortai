import { differenceInDays, parseISO, addDays, subDays, format } from 'date-fns';
import i18next from '../i18n/config';
import { Plant, PlantEntry, WeatherData, UserProfile, Predictions } from '../types';
import { PLANT_DATABASE, getGrowthStage } from '../constants/plants';
import { calculatePlantMetrics } from './gardenMetrics';

function t(key: string, options?: Record<string, any>): string {
  return i18next.t(key, options) as string;
}

function normalizeToKg(quantity: number, unit: 'kg' | 'g' | 'pièces'): number {
  switch (unit) {
    case 'kg':
      return quantity;
    case 'g':
      return quantity / 1000;
    case 'pièces':
      return quantity * 0.15;
    default:
      return quantity;
  }
}

/**
 * Predict next harvest dates for plants
 */
export function predictNextHarvests(
  plants: Plant[],
  entries: PlantEntry[],
  _weather: WeatherData | null,
): Predictions['nextHarvestPlants'] {
  const now = new Date();
  const predictions: Predictions['nextHarvestPlants'] = [];

  plants.forEach(plant => {
    const info = PLANT_DATABASE[plant.type];
    if (!info) return;

    const daysAlive = differenceInDays(now, parseISO(plant.plantedDate));

    // Find last harvest
    const plantHarvests = entries
      .filter(e => e.plantId === plant.id && e.type === 'harvest')
      .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

    let nextHarvestDate: Date;

    if (plantHarvests.length === 0) {
      // No harvest yet: estimate based on germination + harvest days
      const totalDaysToFirstHarvest = (info.germinationDays || 5) + (info.harvestDays || 60);
      nextHarvestDate = addDays(now, Math.max(1, totalDaysToFirstHarvest - daysAlive));
    } else {
      // Has been harvested: estimate cycle time
      const lastHarvestDate = parseISO(plantHarvests[0].date);
      const daysSinceLastHarvest = differenceInDays(now, lastHarvestDate);

      // For most vegetables, harvest cycle is similar to initial harvest days
      // but continuous harvesting (e.g., tomatoes) might be shorter
      const harvestCycle =
        plantHarvests.length > 1
          ? daysAlive / plantHarvests.length // average days between harvests
          : info.harvestDays * 0.7; // for continuous harvesters, expect 30% shorter cycle

      nextHarvestDate = addDays(lastHarvestDate, Math.max(2, Math.ceil(harvestCycle)));
    }

    // Clamp to at least today
    if (nextHarvestDate < now) {
      nextHarvestDate = addDays(now, 1);
    }

    predictions.push({
      plantId: plant.id,
      plantName: plant.name,
      date: format(nextHarvestDate, 'yyyy-MM-dd'),
    });
  });

  return predictions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Predict seasonal forecast
 */
export function predictSeasonalForecast(
  profile: UserProfile | null,
  weather: WeatherData | null,
  plants: Plant[],
): Predictions['seasonalForecast'] {
  const now = new Date();
  const seasonEnd = addDays(now, 90); // assume 3 months left in season
  const daysLeft = differenceInDays(seasonEnd, now);

  // Estimate remaining production
  let expectedTotalProduction = 0;
  let estimatedWaterNeeded = 0;

  plants.forEach(plant => {
    const info = PLANT_DATABASE[plant.type];
    if (!info) return;

    const daysAlive = differenceInDays(now, parseISO(plant.plantedDate));
    const stage = getGrowthStage(daysAlive, plant.type);

    // Estimate yield if plant continues to harvest through season
    const remainingHarvestCycles = daysLeft / (info.harvestDays || 60);
    const estimatedYield = (info.frenchName === 'Tomate' ? 5 : info.frenchName === 'Courgette' ? 8 : 2) * Math.max(0.5, remainingHarvestCycles);
    expectedTotalProduction += estimatedYield;

    // Estimate water needed
    const baseDaily = info.dailyWaterNeed * stage.waterMultiplier;
    estimatedWaterNeeded += baseDaily * daysLeft;
  });

  const riskFactors: string[] = [];
  const recommendations: string[] = [];

  // Weather-based risks and recommendations
  if (weather) {
    if (weather.temperature > 30) {
      riskFactors.push(t('predictions.riskExcessiveHeat'));
      recommendations.push(t('predictions.recommendIncreaseWatering'));
    }
    if (weather.humidity < 40) {
      riskFactors.push(t('predictions.riskDryAir'));
      recommendations.push(t('predictions.recommendMulch'));
    }
    if (weather.temperature < 10) {
      riskFactors.push(t('predictions.riskFrost'));
      recommendations.push(t('predictions.recommendFrostProtection'));
    }
  }

  // Style-based recommendations
  if (profile?.gardeningStyle === 'permaculture') {
    recommendations.push(t('predictions.recommendPermacultureMulch'));
  }
  if (profile?.gardeningStyle === 'hydroponique') {
    recommendations.push(t('predictions.recommendHydroponicCheck'));
  }

  if (plants.length === 0) {
    recommendations.push(t('predictions.recommendPlantMore'));
  }

  return {
    expectedTotalProduction: Math.round(expectedTotalProduction * 100) / 100,
    estimatedWaterNeeded: Math.round(estimatedWaterNeeded),
    riskFactors,
    recommendations: recommendations.slice(0, 5),
  };
}

/**
 * Predict water needs for coming weeks
 */
export function predictWaterNeeds(
  plants: Plant[],
  weather: WeatherData | null,
): Predictions['waterForecast'] {
  const now = new Date();

  let nextWeekUsage = 0;
  let nextMonthUsage = 0;

  plants.forEach(plant => {
    const info = PLANT_DATABASE[plant.type];
    if (!info) return;

    const daysAlive = differenceInDays(now, parseISO(plant.plantedDate));
    const stage = getGrowthStage(daysAlive, plant.type);
    let baseDaily = info.dailyWaterNeed * stage.waterMultiplier;

    // Adjust for weather
    if (weather) {
      if (weather.temperature >= 35) baseDaily *= 1.6;
      else if (weather.temperature >= 28) baseDaily *= 1.3;
      else if (weather.temperature < 10) baseDaily *= 0.5;

      if (weather.humidity <= 35) baseDaily *= 1.2;
      else if (weather.humidity >= 75) baseDaily *= 0.8;
    }

    // 7-day forecast
    nextWeekUsage += baseDaily * 7;

    // 30-day forecast
    nextMonthUsage += baseDaily * 30;
  });

  return {
    nextWeekUsage: Math.round(nextWeekUsage),
    nextMonthUsage: Math.round(nextMonthUsage),
  };
}

/**
 * Identify health risks in plants
 */
export function identifyHealthRisks(
  plants: Plant[],
  weather: WeatherData | null,
  entries: PlantEntry[],
): Predictions['healthRisks'] {
  const now = new Date();
  const risks: Predictions['healthRisks'] = [];

  plants.forEach(plant => {
    const info = PLANT_DATABASE[plant.type];
    if (!info) return;

    const daysAlive = differenceInDays(now, parseISO(plant.plantedDate));
    const metrics = calculatePlantMetrics(plant, entries);

    // Health score risk
    if (metrics.healthScore < 50) {
      risks.push({
        plantId: plant.id,
        plantName: plant.name,
        riskLevel: 'high',
        description: t('predictions.healthLow', { score: metrics.healthScore }),
        mitigation: t('predictions.healthLowMitigation'),
      });
    } else if (metrics.healthScore < 70) {
      risks.push({
        plantId: plant.id,
        plantName: plant.name,
        riskLevel: 'medium',
        description: t('predictions.healthMedium', { score: metrics.healthScore }),
        mitigation: t('predictions.healthMediumMitigation'),
      });
    }

    // Watering risk
    if (plant.lastWatered) {
      const daysSinceWatered = differenceInDays(now, parseISO(plant.lastWatered));
      if (daysSinceWatered > info.wateringFrequencyDays * 2) {
        risks.push({
          plantId: plant.id,
          plantName: plant.name,
          riskLevel: 'high',
          description: t('predictions.wateringOverdue', { days: daysSinceWatered, threshold: info.wateringFrequencyDays * 2 }),
          mitigation: t('predictions.wateringOverdueMitigation'),
        });
      }
    } else if (daysAlive > info.wateringFrequencyDays) {
      risks.push({
        plantId: plant.id,
        plantName: plant.name,
        riskLevel: 'high',
        description: t('predictions.wateringNever'),
        mitigation: t('predictions.wateringNeverMitigation'),
      });
    }

    // Weather-related risks
    if (weather) {
      if (weather.temperature > 35 && info.sunExposure === 'partial') {
        risks.push({
          plantId: plant.id,
          plantName: plant.name,
          riskLevel: 'medium',
          description: t('predictions.heatWave', { temperature: weather.temperature }),
          mitigation: t('predictions.heatWaveMitigation'),
        });
      }

      if (weather.temperature < 5 && info.harvestDays < 70) {
        // assuming shorter season = more heat-loving
        risks.push({
          plantId: plant.id,
          plantName: plant.name,
          riskLevel: 'medium',
          description: t('predictions.coldRisk', { temperature: weather.temperature }),
          mitigation: t('predictions.coldRiskMitigation'),
        });
      }

      // Disease risk from humidity
      if (weather.humidity > 85 && (info.commonIssues.includes('Mildiou') || info.commonIssues.includes('Botrytis'))) {
        risks.push({
          plantId: plant.id,
          plantName: plant.name,
          riskLevel: 'medium',
          description: t('predictions.humidityRisk', { humidity: weather.humidity }),
          mitigation: t('predictions.humidityRiskMitigation'),
        });
      }
    }

    // Common issues
    if (info.commonIssues.length > 0 && daysAlive > (info.germinationDays || 5) + 14) {
      // Plant is mature enough to show typical issues
      risks.push({
        plantId: plant.id,
        plantName: plant.name,
        riskLevel: 'low',
        description: t('predictions.commonIssuesRisk', { issues: info.commonIssues.slice(0, 2).join(', ') }),
        mitigation: t('predictions.commonIssuesMitigation'),
      });
    }
  });

  // Sort by risk level
  const riskOrder = { high: 0, medium: 1, low: 2 };
  risks.sort((a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel]);

  return risks.slice(0, 10); // Cap at 10 risks
}

/**
 * Generate comprehensive predictions
 */
export function generatePredictions(
  plants: Plant[],
  entries: PlantEntry[],
  weather: WeatherData | null,
  profile: UserProfile | null,
): Predictions {
  const nextHarvestPlants = predictNextHarvests(plants, entries, weather);
  const nextHarvestDate = nextHarvestPlants.length > 0 ? nextHarvestPlants[0].date : format(addDays(new Date(), 30), 'yyyy-MM-dd');

  return {
    nextHarvestDate,
    nextHarvestPlants,
    seasonalForecast: predictSeasonalForecast(profile, weather, plants),
    waterForecast: predictWaterNeeds(plants, weather),
    healthRisks: identifyHealthRisks(plants, weather, entries),
  };
}
