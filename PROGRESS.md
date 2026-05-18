# Avancement — App Jardinage

## Statut global
**Date:** 2026-05-18 (maj)  
**État:** MVP avancé en production (Expo SDK 54). 6 tabs + deep features (IA Chat, Calendrier entretien, Stats, Export/Backup). Architecture Zustand + AsyncStorage stable. Détection climat API Köppen-Geiger + fallback. Prêt validation utilisateur.

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

## En cours
(Aucun)

## Backlog priorisé

### P1 — Expérience utilisateur core
1. **Cartographie du jardin** — Placer plantes sur grille/plan, visualiser densité, conflits croissance.

### P2 — Données & Analytics
2. **Tableaux de bord avancés** — Graphiques détaillés, prédictions rendement, comparatifs saisonniers.

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

**Dernière mise à jour:** 2026-05-18, branche `master`. IA Chat + Calendrier + Stats + Backup shipped, Köppen-Geiger API intégré, contexte profil auto pour IA.
