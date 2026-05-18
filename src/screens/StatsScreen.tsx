import React, { useEffect, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useStore } from '../store/useStore';
import { getLastNMonths, getRegionalAverage } from '../services/statistics';
import { getClimateTips } from '../services/climateDetection';
import { PLANT_DATABASE } from '../constants/plants';
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import { ClimateType, Season } from '../types';

// ─── Mini bar chart (pure RN views) ─────────────────────────────────────────

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  maxValue?: number;
  height?: number;
}

function BarChart({ data, maxValue, height = 120 }: BarChartProps) {
  const max = maxValue ?? Math.max(...data.map(d => d.value), 0.01);
  return (
    <View style={[bcStyles.container, { height: height + 36 }]}>
      <View style={[bcStyles.barsRow, { height }]}>
        {data.map((item, i) => {
          const ratio = max > 0 ? item.value / max : 0;
          const barH = Math.max(ratio * height, item.value > 0 ? 4 : 0);
          return (
            <View key={i} style={bcStyles.barWrapper}>
              <Text style={bcStyles.valueText}>
                {item.value > 0 ? item.value.toFixed(item.value < 1 ? 2 : 1) : ''}
              </Text>
              <View style={bcStyles.barTrack}>
                <View
                  style={[
                    bcStyles.bar,
                    { height: barH, backgroundColor: item.color ?? colors.primary },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
      <View style={bcStyles.labelsRow}>
        {data.map((item, i) => (
          <Text key={i} style={bcStyles.label} numberOfLines={1}>{item.label}</Text>
        ))}
      </View>
    </View>
  );
}

const bcStyles = StyleSheet.create({
  container: { width: '100%' },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.xs,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 2,
  },
  barTrack: {
    width: '70%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  valueText: {
    fontSize: 9,
    color: colors.textMuted,
    marginBottom: 2,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.xs,
    marginTop: 4,
  },
  label: {
    flex: 1,
    textAlign: 'center',
    fontSize: 9,
    color: colors.textSecondary,
  },
});

// ─── Gauge widget ─────────────────────────────────────────────────────────────

function HealthGauge({ score }: { score: number }) {
  const color =
    score >= 75 ? colors.success :
    score >= 50 ? colors.accent :
    colors.warning;

  return (
    <View style={gaugeStyles.container}>
      <View style={gaugeStyles.track}>
        <View style={[gaugeStyles.fill, { width: `${score}%`, backgroundColor: color }]} />
      </View>
      <Text style={[gaugeStyles.label, { color }]}>{score}/100</Text>
    </View>
  );
}

const gaugeStyles = StyleSheet.create({
  container: { width: '100%', alignItems: 'center', gap: 6 },
  track: {
    width: '100%',
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 7 },
  label: { fontSize: 20, fontWeight: '700' },
});

// ─── Climate badge ────────────────────────────────────────────────────────────

const CLIMATE_LABELS: Record<ClimateType, { label: string; emoji: string; color: string }> = {
  mediterranean: { label: 'Méditerranéen', emoji: '☀️', color: '#F4A261' },
  oceanic:       { label: 'Océanique',      emoji: '🌊', color: '#457B9D' },
  continental:   { label: 'Continental',    emoji: '🌲', color: '#52796F' },
  mountain:      { label: 'Montagnard',     emoji: '⛰️', color: '#6D6875' },
  tropical:      { label: 'Tropical',       emoji: '🌴', color: '#2D6A4F' },
};

const SEASON_LABELS: Record<Season, { label: string; emoji: string }> = {
  spring: { label: 'Printemps', emoji: '🌸' },
  summer: { label: 'Été',        emoji: '☀️' },
  autumn: { label: 'Automne',    emoji: '🍂' },
  winter: { label: 'Hiver',      emoji: '❄️' },
};

const TREND_CONFIG = {
  up:     { emoji: '📈', label: 'En hausse',  color: colors.success },
  stable: { emoji: '➡️', label: 'Stable',     color: colors.accent },
  down:   { emoji: '📉', label: 'En baisse',  color: colors.warning },
};

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function StatsScreen() {
  const navigation = useNavigation();
  const { stats, plants, entries, weather, refreshStats, isLoadingWeather } = useStore();

  useEffect(() => {
    refreshStats();
  }, []);

  const months6 = useMemo(() => getLastNMonths(6), []);

  const monthlyChartData = useMemo(() =>
    months6.map(ym => ({
      label: ym.slice(5), // MM
      value: stats?.monthlyProduction[ym] ?? 0,
      color: colors.primaryLight,
    })),
  [months6, stats]);

  // Top 5 harvested plants
  const harvestRanking = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.totalHarvest)
      .map(([plantId, kg]) => {
        const plant = plants.find(p => p.id === plantId);
        const info = plant ? PLANT_DATABASE[plant.type] : null;
        const regional = plant ? getRegionalAverage(plant.type) : 1;
        return {
          plantId,
          name: info?.frenchName ?? plant?.name ?? plantId,
          icon: info?.icon ?? '🌱',
          kg,
          regional,
          pct: regional > 0 ? Math.round((kg / regional) * 100) : 0,
        };
      })
      .sort((a, b) => b.kg - a.kg)
      .slice(0, 6);
  }, [stats, plants]);

  const climateTips = useMemo(() => {
    if (!weather?.climateType || !weather?.season) return [];
    return getClimateTips(weather.climateType, weather.season);
  }, [weather]);

  const climateInfo = weather?.climateType ? CLIMATE_LABELS[weather.climateType] : null;
  const seasonInfo  = weather?.season      ? SEASON_LABELS[weather.season]       : null;
  const trend       = stats ? TREND_CONFIG[stats.productivityTrend] : null;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Statistiques</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isLoadingWeather} onRefresh={refreshStats} />
        }
      >
        {/* Climate + season badges */}
        {(climateInfo || seasonInfo) && (
          <View style={styles.badgeRow}>
            {climateInfo && (
              <View style={[styles.badge, { backgroundColor: climateInfo.color + '22', borderColor: climateInfo.color }]}>
                <Text style={styles.badgeEmoji}>{climateInfo.emoji}</Text>
                <Text style={[styles.badgeText, { color: climateInfo.color }]}>{climateInfo.label}</Text>
              </View>
            )}
            {seasonInfo && (
              <View style={[styles.badge, { backgroundColor: colors.secondary + '44', borderColor: colors.border }]}>
                <Text style={styles.badgeEmoji}>{seasonInfo.emoji}</Text>
                <Text style={[styles.badgeText, { color: colors.text }]}>{seasonInfo.label}</Text>
              </View>
            )}
          </View>
        )}

        {/* Summary cards row */}
        <View style={styles.cardsRow}>
          {/* Total harvest */}
          <View style={[styles.card, styles.cardThird]}>
            <Text style={styles.cardEmoji}>🌾</Text>
            <Text style={styles.cardValue}>
              {stats
                ? Object.values(stats.totalHarvest).reduce((a, b) => a + b, 0).toFixed(1)
                : '—'}
              <Text style={styles.cardUnit}> kg</Text>
            </Text>
            <Text style={styles.cardLabel}>Récolte totale</Text>
          </View>

          {/* Water */}
          <View style={[styles.card, styles.cardThird]}>
            <Text style={styles.cardEmoji}>💧</Text>
            <Text style={styles.cardValue}>
              {stats ? stats.waterConsumption : '—'}
              <Text style={styles.cardUnit}> L</Text>
            </Text>
            <Text style={styles.cardLabel}>Eau / mois</Text>
          </View>

          {/* Trend */}
          <View style={[styles.card, styles.cardThird]}>
            <Text style={styles.cardEmoji}>{trend?.emoji ?? '—'}</Text>
            <Text style={[styles.cardValue, { fontSize: 14 }, trend ? { color: trend.color } : {}]}>
              {trend?.label ?? '—'}
            </Text>
            <Text style={styles.cardLabel}>Tendance</Text>
          </View>
        </View>

        {/* Health score */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Score de santé du jardin</Text>
          <HealthGauge score={stats?.healthScore ?? 0} />
          <Text style={styles.caption}>
            Basé sur la régularité d'arrosage, les récoltes récentes et les conditions météo.
          </Text>
        </View>

        {/* Monthly production chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Production mensuelle (kg) — 6 derniers mois</Text>
          {monthlyChartData.every(d => d.value === 0) ? (
            <Text style={styles.empty}>Aucune récolte enregistrée encore.</Text>
          ) : (
            <BarChart data={monthlyChartData} height={130} />
          )}
        </View>

        {/* Per-plant harvest vs regional average */}
        {harvestRanking.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Récoltes par plante vs. moyennes régionales</Text>
            {harvestRanking.map(item => (
              <View key={item.plantId} style={styles.harvestRow}>
                <Text style={styles.harvestIcon}>{item.icon}</Text>
                <View style={styles.harvestInfo}>
                  <View style={styles.harvestLabelRow}>
                    <Text style={styles.harvestName}>{item.name}</Text>
                    <Text style={styles.harvestKg}>{item.kg.toFixed(2)} kg</Text>
                  </View>
                  <View style={styles.harvestTrack}>
                    <View
                      style={[
                        styles.harvestFill,
                        {
                          width: `${Math.min(100, item.pct)}%`,
                          backgroundColor: item.pct >= 100 ? colors.success : item.pct >= 60 ? colors.accent : colors.warning,
                        },
                      ]}
                    />
                    {/* Regional average marker at 100% */}
                  </View>
                  <Text style={styles.harvestCaption}>
                    {item.pct}% de la moyenne régionale ({item.regional} kg/plant)
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Seasonal trends section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tendances saisonnières</Text>
          {seasonInfo && (
            <View style={styles.seasonCard}>
              <Text style={styles.seasonEmoji}>{seasonInfo.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.seasonTitle}>{seasonInfo.label} — conseils de culture</Text>
                {plants.length === 0 ? (
                  <Text style={styles.caption}>Ajoutez des plantes pour voir les conseils saisonniers.</Text>
                ) : (
                  plants.slice(0, 3).map(plant => {
                    const info = PLANT_DATABASE[plant.type];
                    const season = weather?.season;
                    if (!info || !season) return null;
                    return (
                      <Text key={plant.id} style={styles.seasonTip}>
                        {info.icon} {info.frenchName}: {info.seasonalAdvice[season]}
                      </Text>
                    );
                  })
                )}
              </View>
            </View>
          )}
        </View>

        {/* Climate tips */}
        {climateTips.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Conseils pour votre climat {climateInfo ? `(${climateInfo.label})` : ''}
            </Text>
            {climateTips.map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Plant count info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aperçu du jardin</Text>
          <View style={styles.cardsRow}>
            <View style={[styles.card, styles.cardHalf]}>
              <Text style={styles.cardEmoji}>🌱</Text>
              <Text style={styles.cardValue}>{plants.length}</Text>
              <Text style={styles.cardLabel}>Plantes</Text>
            </View>
            <View style={[styles.card, styles.cardHalf]}>
              <Text style={styles.cardEmoji}>📋</Text>
              <Text style={styles.cardValue}>{entries.length}</Text>
              <Text style={styles.cardLabel}>Entrées journaux</Text>
            </View>
          </View>
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backArrow: { fontSize: 22, color: colors.primary, fontWeight: '600' },
  title: { ...typography.h2, fontSize: 18 },
  scroll: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.md },

  badgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  badgeEmoji: { fontSize: 16 },
  badgeText: { fontSize: 13, fontWeight: '600' },

  cardsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
    gap: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardThird: { flex: 1 },
  cardHalf: { flex: 1 },
  cardEmoji: { fontSize: 22 },
  cardValue: { fontSize: 18, fontWeight: '700', color: colors.text },
  cardUnit: { fontSize: 12, fontWeight: '400', color: colors.textMuted },
  cardLabel: { fontSize: 11, color: colors.textMuted, textAlign: 'center' },

  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: { ...typography.h3, fontSize: 15 },
  caption: { fontSize: 12, color: colors.textMuted, lineHeight: 17 },
  empty: { fontSize: 13, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.md },

  harvestRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  harvestIcon: { fontSize: 22, marginTop: 2 },
  harvestInfo: { flex: 1, gap: 4 },
  harvestLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  harvestName: { ...typography.label, fontSize: 13 },
  harvestKg: { fontSize: 13, fontWeight: '600', color: colors.primary },
  harvestTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  harvestFill: { height: '100%', borderRadius: 4 },
  harvestCaption: { fontSize: 11, color: colors.textMuted },

  seasonCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  seasonEmoji: { fontSize: 28 },
  seasonTitle: { ...typography.label, marginBottom: 4 },
  seasonTip: { fontSize: 12, color: colors.textSecondary, lineHeight: 18, marginBottom: 4 },

  tipRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  tipBullet: { fontSize: 14, color: colors.primary, marginTop: 1 },
  tipText: { flex: 1, fontSize: 13, color: colors.text, lineHeight: 19 },
});
