import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { Plant } from '@/types';
import { PLANT_DATABASE } from '@/constants/plants';

interface PlantPickerModalProps {
  visible: boolean;
  plants: Plant[];
  onSelect: (plantId: string) => void;
  onClose: () => void;
}

export function PlantPickerModal({
  visible,
  plants,
  onSelect,
  onClose,
}: PlantPickerModalProps) {
  const handleSelect = (plantId: string) => {
    onSelect(plantId);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Sélectionner une plante</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>

        {plants.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Aucune plante ajoutée</Text>
            <Text style={styles.emptyHint}>Ajoutez des plantes d'abord</Text>
          </View>
        ) : (
          <FlatList
            data={plants}
            keyExtractor={p => p.id}
            renderItem={({ item: plant }) => {
              const info = PLANT_DATABASE[plant.type];
              return (
                <Pressable
                  style={styles.plantItem}
                  onPress={() => handleSelect(plant.id)}
                >
                  <Text style={styles.emoji}>{info.icon}</Text>
                  <View style={styles.plantInfo}>
                    <Text style={styles.plantName}>{plant.name}</Text>
                    <Text style={styles.plantType}>{info.frenchName}</Text>
                  </View>
                </Pressable>
              );
            }}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 24,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: '#999',
  },
  plantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  emoji: {
    fontSize: 32,
    marginRight: 12,
  },
  plantInfo: {
    flex: 1,
  },
  plantName: {
    fontSize: 16,
    fontWeight: '500',
  },
  plantType: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
});
