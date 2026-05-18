import { PlantEntry, Plant, WeatherData, StatsData, GardenChartData } from '../types';
import { PLANT_DATABASE, getGrowthStage } from '../constants/plants';
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

/**
 * Calculate time-series data for charts from plant entries
 */
export function calculateTimeSeriesData(
  entries: PlantEntry[],
  plants: Plant[],
  _weather: WeatherData | null,
): GardenChartData {
  const now = new Date();

  // --- Monthly Production (last 12 months) ---
  const monthlyProduction: { date: string; value: number; label?: string }[] = [];
  const lastMonths = getLastNMonths(12);
  lastMonths.forEach(yearMonth => {
    const production = (PLANT_DATABASE[plants[0]?.type] ? 1 : 0) in entries ? 0 : 0;
    const harvestTotal = entries
      .filter(e => {
        try {
          return e.type === 'harvest' && format(parseISO(e.date), 'yyyy-MM') === yearMonth;
        } catch {
          return false;
        }
      })
      .reduce((sum, e) => sum + normalizeToKg(e.quantity ?? 0, e.unit ?? 'kg'), 0);

    monthlyProduction.push({
      date: yearMonth,
      value: Math.round(harvestTotal * 100) / 100,
      label: format(parseISO(yearMonth + '-01'), 'MMM yyyy'),
    });
  });

  // --- Weekly Water Usage (last 8 weeks) ---
  const weeklyWaterUsage: { date: string; value: number; label?: string }[] = [];
  for (let i = 7; i >= 0; i--) {
    const weekStart = subMonths(now, 0); // placeholder for week calculation
    const weekStartFormatted = format(subMonths(now, Math.floor(i / 4)), 'yyyy-ww');
    // Rough estimate: 5L per watering entry
    const waterEstimate = entries
      .filter(e => {
        try {
          const d = parseISO(e.date);
          return (
            (e.type === 'note' || e.type === 'harvest') &&
            differenceInDays(now, d) >= i * 7 &&
            differenceInDays(now, d) < (i + 1) * 7
          );
        } catch {
          return false;
        }
      })
      .reduce((sum) => sum + 5, 0);

    weeklyWaterUsage.push({
      date: weekStartFormatted,
      value: waterEstimate,
      label: `Semaine ${8 - i}`,
    });
  }

  // --- Health Trend (estimated from entries, lower granularity) ---
  const healthTrend: { date: string; value: number; label?: string }[] = [];
  const lastDays = 60;
  for (let dayOffset = lastDays; dayOffset >= 0; dayOffset -= 10) {
    const checkDate = subMonths(now, Math.floor(dayOffset / 30));
    let healthScore = 100;

    // Penalty: plants not watered
    plants.forEach(plant => {
      if (!plant.lastWatered) {
        healthScore -= 5;
      } else {
        const daysSinceWater = differenceInDays(checkDate, parseISO(plant.lastWatered));
        const info = PLANT_DATABASE[plant.type];
        if (info && daysSinceWater > info.wateringFrequencyDays * 1.5) {
          healthScore -= 8;
        }
      }
    });

    // Bonus: recent harvest
    const recentHarvests = entries.filter(e => {
      try {
        const d = parseISO(e.date);
        return e.type === 'harvest' && differenceInDays(checkDate, d) <= 10;
      } catch {
        return false;
      }
    });
    healthScore += Math.min(20, recentHarvests.length * 4);

    healthScore = Math.max(0, Math.min(100, healthScore));

    healthTrend.push({
      date: format(checkDate, 'yyyy-MM-dd'),
      value: Math.round(healthScore),
      label: format(checkDate, 'dd MMM'),
    });
  }

  // --- Productivity by Plant Type ---
  const productivityByType: { [plantType: string]: number } = {};
  entries.forEach(e => {
    if (e.type === 'harvest') {
      const plant = plants.find(p => p.id === e.plantId);
      if (plant) {
        const kg = normalizeToKg(e.quantity ?? 0, e.unit ?? 'kg');
        productivityByType[plant.type] = (productivityByType[plant.type] ?? 0) + kg;
      }
    }
  });

  // --- Water Usage by Month ---
  const waterUsageByMonth: { date: string; value: number; label?: string }[] = [];
  lastMonths.forEach(yearMonth => {
    let monthWaterEstimate = 0;
    plants.forEach(plant => {
      try {
        const plantedDate = parseISO(plant.plantedDate);
        const monthDate = parseISO(yearMonth + '-01');
        const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
        if (format(plantedDate, 'yyyy-MM') <= yearMonth) {
          const info = PLANT_DATABASE[plant.type];
          if (info) {
            const daysAlive = differenceInDays(monthDate, plantedDate);
            const stage = info; // placeholder; full impl would use getGrowthStage
            monthWaterEstimate += info.dailyWaterNeed * Math.min(daysInMonth, 30);
          }
        }
      } catch {
        // skip
      }
    });

    waterUsageByMonth.push({
      date: yearMonth,
      value: Math.round(monthWaterEstimate),
      label: format(parseISO(yearMonth + '-01'), 'MMM yyyy'),
    });
  });

  return {
    monthlyProduction,
    weeklyWaterUsage,
    healthTrend,
    productivityByType,
    waterUsageByMonth,
  };
}
