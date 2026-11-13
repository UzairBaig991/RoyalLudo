import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ROYAL_COLORS } from '../src/theme/colors';
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
      {/* Royal Crown Crest */}
      <View style={styles.crestCircle}>
        <Text style={styles.crestEmoji}>👑</Text>
      </View>

      <Text style={styles.title}>ROYAL LUDO</Text>
      <Text style={styles.subtitle}>THE KING OF BOARD GAMES</Text>

      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color={ROYAL_COLORS.gold} />
        <Text style={styles.loadingText}>Entering the royal arena...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ROYAL_COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  crestCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: ROYAL_COLORS.cardBg,
    borderWidth: 2,
    borderColor: ROYAL_COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: ROYAL_COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  crestEmoji: {
    fontSize: 48,
  },
  title: {
    color: ROYAL_COLORS.gold,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 6,
  },
  subtitle: {
    color: ROYAL_COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 48,
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    color: ROYAL_COLORS.textMuted,
    fontSize: 13,
    marginLeft: 10,
    fontWeight: '500',
  },
});
