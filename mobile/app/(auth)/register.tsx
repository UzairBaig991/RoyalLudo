import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ROYAL_COLORS } from '../../src/theme/colors';
import { RoyalButton } from '../../src/components/ui/RoyalButton';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function RegisterScreen() {
  const router = useRouter();
  const { loginAsGuest } = useAuthStore();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Required', 'Please complete all fields.');
      return;
    }
    loginAsGuest(username.trim());
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Create Royal Account</Text>
      <Text style={styles.headerSubtitle}>Join the grand arena, win tournaments and unlock legendary dice.</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>PLAYER USERNAME</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. KingArthur"
          placeholderTextColor={ROYAL_COLORS.textMuted}
          value={username}
          onChangeText={setUsername}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>EMAIL ADDRESS</Text>
        <TextInput
          style={styles.input}
          placeholder="player@royalludo.com"
          placeholderTextColor={ROYAL_COLORS.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>PASSWORD</Text>
        <TextInput
          style={styles.input}
          placeholder="At least 6 characters"
          placeholderTextColor={ROYAL_COLORS.textMuted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <RoyalButton
        title="CREATE ACCOUNT"
        variant="gold"
        size="large"
        onPress={handleRegister}
        style={styles.submitBtn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ROYAL_COLORS.primaryBg,
    padding: 24,
    justifyContent: 'center',
  },
  headerTitle: {
    color: ROYAL_COLORS.textPrimary,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 6,
  },
  headerSubtitle: {
    color: ROYAL_COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 28,
    lineHeight: 20,
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    color: ROYAL_COLORS.goldLight,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    backgroundColor: ROYAL_COLORS.cardBg,
    borderWidth: 1,
    borderColor: ROYAL_COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: ROYAL_COLORS.textPrimary,
    fontSize: 15,
  },
  submitBtn: {
    marginTop: 12,
  },
});
