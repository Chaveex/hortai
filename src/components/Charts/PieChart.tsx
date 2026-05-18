import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';

export interface PieChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: PieChartDataPoint[];
  title: string;
  unit?: string;
  size?: number;
  showLegend?: boolean;
  donut?: boolean;
}

const DEFAULT_COLORS = [
  colors.primary,
  colors.secondary,
  colors.accent,
  colors.warning,
  colors.success,
  colors.primaryLight,
];

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M', x, y,
    'L', start.x, start.y,
    'A', radius, radius, 0, largeArc, 0, end.x, end.y,
    'Z',
  ].join(' ');
}

export function PieChart({
  data,
  title,
  unit = '',
  size = 200,
  showLegend = true,
  donut = false,
}: PieChartProps) {
  const width = Dimensions.get('window').width - spacing.lg * 2;

  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Aucune donnée</Text>
        </View>
      </View>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Aucune donnée</Text>
        </View>
      </View>
    );
  }

  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 10;
  const donutInnerRadius = donut ? radius * 0.6 : 0;

  let currentAngle = 0;
  const slices = data.map((d, i) => {
    const sliceAngle = (d.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    const color = d.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length];

    const path = donut
      ? describeArcDonut(cx, cy, radius, donutInnerRadius, startAngle, endAngle)
      : describeArc(cx, cy, radius, startAngle, endAngle);

    // Label position (middle of arc)
    const midAngle = startAngle + sliceAngle / 2;
    const labelRadius = radius * 0.65;
    const labelPos = polarToCartesian(cx, cy, labelRadius, midAngle);

    currentAngle = endAngle;

    return {
      path,
      color,
      label: d.label,
      value: d.value,
      percentage: ((d.value / total) * 100).toFixed(0),
      labelX: labelPos.x,
      labelY: labelPos.y,
    };
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.content}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {slices.map((slice, i) => (
            <Path
              key={`slice-${i}`}
              d={slice.path}
              fill={slice.color}
              opacity="0.85"
            />
          ))}

          {/* Center circle for donut */}
          {donut && (
            <Circle
              cx={cx}
              cy={cy}
              r={donutInnerRadius}
              fill={colors.surface}
            />
          )}

          {/* Labels */}
          {slices.map((slice, i) => {
            const percentage = parseFloat(slice.percentage);
            if (percentage < 8) return null; // Skip small slices
            return (
              <SvgText
                key={`label-${i}`}
                x={slice.labelX}
                y={slice.labelY}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill={colors.surface}
              >
                {slice.percentage}%
              </SvgText>
            );
          })}
        </Svg>

        {/* Legend */}
        {showLegend && (
          <View style={styles.legend}>
            {slices.map((slice, i) => (
              <View key={`legend-${i}`} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: slice.color }]} />
                <View style={styles.legendLabel}>
                  <Text style={styles.legendName}>{slice.label}</Text>
                  <Text style={styles.legendValue}>
                    {slice.value.toFixed(1)}{unit}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

// Helper for donut arc
function describeArcDonut(
  x: number,
  y: number,
  radius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number
) {
  const outerStart = polarToCartesian(x, y, radius, endAngle);
  const outerEnd = polarToCartesian(x, y, radius, startAngle);
  const innerStart = polarToCartesian(x, y, innerRadius, endAngle);
  const innerEnd = polarToCartesian(x, y, innerRadius, startAngle);

  const largeArc = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M', outerStart.x, outerStart.y,
    'A', radius, radius, 0, largeArc, 0, outerEnd.x, outerEnd.y,
    'L', innerEnd.x, innerEnd.y,
    'A', innerRadius, innerRadius, 0, largeArc, 1, innerStart.x, innerStart.y,
    'Z',
  ].join(' ');
}

const styles = StyleSheet.create({
  container: {
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
  content: {
    alignItems: 'center',
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 150,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },
  legend: {
    marginTop: spacing.lg,
    width: '100%',
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendLabel: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendName: {
    ...typography.label,
    fontSize: 12,
  },
  legendValue: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
  },
});
