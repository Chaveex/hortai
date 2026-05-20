import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { Plant, PlantEntry, UserProfile } from '../types';
import { differenceInDays, parseISO, format } from 'date-fns';

interface LevelDetailModalProps {
  visible: boolean;
  onClose: () => void;
  gardenerLevel: number;
  plants: Plant[];
  entries: PlantEntry[];
  profile: UserProfile | null;
}

function getLevelTier(level: number): { icon: string; tier: string } {
  if (level <= 3) return { icon: '🌱', tier: 'Apprenti Jardinier' };
  if (level <= 6) return { icon: '🌿', tier: 'Jardinier Confirmé' };
  if (level <= 9) return { icon: '🌻', tier: 'Jardinier Expert' };
  return { icon: '🏆', tier: 'Maître Jardinier' };
}

function calculateXPForLevel(level: number): number {
  return (level - 1) * 20;
}

export default function LevelDetailModal({
  visible, onClose, gardenerLevel, plants, entries, profile,
}: LevelDetailModalProps) {
  const harvestCount = entries.filter(e => e.type === 'harvest').length;
  const onboardingDate = profile?.onboardingDate ? parseISO(profile.onboardingDate) : new Date();
  const daysSinceOnboarding = differenceInDays(new Date(), onboardingDate);

  const levelStats = useMemo(() => {
    const currentXP = plants.length + harvestCount + daysSinceOnboarding;
    const currentLevelXP = calculateXPForLevel(gardenerLevel);
    const nextLevelXP = calculateXPForLevel(gardenerLevel + 1);
    const xpForNextLevel = nextLevelXP - currentLevelXP;
    const xpEarned = currentXP - currentLevelXP;
    const progressPercent = Math.min((xpEarned / xpForNextLevel) * 100, 100);

    return {
      currentXP,
      currentLevelXP,
      nextLevelXP,
      xpForNextLevel,
      xpEarned,
      progressPercent,
    };
  }, [plants.length, harvestCount, daysSinceOnboarding, gardenerLevel]);

  const { icon, tier } = getLevelTier(gardenerLevel);

  const milestones = [
    { level: 1, xp: 0, desc: 'Premier jour au jardin' },
    { level: 2, xp: 20, desc: 'Progès initial' },
    { level: 3, xp: 40, desc: 'Apprenti reconnu' },
    { level: 4, xp: 60, desc: 'Niveau confirmé' },
    { level: 5, xp: 80, desc: 'Expérience croissante' },
    { level: 6, xp: 100, desc: 'Jardinier confirmé' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeBtn}>Fermer</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🏆 Niveau de Jardinier</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Current level display */}
          <View style={styles.levelBox}>
            <Text style={styles.levelIcon}>{icon}</Text>
            <Text style={styles.levelNumber}>Niveau {gardenerLevel}</Text>
            <Text style={styles.levelTier}>{tier}</Text>
          </View>

          {/* XP Progress bar */}
          <View style={styles.xpSection}>
            <View style={styles.xpHeader}>
              <Text style={styles.xpLabel}>Expérience</Text>
              <Text style={styles.xpText}>
                {levelStats.xpEarned} / {levelStats.xpForNextLevel}
              </Text>
            </View>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${levelStats.progressPercent}%` },
                ]}
              />
            </View>
            {levelStats.progressPercent < 100 && (
              <Text style={styles.nextLevelText}>
                {levelStats.xpForNextLevel - levelStats.xpEarned} XP avant le prochain niveau
              </Text>
            )}
            {levelStats.progressPercent === 100 && (
              <Text style={styles.nextLevelTextFull}>
                ✨ Prêt à passer au niveau {gardenerLevel + 1} !
              </Text>
            )}
          </View>

          {/* Breakdown */}
          <View style={styles.breakdownSection}>
            <Text style={styles.sectionTitle}>Composition de l'expérience</Text>
            <View style={styles.breakdownList}>
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>🌱 Plantes</Text>
                <Text style={styles.breakdownValue}>{plants.length}</Text>
              </View>
              <View style={styles.breakdownDivider} />
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>🍅 Récoltes</Text>
                <Text style={styles.breakdownValue}>{harvestCount}</Text>
              </View>
              <View style={styles.breakdownDivider} />
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>📅 Jours actifs</Text>
                <Text style={styles.breakdownValue}>{daysSinceOnboarding}</Text>
              </View>
            </View>
          </View>

          {/* Milestones */}
          <View style={styles.milestonesSection}>
            <Text style={styles.sectionTitle}>Jalons atteints</Text>
            {milestones.slice(0, Math.min(gardenerLevel, 6)).map((milestone) => (
              <View key={milestone.level} style={styles.milestoneItem}>
                <View style={styles.milestoneCheck}>
                  <Text style={styles.milestoneCheckmark}>✓</Text>
                </View>
                <View style={styles.milestoneContent}>
                  <Text style={styles.milestoneLevel}>Niveau {milestone.level}</Text>
                  <Text style={styles.milestoneDesc}>{milestone.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h2,
    textAlign: 'center',
  },
  closeBtn: {
    ...typography.label,
    color: colors.textSecondary,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  levelBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  levelIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  levelNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  levelTier: {
    ...typography.h3,
    color: colors.textSecondary,
  },
  xpSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  xpLabel: {
    ...typography.label,
  },
  xpText: {
    ...typography.caption,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
  },
  nextLevelText: {
    ...typography.caption,
    color: colors.text,
    textAlign: 'center',
  },
  nextLevelTextFull: {
    ...typography.caption,
    color: colors.success,
    textAlign: 'center',
    fontWeight: '600',
  },
  breakdownSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  breakdownList: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  breakdownLabel: {
    ...typography.label,
  },
  breakdownValue: {
    ...typography.h3,
    color: colors.primary,
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  milestonesSection: {
    marginBottom: spacing.lg,
  },
  milestoneItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  milestoneCheck: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  milestoneCheckmark: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: '700',
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneLevel: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  milestoneDesc: {
    ...typography.caption,
  },
});
