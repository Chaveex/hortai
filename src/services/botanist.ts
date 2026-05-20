import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImageManipulator from 'expo-image-manipulator';
import { BotanistMessage, UserProfile, Plant } from '../types';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const MODEL = 'claude-haiku-4-5-20251001';
const MAX_TOKENS = 1024;
const DAILY_LIMIT = 5;
const MAX_HISTORY_MESSAGES = 50;
const PHOTO_COMPRESS_WIDTH = 600;
const PHOTO_COMPRESS_QUALITY = 0.6;

const STORAGE_KEY_MESSAGES = 'botanist_messages';
const STORAGE_KEY_COUNT = 'botanist_questionCount';
const STORAGE_KEY_LAST_RESET = 'botanist_lastReset';

// System prompts (multilingual)
const SYSTEM_PROMPTS = {
  fr: `Tu es un botaniste expert en jardinage durable et régional.
Tu fournis des conseils pratiques, spécifiques à {region}, style {style}, et aux plantes suivantes: {plants}.
Réponds en français avec clarté, humour bienveillant, et actionabilité.
Si l'utilisateur envoie une photo, identifie la plante et diagnose les problèmes visibles.
Tes réponses doivent être concises (max 200 mots) et priorisées par urgence.`,

  en: `You are an expert botanist in sustainable, regional gardening.
Provide practical, specific advice for {region}, style {style}, and these plants: {plants}.
Respond in English with clarity, kind humor, and actionability.
If the user sends a photo, identify the plant and diagnose visible issues.
Keep responses concise (max 200 words) and prioritize by urgency.`,

  es: `Eres un botánico experto en jardinería sostenible y regional.
Proporciona consejos prácticos específicos para {region}, estilo {style}, y estas plantas: {plants}.
Responde en español con claridad, humor amable, y accionabilidad.
Si el usuario envía una foto, identifica la planta y diagnostica problemas visibles.
Mantén respuestas concisas (máx. 200 palabras) y prioriza por urgencia.`,
};

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
    throw new Error('Clé API Anthropic manquante. Configurez EXPO_PUBLIC_ANTHROPIC_API_KEY dans .env');
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

export async function checkBotanistRateLimit(): Promise<{
  allowed: boolean;
  remaining: number;
  resetsAt: string;
}> {
  await ensureFreshCounter();
  const countStr = await AsyncStorage.getItem(STORAGE_KEY_COUNT);
  const count = parseInt(countStr || '0', 10);
  const lastResetStr = await AsyncStorage.getItem(STORAGE_KEY_LAST_RESET);
  const nextReset = new Date(lastResetStr || new Date().toISOString());
  nextReset.setUTCDate(nextReset.getUTCDate() + 1);

  return {
    allowed: count < DAILY_LIMIT,
    remaining: Math.max(0, DAILY_LIMIT - count),
    resetsAt: nextReset.toISOString(),
  };
}

async function incrementBotanistCounter(): Promise<void> {
  await ensureFreshCounter();
  const countStr = await AsyncStorage.getItem(STORAGE_KEY_COUNT);
  const count = parseInt(countStr || '0', 10);
  await AsyncStorage.setItem(STORAGE_KEY_COUNT, String(count + 1));
}

async function compressImage(uri: string): Promise<string> {
  try {
    const result = await ImageManipulator.manipulateAsync(uri, [
      { resize: { width: PHOTO_COMPRESS_WIDTH } },
    ], {
      compress: PHOTO_COMPRESS_QUALITY,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    });
    return result.base64 || '';
  } catch (e) {
    console.warn('Image compression failed:', e);
    return '';
  }
}

export async function sendBotanistMessage(
  message: string,
  photoUri?: string,
  profile?: UserProfile,
  plants?: Plant[]
): Promise<string> {
  // Check rate limit
  const limit = await checkBotanistRateLimit();
  if (!limit.allowed) {
    throw new Error(`Limite quotidienne atteinte (5 questions/jour). Réinitialisation à ${new Date(limit.resetsAt).toLocaleTimeString()}`);
  }

  const language = (profile?.language || 'fr') as 'fr' | 'en' | 'es';
  const plantNames = plants?.map(p => p.name).join(', ') || 'aucune';

  // Build system prompt with context
  let systemPrompt = SYSTEM_PROMPTS[language] || SYSTEM_PROMPTS.fr;
  systemPrompt = systemPrompt
    .replace('{region}', profile?.city || 'votre région')
    .replace('{style}', profile?.gardeningStyle || 'permaculture')
    .replace('{plants}', plantNames);

  // Build messages array
  const contentBlocks: AnthropicContentBlock[] = [
    { type: 'text', text: message },
  ];

  if (photoUri) {
    const base64Data = await compressImage(photoUri);
    if (base64Data) {
      contentBlocks.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/jpeg',
          data: base64Data,
        },
      });
    }
  }

  // Load chat history for context
  const history = await getBotanistChatHistory();
  const messages: AnthropicMessage[] = history.map(m => ({
    role: m.role,
    content: m.text,
  }));
  messages.push({
    role: 'user',
    content: contentBlocks,
  });

  // Call Anthropic API
  const apiKey = getApiKey();
  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    const errorMsg = error.error?.message || 'Erreur API Anthropic inconnue';
    throw new Error(`Erreur API: ${errorMsg}`);
  }

  const data: AnthropicResponse = await response.json();
  if (data.error) {
    throw new Error(`Erreur API: ${data.error.message}`);
  }

  const assistantMessage = data.content[0]?.text || 'Pas de réponse';

  // Save to history
  const userMsg: BotanistMessage = {
    id: generateMessageId(),
    role: 'user',
    text: message,
    timestamp: new Date().toISOString(),
    photo: photoUri ? await compressImage(photoUri) : undefined,
  };

  const assistantMsg: BotanistMessage = {
    id: generateMessageId(),
    role: 'assistant',
    text: assistantMessage,
    timestamp: new Date().toISOString(),
  };

  await addBotanistMessage(userMsg);
  await addBotanistMessage(assistantMsg);

  // Increment counter
  await incrementBotanistCounter();

  return assistantMessage;
}

export async function addBotanistMessage(message: BotanistMessage): Promise<void> {
  const history = await getBotanistChatHistory();
  const updated = [message, ...history].slice(0, MAX_HISTORY_MESSAGES);
  await AsyncStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(updated));
}

export async function getBotanistChatHistory(): Promise<BotanistMessage[]> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY_MESSAGES);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export async function clearBotanistHistory(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY_MESSAGES);
}

export async function resetBotanistRateLimit(): Promise<void> {
  const today = todayUTC();
  await AsyncStorage.multiSet([
    [STORAGE_KEY_COUNT, '0'],
    [STORAGE_KEY_LAST_RESET, today],
  ]);
}
