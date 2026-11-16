import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { NOVA_COLORS } from '../../src/theme/colors';
import { NovaHeader } from '../../src/components/nova/NovaHeader';
import { NovaBadge } from '../../src/components/nova/NovaBadge';
import { NovaCard } from '../../src/components/nova/NovaCard';
import { NovaButton } from '../../src/components/nova/NovaButton';

export default function TeamUpScreen() {
  const router = useRouter();

  const handleFindTeammate = () => {
    router.push({
      pathname: '/matchmaking',
      params: { mode: 'team', players: 4, entry: 500, prize: 2000 },
    } as any);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <NovaHeader
        title="Better together"
        subtitle="Pair up and bring your best game."
        showBack={true}
        onBack={() => router.back()}
      />

      <View style={styles.content}>
        <NovaBadge label="2 VS 2" color="gold" style={styles.topBadge} />

        {/* Hero Card */}
        <NovaCard variant="purple" style={styles.heroCard}>
          <Text style={styles.heroTitle}>Two players.{'\n'}One winning team.</Text>
          <Text style={styles.heroDesc}>
            Help your partner bring every token home. Share victory together.
          </Text>
        </NovaCard>

        {/* Options */}
        <Text style={styles.sectionHeading}>Choose your partner</Text>

        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => router.push('/(tabs)/friends' as any)}
          activeOpacity={0.8}
        >
          <View style={styles.optionIconCircle}>
            <Ionicons name="person-add-outline" size={22} color={NOVA_COLORS.accentPurple} />
          </View>
          <View style={styles.optionInfo}>
            <Text style={styles.optionTitle}>Invite a friend</Text>
            <Text style={styles.optionDesc}>Team up with someone you know.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={NOVA_COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionCard}
          onPress={handleFindTeammate}
          activeOpacity={0.8}
        >
          <View style={styles.optionIconCircle}>
            <Ionicons name="people-outline" size={22} color={NOVA_COLORS.accentMint} />
          </View>
          <View style={styles.optionInfo}>
            <Text style={styles.optionTitle}>Find a teammate</Text>
            <Text style={styles.optionDesc}>Meet your next winning partner.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={NOVA_COLORS.textSecondary} />
        </TouchableOpacity>

        {/* Entry & Pool Badges */}
        <View style={styles.badgesRow}>
          <NovaBadge label="◈  500 entry" color="gold" style={styles.entryBadge} />
          <NovaBadge label="◈  2,000 pool" color="mint" style={styles.poolBadge} />
        </View>
      </View>

      <View style={styles.footer}>
        <NovaButton
          title="Find a teammate"
          variant="primary"
          onPress={handleFindTeammate}
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
  topBadge: {
    marginBottom: 14,
  },
  heroCard: {
    padding: 20,
    marginBottom: 24,
  },
  heroTitle: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
    marginBottom: 8,
  },
  heroDesc: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  sectionHeading: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },
  optionCard: {
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(185, 162, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  optionDesc: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 12,
  },
  badgesRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  entryBadge: {
    marginRight: 10,
  },
  poolBadge: {},
  footer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
});
