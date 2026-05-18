# Dashboard Architecture - Executive Summary

## Overview

Complete UX design for advanced garden analytics dashboards in React Native/Expo. Mobile-first, dark mode compatible, performance-optimized (virtualized lists, SVG charts).

**Scope:** 6 new screens + 15 reusable components + 1 data aggregation service
**Timeline:** 8 weeks full-time (MVP: 2–4 weeks)
**Effort:** ~400–600 development hours

---

## Architecture at a Glance

### Navigation Structure

```
Bottom Tabs
├── 🏠 Home (existing)
├── 🌱 Garden (existing stack)
├── 📊 Stats (NEW: Dashboard stack)
│   ├── Dashboard Home (overview hub)
│   ├── Production Dashboard (harvest trends)
│   ├── Water Dashboard (consumption analysis)
│   ├── Health Score Dashboard (garden health)
│   ├── Plant Dashboard (per-plant deep dive)
│   └── Comparison Dashboard (cross-plant/period)
├── 🗓️ Tasks (existing)
└── ⚙️ Settings (existing)
```

### Component Hierarchy

```
Charts Library (6):
  ├── LineChart (curves, forecast overlay)
  ├── BarChart (enhanced)
  ├── PieChart (proportions)
  ├── StackedBarChart (composition)
  ├── HeatmapChart (grid, color intensity)
  └── RadarChart (5-dimensional, optional)

Dashboard Components (6):
  ├── StatCard (KPI display)
  ├── ComparisonCard (vs regional avg)
  ├── TrendIndicator (↑↓→ + %)
  ├── FilterBar (date/type selectors)
  ├── PeriodSelector (Week/Month/Season/Year)
  └── MiniTrendCard (sparkline, optional)
```

---

## Data Flow

```
Plants + Entries + Weather
        ↓
dashboardAggregation.ts
        ↓
ProductionData, WaterData, HealthData, ComparisonData
        ↓
Zustand Store (with selectors)
        ↓
Dashboard Screens (connect via hooks)
        ↓
Charts + Tables (rendered)
```

### Key Service Functions

```typescript
getProductionData()     // kg totals, daily curve, by-type distribution
getWaterData()          // L totals, daily usage, plant breakdown, recommendations
getHealthData()         // 5 factor scores, daily heatmap, alerts, 30-day history
getPlantDashboardData() // growth curve, watering history, harvest timeline
getComparisonData()     // plant-to-plant efficiency, period-to-period
```

---

## Screen Details

| Screen | Purpose | Key Charts | Status |
|--------|---------|-----------|--------|
| **Dashboard Home** | Overview hub, quick scan | BarChart (6mo), 3 StatCards | Gateway to all dashboards |
| **Production Dashboard** | Harvest analysis | LineChart, PieChart, StackedBar, Table | Detailed production insights |
| **Water Dashboard** | Water usage optimization | GaugeChart, LineChart, StackedBar | Conservation tips |
| **Health Score Dashboard** | Garden wellness | RadarChart, Heatmap, LineChart | Trend tracking |
| **Plant Dashboard** | Single plant deep dive | LineChart (growth), BarChart (watering) | Detailed per-plant metrics |
| **Comparison Dashboard** | Cross-plant/period | BarChart (grouped), Table (sortable) | Benchmarking |

---

## Layout Pattern (Mobile-First)

All screens follow consistent pattern:

```
Header (48px)
├── Back button + Title + Actions

Filter/Controls (56px, optional)
├── Date range, Type selector, Reset

ScrollView (flex)
├── Summary cards (StatCard, 80px)
├── Chart 1 (200–240px)
├── Chart 2 (180–240px)
├── Detail table (virtualized FlatList)
└── Spacing (32px bottom for tab bar)
```

**Mobile Constraints:**
- Min screen width: 375px (iPhone SE)
- Card padding: 16px
- Chart heights: 180–240px (avoid overwhelming)
- Touch targets: 44×44pt minimum
- Font min: 12pt (WCAG AA)

---

## Component Specifications

### Charts (Pure SVG, No External Lib)

| Chart | Features | Use Cases |
|-------|----------|-----------|
| **LineChart** | Grid, axis labels, points, forecast zone, smooth curves | Daily production, water usage, health trends |
| **BarChart** | Grouped/stacked, values, grid | Monthly production, plant efficiency |
| **PieChart** | Slices, legend, donut mode, center label | Plant type distribution |
| **StackedBarChart** | Segments, percentage/absolute, legend | Water by plant type, harvest by week |
| **HeatmapChart** | Color intensity, scrollable grid | Daily plant health grid (7–30 days) |
| **RadarChart** | 5 dimensions, polygon fill, grid | Garden health (5 factors) |

### UI Components (Composable)

| Component | Props | Render |
|-----------|-------|--------|
| **StatCard** | icon, label, value, unit, trend, comparison | Card + trend badge + optional onPress |
| **ComparisonCard** | title, actual, regional, unit, percentage, status | Bar fill + status color |
| **TrendIndicator** | trend (up/down/stable), percentage | Badge with icon + % |
| **FilterBar** | dateRange, plantTypes, onReset | Date button, type dropdown, reset icon |
| **PeriodSelector** | selected, onChange | 4 tab buttons (Week/Month/Season/Year) |
| **MiniTrendCard** | label, sparkline data | Compact trend summary |

---

## Data Aggregation (Service Layer)

All computations happen in `dashboardAggregation.ts` — **screens only render**, no logic.

### Inputs
- `entries: PlantEntry[]` — harvest & notes
- `plants: Plant[]` — current plants
- `weather: WeatherData` — current + forecast
- `dateRange: { start, end }` — filter
- `plantTypes: PlantType[]` — filter

### Outputs (Typed Interfaces)

```typescript
interface ProductionData {
  totalKg: number;
  avgPerPlant: number;
  daily: { date: string; kg: number; forecast?: number }[];
  byType: { type: PlantType; kg: number; percentage: number }[];
  topMonth: { month: string; kg: number };
  trend: 'up' | 'stable' | 'down';
  entries: PlantEntry[]; // for detail table
}

interface WaterData {
  totalL: number;
  avgDailyL: number;
  regionAvgL: number;
  percentOfRegional: number;
  dailyUsage: { date: string; L: number; temp: number; humidity: number }[];
  byPlant: { plantId: string; plantName: string; L: number; percentage: number }[];
  recommendations: string[];
  trend: 'up' | 'stable' | 'down';
  peakDates: string[];
}

interface HealthData {
  currentScore: number;
  trend: 'up' | 'stable' | 'down';
  trendPoints: number;
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

## Accessibility & Dark Mode

### WCAG AA Compliance

- ✅ **Color contrast:** All text ≥ 4.5:1 ratio
- ✅ **Font sizes:** Minimum 12pt (16px) for body text
- ✅ **Touch targets:** All interactive elements ≥ 44×44pt
- ✅ **Color not sole indicator:** Icons + text for status
- ✅ **Semantic labels:** All buttons have meaningful labels

### Dark Mode

```typescript
// Existing theme colors work well in dark mode (high contrast)
// If needed, add dark variants:
export const darkColors = {
  primary: '#52B788',      // lighter green
  background: '#0F1419',   // dark navy
  surface: '#1B2433',      // dark gray
  text: '#E8F0E5',         // light cream
  border: '#2D4A4A',       // muted teal
  // etc.
};
```

---

## Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| **Chart render** | < 500ms | SVG, no animations initially |
| **Store selector** | < 50ms | Memoized, shallow comparison |
| **FlatList scroll** | 60 FPS | Virtualization from 20+ items |
| **Screen nav transition** | 300ms | Native stack navigator |
| **Bundle size add** | < 50KB | Charts are pure SVG (no libs) |

---

## Zustand Integration

### New Store State

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

### Store Changes (Minimal)

1. Add filter state + setter
2. Add computed selectors that call `getProductionData()`, etc.
3. Call `updateDashboardCache()` at end of `refreshRecommendations()`
4. (Optional) Cache results in AsyncStorage for instant loads

**No changes to existing state structure** — backward compatible.

---

## Navigation Changes

**File:** `src/navigation/index.tsx`

Add new stack and tab:

```typescript
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

// In TabNavigator:
<Tab.Screen
  name="Stats"
  component={DashboardStack}
  options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} /> }}
/>
```

---

## Implementation Phases

### Phase 1: Charts & Base Components (Week 1–2)
- 6 chart components (SVG)
- 6 dashboard components (UI atoms)
- All tested with mock data

### Phase 2: Data Service (Week 2–3)
- `dashboardAggregation.ts` (all aggregation logic)
- Unit tests for each function
- Integration with Zustand

### Phase 3: Screens (Week 4–5)
- 5 new screens (DashboardHome, Production, Water, Health, Comparison)
- Enhance PlantDetailScreen
- Connect to Zustand + navigation

### Phase 4: Polish & Testing (Week 6–8)
- Performance optimization (virtualization, memoization)
- Dark mode compliance
- Accessibility audit
- Final QA on device

**MVP (2–4 weeks):** DashboardHome + 3 detail screens (Production, Water, Health)

---

## File Structure

```
src/components/
├── charts/
│   ├── LineChart.tsx
│   ├── PieChart.tsx
│   ├── StackedBarChart.tsx
│   ├── HeatmapChart.tsx
│   └── RadarChart.tsx (optional)
│
└── dashboard/
    ├── StatCard.tsx
    ├── ComparisonCard.tsx
    ├── TrendIndicator.tsx
    ├── FilterBar.tsx
    └── PeriodSelector.tsx

src/screens/
├── DashboardHomeScreen.tsx
├── ProductionDashboardScreen.tsx
├── WaterDashboardScreen.tsx
├── HealthScoreDashboardScreen.tsx
├── PlantDashboardScreen.tsx (enhance)
└── ComparisonDashboardScreen.tsx

src/services/
└── dashboardAggregation.ts

src/navigation/
└── index.tsx (add DashboardStack)
```

---

## Key Design Decisions

1. **No external chart library** → Pure SVG for lightweight bundle & flexibility
2. **Service layer for all logic** → Screens are dumb, data aggregation centralized
3. **Zustand selectors** → Reactive, efficient state management
4. **FlatList virtualization** → Handles 500+ entries without lag
5. **Mobile-first layout** → 375px baseline, responsive spacing
6. **Dark mode from day 1** → Built into color scheme
7. **Consistent navigation** → Stack in tabs, back button always available

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Performance on large datasets | Caching, FlatList virtualization, memoization |
| SVG rendering overhead | Test with 6-month data early, profile in React Profiler |
| Dark mode inconsistencies | Automated contrast check, manual testing |
| State consistency | Unit tests on aggregation functions, Zustand snapshot tests |
| Navigation state loss | useFocusEffect to refresh on screen focus |

---

## Success Criteria

✅ All 6 screens render without lag (< 500ms initial load)
✅ Dark mode fully compliant (WCAG AA contrast)
✅ FlatList scrolls 500+ items at 60 FPS
✅ Filtering updates all charts in place (< 100ms)
✅ Navigation transitions smooth (no jank)
✅ All new components tested with mock data
✅ Documentation complete (for future maintenance)

---

## Documentation Files

| File | Purpose |
|------|---------|
| `DASHBOARDS_ARCHITECTURE.md` | Full system design, data flow, component specs |
| `DASHBOARDS_COMPONENTS.md` | Detailed component props, code examples, reusable UI |
| `DASHBOARDS_WIREFRAMES.md` | ASCII wireframes, layout patterns, touch hotspots |
| `DASHBOARDS_IMPLEMENTATION.md` | Step-by-step implementation roadmap, testing strategy |
| `DASHBOARDS_EXECUTIVE_SUMMARY.md` | This file — high-level overview |

---

## Next Steps

1. **Approval:** Review this design with team
2. **Prioritization:** Decide MVP scope (2 vs 6 screens)
3. **Sprint Planning:** Assign Week 1 tasks (charts, components)
4. **Development:** Follow implementation roadmap
5. **Testing:** Mobile device testing throughout
6. **Launch:** Gradual rollout (MVP first, then full dashboards)

---

## Questions Answered

**Q: Will this slow down the app?**
→ No. Charts are lightweight SVG, FlatList is virtualized, store selectors are memoized. Performance targets: < 500ms chart render, 60 FPS list scroll.

**Q: How does dark mode work?**
→ Existing color scheme is high contrast already. Use `useColorScheme()` hook to swap theme, all components respect it.

**Q: Can I add/remove screens later?**
→ Yes. Navigation is a stack, data service is modular, components are reusable. Easy to add new dashboards.

**Q: How many hours of work?**
→ 400–600 hours (8 weeks 1 engineer). MVP: 100–150 hours (2 weeks).

**Q: Will existing screens break?**
→ No. All changes are additive. Existing HomeScreen, GardenScreen, SettingsScreen unchanged.

---

## Contact / Responsibility

- **Design:** UX/UI guidelines above, follow WCAG AA & mobile-first constraints
- **Implementation:** Follow roadmap phases, test on device, report blockers early
- **Maintenance:** Component library documented for future use, service layer isolated for easy updates

---

**Ready to build. Let's ship beautiful dashboards.** 🚀

