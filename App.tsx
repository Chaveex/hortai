import 'react-native-gesture-handler';
import './src/i18n/config'; // Initialize i18next
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Navigation from './src/navigation';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { useStore } from './src/store/useStore';
import { registerBackgroundFetch } from './src/services/notifications';

export default function App() {
  const profile = useStore(s => s.profile);

  useEffect(() => {
    registerBackgroundFetch();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor="#F0F4E8" />
      {profile?.onboardingComplete ? <Navigation /> : <OnboardingScreen />}
    </SafeAreaProvider>
  );
}
