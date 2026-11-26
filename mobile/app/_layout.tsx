import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NOVA_COLORS } from '../src/theme/colors';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: NOVA_COLORS.bg,
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modes/index" />
        <Stack.Screen name="modes/classic" />
        <Stack.Screen name="modes/team" />
        <Stack.Screen name="modes/pass-and-play" />
        <Stack.Screen name="modes/bot" />
        <Stack.Screen name="rooms/index" />
        <Stack.Screen name="rooms/create" />
        <Stack.Screen name="rooms/join" />
        <Stack.Screen name="rooms/[code]" />
        <Stack.Screen name="matchmaking/index" />
        <Stack.Screen name="gameplay/[matchId]" />
        <Stack.Screen name="gameplay/result" />
        <Stack.Screen name="friends/invite" />
        <Stack.Screen name="social/leagues" />
        <Stack.Screen name="social/inbox" />
        <Stack.Screen name="social/gift" />
        <Stack.Screen name="clubs/[clubId]" />
        <Stack.Screen name="clubs/chat" />
        <Stack.Screen name="events/index" />
        <Stack.Screen name="events/tournament" />
        <Stack.Screen name="events/pass" />
        <Stack.Screen name="rewards/daily" />
        <Stack.Screen name="rewards/missions" />
        <Stack.Screen name="rewards/lucky-roll" />
        <Stack.Screen name="shop/index" />
        <Stack.Screen name="shop/coins" />
        <Stack.Screen name="shop/gems" />
        <Stack.Screen name="shop/dice" />
        <Stack.Screen name="shop/boards" />
        <Stack.Screen name="settings/index" />
        <Stack.Screen name="settings/privacy" />
        <Stack.Screen name="settings/rules" />
      </Stack>
    </SafeAreaProvider>
  );
}
