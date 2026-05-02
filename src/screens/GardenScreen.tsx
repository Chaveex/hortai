import React from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import PlantCard from '../components/PlantCard';
import { colors, spacing, borderRadius, typography } from '../constants/theme';

export default function GardenScreen() {
  const navigation = useNavigation<any>();
  const { plants, recommendations, markWatered } = useStore();

  const toWaterCount = recommendations.filter(r => r.shouldWater).length;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Mon Jardin</Text>
          {toWaterCount > 0 && (
            <Text style={styles.subtitle}>
              💧 {toWaterCount} plant{toWaterCount > 1 ? 's' : ''} à arroser
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddPlant')}
        >
          <Text style={styles.addBtnText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      {plants.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🌱</Text>
          <Text style={styles.emptyTitle}>Votre jardin est vide</Text>
          <Text style={styles.emptyDesc}>
            Ajoutez vos plants, semis et légumes pour commencer à recevoir des conseils personnalisés.
          </Text>
          <TouchableOpacity
            style={styles.addBtnLarge}
            onPress={() => navigation.navigate('AddPlant')}
          >
            <Text style={styles.addBtnText}>+ Ajouter mon premier plant</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={plants}
          keyExtractor={p => p.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const rec = recommendations.find(r => r.plantId === item.id);
            return (
              <PlantCard
                plant={item}
                recommendation={rec}
                onPress={() => navigation.navigate('PlantDetail', { plantId: item.id })}
                onWater={() => markWatered(item.id)}
              />
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.sm,
  },
  title: { ...typography.h2 },
  subtitle: { fontSize: 13, color: colors.accent, fontWeight: '500' },
  addBtn: {
    backgroundColor: colors.primary, paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs, borderRadius: borderRadius.full,
  },
  addBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  list: { padding: spacing.md, paddingTop: spacing.xs },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.sm },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { ...typography.h3, textAlign: 'center' },
  emptyDesc: { ...typography.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  addBtnLarge: {
    backgroundColor: colors.primary, paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md, borderRadius: borderRadius.md, marginTop: spacing.sm,
  },
});
