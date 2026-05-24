import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useStore } from '@/store/useStore';
import { GardenGrid } from '@/components/GardenGrid';
import { PlantPickerModal } from '@/components/PlantPickerModal';
import { colors, spacing, typography } from '@/constants/theme';

export function BedGridScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { bedId } = route.params;

  const gardenBeds = useStore(s => s.gardenBeds);
  const plants = useStore(s => s.plants);
  const setBedCell = useStore(s => s.setBedCell);
  const resizeBed = useStore(s => s.resizeBed);

  const bed = gardenBeds.find(b => b.id === bedId);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);

  if (!bed) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <Text>Bac non trouvé</Text>
      </SafeAreaView>
    );
  }

  const sizeOptions = [
    { size: 4, label: '4×4' },
    { size: 6, label: '6×6' },
    { size: 8, label: '8×8' },
    { size: 10, label: '10×10' },
  ];

  const handleCellPress = (row: number, col: number) => {
    setSelectedCell({ row, col });
    setPickerVisible(true);
  };

  const handlePlantSelect = (plantId: string) => {
    if (selectedCell) {
      setBedCell(bedId, selectedCell.row, selectedCell.col, plantId);
      setSelectedCell(null);
    }
  };

  const handlePlantPress = (plantId: string) => {
    const plant = plants.find(p => p.id === plantId);
    if (plant) {
      navigation.navigate('PlantDetail', { plantId });
    }
  };

  const handleCellRemove = (row: number, col: number) => {
    setBedCell(bedId, row, col, undefined);
  };

  const handleSizeChange = (newSize: number) => {
    if (bed.cells.some(c => c.plantId)) {
      Alert.alert(
        'Réinitialiser la grille',
        'Changer la taille effacera toutes les plantes placées.',
        [
          { text: 'Annuler', onPress: () => {} },
          {
            text: 'Réinitialiser',
            onPress: () => resizeBed(bedId, newSize, newSize),
            style: 'destructive',
          },
        ]
      );
    } else {
      resizeBed(bedId, newSize, newSize);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Retour</Text>
          </Pressable>
          <View style={styles.bedInfo}>
            <Text style={styles.title}>{bed.name}</Text>
            {bed.location && (
              <Text style={styles.location}>{bed.location}</Text>
            )}
          </View>
        </View>
        <Pressable
          onPress={() => navigation.navigate('BedForm', { bedId })}
          style={styles.editButton}
        >
          <Text style={styles.editButtonText}>✏️</Text>
        </Pressable>
      </View>

      <View style={styles.sizeSelector}>
        {sizeOptions.map(option => (
          <Pressable
            key={option.size}
            style={[
              styles.sizeButton,
              bed.rows === option.size && styles.sizeButtonActive,
            ]}
            onPress={() => handleSizeChange(option.size)}
          >
            <Text
              style={[
                styles.sizeButtonText,
                bed.rows === option.size && styles.sizeButtonTextActive,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.gridContainer}>
        <GardenGrid
          gardenMap={bed}
          plants={plants}
          onCellPress={handleCellPress}
          onPlantPress={handlePlantPress}
          onCellRemove={handleCellRemove}
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
    backgroundColor: '#fafaf9',
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  backButton: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  bedInfo: {
    flex: 1,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  location: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  editButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.primary + '15',
  },
  editButtonText: {
    fontSize: 20,
  },
  sizeSelector: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sizeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  sizeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sizeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  sizeButtonTextActive: {
    color: '#fff',
  },
  gridContainer: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: '#fafaf9',
  },
});
