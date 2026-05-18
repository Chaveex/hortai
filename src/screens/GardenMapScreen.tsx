import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '@/store/useStore';
import { GardenGrid } from '@/components/GardenGrid';
import { PlantPickerModal } from '@/components/PlantPickerModal';

export function GardenMapScreen() {
  const navigation = useNavigation<any>();
  const gardenMap = useStore(s => s.gardenMap);
  const plants = useStore(s => s.plants);
  const setGardenMapSize = useStore(s => s.setGardenMapSize);
  const setGardenCell = useStore(s => s.setGardenCell);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const { width } = useWindowDimensions();

  const gridSizeOptions = [
    { size: 8, label: '8×8' },
    { size: 10, label: '10×10' },
    { size: 12, label: '12×12' },
  ];

  const handleCellPress = (row: number, col: number) => {
    setSelectedCell({ row, col });
    setPickerVisible(true);
  };

  const handlePlantSelect = (plantId: string) => {
    if (selectedCell) {
      setGardenCell(selectedCell.row, selectedCell.col, plantId);
      setSelectedCell(null);
    }
  };

  const handlePlantPress = (plantId: string) => {
    const plant = plants.find(p => p.id === plantId);
    if (plant) {
      navigation.navigate('PlantDetail', { plantId });
    }
  };

  const handleGridSizeChange = (size: number) => {
    if (gardenMap.cells.some(c => c.plantId)) {
      Alert.alert(
        'Réinitialiser la grille',
        'Changer la taille effacera toutes les plantes placées.',
        [
          { text: 'Annuler', onPress: () => {} },
          {
            text: 'Réinitialiser',
            onPress: () => setGardenMapSize(size, size),
            style: 'destructive',
          },
        ]
      );
    } else {
      setGardenMapSize(size, size);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Cartographie du Jardin</Text>
          <Text style={styles.subtitle}>
            {gardenMap.rows}×{gardenMap.cols} – {gardenMap.cells.filter(c => c.plantId).length} plantes
          </Text>
        </View>
      </View>

      <View style={styles.sizeSelector}>
        {gridSizeOptions.map(option => (
          <Pressable
            key={option.size}
            style={[
              styles.sizeButton,
              gardenMap.rows === option.size && styles.sizeButtonActive,
            ]}
            onPress={() => handleGridSizeChange(option.size)}
          >
            <Text
              style={[
                styles.sizeButtonText,
                gardenMap.rows === option.size && styles.sizeButtonTextActive,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: 'transparent', borderColor: '#999' }]} />
          <Text style={styles.legendLabel}>Vide</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: 'rgba(0, 123, 255, 0.1)', borderColor: '#999' }]}>
            <Text style={styles.legendEmoji}>🌱</Text>
          </View>
          <Text style={styles.legendLabel}>Planté</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: 'transparent', borderColor: '#dc3545', borderWidth: 2 }]}>
            <Text style={styles.legendEmoji}>⚠️</Text>
          </View>
          <Text style={styles.legendLabel}>Conflit</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: 'rgba(255, 223, 0, 0.15)', borderColor: '#999' }]} />
          <Text style={styles.legendLabel}>Dense</Text>
        </View>
      </View>

      <View style={styles.gridContainer}>
        <GardenGrid
          gardenMap={gardenMap}
          plants={plants}
          onCellPress={handleCellPress}
          onPlantPress={handlePlantPress}
        />
      </View>

      <PlantPickerModal
        visible={pickerVisible}
        plants={plants}
        onSelect={handlePlantSelect}
        onClose={() => {
          setPickerVisible(false);
          setSelectedCell(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  sizeSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  sizeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
  },
  sizeButtonActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  sizeButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  sizeButtonTextActive: {
    color: '#fff',
  },
  legend: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendEmoji: {
    fontSize: 12,
  },
  legendLabel: {
    fontSize: 12,
    color: '#666',
  },
  gridContainer: {
    flex: 1,
    padding: 8,
  },
});
