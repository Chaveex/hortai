# MonJardin 🌱

Application mobile de jardinage intelligent avec météo locale, arrosage personnalisé et notifications.

## Prérequis

- Node.js 18+
- Expo CLI : `npm install -g expo-cli`
- Compte OpenWeatherMap (gratuit) : https://openweathermap.org/api

## Installation

```bash
cd garden-app
npm install
```

## Configuration

1. Copiez `.env.example` en `.env` :
   ```bash
   cp .env.example .env
   ```

2. Ajoutez votre clé API OpenWeatherMap dans `.env` :
   ```
   EXPO_PUBLIC_OPENWEATHER_API_KEY=votre_cle_ici
   ```
   Clé gratuite sur : https://home.openweathermap.org/api_keys

## Lancement

```bash
# Via Expo Go (scan QR code)
npx expo start

# Android
npx expo start --android

# iOS
npx expo start --ios
```

## Build production

```bash
# Installer EAS CLI
npm install -g eas-cli

# Configurer EAS
eas build:configure

# Build Android
eas build --platform android

# Build iOS
eas build --platform ios
```

## Fonctionnalités

- **Météo locale** : Température, humidité, prévisions 5 jours via OpenWeatherMap
- **Gestion des plants** : 20 types de plantes prédéfinis avec fiches complètes
- **Arrosage intelligent** : Calcul personnalisé selon météo, stade de croissance, style de jardinage
- **Alertes météo** : Risque de gelée, canicule, vent fort
- **Conseils** : Fertilisation, récolte, problèmes courants selon la saison
- **Notifications** : Rappels quotidiens d'arrosage configurables
- **Profils** : Permaculture, conventionnel, biodynamique, hydroponique
- **Engrais** : Naturel, industriel ou aucun — conseils adaptés

## Structure

```
src/
├── types/          # Types TypeScript
├── constants/      # Thème, base de données plantes
├── services/       # Météo, recommandations, notifications
├── store/          # État global (Zustand + AsyncStorage)
├── components/     # WeatherCard, PlantCard, TipCard, WateringCard
├── screens/        # Onboarding, Home, Garden, AddPlant, PlantDetail, Settings
└── navigation/     # React Navigation (tabs + stack)
```
