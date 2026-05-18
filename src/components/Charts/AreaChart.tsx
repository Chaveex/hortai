import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Polyline, Polygon, Circle, Line, Text as SvgText } from 'react-native-svg';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';

export interface AreaChartDataPoint {
  label: string;
  value: number;
}

interface AreaChartProps {
  data: AreaChartDataPoint[];
  title: string;
  unit?: string;
  height?: number;
  areaColor?: string;
  lineColor?: string;
  backgroundColor?: string;
  showGrid?: boolean;
}

export function AreaChart({
  data,
  title,
  unit = '',
  height = 220,
  areaColor = colors.primary,
  lineColor = colors.primaryDark,
  backgroundColor = colors.surface,
  showGrid = true,
}: AreaChartProps) {
  const width = Dimensions.get('window').width - spacing.lg * 2;
  const padding = 40;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor, height: height + padding }]}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Aucune donnée</Text>
        </View>
      </View>
    );
  }

  // Calculate scale
  const maxValue = Math.max(...data.map(d => d.value), 0);
  const minValue = 0;
  const yRange = maxValue - minValue || 1;

  // Grid lines
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
          strokeDasharray="2,4"
          opacity="0.5"
        />
      );
    }
  }

  // Calculate points
  const points: { x: number; y: number; value: number; label: string }[] = [];
  data.forEach((d, i) => {
    const x = padding + (graphWidth / Math.max(data.length - 1, 1)) * i;
    const yNormalized = (d.value - minValue) / yRange;
    const y = padding + graphHeight - yNormalized * graphHeight;
    points.push({ x, y, value: d.value, label: d.label });
  });

  // Build polygon points for area (includes baseline)
  const polygonPoints = [
    ...points.map(p => `${p.x},${p.y}`),
    `${points[points.length - 1]?.x || padding},${padding + graphHeight}`,
    `${padding},${padding + graphHeight}`,
  ].join(' ');

  const linePoints = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <View style={[styles.container, { backgroundColor }]}>
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

        {/* Filled area */}
        <Polygon
          points={polygonPoints}
          fill={areaColor}
          opacity="0.2"
        />

        {/* Line */}
        <Polyline
          points={linePoints}
          fill="none"
          stroke={lineColor}
          strokeWidth="2.5"
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
            opacity="0.9"
          />
        ))}

        {/* X-axis labels */}
        {points.map((p, i) => {
          const step = Math.max(1, Math.floor(data.length / 6));
          if (i % step !== 0 && i !== data.length - 1) return null;
          return (
            <SvgText
              key={`x-label-${i}`}
              x={p.x}
              y={padding + graphHeight + 18}
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
