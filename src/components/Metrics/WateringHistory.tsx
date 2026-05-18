import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';

interface WateringEntry {
  date: string;
  amount?: number;
  unit?: string;
}

interface WateringHistoryProps {
  entries: WateringEntry[];
  title?: string;
  maxItems?: number;
}

export function WateringHistory({
  entries,
  title = 'Historique d\'arrosage',
  maxItems = 10,
}: WateringHistoryProps) {
  if (!entries || entries.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Aucun arrosage enregistré</Text>
        </View>
      </View>
    );
  }

  // Sort by date descending (most recent first)
  const sorted = [...entries]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, maxItems);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView
        scrollEnabled={sorted.length > 5}
        style={styles.list}
        nestedScrollEnabled
      >
        {sorted.map((entry, idx) => {
          let displayDate = '';
          try {
            const date = parseISO(entry.date);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - date.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
              displayDate = 'Aujourd\'hui';
            } else if (diffDays === 1) {
              displayDate = 'Hier';
            } else if (diffDays < 7) {
              displayDate = `Il y a ${diffDays} jours`;
            } else {
              displayDate = format(date, 'dd MMM', { locale: fr });
            }
          } catch {
            displayDate = entry.date;
          }

          return (
            <View
              key={idx}
              style={[
                styles.entryRow,
                idx === sorted.length - 1 && styles.entryRowLast,
              ]}
            >
              <View style={styles.entryIcon}>
                <Text style={styles.icon}>💧</Text>
              </View>
              <View style={styles.entryContent}>
                <Text style={styles.entryDate}>{displayDate}</Text>
                {entry.amount && (
                  <Text style={styles.entryAmount}>
                    {entry.amount.toFixed(1)} {entry.unit || 'L'}
                  </Text>
                )}
              </View>
              <Text style={styles.entryTime}>
                {(() => {
                  try {
                    return format(parseISO(entry.date), 'HH:mm');
                  } catch {
                    return '';
                  }
                })()}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginVertical: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    maxHeight: 300,
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  list: {
    flex: 1,
  },
  empty: {
    paddingVertical: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  entryRowLast: {
    borderBottomWidth: 0,
  },
  entryIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 16,
  },
  entryContent: {
    flex: 1,
  },
  entryDate: {
    ...typography.label,
    color: colors.text,
    marginBottom: 2,
  },
  entryAmount: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  entryTime: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
  },
});
