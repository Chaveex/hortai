import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { borderRadius, colors, spacing } from '../constants/theme';

interface Props {
  onChatPress: () => void;
}

const TAB_BAR_HEIGHT = 60;

export default function ContextFAB({ onChatPress }: Props) {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const navigation = useNavigation<any>();
  const scale = useRef(new Animated.Value(1)).current;

  const bottom = TAB_BAR_HEIGHT + insets.bottom + spacing.md;

  // Determine which tab we're on
  const currentTab = route.name;
  const isGardenTab = currentTab === 'Jardin';
  const isChoreTab = currentTab === 'Tâches';

  // Don't show context FAB if not on Jardin or Tâches
  if (!isGardenTab && !isChoreTab) {
    return null;
  }

  const isAddPlantFAB = isGardenTab;
  const isAddChoreFAB = isChoreTab;

  const emoji = isAddPlantFAB ? '🌱' : '📅';
  const label = isAddPlantFAB ? 'Ajouter une plante' : 'Ajouter une tâche';
  const hint = isAddPlantFAB
    ? 'Appuyez pour créer une nouvelle plante'
    : 'Appuyez pour créer une nouvelle tâche';

  function pressIn() {
    Animated.spring(scale, { toValue: 0.9, useNativeDriver: true, friction: 6 }).start();
  }

  function pressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }).start();
  }

  function handlePress() {
    if (isAddPlantFAB) {
      navigation.navigate('Jardin', {
        screen: 'GardenTabs',
        params: { screen: 'Plantes', params: { action: 'addPlant' } },
      });
      // Also navigate to AddPlant screen
      setTimeout(() => {
        navigation.navigate('Jardin', { screen: 'AddPlant' });
      }, 100);
    } else if (isAddChoreFAB) {
      navigation.navigate('Tâches', { screen: 'ChoreForm' });
    }
  }

  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { bottom }]}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          onPress={handlePress}
          onPressIn={pressIn}
          onPressOut={pressOut}
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityHint={hint}
          style={styles.button}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.emoji}>{emoji}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: '50%',
    marginLeft: -28,
    zIndex: 9,
    elevation: 9,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },
  emoji: {
    fontSize: 24,
  },
});
