import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Plant } from '@/types';
import { PLANT_DATABASE } from '@/constants/plants';

interface GardenCellProps {
  row: number;
  col: number;
  plantId?: string;
  plants: Plant[];
  hasConflict: boolean;
  densityRatio: number;
  onPress: () => void;
  onLongPress: () => void;
}

export function GardenCell({
  row,
  col,
  plantId,
  plants,
  hasConflict,
  densityRatio,
  onPress,
  onLongPress,
}: GardenCellProps) {
  const plant = plants.find(p => p.id === plantId);
  const plantInfo = plant ? PLANT_DATABASE[plant.type] : null;

  // Terre/soil color with overlay for density
  const soilColor = '#8B7355'; // Rich soil brown
  const lightSoilColor = '#A0826D'; // Lighter soil for empty cells

  const backgroundColor = plantId
    ? soilColor
    : lightSoilColor;

  const overlayOpacity = densityRatio > 0.5 ? 0.2 : 0;

  const borderColor = hasConflict ? '#dc3545' : 'transparent';
  const borderWidth = hasConflict ? 2 : 0;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={[
        styles.cell,
        {
          backgroundColor,
          borderColor,
          borderWidth,
        },
      ]}
    >
      {/* Density overlay */}
      {overlayOpacity > 0 && (
        <View
          style={[
            styles.densityOverlay,
            { opacity: overlayOpacity }
          ]}
        />
      )}

      {plantInfo && plant && (
        <View style={styles.content}>
          <Text style={styles.emoji}>{plantInfo.icon}</Text>
          {hasConflict && <Text style={styles.badge}>⚠️</Text>}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: 46,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 3,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  densityOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFD700',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  emoji: {
    fontSize: 22,
  },
  badge: {
    fontSize: 12,
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
  },
});
