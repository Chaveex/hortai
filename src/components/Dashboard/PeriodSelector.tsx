import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';

export type Period = 'week' | 'month' | 'season' | 'year';

interface PeriodSelectorProps {
  selected: Period;
  onSelect: (period: Period) => void;
}

const PERIODS: { value: Period; label: string }[] = [
  { value: 'week', label: 'Semaine' },
  { value: 'month', label: 'Mois' },
  { value: 'season', label: 'Saison' },
  { value: 'year', label: 'Année' },
];

export function PeriodSelector({ selected, onSelect }: PeriodSelectorProps) {
  return (
    <View style={styles.container}>
      {PERIODS.map(period => (
        <TouchableOpacity
          key={period.value}
          style={[
            styles.tab,
            selected === period.value && styles.tabActive,
          ]}
          onPress={() => onSelect(period.value)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.label,
              selected === period.value && styles.labelActive,
            ]}
          >
            {period.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  label: {
    ...typography.label,
    color: colors.textMuted,
    fontSize: 12,
  },
  labelActive: {
    color: colors.surface,
    fontWeight: '600',
  },
});
