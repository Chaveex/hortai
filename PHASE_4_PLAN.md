# Phase 4 — Secondary Optimizations (HOR-04)

**Date**: 2026-05-20  
**Target**: +15% engagement via dashboard narratives + garden beds enrichment  
**Effort**: 3–4 days  
**Dependencies**: Phase 3 ✅

---

## Overview

Post-Phase 3 polish. Add contextual narrative to dashboards, enrich garden beds with metadata, audit accessibility (WCAG AA), implement microinteractions (haptics, animations, toast patterns).

---

## Features

### Feature 1: Dashboard Narrative (Storytelling)

**Problem**: Dashboards are metric-heavy but lack contextual copy. Users see numbers without guidance on action.

**Solution**: Add inline helpful copy + "Did you know?" tips.

**Implementation**:
- **HomeScreen dashboard**: Add brief narrative below KPI cards
  - "🌱 Garden is 3 weeks ahead of season — keep up watering!"
  - "🏆 You're 2kg away from monthly goal — harvest a few more!"
- **ProductionDashboard**: Add section header with context
  - "Your tomatoes are outperforming regional average by 40%"
- **WaterDashboard**: 
  - "This week's watering: 45L (optimal for current temp/humidity)"
- **HealthScoreDashboard**: 
  - "Health score trending up — pests under control, nitrogen adequate"

**Files to modify**:
- `src/screens/HomeScreen.tsx` (add narrative cards)
- `src/screens/ProductionDashboard.tsx` (add context header)
- `src/screens/WaterDashboard.tsx` (add context header)
- `src/screens/HealthScoreDashboard.tsx` (add context header)

**Duration**: 1 day

### Feature 2: Garden Beds Enrichment

**Problem**: Garden beds view (Planification tab) shows only plant list. No bed-level metadata or management.

**Solution**: Add bed dimensions, soil notes, crop rotation tracking, bed-specific watering schedule.

**Implementation**:
- **GardenBedsScreen (Planification tab)**:
  - Show bed selector (horizontal scroll) if multiple beds
  - Bed card shows: dimensions (m²), soil type, last prepared date
  - "📝 Notes" section: expandable field for bed-specific notes
  - "🔄 Crop rotation" badge: shows previous crop + rotation status
  - Plant list within bed (existing, keep)
  - "⚙️ Bed settings" button: manage dimensions, soil, history

- **New modal: BedSettingsModal**:
  - Edit dimensions (length × width)
  - Edit soil type (loam/clay/sandy/mixed)
  - Add/edit crop rotation history (plant1 → plant2 → plant3)
  - Last prepared date (date picker)

**Files to create/modify**:
- `src/screens/GardenBedsScreen.tsx` (add bed metadata display)
- `src/screens/BedSettingsModal.tsx` (new — settings form)
- `src/types/index.ts` (extend Garden interface with bedName, dimensions, soilType, cropRotation, lastPrepared)
- `src/store/useStore.ts` (add actions: updateBedMetadata)

**Duration**: 1.5 days

### Feature 3: Accessibility Audit (WCAG AA)

**Problem**: Phase 3 focused on UX but didn't audit full accessibility compliance.

**Solution**: Full WCAG AA audit + fixes.

**Checklist**:
- [ ] All interactive elements: 44×44 min touch target
- [ ] Color contrast: 4.5:1 text/background (normal), 3:1 (large)
- [ ] Form labels: associated with inputs (accessibilityLabel or label)
- [ ] Images: alt text (emojis don't need alt, icons do)
- [ ] Modal focus trap: focus doesn't escape modal
- [ ] Keyboard nav: all buttons reachable via tab
- [ ] Screen reader: VoiceOver/TalkBack tested on key flows
- [ ] Animations: respects `prefers-reduced-motion`
- [ ] Link underlines: all links visually distinct (not color alone)
- [ ] Error messages: associated with fields, announced on change

**Files to audit** (priority order):
1. ChoreAgendaView, ChoreDetailScreen, ChoreFormScreen
2. PlantDetailScreen, GardenBedsScreen
3. DashboardScreen (all dashboard substacks)
4. HomeScreen, SettingsScreen

**Duration**: 1–1.5 days

### Feature 4: Microinteractions

**Problem**: App feels flat. No haptic feedback, animations are jerky, toast patterns inconsistent.

**Solution**: Add polish.

**Implementation**:
- **Haptic feedback**:
  - FAB tap: light haptic
  - Form submit: medium haptic
  - Chore complete: success haptic (heavy + light double-tap pattern)
  - Error: weak haptic (single pulse)

- **Animations**:
  - Chore section headers: subtle fade-in as they appear
  - Agenda view item enter: slide from left
  - Modal appear: spring animation from bottom
  - Badge badge pulse when new chores added

- **Toast patterns**:
  - Success: green ✅ toast, 2s auto-dismiss
  - Error: red ❌ toast, tap to dismiss
  - Info: blue ℹ️ toast, 3s auto-dismiss
  - Standardize across all screens

**Files to modify**:
- Add `expo-haptics` if not present (check package.json)
- Wrap FAB/buttons with haptic on press
- ChoreAgendaView: add Animated enter + fade
- ChoreFormScreen: add spring modal animation
- Create `useToast` hook (if not exist) for consistent toast pattern

**Duration**: 1–1.5 days

---

## Implementation Timeline

**Day 1**: Dashboard narrative  
**Day 2**: Garden beds enrichment (start)  
**Day 3**: Garden beds enrichment (finish) + Accessibility audit (start)  
**Day 4**: Accessibility audit (finish) + Microinteractions  

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Dashboard engagement | +15% session time |
| Beds data entry | >60% users add bed metadata |
| WCAG AA compliance | 100% (0 contrast fails, all touch targets ≥44pt) |
| Microinteraction feedback | User satisfaction ↑ (qualitative) |

---

## Risks

| Risk | Mitigation |
|------|-----------|
| Accessibility audit reveals >10 issues | Prioritize critical (contrast, touch targets) over nice-to-have (animations) |
| Haptic feedback on low-end phones | Graceful degradation, no crash if unsupported |
| Beds enrichment scope creep | Limit to 3 fields (dimensions, soil, rotation history) |

---

## Pre-Implementation Checklist (Designer-approved)

- [ ] Add `expo-haptics` to package.json
- [ ] Create `src/hooks/useToast.ts` for consistent toast patterns
- [ ] Extend GardenBed type: `dimensions { length, width, unit }`, `soilType`, `cropRotation[]`, `lastPrepared`
- [ ] Document form sharing strategy (BedFormScreen ↔ BedSettingsModal to avoid duplication)
- [ ] Plan accessibility audit order: ChoreAgendaView → PlantDetailScreen → Dashboards → HomeScreen/Settings
- [ ] Prioritize a11y critical fixes (contrast, touch targets) over nice-to-haves (link underlines, animations)

---

**Status**: 🟢 Designer Approved  
**Owner**: Developer  
**Next**: Day 1 implementation kickoff (Dashboard narrative)

