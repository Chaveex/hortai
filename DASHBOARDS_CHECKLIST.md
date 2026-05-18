# Dashboard Development Checklist

## Phase 1: Charts & Base Components (Week 1–2)

### Charts Library

- [ ] **LineChart.tsx**
  - [ ] SVG path generation (smooth curve)
  - [ ] Grid lines
  - [ ] Axis labels (x, y)
  - [ ] Data points (circles)
  - [ ] Area fill with gradient
  - [ ] Forecast zone (optional, lighter)
  - [ ] Test with 6-month data
  - [ ] Test with empty data (graceful fallback)
  - [ ] Performance: render < 500ms

- [ ] **BarChart.tsx** (Enhance existing)
  - [ ] Add `showValues` prop (display value on bar)
  - [ ] Add `horizontal` variant (for long labels)
  - [ ] Test with existing stats screen
  - [ ] Verify colors match theme

- [ ] **PieChart.tsx**
  - [ ] SVG path slicing (angles, arcs)
  - [ ] Legend rendering
  - [ ] Donut mode (with hole)
  - [ ] Center label (for donut)
  - [ ] Percentage labels on slices
  - [ ] Test with 5 types
  - [ ] Test with 2 types (large slices)

- [ ] **StackedBarChart.tsx**
  - [ ] Stacked segments per bar
  - [ ] Percentage variant (normalize to 100%)
  - [ ] Absolute variant (actual values)
  - [ ] Legend with all segment names
  - [ ] Test with weekly data (7 bars)
  - [ ] Test with monthly data (12 bars)

- [ ] **HeatmapChart.tsx**
  - [ ] Color intensity by value (0–100)
  - [ ] Row labels (plant names)
  - [ ] Column labels (dates)
  - [ ] Horizontal scroll (no vertical)
  - [ ] Value in cell (optional)
  - [ ] Test with 7-day grid
  - [ ] Test with 30-day grid

- [ ] **GaugeChart.tsx** (Enhance existing)
  - [ ] Improve visual design (thicker bar)
  - [ ] Add threshold colors (excellent/good/warning)
  - [ ] Enlarge center percentage text
  - [ ] Test with health scores (0–100)

### Dashboard Components

- [ ] **StatCard.tsx**
  - [ ] Icon (emoji)
  - [ ] Label text
  - [ ] Value + unit
  - [ ] Trend badge (↑↓→ + %)
  - [ ] Card styling (shadow, border radius)
  - [ ] Pressable (optional onPress)
  - [ ] Test with 3 cards in row
  - [ ] Test dark mode

- [ ] **ComparisonCard.tsx**
  - [ ] Title
  - [ ] Actual vs Regional
  - [ ] Bar fill (percentage)
  - [ ] Status color (excellent/good/warning)
  - [ ] Percentage text
  - [ ] Test with 100% (exact match)
  - [ ] Test with 50% (below average)
  - [ ] Test with 150% (above average)

- [ ] **TrendIndicator.tsx**
  - [ ] Trend icon (↑↓→)
  - [ ] Percentage number
  - [ ] Color coding (success/warning/accent)
  - [ ] Optional label
  - [ ] Small badge design
  - [ ] Test with all three trends

- [ ] **FilterBar.tsx**
  - [ ] Date range button
  - [ ] Plant type dropdown
  - [ ] Reset button
  - [ ] Modal picker (or BottomSheet)
  - [ ] Multi-select logic
  - [ ] Callbacks (onDateChange, onPlantTypeChange, onReset)
  - [ ] Test on small screen (375px)

- [ ] **PeriodSelector.tsx**
  - [ ] 4 tab buttons (Week/Month/Season/Year)
  - [ ] Active state styling
  - [ ] onChange callback
  - [ ] Smooth tab switch
  - [ ] Test all button widths fit

- [ ] **MiniTrendCard.tsx** (Optional)
  - [ ] Sparkline (simplified chart)
  - [ ] Label
  - [ ] Trend direction
  - [ ] Compact design

### Component Testing

- [ ] Create mock data factory (for testing)
- [ ] Test all components with multiple data sizes
- [ ] Test empty states (no data)
- [ ] Test dark mode on all components
- [ ] Run Lighthouse accessibility check
- [ ] Profile performance (React DevTools)

---

## Phase 2: Data Service (Week 2–3)

### dashboardAggregation.ts

- [ ] **getProductionData()**
  - [ ] Calculate totalKg (sum all harvests)
  - [ ] Calculate avgPerPlant (total / distinct plants)
  - [ ] Generate daily array (date → kg)
  - [ ] Generate byType array (plant type → kg, %)
  - [ ] Find topMonth (highest kg month)
  - [ ] Calculate trend (compare 30d vs 30d)
  - [ ] Handle empty entries (return zeroes)
  - [ ] Handle invalid dates gracefully
  - [ ] Unit tests (with mock data)
  - [ ] Performance test (500 entries < 100ms)

- [ ] **getWaterData()**
  - [ ] Calculate totalL (plant water needs × days alive)
  - [ ] Calculate avgDailyL (totalL / 30)
  - [ ] Get regionAvgL (from hardcoded DB)
  - [ ] Calculate percentOfRegional (actual / regional)
  - [ ] Generate dailyUsage array (date → L, temp, humidity)
  - [ ] Generate byPlant array (plant → L, %)
  - [ ] Generate recommendations list (static + dynamic)
  - [ ] Add weather-based recommendations (temp > 30, rain, etc)
  - [ ] Unit tests

- [ ] **getHealthData()**
  - [ ] Enhance existing health score calculation
  - [ ] Return 5 factor scores (hydration, production, nutrients, health, diversity)
  - [ ] Generate daily heatmap (plantId → date → health %)
  - [ ] Generate alerts (water, harvest, pests)
  - [ ] Generate 30-day history (score progression)
  - [ ] Unit tests

- [ ] **getPlantDashboardData()**
  - [ ] Get single plant detail aggregation
  - [ ] Growth curve (age → health score)
  - [ ] Watering history (last 14 days)
  - [ ] Harvest timeline (all harvests, sorted)
  - [ ] Journal entries (notes, sorted)
  - [ ] Comparison to regional average
  - [ ] Unit tests

- [ ] **getComparisonData()**
  - [ ] Support 4 types: harvest, health, water-efficiency, period
  - [ ] Harvest: by-plant harvest kg vs regional
  - [ ] Health: by-plant health score vs avg
  - [ ] Water-efficiency: kg per liter per plant
  - [ ] Period: this month vs last month
  - [ ] Unit tests

### Data Type Definitions

- [ ] Create `ProductionData` interface
- [ ] Create `WaterData` interface
- [ ] Create `HealthData` interface
- [ ] Create `PlantDashboardData` interface
- [ ] Create `ComparisonData` interface
- [ ] Export all types from `types/index.ts`
- [ ] TypeScript strict mode check (no `any`)

### Service Testing

- [ ] Write unit tests for each function
- [ ] Test with 10 entries (smoke test)
- [ ] Test with 100 entries (integration test)
- [ ] Test with 500+ entries (performance test)
- [ ] Test with empty arrays
- [ ] Test with null/undefined weather
- [ ] Test date range filtering
- [ ] Test plant type filtering
- [ ] All functions run < 100ms

---

## Phase 3: Screen Implementation (Week 4–5)

### DashboardHomeScreen.tsx

- [ ] Header (title, period selector)
- [ ] 3 StatCards (Production, Water, Health)
  - [ ] Connect to Zustand (get stats data)
  - [ ] Show trends
  - [ ] Tap → navigate to detail screen
- [ ] BarChart (6-month production)
  - [ ] Data from aggregation service
  - [ ] Responsive width
- [ ] ComparisonCard (top plants)
  - [ ] Show top 3 plants
  - [ ] Sortable (tap to see all)
- [ ] Refresh control (pull to refresh)
- [ ] Test all navigation taps
- [ ] Test period selector (Week/Month/Season/Year)
- [ ] Test data updates on period change

### ProductionDashboardScreen.tsx

- [ ] Header + back button
- [ ] FilterBar (date range, plant types, reset)
  - [ ] OnChange callbacks
  - [ ] Test filtering logic
- [ ] Summary cards (total kg, trend)
- [ ] LineChart (daily production)
  - [ ] Optional forecast overlay
  - [ ] Smooth curve
- [ ] PieChart (by plant type)
  - [ ] Legend
  - [ ] Donut mode (optional)
- [ ] StackedBarChart (weekly breakdown)
  - [ ] Each bar = week
  - [ ] Segments = plant types
- [ ] FlatList (detail table)
  - [ ] Columns: Date, Plant, Quantity
  - [ ] Sortable (tap header)
  - [ ] Virtualized (50+ entries)
  - [ ] Tap row → PlantDashboard
- [ ] Test filtering updates all charts
- [ ] Test sorting works
- [ ] Test scroll performance (100 entries)

### WaterDashboardScreen.tsx

- [ ] Header + FilterBar
- [ ] Summary cards (total L, trend)
- [ ] GaugeChart (% of regional average)
  - [ ] Color: excellent/good/warning
- [ ] LineChart (daily water usage)
  - [ ] Optional correlation with temp/humidity
- [ ] StackedBarChart (by plant type)
  - [ ] Each bar = plant
  - [ ] Show L and percentage
- [ ] Recommendations list
  - [ ] Static tips (mulching, timing)
  - [ ] Dynamic from weather (high temp, rain)
- [ ] Test gauge updates based on data
- [ ] Test recommendations appear

### HealthScoreDashboardScreen.tsx

- [ ] Header
- [ ] Large GaugeChart (current score)
  - [ ] Trend indicator (↑↓→)
- [ ] RadarChart (5 factors) OR 5 gauge charts
  - [ ] Hydration, Production, Nutrients, Health, Diversity
- [ ] Factor scores list (5 rows)
  - [ ] Score + status badge + bar
- [ ] HeatmapChart (plant health grid)
  - [ ] 7–30 days (configurable)
  - [ ] Horizontal scroll
  - [ ] Color: green/yellow/red
- [ ] Alerts section
  - [ ] Warning cards
  - [ ] Info cards
- [ ] LineChart (30-day history)
  - [ ] Score progression
  - [ ] Event markers (optional)
- [ ] Test all components render
- [ ] Test heatmap scrolls horizontally
- [ ] Test alerts populate from data

### PlantDashboardScreen.tsx (Enhance Existing)

- [ ] Keep existing header + plant info
- [ ] Add ComparisonCard (vs regional avg)
- [ ] Add LineChart (growth curve: age → health)
- [ ] Add BarChart (watering history, 14 days)
- [ ] Enhance notes journal
  - [ ] FlatList (virtualized)
  - [ ] Sortable by date
  - [ ] Tap to expand/collapse
- [ ] Add AI recommendations section
  - [ ] 3–5 tips from service
  - [ ] Tap for details (optional modal)
- [ ] Add companion plants section
- [ ] Test all new components
- [ ] Test tap on harvest entry
- [ ] Test tap on AI recommendation

### ComparisonDashboardScreen.tsx

- [ ] Header
- [ ] Filter selector (radio buttons)
  - [ ] Harvest vs region
  - [ ] Health comparison
  - [ ] Water efficiency
  - [ ] Period comparison
- [ ] Dynamic content based on filter
  - [ ] Multiple ComparisonCard instances
  - [ ] BarChart (grouped or stacked)
  - [ ] FlatList (sorted table)
- [ ] Sortable table
  - [ ] Tap header to sort
  - [ ] Ascending/descending toggle
- [ ] Test filter changes update UI
- [ ] Test table sorting

### Screen Integration Tests

- [ ] All 6 screens render without errors
- [ ] Navigation between screens works
- [ ] Back button pops correctly
- [ ] Refresh on screen focus (useFocusEffect)
- [ ] Data persists in Zustand across navigation
- [ ] No memory leaks (unsubscribe listeners)

---

## Phase 4: Zustand Store Integration (Week 4–5)

### Store Updates

- [ ] Add `dashboardFilter` state
  - [ ] dateRange: { start, end }
  - [ ] plantTypes: PlantType[]
  - [ ] period: 'week' | 'month' | 'season' | 'year'
- [ ] Add `setDashboardFilter()` setter
- [ ] Add computed selectors
  - [ ] `productionDataSelector`
  - [ ] `waterDataSelector`
  - [ ] `healthDataSelector`
- [ ] Add `updateDashboardCache()` function
- [ ] Call cache update in `refreshRecommendations()`
- [ ] (Optional) Cache to AsyncStorage for fast loads
- [ ] TypeScript tests (no type errors)

### Store Testing

- [ ] Test filter setter updates state
- [ ] Test selectors re-compute on filter change
- [ ] Test persistence (if using AsyncStorage)
- [ ] Test computed values are correct
- [ ] Test no memory leaks

---

## Phase 5: Navigation & Integration (Week 5–6)

### Navigation Update

- [ ] Create DashboardStack in `navigation/index.tsx`
  - [ ] 6 screens in order
  - [ ] headerShown: false
- [ ] Add to TabNavigator as "Stats" tab
  - [ ] Emoji: 📊
  - [ ] TabBarIcon
- [ ] Test all screen navigation
- [ ] Test tab switching
- [ ] Test back gesture (iOS)
- [ ] Test deep linking (if needed)

### Enhanced PlantDetailScreen

- [ ] Keep existing structure
- [ ] Add new components (comparison, growth, etc)
- [ ] Test no regression with existing features
- [ ] Test all new sections render

---

## Phase 6: Testing & Performance (Week 6–7)

### Performance Profiling

- [ ] React DevTools Profiler
  - [ ] Check render times (target: < 500ms)
  - [ ] Check unnecessary re-renders
  - [ ] Check component mount/unmount
- [ ] Lighthouse audit
  - [ ] Bundle size (target: < 50KB new code)
  - [ ] Accessibility score
  - [ ] Performance metrics
- [ ] Manual testing on device
  - [ ] iPhone SE (375px, min screen)
  - [ ] iPhone 13 (390px, typical)
  - [ ] iPad (if needed)
  - [ ] Android phone (if needed)

### Accessibility Testing

- [ ] WCAG AA contrast check
  - [ ] All text ≥ 4.5:1 ratio
  - [ ] Icon + text (not color alone)
- [ ] Font sizes
  - [ ] Body text ≥ 12pt
  - [ ] Headings clear hierarchy
- [ ] Touch targets
  - [ ] All buttons ≥ 44×44pt
  - [ ] Adequate spacing (min 8pt gap)
- [ ] Screen reader testing (if available)
- [ ] Dark mode testing
  - [ ] All colors visible in dark
  - [ ] No color-only status indicators

### Data Edge Cases

- [ ] Empty data (no plants, no harvests)
  - [ ] Charts show "No data" message
  - [ ] Tables show placeholder
  - [ ] No crashes
- [ ] Single plant/entry
  - [ ] Comparison screens show "only plant" message
  - [ ] No division by zero
- [ ] Large datasets (500+ entries)
  - [ ] FlatList scrolls smoothly
  - [ ] No lag on filtering
  - [ ] Selectors still < 100ms
- [ ] Invalid dates
  - [ ] parseISO errors caught
  - [ ] Graceful fallback (skip entry)
- [ ] Null/undefined weather
  - [ ] No crash
  - [ ] Recommendations still show (static)

### Mobile Edge Cases

- [ ] Small screen (375px)
  - [ ] Text readable (no overflow)
  - [ ] Touch targets adequate
  - [ ] Charts scale correctly
- [ ] Notch/Dynamic Island (iPhone)
  - [ ] SafeAreaView respects insets
  - [ ] No content hidden
- [ ] Landscape orientation (if supported)
  - [ ] Layout adapts
  - [ ] Charts remain readable
- [ ] Network latency
  - [ ] Filters still work (no network needed)
  - [ ] Weather-dependent features degrade gracefully
- [ ] Low battery / dark mode
  - [ ] App remains responsive
  - [ ] Dark mode reduces eye strain

### Integration Tests

- [ ] Create > Filter > View Detail > Edit Plant
- [ ] Switch tabs > Return to Stats > Data persists
- [ ] Plant entry added > Dashboard updates automatically
- [ ] Period changed > All screens re-compute
- [ ] FilterBar reset > All filters clear

---

## Phase 7: Polish & Documentation (Week 7–8)

### Animations (Optional)

- [ ] Chart fade-in (React Native Reanimated, or CSS)
- [ ] Period selector tab switch
- [ ] List item expand/collapse (notes, alerts)
- [ ] Keep simple (avoid jank)

### Copy & Localization

- [ ] All French strings reviewed
- [ ] Number formatting (decimal separator: ,)
- [ ] Date formatting (DD/MM/YYYY)
- [ ] Unit labels (kg, L, etc)
- [ ] Emoji consistency

### Help & Tooltips

- [ ] Info icons (ⓘ) next to metrics
  - [ ] "Health score based on: watering, harvests, weather"
  - [ ] "Production compared to regional average"
- [ ] Long-press for details (optional)

### Documentation

- [ ] Update CLAUDE.md
  - [ ] Dashboard screen paths
  - [ ] New component locations
  - [ ] Data aggregation service
- [ ] Component API docs
  - [ ] Props, types, examples
  - [ ] Dark mode support
  - [ ] Accessibility notes
- [ ] Service layer docs
  - [ ] Function signatures
  - [ ] Input/output types
  - [ ] Performance notes
- [ ] Navigation graph (visual)
- [ ] Data flow diagram (visual)

### Bug Fixes

- [ ] Fix any console warnings
- [ ] Handle memory leaks
- [ ] Test with strict mode (React)
- [ ] Fix TypeScript warnings (if any)

---

## Final QA Checklist

- [ ] All 6 screens render without errors
- [ ] All navigation transitions smooth
- [ ] All filters work correctly
- [ ] Dark mode compliant (WCAG AA)
- [ ] Performance targets met (< 500ms render, 60 FPS scroll)
- [ ] No memory leaks (DevTools)
- [ ] No console errors/warnings
- [ ] Tested on 2+ real devices
- [ ] Documentation complete
- [ ] Ready for production

---

## Known Limitations & Future Work

### v1.0 (Current)

- ✅ 6 main dashboard screens
- ✅ SVG charts (lightweight)
- ✅ Basic filtering (date, plant type)
- ✅ Mobile-first design
- ✅ Dark mode

### v2.0 (Future)

- ⏳ Animated chart transitions
- ⏳ Export data to CSV/PDF
- ⏳ Forecast overlay (ML predictions)
- ⏳ Photo uploads for plants
- ⏳ Apple HealthKit integration
- ⏳ Shortcut actions (quick water, quick note)

---

**Last Updated:** 2025-05-18
**Status:** Ready for development

