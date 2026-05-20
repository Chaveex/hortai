import { differenceInDays, parseISO, addDays, format } from 'date-fns';
import { Plant, WeatherData, UserProfile, WateringRecommendation, GardeningTip } from '../types';
import { getPlantInfo, getGrowthStage } from '../constants/plants';
import { isFrostRisk, isHeatWave, getExpectedRainNext24h } from './weather';

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

  const rainYesterday = weather.rain1h * 24;
  const rainForecast = getExpectedRainNext24h(weather.forecast);

  if (rainYesterday >= 15) {
    return {
      plantId: plant.id,
      shouldWater: false,
      amount: 0,
      reason: `Pluie récente (${rainYesterday.toFixed(0)} mm). Pas besoin d'arroser.`,
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
      reason: `Pluie prévue aujourd'hui (${rainForecast.toFixed(0)} mm). Économisez l'eau.`,
      urgency: 'low',
      nextWateringDate: format(addDays(now, 1), 'yyyy-MM-dd'),
      skipReason: 'rain_forecast',
    };
  }

  const effectiveBaseNeed = Math.max(0, baseNeed - rainYesterday * 0.4);
  const totalAmount = Math.round(effectiveBaseNeed * daysSinceWatered * 10) / 10;
  const shouldWater = daysSinceWatered >= info.wateringFrequencyDays;

  let urgency: 'low' | 'medium' | 'high' = 'low';
  if (daysSinceWatered >= info.wateringFrequencyDays * 2) urgency = 'high';
  else if (daysSinceWatered >= info.wateringFrequencyDays) urgency = 'medium';

  const reasons: string[] = [];
  if (weather.temperature >= 28) reasons.push(`chaleur (${weather.temperature}°C)`);
  if (weather.humidity <= 40) reasons.push('air sec');
  if (profile.gardeningStyle === 'permaculture') reasons.push('paillis réduit les besoins');
  const reason = reasons.length > 0
    ? `Arrosez en tenant compte de : ${reasons.join(', ')}.`
    : `Arrosez au pied, idéalement le soir ou tôt le matin.`;

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
      title: 'Risque de gelée !',
      message: 'Des températures proches de 0°C sont prévues. Protégez vos plants fragiles avec un voile de forçage ou rentrez les pots.',
      type: 'weather',
      priority: 'high',
      icon: '🥶',
    });
  }

  if (isHeatWave(weather.forecast)) {
    tips.push({
      id: 'heat-wave',
      title: 'Vague de chaleur',
      message: 'Températures > 35°C prévues. Doublez les arrosages, paillez si possible et ombragez les plants fragiles.',
      type: 'weather',
      priority: 'high',
      icon: '🔥',
    });
  }

  if (weather.windSpeed >= 40) {
    tips.push({
      id: 'strong-wind',
      title: 'Vent fort',
      message: `Vents à ${weather.windSpeed} km/h. Tuteurez vos plants hauts (tomates, haricots grimpants).`,
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
        title: `${info.frenchName} ${plant.variety ? `(${plant.variety})` : ''} bientôt à récolter`,
        message: `Votre ${info.frenchName} est en phase de récolte. Vérifiez la maturité et récoltez régulièrement.`,
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
        title: `Fertilisation ${info.frenchName}`,
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
      title: 'Paillage de printemps',
      message: 'C\'est le bon moment pour pailler vos planches. Utilisez BRF, paille ou feuilles mortes (10 cm minimum).',
      type: 'general',
      priority: 'medium',
      icon: '♻️',
    });
  }

  if (month >= 5 && month <= 8 && weather.temperature >= 22) {
    tips.push({
      id: 'watering-timing',
      title: 'Horaires d\'arrosage',
      message: 'Par temps chaud, arrosez tôt le matin ou après 18h pour limiter l\'évaporation.',
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
export function getGardenSeasonProgress(plants: Plant[]): {
  daysAhead: number;
  stage: string;
  narrative: string;
} {
  if (plants.length === 0) {
    return {
      daysAhead: 0,
      stage: 'empty',
      narrative: 'Commencez par planter vos premiers légumes !',
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

  let stage = 'en retard';
  if (daysAhead > 0) stage = 'en avance';
  else if (daysAhead > -7) stage = 'à l\'heure';

  const narrativePrefix = daysAhead > 0
    ? `🌱 Votre jardin est ${Math.abs(daysAhead)} jours en avance — continuez cet excellent entretien !`
    : daysAhead < -7
      ? `⏰ Votre jardin est ${Math.abs(daysAhead)} jours en retard — augmentez les arrosages et engrais.`
      : `🌱 Votre jardin progresse à l'heure prévue — bon rythme !`;

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
): string {
  if (goalHarvest <= 0) {
    return 'Définissez un objectif de récolte mensuelle pour voir votre progression.';
  }

  const remaining = Math.max(0, goalHarvest - currentHarvest);
  const percentProgress = (currentHarvest / goalHarvest) * 100;

  if (percentProgress >= 100) {
    const excess = currentHarvest - goalHarvest;
    return `🏆 Objectif atteint ! Vous avez dépassé votre but de ${excess.toFixed(1)} kg — excellent !`;
  }

  if (percentProgress >= 75) {
    return `🎯 Presque là ! Il vous manque ${remaining.toFixed(1)} kg pour atteindre votre objectif de ${goalHarvest} kg.`;
  }

  if (percentProgress >= 50) {
    return `📈 Bonne progression : ${currentHarvest.toFixed(1)} kg / ${goalHarvest} kg. Continuez vos récoltes !`;
  }

  return `🌾 Commencez à récolter ! Vous avez actuellement ${currentHarvest.toFixed(1)} kg / ${goalHarvest} kg.`;
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
    return `Vos rendements dépassent la moyenne régionale de ${outperformance.toFixed(0)}% — excellent travail !`;
  }

  if (outperformance >= 10) {
    return `Vos rendements surpassent la moyenne régionale de ${outperformance.toFixed(0)}% — bonne maîtrise !`;
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
    return 'Aucun arrosage cette semaine. Vérifiez si vos plants ne manquent pas d\'eau.';
  }

  const ratio = expectedLiters > 0 ? (weekTotalLiters / expectedLiters) : 1;
  const difference = weekTotalLiters - expectedLiters;

  if (ratio >= 0.95 && ratio <= 1.05) {
    return `💧 Arrosage optimal cette semaine : ${weekTotalLiters.toFixed(0)}L (adapté à la météo actuelle)`;
  }

  if (ratio > 1.05) {
    const excess = Math.round(difference);
    if (excess > 0 && weather.humidity > 60) {
      return `💧 Vous avez arrosé ${excess}L de plus que prévu, mais c'était justifié par la faible humidité (${weather.humidity}%).`;
    }
    return `⚠️ Vous avez arrosé ${excess}L de plus que recommandé — ajustez pour la semaine prochaine.`;
  }

  const deficit = Math.round(Math.abs(difference));
  if (weather.humidity > 70) {
    return `✅ Économie d'eau réussie ! Vous avez utilisé ${deficit}L de moins grâce à la bonne humidité (${weather.humidity}%).`;
  }

  return `⚠️ Vous avez arrosé ${deficit}L de moins que prévu — augmentez légèrement.`;
}

/**
 * Generate health trend narrative for HealthScoreDashboard
 */
export function getHealthNarrative(
  healthTrend: { label: string; value: number }[],
  plants: Plant[],
): string {
  if (healthTrend.length === 0 || plants.length === 0) {
    return 'Pas assez de données pour générer une narrative de santé.';
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
    factors.push('arrosage optimal');
  } else if (underwatered > 0) {
    factors.push('⚠️ sous-arrosage');
  } else if (overwatered > 0) {
    factors.push('⚠️ sur-arrosage');
  } else {
    factors.push('arrosage équilibré');
  }

  const prefix = isTrendingUp
    ? '📈 Santé du jardin en amélioration'
    : recentAvg > 70
      ? '✅ Santé stable et bonne'
      : '⚠️ Santé déclinante';

  return `${prefix} — ${factors.slice(0, 2).join(', ')}`;
}
