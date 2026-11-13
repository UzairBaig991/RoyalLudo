import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ROYAL_COLORS } from '../../src/theme/colors';
import { RoyalCard } from '../../src/components/ui/RoyalCard';
import { RoyalButton } from '../../src/components/ui/RoyalButton';

export default function JoinRoomScreen() {
  const router = useRouter();
  const [code, setCode] = useState('');

  const handleJoin = () => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode.length < 4) {
      Alert.alert('Invalid Code', 'Please enter a valid 6-character table code (e.g. RL8391).');
      return;
    }
    router.replace(`/rooms/${cleanCode}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.title}>Join Private Table</Text>
        <Text style={styles.subtitle}>Enter the 6-character room code shared by your friend</Text>

        <RoyalCard style={styles.card} goldBorder>
          <Text style={styles.label}>TABLE CODE</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. RL9482"
            placeholderTextColor={ROYAL_COLORS.textMuted}
            autoCapitalize="characters"
            maxLength={6}
            value={code}
            onChangeText={setCode}
          />
          <RoyalButton
            title="ENTER TABLE"
            variant="gold"
            size="large"
            onPress={handleJoin}
            style={styles.joinBtn}
          />
        </RoyalCard>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ROYAL_COLORS.primaryBg,
  },
  content: {
    padding: 24,
    justifyContent: 'center',
    flex: 1,
  },
  title: {
    color: ROYAL_COLORS.gold,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 6,
  },
  subtitle: {
    color: ROYAL_COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 24,
  },
  card: {
    padding: 20,
  },
  label: {
    color: ROYAL_COLORS.goldLight,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  input: {
    backgroundColor: ROYAL_COLORS.surfaceBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ROYAL_COLORS.borderGold,
    color: ROYAL_COLORS.goldLight,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 4,
    textAlign: 'center',
    paddingVertical: 14,
    marginBottom: 20,
  },
  joinBtn: {
    width: '100%',
  },
});
