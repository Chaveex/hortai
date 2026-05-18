import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';

export interface BarChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartDataPoint[];
  title: string;
  unit?: string;
  height?: number;
  barColor?: string;
  backgroundColor?: string;
  showGrid?: boolean;
}

export function BarChart({
  data,
  title,
  unit = '',
  height = 220,
  barColor = colors.primary,
  backgroundColor = colors.surface,
  showGrid = true,
}: BarChartProps) {
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

  // Calculate bars
  const barWidth = (graphWidth / data.length) * 0.7;
  const spacing_ = (graphWidth / data.length) * 0.3;

  const bars = data.map((d, i) => {
    const x = padding + (graphWidth / data.length) * i + spacing_ / 2;
    const yNormalized = (d.value - minValue) / yRange;
    const barHeight = yNormalized * graphHeight;
    const y = padding + graphHeight - barHeight;

    return {
      x,
      y,
      width: barWidth,
      height: barHeight,
      value: d.value,
      label: d.label,
      color: d.color ?? barColor,
    };
  });

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

        {/* Bars */}
        {bars.map((bar, i) => (
          <React.Fragment key={`bar-${i}`}>
            <Rect
              x={bar.x}
              y={bar.y}
              width={bar.width}
              height={Math.max(bar.height, 0)}
              fill={bar.color}
              opacity="0.85"
              rx="4"
            />
            {/* Bar value label */}
            {bar.height > 20 && (
              <SvgText
                x={bar.x + bar.width / 2}
                y={bar.y - 6}
                fontSize="9"
                fill={colors.text}
                textAnchor="middle"
                fontWeight="600"
              >
                {bar.value.toFixed(bar.value < 1 ? 2 : 0)}
              </SvgText>
            )}
          </React.Fragment>
        ))}

        {/* X-axis labels */}
        {bars.map((bar, i) => (
          <SvgText
            key={`x-label-${i}`}
            x={bar.x + bar.width / 2}
            y={padding + graphHeight + 18}
            fontSize="10"
            fill={colors.textMuted}
            textAnchor="middle"
          >
            {bar.label}
          </SvgText>
        ))}
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
