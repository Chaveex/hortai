# Dashboard Wireframes - ASCII & Layout Details

---

## WIREFRAME KEY

```
┌─────────────┐  Rectangle / Container
│             │
└─────────────┘

[  Button  ]    Pressable / Tap target

[Label]         Text / Heading

[██████░░░░]    Progress bar / Gauge

📊 Icon         Emoji / Visual marker

─────────────   Divider

↑↓→ Trend       Direction indicator

━━━━━━━━━━━    Section separator
```

---

## 1. DASHBOARD HOME (Overview)

### Mobile Portrait (375px width)

```
┌─────────────────────────────────────┐
│ 📊 Dashboards        [Period: Mois] │
├─────────────────────────────────────┤
│                                     │
│ ╔═════════════════════════════════╗ │
│ ║ 🌾 Production                   ║ │
│ ║ 42.5 kg/mois          [↑ 18%]   ║ │
│ ║ vs. mois dernier                ║ │
│ ╚═════════════════════════════════╝ │
│                                     │
│ ╔═════════════════════════════════╗ │
│ ║ 💧 Consommation eau              ║ │
│ ║ 186 L/mois            [→ +2%]    ║ │
│ ║ vs. région (192 L)               ║ │
│ ╚═════════════════════════════════╝ │
│                                     │
│ ╔═════════════════════════════════╗ │
│ ║ ❤️ Santé du jardin               ║ │
│ ║ [████████░░]  76/100  [→ Stable] ║ │
│ ║ 6 plantes, 48 jours moyen age    ║ │
│ ╚═════════════════════════════════╝ │
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│ Production mensuelle (6 derniers m) │
│                                     │
│       12 kg ┤      ╱╲               │
│       10 kg ┤     ╱  ╲     ╱        │
│        8 kg ┤    ╱    ╲   ╱         │
│        6 kg ┤   ╱      ╲ ╱          │
│        4 kg ┤  ╱        ╲           │
│        2 kg ┤ ╱          ╲ ╱        │
│        0 kg ├─────────────────────  │
│             Jan  Fév  Mar  Avr  Mai │
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│ Top 3 plantes                       │
│ ┌─────────────────────────────────┐ │
│ │ 🍅 Tomate #1                    │ │
│ │ 15.2 kg | 104% vs région        │ │
│ │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │ │
│ ├─────────────────────────────────┤ │
│ │ 🥒 Courgette #2                 │ │
│ │ 9.8 kg | 105% vs région         │ │
│ │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │ │
│ ├─────────────────────────────────┤ │
│ │ 🫑 Poivron #1                   │ │
│ │ 3.2 kg | 80% vs région          │ │
│ │ ░░░░░░░░░░░░░░                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│           [   Voir tous   ]         │
│                                     │
└─────────────────────────────────────┘
```

### Layout Breakdown

**Top Bar (sticky):**
- Title + Period Selector (4 tab buttons: Week/Month/Season/Year)
- Height: 56px

**Cards Section:**
- 3 × `StatCard` (Production, Water, Health)
- Full width, auto-height
- Gap: 16px between cards

**Chart Section:**
- Title: "Production mensuelle (6 derniers mois)"
- `BarChart` component, height: 200px
- Full-width scrollable

**Rankings Section:**
- Title: "Top plantes"
- ScrollView containing 3 comparison rows
- Each row: Icon + Name + Amount + Bar + Percentage
- Tap → navigate to `PlantDashboard`

**See All Button:**
- Bottom of section, centered
- Opens `ProductionDashboard`

---

## 2. PRODUCTION DASHBOARD

### Screen Layout

```
┌─────────────────────────────────────┐
│ ← 🌾 Production              [⚙️]   │
├─────────────────────────────────────┤
│                                     │
│ [FilterBar]                         │
│ [📅 Jan—Juin] [🌿 All Types ▼]    │
│ [⟲ Reset]                           │
│                                     │
│ Quick Stats (Cards)                 │
│  ╔─────────────────┐ ╔──────────╗  │
│  ║ Total: 42.5 kg  ║ ║ Trend: ↑ ║  │
│  ║ 6 récoltes      ║ ║ 18%      ║  │
│  ╚─────────────────╝ ╚──────────╝  │
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│ Production quotidienne (courbe)     │
│                                     │
│   5 kg ┤     ╱╲                     │
│   3 kg ┤    ╱  ╲     ╱              │
│   1 kg ┤   ╱    ╲   ╱               │
│   0 kg ├──────────────────────────  │
│        Jan 1   Jan 5   Jan 10   Jan │
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│ Distribution par type (pie)         │
│        ╭─────────────╮              │
│       ╱   Tomate 35% ╲              │
│      │ Courgette 24% │              │
│       ╲  Poivron 18% ╱              │
│        ╰─────────────╯              │
│        Autres: 23%                   │
│                                     │
│ Legend: 🟩 Tomate 🟨 Courgette etc  │
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│ Production par semaine              │
│                                     │
│ Semaine 1 │ Tom  Cor  Poi          │
│ [████░░░] │ 3kg  2kg  1kg = 6kg    │
│           │                         │
│ Semaine 2 │ Tom  Cor  Poi          │
│ [█████░░] │ 4kg  1.5kg 0.5kg = 6kg│
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│ Détails des récoltes                │
│ [Sortable table]                    │
│                                     │
│ Date       │ Plante    │ Quantité  │
│ ───────────┼───────────┼───────────┤
│ 2025-05-20 │ Tomate #1 │ 2.5 kg    │
│ 2025-05-18 │ Courgette │ 1.8 kg    │
│ 2025-05-15 │ Tomate #1 │ 1.2 kg    │
│ 2025-05-14 │ Poivron   │ 0.9 kg    │
│ 2025-05-10 │ Tomate #2 │ 3.4 kg    │
│ ... (FlatList, virtualized)         │
│                                     │
└─────────────────────────────────────┘
```

### Sections

1. **Header** (48px): Back button + Title + Settings icon
2. **Filter Bar** (56px): Date range, type selector, reset
3. **Summary Cards** (80px): Total production + Trend card
4. **Line Chart** (240px): Daily production trend (with forecast overlay)
5. **Pie Chart** (240px): Distribution by plant type + legend
6. **Stacked Bar Chart** (180px): Weekly breakdown by type
7. **Detail Table** (flex, virtualized): Sortable harvest log

---

## 3. WATER DASHBOARD

### Screen Layout

```
┌─────────────────────────────────────┐
│ ← 💧 Consommation d'eau        [⚙️] │
├─────────────────────────────────────┤
│                                     │
│ [FilterBar: Last 30d | All Plants]  │
│                                     │
│ Summary Cards:                      │
│  ╔────────────────╗ ╔────────────╗ │
│  ║ 186 L total    ║ ║ 6.2 L/jour ║ │
│  ║ +8% vs région  ║ ║ Trend: ↑ 12%║ │
│  ╚────────────────╝ ╚────────────╝ │
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│ Efficacité vs région:               │
│                                     │
│  92% de la moyenne                  │
│  [████████░░░░] You're using        │
│                92% of regional avg  │
│                                     │
│  Status: ✓ Bon (consommation ok)    │
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│ Consommation journalière (courbe)   │
│                                     │
│  10L ┤      ╭╮                      │
│   8L ┤    ╭╯ ╰╮     ╱               │
│   6L ┤   ╱    ╰╮   ╱                │
│   4L ┤  ╱      ╰─╱                  │
│   2L ┤ ╱                            │
│   0L ├────────────────────────────  │
│      May 1  May 5  May 10  May 15   │
│                                     │
│ Correlation avec météo:             │
│ Température ↑ → Consommation ↑      │
│ (r = 0.87 | Strong correlation)    │
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│ Consommation par plante:            │
│                                     │
│ 🍅 Tomate                           │
│ [████████░░░░░░░░░░] 80 L (43%)     │
│                                     │
│ 🥒 Courgette                        │
│ [██████░░░░░░░░░░░░] 60 L (32%)     │
│                                     │
│ 🫑 Poivron                          │
│ [████░░░░░░░░░░░░░░░░] 46 L (25%)   │
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│ Recommandations                     │
│ • 💡 Installer goutte-à-goutte      │
│   pour tomates (économiser 20%)     │
│                                     │
│ • ⏰ Arroser tôt le matin           │
│   réduire évaporation de 15%        │
│                                     │
│ • 🌧️  Pluie prévue dans 3 jours    │
│   réduire d'environ 30%             │
│                                     │
└─────────────────────────────────────┘
```

### Sections

1. **Header & Filter Bar**
2. **Summary Cards** (Total L + Trend)
3. **Gauge Card** (% of regional average with status)
4. **Line Chart** (Daily water usage, correlated with temp/humidity)
5. **Stacked Bar Chart** (Water consumption by plant type)
6. **Recommendations** (Dynamic list from weather + plant data)

---

## 4. HEALTH SCORE DASHBOARD

### Screen Layout

```
┌─────────────────────────────────────┐
│ ← ❤️  Santé du jardin           [⚙️] │
├─────────────────────────────────────┤
│                                     │
│ Current Score                       │
│ ┌─────────────────────────────────┐ │
│ │   [████████░░] 76/100           │ │
│ │   ↑ Stable | Last 30d: +2 pts   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│ Facteurs de santé (Radar 5D):       │
│                                     │
│      ╭─────────────╮                │
│     ╱   Hydration  ╲                │
│    ╱ 68%        80% Engrais╲        │
│   │                        │        │
│   │ Production 75%    60%  │        │
│   │ Nutriments Diversité   │        │
│    ╲                      ╱         │
│     ╲      Santé 82%    ╱           │
│      ╰─────────────────╯            │
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│ Scores détaillés                    │
│                                     │
│ Hydration                   68%     │
│ [██████░░░░░░░░] ✓ Bon             │
│                                     │
│ Production                  75%     │
│ [███████░░░░░░░] ✓ Très bon        │
│                                     │
│ Nutriments                  60%     │
│ [██████░░░░░░░░░░] ⚠️ À améliorer  │
│                                     │
│ Santé générale              82%     │
│ [████████░░░░░░] ✓ Excellent       │
│                                     │
│ Diversité des plantes       70%     │
│ [███████░░░░░░░░] ✓ Bon            │
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│ Santé par plante (7 jours)          │
│                                     │
│          L  M  M  J  V  S  D        │
│ 🍅 Tomate  🟩🟨🟥🟩🟩🟩🟩            │
│ 🥒 Courgette🟩🟩🟩🟩🟨🟩🟩           │
│ 🫑 Poivron 🟨🟨🟩🟩🟩🟩🟩            │
│                                     │
│ Legend: 🟩 Excellent 🟨 Bon 🟥 Alert│
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│ Alertes                             │
│                                     │
│ ⚠️  Poivron #1: 2 jours sans eau    │
│     Action: Arroser aujourd'hui     │
│                                     │
│ ℹ️  Courgette #2: Récolte prête    │
│     Meilleure qualité si cueillie   │
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│ Évolution (30 jours)                │
│                                     │
│  85 ┤                 ╱              │
│  80 ┤               ╱               │
│  75 ┤      ╭──────╯ (↑ Your score) │
│  70 ┤    ╱                          │
│  65 ┤───╯                           │
│  60 ├─────────────────────────────  │
│     May 1    May 10   May 20   May  │
│                                     │
│ Events marked with ★ on curve:      │
│  ★ May 10: Pest alert resolved      │
│  ★ May 15: Harvests increased       │
│                                     │
└─────────────────────────────────────┘
```

### Sections

1. **Header & Current Score** (Large gauge, trend indicator)
2. **Radar Chart** (5-dimensional health view)
3. **Factor Scores** (5 bars with status badges)
4. **Heatmap** (Plant health by day, color-coded)
5. **Alerts & Warnings** (Actionable items)
6. **30-Day History** (Line chart with event markers)

---

## 5. PLANT DASHBOARD (Per-Plant Deep Dive)

### Screen Layout

```
┌─────────────────────────────────────┐
│ ← 🍅 Tomate #1 (Cherry)      [Edit] │
├─────────────────────────────────────┤
│                                     │
│ [Plant image or icon]               │
│ Semée: 2 mai | Âge: 16 jours       │
│ Localisation: Lit #2, Rang 3        │
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│ Status rapide                       │
│  ╔─────────────╗ ╔──────────────╗  │
│  ║ 🌾 Récolte  ║ ║ ❤️  Santé    ║  │
│  ║ 5.2 kg      ║ ║ 82/100       ║  │
│  ╚─────────────╝ ╚──────────────╝  │
│                                     │
│ Arrosage: Derniers: 1 jour         │
│ Prochain: 1 jour (recommandé)      │
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│ Comparaison                         │
│                                     │
│ Récolte: 5.2 kg vs Région: 5 kg     │
│ [═════════════⬤ ░░░░░] 104%         │
│ Status: ✓ Très bon (dépassement)    │
│                                     │
│ Santé: 82/100 vs Historique: 78     │
│ Tendance: ↑ Good trend              │
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│ Courbe de croissance                │
│ (Age → Score santé)                 │
│                                     │
│  90 ┤           ╱                    │
│  80 ┤         ╱                      │
│  70 ┤       ╱                        │
│  60 ┤      ╱                         │
│  50 ┤────╱                           │
│  40 ├─────────────────────────────  │
│     0j  5j 10j 15j Projected: 85    │
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│ Historique d'arrosage (14 jours)    │
│                                     │
│ L ┤ 2│ -│ 2│ -│ 2│ -│ 2│ -│        │
│   ├──┼──┼──┼──┼──┼──┼──┼──┼────── │
│     L  M  M  J  V  S  D  L         │
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│ Événements de récolte               │
│                                     │
│ 20 mai - Récolte 2.5 kg            │
│ Tomates cerises mûres, excellente   │
│ qualité. Prochaine récolte: 3j.    │
│                                     │
│ 18 mai - Récolte 1.8 kg            │
│ Tomates cerises rouges.             │
│                                     │
│ 15 mai - Récolte 0.9 kg            │
│ Premières tomates, petites.         │
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│ Journal de notes                    │
│                                     │
│ 20 mai - Fleurs se forment          │
│ Croissance active, branche du haut  │
│ commence à ramifier.                │
│                                     │
│ 18 mai - Légère jaunisse            │
│ Sur la feuille inférieure gauche.   │
│ Possible défaut d'azote?            │
│                                     │
│ 15 mai - Taillage des gourmands     │
│ Supprimé les branches latérales     │
│ pour favoriser la tige principale.  │
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│ Plantes compagnes                   │
│                                     │
│ ✓ Basilic (planté ensemble)        │
│ ✓ Persil (à proximité)              │
│ ⚠️  Brassiques (à distance)          │
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│ Recommandations de l'IA             │
│                                     │
│ 🌡️  Augmenter l'arrosage (chaleur   │
│    prévue les 3 prochains jours)    │
│                                     │
│ ✂️  Tailler dans 5 jours            │
│    Laisser la branche se développer │
│                                     │
│ 🍅 Récolter immédiatement           │
│    Lorsque complètement rouge       │
│                                     │
└─────────────────────────────────────┘
```

### Sections

1. **Header** (Plant name + variety + age)
2. **Status Cards** (Harvest kg + Health score)
3. **Comparison** (vs regional avg + historical health)
4. **Growth Curve** (Age vs health, with projection)
5. **Watering History** (Bar chart, last 14 days)
6. **Harvest Events** (Timeline, scrollable)
7. **Notes Journal** (FlatList, expandable entries)
8. **Companion Plants** (Simple list with status)
9. **AI Recommendations** (3-5 actionable tips)

---

## 6. COMPARISON DASHBOARD

### Screen Layout

```
┌─────────────────────────────────────┐
│ ← 🔍 Comparaisons               [Filter]│
├─────────────────────────────────────┤
│                                     │
│ [Comparison Type Selector]          │
│ ○ Récolte vs région                 │
│ ○ Santé                             │
│ ○ Efficacité eau                    │
│ ○ Comparaison périodes (mois)       │
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│ Récolte: Réel vs Région             │
│                                     │
│  Tomate     [██████████] 5.2 kg     │
│             ─────────────            │
│             Région:      5.0 kg      │
│             Status: ✓ 104% (Excellent)│
│                                     │
│  Courgette  [███████████] 9.8 kg    │
│             ─────────────            │
│             Région:      8.0 kg      │
│             Status: ✓ 105% (Excellent)│
│                                     │
│  Poivron    [████░░░░░░░] 3.2 kg    │
│             ─────────────            │
│             Région:      4.0 kg      │
│             Status: ⚠️  80% (À améliorer)│
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│ Efficacité plante-par-plante        │
│ [Sortable table]                    │
│                                     │
│ Plant    │ Récolte│ Jours │ kg/jour│ vs avg │
│ ─────────┼────────┼────────┼────────┼────────│
│ Tomate#1 │ 5.2 kg │ 16 j  │ 0.33  │ +104% │
│ Courgette│ 9.8 kg │ 12 j  │ 0.82  │ +105% │
│ Poivron#1│ 3.2 kg │ 20 j  │ 0.16  │ -80%  │
│ Tomate#2 │ 4.1 kg │ 14 j  │ 0.29  │ +92%  │
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│ Efficacité eau (kg par litre)       │
│                                     │
│  Tomate        [████████░░░░░░░░░░] │
│                0.028 kg/L ✓ Bon     │
│                                     │
│  Courgette     [██████████████░░░░░]│
│                0.048 kg/L ✓ Excellent│
│                                     │
│  Poivron       [███░░░░░░░░░░░░░░░░]│
│                0.018 kg/L ⚠️ À optimiser│
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│ Comparaison périodes (Mai vs Avril) │
│                                     │
│  Mai (actuel):                      │
│  Production: 42.5 kg [↑ 11%]        │
│  Eau:        186 L   [↑ 4%]         │
│  Santé:      76/100  [↑ 4%]         │
│                                     │
│  Avril (dernier mois):              │
│  Production: 38.2 kg                │
│  Eau:        178 L                  │
│  Santé:      73/100                 │
│                                     │
│ Tendance: ↑ Amélioration générale   │
│                                     │
└─────────────────────────────────────┘
```

### Sections

1. **Filter/Type Selector** (Radio buttons for comparison type)
2. **Comparison Cards** (Multiple `ComparisonCard` instances)
3. **Sortable Table** (Plant-by-plant efficiency metrics)
4. **Stacked Comparison Charts** (Period-over-period)

---

## LAYOUT PATTERN SUMMARY

### All Dashboard Screens Follow This Pattern:

```
┌─────────────────────────────────────┐
│ Header (48px)                       │
│ [Back | Title | Settings/Actions]   │
├─────────────────────────────────────┤
│ Filter/Controls (56px, optional)    │
│ [DateRange | Type | Period]         │
├─────────────────────────────────────┤
│ ScrollView Content                  │
│                                     │
│ [Summary Cards - Quick Stats]       │
│ ─────────────────────────────────── │
│ [Chart 1 - Primary insight]         │
│ ─────────────────────────────────── │
│ [Chart 2 - Secondary insight]       │
│ ─────────────────────────────────── │
│ [Table/List - Detail view]          │
│ (Virtualized FlatList)              │
│                                     │
└─────────────────────────────────────┘
```

### Mobile-First Constraints:

- **Screen width:** 375px (iPhone 11 min)
- **Safe area insets:** Top 44px, Bottom 34px (with tab bar: 94px)
- **Chart heights:** 180–240px (avoid overwhelming on small screen)
- **Card padding:** 16px (md spacing)
- **Font sizes:** Min 12pt for body text (WCAG AA)
- **Touch targets:** Min 44×44pt
- **Scrollable sections:** Never more than 3 items without virtualization

### Dark Mode Adjustments:

```typescript
// Colors remain the same (high contrast already)
// Background: #0F1419 (instead of #F0F4E8)
// Surface: #1B2433 (instead of #FFFFFF)
// Text: #E8F0E5 (instead of #1B4332)
// Borders & elements scale on contrast
```

---

## Navigation Stack Example

```typescript
// DashboardStack in navigation/index.tsx

<Stack.Navigator screenOptions={{ headerShown: false }}>
  <Stack.Screen 
    name="DashboardHome" 
    component={DashboardHomeScreen} 
  />
  
  {/* Detail screens (push, no back button needed) */}
  <Stack.Screen 
    name="ProductionDashboard" 
    component={ProductionDashboardScreen} 
  />
  <Stack.Screen 
    name="WaterDashboard" 
    component={WaterDashboardScreen} 
  />
  <Stack.Screen 
    name="HealthScoreDashboard" 
    component={HealthScoreDashboardScreen} 
  />
  
  {/* Plant detail (from Garden tab or Dashboard) */}
  <Stack.Screen 
    name="PlantDashboard" 
    component={PlantDashboardScreen} 
  />
  
  {/* Comparison */}
  <Stack.Screen 
    name="ComparisonDashboard" 
    component={ComparisonDashboardScreen} 
  />
</Stack.Navigator>
```

---

## Touch & Interaction Hotspots

```
Dashboard Home:
  [StatCard] → Tap → Navigate to detail dashboard
  [BarChart] → Swipe left/right → Change time period
  [Top plant row] → Tap → Navigate to PlantDashboard
  [Period tab] → Tap → Change period (in-place update)

Production Dashboard:
  [Plant name in table] → Tap → PlantDashboard
  [FilterBar date] → Tap → Date picker (BottomSheet)
  [Sort header] → Tap → Sort by column

Plant Dashboard:
  [Edit button] → Tap → Edit plant modal
  [Harvest entry] → Tap → Expand/collapse details
  [AI recommendation] → Tap → Show details (tooltip)
  [Companion plant] → Tap → Detail modal (optional)
```

