import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import { InsightCard } from './InsightCard';
import { colors, spacing, typography } from '../../constants/theme';

interface Insight {
  id: string;
  title: string;
  description: string;
  type?: 'success' | 'warning' | 'opportunity' | 'info';
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface InsightsListProps {
  insights: Insight[];
  title?: string;
  scrollable?: boolean;
  maxItems?: number;
}

export function InsightsList({
  insights,
  title = 'Insights',
  scrollable = true,
  maxItems,
}: InsightsListProps) {
  const displayInsights = maxItems ? insights.slice(0, maxItems) : insights;

  if (!displayInsights || displayInsights.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Aucun insight disponible</Text>
        </View>
      </View>
    );
  }

  const content = (
    <View style={styles.list}>
      {displayInsights.map(insight => (
        <InsightCard
          key={insight.id}
          title={insight.title}
          description={insight.description}
          type={insight.type}
          icon={insight.icon}
          actionLabel={insight.actionLabel}
          onAction={insight.onAction}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      {scrollable ? (
        <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  title: {
    ...typography.h2,
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
  },
  list: {
    paddingHorizontal: spacing.md,
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
});
