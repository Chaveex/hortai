import React, { useEffect, useCallback, useMemo, useState } from 'react';
import {
  View, Text, ScrollView, RefreshControl, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import WeatherCard from '../components/WeatherCard';
import WateringCard from '../components/WateringCard';
import TipCard from '../components/TipCard';
import TodayChoreWidget from '../components/TodayChoreWidget';
import HarvestGoalCard from '../components/HarvestGoalCard';
import StreakDetailModal from '../components/StreakDetailModal';
import LevelDetailModal from '../components/LevelDetailModal';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { format, differenceInDays, parseISO } from 'date-fns';
import { getDateLocale } from '../utils/dateLocale';
import { PLANT_DATABASE } from '../constants/plants';
import { getGardenSeasonProgress, getProductionNarrative } from '../services/recommendations';

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const {
    profile, weather, plants, recommendations, tips, entries,
    isLoadingWeather, weatherError, refreshWeather, refreshRecommendations, markWatered,
    streakDays, longestStreakDays, gardenerLevel,
  } = useStore();

  const [streakModalVisible, setStreakModalVisible] = useState(false);
  const [levelModalVisible, setLevelModalVisible] = useState(false);

  // Calculate harvest for current month
  const harvestData = useMemo(() => {
    const now = new Date();
    const currentMonth = format(now, 'yyyy-MM');
    const currentMonthStr = format(now, 'MMMM yyyy', { locale: getDateLocale(i18n.language) });

    const monthlyHarvest = entries
      .filter(e => e.type === 'harvest' && e.date.startsWith(currentMonth))
      .reduce((sum, e) => sum + (e.quantity || 0), 0);

    return {
      month: currentMonthStr,
      monthKey: currentMonth,
      actual: monthlyHarvest,
      goal: profile?.harvestGoal || 10, // Default 10kg
    };
  }, [entries, profile, i18n.language]);

  // Check for streak at-risk plants (overdue at 1.5x watering frequency)
  const streakAtRiskPlant = useMemo(() => {
    const now = new Date();
    for (const plant of plants) {
      if (!plant.lastWatered) continue;
      const daysSince = differenceInDays(now, parseISO(plant.lastWatered));
      const wateringFreq = PLANT_DATABASE[plant.type].wateringFrequencyDays;
      if (daysSince > wateringFreq * 1.5) {
        return plant;
      }
    }
    return null;
  }, [plants]);

  // Narrative cards: garden season progress + production goal
  const narratives = useMemo(() => {
    const seasonProgress = getGardenSeasonProgress(plants, t);
    const productionNarr = getProductionNarrative(harvestData.actual, harvestData.goal, t);

    return {
      season: seasonProgress.narrative,
      production: productionNarr,
    };
  }, [plants, harvestData.actual, harvestData.goal, t]);

  useEffect(() => {
    const lastUpdated = weather?.lastUpdated;
    const isStale = !lastUpdated || Date.now() - new Date(lastUpdated).getTime() > 30 * 60 * 1000;
    if (isStale) refreshWeather();
    else refreshRecommendations();
  }, []);

  const onRefresh = useCallback(() => { refreshWeather(); }, []);

  const today = format(new Date(), 'EEEE d MMMM yyyy', { locale: getDateLocale(i18n.language) });
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
            <Text style={styles.greeting}>{t('home.greeting')}</Text>
            <Text style={styles.date}>{capitalize(today)}</Text>
          </View>
        </View>

        {/* Streak at-risk warning banner */}
        {streakAtRiskPlant && (
          <TouchableOpacity
            style={styles.warningBanner}
            onPress={() => navigation.navigate('GardenStack', { screen: 'PlantDetailScreen', params: { plantId: streakAtRiskPlant.id } })}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={t('home.streakAtRiskA11y', { plant: streakAtRiskPlant.name, days: Math.floor(differenceInDays(new Date(), parseISO(streakAtRiskPlant.lastWatered || ''))) })}
            accessibilityHint={t('home.streakAtRiskHint')}
          >
            <Text style={styles.warningText}>
              🔥 {t('home.streakAtRisk', { plant: streakAtRiskPlant.name, days: Math.floor(differenceInDays(new Date(), parseISO(streakAtRiskPlant.lastWatered || ''))) })}
            </Text>
            <Text style={styles.warningAction}>{t('home.waterNow')}</Text>
          </TouchableOpacity>
        )}

        {/* Badge row: Streak, Level, Harvest */}
        <View style={styles.badgeRow}>
          {/* Streak Badge */}
          <TouchableOpacity
            style={styles.badge}
            onPress={() => setStreakModalVisible(true)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`${t('home.streak')}: ${t('home.streakBadgeA11y', { streak: streakDays })}`}
            accessibilityHint={t('home.streakBadgeHint')}
          >
            <Text style={styles.badgeEmoji}>🔥</Text>
            <View style={styles.badgeContent}>
              <Text style={styles.badgeValue}>{streakDays}</Text>
              <Text style={styles.badgeLabel}>{t('home.streak')}</Text>
            </View>
          </TouchableOpacity>

          {/* Level Badge */}
          <TouchableOpacity
            style={styles.badge}
            onPress={() => setLevelModalVisible(true)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`${t('home.level')}: ${gardenerLevel}`}
            accessibilityHint={t('home.levelBadgeHint')}
          >
            <Text style={styles.badgeEmoji}>🏆</Text>
            <View style={styles.badgeContent}>
              <Text style={styles.badgeValue}>{gardenerLevel}</Text>
              <Text style={styles.badgeLabel}>{t('home.level')}</Text>
            </View>
          </TouchableOpacity>

          {/* Harvest Goal Badge */}
          <TouchableOpacity
            style={styles.badge}
            onPress={() => navigation.navigate('DashboardStack', { screen: 'ProductionDashboard' })}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`${t('dashboard.production')}: ${t('home.harvestBadgeA11y', { actual: harvestData.actual.toFixed(1), goal: harvestData.goal })}`}
            accessibilityHint={t('home.harvestBadgeHint')}
          >
            <Text style={styles.badgeEmoji}>📊</Text>
            <View style={styles.badgeContent}>
              <Text style={styles.badgeValue}>
                {harvestData.actual}/{harvestData.goal}
              </Text>
              <Text style={styles.badgeLabel}>{t('home.kg')}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Narrative Cards */}
        {plants.length > 0 && (
          <View style={styles.narrativeContainer}>
            <View style={styles.narrativeCard}>
              <Text style={styles.narrativeText}>{narratives.season}</Text>
            </View>
            <View style={styles.narrativeCard}>
              <Text style={styles.narrativeText}>{narratives.production}</Text>
            </View>
          </View>
        )}

        {isLoadingWeather && !weather && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={styles.loadingText}>{t('home.loading')}</Text>
          </View>
        )}

        {weatherError && !weather && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {weatherError}</Text>
            <TouchableOpacity onPress={refreshWeather} style={styles.retryBtn}>
              <Text style={styles.retryText}>{t('common.retry')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {weather && <WeatherCard weather={weather} />}

        <HarvestGoalCard
          harvestMonth={harvestData.month}
          harvestGoal={harvestData.goal}
          harvestActual={harvestData.actual}
          onPress={() => navigation.navigate('DashboardStack', { screen: 'ProductionDashboard' })}
        />

        <TodayChoreWidget onPress={() => navigation.navigate('Chores')} />

        {plants.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>🌱</Text>
            <Text style={styles.emptyTitle}>{t('home.noPlants')}</Text>
            <Text style={styles.emptyDesc}>{t('home.noPlantDesc')}</Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>{t('home.watering')}</Text>
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
            <Text style={styles.sectionTitle}>{t('home.tips')}</Text>
            <View style={styles.tipsContainer}>
              {tips.slice(0, 4).map(tip => <TipCard key={tip.id} tip={tip} />)}
            </View>
          </>
        )}
      </ScrollView>

      <StreakDetailModal
        visible={streakModalVisible}
        onClose={() => setStreakModalVisible(false)}
        streakDays={streakDays}
        longestStreakDays={longestStreakDays}
        plants={plants}
      />

      <LevelDetailModal
        visible={levelModalVisible}
        onClose={() => setLevelModalVisible(false)}
        gardenerLevel={gardenerLevel}
        plants={plants}
        entries={entries}
        profile={profile}
      />
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
  warningBanner: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
    backgroundColor: '#FFE8D1',
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  warningText: {
    ...typography.body,
    color: colors.warning,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  warningAction: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  badge: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeEmoji: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  badgeContent: {
    alignItems: 'center',
  },
  badgeValue: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: 2,
  },
  badgeLabel: {
    ...typography.caption,
    fontSize: 11,
  },
  narrativeContainer: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
    gap: spacing.sm,
  },
  narrativeCard: {
    backgroundColor: '#F5F7FA',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  narrativeText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 20,
  },
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
