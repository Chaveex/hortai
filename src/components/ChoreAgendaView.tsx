import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, SectionList, SectionListData,
} from 'react-native';
import {
  format, parseISO, addDays, differenceInDays,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { Chore } from '../types/chores';
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import ChoreRow from './ChoreRow';

interface Props {
  chores: Chore[];
  onChorePress: (chore: Chore) => void;
  onComplete: (choreId: string) => void;
  onSkip: (choreId: string) => void;
  onDelete: (choreId: string) => void;
}

type SectionData = SectionListData<Chore, SectionHeader>;

interface SectionHeader {
  title: string;
  subtitle: string;
  isOverdue: boolean;
}

export default function ChoreAgendaView({
  chores,
  onChorePress,
  onComplete,
  onSkip,
  onDelete,
}: Props) {
  const sections = useMemo(() => {
    // Filter only pending chores
    const pendingChores = chores.filter((c) => c.status === 'pending');

    // Group chores by section
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdue: Chore[] = [];
    const todayChores: Chore[] = [];
    const tomorrowChores: Chore[] = [];
    const in3DaysChores: Chore[] = [];
    const in7DaysChores: Chore[] = [];
    const laterChores: Chore[] = [];

    pendingChores.forEach((chore) => {
      const choreDate = parseISO(chore.date);
      choreDate.setHours(0, 0, 0, 0);

      const diffDays = differenceInDays(choreDate, today);

      if (diffDays < 0) {
        overdue.push(chore);
      } else if (diffDays === 0) {
        todayChores.push(chore);
      } else if (diffDays === 1) {
        tomorrowChores.push(chore);
      } else if (diffDays <= 3) {
        in3DaysChores.push(chore);
      } else if (diffDays <= 7) {
        in7DaysChores.push(chore);
      } else {
        laterChores.push(chore);
      }
    });

    // Build sections array
    const sectionsResult: SectionData[] = [];

    // Overdue (sticky red header)
    if (overdue.length > 0) {
      sectionsResult.push({
        title: 'En retard',
        subtitle: `${overdue.length} tâche${overdue.length !== 1 ? 's' : ''}`,
        isOverdue: true,
        data: overdue.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      });
    }

    // Today
    if (todayChores.length > 0) {
      sectionsResult.push({
        title: "Aujourd'hui",
        subtitle: `${todayChores.length} tâche${todayChores.length !== 1 ? 's' : ''}`,
        isOverdue: false,
        data: todayChores,
      });
    }

    // Tomorrow
    if (tomorrowChores.length > 0) {
      sectionsResult.push({
        title: 'Demain',
        subtitle: `${tomorrowChores.length} tâche${tomorrowChores.length !== 1 ? 's' : ''}`,
        isOverdue: false,
        data: tomorrowChores,
      });
    }

    // In 3 days
    if (in3DaysChores.length > 0) {
      const in3Date = addDays(today, 3);
      const dateStr = format(in3Date, 'EEEE d MMMM', { locale: fr });
      sectionsResult.push({
        title: `Dans 3 jours`,
        subtitle: `${in3DaysChores.length} tâche${in3DaysChores.length !== 1 ? 's' : ''} • ${dateStr}`,
        isOverdue: false,
        data: in3DaysChores,
      });
    }

    // In 7 days
    if (in7DaysChores.length > 0) {
      sectionsResult.push({
        title: 'Dans 7 jours',
        subtitle: `${in7DaysChores.length} tâche${in7DaysChores.length !== 1 ? 's' : ''}`,
        isOverdue: false,
        data: in7DaysChores,
      });
    }

    // Later (grouped by week)
    if (laterChores.length > 0) {
      sectionsResult.push({
        title: 'À venir',
        subtitle: `${laterChores.length} tâche${laterChores.length !== 1 ? 's' : ''}`,
        isOverdue: false,
        data: laterChores.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      });
    }

    return sectionsResult;
  }, [chores]);

  const renderSectionHeader = ({
    section,
  }: {
    section: SectionData;
  }) => (
    <View
      style={[
        styles.sectionHeader,
        section.isOverdue && styles.sectionHeaderOverdue,
      ]}
    >
      <View>
        <Text
          style={[
            styles.sectionTitle,
            section.isOverdue && styles.sectionTitleOverdue,
          ]}
        >
          {section.title}
        </Text>
        <Text
          style={[
            styles.sectionSubtitle,
            section.isOverdue && styles.sectionSubtitleOverdue,
          ]}
        >
          {section.subtitle}
        </Text>
      </View>
    </View>
  );

  const renderItem = ({
    item: chore,
  }: {
    item: Chore;
  }) => (
    <ChoreRow
      chore={chore}
      onPress={() => onChorePress(chore)}
      onComplete={() => onComplete(chore.id)}
      onSkip={() => onSkip(chore.id)}
      onDelete={() => onDelete(chore.id)}
    />
  );

  const renderListEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>✓</Text>
      <Text style={styles.emptyTitle}>Aucune tâche en attente</Text>
      <Text style={styles.emptySubtitle}>Vous êtes à jour !</Text>
    </View>
  );

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      stickySectionHeadersEnabled
      ListEmptyComponent={renderListEmpty}
      scrollEnabled
      scrollEventThrottle={16}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator
      bounces={false}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sectionHeader: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionHeaderOverdue: {
    backgroundColor: '#FFEBEE',
    borderBottomColor: '#EF4444',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  sectionTitleOverdue: {
    color: '#C62828',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  sectionSubtitleOverdue: {
    color: '#E53935',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
