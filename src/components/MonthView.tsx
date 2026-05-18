import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isToday,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { Chore, CHORE_TYPE_META } from '../types/chores';
import { colors, spacing, borderRadius } from '../constants/theme';

interface Props {
  selectedDate: string;
  chores: Chore[];
  onDayPress: (dateISO: string) => void;
}

const DOW = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];

export default function MonthView({ selectedDate, chores, onDayPress }: Props) {
  const cells = useMemo(() => {
    const ref = parseISO(selectedDate);
    const monthStart = startOfMonth(ref);
    const monthEnd = endOfMonth(ref);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days: { date: Date; iso: string; inMonth: boolean; chores: Chore[] }[] = [];
    let cursor = gridStart;
    while (cursor <= gridEnd) {
      const iso = format(cursor, 'yyyy-MM-dd');
      days.push({
        date: cursor,
        iso,
        inMonth: isSameMonth(cursor, ref),
        chores: chores.filter((c) => c.date === iso),
      });
      cursor = addDays(cursor, 1);
    }
    return days;
  }, [selectedDate, chores]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.dowRow}>
        {DOW.map((d) => (
          <Text key={d} style={styles.dowText}>{d}</Text>
        ))}
      </View>
      <View style={styles.grid}>
        {cells.map((cell) => {
          const pending = cell.chores.filter((c) => c.status === 'pending');
          const high = pending.filter((c) => c.priority === 'high').length;
          const med = pending.filter((c) => c.priority === 'medium').length;
          const low = pending.filter((c) => c.priority === 'low').length;
          const isSel = cell.iso === selectedDate;
          const isCurrent = isToday(cell.date);

          const uniqueTypes = Array.from(new Set(cell.chores.map((c) => c.type))).slice(0, 3);

          return (
            <TouchableOpacity
              key={cell.iso}
              style={[
                styles.cell,
                !cell.inMonth && styles.cellOutMonth,
                isCurrent && styles.cellToday,
                isSel && styles.cellSelected,
              ]}
              activeOpacity={0.7}
              onPress={() => onDayPress(cell.iso)}
            >
              <Text
                style={[
                  styles.cellDate,
                  !cell.inMonth && styles.cellDateOut,
                  isCurrent && styles.cellDateToday,
                  isSel && styles.cellDateSelected,
                ]}
              >
                {format(cell.date, 'd')}
              </Text>

              <View style={styles.typeRow}>
                {uniqueTypes.map((t) => (
                  <View
                    key={t}
                    style={[
                      styles.typeDot,
                      { backgroundColor: CHORE_TYPE_META[t].color },
                    ]}
                  />
                ))}
              </View>

              {pending.length > 0 && (
                <View
                  style={[
                    styles.urgencyBar,
                    high > 0
                      ? { backgroundColor: colors.warning }
                      : med > 0
                      ? { backgroundColor: '#FB8C00' }
                      : { backgroundColor: colors.primaryLight },
                  ]}
                >
                  <Text style={styles.urgencyText}>{pending.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
          <Text style={styles.legendText}>Urgent</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FB8C00' }]} />
          <Text style={styles.legendText}>Moyen</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primaryLight }]} />
          <Text style={styles.legendText}>Bas</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: spacing.sm, paddingBottom: spacing.xxl },
  dowRow: { flexDirection: 'row', marginBottom: 4 },
  dowText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 0.85,
    padding: 3,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 2,
  },
  cellOutMonth: { backgroundColor: '#FAFAFA' },
  cellToday: { backgroundColor: colors.secondary + '20' },
  cellSelected: { backgroundColor: colors.primary + '15' },
  cellDate: { fontSize: 13, fontWeight: '600', color: colors.text, marginTop: 2 },
  cellDateOut: { color: colors.textMuted },
  cellDateToday: { color: colors.primaryDark, fontWeight: '800' },
  cellDateSelected: { color: colors.primary, fontWeight: '800' },
  typeRow: { flexDirection: 'row', gap: 2, marginTop: 2 },
  typeDot: { width: 5, height: 5, borderRadius: 2.5 },
  urgencyBar: {
    minWidth: 18,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 2,
  },
  urgencyText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: colors.textSecondary },
});
