import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
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
import { BotanistMessage } from '../types';
import { useStore } from '../store/useStore';
import {
  checkBotanistRateLimit,
  clearBotanistHistory,
  getBotanistChatHistory,
  sendBotanistMessage,
} from '../services/botanist';
import BotanistMessageComponent from '../components/Botanist/BotanistMessageComponent';
import UserMessageComponent from '../components/Botanist/UserMessageComponent';

interface Props {
  visible: boolean;
  onClose: () => void;
  context?: string; // Optional context like 'plant:tomatoId' or 'chore:choreId'
}

export default function BotanistModal({ visible, onClose, context }: Props) {
  const insets = useSafeAreaInsets();
  const profile = useStore(s => s.profile);
  const plants = useStore(s => s.plants);
  const setBotanistMessages = useStore(s => s.setBotanistMessages);
  const setBotanistRateLimit = useStore(s => s.setBotanistRateLimit);

  const [messages, setMessages] = useState<BotanistMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimit, setRateLimit] = useState<{ allowed: boolean; remaining: number; resetsAt: string } | null>(null);

  const scrollRef = useRef<ScrollView | null>(null);

  const loadState = useCallback(async () => {
    try {
      const [history, limit] = await Promise.all([
        getBotanistChatHistory(),
        checkBotanistRateLimit(),
      ]);
      setMessages(history.reverse());
      setRateLimit(limit);
      setBotanistMessages(history);
      setBotanistRateLimit({
        allowed: limit.allowed,
        remaining: limit.remaining,
        resetsAt: limit.resetsAt,
      });
    } catch (e: any) {
      setError(e?.message ?? 'Erreur de chargement.');
    }
  }, [setBotanistMessages, setBotanistRateLimit]);

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
        Alert.alert('Permission requise', 'Autorisez l\'accès aux photos pour joindre une image.');
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
        Alert.alert('Permission requise', 'Autorisez l\'accès à la caméra pour prendre une photo.');
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
      'Ajouter une photo',
      'Choisissez une source',
      [
        { text: 'Caméra', onPress: handleTakePhoto },
        { text: 'Galerie', onPress: handlePickPhoto },
        { text: 'Annuler', style: 'cancel' },
      ],
      { cancelable: true },
    );
  }

  async function handleSend() {
    if (isLoading) return;
    const trimmed = inputText.trim();
    if (trimmed.length === 0 && !photoUri) return;
    if (rateLimit && !rateLimit.allowed) return;

    setError(null);
    setIsLoading(true);

    try {
      const response = await sendBotanistMessage(
        trimmed,
        photoUri || undefined,
        profile || undefined,
        plants
      );

      // Add user message
      const userMsg: BotanistMessage = {
        id: Math.random().toString(36).slice(2, 11) + Date.now().toString(36),
        role: 'user',
        text: trimmed,
        timestamp: new Date().toISOString(),
      };

      // Add assistant response
      const assistantMsg: BotanistMessage = {
        id: Math.random().toString(36).slice(2, 11) + Date.now().toString(36),
        role: 'assistant',
        text: response,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, userMsg, assistantMsg]);
      setInputText('');
      setPhotoUri(null);

      // Refresh rate limit
      const newLimit = await checkBotanistRateLimit();
      setRateLimit(newLimit);
    } catch (e: any) {
      setError(e?.message ?? 'Erreur lors de l\'envoi du message.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleClearHistory() {
    Alert.alert(
      'Supprimer l\'historique',
      'Êtes-vous sûr de vouloir supprimer tous les messages?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearBotanistHistory();
              setMessages([]);
              setBotanistMessages([]);
            } catch (e) {
              setError('Erreur lors de la suppression.');
            }
          },
        },
      ]
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <SafeAreaView edges={['right', 'left']} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🌱 Botaniste</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>

        {/* Error Banner */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Rate limit warning */}
        {rateLimit && !rateLimit.allowed && (
          <View style={styles.rateLimitBanner}>
            <Text style={styles.rateLimitText}>
              Limite atteinte (5/jour). Réinitialisation à minuit UTC.
            </Text>
          </View>
        )}

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🌱</Text>
              <Text style={styles.emptyStateTitle}>Bienvenue!</Text>
              <Text style={styles.emptyStateText}>
                Posez une question au botaniste pour des conseils personnalisés.
              </Text>
            </View>
          )}
          {messages.map((msg) =>
            msg.role === 'user' ? (
              <UserMessageComponent key={msg.id} message={msg} />
            ) : (
              <BotanistMessageComponent key={msg.id} message={msg} />
            )
          )}
          {isLoading && (
            <View style={styles.typingIndicator}>
              <Text style={styles.typingText}>Botaniste réfléchit...</Text>
              <ActivityIndicator color={colors.primary} />
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inputArea}
        >
          {photoUri && (
            <View style={styles.photoPreview}>
              <Text style={styles.photoPreviewText}>📸 Photo attachée</Text>
              <Pressable onPress={() => setPhotoUri(null)}>
                <Text style={styles.photoRemoveText}>✕</Text>
              </Pressable>
            </View>
          )}
          <View style={styles.inputRow}>
            <Pressable
              onPress={promptPhotoSource}
              style={styles.photoButton}
              disabled={isLoading || !rateLimit?.allowed}
            >
              <Text style={styles.photoButtonText}>📸</Text>
            </Pressable>
            <TextInput
              style={styles.input}
              placeholder="Votre question..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              editable={!isLoading && rateLimit?.allowed}
              placeholderTextColor={colors.textMuted}
            />
            <Pressable
              onPress={handleSend}
              style={[
                styles.sendButton,
                (!rateLimit?.allowed || (inputText.trim().length === 0 && !photoUri) || isLoading) &&
                  styles.sendButtonDisabled,
              ]}
              disabled={
                isLoading ||
                !rateLimit?.allowed ||
                (inputText.trim().length === 0 && !photoUri)
              }
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.sendButtonText}>►</Text>
              )}
            </Pressable>
          </View>
          <Pressable onPress={handleClearHistory} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Effacer l'historique</Text>
          </Pressable>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: spacing.xs,
  },
  closeText: {
    fontSize: 24,
    color: colors.textMuted,
  },
  errorBanner: {
    backgroundColor: '#FFE5E5',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomColor: colors.error,
    borderBottomWidth: 1,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    fontSize: 14,
  },
  rateLimitBanner: {
    backgroundColor: '#FFF3CD',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomColor: '#FFA500',
    borderBottomWidth: 1,
  },
  rateLimitText: {
    ...typography.body,
    color: '#CC8500',
    fontSize: 14,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyStateTitle: {
    ...typography.h2,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  emptyStateText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  typingIndicator: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  typingText: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  inputArea: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#FAFAFA',
  },
  photoPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  photoPreviewText: {
    ...typography.body,
    color: colors.primary,
    fontSize: 13,
  },
  photoRemoveText: {
    fontSize: 16,
    color: colors.primary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  photoButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoButtonText: {
    fontSize: 18,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minHeight: 40,
    maxHeight: 100,
    ...typography.body,
    fontSize: 14,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.textMuted,
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  clearButton: {
    paddingVertical: spacing.xs,
  },
  clearButtonText: {
    ...typography.body,
    color: colors.textMuted,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});
