import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';

export interface AlertItem {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  message: string;
  icon?: string;
  action?: { label: string; onPress: () => void };
  dismissible?: boolean;
}

interface AlertBannerProps {
  alerts: AlertItem[];
  onDismiss?: (id: string) => void;
}

function getAlertColor(type: AlertItem['type']) {
  switch (type) {
    case 'error':
      return colors.error;
    case 'warning':
      return colors.warning;
    case 'success':
      return colors.success;
    case 'info':
    default:
      return colors.primary;
  }
}

function getAlertIcon(type: AlertItem['type'], icon?: string): string {
  if (icon) return icon;
  switch (type) {
    case 'error':
      return '⚠️';
    case 'warning':
      return '⚡';
    case 'success':
      return '✓';
    case 'info':
    default:
      return 'ℹ️';
  }
}

export function AlertBanner({ alerts, onDismiss }: AlertBannerProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const visibleAlerts = alerts.filter(a => !dismissedIds.has(a.id));

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => new Set([...prev, id]));
    onDismiss?.(id);
  };

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {visibleAlerts.map(alert => (
        <View
          key={alert.id}
          style={[styles.alert, { borderLeftColor: getAlertColor(alert.type) }]}
        >
          <View style={styles.alertContent}>
            <Text style={styles.alertIcon}>{getAlertIcon(alert.type, alert.icon)}</Text>
            <View style={styles.alertText}>
              <Text style={styles.message}>{alert.message}</Text>
            </View>
          </View>
          <View style={styles.alertActions}>
            {alert.action && (
              <TouchableOpacity
                onPress={alert.action.onPress}
                style={styles.actionButton}
              >
                <Text style={[styles.actionText, { color: getAlertColor(alert.type) }]}>
                  {alert.action.label}
                </Text>
              </TouchableOpacity>
            )}
            {alert.dismissible !== false && (
              <TouchableOpacity
                onPress={() => handleDismiss(alert.id)}
                style={styles.dismissButton}
              >
                <Text style={styles.dismissIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
    gap: spacing.sm,
  },
  alert: {
    backgroundColor: colors.surface,
    borderLeftWidth: 4,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  alertContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  alertIcon: {
    fontSize: 18,
    marginTop: 2,
  },
  alertText: {
    flex: 1,
  },
  message: {
    ...typography.body,
    color: colors.text,
  },
  alertActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginLeft: spacing.sm,
  },
  actionButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  actionText: {
    ...typography.label,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  dismissButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  dismissIcon: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '600' as const,
  },
});
