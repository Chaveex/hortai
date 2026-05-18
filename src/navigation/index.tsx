import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, View, StyleSheet } from 'react-native';
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
import StatsScreen from '../screens/StatsScreen';
import { GardenMapScreen } from '../screens/GardenMapScreen';
import AIChatModal from '../screens/AIChatModal';
import AIFABButton from '../components/AIFABButton';
import { colors } from '../constants/theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function GardenStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GardenList" component={GardenScreen} />
      <Stack.Screen name="AddPlant" component={AddPlantScreen} />
      <Stack.Screen name="PlantDetail" component={PlantDetailScreen} />
      <Stack.Screen name="GardenMap" component={GardenMapScreen} />
      <Stack.Screen name="Stats" component={StatsScreen} />
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

  return (
    <NavigationContainer>
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
              paddingBottom: 4,
              height: 60,
            },
            tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
          }}
        >
          <Tab.Screen
            name="Accueil"
            component={HomeScreen}
            options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} /> }}
          />
          <Tab.Screen
            name="Jardin"
            component={GardenStack}
            options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🌱" focused={focused} /> }}
          />
          <Tab.Screen
            name="Tâches"
            component={ChoreStack}
            options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🗓️" focused={focused} /> }}
          />
          <Tab.Screen
            name="Semis"
            component={SowingCalendarScreen}
            options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📅" focused={focused} /> }}
          />
          <Tab.Screen
            name="Stats"
            component={StatsScreen}
            options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} /> }}
          />
          <Tab.Screen
            name="Réglages"
            component={SettingsStack}
            options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} /> }}
          />
        </Tab.Navigator>
        <AIFABButton onPress={() => setChatOpen(true)} />
      </View>
      <AIChatModal visible={chatOpen} onClose={() => setChatOpen(false)} />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
