import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { NOVA_COLORS } from '../../src/theme/colors';
import { NovaHeader } from '../../src/components/nova/NovaHeader';
import { NovaBadge } from '../../src/components/nova/NovaBadge';
import { NovaCard } from '../../src/components/nova/NovaCard';
import { NovaButton } from '../../src/components/nova/NovaButton';
import { useEconomyStore } from '../../src/store/useEconomyStore';

export default function MatchResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const won = params.won !== 'false';
  const coins = params.coins || '2,000';

  const { spendGold } = useEconomyStore();

  const handlePlayAgain = () => {
    spendGold(500);
    router.replace('/matchmaking');
  };

  const handleBackToLobby = () => {
    router.replace('/(tabs)');
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <NovaHeader
        title="A very good game"
        subtitle=""
        showBack={true}
        onBack={handleBackToLobby}
      />

      <View style={styles.content}>
        <NovaBadge
          label="CLASSIC · 4 PLAYERS"
          color="purple"
          style={styles.badge}
        />

        {/* Victory Center Card */}
        <NovaCard variant="purple" style={styles.victoryCard}>
          <View style={styles.trophyWrapper}>
            <Ionicons
              name={won ? 'trophy' : 'ribbon'}
              size={54}
              color={NOVA_COLORS.accentGold}
            />
          </View>
          <Text style={styles.victoryTitle}>
            {won ? 'Your table. Your victory.' : 'Well played at the table.'}
          </Text>
          <Text style={styles.victorySubtitle}>
            {won ? '1st place  ·  All 4 tokens home' : '2nd place  ·  3 tokens home'}
          </Text>
        </NovaCard>

        {/* Rewards Row */}
        <View style={styles.rewardsRow}>
          <View style={styles.rewardCard}>
            <Text style={styles.rewardValue}>+{coins}</Text>
            <Text style={styles.rewardLabel}>Coins won</Text>
          </View>

          <View style={styles.rewardCard}>
            <Text style={styles.rewardValue}>+120 XP</Text>
            <Text style={styles.rewardLabel}>Level 12 → 13</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <NovaButton
          title="Play again  ·  500 coins"
          variant="primary"
          onPress={handlePlayAgain}
          style={styles.playAgainBtn}
        />

        <NovaButton
          title="Back to lobby"
          variant="dark"
          onPress={handleBackToLobby}
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
    alignItems: 'center',
    marginTop: 10,
  },
  badge: {
    marginBottom: 20,
  },
  victoryCard: {
    width: '100%',
    alignItems: 'center',
    padding: 24,
    borderRadius: 24,
    marginBottom: 20,
  },
  trophyWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255, 211, 123, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  victoryTitle: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  victorySubtitle: {
    color: NOVA_COLORS.accentPurple,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  rewardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  rewardCard: {
    width: '48%',
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
  },
  rewardValue: {
    color: NOVA_COLORS.accentGold,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  rewardLabel: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 12,
  },
  footer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  playAgainBtn: {
    marginBottom: 12,
  },
});
