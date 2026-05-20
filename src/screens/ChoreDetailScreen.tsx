import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { format, parseISO, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useChoreStore } from '../store/useChoreStore';
import { useStore } from '../store/useStore';
import { getPlantInfo } from '../constants/plants';
import {
  CHORE_TYPE_META, PRIORITY_LABELS, STATUS_LABELS,
} from '../types/chores';
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import ChoreTypeIcon from '../components/ChoreTypeIcon';

export default function ChoreDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { choreId } = route.params as { choreId: string };

  const chores = useChoreStore((s) => s.chores);
  const completeChore = useChoreStore((s) => s.completeChore);
  const skipChore = useChoreStore((s) => s.skipChore);
  const reopenChore = useChoreStore((s) => s.reopenChore);
  const deleteChore = useChoreStore((s) => s.deleteChore);
  const addChore = useChoreStore((s) => s.addChore);
  const markWatered = useStore((s) => s.markWatered);
  const plants = useStore((s) => s.plants);

  const chore = chores.find((c) => c.id === choreId);

  if (!chore) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← Retour</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.notFound}>Tâche introuvable.</Text>
      </SafeAreaView>
    );
  }

  const meta = CHORE_TYPE_META[chore.type];
  const plant = chore.plantId ? plants.find((p) => p.id === chore.plantId) : undefined;
  const plantInfo = plant ? getPlantInfo(plant.type) : undefined;

  function handleComplete() {
    if (!chore) return;
    if (chore.type === 'watering' && chore.plantId) {
      markWatered(chore.plantId);
    }
    completeChore(chore.id);
    if (chore.recurrenceDays && chore.recurrenceDays > 0) {
      const nextDate = format(addDays(parseISO(chore.date), chore.recurrenceDays), 'yyyy-MM-dd');
      addChore({
        type: chore.type,
        title: chore.title,
        description: chore.description,
        date: nextDate,
        plantId: chore.plantId,
        priority: chore.priority,
        source: chore.source,
        recurrenceDays: chore.recurrenceDays,
      });
    }
    navigation.goBack();
  }

  function handleSkip() {
    if (!chore) return;
    skipChore(chore.id);
    navigation.goBack();
  }

  function handleReopen() {
    if (!chore) return;
    reopenChore(chore.id);
  }

  function handleEdit() {
    if (!chore) return;
    navigation.navigate('ChoreForm', { choreId: chore.id });
  }

  function handleDelete() {
    if (!chore) return;
    Alert.alert('Supprimer cette tâche ?', 'Cette action est irréversible.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          deleteChore(chore.id);
          navigation.goBack();
        },
      },
    ]);
  }

  const isDone = chore.status === 'completed';
  const isSkipped = chore.status === 'skipped';
  const isInactive = isDone || isSkipped;

  function handlePlantTap() {
    if (plant) {
      navigation.navigate('Jardin', { screen: 'PlantDetail', params: { plantId: plant.id } });
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Retour</Text>
        </TouchableOpacity>
        {plant && (
          <TouchableOpacity onPress={handlePlantTap} style={styles.headerPlantLink}>
            <Text style={styles.headerPlantText}>
              {plant.name || plantInfo?.frenchName}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handleEdit}>
          <Text style={styles.editBtn}>Modifier</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: meta.backgroundColor }]}>
          <ChoreTypeIcon type={chore.type} size={56} />
          <Text style={[styles.heroLabel, { color: meta.color }]}>{meta.label}</Text>
          <Text style={styles.heroTitle}>{chore.title}</Text>
        </View>

        <View style={styles.statsRow}>
          <StatBox label="Date" value={format(parseISO(chore.date), 'd MMM yyyy', { locale: fr })} />
          <StatBox label="Priorité" value={PRIORITY_LABELS[chore.priority]} />
          <StatBox label="Statut" value={STATUS_LABELS[chore.status]} highlight={isDone} />
          <StatBox label="Origine" value={chore.source === 'auto' ? 'Auto' : 'Custom'} />
        </View>

        {plant && plantInfo && (
          <View style={styles.plantCard}>
            <Text style={styles.plantIcon}>{plantInfo.icon}</Text>
            <View>
              <Text style={styles.plantName}>{plant.name || plantInfo.frenchName}</Text>
              {plant.variety && <Text style={styles.plantVariety}>{plant.variety}</Text>}
            </View>
          </View>
        )}

        {chore.description && (
          <>
            <Text style={styles.sectionLabel}>Description</Text>
            <View style={styles.box}>
              <Text style={styles.boxText}>{chore.description}</Text>
            </View>
          </>
        )}

        {chore.recurrenceDays && chore.recurrenceDays > 0 && (
          <>
            <Text style={styles.sectionLabel}>Récurrence</Text>
            <View style={styles.box}>
              <Text style={styles.boxText}>♻️ Tous les {chore.recurrenceDays} jours</Text>
            </View>
          </>
        )}

        {chore.completedAt && (
          <Text style={styles.timeline}>
            ✓ Terminé le {format(parseISO(chore.completedAt), 'd MMM yyyy à HH:mm', { locale: fr })}
          </Text>
        )}
        {chore.skippedAt && (
          <Text style={styles.timeline}>
            ↷ Ignoré le {format(parseISO(chore.skippedAt), 'd MMM yyyy à HH:mm', { locale: fr })}
          </Text>
        )}

        {!isInactive ? (
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.bigBtn, { backgroundColor: colors.success }]} onPress={handleComplete}>
              <Text style={styles.bigBtnText}>✓ Marquer comme fait</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.bigBtn, { backgroundColor: colors.textMuted }]} onPress={handleSkip}>
              <Text style={styles.bigBtnText}>↷ Ignorer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={[styles.bigBtn, { backgroundColor: colors.primary, marginTop: spacing.md }]} onPress={handleReopen}>
            <Text style={styles.bigBtnText}>↺ Rouvrir la tâche</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.deleteRow} onPress={handleDelete}>
          <Text style={styles.deleteText}>Supprimer cette tâche</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={[styles.statBox, highlight && styles.statBoxHighlight]}>
      <Text style={[styles.statValue, highlight && { color: colors.success }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  navHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backBtn: { color: colors.primary, fontSize: 15 },
  editBtn: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  headerPlantLink: { flex: 1, alignItems: 'center' },
  headerPlantText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  notFound: { padding: spacing.md, color: colors.textSecondary },
  hero: {
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  heroLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  heroTitle: { ...typography.h2, textAlign: 'center' },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  statBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
    minWidth: 72,
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statBoxHighlight: { borderColor: colors.success, backgroundColor: '#EDF7F1' },
  statValue: { fontSize: 14, fontWeight: '700', color: colors.text },
  statLabel: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  plantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  plantIcon: { fontSize: 32 },
  plantName: { fontSize: 15, fontWeight: '700', color: colors.text },
  plantVariety: { fontSize: 12, color: colors.textSecondary, fontStyle: 'italic' },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  box: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  boxText: { fontSize: 14, color: colors.text, lineHeight: 20 },
  timeline: {
    marginTop: spacing.md,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actionRow: { gap: spacing.sm, marginTop: spacing.lg },
  bigBtn: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  bigBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  deleteRow: { marginTop: spacing.lg, padding: spacing.sm, alignItems: 'center' },
  deleteText: { color: colors.warning, fontSize: 14, fontWeight: '600' },
});
