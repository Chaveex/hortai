// Static plant metadata (non-translatable)
export const PLANT_METADATA: Record<string, {
  icon: string;
  dailyWaterNeed: number;
  wateringFrequencyDays: number;
  germinationDays: number;
  harvestDays: number;
  sunExposure: 'full' | 'partial' | 'shade';
}> = {
  tomato: { icon: '🍅', dailyWaterNeed: 4, wateringFrequencyDays: 2, germinationDays: 7, harvestDays: 75, sunExposure: 'full' },
  pepper: { icon: '🫑', dailyWaterNeed: 3, wateringFrequencyDays: 2, germinationDays: 10, harvestDays: 90, sunExposure: 'full' },
  zucchini: { icon: '🥒', dailyWaterNeed: 5, wateringFrequencyDays: 2, germinationDays: 5, harvestDays: 50, sunExposure: 'full' },
  cucumber: { icon: '🥒', dailyWaterNeed: 4, wateringFrequencyDays: 1, germinationDays: 5, harvestDays: 55, sunExposure: 'full' },
  lettuce: { icon: '🥬', dailyWaterNeed: 3, wateringFrequencyDays: 1, germinationDays: 5, harvestDays: 60, sunExposure: 'partial' },
  carrot: { icon: '🥕', dailyWaterNeed: 2, wateringFrequencyDays: 3, germinationDays: 14, harvestDays: 90, sunExposure: 'full' },
  radish: { icon: '🌱', dailyWaterNeed: 1.5, wateringFrequencyDays: 2, germinationDays: 4, harvestDays: 25, sunExposure: 'full' },
  beans: { icon: '🫘', dailyWaterNeed: 2.5, wateringFrequencyDays: 2, germinationDays: 8, harvestDays: 60, sunExposure: 'full' },
  peas: { icon: '🫛', dailyWaterNeed: 2, wateringFrequencyDays: 3, germinationDays: 10, harvestDays: 65, sunExposure: 'full' },
  basil: { icon: '🌿', dailyWaterNeed: 2, wateringFrequencyDays: 1, germinationDays: 7, harvestDays: 45, sunExposure: 'full' },
  parsley: { icon: '🌿', dailyWaterNeed: 1.5, wateringFrequencyDays: 2, germinationDays: 21, harvestDays: 75, sunExposure: 'partial' },
  mint: { icon: '🌿', dailyWaterNeed: 2, wateringFrequencyDays: 1, germinationDays: 14, harvestDays: 60, sunExposure: 'partial' },
  strawberry: { icon: '🍓', dailyWaterNeed: 3, wateringFrequencyDays: 2, germinationDays: 30, harvestDays: 90, sunExposure: 'full' },
  potato: { icon: '🥔', dailyWaterNeed: 3, wateringFrequencyDays: 3, germinationDays: 21, harvestDays: 90, sunExposure: 'full' },
  onion: { icon: '🧅', dailyWaterNeed: 2, wateringFrequencyDays: 4, germinationDays: 14, harvestDays: 100, sunExposure: 'full' },
  garlic: { icon: '🧄', dailyWaterNeed: 1.5, wateringFrequencyDays: 5, germinationDays: 14, harvestDays: 210, sunExposure: 'full' },
  leek: { icon: '🌱', dailyWaterNeed: 2.5, wateringFrequencyDays: 3, germinationDays: 14, harvestDays: 120, sunExposure: 'full' },
  spinach: { icon: '🥬', dailyWaterNeed: 2.5, wateringFrequencyDays: 2, germinationDays: 10, harvestDays: 45, sunExposure: 'partial' },
  chard: { icon: '🥬', dailyWaterNeed: 3, wateringFrequencyDays: 2, germinationDays: 10, harvestDays: 60, sunExposure: 'full' },
  beet: { icon: '🫚', dailyWaterNeed: 2.5, wateringFrequencyDays: 3, germinationDays: 10, harvestDays: 75, sunExposure: 'full' },
  broccoli: { icon: '🥦', dailyWaterNeed: 3, wateringFrequencyDays: 2, germinationDays: 7, harvestDays: 80, sunExposure: 'full' },
  corn: { icon: '🌽', dailyWaterNeed: 5, wateringFrequencyDays: 2, germinationDays: 10, harvestDays: 85, sunExposure: 'full' },
  sunflower: { icon: '🌻', dailyWaterNeed: 3, wateringFrequencyDays: 3, germinationDays: 8, harvestDays: 90, sunExposure: 'full' },
  other: { icon: '🌱', dailyWaterNeed: 2.5, wateringFrequencyDays: 2, germinationDays: 10, harvestDays: 60, sunExposure: 'full' },
};
