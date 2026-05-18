import { differenceInDays, parseISO, subDays, format } from 'date-fns';
import { Plant, PlantEntry, WeatherData, UserProfile, PlantMetrics, GardenMetrics } from '../types';
import { PLANT_DATABASE, getGrowthStage } from '../constants/plants';

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

function calculateWaterUsageEstimate(plant: Plant, daysAlive: number): number {
  const info = PLANT_DATABASE[plant.type];
  if (!info) return 0;

  const stage = getGrowthStage(daysAlive, plant.type);
  const baseDaily = info.dailyWaterNeed * stage.waterMultiplier;
  // Estimate: clamp to actual days lived
  return baseDaily * Math.min(daysAlive, 30);
}

/**
 * Calculate metrics for a single plant
 */
export function calculatePlantMetrics(
  plant: Plant,
  entries: PlantEntry[],
): PlantMetrics {
  const now = new Date();
  const daysAlive = differenceInDays(now, parseISO(plant.plantedDate));
  const info = PLANT_DATABASE[plant.type];

  // Harvest data
  const plantHarvests = entries.filter(e => e.plantId === plant.id && e.type === 'harvest');
  const totalHarvest = plantHarvests.reduce((sum, e) => {
    return sum + normalizeToKg(e.quantity ?? 0, e.unit ?? 'kg');
  }, 0);
  const harvestCount = plantHarvests.length;
  const averageYield = harvestCount > 0 ? totalHarvest / harvestCount : 0;

  // Productivity score (0-100): based on harvest rate and timeliness
  let productivityScore = 50; // baseline
  if (daysAlive > 0) {
    const expectedHarvests = Math.ceil(daysAlive / (info?.harvestDays ?? 60));
    const harvestRatio = expectedHarvests > 0 ? harvestCount / expectedHarvests : 0;
    productivityScore = Math.min(100, 50 + harvestRatio * 50);
  }

  // Health score (0-100): based on watering consistency and no stress indicators
  let healthScore = 80;
  if (!plant.lastWatered) {
    healthScore -= 20;
  } else {
    const daysSinceWatered = differenceInDays(now, parseISO(plant.lastWatered));
    if (info && daysSinceWatered > info.wateringFrequencyDays * 1.5) {
      healthScore -= 15;
    }
  }
  if (daysAlive < (info?.germinationDays ?? 5)) {
    healthScore = 70; // early stage
  }

  // Water efficiency: kg per liter
  const estimatedWaterUsed = calculateWaterUsageEstimate(plant, daysAlive);
  const waterEfficiency = estimatedWaterUsed > 0 ? totalHarvest / estimatedWaterUsed : 0;

  // Last and next harvest
  const lastHarvestEntry = plantHarvests.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())[0];
  const lastHarvestDate = lastHarvestEntry?.date;

  // Growth stage
  const stage = info ? getGrowthStage(daysAlive, plant.type) : null;
  let growthStage: 'germination' | 'seedling' | 'vegetative' | 'flowering' | 'mature' | 'declined' = 'vegetative';
  if (stage) {
    if (daysAlive < (info?.germinationDays ?? 5)) growthStage = 'germination';
    else if (daysAlive < (info?.germinationDays ?? 5) + 14) growthStage = 'seedling';
    else if (daysAlive < (info?.harvestDays ?? 60) * 0.6) growthStage = 'vegetative';
    else if (daysAlive < (info?.harvestDays ?? 60) * 0.85) growthStage = 'flowering';
    else if (harvestCount > 0) growthStage = 'mature';
    else growthStage = 'vegetative';
  }

  // Next expected harvest (rough estimate)
  let nextExpectedHarvest: string | undefined;
  if (lastHarvestDate) {
    const daysSinceLastHarvest = differenceInDays(now, parseISO(lastHarvestDate));
    const harvestFrequency = harvestCount > 1 ? daysAlive / harvestCount : info?.harvestDays ?? 60;
    const daysUntilNext = Math.max(1, Math.ceil(harvestFrequency - daysSinceLastHarvest));
    nextExpectedHarvest = format(subDays(now, -daysUntilNext), 'yyyy-MM-dd');
  } else if (info) {
    nextExpectedHarvest = format(subDays(now, -info.harvestDays), 'yyyy-MM-dd');
  }

  return {
    plantId: plant.id,
    plantName: plant.name,
    plantType: plant.type,
    totalHarvest: Math.round(totalHarvest * 100) / 100,
    harvestCount,
    averageYield: Math.round(averageYield * 100) / 100,
    daysAlive,
    productivityScore: Math.round(productivityScore),
    healthScore: Math.round(Math.max(0, Math.min(100, healthScore))),
    waterEfficiency: Math.round(waterEfficiency * 1000) / 1000,
    lastHarvestDate,
    nextExpectedHarvest,
    growthStage,
  };
}

/**
 * Calculate comprehensive garden metrics
 */
export function calculateGardenMetrics(
  plants: Plant[],
  entries: PlantEntry[],
  _weather: WeatherData | null,
  _profile: UserProfile | null,
): GardenMetrics {
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);

  // Calculate metrics for each plant
  const plantMetrics = plants.map(p => calculatePlantMetrics(p, entries));

  // Aggregate metrics
  const totalPlants = plants.length;
  const totalHarvest = plantMetrics.reduce((sum, m) => sum + m.totalHarvest, 0);

  // Water usage this month
  const currentMonthEntries = entries.filter(e => {
    try {
      return parseISO(e.date) >= thirtyDaysAgo;
    } catch {
      return false;
    }
  });
  let waterUsedCurrentMonth = 0;
  plants.forEach(plant => {
    const daysAlive = differenceInDays(now, parseISO(plant.plantedDate));
    const estimate = calculateWaterUsageEstimate(plant, Math.min(daysAlive, 30));
    waterUsedCurrentMonth += estimate;
  });

  const averageProductivityScore =
    totalPlants > 0 ? Math.round(plantMetrics.reduce((sum, m) => sum + m.productivityScore, 0) / totalPlants) : 0;
  const averageHealthScore =
    totalPlants > 0 ? Math.round(plantMetrics.reduce((sum, m) => sum + m.healthScore, 0) / totalPlants) : 0;
  const overallWaterEfficiency =
    waterUsedCurrentMonth > 0 ? Math.round((totalHarvest / waterUsedCurrentMonth) * 1000) / 1000 : 0;

  // Sort by productivity
  const sortedByProductivity = [...plantMetrics].sort((a, b) => b.productivityScore - a.productivityScore);
  const mostProductivePlants = sortedByProductivity.slice(0, 3);
  const leastProductivePlants = sortedByProductivity.slice(-3).reverse();

  // Seasonal productivity (assuming current season started ~3 months ago)
  const seasonalStart = subDays(now, 90);
  const seasonalHarvests = entries.filter(e => {
    try {
      return e.type === 'harvest' && parseISO(e.date) >= seasonalStart;
    } catch {
      return false;
    }
  });
  const seasonalProductivity = seasonalHarvests.reduce((sum, e) => {
    return sum + normalizeToKg(e.quantity ?? 0, e.unit ?? 'kg');
  }, 0);

  // Monthly production trend
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousMonthStart = subDays(currentMonthStart, 30);
  const previousMonthEnd = subDays(currentMonthStart, 1);

  const currentMonthProduction = entries.filter(e => {
    try {
      return e.type === 'harvest' && parseISO(e.date) >= currentMonthStart;
    } catch {
      return false;
    }
  }).reduce((sum, e) => sum + normalizeToKg(e.quantity ?? 0, e.unit ?? 'kg'), 0);

  const previousMonthProduction = entries.filter(e => {
    try {
      const d = parseISO(e.date);
      return e.type === 'harvest' && d >= previousMonthStart && d <= previousMonthEnd;
    } catch {
      return false;
    }
  }).reduce((sum, e) => sum + normalizeToKg(e.quantity ?? 0, e.unit ?? 'kg'), 0);

  let monthlyProductionTrend: 'up' | 'stable' | 'down' = 'stable';
  if (previousMonthProduction > 0) {
    const ratio = currentMonthProduction / previousMonthProduction;
    if (ratio > 1.1) monthlyProductionTrend = 'up';
    else if (ratio < 0.9) monthlyProductionTrend = 'down';
  }

  return {
    totalPlants,
    totalHarvest: Math.round(totalHarvest * 100) / 100,
    waterUsedCurrentMonth: Math.round(waterUsedCurrentMonth),
    averageProductivityScore,
    averageHealthScore,
    overallWaterEfficiency,
    mostProductivePlants,
    leastProductivePlants,
    plantsByProductivity: sortedByProductivity,
    seasonalProductivity: Math.round(seasonalProductivity * 100) / 100,
    monthlyProductionTrend,
  };
}

/**
 * Get the top N most productive plants
 */
export function getMostProductivePlants(metrics: GardenMetrics, limit: number = 5): PlantMetrics[] {
  return metrics.plantsByProductivity.slice(0, limit);
}

/**
 * Analyze watering trend over last N days
 */
export function getWateringTrend(entries: PlantEntry[], days: number = 30): {
  averageDailyWater: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  totalWaterUsed: number;
} {
  const now = new Date();
  const startDate = subDays(now, days);

  const relevantEntries = entries.filter(e => {
    try {
      const d = parseISO(e.date);
      return d >= startDate;
    } catch {
      return false;
    }
  });

  // Estimate water usage from plant watering records
  let totalEstimatedWater = 0;
  const weeks: { [weekIndex: number]: number } = {};

  relevantEntries.forEach(e => {
    try {
      const d = parseISO(e.date);
      const weekIndex = Math.floor(differenceInDays(now, d) / 7);
      if (!weeks[weekIndex]) weeks[weekIndex] = 0;
      // Rough estimate: 5L per watering event
      weeks[weekIndex] += 5;
      totalEstimatedWater += 5;
    } catch {
      // skip
    }
  });

  const averageDailyWater = days > 0 ? totalEstimatedWater / days : 0;

  // Trend: compare first half vs second half
  const weekKeys = Object.keys(weeks).map(Number).sort();
  const midpoint = weekKeys.length / 2;
  const firstHalfSum = weekKeys.slice(0, Math.ceil(midpoint)).reduce((sum, k) => sum + weeks[k], 0);
  const secondHalfSum = weekKeys.slice(Math.ceil(midpoint)).reduce((sum, k) => sum + weeks[k], 0);

  let trend: 'increasing' | 'stable' | 'decreasing' = 'stable';
  if (firstHalfSum > 0 && secondHalfSum > firstHalfSum * 1.1) trend = 'increasing';
  else if (firstHalfSum > 0 && secondHalfSum < firstHalfSum * 0.9) trend = 'decreasing';

  return {
    averageDailyWater: Math.round(averageDailyWater * 10) / 10,
    trend,
    totalWaterUsed: Math.round(totalEstimatedWater),
  };
}

/**
 * Analyze seasonal productivity patterns
 */
export function getSeasonalProductivity(
  entries: PlantEntry[],
  _weather: WeatherData | null,
): {
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  production: number;
  percentageOfAnnual: number;
} {
  const now = new Date();
  const month = now.getMonth();

  let season: 'spring' | 'summer' | 'autumn' | 'winter';
  if (month >= 2 && month < 5) season = 'spring';
  else if (month >= 5 && month < 8) season = 'summer';
  else if (month >= 8 && month < 11) season = 'autumn';
  else season = 'winter';

  // Get production for current season (3 months)
  const seasonStart = subDays(now, 90);
  const seasonProduction = entries.filter(e => {
    try {
      return e.type === 'harvest' && parseISO(e.date) >= seasonStart;
    } catch {
      return false;
    }
  }).reduce((sum, e) => sum + normalizeToKg(e.quantity ?? 0, e.unit ?? 'kg'), 0);

  // Get annual production
  const annualStart = new Date(now.getFullYear(), 0, 1);
  const annualProduction = entries.filter(e => {
    try {
      return e.type === 'harvest' && parseISO(e.date) >= annualStart;
    } catch {
      return false;
    }
  }).reduce((sum, e) => sum + normalizeToKg(e.quantity ?? 0, e.unit ?? 'kg'), 0);

  const percentageOfAnnual = annualProduction > 0 ? Math.round((seasonProduction / annualProduction) * 100) : 0;

  return {
    season,
    production: Math.round(seasonProduction * 100) / 100,
    percentageOfAnnual,
  };
}
