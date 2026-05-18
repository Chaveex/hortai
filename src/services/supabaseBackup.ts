/**
 * Supabase cloud backup service.
 *
 * Active only when both EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_KEY
 * are set in the environment. All exports are safe to call regardless — they
 * will throw a clear error if Supabase is not configured.
 *
 * MVP: metadata stored locally; raw JSON uploaded to Supabase `backups` table.
 *
 * Supabase table schema (run in SQL editor):
 *   create table backups (
 *     id uuid primary key default gen_random_uuid(),
 *     user_id text not null,
 *     filename text not null,
 *     data text not null,
 *     size integer not null,
 *     created_at timestamptz default now(),
 *     updated_at timestamptz default now()
 *   );
 *   alter table backups enable row level security;
 *   create policy "Users manage own backups"
 *     on backups for all using (auth.uid()::text = user_id);
 */

import { BackupMetadata, BACKUP_VERSION } from './backup';

// ─── Environment detection ────────────────────────────────────────────────────

const SUPABASE_URL: string = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_KEY: string = process.env.EXPO_PUBLIC_SUPABASE_KEY ?? '';

export function isSupabaseEnabled(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_KEY);
}

function assertSupabase(): void {
  if (!isSupabaseEnabled()) {
    throw new Error(
      'Supabase non configuré. Ajoutez EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_KEY dans votre fichier .env.'
    );
  }
}

// ─── Minimal REST client (no SDK dependency) ─────────────────────────────────

interface SupabaseRow {
  id: string;
  user_id: string;
  filename: string;
  data: string;
  size: number;
  created_at: string;
  updated_at: string;
}

async function supabaseFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${SUPABASE_URL}/rest/v1${path}`;
  const headers: Record<string, string> = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
    ...(options.headers as Record<string, string> | undefined),
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText);
    throw new Error(`Supabase error ${res.status}: ${body}`);
  }
  return res;
}

// ─── Auth stub ───────────────────────────────────────────────────────────────

/**
 * MVP: no full Supabase Auth flow.
 * userId is passed in by the caller (e.g. from a lightweight email-only session
 * or a future expo-auth-session integration). The RLS policy checks user_id as text.
 */

// ─── Public API ───────────────────────────────────────────────────────────────

/** Upload a JSON backup and return the generated backup_id (UUID). */
export async function uploadBackup(json: string, userId: string): Promise<string> {
  assertSupabase();
  if (!userId) throw new Error('userId requis pour la sauvegarde cloud.');

  const filename = `garden-backup-${Date.now()}.json`;
  const body: Omit<SupabaseRow, 'id' | 'created_at' | 'updated_at'> = {
    user_id: userId,
    filename,
    data: json,
    size: json.length,
  };

  const res = await supabaseFetch('/backups', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  const rows: SupabaseRow[] = await res.json();
  const row = rows[0];
  if (!row?.id) throw new Error('Réponse Supabase inattendue lors de l\'upload.');
  return row.id;
}

/** Download a backup JSON string by its id. */
export async function downloadBackup(backupId: string): Promise<string> {
  assertSupabase();
  const res = await supabaseFetch(
    `/backups?id=eq.${encodeURIComponent(backupId)}&select=data`
  );
  const rows: Array<{ data: string }> = await res.json();
  if (!rows[0]?.data) throw new Error('Sauvegarde introuvable.');
  return rows[0].data;
}

/** List all backups for a user, ordered by creation date descending. */
export async function listBackups(userId: string): Promise<BackupMetadata[]> {
  assertSupabase();
  const res = await supabaseFetch(
    `/backups?user_id=eq.${encodeURIComponent(userId)}&select=id,filename,size,created_at&order=created_at.desc`
  );
  const rows: Array<{ id: string; filename: string; size: number; created_at: string }> =
    await res.json();

  return rows.map(r => ({
    id: r.id,
    timestamp: r.created_at,
    version: BACKUP_VERSION,
    size: r.size,
    source: 'cloud' as const,
    filename: r.filename,
  }));
}

/** Delete a backup by id. */
export async function deleteBackup(backupId: string): Promise<void> {
  assertSupabase();
  await supabaseFetch(`/backups?id=eq.${encodeURIComponent(backupId)}`, {
    method: 'DELETE',
  });
}
