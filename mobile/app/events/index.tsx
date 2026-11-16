import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { NOVA_COLORS } from '../../src/theme/colors';
import { NovaHeader } from '../../src/components/nova/NovaHeader';
import { NovaBadge } from '../../src/components/nova/NovaBadge';
import { NovaCard } from '../../src/components/nova/NovaCard';
import { NovaButton } from '../../src/components/nova/NovaButton';

export default function EventsScreen() {
  const router = useRouter();

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <NovaHeader
        title="Something to play for"
        subtitle="A little challenge makes every roll sweeter."
        showBack={true}
        onBack={() => router.back()}
      />

      <View style={styles.content}>
        {/* Featured Live Event Card */}
        <NovaCard variant="purple" style={styles.liveCard}>
          <NovaBadge
            label="LIVE EVENT · 2D 14H LEFT"
            color="coral"
            style={styles.liveBadge}
          />
          <View style={styles.trophyWrap}>
            <Ionicons name="trophy" size={32} color={NOVA_COLORS.accentGold} />
          </View>
          <Text style={styles.liveTitle}>The weekend is yours.</Text>
          <Text style={styles.liveDesc}>Win 3 quick games. Unlock Nova dice.</Text>

          <NovaButton
            title="Join the challenge"
            variant="primary"
            onPress={() =>
              router.push({
                pathname: '/gameplay/[matchId]',
                params: { matchId: 'weekend_event', mode: 'quick' },
              } as any)
            }
            style={styles.joinBtn}
          />
        </NovaCard>

        {/* More Ways to Win */}
        <Text style={styles.sectionHeading}>More ways to win</Text>

        <TouchableOpacity
          style={styles.eventRow}
          onPress={() => router.push('/events/tournament' as any)}
          activeOpacity={0.8}
        >
          <View style={[styles.iconWrap, { backgroundColor: 'rgba(255, 211, 123, 0.15)' }]}>
            <Ionicons name="trophy-outline" size={24} color={NOVA_COLORS.accentGold} />
          </View>
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>Evening Cup</Text>
            <Text style={styles.eventSubtitle}>16 players · Starts in 24 min</Text>
          </View>
          <NovaBadge label="25,000 pool" color="gold" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.eventRow}
          onPress={() => router.push('/modes/team' as any)}
          activeOpacity={0.8}
        >
          <View style={[styles.iconWrap, { backgroundColor: 'rgba(185, 162, 255, 0.15)' }]}>
            <Ionicons name="people-outline" size={24} color={NOVA_COLORS.accentPurple} />
          </View>
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>Team Rush</Text>
            <Text style={styles.eventSubtitle}>Win together · Ends Sunday</Text>
          </View>
          <NovaBadge label="2× team XP" color="mint" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.eventRow}
          onPress={() => router.push('/events/pass' as any)}
          activeOpacity={0.8}
        >
          <View style={[styles.iconWrap, { backgroundColor: 'rgba(131, 230, 192, 0.15)' }]}>
            <Ionicons name="ribbon-outline" size={24} color={NOVA_COLORS.accentMint} />
          </View>
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>Season Pass</Text>
            <Text style={styles.eventSubtitle}>Season 04 · Midnight magic</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={NOVA_COLORS.textSecondary} />
        </TouchableOpacity>
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
  liveCard: {
    padding: 22,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 26,
  },
  liveBadge: {
    marginBottom: 14,
  },
  trophyWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 211, 123, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  liveTitle: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  liveDesc: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 18,
  },
  joinBtn: {
    height: 48,
    borderRadius: 14,
  },
  sectionHeading: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },
  eventRow: {
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  eventSubtitle: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 12,
  },
});
