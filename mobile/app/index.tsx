import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { NOVA_COLORS } from '../src/theme/colors';
import { NovaDie } from '../src/components/nova/NovaDie';
import { useAuthStore } from '../src/store/useAuthStore';

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/welcome');
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  return (
    <View style={styles.container}>
      <View style={styles.dieWrap}>
        <NovaDie value={6} size={84} theme="nova" />
      </View>

      <Text style={styles.title}>LUDO NOVA</Text>
      <Text style={styles.subtitle}>YOUR PEOPLE. YOUR NEXT GREAT GAME.</Text>

      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color={NOVA_COLORS.accentPurple} />
        <Text style={styles.loadingText}>Entering the arena…</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NOVA_COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dieWrap: {
    marginBottom: 24,
  },
  title: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 6,
  },
  subtitle: {
    color: NOVA_COLORS.accentPurple,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 48,
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 13,
    marginLeft: 10,
    fontWeight: '600',
  },
});
