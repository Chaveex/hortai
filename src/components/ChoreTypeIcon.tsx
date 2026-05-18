import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { ChoreType, CHORE_TYPE_META } from '../types/chores';

interface Props {
  type: ChoreType;
  size?: number;
  showLabel?: boolean;
  style?: ViewStyle;
}

export default function ChoreTypeIcon({ type, size = 36, showLabel = false, style }: Props) {
  const meta = CHORE_TYPE_META[type];
  return (
    <View style={[styles.wrap, style]}>
      <View
        style={[
          styles.bubble,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: meta.backgroundColor,
            borderColor: meta.color,
          },
        ]}
      >
        <Text style={{ fontSize: size * 0.5 }}>{meta.icon}</Text>
      </View>
      {showLabel && <Text style={[styles.label, { color: meta.color }]}>{meta.label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 4 },
  bubble: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  label: { fontSize: 11, fontWeight: '600' },
});
