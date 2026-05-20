import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, colors, spacing } from '../constants/theme';

interface Props {
  onPress: () => void;
}

const TAB_BAR_HEIGHT = 60;

export default function AIFABButton({ onPress }: Props) {
  const insets = useSafeAreaInsets();
  const scale = useRef(new Animated.Value(1)).current;

  const bottom = TAB_BAR_HEIGHT + insets.bottom + spacing.md;

  function pressIn() {
    Animated.spring(scale, { toValue: 0.9, useNativeDriver: true, friction: 6 }).start();
  }
  function pressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }).start();
  }

  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { bottom }]}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          onPress={onPress}
          onPressIn={pressIn}
          onPressOut={pressOut}
          accessibilityRole="button"
          accessibilityLabel="Aide jardinage IA"
          style={styles.button}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.emoji}>🧚</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: spacing.md,
    zIndex: 10,
    elevation: 10,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },
  emoji: {
    fontSize: 26,
  },
});
