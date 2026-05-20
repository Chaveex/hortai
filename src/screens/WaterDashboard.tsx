import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { parseISO, differenceInDays } from 'date-fns';
import { useStore } from '../store/useStore';
import { HealthScoreGauge } from '../components/Dashboard/HealthScoreGauge';
import { LineChart } from '../components/Charts/LineChart';
import { LeaderboardRow } from '../components/Insights/LeaderboardRow';
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import { getLastNMonths } from '../services/statistics';
import { PLANT_DATABASE } from '../constants/plants';
import { getWateringNarrative } from '../services/recommendations';

export function WaterDashboard() {
  const navigation = useNavigation<any>();
  const { plants, recommendations, weather } = useStore();

  // Calculate water consumption
  const waterMetrics = useMemo(() => {
    let totalWaterNeeded = 0;
    let currentWaterUsage = 0;

    const now = new Date();
    plants.forEach(p => {
      const info = PLANT_DATABASE[p.type];
      if (!info) return;

      const daysAlive = Math.min(30, Math.max(0, differenceInDays(now, parseISO(p.plantedDate))));
      const monthlyNeed = info.dailyWaterNeed * 30;
      totalWaterNeeded += monthlyNeed;

      // Estimate actual usage based on watering history
      const wateringCount = p.wateringHistory?.length || 0;
      if (wateringCount > 0) {
        currentWaterUsage += (wateringCount / 30) * (info.dailyWaterNeed * 2);
      }
    });

    const efficiency = totalWaterNeeded > 0
      ? ((currentWaterUsage / totalWaterNeeded) * 100)
      : 0;

    return {
      recommended: totalWaterNeeded,
      actual: currentWaterUsage,
      efficiency: Math.min(100, efficiency),
    };
  }, [plants]);

  // Water usage by month
  const waterUsageByMonth = useMemo(() => {
    const months = getLastNMonths(6);
    return months.map(yearMonth => {
      let waterCount = 0;
      plants.forEach(p => {
        const info = PLANT_DATABASE[p.type];
        if (!info) return;
        waterCount += info.dailyWaterNeed;
      });

      return {
        label: yearMonth.slice(5),
        value: waterCount * 30, // Estimate monthly usage
      };
    });
  }, [plants]);

  // Plants by water needs
  const plantsByWaterNeed = useMemo(() => {
    return plants
      .map(p => {
        const info = PLANT_DATABASE[p.type];
        return {
          plant: p,
          dailyNeed: info?.dailyWaterNeed || 0,
          monthlyNeed: (info?.dailyWaterNeed || 0) * 30,
        };
      })
      .sort((a, b) => b.monthlyNeed - a.monthlyNeed)
      .slice(0, 6);
  }, [plants]);

  const maxWaterNeed = Math.max(...plantsByWaterNeed.map(p => p.monthlyNeed), 0);

  // Watering recommendations
  const urgentWatering = useMemo(() => {
    return recommendations
      .filter(r => r.shouldWater && r.urgency === 'high')
      .slice(0, 5);
  }, [recommendations]);

  // Water narrative banner (estimated week total)
  const wateringNarrative = useMemo(() => {
    // Estimate this week's total based on actual usage (simplified)
    const weekTotal = waterMetrics.actual / 4.3; // Roughly 1 week of monthly average
    const weekExpected = waterMetrics.recommended / 4.3;
    return getWateringNarrative(weekTotal, weekExpected, weather || { humidity: 60, temperature: 20 } as any);
  }, [waterMetrics, weather]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.headerBack}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Consommation Eau</Text>
          <Text style={styles.headerSubtitle}>Gestion de l'irrigation</Text>
        </View>

        {/* Water efficiency gauge */}
        <View style={styles.gaugeSection}>
          <HealthScoreGauge
            score={waterMetrics.efficiency}
            label="Efficacité hydrique"
            size={140}
          />
        </View>

        {/* Water metrics */}
        <View style={styles.metricsRow}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Recommandé</Text>
            <Text style={styles.metricValue}>
              {waterMetrics.recommended.toFixed(0)}
              <Text style={styles.metricUnit}> L</Text>
            </Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Réel</Text>
            <Text style={styles.metricValue}>
              {waterMetrics.actual.toFixed(0)}
              <Text style={styles.metricUnit}> L</Text>
            </Text>
          </View>
        </View>

        {/* Watering narrative banner */}
        <View style={styles.narrativeSection}>
          <View style={styles.narrativeCard}>
            <Text style={styles.narrativeText}>{wateringNarrative}</Text>
          </View>
        </View>

        {/* Usage history */}
        <View style={styles.section}>
          <LineChart
            data={waterUsageByMonth}
            title="Consommation (6 derniers mois)"
            unit=" L"
            height={220}
            lineColor={colors.secondary}
            backgroundColor={colors.surface}
          />
        </View>

        {/* Urgent watering needs */}
        {urgentWatering.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>À arroser en priorité</Text>
            <View style={styles.alertList}>
              {urgentWatering.map(rec => {
                const plant = plants.find(p => p.id === rec.plantId);
                if (!plant) return null;
                return (
                  <View key={rec.plantId} style={styles.alertItem}>
                    <Text style={styles.alertEmoji}>💧</Text>
                    <View style={styles.alertContent}>
                      <Text style={styles.alertName}>{plant.name}</Text>
                      <Text style={styles.alertReason}>{rec.reason}</Text>
                    </View>
                    <Text style={styles.alertAmount}>{rec.amount.toFixed(1)}L</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Water needs ranking */}
        {plantsByWaterNeed.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Besoins en eau mensuels</Text>
            <View style={styles.leaderboard}>
              {plantsByWaterNeed.map((item, idx) => (
                <LeaderboardRow
                  key={item.plant.id}
                  rank={idx + 1}
                  icon={PLANT_DATABASE[item.plant.type]?.icon || '🌿'}
                  name={item.plant.name}
                  value={item.monthlyNeed}
                  unit=" L"
                  percentOfMax={maxWaterNeed > 0 ? (item.monthlyNeed / maxWaterNeed) * 100 : 0}
                />
              ))}
            </View>
          </View>
        )}

        {/* Weather note */}
        {weather && (
          <View style={styles.weatherNote}>
            <Text style={styles.weatherIcon}>🌤️</Text>
            <View style={styles.weatherContent}>
              <Text style={styles.weatherTitle}>Conditions actuelles</Text>
              <Text style={styles.weatherDescription}>
                {weather.description} - Humidité: {weather.humidity}%
              </Text>
            </View>
          </View>
        )}

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
  },
  headerBack: {
    ...typography.body,
    color: colors.secondary,
    marginBottom: spacing.sm,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.surface,
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.secondary,
  },
  gaugeSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  metricBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricLabel: {
    ...typography.caption,
    marginBottom: spacing.sm,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  metricUnit: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  narrativeSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  narrativeCard: {
    backgroundColor: '#E8F4F8',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary,
  },
  narrativeText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 20,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  alertList: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  alertEmoji: {
    fontSize: 24,
  },
  alertContent: {
    flex: 1,
  },
  alertName: {
    ...typography.label,
    color: colors.text,
    marginBottom: 2,
  },
  alertReason: {
    ...typography.caption,
    color: colors.textMuted,
  },
  alertAmount: {
    ...typography.label,
    fontWeight: '700' as const,
    color: colors.secondary,
  },
  leaderboard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  weatherNote: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  weatherIcon: {
    fontSize: 32,
  },
  weatherContent: {
    flex: 1,
  },
  weatherTitle: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  weatherDescription: {
    ...typography.body,
    color: colors.text,
    fontSize: 12,
  },
  spacer: {
    height: spacing.lg,
  },
});
