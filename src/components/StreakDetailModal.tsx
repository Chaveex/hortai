import React from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { Plant } from '../types';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface StreakDetailModalProps {
  visible: boolean;
  onClose: () => void;
  streakDays: number;
  longestStreakDays: number;
  plants: Plant[];
}

export default function StreakDetailModal({
  visible, onClose, streakDays, longestStreakDays, plants,
}: StreakDetailModalProps) {
  const { t } = useTranslation();
  // Get plants watered today
  const today = format(new Date(), 'yyyy-MM-dd');
  const wateredToday = plants.filter(p => {
    if (!p.lastWatered) return false;
    const lastWateredDate = format(parseISO(p.lastWatered), 'yyyy-MM-dd');
    return lastWateredDate === today;
  });

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeBtn}>{t('common.close')}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t('streak.title')}</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Current streak section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('streak.currentStreak')}</Text>
            <View style={styles.streakBox}>
              <Text style={styles.streakNumber}>{streakDays}</Text>
              <Text style={styles.streakLabel}>{t('streak.days')}</Text>
            </View>
            {streakDays > 0 && (
              <Text style={styles.encouragement}>
                {t('streak.excellent')}
              </Text>
            )}
            {streakDays === 0 && (
              <Text style={styles.encouragement}>
                {t('streak.startNew')}
              </Text>
            )}
          </View>

          {/* Longest streak section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('streak.longestStreak')}</Text>
            <View style={styles.longestBox}>
              <Text style={styles.longestNumber}>{longestStreakDays}</Text>
              <Text style={styles.longestLabel}>{t('streak.days')}</Text>
            </View>
          </View>

          {/* Plants watered today */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('streak.wateredToday', { count: wateredToday.length })}
            </Text>
            {wateredToday.length === 0 ? (
              <Text style={styles.emptyText}>
                {t('streak.noneWatered')}
              </Text>
            ) : (
              <View style={styles.plantList}>
                {wateredToday.map((plant, idx) => (
                  <View key={plant.id} style={[
                    styles.plantItem,
                    idx !== wateredToday.length - 1 && styles.plantItemBorder,
                  ]}>
                    <Text style={styles.plantName}>{plant.name}</Text>
                    <Text style={styles.plantType}>
                      {plant.type === 'other' ? plant.variety || 'Autre plante' : plant.type}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* CTA */}
          <View style={styles.ctaSection}>
            {wateredToday.length < plants.length && (
              <Text style={styles.ctaText}>
                {t('streak.toKeepStreak', { count: plants.length - wateredToday.length })}
              </Text>
            )}
            {wateredToday.length === plants.length && streakDays > 0 && (
              <Text style={styles.ctaTextSuccess}>
                {t('streak.allWatered')}
              </Text>
            )}
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
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  streakBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.accent,
  },
  streakLabel: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  longestBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.primaryLight,
  },
  longestNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  longestLabel: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  encouragement: {
    ...typography.body,
    color: colors.text,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  plantList: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  plantItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  plantItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  plantName: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  plantType: {
    ...typography.caption,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    padding: spacing.md,
  },
  ctaSection: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
  },
  ctaText: {
    ...typography.body,
    color: colors.surface,
    textAlign: 'center',
    fontWeight: '600',
  },
  ctaTextSuccess: {
    ...typography.body,
    color: colors.success,
    textAlign: 'center',
    fontWeight: '600',
  },
});
