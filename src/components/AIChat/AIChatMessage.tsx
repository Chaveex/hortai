import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AIChatMessage as AIChatMessageType } from '../../types';
import { borderRadius, colors, spacing } from '../../constants/theme';

interface Props {
  message: AIChatMessageType;
}

export default function AIChatMessage({ message }: Props) {
  const time = safeFormat(message.timestamp);
  return (
    <View style={styles.row}>
      <Text style={styles.avatar}>🤖</Text>
      <View style={styles.bubble}>
        <Text style={styles.text}>{message.content}</Text>
        <Text style={styles.time}>{time}</Text>
      </View>
    </View>
  );
}

function safeFormat(iso: string): string {
  try {
    return format(parseISO(iso), 'HH:mm', { locale: fr });
  } catch {
    return '';
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  avatar: {
    fontSize: 22,
    marginBottom: 4,
  },
  bubble: {
    maxWidth: '78%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderTopLeftRadius: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  time: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
});
