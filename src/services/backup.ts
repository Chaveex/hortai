import AsyncStorage from '@react-native-async-storage/async-storage';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Plant, UserProfile, PlantEntry } from '../types';
import { Chore } from '../types/chores';

export const BACKUP_VERSION = '1.0';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BackupMetadata {
  id: string;
  timestamp: string;
  version: string;
  size: number;
  source: 'local' | 'cloud';
  filename: string;
}

export interface BackupPayload {
  version: string;
  exportedAt: string;
  profile: UserProfile;
  plants: Plant[];
  entries: PlantEntry[];
  chores: Chore[];
}

export type ImportConflictStrategy = 'overwrite' | 'merge';

// ─── Metadata persistence ─────────────────────────────────────────────────────

const METADATA_KEY = 'garden-backup-metadata';

async function loadStoredMetadata(): Promise<BackupMetadata[]> {
  try {
    const raw = await AsyncStorage.getItem(METADATA_KEY);
    return raw ? (JSON.parse(raw) as BackupMetadata[]) : [];
  } catch {
    return [];
  }
}

async function saveMetadata(list: BackupMetadata[]): Promise<void> {
  await AsyncStorage.setItem(METADATA_KEY, JSON.stringify(list));
}

async function appendMetadata(meta: BackupMetadata): Promise<BackupMetadata[]> {
  const list = await loadStoredMetadata();
  const updated = [meta, ...list];
  await saveMetadata(updated);
  return updated;
}

// ─── RootState snapshot ───────────────────────────────────────────────────────

export interface RootState {
  profile: UserProfile | null;
  plants: Plant[];
  entries: PlantEntry[];
  chores: Chore[];
}

// ─── Core JSON export ─────────────────────────────────────────────────────────

export async function exportAsJSON(store: RootState): Promise<string> {
  if (!store.profile) {
    throw new Error('Aucun profil à sauvegarder.');
  }
  const payload: BackupPayload = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    profile: store.profile,
    plants: store.plants,
    entries: store.entries,
    chores: store.chores,
  };
  return JSON.stringify(payload, null, 2);
}

// ─── Compression (pure-JS) ────────────────────────────────────────────────────

export async function compressBackup(json: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  return encoder.encode(json);
}

export async function decompressBackup(compressed: Uint8Array): Promise<string> {
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(compressed);
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export function getCurrentBackupMetadata(): {
  timestamp: string;
  version: string;
  size: number;
} {
  return {
    timestamp: new Date().toISOString(),
    version: BACKUP_VERSION,
    size: 0,
  };
}

// ─── File write helper (SDK 54 class-based API) ───────────────────────────────

async function writeToCacheFile(filename: string, content: string): Promise<string> {
  const file = new File(Paths.cache, filename);
  file.write(content);
  return file.uri;
}

// ─── Export JSON ─────────────────────────────────────────────────────────────

export async function exportJSONToFile(
  store: RootState
): Promise<{ uri: string; meta: BackupMetadata }> {
  const json = await exportAsJSON(store);
  const filename = `garden-backup-${Date.now()}.json`;
  const uri = await writeToCacheFile(filename, json);

  const size = json.length;
  const meta: BackupMetadata = {
    id: Math.random().toString(36).slice(2) + Date.now().toString(36),
    timestamp: new Date().toISOString(),
    version: BACKUP_VERSION,
    size,
    source: 'local',
    filename,
  };

  await appendMetadata(meta);
  return { uri, meta };
}

export async function shareJSONBackup(store: RootState): Promise<BackupMetadata> {
  const { uri, meta } = await exportJSONToFile(store);
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error("Le partage de fichiers n'est pas disponible sur cet appareil.");
  }
  await Sharing.shareAsync(uri, {
    mimeType: 'application/json',
    dialogTitle: 'Exporter la sauvegarde',
    UTI: 'public.json',
  });
  return meta;
}

// ─── Export compressed (.gdb = base64 JSON) ───────────────────────────────────

export async function shareZIPBackup(store: RootState): Promise<BackupMetadata> {
  const json = await exportAsJSON(store);
  const bytes = await compressBackup(json);

  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const b64 = btoa(binary);

  const filename = `garden-backup-${Date.now()}.gdb`;
  const uri = await writeToCacheFile(filename, b64);

  const size = bytes.length;
  const meta: BackupMetadata = {
    id: Math.random().toString(36).slice(2) + Date.now().toString(36),
    timestamp: new Date().toISOString(),
    version: BACKUP_VERSION,
    size,
    source: 'local',
    filename,
  };

  await appendMetadata(meta);

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error("Le partage de fichiers n'est pas disponible sur cet appareil.");
  }
  await Sharing.shareAsync(uri, {
    mimeType: 'application/octet-stream',
    dialogTitle: 'Exporter la sauvegarde compressée',
  });
  return meta;
}

// ─── Validation ───────────────────────────────────────────────────────────────

export function validateBackupPayload(data: unknown): data is BackupPayload {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  if (typeof d.version !== 'string') return false;
  if (typeof d.exportedAt !== 'string') return false;

  const p = d.profile;
  if (!p || typeof p !== 'object') return false;
  const profile = p as Record<string, unknown>;
  if (typeof profile.city !== 'string') return false;
  if (typeof profile.latitude !== 'number') return false;
  if (typeof profile.longitude !== 'number') return false;

  if (!Array.isArray(d.plants)) return false;
  if (!Array.isArray(d.entries)) return false;
  if (!Array.isArray(d.chores)) return false;

  return true;
}

// ─── Import / pick file ───────────────────────────────────────────────────────

export async function pickAndReadBackupFile(): Promise<string> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain', 'application/octet-stream', '*/*'],
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    throw new Error('Aucun fichier sélectionné.');
  }

  const asset = result.assets[0];
  const file = new File(asset.uri);

  if (asset.name?.endsWith('.gdb')) {
    const b64 = await file.text();
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return decompressBackup(bytes);
  }

  return file.text();
}

export async function importFromJSON(
  json: string,
  strategy: ImportConflictStrategy,
  callbacks: {
    setProfile: (p: UserProfile) => void;
    setPlants: (p: Plant[]) => void;
    setEntries: (e: PlantEntry[]) => void;
    setChores: (c: Chore[]) => void;
    currentPlants: Plant[];
    currentEntries: PlantEntry[];
    currentChores: Chore[];
  }
): Promise<BackupPayload> {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    throw new Error('Fichier invalide : JSON malformé.');
  }

  if (!validateBackupPayload(data)) {
    throw new Error('Fichier invalide : structure de sauvegarde incorrecte.');
  }

  const payload = data as BackupPayload;

  if (strategy === 'overwrite') {
    callbacks.setProfile(payload.profile);
    callbacks.setPlants(payload.plants);
    callbacks.setEntries(payload.entries);
    callbacks.setChores(payload.chores);
  } else {
    callbacks.setProfile(payload.profile);

    const existingPlantIds = new Set(callbacks.currentPlants.map(p => p.id));
    callbacks.setPlants([
      ...callbacks.currentPlants,
      ...payload.plants.filter(p => !existingPlantIds.has(p.id)),
    ]);

    const existingEntryIds = new Set(callbacks.currentEntries.map(e => e.id));
    callbacks.setEntries([
      ...callbacks.currentEntries,
      ...payload.entries.filter(e => !existingEntryIds.has(e.id)),
    ]);

    const existingChoreIds = new Set(callbacks.currentChores.map(c => c.id));
    callbacks.setChores([
      ...callbacks.currentChores,
      ...payload.chores.filter(c => !existingChoreIds.has(c.id)),
    ]);
  }

  return payload;
}

// ─── Metadata helpers ─────────────────────────────────────────────────────────

export async function getBackupMetadataList(): Promise<BackupMetadata[]> {
  return loadStoredMetadata();
}

export async function deleteBackupMetadata(id: string): Promise<BackupMetadata[]> {
  const list = await loadStoredMetadata();
  const updated = list.filter(m => m.id !== id);
  await saveMetadata(updated);
  return updated;
}
