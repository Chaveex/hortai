export type GardeningStyle = 'permaculture' | 'conventionnel' | 'biodynamique' | 'hydroponique';
export type FertilizerType = 'naturel' | 'industriel' | 'aucun';

export interface UserProfile {
  city: string;
  latitude: number;
  longitude: number;
  gardeningStyle: GardeningStyle;
  fertilizerType: FertilizerType;
  onboardingComplete: boolean;
  notificationsEnabled: boolean;
  notificationHour: number;
  sowingNotificationsEnabled?: boolean;
  harvestGoal?: number; // kg per month
  harvestGoalMonth?: string; // yyyy-MM
  dailyTipEnabled?: boolean;
  dailyTipTime?: string; // HH:mm
  onboardingDate?: string; // YYYY-MM-DD
  language?: 'fr' | 'en' | 'es'; // i18n language
}

export type PlantType =
  | 'tomato' | 'pepper' | 'zucchini' | 'cucumber' | 'lettuce'
  | 'carrot' | 'radish' | 'beans' | 'peas' | 'basil'
  | 'parsley' | 'mint' | 'strawberry' | 'potato' | 'onion'
  | 'garlic' | 'leek' | 'spinach' | 'chard' | 'beet' | 'broccoli' | 'corn' | 'sunflower' | 'other';

export interface Plant {
  id: string;
  name: string;
  type: PlantType;
  plantedDate: string;
  variety?: string;
  notes?: string;
  lastWatered?: string;
  location?: string;
  wateringHistory: string[];
}

export type ClimateType = 'mediterranean' | 'oceanic' | 'continental' | 'mountain' | 'tropical';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface WeatherHistory {
  date: string;
  tempMax: number;
  tempMin: number;
  rain: number;
  humidity: number;
}

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  description: string;
  icon: string;
  windSpeed: number;
  rain1h: number;
  forecast: ForecastDay[];
  history: WeatherHistory[]; // Last 3 days + today for watering calculations
  lastUpdated: string;
  city: string;
  climateType?: ClimateType;
  season?: Season;
}

export interface StatsData {
  totalHarvest: { [plantId: string]: number };
  monthlyProduction: { [yearMonth: string]: number };
  waterConsumption: number;
  healthScore: number;
  productivityTrend: 'up' | 'stable' | 'down';
}

export interface ForecastDay {
  date: string;
  tempMin: number;
  tempMax: number;
  rain: number;
  description: string;
  icon: string;
  humidity: number;
}

export interface WateringRecommendation {
  plantId: string;
  shouldWater: boolean;
  amount: number;
  reason: string;
  urgency: 'low' | 'medium' | 'high';
  nextWateringDate: string;
  skipReason?: string;
}

export interface PlantEntry {
  id: string;
  plantId: string;
  date: string;
  type: 'note' | 'harvest';
  text?: string;
  quantity?: number;
  unit?: 'kg' | 'g' | 'pièces';
}

export interface GardeningTip {
  id: string;
  title: string;
  message: string;
  type: 'watering' | 'fertilizing' | 'pruning' | 'harvesting' | 'weather' | 'general';
  priority: 'low' | 'medium' | 'high';
  plantId?: string;
  icon: string;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  photo?: string;
}

export interface RateLimitStatus {
  allowed: boolean;
  remaining: number;
  resetsAt: string;
}

export interface GardenCell {
  row: number;
  col: number;
  plantId?: string;
}

export interface GardenBed {
  id: string;
  name: string;
  location?: string;
  rows: number;
  cols: number;
  cells: GardenCell[];

  // NEW (Phase 4):
  dimensions?: { length: number; width: number; unit: 'm' | 'ft' };
  soilType?: 'loam' | 'clay' | 'sandy' | 'mixed';
  cropRotation?: { plant: PlantType; date: string }[];
  lastPrepared?: string; // YYYY-MM-DD
}

// ====== Advanced Metrics & Dashboard Types ======

export interface PlantMetrics {
  plantId: string;
  plantName: string;
  plantType: PlantType;
  totalHarvest: number; // kg
  harvestCount: number;
  averageYield: number; // kg per plant
  daysAlive: number;
  productivityScore: number; // 0-100
  healthScore: number; // 0-100
  waterEfficiency: number; // kg per liter (yield/waterUsed)
  lastHarvestDate?: string;
  nextExpectedHarvest?: string;
  growthStage: 'germination' | 'seedling' | 'vegetative' | 'flowering' | 'mature' | 'declined';
}

export interface GardenMetrics {
  totalPlants: number;
  totalHarvest: number; // kg
  waterUsedCurrentMonth: number; // liters
  averageProductivityScore: number; // 0-100
  averageHealthScore: number; // 0-100
  overallWaterEfficiency: number; // kg per liter
  mostProductivePlants: PlantMetrics[];
  leastProductivePlants: PlantMetrics[];
  plantsByProductivity: PlantMetrics[];
  seasonalProductivity: number; // kg this season
  monthlyProductionTrend: 'up' | 'stable' | 'down';
}

export interface Predictions {
  nextHarvestDate: string; // Next expected harvest across all plants
  nextHarvestPlants: Array<{ plantId: string; plantName: string; date: string }>;
  seasonalForecast: {
    expectedTotalProduction: number; // kg by end of season
    estimatedWaterNeeded: number; // liters
    riskFactors: string[];
    recommendations: string[];
  };
  waterForecast: {
    nextWeekUsage: number; // liters
    nextMonthUsage: number; // liters
  };
  healthRisks: Array<{
    plantId: string;
    plantName: string;
    riskLevel: 'low' | 'medium' | 'high';
    description: string;
    mitigation: string;
  }>;
}

export interface ComparisonMetrics {
  period1: {
    startDate: string;
    endDate: string;
    production: number; // kg
    waterUsage: number; // liters
    plantCount: number;
  };
  period2: {
    startDate: string;
    endDate: string;
    production: number; // kg
    waterUsage: number; // liters
    plantCount: number;
  };
  productionGrowth: number; // percentage
  waterEfficiencyChange: number; // percentage
  netProductivityChange: number; // percentage
  insights: string[];
}

export interface GardenInsight {
  id: string;
  category: 'productivity' | 'health' | 'efficiency' | 'seasonal' | 'risk' | 'opportunity';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  affectedPlants?: string[]; // plant IDs
  actionItems?: string[];
  generatedAt: string;
}

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface GardenChartData {
  monthlyProduction: TimeSeriesDataPoint[]; // kg per month
  weeklyWaterUsage: TimeSeriesDataPoint[]; // liters per week
  healthTrend: TimeSeriesDataPoint[]; // health score over time
  productivityByType: { [plantType: string]: number }; // total kg per type
  waterUsageByMonth: TimeSeriesDataPoint[]; // liters per month
}

export interface BarChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

// ====== Alert Types ======
export type { ChoreType } from './chores';

export interface AlertItem {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  message: string;
  icon?: string;
  action?: { label: string; onPress: () => void };
  dismissible?: boolean;
  choreTypeFilter?: Array<'watering' | 'fertilizing' | 'pruning' | 'harvesting' | 'pest' | 'weeding' | 'mulching' | 'other'>;
  onNavigate?: (filterChoreType?: Array<'watering' | 'fertilizing' | 'pruning' | 'harvesting' | 'pest' | 'weeding' | 'mulching' | 'other'>) => void;
}
