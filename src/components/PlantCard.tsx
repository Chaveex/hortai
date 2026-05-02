import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { differenceInDays, parseISO, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plant, WateringRecommendation } from '../types';
import { getPlantInfo, getGrowthStage } from '../constants/plants';
import { colors, spacing, borderRadius, typography } from '../constants/theme';

interface Props {
  plant: Plant;
  recommendation?: WateringRecommendation;
  onPress: () => void;
  onWater: () => void;
}

export default function PlantCard({ plant, recommendation, onPress, onWater }: Props) {
  const info = getPlantInfo(plant.type);
  const daysSincePlanting = differenceInDays(new Date(), parseISO(plant.plantedDate));
  const stage = getGrowthStage(daysSincePlanting, plant.type);
  const shouldWater = recommendation?.shouldWater ?? false;
  const urgency = recommendation?.urgency ?? 'low';
  const wateredToday = plant.lastWatered
    ? format(parseISO(plant.lastWatered), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    : false;

  const urgencyColor = urgency === 'high' ? colors.warning : urgency === 'medium' ? colors.accent : colors.primaryLight;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.card, shouldWater && styles.cardNeedsWater]}>
        <View style={styles.header}>
          <Text style={styles.icon}>{info.icon}</Text>
          <View style={styles.titleBlock}>
            <Text style={styles.name}>{plant.name || info.frenchName}</Text>
            {plant.variety ? <Text style={styles.variety}>{plant.variety}</Text> : null}
            <Text style={styles.stage}>{stage.label}</Text>
          </View>
          {wateredToday ? (
            <View style={styles.waterBtnDone}>
              <Text style={styles.waterBtnTextDone}>✓ Arrosé</Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={onWater}
              style={[
                styles.waterBtn,
                shouldWater
                  ? { backgroundColor: urgencyColor }
                  : styles.waterBtnIdle,
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.waterBtnText, !shouldWater && styles.waterBtnTextIdle]}>
                💧 {shouldWater ? 'Arroser' : 'J\'ai arrosé'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.meta}>
          <MetaItem label="Planté le" value={format(parseISO(plant.plantedDate), 'd MMM yyyy', { locale: fr })} />
          <MetaItem label="Âge" value={`${daysSincePlanting}j`} />
          {plant.lastWatered && (
            <MetaItem
              label="Dernier arrosage"
              value={format(parseISO(plant.lastWatered), 'd MMM', { locale: fr })}
            />
          )}
          {recommendation && (
            <MetaItem
              label="Prochaine eau"
              value={format(parseISO(recommendation.nextWateringDate), 'd MMM', { locale: fr })}
            />
          )}
          <MetaItem
            label="Quantité"
            value={`💧 ${recommendation ? recommendation.amount.toFixed(1) : info.dailyWaterNeed.toFixed(1)} L/m²`}
          />
        </View>

        {recommendation?.shouldWater && (
          <View style={[styles.waterInfo, { borderLeftColor: urgencyColor }]}>
            <Text style={styles.waterAmount}>💧 {recommendation.amount.toFixed(1)} L/m²</Text>
            <Text style={styles.waterReason} numberOfLines={2}>{recommendation.reason}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardNeedsWater: {
    borderColor: colors.accent,
    borderWidth: 1.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  icon: {
    fontSize: 36,
  },
  titleBlock: {
    flex: 1,
  },
  name: {
    ...typography.h3,
    fontSize: 16,
  },
  variety: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  stage: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  waterBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  waterBtnIdle: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  waterBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  waterBtnTextIdle: {
    color: colors.textSecondary,
  },
  waterBtnDone: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success + '20',
    borderWidth: 1,
    borderColor: colors.success,
  },
  waterBtnTextDone: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '600',
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  metaItem: {
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  metaValue: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
  waterInfo: {
    borderLeftWidth: 3,
    paddingLeft: spacing.sm,
    marginTop: spacing.xs,
  },
  waterAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  waterReason: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
