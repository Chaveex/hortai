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

**Implementation** (Designer-approved):
- Component: `src/components/ChoreAgendaView.tsx`
- Data structure: Group chores by **date sections with sticky headers**
  - **Overdue** section (chores with date < today) — pinned at top with red header
  - **Today** (default view on open)
  - **Tomorrow**
  - **+3 days**
  - **+7 days**
  - Scroll-on-demand beyond +7d
- Scroll behavior: **Forward-only** (no scrolling backward to past chores; overdue is sticky)
- Virtualized SectionList if >50 chores (native performance)
- Sticky section headers (always visible while scrolling)
- Tap chore → ChoreDetailScreen
- Swipe-left for quick-complete (optional, Phase 4)

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

**Trigger**: Single floating action button (FAB) only (centered at bottom)

**Behavior** (Designer-approved):
- Tap FAB → bottom-sheet slide-up form (NOT full-screen modal)
- Swipe down or tap outside to dismiss
- If user has unsaved changes → show "Discard changes?" confirmation
- Form fields (minimal):
  - Date picker (default: today)
  - Chore type dropdown (watering, fertilizing, pest, maintenance)
  - Plant selector (optional, pre-filled if coming from PlantDetail)
  - Priority toggle (Low/Med/High, optional)
  - Notes textarea (optional)
- Action buttons: "Créer" (save), "Annuler"
- On success: Show "✅ Tâche créée!" toast, auto-dismiss form

**Route params** (for pre-fill):
```tsx
navigation.navigate('ChoreForm', {
  date?: string,           // YYYY-MM-DD (default: today)
  plantId?: string,        // Pre-select plant
  type?: ChoreType,        // Pre-select type (optional)
})
```

**Component**: `src/screens/ChoreFormModal.tsx` (reuse existing, improve)

### Feature 4: Link Chores ↔ Plants (Bidirectional)

**Chore → Plant**:
- Chore type has `plantId?` field (already exists in codebase)
- ChoreDetailScreen shows plant name + emoji in header
- Tap plant name → navigate to PlantDetailScreen

**Plant → Chores** (Designer-approved):
- PlantDetailScreen shows "Tâches liées" section below plant metadata
- Card-based layout listing **pending + upcoming chores only** (not past)
- Each chore card shows: emoji + type + date + action (tap to detail)
- **"➕ Ajouter une tâche" button** at top of section
  - Tap → ChoreFormModal with `plantId` pre-filled
  - User selects date/type/priority/notes
  - Form saves with this plantId auto-assigned

**Store helpers**:
- `getChoresForPlant(plantId, statusFilter?: 'pending' | 'upcoming')` — Returns chores for plant, filtered to pending/upcoming only
- `addChore()` — Already exists, now supports `plantId` parameter

**Route param flow**:
```tsx
// From PlantDetailScreen "Add chore" button
navigation.navigate('ChoreForm', { plantId: plant.id })

// ChoreFormModal receives route params, pre-fills plant selector
```

**Files to modify**:
- `src/types/index.ts` (ensure Chore.plantId, ChoreStatus types)
- `src/screens/ChoreDetailScreen.tsx` (show plant link in header)
- `src/screens/PlantDetailScreen.tsx` (add "Tâches liées" section + "Add chore" button)
- `src/store/useStore.ts` (add `getChoresForPlant()` helper with status filter)

### Feature 5: Clickable Dashboard Alerts

**Current**: Alerts shown in DashboardScreen (AlertBanner) but not actionable  
**New** (Designer-approved): Tap alert → navigate to ChoreCalendarScreen + filter to relevant chore type

**Alert ↔ Chore Type Mapping**:
- Extend `AlertItem` type with optional `choreTypeFilter?: ChoreType[]`
- DashboardScreen creates alerts with mapping:
  - "High humidity detected" → `choreTypeFilter: ['watering']`
  - "Low nitrogen" → `choreTypeFilter: ['fertilizing']`
  - Multiple types possible: `['watering', 'fertilizing']`

**Example flow**:
- Dashboard shows: "⚠️ High humidity detected ›" (with chevron/affordance)
- Tap alert → ChoreCalendarScreen + filter to watering chores
- Auto-scroll to first matching chore (or "Overdue" if present)

**Visual affordance** (Designer requirement):
- Add trailing chevron icon (›) when alert is tappable
- Use `activeOpacity={0.7}` for press feedback
- Consider `ripple` effect on Android

**Implementation**:
- Extend `AlertItem` type: `choreTypeFilter?: ChoreType[]`
- Update `AlertBanner.tsx`: Add chevron icon + tap handler
- Update `ChoreCalendarScreen.tsx`: Accept route param `filterChoreType?: ChoreType[]`
- Auto-filter chores on open, scroll to first match

**Files to modify**:
- `src/types/index.ts` (extend AlertItem)
- `src/components/Dashboard/AlertBanner.tsx` (add onPress, chevron, ripple)
- `src/screens/ChoreCalendarScreen.tsx` (accept filter param, useRoute hook)

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

