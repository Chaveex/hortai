# Phase 5 — Multilingual + Specialist Gardening Agent (HOR-05)

**Date**: 2026-05-20  
**Target**: Support FR/EN/ES UI + AI gardening specialist agent  
**Effort**: 5–7 days  
**Dependencies**: Phase 4 ✅

---

## Overview

Add full i18n (internationalization) support for French/English/Spanish UI. Integrate multilingual gardening specialist agent (Claude via Anthropic API) that works alongside developer & designer for guidance on plant care, pest management, seasonal advice.

---

## Feature 1: Internationalization (i18n) System

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

## Feature 2: Multilingual Gardening Specialist Agent

### Agent Role

**Name**: 🌱 Botaniste (Botanist)  
**Capabilities**:
- Plant identification + care guides
- Pest/disease diagnosis + treatment
- Seasonal advice (FR/EN/ES)
- Watering/fertilizer recommendations
- Crop rotation guidance
- Garden bed planning

### Integration with App

**Access**: Accessible from:
1. **PlantDetailScreen**: "💡 Conseil pour cette plante" button → opens BotanistModal
2. **ChoreDetailScreen**: "❓ Besoin d'aide?" button → opens BotanistModal (pre-context: this chore)
3. **DashboardScreen**: "🌱 Conseil du jardin" card → opens BotanistModal (garden-wide questions)
4. **Settings**: Toggle "Conseil du botaniste" (on/off)

### Technical Implementation

**BotanistModal** (`src/screens/BotanistModal.tsx`):
- Chat-style interface (similar to existing AIFABButton modal, but specialized)
- Messages array: system prompt (specialized gardening context) + user messages
- Input: Text + optional photo (plant identification)
- Responses: Claude Haiku via Anthropic API (not using Messages API directly, but `fetch`)
- Rate limit: Separate from AI Chat (daily limit for botanist queries)

**System Prompt** (multilingual):
```
FR: "Tu es un botaniste expert en jardinage durable. Fournis des conseils pratiques et spécifiques à {region}, {style}, {plants}. Réponds en français."

EN: "You are an expert botanist in sustainable gardening. Provide practical, specific advice for {region}, {style}, {plants}. Respond in English."

ES: "Eres un botánico experto en jardinería sostenible. Proporciona consejos prácticos y específicos para {región}, {estilo}, {plantas}. Responde en español."
```

**Context Injection**:
- User's gardening style (permaculture/conventional/biodynamic/hydroponic)
- Fertilizer preference (naturel/industriel/aucun)
- Region (city + weather data)
- Current plants in garden
- Recent chores/entries

**Rate Limit**: 5 botanist questions/day (reset at 00:00 UTC), separate from AI Chat limit.

### Files to Create/Modify

**Create**:
- `src/screens/BotanistModal.tsx` (main chat interface)
- `src/services/botanist.ts` (API calls + prompt engineering)
- `src/hooks/useBotanist.ts` (state management for botanist chat)

**Modify**:
- `src/types/index.ts` (add BotanistMessage type)
- `src/store/useStore.ts` (add botanistMessages, botanistRateLimit)
- `src/screens/PlantDetailScreen.tsx` (add "Conseil pour cette plante" button)
- `src/screens/ChoreDetailScreen.tsx` (add "Besoin d'aide?" button)
- `src/screens/DashboardScreen.tsx` (add "Conseil du jardin" card)
- `src/screens/SettingsScreen.tsx` (toggle botanist suggestions)
- `src/navigation/index.tsx` (register BotanistModal route)

**Duration**: 2–3 days (modal UI + API integration + context injection)

---

## Feature 3: Developer ↔ Botanist Collaboration

### Design Pattern

**Workflow** (Designer + Developer work together):
1. Designer reviews proposed Botanist features (buttons, placement, tone)
2. Developer implements modal + API integration
3. Botanist (Claude) validates system prompt + responses
4. Both sign-off before ship

### Example: Plant Detail Advice Flow

```
User opens PlantDetailScreen (Tomate)
  → Taps "💡 Conseil pour cette plante"
  → BotanistModal opens with plant context pre-filled
  → System prompt mentions: tomato, current region, gardening style
  → User asks: "Pourquoi les feuilles jaunissent?"
  → Botanist responds: "Carence azote probable. Ajouter engrais naturel + arroser plus régulièrement"
  → Response in selected language (FR/EN/ES)
  → Message saved to store for persistence
```

### Collaboration Checkpoints

- **Day 1–2**: Designer reviews i18n UX (Settings language toggle, string replacements)
- **Day 3–4**: Designer reviews BotanistModal UI (chat layout, buttons, tone)
- **Day 4–5**: Developer + Designer test Botanist responses (system prompt quality)
- **Day 6–7**: Polish + accessibility audit for new screens

---

## Implementation Timeline

**Day 1–2**: I18n system (i18next setup, translation files, SettingsScreen toggle)  
**Day 3–4**: BotanistModal UI + basic API integration  
**Day 5**: System prompt tuning + rate limit  
**Day 6–7**: Integration tests + polish (buttons on PlantDetail, ChoreDetail, Dashboard)

---

## Success Metrics

| Metric | Target |
|--------|--------|
| App language switch | Instant UI re-render in selected language |
| Botanist availability | Accessible from 3+ screens (PlantDetail, ChoreDetail, Dashboard) |
| Rate limit enforcement | 5 questions/day, resets properly |
| System prompt quality | Responses are accurate, actionable, relevant to user context |
| User engagement | >40% users try botanist feature in first week |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| i18n string extraction too large | High | Prioritize critical flows first (nav, dashboards), defer niche strings to Phase 6 |
| Botanist API costs (Haiku calls) | Medium | Rate limit to 5/day; monitor token usage; warn user if approaching limit |
| Translation quality (ES especially) | Medium | Use native Spanish speaker for QA; test responses in all 3 languages |
| Multilingual system prompt drift | Low | Template system prompt in EN, translate to FR/ES; version-control prompts |

---

## Approval Conditions (Designer-approved)

- [ ] String scope locked: "Core flows only" (nav, dashboard, chores, plant detail, settings; defer niche strings to Phase 6)
- [ ] Spanish QA: Assign native Spanish speaker for ES translation review by Day 5
- [ ] Botanist history: Use **separate** store key (`botanistMessages` distinct from `aiChatMessages`)
- [ ] Smoke tests: i18n language switch (SettingsScreen) + Botanist rate limit reset (00:00 UTC)

---

**Status**: 🟢 Designer Approved  
**Owner**: Developer + Designer  
**Next**: Implementation kickoff (Day 1: i18n setup)

