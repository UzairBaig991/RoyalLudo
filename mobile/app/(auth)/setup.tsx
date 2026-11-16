import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { NOVA_COLORS } from '../../src/theme/colors';
import { NovaHeader } from '../../src/components/nova/NovaHeader';
import { NovaCard } from '../../src/components/nova/NovaCard';
import { NovaButton } from '../../src/components/nova/NovaButton';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useEconomyStore } from '../../src/store/useEconomyStore';

const COLOR_OPTIONS = [
  { id: 'coral', name: 'Coral', color: NOVA_COLORS.coral },
  { id: 'mint', name: 'Mint', color: NOVA_COLORS.mint },
  { id: 'blue', name: 'Blue', color: NOVA_COLORS.blue },
  { id: 'gold', name: 'Gold', color: NOVA_COLORS.gold },
];

export default function PlayerSetupScreen() {
  const router = useRouter();
  const { profile, updateProfile, loginAsGuest } = useAuthStore();
  const { addGold } = useEconomyStore();

  const [name, setName] = useState(profile?.username || 'Alex Nova');
  const [selectedColor, setSelectedColor] = useState('coral');

  const handleEnterLobby = () => {
    if (!profile) {
      loginAsGuest(name.trim() || 'Alex Nova');
    } else {
      updateProfile({ username: name.trim() || 'Alex Nova' });
    }
    // Add welcome gift 2,000 coins
    addGold(2000);
    router.replace('/(tabs)');
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      bounces={false}
      showsVerticalScrollIndicator={false}
    >
      <NovaHeader
        title="Make it yours"
        subtitle="Choose your name and a token to start."
        showBack={true}
        onBack={() => router.back()}
      />

      <View style={styles.formContainer}>
        {/* Name Input */}
        <Text style={styles.label}>YOUR PLAYER NAME</Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="person-circle-outline"
            size={24}
            color={NOVA_COLORS.textSecondary}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="Enter player name"
            placeholderTextColor={NOVA_COLORS.textMuted}
            maxLength={20}
          />
        </View>

        {/* Color Tokens Selection */}
        <Text style={[styles.label, { marginTop: 28 }]}>CHOOSE YOUR COLOR</Text>
        <View style={styles.colorsRow}>
          {COLOR_OPTIONS.map((item) => {
            const isSelected = selectedColor === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.tokenCircle,
                  { backgroundColor: item.color },
                  isSelected && styles.tokenSelected,
                ]}
                onPress={() => setSelectedColor(item.id)}
                activeOpacity={0.8}
              >
                {isSelected && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark-sharp" size={16} color="#0d101e" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Welcome Gift Card */}
        <NovaCard style={styles.giftCard}>
          <View style={styles.giftIconWrap}>
            <Ionicons name="star" size={28} color={NOVA_COLORS.accentGold} />
          </View>
          <View style={styles.giftTextWrap}>
            <Text style={styles.giftTitle}>A little welcome gift</Text>
            <Text style={styles.giftSubtitle}>2,000 coins to get you rolling.</Text>
          </View>
        </NovaCard>
      </View>

      <View style={styles.footer}>
        <NovaButton
          title="Enter the lobby"
          variant="primary"
          onPress={handleEnterLobby}
        />
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
  formContainer: {
    paddingHorizontal: 24,
    marginTop: 10,
  },
  label: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    color: NOVA_COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  colorsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  tokenCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 6,
  },
  tokenSelected: {
    borderWidth: 3,
    borderColor: '#ffffff',
    transform: [{ scale: 1.08 }],
  },
  checkBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    padding: 18,
    backgroundColor: NOVA_COLORS.surfaceBadge,
  },
  giftIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 211, 123, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  giftTextWrap: {
    flex: 1,
  },
  giftTitle: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  giftSubtitle: {
    color: NOVA_COLORS.accentGold,
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 24,
    marginTop: 20,
  },
});
