import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { BotanistMessage } from '../../types';
import { borderRadius, colors, spacing, typography } from '../../constants/theme';

interface Props {
  message: BotanistMessage;
}

export default function UserMessageComponent({ message }: Props) {
  const time = format(parseISO(message.timestamp), 'HH:mm', { locale: fr });

  return (
    <View style={styles.messageWrapper}>
      <View style={styles.messageContainer}>
        <View style={styles.content}>
          <Text style={styles.text}>{message.text}</Text>
          {message.photo && (
            <Text style={styles.photoIndicator}>📸 Photo jointe</Text>
          )}
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
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  content: {
    maxWidth: '85%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  text: {
    ...typography.body,
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  photoIndicator: {
    ...typography.caption,
    color: '#E8E8E8',
    marginTop: spacing.xs,
    fontSize: 12,
  },
  timestamp: {
    ...typography.caption,
    color: '#D0D0D0',
    marginTop: spacing.xs,
    fontSize: 12,
  },
});
