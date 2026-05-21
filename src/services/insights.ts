import { GardenMetrics, Predictions, GardenInsight, UserProfile } from '../types';
import i18next from '../i18n/config';

function generateId(): string {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

function t(key: string, options?: Record<string, any>): string {
  return i18next.t(key, options) as string;
}

/**
 * Generate actionable insights from metrics and predictions
 */
export function generateGardenInsights(
  metrics: GardenMetrics,
  predictions: Predictions,
  _weather: any,
  profile: UserProfile | null,
): GardenInsight[] {
  const insights: GardenInsight[] = [];
  const now = new Date().toISOString();

  // === PRODUCTIVITY INSIGHTS ===

  if (metrics.totalPlants === 0) {
    insights.push({
      id: generateId(),
      category: 'productivity',
      priority: 'high',
      title: t('insights.startGarden'),
      description: t('insights.startGardenDesc'),
      actionItems: [t('insights.actions.selectLocation'), t('insights.actions.prepareSoil'), t('insights.actions.choosePlants')],
      generatedAt: now,
    });
  } else if (metrics.averageProductivityScore > 80) {
    insights.push({
      id: generateId(),
      category: 'productivity',
      priority: 'low',
      title: t('insights.highProductivity'),
      description: t('insights.highProductivityDesc', { score: metrics.averageProductivityScore }),
      actionItems: [t('insights.actions.documentSuccess'), t('insights.actions.increaseSize')],
      generatedAt: now,
    });
  } else if (metrics.averageProductivityScore < 50) {
    insights.push({
      id: generateId(),
      category: 'productivity',
      priority: 'high',
      title: t('insights.lowProductivity'),
      description: t('insights.lowProductivityDesc', { score: metrics.averageProductivityScore }),
      affectedPlants: metrics.leastProductivePlants.map(p => p.plantId),
      actionItems: [
        t('insights.actions.improveWatering'),
        t('insights.actions.fertilizePlants'),
        t('insights.actions.replaceSpecies'),
      ],
      generatedAt: now,
    });
  }

  if (metrics.monthlyProductionTrend === 'up') {
    insights.push({
      id: generateId(),
      category: 'productivity',
      priority: 'low',
      title: t('insights.productionUp'),
      description: t('insights.productionUpDesc'),
      actionItems: [t('insights.actions.continueEfforts'), t('insights.actions.adjustRotations')],
      generatedAt: now,
    });
  } else if (metrics.monthlyProductionTrend === 'down') {
    insights.push({
      id: generateId(),
      category: 'productivity',
      priority: 'medium',
      title: t('insights.productionDown'),
      description: t('insights.productionDownDesc'),
      actionItems: [
        t('insights.actions.checkWeather'),
        t('insights.actions.inspectPests'),
        t('insights.actions.adjustFertilizer'),
      ],
      generatedAt: now,
    });
  }

  // === HEALTH INSIGHTS ===

  if (metrics.averageHealthScore < 50) {
    insights.push({
      id: generateId(),
      category: 'health',
      priority: 'high',
      title: t('insights.poorHealth'),
      description: t('insights.poorHealthDesc', { score: metrics.averageHealthScore }),
      affectedPlants: metrics.leastProductivePlants.map(p => p.plantId),
      actionItems: [
        t('insights.actions.ensureWatering'),
        t('insights.actions.inspectHealth'),
        t('insights.actions.improveAeration'),
      ],
      generatedAt: now,
    });
  } else if (metrics.averageHealthScore >= 80) {
    insights.push({
      id: generateId(),
      category: 'health',
      priority: 'low',
      title: t('insights.goodHealth'),
      description: t('insights.goodHealthDesc', { score: metrics.averageHealthScore }),
      actionItems: [t('insights.actions.regularMonitoring'), t('insights.actions.documentSuccess')],
      generatedAt: now,
    });
  }

  // === WATER EFFICIENCY INSIGHTS ===

  if (metrics.overallWaterEfficiency > 0.4) {
    insights.push({
      id: generateId(),
      category: 'efficiency',
      priority: 'low',
      title: t('insights.highWaterEfficiency'),
      description: t('insights.highWaterEfficiencyDesc', { efficiency: metrics.overallWaterEfficiency.toFixed(2) }),
      actionItems: [t('insights.actions.shareTechniques'), t('insights.actions.increaseSize')],
      generatedAt: now,
    });
  } else if (metrics.overallWaterEfficiency < 0.1) {
    insights.push({
      id: generateId(),
      category: 'efficiency',
      priority: 'high',
      title: t('insights.lowWaterEfficiency'),
      description: t('insights.lowWaterEfficiencyDesc', { efficiency: metrics.overallWaterEfficiency.toFixed(2) }),
      actionItems: [
        t('insights.actions.drip'),
        t('insights.actions.mulch'),
        profile?.gardeningStyle !== 'permaculture' ? t('insights.actions.permaculture') : t('insights.actions.strengthenPermaculture'),
      ],
      generatedAt: now,
    });
  }

  // === SEASONAL INSIGHTS ===

  const seasonalProd = (metrics.seasonalProductivity / (metrics.totalPlants * 2)) * 100; // normalized
  if (seasonalProd > 70) {
    insights.push({
      id: generateId(),
      category: 'seasonal',
      priority: 'low',
      title: t('insights.excellentSeason'),
      description: t('insights.excellentSeasonDesc'),
      actionItems: [t('insights.actions.documentSuccess')],
      generatedAt: now,
    });
  } else if (seasonalProd < 30) {
    insights.push({
      id: generateId(),
      category: 'seasonal',
      priority: 'medium',
      title: t('insights.poorSeason'),
      description: t('insights.poorSeasonDesc'),
      actionItems: [
        t('insights.actions.checkWeather'),
        t('insights.actions.adjustRotations'),
      ],
      generatedAt: now,
    });
  }

  // === RISK-BASED INSIGHTS ===

  const highRisks = predictions.healthRisks.filter(r => r.riskLevel === 'high');
  if (highRisks.length > 0) {
    insights.push({
      id: generateId(),
      category: 'risk',
      priority: 'high',
      title: t('insights.healthRisks', { count: highRisks.length }),
      description: t('insights.healthRisksDesc', { count: highRisks.length }),
      affectedPlants: highRisks.map(r => r.plantId),
      actionItems: highRisks.map(r => `${r.plantName}: ${r.mitigation}`).slice(0, 3),
      generatedAt: now,
    });
  }

  // === OPPORTUNITY INSIGHTS ===

  if (predictions.nextHarvestPlants.length > 0) {
    const nearestHarvest = predictions.nextHarvestPlants[0];
    const harvestDate = new Date(nearestHarvest.date);
    const daysUntilHarvest = Math.floor((harvestDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilHarvest >= 1 && daysUntilHarvest <= 7) {
      insights.push({
        id: generateId(),
        category: 'opportunity',
        priority: 'medium',
        title: t('insights.imminent'),
        description: t('insights.imminentDesc', { plantName: nearestHarvest.plantName, days: daysUntilHarvest }),
        affectedPlants: [nearestHarvest.plantId],
        actionItems: [
          t('insights.actions.prepareHarvest'),
          t('insights.actions.checkMaturity'),
          t('insights.actions.planHarvest'),
        ],
        generatedAt: now,
      });
    }
  }

  if (metrics.mostProductivePlants.length > 0) {
    const topPlant = metrics.mostProductivePlants[0];
    if (topPlant.productivityScore > 85) {
      insights.push({
        id: generateId(),
        category: 'opportunity',
        priority: 'low',
        title: t('insights.starPlant'),
        description: t('insights.starPlantDesc', { plantName: topPlant.plantName }),
        affectedPlants: [topPlant.plantId],
        actionItems: [
          t('insights.actions.collectSeeds'),
          t('insights.actions.documentPlant'),
          t('insights.actions.rotationPlan'),
        ],
        generatedAt: now,
      });
    }
  }

  // Water forecast insights
  const weeklyWater = predictions.waterForecast.nextWeekUsage;
  if (weeklyWater > 200) {
    insights.push({
      id: generateId(),
      category: 'efficiency',
      priority: 'medium',
      title: t('insights.highWaterUsage'),
      description: t('insights.highWaterUsageDesc', { liters: weeklyWater }),
      actionItems: [
        t('insights.actions.prepareWater'),
        t('insights.actions.autoWatering'),
        t('insights.actions.increaseMulch'),
      ],
      generatedAt: now,
    });
  }

  // Style-based recommendations
  if (profile?.gardeningStyle === 'conventionnel' && metrics.overallWaterEfficiency < 0.2) {
    insights.push({
      id: generateId(),
      category: 'opportunity',
      priority: 'low',
      title: t('insights.permacultureSuggestion'),
      description: t('insights.permacultureSuggestionDesc'),
      actionItems: [
        t('insights.actions.learnPermaculture'),
        t('insights.actions.testMulching'),
        t('insights.actions.experimentAssociations'),
      ],
      generatedAt: now,
    });
  }

  return insights;
}

/**
 * Generate specific action items from insights
 */
export function generateActionItems(insights: GardenInsight[]): string[] {
  const actions: string[] = [];
  const seen = new Set<string>();

  insights.forEach(insight => {
    if (insight.actionItems) {
      insight.actionItems.forEach(action => {
        const key = action.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          actions.push(action);
        }
      });
    }
  });

  return actions;
}

/**
 * Prioritize and sort insights
 */
export function prioritizeInsights(insights: GardenInsight[]): GardenInsight[] {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const categoryOrder = { risk: 0, health: 1, productivity: 2, efficiency: 3, seasonal: 4, opportunity: 5 };

  return [...insights].sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    return categoryOrder[a.category] - categoryOrder[b.category];
  });
}
