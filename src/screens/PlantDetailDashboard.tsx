import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { parseISO, differenceInDays } from 'date-fns';
import { useStore } from '../store/useStore';
import type { PlantType } from '../types';
import { PlantMetricsGrid, PlantMetricItem } from '../components/Metrics/PlantMetricsGrid';
import { PerformanceVsAverage } from '../components/Metrics/PerformanceVsAverage';
import { GrowthTimeline } from '../components/Metrics/GrowthTimeline';
import { WateringHistory } from '../components/Metrics/WateringHistory';
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import { PLANT_DATABASE, REGIONAL_AVERAGES } from '../constants/plants';

export function PlantDetailDashboard() {
  const navigation = useNavigation<any>();
  const { plants, entries } = useStore();
  const [selectedPlantId, setSelectedPlantId] = useState(plants[0]?.id || '');

  const selectedPlant = useMemo(
    () => plants.find(p => p.id === selectedPlantId) || plants[0],
    [selectedPlantId, plants]
  );

  // Calculate metrics for selected plant
  const plantMetrics = useMemo(() => {
    if (!selectedPlant) return null;

    const info = PLANT_DATABASE[selectedPlant.type];
    const now = new Date();
    const plantedDate = parseISO(selectedPlant.plantedDate);
    const daysAlive = differenceInDays(now, plantedDate);

    // Calculate harvest
    const harvests = entries.filter(
      e => e.type === 'harvest' && e.plantId === selectedPlant.id
    );
    let totalHarvest = 0;
    harvests.forEach(h => {
      const qty = h.quantity ?? 0;
      const unit = h.unit ?? 'kg';
      const kg = unit === 'kg' ? qty : unit === 'g' ? qty / 1000 : qty * 0.15;
      totalHarvest += kg;
    });

    // Determine growth stage
    let growthStage: string = 'seedling';
    const expectedMaturity = info?.harvestDays || 60;
    const progress = (daysAlive / expectedMaturity) * 100;

    if (progress < 10) growthStage = 'Germination';
    else if (progress < 25) growthStage = 'Plantule';
    else if (progress < 60) growthStage = 'Végétatif';
    else if (progress < 85) growthStage = 'Floraison';
    else if (progress < 100) growthStage = 'Mature';
    else growthStage = 'Récolté';

    const regional = REGIONAL_AVERAGES[selectedPlant.type] || 2;

    return {
      totalHarvest: totalHarvest,
      harvestCount: harvests.length,
      daysAlive,
      growthStage,
      progress: Math.min(progress, 100),
      health: 80,
      wateringCount: selectedPlant.wateringHistory?.length || 0,
      regional,
      regional_days: info?.harvestDays || 60,
    };
  }, [selectedPlant, entries]);

  // Metrics grid
  const metricsGrid = useMemo((): PlantMetricItem[] => {
    if (!plantMetrics) return [];
    const info = selectedPlant ? PLANT_DATABASE[selectedPlant.type] : undefined;

    return [
      {
        label: 'Récolte',
        value: plantMetrics.totalHarvest.toFixed(1),
        unit: 'kg',
        icon: '🥕',
        color: colors.accent,
      },
      {
        label: 'Jours',
        value: plantMetrics.daysAlive,
        unit: 'j',
        icon: '📅',
        color: colors.primary,
      },
      {
        label: 'Récoltes',
        value: plantMetrics.harvestCount,
        unit: 'entrées',
        icon: '📈',
        color: colors.success,
      },
      {
        label: 'Santé',
        value: plantMetrics.health,
        unit: '%',
        icon: '💪',
        color: colors.primaryLight,
      },
      {
        label: 'Arrosages',
        value: plantMetrics.wateringCount,
        icon: '💧',
        color: colors.secondary,
      },
      {
        label: 'Étape',
        value: plantMetrics.growthStage,
        icon: '🌱',
        color: colors.warning,
      },
    ];
  }, [plantMetrics, selectedPlant]);

  // Helper functions
  const getDaysToMaturity = (plant: any) => {
    const plantType = plant.type as PlantType;
    const info = PLANT_DATABASE[plantType];
    return info?.harvestDays || 60;
  };

  const getPlantName = (type: any): string => {
    const plantType = type as PlantType;
    const info = PLANT_DATABASE[plantType];
    return info?.frenchName || String(type);
  };

  const getPlantIcon = (type: any): string => {
    const plantType = type as PlantType;
    const info = PLANT_DATABASE[plantType];
    return info?.icon || '🌿';
  };

  // Watering history
  const wateringHistory = useMemo(() => {
    if (!selectedPlant) return [];
    return selectedPlant.wateringHistory?.map(date => ({
      date,
      amount: 2,
      unit: 'L',
    })) || [];
  }, [selectedPlant]);

  // Harvest entries
  const harvestEntries = useMemo(() => {
    return entries
      .filter(e => e.type === 'harvest' && e.plantId === selectedPlant?.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [entries, selectedPlant]);

  const progress = plantMetrics?.progress || 0;
  const growthStages = [
    { label: 'Germination', completed: progress > 10, emoji: '🌾' },
    { label: 'Plantule', completed: progress > 25, current: progress > 25 && progress < 60, emoji: '🌱' },
    { label: 'Croissance', completed: progress > 60, current: progress > 60 && progress < 85, emoji: '🌿' },
    { label: 'Mature', completed: progress > 85, current: progress > 85, emoji: '🥗' },
  ];

  if (!selectedPlant || !plantMetrics) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.headerBack}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détails Plante</Text>
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Aucune plante</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.headerBack}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détails Plante</Text>
          <Text style={styles.headerSubtitle}>Métriques et historique</Text>
        </View>

        {/* Plant selector */}
        {plants.length > 1 && (
          <View style={styles.selectorSection}>
            <Text style={styles.selectorLabel}>Sélectionner une plante</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.plantSelector}
            >
              {plants.map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.plantOption,
                    p.id === selectedPlantId && styles.plantOptionSelected,
                  ]}
                  onPress={() => setSelectedPlantId(p.id)}
                >
                  <Text style={styles.plantOptionText}>{p.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Plant name and type */}
        <View style={styles.plantHeader}>
          <Text style={styles.plantIcon}>
            {getPlantIcon(selectedPlant.type)}
          </Text>
          <View style={styles.plantInfo}>
            <Text style={styles.plantName}>{selectedPlant.name}</Text>
            <Text style={styles.plantType}>
              {getPlantName(selectedPlant.type)}
            </Text>
          </View>
        </View>

        {/* Metrics grid */}
        <View style={styles.section}>
          <PlantMetricsGrid metrics={metricsGrid} columns={2} />
        </View>

        {/* Performance vs average */}
        {plantMetrics && selectedPlant && (
          <View style={styles.section}>
            <PerformanceVsAverage
              data={[
                {
                  plantName: selectedPlant.name,
                  plantValue: plantMetrics.totalHarvest,
                  averageValue: plantMetrics.regional,
                  unit: 'kg',
                },
              ]}
              title="Comparaison vs moyenne régionale"
              maxValue={Math.max(plantMetrics.totalHarvest, plantMetrics.regional) * 1.2}
            />
          </View>
        )}

        {/* Growth timeline */}
        <View style={styles.section}>
          <GrowthTimeline
            stages={growthStages}
            progressPercent={progress}
          />
        </View>

        {/* Watering history */}
        <View style={styles.section}>
          <WateringHistory entries={wateringHistory} maxItems={10} />
        </View>

        {/* Recent harvests */}
        {harvestEntries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dernières récoltes</Text>
            <View style={styles.harvestList}>
              {harvestEntries.map((entry, idx) => (
                <View
                  key={entry.id}
                  style={[
                    styles.harvestItem,
                    idx === harvestEntries.length - 1 && styles.harvestItemLast,
                  ]}
                >
                  <Text style={styles.harvestIcon}>📦</Text>
                  <View style={styles.harvestContent}>
                    <Text style={styles.harvestDate}>
                      {parseISO(entry.date).toLocaleDateString('fr-FR')}
                    </Text>
                    {entry.text && <Text style={styles.harvestNote}>{entry.text}</Text>}
                  </View>
                  <Text style={styles.harvestQty}>
                    {entry.quantity?.toFixed(1)}{entry.unit || 'kg'}
                  </Text>
                </View>
              ))}
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
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },
  selectorSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  selectorLabel: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  plantSelector: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  plantOption: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
  },
  plantOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  plantOptionText: {
    ...typography.label,
    color: colors.text,
    fontSize: 12,
  },
  plantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  plantIcon: {
    fontSize: 40,
  },
  plantInfo: {
    flex: 1,
  },
  plantName: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 2,
  },
  plantType: {
    ...typography.caption,
    color: colors.textMuted,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  harvestList: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  harvestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  harvestItemLast: {
    borderBottomWidth: 0,
  },
  harvestIcon: {
    fontSize: 20,
  },
  harvestContent: {
    flex: 1,
  },
  harvestDate: {
    ...typography.label,
    color: colors.text,
    marginBottom: 2,
  },
  harvestNote: {
    ...typography.caption,
    color: colors.textMuted,
  },
  harvestQty: {
    ...typography.label,
    fontWeight: '700' as const,
    color: colors.accent,
  },
  spacer: {
    height: spacing.lg,
  },
});
