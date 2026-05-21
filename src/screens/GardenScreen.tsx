import React from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import PlantCard from '../components/PlantCard';
import { colors, spacing, borderRadius, typography } from '../constants/theme';

export default function GardenScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { plants, recommendations, markWatered } = useStore();

  const toWaterCount = recommendations.filter(r => r.shouldWater).length;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('garden.title')}</Text>
          {toWaterCount > 0 && (
            <Text style={styles.subtitle}>
              💧 {toWaterCount} plant{toWaterCount > 1 ? 's' : ''} {t('home.watering')}
            </Text>
          )}
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.mapBtn}
            onPress={() => navigation.navigate('Planification')}
          >
            <Text style={styles.mapBtnText}>🗺️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('AddPlant')}
          >
            <Text style={styles.addBtnText}>+ {t('common.add')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {plants.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🌱</Text>
          <Text style={styles.emptyTitle}>{t('garden.noBeds')}</Text>
          <Text style={styles.emptyDesc}>
            {t('garden.emptyDesc')}
          </Text>
          <TouchableOpacity
            style={styles.addBtnLarge}
            onPress={() => navigation.navigate('AddPlant')}
          >
            <Text style={styles.addBtnText}>+ {t('plants.addPlant')}</Text>
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
  headerButtons: {
    flexDirection: 'row', gap: spacing.sm, alignItems: 'center',
  },
  mapBtn: {
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
  },
  mapBtnText: { fontSize: 18 },
  title: { ...typography.h2 },
  subtitle: { fontSize: 13, color: colors.accent, fontWeight: '500' },
  addBtn: {
    backgroundColor: colors.primary, paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs, borderRadius: borderRadius.full,
  },
  addBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  list: { padding: spacing.md, paddingTop: spacing.xs, paddingBottom: spacing.xxl },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.sm },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { ...typography.h3, textAlign: 'center' },
  emptyDesc: { ...typography.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  addBtnLarge: {
    backgroundColor: colors.primary, paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md, borderRadius: borderRadius.md, marginTop: spacing.sm,
  },
});
