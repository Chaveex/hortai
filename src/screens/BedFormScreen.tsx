import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useStore } from '@/store/useStore';
import { colors, spacing, typography } from '@/constants/theme';

export function BedFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { bedId } = route.params ?? {};

  const addGardenBed = useStore(s => s.addGardenBed);
  const updateGardenBed = useStore(s => s.updateGardenBed);
  const gardenBeds = useStore(s => s.gardenBeds);

  const bed = bedId ? gardenBeds.find(b => b.id === bedId) : null;
  const isEditMode = !!bedId;

  const [name, setName] = useState(bed?.name ?? '');
  const [location, setLocation] = useState(bed?.location ?? '');
  const [size, setSize] = useState(bed?.rows ?? 6);

  const sizeOptions = [
    { rows: 4, cols: 4, label: '4×4' },
    { rows: 6, cols: 6, label: '6×6' },
    { rows: 8, cols: 8, label: '8×8' },
    { rows: 10, cols: 10, label: '10×10' },
  ];

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Le nom du bac est requis');
      return;
    }

    if (isEditMode && bed) {
      updateGardenBed(bedId, { name, location });
    } else {
      const sizeObj = sizeOptions.find(s => s.rows === size);
      if (sizeObj) {
        addGardenBed({
          name,
          location,
          rows: sizeObj.rows,
          cols: sizeObj.cols,
          cells: [],
        });
      }
    }

    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Retour</Text>
        </Pressable>
        <Text style={styles.title}>
          {isEditMode ? 'Modifier le bac' : 'Créer un bac'}
        </Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.field}>
          <Text style={styles.label}>Nom du bac *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Bac tomates, Carré nord..."
            value={name}
            onChangeText={setName}
            placeholderTextColor="#ccc"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Localisation (optionnel)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Coin sud, Terrasse, Contre le mur..."
            value={location}
            onChangeText={setLocation}
            placeholderTextColor="#ccc"
          />
        </View>

        {!isEditMode && (
          <View style={styles.field}>
            <Text style={styles.label}>Taille de la grille</Text>
            <View style={styles.sizeGrid}>
              {sizeOptions.map(option => (
                <Pressable
                  key={option.label}
                  style={[
                    styles.sizeButton,
                    size === option.rows && styles.sizeButtonActive,
                  ]}
                  onPress={() => setSize(option.rows)}
                >
                  <Text
                    style={[
                      styles.sizeButtonText,
                      size === option.rows && styles.sizeButtonTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>
            {isEditMode ? 'Mettre à jour' : 'Créer le bac'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
    marginRight: spacing.md,
  },
  title: {
    ...typography.h3,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text,
    backgroundColor: '#fff',
  },
  sizeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  sizeButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  sizeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sizeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  sizeButtonTextActive: {
    color: '#fff',
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
