import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NOVA_COLORS } from '../../src/theme/colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: NOVA_COLORS.accentPurple,
        tabBarInactiveTintColor: NOVA_COLORS.textSecondary,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      {/* 1. Play (Home Lobby - Screen 04) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Play',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'game-controller' : 'game-controller-outline'}
              size={22}
              color={String(color || NOVA_COLORS.textSecondary)}
            />
          ),
        }}
      />

      {/* 2. Friends (Screen 18) */}
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Friends',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'people' : 'people-outline'}
              size={22}
              color={String(color || NOVA_COLORS.textSecondary)}
            />
          ),
        }}
      />

      {/* 3. Clubs (Screen 22) */}
      <Tabs.Screen
        name="clubs"
        options={{
          title: 'Clubs',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'shield' : 'shield-outline'}
              size={22}
              color={String(color || NOVA_COLORS.textSecondary)}
            />
          ),
        }}
      />

      {/* 4. Shop (Screen 31) */}
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'cart' : 'cart-outline'}
              size={22}
              color={String(color || NOVA_COLORS.textSecondary)}
            />
          ),
        }}
      />

      {/* Hidden helper tabs accessible from routes */}
      <Tabs.Screen
        name="play"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: NOVA_COLORS.surfaceNav,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    borderTopWidth: 1,
    height: 72,
    paddingBottom: 10,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
});
