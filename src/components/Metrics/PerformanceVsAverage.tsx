import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Rect, Text as SvgText, Line } from 'react-native-svg';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';

interface PerformanceData {
  plantName: string;
  plantValue: number;
  averageValue: number;
  unit?: string;
}

interface PerformanceVsAverageProps {
  data: PerformanceData[];
  title: string;
  maxValue?: number;
}

export function PerformanceVsAverage({
  data,
  title,
  maxValue,
}: PerformanceVsAverageProps) {
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth - 48, 300);
  const height = 200;
  const padding = 60;
  const barHeight = 30;
  const gap = 10;

  if (!data || data.length === 0) {
    return (
      <View style={[styles.container]}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Aucune donnée</Text>
        </View>
      </View>
    );
  }

  const max = maxValue ?? Math.max(...data.flatMap(d => [d.plantValue, d.averageValue]));

  const yStart = padding;
  const xStart = padding;
  const graphWidth = width - padding * 2;

  const rows = data.map((item, idx) => {
    const yPos = yStart + idx * (barHeight + gap);

    const plantWidth = (item.plantValue / max) * graphWidth;
    const avgWidth = (item.averageValue / max) * graphWidth;

    return {
      yPos,
      plantWidth,
      avgWidth,
      ...item,
    };
  });

  return (
    <View style={[styles.container]}>
      <Text style={styles.title}>{title}</Text>
      <View style={{ alignItems: 'center', overflow: 'hidden' }}>
        <Svg width={width} height={Math.min(height + rows.length * 20, 400)}>
          {rows.map((row, i) => (
          <React.Fragment key={i}>
            {/* Plant value bar */}
            <Rect
              x={xStart}
              y={row.yPos}
              width={row.plantWidth}
              height={barHeight / 2 - 2}
              fill={colors.primary}
              rx="3"
            />

            {/* Average value bar */}
            <Rect
              x={xStart}
              y={row.yPos + barHeight / 2 + 2}
              width={row.avgWidth}
              height={barHeight / 2 - 2}
              fill={colors.secondary}
              rx="3"
            />

            {/* Label */}
            <SvgText
              x={padding - 5}
              y={row.yPos + barHeight / 2}
              fontSize="11"
              fill={colors.text}
              textAnchor="end"
              fontWeight="600"
            >
              {row.plantName}
            </SvgText>

            {/* Value labels */}
            {row.plantWidth > 35 && (
              <SvgText
                x={xStart + row.plantWidth / 2}
                y={row.yPos + barHeight / 4 + 3}
                fontSize="9"
                fill={colors.surface}
                textAnchor="middle"
                fontWeight="600"
              >
                {row.plantValue.toFixed(0)}
              </SvgText>
            )}

            {row.avgWidth > 35 && (
              <SvgText
                x={xStart + row.avgWidth / 2}
                y={row.yPos + (barHeight * 3) / 4 + 3}
                fontSize="9"
                fill={colors.surface}
                textAnchor="middle"
                fontWeight="600"
              >
                {row.averageValue.toFixed(0)}
              </SvgText>
            )}
          </React.Fragment>
        ))}
        </Svg>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendLabel}>Votre récolte</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.secondary }]} />
          <Text style={styles.legendLabel}>Moyenne régionale</Text>
        </View>
      </View>
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
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },
  legend: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.md,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendLabel: {
    ...typography.caption,
    fontSize: 11,
  },
});
