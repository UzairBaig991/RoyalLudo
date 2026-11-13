import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ROYAL_COLORS } from '../src/theme/colors';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={ROYAL_COLORS.primaryBg} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: ROYAL_COLORS.primaryBg,
          },
          headerTintColor: ROYAL_COLORS.gold,
          headerTitleStyle: {
            fontWeight: '700',
          },
          contentStyle: {
            backgroundColor: ROYAL_COLORS.primaryBg,
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="gameplay/[matchId]" options={{ headerShown: false }} />
        <Stack.Screen name="gameplay/result" options={{ headerShown: false }} />
        <Stack.Screen name="rooms/create" options={{ title: 'Create Private Table' }} />
        <Stack.Screen name="rooms/join" options={{ title: 'Join Private Table' }} />
        <Stack.Screen name="rooms/[code]" options={{ title: 'Table Lobby' }} />
        <Stack.Screen name="matchmaking/index" options={{ headerShown: false }} />
        <Stack.Screen name="shop/index" options={{ title: 'Royal Bazaar' }} />
        <Stack.Screen name="settings/index" options={{ title: 'Settings' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
