import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ROYAL_COLORS } from '../../src/theme/colors';
import { RoyalCard } from '../../src/components/ui/RoyalCard';
import { RoyalButton } from '../../src/components/ui/RoyalButton';
import { useAuthStore } from '../../src/store/useAuthStore';
import type { GameMode } from '../../../shared/src/types';

export default function CreateRoomScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic');
  const [playerCount, setPlayerCount] = useState<2 | 4>(4);
  const [entryFee, setEntryFee] = useState<number>(500);

  const stakes = [500, 1000, 2500, 5000, 10000];

  const handleCreate = () => {
    // Generate a random 6-digit royal room code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'RL';
    for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));

    router.replace(`/rooms/${code}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.screenTitle}>Create Private Table</Text>
        <Text style={styles.screenSub}>Set up custom rules, entry stakes and invite friends via table code</Text>

        {/* 1. Mode Selector */}
        <Text style={styles.sectionLabel}>GAME VARIATION</Text>
        <View style={styles.modesRow}>
          {[
            { id: 'classic', name: 'Classic', icon: '🏆' },
            { id: 'master', name: 'Master', icon: '🛡️' },
            { id: 'quick', name: 'Quick', icon: '⚡' },
          ].map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[styles.modePill, selectedMode === m.id && styles.modePillActive]}
              onPress={() => setSelectedMode(m.id as GameMode)}
            >
              <Text style={{ fontSize: 18, marginRight: 6 }}>{m.icon}</Text>
              <Text style={[styles.modePillText, selectedMode === m.id && styles.modePillTextActive]}>
                {m.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 2. Player Count */}
        <Text style={styles.sectionLabel}>PLAYERS</Text>
        <View style={styles.countRow}>
          <TouchableOpacity
            style={[styles.countPill, playerCount === 2 && styles.countPillActive]}
            onPress={() => setPlayerCount(2)}
          >
            <Text style={[styles.countText, playerCount === 2 && styles.countTextActive]}>
              2 Players (1v1 Duel)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.countPill, playerCount === 4 && styles.countPillActive]}
            onPress={() => setPlayerCount(4)}
          >
            <Text style={[styles.countText, playerCount === 4 && styles.countTextActive]}>
              4 Players (Classic)
            </Text>
          </TouchableOpacity>
        </View>

        {/* 3. Entry Stake */}
        <Text style={styles.sectionLabel}>ENTRY STAKE (GOLD COINS)</Text>
        <View style={styles.stakesGrid}>
          {stakes.map((stake) => (
            <TouchableOpacity
              key={stake}
              style={[styles.stakeCard, entryFee === stake && styles.stakeCardActive]}
              onPress={() => setEntryFee(stake)}
            >
              <Text style={styles.stakeAmount}>{stake.toLocaleString()} 🪙</Text>
              <Text style={styles.prizeLabel}>
                Prize: {Math.floor(stake * playerCount * 0.9).toLocaleString()} 🪙
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Card */}
        <RoyalCard style={styles.summaryCard} goldBorder>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>Host</Text>
            <Text style={styles.summaryVal}>{profile?.username || 'You'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>Mode</Text>
            <Text style={styles.summaryVal}>{selectedMode.toUpperCase()} ({playerCount}P)</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>Prize Pool</Text>
            <Text style={[styles.summaryVal, { color: ROYAL_COLORS.gold }]}>
              {Math.floor(entryFee * playerCount * 0.9).toLocaleString()} Gold 🪙
            </Text>
          </View>
        </RoyalCard>

        <RoyalButton
          title="GENERATE TABLE"
          variant="gold"
          size="large"
          onPress={handleCreate}
          style={styles.createBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ROYAL_COLORS.primaryBg,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  screenTitle: {
    color: ROYAL_COLORS.gold,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 4,
  },
  screenSub: {
    color: ROYAL_COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 20,
  },
  sectionLabel: {
    color: ROYAL_COLORS.goldLight,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 8,
  },
  modesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ROYAL_COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ROYAL_COLORS.border,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  modePillActive: {
    borderColor: ROYAL_COLORS.gold,
    backgroundColor: ROYAL_COLORS.surfaceBg,
  },
  modePillText: {
    color: ROYAL_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  modePillTextActive: {
    color: ROYAL_COLORS.gold,
    fontWeight: '800',
  },
  countRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  countPill: {
    flex: 1,
    backgroundColor: ROYAL_COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ROYAL_COLORS.border,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  countPillActive: {
    borderColor: ROYAL_COLORS.gold,
    backgroundColor: ROYAL_COLORS.surfaceBg,
  },
  countText: {
    color: ROYAL_COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  countTextActive: {
    color: ROYAL_COLORS.gold,
    fontWeight: '800',
  },
  stakesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  stakeCard: {
    width: '48%',
    backgroundColor: ROYAL_COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ROYAL_COLORS.border,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  stakeCardActive: {
    borderColor: ROYAL_COLORS.gold,
    backgroundColor: ROYAL_COLORS.surfaceBg,
  },
  stakeAmount: {
    color: ROYAL_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  prizeLabel: {
    color: ROYAL_COLORS.gold,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  summaryCard: {
    marginBottom: 20,
    padding: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryKey: {
    color: ROYAL_COLORS.textSecondary,
    fontSize: 13,
  },
  summaryVal: {
    color: ROYAL_COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  createBtn: {
    width: '100%',
  },
});
