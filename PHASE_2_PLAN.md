# Phase 2 — Retention Gamification (HOR-02)

**Date**: 2026-05-20  
**Target**: +20–30% DAU, +15% session length  
**Effort**: 4–5 days  
**Dependencies**: Phase 1 (completed ✅)

---

## Overview

Add **visible progress**, **streaks**, **milestones**, and **daily rituals** to drive habit formation and app stickiness. Current gaps: no streak counter, no level system, no celebration moments.

---

## Store Changes (Zustand)

Add to `src/store/useStore.ts` state:

```tsx
interface State {
  // Streaks
  streakDays: number;              // Current watering streak
  longestStreakDays: number;       // Longest streak ever (for milestones)
  lastWatered: string | null;      // Last date watered any plant (YYYY-MM-DD)
  streakResetAt: string | null;    // When streak will auto-reset

  // Harvest goals
  harvestGoal: number;             // Target kg for month (default 10)
  harvestGoalMonth: string;        // yyyy-MM (tracks goal per month)

  // Gardener progression
  gardenerLevel: number;           // Computed from plants+harvests+days

  // Daily ritual
  lastDailyTipDate: string | null; // YYYY-MM-DD (prevent duplicate today)
  dailyTipEnabled: boolean;        // User opt-in for notifications
  dailyTipTime: string;            // HH:mm format (default "09:00")
}
```

Add actions:
```tsx
updateStreakDays(days: number)
setLongestStreakDays(days: number)      // Update max milestone
setLastWatered(date: string | null)
setHarvestGoal(kg: number)
setDailyTipEnabled(enabled: boolean)
setDailyTipTime(time: string)
recordDailyTip(date: string)
```

---

## Feature 1: Watering Streak Counter

### Logic

- **Trigger**: User marks plant as watered (✓ in plant card)
- **Calculation**: `streakDays = days since lastWatered` (reset if overflow)
- **Reset**: Automatic if any plant overdue by 2x watering frequency
  - Example: tomato needs water every 3 days → overdue at 6+ days = streak breaks
- **Storage**: Persist to AsyncStorage via Zustand

### UI Changes

**HomeScreen (src/screens/HomeScreen.tsx)**:
- Replace current "N plants" stats chip (line ~67) with **badge row**:
  ```
  🔥 14        🏆 Level 3      📊 5/10 kg
  Streak       Gardener        This Month
  ```
- Layout: `flexDirection: 'row'`, gap `spacing.md`, centered in header
- Badge size: 48×48pt, tappable (tap → modal with streak details)
- Animation: Slight bounce on mark watered action

**Streak at-risk warning** (NEW):
- Show orange banner in HomeScreen header if any plant overdue at 1.5x frequency
  - Copy: "🔥 Ta série est en danger! {PlantName} n'a pas eu d'eau depuis {X} jours."
  - Tap → jump to PlantDetailScreen for that plant (quick water action)
  - Prevents silent streak breaks; drives daily engagement

**Modal (new component: src/components/StreakDetailModal.tsx)**:
- Title: "🔥 Watering Streak"
- Shows: 
  - Current days
  - Longest streak ever: "🏅 Meilleure série: {N} jours"
  - Plants watered today
- CTA: "Keep the streak alive! Water N plants today"

### Store Integration

```tsx
// In refreshRecommendations() or on plant water action:
const now = new Date();
if (lastWatered && differenceInDays(now, parseISO(lastWatered)) < 1) {
  // Already watered today
} else {
  setLastWatered(format(now, 'yyyy-MM-dd'));
  updateStreakDays(streakDays + 1);
}

// Auto-reset check + warning (run in useMemo on HomeScreen):
let streakAtRiskPlant: Plant | null = null;
plants.forEach(p => {
  if (!p.lastWatered) return;
  const daysSince = differenceInDays(now, parseISO(p.lastWatered));
  const wateringFreq = PLANT_DATABASE[p.type].wateringFrequencyDays;
  
  // Check 1.5x threshold for warning
  if (daysSince > wateringFreq * 1.5 && !streakAtRiskPlant) {
    streakAtRiskPlant = p; // Show warning banner
  }
  
  // Check 2x threshold for reset
  if (daysSince > wateringFreq * 2) {
    updateStreakDays(0); // Streak broken
  }
});

// Update longestStreakDays if current > previous
if (streakDays > longestStreakDays) {
  setLongestStreakDays(streakDays);
}
```

---

## Feature 2: Harvest Goal Progress Bar

### Logic

- **Goal**: User sets monthly target (kg) in Settings
- **Tracking**: Sum entries with `type: 'harvest'` for current month
- **Reset**: 1st of each month (auto-compute new month)

### UI Changes

**HomeScreen** (in badge row):
- "📊 5/10 kg" badge
- Visual: Green progress bar (5% = 50% width)
- Tappable: Navigate to ProductionDashboard

**Celebration**:
- When `harvest >= harvestGoal`: Toast "🎉 Monthly goal achieved!"
- Animation: Confetti-like effect (optional, low priority)

**Settings (src/screens/SettingsScreen.tsx)**:
- New section "Garden Goals"
- Slider or input: "Monthly Harvest Target (kg)" (default 10)
- Shows current month progress inline

### Store Integration

```tsx
// In HomeScreen useMemo:
const harvestMonth = format(now, 'yyyy-MM');
if (harvestMonth !== harvestGoalMonth) {
  setHarvestGoal(10); // Reset goal each month (or use prev value)
}

const monthlyHarvest = entries
  .filter(e => e.type === 'harvest' && e.date.startsWith(harvestMonth))
  .reduce((sum, e) => sum + (e.quantity || 0), 0);

// In PlantDetailScreen harvest action:
if (monthlyHarvest + newQuantity >= harvestGoal) {
  showToast('🎉 Récolte: objectif du mois atteint!');
}
```

---

## Feature 3: Gardener Level System

### Logic

**Formula**:
```
Level = 1 + floor((plantCount + harvestCount + daysSinceOnboarding) / 20)
```

- At level up: Toast "🎉 Congratulations! Level X Gardener"
- Visual: Badge on HomeScreen, tap for level details
- No paywall/microtransaction (cosmetic only)

### UI Changes

**HomeScreen** (in badge row):
- "🏆 Level 3" badge
- Tappable: Modal with:
  - Current level progress (XP bar toward next level)
  - Breakdown: plantCount + harvestCount + days formula
  - Past level milestones (Level 1 at day 1, Level 2 at XP 40, etc.)

**Level milestones** (cosmetic badges):
- Level 1–3: 🌱 Seedling Gardener
- Level 4–6: 🌿 Growth Gardener
- Level 7–9: 🌻 Blooming Gardener
- Level 10+: 🏆 Master Gardener

### Store Integration

```tsx
// In refreshRecommendations() or useMemo:
const harvestCount = entries.filter(e => e.type === 'harvest').length;
const daysSinceOnboarding = differenceInDays(now, parseISO(profile?.onboardingDate || now));
const newLevel = 1 + Math.floor((plants.length + harvestCount + daysSinceOnboarding) / 20);

if (newLevel > gardenerLevel) {
  updateGardenerLevel(newLevel);
  showToast(`🎉 Niveau ${newLevel} atteint!`);
}
```

---

## Feature 4: Daily AI Greeting (Optional Notification)

### Logic

- **Opt-in**: Toggle in Settings under "Daily Tips"
- **Time**: User picks time (default 09:00)
- **Scope**: Nymph sends **one micro-tip per day** (30 chars max) + encouragement
  - Example: "🌱 Tomatoes love sun! Check growth stage today."
- **Dedup**: `lastDailyTipDate` prevents same-day repeats
- **Rate limit**: Already have 3 questions/day global limit; tips are separate

### Technical

- Use `expo-notifications` + `expo-background-fetch` for scheduled notification
- Guarded by `Constants.executionEnvironment === 'storeClient'` (not in Expo Go)
- Notification content: Prompt IA with time context + user gardening style
- Store: `lastDailyTipDate` (YYYY-MM-DD) to prevent duplicates

### UI Changes

**Settings (src/screens/SettingsScreen.tsx)**:
- New section "Notifications"
- Toggle: "Daily gardening tip" (default off)
- Time picker: "Tip time" (default 09:00)
- Test button: "Preview tip" (generate + show in modal)

**Notification Payload**:
```json
{
  "title": "🧚 Conseil du jour",
  "body": "Les tomates adorent le soleil. Vérifie l'étape de croissance!",
  "data": { "screen": "DashboardStack" }
}
```

---

## Feature 5: Harvest Celebration Toasts

### Logic

- When user adds harvest entry in PlantDetailScreen:
  - Standard: "✅ Récolte enregistrée!"
  - First harvest of plant: "🎉 Première récolte! C'est magnifique!"
  - Monthly goal hit: "🎉 Objectif du mois atteint!"

### Implementation Method (Designer spec)

Use **React Native `Alert.alert()` with custom styling** (existing pattern in app):
```tsx
Alert.alert(
  '🎉 Récolte',
  'Première récolte! Bravo!',
  [{ text: 'Merci 🙌', onPress: () => {} }]
);
```

**Rationale**: MVP simplicity, native feel, no new deps. Can migrate to `react-native-toast-message` post-launch if polish needed.

### Store Integration

```tsx
// In PlantDetailScreen harvest action:
const isFirstHarvest = !entries.some(e => 
  e.type === 'harvest' && e.plantId === plant.id
);

if (isFirstHarvest) {
  showToast('🎉 Première récolte!');
} else {
  showToast('✅ Récolte enregistrée!');
}
```

---

## HomeScreen Layout Redesign

### Current (Phase 1)

```
┌─ Bonjour 👋          [N plants chip] ─┐
│  Mercredi 20 mai
│
│ [WeatherCard]
│
│ [HarvestGoalCard] ← will integrate into badge row
│
│ [TodayChoreWidget]
│
│ [WateringCard]
│
│ [TipCards]
└─────────────────────────────────────┘
```

### New (Phase 2)

```
┌─ Bonjour 👋                          ─┐
│  Mercredi 20 mai
│
│  ┌─────────────────────────────────┐
│  │ 🔥 14      🏆 Lvl 3    📊 5/10kg│ ← Badge row (tap for modals)
│  │ Streak    Gardener    This Month │
│  └─────────────────────────────────┘
│
│ [WeatherCard]
│
│ [TodayChoreWidget]
│
│ [WateringCard]
│
│ [TipCards]
└─────────────────────────────────────┘
```

**Badge Visual States** (NEW — Designer spec):
- **Default**: 
  - Shape: Pill-shaped container (borderRadius.full / 24pt)
  - Size: 48×48pt (touch target compliant)
  - Background: `colors.surface` (white #FFFFFF)
  - Border: 1pt `colors.border` (light gray)
  - Text/emoji: `colors.text` (dark gray)
- **Active (tap)**:
  - Border: 2pt `colors.primary` (green)
  - Elevation: 4pt shadow
- **Pressed**:
  - Opacity: 90%
- **Layout**: `flexDirection: 'row'`, `gap: spacing.md`, center-aligned in header

**Implementation**: Use shared BadgeButton component or inline styling in HomeScreen header.

---

## Implementation Order

### Day 1: Store + Streak Logic
- [ ] Add Zustand fields (streakDays, lastWatered, etc.)
- [ ] Implement streak calculation logic
- [ ] Add reset logic (check in HomeScreen useMemo)
- [ ] Persist to AsyncStorage

### Day 2: Streak UI + Gardener Level
- [ ] Create badge row layout (3 badges)
- [ ] Build StreakDetailModal
- [ ] Implement gardener level calculation
- [ ] Build LevelDetailModal

### Day 3: Harvest Goal + Settings
- [ ] Add harvest goal UI to HomeScreen badge row
- [ ] Update SettingsScreen with goal slider
- [ ] Implement monthly reset logic
- [ ] Add harvest celebration toasts

### Day 4–5: Daily Tips + Polish
- [ ] Implement daily tip notification logic
- [ ] Add Settings UI (toggle + time picker)
- [ ] Microinteractions (animations, toasts)
- [ ] Testing + bug fixes

---

## Verification Checklist

- [ ] Type check: `npx tsc --noEmit` (0 errors)
- [ ] Streak persists after app restart
- [ ] Streak resets on overdue plant
- [ ] Harvest goal resets each month
- [ ] Level up triggers toast
- [ ] Daily tip toggle works
- [ ] HomeScreen layout responsive (portrait + landscape)
- [ ] All modals dismiss on outside tap
- [ ] No console warnings

---

## Files to Create

```
src/components/StreakDetailModal.tsx       (Modal: streak details)
src/components/LevelDetailModal.tsx        (Modal: level progress)
PHASE_2_STATUS.md                          (Progress tracker)
```

## Files to Modify

```
src/store/useStore.ts                      (Add state + actions)
src/screens/HomeScreen.tsx                 (Badge row layout + integration)
src/screens/SettingsScreen.tsx             (Goal slider + notification settings)
src/screens/PlantDetailScreen.tsx          (Harvest celebration toasts)
src/constants/theme.ts                     (Colors for badges if needed)
```

---

## Notes

- Streak calculation is automatic; no user action needed (derived state)
- Level system is informational; no unlockable content (avoid game-ification fatigue)
- Notifications gated by environment check (no spam in Expo Go)
- All toast messages in French (fr locale)
- Existing HarvestGoalCard component can be integrated/refactored into badge row

---

**Status**: 🟢 Ready for kickoff  
**Owner**: Developer  
**Next**: Designer review → Designer approval → Implementation

