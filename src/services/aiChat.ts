import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImageManipulator from 'expo-image-manipulator';
import { AIChatMessage, RateLimitStatus, UserProfile } from '../types';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const MODEL = 'claude-haiku-4-5-20251001';
const MAX_TOKENS = 1024;
const DAILY_LIMIT = 3;
const MAX_HISTORY_MESSAGES = 100;
const HISTORY_RETENTION_DAYS = 2;
const PHOTO_COMPRESS_WIDTH = 600;
const PHOTO_COMPRESS_QUALITY = 0.6;

const STORAGE_KEY_MESSAGES = 'aiChat_messages';
const STORAGE_KEY_COUNT = 'aiChat_questionCount';
const STORAGE_KEY_LAST_RESET = 'aiChat_lastReset';

const SYSTEM_PROMPT = `Tu es expert horticulteur botaniste 20+ ans. Spécialiste en permaculture, agriculture conventionnelle, biodynamique et hydroponique.

RÔLE:
- Réponds UNIQUEMENT questions jardinage/botanie/culture/maladies/nutrition/saisonnalité/techniques/engrais
- Refuse poliment hors-scope (cuisine, santé, politique, non-jardinage)
- Sois concis, pratique, adapte aux conditions locales de l'utilisateur
- Cite sources si pertinent

CONTEXTE UTILISATEUR:
Le contexte inclut la ville, style jardinage, et type d'engrais. Utilise ces infos automatiquement.
- Si permaculture: recommande paillis, compost, purins naturels
- Si conventionnel: conseil engrais industriels si applicable
- Si biodynamique: référence calendrier lunaire (simplifié)
- Si hydroponique: solutions nutritives, pH, EC

QUESTIONS À POSER:
Si l'utilisateur pose une question sans mentionner:
- La plante spécifique: demande le type/variété
- Observations: demande "Avez-vous remarqué des signes? Feuilles jaunes, taches, etc?"
- Histoire récente: demande "Quand avez-vous arrosé/engrais en dernier?"
- Localisation exacte: demande "En pot ou en pleine terre?"

Reste utile et concis. Réponses max 150 mots sauf si détails complexes nécessaires.`;

interface AnthropicTextBlock {
  type: 'text';
  text: string;
}

interface AnthropicImageBlock {
  type: 'image';
  source: { type: 'base64'; media_type: 'image/jpeg' | 'image/png'; data: string };
}

type AnthropicContentBlock = AnthropicTextBlock | AnthropicImageBlock;

interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string | AnthropicContentBlock[];
}

interface AnthropicResponse {
  content: { type: string; text?: string }[];
  stop_reason?: string;
  error?: { type: string; message: string };
}

function getApiKey(): string {
  const key = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
  if (!key || key.length === 0) {
    throw new Error('MISSING_API_KEY');
  }
  return key;
}

function generateMessageId(): string {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

function todayUTC(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
}

function nextResetUTC(): string {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return tomorrow.toISOString();
}

async function ensureFreshCounter(): Promise<void> {
  const today = todayUTC();
  const lastReset = await AsyncStorage.getItem(STORAGE_KEY_LAST_RESET);
  if (lastReset !== today) {
    await AsyncStorage.multiSet([
      [STORAGE_KEY_COUNT, '0'],
      [STORAGE_KEY_LAST_RESET, today],
    ]);
  }
}

export async function checkRateLimit(): Promise<RateLimitStatus> {
  await ensureFreshCounter();
  const countStr = await AsyncStorage.getItem(STORAGE_KEY_COUNT);
  const count = countStr ? parseInt(countStr, 10) : 0;
  const remaining = Math.max(0, DAILY_LIMIT - count);
  return {
    allowed: count < DAILY_LIMIT,
    remaining,
    resetsAt: nextResetUTC(),
  };
}

async function incrementRateLimit(): Promise<void> {
  await ensureFreshCounter();
  const countStr = await AsyncStorage.getItem(STORAGE_KEY_COUNT);
  const count = countStr ? parseInt(countStr, 10) : 0;
  await AsyncStorage.setItem(STORAGE_KEY_COUNT, String(count + 1));
}

function pruneOldMessages(messages: AIChatMessage[]): AIChatMessage[] {
  const cutoff = Date.now() - HISTORY_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const filtered = messages.filter(m => {
    const t = new Date(m.timestamp).getTime();
    return !isNaN(t) && t >= cutoff;
  });
  return filtered.slice(-MAX_HISTORY_MESSAGES);
}

export async function getRecentChatHistory(days: number = HISTORY_RETENTION_DAYS): Promise<AIChatMessage[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY_MESSAGES);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as AIChatMessage[];
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return parsed.filter(m => {
      const t = new Date(m.timestamp).getTime();
      return !isNaN(t) && t >= cutoff;
    });
  } catch {
    return [];
  }
}

async function saveMessages(messages: AIChatMessage[]): Promise<void> {
  const pruned = pruneOldMessages(messages);
  await AsyncStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(pruned));
}

async function appendMessage(message: AIChatMessage): Promise<AIChatMessage[]> {
  const existing = await getRecentChatHistory();
  const updated = pruneOldMessages([...existing, message]);
  await saveMessages(updated);
  return updated;
}

export async function deleteChatHistory(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY_MESSAGES);
}

export async function resetRateLimit(): Promise<void> {
  await AsyncStorage.multiRemove([STORAGE_KEY_COUNT, STORAGE_KEY_LAST_RESET]);
}

async function compressPhoto(uri: string): Promise<{ base64: string; mediaType: 'image/jpeg' }> {
  // Resize by width only to preserve aspect ratio (height auto-computed).
  // Spec asked 600x400; using width 600 keeps aspect, prevents distortion,
  // and lands close to 600x400 for typical landscape phone photos.
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: PHOTO_COMPRESS_WIDTH } }],
    {
      compress: PHOTO_COMPRESS_QUALITY,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    },
  );
  if (!result.base64) {
    throw new Error('Photo compression failed');
  }
  return { base64: result.base64, mediaType: 'image/jpeg' };
}

function buildContextPreamble(profile: UserProfile | null): string | null {
  if (!profile) return null;
  const parts: string[] = [];
  if (profile.city) parts.push(`Localisation: ${profile.city}`);
  if (profile.gardeningStyle) parts.push(`Style jardinage: ${profile.gardeningStyle}`);
  if (profile.fertilizerType) parts.push(`Engrais préféré: ${profile.fertilizerType}`);

  // Estimer la saison à partir de la date
  const month = new Date().getMonth() + 1;
  let season = '';
  if (month >= 3 && month <= 5) season = 'printemps';
  else if (month >= 6 && month <= 8) season = 'été';
  else if (month >= 9 && month <= 11) season = 'automne';
  else season = 'hiver';
  parts.push(`Saison: ${season}`);

  if (parts.length === 0) return null;
  return `CONTEXTE UTILISATEUR — ${parts.join(' • ')}\nAdapte tes conseils à ces paramètres automatiquement.`;
}

async function buildAnthropicMessages(
  question: string,
  history: AIChatMessage[],
  photoBase64?: string,
): Promise<AnthropicMessage[]> {
  const messages: AnthropicMessage[] = [];

  // Include only the last 6 messages of history (3 exchanges) to limit token usage.
  const trimmed = history.slice(-6);
  for (const m of trimmed) {
    const content: AnthropicContentBlock[] = [];

    // Add text
    content.push({ type: 'text', text: m.content });

    // Add photo if present (user messages only)
    if (m.role === 'user' && m.photo) {
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/jpeg',
          data: m.photo,
        },
      });
    }

    messages.push({
      role: m.role,
      content: content.length === 1 && content[0].type === 'text' ? m.content : content,
    });
  }

  if (photoBase64) {
    messages.push({
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: 'image/jpeg', data: photoBase64 },
        },
        { type: 'text', text: question },
      ],
    });
  } else {
    messages.push({ role: 'user', content: question });
  }
  return messages;
}

async function callAnthropic(
  messages: AnthropicMessage[],
  systemPrompt: string,
): Promise<string> {
  const apiKey = getApiKey();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30_000);

  let response: Response;
  try {
    response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages,
      }),
      signal: controller.signal,
    });
  } catch (e: any) {
    clearTimeout(timeoutId);
    if (e.name === 'AbortError') {
      throw new Error('TIMEOUT_ERROR');
    }
    throw new Error('NETWORK_ERROR');
  }
  clearTimeout(timeoutId);

  if (!response.ok) {
    let errMsg = `API_ERROR_${response.status}`;
    try {
      const errBody = (await response.json()) as AnthropicResponse;
      if (errBody.error?.message) errMsg = errBody.error.message;
    } catch {
      // ignore JSON parse failure
    }
    throw new Error(errMsg);
  }

  const data = (await response.json()) as AnthropicResponse;
  const textBlock = data.content.find(b => b.type === 'text');
  const text = textBlock?.text?.trim();
  if (!text) {
    throw new Error('EMPTY_RESPONSE');
  }
  return text;
}

export interface SendMessageResult {
  userMessage: AIChatMessage;
  assistantMessage: AIChatMessage;
  history: AIChatMessage[];
  rateLimit: RateLimitStatus;
}

export async function sendMessage(
  question: string,
  photoUri?: string,
  profile?: UserProfile | null,
): Promise<SendMessageResult> {
  const trimmed = question.trim();
  if (trimmed.length === 0 && !photoUri) {
    throw new Error('NO_QUESTION');
  }

  const limit = await checkRateLimit();
  if (!limit.allowed) {
    throw new Error('RATE_LIMIT_EXCEEDED');
  }

  let photoBase64: string | undefined;
  let thumbnailBase64: string | undefined;
  if (photoUri) {
    const compressed = await compressPhoto(photoUri);
    photoBase64 = compressed.base64;
    thumbnailBase64 = compressed.base64;
  }

  const history = await getRecentChatHistory();
  const systemPrompt = buildContextPreamble(profile ?? null)
    ? `${SYSTEM_PROMPT}\n\n${buildContextPreamble(profile ?? null)}`
    : SYSTEM_PROMPT;

  const anthropicMessages = await buildAnthropicMessages(
    trimmed.length > 0 ? trimmed : 'Analyze this plant photo and provide advice.',
    history,
    photoBase64,
  );

  const responseText = await callAnthropic(anthropicMessages, systemPrompt);

  const now = new Date().toISOString();
  const userMessage: AIChatMessage = {
    id: generateMessageId(),
    role: 'user',
    content: trimmed.length > 0 ? trimmed : '(Photo sent)',
    timestamp: now,
    photo: thumbnailBase64,
  };
  const assistantMessage: AIChatMessage = {
    id: generateMessageId(),
    role: 'assistant',
    content: responseText,
    timestamp: new Date().toISOString(),
  };

  await incrementRateLimit();
  const updatedHistory = await appendMessage(userMessage);
  const finalHistory = await appendMessage(assistantMessage);
  const newLimit = await checkRateLimit();

  return {
    userMessage,
    assistantMessage,
    history: finalHistory.length >= updatedHistory.length ? finalHistory : updatedHistory,
    rateLimit: newLimit,
  };
}
