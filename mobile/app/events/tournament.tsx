import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { NOVA_COLORS } from '../../src/theme/colors';
import { NovaHeader } from '../../src/components/nova/NovaHeader';
import { NovaBadge } from '../../src/components/nova/NovaBadge';
import { NovaCard } from '../../src/components/nova/NovaCard';
import { NovaButton } from '../../src/components/nova/NovaButton';
import { useEconomyStore } from '../../src/store/useEconomyStore';

const BRACKET_STEPS = [
  { step: '01', title: 'Qualifiers', desc: '16 players → 8' },
  { step: '02', title: 'Semifinal', desc: '8 players → 4' },
  { step: '03', title: 'The final table', desc: '4 players · 1 champion' },
];

export default function TournamentScreen() {
  const router = useRouter();
  const { gold, debitGold } = useEconomyStore();
  const [reserved, setReserved] = useState(false);

  const handleReserve = () => {
    if (gold < 1000) {
      Alert.alert('Need 1,000 Coins', 'You do not have enough coins to enter this tournament.');
      return;
    }
    debitGold(1000);
    setReserved(true);
    Alert.alert('Seat Reserved! 🏆', 'You are entered into the Evening Cup. Round 1 starts in 24 min!');
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <NovaHeader
        title="Evening Cup"
        subtitle="Make your next match a little more epic."
        showBack={true}
        onBack={() => router.back()}
      />

      <View style={styles.content}>
        {/* Prize Pool Hero Card */}
        <NovaCard variant="purple" style={styles.poolCard}>
          <View style={styles.trophyWrap}>
            <Ionicons name="trophy" size={32} color={NOVA_COLORS.accentGold} />
          </View>
          <Text style={styles.poolAmount}>25,000</Text>
          <Text style={styles.poolLabel}>COIN PRIZE POOL</Text>
          <Text style={styles.poolMeta}>16 players  ·  Classic  ·  3 rounds</Text>

          <NovaBadge
            label="STARTS IN  24:16"
            color="mint"
            style={styles.timerBadge}
          />
        </NovaCard>

        {/* Path to Podium */}
        <Text style={styles.sectionHeading}>Your path to the podium</Text>

        <View style={styles.bracketList}>
          {BRACKET_STEPS.map((item, index) => (
            <View key={item.step} style={styles.bracketStep}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumberText}>{item.step}</Text>
              </View>

              <View style={styles.stepInfo}>
                <Text style={styles.stepTitle}>{item.title}</Text>
                <Text style={styles.stepDesc}>{item.desc}</Text>
              </View>

              {index < 2 && <Ionicons name="chevron-forward" size={18} color={NOVA_COLORS.textMuted} />}
            </View>
          ))}
        </View>

        <Text style={styles.spotsInfo}>
          Entry 1,000 coins  ·  {reserved ? '13' : '12'} / 16 spots filled
        </Text>
      </View>

      <View style={styles.footer}>
        <NovaButton
          title={reserved ? 'Seat Reserved ✓' : 'Reserve my seat'}
          variant={reserved ? 'dark' : 'primary'}
          onPress={handleReserve}
          disabled={reserved}
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
  poolCard: {
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  trophyWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 211, 123, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  poolAmount: {
    color: NOVA_COLORS.accentGold,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
  },
  poolLabel: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 2,
    marginBottom: 4,
  },
  poolMeta: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 14,
  },
  timerBadge: {
    height: 28,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  sectionHeading: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 14,
  },
  bracketList: {
    marginBottom: 16,
  },
  bracketStep: {
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepNumberBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: NOVA_COLORS.surfaceBadge,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  stepNumberText: {
    color: NOVA_COLORS.accentPurple,
    fontSize: 14,
    fontWeight: '800',
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  stepDesc: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 12,
  },
  spotsInfo: {
    color: NOVA_COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
  },
  footer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
});
