import React from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Toast } from '@/hooks/useToast';
import { colors, spacing } from '@/constants/theme';

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  const getToastColor = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return '#10B981'; // green
      case 'error':
        return '#EF4444'; // red
      case 'info':
        return '#3B82F6'; // blue
      default:
        return colors.primary;
    }
  };

  const getToastIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'info':
        return 'ⓘ';
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      {toasts.map((toast) => (
        <Pressable
          key={toast.id}
          style={[
            styles.toast,
            { backgroundColor: getToastColor(toast.type) },
          ]}
          onPress={() => onDismiss(toast.id)}
          accessibilityRole="button"
          accessibilityLabel={`${toast.type}: ${toast.message}`}
        >
          <Text style={styles.icon}>{getToastIcon(toast.type)}</Text>
          <Text style={styles.message} numberOfLines={2}>
            {toast.message}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.md,
    right: spacing.md,
    pointerEvents: 'box-none',
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  icon: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: spacing.sm,
  },
  message: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});
