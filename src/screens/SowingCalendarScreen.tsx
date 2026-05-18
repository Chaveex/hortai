import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../store/useStore';
import { getPlantInfo } from '../constants/plants';
import {
  detectZone, getPlantsForMonth, ZONE_LABELS, ClimateZone,
} from '../constants/sowingCalendar';
import { PlantType } from '../types';
import { colors, spacing, borderRadius, typography } from '../constants/theme';

const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

const SECTIONS: { key: 'sowIndoor' | 'sowOutdoor' | 'transplant' | 'harvest'; label: string; icon: string; color: string }[] = [
  { key: 'sowIndoor',  label: 'Semer sous abri',     icon: '🏠', color: '#7B9E6B' },
  { key: 'sowOutdoor', label: 'Semer en plein air',  icon: '🌍', color: '#52B788' },
  { key: 'transplant', label: 'Repiquer',             icon: '🪴', color: '#D4A017' },
  { key: 'harvest',    label: 'Récolter',             icon: '🌾', color: '#E76F51' },
];

export default function SowingCalendarScreen() {
  const profile = useStore(s => s.profile);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const zone: ClimateZone = profile
    ? detectZone(profile.latitude, profile.longitude)
    : 'semi-oceanic';

  const data = getPlantsForMonth(month, zone);

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }

  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Calendrier des semis</Text>
        <View style={styles.zoneBadge}>
          <Text style={styles.zoneText}>{ZONE_LABELS[zone]}</Text>
        </View>
      </View>

      <View style={styles.monthNav}>
        <TouchableOpacity onPress={prevMonth} style={styles.navBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.navArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.monthCenter}>
          <Text style={styles.monthLabel}>{MONTHS[month - 1]} {year}</Text>
          {isCurrentMonth && <View style={styles.currentDot} />}
        </View>
        <TouchableOpacity onPress={nextMonth} style={styles.navBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.navArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {SECTIONS.map(section => {
          const plants = data[section.key] as PlantType[];
          if (plants.length === 0) return null;
          return (
            <View key={section.key} style={styles.section}>
              <View style={[styles.sectionHeader, { borderLeftColor: section.color }]}>
                <Text style={styles.sectionIcon}>{section.icon}</Text>
                <Text style={styles.sectionLabel}>{section.label}</Text>
                <View style={[styles.countBadge, { backgroundColor: section.color }]}>
                  <Text style={styles.countText}>{plants.length}</Text>
                </View>
              </View>
              <View style={styles.plantGrid}>
                {plants.map(type => {
                  const info = getPlantInfo(type);
                  return (
                    <View key={type} style={styles.plantChip}>
                      <Text style={styles.plantIcon}>{info.icon}</Text>
                      <Text style={styles.plantName}>{info.frenchName}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}

        {SECTIONS.every(s => (data[s.key] as PlantType[]).length === 0) && (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>😴</Text>
            <Text style={styles.emptyText}>Rien à faire au jardin ce mois-ci.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    gap: spacing.xs,
  },
  title: { ...typography.h2 },
  zoneBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight + '30',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  zoneText: { fontSize: 12, color: colors.primaryDark, fontWeight: '500' },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  navBtn: { padding: spacing.xs },
  navArrow: { fontSize: 28, color: colors.primary, fontWeight: '300' },
  monthCenter: { alignItems: 'center', gap: 4 },
  monthLabel: { ...typography.h3, fontSize: 18 },
  currentDot: {
    width: 6, height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  content: { padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.md },
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 3,
    paddingLeft: spacing.sm,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  sectionIcon: { fontSize: 18 },
  sectionLabel: { ...typography.h3, fontSize: 15, flex: 1 },
  countBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  countText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  plantGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  plantChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  plantIcon: { fontSize: 16 },
  plantName: { fontSize: 13, color: colors.text, fontWeight: '500' },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.sm },
  emptyEmoji: { fontSize: 40 },
  emptyText: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
});
