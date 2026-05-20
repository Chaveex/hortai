import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plant, UserProfile, WeatherData, WateringRecommendation, GardeningTip, PlantType, PlantEntry, AIChatMessage, RateLimitStatus, StatsData, GardenBed, GardenCell, GardenMetrics, PlantMetrics, Predictions, GardenInsight, GardenChartData } from '../types';
import { fetchWeather } from '../services/weather';
import { calculateStats } from '../services/statistics';
import { isFrostRisk as checkFrost, isHeatWave as checkHeat } from '../services/weather';
import { getWateringRecommendation, generateTips } from '../services/recommendations';
import { scheduleDailyWateringNotification, sendWeatherAlert, scheduleMonthlysSowingNotification } from '../services/notifications';
import { useChoreStore } from './useChoreStore';
import { BackupMetadata } from '../services/backup';
import { calculateGardenMetrics, calculatePlantMetrics } from '../services/gardenMetrics';
import { generatePredictions } from '../services/predictions';
import { generateGardenInsights, prioritizeInsights } from '../services/insights';
import { calculateTimeSeriesData } from '../services/statistics';
import { format, differenceInDays, parseISO } from 'date-fns';
import { PLANT_DATABASE } from '../constants/plants';

interface StoreState {
  profile: UserProfile | null;
  plants: Plant[];
  entries: PlantEntry[];
  weather: WeatherData | null;
  recommendations: WateringRecommendation[];
  tips: GardeningTip[];
  stats: StatsData | null;
  isLoadingWeather: boolean;
  weatherError: string | null;

  aiChatMessages: AIChatMessage[];
  aiChatRateLimit: RateLimitStatus | null;

  // Backup metadata
  backups: BackupMetadata[];
  lastBackupTime?: string;

  // Garden beds
  gardenBeds: GardenBed[];

  // Advanced metrics & dashboard (P2)
  gardenMetrics: GardenMetrics | null;
  plantMetrics: PlantMetrics[];
  predictions: Predictions | null;
  insights: GardenInsight[];
  chartData: GardenChartData | null;
  selectedMetricsPeriod: 'week' | 'month' | 'quarter' | 'year' | 'all';
  selectedDateRange: { start: string; end: string } | null;

  // Retention gamification (P2)
  streakDays: number;
  longestStreakDays: number;
  lastWatered: string | null;
  streakResetAt: string | null;
  gardenerLevel: number;
  lastDailyTipDate: string | null;

  refreshStats: () => void;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (partial: Partial<UserProfile>) => void;
  addPlant: (plant: Omit<Plant, 'id' | 'wateringHistory'>) => void;
  updatePlant: (id: string, partial: Partial<Plant>) => void;
  deletePlant: (id: string) => void;
  markWatered: (plantId: string) => void;
  addEntry: (entry: Omit<PlantEntry, 'id'>) => void;
  deleteEntry: (id: string) => void;
  setWeather: (weather: WeatherData) => void;
  refreshWeather: () => Promise<void>;
  refreshRecommendations: () => void;

  setAIChatMessages: (messages: AIChatMessage[]) => void;
  addAIChatMessage: (message: AIChatMessage) => void;
  clearAIChatHistory: () => void;
  setAIChatRateLimit: (status: RateLimitStatus | null) => void;

  // Backup actions
  setBackups: (backups: BackupMetadata[]) => void;
  addBackup: (meta: BackupMetadata) => void;
  setLastBackupTime: (time: string) => void;
  // Direct plant/entry setters for import restore
  setPlants: (plants: Plant[]) => void;
  setEntries: (entries: PlantEntry[]) => void;

  // Garden bed actions
  addGardenBed: (bed: Omit<GardenBed, 'id'>) => void;
  updateGardenBed: (bedId: string, partial: Partial<Omit<GardenBed, 'id' | 'cells'>>) => void;
  deleteGardenBed: (bedId: string) => void;
  setBedCell: (bedId: string, row: number, col: number, plantId: string | undefined) => void;
  resizeBed: (bedId: string, rows: number, cols: number) => void;

  // Advanced metrics actions
  refreshGardenMetrics: () => void;
  refreshPredictions: () => void;
  refreshInsights: () => void;
  setMetricsPeriod: (period: 'week' | 'month' | 'quarter' | 'year' | 'all') => void;
  setDateRange: (range: { start: string; end: string } | null) => void;

  // Retention gamification actions
  updateStreakDays: (days: number) => void;
  setLongestStreakDays: (days: number) => void;
  setLastWatered: (date: string | null) => void;
  setHarvestGoal: (kg: number) => void;
  setDailyTipEnabled: (enabled: boolean) => void;
  setDailyTipTime: (time: string) => void;
  recordDailyTip: (date: string) => void;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

function createEmptyCells(rows: number, cols: number): GardenCell[] {
  const cells: GardenCell[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({ row: r, col: c, plantId: undefined });
    }
  }
  return cells;
}

function checkStreakReset(plants: Plant[]): boolean {
  const now = new Date();
  let shouldReset = false;

  plants.forEach(plant => {
    if (!plant.lastWatered) return;

    const daysSince = differenceInDays(now, parseISO(plant.lastWatered));
    const wateringFreq = PLANT_DATABASE[plant.type].wateringFrequencyDays;

    // Streak resets if any plant is overdue by 2x watering frequency
    if (daysSince > wateringFreq * 2) {
      shouldReset = true;
    }
  });

  return shouldReset;
}

function calculateGardenerLevel(plantCount: number, harvestCount: number, daysSinceOnboarding: number): number {
  return 1 + Math.floor((plantCount + harvestCount + daysSinceOnboarding) / 20);
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      profile: null,
      plants: [],
      entries: [],
      weather: null,
      recommendations: [],
      tips: [],
      stats: null,
      isLoadingWeather: false,
      weatherError: null,

      aiChatMessages: [],
      aiChatRateLimit: null,

      backups: [],
      lastBackupTime: undefined,

      gardenBeds: [],

      // Advanced metrics
      gardenMetrics: null,
      plantMetrics: [],
      predictions: null,
      insights: [],
      chartData: null,
      selectedMetricsPeriod: 'month',
      selectedDateRange: null,

      // Retention gamification
      streakDays: 0,
      longestStreakDays: 0,
      lastWatered: null,
      streakResetAt: null,
      gardenerLevel: 1,
      lastDailyTipDate: null,

      refreshStats: () => {
        const { entries, plants, weather } = get();
        const stats = calculateStats(entries, plants, weather);
        set({ stats });
        // Also refresh advanced metrics
        get().refreshGardenMetrics();
      },

      setProfile: (profile) => {
        // Initialize onboardingDate if not set
        const enrichedProfile = {
          ...profile,
          onboardingDate: profile.onboardingDate || format(new Date(), 'yyyy-MM-dd'),
        };
        set({ profile: enrichedProfile });
        get().refreshWeather();
        if (enrichedProfile.sowingNotificationsEnabled !== false) {
          scheduleMonthlysSowingNotification(enrichedProfile);
        }
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
          entries: s.entries.filter(e => e.plantId !== id),
        }));
        try {
          useChoreStore.getState().cleanupOrphanChores(get().plants.map(p => p.id));
        } catch {
          // ignore
        }
      },

      addEntry: (entry) => {
        const newEntry: PlantEntry = { ...entry, id: generateId() };
        set(s => ({ entries: [newEntry, ...s.entries] }));
        get().refreshStats();
      },

      deleteEntry: (id) => {
        set(s => ({ entries: s.entries.filter(e => e.id !== id) }));
        get().refreshStats();
      },

      markWatered: (plantId) => {
        const now = new Date().toISOString();
        const nowStr = format(new Date(), 'yyyy-MM-dd');
        const { lastWatered } = get();

        // Update plant's last watered time
        set(s => ({
          plants: s.plants.map(p =>
            p.id === plantId
              ? { ...p, lastWatered: now, wateringHistory: [...p.wateringHistory, now].slice(-30) }
              : p
          ),
        }));

        // Update streak: if not already watered today, increment streak
        if (!lastWatered || lastWatered !== nowStr) {
          const { streakDays, longestStreakDays } = get();
          const newStreak = streakDays + 1;
          const newLongest = Math.max(newStreak, longestStreakDays);
          set({
            lastWatered: nowStr,
            streakDays: newStreak,
            longestStreakDays: newLongest,
          });
        }

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
          get().refreshStats();
          get().refreshPredictions();
          get().refreshInsights();

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
        const { plants, weather, profile, entries } = get();
        if (!weather || !profile) return;

        // Check streak auto-reset
        if (checkStreakReset(plants)) {
          set({ streakDays: 0 });
        }

        // Calculate gardener level
        const harvestCount = entries.filter(e => e.type === 'harvest').length;
        const onboardingDate = profile.onboardingDate ? parseISO(profile.onboardingDate) : new Date();
        const daysSinceOnboarding = differenceInDays(new Date(), onboardingDate);
        const newLevel = calculateGardenerLevel(plants.length, harvestCount, daysSinceOnboarding);
        set({ gardenerLevel: newLevel });

        const recommendations = plants.map(plant =>
          getWateringRecommendation(plant, weather, profile)
        );
        const tips = generateTips(plants, weather, profile);
        set({ recommendations, tips });

        try {
          useChoreStore.getState().generateAutoChores(plants, recommendations, profile);
        } catch {
          // ignore — chore store may not be hydrated yet
        }

        if (profile.notificationsEnabled) {
          scheduleDailyWateringNotification(plants, recommendations, weather, profile.notificationHour);
        }
      },

      setAIChatMessages: (messages) => set({ aiChatMessages: messages }),

      addAIChatMessage: (message) => {
        set(s => ({ aiChatMessages: [...s.aiChatMessages, message] }));
      },

      clearAIChatHistory: () => set({ aiChatMessages: [] }),

      setAIChatRateLimit: (status) => set({ aiChatRateLimit: status }),

      // Backup
      setBackups: (backups) => set({ backups }),
      addBackup: (meta) => set(s => ({ backups: [meta, ...s.backups], lastBackupTime: meta.timestamp })),
      setLastBackupTime: (time) => set({ lastBackupTime: time }),
      setPlants: (plants) => {
        set({ plants });
        get().refreshRecommendations();
      },
      setEntries: (entries) => {
        set({ entries });
        get().refreshStats();
      },

      addGardenBed: (bed) => {
        const newBed: GardenBed = {
          ...bed,
          id: generateId(),
          cells: createEmptyCells(bed.rows, bed.cols),
        };
        set(s => ({ gardenBeds: [...s.gardenBeds, newBed] }));
      },

      updateGardenBed: (bedId, partial) => {
        set(s => ({
          gardenBeds: s.gardenBeds.map(bed =>
            bed.id === bedId ? { ...bed, ...partial } : bed
          ),
        }));
      },

      deleteGardenBed: (bedId) => {
        set(s => ({
          gardenBeds: s.gardenBeds.filter(bed => bed.id !== bedId),
        }));
      },

      setBedCell: (bedId, row, col, plantId) => {
        set(s => ({
          gardenBeds: s.gardenBeds.map(bed =>
            bed.id === bedId
              ? {
                  ...bed,
                  cells: bed.cells.map(cell =>
                    cell.row === row && cell.col === col ? { ...cell, plantId } : cell
                  ),
                }
              : bed
          ),
        }));
      },

      resizeBed: (bedId, rows, cols) => {
        set(s => ({
          gardenBeds: s.gardenBeds.map(bed =>
            bed.id === bedId
              ? {
                  ...bed,
                  rows,
                  cols,
                  cells: createEmptyCells(rows, cols),
                }
              : bed
          ),
        }));
      },

      // Advanced metrics methods
      refreshGardenMetrics: () => {
        const { plants, entries, weather, profile } = get();
        const gardenMetrics = calculateGardenMetrics(plants, entries, weather, profile);
        const plantMetricsArray = plants.map(p => calculatePlantMetrics(p, entries));
        const chartData = calculateTimeSeriesData(entries, plants, weather);
        set({ gardenMetrics, plantMetrics: plantMetricsArray, chartData });
      },

      refreshPredictions: () => {
        const { plants, entries, weather, profile } = get();
        const predictions = generatePredictions(plants, entries, weather, profile);
        set({ predictions });
      },

      refreshInsights: () => {
        const { gardenMetrics, predictions, weather, profile } = get();
        if (!gardenMetrics || !predictions) return;
        const insights = prioritizeInsights(generateGardenInsights(gardenMetrics, predictions, weather, profile));
        set({ insights });
      },

      setMetricsPeriod: (period) => {
        set({ selectedMetricsPeriod: period });
      },

      setDateRange: (range) => {
        set({ selectedDateRange: range });
      },

      // Retention gamification actions
      updateStreakDays: (days) => {
        set({ streakDays: days });
      },

      setLongestStreakDays: (days) => {
        set({ longestStreakDays: days });
      },

      setLastWatered: (date) => {
        set({ lastWatered: date });
      },

      setHarvestGoal: (kg) => {
        const current = get().profile;
        if (!current) return;
        const now = new Date();
        const currentMonth = new Intl.DateTimeFormat('sv-SE', {
          year: 'numeric',
          month: '2-digit',
        }).format(now);
        set({ profile: { ...current, harvestGoal: kg, harvestGoalMonth: currentMonth } });
      },

      setDailyTipEnabled: (enabled) => {
        const current = get().profile;
        if (!current) return;
        set({ profile: { ...current, dailyTipEnabled: enabled } });
      },

      setDailyTipTime: (time) => {
        const current = get().profile;
        if (!current) return;
        set({ profile: { ...current, dailyTipTime: time } });
      },

      recordDailyTip: (date) => {
        set({ lastDailyTipDate: date });
      },
    }),
    {
      name: 'garden-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        profile: state.profile,
        plants: state.plants,
        entries: state.entries,
        weather: state.weather,
        backups: state.backups,
        lastBackupTime: state.lastBackupTime,
        gardenBeds: state.gardenBeds,
        streakDays: state.streakDays,
        longestStreakDays: state.longestStreakDays,
        lastWatered: state.lastWatered,
        gardenerLevel: state.gardenerLevel,
        lastDailyTipDate: state.lastDailyTipDate,
      }),
    }
  )
);
