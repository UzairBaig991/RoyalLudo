import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { NOVA_COLORS } from '../../src/theme/colors';
import { NovaHeader } from '../../src/components/nova/NovaHeader';
import { NovaBadge } from '../../src/components/nova/NovaBadge';
import { NovaButton } from '../../src/components/nova/NovaButton';
import { useEconomyStore } from '../../src/store/useEconomyStore';

const TIERS = [
  {
    id: 'casual',
    name: 'Casual',
    entry: 100,
    prize: 200,
  },
  {
    id: 'popular',
    name: 'Popular',
    entry: 500,
    prize: 1000,
    isPopular: true,
  },
  {
    id: 'high_roller',
    name: 'High roller',
    entry: 2500,
    prize: 5000,
  },
];

export default function ClassicTableScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isQuick = params.quick === 'true';

  const { spendGold } = useEconomyStore();

  const [playerCount, setPlayerCount] = useState<2 | 4>(4);
  const [selectedTier, setSelectedTier] = useState('popular');

  const activeTier = TIERS.find((t) => t.id === selectedTier) || TIERS[1];

  const handleFindMatch = () => {
    spendGold(activeTier.entry);
    router.push({
      pathname: '/matchmaking',
      params: {
        mode: isQuick ? 'quick' : 'classic',
        players: playerCount,
        entry: activeTier.entry,
        prize: activeTier.prize,
      },
    } as any);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <NovaHeader
        title={isQuick ? 'Quick table' : 'Classic table'}
        subtitle="A timeless game. A fresh challenge."
        showBack={true}
        onBack={() => router.back()}
      />

      <View style={styles.content}>
        <View style={styles.badgeRow}>
          <NovaBadge
            label={isQuick ? 'QUICK PLAY' : 'CLASSIC'}
            color="purple"
          />
        </View>

        <Text style={styles.sectionHeading}>Choose your table</Text>

        {/* Players Selector */}
        <Text style={styles.subHeading}>Players</Text>
        <View style={styles.playersToggleRow}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              playerCount === 2 && styles.toggleBtnActive,
            ]}
            onPress={() => setPlayerCount(2)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.toggleBtnText,
                playerCount === 2 && styles.toggleBtnTextActive,
              ]}
            >
              2 players
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleBtn,
              playerCount === 4 && styles.toggleBtnActive,
            ]}
            onPress={() => setPlayerCount(4)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.toggleBtnText,
                playerCount === 4 && styles.toggleBtnTextActive,
              ]}
            >
              4 players
            </Text>
          </TouchableOpacity>
        </View>

        {/* Entry Coins Tiers */}
        <Text style={[styles.subHeading, { marginTop: 24 }]}>Entry coins</Text>
        <View style={styles.tiersContainer}>
          {TIERS.map((tier) => {
            const isSelected = selectedTier === tier.id;
            return (
              <TouchableOpacity
                key={tier.id}
                style={[
                  styles.tierCard,
                  isSelected && styles.tierCardActive,
                ]}
                onPress={() => setSelectedTier(tier.id)}
                activeOpacity={0.8}
              >
                <View style={styles.tierTop}>
                  <Text style={styles.tierName}>{tier.name}</Text>
                  {tier.isPopular && (
                    <NovaBadge
                      label="POPULAR"
                      color="gold"
                      style={styles.popBadge}
                    />
                  )}
                </View>

                <View style={styles.tierBottom}>
                  <View>
                    <Text style={styles.entryLabel}>Entry</Text>
                    <Text style={styles.entryVal}>{tier.entry}</Text>
                  </View>

                  <View style={styles.prizeWrap}>
                    <Text style={styles.prizeLabel}>Prize pool</Text>
                    <Text style={styles.prizeVal}>◈ {tier.prize.toLocaleString()}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.disclaimerText}>
          Virtual coins only · No cash value
        </Text>
      </View>

      <View style={styles.footer}>
        <NovaButton
          title={`Find a match  ·  ${activeTier.entry} coins`}
          variant="primary"
          onPress={handleFindMatch}
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
  badgeRow: {
    marginBottom: 12,
  },
  sectionHeading: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
  },
  subHeading: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  playersToggleRow: {
    flexDirection: 'row',
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 16,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: {
    backgroundColor: NOVA_COLORS.accentPurple,
  },
  toggleBtnText: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  toggleBtnTextActive: {
    color: NOVA_COLORS.textDark,
  },
  tiersContainer: {
    marginTop: 4,
  },
  tierCard: {
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  tierCardActive: {
    borderColor: NOVA_COLORS.accentPurple,
    backgroundColor: '#1d233d',
  },
  tierTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tierName: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  popBadge: {
    height: 22,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  tierBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryLabel: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 11,
  },
  entryVal: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  prizeWrap: {
    alignItems: 'flex-end',
  },
  prizeLabel: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 11,
  },
  prizeVal: {
    color: NOVA_COLORS.accentGold,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  disclaimerText: {
    color: NOVA_COLORS.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 10,
  },
  footer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
});
