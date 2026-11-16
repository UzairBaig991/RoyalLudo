import React from 'react';
import { Stack } from 'expo-router';
import { NOVA_COLORS } from '../../src/theme/colors';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: NOVA_COLORS.bg },
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="setup" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
