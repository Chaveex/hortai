import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  format, parseISO, addDays, subDays, addWeeks, subWeeks,
  addMonths, subMonths, isToday,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  useChoreStore, filterChores, choresForDate, activeFilterCount,
} from '../store/useChoreStore';
import { useStore } from '../store/useStore';
import { Chore, ChoreView } from '../types/chores';
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import DayView from '../components/DayView';
import WeekView from '../components/WeekView';
import MonthView from '../components/MonthView';
import FilterBottomSheet from '../components/FilterBottomSheet';

export default function ChoreCalendarScreen() {
  const navigation = useNavigation<any>();
  const {
    chores, activeView, selectedDate, filters,
    setActiveView, setSelectedDate, setFilters,
    completeChore, skipChore, deleteChore,
  } = useChoreStore();
  const plants = useStore((s) => s.plants);
  const [filterOpen, setFilterOpen] = useState(false);

  const filteredChores = useMemo(() => filterChores(chores, filters), [chores, filters]);
  const dayChores = useMemo(
    () => choresForDate(filteredChores, selectedDate),
    [filteredChores, selectedDate]
  );

  const filterCount = activeFilterCount(filters);

  function navigatePrev() {
    const parsed = parseISO(selectedDate);
    if (activeView === 'day') setSelectedDate(format(subDays(parsed, 1), 'yyyy-MM-dd'));
    else if (activeView === 'week') setSelectedDate(format(subWeeks(parsed, 1), 'yyyy-MM-dd'));
    else setSelectedDate(format(subMonths(parsed, 1), 'yyyy-MM-dd'));
  }

  function navigateNext() {
    const parsed = parseISO(selectedDate);
    if (activeView === 'day') setSelectedDate(format(addDays(parsed, 1), 'yyyy-MM-dd'));
    else if (activeView === 'week') setSelectedDate(format(addWeeks(parsed, 1), 'yyyy-MM-dd'));
    else setSelectedDate(format(addMonths(parsed, 1), 'yyyy-MM-dd'));
  }

  function jumpToday() {
    setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
  }

  function handleChorePress(chore: Chore) {
    navigation.navigate('ChoreDetail', { choreId: chore.id });
  }

  function handleAddChore() {
    navigation.navigate('ChoreForm', { date: selectedDate });
  }

  const headerLabel = useMemo(() => {
    const d = parseISO(selectedDate);
    if (activeView === 'day') return format(d, 'EEEE d MMMM yyyy', { locale: fr });
    if (activeView === 'week') return `Semaine du ${format(d, 'd MMM', { locale: fr })}`;
    return format(d, 'MMMM yyyy', { locale: fr });
  }, [selectedDate, activeView]);

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Calendrier d'entretien</Text>
          <TouchableOpacity onPress={() => setFilterOpen(true)} style={styles.filterBtn}>
            <Text style={styles.filterIcon}>⚙️</Text>
            {filterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{filterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.viewToggle}>
          {(['day', 'week', 'month'] as ChoreView[]).map((v) => (
            <TouchableOpacity
              key={v}
              style={[styles.viewBtn, activeView === v && styles.viewBtnActive]}
              onPress={() => setActiveView(v)}
            >
              <Text style={[styles.viewBtnText, activeView === v && styles.viewBtnTextActive]}>
                {v === 'day' ? 'Jour' : v === 'week' ? 'Semaine' : 'Mois'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.dateNav}>
          <TouchableOpacity onPress={navigatePrev} style={styles.navArrowBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.navArrow}>‹</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={jumpToday} style={styles.dateCenter}>
            <Text style={styles.dateLabel}>{capitalize(headerLabel)}</Text>
            {!isToday(parseISO(selectedDate)) && (
              <Text style={styles.todayLink}>Aujourd'hui</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={navigateNext} style={styles.navArrowBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.navArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.body}>
        {activeView === 'day' && (
          <DayView
            date={selectedDate}
            chores={dayChores}
            onChorePress={handleChorePress}
            onComplete={completeChore}
            onSkip={skipChore}
            onDelete={deleteChore}
          />
        )}
        {activeView === 'week' && (
          <WeekView
            selectedDate={selectedDate}
            chores={filteredChores}
            onDayPress={(d) => { setSelectedDate(d); setActiveView('day'); }}
            onChorePress={handleChorePress}
          />
        )}
        {activeView === 'month' && (
          <MonthView
            selectedDate={selectedDate}
            chores={filteredChores}
            onDayPress={(d) => { setSelectedDate(d); setActiveView('day'); }}
          />
        )}
      </View>

      <TouchableOpacity style={styles.fab} onPress={handleAddChore} activeOpacity={0.85}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <FilterBottomSheet
        visible={filterOpen}
        initial={filters}
        plants={plants}
        onClose={() => setFilterOpen(false)}
        onApply={setFilters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { ...typography.h2 },
  filterBtn: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterIcon: { fontSize: 18 },
  filterBadge: {
    position: 'absolute', top: -3, right: -3,
    minWidth: 16, height: 16,
    borderRadius: 8,
    backgroundColor: colors.warning,
    paddingHorizontal: 3,
    alignItems: 'center', justifyContent: 'center',
  },
  filterBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  viewBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: borderRadius.full,
  },
  viewBtnActive: { backgroundColor: colors.primary },
  viewBtnText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  viewBtnTextActive: { color: '#FFF' },
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  navArrowBtn: { padding: spacing.xs },
  navArrow: { fontSize: 26, color: colors.primary, fontWeight: '300' },
  dateCenter: { flex: 1, alignItems: 'center' },
  dateLabel: { fontSize: 15, fontWeight: '700', color: colors.text },
  todayLink: { fontSize: 11, color: colors.primary, marginTop: 2, fontWeight: '600' },
  body: { flex: 1, paddingBottom: spacing.xl },
  fab: {
    position: 'absolute',
    left: '50%',
    marginLeft: -28,
    bottom: spacing.xl + spacing.md,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 6,
    elevation: 6,
  },
  fabText: { color: '#FFF', fontSize: 32, fontWeight: '300', marginTop: -2 },
});
