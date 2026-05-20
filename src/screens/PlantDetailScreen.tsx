import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { differenceInDays, parseISO, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useStore } from '../store/useStore';
import { useChoreStore } from '../store/useChoreStore';
import { getPlantInfo, getGrowthStage } from '../constants/plants';
import TipCard from '../components/TipCard';
import BotanistModal from './BotanistModal';
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import { getSeason } from '../services/recommendations';
import { CHORE_TYPE_META } from '../types/chores';

export default function PlantDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { plantId } = route.params as { plantId: string };

  const { plants, recommendations, tips, entries, markWatered, deletePlant, addEntry, deleteEntry, profile } = useStore();
  const getChoresForPlant = useChoreStore((s) => s.getChoresForPlant);
  const [entryType, setEntryType] = useState<'note' | 'harvest'>('note');
  const [entryText, setEntryText] = useState('');
  const [entryQty, setEntryQty] = useState('');
  const [entryUnit, setEntryUnit] = useState<'kg' | 'g' | 'pièces'>('kg');
  const [botanistModalOpen, setBotanistModalOpen] = useState(false);
  const plant = plants.find(p => p.id === plantId);
  const linkedChores = plant ? getChoresForPlant(plant.id, 'upcoming') : [];

  if (!plant) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <Text style={{ padding: spacing.md }}>Plant introuvable.</Text>
      </SafeAreaView>
    );
  }

  const plantEntries = entries.filter(e => e.plantId === plantId);
  const info = getPlantInfo(plant.type);
  const rec = recommendations.find(r => r.plantId === plantId);
  const plantTips = tips.filter(t => t.plantId === plantId);
  const daysSincePlanting = differenceInDays(new Date(), parseISO(plant.plantedDate));
  const stage = getGrowthStage(daysSincePlanting, plant.type);
  const season = getSeason(new Date().getMonth() + 1);
  const seasonalAdvice = info.seasonalAdvice[season];

  const daysToHarvest = Math.max(0, info.harvestDays - daysSincePlanting);

  function handleAddEntry() {
    if (entryType === 'note' && !entryText.trim()) return;
    if (entryType === 'harvest' && !entryQty.trim()) return;

    // Prepare entry data
    const entryData = {
      plantId,
      date: new Date().toISOString(),
      type: entryType,
      text: entryType === 'note' ? entryText.trim() : undefined,
      quantity: entryType === 'harvest' ? parseFloat(entryQty) : undefined,
      unit: entryType === 'harvest' ? entryUnit : undefined,
    };

    // Check for harvest celebration conditions
    if (entryType === 'harvest') {
      const harvestQty = parseFloat(entryQty);
      const isFirstHarvest = !entries.some(e => e.type === 'harvest' && e.plantId === plantId);

      // Check if goal will be hit
      const now = new Date();
      const currentMonth = format(now, 'yyyy-MM');
      const monthlyHarvest = entries
        .filter(e => e.type === 'harvest' && e.date.startsWith(currentMonth))
        .reduce((sum, e) => sum + (e.quantity || 0), 0);
      const harvestGoal = profile?.harvestGoal || 10;
      const willHitGoal = monthlyHarvest + harvestQty >= harvestGoal;

      addEntry(entryData);

      // Show appropriate toast
      if (isFirstHarvest) {
        Alert.alert('🎉 Récolte', 'Première récolte ! C\'est magnifique !', [
          { text: 'Bravo 🙌', onPress: () => {} },
        ]);
      } else if (willHitGoal) {
        Alert.alert('🎉 Récolte', 'Objectif du mois atteint !', [
          { text: 'Excellent ! 🎯', onPress: () => {} },
        ]);
      } else {
        Alert.alert('✅ Récolte', 'Récolte enregistrée !', [
          { text: 'Merci 🙏', onPress: () => {} },
        ]);
      }
    } else {
      addEntry(entryData);
    }

    setEntryText('');
    setEntryQty('');
  }

  function handleDelete() {
    Alert.alert(
      'Supprimer ce plant ?',
      'Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => { deletePlant(plantId); navigation.goBack(); },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
      <View style={styles.navHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityLabel="Retour vers le jardin"
          accessibilityRole="button"
        >
          <Text style={styles.backBtn}>← Retour</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('PlantDetailDashboard', { plantId })}
            accessibilityLabel="Statistiques du plant"
            accessibilityRole="button"
          >
            <Text style={styles.statsBtn}>📊 Stats</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            accessibilityLabel="Supprimer ce plant"
            accessibilityRole="button"
          >
            <Text style={styles.deleteBtn}>Supprimer</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroIcon}>{info.icon}</Text>
          <View>
            <Text style={styles.heroName}>{plant.name || info.frenchName}</Text>
            {plant.variety && <Text style={styles.heroVariety}>{plant.variety}</Text>}
            <View style={styles.stageBadge}>
              <Text style={styles.stageBadgeText}>{stage.label}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatBox label="Âge" value={`${daysSincePlanting}j`} />
          <StatBox label="Planté le" value={format(parseISO(plant.plantedDate), 'd MMM', { locale: fr })} />
          <StatBox label="Récolte dans" value={daysToHarvest > 0 ? `~${daysToHarvest}j` : 'Prêt !'} highlight={daysToHarvest <= 7} />
          {plant.location && <StatBox label="Emplacement" value={plant.location} />}
        </View>

        {rec && (
          <View style={[styles.section, rec.shouldWater ? styles.waterSection : styles.okSection]}>
            <Text style={styles.sectionTitle}>
              {rec.shouldWater ? '💧 Arrosage recommandé' : '✅ Arrosage OK'}
            </Text>
            {rec.shouldWater ? (
              <>
                <Text style={styles.waterAmount}>{rec.amount.toFixed(1)} L/m²</Text>
                <Text style={styles.waterReason}>{rec.reason}</Text>
                <TouchableOpacity
                  style={styles.waterBtn}
                  onPress={() => markWatered(plantId)}
                  accessibilityRole="button"
                  accessibilityLabel="Marquer comme arrosé"
                  accessibilityHint="Appuyez pour enregistrer l'arrosage"
                >
                  <Text style={styles.waterBtnText}>Marquer comme arrosé ✓</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.waterReason}>
                {rec.skipReason === 'rain_recent' ? 'Pluie récente suffisante.'
                  : rec.skipReason === 'rain_forecast' ? 'Pluie prévue aujourd\'hui.'
                  : `Prochain arrosage le ${format(parseISO(rec.nextWateringDate), 'd MMM', { locale: fr })}`}
              </Text>
            )}
          </View>
        )}

        {/* Botanist button */}
        <TouchableOpacity
          onPress={() => setBotanistModalOpen(true)}
          style={styles.botanistButton}
          accessibilityRole="button"
          accessibilityLabel="Conseil du botaniste"
          accessibilityHint="Appuyez pour poser une question au botaniste"
        >
          <Text style={styles.botanistButtonEmoji}>💡</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.botanistButtonLabel}>Conseil pour cette plante</Text>
            <Text style={styles.botanistButtonSubtitle}>Posez une question au botaniste</Text>
          </View>
          <Text style={styles.botanistButtonArrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.choreSection}>
          <View style={styles.choreHeader}>
            <Text style={styles.label}>Tâches liées</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Tâches', { screen: 'ChoreForm', params: { plantId: plant.id } })}
              style={styles.addChoreBtn}
              accessibilityRole="button"
              accessibilityLabel="Ajouter une tâche"
              accessibilityHint="Appuyez pour créer une nouvelle tâche pour ce plant"
            >
              <Text style={styles.addChoreBtnText}>➕</Text>
            </TouchableOpacity>
          </View>
          {linkedChores.length > 0 ? (
            <View style={styles.choreList}>
              {linkedChores.map((chore) => {
                const meta = CHORE_TYPE_META[chore.type];
                return (
                  <TouchableOpacity
                    key={chore.id}
                    style={styles.choreCard}
                    onPress={() => navigation.navigate('Tâches', { screen: 'ChoreDetail', params: { choreId: chore.id } })}
                    accessibilityRole="button"
                    accessibilityLabel={`Tâche: ${chore.title}`}
                    accessibilityHint={`Appuyez pour voir les détails du ${chore.type}`}
                  >
                    <Text style={styles.choreIcon}>{meta.icon}</Text>
                    <View style={styles.choreInfo}>
                      <Text style={styles.choreTitle}>{chore.title}</Text>
                      <Text style={styles.choreDate}>
                        {format(parseISO(chore.date), 'd MMM', { locale: fr })}
                      </Text>
                    </View>
                    <Text style={styles.choreArrow}>›</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <Text style={styles.noChoresText}>Aucune tâche liée</Text>
          )}
        </View>

        {plantTips.length > 0 && (
          <>
            <Text style={styles.label}>Conseils pour ce plant</Text>
            {plantTips.map(t => <TipCard key={t.id} tip={t} />)}
          </>
        )}

        <Text style={styles.label}>Conseil de saison</Text>
        <View style={styles.adviceBox}>
          <Text style={styles.adviceText}>{seasonalAdvice}</Text>
        </View>

        {profile && (
          <>
            <Text style={styles.label}>Fertilisation</Text>
            <View style={styles.adviceBox}>
              <Text style={styles.adviceText}>
                {profile.fertilizerType === 'naturel' ? info.fertilizerSchedule.naturel
                  : profile.fertilizerType === 'industriel' ? info.fertilizerSchedule.industriel
                  : 'Aucun engrais utilisé.'}
              </Text>
            </View>
          </>
        )}

        <Text style={styles.label}>Problèmes courants</Text>
        <View style={styles.issuesList}>
          {info.commonIssues.map(issue => (
            <View key={issue} style={styles.issueChip}>
              <Text style={styles.issueText}>⚠️ {issue}</Text>
            </View>
          ))}
        </View>

        {plant.wateringHistory.length > 0 && (
          <>
            <Text style={styles.label}>Historique d'arrosage (30 derniers)</Text>
            <View style={styles.historyList}>
              {plant.wateringHistory.slice().reverse().map((date, i) => (
                <Text key={i} style={styles.historyItem}>
                  💧 {format(parseISO(date), 'd MMMM à HH:mm', { locale: fr })}
                </Text>
              ))}
            </View>
          </>
        )}

        {plant.notes && (
          <>
            <Text style={styles.label}>Notes</Text>
            <View style={styles.adviceBox}>
              <Text style={styles.adviceText}>{plant.notes}</Text>
            </View>
          </>
        )}

        <Text style={styles.label}>Journal & Récoltes</Text>
        <View style={styles.journalForm}>
          <View style={styles.entryTypeTabs}>
            <TouchableOpacity
              style={[styles.typeTab, entryType === 'note' && styles.typeTabActive]}
              onPress={() => setEntryType('note')}
              accessibilityRole="tab"
              accessibilityLabel="Type de note"
              accessibilityState={{ selected: entryType === 'note' }}
            >
              <Text style={[styles.typeTabText, entryType === 'note' && styles.typeTabTextActive]}>📓 Note</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeTab, entryType === 'harvest' && styles.typeTabActive]}
              onPress={() => setEntryType('harvest')}
              accessibilityRole="tab"
              accessibilityLabel="Type de récolte"
              accessibilityState={{ selected: entryType === 'harvest' }}
            >
              <Text style={[styles.typeTabText, entryType === 'harvest' && styles.typeTabTextActive]}>🌾 Récolte</Text>
            </TouchableOpacity>
          </View>

          {entryType === 'note' ? (
            <TextInput
              style={styles.entryInput}
              value={entryText}
              onChangeText={setEntryText}
              placeholder="Observation, maladie, intervention…"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={2}
              accessibilityLabel="Saisissez votre observation"
              accessibilityHint="Entrez les détails de votre observation sur la plante"
            />
          ) : (
            <View style={styles.harvestRow}>
              <TextInput
                style={[styles.entryInput, { flex: 1 }]}
                value={entryQty}
                onChangeText={setEntryQty}
                placeholder="Quantité"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                accessibilityLabel="Quantité récolte"
                accessibilityHint="Entrez la quantité récolte"
              />
              <View style={styles.unitTabs}>
                {(['kg', 'g', 'pièces'] as const).map(u => (
                  <TouchableOpacity
                    key={u}
                    style={[styles.unitBtn, entryUnit === u && styles.unitBtnActive]}
                    onPress={() => setEntryUnit(u)}
                    accessibilityRole="radio"
                    accessibilityLabel={`Unité: ${u}`}
                    accessibilityState={{ selected: entryUnit === u }}
                  >
                    <Text style={[styles.unitBtnText, entryUnit === u && styles.unitBtnTextActive]}>{u}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity
            style={styles.addEntryBtn}
            onPress={handleAddEntry}
            accessibilityRole="button"
            accessibilityLabel={`Ajouter ${entryType === 'note' ? 'note' : 'récolte'}`}
            accessibilityHint="Appuyez pour enregistrer votre saisie"
          >
            <Text style={styles.addEntryBtnText}>+ Ajouter</Text>
          </TouchableOpacity>
        </View>

        {plantEntries.map(entry => (
          <View key={entry.id} style={styles.entryCard}>
            <View style={styles.entryCardHeader}>
              <Text style={styles.entryCardIcon}>{entry.type === 'note' ? '📓' : '🌾'}</Text>
              <Text style={styles.entryCardDate}>
                {format(new Date(entry.date), 'd MMM yyyy', { locale: fr })}
              </Text>
              <TouchableOpacity
                onPress={() => deleteEntry(entry.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Supprimer"
                accessibilityHint="Appuyez pour supprimer cette entrée"
              >
                <Text style={styles.entryCardDelete}>✕</Text>
              </TouchableOpacity>
            </View>
            {entry.type === 'note'
              ? <Text style={styles.entryCardText}>{entry.text}</Text>
              : <Text style={styles.entryCardHarvest}>{entry.quantity} {entry.unit}</Text>
            }
          </View>
        ))}
      </ScrollView>
      {/* Botanist Modal */}
      <BotanistModal
        visible={botanistModalOpen}
        onClose={() => setBotanistModalOpen(false)}
        context={`plant:${plant?.id}`}
      />
    </SafeAreaView>
  );
}

function StatBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={[styles.statBox, highlight && styles.statBoxHighlight]}>
      <Text style={[styles.statValue, highlight && styles.statValueHighlight]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  navHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface,
  },
  backBtn: { color: colors.primary, fontSize: 15 },
  statsBtn: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  deleteBtn: { color: colors.warning, fontSize: 14 },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  heroIcon: { fontSize: 56 },
  heroName: { ...typography.h2, fontSize: 22 },
  heroVariety: { color: colors.textSecondary, fontStyle: 'italic', fontSize: 14 },
  stageBadge: {
    backgroundColor: colors.secondary, borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm, paddingVertical: 2, alignSelf: 'flex-start', marginTop: spacing.xs,
  },
  stageBadgeText: { color: colors.primaryDark, fontSize: 11, fontWeight: '600' },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  statBox: {
    backgroundColor: colors.surface, borderRadius: borderRadius.md,
    padding: spacing.sm, alignItems: 'center', minWidth: 60, flex: 1,
    borderWidth: 1, borderColor: colors.border,
  },
  statBoxHighlight: { borderColor: colors.success, backgroundColor: '#EDF7F1' },
  statValue: { fontSize: 16, fontWeight: '700', color: colors.text },
  statValueHighlight: { color: colors.success },
  statLabel: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  section: { borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.md },
  waterSection: { backgroundColor: '#FFF3EE', borderWidth: 1, borderColor: colors.accent },
  okSection: { backgroundColor: '#EDF7F1', borderWidth: 1, borderColor: colors.success },
  sectionTitle: { fontWeight: '700', fontSize: 15, color: colors.text, marginBottom: spacing.xs },
  waterAmount: { fontSize: 22, fontWeight: '700', color: colors.accent, marginBottom: spacing.xs },
  waterReason: { fontSize: 13, color: colors.text, lineHeight: 18, marginBottom: spacing.sm },
  waterBtn: {
    backgroundColor: colors.primary, borderRadius: borderRadius.md,
    padding: spacing.sm, alignItems: 'center',
  },
  waterBtnText: { color: '#FFFFFF', fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginTop: spacing.md, marginBottom: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  adviceBox: {
    backgroundColor: colors.surface, borderRadius: borderRadius.md,
    padding: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  adviceText: { fontSize: 14, color: colors.text, lineHeight: 20 },
  issuesList: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  issueChip: {
    backgroundColor: '#FFF3EE', borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
  },
  issueText: { fontSize: 12, color: colors.warning },
  historyList: { gap: spacing.xs },
  historyItem: { fontSize: 13, color: colors.textSecondary },
  journalForm: {
    backgroundColor: colors.surface, borderRadius: borderRadius.md,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: spacing.sm,
  },
  entryTypeTabs: { flexDirection: 'row', gap: spacing.xs },
  typeTab: {
    flex: 1, paddingVertical: spacing.xs, borderRadius: borderRadius.full,
    borderWidth: 1.5, borderColor: colors.border, alignItems: 'center',
  },
  typeTabActive: { borderColor: colors.primary, backgroundColor: '#EDF7F1' },
  typeTabText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  typeTabTextActive: { color: colors.primary, fontWeight: '600' },
  entryInput: {
    backgroundColor: colors.background, borderWidth: 1.5, borderColor: colors.border,
    borderRadius: borderRadius.md, padding: spacing.sm, fontSize: 14, color: colors.text,
    textAlignVertical: 'top',
  },
  harvestRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  unitTabs: { flexDirection: 'row', gap: spacing.xs },
  unitBtn: {
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
    borderRadius: borderRadius.full, borderWidth: 1.5, borderColor: colors.border,
  },
  unitBtnActive: { borderColor: colors.primary, backgroundColor: '#EDF7F1' },
  unitBtnText: { fontSize: 12, color: colors.textSecondary },
  unitBtnTextActive: { color: colors.primary, fontWeight: '600' },
  addEntryBtn: {
    backgroundColor: colors.primary, borderRadius: borderRadius.md,
    padding: spacing.sm, alignItems: 'center',
  },
  addEntryBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  entryCard: {
    backgroundColor: colors.surface, borderRadius: borderRadius.md,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md,
    marginTop: spacing.xs,
  },
  entryCardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs },
  entryCardIcon: { fontSize: 14 },
  entryCardDate: { flex: 1, fontSize: 12, color: colors.textMuted },
  entryCardDelete: { color: colors.textMuted, fontSize: 14 },
  entryCardText: { fontSize: 14, color: colors.text, lineHeight: 20 },
  entryCardHarvest: { fontSize: 16, fontWeight: '700', color: colors.success },
  botanistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary + '20',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  botanistButtonEmoji: { fontSize: 24, marginRight: spacing.sm },
  botanistButtonLabel: { fontSize: 14, fontWeight: '600', color: colors.text },
  botanistButtonSubtitle: { fontSize: 12, color: colors.textMuted, marginTop: spacing.xs },
  botanistButtonArrow: { fontSize: 18, color: colors.textMuted, marginLeft: spacing.sm },
  choreSection: { marginTop: spacing.md, marginBottom: spacing.md },
  choreHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  addChoreBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  addChoreBtnText: { fontSize: 20 },
  choreList: { gap: spacing.xs },
  choreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  choreIcon: { fontSize: 20 },
  choreInfo: { flex: 1 },
  choreTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  choreDate: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  choreArrow: { fontSize: 18, color: colors.textSecondary },
  noChoresText: { fontSize: 13, color: colors.textSecondary, fontStyle: 'italic', padding: spacing.md, textAlign: 'center' },
});
