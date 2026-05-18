import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';

interface LeaderboardRowProps {
  rank: number;
  icon: string;
  name: string;
  value: number;
  unit?: string;
  percentOfMax?: number;
}

export function LeaderboardRow({
  rank,
  icon,
  name,
  value,
  unit = '',
  percentOfMax = 100,
}: LeaderboardRowProps) {
  // Medal emoji for top 3
  let rankMedal = '';
  if (rank === 1) rankMedal = '🥇';
  else if (rank === 2) rankMedal = '🥈';
  else if (rank === 3) rankMedal = '🥉';

  const rankColor = rank <= 3 ? colors.accent : colors.textMuted;

  return (
    <View style={styles.row}>
      {/* Rank + Medal */}
      <View style={styles.rankSection}>
        {rankMedal ? (
          <Text style={styles.medal}>{rankMedal}</Text>
        ) : (
          <Text style={[styles.rankNumber, { color: rankColor }]}>#{rank}</Text>
        )}
      </View>

      {/* Icon + Name */}
      <View style={styles.plantSection}>
        <Text style={styles.icon}>{icon}</Text>
        <View style={styles.plantInfo}>
          <Text style={styles.plantName}>{name}</Text>
        </View>
      </View>

      {/* Metric bar + value */}
      <View style={styles.metricSection}>
        <View style={styles.barContainer}>
          <View
            style={[
              styles.metricBar,
              { width: `${Math.min(percentOfMax, 100)}%` },
            ]}
          />
        </View>
      </View>

      {/* Value */}
      <Text style={styles.value}>
        {value.toFixed(value < 1 ? 2 : 0)}
        <Text style={styles.unit}>{unit}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  rankSection: {
    width: 40,
    alignItems: 'center',
  },
  medal: {
    fontSize: 20,
  },
  rankNumber: {
    ...typography.label,
    fontWeight: '700' as const,
    fontSize: 13,
  },
  plantSection: {
    flex: 0.7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  icon: {
    fontSize: 24,
  },
  plantInfo: {
    justifyContent: 'center',
  },
  plantName: {
    ...typography.label,
    color: colors.text,
    fontSize: 13,
  },
  metricSection: {
    flex: 1,
    minWidth: 80,
  },
  barContainer: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  metricBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  value: {
    ...typography.label,
    fontWeight: '700' as const,
    color: colors.text,
    minWidth: 50,
    textAlign: 'right',
    fontSize: 13,
  },
  unit: {
    fontWeight: '400' as const,
    fontSize: 11,
    marginLeft: 2,
  },
});
