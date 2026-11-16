import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { NOVA_COLORS } from '../../src/theme/colors';
import { NovaBadge } from '../../src/components/nova/NovaBadge';
import { NovaBoardPreview } from '../../src/components/nova/NovaBoardPreview';
import { NovaDie } from '../../src/components/nova/NovaDie';
import { NovaButton } from '../../src/components/nova/NovaButton';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      bounces={false}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Status */}
      <View style={styles.topStatus}>
        <Text style={styles.clock}>9:41</Text>
      </View>

      {/* Badge */}
      <View style={styles.badgeWrapper}>
        <NovaBadge label="PLAY. CONNECT. REPEAT." color="purple" />
      </View>

      {/* Board & Die Illustration */}
      <View style={styles.boardContainer}>
        <NovaBoardPreview size={230} />
        <View style={styles.diePosition}>
          <NovaDie value={6} size={58} theme="nova" />
        </View>
      </View>

      {/* Title & Tagline */}
      <View style={styles.textBlock}>
        <Text style={styles.brandTitle}>LUDO</Text>
        <Text style={styles.brandTitle}>NOVA</Text>
        <Text style={styles.subtitle}>Your people. Your next great game.</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonBlock}>
        <NovaButton
          title="Let’s play"
          onPress={() => router.push('/(auth)/setup' as any)}
          variant="primary"
          style={styles.primaryBtn}
        />

        <TouchableOpacity
          onPress={() => router.push('/(auth)/login')}
          style={styles.signInLink}
          activeOpacity={0.7}
        >
          <Text style={styles.signInText}>
            Already a player? <Text style={styles.signInHighlight}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: NOVA_COLORS.bg,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 36,
    justifyContent: 'space-between',
  },
  topStatus: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  clock: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  badgeWrapper: {
    alignItems: 'center',
    marginVertical: 6,
  },
  boardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
    position: 'relative',
  },
  diePosition: {
    position: 'absolute',
    right: 20,
    bottom: -10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
  textBlock: {
    marginVertical: 10,
  },
  brandTitle: {
    fontSize: 52,
    fontWeight: '900',
    color: NOVA_COLORS.textPrimary,
    letterSpacing: -1.5,
    lineHeight: 56,
  },
  subtitle: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 15,
    marginTop: 12,
    lineHeight: 22,
  },
  buttonBlock: {
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
  },
  primaryBtn: {
    marginBottom: 14,
  },
  signInLink: {
    paddingVertical: 8,
  },
  signInText: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  signInHighlight: {
    color: NOVA_COLORS.accentPurple,
    fontWeight: '700',
  },
});
