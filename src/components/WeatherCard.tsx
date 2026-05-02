import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { WeatherData } from '../types';
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import { getWeatherIconUrl } from '../services/weather';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Props {
  weather: WeatherData;
}

export default function WeatherCard({ weather }: Props) {
  const forecastDays = weather.forecast.slice(0, 4);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.city}>{weather.city}</Text>
          <Text style={styles.description}>{weather.description}</Text>
        </View>
        <View style={styles.tempRow}>
          <Image
            source={{ uri: getWeatherIconUrl(weather.icon) }}
            style={styles.icon}
          />
          <Text style={styles.temp}>{weather.temperature}°C</Text>
        </View>
      </View>

      <View style={styles.details}>
        <DetailItem emoji="💧" label={`Humidité ${weather.humidity}%`} />
        <DetailItem emoji="💨" label={`Vent ${weather.windSpeed} km/h`} />
        <DetailItem emoji="🌡️" label={`Ressenti ${weather.feelsLike}°C`} />
        {weather.rain1h > 0 && <DetailItem emoji="🌧️" label={`Pluie ${weather.rain1h} mm/h`} />}
      </View>

      <View style={styles.forecast}>
        {forecastDays.map((day) => (
          <View key={day.date} style={styles.forecastDay}>
            <Text style={styles.forecastDate}>
              {format(parseISO(day.date), 'EEE', { locale: fr })}
            </Text>
            <Image
              source={{ uri: getWeatherIconUrl(day.icon) }}
              style={styles.forecastIcon}
            />
            <Text style={styles.forecastTemp}>{Math.round(day.tempMax)}°</Text>
            <Text style={styles.forecastTempMin}>{Math.round(day.tempMin)}°</Text>
            {day.rain > 0 && (
              <Text style={styles.forecastRain}>{day.rain.toFixed(0)}mm</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

function DetailItem({ emoji, label }: { emoji: string; label: string }) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailEmoji}>{emoji}</Text>
      <Text style={styles.detailLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  city: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  description: {
    color: colors.secondary,
    fontSize: 13,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 48,
    height: 48,
  },
  temp: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '700',
    marginLeft: -4,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailEmoji: {
    fontSize: 14,
  },
  detailLabel: {
    color: colors.secondary,
    fontSize: 12,
  },
  forecast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: spacing.sm,
  },
  forecastDay: {
    alignItems: 'center',
    flex: 1,
  },
  forecastDate: {
    color: colors.secondary,
    fontSize: 11,
    textTransform: 'capitalize',
    marginBottom: 2,
  },
  forecastIcon: {
    width: 32,
    height: 32,
  },
  forecastTemp: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  forecastTempMin: {
    color: colors.secondary,
    fontSize: 11,
  },
  forecastRain: {
    color: '#90CAF9',
    fontSize: 10,
    marginTop: 1,
  },
});
