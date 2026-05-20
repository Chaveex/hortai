import React, { useState, useMemo, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import {
  format,
} from 'date-fns';
import {
  useChoreStore, filterChores, activeFilterCount,
} from '../store/useChoreStore';
import { useStore } from '../store/useStore';
import { Chore, ChoreType } from '../types/chores';
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import ChoreAgendaView from '../components/ChoreAgendaView';
import FilterBottomSheet from '../components/FilterBottomSheet';

export default function ChoreCalendarScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {
    chores, filters, setFilters,
    completeChore, skipChore, deleteChore,
  } = useChoreStore();
  const plants = useStore((s) => s.plants);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterChoreType = route.params?.filterChoreType as ChoreType[] | undefined;

  // When filterChoreType is provided via route params, auto-apply the filter
  useEffect(() => {
    if (filterChoreType && filterChoreType.length > 0) {
      setFilters({
        ...filters,
        types: filterChoreType,
      });
    }
  }, [filterChoreType]);

  const filteredChores = useMemo(() => filterChores(chores, filters), [chores, filters]);
  const filterCount = activeFilterCount(filters);

  function handleChorePress(chore: Chore) {
    navigation.navigate('ChoreDetail', { choreId: chore.id });
  }

  function handleAddChore() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('ChoreForm', { date: format(new Date(), 'yyyy-MM-dd') });
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.titleArea}>
            <Text style={styles.title}>Tâches</Text>
            {filterChoreType && filterChoreType.length > 0 && (
              <View style={styles.filterBadgeTitle}>
                <Text style={styles.filterBadgeTitleText}>Filtrée</Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={() => setFilterOpen(true)} style={styles.filterBtn}>
            <Text style={styles.filterIcon}>⚙️</Text>
            {filterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{filterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.body}>
        <ChoreAgendaView
          chores={filteredChores}
          onChorePress={handleChorePress}
          onComplete={completeChore}
          onSkip={skipChore}
          onDelete={deleteChore}
        />
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
  titleArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  title: { ...typography.h2 },
  filterBadgeTitle: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  filterBadgeTitleText: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: '700',
  },
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
  body: { flex: 1 },
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
