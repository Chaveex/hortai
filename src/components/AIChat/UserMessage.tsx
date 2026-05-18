import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AIChatMessage } from '../../types';
import { borderRadius, colors, spacing } from '../../constants/theme';
import PhotoPreview from './PhotoPreview';

interface Props {
  message: AIChatMessage;
}

export default function UserMessage({ message }: Props) {
  const time = safeFormat(message.timestamp);
  return (
    <View style={styles.row}>
      <View style={styles.bubble}>
        {message.photo && (
          <View style={styles.photoWrap}>
            <PhotoPreview source={message.photo} size={140} isBase64 />
          </View>
        )}
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
    justifyContent: 'flex-end',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  bubble: {
    maxWidth: '82%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    borderTopRightRadius: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  time: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  photoWrap: {
    marginBottom: spacing.xs,
  },
});
