# Phase 5 — Internationalization (i18n) FR/EN/ES (HOR-05)

**Date**: 2026-05-20  
**Target**: Support FR/EN/ES UI language switching  
**Effort**: 2–3 days  
**Dependencies**: Phase 4 ✅

---

## Overview

Add full i18n (internationalization) support for French/English/Spanish UI. Users can switch language in Settings; all UI text adapts instantly.

---

## Feature: Internationalization (i18n) System

### Technology

**Library**: `i18next` + `react-i18next` (React Native integration)
- Config: `src/i18n/config.ts`
- Translation files: `src/i18n/locales/fr.json`, `en.json`, `es.json`
- Language detection: Default to device locale, user override in Settings

### UI Strings to Translate

Priority order:
1. **Core navigation** (tab labels, screen titles)
2. **Dashboard labels** (metrics, narratives)
3. **Chore management** (agenda, quick-add, plant linkage)
4. **Plant detail** (growth stage, watering, harvest)
5. **Settings** (options, labels, notifications)
6. **Error/success messages** (toasts, alerts)

### Store Update

Add to `UserProfile`:
- `language: 'fr' | 'en' | 'es'` (default: device locale or 'fr')

### Settings Update

**SettingsScreen**: Add Language section
```
┌──────────────────────┐
│ Langue / Language    │
│ ○ Français          │
│ ○ English           │
│ ○ Español           │
└──────────────────────┘
```

On change: `updateProfile({ language: 'en' })` → triggers `i18n.changeLanguage(lang)` → UI re-renders

### Implementation

1. Install `i18next`, `react-i18next`
2. Create `src/i18n/config.ts` (init config)
3. Create `src/i18n/locales/{fr,en,es}.json` (translation files)
4. Wrap app in `<I18nextProvider>`
5. Replace all hardcoded strings with `useTranslation()` hook
6. Add Language toggle to SettingsScreen

**Duration**: 2–3 days (string extraction + translation + wiring)

---

## Implementation Timeline

**Days 1–3**: i18n setup + core string translation + Settings integration

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Language switch | Instant UI re-render in selected language |
| Core UI coverage | Navigation, dashboards, chores, plant detail, settings translated |
| Device locale detection | Auto-detect on first launch |
| Language persistence | Selected language persists across app restart |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| String extraction too large | Medium | Prioritize critical flows first (nav, dashboards), defer niche strings to later phases |
| Translation accuracy | Low | Manual review for French/Spanish idioms |

---

**Status**: 🟢 Designer Approved  
**Owner**: Developer  
**Next**: Implementation (i18n setup only)

