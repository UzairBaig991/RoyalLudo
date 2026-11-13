import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ROYAL_COLORS } from '../../src/theme/colors';
import { RoyalButton } from '../../src/components/ui/RoyalButton';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useGameStore } from '../../src/store/useGameStore';

export default function MatchmakingScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const { startNewGame } = useGameStore();
  const [searchSeconds, setSearchSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSearchSeconds((s) => s + 1);
    }, 1000);

    // Auto-match after 3 seconds for instant responsive gameplay
    const matchTimer = setTimeout(() => {
      startNewGame({
        mode: 'classic',
        playerCount: 4,
        players: [
          { id: profile?.userId || 'p1', username: profile?.username || 'You', isBot: false },
          { id: 'usr_matched_2', username: 'QueenSophia', isBot: false },
          { id: 'usr_matched_3', username: 'AlexTheKing', isBot: false },
          { id: 'usr_matched_4', username: 'MarcusEmperor', isBot: false },
        ],
      });
      router.replace('/gameplay/ranked_arena_match');
    }, 3200);

    return () => {
      clearInterval(timer);
      clearTimeout(matchTimer);
    };
  }, [profile, router]);

  const handleCancel = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        {/* Animated Radar Circle */}
        <View style={styles.radarOuter}>
          <View style={styles.radarMiddle}>
            <View style={styles.radarInner}>
              <ActivityIndicator size="large" color={ROYAL_COLORS.gold} />
            </View>
          </View>
        </View>

        <Text style={styles.searchTitle}>SEARCHING FOR OPPONENTS...</Text>
        <Text style={styles.searchMode}>Classic Ludo • 4 Players • Gold League</Text>

        <View style={styles.timerBadge}>
          <Text style={styles.timerText}>Elapsed Time: 00:0{searchSeconds}</Text>
        </View>

        <View style={styles.playerCountPill}>
          <Text style={styles.playerCountText}>Matched: 1/4 Players Found</Text>
        </View>

        <RoyalButton
          title="CANCEL SEARCH"
          variant="secondary"
          size="medium"
          onPress={handleCancel}
          style={styles.cancelBtn}
        />
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  radarOuter: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(214, 174, 98, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(214, 174, 98, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  radarMiddle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(214, 174, 98, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(214, 174, 98, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: ROYAL_COLORS.cardBg,
    borderWidth: 2,
    borderColor: ROYAL_COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchTitle: {
    color: ROYAL_COLORS.gold,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 6,
  },
  searchMode: {
    color: ROYAL_COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 20,
  },
  timerBadge: {
    backgroundColor: ROYAL_COLORS.cardBg,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: ROYAL_COLORS.border,
    marginBottom: 12,
  },
  timerText: {
    color: ROYAL_COLORS.goldLight,
    fontSize: 12,
    fontWeight: '700',
  },
  playerCountPill: {
    marginBottom: 36,
  },
  playerCountText: {
    color: ROYAL_COLORS.textMuted,
    fontSize: 12,
  },
  cancelBtn: {
    width: 200,
  },
});
