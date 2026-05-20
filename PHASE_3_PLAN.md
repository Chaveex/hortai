# Phase 3 — Chore Calendar Overhaul (HOR-03)

**Date**: 2026-05-20  
**Target**: +40% chore completion, +20% time-in-app  
**Effort**: 4–6 days  
**Dependencies**: Phase 1 ✅, Phase 2 ✅

---

## Overview

Transform ChoreCalendarScreen from confusing Day/Week/Month toggle to **agenda-based task management** with color-coding, quick-add, and plant linkage. Modern UX pattern proven by Apple Reminders, Google Tasks, Todoist.

---

## Current Problems

- **Unclear toggle**: Day/Week/Month buttons don't have logical defaults or visual hierarchy
- **No agenda view**: Tasks buried in calendar grid, hard to scan "what's due soon"
- **No quick-add**: Must open modal form → fill fields → submit (friction)
- **No color-coding**: All chores look the same (no visual type distinction)
- **No plant linkage**: Chore exists in isolation; no connection to plant detail
- **Alerts not clickable**: Dashboard warnings ("High humidity") don't link to relevant chores

---

## Solution: Agenda-Based Chore Management

### Feature 1: Agenda View (Primary)

**Replace**: Day/Week/Month toggle  
**Add**: Vertical timeline showing next 7 days (or more on scroll)

**Layout**:
```
┌─────────────────────────────┐
│ Tâches                      │
│                             │
│ 📅 Aujourd'hui (3 tâches)   │
│ ├─ 🚰 Arroser tomates (09:00)
│ ├─ 🌿 Fertiliser carottes
│ └─ 🐛 Traiter pucerons
│                             │
│ 📅 Demain (1 tâche)         │
│ └─ 🚰 Arroser concombres
│                             │
│ 📅 Dans 3 jours (2 tâches)  │
│ ├─ 🔧 Tuteurer tomates
│ └─ 🌿 Nourrir sol
└─────────────────────────────┘
```

**Implementation**:
- Component: `src/components/ChoreAgendaView.tsx`
- Data structure: Group chores by date (today, tomorrow, +3d, +7d)
- Virtualized list if >50 chores
- Swipe-left for quick-complete (optional, Phase 4)
- Tap chore → ChoreDetailScreen

### Feature 2: Color-Coded Chore Types

**Schema**:
```tsx
const choreTypeColors = {
  watering: '#3B82F6',      // blue 💧
  fertilizing: '#10B981',   // green 🌿
  pestControl: '#EF4444',   // red 🐛
  maintenance: '#6B7280',   // gray 🔧
};
```

**UI Integration**:
- Left border (4px) on chore card colored by type
- Emoji icon matches type (🚰, 🌿, 🐛, 🔧)
- Chore card layout:
  ```
  ┌──────────────────────────┐
  │ 🚰 | Arroser tomates     │ (4px blue border-left)
  │    | Avec 3 tâches liées │
  │    | Lun 21 mai, 09:00   │
  └──────────────────────────┘
  ```

**Files to modify**:
- `src/components/ChoreRow.tsx` (add color)
- `src/constants/theme.ts` (add choreTypeColors)
- `src/types/index.ts` (ensure Chore has `type` field)

### Feature 3: Quick-Add Chore Form

**Trigger**: Floating action button (FAB) + inline "+" in header

**Behavior**:
- Tap FAB → slide-up form (modal with keyboard focus)
- Form fields (minimal):
  - Date picker (default: today)
  - Chore type dropdown (watering, fertilizing, pest, maintenance)
  - Plant selector (optional, pre-filled if coming from PlantDetail)
  - Notes textarea (optional)
- Action buttons: "Créer" (save), "Annuler"
- Dismiss on outside tap or back gesture

**Component**: `src/screens/ChoreFormModal.tsx` (reuse existing, improve)

### Feature 4: Link Chores ↔ Plants

**Chore → Plant**:
- Add `plantId?` to Chore type (already exists)
- ChoreDetailScreen shows plant name + emoji
- Tap plant name → navigate to PlantDetailScreen

**Plant → Chores**:
- PlantDetailScreen shows "Tâches liées" section
- List upcoming chores for this plant
- Tap chore → ChoreDetailScreen

**Files to modify**:
- `src/types/index.ts` (ensure Chore.plantId)
- `src/screens/ChoreDetailScreen.tsx` (show plant + link)
- `src/screens/PlantDetailScreen.tsx` (show related chores)
- `src/store/useStore.ts` (add `getChoresForPlant()` helper)

### Feature 5: Clickable Dashboard Alerts

**Current**: Alerts shown in DashboardScreen (AlertBanner) but not actionable  
**New**: Tap alert → navigate to ChoreCalendarScreen + filter to relevant type

**Example flow**:
- Dashboard shows: "⚠️ High humidity detected"
- Tap alert → ChoreCalendarScreen + highlight watering chores
- Or create quick alert: "Add a watering chore?"

**Implementation**:
- Update `AlertBanner` component with `onPress` handler
- Add `filterChoreType` param to ChoreCalendarScreen navigation
- Scroll/highlight filtered chores on open

**Files to modify**:
- `src/components/Dashboard/AlertBanner.tsx` (add onPress)
- `src/screens/ChoreCalendarScreen.tsx` (accept filter param)

---

## Store Changes (Zustand)

Add to `src/store/useStore.ts`:

```tsx
// Helper to get chores for specific plant
getChoresForPlant(plantId: string): Chore[] {
  return this.chores.filter(c => c.plantId === plantId);
}

// Helper to get chores by date range (for agenda)
getChoresInRange(startDate: string, endDate: string): Chore[] {
  return this.chores
    .filter(c => c.date >= startDate && c.date <= endDate)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// Add plantId to chore when creating
addChore(chore: Omit<Chore, 'id'> & { plantId?: string }): void {
  const newChore: Chore = {
    id: generateId(),
    ...chore,
  };
  this.chores.push(newChore);
}
```

---

## Implementation Timeline

### Day 1: Agenda View + Color Coding
- [ ] Remove Day/Week/Month toggle from ChoreCalendarScreen
- [ ] Create `ChoreAgendaView.tsx` component (timeline layout)
- [ ] Group chores by date (today, tomorrow, +3d, +7d sections)
- [ ] Add `choreTypeColors` to theme.ts
- [ ] Update `ChoreRow.tsx` with left border color by type
- [ ] Ensure chore type icons (🚰, 🌿, 🐛, 🔧) render correctly

### Day 2: Quick-Add Form
- [ ] Improve `ChoreFormModal.tsx` (slide-up behavior, auto-dismiss)
- [ ] Add FAB to ChoreCalendarScreen
- [ ] Wire FAB → open ChoreFormModal with date/plant presets
- [ ] Test modal dismiss on outside tap + back gesture
- [ ] Verify form saves to store correctly

### Day 3: Plant ↔ Chore Linkage
- [ ] Add `plantId?` to Chore type (ensure useStore)
- [ ] Update `ChoreFormModal` to accept `plantId` pre-filled
- [ ] Update `ChoreDetailScreen` to show plant name + link
- [ ] Add `getChoresForPlant()` helper to store
- [ ] Update `PlantDetailScreen` with "Tâches liées" section

### Day 4–5: Dashboard Alerts + Polish
- [ ] Make `AlertBanner` alerts tappable (onPress handler)
- [ ] Add `filterChoreType` navigation param to ChoreCalendarScreen
- [ ] Highlight/scroll to filtered chores on open
- [ ] Test all navigation flows (alert → agenda, plant → chores, chore → plant)
- [ ] Microinteractions: toast on chore create, haptic feedback
- [ ] Polish: responsive layout, no console warnings

---

## Verification Checklist

- [ ] `npx tsc --noEmit` → 0 errors
- [ ] Agenda view shows all chores grouped by date
- [ ] Color-coded chores display correctly (border + icon)
- [ ] Quick-add form opens, saves, auto-dismisses
- [ ] Plant ↔ chore links work (both directions)
- [ ] Dashboard alerts are tappable
- [ ] No console warnings
- [ ] Responsive layout (portrait + landscape)
- [ ] All modals/screens have proper SafeAreaView edges
- [ ] Chore completion toggles persist

---

## Files to Create

```
src/components/ChoreAgendaView.tsx       (Agenda timeline)
src/screens/ChoreFormModal.tsx           (Improved quick-add form)
PHASE_3_STATUS.md                        (Progress tracker)
```

## Files to Modify

```
src/screens/ChoreCalendarScreen.tsx      (Remove toggle, integrate agenda)
src/components/ChoreRow.tsx              (Add color border)
src/screens/ChoreDetailScreen.tsx        (Show plant link)
src/screens/PlantDetailScreen.tsx        (Show related chores)
src/components/Dashboard/AlertBanner.tsx (Make clickable)
src/constants/theme.ts                   (Add choreTypeColors)
src/types/index.ts                       (Ensure Chore.plantId, type field)
src/store/useStore.ts                    (Add helpers)
```

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Chore completion rate** | +40% | Chores marked done vs created |
| **Time-in-app** | +20% | Session length in Tâches tab |
| **Quick-add usage** | >60% | New chores via FAB vs modal |
| **Plant-chore linkage** | >50% | Chores with plantId assigned |
| **Alert engagement** | >70% | Clicks on dashboard alerts |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Agenda view performance (>100 chores) | High | Virtualize list (FlatList) |
| Quick-add form too simplified | Medium | User testing; add notes field |
| Plant linkage confusion | Low | Clear icons + copy ("Lié à…") |
| Alert navigation breaks | Medium | Test all alert flows before ship |

---

## Design Notes

- **Agenda view is primary UX** — replaces calendar grid. Modern apps (Apple Reminders, Google Tasks) use agenda for clarity.
- **Color-coding reduces cognitive load** — users scan by type visually.
- **Plant linkage is key differentiator** — most garden apps don't connect chores to plants; HortiAI does.
- **Quick-add friction** — lower the barrier to creating chores; increases habit formation.

---

**Status**: 🟢 Ready for Designer review  
**Owner**: Developer  
**Next**: Designer approval → Implementation kickoff

