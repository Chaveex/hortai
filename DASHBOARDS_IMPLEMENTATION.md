# Dashboard Implementation Roadmap

## Phase 1: Foundation (Charts & Base Components)

### Week 1: Chart Library

**Priority:** HIGH (blocks all screens)

1. **LineChart.tsx**
   - Implement SVG-based curve rendering
   - Support: grid lines, axis labels, data points, forecast zone
   - Test with: 6-month production data
   - No external chart lib (keep bundle light)

2. **BarChart.tsx** (Enhanced)
   - Existing component: add `showValues`, `horizontal` variant
   - Test with existing stats screen

3. **PieChart.tsx**
   - SVG path slicing algorithm
   - Support: donut mode, legend, center label
   - Test data: production by plant type

4. **StackedBarChart.tsx**
   - Segments stacked vertically per bar
   - Support: percentage/absolute variant
   - Test data: water by plant type over weeks

5. **HeatmapChart.tsx**
   - Color-coded grid cells
   - Support: plant health daily view
   - Scrollable horizontally (7+ days)

6. **GaugeChart.tsx** (Enhanced)
   - Existing: add threshold colors, improve label
   - Support: health score 0-100

**Deliverable:** `src/components/charts/` folder with 6 components, all tested with mock data

---

### Week 2: Dashboard Components

**Priority:** HIGH

1. **StatCard.tsx**
   - Icon + label + value + unit + trend badge
   - Pressable, optional onPress handler
   - Test: 3 cards in a row layout

2. **ComparisonCard.tsx**
   - Actual vs regional bar + percentage
   - Status color badge (excellent/good/warning)
   - Reusable across dashboards

3. **TrendIndicator.tsx**
   - Small badge: ↑↓→ + percentage
   - Color-coded (success/warning/accent)

4. **FilterBar.tsx**
   - Date range picker button
   - Plant type multi-select dropdown
   - Reset button
   - Styling consistent with app

5. **PeriodSelector.tsx**
   - 4 tabs: Week/Month/Season/Year
   - Tab-like appearance, animated switch
   - onChange callback

6. **MiniTrendCard.tsx** (Optional, nice-to-have)
   - Sparkline + label
   - Shows trend at a glance

**Deliverable:** `src/components/dashboard/` folder with reusable UI components

---

## Phase 2: Data Aggregation Service

### Week 2-3: dashboardAggregation.ts

**Priority:** HIGH (blocks screens)

```typescript
// Services layer computations

// 1. Production metrics
export function getProductionData(
  entries: PlantEntry[],
  plants: Plant[],
  dateRange: { start: string; end: string },
  plantTypes?: PlantType[],
): ProductionData {
  // Calculate:
  // - totalKg
  // - avgPerPlant
  // - daily trend (array for LineChart)
  // - byType distribution (array for PieChart)
  // - topMonth
  // - trend direction
  return {...}
}

// 2. Water consumption analytics
export function getWaterData(
  plants: Plant[],
  entries: PlantEntry[],
  weather: WeatherData,
  dateRange: DateRange,
): WaterData {
  // Calculate:
  // - totalL
  // - avgDailyL
  // - regionAvgL
  // - percentOfRegional
  // - dailyUsage curve
  // - byPlant breakdown
  // - recommendations (static + dynamic from weather)
  return {...}
}

// 3. Health scoring (enhance existing calculation)
export function getHealthData(
  plants: Plant[],
  entries: PlantEntry[],
  weather: WeatherData,
): HealthData {
  // Return:
  // - currentScore
  // - 5 factor scores (hydration, production, nutrients, health, diversity)
  // - dailyHeatmap
  // - alerts
  // - 30-day history
  return {...}
}

// 4. Per-plant detail aggregation
export function getPlantDashboardData(
  plant: Plant,
  entries: PlantEntry[],
  plants: Plant[],
  weather: WeatherData,
  regionalAverages: Record<PlantType, number>,
): PlantDashboardData {
  // Growth curve
  // Watering history
  // Harvest timeline
  // Journal entries
  return {...}
}

// 5. Comparisons
export function getComparisonData(
  plants: Plant[],
  entries: PlantEntry[],
  type: 'harvest' | 'health' | 'water-efficiency' | 'period',
  dateRange: DateRange,
): ComparisonData {
  return {...}
}
```

**Tests:**
- Unit test each function with mock plant/entry data
- Verify calculations (kg totals, percentages, trends)
- Performance: all aggregations < 100ms

**Deliverable:** Service module fully typed, exported, tested

---

## Phase 3: Screen Implementation

### Week 4-5: Core Screens

**Priority:** HIGH → MEDIUM

#### DashboardHomeScreen.tsx

**Dependencies:** 
- ✅ StatCard, ComparisonCard, BarChart
- ✅ getProductionData, getWaterData, getHealthData

**Implementation:**
1. Wrap in SafeAreaView + ScrollView
2. Add PeriodSelector (Week/Month/Season/Year) at top
3. Render 3 StatCards (Production, Water, Health) with onPress handlers
4. Render ComparisonCard for top plants (scrollable or collapsed)
5. Render BarChart for 6-month production
6. Connect to Zustand store for data
7. Add RefreshControl

**Test:**
- Tap on each StatCard → navigate to detail dashboard
- Change period → re-compute all stats (via Zustand)
- Scroll smooth, no lag

---

#### ProductionDashboardScreen.tsx

**Dependencies:**
- ✅ FilterBar, BarChart, PieChart, StackedBarChart, LineChart
- ✅ getProductionData
- FlatList (for detail table)

**Implementation:**
1. Header + Back button
2. FilterBar (date range, plant types, reset)
3. Summary cards (total kg, trend)
4. LineChart (daily production, optional forecast)
5. PieChart (distribution by type)
6. StackedBarChart (weekly breakdown)
7. FlatList (harvest detail table, virtualized, sortable)

**Test:**
- Filter by date range → table updates
- Filter by plant type → charts update
- Scroll detail table, check virtualization (50+ entries)
- Tap table row → PlantDashboard

---

#### WaterDashboardScreen.tsx

**Dependencies:**
- ✅ FilterBar, LineChart, GaugeChart, StackedBarChart
- ✅ getWaterData

**Implementation:**
1. Header + FilterBar
2. Summary cards (total L, trend)
3. GaugeChart (% of regional average)
4. LineChart (daily usage)
5. StackedBarChart (water by plant type)
6. Recommendations list (static bullet points + dynamic)

**Test:**
- Chart correlations: high temp → high water usage
- Recommendations appear dynamically (based on weather + plant data)

---

#### HealthScoreDashboardScreen.tsx

**Dependencies:**
- ✅ GaugeChart, RadarChart (optional), HeatmapChart, LineChart
- ✅ getHealthData

**Implementation:**
1. Header
2. Large gauge (current score)
3. RadarChart (5 factors) OR 5 individual gauge charts (simpler)
4. Factor scores list (5 rows with status badges)
5. HeatmapChart (plant health grid, 7–30 days)
6. Alerts section (warnings + info)
7. LineChart (30-day history with event markers)

**Test:**
- Heatmap scrolls horizontally
- Alerts populated from plant data
- Color coding reflects health % (80–100 green, etc.)

---

#### PlantDashboardScreen.tsx (Enhance Existing)

**Current:** Basic plant detail screen
**New additions:**
- Growth curve (LineChart: age → health)
- Watering history (BarChart: 14 days)
- Comparison card (vs regional avg)
- AI recommendations section (from `aiChat` service, or static tips)
- Expand "Notes" section with full journal

**Implementation:**
1. Replace placeholder with real components
2. Add ComparisonCard for harvest vs region
3. Add LineChart for growth trend
4. Add BarChart for watering schedule
5. Enhance notes journal (FlatList, sortable by date)
6. Add AI recommendations (loop from `getAIRecommendations()` in service)

**Test:**
- All plant types render correctly
- Charts scale to phone width
- Notes expand/collapse
- Tap AI recommendation → open modal (optional detail)

---

#### ComparisonDashboardScreen.tsx

**Dependencies:**
- ✅ FilterBar, ComparisonCard, BarChart, FlatList
- ✅ getComparisonData

**Implementation:**
1. Header + Filter selector (radio buttons)
2. Multiple ComparisonCard instances (based on selected type)
3. Sortable detail table (efficiency metrics)
4. Charts (grouped/stacked bar for period comparison)

**Test:**
- Switch between comparison types → UI updates
- Table sorting works (tap header)

---

### Week 6: Navigation & Integration

**Priority:** HIGH

**File:** `src/navigation/index.tsx`

1. Create `DashboardStack()` navigator
2. Add 6 screens to stack
3. Add to Tab.Navigator as new "📊 Stats" tab
4. OR integrate into existing "Jardin" tab (as substacks)

**Option A: New Stats Tab (Recommended)**
```tsx
<Tab.Screen
  name="Stats"
  component={DashboardStack}
  options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} /> }}
/>
```

**Option B: Integrated into Garden Tab**
```tsx
// GardenStack includes:
<Stack.Screen name="GardenOverview" component={DashboardHomeScreen} />
<Stack.Screen name="ProductionDashboard" component={ProductionDashboardScreen} />
// etc.
```

**Tests:**
- All navigation transitions work
- Back button correctly pops screen
- Tab switching preserves scroll position (ScrollView state)

---

## Phase 4: Zustand Store Integration

### Week 4-5 (Parallel): Store Enhancements

**File:** `src/store/useStore.ts`

1. Add dashboard filter state:
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

2. Add computed selectors:
```typescript
const productionData = useSelector(state => 
  getProductionData(
    state.entries,
    state.plants,
    state.dashboardFilter.dateRange,
    state.dashboardFilter.plantTypes,
  )
);
```

3. Add refresh trigger in `refreshRecommendations()`:
```typescript
// After computing recommendations, trigger dashboard cache update
updateDashboardCache();
```

4. (Optional) Cache results in AsyncStorage for fast loads:
```typescript
const updateDashboardCache = async () => {
  const prodData = getProductionData(...);
  await AsyncStorage.setItem('dashboardCache_production', JSON.stringify(prodData));
};
```

**Test:**
- Filtering updates all dependent screens
- Cache invalidates on plant/entry changes
- Performance: store selectors respond < 50ms

---

## Phase 5: Polish & Performance

### Week 7: Testing & Optimization

**Checklist:**

1. **Performance:**
   - [ ] All charts render < 500ms
   - [ ] FlatList virtualization working (scroll 100+ items smoothly)
   - [ ] Store selectors memoized
   - [ ] No unnecessary re-renders (React DevTools Profiler)

2. **Dark Mode:**
   - [ ] All colors adapt (use `useColorScheme()`)
   - [ ] Contrast ratios checked (WCAG AA)
   - [ ] Charts readable in dark mode

3. **Accessibility:**
   - [ ] Font sizes ≥ 12pt (except secondary labels)
   - [ ] Touch targets ≥ 44×44pt
   - [ ] Semantic labels on all interactive elements
   - [ ] Color not sole indicator (use text + icons)

4. **Mobile Edge Cases:**
   - [ ] Test on small screen (iPhone SE 375px)
   - [ ] Test with notch/dynamic island
   - [ ] Landscape orientation (optional)
   - [ ] Network lag (slow data loading)

5. **Data Validation:**
   - [ ] Null/empty states handled (empty charts show message)
   - [ ] Invalid dates gracefully fail
   - [ ] Division by zero prevented

6. **Navigation:**
   - [ ] Back gesture works (iOS)
   - [ ] Screen transitions smooth
   - [ ] No memory leaks (unsubscribe from streams)

**Tools:**
- React DevTools Profiler (check render times)
- Lighthouse (bundle size, accessibility)
- Manual testing on physical device

---

## Phase 6: Polish & Documentation

### Week 7-8: Final Touches

1. **Animations (Optional):**
   - Fade-in for charts (React Native Reanimated)
   - Smooth period selector transition
   - Expand/collapse animations on list items

2. **Edge Cases:**
   - Empty data states (no harvests → show placeholder)
   - Single plant (comparison cards show "only plant" message)
   - Future dates (forecast mode)

3. **Tooltips & Help:**
   - Info icons (ⓘ) next to metrics with explanations
   - Long-press for details (optional)

4. **Localization:**
   - All strings already in French (good)
   - Number formatting (decimal separator)
   - Date formatting (DD/MM/YYYY)

5. **Documentation:**
   - Update CLAUDE.md with dashboard paths
   - Component storybook (optional)
   - API docs for `dashboardAggregation.ts`

---

## Implementation Timeline

```
Week 1: Charts library (LineChart, PieChart, StackedBar, Heatmap, Gauge)
Week 2: Dashboard components (StatCard, ComparisonCard, FilterBar, etc.)
Week 2-3: Data aggregation service (dashboardAggregation.ts)
Week 4-5: Core screens (DashboardHome, ProductionDash, WaterDash, HealthDash)
Week 4-5: Zustand integration (filter state, selectors)
Week 5-6: Plant & Comparison dashboards, Navigation setup
Week 7: Testing, performance optimization, dark mode
Week 8: Polish, documentation, final QA

Total: 8 weeks (1 engineer, full-time)
Minimum viable (MVP): 4 weeks (DashboardHome + 3 detail screens)
```

---

## Implementation Order (Dependency-First)

**If prioritizing MVP (4 weeks):**

1. **Charts:** LineChart, BarChart (enhance), GaugeChart (enhance) — **3 days**
2. **Components:** StatCard, FilterBar, PeriodSelector — **2 days**
3. **Service:** getProductionData, getWaterData, getHealthData — **2 days**
4. **Screens:** DashboardHomeScreen, ProductionDashboard, HealthScoreDashboard — **5 days**
5. **Integration:** Navigation, Zustand, testing — **2 days**

**Total MVP: ~2 weeks** (for core experience)

---

## Risk Mitigation

### Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| **Performance lag on large datasets** | Implement caching in AsyncStorage, FlatList virtualization from day 1 |
| **Complex SVG rendering (charts)** | Test with large datasets early, profile with React Profiler |
| **Zustand selector memory** | Use shallow comparison, test with 500+ entries |
| **Data consistency** | Unit test aggregation functions independently |
| **Navigation state loss** | Use useFocusEffect to refresh data on screen focus |
| **Dark mode compliance** | Automated contrast checker, manual testing |

---

## File Checklist

```
src/
├── components/
│   ├── charts/
│   │   ├── LineChart.tsx                 (new)
│   │   ├── PieChart.tsx                  (new)
│   │   ├── StackedBarChart.tsx           (new)
│   │   ├── HeatmapChart.tsx              (new)
│   │   └── RadarChart.tsx                (new, optional)
│   │
│   └── dashboard/
│       ├── StatCard.tsx                  (new)
│       ├── ComparisonCard.tsx            (new)
│       ├── TrendIndicator.tsx            (new)
│       ├── FilterBar.tsx                 (new)
│       ├── PeriodSelector.tsx            (new)
│       └── MiniTrendCard.tsx             (new, optional)
│
├── screens/
│   ├── DashboardHomeScreen.tsx           (new)
│   ├── ProductionDashboardScreen.tsx     (new)
│   ├── WaterDashboardScreen.tsx          (new)
│   ├── HealthScoreDashboardScreen.tsx    (new)
│   ├── PlantDetailScreen.tsx             (ENHANCE existing)
│   └── ComparisonDashboardScreen.tsx     (new)
│
├── services/
│   ├── dashboardAggregation.ts           (new)
│   └── (existing services unchanged)
│
├── navigation/
│   └── index.tsx                         (MODIFY: add DashboardStack)
│
└── types/
    └── (update if new interfaces needed)

CLAUDE.md                                  (update with new paths)
DASHBOARDS_ARCHITECTURE.md                 (documentation)
DASHBOARDS_COMPONENTS.md                   (documentation)
DASHBOARDS_WIREFRAMES.md                   (documentation)
DASHBOARDS_IMPLEMENTATION.md               (this file)
```

---

## Testing Strategy

### Unit Tests (Jest)

```typescript
// dashboardAggregation.test.ts
describe('getProductionData', () => {
  it('calculates total kg from entries', () => {
    const data = getProductionData(mockEntries, mockPlants, dateRange);
    expect(data.totalKg).toBe(42.5);
  });
  
  it('handles empty entries gracefully', () => {
    const data = getProductionData([], mockPlants, dateRange);
    expect(data.totalKg).toBe(0);
  });
});
```

### Component Tests (React Native Testing Library)

```typescript
// DashboardHomeScreen.test.tsx
it('renders stat cards with correct values', () => {
  const { getByText } = render(<DashboardHomeScreen />);
  expect(getByText('42.5 kg')).toBeTruthy();
});

it('navigates to ProductionDashboard on tap', () => {
  const { getByText } = render(<DashboardHomeScreen />);
  fireEvent.press(getByText('Production'));
  expect(mockNavigation.navigate).toHaveBeenCalledWith('ProductionDashboard');
});
```

### Integration Tests

```typescript
// Test: Filter → Chart updates
// 1. Render ProductionDashboard
// 2. Change date filter
// 3. Verify LineChart data changes
// 4. Verify FlatList re-renders
```

### Manual Testing Checklist

- [ ] Navigate all screens
- [ ] Test all filters
- [ ] Change time period
- [ ] Scroll large lists (virtualization)
- [ ] Test on dark mode
- [ ] Test on small screen (375px)
- [ ] Test with no data (empty states)
- [ ] Test with 500+ entries (performance)

---

## References

- Existing `StatsScreen.tsx` (uses BarChart, GaugeChart)
- Existing `HomeScreen.tsx` (layout pattern, SafeAreaView)
- Existing `useStore.ts` (Zustand + AsyncStorage pattern)
- Existing theme colors & spacing (`constants/theme.ts`)
- Existing plant database & types (`types/index.ts`, `constants/plants.ts`)

