# MonJardin 🌱

Application mobile de jardinage intelligent avec recommandations d'arrosage personnalisées, conseils de culture et expertise botaniste IA.

## Fonctionnalités

- **Recommandations d'Arrosage Intelligentes** : Calendrier d'arrosage personnalisé selon le type de plante, météo, humidité et stade de croissance
- **Chat Botaniste IA** : Consultez un expert en IA sur l'entretien des plantes, maladies, conseils saisonniers et gestion du jardin (3 questions/jour)
- **Base de Données Complète** : 20+ types de plantes avec fiches détaillées, calendriers de fertilisation et timelines de croissance
- **Intégration Météo** : Données météo en temps réel avec prévisions 5 jours affectant les calculs d'arrosage
- **Tableau de Bord** : Vue d'ensemble de vos plantes, recommandations d'arrosage et conseils saisonniers
- **Sauvegarde de Données** : Exportez et restaurez les données de votre jardin
- **Multilingue** : Support anglais, français et espagnol
- **Mode Hors Ligne** : Toutes les données stockées localement avec AsyncStorage

## Démarrage Rapide

### Prérequis

- Node.js 18+ et npm
- Expo CLI : `npm install -g expo-cli`
- Appareil physique ou émulateur (Android/iOS)
- Fichier `.env` avec les clés API requises

### Configuration de l'Environnement

Créez un fichier `.env` à la racine du projet :

```env
EXPO_PUBLIC_OPENWEATHER_API_KEY=votre_cle_openweather
EXPO_PUBLIC_ANTHROPIC_API_KEY=votre_cle_anthropic
```

### Installation et Lancement

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement (toujours utiliser --clear après changements)
npx expo start --clear

# Lancer sur Android
npx expo start --android

# Lancer sur iOS
npx expo start --ios

# Vérifier les types
npx tsc --noEmit
```

## Clés API Requises

| Service | Utilité | Tier Gratuit |
|---------|---------|--------------|
| OpenWeatherMap | Données météo et prévisions | 1 000 appels/jour |
| Anthropic Claude | Chat Botaniste IA | Facturation à l'usage |

Obtenir les clés sur :
- [OpenWeatherMap](https://openweathermap.org/api)
- [Console Anthropic](https://console.anthropic.com)

## Architecture

### Gestion d'État
- Unique store Zustand (`src/store/useStore.ts`) avec persistance via AsyncStorage
- Données persistées : profil, plantes, météo
- État dérivé (recommandations, conseils) recalculé automatiquement

### Flux de Données
```
Profil Utilisateur + Plantes + Météo
        ↓ refreshRecommendations()
Recommandations d'Arrosage + Conseils Jardin
```

### Services Clés
- **Recommandations** : Logique d'arrosage tenant compte température, humidité, vent, pluie, stade de croissance
- **Météo** : Intégration OpenWeatherMap avec prévisions 5 jours
- **Chat IA** : API Anthropic Claude avec support vision pour photos de plantes
- **Notifications** : Notifications push locales (builds de production uniquement)

### Structure de Navigation
- **Onglet Accueil** : Tableau de bord et vue d'ensemble du jardin
- **Pile Jardin** : Écran jardin → Ajouter plante → Détails plante
- **Onglet Paramètres** : Profil, sauvegarde, préférences de langue
- **FAB Chat IA** : Bouton flottant pour consultation botaniste

## Structures de Données Principales

### Plante
```typescript
{
  id: string
  name: string
  type: string // de PLANT_DATABASE
  location: string
  plantedDate: Date
  wateringFrequency: number // en jours
  dailyWaterNeed: number // en ml
  growthStage: 'germination' | 'seedling' | 'vegetative' | 'flowering'
  lastWatered: Date
}
```

### Recommandation d'Arrosage
```typescript
{
  plantId: string
  baseNeed: number // ml
  adjustedNeed: number // après ajustements météo
  priority: 'urgent' | 'high' | 'normal'
  nextWateringDate: Date
  reason: string // explication de l'ajustement
}
```

## Commandes du Projet

| Commande | Utilité |
|----------|---------|
| `npm start` | Démarrer le serveur de développement |
| `npm run android` | Exécuter sur Android |
| `npm run ios` | Exécuter sur iOS |
| `npm run build:android` | Build de production Android via EAS |
| `npm run build:ios` | Build de production iOS via EAS |
| `npx tsc --noEmit` | Vérification des types |

## Notes de Développement

- **Alias de Chemin** : `@/*` → `./src/*` (utiliser imports relatifs en pratique)
- **Notifications** : Disponibles uniquement dans les builds de production (pas Expo Go)
- **Limite Chat IA** : 3 questions par jour, réinitialisation à 00:00 UTC
- **Compression Photo** : Images compressées à 600x400 JPEG @ 60% avant envoi à l'API

## Dépannage

### Problèmes de Connexion Serveur de Développement
```bash
npx expo start --clear --lan
```

### Erreurs de Type
```bash
npx tsc --noEmit
```

### Effacer le Cache
```bash
npx expo start --clear
```

## Structure du Projet

```
src/
├── screens/          # Composants d'écran
├── components/       # Composants UI réutilisables
├── services/         # Logique métier (météo, IA, recommandations)
├── store/           # Gestion d'état Zustand
├── constants/       # Base de données plantes, thème, traductions
├── types/           # Définitions de types TypeScript
├── hooks/           # Hooks React personnalisés
├── i18n/            # Configuration d'internationalisation
└── utils/           # Fonctions utilitaires
```

## Langues Disponibles

- 🇺🇸 [English](README.md)
- 🇫🇷 Français
- 🇪🇸 [Español](README.es.md)

## Contribuer

Voir CLAUDE.md pour les directives de développement et les décisions architecturales.

## Licence

[À spécifier]
