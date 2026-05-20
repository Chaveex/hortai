import React, { useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, RefreshControl, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import WeatherCard from '../components/WeatherCard';
import WateringCard from '../components/WateringCard';
import TipCard from '../components/TipCard';
import TodayChoreWidget from '../components/TodayChoreWidget';
import { colors, spacing, typography } from '../constants/theme';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const {
    profile, weather, plants, recommendations, tips,
    isLoadingWeather, weatherError, refreshWeather, refreshRecommendations, markWatered,
  } = useStore();

  useEffect(() => {
    const lastUpdated = weather?.lastUpdated;
    const isStale = !lastUpdated || Date.now() - new Date(lastUpdated).getTime() > 30 * 60 * 1000;
    if (isStale) refreshWeather();
    else refreshRecommendations();
  }, []);

  const onRefresh = useCallback(() => { refreshWeather(); }, []);

  const today = format(new Date(), 'EEEE d MMMM yyyy', { locale: fr });
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isLoadingWeather} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour 👋</Text>
            <Text style={styles.date}>{capitalize(today)}</Text>
          </View>
          <View style={styles.statsChip}>
            <Text style={styles.statsText}>{plants.length} plant{plants.length > 1 ? 's' : ''}</Text>
          </View>
        </View>

        {isLoadingWeather && !weather && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={styles.loadingText}>Chargement de la météo…</Text>
          </View>
        )}

        {weatherError && !weather && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {weatherError}</Text>
            <TouchableOpacity onPress={refreshWeather} style={styles.retryBtn}>
              <Text style={styles.retryText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        )}

        {weather && <WeatherCard weather={weather} />}

        <TodayChoreWidget onPress={() => navigation.navigate('Tâches')} />

        {plants.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>🌱</Text>
            <Text style={styles.emptyTitle}>Aucun plant pour l'instant</Text>
            <Text style={styles.emptyDesc}>Ajoutez votre premier plant depuis l'onglet Jardin.</Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Arrosage</Text>
            <View style={{ paddingHorizontal: spacing.md }}>
              <WateringCard
                recommendations={recommendations}
                plants={plants}
                onWater={markWatered}
              />
            </View>
          </>
        )}

        {tips.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Conseils du jour</Text>
            <View style={styles.tipsContainer}>
              {tips.slice(0, 4).map(tip => <TipCard key={tip.id} tip={tip} />)}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: spacing.xxl },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.sm,
  },
  greeting: { ...typography.h1, fontSize: 24 },
  date: { ...typography.caption, fontSize: 13, textTransform: 'capitalize' },
  statsChip: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  statsText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  sectionTitle: { ...typography.h3, paddingHorizontal: spacing.md, marginBottom: spacing.sm, marginTop: spacing.xs },
  tipsContainer: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  loadingBox: { alignItems: 'center', padding: spacing.xl, gap: spacing.sm },
  loadingText: { color: colors.textSecondary },
  errorBox: {
    margin: spacing.md, padding: spacing.md,
    backgroundColor: '#FFF3EE', borderRadius: 12, alignItems: 'center', gap: spacing.sm,
  },
  errorText: { color: colors.warning, textAlign: 'center' },
  retryBtn: { backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.xs, borderRadius: 20 },
  retryText: { color: '#FFFFFF', fontWeight: '600' },
  emptyBox: { alignItems: 'center', padding: spacing.xxl, gap: spacing.sm },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { ...typography.h3, textAlign: 'center' },
  emptyDesc: { ...typography.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
});
