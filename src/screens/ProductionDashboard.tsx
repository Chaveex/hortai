import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { format, parseISO } from 'date-fns';
import { useStore } from '../store/useStore';
import type { PlantType } from '../types';
import { LineChart } from '../components/Charts/LineChart';
import { BarChart } from '../components/Charts/BarChart';
import { PieChart } from '../components/Charts/PieChart';
import { LeaderboardRow } from '../components/Insights/LeaderboardRow';
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import { getLastNMonths } from '../services/statistics';
import { PLANT_DATABASE } from '../constants/plants';
import { getPlantProductionNarrative } from '../services/recommendations';

export function ProductionDashboard() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { plants, entries } = useStore();

  // Calculate production data by month
  const productionByMonth = useMemo(() => {
    const months = getLastNMonths(12);
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

  // Calculate production by plant type
  const productionByPlantType = useMemo(() => {
    const byType: { [key: string]: number } = {};

    entries
      .filter(e => e.type === 'harvest')
      .forEach(e => {
        const plant = plants.find(p => p.id === e.plantId);
        if (!plant) return;

        const qty = e.quantity ?? 0;
        const unit = e.unit ?? 'kg';
        const kg = unit === 'kg' ? qty : unit === 'g' ? qty / 1000 : qty * 0.15;

        byType[plant.type] = (byType[plant.type] ?? 0) + kg;
      });

    return Object.entries(byType)
      .map(([type, total]) => {
        const plantType = type as PlantType;
        const info = PLANT_DATABASE[plantType];
        return {
          label: info?.frenchName || type,
          value: total,
          color: colors.primary,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [plants, entries]);

  // Top plants by harvest
  const topPlants = useMemo(() => {
    const plantHarvests: { [key: string]: { plant: any; total: number } } = {};

    entries
      .filter(e => e.type === 'harvest')
      .forEach(e => {
        const plant = plants.find(p => p.id === e.plantId);
        if (!plant) return;

        const qty = e.quantity ?? 0;
        const unit = e.unit ?? 'kg';
        const kg = unit === 'kg' ? qty : unit === 'g' ? qty / 1000 : qty * 0.15;

        if (!plantHarvests[e.plantId]) {
          plantHarvests[e.plantId] = { plant, total: 0 };
        }
        plantHarvests[e.plantId].total += kg;
      });

    return Object.values(plantHarvests)
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [plants, entries]);

  const maxHarvest = Math.max(...topPlants.map(p => p.total), 0);

  // Generate narrative for top plant (if outperforming)
  const topPlantNarrative = useMemo(() => {
    if (topPlants.length === 0) return null;

    const topPlant = topPlants[0];
    // Regional average (simplified: using 10kg as default regional average for any plant)
    const regionalAverage = 10;
    return getPlantProductionNarrative(topPlant.total, regionalAverage);
  }, [topPlants]);

  // Helper to get plant info safely
  const getPlantIcon = (type: any): string => {
    const plantType = type as PlantType;
    const info = PLANT_DATABASE[plantType];
    return info?.icon || '🌿';
  };

  const getPlantName = (type: any): string => {
    const plantType = type as PlantType;
    const info = PLANT_DATABASE[plantType];
    return info?.frenchName || String(type);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.headerBack}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Production</Text>
          <Text style={styles.headerSubtitle}>Analyse des récoltes</Text>
        </View>

        {/* Timeline (12 months) */}
        <View style={styles.section}>
          <LineChart
            data={productionByMonth}
            title="Récoltes par mois (12 derniers mois)"
            unit=" kg"
            height={220}
            lineColor={colors.accent}
            backgroundColor={colors.surface}
          />
        </View>

        {/* Bar chart by month */}
        <View style={styles.section}>
          <BarChart
            data={productionByMonth}
            title="Comparaison mensuelle"
            unit=" kg"
            height={220}
            barColor={colors.primary}
            backgroundColor={colors.surface}
          />
        </View>

        {/* Distribution by plant type */}
        {productionByPlantType.length > 0 && (
          <View style={styles.section}>
            <PieChart
              data={productionByPlantType}
              title="Distribution par type"
              unit=" kg"
              size={180}
              showLegend
            />
          </View>
        )}

        {/* Production narrative banner */}
        {topPlantNarrative && (
          <View style={styles.narrativeSection}>
            <View style={styles.narrativeCard}>
              <Text style={styles.narrativeText}>{topPlantNarrative}</Text>
            </View>
          </View>
        )}

        {/* Top plants ranking */}
        {topPlants.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top 6 des récoltes</Text>
            <View style={styles.leaderboard}>
              {topPlants.map((item, idx) => (
                <LeaderboardRow
                  key={item.plant.id}
                  rank={idx + 1}
                  icon={getPlantIcon(item.plant.type)}
                  name={item.plant.name}
                  value={item.total}
                  unit=" kg"
                  percentOfMax={maxHarvest > 0 ? (item.total / maxHarvest) * 100 : 0}
                />
              ))}
            </View>
          </View>
        )}

        {!topPlants.length && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Aucune donnée de récolte</Text>
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
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  narrativeSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  narrativeCard: {
    backgroundColor: '#F0F7FF',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
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
  emptyState: {
    paddingVertical: spacing.xxl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },
  spacer: {
    height: spacing.lg,
  },
});
