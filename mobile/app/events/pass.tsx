import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { NOVA_COLORS } from '../../src/theme/colors';
import { NovaHeader } from '../../src/components/nova/NovaHeader';
import { NovaBadge } from '../../src/components/nova/NovaBadge';
import { NovaCard } from '../../src/components/nova/NovaCard';
import { NovaDie } from '../../src/components/nova/NovaDie';
import { NovaButton } from '../../src/components/nova/NovaButton';
import { useMissionsStore } from '../../src/store/useMissionsStore';

const TIERS_DATA = [
  { tier: '07', free: '500 coins', premium: 'Midnight dice', isCurrent: true },
  { tier: '08', free: '10 gems', premium: '1,000 coins' },
  { tier: '09', free: '100 coins', premium: 'Nova trail' },
];

export default function SeasonPassScreen() {
  const router = useRouter();
  const { seasonPassTier, seasonPassXp } = useMissionsStore();
  const [unlocked, setUnlocked] = useState(false);

  const handleUnlock = () => {
    setUnlocked(true);
    Alert.alert('Nova Pass Unlocked! 🎟️', 'Premium rewards unlocked for Season 04!');
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <NovaHeader
        title="The Nova pass"
        subtitle="Season 04  ·  Midnight magic"
        showBack={true}
        onBack={() => router.back()}
      />

      <View style={styles.content}>
        <NovaBadge label="ENDS IN  18D 6H" color="mint" style={styles.timerBadge} />

        {/* Progress Card */}
        <NovaCard variant="purple" style={styles.progressCard}>
          <View style={styles.progressTop}>
            <View style={styles.progressMeta}>
              <Text style={styles.progressMotto}>Every game gets you closer.</Text>
              <Text style={styles.tierStatus}>
                Tier {seasonPassTier} of 30  ·  {seasonPassXp} / 500 XP
              </Text>
            </View>
            <NovaDie value={6} size={48} theme="nova" />
          </View>
          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                { width: `${(seasonPassXp / 500) * 100}%` },
              ]}
            />
          </View>
        </NovaCard>

        {/* Dual Track Table */}
        <View style={styles.tableHeader}>
          <Text style={[styles.colHeader, { width: 50 }]}>TIER</Text>
          <Text style={[styles.colHeader, { flex: 1 }]}>FREE</Text>
          <Text style={[styles.colHeader, { flex: 1, color: NOVA_COLORS.accentGold }]}>
            PREMIUM
          </Text>
        </View>

        <View style={styles.tiersList}>
          {TIERS_DATA.map((t) => (
            <View
              key={t.tier}
              style={[styles.tierRow, t.isCurrent && styles.tierRowCurrent]}
            >
              <View style={styles.tierNumWrap}>
                <Text style={styles.tierNumText}>{t.tier}</Text>
              </View>

              <View style={styles.rewardCol}>
                <Ionicons name="gift-outline" size={16} color={NOVA_COLORS.textSecondary} />
                <Text style={styles.rewardText}>{t.free}</Text>
              </View>

              <View style={styles.rewardCol}>
                <Ionicons name="star" size={16} color={NOVA_COLORS.accentGold} />
                <Text style={[styles.rewardText, { color: NOVA_COLORS.accentGold, fontWeight: '700' }]}>
                  {t.premium}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <NovaButton
          title={unlocked ? 'Premium Active ✓' : 'Unlock premium  ·  Rs. 499'}
          variant="gold"
          onPress={handleUnlock}
          disabled={unlocked}
        />
        <Text style={styles.subtext}>
          Optional purchase in Rupees (Rs.)  ·  Rewards are virtual items
        </Text>
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
  timerBadge: {
    marginBottom: 14,
  },
  progressCard: {
    padding: 18,
    borderRadius: 20,
    marginBottom: 24,
  },
  progressTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  progressMeta: {
    flex: 1,
  },
  progressMotto: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  tierStatus: {
    color: NOVA_COLORS.accentPurple,
    fontSize: 13,
    fontWeight: '600',
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: NOVA_COLORS.accentPurple,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  colHeader: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: NOVA_COLORS.textSecondary,
  },
  tiersList: {
    marginBottom: 20,
  },
  tierRow: {
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tierRowCurrent: {
    borderWidth: 1.5,
    borderColor: NOVA_COLORS.accentPurple,
  },
  tierNumWrap: {
    width: 44,
  },
  tierNumText: {
    color: NOVA_COLORS.accentPurple,
    fontSize: 16,
    fontWeight: '800',
  },
  rewardCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardText: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 13,
    marginLeft: 6,
  },
  footer: {
    paddingHorizontal: 20,
    marginTop: 10,
    alignItems: 'center',
  },
  subtext: {
    color: NOVA_COLORS.textMuted,
    fontSize: 11,
    marginTop: 10,
  },
});
