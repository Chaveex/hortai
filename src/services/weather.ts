import axios from 'axios';
import { WeatherData, ForecastDay, WeatherHistory } from '../types';
import { detectClimateType, detectSeason, detectClimateTypeFromAPI } from './climateDetection';
import { format, subDays, parseISO } from 'date-fns';

const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY ?? '';
const BASE_URL = 'https://api.openweathermap.org';

// In-memory cache of weather history (last 7 days)
let weatherHistoryCache: WeatherHistory[] = [];

export interface GeoResult {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export async function geocodeCity(city: string): Promise<GeoResult> {
  const response = await axios.get(`${BASE_URL}/geo/1.0/direct`, {
    params: { q: city, limit: 1, appid: API_KEY },
  });
  if (!response.data || response.data.length === 0) {
    throw new Error(`Ville introuvable: ${city}`);
  }
  const r = response.data[0];
  return { name: r.local_names?.fr ?? r.name, lat: r.lat, lon: r.lon, country: r.country, state: r.state };
}

export async function fetchWeather(lat: number, lon: number, cityName: string): Promise<WeatherData> {
  const [currentRes, forecastRes] = await Promise.all([
    axios.get(`${BASE_URL}/data/2.5/weather`, {
      params: { lat, lon, units: 'metric', lang: 'fr', appid: API_KEY },
    }),
    axios.get(`${BASE_URL}/data/2.5/forecast`, {
      params: { lat, lon, units: 'metric', lang: 'fr', appid: API_KEY },
    }),
  ]);

  const current = currentRes.data;
  const forecastData = forecastRes.data.list;

  const dailyMap = new Map<string, { temps: number[]; rain: number; description: string; icon: string; humidity: number[] }>();
  for (const item of forecastData) {
    const date = item.dt_txt.split(' ')[0];
    if (!dailyMap.has(date)) {
      dailyMap.set(date, { temps: [], rain: 0, description: item.weather[0].description, icon: item.weather[0].icon, humidity: [] });
    }
    const day = dailyMap.get(date)!;
    day.temps.push(item.main.temp);
    day.humidity.push(item.main.humidity);
    day.rain += item.rain?.['3h'] ?? 0;
    if (item.weather[0].id < 800) {
      day.description = item.weather[0].description;
      day.icon = item.weather[0].icon;
    }
  }

  const forecast: ForecastDay[] = Array.from(dailyMap.entries())
    .slice(0, 5)
    .map(([date, data]) => ({
      date,
      tempMin: Math.min(...data.temps),
      tempMax: Math.max(...data.temps),
      rain: Math.round(data.rain * 10) / 10,
      description: data.description,
      icon: data.icon,
      humidity: Math.round(data.humidity.reduce((a, b) => a + b, 0) / data.humidity.length),
    }));

  // Build weather history: keep last 3 days + add today
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayHistory: WeatherHistory = {
    date: today,
    tempMax: Math.round(current.main.temp_max),
    tempMin: Math.round(current.main.temp_min),
    rain: Math.round((current.rain?.['1h'] ?? 0) * 10) / 10,
    humidity: current.main.humidity,
  };

  // Remove today if already in cache, add new today entry
  weatherHistoryCache = weatherHistoryCache.filter(h => h.date !== today);
  weatherHistoryCache.push(todayHistory);

  // Keep last 7 days only
  if (weatherHistoryCache.length > 7) {
    weatherHistoryCache = weatherHistoryCache.slice(-7);
  }

  // Return last 3 days + today for watering calculations
  const history = weatherHistoryCache.slice(-4);

  const month = new Date().getMonth() + 1;
  // Try API first, fallback to local detection
  const climateType = (await detectClimateTypeFromAPI(lat, lon)) || detectClimateType(lat, cityName);
  const season = detectSeason(lat, month);

  return {
    temperature: Math.round(current.main.temp),
    feelsLike: Math.round(current.main.feels_like),
    humidity: current.main.humidity,
    description: current.weather[0].description,
    icon: current.weather[0].icon,
    windSpeed: Math.round(current.wind.speed * 3.6),
    rain1h: current.rain?.['1h'] ?? 0,
    forecast,
    history, // Last 3 days + today
    lastUpdated: new Date().toISOString(),
    city: cityName,
    climateType,
    season,
  };
}

export function getWeatherIconUrl(icon: string): string {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

export function isFrostRisk(forecast: ForecastDay[]): boolean {
  return forecast.slice(0, 3).some(d => d.tempMin <= 2);
}

export function isHeatWave(forecast: ForecastDay[]): boolean {
  return forecast.slice(0, 3).some(d => d.tempMax >= 35);
}

