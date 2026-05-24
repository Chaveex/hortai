import { differenceInDays, parseISO, addDays, format } from 'date-fns';
import i18next from 'i18next';
import { Plant, WeatherData, UserProfile, WateringRecommendation, GardeningTip } from '../types';
import { getPlantInfo, getGrowthStage } from '../constants/plants';
import { isFrostRisk, isHeatWave } from './weather';

function t(key: string, options?: Record<string, any>): string {
  return i18next.t(key, options) as string;
}

export function getWateringRecommendation(
  plant: Plant,
  weather: WeatherData,
  profile: UserProfile,
): WateringRecommendation {
  const info = getPlantInfo(plant.type);
  const now = new Date();
  const daysSincePlanting = differenceInDays(now, parseISO(plant.plantedDate));
  const daysSinceWatered = plant.lastWatered
    ? differenceInDays(now, parseISO(plant.lastWatered))
    : Math.min(daysSincePlanting, info.wateringFrequencyDays + 1);

  const stage = getGrowthStage(daysSincePlanting, plant.type);

  let baseNeed = info.dailyWaterNeed * stage.waterMultiplier;

  if (weather.temperature >= 35) baseNeed *= 1.6;
  else if (weather.temperature >= 28) baseNeed *= 1.3;
  else if (weather.temperature < 15) baseNeed *= 0.7;
  else if (weather.temperature < 10) baseNeed *= 0.5;

  if (weather.humidity >= 75) baseNeed *= 0.8;
  else if (weather.humidity <= 35) baseNeed *= 1.2;

  if (weather.windSpeed >= 30) baseNeed *= 1.15;

  if (profile.gardeningStyle === 'permaculture') baseNeed *= 0.7;
  if (profile.gardeningStyle === 'hydroponique') baseNeed *= 0.3;

  // Calculate rain from last 3 days using historical data
  const rainLast3Days = (weather.history ?? [])
    .slice(-3)
    .reduce((sum, day) => sum + day.rain, 0);

  // Calculate forecast rain for today and tomorrow separately
  const forecast = weather.forecast ?? [];
  const rainToday = forecast[0]?.rain ?? 0;
  const rainTomorrow = forecast[1]?.rain ?? 0;
  const rainForecast = rainToday + rainTomorrow;

  if (rainLast3Days >= 15) {
    return {
      plantId: plant.id,
      shouldWater: false,
      amount: 0,
      reason: t('recommendations.rainRecent', { amount: rainLast3Days.toFixed(0) }),
      urgency: 'low',
      nextWateringDate: format(addDays(now, info.wateringFrequencyDays), 'yyyy-MM-dd'),
      skipReason: 'rain_recent',
    };
  }

  if (rainForecast >= 15) {
    return {
      plantId: plant.id,
      shouldWater: false,
      amount: 0,
      reason: t('recommendations.rainForecast', { amount: rainForecast.toFixed(0) }),
      urgency: 'low',
      nextWateringDate: format(addDays(now, 1), 'yyyy-MM-dd'),
      skipReason: 'rain_forecast',
    };
  }

  const effectiveBaseNeed = Math.max(0, baseNeed - rainLast3Days * 0.4);
  const totalAmount = Math.round(effectiveBaseNeed * daysSinceWatered * 10) / 10;
  const shouldWater = daysSinceWatered >= info.wateringFrequencyDays;

  let urgency: 'low' | 'medium' | 'high' = 'low';
  if (daysSinceWatered >= info.wateringFrequencyDays * 2) urgency = 'high';
  else if (daysSinceWatered >= info.wateringFrequencyDays) urgency = 'medium';

  const reasons: string[] = [];
  if (weather.temperature >= 28) reasons.push(t('recommendations.reasonHeat', { temp: weather.temperature }));
  if (weather.humidity <= 40) reasons.push(t('recommendations.reasonDryAir'));
  if (profile.gardeningStyle === 'permaculture') reasons.push(t('recommendations.reasonMulch'));

  // Add rain info if applicable
  if (rainLast3Days >= 5 && rainLast3Days < 15) {
    reasons.push(t('recommendations.rainLast3DaysInfo', { amount: rainLast3Days.toFixed(0) }));
  }
  if (rainToday >= 5) {
    reasons.push(t('recommendations.rainTodayInfo', { amount: rainToday.toFixed(0) }));
  }
  if (rainTomorrow >= 5) {
    reasons.push(t('recommendations.rainTomorrowInfo', { amount: rainTomorrow.toFixed(0) }));
  }

  const reason = reasons.length > 0
    ? t('recommendations.wateringReason', { reasons: reasons.join(' ') })
    : t('recommendations.wateringMethod');

  const nextWatering = addDays(now, shouldWater ? info.wateringFrequencyDays : info.wateringFrequencyDays - daysSinceWatered);

  return {
    plantId: plant.id,
    shouldWater,
    amount: Math.max(0.5, totalAmount),
    reason,
    urgency,
    nextWateringDate: format(nextWatering, 'yyyy-MM-dd'),
  };
}

export function generateTips(
  plants: Plant[],
  weather: WeatherData,
  profile: UserProfile,
): GardeningTip[] {
  const tips: GardeningTip[] = [];
  const now = new Date();
  const month = now.getMonth() + 1;

  if (isFrostRisk(weather.forecast)) {
    tips.push({
      id: 'frost-risk',
      title: t('recommendations.frostRiskTitle'),
      message: t('recommendations.frostRiskMsg'),
      type: 'weather',
      priority: 'high',
      icon: '🥶',
    });
  }

  if (isHeatWave(weather.forecast)) {
    tips.push({
      id: 'heat-wave',
      title: t('recommendations.heatWaveTitle'),
      message: t('recommendations.heatWaveMsg'),
      type: 'weather',
      priority: 'high',
      icon: '🔥',
    });
  }

  if (weather.windSpeed >= 40) {
    tips.push({
      id: 'strong-wind',
      title: t('recommendations.strongWindTitle'),
      message: t('recommendations.strongWindMsg', { speed: weather.windSpeed }),
      type: 'weather',
      priority: 'medium',
      icon: '💨',
    });
  }

  for (const plant of plants) {
    const info = getPlantInfo(plant.type);
    const daysSincePlanting = differenceInDays(now, parseISO(plant.plantedDate));
    const stage = getGrowthStage(daysSincePlanting, plant.type);

    if (daysSincePlanting >= info.harvestDays - 7 && daysSincePlanting <= info.harvestDays + 14) {
      tips.push({
        id: `harvest-${plant.id}`,
        title: t('recommendations.harvestReadyTitle', { name: info.frenchName }),
        message: t('recommendations.harvestReadyMsg', { name: info.frenchName }),
        type: 'harvesting',
        priority: 'medium',
        plantId: plant.id,
        icon: '🌾',
      });
    }

    if (stage.name === 'flowering' && profile.fertilizerType !== 'aucun') {
      const fertilizerAdvice = profile.fertilizerType === 'naturel'
        ? info.fertilizerSchedule.naturel
        : info.fertilizerSchedule.industriel;
      tips.push({
        id: `fertilizer-${plant.id}`,
        title: t('recommendations.fertilizingTitle', { name: info.frenchName }),
        message: fertilizerAdvice,
        type: 'fertilizing',
        priority: 'low',
        plantId: plant.id,
        icon: '🌿',
      });
    }
  }

  if (profile.gardeningStyle === 'permaculture' && (month === 3 || month === 4)) {
    tips.push({
      id: 'mulching-spring',
      title: t('recommendations.mulchingSpringTitle'),
      message: t('recommendations.mulchingSpringMsg'),
      type: 'general',
      priority: 'medium',
      icon: '♻️',
    });
  }

  if (month >= 5 && month <= 8 && weather.temperature >= 22) {
    tips.push({
      id: 'watering-timing',
      title: t('recommendations.wateringTimingTitle'),
      message: t('recommendations.wateringTimingMsg'),
      type: 'watering',
      priority: 'low',
      icon: '💧',
    });
  }

  return tips.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });
}

export function getSeason(month: number): 'spring' | 'summer' | 'autumn' | 'winter' {
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

// ====== Dashboard Narrative Helpers (Phase 4) ======

/**
 * Calculate how many days ahead the garden is compared to expected seasonal progress
 */
export function getGardenSeasonProgress(
  plants: Plant[],
  t?: (key: string, options?: any) => string,
): {
  daysAhead: number;
  stage: string;
  narrative: string;
} {
  const translate = (key: string, options?: any) => t ? t(key, options) : key;

  if (plants.length === 0) {
    return {
      daysAhead: 0,
      stage: 'empty',
      narrative: translate('recommendations.gardenEmpty'),
    };
  }

  const now = new Date();
  let totalDaysAlive = 0;
  let totalExpectedDays = 0;

  plants.forEach(plant => {
    const info = getPlantInfo(plant.type);
    const daysAlive = differenceInDays(now, parseISO(plant.plantedDate));
    const expectedDays = info.harvestDays;

    totalDaysAlive += daysAlive;
    totalExpectedDays += expectedDays;
  });

  const avgDaysAlive = totalDaysAlive / plants.length;
  const avgExpectedDays = totalExpectedDays / plants.length;
  const daysAhead = Math.round((avgDaysAlive / avgExpectedDays - 1) * avgExpectedDays);

  let stage = 'late';
  if (daysAhead > 0) stage = 'early';
  else if (daysAhead > -7) stage = 'onTime';

  const narrativePrefix = daysAhead > 0
    ? translate('recommendations.gardenAhead', { days: Math.abs(daysAhead) })
    : daysAhead < -7
      ? translate('recommendations.gardenBehind', { days: Math.abs(daysAhead) })
      : translate('recommendations.gardenOnTime');

  return {
    daysAhead,
    stage,
    narrative: narrativePrefix,
  };
}

/**
 * Calculate harvest progress toward monthly goal
 */
export function getProductionNarrative(
  currentHarvest: number,
  goalHarvest: number,
  t?: (key: string, options?: any) => string,
): string {
  const translate = (key: string, options?: any) => t ? t(key, options) : key;

  if (goalHarvest <= 0) {
    return translate('recommendations.noHarvestGoal');
  }

  const remaining = Math.max(0, goalHarvest - currentHarvest);
  const percentProgress = (currentHarvest / goalHarvest) * 100;

  if (percentProgress >= 100) {
    const excess = currentHarvest - goalHarvest;
    return translate('recommendations.harvestGoalExceeded', { excess: excess.toFixed(1) });
  }

  if (percentProgress >= 75) {
    return translate('recommendations.harvestAlmostThere', { remaining: remaining.toFixed(1), goal: goalHarvest });
  }

  if (percentProgress >= 50) {
    return translate('recommendations.harvestGoodProgress', { actual: currentHarvest.toFixed(1), goal: goalHarvest });
  }

  return translate('recommendations.harvestStarting', { actual: currentHarvest.toFixed(1), goal: goalHarvest });
}

/**
 * Calculate plant outperformance vs regional average
 * (Returns percentage above regional average for display in ProductionDashboard)
 */
export function getPlantProductionNarrative(
  plantHarvest: number,
  regionalAverage: number,
): string | null {
  if (regionalAverage <= 0 || plantHarvest <= 0) {
    return null;
  }

  const outperformance = ((plantHarvest / regionalAverage) - 1) * 100;

  if (outperformance >= 30) {
    return t('recommendations.plantOutperformanceHigh', { percent: outperformance.toFixed(0) });
  }

  if (outperformance >= 10) {
    return t('recommendations.plantOutperformanceMedium', { percent: outperformance.toFixed(0) });
  }

  return null;
}

/**
 * Generate water consumption narrative for WaterDashboard
 */
export function getWateringNarrative(
  weekTotalLiters: number,
  expectedLiters: number,
  weather: WeatherData,
): string {
  if (weekTotalLiters === 0) {
    return t('recommendations.wateringNoWatering');
  }

  const ratio = expectedLiters > 0 ? (weekTotalLiters / expectedLiters) : 1;
  const difference = weekTotalLiters - expectedLiters;

  if (ratio >= 0.95 && ratio <= 1.05) {
    return t('recommendations.wateringOptimal', { liters: weekTotalLiters.toFixed(0) });
  }

  if (ratio > 1.05) {
    const excess = Math.round(difference);
    if (excess > 0 && weather.humidity > 60) {
      return t('recommendations.wateringExcessJustified', { excess, humidity: weather.humidity });
    }
    return t('recommendations.wateringExcessWarning', { excess });
  }

  const deficit = Math.round(Math.abs(difference));
  if (weather.humidity > 70) {
    return t('recommendations.wateringSavingSuccess', { deficit, humidity: weather.humidity });
  }

  return t('recommendations.wateringDeficitWarning', { deficit });
}

/**
 * Generate health trend narrative for HealthScoreDashboard
 */
export function getHealthNarrative(
  healthTrend: { label: string; value: number }[],
  plants: Plant[],
): string {
  if (healthTrend.length === 0 || plants.length === 0) {
    return t('recommendations.healthNoData');
  }

  // Check if trend is increasing (last 2 months vs first 2 months)
  const oldAvg = healthTrend.slice(0, 2).reduce((sum, m) => sum + m.value, 0) / 2;
  const recentAvg = healthTrend.slice(-2).reduce((sum, m) => sum + m.value, 0) / 2;
  const isTrendingUp = recentAvg > oldAvg;

  // Identify best and worst factors
  const now = new Date();
  let underwatered = 0;
  let overwatered = 0;

  plants.forEach(p => {
    const info = getPlantInfo(p.type);
    if (!p.lastWatered) {
      underwatered++;
    } else {
      const daysSince = differenceInDays(now, parseISO(p.lastWatered));
      if (daysSince > info.wateringFrequencyDays * 1.5) {
        underwatered++;
      } else if (daysSince < info.wateringFrequencyDays * 0.5) {
        overwatered++;
      }
    }
  });

  const factors: string[] = [];
  if (underwatered === 0 && overwatered === 0) {
    factors.push(t('recommendations.healthFactor_optimal'));
  } else if (underwatered > 0) {
    factors.push(t('recommendations.healthFactor_underwatered'));
  } else if (overwatered > 0) {
    factors.push(t('recommendations.healthFactor_overwatered'));
  } else {
    factors.push(t('recommendations.healthFactor_balanced'));
  }

  const prefix = isTrendingUp
    ? t('recommendations.healthTrendImproving')
    : recentAvg > 70
      ? t('recommendations.healthTrendStable')
      : t('recommendations.healthTrendDeclining');

  return `${prefix} — ${factors.slice(0, 2).join(', ')}`;
}
