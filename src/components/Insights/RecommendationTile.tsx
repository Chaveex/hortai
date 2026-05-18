import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';

interface RecommendationTileProps {
  id: string;
  title: string;
  icon?: string;
  urgency?: 'low' | 'medium' | 'high';
  onComplete?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

function getUrgencyColor(urgency?: string) {
  switch (urgency) {
    case 'high':
      return colors.error;
    case 'medium':
      return colors.warning;
    case 'low':
    default:
      return colors.success;
  }
}

export function RecommendationTile({
  id,
  title,
  icon = '✓',
  urgency = 'low',
  onComplete,
  onDismiss,
}: RecommendationTileProps) {
  const [completed, setCompleted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const handleComplete = () => {
    setCompleted(true);
    onComplete?.(id);
  };

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.(id);
  };

  if (dismissed) {
    return null;
  }

  return (
    <View
      style={[
        styles.tile,
        {
          borderLeftColor: getUrgencyColor(urgency),
          opacity: completed ? 0.6 : 1,
        },
      ]}
    >
      <View style={styles.content}>
        <TouchableOpacity
          onPress={handleComplete}
          style={[
            styles.checkbox,
            completed && styles.checkboxCompleted,
          ]}
        >
          {completed && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>

        <View style={styles.titleSection}>
          <Text
            style={[
              styles.title,
              completed && styles.titleCompleted,
            ]}
          >
            {title}
          </Text>
          {urgency !== 'low' && (
            <View
              style={[
                styles.urgencyBadge,
                { backgroundColor: getUrgencyColor(urgency) },
              ]}
            >
              <Text style={styles.urgencyLabel}>
                {urgency === 'high' ? 'Urgent' : 'Important'}
              </Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity onPress={handleDismiss} style={styles.dismissButton}>
        <Text style={styles.dismissIcon}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: colors.surface,
    borderLeftWidth: 4,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkmark: {
    color: colors.surface,
    fontWeight: '700' as const,
    fontSize: 14,
  },
  titleSection: {
    flex: 1,
    gap: spacing.sm,
  },
  title: {
    ...typography.body,
    color: colors.text,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  urgencyBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  urgencyLabel: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: '600' as const,
  },
  dismissButton: {
    padding: spacing.sm,
  },
  dismissIcon: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '600' as const,
  },
});
