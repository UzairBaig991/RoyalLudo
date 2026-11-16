import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { NOVA_COLORS } from '../../src/theme/colors';
import { NovaHeader } from '../../src/components/nova/NovaHeader';
import { NovaBadge } from '../../src/components/nova/NovaBadge';
import { NovaCard } from '../../src/components/nova/NovaCard';
import { NovaButton } from '../../src/components/nova/NovaButton';
import { useEconomyStore } from '../../src/store/useEconomyStore';
import { useMissionsStore } from '../../src/store/useMissionsStore';

const STREAK_DAYS = [
  { day: 1, coins: 100, claimed: true },
  { day: 2, coins: 200, claimed: true },
  { day: 3, coins: 300, claimed: true },
  { day: 4, coins: 400, claimed: true },
  { day: 5, coins: 500, active: true },
  { day: 6, coins: 750, upcoming: true },
];

export default function DailyRewardsScreen() {
  const router = useRouter();
  const { addGold } = useEconomyStore();
  const { streakClaimedToday, claimDailyStreak } = useMissionsStore();

  const handleClaim = () => {
    const coins = claimDailyStreak();
    if (coins > 0) {
      addGold(coins);
      Alert.alert('Coins Claimed! ✨', `+${coins} coins added to your balance.`);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <NovaHeader
        title="A little thank-you"
        subtitle="Your daily moment of good fortune."
        showBack={true}
        onBack={() => router.back()}
      />

      <View style={styles.content}>
        <NovaBadge label="5-DAY STREAK" color="gold" style={styles.streakBadge} />

        <Text style={styles.bannerHeading}>Keep a good thing rolling.</Text>

        {/* 6-Day Streak Grid */}
        <View style={styles.grid}>
          {STREAK_DAYS.map((d) => (
            <View
              key={d.day}
              style={[
                styles.dayCard,
                d.active && !streakClaimedToday && styles.dayCardActive,
                d.claimed && styles.dayCardClaimed,
              ]}
            >
              <Text style={styles.dayNum}>DAY {d.day}</Text>
              <View style={styles.coinIconWrap}>
                <Ionicons name="sparkles" size={20} color={NOVA_COLORS.accentGold} />
              </View>
              <Text style={styles.coinAmount}>{d.coins}</Text>

              {d.claimed && (
                <View style={styles.checkWrap}>
                  <Ionicons name="checkmark" size={14} color="#0d101e" />
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Day 7 Surprise Card */}
        <NovaCard variant="purple" style={styles.surpriseCard}>
          <View style={styles.giftIconWrap}>
            <Ionicons name="gift" size={26} color={NOVA_COLORS.accentGold} />
          </View>
          <View style={styles.surpriseInfo}>
            <Text style={styles.surpriseTitle}>Day 7  ·  A surprise awaits</Text>
            <Text style={styles.surpriseDesc}>
              Come back tomorrow to keep your streak.
            </Text>
          </View>
        </NovaCard>

        {/* Scratch & Win Banner */}
        <TouchableOpacity
          style={styles.scratchBanner}
          activeOpacity={0.8}
          onPress={() => router.push('/rewards/scratch' as any)}
        >
          <View style={styles.scratchBannerIcon}>
            <Ionicons name="sparkles" size={24} color={NOVA_COLORS.accentGold} />
          </View>
          <View style={styles.scratchBannerMeta}>
            <Text style={styles.scratchBannerTitle}>Daily Scratch & Win ✨</Text>
            <Text style={styles.scratchBannerDesc}>
              Scratch foils to win up to 2,500 coins & gems!
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={NOVA_COLORS.accentPurple} />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <NovaButton
          title={streakClaimedToday ? 'Claimed Today ✓' : 'Claim 500 coins'}
          variant={streakClaimedToday ? 'dark' : 'primary'}
          onPress={handleClaim}
          disabled={streakClaimedToday}
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
  streakBadge: {
    marginBottom: 12,
  },
  bannerHeading: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dayCard: {
    width: '31%',
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
    position: 'relative',
  },
  dayCardActive: {
    borderColor: NOVA_COLORS.accentGold,
    backgroundColor: '#1d233d',
  },
  dayCardClaimed: {
    opacity: 0.65,
  },
  dayNum: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  coinIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 211, 123, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  coinAmount: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  checkWrap: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: NOVA_COLORS.accentMint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  surpriseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
  },
  giftIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 211, 123, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  surpriseInfo: {
    flex: 1,
  },
  surpriseTitle: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  surpriseDesc: {
    color: NOVA_COLORS.accentGold,
    fontSize: 12,
  },
  scratchBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#191e33',
    borderWidth: 1.5,
    borderColor: NOVA_COLORS.accentPurple,
    borderRadius: 20,
    padding: 16,
    marginTop: 14,
  },
  scratchBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 211, 123, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  scratchBannerMeta: {
    flex: 1,
  },
  scratchBannerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  scratchBannerDesc: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 12,
  },
  footer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
});
