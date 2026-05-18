# Dashboard Components - Detailed Specifications

## Component Structure

```
src/components/
├── charts/
│   ├── LineChart.tsx
│   ├── BarChart.tsx (enhance existing)
│   ├── PieChart.tsx
│   ├── StackedBarChart.tsx
│   ├── HeatmapChart.tsx
│   ├── RadarChart.tsx
│   └── GaugeChart.tsx (enhance existing)
│
└── dashboard/
    ├── StatCard.tsx
    ├── ComparisonCard.tsx
    ├── MiniTrendCard.tsx
    ├── FilterBar.tsx
    ├── PeriodSelector.tsx
    ├── TrendIndicator.tsx
    ├── ChartWrapper.tsx (common header + loading)
    └── EmptyState.tsx
```

---

## 1. CHARTS

### LineChart.tsx

**Purpose:** Display time-series data (production, water usage, health trends).

```typescript
import React, { useMemo } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import Svg, { Line, Circle, Text as SvgText, Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface LineChartProps {
  data: Array<{ x: string; y: number; label?: string }>;
  height?: number;
  width?: number;
  yAxisLabel?: string;
  showGrid?: boolean;
  showForecast?: boolean;
  forecastData?: Array<{ x: string; y: number }>;
  showValues?: boolean;
  color?: string;
  gradientColor?: string;
}

export default function LineChart({
  data,
  height = 200,
  width = Dimensions.get('window').width - 32,
  yAxisLabel = '',
  showGrid = true,
  showForecast = false,
  forecastData = [],
  showValues = false,
  color = '#2D6A4F',
  gradientColor = '#52B78822',
}: LineChartProps) {
  // Constants
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate min/max
  const allValues = [...data, ...forecastData].map(d => d.y);
  const minY = Math.min(...allValues, 0);
  const maxY = Math.max(...allValues);
  const yRange = maxY - minY || 1;

  // Scale functions
  const scaleX = (index: number) => (index / (data.length - 1 || 1)) * chartWidth + padding.left;
  const scaleY = (value: number) => height - ((value - minY) / yRange) * chartHeight - padding.bottom;

  // Generate path string
  const linePath = useMemo(() => {
    let path = '';
    data.forEach((point, i) => {
      const x = scaleX(i);
      const y = scaleY(point.y);
      path += `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    });
    return path;
  }, [data]);

  // Forecast path (dashed)
  const forecastPath = useMemo(() => {
    if (forecastData.length < 2) return '';
    let path = `M ${scaleX(data.length - 1)} ${scaleY(data[data.length - 1].y)}`;
    forecastData.forEach((point, i) => {
      const x = scaleX(data.length - 1 + i);
      const y = scaleY(point.y);
      path += ` L ${x} ${y}`;
    });
    return path;
  }, [forecastData]);

  return (
    <View style={[styles.container, { width }]}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <Stop offset="100%" stopColor={color} stopOpacity={0.05} />
          </LinearGradient>
        </Defs>

        {/* Grid */}
        {showGrid && (
          <>
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = height - (ratio * chartHeight + padding.bottom);
              return (
                <Line
                  key={`gridline-${i}`}
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#B7E4C722"
                  strokeWidth={1}
                  strokeDasharray="2,2"
                />
              );
            })}
          </>
        )}

        {/* Y-Axis */}
        <Line x1={padding.left - 2} y1={padding.top} x2={padding.left - 2} y2={height - padding.bottom} stroke="#B7E4C7" strokeWidth={2} />

        {/* X-Axis */}
        <Line x1={padding.left - 2} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#B7E4C7" strokeWidth={2} />

        {/* Y-Axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const value = minY + ratio * yRange;
          const y = height - (ratio * chartHeight + padding.bottom);
          return (
            <SvgText
              key={`ylabel-${i}`}
              x={padding.left - 8}
              y={y + 4}
              fontSize={10}
              fill="#52B788"
              textAnchor="end"
            >
              {value.toFixed(0)}
            </SvgText>
          );
        })}

        {/* X-Axis labels */}
        {data.map((point, i) => {
          const x = scaleX(i);
          if (i % Math.ceil(data.length / 6) !== 0 && i !== data.length - 1) return null;
          return (
            <SvgText
              key={`xlabel-${i}`}
              x={x}
              y={height - padding.bottom + 18}
              fontSize={10}
              fill="#52B788"
              textAnchor="middle"
            >
              {point.x}
            </SvgText>
          );
        })}

        {/* Data area (gradient fill) */}
        <Path d={`${linePath} L ${scaleX(data.length - 1)} ${height - padding.bottom} L ${scaleX(0)} ${height - padding.bottom} Z`} fill="url(#gradient)" />

        {/* Main line */}
        <Path d={linePath} stroke={color} strokeWidth={2} fill="none" />

        {/* Forecast line (dashed) */}
        {showForecast && forecastPath && (
          <Path d={forecastPath} stroke={color} strokeWidth={2} fill="none" strokeDasharray="4,4" opacity={0.6} />
        )}

        {/* Data points */}
        {data.map((point, i) => {
          const x = scaleX(i);
          const y = scaleY(point.y);
          return (
            <Circle key={`point-${i}`} cx={x} cy={y} r={4} fill={color} />
          );
        })}

        {/* Forecast points */}
        {showForecast && forecastData.map((point, i) => {
          const x = scaleX(data.length - 1 + i);
          const y = scaleY(point.y);
          return (
            <Circle key={`forecast-${i}`} cx={x} cy={y} r={3} fill={color} opacity={0.5} />
          );
        })}

        {/* Value labels on points */}
        {showValues && data.map((point, i) => {
          const x = scaleX(i);
          const y = scaleY(point.y);
          return (
            <SvgText key={`value-${i}`} x={x} y={y - 8} fontSize={9} fill={color} textAnchor="middle" fontWeight="600">
              {point.y.toFixed(1)}
            </SvgText>
          );
        })}
      </Svg>

      {yAxisLabel && <Text style={styles.yAxisLabel}>{yAxisLabel}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
  },
  yAxisLabel: {
    position: 'absolute',
    left: -20,
    top: '50%',
    fontSize: 12,
    color: '#52B788',
    fontWeight: '600',
    transform: [{ rotate: '-90deg' }],
  },
});
```

---

### PieChart.tsx

**Purpose:** Show proportional distribution (plants by harvest %, types, etc).

```typescript
import React, { useMemo } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';

interface PieChartProps {
  data: Array<{ label: string; value: number; color: string }>;
  donut?: boolean;
  centerLabel?: string;
  showLegend?: boolean;
  height?: number;
}

export default function PieChart({
  data,
  donut = false,
  centerLabel = '',
  showLegend = true,
  height = 250,
}: PieChartProps) {
  const width = Dimensions.get('window').width - 32;
  const radius = Math.min(width, height) / 2 - 40;
  const centerX = width / 2;
  const centerY = height / 2;

  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);

  const slices = useMemo(() => {
    let currentAngle = -Math.PI / 2;
    return data.map(item => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;

      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);

      const largeArc = sliceAngle > Math.PI ? 1 : 0;

      const path = donut
        ? `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${centerX + (radius * 0.6) * Math.cos(endAngle)} ${centerY + (radius * 0.6) * Math.sin(endAngle)} A ${radius * 0.6} ${radius * 0.6} 0 ${largeArc} 0 ${centerX + (radius * 0.6) * Math.cos(startAngle)} ${centerY + (radius * 0.6) * Math.sin(startAngle)} Z`
        : `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

      const labelAngle = startAngle + sliceAngle / 2;
      const labelX = centerX + (radius * 0.7) * Math.cos(labelAngle);
      const labelY = centerY + (radius * 0.7) * Math.sin(labelAngle);

      const percentage = ((item.value / total) * 100).toFixed(0);

      currentAngle = endAngle;

      return { path, labelX, labelY, percentage, item };
    });
  }, [data, total]);

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        {/* Slices */}
        {slices.map((slice, i) => (
          <Path key={`slice-${i}`} d={slice.path} fill={slice.item.color} strokeWidth={1} stroke="#FFFFFF" />
        ))}

        {/* Labels on slices */}
        {slices.map((slice, i) => (
          slice.item.value > 0 && (
            <SvgText
              key={`label-${i}`}
              x={slice.labelX}
              y={slice.labelY}
              fontSize={11}
              fontWeight="600"
              fill="#FFFFFF"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {slice.percentage}%
            </SvgText>
          )
        ))}

        {/* Center label (for donut) */}
        {donut && centerLabel && (
          <SvgText x={centerX} y={centerY} fontSize={16} fontWeight="700" fill="#2D6A4F" textAnchor="middle" dominantBaseline="middle">
            {centerLabel}
          </SvgText>
        )}
      </Svg>

      {/* Legend */}
      {showLegend && (
        <View style={styles.legend}>
          {data.map((item, i) => (
            <View key={`legend-${i}`} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <Text style={styles.legendLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    gap: 12,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendLabel: {
    fontSize: 12,
    color: '#1B4332',
    fontWeight: '500',
  },
});
```

---

### StackedBarChart.tsx

**Purpose:** Show composition of categories over time (water by plant type, harvest by week).

```typescript
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Rect, Text as SvgText, Line } from 'react-native-svg';
import { Dimensions } from 'react-native';

interface StackedBarChartProps {
  data: Array<{
    label: string;
    segments: Array<{ name: string; value: number; color: string }>;
  }>;
  height?: number;
  showLegend?: boolean;
  variant?: 'absolute' | 'percentage';
}

export default function StackedBarChart({
  data,
  height = 180,
  showLegend = true,
  variant = 'absolute',
}: StackedBarChartProps) {
  const width = Dimensions.get('window').width - 32;
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const barWidth = chartWidth / (data.length * 1.5);

  // Calculate max total for normalization
  const maxTotal = Math.max(...data.map(d => d.segments.reduce((sum, s) => sum + s.value, 0)));

  return (
    <View style={{ width }}>
      <Svg width={width} height={height}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <Line
            key={`gridline-${i}`}
            x1={padding.left}
            y1={height - (ratio * chartHeight + padding.bottom)}
            x2={width - padding.right}
            y2={height - (ratio * chartHeight + padding.bottom)}
            stroke="#B7E4C722"
            strokeWidth={1}
            strokeDasharray="2,2"
          />
        ))}

        {/* Axes */}
        <Line x1={padding.left - 2} y1={padding.top} x2={padding.left - 2} y2={height - padding.bottom} stroke="#B7E4C7" strokeWidth={2} />
        <Line x1={padding.left - 2} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#B7E4C7" strokeWidth={2} />

        {/* Stacked bars */}
        {data.map((barGroup, barIndex) => {
          const barX = padding.left + (barIndex * chartWidth) / data.length + 10;
          let stackedY = height - padding.bottom;
          const total = barGroup.segments.reduce((sum, s) => sum + s.value, 0);

          return (
            <g key={`bar-${barIndex}`}>
              {barGroup.segments.map((segment, segIndex) => {
                const ratio = variant === 'percentage' ? segment.value / total : segment.value / maxTotal;
                const segmentHeight = ratio * chartHeight;
                const segmentY = stackedY - segmentHeight;

                stackedY = segmentY;

                return (
                  <Rect
                    key={`segment-${barIndex}-${segIndex}`}
                    x={barX}
                    y={segmentY}
                    width={barWidth}
                    height={Math.max(segmentHeight, 0)}
                    fill={segment.color}
                    stroke="#FFFFFF"
                    strokeWidth={1}
                  />
                );
              })}

              {/* Bar label */}
              <SvgText
                x={barX + barWidth / 2}
                y={height - padding.bottom + 20}
                fontSize={10}
                fill="#52B788"
                textAnchor="middle"
              >
                {barGroup.label}
              </SvgText>
            </g>
          );
        })}
      </Svg>

      {showLegend && (
        <View style={styles.legend}>
          {Array.from(new Set(data.flatMap(d => d.segments.map(s => s.name)))).map((segName, i) => {
            const color = data.find(d => d.segments.find(s => s.name === segName))?.segments.find(s => s.name === segName)?.color;
            return (
              <View key={`legend-${i}`} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: color }]} />
                <Text style={styles.legendLabel}>{segName}</Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendLabel: {
    fontSize: 11,
    color: '#1B4332',
    fontWeight: '500',
  },
});
```

---

### HeatmapChart.tsx

**Purpose:** Visualize plant health over a date range (color intensity = health %).

```typescript
import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { Dimensions } from 'react-native';

interface HeatmapChartProps {
  data: Array<{
    row: string; // plant name
    columns: Array<{ col: string; value: number }>;
  }>;
  cellSize?: number;
  colorScheme?: 'health' | 'performance';
}

const getColorForValue = (value: number, scheme: 'health' | 'performance' = 'health') => {
  if (value >= 80) return scheme === 'health' ? '#40916C' : '#2D6A4F';
  if (value >= 60) return scheme === 'health' ? '#52B788' : '#52B788';
  if (value >= 40) return scheme === 'health' ? '#D4A017' : '#D4A017';
  if (value >= 20) return scheme === 'health' ? '#E76F51' : '#E76F51';
  return scheme === 'health' ? '#C62828' : '#C62828';
};

export default function HeatmapChart({
  data,
  cellSize = 32,
  colorScheme = 'health',
}: HeatmapChartProps) {
  const width = Dimensions.get('window').width - 32;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      <View style={styles.heatmap}>
        {/* Header row (dates) */}
        <View style={styles.headerRow}>
          <View style={[styles.cell, { width: 100 }]} />
          {data[0]?.columns.map((col, i) => (
            <View key={`header-${i}`} style={[styles.headerCell, { width: cellSize }]}>
              <Text style={styles.headerText}>{col.col}</Text>
            </View>
          ))}
        </View>

        {/* Data rows */}
        {data.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.dataRow}>
            {/* Row label */}
            <View style={[styles.cell, { width: 100, backgroundColor: '#F0F4E8' }]}>
              <Text style={styles.rowLabel} numberOfLines={2}>{row.row}</Text>
            </View>

            {/* Cells */}
            {row.columns.map((col, colIndex) => (
              <View
                key={`cell-${rowIndex}-${colIndex}`}
                style={[
                  styles.cell,
                  { width: cellSize, backgroundColor: getColorForValue(col.value, colorScheme) },
                ]}
              >
                <Text style={styles.cellValue}>{Math.round(col.value)}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
  },
  heatmap: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#E8F0E5',
  },
  headerCell: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF',
  },
  headerText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2D6A4F',
  },
  dataRow: {
    flexDirection: 'row',
  },
  cell: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF',
  },
  rowLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1B4332',
    paddingHorizontal: 4,
    textAlign: 'center',
  },
  cellValue: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
```

---

### RadarChart.tsx (Optional, Advanced)

**Purpose:** Multi-dimensional comparison (5 factors of garden health).

*Implementation:* Use SVG paths with polar coordinates. Simplified version:

```typescript
// Pseudocode
const angles = 5;
const points = dimensions.map((d, i) => {
  const angle = (i / angles) * 2 * Math.PI - Math.PI / 2;
  const radius = (d.score / 100) * maxRadius;
  return { x: centerX + radius * cos(angle), y: centerY + radius * sin(angle) };
});

// Create polygon from points
const polygonPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
// Draw on Svg with fill + stroke
```

---

## 2. DASHBOARD COMPONENTS

### StatCard.tsx

**Purpose:** Display KPI with trend indicator.

```typescript
import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../constants/theme';

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  unit?: string;
  trend?: { direction: 'up' | 'down' | 'stable'; percentage: number };
  comparison?: string;
  onPress?: () => void;
}

export default function StatCard({
  icon, label, value, unit = '', trend, comparison, onPress,
}: StatCardProps) {
  const trendColor = !trend ? colors.text : trend.direction === 'up' ? colors.success : trend.direction === 'down' ? colors.warning : colors.accent;
  const trendIcon = !trend ? '' : trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        {trend && (
          <View style={[styles.trendBadge, { backgroundColor: trendColor + '22' }]}>
            <Text style={[styles.trendIcon, { color: trendColor }]}>
              {trendIcon} {trend.percentage}%
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.label}>{label}</Text>

      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>

      {comparison && <Text style={styles.comparison}>{comparison}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  icon: { fontSize: 22 },
  trendBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  trendIcon: { fontSize: 12, fontWeight: '600' },
  label: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  value: { fontSize: 22, fontWeight: '700', color: colors.text },
  unit: { fontSize: 12, fontWeight: '400', color: colors.textMuted },
  comparison: { fontSize: 11, color: colors.textSecondary, fontStyle: 'italic' },
});
```

---

### ComparisonCard.tsx

```typescript
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import TrendIndicator from './TrendIndicator';

interface ComparisonCardProps {
  title: string;
  actual: number;
  regional: number;
  unit: string;
  percentage: number;
  status: 'excellent' | 'good' | 'warning' | 'alert';
}

const statusColors = {
  excellent: colors.success,
  good: colors.accent,
  warning: colors.warning,
  alert: colors.error,
};

export default function ComparisonCard({
  title, actual, regional, unit, percentage, status,
}: ComparisonCardProps) {
  const barWidth = Math.min(100, (actual / regional) * 100);
  const statusColor = statusColors[status];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.comparison}>
        <View style={styles.left}>
          <Text style={styles.label}>Votre jardin</Text>
          <Text style={styles.value}>{actual}{unit}</Text>
        </View>

        <View style={styles.right}>
          <Text style={styles.label}>Région</Text>
          <Text style={styles.value}>{regional}{unit}</Text>
        </View>
      </View>

      <View style={styles.barContainer}>
        <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.barFill,
              { width: `${barWidth}%`, backgroundColor: statusColor },
            ]}
          />
        </View>
        <TrendIndicator
          trend={percentage > 100 ? 'up' : percentage < 100 ? 'down' : 'stable'}
          percentage={Math.abs(percentage - 100)}
        />
      </View>

      <Text style={[styles.statusText, { color: statusColor }]}>
        {percentage}% de la moyenne régionale
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  title: { ...typography.label, fontSize: 14 },
  comparison: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  left: { flex: 1 },
  right: { flex: 1, alignItems: 'flex-end' },
  label: { fontSize: 11, color: colors.textMuted },
  value: { fontSize: 18, fontWeight: '700', color: colors.primary, marginTop: 4 },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  barTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 5 },
  statusText: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
});
```

---

### FilterBar.tsx

```typescript
import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius } from '../constants/theme';
import { PlantType } from '../types';

interface FilterBarProps {
  dateRange?: { start: string; end: string };
  onDateChange?: (start: string, end: string) => void;
  plantTypes?: PlantType[];
  onPlantTypeChange?: (types: PlantType[]) => void;
  onReset?: () => void;
}

export default function FilterBar({
  dateRange, onDateChange, plantTypes, onPlantTypeChange, onReset,
}: FilterBarProps) {
  const [showTypePicker, setShowTypePicker] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.filterButton} onPress={() => onDateChange?.('', '')}>
        <Text style={styles.filterLabel}>📅 {dateRange?.start.slice(5)} — {dateRange?.end.slice(5)}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowTypePicker(!showTypePicker)}
      >
        <Text style={styles.filterLabel}>🌿 {plantTypes?.length ?? 'All'} types</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.resetButton} onPress={onReset}>
        <Text style={styles.resetIcon}>⟲</Text>
      </TouchableOpacity>

      {/* Type picker (simple list, could be BottomSheet modal) */}
      {showTypePicker && (
        <View style={styles.typePicker}>
          {/* Render plant type options */}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  filterButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterLabel: { fontSize: 12, fontWeight: '600', color: colors.text },
  resetButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetIcon: { fontSize: 16 },
  typePicker: {
    position: 'absolute',
    top: 48,
    left: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    zIndex: 10,
  },
});
```

---

### PeriodSelector.tsx

```typescript
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../constants/theme';

type Period = 'week' | 'month' | 'season' | 'year';

interface PeriodSelectorProps {
  selected: Period;
  onChange: (period: Period) => void;
}

const PERIODS: Array<{ key: Period; label: string }> = [
  { key: 'week', label: 'Semaine' },
  { key: 'month', label: 'Mois' },
  { key: 'season', label: 'Saison' },
  { key: 'year', label: 'Année' },
];

export default function PeriodSelector({ selected, onChange }: PeriodSelectorProps) {
  return (
    <View style={styles.container}>
      {PERIODS.map(period => (
        <TouchableOpacity
          key={period.key}
          style={[
            styles.button,
            selected === period.key && styles.buttonActive,
          ]}
          onPress={() => onChange(period.key)}
        >
          <Text
            style={[
              styles.label,
              selected === period.key && styles.labelActive,
            ]}
          >
            {period.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  labelActive: {
    color: '#FFFFFF',
  },
});
```

---

### TrendIndicator.tsx

```typescript
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { colors } from '../constants/theme';

interface TrendIndicatorProps {
  trend: 'up' | 'down' | 'stable';
  percentage: number;
  label?: string;
  colorOverride?: string;
}

const trendConfig = {
  up: { icon: '↑', baseColor: colors.success, label: 'Hausse' },
  down: { icon: '↓', baseColor: colors.warning, label: 'Baisse' },
  stable: { icon: '→', baseColor: colors.accent, label: 'Stable' },
};

export default function TrendIndicator({
  trend, percentage, label, colorOverride,
}: TrendIndicatorProps) {
  const config = trendConfig[trend];
  const color = colorOverride || config.baseColor;

  return (
    <View style={[styles.container, { backgroundColor: color + '22', borderColor: color }]}>
      <Text style={[styles.icon, { color }]}>{config.icon}</Text>
      <Text style={[styles.percentage, { color }]}>
        {percentage}%
      </Text>
      {label && <Text style={[styles.label, { color }]}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  icon: { fontSize: 14, fontWeight: '700' },
  percentage: { fontSize: 12, fontWeight: '600' },
  label: { fontSize: 11, fontWeight: '500' },
});
```

---

## Summary Table

| Component | Purpose | Props | Rendered |
|-----------|---------|-------|----------|
| **LineChart** | Time-series trends | data, height, showForecast | SVG curve + area fill |
| **PieChart** | Proportions | data, donut, legend | SVG slices + labels |
| **StackedBarChart** | Composition over time | data, variant | SVG stacked bars |
| **HeatmapChart** | Grid visualization | data, colorScheme | Color cells with values |
| **RadarChart** | Multi-dimensional | dimensions | SVG polygon (optional) |
| **StatCard** | KPI display | icon, value, trend | Card + trend badge |
| **ComparisonCard** | Vs regional avg | actual, regional | Bar + percentage |
| **FilterBar** | Date/type filters | dateRange, plantTypes | Buttons + picker |
| **PeriodSelector** | Time grouping | selected, onChange | Tab-like buttons |
| **TrendIndicator** | Direction + %| trend, percentage | Badge with icon |

