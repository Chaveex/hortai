import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { format, parseISO, subMonths } from 'date-fns';
import { useStore } from '../store/useStore';
import { QuickStatCard } from '../components/Dashboard/QuickStatCard';
import { TrendChart } from '../components/Dashboard/TrendChart';
import { HealthScoreGauge } from '../components/Dashboard/HealthScoreGauge';
import { AlertBanner, AlertItem } from '../components/Dashboard/AlertBanner';
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import { getLastNMonths } from '../services/statistics';
import { PLANT_DATABASE } from '../constants/plants';

export function DashboardScreen() {
  const navigation = useNavigation<any>();
  const { plants, entries, weather, stats, refreshWeather, refreshStats } = useStore();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('6m');

  useEffect(() => {
    refreshWeather();
    refreshStats();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshWeather();
      refreshStats();
    } finally {
      setRefreshing(false);
    }
  };

  // Calculate KPIs
  const kpis = useMemo(() => {
    const harvestEntries = entries.filter(e => e.type === 'harvest');
    let totalHarvest = 0;
    harvestEntries.forEach(e => {
      const qty = e.quantity ?? 0;
      const unit = e.unit ?? 'kg';
      const kg = unit === 'kg' ? qty : unit === 'g' ? qty / 1000 : qty * 0.15;
      totalHarvest += kg;
    });

    // Water consumption estimate
    let waterConsumption = 0;
    const now = new Date();
    plants.forEach(p => {
      const info = PLANT_DATABASE[p.type];
      if (info) {
        const daysAlive = Math.min(30, Math.max(0, Math.floor((now.getTime() - parseISO(p.plantedDate).getTime()) / (1000 * 60 * 60 * 24))));
        waterConsumption += info.dailyWaterNeed * daysAlive;
      }
    });

    return {
      totalPlants: plants.length,
      totalHarvest: totalHarvest.toFixed(1),
      waterL: waterConsumption.toFixed(0),
      healthScore: stats?.healthScore ?? 75,
    };
  }, [plants, entries, stats]);

  // Production trend data (last 6 months)
  const productionData = useMemo(() => {
    const months = getLastNMonths(6);
    return months.map(yearMonth => {
      const harvests = entries.filter(e => {
        const eMonth = format(parseISO(e.date), 'yyyy-MM');
        return e.type === 'harvest' && eMonth === yearMonth;
      });

      let total = 0;
      harvests.forEach(e => {
        const qty = e.quantity ?? 0;
        const unit = e.unit ?? 'kg';
        const kg = unit === 'kg' ? qty : unit === 'g' ? qty / 1000 : qty * 0.15;
        total += kg;
      });

      return {
        label: yearMonth.slice(5),
        value: total,
      };
    });
  }, [entries]);

  // Alert generation
  const alerts: AlertItem[] = useMemo(() => {
    const alertList: AlertItem[] = [];

    // Check plants needing water
    const wateringNeeded = plants.filter(p => {
      if (!p.lastWatered) return true;
      const info = PLANT_DATABASE[p.type];
      const daysSince = Math.floor((new Date().getTime() - parseISO(p.lastWatered).getTime()) / (1000 * 60 * 60 * 24));
      return daysSince > info.wateringFrequencyDays * 1.2;
    });

    if (wateringNeeded.length > 0) {
      alertList.push({
        id: 'water',
        type: 'warning',
        message: `${wateringNeeded.length} plante(s) nécessite(nt) d'être arrosée(s)`,
        icon: '💧',
        dismissible: true,
      });
    }

    // Check weather alerts
    if (weather && weather.description.toLowerCase().includes('rain')) {
      alertList.push({
        id: 'rain',
        type: 'info',
        message: 'Pluie prévue : arrosage moins urgent',
        icon: '🌧️',
        dismissible: true,
      });
    }

    return alertList;
  }, [plants, weather, entries]);

  const dateRangeLabel = selectedDateRange === '6m' ? '6 derniers mois' : '3 derniers mois';

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

        {/* Alerts */}
        {alerts.length > 0 && (
          <View style={styles.alertSection}>
            <AlertBanner alerts={alerts} />
          </View>
        )}

        {/* KPI Cards */}
        <View style={styles.kpisSection}>
          <View style={styles.kpiRow}>
            <View style={styles.kpiCard}>
              <QuickStatCard
                value={kpis.totalPlants}
                label="Plantes"
                color={colors.primary}
                trendEmoji="🌱"
              />
            </View>
            <View style={styles.kpiCard}>
              <QuickStatCard
                value={kpis.totalHarvest}
                label="Récolte"
                unit=" kg"
                color={colors.accent}
                trendEmoji="🥕"
              />
            </View>
          </View>
          <View style={styles.kpiRow}>
            <View style={styles.kpiCard}>
              <QuickStatCard
                value={kpis.waterL}
                label="Eau (mois)"
                unit=" L"
                color={colors.secondary}
                trendEmoji="💧"
              />
            </View>
            <View style={styles.kpiCard}>
              <QuickStatCard
                value={kpis.healthScore.toFixed(0)}
                label="Santé"
                unit="%"
                color={colors.success}
                trendEmoji="💪"
              />
            </View>
          </View>
        </View>

        {/* Production Trend */}
        <View style={styles.chartSection}>
          <TrendChart
            data={productionData}
            title="Récoltes (6 derniers mois)"
            unit=" kg"
            color={colors.surface}
            lineColor={colors.accent}
          />
        </View>

        {/* Health Score */}
        <View style={styles.gaugeSection}>
          <HealthScoreGauge
            score={kpis.healthScore}
            label="Santé du jardin"
            size={140}
          />
        </View>

        {/* Navigation to detailed dashboards */}
        <View style={styles.navigationSection}>
          <Text style={styles.navTitle}>Explorez les détails</Text>
          <View style={styles.navButtons}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigation.navigate('ProductionDashboard')}
            >
              <Text style={styles.navIcon}>📊</Text>
              <Text style={styles.navLabel}>Production</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigation.navigate('WaterDashboard')}
            >
              <Text style={styles.navIcon}>💧</Text>
              <Text style={styles.navLabel}>Eau</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigation.navigate('HealthDashboard')}
            >
              <Text style={styles.navIcon}>🏥</Text>
              <Text style={styles.navLabel}>Santé</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigation.navigate('PlantDetailDashboard')}
            >
              <Text style={styles.navIcon}>🌿</Text>
              <Text style={styles.navLabel}>Plante</Text>
            </TouchableOpacity>
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
  kpisSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  kpiCard: {
    flex: 1,
  },
  chartSection: {
    paddingHorizontal: spacing.lg,
  },
  gaugeSection: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  navigationSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  navTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  navButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  navButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  navIcon: {
    fontSize: 28,
  },
  navLabel: {
    ...typography.label,
    fontSize: 12,
    color: colors.text,
  },
  spacer: {
    height: spacing.lg,
  },
});
