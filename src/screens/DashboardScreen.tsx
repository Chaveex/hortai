import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl, SafeAreaView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { useStore } from '../store/useStore';
import { PeriodSelector, Period } from '../components/Dashboard/PeriodSelector';
import { StatCard } from '../components/Dashboard/StatCard';
import { BarChart } from '../components/Charts/BarChart';
import { PlantComparisonCard } from '../components/Dashboard/PlantComparisonCard';
import { AlertBanner, AlertItem } from '../components/Dashboard/AlertBanner';
import { colors, spacing, typography } from '../constants/theme';
import {
  getProductionData,
  getWaterData,
  getHealthData,
  getComparisonData,
  DateRange,
} from '../services/dashboardAggregation';

export function DashboardScreen() {
  const navigation = useNavigation<any>();
  const { plants, entries, weather, refreshWeather } = useStore();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('month');

  useFocusEffect(
    React.useCallback(() => {
      refreshWeather();
    }, []),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshWeather();
    } finally {
      setRefreshing(false);
    }
  };

  // Calculate date range based on selected period
  const dateRange = useMemo((): DateRange => {
    const now = new Date();
    const end = format(now, 'yyyy-MM-dd');
    let start: string;

    switch (selectedPeriod) {
      case 'week':
        start = format(subDays(now, 7), 'yyyy-MM-dd');
        break;
      case 'season':
        start = format(subMonths(now, 3), 'yyyy-MM-dd');
        break;
      case 'year':
        start = format(subMonths(now, 12), 'yyyy-MM-dd');
        break;
      case 'month':
      default:
        start = format(subDays(now, 30), 'yyyy-MM-dd');
    }

    return { start, end };
  }, [selectedPeriod]);

  // Aggregated dashboard data
  const dashboardData = useMemo(() => {
    const production = getProductionData(entries, plants, dateRange);
    const water = getWaterData(plants, entries, weather, dateRange);
    const health = getHealthData(plants, entries, weather);
    const comparison = getComparisonData(plants, entries);

    return { production, water, health, comparison };
  }, [entries, plants, weather, dateRange]);

  // Top plants for comparison
  const topPlants = useMemo(() => {
    return dashboardData.comparison.plants
      .sort((a, b) => b.harvest - a.harvest)
      .slice(0, 3);
  }, [dashboardData.comparison]);

  // Alerts from health data
  const alerts: AlertItem[] = useMemo(() => {
    return dashboardData.health.alerts.map((alert, i) => ({
      id: `health-${i}`,
      type: alert.severity === 'warning' ? 'warning' : 'info',
      message: alert.message,
      icon: alert.severity === 'warning' ? '⚠️' : 'ℹ️',
      dismissible: true,
    }));
  }, [dashboardData.health]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tableaux de Bord</Text>
          <Text style={styles.headerSubtitle}>
            {format(new Date(), 'EEEE d MMMM')}
          </Text>
        </View>

        {/* Period Selector */}
        <PeriodSelector selected={selectedPeriod} onSelect={setSelectedPeriod} />

        {/* Alerts */}
        {alerts.length > 0 && (
          <View style={styles.alertSection}>
            <AlertBanner alerts={alerts} />
          </View>
        )}

        {/* KPI Stat Cards */}
        <View style={styles.statsSection}>
          <StatCard
            value={dashboardData.production.totalKg}
            label="Production"
            unit=" kg"
            icon="🥕"
            color={colors.accent}
            trend={dashboardData.production.trendDirection}
            onPress={() => navigation.navigate('ProductionDashboard')}
          />
          <StatCard
            value={dashboardData.water.totalL}
            label="Eau"
            unit=" L"
            icon="💧"
            color={colors.secondary}
            onPress={() => navigation.navigate('WaterDashboard')}
          />
          <StatCard
            value={dashboardData.health.currentScore}
            label="Santé"
            unit="%"
            icon="💪"
            color={colors.success}
            onPress={() => navigation.navigate('HealthDashboard')}
          />
        </View>

        {/* Production Chart */}
        <View style={styles.chartSection}>
          <BarChart
            data={dashboardData.production.chart}
            title="Production (6 derniers mois)"
            unit=" kg"
            barColor={colors.accent}
            backgroundColor={colors.surface}
          />
        </View>

        {/* Comparison Cards */}
        {topPlants.length > 0 && (
          <View style={styles.comparisonSection}>
            <Text style={styles.sectionTitle}>Plantes principales</Text>
            {topPlants.map(plant => (
              <PlantComparisonCard
                key={plant.name}
                name={plant.name}
                actual={plant.harvest}
                regional={REGIONAL_AVERAGES[plant.name] ?? 2}
                status={plant.status}
                unit=" kg"
              />
            ))}
          </View>
        )}

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Quick regional defaults for card display
const REGIONAL_AVERAGES: Record<string, number> = {
  tomato: 5, pepper: 2, zucchini: 8, cucumber: 4, lettuce: 0.5,
  carrot: 1.5, radish: 0.3, beans: 1.5, peas: 1, basil: 0.3,
  parsley: 0.2, mint: 0.2, strawberry: 1, potato: 4, onion: 2,
  garlic: 0.5, leek: 1.5, spinach: 0.5, chard: 1.5, beet: 2,
  broccoli: 1, corn: 1, sunflower: 0.5, other: 1,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
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
  alertSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  statsSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  chartSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  comparisonSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
    color: colors.text,
  },
  spacer: {
    height: spacing.lg,
  },
});
