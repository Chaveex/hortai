import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GardeningTip } from '../types';
import { colors, spacing, borderRadius } from '../constants/theme';

interface Props {
  tip: GardeningTip;
}

const PRIORITY_COLORS = {
  high: { border: colors.warning, bg: '#FFF3EE' },
  medium: { border: colors.accent, bg: '#FFFBEE' },
  low: { border: colors.primaryLight, bg: '#F0F9F4' },
};

export default function TipCard({ tip }: Props) {
  const style = PRIORITY_COLORS[tip.priority];

  return (
    <View style={[styles.card, { borderLeftColor: style.border, backgroundColor: style.bg }]}>
      <Text style={styles.icon}>{tip.icon}</Text>
      <View style={styles.content}>
        <Text style={styles.title}>{tip.title}</Text>
        <Text style={styles.message}>{tip.message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  icon: {
    fontSize: 22,
    marginTop: 1,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 3,
  },
  message: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
