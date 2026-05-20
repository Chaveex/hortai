import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';

interface PlantComparisonCardProps {
  name: string;
  actual: number;
  regional: number;
  status: 'excellent' | 'good' | 'warning';
  unit?: string;
}

export function PlantComparisonCard({
  name,
  actual,
  regional,
  status,
  unit = '',
}: PlantComparisonCardProps) {
  const percentage = (actual / regional) * 100;
  const statusColor = status === 'excellent' ? colors.success : status === 'good' ? colors.primary : colors.warning;
  const statusLabel = status === 'excellent' ? 'Excellent' : status === 'good' ? 'Bon' : 'Attention';

  return (
    <View style={[styles.card, { borderLeftColor: statusColor }]}>
      <View style={styles.header}>
        <Text style={styles.name}>{name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{statusLabel}</Text>
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.valueSection}>
          <Text style={styles.label}>Récolte</Text>
          <Text style={styles.value}>
            {actual.toFixed(1)}
            <Text style={styles.unit}>{unit}</Text>
          </Text>
        </View>
        <View style={styles.barContainer}>
          <View style={[styles.bar, { backgroundColor: statusColor }]}>
            <View style={[styles.barFill, { width: `${Math.min(percentage, 100)}%`, backgroundColor: statusColor }]} />
          </View>
          <Text style={styles.percentText}>{percentage.toFixed(0)}% région</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    padding: spacing.md,
    marginVertical: spacing.sm,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  name: {
    ...typography.label,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  statusBadge: {
    borderRadius: borderRadius.sm,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  content: {
    gap: spacing.sm,
  },
  valueSection: {
    gap: 2,
  },
  label: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  unit: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textMuted,
  },
  barContainer: {
    gap: 4,
  },
  bar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
  },
  percentText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
  },
});
