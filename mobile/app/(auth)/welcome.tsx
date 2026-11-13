import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ROYAL_COLORS } from '../../src/theme/colors';
import { RoyalButton } from '../../src/components/ui/RoyalButton';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function WelcomeScreen() {
  const router = useRouter();
  const { loginAsGuest } = useAuthStore();

  const handleGuest = () => {
    loginAsGuest();
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerArea}>
        <View style={styles.crownCircle}>
          <Text style={{ fontSize: 42 }}>👑</Text>
        </View>
        <Text style={styles.title}>ROYAL LUDO</Text>
        <Text style={styles.tagline}>Experience the majesty of real-time multiplayer board gameplay</Text>
      </View>

      <View style={styles.cardBox}>
        <RoyalButton
          title="PLAY AS GUEST"
          variant="gold"
          size="large"
          onPress={handleGuest}
          style={styles.actionBtn}
        />

        <RoyalButton
          title="SIGN IN WITH EMAIL"
          variant="secondary"
          size="large"
          onPress={() => router.push('/(auth)/login')}
          style={styles.actionBtn}
        />

        <RoyalButton
          title="CREATE ACCOUNT"
          variant="ghost"
          size="medium"
          onPress={() => router.push('/(auth)/register')}
          style={styles.registerBtn}
        />
      </View>

      <Text style={styles.termsText}>
        By playing, you agree to our Terms of Service & Privacy Policy.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ROYAL_COLORS.primaryBg,
    padding: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerArea: {
    alignItems: 'center',
    marginTop: 60,
  },
  crownCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: ROYAL_COLORS.cardBg,
    borderWidth: 2,
    borderColor: ROYAL_COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    color: ROYAL_COLORS.gold,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8,
  },
  tagline: {
    color: ROYAL_COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  cardBox: {
    width: '100%',
    paddingHorizontal: 8,
  },
  actionBtn: {
    marginBottom: 14,
    width: '100%',
  },
  registerBtn: {
    marginTop: 4,
  },
  termsText: {
    color: ROYAL_COLORS.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 16,
  },
});
