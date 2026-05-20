# Phase 1 Implementation Story — For Developer

**Title**: Restructure Navigation: 6 → 4 Tabs, Inner Jardin Tabs, Context FABs  
**Owner**: Full Stack Developer  
**Status**: Awaiting Design Approval  
**Priority**: P0 (blocks Phase 2)  
**Estimate**: 2–3 days (8–12 hours)

---

## User Story (Context)

As a gardener with multiple plants, I want a **simpler, flatter navigation** so I can find and manage my plants and chores faster without scrolling through 6 tabs or clicking through deep menu stacks.

---

## Acceptance Criteria

- [ ] Bottom tab navigator shows **4 tabs only** (Accueil, Jardin, Tâches, Réglages)
- [ ] Jardin tab contains **inner tabs** (Plantes | Planification) with smooth switching
- [ ] Semis (SowingCalendarScreen) moved to Planification tab, accessible in 1 tap
- [ ] Tableaux de Bord (DashboardStack) accessible from Accueil (via card/collapsible/inner tab)
- [ ] FAB context-aware: Jardin shows "+ Add Plant", Tâches shows "+ Add Chore"
- [ ] Back button works correctly on nested navigation (no broken stacks)
- [ ] Device rotation preserves tab state (no reset)
- [ ] All TypeScript types correct (no `any`)
- [ ] Manual testing: all flows pass (checklist below)
- [ ] Code review approved
- [ ] Conventional commit message with reasoning

---

## Current State (Before Phase 1)

```typescript
// src/navigation/index.tsx

function Navigation() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Accueil" component={HomeScreen} />
        <Tab.Screen name="Jardin" component={GardenStack} />  // 6 screens
        <Tab.Screen name="Tâches" component={ChoreStack} />   // 3 screens
        <Tab.Screen name="Semis" component={SowingCalendarScreen} />  // REMOVE
        <Tab.Screen name="Tableaux de Bord" component={DashboardStack} />  // REMOVE
        <Tab.Screen name="Réglages" component={SettingsStack} />
      </Tab.Navigator>
      <AIFABButton /> {/* Always shows AI Chat */}
    </NavigationContainer>
  );
}
```

**Screens affected**:
- GardenScreen (becomes Plantes tab)
- AddPlantScreen (nested in GardenStack)
- PlantDetailScreen (nested in GardenStack)
- GardenBedsScreen (move to PlanificationStack)
- BedGridScreen (move to PlanificationStack)
- BedFormScreen (move to PlanificationStack)
- SowingCalendarScreen (move to PlanificationStack)
- StatsScreen (stay in GardenStack or move?)
- HomeScreen (add Tableaux de Bord card/section)
- AIFABButton (refactor for tab awareness)

---

## Target State (After Phase 1)

```typescript
// src/navigation/index.tsx

// NEW: Nested tab navigator for Jardin
function GardenTabNavigator() {
  const InnerTab = createBottomTabNavigator();
  return (
    <InnerTab.Navigator screenOptions={{ headerShown: false }}>
      <InnerTab.Screen
        name="Plantes"
        component={GardenStack}  // GardenList, AddPlant, PlantDetail, Stats
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🌱" focused={focused} /> }}
      />
      <InnerTab.Screen
        name="Planification"
        component={PlanificationStack}  // BedGrid, BedForm, SowingCalendar
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🌳" focused={focused} /> }}
      />
    </InnerTab.Navigator>
  );
}

// NEW: Planification stack (combines garden beds + sowing)
function PlanificationStack() {
  const Stack = createStackNavigator();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GardenBeds" component={GardenBedsScreen} />
      <Stack.Screen name="BedGrid" component={BedGridScreen} />
      <Stack.Screen name="BedForm" component={BedFormScreen} />
      <Stack.Screen name="SowingCalendar" component={SowingCalendarScreen} />
    </Stack.Navigator>
  );
}

function Navigation() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Accueil" component={HomeScreen} />  // + Tableaux de Bord card
        <Tab.Screen name="Jardin" component={GardenTabNavigator} />  // Inner tabs
        <Tab.Screen name="Tâches" component={ChoreStack} />
        <Tab.Screen name="Réglages" component={SettingsStack} />
      </Tab.Navigator>
      <AIFABButton /> {/* Tab-aware: changes action based on active tab */}
    </NavigationContainer>
  );
}
```

---

## Implementation Plan (Step-by-Step)

### 1. Create GardenTabNavigator Component

**Location**: `src/navigation/index.tsx` (add before Navigation component)

**Code**:
```typescript
function GardenTabNavigator() {
  const InnerTab = createBottomTabNavigator();
  
  return (
    <InnerTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 4,
          height: 50,  // Slightly smaller than main tabs (60pt)
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}
    >
      <InnerTab.Screen
        name="Plantes"
        component={GardenStack}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🌱" focused={focused} />,
          tabBarLabel: 'Plantes',
        }}
      />
      <InnerTab.Screen
        name="Planification"
        component={PlanificationStack}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🌳" focused={focused} />,
          tabBarLabel: 'Planification',
        }}
      />
    </InnerTab.Navigator>
  );
}
```

**Testing**:
- [ ] Tap "Plantes" tab → GardenScreen loads
- [ ] Tap "Planification" tab → GardenBedsScreen loads
- [ ] Swipe between tabs (if enabled)
- [ ] Back button on Plantes → closes GardenStack correctly
- [ ] Back button on Planification → closes PlanificationStack correctly

---

### 2. Create PlanificationStack Component

**Location**: `src/navigation/index.tsx` (add before GardenTabNavigator)

**Code**:
```typescript
function PlanificationStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GardenBeds" component={GardenBedsScreen} />
      <Stack.Screen name="BedGrid" component={BedGridScreen} />
      <Stack.Screen name="BedForm" component={BedFormScreen} />
      <Stack.Screen name="SowingCalendar" component={SowingCalendarScreen} />
    </Stack.Navigator>
  );
}
```

**Note**: Remove these screens from GardenStack (they will move here)

**Testing**:
- [ ] Navigate from GardenBedsScreen to BedFormScreen
- [ ] Navigate from BedFormScreen back to GardenBedsScreen
- [ ] Navigate to SowingCalendarScreen from Planification stack
- [ ] Back button works at each screen

---

### 3. Update GardenStack (Remove Bed/Sowing Screens)

**Current** (lines 34–46):
```typescript
function GardenStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GardenList" component={GardenScreen} />
      <Stack.Screen name="AddPlant" component={AddPlantScreen} />
      <Stack.Screen name="PlantDetail" component={PlantDetailScreen} />
      <Stack.Screen name="GardenBeds" component={GardenBedsScreen} />
      <Stack.Screen name="BedGrid" component={BedGridScreen} />
      <Stack.Screen name="BedForm" component={BedFormScreen} />
      <Stack.Screen name="Stats" component={StatsScreen} />
    </Stack.Navigator>
  );
}
```

**After**:
```typescript
function GardenStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GardenList" component={GardenScreen} />
      <Stack.Screen name="AddPlant" component={AddPlantScreen} />
      <Stack.Screen name="PlantDetail" component={PlantDetailScreen} />
      <Stack.Screen name="Stats" component={StatsScreen} />
    </Stack.Navigator>
  );
}
```

**Reason**: BedGrid, BedForm, GardenBeds now in PlanificationStack (accessed via Planification inner tab)

**Testing**:
- [ ] GardenScreen still loads as primary screen
- [ ] AddPlant/PlantDetail/Stats screens still accessible
- [ ] No broken references to GardenBeds, etc.

---

### 4. Update Main Tab Navigator (Remove Semis & Tableaux de Bord)

**Current** (lines 106–135):
```typescript
<Tab.Navigator ...>
  <Tab.Screen name="Accueil" component={HomeScreen} />
  <Tab.Screen name="Jardin" component={GardenStack} />
  <Tab.Screen name="Tâches" component={ChoreStack} />
  <Tab.Screen name="Semis" component={SowingCalendarScreen} />
  <Tab.Screen name="Tableaux de Bord" component={DashboardStack} />
  <Tab.Screen name="Réglages" component={SettingsStack} />
</Tab.Navigator>
```

**After**:
```typescript
<Tab.Navigator ...>
  <Tab.Screen name="Accueil" component={HomeScreen} />
  <Tab.Screen name="Jardin" component={GardenTabNavigator} />  {/* Changed to GardenTabNavigator */}
  <Tab.Screen name="Tâches" component={ChoreStack} />
  <Tab.Screen name="Réglages" component={SettingsStack} />
</Tab.Navigator>
```

**Reason**: 
- Semis moved to Planification (inner tab of Jardin)
- Tableaux de Bord accessed from Accueil (card/collapsible)
- GardenTabNavigator replaces GardenStack

**Testing**:
- [ ] Only 4 tabs visible at bottom (no horizontal scroll)
- [ ] Tap "Accueil" → HomeScreen loads
- [ ] Tap "Jardin" → GardenTabNavigator (inner tabs visible)
- [ ] Tap "Tâches" → ChoreStack loads
- [ ] Tap "Réglages" → SettingsStack loads
- [ ] Tab labels readable (not cramped)

---

### 5. Refactor AIFABButton for Tab Awareness

**Current** (`src/components/AIFABButton.tsx`):
- Hardcoded to show AI Chat action
- Always renders at bottom-right

**Changes**:
1. Pass navigation state to determine active tab
2. Conditionally change FAB action based on tab:
   - Jardin → Show "+ Add Plant" (navigate to AddPlantScreen)
   - Tâches → Show "+ Add Chore" (navigate to ChoreFormScreen)
   - Accueil, Réglages → Show "💬 AI Chat" (open AIChatModal)

**Implementation**:
```typescript
// src/components/AIFABButton.tsx

import { useNavigation, useRoute } from '@react-navigation/native';

export default function AIFABButton({ onPress }: { onPress?: () => void }) {
  const navigation = useNavigation<any>();
  const route = useRoute();
  
  // Determine active tab from route name
  const activeTab = route.name;  // 'Accueil', 'Jardin', 'Tâches', 'Réglages'
  
  const handlePress = () => {
    switch (activeTab) {
      case 'Jardin':
        navigation.navigate('Jardin', { screen: 'Plantes', params: { screen: 'AddPlant' } });
        break;
      case 'Tâches':
        navigation.navigate('Tâches', { screen: 'ChoreForm' });
        break;
      case 'Accueil':
      case 'Réglages':
      default:
        onPress?.();  // Open AI Chat modal
        break;
    }
  };
  
  // Determine FAB icon/color based on active tab
  const getFABStyle = () => {
    switch (activeTab) {
      case 'Jardin':
        return { emoji: '+', color: colors.primary, label: 'Ajouter une plante' };
      case 'Tâches':
        return { emoji: '+', color: colors.primary, label: 'Ajouter une tâche' };
      default:
        return { emoji: '💬', color: '#9333EA', label: 'Conversation' };
    }
  };
  
  const style = getFABStyle();
  
  return (
    <TouchableOpacity
      style={[styles.fab, { backgroundColor: style.color }]}
      onPress={handlePress}
      accessible
      accessibilityRole="button"
      accessibilityLabel={style.label}
    >
      <Text style={styles.fabEmoji}>{style.emoji}</Text>
    </TouchableOpacity>
  );
}
```

**Testing**:
- [ ] Tap FAB on Jardin → AddPlantScreen opens
- [ ] Tap FAB on Tâches → ChoreFormScreen opens
- [ ] Tap FAB on Accueil → AIChatModal opens
- [ ] Tap FAB on Réglages → AIChatModal opens
- [ ] FAB emoji/color updates when switching tabs
- [ ] Back button closes added screen correctly

---

### 6. Add Tableaux de Bord to HomeScreen (Design Approved Option)

**Assume Designer chose Option A: Card-based navigation**

**File**: `src/screens/HomeScreen.tsx`

**Change**: Add component to display Tableaux de Bord card

```typescript
// In HomeScreen.tsx, add:

function DashboardCard({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.dashboardCard}>
      <View style={styles.dashboardHeader}>
        <Text style={styles.dashboardTitle}>Tableaux de Bord</Text>
        <Text style={styles.dashboardArrow}>→</Text>
      </View>
      <Text style={styles.dashboardDesc}>Production, Eau, Santé & Comparaisons</Text>
      <View style={styles.dashboardChips}>
        <View style={styles.chip}>
          <Text style={styles.chipEmoji}>📊</Text>
          <Text style={styles.chipLabel}>Production</Text>
        </View>
        <View style={styles.chip}>
          <Text style={styles.chipEmoji}>💧</Text>
          <Text style={styles.chipLabel}>Eau</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// In return, add after WeatherCard:
{weather && <WeatherCard weather={weather} />}

<DashboardCard onPress={() => navigation.navigate('Accueil', { screen: 'Dashboard' })} />

<TodayChoreWidget ... />
```

**Style** (add to StyleSheet):
```typescript
dashboardCard: {
  marginHorizontal: spacing.md,
  marginVertical: spacing.md,
  padding: spacing.md,
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  borderLeftWidth: 4,
  borderLeftColor: colors.primary,
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowRadius: 4,
  elevation: 2,
},
dashboardTitle: { ...typography.h3, color: colors.primary },
dashboardArrow: { ...typography.h3, color: colors.primary },
dashboardDesc: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
dashboardChips: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
chip: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, backgroundColor: colors.background, borderRadius: 8 },
chipEmoji: { fontSize: 14 },
chipLabel: { ...typography.caption, fontSize: 12 },
```

**Alternative**: If Designer chose Option B (collapsible), add collapse logic + `Animated.timing`

**Testing**:
- [ ] Card displays on HomeScreen
- [ ] Tap card → navigates to DashboardStack
- [ ] Back button returns to HomeScreen
- [ ] Card displays on orientation change

---

### 7. Type Safety & Navigation Routing

**Update navigation types** to include inner tab navigation:

```typescript
// Define deep linking for inner tabs
const linking = {
  prefixes: ['hortiapp://', 'https://hortiapp.com'],
  config: {
    screens: {
      Accueil: 'home',
      Jardin: {
        screens: {
          Plantes: 'garden/plants',
          Planification: 'garden/plan',
        },
      },
      Tâches: 'chores',
      Réglages: 'settings',
    },
  },
};

<NavigationContainer linking={linking}>
  {/* ... */}
</NavigationContainer>
```

**Testing**:
- [ ] Deep links work (if used)
- [ ] No TypeScript `any` types
- [ ] Navigation prop types correct

---

## Testing Checklist (Manual)

### Navigation Flows

- [ ] **Tab switching**: All 4 tabs switch smoothly (Accueil, Jardin, Tâches, Réglages)
- [ ] **Inner tab switching**: Jardin inner tabs switch (Plantes ↔ Planification)
- [ ] **Jardin Plantes tab**: GardenScreen loads, can tap to AddPlant/PlantDetail/Stats
- [ ] **Jardin Planification tab**: GardenBedsScreen loads, can tap to BedGrid/BedForm/SowingCalendar
- [ ] **Semis moved**: SowingCalendarScreen accessible from Planification tab (was separate tab, now nested)
- [ ] **Tableaux de Bord moved**: Accessible from Accueil card/section (was separate tab, now nested)

### Back Button Behavior

- [ ] **Back from nested screens**: AddPlant → GardenScreen (not to previous tab)
- [ ] **Back from BedForm → BedGrid → GardenBeds** (proper stack order)
- [ ] **Back from DashboardStack** → returns to Accueil
- [ ] **Back from Planification screens** → returns to Planification tab (not Plantes tab)

### FAB Context

- [ ] **FAB on Jardin**: Shows "+" icon, navigates to AddPlantScreen
- [ ] **FAB on Tâches**: Shows "+" icon, navigates to ChoreFormScreen
- [ ] **FAB on Accueil**: Shows "💬" icon, opens AIChatModal
- [ ] **FAB on Réglages**: Shows "💬" icon, opens AIChatModal
- [ ] **FAB changes on tab switch**: Icon/color updates instantly

### Device Rotation

- [ ] **Rotate on HomeScreen**: Content reflows, no state loss
- [ ] **Rotate on Jardin Plantes**: Tab stays selected, content reflows
- [ ] **Rotate on Jardin Planification**: Tab stays selected, content reflows
- [ ] **Rotate on nested screen** (e.g., AddPlant): Stack preserved

### Accessibility

- [ ] **Touch targets**: All buttons/tabs at least 44×44pt (measure with debug overlay)
- [ ] **Labels**: Tab icons have readable labels below
- [ ] **Screen reader** (if applicable): Tab names and FAB action announced

### Performance

- [ ] **No lag** when switching tabs (should be <300ms)
- [ ] **No memory leaks**: Switch tabs 10+ times, memory stable
- [ ] **No console errors**: Check React Native debugger (no `cannot find key` warnings)

---

## Commit Message

**Format**: Conventional Commits

```
feat: P1 navigation restructure (6→4 tabs, inner Jardin tabs, context FABs)

- Reduce bottom tabs from 6 → 4 (remove Semis, Tableaux de Bord)
- Add GardenTabNavigator with inner tabs (Plantes | Planification)
- Move SowingCalendarScreen to Planification stack (was Semis tab)
- Move DashboardStack access to Accueil card (was Tableaux de Bord tab)
- Refactor AIFABButton for tab-aware actions (+ Add on Jardin/Tâches, 💬 Chat on Accueil/Réglages)
- Update HomeScreen to show Tableaux de Bord card
- Add deep linking for inner tab navigation
- Test all navigation flows and back button behavior

Closes #XX (if linked to issue)
```

---

## Code Review Checklist (For Self-Review Before Submitting)

- [ ] **Files changed**: Only navigation files + HomeScreen (no scope creep)
- [ ] **No console warnings**: React Navigation warnings absent
- [ ] **No TypeScript errors**: `npx tsc --noEmit` passes
- [ ] **Navigation logic**: Back button, deep linking, tab switching all tested
- [ ] **FAB behavior**: Tab-aware, no hardcoded actions
- [ ] **Styling**: Inner tabs match main tabs (font size, padding, colors)
- [ ] **Performance**: No unnecessary re-renders (check React Profiler if needed)
- [ ] **Accessibility**: Tab labels readable, touch targets adequate
- [ ] **Code clarity**: Comments on complex logic (e.g., deep linking, tab detection)
- [ ] **Branch name**: `feat/P1-navigation-restructure` (follows convention)

---

## Files Modified Summary

| File | Change | Lines |
|------|--------|-------|
| `src/navigation/index.tsx` | Restructure tabs, add inner navigator, update FAB logic | ~70 modified/added |
| `src/screens/HomeScreen.tsx` | Add Tableaux de Bord card | ~20 added |
| `src/components/AIFABButton.tsx` | Tab-aware FAB action | ~25 modified |

**Total**: ~115 lines changed/added (low-risk change, confined to navigation)

---

## Post-Completion Steps

1. **Self-review** against checklist above
2. **Run tests**: `npx expo start --clear` → manual testing (30 min)
3. **Commit**: Conventional message with reasoning
4. **Push branch**: `git push origin feat/P1-navigation-restructure`
5. **Create PR** with summary:
   - Changes: tabs reduced, inner tabs added, FAB updated
   - Testing: all flows pass (attach checklist results)
   - Screenshots: before/after (optional)
6. **Request review** from Orchestrator or peer
7. **Merge** after approval

---

## Questions / Blockers

**None currently.** Awaiting Designer approval on:
- [ ] Inner-tab design (top vs bottom, styling)
- [ ] Accueil → Tableaux de Bord option (card vs collapsible)
- [ ] FAB styling (colors, icons)

**If Designer feedback requires changes**, update this story and re-estimate.

---

**Status**: 🟡 Ready for Design Approval  
**Estimated Start**: 2026-05-21 (after Designer review)  
**Estimated Completion**: 2026-05-24
