import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { NOVA_COLORS } from '../../src/theme/colors';
import { NovaHeader } from '../../src/components/nova/NovaHeader';
import { NovaBadge } from '../../src/components/nova/NovaBadge';
import { NovaCard } from '../../src/components/nova/NovaCard';
import { NovaButton } from '../../src/components/nova/NovaButton';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function PlayerProfileScreen() {
  const router = useRouter();
  const { profile, matchHistory } = useAuthStore();

  const stats = profile?.stats || {
    matchesPlayed: 248,
    matchesWon: 142,
    winPercentage: 57.3,
    tokensCaptured: 84,
    tokensFinished: 76,
    winStreak: 4,
    highestWinStreak: 6,
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <NovaHeader
        title="Player profile"
        subtitle=""
        showBack={true}
        onBack={() => router.back()}
      />

      <View style={styles.content}>
        {/* Avatar & Identifiers */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarCircle}>
            <View style={styles.avatarDot} />
          </View>
          <Text style={styles.name}>{profile?.username || 'Alex Nova'}</Text>
          <Text style={styles.playerMeta}>ID: 849 225  ·  Joined November 2026</Text>

          <View style={styles.badgesRow}>
            <NovaBadge label="LEVEL 12" color="mint" style={styles.badgeSpacing} />
            <NovaBadge label="GOLD III" color="gold" />
          </View>
        </View>

        {/* Level XP Progress Card */}
        <NovaCard variant="card" style={styles.xpCard}>
          <View style={styles.xpHeader}>
            <Text style={styles.xpTitle}>Next stop: Level 13</Text>
            <Text style={styles.xpCount}>720 / 1,000 XP</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: '72%' }]} />
          </View>
        </NovaCard>

        {/* Stats 3-Column Card */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{stats.matchesPlayed}</Text>
            <Text style={styles.statLabel}>Games</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statVal}>{stats.matchesWon}</Text>
            <Text style={styles.statLabel}>Wins</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statVal}>{stats.winPercentage}%</Text>
            <Text style={styles.statLabel}>Win rate</Text>
          </View>
        </View>

        {/* Combat Stats Card */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{stats.tokensCaptured}</Text>
            <Text style={styles.statLabel}>Kills</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statVal}>{stats.winStreak}🔥</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statVal}>{stats.tokensFinished}</Text>
            <Text style={styles.statLabel}>Home</Text>
          </View>
        </View>

        {/* Match History Card */}
        <NovaCard variant="card" style={styles.historyCard}>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>Recent match history</Text>
            <NovaBadge label="VERIFIED" color="mint" />
          </View>

          {matchHistory.map((item) => (
            <View key={item.id} style={styles.historyItem}>
              <View style={styles.historyMain}>
                <View style={styles.historyTitleRow}>
                  <View
                    style={[
                      styles.outcomeTag,
                      item.outcome === 'WIN' ? styles.outcomeWin : styles.outcomeLoss,
                    ]}
                  >
                    <Text style={styles.outcomeTagText}>{item.outcome}</Text>
                  </View>
                  <Text style={styles.historyOpponent}>{item.opponentName}</Text>
                </View>
                <Text style={styles.historySub}>
                  {item.mode} · {item.tokensCaptured} Kills · {item.date}
                </Text>
              </View>

              <Text
                style={[
                  styles.historyDelta,
                  item.coinsDelta >= 0 ? styles.deltaWin : styles.deltaLoss,
                ]}
              >
                {item.coinsDelta >= 0 ? `+${item.coinsDelta.toLocaleString()}` : item.coinsDelta.toLocaleString()} 🪙
              </Text>
            </View>
          ))}
        </NovaCard>

        {/* Achievements Card */}
        <NovaCard variant="card" style={styles.achievementsCard}>
          <Text style={styles.sectionTitle}>Favorite achievements</Text>

          <View style={styles.achievementsRow}>
            {/* 1. First win */}
            <View style={styles.achievementItem}>
              <View style={[styles.achIconWrap, { backgroundColor: 'rgba(255, 211, 123, 0.15)' }]}>
                <Ionicons name="trophy" size={24} color={NOVA_COLORS.accentGold} />
              </View>
              <Text style={styles.achName}>First win</Text>
            </View>

            {/* 2. Team spirit */}
            <View style={styles.achievementItem}>
              <View style={[styles.achIconWrap, { backgroundColor: 'rgba(185, 162, 255, 0.15)' }]}>
                <Ionicons name="people" size={24} color={NOVA_COLORS.accentPurple} />
              </View>
              <Text style={styles.achName}>Team spirit</Text>
            </View>

            {/* 3. Hot streak */}
            <View style={styles.achievementItem}>
              <View style={[styles.achIconWrap, { backgroundColor: 'rgba(255, 124, 124, 0.15)' }]}>
                <Ionicons name="flame" size={24} color={NOVA_COLORS.coral} />
              </View>
              <Text style={styles.achName}>Hot streak</Text>
            </View>
          </View>
        </NovaCard>
      </View>

      <View style={styles.footer}>
        <NovaButton
          title="Edit profile"
          variant="dark"
          onPress={() => router.push('/(auth)/setup' as any)}
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: NOVA_COLORS.coral,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    marginBottom: 12,
  },
  avatarDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
  },
  name: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  playerMeta: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 14,
  },
  badgesRow: {
    flexDirection: 'row',
  },
  badgeSpacing: {
    marginRight: 8,
  },
  xpCard: {
    marginBottom: 14,
    padding: 18,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  xpTitle: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  xpCount: {
    color: NOVA_COLORS.accentPurple,
    fontSize: 13,
    fontWeight: '600',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: NOVA_COLORS.accentPurple,
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  statBox: {
    width: '31%',
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
  },
  statVal: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 11,
  },
  historyCard: {
    padding: 18,
    marginBottom: 14,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  historyMain: {
    flex: 1,
    marginRight: 10,
  },
  historyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  outcomeTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  outcomeWin: {
    backgroundColor: 'rgba(131, 230, 192, 0.2)',
  },
  outcomeLoss: {
    backgroundColor: 'rgba(255, 124, 124, 0.2)',
  },
  outcomeTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  historyOpponent: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  historySub: {
    color: NOVA_COLORS.textMuted,
    fontSize: 11,
  },
  historyDelta: {
    fontSize: 13,
    fontWeight: '800',
  },
  deltaWin: {
    color: NOVA_COLORS.accentMint,
  },
  deltaLoss: {
    color: NOVA_COLORS.coral,
  },
  achievementsCard: {
    padding: 18,
    marginBottom: 10,
  },
  sectionTitle: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 14,
  },
  achievementsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  achievementItem: {
    alignItems: 'center',
  },
  achIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  achName: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
});
