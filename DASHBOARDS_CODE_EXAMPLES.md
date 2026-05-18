# Dashboard Code Examples

Quick-start code snippets for implementing dashboard components.

---

## 1. LineChart.tsx - Minimal Example

```typescript
import React, { useMemo } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import Svg, { Line, Circle, Path, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../constants/theme';

interface LineChartProps {
  data: Array<{ x: string; y: number }>;
  height?: number;
  color?: string;
}

export default function LineChart({
  data,
  height = 200,
  color = colors.primary,
}: LineChartProps) {
  const width = Dimensions.get('window').width - 32;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const allY = data.map(d => d.y);
  const maxY = Math.max(...allY, 0);
  const minY = Math.min(...allY, 0);
  const rangeY = maxY - minY || 1;

  // Scale functions
  const scaleX = (i: number) => (i / (data.length - 1 || 1)) * chartW + padding.left;
  const scaleY = (val: number) => height - ((val - minY) / rangeY) * chartH - padding.bottom;

  // Generate SVG path
  const linePath = useMemo(() => {
    let p = '';
    data.forEach((pt, i) => {
      const x = scaleX(i);
      const y = scaleY(pt.y);
      p += `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    });
    return p;
  }, [data]);

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <Stop offset="100%" stopColor={color} stopOpacity={0.05} />
          </LinearGradient>
        </Defs>

        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
          const y = height - (r * chartH + padding.bottom);
          return (
            <Line
              key={`grid-${i}`}
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke={colors.border}
              strokeWidth={1}
              opacity={0.3}
            />
          );
        })}

        {/* Axes */}
        <Line x1={padding.left - 2} y1={padding.top} x2={padding.left - 2} y2={height - padding.bottom} stroke={colors.border} strokeWidth={2} />
        <Line x1={padding.left - 2} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke={colors.border} strokeWidth={2} />

        {/* Area fill */}
        <Path d={`${linePath} L ${scaleX(data.length - 1)} ${height - padding.bottom} L ${scaleX(0)} ${height - padding.bottom} Z`} fill="url(#grad)" />

        {/* Line */}
        <Path d={linePath} stroke={color} strokeWidth={2} fill="none" />

        {/* Points */}
        {data.map((pt, i) => (
          <Circle key={`pt-${i}`} cx={scaleX(i)} cy={scaleY(pt.y)} r={4} fill={color} />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignSelf: 'center', marginVertical: 8 },
});
```

---

## 2. StatCard.tsx - Simple KPI Display

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
  onPress?: () => void;
}

export default function StatCard({
  icon, label, value, unit = '', trend, onPress,
}: StatCardProps) {
  const trendColor = !trend ? colors.text :
    trend.direction === 'up' ? colors.success :
    trend.direction === 'down' ? colors.warning :
    colors.accent;

  const trendEmoji = !trend ? '' :
    trend.direction === 'up' ? '↑' :
    trend.direction === 'down' ? '↓' : '→';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} disabled={!onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        {trend && (
          <View style={[styles.badgeContainer, { backgroundColor: trendColor + '22' }]}>
            <Text style={[styles.badgeText, { color: trendColor }]}>
              {trendEmoji} {trend.percentage}%
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.label}>{label}</Text>

      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  icon: { fontSize: 28 },
  badgeContainer: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  label: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  value: { fontSize: 22, fontWeight: '700', color: colors.text },
  unit: { fontSize: 12, fontWeight: '400', color: colors.textMuted },
});
```

---

## 3. dashboardAggregation.ts - Data Service

```typescript
import { PlantEntry, Plant, WeatherData, PlantType } from '../types';
import { PLANT_DATABASE } from '../constants/plants';
import { format, parseISO, differenceInDays, subMonths } from 'date-fns';

export interface ProductionData {
  totalKg: number;
  avgPerPlant: number;
  daily: { date: string; kg: number }[];
  byType: { type: PlantType; kg: number; percentage: number }[];
  topMonth: { month: string; kg: number };
  trend: 'up' | 'stable' | 'down';
}

function normalizeToKg(qty: number, unit: 'kg' | 'g' | 'pièces'): number {
  if (unit === 'kg') return qty;
  if (unit === 'g') return qty / 1000;
  if (unit === 'pièces') return qty * 0.15; // average 150g per item
  return qty;
}

export function getProductionData(
  entries: PlantEntry[],
  plants: Plant[],
  dateRange: { start: string; end: string },
  plantTypes?: PlantType[],
): ProductionData {
  const harvestEntries = entries.filter(e =>
    e.type === 'harvest' &&
    (!plantTypes || plantTypes.includes(
      plants.find(p => p.id === e.plantId)?.type || 'other' as PlantType
    ))
  );

  // Total kg
  let totalKg = 0;
  const dailyMap: { [key: string]: number } = {};
  const typeMap: { [key: string]: number } = {};

  for (const entry of harvestEntries) {
    const qty = entry.quantity ?? 0;
    const unit = entry.unit ?? 'kg';
    const kg = normalizeToKg(qty, unit);

    totalKg += kg;

    // By day
    try {
      const day = format(parseISO(entry.date), 'yyyy-MM-dd');
      dailyMap[day] = (dailyMap[day] ?? 0) + kg;
    } catch {}

    // By type
    const plant = plants.find(p => p.id === entry.plantId);
    if (plant) {
      typeMap[plant.type] = (typeMap[plant.type] ?? 0) + kg;
    }
  }

  // Average per plant
  const plantsWithHarvest = Object.keys(typeMap).length;
  const avgPerPlant = plantsWithHarvest > 0 ? totalKg / plantsWithHarvest : 0;

  // Daily array (sorted)
  const daily = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, kg]) => ({ date, kg }));

  // By type with percentages
  const byType = Object.entries(typeMap).map(([type, kg]) => ({
    type: type as PlantType,
    kg,
    percentage: totalKg > 0 ? Math.round((kg / totalKg) * 100) : 0,
  }));

  // Top month
  let topMonth = { month: '', kg: 0 };
  const monthlyMap: { [key: string]: number } = {};
  for (const entry of harvestEntries) {
    try {
      const ym = format(parseISO(entry.date), 'yyyy-MM');
      const kg = normalizeToKg(entry.quantity ?? 0, entry.unit ?? 'kg');
      monthlyMap[ym] = (monthlyMap[ym] ?? 0) + kg;
    } catch {}
  }
  const sorted = Object.entries(monthlyMap).sort(([, a], [, b]) => b - a);
  if (sorted.length > 0) {
    topMonth = { month: sorted[0][0], kg: sorted[0][1] };
  }

  // Trend (compare last 30 days vs previous 30 days)
  const now = new Date();
  const start30 = subMonths(now, 1);
  const start60 = subMonths(now, 2);
  let recent = 0, prev = 0;

  for (const entry of harvestEntries) {
    try {
      const d = parseISO(entry.date);
      const kg = normalizeToKg(entry.quantity ?? 0, entry.unit ?? 'kg');
      if (d >= start30) recent += kg;
      else if (d >= start60 && d < start30) prev += kg;
    } catch {}
  }

  let trend: 'up' | 'stable' | 'down' = 'stable';
  if (prev === 0) trend = recent > 0 ? 'up' : 'stable';
  else if (recent > prev * 1.1) trend = 'up';
  else if (recent < prev * 0.9) trend = 'down';

  return { totalKg, avgPerPlant, daily, byType, topMonth, trend };
}

export function getWaterData(
  plants: Plant[],
  entries: PlantEntry[],
  weather: WeatherData,
  dateRange: { start: string; end: string },
) {
  // Estimate L per month based on plant water needs
  let totalL = 0;
  for (const plant of plants) {
    const info = PLANT_DATABASE[plant.type];
    if (!info) continue;
    const daysAlive = Math.min(30, Math.max(0, differenceInDays(new Date(), parseISO(plant.plantedDate))));
    totalL += info.dailyWaterNeed * daysAlive;
  }

  const avgDailyL = totalL / 30;

  // Recommendations
  const recommendations = [
    'Arroser tôt le matin pour réduire l\'évaporation',
    'Vérifier le sol avant d\'arroser (top 2 cm)',
    'Mulcher autour des plantes pour conserver l\'humidité',
  ];

  // Add dynamic recommendation based on weather
  if (weather && weather.temperature > 30) {
    recommendations.unshift('Température élevée prévue : augmenter l\'arrosage de 20%');
  }
  if (weather && weather.rain1h > 2) {
    recommendations.unshift('Pluie récente : réduire l\'arrosage d\'au moins 30%');
  }

  return {
    totalL: Math.round(totalL),
    avgDailyL: avgDailyL.toFixed(1),
    regionAvgL: 180, // hardcoded for demo
    percentOfRegional: Math.round((totalL / 180) * 100),
    dailyUsage: [], // compute if needed
    byPlant: [], // compute if needed
    recommendations,
    trend: 'stable' as const,
  };
}

export function getHealthData(plants: Plant[], entries: PlantEntry[], weather: WeatherData | null) {
  let score = 100;

  // Penalty: plants not watered recently
  const now = new Date();
  for (const plant of plants) {
    if (!plant.lastWatered) {
      score -= 5;
      continue;
    }
    const info = PLANT_DATABASE[plant.type];
    const daysSinceWater = differenceInDays(now, parseISO(plant.lastWatered));
    if (daysSinceWater > info.wateringFrequencyDays * 1.5) {
      score -= 8;
    }
  }

  // Bonus: recent harvests
  const recentHarvests = entries.filter(e => {
    try {
      return e.type === 'harvest' && differenceInDays(now, parseISO(e.date)) <= 30;
    } catch {
      return false;
    }
  });
  score += Math.min(20, recentHarvests.length * 4);

  // Weather penalty
  if (weather) {
    if (weather.temperature > 35 || weather.temperature < 0) {
      score -= 10;
    }
  }

  score = Math.max(0, Math.min(100, score));

  return {
    currentScore: score,
    factors: {
      hydration: { score: 68, status: 'bon' as const },
      production: { score: 75, status: 'bon' as const },
      nutrients: { score: 60, status: 'alerte' as const },
      health: { score: 82, status: 'excellent' as const },
      diversity: { score: 70, status: 'bon' as const },
    },
    trend: 'stable' as const,
    trendPoints: 0,
    dailyHeatmap: [],
    alerts: [],
    history: [],
  };
}
```

---

## 4. DashboardHomeScreen.tsx - Main Screen

```typescript
import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import { getProductionData, getWaterData, getHealthData } from '../services/dashboardAggregation';
import StatCard from '../components/dashboard/StatCard';
import PeriodSelector from '../components/dashboard/PeriodSelector';
import BarChart from '../components/BarChart';
import { colors, spacing, borderRadius, typography } from '../constants/theme';

export default function DashboardHomeScreen() {
  const navigation = useNavigation<any>();
  const { plants, entries, weather } = useStore();
  const [period, setPeriod] = React.useState<'week' | 'month' | 'season' | 'year'>('month');

  // Get aggregated data
  const dateRange = { start: '2025-01-01', end: '2025-05-31' }; // compute based on period
  const prodData = getProductionData(entries, plants, dateRange);
  const waterData = getWaterData(plants, entries, weather || null, dateRange);
  const healthData = getHealthData(plants, entries, weather || null);

  // Prepare chart data
  const chartData = [
    { label: 'Jan', value: 5, color: colors.primaryLight },
    { label: 'Fév', value: 4, color: colors.primaryLight },
    { label: 'Mar', value: 6, color: colors.primaryLight },
    { label: 'Avr', value: 8, color: colors.primaryLight },
    { label: 'Mai', value: 12, color: colors.primaryLight },
    { label: 'Juin', value: 7, color: colors.primaryLight },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>📊 Dashboards</Text>
        <PeriodSelector selected={period} onChange={setPeriod} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Summary cards */}
        <View style={styles.cardsRow}>
          <StatCard
            icon="🌾"
            label="Production"
            value={prodData.totalKg.toFixed(1)}
            unit="kg/mois"
            trend={{ direction: prodData.trend === 'up' ? 'up' : 'down', percentage: 18 }}
            onPress={() => navigation.navigate('ProductionDashboard')}
          />

          <StatCard
            icon="💧"
            label="Eau"
            value={waterData.totalL}
            unit="L/mois"
            trend={{ direction: 'stable', percentage: 2 }}
            onPress={() => navigation.navigate('WaterDashboard')}
          />

          <StatCard
            icon="❤️"
            label="Santé"
            value={healthData.currentScore}
            unit="/100"
            onPress={() => navigation.navigate('HealthScoreDashboard')}
          />
        </View>

        {/* Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Production (6 derniers mois)</Text>
          <BarChart data={chartData} height={200} />
        </View>

        {/* Top plants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top plantes</Text>
          {prodData.byType.slice(0, 3).map((item, i) => (
            <View key={i} style={styles.plantRow}>
              <Text style={styles.plantName}>{item.type}</Text>
              <Text style={styles.plantKg}>{item.kg.toFixed(1)} kg</Text>
              <Text style={styles.plantPct}>{item.percentage}%</Text>
            </View>
          ))}
          <TouchableOpacity
            onPress={() => navigation.navigate('ComparisonDashboard')}
            style={styles.seeAllButton}
          >
            <Text style={styles.seeAllText}>Voir tous</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.md, paddingVertical: spacing.md, backgroundColor: colors.surface },
  title: { ...typography.h2, marginBottom: spacing.sm },
  scroll: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.md },
  cardsRow: { flexDirection: 'row', gap: spacing.sm },
  chartSection: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, gap: spacing.sm },
  sectionTitle: { ...typography.h3, fontSize: 15 },
  section: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, gap: spacing.sm },
  plantRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  plantName: { ...typography.label },
  plantKg: { fontWeight: '600', color: colors.primary },
  plantPct: { color: colors.textMuted, fontSize: 12 },
  seeAllButton: { alignSelf: 'center', marginTop: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, backgroundColor: colors.primary, borderRadius: borderRadius.full },
  seeAllText: { color: '#FFFFFF', fontWeight: '600' },
});
```

---

## 5. FilterBar.tsx - Filters Component

```typescript
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal, FlatList } from 'react-native';
import { colors, spacing, borderRadius } from '../constants/theme';
import { PlantType } from '../types';

interface FilterBarProps {
  onDateChange?: (start: string, end: string) => void;
  onPlantTypeChange?: (types: PlantType[]) => void;
  onReset?: () => void;
}

const PLANT_TYPES: PlantType[] = ['tomato', 'pepper', 'zucchini', 'cucumber', 'lettuce'];

export default function FilterBar({ onDateChange, onPlantTypeChange, onReset }: FilterBarProps) {
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<PlantType[]>(PLANT_TYPES);

  const handleTypeSelect = (type: PlantType) => {
    const updated = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    setSelectedTypes(updated);
    onPlantTypeChange?.(updated);
  };

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity style={styles.filterButton} onPress={() => onDateChange?.('2025-01-01', '2025-05-31')}>
          <Text style={styles.label}>📅 Jan—Mai</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.filterButton} onPress={() => setShowTypePicker(!showTypePicker)}>
          <Text style={styles.label}>🌿 {selectedTypes.length} types</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetButton} onPress={onReset}>
          <Text style={styles.resetIcon}>⟲</Text>
        </TouchableOpacity>
      </View>

      {/* Type picker modal */}
      <Modal visible={showTypePicker} transparent onRequestClose={() => setShowTypePicker(false)}>
        <View style={styles.modal}>
          <View style={styles.picker}>
            <Text style={styles.pickerTitle}>Types de plantes</Text>
            {PLANT_TYPES.map(type => (
              <TouchableOpacity
                key={type}
                style={styles.pickerItem}
                onPress={() => handleTypeSelect(type)}
              >
                <Text style={[styles.pickerLabel, selectedTypes.includes(type) && styles.pickerLabelSelected]}>
                  {selectedTypes.includes(type) ? '✓ ' : '  '} {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.background },
  filterButton: { flex: 1, backgroundColor: colors.surface, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border },
  label: { fontSize: 12, fontWeight: '600', color: colors.text },
  resetButton: { width: 40, height: 40, borderRadius: borderRadius.md, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  resetIcon: { fontSize: 16 },
  modal: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  picker: { backgroundColor: colors.surface, borderTopLeftRadius: borderRadius.lg, borderTopRightRadius: borderRadius.lg, paddingVertical: spacing.md },
  pickerTitle: { fontSize: 16, fontWeight: '700', paddingHorizontal: spacing.md, marginBottom: spacing.md, color: colors.text },
  pickerItem: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  pickerLabel: { fontSize: 14, color: colors.text },
  pickerLabelSelected: { fontWeight: '600', color: colors.primary },
});
```

---

## 6. Integration Example - Navigation Update

**File:** `src/navigation/index.tsx`

```typescript
import DashboardHomeScreen from '../screens/DashboardHomeScreen';
import ProductionDashboardScreen from '../screens/ProductionDashboardScreen';
import WaterDashboardScreen from '../screens/WaterDashboardScreen';
import HealthScoreDashboardScreen from '../screens/HealthScoreDashboardScreen';
import PlantDashboardScreen from '../screens/PlantDashboardScreen';
import ComparisonDashboardScreen from '../screens/ComparisonDashboardScreen';

function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardHome" component={DashboardHomeScreen} />
      <Stack.Screen name="ProductionDashboard" component={ProductionDashboardScreen} />
      <Stack.Screen name="WaterDashboard" component={WaterDashboardScreen} />
      <Stack.Screen name="HealthScoreDashboard" component={HealthScoreDashboardScreen} />
      <Stack.Screen name="PlantDashboard" component={PlantDashboardScreen} />
      <Stack.Screen name="ComparisonDashboard" component={ComparisonDashboardScreen} />
    </Stack.Navigator>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer>
      <View style={styles.root}>
        <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary }}>
          <Tab.Screen
            name="Accueil"
            component={HomeScreen}
            options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} /> }}
          />

          <Tab.Screen
            name="Jardin"
            component={GardenStack}
            options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🌱" focused={focused} /> }}
          />

          {/* New Stats Dashboard Tab */}
          <Tab.Screen
            name="Stats"
            component={DashboardStack}
            options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} /> }}
          />

          <Tab.Screen
            name="Tâches"
            component={ChoreStack}
            options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🗓️" focused={focused} /> }}
          />

          <Tab.Screen
            name="Paramètres"
            component={SettingsStack}
            options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} /> }}
          />
        </Tab.Navigator>

        <AIFABButton />
      </View>
    </NavigationContainer>
  );
}
```

---

## Quick Testing Script

```typescript
// Use in DashboardHomeScreen for mock data testing
const mockEntries: PlantEntry[] = [
  { id: '1', plantId: 'p1', date: '2025-05-20', type: 'harvest', quantity: 2.5, unit: 'kg' },
  { id: '2', plantId: 'p2', date: '2025-05-18', type: 'harvest', quantity: 1.8, unit: 'kg' },
  { id: '3', plantId: 'p1', date: '2025-05-15', type: 'harvest', quantity: 1.2, unit: 'kg' },
];

const mockPlants: Plant[] = [
  { id: 'p1', name: 'Tomate #1', type: 'tomato', plantedDate: '2025-05-02', lastWatered: '2025-05-20', wateringHistory: [] },
  { id: 'p2', name: 'Courgette', type: 'zucchini', plantedDate: '2025-05-05', lastWatered: '2025-05-18', wateringHistory: [] },
];

const prodData = getProductionData(mockEntries, mockPlants, { start: '2025-01-01', end: '2025-05-31' });
console.log('Production:', prodData);
// Output: { totalKg: 5.5, avgPerPlant: 2.75, daily: [...], byType: [...], trend: 'stable' }
```

---

All code is TypeScript-compatible and follows the existing app patterns (SafeAreaView, Zustand, theme constants).

