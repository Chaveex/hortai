# Avancement — App Jardinage

## Statut global
**Date:** 2026-05-18 (maj)  
**État:** MVP avancé en production (Expo SDK 54). 6 tabs + deep features. P1 (Cartographie multi-bac) SHIPPED 2026-05-18. P2 (Tableaux de bord avancés) EN SPECS (agents Botaniste/UX/Dev/QA livrés). Architecture Zustand + AsyncStorage stable. Détection climat API Köppen-Geiger + fallback. Prêt pour P2 implémentation.

## Fonctionnalités terminées
✅ Onboarding (localisation, style jardinage, type engrais)  
✅ Écran Accueil (météo OpenWeather, recommandations arrosage, conseils journaliers)  
✅ Écran Jardin (liste plantes avec quick-actions, détails, ajout)  
✅ Calendrier Semis (base de données 20 plantes, fenêtres semis par climat)  
✅ Réglages (profil, notifications)  
✅ Recommandations arrosage (algorithme: température, humidité, vent, pluie, stade croissance, style gardening)  
✅ Historique arrosage (wateringHistory derniers 30 dates)  
✅ Notifications (quotidiennes + mensuelles semis)  
✅ Journal des plantes (notes + récoltes avec quantité/unité)  
✅ Persistance (AsyncStorage profile/plants/entries/weather)  
✅ **IA Chat Gardinage** (FAB float button, modal, Claude Haiku, 3q/jour, 2j historique, photo optionnelle, retry logic, timeout 30s, contexte profil intégré)  
✅ **Calendrier d'Entretien** (jour/semaine/mois, tâches auto/custom, arrosage/engrais/taille/récolte, filtres, widget HomeScreen)  
✅ **Détection Saison/Climat** (auto-détection par ville+latitude, climat type, 5 zones, tips contextualisés, StatsScreen)  
✅ **Export/Backup JSON** (local + Supabase optionnel, compression, import merge/overwrite, métadonnées persistées)
✅ **P1 — Cartographie Multi-Bacs** (lits nommés + localisés, grille indépendante par bac, placement plantes, compatibilité voisinage, persistence Zustand)

## Terminé
✅ **P2 — Tableaux de Bord Avancés** (6 screens, navigation filaire, services agrégation, composants, accessibility fixes)

## Backlog priorisé

### P1 ✅ DONE
1. **Cartographie du jardin (Multi-Bacs)** — Lits nommés/localisés, grille par bac, placement plantes, conflits voisinage.

### P2 ✅ DONE
2. **Tableaux de bord avancés** — 6 screens (Home/Production/Eau/Santé/Plante/Comparaison), charts SVG, agrégations KPI, navigation, services, composants, accessibility fixes. UX issues mineurs backlog P2.1.

### P3 — Communauté & Découverte
6. **Partage entre utilisateurs** — Échanger plans de jardin, stratégies semis, photos avant/après.
7. **Wiki collaboratif** — Forums/commentaires par plante, recettes (tomate → sauce, pesto, etc).

### P4 — Intelligence & Automation
8. **Routines d'entretien** — Séquences multi-étapes (semis → repiquage → plantation) rappels temporels.
9. **Intégration IoT** — Support capteurs humidité sol (Bluetooth), fermeture arrosage automatique. (LATER)

## Décisions techniques
- **State Zustand + persist:** Choix immuable. AsyncStorage suffisant pour MVP. Future: considérer SQLite si >500 plantes par user.
- **Météo OpenWeather:** API gratuit stable. Limite requêtes: se fier au cache (refresh max 30min).
- **Pas de test suite:** MVP. Jest + React Native Testing Library à intro si backend APIs ajoutées.
- **Notifications SDK 53+:** Bloquée en Expo Go (déguardée). EAS Build contourne. Acceptable.
- **Path alias @/*:** Metro ne compile pas auto tsconfig. Relatifs utilisés en practice, alias documenté pour future.
- **20 plantes hardcodées:** Fonctionne. Futur: charger depuis API si >50 plantes ou user-created.

## Points de vigilance
- **Arrosage historique 30 derniers:** Risque mémoire si >100 plantes/user (rare). Rotation possible.
- **Notifs quotidiennes:** EAS Build required pour prod. Expo Go limitations acceptées pour dev.
- **Localisation météo:** Si user change ville = re-sync forecast. Actuellement pas de cache inter-sessions (perte refresh > 30min).
- **Stade croissance:** Basé sur diff jours plantage linéaire. Pas de modèle DDD ou courbes sigmoïdes. Suffisant MVP.
- **Fertilizer Schedule:** Text brut. Futur: calendar entries ou notifications mensiles si demandé.
- **Détection climat:** API Köppen-Geiger gratuit (timeout 5s). Si API fail → fallback local (latitude + keywords villes côtières). Tested Vernon = oceanic ✅. Liste keywords enrichie (rouen, vernon, normandie cities).
- **Rate limit IA Chat:** UTC 00:00 reset, pas spoofable même si user change device time (tant que UTC ne change pas).
- **Calendrier entretien:** Auto-génération idempotente (clé type|date|plantId). Persistance Zustand séparée de main store. Performance optimized (memoized selectors view mois).

## Prochaines étapes (P3+)
1. **P1.1 Cartographie du jardin** — Placer plantes sur grille, visualiser densité, conflits.
2. **P2.2 Tableaux de bord avancés** — Graphiques détaillés, prédictions, comparatifs.
3. **P3.1 Partage utilisateurs** — Sync multi-device, partage plans.
4. **P3.2 Wiki collaboratif** — Forums par plante, recettes.
5. **P4.1 Routines multi-step** — Semis → repiquage → plantation avec rappels.
6. **P4.2 IoT** — Capteurs humidité + fermeture auto (later).

## Prochain point de reprise
**Si reprendre sans contexte:**
1. Lire CLAUDE.md pour conventions & tech stack.
2. Lire ce fichier PROGRESS.md (à jour apès chaque cycle).
3. `npx expo start --clear` pour run dev.
4. Pour ajouter feature: lancer orchestrateur + agents (voir mission CLAUDE.md).
5. Pas de test auto — valider manuellement sur device/Expo Go.
6. **Climat détecté par API Köppen-Geiger** — fallback local si API timeout.
7. **IA Chat intègre profil automatiquement** — ville, style, saison contextualisés.

## Implémentation P2 — Tableaux de Bord Avancés DONE (2026-05-20)

✅ **Services**
- `dashboardAggregation.ts`: 4 fonctions agrégation (ProductionData, WaterData, HealthData, ComparisonData)
- Calculs < 100ms, gestion plages dates (week/month/season/year)

✅ **Composants Dashboard**
- `PeriodSelector.tsx`: sélection période (semaine/mois/saison/année) avec état persisté
- `StatCard.tsx`: carte KPI tappable, trend badge (↑↓→), icônes personnalisables
- `PlantComparisonCard.tsx`: comparison plante vs régional avec barre de progression

✅ **6 Écrans Dashboard implémentés**
- `DashboardScreen.tsx` — Home (entry point, PeriodSelector, 3 StatCards KPI, BarChart 6m, top plants, bouton comparaison)
- `ProductionDashboard.tsx` — Récolte (LineChart 12m, BarChart, PieChart type, LeaderboardRow)
- `WaterDashboard.tsx` — Eau (HealthScoreGauge %, LineChart usage, StackedBar type, recommandations, weather note)
- `HealthScoreDashboard.tsx` — Santé (Gauge score, 5-factor grid, LineChart trend 6m, problematic plants, recommendations)
- `PlantDetailDashboard.tsx` — Détail plante (plant selector, metrics grid 6 items, growth timeline, watering history, recent harvests)
- `ComparisonDashboard.tsx` — Comparaison (2 period selectors, trend summary, ComparisonCard 3 metrics, dual bars, insights)

✅ **Navigation filaire**
- Créé `DashboardStack` (replaces old GardenStack routes)
- Onglet "Tableaux de Bord" (📊) remplace StatsScreen
- StatCard tap → detail dashboards (Production/Eau/Santé)
- PlantDetailScreen: bouton "📊 Stats" → PlantDetailDashboard
- DashboardScreen: bouton "📊 Tableau de comparaison détaillé" → ComparisonDashboard

✅ **Accessibility fixes**
- StatCard label contrast: rgba(255,255,255,0.7) → #FFFFFF (WCAG AA 4.5:1)
- Progress bars: 4-6px → 10-12px (touch target ≥ 44x44pt area)

⏭️ **P2.1 Backlog (UX mineurs)**
1. **Virtualization**: FlatList pour ProductionDash, WaterDash, HealthDash (perf listes longues)
2. **StatCard hint**: Ajouter chevron → ou "Appuyez" hint (UX discovery)
3. **Hiérarchie visuelle**: Augmenter gap/elevation KPI section DashboardScreen
4. **Empty states**: Ajouter écran onboarding si 0 plants
5. **LineChart Y-axis**: Omit decimals si value > 10 (50.0% → 50%)
6. **PlantDetailDashboard scroll dots**: Visual hint horizontal scroll si 2+ plants
7. **HEALTH_SCORE_THRESHOLDS**: Centraliser en theme.ts (hardcoded actuel)

**Dernière mise à jour:** 2026-05-20, branche `master`. P1 SHIPPED. P2 DONE (6 dashboards, navigation, services, accessibility). Commits: b434241, 535a9ae, f5bbf58. Prêt production. Backlog P2.1: virtualization, UX hints, empty states.
