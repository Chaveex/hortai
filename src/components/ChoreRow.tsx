import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Chore, CHORE_TYPE_META, URGENCY_BG } from '../types/chores';
import { colors, spacing, borderRadius } from '../constants/theme';
import { useStore } from '../store/useStore';
import { getPlantInfo } from '../constants/plants';
import ChoreTypeIcon from './ChoreTypeIcon';

interface Props {
  chore: Chore;
  onPress: () => void;
  onComplete: () => void;
  onSkip: () => void;
  onDelete: () => void;
}

export default function ChoreRow({ chore, onPress, onComplete, onSkip, onDelete }: Props) {
  const plants = useStore((s) => s.plants);
  const plant = chore.plantId ? plants.find((p) => p.id === chore.plantId) : undefined;
  const plantInfo = plant ? getPlantInfo(plant.type) : undefined;
  const meta = CHORE_TYPE_META[chore.type];

  const isDone = chore.status === 'completed';
  const isSkipped = chore.status === 'skipped';
  const isInactive = isDone || isSkipped;

  const renderLeftActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [0, 80, 160],
      outputRange: [0, 1, 1],
      extrapolate: 'clamp',
    });
    return (
      <View style={styles.leftActions}>
        <Animated.View style={[styles.actionBtn, { backgroundColor: colors.success, transform: [{ scale }] }]}>
          <TouchableOpacity onPress={onComplete} style={styles.actionTouch}>
            <Text style={styles.actionText}>✓ Fait</Text>
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={[styles.actionBtn, { backgroundColor: colors.textMuted, transform: [{ scale }] }]}>
          <TouchableOpacity onPress={onSkip} style={styles.actionTouch}>
            <Text style={styles.actionText}>↷ Ignorer</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-160, -80, 0],
      outputRange: [1, 1, 0],
      extrapolate: 'clamp',
    });
    return (
      <View style={styles.rightActions}>
        <Animated.View style={[styles.actionBtn, { backgroundColor: colors.primary, transform: [{ scale }] }]}>
          <TouchableOpacity onPress={onPress} style={styles.actionTouch}>
            <Text style={styles.actionText}>Détails</Text>
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={[styles.actionBtn, { backgroundColor: colors.warning, transform: [{ scale }] }]}>
          <TouchableOpacity onPress={onDelete} style={styles.actionTouch}>
            <Text style={styles.actionText}>Suppr.</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const bg = isDone
    ? '#EDF7F1'
    : isSkipped
    ? '#F5F5F5'
    : chore.priority === 'high'
    ? URGENCY_BG.high
    : chore.priority === 'medium'
    ? URGENCY_BG.medium
    : colors.surface;

  return (
    <GestureHandlerRootView>
      <Swipeable
        renderLeftActions={isInactive ? undefined : renderLeftActions}
        renderRightActions={renderRightActions}
        overshootLeft={false}
        overshootRight={false}
      >
        <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
          <View style={[styles.row, { backgroundColor: bg, borderLeftColor: meta.color }]}>
            <ChoreTypeIcon type={chore.type} size={36} />
            <View style={styles.body}>
              <Text
                style={[styles.title, isInactive && styles.titleInactive]}
                numberOfLines={1}
              >
                {chore.title}
              </Text>
              <View style={styles.metaRow}>
                {plantInfo && (
                  <Text style={styles.metaPlant} numberOfLines={1}>
                    {plantInfo.icon} {plant?.name || plantInfo.frenchName}
                  </Text>
                )}
                {chore.source === 'custom' && (
                  <View style={styles.tagCustom}>
                    <Text style={styles.tagCustomText}>Custom</Text>
                  </View>
                )}
                {chore.priority === 'high' && !isInactive && (
                  <View style={styles.tagHigh}>
                    <Text style={styles.tagHighText}>!</Text>
                  </View>
                )}
              </View>
              {chore.description && !isInactive && (
                <Text style={styles.desc} numberOfLines={1}>
                  {chore.description}
                </Text>
              )}
            </View>
            <View style={styles.statusZone}>
              {isDone && <Text style={styles.statusDone}>✓</Text>}
              {isSkipped && <Text style={styles.statusSkipped}>↷</Text>}
              {!isInactive && <Text style={styles.chev}>›</Text>}
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  body: { flex: 1, gap: 2 },
  title: { fontSize: 14, fontWeight: '600', color: colors.text },
  titleInactive: { textDecorationLine: 'line-through', color: colors.textMuted },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  metaPlant: { fontSize: 12, color: colors.textSecondary },
  desc: { fontSize: 12, color: colors.textMuted },
  tagCustom: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: borderRadius.full,
  },
  tagCustomText: { fontSize: 10, color: colors.primary, fontWeight: '600' },
  tagHigh: {
    backgroundColor: colors.warning,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagHighText: { fontSize: 11, color: '#FFF', fontWeight: '700' },
  statusZone: { alignItems: 'center', justifyContent: 'center', width: 24 },
  chev: { fontSize: 22, color: colors.textMuted },
  statusDone: { fontSize: 18, color: colors.success, fontWeight: '700' },
  statusSkipped: { fontSize: 18, color: colors.textMuted },
  leftActions: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  rightActions: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  actionBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderRadius: borderRadius.sm,
    marginHorizontal: 2,
  },
  actionTouch: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xs },
  actionText: { color: '#FFF', fontWeight: '700', fontSize: 12, textAlign: 'center' },
});
