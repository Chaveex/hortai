import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  Platform, Alert, KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { PlantType } from '../types';
import { PLANT_TYPES, getPlantInfo } from '../constants/plants';
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import { format } from 'date-fns';
import DatePickerField from '../components/DatePickerField';

export default function AddPlantScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const addPlant = useStore(s => s.addPlant);

  const [selectedType, setSelectedType] = useState<PlantType>('tomato');
  const [name, setName] = useState('');
  const [variety, setVariety] = useState('');
  const [plantedDate, setPlantedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [lastWatered, setLastWatered] = useState('');
  const [showTypePicker, setShowTypePicker] = useState(false);

  const selectedInfo = getPlantInfo(selectedType);

  function handleAdd() {
    if (!plantedDate) {
      return Alert.alert(t('plants.dateRequired'));
    }
    addPlant({
      type: selectedType,
      name: name.trim() || selectedInfo.frenchName,
      variety: variety.trim() || undefined,
      plantedDate,
      lastWatered: lastWatered.trim() || undefined,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>{t('common.back')}</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>{t('plants.newPlant')}</Text>
          <TouchableOpacity onPress={handleAdd}>
            <Text style={styles.saveBtn}>{t('common.add')}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>{t('plants.type')}</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowTypePicker(!showTypePicker)}
          >
            <Text style={styles.selectorText}>
              {selectedInfo.icon} {selectedInfo.frenchName}
            </Text>
            <Text style={styles.selectorChevron}>{showTypePicker ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {showTypePicker && (
            <View style={styles.picker}>
              <ScrollView style={{ maxHeight: 240 }} nestedScrollEnabled>
                {PLANT_TYPES.map(type => {
                  const info = getPlantInfo(type);
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[styles.pickerItem, selectedType === type && styles.pickerItemSelected]}
                      onPress={() => { setSelectedType(type); setShowTypePicker(false); }}
                    >
                      <Text style={styles.pickerItemText}>{info.icon} {info.frenchName}</Text>
                      {selectedType === type && <Text style={styles.pickerCheck}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💧 Besoin en eau : {selectedInfo.dailyWaterNeed} L/m²/jour · Arrosage tous les {selectedInfo.wateringFrequencyDays} jour{selectedInfo.wateringFrequencyDays > 1 ? 's' : ''}
            </Text>
            <Text style={styles.infoText}>
              ☀️ {selectedInfo.sunExposure === 'full' ? t('sunlight.full') : selectedInfo.sunExposure === 'partial' ? t('sunlight.partial') : t('sunlight.shade')} · {t('sunlight.harvestIn', { days: selectedInfo.harvestDays })}
            </Text>
          </View>

          <Field label="Nom personnalisé" placeholder={selectedInfo.frenchName} value={name} onChangeText={setName} />
          <Field label="Variété" placeholder="Ex: Cœur de Bœuf, Cornichon de Paris…" value={variety} onChangeText={setVariety} />

          <DatePickerField
            label="Date de plantation"
            value={plantedDate}
            onChange={setPlantedDate}
          />

          <DatePickerField
            label="Dernier arrosage"
            value={lastWatered}
            onChange={setLastWatered}
            optional
          />

          <Field label="Emplacement" placeholder="Ex: Carré nord, Serre, Pot balcon…" value={location} onChangeText={setLocation} />
          <Field label="Notes" placeholder="Observations, source des graines…" value={notes} onChangeText={setNotes} multiline />

          <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
            <Text style={styles.addBtnText}>🌱 Ajouter ce plant</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label, placeholder, value, onChangeText, multiline,
}: {
  label: string; placeholder: string; value: string;
  onChangeText: (t: string) => void; multiline?: boolean;
}) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  navHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface,
  },
  backBtn: { color: colors.primary, fontSize: 15 },
  navTitle: { ...typography.h3, fontSize: 16 },
  saveBtn: { color: colors.primary, fontSize: 15, fontWeight: '700' },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: spacing.xs, marginTop: spacing.md },
  input: {
    backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border,
    borderRadius: borderRadius.md, padding: spacing.md, fontSize: 15, color: colors.text,
  },
  inputMultiline: { height: 80, textAlignVertical: 'top' },
  selector: {
    backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border,
    borderRadius: borderRadius.md, padding: spacing.md,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  selectorText: { fontSize: 16, color: colors.text },
  selectorChevron: { color: colors.textSecondary, fontSize: 12 },
  picker: {
    backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.primary,
    borderRadius: borderRadius.md, overflow: 'hidden', marginTop: 2,
  },
  pickerItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  pickerItemSelected: { backgroundColor: '#EDF7F1' },
  pickerItemText: { fontSize: 15, color: colors.text },
  pickerCheck: { color: colors.primary, fontWeight: '700' },
  infoBox: {
    backgroundColor: '#EDF7F1', borderRadius: borderRadius.md,
    padding: spacing.md, marginTop: spacing.sm, gap: 4,
  },
  infoText: { fontSize: 12, color: colors.primary },
  addBtn: {
    backgroundColor: colors.primary, borderRadius: borderRadius.md,
    padding: spacing.md, alignItems: 'center', marginTop: spacing.xl,
  },
  addBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
