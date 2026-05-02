import Constants from 'expo-constants';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { Plant, WeatherData, UserProfile, WateringRecommendation } from '../types';
import { getPlantInfo } from '../constants/plants';

const BACKGROUND_TASK = 'GARDEN_WEATHER_UPDATE';
const isExpoGo = Constants.executionEnvironment === 'storeClient';

if (!isExpoGo) {
  const Notifications = require('expo-notifications');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (isExpoGo) return false;
  try {
    const Notifications = require('expo-notifications');
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function scheduleDailyWateringNotification(
  plants: Plant[],
  recommendations: WateringRecommendation[],
  weather: WeatherData,
  hour: number = 8,
): Promise<void> {
  if (isExpoGo) return;
  try {
    const Notifications = require('expo-notifications');
    await Notifications.cancelAllScheduledNotificationsAsync();

    const toWater = recommendations.filter(r => r.shouldWater);
    if (toWater.length === 0) return;

    const plantNames = toWater.map(r => {
      const plant = plants.find(p => p.id === r.plantId);
      if (!plant) return '';
      const info = getPlantInfo(plant.type);
      return info.icon + ' ' + (plant.name || info.frenchName);
    }).filter(Boolean);

    const body = plantNames.length === 1
      ? `${plantNames[0]} a besoin d'eau aujourd'hui.`
      : `${plantNames.slice(0, 3).join(', ')}${plantNames.length > 3 ? ` et ${plantNames.length - 3} autres` : ''} ont besoin d'eau.`;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌱 Rappel d\'arrosage',
        body,
        data: { type: 'watering' },
      },
      trigger: { hour, minute: 0, repeats: true },
    });
  } catch {
    // silent
  }
}

export async function sendWeatherAlert(title: string, body: string): Promise<void> {
  if (isExpoGo) return;
  try {
    const Notifications = require('expo-notifications');
    await Notifications.scheduleNotificationAsync({
      content: { title, body, data: { type: 'weather_alert' } },
      trigger: null,
    });
  } catch {
    // silent
  }
}

export async function scheduleHarvestReminder(plantName: string, icon: string, daysUntilHarvest: number): Promise<void> {
  if (isExpoGo) return;
  try {
    const Notifications = require('expo-notifications');
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${icon} Récolte prochaine`,
        body: `${plantName} sera prêt à récolter dans ${daysUntilHarvest} jour${daysUntilHarvest > 1 ? 's' : ''}.`,
        data: { type: 'harvest' },
      },
      trigger: { seconds: daysUntilHarvest * 24 * 3600 },
    });
  } catch {
    // silent
  }
}

export async function registerBackgroundFetch(): Promise<void> {
  if (isExpoGo) return;
  try {
    TaskManager.defineTask(BACKGROUND_TASK, async () => {
      return BackgroundFetch.BackgroundFetchResult.NewData;
    });
    await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK, {
      minimumInterval: 6 * 60 * 60,
      stopOnTerminate: false,
      startOnBoot: true,
    });
  } catch {
    // silent
  }
}
