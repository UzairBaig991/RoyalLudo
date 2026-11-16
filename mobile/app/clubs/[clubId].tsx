import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { NOVA_COLORS } from '../../src/theme/colors';
import { NovaHeader } from '../../src/components/nova/NovaHeader';
import { NovaBadge } from '../../src/components/nova/NovaBadge';
import { NovaCard } from '../../src/components/nova/NovaCard';
import { NovaButton } from '../../src/components/nova/NovaButton';

export default function ClubOverviewScreen() {
  const router = useRouter();

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <NovaHeader
        title="The Night Rollers"
        subtitle="A little competitive. A lot of fun."
        showBack={true}
        onBack={() => router.back()}
      />

      <View style={styles.content}>
        {/* Hero Card */}
        <NovaCard variant="purple" style={styles.heroCard}>
          <View style={styles.heroIconCircle}>
            <Ionicons name="shield" size={32} color={NOVA_COLORS.accentPurple} />
          </View>
          <Text style={styles.heroName}>THE NIGHT ROLLERS</Text>
          <Text style={styles.heroMotto}>Roll with us.</Text>
          <Text style={styles.heroMeta}>Gold club  ·  28 / 30 members</Text>

          <View style={styles.badgesRow}>
            <NovaBadge label="#124 GLOBAL" color="gold" style={styles.badgeMargin} />
            <NovaBadge label="12 ONLINE" color="mint" />
          </View>
        </NovaCard>

        {/* Club Activity */}
        <Text style={styles.sectionHeading}>Club activity</Text>

        <View style={styles.activityList}>
          {/* Item 1: Maya */}
          <View style={styles.activityRow}>
            <View style={[styles.avatarCircle, { backgroundColor: NOVA_COLORS.coral }]}>
              <View style={styles.innerDot} />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityName}>Maya</Text>
              <Text style={styles.activityDesc}>Won a classic match · +120 XP</Text>
            </View>
            <TouchableOpacity style={styles.viewBtn}>
              <Text style={styles.viewBtnText}>View</Text>
            </TouchableOpacity>
          </View>

          {/* Item 2: Leo */}
          <View style={styles.activityRow}>
            <View style={[styles.avatarCircle, { backgroundColor: NOVA_COLORS.mint }]}>
              <View style={styles.innerDot} />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityName}>Leo</Text>
              <Text style={styles.activityDesc}>Sent 5 gifts to clubmates</Text>
            </View>
            <TouchableOpacity style={styles.viewBtn}>
              <Text style={styles.viewBtnText}>View</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <NovaButton
          title="Open club chat"
          variant="primary"
          onPress={() => router.push('/clubs/chat' as any)}
          style={styles.chatBtn}
        />
        <Text style={styles.footerMeta}>
          Club info  ·  Members  ·  Weekly leaderboard
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
  heroCard: {
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  heroIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(185, 162, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  heroName: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  heroMotto: {
    color: NOVA_COLORS.accentPurple,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 4,
  },
  heroMeta: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 14,
  },
  badgesRow: {
    flexDirection: 'row',
  },
  badgeMargin: {
    marginRight: 10,
  },
  sectionHeading: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 14,
  },
  activityList: {},
  activityRow: {
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  innerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  activityDesc: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  viewBtn: {
    backgroundColor: NOVA_COLORS.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  viewBtnText: {
    color: NOVA_COLORS.accentPurple,
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 20,
    marginTop: 16,
    alignItems: 'center',
  },
  chatBtn: {
    marginBottom: 12,
  },
  footerMeta: {
    color: NOVA_COLORS.textMuted,
    fontSize: 12,
  },
});
