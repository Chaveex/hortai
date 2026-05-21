import Constants from 'expo-constants';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import i18next from 'i18next';
import { Plant, WeatherData, UserProfile, WateringRecommendation } from '../types';
import { getPlantInfo } from '../constants/plants';
import { detectZone, getPlantsForMonth, ClimateZone } from '../constants/sowingCalendar';

function t(key: string, options?: Record<string, any>): string {
  return i18next.t(key, options) as string;
}

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
      ? t('notifications.wateringSingle', { plant: plantNames[0] })
      : t('notifications.wateringMultiple', {
          plants: plantNames.slice(0, 3).join(', '),
          count: plantNames.length > 3 ? plantNames.length - 3 : 0,
        });

    await Notifications.scheduleNotificationAsync({
      content: {
        title: t('notifications.wateringTitle'),
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
        title: t('notifications.harvestTitle', { icon }),
        body: t('notifications.harvestBody', {
          plant: plantName,
          days: daysUntilHarvest,
          plural: daysUntilHarvest > 1 ? 's' : '',
        }),
        data: { type: 'harvest' },
      },
      trigger: { seconds: daysUntilHarvest * 24 * 3600 },
    });
  } catch {
    // silent
  }
}

export async function scheduleMonthlysSowingNotification(profile: UserProfile): Promise<void> {
  if (isExpoGo) return;
  try {
    const Notifications = require('expo-notifications');
    const zone = detectZone(profile.latitude, profile.longitude);

    // Schedule for 1st of next 3 months
    const now = new Date();
    for (let i = 1; i <= 3; i++) {
      const target = new Date(now.getFullYear(), now.getMonth() + i, 1, 8, 0, 0);
      const month = target.getMonth() + 1;
      const data = getPlantsForMonth(month, zone);

      const allPlants = [
        ...data.sowIndoor.slice(0, 2).map(t => `🏠 ${getPlantInfo(t).frenchName}`),
        ...data.sowOutdoor.slice(0, 2).map(t => `🌍 ${getPlantInfo(t).frenchName}`),
        ...data.transplant.slice(0, 1).map(t => `🪴 ${getPlantInfo(t).frenchName}`),
      ];

      if (allPlants.length === 0) continue;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: t('notifications.sowingTitle'),
          body: allPlants.join(' · '),
          data: { type: 'sowing_calendar' },
        },
        trigger: { date: target },
      });
    }
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
