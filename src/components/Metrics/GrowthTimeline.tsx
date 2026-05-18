import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';

interface GrowthTimelineProps {
  stages: Array<{
    label: string;
    completed: boolean;
    current?: boolean;
    emoji?: string;
  }>;
  currentStage?: number;
  progressPercent?: number;
}

export function GrowthTimeline({
  stages,
  currentStage = 0,
  progressPercent = 0,
}: GrowthTimelineProps) {
  if (!stages || stages.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.min(progressPercent, 100)}%` },
          ]}
        />
      </View>

      {/* Stage labels */}
      <View style={styles.stagesContainer}>
        {stages.map((stage, idx) => {
          const isCompleted = stage.completed;
          const isCurrent = stage.current || idx === currentStage;

          return (
            <View key={idx} style={[styles.stageWrapper, { flex: 1 }]}>
              <View style={styles.stageCenter}>
                <View
                  style={[
                    styles.stageDot,
                    isCompleted && styles.stageDotCompleted,
                    isCurrent && styles.stageDotCurrent,
                  ]}
                >
                  {stage.emoji && (
                    <Text style={styles.stageEmoji}>{stage.emoji}</Text>
                  )}
                  {!stage.emoji && isCompleted && (
                    <Text style={styles.stageCheckmark}>✓</Text>
                  )}
                </View>
              </View>
              <Text style={[styles.stageLabel, isCurrent && styles.stageLabelCurrent]}>
                {stage.label}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Days or percentage info */}
      <View style={styles.infoRow}>
        <Text style={styles.infoText}>
          {progressPercent.toFixed(0)}% complété
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginVertical: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: borderRadius.full,
  },
  stagesContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'flex-start',
  },
  stageWrapper: {
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  stageCenter: {
    marginBottom: spacing.sm,
  },
  stageDot: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  stageDotCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  stageDotCurrent: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
    borderWidth: 3,
  },
  stageEmoji: {
    fontSize: 16,
  },
  stageCheckmark: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.surface,
  },
  stageLabel: {
    ...typography.caption,
    fontSize: 10,
    textAlign: 'center',
    color: colors.textMuted,
    maxWidth: 50,
  },
  stageLabelCurrent: {
    color: colors.primary,
    fontWeight: '600' as const,
  },
  infoRow: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  infoText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
