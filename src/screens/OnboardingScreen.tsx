import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { geocodeCity } from '../services/weather';
import { requestNotificationPermissions } from '../services/notifications';
import { useStore } from '../store/useStore';
import { GardeningStyle, FertilizerType } from '../types';
import { colors, spacing, borderRadius, typography } from '../constants/theme';

const STEPS = ['Localisation', 'Style de jardinage', 'Engrais'];

const GARDENING_STYLES: { value: GardeningStyle; label: string; desc: string; icon: string }[] = [
  { value: 'permaculture', label: 'Permaculture', desc: 'Écosystème naturel, zéro intrant', icon: '🌿' },
  { value: 'conventionnel', label: 'Conventionnel', desc: 'Jardinage classique', icon: '🥕' },
  { value: 'biodynamique', label: 'Biodynamique', desc: 'Rythmé par la lune et les astres', icon: '🌙' },
  { value: 'hydroponique', label: 'Hydroponique', desc: 'Culture hors-sol en eau', icon: '💧' },
];

const FERTILIZER_TYPES: { value: FertilizerType; label: string; desc: string; icon: string }[] = [
  { value: 'naturel', label: 'Naturel', desc: 'Compost, purin, fumier', icon: '♻️' },
  { value: 'industriel', label: 'Industriel', desc: 'Engrais NPK et spécialisés', icon: '🏭' },
  { value: 'aucun', label: 'Aucun', desc: 'Pas d\'engrais', icon: '🚫' },
];

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [city, setCity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [gardeningStyle, setGardeningStyle] = useState<GardeningStyle>('conventionnel');
  const [fertilizerType, setFertilizerType] = useState<FertilizerType>('naturel');
  const setProfile = useStore(s => s.setProfile);

  async function handleCityNext() {
    if (!city.trim()) return Alert.alert(t('settings.city'), t('settings.cityRequired'));
    setIsLoading(true);
    try {
      const geo = await geocodeCity(city.trim());
      setCity(geo.name);
      setStep(1);
    } catch {
      Alert.alert(t('settings.cityNotFound'), t('settings.cityCheckSpelling'));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleFinish() {
    setIsLoading(true);
    try {
      const geo = await geocodeCity(city.trim());
      const notifGranted = await requestNotificationPermissions();
      setProfile({
        city: geo.name,
        latitude: geo.lat,
        longitude: geo.lon,
        gardeningStyle,
        fertilizerType,
        onboardingComplete: true,
        notificationsEnabled: notifGranted,
        notificationHour: 8,
      });
    } catch {
      Alert.alert('Erreur', 'Impossible de finaliser la configuration.');
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.logo}>🌱</Text>
          <Text style={styles.appName}>MonJardin</Text>
          <Text style={styles.subtitle}>Votre assistant jardinage intelligent</Text>

          <View style={styles.stepsRow}>
            {STEPS.map((s, i) => (
              <View key={s} style={styles.stepItem}>
                <View style={[styles.stepDot, i <= step && styles.stepDotActive]}>
                  <Text style={styles.stepDotText}>{i + 1}</Text>
                </View>
                <Text style={[styles.stepLabel, i === step && styles.stepLabelActive]}>{s}</Text>
              </View>
            ))}
          </View>

          {step === 0 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>📍 Votre localisation</Text>
              <Text style={styles.stepDesc}>
                Entrez votre ville pour obtenir la météo locale et des conseils adaptés à votre région.
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Lyon, Bordeaux, Nantes..."
                placeholderTextColor={colors.textMuted}
                value={city}
                onChangeText={setCity}
                onSubmitEditing={handleCityNext}
                returnKeyType="next"
                autoCapitalize="words"
              />
              <TouchableOpacity
                style={[styles.btn, isLoading && styles.btnDisabled]}
                onPress={handleCityNext}
                disabled={isLoading}
              >
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Continuer →</Text>}
              </TouchableOpacity>
            </View>
          )}

          {step === 1 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>🌿 Votre style de jardinage</Text>
              <Text style={styles.stepDesc}>Choisissez votre approche. Cela personnalisera vos conseils.</Text>
              {GARDENING_STYLES.map(item => (
                <TouchableOpacity
                  key={item.value}
                  style={[styles.optionCard, gardeningStyle === item.value && styles.optionCardSelected]}
                  onPress={() => setGardeningStyle(item.value)}
                >
                  <Text style={styles.optionIcon}>{item.icon}</Text>
                  <View style={styles.optionText}>
                    <Text style={styles.optionLabel}>{item.label}</Text>
                    <Text style={styles.optionDesc}>{item.desc}</Text>
                  </View>
                  {gardeningStyle === item.value && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              ))}
              <View style={styles.navRow}>
                <TouchableOpacity style={styles.btnSecondary} onPress={() => setStep(0)}>
                  <Text style={styles.btnSecondaryText}>← Retour</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btn} onPress={() => setStep(2)}>
                  <Text style={styles.btnText}>Continuer →</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>🌱 Vos engrais</Text>
              <Text style={styles.stepDesc}>Quel type d'engrais utilisez-vous ? Cela adapte les rappels de fertilisation.</Text>
              {FERTILIZER_TYPES.map(item => (
                <TouchableOpacity
                  key={item.value}
                  style={[styles.optionCard, fertilizerType === item.value && styles.optionCardSelected]}
                  onPress={() => setFertilizerType(item.value)}
                >
                  <Text style={styles.optionIcon}>{item.icon}</Text>
                  <View style={styles.optionText}>
                    <Text style={styles.optionLabel}>{item.label}</Text>
                    <Text style={styles.optionDesc}>{item.desc}</Text>
                  </View>
                  {fertilizerType === item.value && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              ))}
              <View style={styles.navRow}>
                <TouchableOpacity style={styles.btnSecondary} onPress={() => setStep(1)}>
                  <Text style={styles.btnSecondaryText}>← Retour</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, isLoading && styles.btnDisabled]}
                  onPress={handleFinish}
                  disabled={isLoading}
                >
                  {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Commencer 🌱</Text>}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, alignItems: 'center', paddingBottom: spacing.xxl },
  logo: { fontSize: 64, marginTop: spacing.lg },
  appName: { ...typography.h1, fontSize: 32, marginTop: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  stepsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
  stepItem: { alignItems: 'center', gap: spacing.xs },
  stepDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.border, justifyContent: 'center', alignItems: 'center',
  },
  stepDotActive: { backgroundColor: colors.primary },
  stepDotText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  stepLabel: { fontSize: 10, color: colors.textMuted },
  stepLabelActive: { color: colors.primary, fontWeight: '600' },
  stepContent: { width: '100%' },
  stepTitle: { ...typography.h2, marginBottom: spacing.xs },
  stepDesc: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.md, lineHeight: 20 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1.5, borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16, color: colors.text,
    marginBottom: spacing.md,
  },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    flex: 1,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  btnSecondary: {
    borderWidth: 1.5, borderColor: colors.primary,
    borderRadius: borderRadius.md, padding: spacing.md,
    alignItems: 'center', flex: 1,
  },
  btnSecondaryText: { color: colors.primary, fontSize: 16, fontWeight: '600' },
  navRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  optionCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5, borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md, marginBottom: spacing.sm, gap: spacing.sm,
  },
  optionCardSelected: { borderColor: colors.primary, backgroundColor: '#EDF7F1' },
  optionIcon: { fontSize: 28 },
  optionText: { flex: 1 },
  optionLabel: { fontSize: 15, fontWeight: '600', color: colors.text },
  optionDesc: { fontSize: 12, color: colors.textSecondary },
  checkmark: { fontSize: 18, color: colors.primary, fontWeight: '700' },
});
