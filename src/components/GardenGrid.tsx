import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, Alert } from 'react-native';
import { GardenCell } from './GardenCell';
import { Plant, GardenBed } from '@/types';
import { isIncompatible } from '@/constants/plantCompatibility';

interface GardenGridProps {
  gardenMap: GardenBed;
  plants: Plant[];
  onCellPress: (row: number, col: number) => void;
  onPlantPress: (plantId: string) => void;
  onCellRemove: (row: number, col: number) => void;
}

export function GardenGrid({
  gardenMap,
  plants,
  onCellPress,
  onPlantPress,
  onCellRemove,
}: GardenGridProps) {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);

  function getNeighbors(row: number, col: number): Array<{ row: number; col: number }> {
    const neighbors: Array<{ row: number; col: number }> = [];
    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if ((r !== row || c !== col) && r >= 0 && r < gardenMap.rows && c >= 0 && c < gardenMap.cols) {
          neighbors.push({ row: r, col: c });
        }
      }
    }
    return neighbors;
  }

  function getDensityRatio(row: number, col: number): number {
    const neighbors = getNeighbors(row, col);
    const occupied = neighbors.filter(n => {
      const cell = gardenMap.cells.find(c => c.row === n.row && c.col === n.col);
      return cell?.plantId;
    }).length;
    return occupied / neighbors.length;
  }

  function hasConflict(row: number, col: number): boolean {
    const cell = gardenMap.cells.find(c => c.row === row && c.col === col);
    if (!cell?.plantId) return false;

    const plant = plants.find(p => p.id === cell.plantId);
    if (!plant) return false;

    const neighbors = getNeighbors(row, col);
    for (const n of neighbors) {
      const neighborCell = gardenMap.cells.find(c => c.row === n.row && c.col === n.col);
      if (neighborCell?.plantId) {
        const neighborPlant = plants.find(p => p.id === neighborCell.plantId);
        if (neighborPlant && isIncompatible(plant.type, neighborPlant.type)) {
          return true;
        }
      }
    }
    return false;
  }

  function handleCellPress(row: number, col: number) {
    const cell = gardenMap.cells.find(c => c.row === row && c.col === col);
    if (cell?.plantId) {
      onPlantPress(cell.plantId);
    } else {
      onCellPress(row, col);
    }
  }

  function handleCellLongPress(row: number, col: number) {
    const cell = gardenMap.cells.find(c => c.row === row && c.col === col);
    if (cell?.plantId) {
      Alert.alert('Retirer plante', 'Voulez-vous retirer cette plante ?', [
        { text: 'Annuler', onPress: () => {} },
        {
          text: 'Retirer',
          onPress: () => onCellRemove(row, col),
          style: 'destructive',
        },
      ]);
    }
  }

  return (
    <ScrollView
      horizontal
      scrollEventThrottle={16}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <ScrollView scrollEventThrottle={16} style={styles.verticalScroll}>
        <View style={[styles.grid, { width: gardenMap.cols * 48 }]}>
          {gardenMap.cells.map(cell => (
            <GardenCell
              key={`${cell.row}-${cell.col}`}
              row={cell.row}
              col={cell.col}
              plantId={cell.plantId}
              plants={plants}
              hasConflict={hasConflict(cell.row, cell.col)}
              densityRatio={getDensityRatio(cell.row, cell.col)}
              onPress={() => handleCellPress(cell.row, cell.col)}
              onLongPress={() => handleCellLongPress(cell.row, cell.col)}
            />
          ))}
        </View>
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  verticalScroll: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
