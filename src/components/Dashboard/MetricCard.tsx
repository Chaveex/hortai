import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';

interface MetricCardProps {
  value: string | number;
  label: string;
  icon?: string;
  unit?: string;
  color?: string;
  backgroundColor?: string;
}

export function MetricCard({
  value,
  label,
  icon,
  unit = '',
  color = colors.primary,
  backgroundColor = colors.surface,
}: MetricCardProps) {
  return (
    <View style={[styles.card, { backgroundColor }]}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color }]}>
        {value}
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.caption,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  value: {
    fontSize: 24,
    fontWeight: '700' as const,
    textAlign: 'center',
  },
  unit: {
    fontSize: 12,
    fontWeight: '400' as const,
    marginLeft: spacing.xs,
  },
});
