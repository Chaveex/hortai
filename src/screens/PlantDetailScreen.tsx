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
import { getPlantInfo, getGrowthStage } from '../constants/plants';
import TipCard from '../components/TipCard';
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import { getSeason } from '../services/recommendations';

export default function PlantDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { plantId } = route.params as { plantId: string };

  const { plants, recommendations, tips, entries, markWatered, deletePlant, addEntry, deleteEntry, profile } = useStore();
  const [entryType, setEntryType] = useState<'note' | 'harvest'>('note');
  const [entryText, setEntryText] = useState('');
  const [entryQty, setEntryQty] = useState('');
  const [entryUnit, setEntryUnit] = useState<'kg' | 'g' | 'pièces'>('kg');
  const plant = plants.find(p => p.id === plantId);

  if (!plant) {
    return (
      <SafeAreaView style={styles.safe}>
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
    addEntry({
      plantId,
      date: new Date().toISOString(),
      type: entryType,
      text: entryType === 'note' ? entryText.trim() : undefined,
      quantity: entryType === 'harvest' ? parseFloat(entryQty) : undefined,
      unit: entryType === 'harvest' ? entryUnit : undefined,
    });
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
    <SafeAreaView style={styles.safe}>
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Retour</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete}>
          <Text style={styles.deleteBtn}>Supprimer</Text>
        </TouchableOpacity>
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
                <TouchableOpacity style={styles.waterBtn} onPress={() => markWatered(plantId)}>
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
            >
              <Text style={[styles.typeTabText, entryType === 'note' && styles.typeTabTextActive]}>📓 Note</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeTab, entryType === 'harvest' && styles.typeTabActive]}
              onPress={() => setEntryType('harvest')}
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
              />
              <View style={styles.unitTabs}>
                {(['kg', 'g', 'pièces'] as const).map(u => (
                  <TouchableOpacity
                    key={u}
                    style={[styles.unitBtn, entryUnit === u && styles.unitBtnActive]}
                    onPress={() => setEntryUnit(u)}
                  >
                    <Text style={[styles.unitBtnText, entryUnit === u && styles.unitBtnTextActive]}>{u}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.addEntryBtn} onPress={handleAddEntry}>
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
  deleteBtn: { color: colors.warning, fontSize: 14 },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  heroIcon: { fontSize: 56 },
  heroName: { ...typography.h2, fontSize: 22 },
  heroVariety: { color: colors.textSecondary, fontStyle: 'italic', fontSize: 14 },
  stageBadge: {
    backgroundColor: colors.secondary, borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 4,
  },
  stageBadgeText: { color: colors.primaryDark, fontSize: 11, fontWeight: '600' },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  statBox: {
    backgroundColor: colors.surface, borderRadius: borderRadius.md,
    padding: spacing.sm, alignItems: 'center', minWidth: 72, flex: 1,
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
  historyList: { gap: 4 },
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
  unitTabs: { flexDirection: 'row', gap: 4 },
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
  entryCardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: 4 },
  entryCardIcon: { fontSize: 14 },
  entryCardDate: { flex: 1, fontSize: 12, color: colors.textMuted },
  entryCardDelete: { color: colors.textMuted, fontSize: 14 },
  entryCardText: { fontSize: 14, color: colors.text, lineHeight: 20 },
  entryCardHarvest: { fontSize: 16, fontWeight: '700', color: colors.success },
});
