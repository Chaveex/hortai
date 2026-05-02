import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { WateringRecommendation, Plant } from '../types';
import { getPlantInfo } from '../constants/plants';
import { colors, spacing, borderRadius } from '../constants/theme';

interface Props {
  recommendations: WateringRecommendation[];
  plants: Plant[];
  onWater: (plantId: string) => void;
}

export default function WateringCard({ recommendations, plants, onWater }: Props) {
  const toWater = recommendations.filter(r => r.shouldWater);

  if (toWater.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.allGoodEmoji}>✅</Text>
        <Text style={styles.allGoodText}>Rien à arroser aujourd'hui !</Text>
        <Text style={styles.allGoodSub}>Vos plants sont bien hydratés.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>💧 À arroser aujourd'hui</Text>
      {toWater.map(rec => {
        const plant = plants.find(p => p.id === rec.plantId);
        if (!plant) return null;
        const info = getPlantInfo(plant.type);
        const urgencyColor = rec.urgency === 'high' ? colors.warning : rec.urgency === 'medium' ? colors.accent : colors.primaryLight;
        return (
          <View key={rec.plantId} style={styles.row}>
            <Text style={styles.plantIcon}>{info.icon}</Text>
            <View style={styles.rowContent}>
              <Text style={styles.plantName}>{plant.name || info.frenchName}</Text>
              <Text style={styles.amount}>{rec.amount.toFixed(1)} L/m²</Text>
            </View>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: urgencyColor }]}
              onPress={() => onWater(rec.plantId)}
            >
              <Text style={styles.btnText}>Fait ✓</Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  plantIcon: {
    fontSize: 24,
  },
  rowContent: {
    flex: 1,
  },
  plantName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  amount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  btn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  allGoodEmoji: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  allGoodText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  allGoodSub: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
});
