import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { NOVA_COLORS } from '../../src/theme/colors';
import { NovaHeader } from '../../src/components/nova/NovaHeader';
import { NovaBadge } from '../../src/components/nova/NovaBadge';
import { NovaButton } from '../../src/components/nova/NovaButton';
import { useEconomyStore } from '../../src/store/useEconomyStore';
import { soundEffects } from '../../src/utils/soundEffects';

interface ScratchTile {
  id: number;
  revealed: boolean;
  type: 'coin' | 'gem';
  amount: number;
  label: string;
}

const INITIAL_TILES: ScratchTile[] = [
  { id: 1, revealed: false, type: 'coin', amount: 500, label: '500 🪙' },
  { id: 2, revealed: false, type: 'gem', amount: 10, label: '10 💎' },
  { id: 3, revealed: false, type: 'coin', amount: 1000, label: '1,000 🪙' },
  { id: 4, revealed: false, type: 'coin', amount: 500, label: '500 🪙' },
  { id: 5, revealed: false, type: 'gem', amount: 10, label: '10 💎' },
  { id: 6, revealed: false, type: 'coin', amount: 500, label: '500 🪙' },
];

export default function ScratchAndWinScreen() {
  const router = useRouter();
  const { addGold, addGems } = useEconomyStore();

  const [tiles, setTiles] = useState<ScratchTile[]>(INITIAL_TILES);
  const [claimed, setClaimed] = useState<boolean>(false);
  const [cardCompleted, setCardCompleted] = useState<boolean>(false);

  const revealedCount = tiles.filter((t) => t.revealed).length;

  const handleScratchTile = (id: number) => {
    if (claimed) return;
    const tile = tiles.find((t) => t.id === id);
    if (!tile || tile.revealed) return;

    soundEffects.playSafeStar();

    const updated = tiles.map((t) => (t.id === id ? { ...t, revealed: true } : t));
    setTiles(updated);

    const newlyRevealedCount = updated.filter((t) => t.revealed).length;
    if (newlyRevealedCount === 6) {
      soundEffects.playVictory();
      setCardCompleted(true);
    }
  };

  const handleScratchAll = () => {
    if (claimed || cardCompleted) return;
    soundEffects.playSafeStar();
    const allRevealed = tiles.map((t) => ({ ...t, revealed: true }));
    setTiles(allRevealed);
    setCardCompleted(true);
    soundEffects.playVictory();
  };

  const handleClaim = () => {
    if (claimed) return;

    // Calculate prizes: 3 matching 500 coins -> 1500 bonus + all values
    let totalCoins = 0;
    let totalGems = 0;

    tiles.forEach((t) => {
      if (t.type === 'coin') totalCoins += t.amount;
      if (t.type === 'gem') totalGems += t.amount;
    });

    // Jackpot bonus: 3 matching 500s gets +1,000 jackpot!
    totalCoins += 1000;

    addGold(totalCoins);
    addGems(totalGems);
    setClaimed(true);

    soundEffects.playVictory();
    Alert.alert(
      '🎉 JACKPOT CLAIMED!',
      `You scratched 3 Matching 500 Coins!\n\nWon:\n+${totalCoins.toLocaleString()} Coins 🪙\n+${totalGems} Gems 💎`,
      [{ text: 'Awesome!', onPress: () => router.back() }]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <NovaHeader
        title="Scratch & Win"
        subtitle="Uncover 3 matching symbols to win the jackpot!"
        showBack={true}
        onBack={() => router.back()}
      />

      <View style={styles.content}>
        <View style={styles.badgeRow}>
          <NovaBadge label="DAILY FREE CARD" color="gold" />
          <NovaBadge label="MATCH 3 TO WIN" color="purple" />
        </View>

        {/* Scratch Card Frame */}
        <View style={styles.cardFrame}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>ROYAL LUCKY FOIL</Text>
              <Text style={styles.cardSubtitle}>Tap foils to reveal prizes</Text>
            </View>
            <Ionicons name="sparkles" size={24} color={NOVA_COLORS.accentGold} />
          </View>

          {/* 3x2 Grid */}
          <View style={styles.grid}>
            {tiles.map((tile) => (
              <TouchableOpacity
                key={tile.id}
                style={[
                  styles.tile,
                  tile.revealed ? styles.tileRevealed : styles.tileConcealed,
                ]}
                activeOpacity={0.7}
                onPress={() => handleScratchTile(tile.id)}
              >
                {tile.revealed ? (
                  <View style={styles.revealedContent}>
                    <Text style={styles.revealedEmoji}>
                      {tile.type === 'coin' ? '🪙' : '💎'}
                    </Text>
                    <Text style={styles.revealedText}>{tile.label}</Text>
                  </View>
                ) : (
                  <View style={styles.concealedContent}>
                    <Ionicons name="gift-outline" size={22} color={NOVA_COLORS.accentGold} />
                    <Text style={styles.scratchHint}>SCRATCH</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Progress bar */}
          <View style={styles.progressWrap}>
            <Text style={styles.progressLabel}>
              Revealed: {revealedCount} / 6
            </Text>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${(revealedCount / 6) * 100}%` },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.actions}>
          {!cardCompleted && (
            <NovaButton
              title="Reveal All Foils"
              variant="dark"
              onPress={handleScratchAll}
              style={styles.actionBtn}
            />
          )}

          {cardCompleted && !claimed && (
            <NovaButton
              title="Claim Rewards ✨"
              variant="gold"
              onPress={handleClaim}
              style={styles.actionBtn}
            />
          )}

          {claimed && (
            <NovaButton
              title="Return to Lobby"
              variant="primary"
              onPress={() => router.replace('/(tabs)')}
              style={styles.actionBtn}
            />
          )}
        </View>
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
    paddingBottom: 40,
  },
  content: {
    marginTop: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  cardFrame: {
    backgroundColor: '#191e33',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#30254e',
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#30254e',
    paddingBottom: 12,
  },
  cardTitle: {
    color: NOVA_COLORS.accentGold,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  cardSubtitle: {
    color: NOVA_COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  tile: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileConcealed: {
    backgroundColor: '#30254e',
    borderWidth: 2,
    borderColor: NOVA_COLORS.accentPurple,
    borderStyle: 'dashed',
  },
  tileRevealed: {
    backgroundColor: '#0d101e',
    borderWidth: 2,
    borderColor: NOVA_COLORS.accentGold,
  },
  concealedContent: {
    alignItems: 'center',
    gap: 4,
  },
  scratchHint: {
    color: NOVA_COLORS.accentGold,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  revealedContent: {
    alignItems: 'center',
    gap: 4,
  },
  revealedEmoji: {
    fontSize: 22,
  },
  revealedText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  progressWrap: {
    marginTop: 18,
  },
  progressLabel: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#0d101e',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: NOVA_COLORS.accentGold,
    borderRadius: 4,
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
  actionBtn: {
    width: '100%',
  },
});
