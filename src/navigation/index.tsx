import React, { useState } from 'react';
import { NavigationContainer, useRoute } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Text, View, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import HomeScreen from '../screens/HomeScreen';
import GardenScreen from '../screens/GardenScreen';
import AddPlantScreen from '../screens/AddPlantScreen';
import PlantDetailScreen from '../screens/PlantDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';
import BackupSettingsScreen from '../screens/BackupSettingsScreen';
import SowingCalendarScreen from '../screens/SowingCalendarScreen';
import ChoreCalendarScreen from '../screens/ChoreCalendarScreen';
import ChoreDetailScreen from '../screens/ChoreDetailScreen';
import ChoreFormScreen from '../screens/ChoreFormScreen';
import { GardenBedsScreen } from '../screens/GardenBedsScreen';
import { BedGridScreen } from '../screens/BedGridScreen';
import { BedFormScreen } from '../screens/BedFormScreen';
import { BedSettingsModal } from '../screens/BedSettingsModal';
import AIChatModal from '../screens/AIChatModal';
import BotanistModal from '../screens/BotanistModal';
import AIFABButton from '../components/AIFABButton';
import ContextFAB from '../components/ContextFAB';
import { colors } from '../constants/theme';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ProductionDashboard } from '../screens/ProductionDashboard';
import { WaterDashboard } from '../screens/WaterDashboard';
import { HealthScoreDashboard } from '../screens/HealthScoreDashboard';
import { PlantDetailDashboard } from '../screens/PlantDetailDashboard';
import { ComparisonDashboard } from '../screens/ComparisonDashboard';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const TopTab = createMaterialTopTabNavigator();

function GardenTabs() {
  const { t } = useTranslation();
  return (
    <TopTab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          textTransform: 'none',
        },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
        },
      }}
    >
      <TopTab.Screen
        name="Plantes"
        component={GardenScreen}
        options={{
          tabBarLabel: t('screens.plants'),
        }}
      />
      <TopTab.Screen
        name="Planification"
        component={GardenBedsScreen}
        options={{
          tabBarLabel: t('screens.planning'),
        }}
      />
    </TopTab.Navigator>
  );
}

function GardenStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GardenTabs" component={GardenTabs} />
      <Stack.Screen name="AddPlant" component={AddPlantScreen} />
      <Stack.Screen name="PlantDetail" component={PlantDetailScreen} />
      <Stack.Screen name="BedGrid" component={BedGridScreen} />
      <Stack.Screen name="BedForm" component={BedFormScreen} />
      <Stack.Screen name="SowingCalendar" component={SowingCalendarScreen} />
      <Stack.Screen name="PlantDetailDashboard" component={PlantDetailDashboard} />
      <Stack.Screen
        name="BedSettings"
        component={BedSettingsModal}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}

function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="ProductionDashboard" component={ProductionDashboard} />
      <Stack.Screen name="WaterDashboard" component={WaterDashboard} />
      <Stack.Screen name="HealthDashboard" component={HealthScoreDashboard} />
      <Stack.Screen name="PlantDetailDashboard" component={PlantDetailDashboard} />
      <Stack.Screen name="ComparisonDashboard" component={ComparisonDashboard} />
    </Stack.Navigator>
  );
}

function ChoreStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChoreCalendar" component={ChoreCalendarScreen} />
      <Stack.Screen name="ChoreDetail" component={ChoreDetailScreen} />
      <Stack.Screen name="ChoreForm" component={ChoreFormScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}

function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsMain" component={SettingsScreen} />
      <Stack.Screen name="BackupSettings" component={BackupSettingsScreen} />
    </Stack.Navigator>
  );
}

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return <Text style={{ fontSize: focused ? 26 : 22, opacity: focused ? 1 : 0.6 }}>{emoji}</Text>;
}

export default function Navigation() {
  const [chatOpen, setChatOpen] = useState(false);
  const [botanistOpen, setBotanistOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <NavigationContainer>
      <View style={styles.root}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs">
            {() => (
              <View style={styles.root}>
                <Tab.Navigator
                  screenOptions={{
                    headerShown: false,
                    tabBarActiveTintColor: colors.primary,
                    tabBarInactiveTintColor: colors.textMuted,
                    tabBarStyle: {
                      backgroundColor: '#FFFFFF',
                      borderTopColor: colors.border,
                      borderTopWidth: 1,
                      paddingBottom: Math.max(4, insets.bottom),
                      height: 60 + insets.bottom,
                    },
                    tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
                  }}
                >
                  <Tab.Screen
                    name="Accueil"
                    component={HomeScreen}
                    options={{
                      tabBarLabel: t('navigation.home'),
                      tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
                    }}
                  />
                  <Tab.Screen
                    name="Jardin"
                    component={GardenStack}
                    options={{
                      tabBarLabel: t('navigation.garden'),
                      tabBarIcon: ({ focused }) => <TabIcon emoji="🌱" focused={focused} />,
                    }}
                  />
                  <Tab.Screen
                    name="Tâches"
                    component={ChoreStack}
                    options={{
                      tabBarLabel: t('navigation.chores'),
                      tabBarIcon: ({ focused }) => <TabIcon emoji="🗓️" focused={focused} />,
                    }}
                  />
                  <Tab.Screen
                    name="Réglages"
                    component={SettingsStack}
                    options={{
                      tabBarLabel: t('navigation.settings'),
                      tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
                    }}
                  />
                </Tab.Navigator>
                <AIFABButton onPress={() => setChatOpen(true)} />
                <ContextFAB onChatPress={() => setChatOpen(true)} />
              </View>
            )}
          </Stack.Screen>
          <Stack.Screen
            name="DashboardStack"
            component={DashboardStack}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </View>
      <AIChatModal visible={chatOpen} onClose={() => setChatOpen(false)} />
      <BotanistModal visible={botanistOpen} onClose={() => setBotanistOpen(false)} />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
