import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import type { Session } from '@/types/market';

const SESSION_KEY = 'farmmarket.session';

export async function readSession(): Promise<Session | null> {
  try {
    const value = Platform.OS === 'web'
      ? typeof localStorage === 'undefined' ? null : localStorage.getItem(SESSION_KEY)
      : await SecureStore.getItemAsync(SESSION_KEY);
    return value ? JSON.parse(value) as Session : null;
  } catch {
    return null;
  }
}

export async function saveSession(session: Session): Promise<void> {
  const value = JSON.stringify(session);
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') localStorage.setItem(SESSION_KEY, value);
    return;
  }
  await SecureStore.setItemAsync(SESSION_KEY, value);
}

export async function clearSession(): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(SESSION_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(SESSION_KEY);
}