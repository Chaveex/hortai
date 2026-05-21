import React from 'react';
import { useTranslation } from 'react-i18next';
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
import { differenceInDays, parseISO, format } from 'date-fns';
import { getDateLocale } from '../utils/dateLocale';

export function GardenBedsScreen() {
  const { t, i18n } = useTranslation();
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
    Alert.alert(bedName, t('garden.bedActions'), [
      {
        text: t('garden.editBedAction'),
        onPress: () => navigation.navigate('BedForm', { bedId }),
      },
      {
        text: t('garden.deleteBedAction'),
        onPress: () => {
          Alert.alert(
            t('garden.confirmDelete'),
            t('garden.confirmDeleteBed', { name: bedName }),
            [
              { text: t('garden.cancelAction'), onPress: () => {} },
              {
                text: t('garden.deleteBedAction'),
                onPress: () => deleteGardenBed(bedId),
                style: 'destructive',
              },
            ]
          );
        },
        style: 'destructive',
      },
      { text: t('garden.cancelAction'), onPress: () => {} },
    ]);
  };

  const handleSowingCalendarPress = () => {
    navigation.navigate('SowingCalendar');
  };

  const handleBedSettings = (bedId: string) => {
    navigation.navigate('BedSettings', { bedId });
  };

  const formatLastPrepared = (date: string): string => {
    const d = parseISO(date);
    const daysDiff = differenceInDays(new Date(), d);

    if (daysDiff === 0) return t('garden.today');
    if (daysDiff === 1) return t('garden.yesterday');
    if (daysDiff < 7) return t('garden.daysAgo', { days: daysDiff });
    if (daysDiff < 30) return t('garden.weeksAgo', { weeks: Math.floor(daysDiff / 7) });
    if (daysDiff < 365) return t('garden.monthsAgo', { months: Math.floor(daysDiff / 30) });
    return t('garden.yearsAgo', { years: Math.floor(daysDiff / 365) });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{t('garden.myBeds')}</Text>
          <Text style={styles.subtitle}>
            {t('garden.bedCount', { count: gardenBeds.length })}
          </Text>
        </View>
        <Pressable
          style={styles.calendarButton}
          onPress={handleSowingCalendarPress}
          accessibilityRole="button"
          accessibilityLabel={t('garden.sowingCalendar')}
          accessibilityHint={t('garden.sowingCalendarHint')}
        >
          <Text style={styles.calendarButtonText}>📅 {t('sowing.title')}</Text>
        </Pressable>
      </View>

      {gardenBeds.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🌿</Text>
          <Text style={styles.emptyTitle}>{t('garden.noBedCreated')}</Text>
          <Text style={styles.emptyDesc}>
            {t('garden.noBedDesc')}
          </Text>
          <Pressable
            style={styles.createButton}
            onPress={handleCreateBed}
          >
            <Text style={styles.createButtonText}>{t('garden.createBed')}</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={gardenBeds}
          keyExtractor={bed => bed.id}
          contentContainerStyle={styles.list}
          renderItem={({ item: bed }) => {
            const plantCount = bed.cells.filter(c => c.plantId).length;
            const area = bed.dimensions
              ? `${(bed.dimensions.length * bed.dimensions.width).toFixed(1)} ${bed.dimensions.unit === 'm' ? 'm²' : 'sq ft'}`
              : null;

            return (
              <Pressable
                style={styles.bedCard}
                onPress={() => handleBedPress(bed.id)}
                onLongPress={() => handleBedLongPress(bed.id, bed.name)}
              >
                <View style={styles.bedHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bedName}>{bed.name}</Text>
                    {bed.location && (
                      <Text style={styles.bedLocation}>📍 {bed.location}</Text>
                    )}
                  </View>
                  <Pressable
                    style={styles.settingsButton}
                    onPress={() => handleBedSettings(bed.id)}
                    accessibilityRole="button"
                    accessibilityLabel={t('garden.manageGardenBed')}
                  >
                    <Text style={styles.settingsButtonText}>⚙️</Text>
                  </Pressable>
                </View>

                {/* Bed Metadata Info Card */}
                {(area || bed.soilType || bed.lastPrepared) && (
                  <View style={styles.metadataCard}>
                    {area && (
                      <View style={styles.metadataItem}>
                        <Text style={styles.metadataLabel}>Dimensions</Text>
                        <Text style={styles.metadataValue}>{area}</Text>
                      </View>
                    )}
                    {bed.soilType && (
                      <View style={styles.metadataItem}>
                        <Text style={styles.metadataLabel}>Sol</Text>
                        <View style={styles.soilBadge}>
                          <Text style={styles.soilBadgeText}>
                            {bed.soilType === 'loam'
                              ? 'Terreau'
                              : bed.soilType === 'clay'
                              ? 'Argileux'
                              : bed.soilType === 'sandy'
                              ? 'Sablonneux'
                              : 'Mixte'}
                          </Text>
                        </View>
                      </View>
                    )}
                    {bed.lastPrepared && (
                      <View style={styles.metadataItem}>
                        <Text style={styles.metadataLabel}>Préparation</Text>
                        <Text style={styles.metadataValue}>
                          {formatLastPrepared(bed.lastPrepared)}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Crop Rotation Badge */}
                {bed.cropRotation && bed.cropRotation.length > 0 && (
                  <View style={styles.rotationBadge}>
                    <Text style={styles.rotationText}>
                      🔄 {bed.cropRotation.length} culture{bed.cropRotation.length !== 1 ? 's' : ''} enregistrée{bed.cropRotation.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                )}

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
    gap: spacing.sm,
  },
  settingsButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButtonText: {
    fontSize: 18,
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
  metadataCard: {
    backgroundColor: 'rgba(45, 106, 79, 0.05)',
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metadataItem: {
    flex: 1,
    minWidth: '30%',
  },
  metadataLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  metadataValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
  },
  soilBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  soilBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  rotationBadge: {
    backgroundColor: 'rgba(212, 160, 23, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    marginBottom: spacing.sm,
    borderLeftWidth: 2,
    borderLeftColor: colors.accent,
  },
  rotationText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
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
