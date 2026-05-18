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

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  description: string;
  icon: string;
  windSpeed: number;
  rain1h: number;
  forecast: ForecastDay[];
  lastUpdated: string;
  city: string;
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
