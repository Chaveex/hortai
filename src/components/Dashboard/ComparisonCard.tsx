import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';

interface ComparisonData {
  label: string;
  before: number;
  after: number;
  unit?: string;
}

interface ComparisonCardProps {
  title: string;
  data: ComparisonData[];
  color?: string;
}

export function ComparisonCard({
  title,
  data,
  color = colors.surface,
}: ComparisonCardProps) {
  return (
    <View style={[styles.container, { backgroundColor: color }]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.content}>
        {data.map((item, idx) => {
          const change = item.after - item.before;
          const percentChange = item.before !== 0
            ? ((change / Math.abs(item.before)) * 100)
            : 0;
          const isPositive = change >= 0;
          const changeColor = isPositive ? colors.success : colors.warning;

          return (
            <View key={idx} style={styles.row}>
              <View style={styles.labelSection}>
                <Text style={styles.label}>{item.label}</Text>
              </View>
              <View style={styles.valuesSection}>
                <View style={styles.valueColumn}>
                  <Text style={styles.valueLabel}>Avant</Text>
                  <Text style={styles.value}>
                    {item.before.toFixed(1)}{item.unit || ''}
                  </Text>
                </View>
                <View style={styles.arrowSection}>
                  <Text style={{ fontSize: 18, color: colors.textMuted }}>→</Text>
                </View>
                <View style={styles.valueColumn}>
                  <Text style={styles.valueLabel}>Après</Text>
                  <Text style={styles.value}>
                    {item.after.toFixed(1)}{item.unit || ''}
                  </Text>
                </View>
              </View>
              <View style={[styles.changeSection, { backgroundColor: changeColor }]}>
                <Text style={styles.changeText}>
                  {isPositive ? '+' : ''}{percentChange.toFixed(1)}%
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginVertical: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  content: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  labelSection: {
    flex: 1,
    minWidth: 80,
  },
  label: {
    ...typography.label,
    color: colors.text,
  },
  valuesSection: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    gap: spacing.sm,
  },
  valueColumn: {
    alignItems: 'center',
  },
  valueLabel: {
    ...typography.caption,
    fontSize: 10,
    marginBottom: 2,
  },
  value: {
    ...typography.label,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  arrowSection: {
    marginHorizontal: spacing.xs,
  },
  changeSection: {
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    minWidth: 50,
    alignItems: 'center',
  },
  changeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600' as const,
  },
});
