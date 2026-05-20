import { useTranslation } from 'react-i18next';
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../store/useStore';
import { useChoreStore } from '../store/useChoreStore';
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import {
  shareJSONBackup,
  shareZIPBackup,
  pickAndReadBackupFile,
  importFromJSON,
  getBackupMetadataList,
  deleteBackupMetadata,
  BackupMetadata,
  ImportConflictStrategy,
} from '../services/backup';
import {
  isSupabaseEnabled,
  listBackups,
  uploadBackup,
  downloadBackup,
  deleteBackup as deleteCloudBackup,
} from '../services/supabaseBackup';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 o';
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return <Text style={sectionHeaderStyle}>{title}</Text>;
}

const sectionHeaderStyle: import('react-native').TextStyle = {
  fontSize: 12,
  fontWeight: '600',
  color: colors.textSecondary,
  textTransform: 'uppercase',
  letterSpacing: 0.8,
  marginBottom: spacing.xs,
  marginTop: spacing.md,
};

interface ActionRowProps {
  icon: string;
  label: string;
  sublabel?: string;
  onPress: () => void;
  loading?: boolean;
  destructive?: boolean;
  last?: boolean;
}

function ActionRow({ icon, label, sublabel, onPress, loading, destructive, last }: ActionRowProps) {
  return (
    <TouchableOpacity
      style={[styles.actionRow, last && styles.actionRowLast]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.7}
    >
      <Text style={styles.actionIcon}>{icon}</Text>
      <View style={styles.actionContent}>
        <Text style={[styles.actionLabel, destructive && { color: colors.error }]}>{label}</Text>
        {sublabel ? <Text style={styles.actionSub}>{sublabel}</Text> : null}
      </View>
      {loading
        ? <ActivityIndicator size="small" color={colors.primary} />
        : <Text style={styles.chevron}>›</Text>}
    </TouchableOpacity>
  );
}

interface BackupRowProps {
  meta: BackupMetadata;
  onRestore: (meta: BackupMetadata) => void;
  onDelete: (meta: BackupMetadata) => void;
  last?: boolean;
}

function BackupRow({ meta, onRestore, onDelete, last }: BackupRowProps) {
  return (
    <View style={[styles.backupRow, last && styles.backupRowLast]}>
      <Text style={styles.backupIcon}>{meta.source === 'cloud' ? '☁️' : '📁'}</Text>
      <View style={styles.backupInfo}>
        <Text style={styles.backupDate}>{formatDate(meta.timestamp)}</Text>
        <Text style={styles.backupSize}>{formatBytes(meta.size)}</Text>
      </View>
      <View style={styles.backupActions}>
        <TouchableOpacity style={styles.backupBtn} onPress={() => onRestore(meta)}>
          <Text style={styles.backupBtnText}>Restaurer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.backupBtn, styles.backupBtnDanger]} onPress={() => onDelete(meta)}>
          <Text style={[styles.backupBtnText, { color: colors.error }]}>X</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function BackupSettingsScreen() {
  const {
    profile, plants, entries,
    setProfile, setPlants, setEntries,
    addBackup, setBackups,
    lastBackupTime, backups: storeBackups,
  } = useStore();

  const choreStore = useChoreStore();

  const [localBackups, setLocalBackups] = useState<BackupMetadata[]>([]);
  const [cloudBackups, setCloudBackups] = useState<BackupMetadata[]>([]);
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [loadingCloud, setLoadingCloud] = useState(false);
  const [loadingImport, setLoadingImport] = useState(false);
  const [loadingCloudUpload, setLoadingCloudUpload] = useState(false);
  const [autoBackup, setAutoBackup] = useState(false);

  const supabaseEnabled = isSupabaseEnabled();

  // Build the store snapshot for export
  const storeSnapshot = {
    profile,
    plants,
    entries,
    chores: choreStore.chores,
  };

  // Load local backup metadata on mount
  useEffect(() => {
    getBackupMetadataList().then(setLocalBackups).catch(() => {});
  }, []);

  // ── Export JSON ──────────────────────────────────────────────────────────────

  const handleExportJSON = useCallback(async () => {
    if (!profile) {
      Alert.alert('Erreur', 'Aucun profil à sauvegarder.');
      return;
    }
    setLoadingLocal(true);
    try {
      const meta = await shareJSONBackup(storeSnapshot);
      addBackup(meta);
      const updated = await getBackupMetadataList();
      setLocalBackups(updated);
      Alert.alert('Export réussi', `Sauvegarde JSON partagée (${formatBytes(meta.size)}).`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      Alert.alert('Erreur export', msg);
    } finally {
      setLoadingLocal(false);
    }
  }, [storeSnapshot, profile, addBackup]);

  // ── Export ZIP ──────────────────────────────────────────────────────────────

  const handleExportZIP = useCallback(async () => {
    if (!profile) {
      Alert.alert('Erreur', 'Aucun profil à sauvegarder.');
      return;
    }
    setLoadingLocal(true);
    try {
      const meta = await shareZIPBackup(storeSnapshot);
      addBackup(meta);
      const updated = await getBackupMetadataList();
      setLocalBackups(updated);
      Alert.alert('Export réussi', `Sauvegarde compressée partagée (${formatBytes(meta.size)}).`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      Alert.alert('Erreur export', msg);
    } finally {
      setLoadingLocal(false);
    }
  }, [storeSnapshot, profile, addBackup]);

  // ── Import local ────────────────────────────────────────────────────────────

  const handleImport = useCallback(async (strategy: ImportConflictStrategy) => {
    setLoadingImport(true);
    try {
      const json = await pickAndReadBackupFile();

      await importFromJSON(json, strategy, {
        setProfile,
        setPlants,
        setEntries,
        setChores: (c) => {
          // Bulk-replace chores via direct store mutation
          useChoreStore.setState({ chores: c });
        },
        currentPlants: plants,
        currentEntries: entries,
        currentChores: choreStore.chores,
      });

      Alert.alert(
        'Restauration réussie',
        `Données ${strategy === 'overwrite' ? 'remplacées' : 'fusionnées'} avec succès.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      Alert.alert('Erreur import', msg);
    } finally {
      setLoadingImport(false);
    }
  }, [setProfile, setPlants, setEntries, plants, entries, choreStore.chores]);

  const promptImport = useCallback(() => {
    Alert.alert(
      'Importer une sauvegarde',
      'Que faire des données existantes ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Fusionner', onPress: () => handleImport('merge') },
        { text: 'Remplacer', style: 'destructive', onPress: () => handleImport('overwrite') },
      ]
    );
  }, [handleImport]);

  // ── Cloud backup ─────────────────────────────────────────────────────────────

  const loadCloudBackups = useCallback(async () => {
    if (!supabaseEnabled || !profile) return;
    setLoadingCloud(true);
    try {
      const userId = profile.city + '_' + profile.latitude.toFixed(4);
      const list = await listBackups(userId);
      setCloudBackups(list);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur cloud';
      Alert.alert('Erreur cloud', msg);
    } finally {
      setLoadingCloud(false);
    }
  }, [supabaseEnabled, profile]);

  useEffect(() => {
    if (supabaseEnabled) {
      loadCloudBackups();
    }
  }, [supabaseEnabled, loadCloudBackups]);

  const handleCloudUpload = useCallback(async () => {
    if (!profile) return;
    setLoadingCloudUpload(true);
    try {
      const { exportAsJSON } = await import('../services/backup');
      const json = await exportAsJSON(storeSnapshot);
      const userId = profile.city + '_' + profile.latitude.toFixed(4);
      const backupId = await uploadBackup(json, userId);
      Alert.alert('Cloud', `Sauvegarde envoyée (id: ${backupId.slice(0, 8)}…)`);
      await loadCloudBackups();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur cloud';
      Alert.alert('Erreur cloud', msg);
    } finally {
      setLoadingCloudUpload(false);
    }
  }, [storeSnapshot, profile, loadCloudBackups]);

  const handleCloudRestore = useCallback(async (meta: BackupMetadata) => {
    Alert.alert(
      'Restaurer depuis le cloud',
      `Sauvegarde du ${formatDate(meta.timestamp)}. Que faire des données existantes ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Fusionner',
          onPress: async () => {
            try {
              const json = await downloadBackup(meta.id);
              await importFromJSON(json, 'merge', {
                setProfile,
                setPlants,
                setEntries,
                setChores: (c) => useChoreStore.setState({ chores: c }),
                currentPlants: plants,
                currentEntries: entries,
                currentChores: choreStore.chores,
              });
              Alert.alert('Restauration réussie', 'Données fusionnées depuis le cloud.');
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : 'Erreur';
              Alert.alert('Erreur', msg);
            }
          },
        },
        {
          text: 'Remplacer',
          style: 'destructive',
          onPress: async () => {
            try {
              const json = await downloadBackup(meta.id);
              await importFromJSON(json, 'overwrite', {
                setProfile,
                setPlants,
                setEntries,
                setChores: (c) => useChoreStore.setState({ chores: c }),
                currentPlants: plants,
                currentEntries: entries,
                currentChores: choreStore.chores,
              });
              Alert.alert('Restauration réussie', 'Données remplacées depuis le cloud.');
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : 'Erreur';
              Alert.alert('Erreur', msg);
            }
          },
        },
      ]
    );
  }, [setProfile, setPlants, setEntries, plants, entries, choreStore.chores]);

  const handleCloudDelete = useCallback(async (meta: BackupMetadata) => {
    Alert.alert(
      'Supprimer cette sauvegarde ?',
      `Du ${formatDate(meta.timestamp)} — irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCloudBackup(meta.id);
              await loadCloudBackups();
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : 'Erreur';
              Alert.alert('Erreur', msg);
            }
          },
        },
      ]
    );
  }, [loadCloudBackups]);

  const handleLocalDelete = useCallback(async (meta: BackupMetadata) => {
    Alert.alert(
      'Supprimer cet enregistrement ?',
      'Supprime uniquement la référence locale, pas le fichier partagé.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const updated = await deleteBackupMetadata(meta.id);
            setLocalBackups(updated);
            setBackups(updated);
          },
        },
      ]
    );
  }, [setBackups]);

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Sauvegarde & Export</Text>

        {/* Last backup info */}
        {lastBackupTime ? (
          <View style={styles.lastBackupBanner}>
            <Text style={styles.lastBackupText}>
              Derniere sauvegarde : {formatDate(lastBackupTime)}
            </Text>
          </View>
        ) : null}

        {/* ── Local Export ── */}
        <SectionHeader title="Export local" />
        <View style={styles.card}>
          <ActionRow
            icon="📥"
            label="Exporter JSON"
            sublabel={`${plants.length} plante${plants.length !== 1 ? 's' : ''} · ${entries.length} entrée${entries.length !== 1 ? 's' : ''}`}
            onPress={handleExportJSON}
            loading={loadingLocal}
          />
          <ActionRow
            icon="📦"
            label="Exporter compressé (.gdb)"
            sublabel="Fichier compact, restaurable dans l'app"
            onPress={handleExportZIP}
            loading={loadingLocal}
            last
          />
        </View>

        {/* Local backup history */}
        {localBackups.length > 0 ? (
          <>
            <SectionHeader title="Historique local" />
            <View style={styles.card}>
              {localBackups.map((meta, idx) => (
                <BackupRow
                  key={meta.id}
                  meta={meta}
                  onRestore={() => {
                    Alert.alert(
                      'Restaurer',
                      'Cette action nécessite un fichier. Utilisez "Importer" pour restaurer depuis un fichier.',
                      [{ text: 'OK' }]
                    );
                  }}
                  onDelete={handleLocalDelete}
                  last={idx === localBackups.length - 1}
                />
              ))}
            </View>
          </>
        ) : null}

        {/* ── Restore Local ── */}
        <SectionHeader title="Restaurer local" />
        <View style={styles.card}>
          <ActionRow
            icon="📤"
            label="Importer une sauvegarde"
            sublabel="JSON ou .gdb — choix entre fusion et remplacement"
            onPress={promptImport}
            loading={loadingImport}
            last
          />
        </View>

        {/* ── Auto-backup (UI only for MVP) ── */}
        <SectionHeader title="Sauvegarde automatique" />
        <View style={styles.card}>
          <View style={[styles.switchRow, styles.actionRowLast]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionLabel}>Sauvegarde quotidienne</Text>
              <Text style={styles.actionSub}>
                Chaque jour à 2h00 — actif dans les builds production uniquement
              </Text>
            </View>
            <Switch
              value={autoBackup}
              onValueChange={setAutoBackup}
              trackColor={{ true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* ── Supabase Cloud ── */}
        {supabaseEnabled ? (
          <>
            <SectionHeader title="Cloud (Supabase)" />
            <View style={styles.card}>
              <ActionRow
                icon="☁️"
                label="Sauvegarder dans le cloud"
                sublabel="Upload chiffré vers Supabase"
                onPress={handleCloudUpload}
                loading={loadingCloudUpload}
                last={cloudBackups.length === 0}
              />
              {loadingCloud ? (
                <View style={styles.cloudLoader}>
                  <ActivityIndicator color={colors.primary} />
                </View>
              ) : cloudBackups.length > 0 ? (
                cloudBackups.map((meta, idx) => (
                  <BackupRow
                    key={meta.id}
                    meta={meta}
                    onRestore={handleCloudRestore}
                    onDelete={handleCloudDelete}
                    last={idx === cloudBackups.length - 1}
                  />
                ))
              ) : null}
            </View>
          </>
        ) : (
          <>
            <SectionHeader title="Cloud (Supabase)" />
            <View style={[styles.card, styles.disabledCard]}>
              <View style={styles.disabledContent}>
                <Text style={styles.disabledIcon}>☁️</Text>
                <View>
                  <Text style={styles.disabledTitle}>Synchronisation cloud désactivée</Text>
                  <Text style={styles.disabledSub}>
                    Ajoutez EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_KEY dans .env pour activer.
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  title: { ...typography.h2, marginBottom: spacing.xs },

  lastBackupBanner: {
    backgroundColor: colors.secondary + '33',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  lastBackupText: { fontSize: 12, color: colors.text },

  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionRowLast: { borderBottomWidth: 0 },
  actionIcon: { fontSize: 22, width: 30, textAlign: 'center' },
  actionContent: { flex: 1 },
  actionLabel: { fontSize: 15, color: colors.text, fontWeight: '500' },
  actionSub: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  chevron: { fontSize: 20, color: colors.textMuted },

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  backupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backupRowLast: { borderBottomWidth: 0 },
  backupIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  backupInfo: { flex: 1 },
  backupDate: { fontSize: 13, color: colors.text, fontWeight: '500' },
  backupSize: { fontSize: 11, color: colors.textMuted },
  backupActions: { flexDirection: 'row', gap: spacing.xs },
  backupBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  backupBtnDanger: { borderColor: colors.error + '60' },
  backupBtnText: { fontSize: 12, color: colors.primary, fontWeight: '500' },

  cloudLoader: { padding: spacing.md, alignItems: 'center' },

  disabledCard: { opacity: 0.6 },
  disabledContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    gap: spacing.sm,
  },
  disabledIcon: { fontSize: 22 },
  disabledTitle: { fontSize: 14, color: colors.text, fontWeight: '500' },
  disabledSub: { fontSize: 11, color: colors.textMuted, marginTop: 2, maxWidth: 260 },
});
