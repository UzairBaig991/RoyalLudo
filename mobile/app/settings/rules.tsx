import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { NOVA_COLORS } from '../../src/theme/colors';
import { NovaHeader } from '../../src/components/nova/NovaHeader';
import { NovaBadge } from '../../src/components/nova/NovaBadge';
import { NovaCard } from '../../src/components/nova/NovaCard';
import { NovaButton } from '../../src/components/nova/NovaButton';

const RULES = [
  {
    step: '01',
    title: 'Roll a six to get started',
    desc: 'Bring a token out of your home base onto the active track. Rolling a six also awards you a bonus roll!',
  },
  {
    step: '02',
    title: 'Race, capture, stay safe',
    desc: 'Land on a rival token to send them home and earn another roll. Spaces marked with a star are safe zones.',
  },
  {
    step: '03',
    title: 'Bring all four tokens home',
    desc: 'An exact roll takes you into the center finish. The first player to bring all 4 tokens home claims victory!',
  },
];

export default function HelpRulesScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<'rules' | 'support'>('rules');

  const handleSupport = () => {
    Alert.alert('Support Team', 'We are here 24/7! Drop a message at support@ludonova.com or chat in your club.');
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <NovaHeader
        title="A helping hand"
        subtitle="A quick guide to your next good game."
        showBack={true}
        onBack={() => router.back()}
      />

      <View style={styles.content}>
        {/* Tabs Row */}
        <View style={styles.tabsRow}>
          <TouchableOpacity onPress={() => setTab('rules')} activeOpacity={0.8}>
            <NovaBadge
              label="HOW TO PLAY"
              color={tab === 'rules' ? 'purple' : 'gold'}
              style={styles.tabBadge}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setTab('support')} activeOpacity={0.8}>
            <NovaBadge
              label="SUPPORT"
              color={tab === 'support' ? 'purple' : 'mint'}
              style={styles.tabBadge}
            />
          </TouchableOpacity>
        </View>

        {tab === 'rules' ? (
          <View style={styles.rulesList}>
            {RULES.map((r) => (
              <View key={r.step} style={styles.ruleCard}>
                <View style={styles.stepCircle}>
                  <Text style={styles.stepNum}>{r.step}</Text>
                </View>

                <View style={styles.ruleInfo}>
                  <Text style={styles.ruleTitle}>{r.title}</Text>
                  <Text style={styles.ruleDesc}>{r.desc}</Text>
                </View>
              </View>
            ))}

            {/* Fair play card */}
            <NovaCard variant="card" style={styles.fairPlayCard}>
              <View style={styles.shieldWrap}>
                <Ionicons name="shield-checkmark" size={24} color={NOVA_COLORS.accentMint} />
              </View>
              <View style={styles.fairInfo}>
                <Text style={styles.fairTitle}>Fair play and safety</Text>
                <Text style={styles.fairDesc}>
                  Report, mute or block from any player profile. Ludo Nova is a welcoming table for everyone.
                </Text>
              </View>
            </NovaCard>
          </View>
        ) : (
          <View style={styles.supportContainer}>
            <NovaCard variant="purple" style={styles.supportCard}>
              <View style={styles.supportIconWrap}>
                <Ionicons name="chatbubbles" size={32} color={NOVA_COLORS.accentPurple} />
              </View>
              <Text style={styles.supportTitle}>We’re here to help</Text>
              <Text style={styles.supportSub}>
                Questions about game rules, your coin balance, or fair play? We’re always here to keep the good games going.
              </Text>
            </NovaCard>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <NovaButton
          title="Contact support"
          variant="primary"
          onPress={handleSupport}
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
    marginBottom: 20,
  },
  tabBadge: {
    marginRight: 10,
  },
  rulesList: {},
  ruleCard: {
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: NOVA_COLORS.surfaceBadge,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    marginTop: 2,
  },
  stepNum: {
    color: NOVA_COLORS.accentPurple,
    fontSize: 14,
    fontWeight: '800',
  },
  ruleInfo: {
    flex: 1,
  },
  ruleTitle: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  ruleDesc: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  fairPlayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginTop: 6,
    marginBottom: 10,
  },
  shieldWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(131, 230, 192, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  fairInfo: {
    flex: 1,
  },
  fairTitle: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  fairDesc: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  supportContainer: {
    marginBottom: 20,
  },
  supportCard: {
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
  },
  supportIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(185, 162, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  supportTitle: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  supportSub: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  footer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
});
