import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { NOVA_COLORS } from '../../src/theme/colors';
import { NovaHeader } from '../../src/components/nova/NovaHeader';
import { NovaDie } from '../../src/components/nova/NovaDie';
import { NovaButton } from '../../src/components/nova/NovaButton';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function SignInScreen() {
  const router = useRouter();
  const { loginAsGuest } = useAuthStore();

  const handleApple = () => {
    loginAsGuest('ApplePlayer');
    router.replace('/(tabs)');
  };

  const handleGoogle = () => {
    loginAsGuest('GooglePlayer');
    router.replace('/(tabs)');
  };

  const handleFacebook = () => {
    loginAsGuest('FBPlayer');
    router.replace('/(tabs)');
  };

  const handleGuest = () => {
    loginAsGuest('Alex Nova');
    router.push('/(auth)/setup' as any);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      bounces={false}
      showsVerticalScrollIndicator={false}
    >
      <NovaHeader
        title="Welcome to the table"
        subtitle=""
        showBack={true}
        onBack={() => router.back()}
      />

      <View style={styles.centerBlock}>
        <View style={styles.dieWrapper}>
          <NovaDie value={5} size={70} theme="nova" />
        </View>

        <Text style={styles.heading}>Great games start{'\n'}with good company.</Text>
        <Text style={styles.subtext}>
          Save your progress, find your friends and{'\n'}make every roll count.
        </Text>
      </View>

      <View style={styles.actions}>
        <NovaButton
          title="Continue with Apple"
          variant="white"
          onPress={handleApple}
          icon={<Ionicons name="logo-apple" size={20} color={NOVA_COLORS.textDark} />}
          style={styles.btnSpacing}
        />

        <NovaButton
          title="Continue with Google"
          variant="dark"
          onPress={handleGoogle}
          icon={<Ionicons name="logo-google" size={20} color={NOVA_COLORS.textPrimary} />}
          style={styles.btnSpacing}
        />

        <NovaButton
          title="Continue with Facebook"
          variant="facebook"
          onPress={handleFacebook}
          icon={<Ionicons name="logo-facebook" size={20} color="#ffffff" />}
          style={styles.btnSpacing}
        />

        <Text style={styles.orText}>or</Text>

        <TouchableOpacity onPress={handleGuest} activeOpacity={0.7} style={styles.guestLink}>
          <Text style={styles.guestText}>Play as a guest</Text>
        </TouchableOpacity>

        <Text style={styles.termsText}>
          By continuing, you agree to our Terms of Service{'\n'}and Privacy Policy.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: NOVA_COLORS.bg,
    justifyContent: 'space-between',
    paddingBottom: 28,
  },
  centerBlock: {
    paddingHorizontal: 24,
    alignItems: 'center',
    marginVertical: 16,
  },
  dieWrapper: {
    marginBottom: 24,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: NOVA_COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 36,
  },
  subtext: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
  actions: {
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  btnSpacing: {
    marginBottom: 12,
  },
  orText: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 13,
    marginVertical: 8,
  },
  guestLink: {
    paddingVertical: 10,
    marginBottom: 16,
  },
  guestText: {
    color: NOVA_COLORS.accentPurple,
    fontSize: 16,
    fontWeight: '700',
  },
  termsText: {
    color: NOVA_COLORS.textMuted,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
});
