# Garden App 🌱

Smart gardening companion app that provides personalized watering recommendations, plant care guidance, and AI-powered botanical insights.

## Features

- **Smart Watering Recommendations**: Personalized watering schedules based on plant type, weather conditions, soil moisture, and growth stage
- **AI Botanist Chat**: Talk to an AI expert about plant care, diseases, seasonal advice, and garden management (3 questions/day limit)
- **Plant Database**: 20+ plant types with detailed care information, fertilizer schedules, and growth timelines
- **Weather Integration**: Real-time weather data with 5-day forecasts affecting watering calculations
- **Garden Dashboard**: Overview of your plants, watering recommendations, and seasonal tips
- **Data Backup**: Export and restore your garden data
- **Multilingual**: Support for English, French, and Spanish
- **Offline-First**: All data stored locally with AsyncStorage

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- Physical device or emulator (Android/iOS)
- `.env` file with required API keys

### Environment Setup

Create `.env` file in root directory:

```env
EXPO_PUBLIC_OPENWEATHER_API_KEY=your_openweather_key
EXPO_PUBLIC_ANTHROPIC_API_KEY=your_anthropic_key
```

### Installation & Running

```bash
# Install dependencies
npm install

# Start development server (always use --clear after package changes)
npx expo start --clear

# Build for Android
npx expo start --android

# Build for iOS
npx expo start --ios

# Type check
npx tsc --noEmit
```

## API Keys Required

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| OpenWeatherMap | Weather data & forecasts | 1,000 calls/day |
| Anthropic Claude | AI Botanist Chat | Usage-based billing |

Get keys at:
- [OpenWeatherMap](https://openweathermap.org/api)
- [Anthropic Console](https://console.anthropic.com)

## Architecture

### State Management
- Single Zustand store (`src/store/useStore.ts`) with persistence via AsyncStorage
- Persists: profile, plants, weather
- Derived state (recommendations, tips) recomputed automatically

### Data Flow
```
User Profile + Plants + Weather
        ↓ refreshRecommendations()
Watering Recommendations + Garden Tips
```

### Key Services
- **Recommendations**: Watering logic considering temperature, humidity, wind, rain, growth stage
- **Weather**: OpenWeatherMap integration with 5-day forecast
- **AI Chat**: Anthropic Claude API with vision support for plant photos
- **Notifications**: Local push notifications (production builds only)

### Navigation Structure
- **Home Tab**: Dashboard and garden overview
- **Garden Stack**: Garden screen → Add plant → Plant details
- **Settings Tab**: Profile, backup, language preferences
- **AI Chat FAB**: Floating button for botanist consultation

## Core Data Structures

### Plant
```typescript
{
  id: string
  name: string
  type: string // from PLANT_DATABASE
  location: string
  plantedDate: Date
  wateringFrequency: number // days
  dailyWaterNeed: number // ml
  growthStage: 'germination' | 'seedling' | 'vegetative' | 'flowering'
  lastWatered: Date
}
```

### Watering Recommendation
```typescript
{
  plantId: string
  baseNeed: number // ml
  adjustedNeed: number // after weather adjustments
  priority: 'urgent' | 'high' | 'normal'
  nextWateringDate: Date
  reason: string // explanation of adjustment
}
```

## Project Commands

| Command | Purpose |
|---------|---------|
| `npm start` | Start dev server |
| `npm run android` | Run on Android device/emulator |
| `npm run ios` | Run on iOS device/simulator |
| `npm run build:android` | Production Android build via EAS |
| `npm run build:ios` | Production iOS build via EAS |
| `npx tsc --noEmit` | Type checking |

## Development Notes

- **Path Alias**: `@/*` → `./src/*` (use relative imports in practice)
- **Notifications**: Only available in production builds (not Expo Go)
- **AI Chat Rate Limit**: 3 questions per day, resets at 00:00 UTC
- **Photo Compression**: Images compressed to 600x400 JPEG @ 60% quality before sending to API

## Troubleshooting

### Dev Server Connection Issues
```bash
npx expo start --clear --lan
```

### Type Errors
```bash
npx tsc --noEmit
```

### Clear Cache
```bash
npx expo start --clear
```

## Project Structure

```
src/
├── screens/          # Screen components
├── components/       # Reusable UI components
├── services/         # Business logic (weather, AI, recommendations)
├── store/           # Zustand state management
├── constants/       # Plant database, theme, translations
├── types/           # TypeScript type definitions
├── hooks/           # Custom React hooks
├── i18n/            # Internationalization config
└── utils/           # Utility functions
```

## Available Languages

- 🇺🇸 English
- 🇫🇷 [Français](README.fr.md)
- 🇪🇸 [Español](README.es.md)

## Contributing

See CLAUDE.md for development guidelines and architecture decisions.

## License

[Specify license here]
