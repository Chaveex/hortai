import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { format, parseISO, startOfWeek, addDays, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Chore, CHORE_TYPE_META } from '../types/chores';
import { colors, spacing, borderRadius } from '../constants/theme';

interface Props {
  selectedDate: string;
  chores: Chore[];
  onDayPress: (dateISO: string) => void;
  onChorePress: (chore: Chore) => void;
}

interface DayCell {
  date: Date;
  iso: string;
  chores: Chore[];
}

export default function WeekView({ selectedDate, chores, onDayPress, onChorePress }: Props) {
  const days: DayCell[] = useMemo(() => {
    const ref = parseISO(selectedDate);
    const weekStart = startOfWeek(ref, { weekStartsOn: 1 });
    return Array.from({ length: 7 }).map((_, i) => {
      const d = addDays(weekStart, i);
      const iso = format(d, 'yyyy-MM-dd');
      return { date: d, iso, chores: chores.filter((c) => c.date === iso) };
    });
  }, [selectedDate, chores]);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        {days.map((d) => (
          <View key={d.iso} style={styles.headerCell}>
            <Text style={styles.headerDow}>
              {format(d.date, 'EEE', { locale: fr }).slice(0, 3)}
            </Text>
            <TouchableOpacity
              onPress={() => onDayPress(d.iso)}
              style={[
                styles.headerDateBtn,
                isToday(d.date) && styles.headerDateToday,
                d.iso === selectedDate && styles.headerDateSelected,
              ]}
            >
              <Text
                style={[
                  styles.headerDateText,
                  isToday(d.date) && styles.headerDateTextToday,
                  d.iso === selectedDate && styles.headerDateTextSelected,
                ]}
              >
                {format(d.date, 'd')}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {days.map((d) => {
          const pendingCount = d.chores.filter((c) => c.status === 'pending').length;
          const hasHigh = d.chores.some((c) => c.priority === 'high' && c.status === 'pending');
          return (
            <TouchableOpacity
              key={d.iso}
              activeOpacity={0.7}
              style={[
                styles.dayCol,
                isToday(d.date) && styles.dayColToday,
                d.iso === selectedDate && styles.dayColSelected,
              ]}
              onPress={() => onDayPress(d.iso)}
            >
              {pendingCount > 0 && (
                <View style={[styles.badgeCount, hasHigh && { backgroundColor: colors.warning }]}>
                  <Text style={styles.badgeCountText}>{pendingCount}</Text>
                </View>
              )}
              {d.chores.slice(0, 6).map((c) => {
                const meta = CHORE_TYPE_META[c.type];
                const dim = c.status !== 'pending';
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      styles.chip,
                      { borderLeftColor: meta.color, backgroundColor: dim ? '#F5F5F5' : meta.backgroundColor },
                    ]}
                    onPress={() => onChorePress(c)}
                  >
                    <Text style={styles.chipIcon}>{meta.icon}</Text>
                    <Text
                      style={[styles.chipText, dim && styles.chipTextDim]}
                      numberOfLines={1}
                    >
                      {c.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              {d.chores.length > 6 && (
                <Text style={styles.moreText}>+{d.chores.length - 6}</Text>
              )}
              {d.chores.length === 0 && <View style={styles.emptyCell} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.sm, paddingBottom: spacing.xxl },
  headerRow: { flexDirection: 'row', marginBottom: spacing.xs },
  headerCell: { flex: 1, alignItems: 'center', gap: 2 },
  headerDow: {
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  headerDateBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerDateToday: { backgroundColor: colors.secondary },
  headerDateSelected: { backgroundColor: colors.primary },
  headerDateText: { fontSize: 13, color: colors.text, fontWeight: '600' },
  headerDateTextToday: { color: colors.primaryDark },
  headerDateTextSelected: { color: '#FFF' },
  grid: {
    flexDirection: 'row',
    minHeight: 360,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  dayCol: {
    flex: 1,
    padding: 3,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    gap: 2,
    position: 'relative',
  },
  dayColToday: { backgroundColor: colors.secondary + '15' },
  dayColSelected: { backgroundColor: colors.primary + '10' },
  badgeCount: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  badgeCountText: { color: '#FFF', fontSize: 9, fontWeight: '700' },
  chip: {
    borderLeftWidth: 2,
    paddingHorizontal: 3,
    paddingVertical: 2,
    borderRadius: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  chipIcon: { fontSize: 9 },
  chipText: { fontSize: 9, color: colors.text, flex: 1 },
  chipTextDim: { color: colors.textMuted, textDecorationLine: 'line-through' },
  moreText: { fontSize: 9, color: colors.textMuted, fontStyle: 'italic', textAlign: 'center' },
  emptyCell: { flex: 1 },
});
