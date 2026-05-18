import { parseISO, isAfter, isBefore, isEqual } from 'date-fns';
import { PlantEntry, ComparisonMetrics } from '../types';

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
 * Compare metrics between two time periods
 */
export function comparePeriodsMetrics(
  entries: PlantEntry[],
  period1Start: string,
  period1End: string,
  period2Start: string,
  period2End: string,
): ComparisonMetrics {
  const p1Start = parseISO(period1Start);
  const p1End = parseISO(period1End);
  const p2Start = parseISO(period2Start);
  const p2End = parseISO(period2End);

  // Get unique plants in each period
  const p1PlantIds = new Set<string>();
  const p2PlantIds = new Set<string>();

  // Period 1 data
  const p1Entries = entries.filter(e => {
    try {
      const d = parseISO(e.date);
      return (isAfter(d, p1Start) || isEqual(d, p1Start)) && (isBefore(d, p1End) || isEqual(d, p1End));
    } catch {
      return false;
    }
  });

  // Period 2 data
  const p2Entries = entries.filter(e => {
    try {
      const d = parseISO(e.date);
      return (isAfter(d, p2Start) || isEqual(d, p2Start)) && (isBefore(d, p2End) || isEqual(d, p2End));
    } catch {
      return false;
    }
  });

  // Calculate production
  const p1Production = p1Entries
    .filter(e => e.type === 'harvest')
    .reduce((sum, e) => {
      p1PlantIds.add(e.plantId);
      return sum + normalizeToKg(e.quantity ?? 0, e.unit ?? 'kg');
    }, 0);

  const p2Production = p2Entries
    .filter(e => e.type === 'harvest')
    .reduce((sum, e) => {
      p2PlantIds.add(e.plantId);
      return sum + normalizeToKg(e.quantity ?? 0, e.unit ?? 'kg');
    }, 0);

  // Estimate water usage: rough estimate of 5L per watering event recorded
  const p1WaterUsage = p1Entries.filter(e => e.type === 'note' && e.text?.toLowerCase().includes('arros')).length * 5;
  const p2WaterUsage = p2Entries.filter(e => e.type === 'note' && e.text?.toLowerCase().includes('arros')).length * 5;

  // If no explicit watering notes, estimate from harvest days
  const daysP1 = Math.ceil((p1End.getTime() - p1Start.getTime()) / (1000 * 60 * 60 * 24));
  const daysP2 = Math.ceil((p2End.getTime() - p2Start.getTime()) / (1000 * 60 * 60 * 24));

  const estimatedP1Water = p1WaterUsage > 0 ? p1WaterUsage : daysP1 * 2 * p1PlantIds.size; // rough: 2L per plant per day
  const estimatedP2Water = p2WaterUsage > 0 ? p2WaterUsage : daysP2 * 2 * p2PlantIds.size;

  // Calculate growth and efficiency
  const productionGrowth =
    p1Production > 0 ? Math.round(((p2Production - p1Production) / p1Production) * 100) : p2Production > 0 ? 100 : 0;

  const p1Efficiency = estimatedP1Water > 0 ? p1Production / estimatedP1Water : 0;
  const p2Efficiency = estimatedP2Water > 0 ? p2Production / estimatedP2Water : 0;

  const waterEfficiencyChange =
    p1Efficiency > 0 ? Math.round(((p2Efficiency - p1Efficiency) / p1Efficiency) * 100) : p2Efficiency > 0 ? 100 : 0;

  // Net productivity (weighted: 70% production, 30% efficiency)
  const p1NetProductivity = p1Production * 0.7 + p1Efficiency * 0.3 * 100;
  const p2NetProductivity = p2Production * 0.7 + p2Efficiency * 0.3 * 100;

  const netProductivityChange =
    p1NetProductivity > 0 ? Math.round(((p2NetProductivity - p1NetProductivity) / p1NetProductivity) * 100) : 0;

  // Insights
  const insights: string[] = [];

  if (productionGrowth > 20) {
    insights.push(`Production en hausse de ${productionGrowth}% entre les deux périodes. Excellent!`);
  } else if (productionGrowth < -20) {
    insights.push(`Production en baisse de ${Math.abs(productionGrowth)}%. Vérifiez les conditions de culture.`);
  }

  if (waterEfficiencyChange > 15) {
    insights.push(`Meilleure efficacité hydrique (+${waterEfficiencyChange}%). Vous optimisez bien l'arrosage.`);
  } else if (waterEfficiencyChange < -15) {
    insights.push(`Efficacité hydrique dégradée (${waterEfficiencyChange}%). Ajustez vos pratiques d'arrosage.`);
  }

  const newPlants = p2PlantIds.size - p1PlantIds.size;
  if (newPlants > 0) {
    insights.push(`${newPlants} nouvelle(s) plante(s) cultivée(s) dans la période 2.`);
  }

  return {
    period1: {
      startDate: period1Start,
      endDate: period1End,
      production: Math.round(p1Production * 100) / 100,
      waterUsage: Math.round(estimatedP1Water),
      plantCount: p1PlantIds.size,
    },
    period2: {
      startDate: period2Start,
      endDate: period2End,
      production: Math.round(p2Production * 100) / 100,
      waterUsage: Math.round(estimatedP2Water),
      plantCount: p2PlantIds.size,
    },
    productionGrowth,
    waterEfficiencyChange,
    netProductivityChange,
    insights,
  };
}

/**
 * Calculate production growth rate
 */
export function calculateProductionGrowth(monthlyData: { [yearMonth: string]: number }): {
  growthRate: number; // percentage
  trend: 'accelerating' | 'steady' | 'declining';
} {
  const months = Object.keys(monthlyData).sort();
  if (months.length < 2) {
    return { growthRate: 0, trend: 'steady' };
  }

  const values = months.map(m => monthlyData[m]);
  const firstValue = values[0];
  const lastValue = values[values.length - 1];

  const overallGrowthRate = firstValue > 0 ? Math.round(((lastValue - firstValue) / firstValue) * 100) : 0;

  // Determine trend by comparing growth rates in different halves
  const midpoint = Math.floor(values.length / 2);
  const firstHalf = values.slice(0, midpoint);
  const secondHalf = values.slice(midpoint);

  const firstHalfAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  let trend: 'accelerating' | 'steady' | 'declining' = 'steady';
  if (secondHalfAvg > firstHalfAvg * 1.15) trend = 'accelerating';
  else if (secondHalfAvg < firstHalfAvg * 0.85) trend = 'declining';

  return {
    growthRate: overallGrowthRate,
    trend,
  };
}

/**
 * Calculate water efficiency
 */
export function calculateEfficiency(production: number, waterUsage: number): {
  efficiency: number; // kg per liter
  rating: 'excellent' | 'good' | 'average' | 'poor';
} {
  const efficiency = waterUsage > 0 ? Math.round((production / waterUsage) * 1000) / 1000 : 0;

  let rating: 'excellent' | 'good' | 'average' | 'poor' = 'average';
  if (efficiency >= 0.5) rating = 'excellent';
  else if (efficiency >= 0.3) rating = 'good';
  else if (efficiency >= 0.1) rating = 'average';
  else rating = 'poor';

  return {
    efficiency,
    rating,
  };
}
