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
