import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput,
  Platform, KeyboardAvoidingView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { format, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useChoreStore } from '../store/useChoreStore';
import { useStore } from '../store/useStore';
import { getPlantInfo } from '../constants/plants';
import {
  ChoreType, ChorePriority, CHORE_TYPES, CHORE_TYPE_META, PRIORITY_LABELS,
} from '../types/chores';
import { colors, spacing, borderRadius, typography } from '../constants/theme';

export default function ChoreFormScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const editingId: string | undefined = route.params?.choreId;
  const initialDate: string | undefined = route.params?.date;
  const initialPlantId: string | undefined = route.params?.plantId;
  const initialType: ChoreType | undefined = route.params?.type;

  const chores = useChoreStore((s) => s.chores);
  const addChore = useChoreStore((s) => s.addChore);
  const updateChore = useChoreStore((s) => s.updateChore);
  const plants = useStore((s) => s.plants);

  const existing = editingId ? chores.find((c) => c.id === editingId) : undefined;

  const [type, setType] = useState<ChoreType>(existing?.type ?? initialType ?? 'watering');
  const [title, setTitle] = useState<string>(existing?.title ?? '');
  const [description, setDescription] = useState<string>(existing?.description ?? '');
  const [date, setDate] = useState<string>(existing?.date ?? initialDate ?? format(new Date(), 'yyyy-MM-dd'));
  const [plantId, setPlantId] = useState<string | undefined>(existing?.plantId ?? initialPlantId);
  const [priority, setPriority] = useState<ChorePriority>(existing?.priority ?? 'medium');
  const [recurrence, setRecurrence] = useState<string>(
    existing?.recurrenceDays ? String(existing.recurrenceDays) : ''
  );
  const [showPicker, setShowPicker] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const parsedDate = date ? parseISO(date) : new Date();
  const validDate = isValid(parsedDate) ? parsedDate : new Date();

  // Track unsaved changes (for all fields except when editing)
  useEffect(() => {
    if (!editingId) {
      setHasUnsavedChanges(true);
    }
  }, [editingId]);

  function handleDateChange(_: DateTimePickerEvent, selected?: Date) {
    setShowPicker(Platform.OS === 'ios');
    if (selected) {
      setDate(format(selected, 'yyyy-MM-dd'));
      setHasUnsavedChanges(true);
    }
  }

  function handleBackPress() {
    if (!editingId && hasUnsavedChanges && (title.trim() || description.trim())) {
      Alert.alert(
        t('chores.discardChanges'),
        t('chores.discardMessage'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('common.delete'), style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  }

  function handleSave() {
    if (!title.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Alert.alert(t('chores.titleRequired'));
      return;
    }
    if (!date) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Alert.alert(t('chores.dateRequired'));
      return;
    }

    const recurrenceDays = recurrence.trim() ? parseInt(recurrence, 10) : undefined;
    if (recurrence.trim() && (isNaN(recurrenceDays!) || recurrenceDays! < 1)) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Alert.alert(t('chores.recurrenceInvalid'), t('chores.daysInvalid'));
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (editingId) {
      updateChore(editingId, {
        type,
        title: title.trim(),
        description: description.trim() || undefined,
        date,
        plantId,
        priority,
        recurrenceDays,
      });
      navigation.goBack();
    } else {
      addChore({
        type,
        title: title.trim(),
        description: description.trim() || undefined,
        date,
        plantId,
        priority,
        source: 'custom',
        recurrenceDays,
      });
      // Show success toast
      setShowToast(true);
      // Auto-dismiss form after toast delay
      setTimeout(() => {
        navigation.goBack();
      }, 300);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      {showToast && (
        <View style={styles.toastBanner}>
          <Text style={styles.toastText}>{t('chores.created')}</Text>
        </View>
      )}
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={handleBackPress}>
          <Text style={styles.backBtn}>{t('chores.backBtn')}</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>{editingId ? t('chores.editChore') : t('chores.newChore')}</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveBtn}>{editingId ? t('chores.saveBtn') : t('chores.createBtn')}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.label}>{t('chores.type')}</Text>
          <View style={styles.row}>
            {CHORE_TYPES.map((ct) => {
              const m = CHORE_TYPE_META[ct];
              const active = type === ct;
              return (
                <TouchableOpacity
                  key={ct}
                  style={[
                    styles.chip,
                    active && { backgroundColor: m.backgroundColor, borderColor: m.color },
                  ]}
                  onPress={() => {
                    setType(ct);
                    setHasUnsavedChanges(true);
                  }}
                >
                  <Text style={styles.chipIcon}>{m.icon}</Text>
                  <Text style={[styles.chipText, active && { color: m.color, fontWeight: '700' }]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>{t('chores.titleLabel')}</Text>
          <TextInput
            value={title}
            onChangeText={(t) => {
              setTitle(t);
              setHasUnsavedChanges(true);
            }}
            placeholder={t('chores.titlePlaceholder')}
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            maxLength={80}
          />

          <Text style={styles.label}>{t('chores.description')}</Text>
          <TextInput
            value={description}
            onChangeText={(d) => {
              setDescription(d);
              setHasUnsavedChanges(true);
            }}
            placeholder={t('chores.descriptionPlaceholder')}
            placeholderTextColor={colors.textMuted}
            style={[styles.input, styles.textarea]}
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>{t('chores.dateLabel')}</Text>
          <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPicker(true)}>
            <Text style={styles.dateIcon}>📅</Text>
            <Text style={styles.dateText}>
              {format(validDate, 'EEEE d MMMM yyyy', { locale: fr })}
            </Text>
          </TouchableOpacity>
          {showPicker && (
            <DateTimePicker
              value={validDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={handleDateChange}
              locale="fr-FR"
            />
          )}

          <Text style={styles.label}>{t('chores.priorityLabel')}</Text>
          <View style={styles.row}>
            {(['high', 'medium', 'low'] as ChorePriority[]).map((p) => {
              const active = priority === p;
              const c = p === 'high' ? colors.warning : p === 'medium' ? colors.accent : colors.primaryLight;
              return (
                <TouchableOpacity
                  key={p}
                  style={[styles.chip, active && { borderColor: c, backgroundColor: c + '20' }]}
                  onPress={() => {
                    setPriority(p);
                    setHasUnsavedChanges(true);
                  }}
                >
                  <Text style={[styles.chipText, active && { color: c, fontWeight: '700' }]}>
                    {PRIORITY_LABELS[p]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {plants.length > 0 && (
            <>
              <Text style={styles.label}>{t('chores.plant')}</Text>
              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.chip, !plantId && styles.chipActive]}
                  onPress={() => {
                    setPlantId(undefined);
                    setHasUnsavedChanges(true);
                  }}
                >
                  <Text style={[styles.chipText, !plantId && styles.chipTextActive]}>{t('chores.plantNone')}</Text>
                </TouchableOpacity>
                {plants.map((p) => {
                  const info = getPlantInfo(p.type);
                  const active = plantId === p.id;
                  return (
                    <TouchableOpacity
                      key={p.id}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => {
                        setPlantId(p.id);
                        setHasUnsavedChanges(true);
                      }}
                    >
                      <Text style={styles.chipIcon}>{info.icon}</Text>
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>
                        {p.name || info.frenchName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          <Text style={styles.label}>{t('chores.recurrenceLabel')}</Text>
          <TextInput
            value={recurrence}
            onChangeText={(r) => {
              setRecurrence(r);
              setHasUnsavedChanges(true);
            }}
            placeholder={t('chores.recurrencePlaceholder')}
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            keyboardType="number-pad"
            maxLength={3}
          />
          <Text style={styles.hint}>
            {t('chores.recurrenceHint')}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  toastBanner: {
    backgroundColor: colors.success,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  navHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  navTitle: { ...typography.h3, fontSize: 16 },
  backBtn: { color: colors.textSecondary, fontSize: 14 },
  saveBtn: { color: colors.primary, fontSize: 15, fontWeight: '700' },
  content: { padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.xs },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary + '15', borderColor: colors.primary },
  chipIcon: { fontSize: 14 },
  chipText: { fontSize: 13, color: colors.text },
  chipTextActive: { color: colors.primary, fontWeight: '700' },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    fontSize: 15,
    color: colors.text,
  },
  textarea: { minHeight: 70, textAlignVertical: 'top' },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  dateIcon: { fontSize: 18 },
  dateText: { fontSize: 15, color: colors.text, fontWeight: '500' },
  hint: { fontSize: 11, color: colors.textMuted, fontStyle: 'italic', marginTop: 4 },
});
