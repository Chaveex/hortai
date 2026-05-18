import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, spacing } from '../../constants/theme';

interface Props {
  source: string;
  onRemove?: () => void;
  size?: number;
  isBase64?: boolean;
}

export default function PhotoPreview({ source, onRemove, size = 80, isBase64 = false }: Props) {
  const uri = isBase64 ? `data:image/jpeg;base64,${source}` : source;
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image source={{ uri }} style={[styles.image, { width: size, height: size }]} />
      {onRemove && (
        <Pressable
          onPress={onRemove}
          style={styles.removeBtn}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          accessibilityLabel="Supprimer photo"
        >
          <Text style={styles.removeText}>×</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.sm,
    overflow: 'visible',
    position: 'relative',
  },
  image: {
    borderRadius: borderRadius.sm,
    backgroundColor: colors.border,
  },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.warning,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  removeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
    marginTop: -2,
  },
});

export const photoPreviewSpacing = spacing.xs;
