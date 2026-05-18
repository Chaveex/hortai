# Dashboards Avancés - Architecture & Design

## 1. STRUCTURE HIÉRARCHIQUE

```
src/
├── screens/
│   ├── DashboardHomeScreen.tsx       (main overview)
│   ├── DashboardDetailScreen.tsx     (generic detail wrapper)
│   ├── PlantDashboardScreen.tsx      (per-plant deep dive)
│   ├── GardenOverviewScreen.tsx      (garden grid stats)
│   ├── ProductionDashboardScreen.tsx (harvest trends)
│   ├── WaterDashboardScreen.tsx      (water consumption analysis)
│   └── HealthScoreDashboardScreen.tsx (garden health detail)
│
├── components/
│   └── charts/
│       ├── LineChart.tsx              (curve graphs)
│       ├── BarChart.tsx               (already exists, enhance)
│       ├── PieChart.tsx               (proportions: plant types)
│       ├── GaugeChart.tsx             (already exists, enhance)
│       ├── StackedBarChart.tsx        (water by plant over time)
│       ├── ComparisonChart.tsx        (actual vs regional avg)
│       └── HeatmapChart.tsx           (plant health grid by day)
│   └── dashboard/
│       ├── StatCard.tsx               (KPI card: value + trend + detail)
│       ├── MiniTrendCard.tsx          (sparkline + label)
│       ├── FilterBar.tsx              (date range, plant type, period)
│       ├── PeriodSelector.tsx         (week/month/season/year)
│       ├── ComparisonCard.tsx         (vs regional, vs last period)
│       └── TrendIndicator.tsx         (↑↓→ + percentage + color)
│
└── services/
    └── dashboardAggregation.ts        (data computation layer)
```

---

## 2. NAVIGATION FLOW

### Hierarchy (Modal Stack)

```
Bottom Tabs
├── 🏠 Home
│   └─→ (Quick Stats → Tap to navigate)
│       ├─→ ProductionDashboard
│       ├─→ WaterDashboard
│       └─→ HealthScoreDashboard
│
├── 🌱 Garden
│   ├─→ GardenScreen
│   │   └─→ PlantDashboard (per plant)
│   │       ├─→ Details (history, entries)
│   │       └─→ Compare (vs regional avg)
│   │
│   └─→ GardenOverview (stats grid by bed)
│       └─→ BedDetails
│
├── 📊 Stats (NEW TAB)
│   ├─→ DashboardHome (overview)
│   │   ├─→ ProductionDashboard
│   │   ├─→ WaterDashboard
│   │   ├─→ HealthScoreDashboard
│   │   ├─→ ComparisonDashboard
│   │   └─→ TimeSeriesDashboard
│   │
│   └─→ FilteredView (by date, type)
│
├── 🗓️ Tasks
└── ⚙️ Settings
```

**Navigation Method:**
- Tap card → Modal slide-up OR Stack push (consistent with app)
- Filter bar → re-render in place (no navigation)
- Date range picker → BottomSheet modal

---

## 3. SCREEN BREAKDOWN

### 3.1 DashboardHomeScreen (Overview Hub)

**Purpose:** Landing page for all dashboards. Quick scan of garden health.

**Layout:**

```
┌────────────────────────────────────────┐
│ 📊 Dashboards              [Period Selector] │
├────────────────────────────────────────┤
│                                        │
│  ╔════════════════════╗                │
│  ║ 🌾 Production      ║                │
│  ║ 42.5 kg / mois     ║ [↑ 18%]        │
│  ║ vs. dernière mois  ║                │
│  ╚════════════════════╝                │
│                                        │
│  ╔════════════════════╗                │
│  ║ 💧 Eau             ║                │
│  ║ 186 L / mois       ║ [→ +2%]        │
│  ║ vs. région         ║                │
│  ╚════════════════════╝                │
│                                        │
│  ╔════════════════════╗                │
│  ║ ❤️  Santé du jardin║                │
│  ║ 76/100             ║ [→ Stable]     │
│  ║ [████████░░]       ║                │
│  ╚════════════════════╝                │
│                                        │
│  ╔════════════════════╗                │
│  ║ 🏆 Plantes top     ║                │
│  ║ 1. Tomate (15kg)   ║ [→ voir plus]  │
│  ║ 2. Courgette (10kg)║                │
│  ║ 3. Poivron (6kg)   ║                │
│  ╚════════════════════╝                │
│                                        │
│  [6-Month Production Chart]            │
│  [Bar: Jan|Fév|Mar|Avr|Mai|Juin]      │
│                                        │
└────────────────────────────────────────┘
```

**Components:**
- `StatCard` × 3: Production, Water, Health (with trend icons)
- `ComparisonCard`: Top plants mini-list
- `BarChart`: Monthly production (last 6 months)
- `PeriodSelector`: Week/Month/Season/Year tabs

**Interactions:**
- Tap any stat card → navigate to detailed dashboard
- PeriodSelector changes → re-compute all stats in place
- Scroll → see more charts

---

### 3.2 ProductionDashboardScreen

**Purpose:** Deep dive into harvest trends.

**Layout:**

```
┌────────────────────────────────────────┐
│ ← 🌾 Production                    [⚙️] │
├────────────────────────────────────────┤
│                                        │
│ [FilterBar: Jan—Juin | All Types]    │
│                                        │
│ Summary Cards:                         │
│  Total: 42.5 kg | Avg/plant: 3.5 kg   │
│  Top month: May (12.3 kg) | Trend: ↑  │
│                                        │
│ [Trend Chart: Line]                   │
│ Daily production over period           │
│ (Show: actual, moving avg, forecast)  │
│                                        │
│ [Pie Chart: By Plant Type]            │
│ Tomato 35% | Courgette 24% | etc     │
│                                        │
│ [Stacked Bar: By Type over Time]      │
│ Week view:                             │
│ Week 1: Tom(3)|Cor(2)|Poi(1) = 6kg    │
│ Week 2: Tom(4)|Cor(1.5)|Poi(0.5) = 6kg│
│                                        │
│ Details Table:                         │
│ [Sortable, Scrollable]                 │
│ Plant | Type | Weight | Date | Notes   │
│ Tomate#1 | Tom | 2.5kg | 2025-05-15   │
│ Courgette#2 | Cor | 1.8kg | 2025-05-14│
│                                        │
└────────────────────────────────────────┘
```

**Components:**
- `FilterBar`: Date range, plant type dropdown, reset button
- `StatCard` × 2: Total production, avg per plant
- `LineChart`: Daily/weekly trend (customizable period)
- `PieChart`: Distribution by plant type
- `StackedBarChart`: Weekly breakdown by type
- `FlatList` (virtualized): Detail table (sortable columns)

**Data Source:**
```typescript
interface ProductionData {
  totalKg: number;
  avgPerPlant: number;
  daily: { date: string; kg: number; forecast?: number }[];
  byType: { type: PlantType; kg: number; percentage: number }[];
  topMonth: { month: string; kg: number };
  trend: 'up' | 'stable' | 'down';
  entries: PlantEntry[]; // for table
}
```

---

### 3.3 WaterDashboardScreen

**Purpose:** Water usage insights, optimization tips.

**Layout:**

```
┌────────────────────────────────────────┐
│ ← 💧 Consommation d'eau          [⚙️] │
├────────────────────────────────────────┤
│                                        │
│ [FilterBar: Last 30 days | All Plants] │
│                                        │
│ Summary:                               │
│  Total: 186 L | Avg/day: 6.2 L        │
│  vs. Region: +8% | Trend: ↑ 12%       │
│                                        │
│ [Gauge: % vs Regional Avg]            │
│ [████████░░░░] 92%                    │
│ ⓘ You're using 92% of regional avg    │
│                                        │
│ [Line Chart: Daily Usage]             │
│ Peaks on hot days (>30°C)             │
│                                        │
│ [Stacked Bar: Water by Plant]         │
│ Tomate: 80L (43%)                     │
│ Courgette: 60L (32%)                  │
│ Poivron: 46L (25%)                    │
│                                        │
│ Recommendations:                       │
│ • Install drip for tomatoes (save 20%) │
│ • Water earlier (reduce evaporation)   │
│ • Next rain: 3 days (reduce by 30%)    │
│                                        │
│ Weather Correlation:                   │
│ [Bar: Temp/Humidity/Usage overlay]    │
│ Temp rises → usage rises (r=0.87)      │
│                                        │
└────────────────────────────────────────┘
```

**Components:**
- `FilterBar`: Date range, plant selector
- `StatCard` × 2: Total L, comparison to region
- `GaugeChart`: % of regional average
- `LineChart`: Daily water usage trend
- `StackedBarChart`: Water by plant type
- `TrendIndicator`: Usage trend vs time
- Recommendation list (static + dynamic from weather)

**Data Source:**
```typescript
interface WaterData {
  totalL: number;
  avgDailyL: number;
  regionAvgL: number;
  percentOfRegional: number;
  dailyUsage: { date: string; L: number; temp: number; humidity: number }[];
  byPlant: { plantId: string; plantName: string; L: number; percentage: number }[];
  recommendations: string[];
  trend: 'up' | 'stable' | 'down';
  peakDates: string[]; // dates with highest usage
}
```

---

### 3.4 HealthScoreDashboardScreen

**Purpose:** Garden health trends, risk indicators.

**Layout:**

```
┌────────────────────────────────────────┐
│ ← ❤️  Santé du jardin              [⚙️] │
├────────────────────────────────────────┤
│                                        │
│ Current Score:                         │
│  [████████░░] 76/100                  │
│  ↑ Stable | Last 30d: +2 pts           │
│                                        │
│ [Radar Chart: 5 dimensions]           │
│    ╱────────────╲                      │
│   ╱  Hydration  ╲                      │
│  ╱────────────────╲                    │
│  │                │ Engrais            │
│  │   Produc. 75%  │ 80%                │
│  │ 68%        60% │                    │
│  │   Santé        │                    │
│  │    82%         │                    │
│   ╲────────────────╱                   │
│    ╲──────────────╱                    │
│                                        │
│ Factor Scores:                         │
│  Hydration........68% ✓ Bon            │
│  Production.......75% ✓ Très bon       │
│  Nutrients........60% ⚠️ À améliorer   │
│  Health..........82% ✓ Excellent       │
│  Diversity.......70% ✓ Bon             │
│                                        │
│ [Heatmap: Plant Health by Day]        │
│ Week view (color intensity = health)   │
│         Mon Tue Wed Thu Fri Sat Sun     │
│ Tomate  🟩 🟨 🟥 🟩 🟩 🟩 🟩             │
│ Courgette 🟩 🟩 🟩 🟩 🟨 🟩 🟩          │
│ Poivron  🟨 🟨 🟩 🟩 🟩 🟩 🟩           │
│                                        │
│ Alerts:                                │
│ ⚠️ Poivron: 2 jours sans eau            │
│ ℹ️ Courgette: Récolte recommandée       │
│                                        │
│ 30-Day History:                        │
│ [Line Chart: Score progression]        │
│ Score curve with events marked         │
│                                        │
└────────────────────────────────────────┘
```

**Components:**
- Large `GaugeChart`: Current health score
- `RadarChart`: 5 dimensions (hydration, production, nutrients, health, diversity)
- Factor scores list with indicators
- `HeatmapChart`: Plant health daily grid
- Alerts/warnings banner
- `LineChart`: 30-day history with event markers

**Data Source:**
```typescript
interface HealthData {
  currentScore: number;
  trend: 'up' | 'stable' | 'down';
  trendPoints: number; // +2, -1, etc
  factors: {
    hydration: { score: number; status: 'excellent' | 'bon' | 'alerte' };
    production: { score: number; status: 'excellent' | 'bon' | 'alerte' };
    nutrients: { score: number; status: 'excellent' | 'bon' | 'alerte' };
    health: { score: number; status: 'excellent' | 'bon' | 'alerte' };
    diversity: { score: number; status: 'excellent' | 'bon' | 'alerte' };
  };
  dailyHeatmap: { date: string; plantId: string; healthPct: number }[];
  alerts: { type: 'warning' | 'info'; message: string; plantId?: string }[];
  history: { date: string; score: number; event?: string }[];
}
```

---

### 3.5 PlantDashboardScreen (Per-Plant Detail)

**Purpose:** Single plant deep dive.

**Layout:**

```
┌────────────────────────────────────────┐
│ ← 🍅 Tomate #1 (Cherry)           [Edit]│
├────────────────────────────────────────┤
│                                        │
│ [Plant Image / Icon]                   │
│ Planted: May 2 | Age: 16 days          │
│ Location: Lit #2, Row 3                │
│                                        │
│ Quick Status:                          │
│  Harvest: 5.2 kg | Health: 82/100     │
│  Last watered: 1 day ago               │
│  Next watering: 1 day (recommended)    │
│                                        │
│ [Comparison Card]                      │
│  Harvest: 5.2 kg vs Regional: 5 kg     │
│           [═════════════⬤  ] 104%      │
│  Health:  82/100 vs Historical: 78     │
│           [════════════⬤ ░] Good trend │
│                                        │
│ Growth Timeline:                       │
│ [Line Chart: Age → Health Score]       │
│ Start (70) → Now (82) | Projected: 85  │
│                                        │
│ Watering History:                      │
│ [Bar Chart: Last 14 days]              │
│ Mon(1.5L) Tue(--) Wed(1.5L) Thu(--) … │
│                                        │
│ Harvest Events:                        │
│ [Sortable Timeline]                    │
│ May 15: 2.5 kg Cherry tomatoes         │
│ May 18: 1.8 kg Cherry tomatoes         │
│ May 20: 0.9 kg Cherry tomatoes         │
│                                        │
│ Notes Journal:                         │
│ [FlatList: Recent entries]             │
│ May 20: Flowers forming on top branch  │
│ May 18: Minor yellowing on lower leaf  │
│ May 15: Pruned side shoots             │
│                                        │
│ Companion Plants:                      │
│ ✓ Basil (planted together)             │
│ ✓ Parsley (near)                       │
│ ⚠ Brassicas (avoid proximity)          │
│                                        │
│ Recommendations (AI):                  │
│ • Increase watering (heat forecasted)  │
│ • Top pruning in 5 days                │
│ • Harvest immediately when red         │
│                                        │
└────────────────────────────────────────┘
```

**Components:**
- Plant header (name, variety, age, location)
- Status cards (harvest kg, health score)
- `ComparisonCard`: vs regional avg + historical trend
- `LineChart`: Age/time-based growth health
- `BarChart`: Watering frequency (last 14 days)
- Harvest events list (sortable, expandable)
- Notes journal (`FlatList`, virtualized)
- Companion plants section
- AI recommendations (from `aiChat` service)

---

### 3.6 ComparisonDashboardScreen

**Purpose:** Cross-plant or cross-period comparison.

**Layout:**

```
┌────────────────────────────────────────┐
│ ← 🔍 Comparaisons                 [Filter]│
├────────────────────────────────────────┤
│                                        │
│ [FilterBar: Plot type]                 │
│  ○ Harvest comparison                  │
│  ○ Health comparison                   │
│  ○ Water efficiency                    │
│  ○ Period comparison (vs last month)   │
│                                        │
│ Harvest Comparison:                    │
│                                        │
│  [Bar Chart: Actual vs Regional]      │
│  Tomate     [██████████] 5.2kg         │
│             ─────────────              │
│             Regional:    5.0kg         │
│                                        │
│  Courgette  [███████████] 9.8kg        │
│             ─────────────              │
│             Regional:    8.0kg         │
│                                        │
│  Poivron    [████░░░░░░] 3.2kg         │
│             ─────────────              │
│             Regional:    4.0kg         │
│                                        │
│ Plant-to-Plant Efficiency:             │
│ [Table: sortable]                      │
│ Plant      | kg | Days | kg/day | vs avg│
│ Tomate#1   | 5.2 | 16  | 0.33  | +104% │
│ Courgette#2| 9.8 | 12  | 0.82  | +105% │
│ Poivron#1  | 3.2 | 20  | 0.16  | -80%  │
│                                        │
│ Water Efficiency (kg per liter):       │
│ [Bar Chart]                            │
│ Tomate: 0.028 kg/L (Good)              │
│ Courgette: 0.048 kg/L (Excellent)      │
│ Poivron: 0.018 kg/L (Needs optimization) │
│                                        │
│ Period Comparison (May vs April):      │
│ [Side-by-side Bar]                     │
│ Production: 42.5kg → 38.2kg  [↑ 11%]   │
│ Water:     186L → 178L       [↑ 4%]    │
│ Health:    76/100 → 73/100   [↑ 4%]    │
│                                        │
└────────────────────────────────────────┘
```

**Components:**
- `FilterBar`: Comparison type selector
- Multiple `ComparisonChart` or `BarChart` instances (dynamic)
- Sortable table (`FlatList` virtualized)
- `TrendIndicator` on each metric

---

## 4. COMPONENT LIBRARY

### Base Components

#### StatCard
```typescript
interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  unit?: string;
  trend?: { direction: 'up' | 'down' | 'stable'; percentage: number; color: string };
  comparison?: string;
  onPress?: () => void;
  style?: ViewStyle;
}
```

**Render:**
```
┌───────────────────┐
│ 📊 Production     │
│ 42.5 kg           │ [↑ 18%]
│ vs. last month    │
└───────────────────┘
```

---

#### ComparisonCard
```typescript
interface ComparisonCardProps {
  title: string;
  actual: number;
  regional: number;
  unit: string;
  percentage: number;
  status: 'excellent' | 'good' | 'warning' | 'alert';
}
```

---

#### TrendIndicator
```typescript
interface TrendIndicatorProps {
  trend: 'up' | 'down' | 'stable';
  percentage: number;
  label?: string;
  colorOverride?: string;
}
```

**Render:**
```
[↑ 18%] or [↓ 5%] or [→ stable]
```

---

### Chart Components

#### LineChart
```typescript
interface LineChartProps {
  data: { x: string; y: number; label?: string }[];
  height?: number;
  yAxisLabel?: string;
  showGrid?: boolean;
  showForecast?: boolean;
  forecastData?: { x: string; y: number }[];
  touchEnabled?: boolean;
}
```

**Features:**
- Responsive width (flex: 1)
- Touch tooltips
- Smooth curves
- Multiple series support
- Forecast zone (lighter color, dashed)

---

#### BarChart (Enhanced)
```typescript
interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  variant?: 'grouped' | 'stacked';
  showValues?: boolean;
  horizontal?: boolean; // for long labels
}
```

---

#### PieChart
```typescript
interface PieChartProps {
  data: { label: string; value: number; color?: string }[];
  donut?: boolean;
  centerLabel?: string;
  showLegend?: boolean;
  height?: number;
}
```

---

#### StackedBarChart
```typescript
interface StackedBarChartProps {
  data: {
    label: string;
    segments: { name: string; value: number; color: string }[];
  }[];
  height?: number;
  showLegend?: boolean;
  stacked?: 'absolute' | 'percentage';
}
```

---

#### HeatmapChart
```typescript
interface HeatmapChartProps {
  data: {
    row: string; // plant name
    columns: {
      col: string; // date
      value: number; // 0-100 health %
    }[];
  }[];
  colorScheme?: 'health' | 'performance';
  cellSize?: number;
}
```

**Render:**
```
        Mon Tue Wed Thu Fri Sat Sun
Tomato  🟩 🟨 🟥 🟩 🟩 🟩 🟩
Courgette🟩 🟩 🟩 🟩 🟨 🟩 🟩
Poivron 🟨 🟨 🟩 🟩 🟩 🟩 🟩
```

---

#### RadarChart
```typescript
interface RadarChartProps {
  dimensions: {
    label: string;
    score: number; // 0-100
    color?: string;
  }[];
  height?: number;
  showGrid?: boolean;
}
```

---

#### GaugeChart (Enhanced)
```typescript
interface GaugeChartProps {
  score: number; // 0-100
  label: string;
  size?: 'small' | 'medium' | 'large';
  thresholds?: {
    excellent: number; // e.g. 75
    good: number;      // e.g. 50
    warning: number;   // e.g. 25
  };
}
```

---

### Utility Components

#### FilterBar
```typescript
interface FilterBarProps {
  dateRange?: { start: string; end: string };
  onDateChange?: (start: string, end: string) => void;
  plantTypeFilter?: PlantType[];
  onPlantTypeChange?: (types: PlantType[]) => void;
  plantIds?: string[];
  onPlantChange?: (ids: string[]) => void;
  onReset?: () => void;
}
```

**Render:**
```
[📅 Jan—Juin] [🌿 All Types ▼] [⟲ Reset]
```

---

#### PeriodSelector
```typescript
interface PeriodSelectorProps {
  selected: 'week' | 'month' | 'season' | 'year';
  onChange: (period: 'week' | 'month' | 'season' | 'year') => void;
}
```

**Render:**
```
[Week] [Month] [Season] [Year]
```

---

## 5. DATA COMPUTATION LAYER

### `dashboardAggregation.ts` Service

```typescript
// Production metrics
export function getProductionData(
  entries: PlantEntry[],
  plants: Plant[],
  dateRange: DateRange,
  plantTypes?: PlantType[],
): ProductionData;

// Water analytics
export function getWaterData(
  plants: Plant[],
  entries: PlantEntry[],
  weather: WeatherData,
  dateRange: DateRange,
): WaterData;

// Health scoring (per plant, whole garden)
export function getHealthData(
  plants: Plant[],
  entries: PlantEntry[],
  weather: WeatherData,
): HealthData;

// Per-plant detail
export function getPlantDashboardData(
  plant: Plant,
  entries: PlantEntry[],
  plants: Plant[],
  weather: WeatherData,
  regionalAverages: Record<PlantType, number>,
): PlantDashboardData;

// Comparisons
export function getComparisonData(
  plants: Plant[],
  entries: PlantEntry[],
  type: 'harvest' | 'health' | 'water-efficiency' | 'period',
  dateRange: DateRange,
): ComparisonData;
```

---

## 6. INTEGRATION WITH EXISTING CODE

### 1. Update Navigation Structure

**File:** `src/navigation/index.tsx`

Add new tab (or restructure):
```tsx
<Tab.Screen
  name="Stats"
  component={DashboardHomeScreen}
  options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} /> }}
/>
```

Then:
```tsx
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
```

---

### 2. Extend Zustand Store

**File:** `src/store/useStore.ts`

Add dashboard state:
```typescript
interface DashboardState {
  dashboardFilter: {
    dateRange: { start: string; end: string };
    plantTypes: PlantType[];
    period: 'week' | 'month' | 'season' | 'year';
  };
  setDashboardFilter: (filter: Partial<DashboardFilter>) => void;
}
```

---

### 3. Update Store Computations

All refresh functions should call `updateDashboardCache()` at the end:
```typescript
// In refreshRecommendations(), add:
updateDashboardCache();

// New function:
const updateDashboardCache = () => {
  // Pre-compute production, water, health data for fast dashboard loads
  const prodData = getProductionData(...);
  const waterData = getWaterData(...);
  const healthData = getHealthData(...);
  // Store in state or AsyncStorage
};
```

---

## 7. MOBILE-FIRST & ACCESSIBILITY DESIGN

### Font Sizes (Accessible)

```typescript
// WCAG AA compliant: min 12pt (16px)
const accessibleTypography = {
  h1: { fontSize: 28, fontWeight: '700' }, // 21pt
  h2: { fontSize: 22, fontWeight: '600' }, // 16.5pt
  h3: { fontSize: 18, fontWeight: '600' }, // 13.5pt
  body: { fontSize: 15, fontWeight: '400' }, // 11.25pt (border: min 12pt)
  caption: { fontSize: 12, fontWeight: '400' }, // 9pt for secondary info
  label: { fontSize: 13, fontWeight: '500' }, // 9.75pt
};
// Touch targets: 44×44pt min
```

### Dark Mode Support

Add to `theme.ts`:
```typescript
export const darkColors = {
  primary: '#52B788',
  background: '#0F1419',
  surface: '#1B2433',
  text: '#E8F0E5',
  border: '#2D4A4A',
  // ...
};

// Use: `useColorScheme()` from React Native
```

### Scrolling & Virtualization

```typescript
// All lists > 20 items use FlatList with:
<FlatList
  data={data}
  renderItem={({ item }) => <ItemComponent item={item} />}
  keyExtractor={(item) => item.id}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  initialNumToRender={10}
/>
```

---

## 8. PERFORMANCE CHECKLIST

- [ ] All charts use `memo` + shallow comparison
- [ ] Heavy computations (aggregations) done in service layer, not render
- [ ] Dashboard data cached in AsyncStorage, invalidated only on plant/entry changes
- [ ] All `FlatList` are virtualized (max 20 visible items)
- [ ] Images lazy-loaded (if plant photos added later)
- [ ] Charts use native reanimated (or simple RN) — no heavy libraries
- [ ] Date range filtering done at data load time, not in render loop

---

## 9. QUICK START CHECKLIST

1. **Create chart components:**
   - `LineChart.tsx`
   - `PieChart.tsx`
   - `StackedBarChart.tsx`
   - `HeatmapChart.tsx` (optional, RadarChart)

2. **Create dashboard components:**
   - `StatCard.tsx`
   - `ComparisonCard.tsx`
   - `FilterBar.tsx`
   - `PeriodSelector.tsx`
   - `TrendIndicator.tsx`

3. **Create screen stubs:**
   - `DashboardHomeScreen.tsx`
   - `ProductionDashboardScreen.tsx`
   - `WaterDashboardScreen.tsx`
   - `HealthScoreDashboardScreen.tsx`
   - `PlantDashboardScreen.tsx` (enhance existing)
   - `ComparisonDashboardScreen.tsx`

4. **Create service:**
   - `dashboardAggregation.ts` (compute all metrics)

5. **Update navigation:**
   - Add `DashboardStack` to `index.tsx`
   - Add Stats tab

6. **Test:**
   - Seed data in store (via mock plant entries)
   - Navigate, tap cards, change filters
   - Check performance (FlatList virtualization)
   - Dark mode toggle

---

## 10. DESIGN TOKENS (Existing + New)

### Colors (from `theme.ts`, keep unchanged)
```
Primary: #2D6A4F (Forest green)
Accent: #D4A017 (Gold) for trends
Success: #40916C (Bright green) for ↑
Warning: #E76F51 (Orange) for alerts
Error: #C62828 (Red) for ↓
```

### Spacing (keep existing)
```
xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48
```

### Chart Colors (new palette)
```typescript
export const chartPalette = {
  series1: '#2D6A4F',   // primary
  series2: '#52B788',   // primary light
  series3: '#D4A017',   // accent
  series4: '#40916C',   // success
  series5: '#E76F51',   // warning
  grid: '#B7E4C7',      // border
  text: '#1B4332',      // text
};
```

---

## 11. API & External Integration

**For future features:**
- Weather correlation chart (already have `WeatherData`)
- Forecast overlay (OpenWeatherMap 5-day forecast)
- Regional comparison database (static `REGIONAL_AVERAGES` in `statistics.ts`)
- AI recommendations (hook into `aiChat.ts` service)

---

## Summary Table

| Screen | Data Source | Primary Chart | Key Components |
|--------|-------------|---------------|-----------------|
| DashboardHome | `StatsData` + `ProductionData` | BarChart (6mo) | StatCard×3, ComparisonCard |
| ProductionDashboard | `ProductionData` | LineChart + PieChart | FilterBar, BarChart, FlatList |
| WaterDashboard | `WaterData` | LineChart (daily) + StackedBar | GaugeChart, Recommendations |
| HealthScoreDashboard | `HealthData` | RadarChart + HeatmapChart | GaugeChart, Timeline |
| PlantDashboard | Per-plant aggregation | LineChart (growth) + BarChart (watering) | ComparisonCard, Journal |
| ComparisonDashboard | `ComparisonData` | BarChart (grouped/stacked) | FilterBar, SortableTable |

