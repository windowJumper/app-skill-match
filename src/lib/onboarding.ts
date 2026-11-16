import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const COMPLETED_KEY = 'skillmatch.onboarding.completed';

export async function hasCompletedOnboarding() {
  const value =
    Platform.OS === 'web'
      ? await AsyncStorage.getItem(COMPLETED_KEY)
      : await SecureStore.getItemAsync(COMPLETED_KEY);
  return value === 'true';
}

export async function completeOnboarding() {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(COMPLETED_KEY, 'true');
    return;
  }

  await SecureStore.setItemAsync(COMPLETED_KEY, 'true');
}
