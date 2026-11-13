import React from 'react';
import { Stack } from 'expo-router';
import { ROYAL_COLORS } from '../../src/theme/colors';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: ROYAL_COLORS.primaryBg },
        headerTintColor: ROYAL_COLORS.gold,
        contentStyle: { backgroundColor: ROYAL_COLORS.primaryBg },
      }}
    >
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ title: 'Sign In' }} />
      <Stack.Screen name="register" options={{ title: 'Create Account' }} />
    </Stack>
  );
}
