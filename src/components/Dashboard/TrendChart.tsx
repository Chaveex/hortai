import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Polyline, Circle, Line, Text as SvgText } from 'react-native-svg';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';

export interface ChartDataPoint {
  label: string;
  value: number;
  date?: string;
}

interface TrendChartProps {
  data: ChartDataPoint[];
  title: string;
  unit?: string;
  height?: number;
  color?: string;
  lineColor?: string;
  showGrid?: boolean;
}

export function TrendChart({
  data,
  title,
  unit = '',
  height = 200,
  color = colors.background,
  lineColor = colors.primary,
  showGrid = true,
}: TrendChartProps) {
  const width = Dimensions.get('window').width - spacing.lg * 2;
  const padding = 40;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: color, height: height + padding }]}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Aucune donnée</Text>
        </View>
      </View>
    );
  }

  // Calculate y-axis scale
  const maxValue = Math.max(...data.map(d => d.value), 0);
  const minValue = 0;
  const yRange = maxValue - minValue || 1;

  // Generate grid lines
  const gridLines = [];
  const gridCount = 4;
  if (showGrid) {
    for (let i = 0; i <= gridCount; i++) {
      const y = padding + (graphHeight / gridCount) * i;
      gridLines.push(
        <Line
          key={`grid-${i}`}
          x1={padding}
          y1={y}
          x2={padding + graphWidth}
          y2={y}
          stroke={colors.border}
          strokeWidth="1"
          strokeDasharray="3,3"
        />
      );
    }
  }

  // Generate points
  const points: { x: number; y: number; value: number; label: string }[] = [];
  data.forEach((d, i) => {
    const x = padding + (graphWidth / (data.length - 1 || 1)) * i;
    const yNormalized = (d.value - minValue) / yRange;
    const y = padding + graphHeight - yNormalized * graphHeight;
    points.push({ x, y, value: d.value, label: d.label });
  });

  // Build polyline path
  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <View style={[styles.container, { backgroundColor: color }]}>
      <Text style={styles.title}>{title}</Text>
      <Svg width={width} height={height} style={styles.svg}>
        {/* Grid */}
        {gridLines}

        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding + graphHeight - ratio * graphHeight;
          const value = minValue + ratio * yRange;
          return (
            <SvgText
              key={`y-label-${i}`}
              x={padding - 8}
              y={y + 4}
              fontSize="10"
              fill={colors.textMuted}
              textAnchor="end"
            >
              {value.toFixed(0)}
            </SvgText>
          );
        })}

        {/* Polyline */}
        <Polyline
          points={polylinePoints}
          fill="none"
          stroke={lineColor}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <Circle
            key={`point-${i}`}
            cx={p.x}
            cy={p.y}
            r="4"
            fill={lineColor}
            opacity="0.8"
          />
        ))}

        {/* X-axis labels (every nth to avoid crowding) */}
        {points.map((p, i) => {
          const showLabel = data.length <= 7 || i % Math.ceil(data.length / 6) === 0;
          if (!showLabel) return null;
          return (
            <SvgText
              key={`x-label-${i}`}
              x={p.x}
              y={padding + graphHeight + 16}
              fontSize="10"
              fill={colors.textMuted}
              textAnchor="middle"
            >
              {p.label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
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
  svg: {
    alignSelf: 'center',
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
});
