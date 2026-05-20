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
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import { getLastNMonths } from '../services/statistics';
import { PLANT_DATABASE } from '../constants/plants';
import { getHealthData } from '../services/dashboardAggregation';

interface HealthFactor {
  label: string;
  score: number;
  icon: string;
}

export function HealthScoreDashboard() {
  const navigation = useNavigation<any>();
  const { plants, entries, weather, stats } = useStore();

  // Calculate health factors
  const healthFactors = useMemo((): HealthFactor[] => {
    const now = new Date();

    // Water health
    let waterHealth = 100;
    let overwateredCount = 0;
    let underwateredCount = 0;

    plants.forEach(p => {
      const info = PLANT_DATABASE[p.type];
      if (!p.lastWatered) {
        underwateredCount++;
      } else {
        const daysSince = differenceInDays(now, parseISO(p.lastWatered));
        if (daysSince > info.wateringFrequencyDays * 1.5) {
          underwateredCount++;
        } else if (daysSince < info.wateringFrequencyDays * 0.5) {
          overwateredCount++;
        }
      }
    });

    waterHealth -= underwateredCount * 8;
    waterHealth -= overwateredCount * 5;
    waterHealth = Math.max(0, Math.min(100, waterHealth));

    // Nutrient health (based on gardening style)
    let nutrientHealth = 75;
    // This would normally be based on fertilizer schedule tracking

    // Weather resilience
    let weatherHealth = 80;
    if (weather) {
      if (weather.temperature < 0 || weather.temperature > 35) {
        weatherHealth -= 20;
      }
      if (weather.windSpeed > 30) {
        weatherHealth -= 10;
      }
    }
    weatherHealth = Math.max(0, Math.min(100, weatherHealth));

    // Growth stage health
    let growthHealth = 85;
    plants.forEach(p => {
      const daysAlive = differenceInDays(now, parseISO(p.plantedDate));
      const info = PLANT_DATABASE[p.type];
      const expectedDaysToMaturity = info?.harvestDays || 60;
      const progress = Math.min(daysAlive / expectedDaysToMaturity, 1);
      if (progress < 0.1 || progress > 0.9) {
        growthHealth -= 5;
      }
    });
    growthHealth = Math.max(0, Math.min(100, growthHealth));

    // Harvest health
    let harvestHealth = Math.max(50, stats?.healthScore ?? 70);

    return [
      { label: 'Arrosage', score: waterHealth, icon: '💧' },
      { label: 'Nutriments', score: nutrientHealth, icon: '🧬' },
      { label: 'Météo', score: weatherHealth, icon: '🌤️' },
      { label: 'Croissance', score: growthHealth, icon: '📈' },
      { label: 'Récolte', score: harvestHealth, icon: '🥕' },
    ];
  }, [plants, weather, stats]);

  // Health trend (real data from entries)
  const healthTrend = useMemo(() => {
    const now = new Date();
    const months = getLastNMonths(6);

    return months.map(yearMonth => {
      const [year, month] = yearMonth.split('-').map(Number);
      const monthDate = new Date(year, month - 1, 1);
      let monthHealthScore = 100;

      // Water health for this month
      plants.forEach(p => {
        const info = PLANT_DATABASE[p.type];
        if (!p.lastWatered) {
          monthHealthScore -= 5;
        } else {
          const daysSince = differenceInDays(monthDate, parseISO(p.lastWatered));
          if (daysSince > info.wateringFrequencyDays * 1.5) {
            monthHealthScore -= 8;
          }
        }
      });

      // Harvest bonus (count entries in this month)
      const monthHarvests = entries.filter(e => {
        if (e.type !== 'harvest') return false;
        try {
          const eMonth = parseISO(e.date).toISOString().slice(0, 7);
          return eMonth === yearMonth;
        } catch {
          return false;
        }
      }).length;
      monthHealthScore += Math.min(20, monthHarvests * 4);

      monthHealthScore = Math.max(0, Math.min(100, monthHealthScore));

      return {
        label: yearMonth.slice(5),
        value: Math.round(monthHealthScore),
      };
    });
  }, [plants, entries]);

  // Problematic plants
  const problematicPlants = useMemo(() => {
    return plants
      .map(p => {
        let plantHealth = 100;
        const info = PLANT_DATABASE[p.type];
        const now = new Date();

        if (!p.lastWatered) {
          plantHealth -= 20;
        } else {
          const daysSince = differenceInDays(now, parseISO(p.lastWatered));
          if (daysSince > info.wateringFrequencyDays * 1.5) {
            plantHealth -= 20;
          }
        }

        return { plant: p, health: Math.max(0, plantHealth) };
      })
      .filter(item => item.health < 80)
      .sort((a, b) => a.health - b.health)
      .slice(0, 5);
  }, [plants]);

  const overallHealth = stats?.healthScore ?? 75;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.headerBack}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Santé du Jardin</Text>
          <Text style={styles.headerSubtitle}>État global et facteurs</Text>
        </View>

        {/* Overall health gauge */}
        <View style={styles.gaugeSection}>
          <HealthScoreGauge
            score={overallHealth}
            label="Score global"
            size={140}
          />
        </View>

        {/* Health factors grid */}
        <View style={styles.factorsSection}>
          <Text style={styles.sectionTitle}>Facteurs de santé</Text>
          <View style={styles.factorGrid}>
            {healthFactors.map((factor, idx) => (
              <View key={idx} style={styles.factorCard}>
                <Text style={styles.factorIcon}>{factor.icon}</Text>
                <Text style={styles.factorLabel}>{factor.label}</Text>
                <View style={styles.factorScoreBar}>
                  <View
                    style={[
                      styles.factorScoreFill,
                      { width: `${factor.score}%` },
                    ]}
                  />
                </View>
                <Text style={styles.factorScore}>{factor.score.toFixed(0)}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Health trend */}
        <View style={styles.section}>
          <LineChart
            data={healthTrend}
            title="Tendance de santé (6 derniers mois)"
            unit=" %"
            height={200}
            lineColor={colors.success}
            backgroundColor={colors.surface}
          />
        </View>

        {/* Problematic plants */}
        {problematicPlants.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Plantes à surveiller</Text>
            <View style={styles.problemList}>
              {problematicPlants.map((item, idx) => (
                <View
                  key={item.plant.id}
                  style={[
                    styles.problemItem,
                    idx === problematicPlants.length - 1 && styles.problemItemLast,
                  ]}
                >
                  <View style={styles.problemRank}>
                    <Text style={styles.problemRankText}>{idx + 1}</Text>
                  </View>
                  <View style={styles.problemContent}>
                    <Text style={styles.problemName}>{item.plant.name}</Text>
                    <View style={styles.problemScoreBar}>
                      <View
                        style={[
                          styles.problemScoreFill,
                          {
                            width: `${item.health}%`,
                            backgroundColor: item.health > 60 ? colors.warning : colors.error,
                          },
                        ]}
                      />
                    </View>
                  </View>
                  <Text style={styles.problemScore}>{item.health.toFixed(0)}%</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommandations</Text>
          <View style={styles.recommendationList}>
            {healthFactors
              .filter(f => f.score < 80)
              .map((factor, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.recommendationItem,
                    idx === Math.min(3, healthFactors.filter(f => f.score < 80).length - 1) &&
                      styles.recommendationItemLast,
                  ]}
                >
                  <Text style={styles.recommendationIcon}>💡</Text>
                  <Text style={styles.recommendationText}>
                    Améliorer {factor.label.toLowerCase()} ({factor.score.toFixed(0)}%)
                  </Text>
                </View>
              ))}
          </View>
        </View>

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
  factorsSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  factorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  factorCard: {
    flex: 1,
    minWidth: '45%',
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
  factorIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  factorLabel: {
    ...typography.label,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  factorScoreBar: {
    width: '100%',
    height: 10,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  factorScoreFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: borderRadius.full,
  },
  factorScore: {
    ...typography.label,
    fontSize: 11,
    color: colors.textSecondary,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  problemList: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  problemItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  problemItemLast: {
    borderBottomWidth: 0,
  },
  problemRank: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.warning,
    justifyContent: 'center',
    alignItems: 'center',
  },
  problemRankText: {
    color: colors.surface,
    fontWeight: '700' as const,
    fontSize: 14,
  },
  problemContent: {
    flex: 1,
  },
  problemName: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  problemScoreBar: {
    height: 10,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  problemScoreFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  problemScore: {
    ...typography.label,
    fontWeight: '700' as const,
    color: colors.text,
    minWidth: 45,
    textAlign: 'right',
  },
  recommendationList: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  recommendationItemLast: {
    borderBottomWidth: 0,
  },
  recommendationIcon: {
    fontSize: 20,
  },
  recommendationText: {
    ...typography.body,
    flex: 1,
    color: colors.text,
  },
  spacer: {
    height: spacing.lg,
  },
});
