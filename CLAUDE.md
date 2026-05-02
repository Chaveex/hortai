# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npx expo start --clear        # Start dev server (always use --clear after package changes)
npx expo start --clear --lan  # Force LAN mode if QR scan fails
npx expo start --android      # Start for Android
npx expo start --ios          # Start for iOS
npx tsc --noEmit              # Type check
```

No test suite configured.

## Architecture

**Expo SDK 54** managed workflow, React Native 0.81, React 19. Entry point: `index.js` → `registerRootComponent(App)` (SDK 54 requires explicit registration — do not revert `package.json` `"main"` back to `App.tsx`).

### State

Single Zustand store (`src/store/useStore.ts`) with `zustand/persist` → AsyncStorage. Persists only `profile`, `plants`, `weather`. Derived state (`recommendations`, `tips`) is recomputed in `refreshRecommendations()` whenever plants/weather/profile change. All mutations call `refreshRecommendations()` at the end.

### Data flow

```
UserProfile + Plants + WeatherData
       ↓ refreshRecommendations()
WateringRecommendation[] + GardeningTip[]
```

Weather is fetched from OpenWeatherMap (current + 5-day forecast). API key in `.env` as `EXPO_PUBLIC_OPENWEATHER_API_KEY`. Watering logic in `src/services/recommendations.ts` adjusts base need by temperature, humidity, wind, gardening style, recent rain, and plant growth stage.

### Navigation

Stack inside tabs. `GardenStack` wraps `GardenScreen → AddPlantScreen → PlantDetailScreen` as a stack; `HomeScreen` and `SettingsScreen` are direct tab screens. First render: `OnboardingScreen` if `profile?.onboardingComplete` is false; `Navigation` otherwise.

### Notifications (Expo Go limitation)

`expo-notifications` is not supported in Expo Go since SDK 53. All notification calls are guarded with `Constants.executionEnvironment === 'storeClient'` check at the top of `src/services/notifications.ts`. For production builds, use EAS Build.

### Plant database

`src/constants/plants.ts` contains static data for 20 plant types (`PLANT_DATABASE`). Each entry has watering frequency, daily water need, growth timelines, style-specific tips, seasonal advice, and fertilizer schedules. Growth stage (germination → seedling → vegetative → flowering) determines a `waterMultiplier` applied to base need.

### Path alias

`@/*` maps to `./src/*` (tsconfig paths). Metro does not resolve this automatically — use relative imports in practice.
