import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChoreFilters, ChoreType, ChoreStatus, ChorePriority, ChoreSource,
  CHORE_TYPES, CHORE_TYPE_META, PRIORITY_LABELS, STATUS_LABELS,
  getDefaultFilters,
} from '../types/chores';
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import { Plant } from '../types';
import { getPlantInfo } from '../constants/plants';

interface Props {
  visible: boolean;
  initial: ChoreFilters;
  plants: Plant[];
  onClose: () => void;
  onApply: (filters: ChoreFilters) => void;
}

function toggleArr<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

export default function FilterBottomSheet({ visible, initial, plants, onClose, onApply }: Props) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<ChoreFilters>(initial);

  useEffect(() => {
    if (visible) setDraft(initial);
  }, [visible, initial]);

  function apply() {
    onApply(draft);
    onClose();
  }

  function reset() {
    setDraft(getDefaultFilters());
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <SafeAreaView style={styles.sheet} edges={['bottom']}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>{t('filters.title')}</Text>
          <TouchableOpacity onPress={reset}>
            <Text style={styles.reset}>{t('filters.reset')}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Section title={t('filters.typeSection')}>
            <View style={styles.row}>
              {CHORE_TYPES.map((t) => {
                const m = CHORE_TYPE_META[t];
                const active = draft.types.includes(t);
                return (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.chip,
                      active && { backgroundColor: m.backgroundColor, borderColor: m.color },
                    ]}
                    onPress={() => setDraft({ ...draft, types: toggleArr(draft.types, t) })}
                  >
                    <Text style={styles.chipIcon}>{m.icon}</Text>
                    <Text style={[styles.chipText, active && { color: m.color, fontWeight: '700' }]}>
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Section>

          <Section title={t('filters.statusSection')}>
            <View style={styles.row}>
              {(['pending', 'completed', 'skipped'] as ChoreStatus[]).map((s) => {
                const active = draft.statuses.includes(s);
                return (
                  <TouchableOpacity
                    key={s}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setDraft({ ...draft, statuses: toggleArr(draft.statuses, s) })}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {STATUS_LABELS[s]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Section>

          <Section title={t('filters.prioritySection')}>
            <View style={styles.row}>
              {(['high', 'medium', 'low'] as ChorePriority[]).map((p) => {
                const active = draft.priorities.includes(p);
                return (
                  <TouchableOpacity
                    key={p}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setDraft({ ...draft, priorities: toggleArr(draft.priorities, p) })}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {PRIORITY_LABELS[p]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Section>

          <Section title={t('filters.sourceSection')}>
            <View style={styles.row}>
              {(['auto', 'custom'] as ChoreSource[]).map((src) => {
                const active = draft.sources.includes(src);
                return (
                  <TouchableOpacity
                    key={src}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setDraft({ ...draft, sources: toggleArr(draft.sources, src) })}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {src === 'auto' ? t('filters.autoGenerated') : t('filters.custom')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Section>

          {plants.length > 0 && (
            <Section title={t('filters.plantSection')}>
              <View style={styles.row}>
                {plants.map((p) => {
                  const info = getPlantInfo(p.type);
                  const active = draft.plantIds.includes(p.id);
                  return (
                    <TouchableOpacity
                      key={p.id}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => setDraft({ ...draft, plantIds: toggleArr(draft.plantIds, p.id) })}
                    >
                      <Text style={styles.chipIcon}>{info.icon}</Text>
                      <Text
                        style={[styles.chipText, active && styles.chipTextActive]}
                        numberOfLines={1}
                      >
                        {p.name || info.frenchName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Section>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>{t('filters.cancel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyBtn} onPress={apply}>
            <Text style={styles.applyText}>{t('filters.apply')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '88%',
  },
  handle: {
    width: 40, height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  title: { ...typography.h2, fontSize: 20 },
  reset: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  content: { padding: spacing.md, gap: spacing.md },
  section: { gap: spacing.xs },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: '100%',
  },
  chipActive: { backgroundColor: colors.primary + '15', borderColor: colors.primary },
  chipIcon: { fontSize: 14 },
  chipText: { fontSize: 13, color: colors.text },
  chipTextActive: { color: colors.primary, fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  cancelText: { color: colors.textSecondary, fontWeight: '600' },
  applyBtn: {
    flex: 2,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
  },
  applyText: { color: '#FFF', fontWeight: '700' },
});
