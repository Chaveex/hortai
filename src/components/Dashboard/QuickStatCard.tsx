import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';

interface QuickStatCardProps {
  value: string | number;
  label: string;
  trendEmoji?: string;
  percentChange?: number;
  color?: string;
  unit?: string;
  size?: 'small' | 'medium';
}

export function QuickStatCard({
  value,
  label,
  trendEmoji,
  percentChange,
  color = colors.primary,
  unit = '',
  size = 'medium',
}: QuickStatCardProps) {
  const isPositive = percentChange !== undefined && percentChange >= 0;
  const trendColor = percentChange !== undefined
    ? percentChange >= 0 ? colors.success : colors.warning
    : 'transparent';

  return (
    <View style={[styles.card, { backgroundColor: color }]}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {trendEmoji && <Text style={styles.emoji}>{trendEmoji}</Text>}
      </View>
      <View style={styles.valueSection}>
        <Text style={styles.value}>
          {value}
          {unit && <Text style={styles.unit}>{unit}</Text>}
        </Text>
      </View>
      {percentChange !== undefined && (
        <View style={[styles.trendBadge, { backgroundColor: trendColor }]}>
          <Text style={styles.trendText}>
            {isPositive ? '+' : ''}{percentChange.toFixed(1)}%
          </Text>
        </View>
      )}
    </View>
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
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.label,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  emoji: {
    fontSize: 20,
  },
  valueSection: {
    marginBottom: spacing.sm,
  },
  value: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  unit: {
    fontSize: 14,
    fontWeight: '400' as const,
    marginLeft: 4,
  },
  trendBadge: {
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    alignSelf: 'flex-start',
  },
  trendText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600' as const,
  },
});
