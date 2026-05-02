import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plant, UserProfile, WeatherData, WateringRecommendation, GardeningTip, PlantType } from '../types';
import { fetchWeather } from '../services/weather';
import { isFrostRisk as checkFrost, isHeatWave as checkHeat } from '../services/weather';
import { getWateringRecommendation, generateTips } from '../services/recommendations';
import { scheduleDailyWateringNotification, sendWeatherAlert } from '../services/notifications';

interface StoreState {
  profile: UserProfile | null;
  plants: Plant[];
  weather: WeatherData | null;
  recommendations: WateringRecommendation[];
  tips: GardeningTip[];
  isLoadingWeather: boolean;
  weatherError: string | null;

  setProfile: (profile: UserProfile) => void;
  updateProfile: (partial: Partial<UserProfile>) => void;
  addPlant: (plant: Omit<Plant, 'id' | 'wateringHistory'>) => void;
  updatePlant: (id: string, partial: Partial<Plant>) => void;
  deletePlant: (id: string) => void;
  markWatered: (plantId: string) => void;
  setWeather: (weather: WeatherData) => void;
  refreshWeather: () => Promise<void>;
  refreshRecommendations: () => void;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      profile: null,
      plants: [],
      weather: null,
      recommendations: [],
      tips: [],
      isLoadingWeather: false,
      weatherError: null,

      setProfile: (profile) => {
        set({ profile });
        get().refreshWeather();
      },

      updateProfile: (partial) => {
        const current = get().profile;
        if (!current) return;
        set({ profile: { ...current, ...partial } });
      },

      addPlant: (plantData) => {
        const plant: Plant = {
          ...plantData,
          id: generateId(),
          wateringHistory: [],
        };
        set(s => ({ plants: [...s.plants, plant] }));
        get().refreshRecommendations();
      },

      updatePlant: (id, partial) => {
        set(s => ({
          plants: s.plants.map(p => p.id === id ? { ...p, ...partial } : p),
        }));
        get().refreshRecommendations();
      },

      deletePlant: (id) => {
        set(s => ({
          plants: s.plants.filter(p => p.id !== id),
          recommendations: s.recommendations.filter(r => r.plantId !== id),
        }));
      },

      markWatered: (plantId) => {
        const now = new Date().toISOString();
        set(s => ({
          plants: s.plants.map(p =>
            p.id === plantId
              ? { ...p, lastWatered: now, wateringHistory: [...p.wateringHistory, now].slice(-30) }
              : p
          ),
        }));
        get().refreshRecommendations();
      },

      setWeather: (weather) => {
        set({ weather });
        get().refreshRecommendations();
      },

      refreshWeather: async () => {
        const { profile } = get();
        if (!profile?.latitude) return;
        set({ isLoadingWeather: true, weatherError: null });
        try {
          const weather = await fetchWeather(profile.latitude, profile.longitude, profile.city);
          set({ weather, isLoadingWeather: false });
          get().refreshRecommendations();

          if (checkFrost(weather.forecast)) {
            await sendWeatherAlert('🥶 Risque de gelée !', 'Protégez vos plants fragiles cette nuit.');
          } else if (checkHeat(weather.forecast)) {
            await sendWeatherAlert('🔥 Vague de chaleur', 'Augmentez les arrosages et ombragez si possible.');
          }
        } catch (err: any) {
          set({ isLoadingWeather: false, weatherError: err.message ?? 'Erreur météo' });
        }
      },

      refreshRecommendations: () => {
        const { plants, weather, profile } = get();
        if (!weather || !profile) return;

        const recommendations = plants.map(plant =>
          getWateringRecommendation(plant, weather, profile)
        );
        const tips = generateTips(plants, weather, profile);
        set({ recommendations, tips });

        if (profile.notificationsEnabled) {
          scheduleDailyWateringNotification(plants, recommendations, weather, profile.notificationHour);
        }
      },
    }),
    {
      name: 'garden-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        profile: state.profile,
        plants: state.plants,
        weather: state.weather,
      }),
    }
  )
);
