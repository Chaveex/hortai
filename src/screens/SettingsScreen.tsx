import React, { useState } from 'react';
import {
  View, Text, Switch, TouchableOpacity, StyleSheet, ScrollView,
  Alert, TextInput, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
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

export default function SettingsScreen() {
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
      Alert.alert('Ville mise à jour', `Météo de ${geo.name} chargée.`);
    } catch {
      Alert.alert('Ville introuvable', 'Vérifiez l\'orthographe.');
    } finally {
      setIsSavingCity(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Paramètres</Text>

        <Text style={styles.sectionHeader}>Localisation</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Ville</Text>
          <View style={styles.cityRow}>
            <TextInput
              style={styles.cityInput}
              value={cityInput}
              onChangeText={setCityInput}
              placeholder="Votre ville"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
            />
            <TouchableOpacity style={styles.saveBtn} onPress={handleCitySave} disabled={isSavingCity}>
              {isSavingCity
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.saveBtnText}>Mettre à jour</Text>}
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionHeader}>Style de jardinage</Text>
        <View style={styles.card}>
          {STYLES.map(item => (
            <TouchableOpacity
              key={item.value}
              style={styles.optionRow}
              onPress={() => updateProfile({ gardeningStyle: item.value })}
            >
              <Text style={styles.optionIcon}>{item.icon}</Text>
              <Text style={styles.optionLabel}>{item.label}</Text>
              <View style={[styles.radio, profile.gardeningStyle === item.value && styles.radioSelected]}>
                {profile.gardeningStyle === item.value && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionHeader}>Type d'engrais</Text>
        <View style={styles.card}>
          {FERTILIZERS.map(item => (
            <TouchableOpacity
              key={item.value}
              style={styles.optionRow}
              onPress={() => updateProfile({ fertilizerType: item.value })}
            >
              <Text style={styles.optionIcon}>{item.icon}</Text>
              <Text style={styles.optionLabel}>{item.label}</Text>
              <View style={[styles.radio, profile.fertilizerType === item.value && styles.radioSelected]}>
                {profile.fertilizerType === item.value && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionHeader}>Notifications</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.optionLabel}>Rappels d'arrosage</Text>
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
              <Text style={styles.optionLabel}>Rappels de semis</Text>
              <Text style={styles.optionSub}>Notification le 1er de chaque mois</Text>
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
              <Text style={styles.label}>Heure de notification</Text>
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
        </View>

        <Text style={styles.sectionHeader}>Sauvegarde & Export</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={[styles.optionRow, { borderBottomWidth: 0 }]}
            onPress={() => navigation.navigate('BackupSettings')}
            activeOpacity={0.7}
          >
            <Text style={styles.optionIcon}>💾</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionLabel}>Sauvegardes</Text>
              {lastBackupTime ? (
                <Text style={styles.optionSub}>
                  Dernière : {new Date(lastBackupTime).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                </Text>
              ) : (
                <Text style={styles.optionSub}>Export JSON · ZIP · Cloud optionnel</Text>
              )}
            </View>
            <Text style={{ fontSize: 20, color: colors.textMuted }}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>MonJardin v1.0.0</Text>
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
  label: { fontSize: 13, color: colors.text, fontWeight: '500' },
  cityRow: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, paddingTop: 0 },
  cityInput: {
    flex: 1, backgroundColor: colors.background, borderWidth: 1.5, borderColor: colors.border,
    borderRadius: borderRadius.md, padding: spacing.sm, fontSize: 15, color: colors.text,
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
  version: { textAlign: 'center', color: colors.textMuted, fontSize: 12, marginTop: spacing.xl },
});
