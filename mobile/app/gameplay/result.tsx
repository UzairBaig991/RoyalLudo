import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ROYAL_COLORS } from '../../src/theme/colors';
import { RoyalCard } from '../../src/components/ui/RoyalCard';
import { RoyalButton } from '../../src/components/ui/RoyalButton';
import { useGameStore } from '../../src/store/useGameStore';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function ResultScreen() {
  const router = useRouter();
  const { gameState, resetGame, startNewGame } = useGameStore();
  const { profile } = useAuthStore();

  const rankings = gameState?.rankings || [];
  const winner = rankings[0];
  const isWinner = winner && (winner.username === profile?.username || winner.username === 'You' || winner.username.includes('Player 1'));

  const handleRematch = () => {
    if (gameState) {
      startNewGame({
        mode: gameState.mode,
        playerCount: gameState.rules.playerCount,
        players: gameState.players.map((p) => ({
          id: p.id,
          username: p.username,
          isBot: p.isBot,
        })),
      });
      router.replace('/gameplay/rematch');
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleLobby = () => {
    resetGame();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Victory Crown Emblem */}
        <View style={styles.header}>
          <View style={styles.crownCircle}>
            <Text style={{ fontSize: 52 }}>{isWinner ? '👑' : '🏁'}</Text>
          </View>
          <Text style={styles.victoryTitle}>
            {isWinner ? 'ROYAL VICTORY!' : 'MATCH CONCLUDED'}
          </Text>
          <Text style={styles.victorySubtitle}>
            {isWinner
              ? 'Congratulations, your majesty! You dominated the board.'
              : 'Valiant effort in the grand arena.'}
          </Text>
        </View>

        {/* Reward Card */}
        {isWinner && (
          <RoyalCard style={styles.rewardCard} goldBorder>
            <Text style={styles.rewardHeader}>REWARDS CLAIMED</Text>
            <View style={styles.rewardRow}>
              <View style={styles.rewardPill}>
                <Text style={{ fontSize: 24 }}>🪙</Text>
                <Text style={styles.rewardText}>+1,800 Gold</Text>
              </View>
              <View style={styles.rewardPill}>
                <Text style={{ fontSize: 24 }}>⭐</Text>
                <Text style={styles.rewardText}>+250 XP</Text>
              </View>
              <View style={styles.rewardPill}>
                <Text style={{ fontSize: 24 }}>🏆</Text>
                <Text style={styles.rewardText}>+45 Trophies</Text>
              </View>
            </View>
          </RoyalCard>
        )}

        {/* Final Standings Podium List */}
        <Text style={styles.sectionTitle}>FINAL STANDINGS</Text>
        <RoyalCard style={styles.standingsCard}>
          {rankings.map((rankItem, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🎖️';
            return (
              <View key={rankItem.seatIndex} style={styles.standingRow}>
                <Text style={styles.medalText}>{medal}</Text>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.standingName}>
                    {rankItem.username} ({rankItem.color})
                  </Text>
                  <Text style={styles.standingRank}>Rank #{rankItem.rank}</Text>
                </View>
                <Text style={styles.standingPoints}>
                  {index === 0 ? '+1,800 🪙' : index === 1 ? '+400 🪙' : '0 🪙'}
                </Text>
              </View>
            );
          })}
        </RoyalCard>

        {/* Actions */}
        <View style={styles.actionRow}>
          <RoyalButton
            title="REMATCH"
            variant="gold"
            size="large"
            onPress={handleRematch}
            style={{ marginBottom: 12 }}
          />
          <RoyalButton
            title="RETURN TO LOBBY"
            variant="secondary"
            size="medium"
            onPress={handleLobby}
          />
        </View>
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
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  crownCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: ROYAL_COLORS.cardBg,
    borderWidth: 2,
    borderColor: ROYAL_COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  victoryTitle: {
    color: ROYAL_COLORS.gold,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },
  victorySubtitle: {
    color: ROYAL_COLORS.textSecondary,
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },
  rewardCard: {
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  rewardHeader: {
    color: ROYAL_COLORS.goldLight,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 12,
  },
  rewardRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  rewardPill: {
    alignItems: 'center',
  },
  rewardText: {
    color: ROYAL_COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
  },
  sectionTitle: {
    alignSelf: 'flex-start',
    color: ROYAL_COLORS.goldLight,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
  },
  standingsCard: {
    width: '100%',
    marginBottom: 28,
  },
  standingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: ROYAL_COLORS.border,
  },
  medalText: {
    fontSize: 24,
  },
  standingName: {
    color: ROYAL_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  standingRank: {
    color: ROYAL_COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  standingPoints: {
    color: ROYAL_COLORS.gold,
    fontSize: 14,
    fontWeight: '800',
  },
  actionRow: {
    width: '100%',
  },
});
