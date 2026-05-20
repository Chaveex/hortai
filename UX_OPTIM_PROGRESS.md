# UX Optimization Progress — HortiAI 2026

**Date**: 2026-05-20  
**Status**: Planning  
**Target Metrics**: +25–35% DAU, +20–25% session length, +40% chore completion, +15–20% 30-day retention

---

## Executive Summary

HortiAI is a **solid, well-designed app** with strong foundations (onboarding, AI integration, plant cards). To increase daily active users and time-in-app, focus on **3 high-impact changes**: simplify navigation, add retention gamification, and clarify the task agenda. These align with modern mobile UX trends (2026) and proven retention patterns.

---

## Current Strengths ⭐

### 1. Exceptional Onboarding
- 3-step progressive disclosure (Location → Style → Fertilizer)
- Clean, scannable, emoji-driven
- Immediate personalization hooks (local weather, gardening philosophy)
- Frictionless city geocoding + permissions
- **Retention signal**: User invests in decisions before first screen

### 2. Visual Identity & Consistency
- Cohesive color system (primary green, secondary accents, warning states)
- Emoji-first navigation reduces cognitive load
- Readable typography hierarchy (h1–caption)
- French localization complete (date-fns/locale)
- White cards on cream background ideal for outdoor use

### 3. Smart AI Integration
- Non-intrusive placement (purple FAB floats above tab bar)
- Conversational design (Haiku, rate-limited, image support)
- Contextual system prompt (scoped to gardening, injects city/style)
- Image handling (camera + gallery, compression, base64)

### 4. Well-Designed Plant Cards
- At-a-glance clarity (name, variety, growth stage, urgency)
- Clear action affordances ("Arroser" vs "J'ai arrosé")
- Meta information without scrolling
- Visual urgency (color-coded watering button)

### 5. Sensible Data Architecture
- Single Zustand store (no prop-drilling)
- Derived state auto-recalculated
- Persistence via AsyncStorage
- Async-safe weather fetching

---

## Critical Gaps 🔴

### PRIORITY 1: Navigation Overload (Critical)

**Problem**: 6 tabs + 6 dashboard substacks = **12+ top-level destinations**
- New users cannot distinguish "Semis" from "Tableaux de Bord"
- Dashboard names are data-centric ("Production," "Water"), not task-centric
- No quick-add affordance from tabs

**Current Structure**:
```
Tabs (6):
├─ Accueil (Home)
├─ Jardin (Garden) → AddPlant, PlantDetail, GardenBeds
├─ Tâches (Chores) → ChoreDetail, ChoreForm
├─ Semis (Sowing Calendar)
├─ Tableaux de Bord (Dashboards)
│  ├─ Dashboard (home)
│  ├─ ProductionDashboard
│  ├─ WaterDashboard
│  ├─ HealthScoreDashboard
│  ├─ PlantDetailDashboard
│  └─ ComparisonDashboard
└─ Réglages (Settings)
```

**Modern Mobile Pattern (2026)**: Apps use **3–4 primary tasks**, collapse lesser-used features.

**Target Structure**:
```
Tabs (4):
├─ Accueil (Home) → DashboardStack collapsed
├─ Jardin (Garden) 
│  ├─ Plantes (Plant List) — primary
│  └─ Planification (Garden Beds) — secondary tab
├─ Tâches (Chores) → Agenda view primary
└─ Réglages (Settings)
```

**Changes Required**:
- [ ] Move "Semis" into Jardin as secondary tab
- [ ] Move "Tableaux de Bord" into Accueil as collapsible section or secondary screen
- [ ] Add floating action buttons:
  - Jardin: + Add Plant
  - Tâches: + Add Chore
  - Accueil: → Tableaux de Bord (swipe-right or tap card)
- [ ] Update navigation structure in `src/navigation/index.tsx`

**Expected Impact**: +25% core feature engagement, -2 taps to add plant/chore

**Effort**: Medium (2–3 days)

**Blockers**: None

---

### PRIORITY 2: Zero Retention Gamification (Critical)

**Problem**: No visible **progress**, **streaks**, **milestones**, or **daily rituals**
- Watering is a checkbox, not a win
- Harvest logs buried in Plant Detail
- No "Garden Level" or "Gardener Streak"
- AI chat is help tool, not habit-forming

**Current Retention Gaps**:
- ❌ No streak counter
- ❌ No progress bars
- ❌ No milestone celebrations
- ❌ No daily AI ritual
- ❌ No seasonal challenges
- ❌ No social proof ("outproducing region average")

**Modern Retention Pattern (2026)**:
- Daily check-in rewards ("You watered 3/7 plants! 🎉")
- Streak counters (proven 20–30% DAU lift)
- Progress bars (harvest goals)
- AI personality (daily greeting, encouragement)
- Seasonal missions

**Changes Required**:
- [ ] **Add watering streak counter**:
  - Store in Zustand: `streakDays`, `lastWatered` (date)
  - HomeScreen badge (top-right): "🔥 14" with tap → details
  - Reset streak if any plant overdue by 2 days
  
- [ ] **Add harvest goal progress bar**:
  - Store: `harvestGoal` (kg, default 10), target month
  - HomeScreen section: "This Month's Harvest: 5kg / 10kg"
  - Visual progress bar (green fill)
  - Celebrate when goal hit: Toast "🎉 Goal achieved!"

- [ ] **Add "Gardener Level"**:
  - Formula: Level = 1 + floor((plantCount + harvestCount + daysSinceOnboarding) / 20)
  - HomeScreen: "Level 3 Gardener" below greeting
  - Levels unlock badges (visual only, no paywall)

- [ ] **Daily AI greeting** (opt-in notification):
  - Settings toggle: "Daily gardening tip at [time]"
  - Nymph sends one micro-tip (30 chars) + encouragement
  - Logged in store to avoid repeat same-day

- [ ] **Celebrate harvests**:
  - When adding harvest entry in PlantDetailScreen → Toast: "🎉 Harvest logged!"
  - First harvest of plant → Toast: "🎉 First harvest! Time to celebrate!"

- [ ] **Update HomeScreen layout**:
  - Replace stats chip (plant count) with badge row:
    - 🔥 Streak (tap → detail)
    - 🏆 Level
    - 📊 Harvest progress bar

**Store Changes**:
```tsx
// In useStore (Zustand)
interface State {
  streakDays: number;
  lastWatered: string | null;
  harvestGoal: number; // kg
  harvestGoalMonth: string; // yyyy-MM
  gardenerLevel: number;
  lastDailyTipDate: string | null;
}
```

**Expected Impact**: +20–30% DAU, +15% session length

**Effort**: High (4–5 days)

**Dependencies**: None (can work in parallel with Priority 1)

---

### PRIORITY 3: Chore Calendar Friction (Critical)

**Problem**: Unclear UI, no agenda view, no quick-add, no visual hierarchy

**Current Issues**:
- Day/Week/Month toggle is not intuitive (which should be default?)
- Filtering hidden in bottom sheet (not discoverable)
- Must tap into modal form to add chore
- No visual distinction between **automated watering** (from recommendations) and **manual chores**

**Target UX**:
- Default to **Agenda view** (next 7 days timeline)
- **Color-coded chores** by type:
  - 💧 Watering (blue)
  - 🌿 Fertilizing (green)
  - 🐛 Pest control (red)
  - 🔧 Maintenance (gray)
- **Quick-add inline form**: Tap "+" → slide-up form (dismiss on outside tap)
- **Link to plants**: Tap chore → see affected plant; tap plant → see chores

**Changes Required**:
- [ ] **Replace ChoreCalendarScreen view toggle with Agenda**:
  - Remove Day/Week/Month buttons
  - New component: `ChoreAgendaView` (vertical timeline)
  - Show next 7 days as sections (Today, Tomorrow, Next 7d)
  - Virtualize list if >50 chores

- [ ] **Color-code chores**:
  - Add `color` field to Chore type? Or compute from `choreType`
  - Update `DayView`, `WeekView`, `MonthView` to show colors as left border

- [ ] **Quick-add button**:
  - Move FAB from bottom-right to bottom-center (already done)
  - Or add "+" in header of ChoreCalendarScreen
  - Tap → slide-up `ChoreFormModal` (simplified, no full screen)
  - Form fields: date picker, type dropdown, plant selector, notes

- [ ] **Link chores ↔ plants**:
  - Update `ChoreFormScreen` to accept `plantId` pre-filled
  - Add plant context to chore card (shows plant name + emoji)
  - Tap plant name → navigate to `PlantDetailScreen`

- [ ] **Update dashboard alerts**:
  - Make alerts clickable (tap → navigate to ChoreCalendarScreen)
  - Filter to relevant chore type on navigate
  - Example: "⚠️ High humidity detected" → ChoreCalendarScreen + scroll to watering chores

**Chore Type Colors** (Update `constants/theme.ts`):
```tsx
const choreTypeColors = {
  watering: '#3B82F6',      // blue
  fertilizing: '#10B981',   // green
  pestControl: '#EF4444',   // red
  maintenance: '#6B7280',   // gray
};
```

**Expected Impact**: +40% chore completion, +20% time-in-app

**Effort**: High (4–6 days)

**Dependencies**: None (can work in parallel)

---

## Secondary Gaps 🟡

### Dashboard Discoverability & Clarity

**Problem**: "Tableaux de Bord" is vague. Charts aggregate metrics but lack narrative or actionable next steps.

**Current State**:
- KPI cards + bar charts + plant comparisons
- No "why should I look at this?"
- No empty state for users with <3 plants (charts meaningless at scale)
- Alerts exist but not clickable

**Changes Required**:
- [ ] **Rename "Tableaux de Bord"** → "Insights" (or "Votre Récolte")
- [ ] **Add narrative headers**:
  - "This month's harvest" (if entries > 0)
  - "Plant health check" (if alerts exist)
  - "You're ahead of schedule" (if predictions > regional avg)
- [ ] **Make alerts clickable**: Tap → navigate to plant or chore
- [ ] **Show empty state**: If <3 plants: "Start logging harvests to see trends. Add an entry in any plant's detail." + CTA
- [ ] **Add interactive legend**: Tap bar label → filter by plant type or bed

**Expected Impact**: +15% dashboard engagement

**Effort**: Medium (2–3 days)

---

### Garden Beds Underutilized

**Problem**: Feature exists (BedGridScreen, GardenCell) but feels secondary, hidden behind 2 taps.

**Current Issues**:
- Cells map plant names but don't show watering status or growth stage
- No spatial watering logic (water entire bed at once)
- No visual feedback on bed health

**Changes Required**:
- [ ] **Promote to primary Jardin feature**: Tab within Jardin (Plantes / Planification)
- [ ] **Enrich cell visualization**:
  - Cell background = growth stage (🔴 seedling → 🟡 vegetative → 🟢 flowering)
  - Cell border = watering status (🔵 needs, ✓ watered today, ⚪ next in 3d)
- [ ] **Add spatial watering**: Long-press bed → "Arroser tout ce lit"
- [ ] **Show bed summary**: "Lit A: 6 plantes, 2 à arroser, récolte prévue dans 5j"

**Expected Impact**: +15% engagement for users with >5 plants

**Effort**: Medium (2–3 days)

---

## Tertiary Gaps 🟠

### Accessibility

**Gaps**:
- ❌ No dark mode
- ❌ Color contrast (caption text on light bg may fail WCAG AA)
- ❌ Touch targets <44pt (filter icon, some buttons)
- ❌ No a11y labels (accessibilityRole, accessibilityLabel)
- ❌ Screen reader support incomplete (AIChatModal state changes)

**Changes Required**:
- [ ] Audit colors with WCAG contrast checker
- [ ] Resize touch targets to 44×44pt minimum
- [ ] Add accessibility labels throughout
- [ ] Implement dark mode (useDarkMode hook, flip colors)

**Expected Impact**: +10% accessibility score, +5% user base

**Effort**: Medium (2–3 days)

---

### Microinteractions & Polish

**Gaps**:
- ❌ No haptic feedback on actions (mark watered, complete chore)
- ❌ No page transitions (screens appear instantly)
- ❌ No skeleton loaders during weather fetch
- ❌ Plant card borders change, but no smooth transition

**Changes Required**:
- [ ] Add haptic feedback (expo-haptics) on:
  - Mark watered
  - Complete chore
  - Log harvest
  - Button presses
- [ ] Add screen transitions (Animated.timing or Reanimated 3)
- [ ] Add skeleton loaders during weather fetch
- [ ] Add snackbar feedback ("✓ Plant marked as watered")

**Expected Impact**: +15–20% perceived quality

**Effort**: Low (1–2 days)

---

## Unique Value (Already Exists, Needs Amplification)

1. **Multi-bed spatial planning** — Most apps (Planta, All Plants) single-plant only
2. **AI botanist (nymph)** — Personalized, scoped, image-capable
3. **Gardening style personas** — Permaculture, biodynamique, hydroponique
4. **French-first localization** — Not translated; culturally aware
5. **Advanced dashboards (P2)** — Production, water, health, comparisons

**Leverage in retention**:
- Highlight "Your permaculture edge" in dashboards
- "As a hydroponique gardener, you're saving 40% water vs. conventional"
- "Your garden is #8 in France for winter greens!"

---

## Implementation Roadmap

### Phase 1: Navigation Restructure (Week 1)
**Effort**: Medium (2–3 days)  
**Dependencies**: None

- [ ] Redesign `src/navigation/index.tsx`
- [ ] Move Semis → Jardin sub-tab
- [ ] Move Tableaux de Bord → Accueil collapsible
- [ ] Add context FABs (+ Add Plant, + Add Chore)
- [ ] Test all navigation flows
- [ ] Commit + push

### Phase 2: Retention Gamification (Week 1–2)
**Effort**: High (4–5 days)  
**Dependencies**: None (parallel with Phase 1)

- [ ] Add Zustand store fields (streakDays, harvestGoal, level)
- [ ] Implement streak logic (track lastWatered, reset on overdue)
- [ ] Update HomeScreen UI (badges, progress bar)
- [ ] Implement daily AI notification (opt-in)
- [ ] Add harvest celebration toasts
- [ ] Test all retention mechanics
- [ ] Commit + push

### Phase 3: Chore Calendar Overhaul (Week 2–3)
**Effort**: High (4–6 days)  
**Dependencies**: Phase 1 (navigation), Phase 2 (dashboard alerts)

- [ ] Build `ChoreAgendaView` component
- [ ] Add color-coding system
- [ ] Implement quick-add form
- [ ] Link chores ↔ plants
- [ ] Update dashboard alerts (make clickable)
- [ ] Remove Day/Week/Month toggle
- [ ] Test all chore UX
- [ ] Commit + push

### Phase 4: Secondary Optimizations (Week 3–4)
**Effort**: Medium (2–3 days each)  
**Dependencies**: Phase 3

- [ ] Dashboard narrative + empty states
- [ ] Garden beds promotion + enrichment
- [ ] Accessibility audit + fixes
- [ ] Microinteractions + polish

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **DAU** | +25–35% | Analytics (session starts) |
| **Session length** | +20–25% | Average session duration |
| **Chore completion** | +40% | Chore completion rate |
| **30-day retention** | +15–20% | Day 30 return rate |
| **Streak participation** | >50% | Users with active streaks |
| **Harvest logging** | +30% | Harvest entries added |
| **Dashboard engagement** | +15% | Time spent in Insights tab |
| **Accessibility score** | +10% | WCAG AA compliance |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Navigation restructure breaks existing UX | High | Test all flows extensively; A/B test if possible |
| Gamification feels forced/corny | Medium | Keep tone light (nymph personality); iterate on copy |
| Chore quick-add form is too simplified | Medium | User testing; iterate form fields based on feedback |
| Dashboard alerts clutter screen | Low | Limit to 3 active alerts; user can dismiss |
| Accessibility changes regress functionality | Low | WCAG audit before + after; test with screen readers |

---

## Open Questions

- [ ] Should streak reset automatically or show warning?
- [ ] How many past chores to show in agenda (default 7 days or configurable)?
- [ ] Should harvest goal be per-month or cumulative annual?
- [ ] Should dark mode be user-selected or system-based (follow device)?
- [ ] Notification permission flow — when to request for daily tips?
- [ ] Should level unlock achievements (visual badges)?

---

## Notes

- **Benchmarks**: Duolingo (streaks), Habitica (gamification), Planta (plant cards), Google Tasks (agenda)
- **2026 trends**: Hyper-personalization, haptic feedback, minimal motion (not excessive), dark mode standard
- **Unique positioning**: Multi-bed + AI botanist + French-first. Lean into these.
- **User personas**: Home gardeners (casual), community gardeners (organized), enthusiasts (power users). Tailor retention to each.

---

**Last Updated**: 2026-05-20  
**Owner**: UX/Design Team  
**Status**: 🟢 Phase 1 Ready for Kickoff (Design Review Pending)
