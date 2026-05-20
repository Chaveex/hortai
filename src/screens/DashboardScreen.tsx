import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl, SafeAreaView, TouchableOpacity,
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
import { REGIONAL_AVERAGES } from '../constants/plants';

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

  // Top plants for comparison (with plant type info for regional lookup)
  const topPlants = useMemo(() => {
    return dashboardData.comparison.plants
      .map(plant => {
        const plantInfo = plants.find(p => p.name === plant.name);
        const regionalAvg = plantInfo ? REGIONAL_AVERAGES[plantInfo.type] ?? 1 : 1;
        return { ...plant, regionalAvg };
      })
      .sort((a, b) => b.harvest - a.harvest)
      .slice(0, 3);
  }, [dashboardData.comparison, plants]);

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
                regional={plant.regionalAvg}
                status={plant.status}
                unit=" kg"
              />
            ))}
          </View>
        )}

        {/* Navigation button */}
        <View style={styles.comparisonSection}>
          <TouchableOpacity
            style={styles.comparisonButton}
            onPress={() => navigation.navigate('ComparisonDashboard')}
          >
            <Text style={styles.comparisonButtonText}>📊 Tableau de comparaison détaillé</Text>
          </TouchableOpacity>
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
  comparisonButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  comparisonButtonText: {
    ...typography.label,
    color: colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
});
