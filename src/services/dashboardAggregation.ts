import { PlantEntry, Plant, WeatherData, PlantType, TimeSeriesDataPoint, BarChartDataPoint } from '../types';
import { PLANT_DATABASE } from '../constants/plants';
import { format, parseISO, differenceInDays, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';

// Regional average harvest per plant type (kg per plant per season)
const REGIONAL_AVERAGES: Record<string, number> = {
  tomato: 5, pepper: 2, zucchini: 8, cucumber: 4, lettuce: 0.5,
  carrot: 1.5, radish: 0.3, beans: 1.5, peas: 1, basil: 0.3,
  parsley: 0.2, mint: 0.2, strawberry: 1, potato: 4, onion: 2,
  garlic: 0.5, leek: 1.5, spinach: 0.5, chard: 1.5, beet: 2,
  broccoli: 1, corn: 1, sunflower: 0.5, other: 1,
};

function normalizeToKg(quantity: number, unit: 'kg' | 'g' | 'pièces'): number {
  switch (unit) {
    case 'kg': return quantity;
    case 'g': return quantity / 1000;
    case 'pièces': return quantity * 0.15;
    default: return quantity;
  }
}

export interface DateRange {
  start: string;
  end: string;
}

export interface ProductionData {
  totalKg: number;
  avgPerPlant: number;
  dailyTrend: TimeSeriesDataPoint[];
  byType: { type: PlantType; kg: number }[];
  topMonth: { yearMonth: string; kg: number };
  trendDirection: 'up' | 'stable' | 'down';
  chart: BarChartDataPoint[];
}

export interface WaterData {
  totalL: number;
  avgDailyL: number;
  regionAvgL: number;
  percentOfRegional: number;
  dailyUsage: TimeSeriesDataPoint[];
  byPlant: { plantName: string; L: number }[];
  recommendations: string[];
}

export interface HealthData {
  currentScore: number;
  factors: {
    hydration: number;
    production: number;
    nutrients: number;
    health: number;
    diversity: number;
  };
  dailyHeatmap: TimeSeriesDataPoint[];
  alerts: { severity: 'warning' | 'info'; message: string }[];
  history30Days: TimeSeriesDataPoint[];
}

export interface ComparisonData {
  plants: Array<{
    name: string;
    harvest: number;
    waterEfficiency: number;
    vsRegional: number; // percentage
    status: 'excellent' | 'good' | 'warning';
  }>;
}

export function getProductionData(
  entries: PlantEntry[],
  plants: Plant[],
  dateRange: DateRange,
  plantTypes?: PlantType[],
): ProductionData {
  const harvestEntries = entries.filter(e => {
    if (e.type !== 'harvest') return false;
    try {
      const d = parseISO(e.date);
      const start = parseISO(dateRange.start);
      const end = parseISO(dateRange.end);
      return d >= start && d <= end;
    } catch {
      return false;
    }
  });

  const filteredEntries = plantTypes
    ? harvestEntries.filter(e => {
      const p = plants.find(plant => plant.id === e.plantId);
      return p && plantTypes.includes(p.type);
    })
    : harvestEntries;

  // Total KG
  let totalKg = 0;
  filteredEntries.forEach(e => {
    const qty = e.quantity ?? 0;
    const unit = e.unit ?? 'kg';
    totalKg += normalizeToKg(qty, unit);
  });

  // Avg per plant
  const activePlants = plants.length || 1;
  const avgPerPlant = totalKg / activePlants;

  // By type distribution
  const byTypeMap: Record<string, number> = {};
  filteredEntries.forEach(e => {
    const p = plants.find(plant => plant.id === e.plantId);
    if (p) {
      const qty = e.quantity ?? 0;
      const unit = e.unit ?? 'kg';
      const kg = normalizeToKg(qty, unit);
      byTypeMap[p.type] = (byTypeMap[p.type] ?? 0) + kg;
    }
  });

  const byType = Object.entries(byTypeMap).map(([type, kg]) => ({
    type: type as PlantType,
    kg: parseFloat(kg.toFixed(2)),
  }));

  // Top month
  const monthlyProduction: Record<string, number> = {};
  filteredEntries.forEach(e => {
    try {
      const ym = format(parseISO(e.date), 'yyyy-MM');
      const qty = e.quantity ?? 0;
      const unit = e.unit ?? 'kg';
      const kg = normalizeToKg(qty, unit);
      monthlyProduction[ym] = (monthlyProduction[ym] ?? 0) + kg;
    } catch {
      // skip
    }
  });

  const topMonth = Object.entries(monthlyProduction).reduce(
    (max, [month, kg]) => (kg > max.kg ? { yearMonth: month, kg } : max),
    { yearMonth: '', kg: 0 },
  );

  // Daily trend
  const dailyProduction: Record<string, number> = {};
  filteredEntries.forEach(e => {
    const day = format(parseISO(e.date), 'yyyy-MM-dd');
    const qty = e.quantity ?? 0;
    const unit = e.unit ?? 'kg';
    const kg = normalizeToKg(qty, unit);
    dailyProduction[day] = (dailyProduction[day] ?? 0) + kg;
  });

  const dailyTrend = Object.entries(dailyProduction)
    .map(([date, value]) => ({
      date,
      value: parseFloat(value.toFixed(2)),
      label: format(parseISO(date), 'dd MMM'),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Trend direction (compare first vs second half)
  const mid = Math.floor(dailyTrend.length / 2);
  const firstHalf = dailyTrend.slice(0, mid).reduce((s, d) => s + d.value, 0);
  const secondHalf = dailyTrend.slice(mid).reduce((s, d) => s + d.value, 0);
  let trendDirection: 'up' | 'stable' | 'down' = 'stable';
  if (secondHalf > firstHalf * 1.1) trendDirection = 'up';
  else if (secondHalf < firstHalf * 0.9) trendDirection = 'down';

  // Chart data (6-month bars)
  const chart: BarChartDataPoint[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const m = subMonths(now, i);
    const ym = format(m, 'yyyy-MM');
    const value = monthlyProduction[ym] ?? 0;
    chart.push({
      label: format(m, 'MMM'),
      value: parseFloat(value.toFixed(1)),
    });
  }

  return {
    totalKg: parseFloat(totalKg.toFixed(2)),
    avgPerPlant: parseFloat(avgPerPlant.toFixed(2)),
    dailyTrend,
    byType,
    topMonth,
    trendDirection,
    chart,
  };
}

export function getWaterData(
  plants: Plant[],
  entries: PlantEntry[],
  weather: WeatherData | null,
  dateRange: DateRange,
): WaterData {
  // Estimate water usage from plant data
  let totalL = 0;
  const plantWaterMap: Record<string, number> = {};
  let daysInRange = 30;

  try {
    const start = parseISO(dateRange.start);
    const end = parseISO(dateRange.end);
    daysInRange = differenceInDays(end, start) + 1;

    plants.forEach(p => {
      const info = PLANT_DATABASE[p.type];
      if (!info) return;

      const plantedDate = parseISO(p.plantedDate);
      const rangeStart = start > plantedDate ? start : plantedDate;
      const daysAlive = Math.max(0, differenceInDays(end, rangeStart) + 1);
      const daysClamped = Math.min(daysAlive, daysInRange);

      const waterUsed = info.dailyWaterNeed * daysClamped;
      totalL += waterUsed;
      plantWaterMap[p.name] = waterUsed;
    });
  } catch {
    // fallback to 30 days
  }

  const avgDailyL = daysInRange > 0 ? parseFloat((totalL / daysInRange).toFixed(2)) : 0;
  const regionAvgL = plants.length * 10; // rough estimate: 10L/plant/month
  const percentOfRegional = regionAvgL > 0 ? parseFloat(((totalL / regionAvgL) * 100).toFixed(1)) : 0;

  // Daily usage trend
  const dailyUsage: TimeSeriesDataPoint[] = [];
  try {
    const start = parseISO(dateRange.start);
    const end = parseISO(dateRange.end);
    let current = new Date(start);
    while (current <= end) {
      const day = format(current, 'yyyy-MM-dd');
      let dayL = 0;
      plants.forEach(p => {
        const info = PLANT_DATABASE[p.type];
        if (info) dayL += info.dailyWaterNeed;
      });
      if (dayL > 0) {
        dailyUsage.push({
          date: day,
          value: parseFloat(dayL.toFixed(2)),
          label: format(current, 'dd MMM'),
        });
      }
      current = new Date(current.getTime() + 24 * 60 * 60 * 1000);
    }
  } catch {
    // skip
  }

  // By plant breakdown
  const byPlant = Object.entries(plantWaterMap)
    .map(([name, L]) => ({ plantName: name, L: parseFloat(L.toFixed(2)) }))
    .sort((a, b) => b.L - a.L)
    .slice(0, 5);

  // Recommendations
  const recommendations: string[] = [];
  if (percentOfRegional > 150) {
    recommendations.push('Consommation élevée : vérifier l\'irrigation');
  }
  if (weather && weather.description.toLowerCase().includes('rain')) {
    recommendations.push('Pluie prévue : réduire l\'arrosage');
  }
  if (weather && weather.temperature > 30) {
    recommendations.push('Chaleur élevée : augmenter la fréquence d\'arrosage');
  }

  return {
    totalL: parseFloat(totalL.toFixed(1)),
    avgDailyL,
    regionAvgL: parseFloat(regionAvgL.toFixed(1)),
    percentOfRegional,
    dailyUsage,
    byPlant,
    recommendations,
  };
}

export function getHealthData(
  plants: Plant[],
  entries: PlantEntry[],
  weather: WeatherData | null,
): HealthData {
  const now = new Date();

  // Hydration: check watering frequency
  let hydrationScore = 100;
  plants.forEach(p => {
    if (!p.lastWatered) {
      hydrationScore -= 5;
    } else {
      const info = PLANT_DATABASE[p.type];
      const daysSince = differenceInDays(now, parseISO(p.lastWatered));
      if (daysSince > info.wateringFrequencyDays * 1.5) {
        hydrationScore -= 10;
      } else if (daysSince > info.wateringFrequencyDays) {
        hydrationScore -= 5;
      }
    }
  });
  hydrationScore = Math.max(0, Math.min(100, hydrationScore));

  // Production: recent harvests
  let productionScore = 50;
  const harvestEntries = entries.filter(e => e.type === 'harvest');
  const recentHarvests = harvestEntries.filter(e => {
    try {
      return differenceInDays(now, parseISO(e.date)) <= 30;
    } catch {
      return false;
    }
  });
  productionScore = Math.min(100, 50 + recentHarvests.length * 5);

  // Nutrients: simplified (assume good if active)
  const nutrientScore = recentHarvests.length > 0 ? 80 : 60;

  // Health: plant diversity & weather
  let healthScore = 70;
  const plantTypeCount = new Set(plants.map(p => p.type)).size;
  healthScore += Math.min(20, plantTypeCount * 3);
  if (weather && (weather.temperature > 35 || weather.temperature < 0)) {
    healthScore -= 15;
  }
  healthScore = Math.max(0, Math.min(100, healthScore));

  // Diversity: percentage of plant types
  const diversityScore = Math.min(100, plantTypeCount * 15);

  // Daily heatmap (plant health over 30 days)
  const dailyHeatmap: TimeSeriesDataPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = subDays(now, i);
    const day = format(d, 'yyyy-MM-dd');
    let score = 80;
    plants.forEach(p => {
      if (!p.lastWatered) {
        score -= 5;
      } else {
        const daysSince = differenceInDays(d, parseISO(p.lastWatered));
        const info = PLANT_DATABASE[p.type];
        if (daysSince > info.wateringFrequencyDays * 1.5) {
          score -= 8;
        }
      }
    });
    dailyHeatmap.push({
      date: day,
      value: Math.max(0, Math.min(100, score)),
      label: format(d, 'dd'),
    });
  }

  // Alerts
  const alerts: Array<{ severity: 'warning' | 'info'; message: string }> = [];
  const plantsNeedWater = plants.filter(p => {
    if (!p.lastWatered) return true;
    const info = PLANT_DATABASE[p.type];
    const daysSince = differenceInDays(now, parseISO(p.lastWatered));
    return daysSince > info.wateringFrequencyDays * 1.2;
  });
  if (plantsNeedWater.length > 0) {
    alerts.push({
      severity: 'warning',
      message: `${plantsNeedWater.length} plante(s) nécessite(nt) arrosage`,
    });
  }
  if (weather && (weather.temperature > 35 || weather.temperature < 5)) {
    alerts.push({
      severity: 'warning',
      message: `Température extrême : ${weather.temperature}°C`,
    });
  }

  // History 30 days
  const history30Days: TimeSeriesDataPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = subDays(now, i);
    const day = format(d, 'yyyy-MM-dd');
    let score = 80;
    plants.forEach(p => {
      if (!p.lastWatered) {
        score -= 5;
      } else {
        const daysSince = differenceInDays(d, parseISO(p.lastWatered));
        const info = PLANT_DATABASE[p.type];
        if (daysSince > info.wateringFrequencyDays * 1.5) {
          score -= 8;
        }
      }
    });
    if (i % 5 === 0 || i === 0) {
      history30Days.push({
        date: day,
        value: Math.max(0, Math.min(100, score)),
        label: format(d, 'dd MMM'),
      });
    }
  }

  const currentScore = Math.round((hydrationScore + productionScore + nutrientScore + healthScore + diversityScore) / 5);

  return {
    currentScore,
    factors: {
      hydration: Math.round(hydrationScore),
      production: Math.round(productionScore),
      nutrients: Math.round(nutrientScore),
      health: Math.round(healthScore),
      diversity: Math.round(diversityScore),
    },
    dailyHeatmap,
    alerts,
    history30Days,
  };
}

export function getComparisonData(
  plants: Plant[],
  entries: PlantEntry[],
): ComparisonData {
  const comparisonPlants = plants.map(p => {
    const plantEntries = entries.filter(e => e.plantId === p.id && e.type === 'harvest');
    let totalHarvest = 0;
    plantEntries.forEach(e => {
      const qty = e.quantity ?? 0;
      const unit = e.unit ?? 'kg';
      totalHarvest += normalizeToKg(qty, unit);
    });

    const regionalAvg = REGIONAL_AVERAGES[p.type] ?? 1;
    const plantInfo = PLANT_DATABASE[p.type];
    const waterUsed = plantInfo ? plantInfo.dailyWaterNeed * 30 : 10;
    const waterEfficiency = waterUsed > 0 ? totalHarvest / waterUsed : 0;
    const vsRegional = (totalHarvest / regionalAvg) * 100;

    let status: 'excellent' | 'good' | 'warning' = 'good';
    if (vsRegional >= 120) status = 'excellent';
    else if (vsRegional < 60) status = 'warning';

    return {
      name: p.name,
      harvest: parseFloat(totalHarvest.toFixed(2)),
      waterEfficiency: parseFloat(waterEfficiency.toFixed(3)),
      vsRegional: parseFloat(vsRegional.toFixed(1)),
      status,
    };
  });

  return { plants: comparisonPlants };
}
