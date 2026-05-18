import { PlantType } from '@/types';

interface PlantCompanionship {
  good: PlantType[];
  bad: PlantType[];
}

export const PLANT_COMPATIBILITY: Record<PlantType, PlantCompanionship> = {
  tomato: {
    good: ['basil', 'carrot', 'parsley', 'mint'],
    bad: ['potato', 'broccoli'],
  },
  pepper: {
    good: ['basil', 'carrot', 'onion'],
    bad: ['broccoli'],
  },
  zucchini: {
    good: ['corn', 'beans', 'peas'],
    bad: ['potato'],
  },
  cucumber: {
    good: ['beans', 'corn', 'radish', 'sunflower'],
    bad: [],
  },
  lettuce: {
    good: ['carrot', 'radish', 'strawberry', 'beet'],
    bad: ['parsley'],
  },
  carrot: {
    good: ['lettuce', 'tomato', 'basil', 'onion', 'peas'],
    bad: [],
  },
  radish: {
    good: ['lettuce', 'carrot', 'cucumber', 'spinach'],
    bad: [],
  },
  beans: {
    good: ['corn', 'cucumber', 'zucchini', 'carrot', 'beet'],
    bad: ['onion', 'garlic'],
  },
  peas: {
    good: ['carrot', 'corn'],
    bad: ['onion', 'garlic'],
  },
  basil: {
    good: ['tomato', 'pepper', 'cucumber'],
    bad: [],
  },
  parsley: {
    good: ['tomato', 'carrot'],
    bad: [],
  },
  mint: {
    good: ['tomato'],
    bad: [],
  },
  strawberry: {
    good: ['lettuce', 'spinach'],
    bad: ['broccoli'],
  },
  potato: {
    good: ['corn', 'beans', 'peas'],
    bad: ['tomato', 'onion'],
  },
  onion: {
    good: ['carrot', 'lettuce', 'beet', 'strawberry'],
    bad: ['beans', 'peas', 'potato'],
  },
  garlic: {
    good: ['carrot', 'beet', 'strawberry'],
    bad: ['beans', 'peas'],
  },
  leek: {
    good: ['carrot', 'spinach'],
    bad: ['beans', 'peas'],
  },
  spinach: {
    good: ['carrot', 'radish', 'lettuce', 'strawberry'],
    bad: [],
  },
  chard: {
    good: ['lettuce', 'carrot', 'onion'],
    bad: [],
  },
  beet: {
    good: ['lettuce', 'onion', 'beans'],
    bad: [],
  },
  broccoli: {
    good: ['basil', 'beet', 'onion'],
    bad: ['tomato', 'pepper', 'strawberry'],
  },
  corn: {
    good: ['beans', 'peas', 'zucchini', 'cucumber', 'potato'],
    bad: [],
  },
  sunflower: {
    good: ['cucumber'],
    bad: ['potato'],
  },
  other: {
    good: [],
    bad: [],
  },
};

export function getCompanionshipStatus(plantType1: PlantType, plantType2: PlantType): 'good' | 'bad' | 'neutral' {
  const companions = PLANT_COMPATIBILITY[plantType1];
  if (companions.bad.includes(plantType2)) return 'bad';
  if (companions.good.includes(plantType2)) return 'good';
  return 'neutral';
}

export function isIncompatible(plantType1: PlantType, plantType2: PlantType): boolean {
  return getCompanionshipStatus(plantType1, plantType2) === 'bad' ||
         getCompanionshipStatus(plantType2, plantType1) === 'bad';
}
