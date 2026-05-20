import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '@/store/useStore';
import { colors, spacing, typography } from '@/constants/theme';

export function GardenBedsScreen() {
  const navigation = useNavigation<any>();
  const gardenBeds = useStore(s => s.gardenBeds);
  const deleteGardenBed = useStore(s => s.deleteGardenBed);

  const handleCreateBed = () => {
    navigation.navigate('BedForm');
  };

  const handleBedPress = (bedId: string) => {
    navigation.navigate('BedGrid', { bedId });
  };

  const handleBedLongPress = (bedId: string, bedName: string) => {
    Alert.alert(bedName, 'Que voulez-vous faire ?', [
      {
        text: 'Modifier',
        onPress: () => navigation.navigate('BedForm', { bedId }),
      },
      {
        text: 'Supprimer',
        onPress: () => {
          Alert.alert(
            'Confirmer la suppression',
            `Êtes-vous sûr de vouloir supprimer le bac "${bedName}" ?`,
            [
              { text: 'Annuler', onPress: () => {} },
              {
                text: 'Supprimer',
                onPress: () => deleteGardenBed(bedId),
                style: 'destructive',
              },
            ]
          );
        },
        style: 'destructive',
      },
      { text: 'Annuler', onPress: () => {} },
    ]);
  };

  const handleSowingCalendarPress = () => {
    navigation.navigate('SowingCalendar');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Mes Bacs</Text>
          <Text style={styles.subtitle}>
            {gardenBeds.length} bac{gardenBeds.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <Pressable
          style={styles.calendarButton}
          onPress={handleSowingCalendarPress}
          accessibilityRole="button"
          accessibilityLabel="Calendrier des semis"
          accessibilityHint="Appuyez pour voir le calendrier de semis"
        >
          <Text style={styles.calendarButtonText}>📅 Semis</Text>
        </Pressable>
      </View>

      {gardenBeds.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🌿</Text>
          <Text style={styles.emptyTitle}>Aucun bac créé</Text>
          <Text style={styles.emptyDesc}>
            Créez votre premier bac pour organiser votre jardin
          </Text>
          <Pressable
            style={styles.createButton}
            onPress={handleCreateBed}
          >
            <Text style={styles.createButtonText}>+ Créer un bac</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={gardenBeds}
          keyExtractor={bed => bed.id}
          contentContainerStyle={styles.list}
          renderItem={({ item: bed }) => {
            const plantCount = bed.cells.filter(c => c.plantId).length;
            return (
              <Pressable
                style={styles.bedCard}
                onPress={() => handleBedPress(bed.id)}
                onLongPress={() => handleBedLongPress(bed.id, bed.name)}
              >
                <View style={styles.bedHeader}>
                  <View>
                    <Text style={styles.bedName}>{bed.name}</Text>
                    {bed.location && (
                      <Text style={styles.bedLocation}>📍 {bed.location}</Text>
                    )}
                  </View>
                  <Text style={styles.bedSize}>
                    {bed.rows}×{bed.cols}
                  </Text>
                </View>
                <View style={styles.bedFooter}>
                  <Text style={styles.plantCount}>
                    🌱 {plantCount} plant{plantCount !== 1 ? 's' : ''}
                  </Text>
                  <Text style={styles.cellCount}>
                    {bed.cells.length} cases
                  </Text>
                </View>
              </Pressable>
            );
          }}
        />
      )}

      <Pressable
        style={styles.fab}
        onPress={handleCreateBed}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...typography.h2,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  list: {
    padding: spacing.md,
    gap: spacing.md,
  },
  bedCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  bedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  bedName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  bedLocation: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  bedSize: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    backgroundColor: 'rgba(0, 123, 255, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  bedFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  plantCount: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  cellCount: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  emptyEmoji: {
    fontSize: 56,
  },
  emptyTitle: {
    ...typography.h3,
    textAlign: 'center',
  },
  emptyDesc: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.md,
    left: '50%',
    marginLeft: -28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
  },
  calendarButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  calendarButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
});
