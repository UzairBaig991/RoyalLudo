import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#FFDF00',
        tabBarInactiveTintColor: '#A673A4',
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      {/* 1. Shop */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Shop',
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Text style={{ fontSize: focused ? 24 : 20 }}>🛒</Text>
            </View>
          ),
        }}
      />

      {/* 2. Friends */}
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Friends',
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Text style={{ fontSize: focused ? 24 : 20 }}>👥</Text>
            </View>
          ),
        }}
      />

      {/* 3. HOME (Iconic elevated central 3D tab) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: () => (
            <View style={styles.elevatedHomeBtn}>
              <View style={styles.homeRoof}>
                <Text style={{ fontSize: 26, marginTop: -4 }}>🏠</Text>
              </View>
            </View>
          ),
          tabBarLabelStyle: styles.homeTabLabel,
        }}
      />

      {/* 4. Collections (Dice with '24' badge) */}
      <Tabs.Screen
        name="play"
        options={{
          title: 'Collections',
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Text style={{ fontSize: focused ? 24 : 20 }}>🎲</Text>
              <View style={styles.diceBadge}>
                <Text style={styles.diceBadgeText}>24</Text>
              </View>
            </View>
          ),
        }}
      />

      {/* 5. Chest */}
      <Tabs.Screen
        name="rewards"
        options={{
          title: 'Chest',
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Text style={{ fontSize: focused ? 24 : 20 }}>🧰</Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#2F062E',
    borderTopColor: '#521350',
    borderTopWidth: 2,
    height: 65,
    paddingBottom: 8,
    paddingTop: 6,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  elevatedHomeBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#752273',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#FFDF00',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 10,
  },
  homeRoof: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeTabLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFDF00',
    marginTop: 2,
  },
  diceBadge: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: '#E74C4C',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  diceBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
  },
});
