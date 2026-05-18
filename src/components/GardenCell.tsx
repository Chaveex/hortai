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

  const backgroundColor = densityRatio > 0.5 ? 'rgba(255, 223, 0, 0.15)' : 'transparent';
  const borderColor = hasConflict ? '#dc3545' : '#999';
  const borderWidth = hasConflict ? 2 : 1;

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
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 20,
  },
  badge: {
    fontSize: 10,
    position: 'absolute',
    top: -2,
    right: -2,
  },
});
