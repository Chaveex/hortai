import React, { useState } from 'react';
import {
  View, Text, Switch, TouchableOpacity, StyleSheet, ScrollView,
  Alert, TextInput, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import i18next from '../i18n/config';
import { useStore } from '../store/useStore';
import { GardeningStyle, FertilizerType } from '../types';
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import { geocodeCity } from '../services/weather';

const STYLES: { value: GardeningStyle; label: string; icon: string }[] = [
  { value: 'permaculture', label: 'Permaculture', icon: '🌿' },
  { value: 'conventionnel', label: 'Conventionnel', icon: '🥕' },
  { value: 'biodynamique', label: 'Biodynamique', icon: '🌙' },
  { value: 'hydroponique', label: 'Hydroponique', icon: '💧' },
];

const FERTILIZERS: { value: FertilizerType; label: string; icon: string }[] = [
  { value: 'naturel', label: 'Naturel', icon: '♻️' },
  { value: 'industriel', label: 'Industriel', icon: '🏭' },
  { value: 'aucun', label: 'Aucun', icon: '🚫' },
];

const LANGUAGES = [
  { value: 'fr', label: 'Français', icon: '🇫🇷' },
  { value: 'en', label: 'English', icon: '🇺🇸' },
  { value: 'es', label: 'Español', icon: '🇪🇸' },
] as const;

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { profile, updateProfile, refreshWeather, lastBackupTime } = useStore();
  const navigation = useNavigation<import('@react-navigation/stack').StackNavigationProp<{ BackupSettings: undefined }>>();
  const [cityInput, setCityInput] = useState(profile?.city ?? '');
  const [isSavingCity, setIsSavingCity] = useState(false);

  if (!profile) return null;

  async function handleCitySave() {
    if (!cityInput.trim()) return;
    setIsSavingCity(true);
    try {
      const geo = await geocodeCity(cityInput.trim());
      updateProfile({ city: geo.name, latitude: geo.lat, longitude: geo.lon });
      setCityInput(geo.name);
      await refreshWeather();
      Alert.alert(t('settings.cityUpdated'), t('settings.weatherLoaded', { city: geo.name }));
    } catch {
      Alert.alert(t('settings.cityNotFound'), t('settings.cityCheckSpelling'));
    } finally {
      setIsSavingCity(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('settings.title')}</Text>

        <Text style={styles.sectionHeader}>{t('settings.location')}</Text>
        <View style={styles.card}>
          <View style={styles.citySection}>
            <Text style={styles.label}>{t('settings.city')}</Text>
            <View style={styles.cityInputRow}>
              <TextInput
                style={styles.cityInput}
                value={cityInput}
                onChangeText={setCityInput}
                placeholder={t('settings.cityPlaceholder')}
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
                accessibilityLabel={t('settings.city')}
                accessibilityHint="Saisissez le nom de votre ville pour mettre à jour la météo"
              />
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleCitySave}
                disabled={isSavingCity}
                accessibilityRole="button"
                accessibilityLabel={t('settings.cityUpdated')}
                accessibilityHint="Appuyez pour enregistrer les changements"
              >
                {isSavingCity
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.saveBtnText}>{t('common.update')}</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={styles.sectionHeader}>{t('settings.gardeningStyle')}</Text>
        <View style={styles.card}>
          {STYLES.map(item => (
            <TouchableOpacity
              key={item.value}
              style={styles.optionRow}
              onPress={() => updateProfile({ gardeningStyle: item.value })}
              accessibilityRole="radio"
              accessibilityLabel={`Style de jardinage: ${item.label}`}
              accessibilityState={{ selected: profile.gardeningStyle === item.value }}
            >
              <Text style={styles.optionIcon}>{item.icon}</Text>
              <Text style={styles.optionLabel}>{item.label}</Text>
              <View style={[styles.radio, profile.gardeningStyle === item.value && styles.radioSelected]}>
                {profile.gardeningStyle === item.value && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionHeader}>{t('settings.fertilizerType')}</Text>
        <View style={styles.card}>
          {FERTILIZERS.map(item => (
            <TouchableOpacity
              key={item.value}
              style={styles.optionRow}
              onPress={() => updateProfile({ fertilizerType: item.value })}
              accessibilityRole="radio"
              accessibilityLabel={`Type d'engrais: ${item.label}`}
              accessibilityState={{ selected: profile.fertilizerType === item.value }}
            >
              <Text style={styles.optionIcon}>{item.icon}</Text>
              <Text style={styles.optionLabel}>{item.label}</Text>
              <View style={[styles.radio, profile.fertilizerType === item.value && styles.radioSelected]}>
                {profile.fertilizerType === item.value && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionHeader}>{t('settings.language')} / Language</Text>
        <View style={styles.card}>
          {LANGUAGES.map(item => (
            <TouchableOpacity
              key={item.value}
              style={styles.optionRow}
              onPress={() => {
                updateProfile({ language: item.value });
                i18next.changeLanguage(item.value);
              }}
              accessibilityRole="radio"
              accessibilityLabel={`Language: ${item.label}`}
              accessibilityState={{ selected: (profile.language || 'fr') === item.value }}
            >
              <Text style={styles.optionIcon}>{item.icon}</Text>
              <Text style={styles.optionLabel}>{item.label}</Text>
              <View style={[styles.radio, (profile.language || 'fr') === item.value && styles.radioSelected]}>
                {(profile.language || 'fr') === item.value && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionHeader}>{t('settings.notifications')}</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.optionLabel}>{t('settings.wateringReminders')}</Text>
              <Text style={styles.optionSub}>Notification quotidienne à {profile.notificationHour}h00</Text>
            </View>
            <Switch
              value={profile.notificationsEnabled}
              onValueChange={v => updateProfile({ notificationsEnabled: v })}
              trackColor={{ true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.optionLabel}>{t('settings.sowingReminders')}</Text>
              <Text style={styles.optionSub}>{t('settings.sowingMonthly')}</Text>
            </View>
            <Switch
              value={profile.sowingNotificationsEnabled ?? true}
              onValueChange={v => updateProfile({ sowingNotificationsEnabled: v })}
              trackColor={{ true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          {profile.notificationsEnabled && (
            <View style={styles.hourRow}>
              <Text style={styles.label}>{t('settings.notificationHour')}</Text>
              <View style={styles.hourBtns}>
                {[6, 7, 8, 9, 10].map(h => (
                  <TouchableOpacity
                    key={h}
                    style={[styles.hourBtn, profile.notificationHour === h && styles.hourBtnActive]}
                    onPress={() => updateProfile({ notificationHour: h })}
                  >
                    <Text style={[styles.hourBtnText, profile.notificationHour === h && styles.hourBtnTextActive]}>
                      {h}h
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.optionLabel}>{t('settings.dailyTip')}</Text>
              <Text style={styles.optionSub}>Conseil du jardinier chaque matin</Text>
            </View>
            <Switch
              value={profile.dailyTipEnabled ?? false}
              onValueChange={v => updateProfile({ dailyTipEnabled: v })}
              trackColor={{ true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          {profile.dailyTipEnabled && (
            <View style={styles.hourRow}>
              <Text style={styles.label}>{t('settings.tipTime')}</Text>
              <View style={styles.hourBtns}>
                {[6, 7, 8, 9, 10].map(h => (
                  <TouchableOpacity
                    key={h}
                    style={[styles.hourBtn, (profile.dailyTipTime || '09:00') === `0${h}:00` && styles.hourBtnActive]}
                    onPress={() => updateProfile({ dailyTipTime: `0${h}:00` })}
                  >
                    <Text style={[styles.hourBtnText, (profile.dailyTipTime || '09:00') === `0${h}:00` && styles.hourBtnTextActive]}>
                      {h}h
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        <Text style={styles.sectionHeader}>{t('settings.gardenObjectives')}</Text>
        <View style={styles.card}>
          <View style={styles.harvestGoalRow}>
            <View>
              <Text style={styles.optionLabel}>{t('settings.monthlyTarget')}</Text>
              <Text style={styles.optionSub}>{t('settings.kg')}</Text>
            </View>
            <View style={styles.harvestGoalInputBox}>
              <TouchableOpacity
                style={styles.harvestGoalBtn}
                onPress={() => updateProfile({ harvestGoal: Math.max(1, (profile.harvestGoal || 10) - 1) })}
              >
                <Text style={styles.harvestGoalBtnText}>−</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.harvestGoalInput}
                value={String(profile.harvestGoal || 10)}
                onChangeText={(text) => {
                  const val = parseInt(text, 10);
                  if (!isNaN(val) && val > 0) {
                    updateProfile({ harvestGoal: val });
                  }
                }}
                keyboardType="number-pad"
                maxLength={3}
              />
              <TouchableOpacity
                style={styles.harvestGoalBtn}
                onPress={() => updateProfile({ harvestGoal: (profile.harvestGoal || 10) + 1 })}
              >
                <Text style={styles.harvestGoalBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={styles.sectionHeader}>{t('settings.backup')}</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={[styles.optionRow, { borderBottomWidth: 0 }]}
            onPress={() => navigation.navigate('BackupSettings')}
            activeOpacity={0.7}
          >
            <Text style={styles.optionIcon}>💾</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionLabel}>{t('settings.backups')}</Text>
              {lastBackupTime ? (
                <Text style={styles.optionSub}>
                  {t('settings.lastBackup', {
                    date: new Date(lastBackupTime).toLocaleDateString(i18next.language === 'en' ? 'en-US' : i18next.language === 'es' ? 'es-ES' : 'fr-FR', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })
                  })}
                </Text>
              ) : (
                <Text style={styles.optionSub}>{t('settings.backupFormats')}</Text>
              )}
            </View>
            <Text style={{ fontSize: 20, color: colors.textMuted }}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>{t('settings.version')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  title: { ...typography.h2, marginBottom: spacing.md },
  sectionHeader: {
    fontSize: 12, fontWeight: '600', color: colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginBottom: spacing.xs, marginTop: spacing.md,
  },
  card: {
    backgroundColor: colors.surface, borderRadius: borderRadius.md,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
  },
  label: { fontSize: 13, color: colors.text, fontWeight: '500', marginBottom: spacing.sm },
  citySection: {
    padding: spacing.md, paddingTop: spacing.md, gap: spacing.sm, flexDirection: 'column',
  },
  cityInputRow: {
    flexDirection: 'row', gap: spacing.md, alignItems: 'center',
  },
  cityInput: {
    flex: 1, backgroundColor: colors.background, borderWidth: 1.5, borderColor: colors.border,
    borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    fontSize: 15, color: colors.text, minHeight: 44,
  },
  saveBtn: {
    backgroundColor: colors.primary, borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm, justifyContent: 'center',
  },
  saveBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  optionRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  optionIcon: { fontSize: 20, width: 28 },
  optionLabel: { flex: 1, fontSize: 15, color: colors.text },
  optionSub: { fontSize: 11, color: colors.textMuted },
  radio: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2,
    borderColor: colors.border, justifyContent: 'center', alignItems: 'center',
  },
  radioSelected: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  switchRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  hourRow: { padding: spacing.md, gap: spacing.xs },
  hourBtns: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs },
  hourBtn: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
  },
  hourBtnActive: { borderColor: colors.primary, backgroundColor: '#EDF7F1' },
  hourBtnText: { fontSize: 13, color: colors.text },
  hourBtnTextActive: { color: colors.primary, fontWeight: '600' },
  harvestGoalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing.md, borderBottomWidth: 0,
  },
  harvestGoalInputBox: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
  },
  harvestGoalBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  harvestGoalBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  harvestGoalInput: {
    width: 50, textAlign: 'center', fontSize: 18, fontWeight: '600',
    color: colors.primary, borderBottomWidth: 2, borderBottomColor: colors.primary,
  },
  version: { textAlign: 'center', color: colors.textMuted, fontSize: 12, marginTop: spacing.xl },
});
