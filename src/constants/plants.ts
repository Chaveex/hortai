import { PlantType } from '../types';

export interface PlantInfo {
  frenchName: string;
  icon: string;
  dailyWaterNeed: number;
  wateringFrequencyDays: number;
  germinationDays: number;
  harvestDays: number;
  sunExposure: 'full' | 'partial' | 'shade';
  tips: {
    permaculture: string;
    conventionnel: string;
    naturel: string;
    industriel: string;
  };
  commonIssues: string[];
  seasonalAdvice: {
    spring: string;
    summer: string;
    autumn: string;
    winter: string;
  };
  fertilizerSchedule: {
    naturel: string;
    industriel: string;
  };
}

export const PLANT_DATABASE: Record<PlantType, PlantInfo> = {
  tomato: {
    frenchName: 'Tomate',
    icon: '🍅',
    dailyWaterNeed: 4,
    wateringFrequencyDays: 2,
    germinationDays: 7,
    harvestDays: 75,
    sunExposure: 'full',
    tips: {
      permaculture: 'Paillez abondamment au pied pour conserver l\'humidité et fertiliser naturellement.',
      conventionnel: 'Arrosez régulièrement au pied, jamais sur les feuilles pour éviter les maladies.',
      naturel: 'Utilisez du compost mature et du purin d\'ortie pour renforcer les plants.',
      industriel: 'Apportez un engrais NPK riche en potassium lors de la floraison.',
    },
    commonIssues: ['Mildiou', 'Botrytis', 'Carence en calcium'],
    seasonalAdvice: {
      spring: 'Plantez après les saints de glace (11-13 mai). Protégez des gelées tardives.',
      summer: 'Surveillez l\'arrosage en période de canicule. Pincez les gourmands.',
      autumn: 'Récoltez avant les premières gelées. Faites des conserves.',
      winter: 'Planifiez les rotations. Commandez les semences.',
    },
    fertilizerSchedule: {
      naturel: 'Compost au printemps, purin d\'ortie toutes les 2 semaines en végétation',
      industriel: 'Engrais croissance en début de saison, engrais floraison dès les premières fleurs',
    },
  },
  pepper: {
    frenchName: 'Poivron',
    icon: '🫑',
    dailyWaterNeed: 3,
    wateringFrequencyDays: 2,
    germinationDays: 10,
    harvestDays: 90,
    sunExposure: 'full',
    tips: {
      permaculture: 'Associez avec le basilic qui repousse les pucerons.',
      conventionnel: 'Nécessite chaleur et soleil. Arrosez régulièrement sans excès.',
      naturel: 'Le purin de consoude favorise la floraison et la fructification.',
      industriel: 'Engrais spécial poivron riche en potassium et phosphore.',
    },
    commonIssues: ['Pourriture des fruits', 'Pucerons'],
    seasonalAdvice: {
      spring: 'Démarrez en intérieur en février. Transplantez mi-mai après les gelées.',
      summer: 'Arrosez plus fréquemment par forte chaleur.',
      autumn: 'Récoltez avant les gelées.',
      winter: 'Conservation en cave fraîche ou congélation.',
    },
    fertilizerSchedule: {
      naturel: 'Purin de consoude toutes les 3 semaines',
      industriel: 'Engrais NPK 15-15-15 mensuel',
    },
  },
  zucchini: {
    frenchName: 'Courgette',
    icon: '🥒',
    dailyWaterNeed: 5,
    wateringFrequencyDays: 2,
    germinationDays: 5,
    harvestDays: 50,
    sunExposure: 'full',
    tips: {
      permaculture: 'Excellent pour couvrir le sol et étouffer les adventices. Intégrez dans une butte.',
      conventionnel: 'Arrosez copieusement et régulièrement pour éviter l\'amertume.',
      naturel: 'Compost abondant au pied. Purin d\'ortie en cas de jaunissement.',
      industriel: 'Engrais azoté en début de végétation.',
    },
    commonIssues: ['Oïdium', 'Pourriture des fleurs'],
    seasonalAdvice: {
      spring: 'Semez en pot en avril, transplantez mi-mai.',
      summer: 'Récoltez jeune (15-20 cm) pour une production continue.',
      autumn: 'Les gelées mettront fin à la production.',
      winter: 'Préparez un bac à compost pour la saison suivante.',
    },
    fertilizerSchedule: {
      naturel: 'Compost copieux à la plantation, purin d\'ortie mensuel',
      industriel: 'Engrais granulé à libération lente en début de saison',
    },
  },
  cucumber: {
    frenchName: 'Concombre',
    icon: '🥒',
    dailyWaterNeed: 4,
    wateringFrequencyDays: 1,
    germinationDays: 5,
    harvestDays: 55,
    sunExposure: 'full',
    tips: {
      permaculture: 'Guidez sur un treillis en osier ou bambou pour économiser l\'espace.',
      conventionnel: 'Arrosez quotidiennement. Guidez sur un treillis.',
      naturel: 'Purin d\'ortie toutes les 2 semaines pour la vigueur.',
      industriel: 'Engrais équilibré puis riche en potassium à la floraison.',
    },
    commonIssues: ['Oïdium', 'Araignée rouge par temps sec'],
    seasonalAdvice: {
      spring: 'Semez sous abri en avril.',
      summer: 'Taillez les parties aériennes après 6-8 feuilles. Récoltez souvent.',
      autumn: 'Dernières récoltes avant les gelées.',
      winter: 'Désinfectez la serre si utilisée.',
    },
    fertilizerSchedule: {
      naturel: 'Purin d\'ortie toutes les 2 semaines',
      industriel: 'Engrais liquide tomates/concombres hebdomadaire',
    },
  },
  lettuce: {
    frenchName: 'Laitue',
    icon: '🥬',
    dailyWaterNeed: 3,
    wateringFrequencyDays: 1,
    germinationDays: 5,
    harvestDays: 60,
    sunExposure: 'partial',
    tips: {
      permaculture: 'Parfaite sous les tomates pour profiter de l\'ombre en été.',
      conventionnel: 'Arrosez en matinée pour éviter les maladies foliaires.',
      naturel: 'Le thé de compost favorise une croissance rapide.',
      industriel: 'Engrais azoté pour une belle pomme bien fournie.',
    },
    commonIssues: ['Limaces', 'Montée en graine par chaleur'],
    seasonalAdvice: {
      spring: 'Semez dès mars sous abri, puis en pleine terre à partir d\'avril.',
      summer: 'Choisissez des variétés résistantes à la chaleur. Arrosez tôt le matin.',
      autumn: 'Bonne saison pour les laitues. Protégez avec un voile en fin de saison.',
      winter: 'Cultures sous tunnel ou en serre.',
    },
    fertilizerSchedule: {
      naturel: 'Compost léger à la plantation, c\'est suffisant',
      industriel: 'Engrais azoté (20-0-0) dilué à la plantation',
    },
  },
  carrot: {
    frenchName: 'Carotte',
    icon: '🥕',
    dailyWaterNeed: 2,
    wateringFrequencyDays: 3,
    germinationDays: 14,
    harvestDays: 90,
    sunExposure: 'full',
    tips: {
      permaculture: 'Semez avec de l\'oignon pour repousser la mouche de la carotte.',
      conventionnel: 'Sol ameubli en profondeur, sans cailloux. Évitez les engrais frais.',
      naturel: 'La carotte n\'a pas besoin d\'engrais. Sol léger suffisant.',
      industriel: 'Évitez les engrais azotés. Favorisez potassium et phosphore.',
    },
    commonIssues: ['Mouche de la carotte', 'Alternariose'],
    seasonalAdvice: {
      spring: 'Semez à partir de mars directement en place. Mélangez les graines avec du sable.',
      summer: 'Arrosez en profondeur mais rarement.',
      autumn: 'Récoltez avant les gelées importantes ou paillez pour conserver en terre.',
      winter: 'Stockez en sable dans un endroit frais.',
    },
    fertilizerSchedule: {
      naturel: 'Aucun engrais, sol préparé avec compost mûr l\'automne précédent',
      industriel: 'Engrais potassique uniquement si sol très pauvre',
    },
  },
  radish: {
    frenchName: 'Radis',
    icon: '🌱',
    dailyWaterNeed: 1.5,
    wateringFrequencyDays: 2,
    germinationDays: 4,
    harvestDays: 25,
    sunExposure: 'full',
    tips: {
      permaculture: 'Semez en bordure ou entre les cultures pour marquer les rangs.',
      conventionnel: 'Croissance rapide. Récoltez jeune pour éviter le creux et l\'amertume.',
      naturel: 'Presque autosuffisant. Une légère couche de compost suffit.',
      industriel: 'Engrais minimal, trop d\'azote donne des feuilles sans racines.',
    },
    commonIssues: ['Altises', 'Limaçons'],
    seasonalAdvice: {
      spring: 'Première culture dès mars. Idéal en intercalaire.',
      summer: 'Évitez les périodes de grande chaleur (montée en graine rapide).',
      autumn: 'Excellente culture d\'automne. Bonne saveur par temps frais.',
      winter: 'Radis d\'hiver (type Daïkon) résistent au froid.',
    },
    fertilizerSchedule: {
      naturel: 'Aucun engrais nécessaire',
      industriel: 'Aucun engrais recommandé',
    },
  },
  beans: {
    frenchName: 'Haricots',
    icon: '🫘',
    dailyWaterNeed: 2.5,
    wateringFrequencyDays: 2,
    germinationDays: 8,
    harvestDays: 60,
    sunExposure: 'full',
    tips: {
      permaculture: 'Fixateur d\'azote. Associez avec maïs et courgette (les 3 sœurs).',
      conventionnel: 'N\'arrosez pas trop. Les haricots n\'aiment pas les pieds dans l\'eau.',
      naturel: 'Inoculant rhizobium pour maximiser la fixation d\'azote atmosphérique.',
      industriel: 'Peu d\'engrais nécessaire grâce à la fixation naturelle d\'azote.',
    },
    commonIssues: ['Anthracnose', 'Pucerons noirs'],
    seasonalAdvice: {
      spring: 'Semez après les gelées (fin mai). Le sol doit être chaud.',
      summer: 'Récoltez jeunes et souvent pour prolonger la production.',
      autumn: 'Laissez mûrir quelques gousses pour les semences.',
      winter: 'Stockez les graines sèches pour l\'année suivante.',
    },
    fertilizerSchedule: {
      naturel: 'Inoculant rhizobium à la plantation, aucun engrais supplémentaire',
      industriel: 'Engrais starter faible en azote uniquement',
    },
  },
  peas: {
    frenchName: 'Petits pois',
    icon: '🫛',
    dailyWaterNeed: 2,
    wateringFrequencyDays: 3,
    germinationDays: 10,
    harvestDays: 65,
    sunExposure: 'full',
    tips: {
      permaculture: 'Légumineuse fixatrice d\'azote. Culture d\'hiver/printemps idéale.',
      conventionnel: 'Supportent bien le froid. Arrosez modérément.',
      naturel: 'Purin d\'ortie si les feuilles jaunissent.',
      industriel: 'Peu d\'engrais azotés car fixation naturelle.',
    },
    commonIssues: ['Oïdium', 'Bruche des pois'],
    seasonalAdvice: {
      spring: 'Semis possible dès mars-avril directement en place.',
      summer: 'La chaleur met fin à la production. Récoltez avant.',
      autumn: 'Semis d\'automne pour récolte au printemps.',
      winter: 'Les plants résistent au gel léger.',
    },
    fertilizerSchedule: {
      naturel: 'Compost léger, inoculant rhizobium recommandé',
      industriel: 'Engrais phosphaté uniquement',
    },
  },
  basil: {
    frenchName: 'Basilic',
    icon: '🌿',
    dailyWaterNeed: 2,
    wateringFrequencyDays: 1,
    germinationDays: 7,
    harvestDays: 45,
    sunExposure: 'full',
    tips: {
      permaculture: 'Excellent compagnon de la tomate. Repousse les nuisibles.',
      conventionnel: 'Pincez les fleurs pour prolonger la production de feuilles.',
      naturel: 'Infusion d\'ail contre les pucerons. Pas d\'engrais fort.',
      industriel: 'Engrais foliaire léger si jaunissement des feuilles.',
    },
    commonIssues: ['Botrytis', 'Pucerons', 'Sensible au froid'],
    seasonalAdvice: {
      spring: 'Semez en intérieur à partir d\'avril. Repiquez après les gelées.',
      summer: 'Belle production. Pincez régulièrement les fleurs.',
      autumn: 'Rentrez les plants en intérieur avant les gelées.',
      winter: 'Culture en intérieur possible sur rebord de fenêtre ensoleillé.',
    },
    fertilizerSchedule: {
      naturel: 'Thé de compost mensuel',
      industriel: 'Engrais foliaire dilué toutes les 3 semaines',
    },
  },
  parsley: {
    frenchName: 'Persil',
    icon: '🌿',
    dailyWaterNeed: 1.5,
    wateringFrequencyDays: 2,
    germinationDays: 21,
    harvestDays: 75,
    sunExposure: 'partial',
    tips: {
      permaculture: 'Excellent en bordure de jardin. Attire les insectes auxiliaires.',
      conventionnel: 'Germination lente. Trempez les graines 24h avant semis.',
      naturel: 'Peu exigeant. Un peu de compost suffit amplement.',
      industriel: 'Engrais azoté léger pour une belle couleur verte.',
    },
    commonIssues: ['Mouche du céleri', 'Verse par temps humide'],
    seasonalAdvice: {
      spring: 'Semis dès mars. Trempez les graines 24h avant pour accélérer la germination.',
      summer: 'Coupez régulièrement pour stimuler la repousse.',
      autumn: 'Résiste aux gelées légères. Continuez la récolte.',
      winter: 'Protégez sous un voile non-tissé.',
    },
    fertilizerSchedule: {
      naturel: 'Compost à la plantation, rien d\'autre',
      industriel: 'Engrais universel dilué une fois par mois',
    },
  },
  mint: {
    frenchName: 'Menthe',
    icon: '🌿',
    dailyWaterNeed: 2,
    wateringFrequencyDays: 1,
    germinationDays: 14,
    harvestDays: 60,
    sunExposure: 'partial',
    tips: {
      permaculture: 'Plantez en pot enterré car très envahissante. Repousse les nuisibles.',
      conventionnel: 'Contenir dans un pot ou bordure. Arrosez régulièrement.',
      naturel: 'Très rustique. Presque aucun besoin en engrais.',
      industriel: 'Engrais minimal, trop d\'azote donne une saveur moins intense.',
    },
    commonIssues: ['Rouille de la menthe'],
    seasonalAdvice: {
      spring: 'Division des touffes pour multiplier. Période idéale.',
      summer: 'Arrosez pour éviter le dessèchement.',
      autumn: 'Rabattez à 10 cm. La plante repoussera au printemps.',
      winter: 'Dormance. Protégez en pot en zone froide.',
    },
    fertilizerSchedule: {
      naturel: 'Aucun engrais nécessaire',
      industriel: 'Aucun engrais recommandé',
    },
  },
  strawberry: {
    frenchName: 'Fraise',
    icon: '🍓',
    dailyWaterNeed: 3,
    wateringFrequencyDays: 2,
    germinationDays: 30,
    harvestDays: 90,
    sunExposure: 'full',
    tips: {
      permaculture: 'Paillez avec de la paille pour protéger les fruits et conserver l\'humidité.',
      conventionnel: 'Arrosez au goutte-à-goutte pour éviter les maladies.',
      naturel: 'Compost de feuilles. Purin de consoude pendant la floraison.',
      industriel: 'Engrais fraisier spécial riche en potassium.',
    },
    commonIssues: ['Botrytis', 'Oïdium', 'Pucerons', 'Limaces'],
    seasonalAdvice: {
      spring: 'Plantation des nouveaux plants. Supprimez les fleurs la première année.',
      summer: 'Récoltez régulièrement. Supprimez les stolons sauf pour la multiplication.',
      autumn: 'Nettoyez les vieilles feuilles. Paillez pour l\'hiver.',
      winter: 'Protégez en cas de grand froid.',
    },
    fertilizerSchedule: {
      naturel: 'Compost à la plantation, purin de consoude mensuel en floraison',
      industriel: 'Engrais fraisier granulé au printemps et en automne',
    },
  },
  potato: {
    frenchName: 'Pomme de terre',
    icon: '🥔',
    dailyWaterNeed: 3,
    wateringFrequencyDays: 3,
    germinationDays: 21,
    harvestDays: 90,
    sunExposure: 'full',
    tips: {
      permaculture: 'Culture possible sous paillis épais sans bêchage (culture sur paille).',
      conventionnel: 'Buttez régulièrement pour augmenter la production.',
      naturel: 'Décoction de prêle contre le mildiou en prévention.',
      industriel: 'Engrais spécifique pomme de terre riche en potassium.',
    },
    commonIssues: ['Mildiou', 'Doryphore', 'Gale commune'],
    seasonalAdvice: {
      spring: 'Plantez les plants germés en mars-avril selon le climat.',
      summer: 'Arrosez copieusement. Buttez une dernière fois. Surveillez le mildiou.',
      autumn: 'Récoltez par temps sec. Stockez en cave sombre et fraîche.',
      winter: 'Préparez vos plants en les mettant à germer en janvier.',
    },
    fertilizerSchedule: {
      naturel: 'Compost mûr au moment du buttage',
      industriel: 'Engrais pommes de terre NPK 10-10-20 à la plantation',
    },
  },
  onion: {
    frenchName: 'Oignon',
    icon: '🧅',
    dailyWaterNeed: 2,
    wateringFrequencyDays: 4,
    germinationDays: 14,
    harvestDays: 100,
    sunExposure: 'full',
    tips: {
      permaculture: 'Excellent compagnon des carottes. Repousse la mouche de la carotte.',
      conventionnel: 'Réduisez l\'arrosage en fin de culture pour favoriser le séchage.',
      naturel: 'Peu exigeant. Rotation sur 3-4 ans obligatoire.',
      industriel: 'Engrais riche en potassium pour de beaux bulbes.',
    },
    commonIssues: ['Mildiou de l\'oignon', 'Mouche de l\'oignon', 'Botrytis'],
    seasonalAdvice: {
      spring: 'Plantation des bulbilles dès mars quand le sol se réchauffe.',
      summer: 'Laissez les fanes se coucher, c\'est le signe de maturité.',
      autumn: 'Récoltez et faites sécher à l\'abri.',
      winter: 'Conservation en tresse dans un endroit sec et aéré.',
    },
    fertilizerSchedule: {
      naturel: 'Compost léger à la plantation',
      industriel: 'Engrais potassique en cours de végétation',
    },
  },
  garlic: {
    frenchName: 'Ail',
    icon: '🧄',
    dailyWaterNeed: 1.5,
    wateringFrequencyDays: 5,
    germinationDays: 14,
    harvestDays: 210,
    sunExposure: 'full',
    tips: {
      permaculture: 'Excellent répulsif naturel. Plantez en bordure de jardin.',
      conventionnel: 'Plantez les gousses pointe vers le haut. Peu d\'arrosage nécessaire.',
      naturel: 'Sol bien drainé. Peu d\'intrants nécessaires.',
      industriel: 'Évitez les engrais azotés qui favorisent les maladies.',
    },
    commonIssues: ['Rouille de l\'ail', 'Pourriture blanche'],
    seasonalAdvice: {
      spring: 'L\'ail planté en automne est en pleine végétation. Arrêtez d\'arroser.',
      summer: 'Récoltez quand les fanes jaunissent et se couchent.',
      autumn: 'Plantation idéale en octobre-novembre pour une récolte en juillet.',
      winter: 'L\'ail résiste bien au froid. Peu d\'entretien.',
    },
    fertilizerSchedule: {
      naturel: 'Aucun engrais nécessaire',
      industriel: 'Engrais minimal potassique en mars',
    },
  },
  leek: {
    frenchName: 'Poireau',
    icon: '🌱',
    dailyWaterNeed: 2.5,
    wateringFrequencyDays: 3,
    germinationDays: 14,
    harvestDays: 120,
    sunExposure: 'full',
    tips: {
      permaculture: 'Associez avec les carottes pour éloigner leurs nuisibles respectifs.',
      conventionnel: 'Repiquage à 15-20 cm de profondeur pour un beau blanc.',
      naturel: 'Compost à la plantation. Arrosage régulier.',
      industriel: 'Engrais azoté pour favoriser le développement du fût.',
    },
    commonIssues: ['Teigne du poireau', 'Rouille'],
    seasonalAdvice: {
      spring: 'Semis en mars-avril. Repiquage en juin.',
      summer: 'Arrosage régulier par chaleur.',
      autumn: 'Début des récoltes. Le froid améliore la saveur.',
      winter: 'Résiste aux gelées. Récoltez au besoin jusqu\'au printemps.',
    },
    fertilizerSchedule: {
      naturel: 'Compost au repiquage, purin d\'ortie mensuel',
      industriel: 'Engrais azoté au repiquage et en mi-croissance',
    },
  },
  spinach: {
    frenchName: 'Épinard',
    icon: '🥬',
    dailyWaterNeed: 2.5,
    wateringFrequencyDays: 2,
    germinationDays: 10,
    harvestDays: 45,
    sunExposure: 'partial',
    tips: {
      permaculture: 'Culture de courte saison idéale pour remplir les espaces libres.',
      conventionnel: 'Culture de printemps et d\'automne. Évite la chaleur.',
      naturel: 'Thé de compost pour une belle couleur verte intense.',
      industriel: 'Engrais azoté pour des feuilles bien développées.',
    },
    commonIssues: ['Montée en graine', 'Mildiou'],
    seasonalAdvice: {
      spring: 'Semis dès mars. Récolte rapide avant les chaleurs.',
      summer: 'Évitez, monte vite en graine par chaleur.',
      autumn: 'Excellente culture d\'automne jusqu\'aux gelées.',
      winter: 'Protection sous voile pour prolonger la récolte.',
    },
    fertilizerSchedule: {
      naturel: 'Compost léger à la plantation',
      industriel: 'Engrais azoté liquide à la plantation',
    },
  },
  chard: {
    frenchName: 'Blette / Bette',
    icon: '🥬',
    dailyWaterNeed: 3,
    wateringFrequencyDays: 2,
    germinationDays: 10,
    harvestDays: 60,
    sunExposure: 'full',
    tips: {
      permaculture: 'Très productive. Laissez quelques pieds monter en graine pour l\'autosemis.',
      conventionnel: 'Arrosez régulièrement. Récoltez feuille par feuille.',
      naturel: 'Compost abondant. Très résistante aux maladies.',
      industriel: 'Engrais azoté pour de belles grandes feuilles.',
    },
    commonIssues: ['Cercosporiose', 'Pucerons'],
    seasonalAdvice: {
      spring: 'Semis en place dès avril.',
      summer: 'Production abondante. Récoltez régulièrement.',
      autumn: 'Résiste bien aux premières gelées.',
      winter: 'Protection sous voile non-tissé pour prolonger la récolte.',
    },
    fertilizerSchedule: {
      naturel: 'Compost à la plantation, purin d\'ortie mensuel',
      industriel: 'Engrais universel mensuel',
    },
  },
  beet: {
    frenchName: 'Betterave',
    icon: '🫚',
    dailyWaterNeed: 2.5,
    wateringFrequencyDays: 3,
    germinationDays: 10,
    harvestDays: 75,
    sunExposure: 'full',
    tips: {
      permaculture: 'Les fanes sont comestibles. Laissez quelques pieds monter en graine pour l\'autosemis.',
      conventionnel: 'Éclaircissez à 10 cm pour obtenir de beaux tubercules bien ronds.',
      naturel: 'Compost mûr à la plantation. Peu exigeante.',
      industriel: 'Évitez les engrais azotés qui favorisent les fanes au détriment du tubercule.',
    },
    commonIssues: ['Cercosporiose', 'Pucerons noirs de la fève'],
    seasonalAdvice: {
      spring: 'Semis direct dès avril. Sol ameubli en profondeur.',
      summer: 'Arrosez régulièrement pour éviter que les tubercules ne se fendent.',
      autumn: 'Récoltez avant les gelées importantes. Conservez en sable.',
      winter: 'Stockez en cave fraîche dans du sable humide.',
    },
    fertilizerSchedule: {
      naturel: 'Compost à la plantation, c\'est suffisant',
      industriel: 'Engrais potassique léger en cours de végétation',
    },
  },
  broccoli: {
    frenchName: 'Brocoli',
    icon: '🥦',
    dailyWaterNeed: 3,
    wateringFrequencyDays: 2,
    germinationDays: 7,
    harvestDays: 80,
    sunExposure: 'full',
    tips: {
      permaculture: 'Les fleurs attirent les insectes pollinisateurs. Associez avec la bourrache.',
      conventionnel: 'Récoltez la tête centrale avant ouverture des fleurs. Les têtes secondaires repoussent.',
      naturel: 'Purin d\'ortie toutes les 3 semaines. Évitez l\'excès d\'azote.',
      industriel: 'Engrais azoté au repiquage, puis riche en phosphore et potassium à la formation de la tête.',
    },
    commonIssues: ['Piéride du chou', 'Pucerons cendrés', 'Club root (hernie)'],
    seasonalAdvice: {
      spring: 'Semis en mars sous abri. Repiquage en mai.',
      summer: 'Arrosez copieusement. Surveillez les chenilles de piéride.',
      autumn: 'Excellente culture d\'automne. Le froid améliore la saveur.',
      winter: 'Protégez sous voile par grand froid.',
    },
    fertilizerSchedule: {
      naturel: 'Compost riche au repiquage, purin d\'ortie mensuel',
      industriel: 'Engrais crucifères au repiquage et à mi-croissance',
    },
  },
  corn: {
    frenchName: 'Maïs',
    icon: '🌽',
    dailyWaterNeed: 5,
    wateringFrequencyDays: 2,
    germinationDays: 10,
    harvestDays: 85,
    sunExposure: 'full',
    tips: {
      permaculture: 'Associez avec haricots et courgette (les 3 sœurs). Le maïs sert de tuteur aux haricots.',
      conventionnel: 'Plantez en blocs carrés (min 4x4) pour une bonne pollinisation par le vent.',
      naturel: 'Purin d\'ortie et compost abondant. Plante très gourmande.',
      industriel: 'Engrais azoté en début de végétation, potassique avant la floraison.',
    },
    commonIssues: ['Pyrale du maïs', 'Sésamie', 'Pucerons'],
    seasonalAdvice: {
      spring: 'Semis sous abri en avril, transplantez mi-mai quand le sol est chaud (>12°C).',
      summer: 'Arrosez abondamment surtout lors de la floraison et la formation des épis.',
      autumn: 'Récoltez quand les grains sont bien formés et les soies marron.',
      winter: 'Broyez les tiges pour le compost ou mulch.',
    },
    fertilizerSchedule: {
      naturel: 'Compost très abondant à la plantation, purin d\'ortie toutes les 2 semaines',
      industriel: 'Engrais azoté (30-0-0) en végétation, engrais complet à la floraison',
    },
  },
  sunflower: {
    frenchName: 'Tournesol',
    icon: '🌻',
    dailyWaterNeed: 3,
    wateringFrequencyDays: 3,
    germinationDays: 8,
    harvestDays: 90,
    sunExposure: 'full',
    tips: {
      permaculture: 'Attire les pollinisateurs et les oiseaux. Excellent brise-vent naturel.',
      conventionnel: 'Orientez au soleil. Tuteurez les grandes variétés contre le vent.',
      naturel: 'Très rustique. Un peu de compost suffit. Évitez l\'excès d\'azote.',
      industriel: 'Engrais potassique et phosphaté pour de belles têtes, évitez l\'azote.',
    },
    commonIssues: ['Sclérotinia', 'Oiseaux sur les graines', 'Limaces sur les jeunes plants'],
    seasonalAdvice: {
      spring: 'Semis direct en mai quand les gelées sont écartées. Sol bien ensoleillé.',
      summer: 'Arrosez régulièrement mais pas en excès. La plante tolère la sécheresse.',
      autumn: 'Récoltez les têtes quand les graines se détachent facilement. Séchez avant stockage.',
      winter: 'Laissez quelques têtes pour les oiseaux ou récoltez les graines pour l\'an prochain.',
    },
    fertilizerSchedule: {
      naturel: 'Compost léger à la plantation, aucun engrais supplémentaire',
      industriel: 'Engrais phospho-potassique au début de la floraison uniquement',
    },
  },
  other: {
    frenchName: 'Autre plante',
    icon: '🌱',
    dailyWaterNeed: 2.5,
    wateringFrequencyDays: 2,
    germinationDays: 10,
    harvestDays: 60,
    sunExposure: 'full',
    tips: {
      permaculture: 'Observez les besoins naturels de la plante et intégrez-la dans votre écosystème.',
      conventionnel: 'Adaptez l\'arrosage aux besoins spécifiques de votre plante.',
      naturel: 'Le compost et le purin d\'ortie conviennent à la plupart des plantes.',
      industriel: 'Engrais universel équilibré selon les indications du fabricant.',
    },
    commonIssues: ['Variables selon la plante'],
    seasonalAdvice: {
      spring: 'Période idéale pour planter la plupart des végétaux.',
      summer: 'Augmentez l\'arrosage par temps chaud et sec.',
      autumn: 'Préparez la plante pour l\'hiver.',
      winter: 'Protégez des gelées si nécessaire.',
    },
    fertilizerSchedule: {
      naturel: 'Compost universel mensuel',
      industriel: 'Engrais universel selon les instructions du fabricant',
    },
  },
};

// Regional average harvest per plant type (kg per plant per season)
export const REGIONAL_AVERAGES: Record<PlantType, number> = {
  tomato: 5,
  pepper: 2,
  zucchini: 8,
  cucumber: 4,
  lettuce: 0.5,
  carrot: 1.5,
  radish: 0.3,
  beans: 1.5,
  peas: 1,
  basil: 0.3,
  parsley: 0.2,
  mint: 0.2,
  strawberry: 1,
  potato: 4,
  onion: 2,
  garlic: 0.5,
  leek: 1.5,
  spinach: 0.5,
  chard: 1.5,
  beet: 2,
  broccoli: 1,
  corn: 1,
  sunflower: 0.5,
  other: 1,
};

// Helper to get plant name from type
export function getPlantName(type: PlantType): string {
  return PLANT_DATABASE[type]?.frenchName || type;
}

// Helper to get plant icon from type
export function getPlantIcon(type: PlantType): string {
  return PLANT_DATABASE[type]?.icon || '🌿';
}

export const PLANT_TYPES = Object.keys(PLANT_DATABASE) as PlantType[];

export function getPlantInfo(type: PlantType): PlantInfo {
  return PLANT_DATABASE[type];
}

export function getGrowthStage(daysSincePlanting: number, plantType: PlantType): {
  name: string;
  waterMultiplier: number;
  label: string;
} {
  const info = PLANT_DATABASE[plantType];
  if (daysSincePlanting < info.germinationDays) {
    return { name: 'germination', label: 'Germination', waterMultiplier: 0.5 };
  } else if (daysSincePlanting < info.germinationDays * 2.5) {
    return { name: 'seedling', label: 'Plantule', waterMultiplier: 0.75 };
  } else if (daysSincePlanting < info.harvestDays * 0.65) {
    return { name: 'vegetative', label: 'Végétatif', waterMultiplier: 1.0 };
  } else {
    return { name: 'flowering', label: 'Floraison/Récolte', waterMultiplier: 1.2 };
  }
}
