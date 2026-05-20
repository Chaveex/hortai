import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';

interface StatCardProps {
  value: number | string;
  label: string;
  unit?: string;
  icon?: string;
  color?: string;
  trend?: 'up' | 'stable' | 'down';
  trendValue?: number;
  onPress?: () => void;
}

export function StatCard({
  value,
  label,
  unit = '',
  icon = '📊',
  color = colors.primary,
  trend,
  trendValue,
  onPress,
}: StatCardProps) {
  const getTrendIndicator = () => {
    if (!trend) return null;
    const arrow = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
    const trendColor = trend === 'up' ? colors.success : trend === 'down' ? colors.warning : colors.textMuted;
    return (
      <View style={[styles.trendBadge, { backgroundColor: trendColor }]}>
        <Text style={styles.trendArrow}>{arrow}</Text>
        {trendValue !== undefined && (
          <Text style={styles.trendValue}>{Math.abs(trendValue).toFixed(1)}%</Text>
        )}
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: color }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.85 : 1}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        {getTrendIndicator()}
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          {value}
          {unit && <Text style={styles.unit}>{unit}</Text>}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
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
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  icon: {
    fontSize: 24,
  },
  trendBadge: {
    borderRadius: borderRadius.sm,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  trendArrow: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  trendValue: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    gap: spacing.xs,
  },
  label: {
    ...typography.label,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  value: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  unit: {
    fontSize: 16,
    fontWeight: '400',
    marginLeft: 4,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
