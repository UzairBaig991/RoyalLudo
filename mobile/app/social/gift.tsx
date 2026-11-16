import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { NOVA_COLORS } from '../../src/theme/colors';
import { NovaHeader } from '../../src/components/nova/NovaHeader';
import { NovaButton } from '../../src/components/nova/NovaButton';
import { useEconomyStore } from '../../src/store/useEconomyStore';

const GIFT_PACKS = [
  { id: 'luck', title: 'Good luck', coins: 50, icon: 'star' },
  { id: 'cheers', title: 'Big cheers', coins: 100, icon: 'gift' },
  { id: 'spirit', title: 'Team spirit', coins: 150, icon: 'heart' },
];

export default function SendGiftScreen() {
  const router = useRouter();
  const { gold, debitGold } = useEconomyStore();

  const [selectedPack, setSelectedPack] = useState('luck');
  const [note, setNote] = useState('Here’s to our next win!');

  const activePack = GIFT_PACKS.find((p) => p.id === selectedPack) || GIFT_PACKS[0];

  const handleSend = () => {
    if (gold < activePack.coins) {
      Alert.alert('Insufficient Coins', 'You do not have enough coins for this gift.');
      return;
    }
    debitGold(activePack.coins);
    Alert.alert('Gift Dispatched! 🎁', `Sent "${activePack.title}" (${activePack.coins} coins) to Maya!`, [
      { text: 'Done', onPress: () => router.back() },
    ]);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <NovaHeader
        title="Send a little joy"
        subtitle="Small gestures. Good company."
        showBack={true}
        onBack={() => router.back()}
      />

      <View style={styles.content}>
        {/* Recipient Card */}
        <View style={styles.recipientCard}>
          <View style={[styles.avatarCircle, { backgroundColor: NOVA_COLORS.coral }]}>
            <View style={styles.avatarInner} />
          </View>
          <View style={styles.recipientMeta}>
            <Text style={styles.toLabel}>TO MAYA</Text>
            <Text style={styles.recipientName}>Make their day.</Text>
          </View>
        </View>

        {/* Pick Your Gift */}
        <Text style={styles.sectionHeading}>Pick your gift</Text>
        <View style={styles.packsRow}>
          {GIFT_PACKS.map((pack) => {
            const isSelected = selectedPack === pack.id;
            return (
              <TouchableOpacity
                key={pack.id}
                style={[
                  styles.packCard,
                  isSelected && styles.packCardActive,
                ]}
                onPress={() => setSelectedPack(pack.id)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.packIconWrap,
                    isSelected && { backgroundColor: NOVA_COLORS.accentPurple },
                  ]}
                >
                  <Ionicons
                    name={pack.icon as any}
                    size={22}
                    color={isSelected ? '#0d101e' : NOVA_COLORS.accentGold}
                  />
                </View>
                <Text style={styles.packTitle}>{pack.title}</Text>
                <Text style={styles.packCost}>◈ {pack.coins}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Add a Note */}
        <Text style={[styles.sectionHeading, { marginTop: 24 }]}>ADD A NOTE</Text>
        <View style={styles.noteBox}>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="Type a friendly message…"
            placeholderTextColor={NOVA_COLORS.textMuted}
            maxLength={80}
            multiline
          />
          <Text style={styles.charCount}>{note.length} / 80</Text>
        </View>

        <Text style={styles.balanceText}>
          Your balance: {gold.toLocaleString()} coins
        </Text>
      </View>

      <View style={styles.footer}>
        <NovaButton
          title={`Send gift  ·  ${activePack.coins} coins`}
          variant="primary"
          onPress={handleSend}
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
  content: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  recipientCard: {
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarInner: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ffffff',
  },
  recipientMeta: {
    flex: 1,
  },
  toLabel: {
    color: NOVA_COLORS.accentPurple,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  recipientName: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  sectionHeading: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  packsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  packCard: {
    width: '31%',
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  packCardActive: {
    borderColor: NOVA_COLORS.accentPurple,
    backgroundColor: '#1d233d',
  },
  packIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 211, 123, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  packTitle: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  packCost: {
    color: NOVA_COLORS.accentGold,
    fontSize: 13,
    fontWeight: '800',
  },
  noteBox: {
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 18,
    padding: 16,
    minHeight: 100,
    justifyContent: 'space-between',
  },
  noteInput: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 15,
    lineHeight: 20,
    padding: 0,
  },
  charCount: {
    color: NOVA_COLORS.textMuted,
    fontSize: 11,
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  balanceText: {
    color: NOVA_COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 18,
  },
  footer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
});
