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

export default function MissionsScreen() {
  const router = useRouter();
  const { addGold } = useEconomyStore();
  const { missions, claimMission } = useMissionsStore();

  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');

  const completedCount = missions.filter((m) => m.progress >= m.total).length;

  const handleClaimAll = () => {
    let coinsGained = 0;
    missions.forEach((m) => {
      if (!m.claimed && m.progress >= m.total) {
        const res = claimMission(m.id);
        if (res.type === 'coins') coinsGained += res.amount;
      }
    });

    if (coinsGained > 0) {
      addGold(coinsGained);
      Alert.alert('Rewards Claimed! 🎉', `+${coinsGained} coins added to your balance.`);
    } else {
      Alert.alert('All Caught Up', 'No new completed missions to claim.');
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <NovaHeader
        title="Small goals. Big fun."
        subtitle="New missions in  14h 22m"
        showBack={true}
        onBack={() => router.back()}
      />

      <View style={styles.content}>
        {/* Tabs Row */}
        <View style={styles.tabsRow}>
          <TouchableOpacity onPress={() => setActiveTab('daily')} activeOpacity={0.8}>
            <NovaBadge
              label="DAILY"
              color={activeTab === 'daily' ? 'purple' : 'mint'}
              style={styles.tabBadge}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setActiveTab('weekly')} activeOpacity={0.8}>
            <NovaBadge
              label="WEEKLY"
              color={activeTab === 'weekly' ? 'purple' : 'gold'}
              style={styles.tabBadge}
            />
          </TouchableOpacity>
        </View>

        {/* Overview Banner Card */}
        <NovaCard variant="purple" style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <Text style={styles.overviewTitle}>{completedCount} of 4 complete</Text>
            <Ionicons name="gift-outline" size={22} color={NOVA_COLORS.accentGold} />
          </View>
          <Text style={styles.overviewSub}>Finish all 4 to unlock a bonus chest.</Text>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${(completedCount / 4) * 100}%` },
              ]}
            />
          </View>
        </NovaCard>

        {/* Missions List */}
        <View style={styles.missionsList}>
          {missions.map((m) => {
            const isDone = m.progress >= m.total;
            return (
              <View key={m.id} style={styles.missionCard}>
                <View style={styles.missionInfo}>
                  <Text style={styles.missionTitle}>{m.title}</Text>
                  <Text style={styles.missionProgress}>
                    {m.progress} / {m.total} {m.title.includes('token') ? 'tokens' : m.title.includes('gift') ? 'gifts' : 'games'}
                  </Text>
                </View>

                <View style={styles.rewardWrap}>
                  <NovaBadge
                    label={m.claimed ? 'Claimed' : `+${m.rewardAmount} ${m.rewardType.toUpperCase()}`}
                    color={m.claimed ? 'purple' : isDone ? 'gold' : 'blue'}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <NovaButton
          title="Claim completed rewards"
          variant="primary"
          onPress={handleClaimAll}
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
  tabsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tabBadge: {
    marginRight: 10,
  },
  overviewCard: {
    padding: 18,
    borderRadius: 20,
    marginBottom: 20,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  overviewTitle: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  overviewSub: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 14,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: NOVA_COLORS.accentPurple,
  },
  missionsList: {},
  missionCard: {
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  missionInfo: {
    flex: 1,
    marginRight: 12,
  },
  missionTitle: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  missionProgress: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 12,
  },
  rewardWrap: {},
  footer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
});
