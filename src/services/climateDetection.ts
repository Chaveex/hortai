import axios from 'axios';
import { ClimateType, Season } from '../types';

// Coastal / oceanic indicator city name fragments (lowercase)
const COASTAL_KEYWORDS = [
  'sur-mer', '-mer', 'port', 'brest', 'nantes', 'bordeaux', 'la rochelle',
  'lorient', 'saint-nazaire', 'vannes', 'quimper', 'rennes', 'caen',
  'cherbourg', 'rouen', 'vernon', 'le havre', 'dunkerque', 'calais', 'boulogne',
  'dieppe', 'fecamp', 'honfleur', 'deauville', 'trouville', 'etretat',
  'london', 'dublin', 'glasgow', 'cardiff', 'amsterdam', 'hamburg',
  'lisbon', 'porto', 'bilbao', 'santander', 'bergen', 'oslo', 'stockholm',
  'seattle', 'portland', 'vancouver', 'san francisco',
];

// Mediterranean indicator city name fragments
const MEDITERRANEAN_KEYWORDS = [
  'marseille', 'montpellier', 'nice', 'toulon', 'nimes', 'perpignan',
  'barcelona', 'valencia', 'malaga', 'sevilla', 'madrid', 'rome',
  'naples', 'palermo', 'athens', 'istanbul', 'tunis', 'alger', 'casablanca',
  'beirut', 'tel aviv', 'cairo', 'tripoli', 'palma',
  'los angeles', 'san diego', 'cape town', 'perth', 'adelaide',
  'santiago', 'lima',
];

// Mountain / high altitude indicator city fragments
const MOUNTAIN_KEYWORDS = [
  'grenoble', 'chambery', 'annecy', 'gap', 'briancon', 'albertville',
  'chamonix', 'megeve', 'innsbruck', 'salzburg', 'bern', 'lausanne',
  'interlaken', 'zermatt', 'davos', 'bolzano', 'trento',
  'denver', 'flagstaff', 'quito', 'bogota', 'la paz', 'cusco',
  'kathmandu', 'lhasa', 'kabul', 'bishkek',
];

// Map Köppen-Geiger codes to gardening climate types
const KOPPEN_TO_CLIMATE: Record<string, ClimateType> = {
  // Tropical
  'Af': 'tropical', 'Am': 'tropical', 'As': 'tropical', 'Aw': 'tropical',
  // Mediterranean (Cs, Csa, Csb)
  'Cs': 'mediterranean', 'Csa': 'mediterranean', 'Csb': 'oceanic',
  // Oceanic (Cf, Cfb)
  'Cf': 'oceanic', 'Cfb': 'oceanic', 'Cfc': 'mountain',
  // Continental (Df, Dw, Dfc, Dfb, etc.)
  'Df': 'continental', 'Dw': 'continental', 'Dfc': 'mountain',
  'Dfb': 'continental', 'Dwb': 'continental', 'Dwd': 'continental',
  // Polar (E)
  'E': 'mountain',
  // Arid fallbacks
  'B': 'mediterranean',
};

// Try to fetch Köppen-Geiger climate from free API
export async function detectClimateTypeFromAPI(latitude: number, longitude: number): Promise<ClimateType | null> {
  try {
    // Free Köppen-Geiger API
    const response = await axios.get(
      `https://api.koeppen-geiger.vu-wien.ac.at/present?lon=${longitude}&lat=${latitude}`,
      { timeout: 5000 }
    );
    const code = response.data?.koppen_geiger?.[0];
    if (code) {
      // Return mapped climate or fallback to first 2 chars
      return KOPPEN_TO_CLIMATE[code] || KOPPEN_TO_CLIMATE[code.substring(0, 1)] || null;
    }
  } catch (e) {
    // Silently fail, fallback to detectClimateType
  }
  return null;
}

export function detectClimateType(latitude: number, city: string): ClimateType {
  const lat = Math.abs(latitude);
  const cityLower = city.toLowerCase();

  // Tropical: within ~20° of equator
  if (lat < 20) {
    return 'tropical';
  }

  // Check mountain keywords first (can be at any mid-lat)
  if (MOUNTAIN_KEYWORDS.some(kw => cityLower.includes(kw))) {
    return 'mountain';
  }

  // High latitudes (>= 55°) → mountain/subarctic climate
  if (lat >= 55) {
    return 'mountain';
  }

  // Mediterranean band: 20–40°
  if (lat >= 20 && lat <= 40) {
    if (COASTAL_KEYWORDS.some(kw => cityLower.includes(kw))) {
      return 'oceanic';
    }
    return 'mediterranean';
  }

  // 40–55° band: oceanic vs continental
  if (lat > 40 && lat < 55) {
    if (MEDITERRANEAN_KEYWORDS.some(kw => cityLower.includes(kw))) {
      return 'mediterranean';
    }
    if (COASTAL_KEYWORDS.some(kw => cityLower.includes(kw))) {
      return 'oceanic';
    }
    // Default mid-lat continental
    return 'continental';
  }

  // Fallback
  return 'continental';
}

export function detectSeason(latitude: number, month: number): Season {
  // Southern hemisphere: offset by 6 months
  const adjustedMonth = latitude < 0 ? ((month + 5) % 12) + 1 : month;

  if (adjustedMonth >= 3 && adjustedMonth <= 5) return 'spring';
  if (adjustedMonth >= 6 && adjustedMonth <= 8) return 'summer';
  if (adjustedMonth >= 9 && adjustedMonth <= 11) return 'autumn';
  return 'winter';
}

export function getClimateTips(climate: ClimateType, season: Season): string[] {
  const tips: Record<ClimateType, Record<Season, string[]>> = {
    mediterranean: {
      spring: [
        'Profitez des pluies printanières pour limiter l\'arrosage.',
        'Plantez les cultures estivales après les dernières gelées (mi-avril).',
        'Installez un paillage léger pour conserver l\'humidité.',
      ],
      summer: [
        'Arrosez tôt le matin ou le soir pour limiter l\'évaporation.',
        'Ombragez les cultures sensibles à la chaleur après 30°C.',
        'Récoltez fréquemment pour stimuler la production.',
        'Méfiez-vous de la sécheresse estivale : arrosage goutte-à-goutte conseillé.',
      ],
      autumn: [
        'Plantez les légumes d\'hiver (choux, poireaux, épinards).',
        'Les pluies d\'automne réduisent les besoins en arrosage.',
        'Semez les légumineuses pour l\'hiver.',
      ],
      winter: [
        'Climat doux : poursuivez la culture de légumes-feuilles.',
        'Protégez uniquement les plantes tropicales lors des gelées rares.',
        'Planifiez les rotations et commandez les semences.',
      ],
    },
    oceanic: {
      spring: [
        'Les gelées tardives sont possibles jusqu\'en avril : protégez les plants fragiles.',
        'L\'humidité élevée favorise les maladies fongiques : aérez bien les cultures.',
        'Semez dès mars sous abri pour avoir de l\'avance.',
      ],
      summer: [
        'Étés doux : idéal pour les légumes-feuilles et les crucifères.',
        'L\'arrosage reste modéré grâce aux pluies régulières.',
        'Surveillez l\'oïdium et le mildiou par temps humide.',
      ],
      autumn: [
        'Saison prolongée grâce aux hivers doux.',
        'Protégez vos cultures avec un voile non-tissé dès octobre.',
        'Récoltez avant les premières gelées.',
      ],
      winter: [
        'Hivers doux permettent de cultiver choux, mâche et épinards.',
        'Paillez généreusement pour protéger les racines.',
        'Commandez vos semences pour la saison suivante.',
      ],
    },
    continental: {
      spring: [
        'Gelées possibles jusqu\'en mai : utilisez des cloches de protection.',
        'Réchauffez le sol sous plastique noir avant de planter.',
        'Semez sous abri en mars-avril pour anticiper la saison courte.',
      ],
      summer: [
        'Profitez de l\'été chaud pour les cultures gourmandes en soleil.',
        'Arrosez en profondeur plutôt que fréquemment.',
        'Les orages fréquents peuvent abîmer les cultures : tuteurez bien.',
      ],
      autumn: [
        'Les gelées précoces (octobre) raccourcissent la saison : récoltez tôt.',
        'Paillez abondamment pour prolonger la saison d\'un mois.',
        'Plantez ail et oignons en octobre pour une récolte estivale.',
      ],
      winter: [
        'Gelées sévères : protégez toutes les cultures fragiles.',
        'Planifiez rotations et commandez semences.',
        'Amendez le sol avec du compost avant les gelées.',
      ],
    },
    mountain: {
      spring: [
        'Saison courte : choisissez des variétés précoces.',
        'Risques de gel jusqu\'en juin en altitude : cultures sous abri.',
        'Le sol se réchauffe lentement : paillez en noir pour accélérer.',
      ],
      summer: [
        'Profitez de la courte saison chaude pour les cultures rapides.',
        'L\'amplitude thermique jour/nuit améliore les saveurs.',
        'UV élevés en altitude : attention aux coups de soleil sur les feuilles.',
      ],
      autumn: [
        'Les gelées arrivent tôt (août–septembre) : récoltez vite.',
        'Rentrez les cultures sensibles en septembre.',
        'Stockez les récoltes en cave pour l\'hiver.',
      ],
      winter: [
        'Saison de repos total. Planifiez et commandez.',
        'Préparez le compost en intérieur.',
        'Consultez les catalogues de variétés adaptées à l\'altitude.',
      ],
    },
    tropical: {
      spring: [
        'Débutez les semis de légumes tropicaux : aubergines, piments, patates douces.',
        'Profitez de la saison des pluies pour réduire l\'arrosage.',
        'Surveillez les nuisibles qui prolifèrent par temps chaud et humide.',
      ],
      summer: [
        'Saison principale de culture. Croissance rapide.',
        'Arrosez abondamment si saison sèche.',
        'Protégez contre les fortes pluies tropicales (drainage).',
      ],
      autumn: [
        'Continuez les cultures tropicales.',
        'Semez les légumes qui préfèrent des températures plus fraîches.',
        'Récoltez les fruits mûrs avant la saison des pluies si nécessaire.',
      ],
      winter: [
        'Saison plus fraîche idéale pour tomates, courgettes et haricots.',
        'Réduisez l\'arrosage si saison sèche.',
        'Plantez les légumes-feuilles qui apprécient la douceur.',
      ],
    },
  };

  return tips[climate]?.[season] ?? [];
}
