import { useTranslation } from 'react-i18next';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { borderRadius, colors, spacing, typography } from '../constants/theme';
import { AIChatMessage as AIChatMessageType, RateLimitStatus } from '../types';
import { useStore } from '../store/useStore';
import {
  checkRateLimit,
  deleteChatHistory,
  resetRateLimit,
  getRecentChatHistory,
  sendMessage,
} from '../services/aiChat';
import UserMessage from '../components/AIChat/UserMessage';
import AIChatMessage from '../components/AIChat/AIChatMessage';
import PhotoPreview from '../components/AIChat/PhotoPreview';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function AIChatModal({ visible, onClose }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const profile = useStore(s => s.profile);
  const setAIChatMessages = useStore(s => s.setAIChatMessages);
  const setAIChatRateLimit = useStore(s => s.setAIChatRateLimit);

  const [messages, setMessages] = useState<AIChatMessageType[]>([]);
  const [inputText, setInputText] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimit, setRateLimit] = useState<RateLimitStatus | null>(null);
  const [lastAttempt, setLastAttempt] = useState<{ question: string; photoUri: string | null } | null>(null);

  const scrollRef = useRef<ScrollView | null>(null);

  const loadState = useCallback(async () => {
    try {
      const [history, limit] = await Promise.all([
        getRecentChatHistory(),
        checkRateLimit(),
      ]);
      setMessages(history);
      setRateLimit(limit);
      setAIChatMessages(history);
      setAIChatRateLimit(limit);
    } catch (e: any) {
      setError(e?.message ?? 'Erreur de chargement.');
    }
  }, [setAIChatMessages, setAIChatRateLimit]);

  useEffect(() => {
    if (visible) {
      loadState();
      setError(null);
    }
  }, [visible, loadState]);

  useEffect(() => {
    if (visible && messages.length > 0) {
      const id = setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 80);
      return () => clearTimeout(id);
    }
    return;
  }, [messages, visible]);

  async function handlePickPhoto() {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(t('aiChat.permissionPhoto'), t('aiChat.permissionPhotoDesc'));
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: false,
        exif: false,
      });
      if (!result.canceled && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (e: any) {
      setError(e?.message ?? 'Erreur sélection photo.');
    }
  }

  async function handleTakePhoto() {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(t('aiChat.permissionCamera'), t('aiChat.permissionCameraDesc'));
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: false,
        exif: false,
      });
      if (!result.canceled && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (e: any) {
      setError(e?.message ?? 'Erreur caméra.');
    }
  }

  function promptPhotoSource() {
    Alert.alert(
      t('aiChat.addPhoto'),
      'Choisissez une source',
      [
        { text: 'Caméra', onPress: handleTakePhoto },
        { text: 'Galerie', onPress: handlePickPhoto },
        { text: t('common.cancel'), style: 'cancel' },
      ],
      { cancelable: true },
    );
  }

  async function handleSend() {
    if (isLoading) return;
    const trimmed = inputText.trim();
    if (trimmed.length === 0 && !photoUri) return;
    if (rateLimit && !rateLimit.allowed) return;

    setLastAttempt({ question: trimmed, photoUri: photoUri ?? null });
    setError(null);
    setIsLoading(true);
    try {
      const result = await sendMessage(trimmed, photoUri ?? undefined, profile);
      setMessages(result.history);
      setRateLimit(result.rateLimit);
      setAIChatMessages(result.history);
      setAIChatRateLimit(result.rateLimit);
      setInputText('');
      setPhotoUri(null);
      setLastAttempt(null);
    } catch (e: any) {
      setError(e?.message ?? 'Erreur inconnue.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleClearHistory() {
    Alert.alert(
      t('aiChat.clear'),
      'Supprimer tous les messages de chat ?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            await deleteChatHistory();
            await resetRateLimit();
            const newLimit = await checkRateLimit();
            setMessages([]);
            setAIChatMessages([]);
            setRateLimit(newLimit);
            setAIChatRateLimit(newLimit);
          },
        },
      ],
    );
  }

  const limitHit = !!rateLimit && !rateLimit.allowed;
  const remaining = rateLimit?.remaining ?? 3;
  const used = 3 - remaining;
  const resetsAt = rateLimit ? formatResetTime(rateLimit.resetsAt) : '';

  const canSend = !isLoading && !limitHit && (inputText.trim().length > 0 || photoUri !== null);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent={false}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>{t('aiChat.title')}</Text>
            <Text style={styles.headerSub}>
              {used}/3 question{used > 1 ? 's' : ''} utilisée{used > 1 ? 's' : ''} aujourd'hui
            </Text>
          </View>
          <View style={styles.headerRight}>
            {messages.length > 0 && (
              <TouchableOpacity onPress={handleClearHistory} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.clearBtn}>{t('common.clear')}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {limitHit && (
          <View style={styles.limitBanner}>
            <Text style={styles.limitText}>{t('aiChat.limitReached', { time: resetsAt })}</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorBanner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              {lastAttempt && (
                <TouchableOpacity onPress={() => {
                  setError(null);
                  handleSend();
                }}>
                  <Text style={styles.retryButton}>{t('common.retry')}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => setError(null)}>
                <Text style={styles.errorDismiss}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <KeyboardAvoidingView
          style={styles.kbWrap}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 20 : 0}
        >
          <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {messages.length === 0 && !isLoading && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🌱</Text>
                <Text style={styles.emptyTitle}>Posez votre question</Text>
                <Text style={styles.emptyText}>
                  Maladies, arrosage, taille, semis, associations… Joignez une photo pour un diagnostic visuel.
                </Text>
                <Text style={styles.emptyLimit}>3 questions par jour (réinitialisé à minuit UTC).</Text>
              </View>
            )}
            {messages.map(m =>
              m.role === 'user'
                ? <UserMessage key={m.id} message={m} />
                : <AIChatMessage key={m.id} message={m} />,
            )}
            {isLoading && (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={colors.primary} />
                <Text style={styles.loadingText}>Le botaniste réfléchit…</Text>
              </View>
            )}
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: Math.max(spacing.sm, insets.bottom) }]}>
            {photoUri && (
              <View style={styles.photoPreviewRow}>
                <PhotoPreview source={photoUri} onRemove={() => setPhotoUri(null)} size={64} />
                <Text style={styles.photoLabel}>Photo prête à envoyer</Text>
              </View>
            )}
            <View style={styles.inputRow}>
              <TouchableOpacity
                style={[styles.iconBtn, (limitHit || isLoading) && styles.iconBtnDisabled]}
                onPress={promptPhotoSource}
                disabled={limitHit || isLoading}
                accessibilityLabel="Joindre une photo"
              >
                <Text style={styles.iconBtnText}>📷</Text>
              </TouchableOpacity>
              <TextInput
                style={[styles.input, limitHit && styles.inputDisabled]}
                placeholder={limitHit ? 'Limite atteinte' : 'Votre question…'}
                placeholderTextColor={colors.textMuted}
                value={inputText}
                onChangeText={setInputText}
                multiline
                editable={!limitHit && !isLoading}
                maxLength={1000}
              />
              <TouchableOpacity
                style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
                onPress={handleSend}
                disabled={!canSend}
                accessibilityLabel="Envoyer"
              >
                {isLoading
                  ? <ActivityIndicator color="#FFFFFF" size="small" />
                  : <Text style={styles.sendBtnText}>➤</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

function formatResetTime(iso: string): string {
  try {
    return format(parseISO(iso), "d MMM 'à' HH'h'mm", { locale: fr });
  } catch {
    return 'minuit UTC';
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerLeft: { flex: 1 },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerTitle: { ...typography.h3 },
  headerSub: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  clearBtn: { fontSize: 13, color: colors.warning, fontWeight: '500' },
  closeBtn: { fontSize: 20, color: colors.text, fontWeight: '600' },
  limitBanner: {
    backgroundColor: '#FFE4E1',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.warning,
  },
  limitText: { color: colors.error, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE4E1',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  errorText: { flex: 1, color: colors.error, fontSize: 13 },
  retryButton: { color: colors.primary, fontSize: 13, fontWeight: '600', paddingVertical: 2 },
  errorDismiss: { color: colors.error, fontSize: 16, fontWeight: '700' },
  kbWrap: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingVertical: spacing.md, flexGrow: 1 },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { ...typography.h3 },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyLimit: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  loadingText: { fontSize: 13, color: colors.textSecondary, fontStyle: 'italic' },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
  },
  photoPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.sm,
  },
  photoLabel: { fontSize: 12, color: colors.textSecondary },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBtnDisabled: { opacity: 0.5 },
  iconBtnText: { fontSize: 18 },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    fontSize: 14,
    color: colors.text,
  },
  inputDisabled: { opacity: 0.5 },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: colors.textMuted, opacity: 0.6 },
  sendBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
});
