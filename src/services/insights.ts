import { GardenMetrics, Predictions, GardenInsight, UserProfile } from '../types';

function generateId(): string {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
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
      title: 'Commencez votre jardin',
      description: 'Vous n\'avez pas encore planté de plants. Commencez par des espèces faciles comme la tomate ou la laitue.',
      actionItems: ['Sélectionnez un emplacement ensoleillé', 'Préparez le sol', 'Choisissez vos premières plants'],
      generatedAt: now,
    });
  } else if (metrics.averageProductivityScore > 80) {
    insights.push({
      id: generateId(),
      category: 'productivity',
      priority: 'low',
      title: 'Très bon rendement',
      description: `Votre jardin est très productif (score: ${metrics.averageProductivityScore}/100). Continuez vos pratiques actuelles!`,
      actionItems: ['Documentez vos succès', 'Envisagez d\'augmenter la superficie'],
      generatedAt: now,
    });
  } else if (metrics.averageProductivityScore < 50) {
    insights.push({
      id: generateId(),
      category: 'productivity',
      priority: 'high',
      title: 'Faible rendement',
      description: `Votre productivité est faible (score: ${metrics.averageProductivityScore}/100). Analysez les plantes les moins performantes.`,
      affectedPlants: metrics.leastProductivePlants.map(p => p.plantId),
      actionItems: [
        'Améliorez les conditions d\'arrosage',
        'Fertilisez les plantes faibles',
        'Envisagez de remplacer les espèces non adaptées',
      ],
      generatedAt: now,
    });
  }

  if (metrics.monthlyProductionTrend === 'up') {
    insights.push({
      id: generateId(),
      category: 'productivity',
      priority: 'low',
      title: 'Production en hausse',
      description: 'Votre production mensuelle est en augmentation. C\'est un excellent signe!',
      actionItems: ['Continuez vos efforts', 'Envisagez d\'adapter vos rotations culturales'],
      generatedAt: now,
    });
  } else if (metrics.monthlyProductionTrend === 'down') {
    insights.push({
      id: generateId(),
      category: 'productivity',
      priority: 'medium',
      title: 'Production en baisse',
      description: 'Votre production mensuelle diminue. Cela peut être saisonnier ou due à des problèmes de culture.',
      actionItems: [
        'Vérifiez les conditions météorologiques',
        'Inspectez les plantes pour détecter des maladies',
        'Ajustez la fertilisation',
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
      title: 'Santé du jardin compromise',
      description: `La santé générale est faible (score: ${metrics.averageHealthScore}/100). Les plantes peuvent être en stress.`,
      affectedPlants: metrics.leastProductivePlants.map(p => p.plantId),
      actionItems: [
        'Assurez un arrosage régulier et adapté',
        'Inspectez pour déceler des ravageurs ou maladies',
        'Améliorez l\'aération du jardin',
      ],
      generatedAt: now,
    });
  } else if (metrics.averageHealthScore >= 80) {
    insights.push({
      id: generateId(),
      category: 'health',
      priority: 'low',
      title: 'Jardin en bon état de santé',
      description: `Vos plants sont en excellente santé (score: ${metrics.averageHealthScore}/100). Maintenez vos pratiques.`,
      actionItems: ['Continuez la surveillance régulière', 'Documentez vos bonnes pratiques'],
      generatedAt: now,
    });
  }

  // === WATER EFFICIENCY INSIGHTS ===

  if (metrics.overallWaterEfficiency > 0.4) {
    insights.push({
      id: generateId(),
      category: 'efficiency',
      priority: 'low',
      title: 'Excellente efficacité hydrique',
      description: `Vous utilisez l'eau très efficacement (${metrics.overallWaterEfficiency.toFixed(2)} kg/L). Bravo!`,
      actionItems: ['Partagez vos techniques d\'arrosage', 'Envisagez de cultiver plus de plantes'],
      generatedAt: now,
    });
  } else if (metrics.overallWaterEfficiency < 0.1) {
    insights.push({
      id: generateId(),
      category: 'efficiency',
      priority: 'high',
      title: 'Faible efficacité hydrique',
      description: `Vous utilisez beaucoup d'eau pour peu de production (${metrics.overallWaterEfficiency.toFixed(2)} kg/L).`,
      actionItems: [
        'Installez un système de goutte-à-goutte',
        'Paillez davantage pour conserver l\'humidité',
        profile?.gardeningStyle !== 'permaculture' ? 'Envisagez la permaculture' : 'Renforcez les techniques de permaculture',
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
      title: 'Excellente saison',
      description: 'Vous avez une très bonne production saisonnière. Les conditions sont optimales.',
      actionItems: ['Notez vos techniques réussies pour l\'année prochaine'],
      generatedAt: now,
    });
  } else if (seasonalProd < 30) {
    insights.push({
      id: generateId(),
      category: 'seasonal',
      priority: 'medium',
      title: 'Production saisonnière faible',
      description: 'Votre production de cette saison est inférieure à la normale.',
      actionItems: [
        'Vérifiez si c\'est dû à des facteurs météorologiques',
        'Envisagez d\'ajuster les variétés plantées',
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
      title: `${highRisks.length} risque(s) de santé détecté(s)`,
      description: `${highRisks.length} plante(s) présentent des risques élevés pour leur santé.`,
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
        title: 'Récolte imminente',
        description: `La plante "${nearestHarvest.plantName}" devrait être prête à récolter dans ${daysUntilHarvest} jour(s).`,
        affectedPlants: [nearestHarvest.plantId],
        actionItems: [
          'Préparez vos contenants de récolte',
          'Vérifiez la maturité de la plante',
          'Planifiez votre utilisation de la récolte',
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
        title: 'Plante vedette à reproduire',
        description: `La plante "${topPlant.plantName}" est exceptionnellement productive. Envisagez de cultiver plus cette variété.`,
        affectedPlants: [topPlant.plantId],
        actionItems: [
          'Collectez les graines ou boutures',
          'Documentez les conditions de culture de cette plante',
          'Envisagez une rotation avec cette espèce',
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
      title: 'Haute consommation d\'eau prévue',
      description: `Vous aurez besoin d'environ ${weeklyWater}L d'eau la semaine prochaine.`,
      actionItems: [
        'Préparez suffisamment d\'eau',
        'Envisagez un système d\'arrosage automatique',
        'Augmentez le paillage pour réduire les besoins',
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
      title: 'Transition vers permaculture?',
      description: 'Vous pourriez améliorer votre efficacité hydrique en adoptant des techniques de permaculture.',
      actionItems: [
        'Apprenez les principes de permaculture',
        'Testez le paillage épais',
        'Expérimentez l\'association de plantes',
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
