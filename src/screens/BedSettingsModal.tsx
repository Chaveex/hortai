import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useStore } from '@/store/useStore';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { colors, spacing, typography } from '@/constants/theme';
import { PLANT_DATABASE } from '@/constants/plants';
import { PlantType } from '@/types';

export function BedSettingsModal() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { bedId } = route.params || {};

  const updateBedMetadata = useStore(s => s.updateBedMetadata);
  const gardenBeds = useStore(s => s.gardenBeds);
  const currentBed = gardenBeds.find(b => b.id === bedId);

  // State
  const [length, setLength] = useState(currentBed?.dimensions?.length.toString() || '');
  const [width, setWidth] = useState(currentBed?.dimensions?.width.toString() || '');
  const [lengthUnit, setLengthUnit] = useState<'m' | 'ft'>(currentBed?.dimensions?.unit || 'm');
  const [soilType, setSoilType] = useState<'loam' | 'clay' | 'sandy' | 'mixed' | ''>(
    currentBed?.soilType || ''
  );
  const [cropRotation, setCropRotation] = useState(currentBed?.cropRotation || []);
  const [lastPrepared, setLastPrepared] = useState(
    currentBed?.lastPrepared ? parseISO(currentBed.lastPrepared) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCropPicker, setShowCropPicker] = useState(false);
  const [selectedCropType, setSelectedCropType] = useState<PlantType>('tomato');
  const [cropDate, setCropDate] = useState(new Date());

  if (!currentBed) {
    return null;
  }

  const calculateArea = (): string => {
    if (!length || !width) return '0';
    const l = parseFloat(length);
    const w = parseFloat(width);
    if (lengthUnit === 'ft') {
      // Convert sq ft to sq m (1 sq ft = 0.0929 sq m)
      return (l * w * 0.0929).toFixed(2);
    }
    return (l * w).toFixed(2);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setLastPrepared(selectedDate);
    }
    setShowDatePicker(false);
  };

  const handleAddCrop = () => {
    const newCrop = {
      plant: selectedCropType,
      date: format(cropDate, 'yyyy-MM-dd'),
    };
    setCropRotation([...cropRotation, newCrop]);
    setShowCropPicker(false);
  };

  const handleRemoveCrop = (index: number) => {
    setCropRotation(cropRotation.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!length || !width) {
      Alert.alert('Erreur', 'Veuillez entrer les dimensions du lit');
      return;
    }

    updateBedMetadata(bedId, {
      dimensions: {
        length: parseFloat(length),
        width: parseFloat(width),
        unit: lengthUnit,
      },
      soilType: soilType || undefined,
      cropRotation: cropRotation.length > 0 ? cropRotation : undefined,
      lastPrepared: format(lastPrepared, 'yyyy-MM-dd'),
    });

    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Fermer"
        >
          <Text style={styles.closeButton}>✕</Text>
        </Pressable>
        <Text style={styles.title}>Paramètres du lit</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Dimensions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dimensions</Text>
          <View style={styles.dimensionRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Longueur</Text>
              <TextInput
                style={styles.input}
                placeholder="ex: 2"
                keyboardType="decimal-pad"
                value={length}
                onChangeText={setLength}
                accessibilityLabel="Longueur du lit"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Largeur</Text>
              <TextInput
                style={styles.input}
                placeholder="ex: 1"
                keyboardType="decimal-pad"
                value={width}
                onChangeText={setWidth}
                accessibilityLabel="Largeur du lit"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Unité</Text>
              <View style={styles.unitSelector}>
                <Pressable
                  style={[
                    styles.unitButton,
                    lengthUnit === 'm' && styles.unitButtonActive,
                  ]}
                  onPress={() => setLengthUnit('m')}
                  accessibilityRole="button"
                  accessibilityLabel="Mètres"
                  accessibilityState={{ selected: lengthUnit === 'm' }}
                >
                  <Text
                    style={[
                      styles.unitButtonText,
                      lengthUnit === 'm' && styles.unitButtonTextActive,
                    ]}
                  >
                    m
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.unitButton,
                    lengthUnit === 'ft' && styles.unitButtonActive,
                  ]}
                  onPress={() => setLengthUnit('ft')}
                  accessibilityRole="button"
                  accessibilityLabel="Pieds"
                  accessibilityState={{ selected: lengthUnit === 'ft' }}
                >
                  <Text
                    style={[
                      styles.unitButtonText,
                      lengthUnit === 'ft' && styles.unitButtonTextActive,
                    ]}
                  >
                    ft
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
          <View style={styles.areaDisplay}>
            <Text style={styles.areaLabel}>Surface</Text>
            <Text style={styles.areaValue}>
              {calculateArea()} {lengthUnit === 'm' ? 'm²' : 'sq ft'}
            </Text>
          </View>
        </View>

        {/* Soil Type Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type de sol</Text>
          <View style={styles.soilOptions}>
            {(['loam', 'clay', 'sandy', 'mixed'] as const).map((type) => (
              <Pressable
                key={type}
                style={[
                  styles.soilButton,
                  soilType === type && styles.soilButtonActive,
                ]}
                onPress={() => setSoilType(type)}
                accessibilityRole="button"
                accessibilityLabel={type}
                accessibilityState={{ selected: soilType === type }}
              >
                <Text
                  style={[
                    styles.soilButtonText,
                    soilType === type && styles.soilButtonTextActive,
                  ]}
                >
                  {type === 'loam'
                    ? 'Terreau'
                    : type === 'clay'
                    ? 'Argileux'
                    : type === 'sandy'
                    ? 'Sablonneux'
                    : 'Mixte'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Last Prepared Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dernière préparation</Text>
          <Pressable
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
            accessibilityRole="button"
            accessibilityLabel="Sélectionner la date de dernière préparation"
          >
            <Text style={styles.dateButtonText}>
              📅 {format(lastPrepared, 'dd MMMM yyyy', { locale: fr })}
            </Text>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={lastPrepared}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
            />
          )}
        </View>

        {/* Crop Rotation Section */}
        <View style={styles.section}>
          <View style={styles.cropHeader}>
            <Text style={styles.sectionTitle}>Rotation des cultures</Text>
            <Pressable
              style={styles.addButton}
              onPress={() => setShowCropPicker(!showCropPicker)}
              accessibilityRole="button"
              accessibilityLabel="Ajouter une culture"
            >
              <Text style={styles.addButtonText}>+ Ajouter</Text>
            </Pressable>
          </View>

          {showCropPicker && (
            <View style={styles.cropPickerContainer}>
              <Text style={styles.label}>Culture</Text>
              <ScrollView
                style={styles.plantSelector}
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
              >
                {Object.entries(PLANT_DATABASE)
                  .slice(0, 15) // Limit display to first 15 plants
                  .map(([type]) => (
                    <Pressable
                      key={type}
                      style={[
                        styles.plantOption,
                        selectedCropType === type && styles.plantOptionActive,
                      ]}
                      onPress={() => setSelectedCropType(type as PlantType)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: selectedCropType === type }}
                    >
                      <Text
                        style={[
                          styles.plantOptionText,
                          selectedCropType === type && styles.plantOptionTextActive,
                        ]}
                      >
                        {PLANT_DATABASE[type as PlantType].frenchName}
                      </Text>
                    </Pressable>
                  ))}
              </ScrollView>

              <Text style={[styles.label, { marginTop: spacing.md }]}>Date</Text>
              <Pressable
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
                accessibilityRole="button"
                accessibilityLabel="Sélectionner la date de la culture"
              >
                <Text style={styles.dateButtonText}>
                  {format(cropDate, 'dd MMMM yyyy', { locale: fr })}
                </Text>
              </Pressable>
              {showDatePicker && (
                <DateTimePicker
                  value={cropDate}
                  mode="date"
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    if (selectedDate) setCropDate(selectedDate);
                    setShowDatePicker(false);
                  }}
                />
              )}

              <Pressable
                style={styles.confirmButton}
                onPress={handleAddCrop}
                accessibilityRole="button"
                accessibilityLabel="Confirmer l'ajout de culture"
              >
                <Text style={styles.confirmButtonText}>✓ Ajouter cette culture</Text>
              </Pressable>
            </View>
          )}

          {cropRotation.length > 0 && (
            <View style={styles.cropList}>
              {cropRotation.map((crop, index) => (
                <View key={index} style={styles.cropItem}>
                  <View>
                    <Text style={styles.cropName}>
                      {PLANT_DATABASE[crop.plant].frenchName}
                    </Text>
                    <Text style={styles.cropDate}>
                      {format(parseISO(crop.date), 'dd MMMM yyyy', { locale: fr })}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => handleRemoveCrop(index)}
                    accessibilityRole="button"
                    accessibilityLabel="Supprimer cette culture"
                  >
                    <Text style={styles.cropDelete}>✕</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Actions */}
      <View style={styles.footer}>
        <Pressable
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Annuler"
        >
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </Pressable>
        <Pressable
          style={styles.saveButton}
          onPress={handleSave}
          accessibilityRole="button"
          accessibilityLabel="Enregistrer les modifications"
        >
          <Text style={styles.saveButtonText}>Enregistrer</Text>
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
    justifyContent: 'space-between',
  },
  title: {
    ...typography.h2,
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    fontSize: 24,
    color: colors.text,
    padding: spacing.sm,
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
    color: colors.text,
  },
  dimensionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.text,
    minHeight: 40,
  },
  unitSelector: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  unitButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    alignItems: 'center',
  },
  unitButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  unitButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  unitButtonTextActive: {
    color: '#fff',
  },
  areaDisplay: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(0, 123, 255, 0.05)',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  areaLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  areaValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginTop: spacing.xs,
  },
  soilOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  soilButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: 'center',
  },
  soilButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  soilButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  soilButtonTextActive: {
    color: '#fff',
  },
  dateButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    minHeight: 40,
    justifyContent: 'center',
  },
  dateButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  cropHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  addButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  cropPickerContainer: {
    marginVertical: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: 'rgba(0, 123, 255, 0.05)',
    borderRadius: 8,
  },
  plantSelector: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    marginVertical: spacing.sm,
  },
  plantOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  plantOptionActive: {
    backgroundColor: 'rgba(0, 123, 255, 0.1)',
  },
  plantOptionText: {
    fontSize: 13,
    color: colors.text,
  },
  plantOptionTextActive: {
    fontWeight: '600',
    color: colors.primary,
  },
  confirmButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 6,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  cropList: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  cropItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(0, 123, 255, 0.05)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  cropName: {
    fontWeight: '600',
    color: colors.text,
    fontSize: 13,
  },
  cropDate: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  cropDelete: {
    fontSize: 16,
    color: colors.error,
    fontWeight: '600',
    padding: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontWeight: '600',
    color: colors.text,
    fontSize: 14,
  },
  saveButton: {
    flex: 1,
    paddingVertical: spacing.md,
    backgroundColor: colors.success,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
