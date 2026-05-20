import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { BotanistMessage } from '../../types';
import { borderRadius, colors, spacing, typography } from '../../constants/theme';

interface Props {
  message: BotanistMessage;
}

export default function BotanistMessageComponent({ message }: Props) {
  const time = format(parseISO(message.timestamp), 'HH:mm', { locale: fr });

  return (
    <View style={styles.messageWrapper}>
      <View style={styles.messageContainer}>
        <View style={styles.icon}>
          <Text style={styles.iconText}>🌱</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.text}>{message.text}</Text>
          <Text style={styles.timestamp}>{time}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  messageWrapper: {
    marginBottom: spacing.md,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  iconText: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    backgroundColor: colors.primary + '08',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.lg,
  },
  text: {
    ...typography.body,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  timestamp: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
    fontSize: 12,
  },
});
