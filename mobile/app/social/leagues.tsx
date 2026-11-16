import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { NOVA_COLORS } from '../../src/theme/colors';
import { NovaHeader } from '../../src/components/nova/NovaHeader';
import { NovaBadge } from '../../src/components/nova/NovaBadge';
import { NovaCard } from '../../src/components/nova/NovaCard';

const LEADERBOARD = [
  { rank: '04', name: 'Sam', points: '5,240' },
  { rank: '05', name: 'Leo', points: '4,890' },
  { rank: '06', name: 'Nina', points: '4,720' },
];

export default function LeaguesScreen() {
  const router = useRouter();

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <NovaHeader
        title="Gold league"
        subtitle="New week. New climb."
        showBack={true}
        onBack={() => router.back()}
      />

      <View style={styles.content}>
        <NovaBadge label="ENDS IN  2D 14H" color="coral" style={styles.timerBadge} />

        {/* League Info Card */}
        <NovaCard variant="purple" style={styles.leagueBanner}>
          <Text style={styles.tierTitle}>Gold III</Text>
          <Text style={styles.tierSub}>Top 10 move up to Platinum</Text>
        </NovaCard>

        {/* Top 3 Podium */}
        <View style={styles.podiumRow}>
          {/* #2 Maya */}
          <View style={[styles.podiumCol, { marginTop: 24 }]}>
            <View style={[styles.podiumAvatar, { backgroundColor: NOVA_COLORS.coral }]}>
              <Text style={styles.podiumAvatarChar}>M</Text>
            </View>
            <NovaBadge label="#2" color="mint" style={styles.rankPill} />
            <Text style={styles.podiumName}>Maya</Text>
            <Text style={styles.podiumScore}>6,420</Text>
          </View>

          {/* #1 Arjun (Center Elevated) */}
          <View style={styles.podiumCol}>
            <View style={styles.crownWrap}>
              <Ionicons name="trophy" size={24} color={NOVA_COLORS.accentGold} />
            </View>
            <View
              style={[
                styles.podiumAvatar,
                {
                  backgroundColor: NOVA_COLORS.gold,
                  width: 68,
                  height: 68,
                  borderRadius: 34,
                },
              ]}
            >
              <Text style={styles.podiumAvatarChar}>A</Text>
            </View>
            <NovaBadge label="#1" color="gold" style={styles.rankPill} />
            <Text style={styles.podiumName}>Arjun</Text>
            <Text style={styles.podiumScore}>7,810</Text>
          </View>

          {/* #3 Zara */}
          <View style={[styles.podiumCol, { marginTop: 32 }]}>
            <View style={[styles.podiumAvatar, { backgroundColor: NOVA_COLORS.mint }]}>
              <Text style={styles.podiumAvatarChar}>Z</Text>
            </View>
            <NovaBadge label="#3" color="blue" style={styles.rankPill} />
            <Text style={styles.podiumName}>Zara</Text>
            <Text style={styles.podiumScore}>5,960</Text>
          </View>
        </View>

        {/* Rows 4-6 */}
        <View style={styles.rowsList}>
          {LEADERBOARD.map((item) => (
            <View key={item.rank} style={styles.rowCard}>
              <Text style={styles.rowRank}>{item.rank}</Text>
              <Text style={styles.rowName}>{item.name}</Text>
              <Text style={styles.rowPoints}>{item.points} pts</Text>
            </View>
          ))}
        </View>

        {/* Your Sticky Rank Card */}
        <NovaCard variant="card" style={styles.myRankCard}>
          <NovaBadge label="#18" color="purple" style={styles.myRankBadge} />
          <View style={styles.myRankInfo}>
            <Text style={styles.myRankName}>You · Alex</Text>
            <Text style={styles.myRankPoints}>2,450 points</Text>
          </View>
          <View style={styles.climbWrap}>
            <Ionicons name="arrow-up" size={16} color={NOVA_COLORS.accentMint} />
            <Text style={styles.climbText}>3</Text>
          </View>
        </NovaCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: NOVA_COLORS.bg,
    paddingBottom: 28,
  },
  content: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  timerBadge: {
    marginBottom: 14,
  },
  leagueBanner: {
    padding: 18,
    borderRadius: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  tierTitle: {
    color: NOVA_COLORS.accentGold,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  tierSub: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 13,
  },
  podiumRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  podiumCol: {
    alignItems: 'center',
    width: '30%',
  },
  crownWrap: {
    marginBottom: 4,
  },
  podiumAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    marginBottom: 8,
  },
  podiumAvatarChar: {
    color: '#0d101e',
    fontSize: 20,
    fontWeight: '800',
  },
  rankPill: {
    height: 22,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 4,
  },
  podiumName: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  podiumScore: {
    color: NOVA_COLORS.accentGold,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  rowsList: {
    marginBottom: 20,
  },
  rowCard: {
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rowRank: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '700',
    width: 32,
  },
  rowName: {
    flex: 1,
    color: NOVA_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  rowPoints: {
    color: NOVA_COLORS.accentPurple,
    fontSize: 14,
    fontWeight: '700',
  },
  myRankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: NOVA_COLORS.accentPurple,
    padding: 16,
  },
  myRankBadge: {
    marginRight: 14,
  },
  myRankInfo: {
    flex: 1,
  },
  myRankName: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  myRankPoints: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  climbWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(131, 230, 192, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  climbText: {
    color: NOVA_COLORS.accentMint,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 2,
  },
});
