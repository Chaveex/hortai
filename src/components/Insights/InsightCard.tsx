import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';

interface InsightCardProps {
  title: string;
  description: string;
  type?: 'success' | 'warning' | 'opportunity' | 'info';
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
}

function getTypeColor(type: InsightCardProps['type']) {
  switch (type) {
    case 'warning':
      return colors.warning;
    case 'success':
      return colors.success;
    case 'opportunity':
      return colors.accent;
    case 'info':
    default:
      return colors.primary;
  }
}

function getTypeIcon(type: InsightCardProps['type'], icon?: string): string {
  if (icon) return icon;
  switch (type) {
    case 'warning':
      return '⚠️';
    case 'success':
      return '✨';
    case 'opportunity':
      return '💡';
    case 'info':
    default:
      return 'ℹ️';
  }
}

export function InsightCard({
  title,
  description,
  type = 'info',
  icon,
  actionLabel,
  onAction,
}: InsightCardProps) {
  const typeColor = getTypeColor(type);
  const typeIcon = getTypeIcon(type, icon);

  return (
    <View style={[styles.card, { borderLeftColor: typeColor }]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{typeIcon}</Text>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{title}</Text>
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: typeColor },
            ]}
          >
            <Text style={styles.typeLabel}>
              {type === 'opportunity' ? 'Opportunité' : type === 'warning' ? 'Attention' : type === 'success' ? 'Succès' : 'Info'}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.description}>{description}</Text>

      {actionLabel && onAction && (
        <TouchableOpacity
          onPress={onAction}
          style={[styles.actionButton, { borderColor: typeColor }]}
        >
          <Text style={[styles.actionLabel, { color: typeColor }]}>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderLeftWidth: 4,
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
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  icon: {
    fontSize: 24,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...typography.h3,
    flex: 1,
  },
  typeBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  typeLabel: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: '600' as const,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  actionButton: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  actionLabel: {
    fontWeight: '600' as const,
    fontSize: 13,
  },
});
