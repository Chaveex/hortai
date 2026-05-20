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

## En cours
🔄 **P2 — Tableaux de Bord Avancés** (Home dashboard MVP implémenté: PeriodSelector, StatCard tappable, 3 KPIs, BarChart 6m, ComparisonCard plantes. Service dashboardAggregation complet. Reste: 5 détail screens, tests, optimisation)

## Backlog priorisé

### P1 ✅ DONE
1. **Cartographie du jardin (Multi-Bacs)** — Lits nommés/localisés, grille par bac, placement plantes, conflits voisinage.

### P2 — Données & Analytics (EN SPECS)
2. **Tableaux de bord avancés** — 15 métriques botaniques, 6 screens (Home/Production/Water/Health/Plant/Comparison), charts SVG, prédictions rendement, comparatifs saisonniers. Agents (Botaniste/Dev/UX/QA) livrés spécifications. Impl timeline: 8 semaines.

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

## Implémentation P2 — Home Dashboard MVP (2026-05-20)

✅ **Services**
- `dashboardAggregation.ts`: 4 fonctions agrégation (ProductionData, WaterData, HealthData, ComparisonData)
- Calculs < 100ms, gestion plages dates (week/month/season/year)

✅ **Composants Dashboard**
- `PeriodSelector.tsx`: sélection période (semaine/mois/saison/année) avec état persisté
- `StatCard.tsx`: carte KPI tappable, trend badge (↑↓→), icônes personnalisables
- `PlantComparisonCard.tsx`: comparison plante vs régional avec barre de progression

✅ **Écran Home Dashboard**
- Refactorisé `DashboardScreen.tsx` avec:
  - PeriodSelector top (déclencheur recalcul KPIs)
  - 3 StatCards (Production, Eau, Santé) navigable vers détail
  - BarChart 6 derniers mois production
  - AlertBanner depuis health.alerts
  - RefreshControl pour sync météo
  - PlantComparisonCard top 3 plants

⏭️ **Prochaines étapes P2**
1. **Detail Dashboards**: ProductionDash, WaterDash, HealthDash, PlantDetailDash, ComparisonDash
2. **Charts avancées**: PieChart enhancement, StackedBarChart, HeatmapChart, RadarChart
3. **Store integration**: Zustand dashboardFilter state, memoized selectors
4. **Zustand store updates**: dashboardFilter persist, cache invalide on plant/entry change
5. **Tests**: unit tests aggregation functions, component tests (React Native Testing Library)
6. **Performance**: FlatList virtualization, cache AsyncStorage, selector memoization
7. **Dark mode**: color adapt, contrast ratios (WCAG AA)
8. **Polish**: animations (Reanimated), empty states, tooltips (ⓘ), localisation (DD/MM/YYYY)

**Dernière mise à jour:** 2026-05-20, branche `master`. P1 SHIPPED. P2 Home Dashboard MVP DONE. Prêt implémentation detail screens.
