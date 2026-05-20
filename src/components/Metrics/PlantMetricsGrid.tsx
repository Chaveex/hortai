import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MetricCard } from '../Dashboard/MetricCard';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';

export interface PlantMetricItem {
  label: string;
  value: string | number;
  icon?: string;
  unit?: string;
  color?: string;
}

interface PlantMetricsGridProps {
  metrics: PlantMetricItem[];
  title?: string;
  columns?: number;
}

export function PlantMetricsGrid({
  metrics,
  title,
  columns = 2,
}: PlantMetricsGridProps) {
  if (!metrics || metrics.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Aucune métrique disponible</Text>
      </View>
    );
  }

  return (
    <View>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={[styles.grid, { gap: spacing.md }]}>
        {metrics.map((metric, idx) => (
          <View key={idx} style={[styles.gridItem, { flex: 1, minWidth: '48%' }]}>
            <MetricCard
              value={metric.value}
              label={metric.label}
              icon={metric.icon}
              unit={metric.unit}
              color={metric.color || colors.primary}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    marginBottom: spacing.md,
  },
  empty: {
    paddingVertical: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },
});
