import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography, borderRadius } from '../constants/theme';

interface HarvestGoalCardProps {
  harvestMonth: string;
  harvestGoal: number;
  harvestActual: number;
  onPress: () => void;
}

export default function HarvestGoalCard({
  harvestMonth,
  harvestGoal,
  harvestActual,
  onPress,
}: HarvestGoalCardProps) {
  const { t } = useTranslation();
  const progressPercent = harvestGoal > 0 ? (harvestActual / harvestGoal) * 100 : 0;
  const clampedProgress = Math.min(progressPercent, 100);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={t('home.harvestGoalA11yLabel')}
      accessibilityHint={t('home.harvestGoalA11yHint')}
    >
      <View style={styles.header}>
        <Text style={styles.emoji}>📦</Text>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{t('home.harvestGoalTitle')}</Text>
          <Text style={styles.subtitle}>{harvestMonth}</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${clampedProgress}%`,
              },
            ]}
          />
        </View>

        <Text style={styles.progressText}>
          {harvestActual.toFixed(1)} kg / {harvestGoal} kg
        </Text>
      </View>

      <Text style={styles.linkText}>{t('home.harvestGoalDetail')}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emoji: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  progressSection: {
    marginBottom: spacing.lg,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  linkText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
});
