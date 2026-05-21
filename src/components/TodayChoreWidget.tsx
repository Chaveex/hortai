import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useChoreStore, choresForDate } from '../store/useChoreStore';
import { CHORE_TYPE_META } from '../types/chores';
import { colors, spacing, borderRadius, typography } from '../constants/theme';

interface Props {
  onPress: () => void;
}

export default function TodayChoreWidget({ onPress }: Props) {
  const { t } = useTranslation();
  const chores = useChoreStore((s) => s.chores);
  const today = format(new Date(), 'yyyy-MM-dd');
  const completeChore = useChoreStore((s) => s.completeChore);

  const todayChores = useMemo(() => choresForDate(chores, today), [chores, today]);
  const pending = todayChores.filter((c) => c.status === 'pending');
  const done = todayChores.filter((c) => c.status === 'completed');
  const high = pending.filter((c) => c.priority === 'high').length;

  if (todayChores.length === 0) {
    return null;
  }

  const preview = pending.slice(0, 3);

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('chores.todayTitle')}</Text>
        <View style={styles.statsRow}>
          {high > 0 && (
            <View style={styles.highBadge}>
              <Text style={styles.highBadgeText}>{high} urgent{high > 1 ? 's' : ''}</Text>
            </View>
          )}
          <Text style={styles.count}>
            {done.length} / {todayChores.length}
          </Text>
        </View>
      </View>

      {pending.length === 0 ? (
        <Text style={styles.allDone}>🎉 Toutes les tâches sont faites !</Text>
      ) : (
        <View style={styles.list}>
          {preview.map((c) => {
            const m = CHORE_TYPE_META[c.type];
            return (
              <View key={c.id} style={styles.item}>
                <View style={[styles.iconBubble, { backgroundColor: m.backgroundColor }]}>
                  <Text style={styles.iconText}>{m.icon}</Text>
                </View>
                <Text style={styles.itemText} numberOfLines={1}>
                  {c.title}
                </Text>
                <TouchableOpacity
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  onPress={(e) => {
                    e.stopPropagation();
                    completeChore(c.id);
                  }}
                  style={styles.checkBtn}
                >
                  <Text style={styles.checkText}>✓</Text>
                </TouchableOpacity>
              </View>
            );
          })}
          {pending.length > 3 && (
            <Text style={styles.more}>+{pending.length - 3} autre{pending.length - 3 > 1 ? 's' : ''}</Text>
          )}
        </View>
      )}

      <Text style={styles.cta}>Voir le calendrier →</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { ...typography.h3, fontSize: 16 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  highBadge: {
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  highBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  count: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  allDone: { fontSize: 14, color: colors.success, fontWeight: '600' },
  list: { gap: spacing.xs },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconBubble: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  iconText: { fontSize: 14 },
  itemText: { flex: 1, fontSize: 13, color: colors.text },
  checkBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.success + '20',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.success,
  },
  checkText: { color: colors.success, fontWeight: '700', fontSize: 14 },
  more: { fontSize: 12, color: colors.textMuted, fontStyle: 'italic', marginLeft: 36 },
  cta: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'right',
    marginTop: 2,
  },
});
