import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { NOVA_COLORS } from '../../src/theme/colors';
import { NovaHeader } from '../../src/components/nova/NovaHeader';
import { NovaDie } from '../../src/components/nova/NovaDie';
import { NovaButton } from '../../src/components/nova/NovaButton';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, loginAsGuest } = useAuthStore();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleCustomSignIn = () => {
    if (!usernameOrEmail.trim()) {
      Alert.alert('Sign In', 'Please enter your username or email address.');
      return;
    }
    signIn(usernameOrEmail.trim());
    router.replace('/(tabs)');
  };

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
    loginAsGuest('Player');
    router.push('/(auth)/setup' as any);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      bounces={false}
      showsVerticalScrollIndicator={false}
    >
      <NovaHeader
        title="Sign In to Royal Ludo"
        subtitle="Access your profile, rank, and rewards"
        showBack={true}
        onBack={() => router.back()}
      />

      <View style={styles.centerBlock}>
        <View style={styles.dieWrapper}>
          <NovaDie value={6} size={64} theme="nova" />
        </View>

        <Text style={styles.heading}>Welcome Back!</Text>
        <Text style={styles.subtext}>
          Sign in to keep your coins, statistics, and unlocked dice skins.
        </Text>
      </View>

      {/* Direct Sign-In Credentials Form */}
      <View style={styles.formSection}>
        <Text style={styles.fieldLabel}>PLAYER USERNAME OR EMAIL</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="person-outline" size={18} color={NOVA_COLORS.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Uzair or player@ludo.com"
            placeholderTextColor={NOVA_COLORS.textMuted}
            value={usernameOrEmail}
            onChangeText={setUsernameOrEmail}
            autoCapitalize="none"
          />
        </View>

        <Text style={[styles.fieldLabel, { marginTop: 14 }]}>PASSWORD</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="lock-closed-outline" size={18} color={NOVA_COLORS.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="Enter your password"
            placeholderTextColor={NOVA_COLORS.textMuted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <NovaButton
          title="Sign In with Account"
          variant="primary"
          onPress={handleCustomSignIn}
          style={styles.signInBtn}
        />

        <TouchableOpacity
          onPress={() => router.push('/(auth)/register' as any)}
          style={styles.createAccountLink}
          activeOpacity={0.7}
        >
          <Text style={styles.createAccountText}>
            New here? <Text style={styles.createAccountHighlight}>Create an Account</Text>
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.orText}>or continue with</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.actions}>
        <NovaButton
          title="Continue with Google"
          variant="dark"
          onPress={handleGoogle}
          icon={<Ionicons name="logo-google" size={18} color={NOVA_COLORS.textPrimary} />}
          style={styles.btnSpacing}
        />

        <NovaButton
          title="Continue with Apple"
          variant="white"
          onPress={handleApple}
          icon={<Ionicons name="logo-apple" size={18} color={NOVA_COLORS.textDark} />}
          style={styles.btnSpacing}
        />

        <TouchableOpacity onPress={handleGuest} activeOpacity={0.7} style={styles.guestLink}>
          <Text style={styles.guestText}>⚡ Play as a guest</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: NOVA_COLORS.bg,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  centerBlock: {
    alignItems: 'center',
    marginVertical: 14,
  },
  dieWrapper: {
    marginBottom: 12,
  },
  heading: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtext: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 290,
  },
  formSection: {
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222943',
    marginVertical: 12,
  },
  fieldLabel: {
    color: NOVA_COLORS.accentGold,
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d101e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#30254e',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    height: 44,
    color: NOVA_COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  signInBtn: {
    marginTop: 16,
  },
  createAccountLink: {
    alignItems: 'center',
    marginTop: 12,
  },
  createAccountText: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 13,
  },
  createAccountHighlight: {
    color: NOVA_COLORS.accentGold,
    fontWeight: '800',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#222943',
  },
  orText: {
    color: NOVA_COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    gap: 8,
  },
  btnSpacing: {
    marginBottom: 4,
  },
  guestLink: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 4,
  },
  guestText: {
    color: NOVA_COLORS.accentPurple,
    fontSize: 14,
    fontWeight: '700',
  },
});
