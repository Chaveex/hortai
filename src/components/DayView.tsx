import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Chore, CHORE_TYPES, CHORE_TYPE_META } from '../types/chores';
import { groupChoresByType } from '../store/useChoreStore';
import ChoreRow from './ChoreRow';
import { colors, spacing, typography } from '../constants/theme';

interface Props {
  date: string;
  chores: Chore[];
  onChorePress: (chore: Chore) => void;
  onComplete: (id: string) => void;
  onSkip: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function DayView({ date, chores, onChorePress, onComplete, onSkip, onDelete }: Props) {
  const grouped = useMemo(() => groupChoresByType(chores), [chores]);
  const pending = chores.filter((c) => c.status === 'pending');
  const done = chores.filter((c) => c.status === 'completed');

  const labelDate = format(parseISO(date), 'EEEE d MMMM', { locale: fr });
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  if (chores.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>🌿</Text>
        <Text style={styles.emptyTitle}>Rien à faire</Text>
        <Text style={styles.emptyDesc}>Aucune tâche pour {capitalize(labelDate)}.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{pending.length}</Text>
          <Text style={styles.summaryLabel}>À faire</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.success }]}>{done.length}</Text>
          <Text style={styles.summaryLabel}>Fait</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.warning }]}>
            {chores.filter((c) => c.priority === 'high' && c.status === 'pending').length}
          </Text>
          <Text style={styles.summaryLabel}>Urgent</Text>
        </View>
      </View>

      {CHORE_TYPES.map((type) => {
        const list = grouped[type];
        if (list.length === 0) return null;
        const meta = CHORE_TYPE_META[type];
        return (
          <View key={type} style={styles.group}>
            <View style={styles.groupHeader}>
              <Text style={styles.groupIcon}>{meta.icon}</Text>
              <Text style={[styles.groupLabel, { color: meta.color }]}>{meta.label}</Text>
              <View style={[styles.countPill, { backgroundColor: meta.color }]}>
                <Text style={styles.countText}>{list.length}</Text>
              </View>
            </View>
            {list.map((c) => (
              <ChoreRow
                key={c.id}
                chore={c}
                onPress={() => onChorePress(c)}
                onComplete={() => onComplete(c.id)}
                onSkip={() => onSkip(c.id)}
                onDelete={() => onDelete(c.id)}
              />
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  summary: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  summaryValue: { fontSize: 20, fontWeight: '700', color: colors.text },
  summaryLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  group: { marginBottom: spacing.md },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  groupIcon: { fontSize: 16 },
  groupLabel: { fontSize: 14, fontWeight: '700', flex: 1 },
  countPill: {
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 10,
  },
  countText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  empty: { alignItems: 'center', padding: spacing.xxl, gap: spacing.sm },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { ...typography.h3 },
  emptyDesc: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
});
