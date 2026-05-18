import { PlantEntry, Plant, WeatherData, StatsData } from '../types';
import { PLANT_DATABASE } from '../constants/plants';
import { format, parseISO, differenceInDays, subMonths } from 'date-fns';

// Regional average harvest per plant type (kg per plant per season)
const REGIONAL_AVERAGES: Record<string, number> = {
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

function normalizeToKg(quantity: number, unit: 'kg' | 'g' | 'pièces'): number {
  switch (unit) {
    case 'kg':
      return quantity;
    case 'g':
      return quantity / 1000;
    case 'pièces':
      // rough average weight per item: 0.15 kg
      return quantity * 0.15;
    default:
      return quantity;
  }
}

export function calculateStats(
  entries: PlantEntry[],
  plants: Plant[],
  weather: WeatherData | null,
): StatsData {
  const harvestEntries = entries.filter(e => e.type === 'harvest');

  // --- totalHarvest: kg per plantId ---
  const totalHarvest: { [plantId: string]: number } = {};
  for (const entry of harvestEntries) {
    const qty = entry.quantity ?? 0;
    const unit = entry.unit ?? 'kg';
    const kg = normalizeToKg(qty, unit);
    totalHarvest[entry.plantId] = (totalHarvest[entry.plantId] ?? 0) + kg;
  }

  // --- monthlyProduction: total kg per YYYY-MM ---
  const monthlyProduction: { [yearMonth: string]: number } = {};
  for (const entry of harvestEntries) {
    try {
      const ym = format(parseISO(entry.date), 'yyyy-MM');
      const qty = entry.quantity ?? 0;
      const unit = entry.unit ?? 'kg';
      const kg = normalizeToKg(qty, unit);
      monthlyProduction[ym] = (monthlyProduction[ym] ?? 0) + kg;
    } catch {
      // skip malformed dates
    }
  }

  // --- waterConsumption: estimate L/month based on plant water needs ---
  let waterConsumption = 0;
  const now = new Date();
  for (const plant of plants) {
    const info = PLANT_DATABASE[plant.type];
    if (!info) continue;
    const daysAlive = Math.min(30, Math.max(0, differenceInDays(now, parseISO(plant.plantedDate))));
    // dailyWaterNeed is in L/day
    waterConsumption += info.dailyWaterNeed * daysAlive;
  }

  // --- healthScore: 0–100 composite ---
  let healthScore = 100;

  // Penalty: plants watered too infrequently (> 1.5x their schedule)
  for (const plant of plants) {
    if (!plant.lastWatered) {
      healthScore -= 5;
      continue;
    }
    const info = PLANT_DATABASE[plant.type];
    const daysSinceWater = differenceInDays(now, parseISO(plant.lastWatered));
    if (daysSinceWater > info.wateringFrequencyDays * 1.5) {
      healthScore -= 8;
    }
  }

  // Bonus: recent harvests indicate active, productive garden
  const recentHarvests = harvestEntries.filter(e => {
    try {
      return differenceInDays(now, parseISO(e.date)) <= 30;
    } catch {
      return false;
    }
  });
  healthScore += Math.min(20, recentHarvests.length * 4);

  // Weather penalty: extreme heat or cold
  if (weather) {
    if (weather.temperature > 35 || weather.temperature < 0) {
      healthScore -= 10;
    }
  }

  healthScore = Math.max(0, Math.min(100, healthScore));

  // --- productivityTrend: compare last 30 days vs previous 30 days ---
  const now30 = now;
  const start30 = subMonths(now, 1);
  const start60 = subMonths(now, 2);

  let recent30 = 0;
  let prev30 = 0;

  for (const entry of harvestEntries) {
    try {
      const d = parseISO(entry.date);
      const kg = normalizeToKg(entry.quantity ?? 0, entry.unit ?? 'kg');
      if (d >= start30 && d <= now30) recent30 += kg;
      else if (d >= start60 && d < start30) prev30 += kg;
    } catch {
      // skip
    }
  }

  let productivityTrend: 'up' | 'stable' | 'down' = 'stable';
  if (recent30 > prev30 * 1.1) productivityTrend = 'up';
  else if (recent30 < prev30 * 0.9) productivityTrend = 'down';

  return {
    totalHarvest,
    monthlyProduction,
    waterConsumption: Math.round(waterConsumption),
    healthScore: Math.round(healthScore),
    productivityTrend,
  };
}

/** Returns regional average yield (kg) for a plant type */
export function getRegionalAverage(plantType: string): number {
  return REGIONAL_AVERAGES[plantType] ?? 1;
}

/** Returns last N months as YYYY-MM strings (oldest first) */
export function getLastNMonths(n: number): string[] {
  const now = new Date();
  const months: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    months.push(format(subMonths(now, i), 'yyyy-MM'));
  }
  return months;
}
