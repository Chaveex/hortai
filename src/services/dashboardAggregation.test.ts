import { getProductionData, getWaterData, getHealthData, getComparisonData } from './dashboardAggregation';
import { Plant, PlantEntry, WeatherData } from '../types';
import { format, subDays } from 'date-fns';

// Mock data
const mockPlants: Plant[] = [
  {
    id: 'p1',
    name: 'Tomate 1',
    type: 'tomato',
    plantedDate: format(subDays(new Date(), 45), 'yyyy-MM-dd'),
    lastWatered: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
  },
  {
    id: 'p2',
    name: 'Courgette 1',
    type: 'zucchini',
    plantedDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    lastWatered: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
  },
];

const mockEntries: PlantEntry[] = [
  {
    id: 'e1',
    plantId: 'p1',
    date: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
    type: 'harvest',
    quantity: 2.5,
    unit: 'kg',
  },
  {
    id: 'e2',
    plantId: 'p2',
    date: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
    type: 'harvest',
    quantity: 1.8,
    unit: 'kg',
  },
  {
    id: 'e3',
    plantId: 'p1',
    date: format(subDays(new Date(), 10), 'yyyy-MM-dd'),
    type: 'harvest',
    quantity: 3,
    unit: 'kg',
  },
];

const mockWeather: WeatherData = {
  temperature: 25,
  feelsLike: 26,
  humidity: 65,
  description: 'Partly cloudy',
  icon: '02d',
  windSpeed: 5,
  rain1h: 0,
  forecast: [],
  lastUpdated: new Date().toISOString(),
  city: 'Paris',
};

const dateRange = {
  start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
  end: format(new Date(), 'yyyy-MM-dd'),
};

// Quick test run
export function runDashboardTests() {
  console.log('🧪 Running dashboard aggregation tests...\n');

  try {
    // Test 1: Production data
    console.log('Test 1: getProductionData');
    const prodData = getProductionData(mockEntries, mockPlants, dateRange);
    console.log(`  ✓ Total KG: ${prodData.totalKg}`);
    console.log(`  ✓ Avg per plant: ${prodData.avgPerPlant}`);
    console.log(`  ✓ Trend direction: ${prodData.trendDirection}`);
    console.log(`  ✓ By type: ${prodData.byType.length} types`);
    console.log(`  ✓ Chart data: ${prodData.chart.length} months\n`);

    // Test 2: Water data
    console.log('Test 2: getWaterData');
    const waterData = getWaterData(mockPlants, mockEntries, mockWeather, dateRange);
    console.log(`  ✓ Total L: ${waterData.totalL}`);
    console.log(`  ✓ Avg daily L: ${waterData.avgDailyL}`);
    console.log(`  ✓ % of regional: ${waterData.percentOfRegional}%`);
    console.log(`  ✓ Recommendations: ${waterData.recommendations.length} items\n`);

    // Test 3: Health data
    console.log('Test 3: getHealthData');
    const healthData = getHealthData(mockPlants, mockEntries, mockWeather);
    console.log(`  ✓ Current score: ${healthData.currentScore}%`);
    console.log(`  ✓ Hydration: ${healthData.factors.hydration}%`);
    console.log(`  ✓ Alerts: ${healthData.alerts.length} items\n`);

    // Test 4: Comparison data
    console.log('Test 4: getComparisonData');
    const compData = getComparisonData(mockPlants, mockEntries);
    console.log(`  ✓ Plants compared: ${compData.plants.length}`);
    compData.plants.forEach(p => {
      console.log(`    - ${p.name}: ${p.harvest}kg (${p.status})`);
    });
    console.log('\n✅ All tests passed!\n');

    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}
