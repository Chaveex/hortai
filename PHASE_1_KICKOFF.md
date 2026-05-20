# Phase 1 Kickoff — Navigation Restructure

**Date**: 2026-05-20  
**Status**: Ready for Design Review & Implementation  
**Owner**: Orchestrator Agent  
**Target Completion**: 2026-05-24 (3 days)

---

## Executive Summary

**Phase 1 restructures the navigation tab system from 6 → 4 tabs** to improve discoverability and reduce cognitive load. This eliminates the "Semis" and "Tableaux de Bord" tabs by integrating them into existing navigation stacks, and adds context-aware floating action buttons (FABs) for quick plant/chore creation.

**Key Changes**:
1. **Tabs reduced**: Accueil, Jardin, Tâches, Réglages (4 instead of 6)
2. **Semis moved**: Into Jardin as secondary tab (Plantes ↔ Planification)
3. **Tableaux de Bord moved**: Into Accueil as collapsible section or dedicated screen
4. **Context FABs added**: Jardin (+ Add Plant), Tâches (+ Add Chore)
5. **Navigation refactored**: Updated src/navigation/index.tsx

**Expected Impact**: +25% core feature engagement, -2 taps to add plant/chore, improved discoverability.

---

## Phase 1 Scope (4 Acceptance Criteria)

### 1. Tab Restructure (Primary)

**Current State**:
```
Tabs (6):
├─ Accueil
├─ Jardin → GardenList, AddPlant, PlantDetail, GardenBeds, BedGrid, Stats
├─ Tâches → ChoreCalendar, ChoreDetail, ChoreForm
├─ Semis (single screen)
├─ Tableaux de Bord (6-screen stack)
└─ Réglages → SettingsMain, BackupSettings
```

**Target State**:
```
Tabs (4):
├─ Accueil (Home) → DashboardStack accessible via tap/collapsible
├─ Jardin (Garden) → Inner tabs: Plantes (primary) | Planification (secondary)
│  ├─ Plantes stack: GardenList, AddPlant, PlantDetail, Stats
│  └─ Planification stack: GardenBeds, BedGrid, BedForm, SowingCalendar
├─ Tâches (Chores) → ChoreStack (ChoreCalendar, ChoreDetail, ChoreForm)
└─ Réglages (Settings) → SettingsStack
```

**Design Requirements** (For Designer Review):
- [ ] Confirm inner-tab design for Jardin (Plantes | Planification)
- [ ] Approve Accueil → Tableaux de Bord navigation (tap card vs collapsible vs dedicated tab icon)
- [ ] Confirm icon/label changes for reduced tab count
- [ ] Approve visual hierarchy (selected tab = larger emoji, accent color underline or background)
- [ ] Validate touch target size (min 44pt height)

---

### 2. Inner Tab Implementation for Jardin

**Architecture**:
- Jardin tab contains a **BottomTabNavigator** (or TopTabNavigator if Designer prefers)
- Tab 1 (Plantes): Shows plant list, links to AddPlant/PlantDetail/Stats
- Tab 2 (Planification): Shows garden beds grid, links to bed management + sowing calendar

**Design Spec**:

| Aspect | Detail |
|--------|--------|
| **Layout** | Nested bottom tabs (above existing bottom nav) OR top tabs below header |
| **Labels** | "Plantes" (🌱) + "Planification" (🌳) |
| **Indicator** | Underline (accent color) or full-width background |
| **Swipe** | Enable horizontal swipe between tabs |
| **Transition** | Fade or slide (no excessive motion per 2026 guidelines) |
| **Header** | Shared (shows "Jardin" title, no duplication) |

**Developer Task**:
- [ ] Create `GardenTabNavigator` component (nested BottomTabNavigator)
- [ ] Move GardenScreen → Plantes tab
- [ ] Create `PlanificationStack` (BedGrid, BedForm, SowingCalendar)
- [ ] Update navigation routing
- [ ] Test tab switching, back button handling

---

### 3. Accueil → Tableaux de Bord Navigation

**Option A (Recommended)**: Tap card (Designer chooses location)
- HomeScreen displays a **"Tableaux de Bord"** card (summary stats, small chart preview)
- User taps → navigates to DashboardStack (existing screens unchanged)
- Returns to HomeScreen on back

**Option B**: Collapsible section
- HomeScreen shows collapsed summary below chores
- Tap header → expands to show all dashboards inline
- Users can tap any dashboard to go full-screen

**Option C**: Secondary tab in Accueil
- Accueil has inner tabs: Home | Tableaux de Bord (similar to Jardin)
- Home = current HomeScreen
- Tableaux de Bord = DashboardStack
- Less recommended (adds nesting)

**Design Requirements** (For Designer):
- [ ] Choose Option A, B, or C
- [ ] If Option A: design card layout (what metrics to show, CTA text)
- [ ] If Option B: design header + collapse animation
- [ ] Approve color/spacing/typography
- [ ] Confirm card is discoverable (position on HomeScreen)

**Developer Task**:
- [ ] Implement chosen option
- [ ] Update HomeScreen OR create inner tabs
- [ ] Add navigation to DashboardStack
- [ ] Test back button, deep linking

---

### 4. Context-Aware FABs

**Design Spec**:

| Tab | FAB Action | Current Behavior |
|-----|-----------|------------------|
| Jardin | + Add Plant | Navigate to AddPlantScreen |
| Tâches | + Add Chore | Navigate to ChoreFormScreen |
| Accueil | AI Chat | Already exists (AIFABButton) |
| Réglages | None | No FAB |

**Current State**:
- AIFABButton (purple, bottom-right) is mounted in Navigation component
- Opens AIChatModal overlay

**Changes**:
- Move AIFABButton into each tab (conditionally render based on active tab)
- OR keep global but change icon/action based on active tab
- Jardin & Tâches show context-relevant FAB (+ icon)
- Accueil & Réglages show AI Chat FAB (💬 icon) or hide FAB

**Design Requirements** (For Designer):
- [ ] Approve FAB positioning (bottom-right, size 56pt)
- [ ] Confirm FAB colors (primary green for + Add, purple for 💬 AI Chat)
- [ ] Approve FAB labels/icons
- [ ] Confirm behavior (tap → navigate, no toast, full-screen)
- [ ] Validate accessibility (touch targets 44×44pt min)

**Developer Task**:
- [ ] Refactor AIFABButton to accept `tab` prop
- [ ] Conditionally show FAB based on active tab
- [ ] Jardin FAB: navigate to AddPlantScreen
- [ ] Tâches FAB: navigate to ChoreFormScreen
- [ ] Test navigation, dismiss on back button

---

## Files to Modify

### Primary (Core Changes)

| File | Change |
|------|--------|
| `src/navigation/index.tsx` | Redesign Tab structure, add inner GardenTabNavigator, adjust FAB logic |
| `src/screens/HomeScreen.tsx` | Add Tableaux de Bord card/section (if Option A/B) |

### Secondary (Dependent Updates)

| File | Change |
|------|--------|
| `src/components/AIFABButton.tsx` | Update to accept `tab` prop, conditionally show action |
| Type definitions (if needed) | Extend navigation prop types for inner tabs |

### No Changes Needed

- GardenScreen, AddPlantScreen, PlantDetailScreen (reuse in new structure)
- ChoreCalendarScreen, ChoreFormScreen, ChoreDetailScreen (reuse in ChoreStack)
- SettingsScreen, BackupSettingsScreen (reuse in SettingsStack)
- DashboardScreen + variants (reuse in DashboardStack)
- SowingCalendarScreen (move to PlanificationStack)

---

## Implementation Approach

### Step-by-Step (Developer)

**Step 1: Design Review (1 hour)**
- Designer reviews this spec and approves:
  - Inner-tab design for Jardin
  - Accueil → Tableaux de Bord navigation option
  - FAB behavior and styling

**Step 2: Navigation Restructure (4–6 hours)**
1. Create `GardenTabNavigator` component (nested BottomTabNavigator)
   - Tab 1 (Plantes): GardenStack (GardenList, AddPlant, PlantDetail, Stats)
   - Tab 2 (Planification): PlanificationStack (BedGrid, BedForm, SowingCalendar)
2. Update main Tab navigator:
   - Remove "Semis" tab
   - Remove "Tableaux de Bord" tab
   - Replace Jardin with GardenTabNavigator
   - Keep Accueil, Tâches, Réglages
3. Update Accueil navigation (Option A/B/C from Designer choice)
4. Refactor AIFABButton for tab-aware rendering

**Step 3: Testing (2–3 hours)**
- [ ] Tab switching in Jardin (Plantes ↔ Planification)
- [ ] Navigation from each inner tab (AddPlant, BedForm, SowingCalendar)
- [ ] Back button behavior (nested stacks)
- [ ] FAB behavior on each tab
- [ ] Accueil → Tableaux de Bord navigation
- [ ] Deep linking (if used)
- [ ] Rotate device (orientation changes)

**Step 4: Code Review & Commit (1 hour)**
- Self-review, commit message: "feat: P1 navigation restructure (6→4 tabs, inner Jardin, context FABs)"

---

## Design Review Checklist (For Designer)

Before Developer starts implementation, Designer must review and approve:

- [ ] **Inner-tab design for Jardin**
  - Top tabs (below header) or bottom tabs (above main bottom nav)?
  - Labels: "Plantes" + "Planification"?
  - Indicator style (underline, background, color)?
  - Font size, padding, touch target size?

- [ ] **Accueil → Tableaux de Bord navigation**
  - Option A (card), B (collapsible), or C (inner tabs)?
  - If Option A: card position (below chores?), preview content, CTA text?
  - Icon/label for Tableaux de Bord card?

- [ ] **FAB styling & behavior**
  - Size (56pt?), color (green for +, purple for 💬)?
  - Icons: + (Add) and 💬 (Chat)?
  - Position (always bottom-right)?
  - Show on all tabs or selective (Jardin, Tâches, Accueil only)?

- [ ] **Overall visual consistency**
  - Icon size/weight for reduced tab count?
  - Tab label size (was: "Accueil, Jardin, Tâches, Semis, Tableaux de Bord, Réglages" → now 4 tabs, less crowded)?
  - Spacing/padding adjustments?

---

## Effort & Timeline

| Task | Owner | Duration | Dependencies |
|------|-------|----------|--------------|
| Design Review | Designer | 1–2 hours | Spec approval |
| Navigation Restructure | Developer | 4–6 hours | Design approval |
| Testing & Iteration | Developer | 2–3 hours | Restructure complete |
| Code Review | Developer | 1 hour | Testing complete |
| **Total** | **Both** | **2–3 days** | None |

**Target Completion**: 2026-05-24 (3 working days from 2026-05-20)

---

## Acceptance Criteria

- [ ] **Navigation**: Tabs reduced to 4 (Accueil, Jardin, Tâches, Réglages)
- [ ] **Inner tabs**: Jardin has Plantes ↔ Planification tabs (smooth switching)
- [ ] **Semis integrated**: SowingCalendarScreen moved to PlanificationStack, accessible from Jardin
- [ ] **Dashboards integrated**: Tableaux de Bord accessible from Accueil (tap card / collapsible / inner tab)
- [ ] **FABs context-aware**: Jardin shows + Add Plant, Tâches shows + Add Chore, others show 💬 AI Chat
- [ ] **Back button**: Works correctly on nested tabs (doesn't break stack)
- [ ] **Rotation**: Inner tabs survive device rotation
- [ ] **TypeScript**: No `any` types, proper StackNavigationProp types
- [ ] **Tests**: Manual test all navigation flows (listed in Testing section above)
- [ ] **Commit**: Clear, conventional message with reasoning

---

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|------------|-----------|
| Nested tabs confuse navigation stack | Medium | Test back button extensively, use react-navigation best practices |
| FAB shows on wrong tab | Low | Use `useFocusEffect` or navigation state listener to update FAB |
| Accueil collapsible interferes with scroll | Low | Test with long dashboard content, use FlexLayout |
| Users can't find Semis/Tableaux de Bord after move | Medium | Design good card/section design, test with users post-launch |

---

## Next Steps

### For Designer:
1. Review this spec
2. Answer checklist questions above
3. Provide design mockups or confirmation (can be text-based)
4. Approve before Developer starts

### For Developer:
1. Wait for Designer approval
2. Create task/branch: `feat/P1-navigation-restructure`
3. Follow Step-by-Step implementation above
4. Create PR with testing summary
5. Merge after code review

### For Orchestrator:
1. Track progress in UX_OPTIM_PROGRESS.md (update Phase 1 status)
2. Validate Design review completion
3. Monitor Developer implementation
4. Approve PR and close Phase 1

---

## Success Metrics

Post-Phase 1 launch (target: 2026-05-25):
- **Navigation tree depth**: Max 3 levels (was 4+ before)
- **Tap count to add plant**: 2 taps (was 3–4)
- **Tap count to add chore**: 2 taps (was 3–4)
- **Tab visibility**: All 4 tabs always visible (no horizontal scroll)
- **User feedback**: Measure discoverability of Semis/Tableaux de Bord post-launch

---

## References

- **Current Navigation**: `src/navigation/index.tsx` (lines 1–146)
- **UX Strategy**: `UX_OPTIM_PROGRESS.md` (Priority 1, lines 52–103)
- **Multi-Agent System**: `MULTI_AGENT_SYSTEM.md`
- **Codebase Docs**: `CLAUDE.md` (architecture, navigation)

---

**Status**: 🟡 Ready for Design Review  
**Awaiting**: Designer approval before Developer starts (ETA: 2026-05-20 or 2026-05-21)
