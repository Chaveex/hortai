import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { format, parseISO, subMonths } from 'date-fns';
import { useStore } from '../store/useStore';
import { ComparisonCard } from '../components/Dashboard/ComparisonCard';
import { colors, spacing, borderRadius, typography } from '../constants/theme';

type DateRangePreset = '1m' | '3m' | '6m' | '12m';

interface DateRange {
  label: string;
  startDate: Date;
  endDate: Date;
}

export function ComparisonDashboard() {
  const navigation = useNavigation<any>();
  const { plants, entries } = useStore();
  const [period1Preset, setPeriod1Preset] = useState<DateRangePreset>('3m');
  const [period2Preset, setPeriod2Preset] = useState<DateRangePreset>('1m');

  // Generate date range from preset
  const getDateRange = (preset: DateRangePreset): DateRange => {
    const endDate = new Date();
    let startDate = new Date();

    switch (preset) {
      case '1m':
        startDate = subMonths(endDate, 1);
        return { label: 'Dernier mois', startDate, endDate };
      case '3m':
        startDate = subMonths(endDate, 3);
        return { label: 'Derniers 3 mois', startDate, endDate };
      case '6m':
        startDate = subMonths(endDate, 6);
        return { label: 'Derniers 6 mois', startDate, endDate };
      case '12m':
        startDate = subMonths(endDate, 12);
        return { label: '12 derniers mois', startDate, endDate };
    }
  };

  // Calculate production for a date range
  const calculateProduction = (startDate: Date, endDate: Date) => {
    let totalProduction = 0;
    let harvestCount = 0;

    entries
      .filter(e => {
        const eDate = parseISO(e.date);
        return e.type === 'harvest' && eDate >= startDate && eDate <= endDate;
      })
      .forEach(e => {
        const qty = e.quantity ?? 0;
        const unit = e.unit ?? 'kg';
        const kg = unit === 'kg' ? qty : unit === 'g' ? qty / 1000 : qty * 0.15;
        totalProduction += kg;
        harvestCount++;
      });

    return { totalProduction, harvestCount };
  };

  const period1 = getDateRange(period1Preset);
  const period2 = getDateRange(period2Preset);

  const p1Data = calculateProduction(period1.startDate, period1.endDate);
  const p2Data = calculateProduction(period2.startDate, period2.endDate);

  // Calculate metrics
  const productionGrowth = p1Data.totalProduction > 0
    ? ((p2Data.totalProduction - p1Data.totalProduction) / p1Data.totalProduction) * 100
    : 0;

  const frequencyChange = p1Data.harvestCount > 0
    ? ((p2Data.harvestCount - p1Data.harvestCount) / p1Data.harvestCount) * 100
    : 0;

  // Efficiency (harvest per plant)
  const p1Efficiency = p1Data.harvestCount > 0
    ? p1Data.totalProduction / p1Data.harvestCount
    : 0;
  const p2Efficiency = p2Data.harvestCount > 0
    ? p2Data.totalProduction / p2Data.harvestCount
    : 0;

  const efficiencyChange = p1Efficiency > 0
    ? ((p2Efficiency - p1Efficiency) / p1Efficiency) * 100
    : 0;

  // Production by plant type comparison
  const productionByType = useMemo(() => {
    const p1ByType: { [key: string]: number } = {};
    const p2ByType: { [key: string]: number } = {};

    entries
      .filter(e => {
        const eDate = parseISO(e.date);
        return e.type === 'harvest';
      })
      .forEach(e => {
        const plant = plants.find(p => p.id === e.plantId);
        if (!plant) return;

        const qty = e.quantity ?? 0;
        const unit = e.unit ?? 'kg';
        const kg = unit === 'kg' ? qty : unit === 'g' ? qty / 1000 : qty * 0.15;

        const eDate = parseISO(e.date);
        if (eDate >= period1.startDate && eDate <= period1.endDate) {
          p1ByType[plant.type] = (p1ByType[plant.type] ?? 0) + kg;
        }
        if (eDate >= period2.startDate && eDate <= period2.endDate) {
          p2ByType[plant.type] = (p2ByType[plant.type] ?? 0) + kg;
        }
      });

    const allTypes = new Set([...Object.keys(p1ByType), ...Object.keys(p2ByType)]);
    return Array.from(allTypes)
      .slice(0, 6)
      .map(type => ({
        label: type,
        period1: p1ByType[type] ?? 0,
        period2: p2ByType[type] ?? 0,
      }))
      .sort((a, b) => (b.period1 + b.period2) - (a.period1 + a.period2));
  }, [plants, entries, period1, period2]);

  const comparisonMetrics = [
    {
      label: 'Production',
      before: p1Data.totalProduction,
      after: p2Data.totalProduction,
      unit: ' kg',
    },
    {
      label: 'Fréquence récolte',
      before: p1Data.harvestCount,
      after: p2Data.harvestCount,
      unit: ' fois',
    },
    {
      label: 'Rendement moyen',
      before: p1Efficiency,
      after: p2Efficiency,
      unit: ' kg/récolte',
    },
  ];

  const trendArrow = productionGrowth >= 0 ? '📈' : '📉';
  const trendLabel = productionGrowth >= 0 ? 'Amélioration' : 'Déclin';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.headerBack}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Comparaison</Text>
          <Text style={styles.headerSubtitle}>Analyser deux périodes</Text>
        </View>

        {/* Period selectors */}
        <View style={styles.selectorSection}>
          <View style={styles.periodSelector}>
            <Text style={styles.periodLabel}>Période 1</Text>
            <View style={styles.buttonGroup}>
              {(['1m', '3m', '6m', '12m'] as DateRangePreset[]).map(preset => (
                <TouchableOpacity
                  key={preset}
                  style={[
                    styles.presetButton,
                    period1Preset === preset && styles.presetButtonActive,
                  ]}
                  onPress={() => setPeriod1Preset(preset)}
                >
                  <Text
                    style={[
                      styles.presetButtonText,
                      period1Preset === preset && styles.presetButtonTextActive,
                    ]}
                  >
                    {preset}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.periodSelector}>
            <Text style={styles.periodLabel}>Période 2</Text>
            <View style={styles.buttonGroup}>
              {(['1m', '3m', '6m', '12m'] as DateRangePreset[]).map(preset => (
                <TouchableOpacity
                  key={preset}
                  style={[
                    styles.presetButton,
                    period2Preset === preset && styles.presetButtonActive,
                  ]}
                  onPress={() => setPeriod2Preset(preset)}
                >
                  <Text
                    style={[
                      styles.presetButtonText,
                      period2Preset === preset && styles.presetButtonTextActive,
                    ]}
                  >
                    {preset}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Date range display */}
        <View style={styles.dateRangeSection}>
          <View style={styles.dateRangeBox}>
            <Text style={styles.dateRangeLabel}>{period1.label}</Text>
            <Text style={styles.dateRangeValue}>
              {format(period1.startDate, 'dd MMM')} - {format(period1.endDate, 'dd MMM')}
            </Text>
          </View>
          <View style={styles.dateRangeBox}>
            <Text style={styles.dateRangeLabel}>{period2.label}</Text>
            <Text style={styles.dateRangeValue}>
              {format(period2.startDate, 'dd MMM')} - {format(period2.endDate, 'dd MMM')}
            </Text>
          </View>
        </View>

        {/* Trend summary */}
        <View style={styles.trendSummary}>
          <Text style={styles.trendEmoji}>{trendArrow}</Text>
          <View style={styles.trendContent}>
            <Text style={styles.trendLabel}>{trendLabel}</Text>
            <Text style={styles.trendValue}>
              {productionGrowth >= 0 ? '+' : ''}{productionGrowth.toFixed(1)}%
            </Text>
          </View>
        </View>

        {/* Comparison metrics */}
        <View style={styles.section}>
          <ComparisonCard
            title="Métriques"
            data={comparisonMetrics}
            color={colors.surface}
          />
        </View>

        {/* By plant type comparison */}
        {productionByType.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Comparaison par type</Text>
            <View style={styles.typeComparison}>
              {productionByType.map((item, idx) => {
                const maxValue = Math.max(...productionByType.map(i => Math.max(i.period1, i.period2)));
                const change = item.period2 - item.period1;
                const changePercent = item.period1 > 0 ? (change / item.period1) * 100 : 0;

                return (
                  <View
                    key={idx}
                    style={[
                      styles.typeRow,
                      idx === productionByType.length - 1 && styles.typeRowLast,
                    ]}
                  >
                    <Text style={styles.typeLabel}>{item.label}</Text>
                    <View style={styles.typeCharts}>
                      <View style={styles.typeBarContainer}>
                        <View
                          style={[
                            styles.typeBar,
                            {
                              width: `${(item.period1 / maxValue) * 100}%`,
                              backgroundColor: colors.primaryLight,
                            },
                          ]}
                        />
                      </View>
                      <View style={styles.typeBarContainer}>
                        <View
                          style={[
                            styles.typeBar,
                            {
                              width: `${(item.period2 / maxValue) * 100}%`,
                              backgroundColor: colors.primary,
                            },
                          ]}
                        />
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.typeChange,
                        changePercent >= 0 ? { color: colors.success } : { color: colors.warning },
                      ]}
                    >
                      {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(0)}%
                    </Text>
                  </View>
                );
              })}
            </View>
            {/* Legend */}
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: colors.primaryLight }]} />
                <Text style={styles.legendLabel}>{period1.label}</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
                <Text style={styles.legendLabel}>{period2.label}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insights</Text>
          <View style={styles.insightList}>
            {productionGrowth >= 10 && (
              <View style={styles.insight}>
                <Text style={styles.insightIcon}>✨</Text>
                <Text style={styles.insightText}>
                  Production en hausse de {productionGrowth.toFixed(1)}% !
                </Text>
              </View>
            )}
            {frequencyChange > 0 && (
              <View style={styles.insight}>
                <Text style={styles.insightIcon}>📈</Text>
                <Text style={styles.insightText}>
                  Fréquence de récolte augmentée de {frequencyChange.toFixed(1)}%
                </Text>
              </View>
            )}
            {efficiencyChange > 0 && (
              <View style={styles.insight}>
                <Text style={styles.insightIcon}>⚡</Text>
                <Text style={styles.insightText}>
                  Rendement moyen amélioré de {efficiencyChange.toFixed(1)}%
                </Text>
              </View>
            )}
            {productionGrowth < 0 && (
              <View style={styles.insight}>
                <Text style={styles.insightIcon}>⚠️</Text>
                <Text style={styles.insightText}>
                  Production en baisse de {Math.abs(productionGrowth).toFixed(1)}%
                </Text>
              </View>
            )}
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
  selectorSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  periodSelector: {
    gap: spacing.sm,
  },
  periodLabel: {
    ...typography.label,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  presetButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  presetButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  presetButtonText: {
    ...typography.label,
    color: colors.text,
    fontSize: 12,
  },
  presetButtonTextActive: {
    color: colors.surface,
  },
  dateRangeSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    gap: spacing.md,
  },
  dateRangeBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dateRangeLabel: {
    ...typography.caption,
    marginBottom: spacing.sm,
  },
  dateRangeValue: {
    ...typography.label,
    color: colors.primary,
  },
  trendSummary: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  trendEmoji: {
    fontSize: 32,
  },
  trendContent: {
    flex: 1,
  },
  trendLabel: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  trendValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  typeComparison: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  typeRowLast: {
    borderBottomWidth: 0,
  },
  typeLabel: {
    ...typography.label,
    minWidth: 60,
  },
  typeCharts: {
    flex: 1,
    gap: spacing.xs,
  },
  typeBarContainer: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  typeBar: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  typeChange: {
    ...typography.label,
    fontWeight: '700' as const,
    minWidth: 45,
    textAlign: 'right',
  },
  legend: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendLabel: {
    ...typography.caption,
    fontSize: 11,
  },
  insightList: {
    gap: spacing.sm,
  },
  insight: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  insightIcon: {
    fontSize: 20,
  },
  insightText: {
    ...typography.body,
    flex: 1,
    color: colors.text,
  },
  spacer: {
    height: spacing.lg,
  },
});
