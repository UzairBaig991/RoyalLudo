import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { NOVA_COLORS } from '../../src/theme/colors';
import { NovaHeader } from '../../src/components/nova/NovaHeader';
import { NovaBadge } from '../../src/components/nova/NovaBadge';
import { NovaButton } from '../../src/components/nova/NovaButton';
import { useEconomyStore } from '../../src/store/useEconomyStore';

const CLUBS = [
  {
    id: 'night_rollers',
    name: 'The Night Rollers',
    desc: 'Chill games. Great company.',
    members: '28 / 30 members',
    tier: 'GOLD',
    tierColor: 'gold' as const,
  },
  {
    id: 'six_appeal',
    name: 'Six Appeal',
    desc: 'Always room for one more six.',
    members: '24 / 30 members',
    tier: 'GOLD',
    tierColor: 'gold' as const,
  },
  {
    id: 'good_roll',
    name: 'Good Roll Society',
    desc: 'Play fair. Celebrate together.',
    members: '19 / 30 members',
    tier: 'SILVER',
    tierColor: 'blue' as const,
  },
];

export default function DiscoverClubsScreen() {
  const router = useRouter();
  const { gold, debitGold } = useEconomyStore();
  const [search, setSearch] = useState('');

  const filteredClubs = CLUBS.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateClub = () => {
    if (gold < 1000) {
      Alert.alert('Need 1,000 Coins', 'You need 1,000 coins to create a club.');
      return;
    }
    debitGold(1000);
    Alert.alert('Club Created! 🛡️', 'Your new club is ready. Invite members now!');
    router.push('/clubs/night_rollers' as any);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <NovaHeader
        title="Find your crew"
        subtitle="Big laughs. Bigger team spirit."
        showBack={true}
        onBack={() => router.back()}
      />

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={NOVA_COLORS.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search clubs…"
            placeholderTextColor={NOVA_COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <Text style={styles.sectionHeading}>Recommended for you</Text>

        <View style={styles.clubsList}>
          {filteredClubs.map((club) => (
            <TouchableOpacity
              key={club.id}
              style={styles.clubCard}
              onPress={() => router.push(`/clubs/${club.id}` as any)}
              activeOpacity={0.8}
            >
              <View style={styles.clubIconWrap}>
                <Ionicons name="shield" size={24} color={NOVA_COLORS.accentPurple} />
              </View>

              <View style={styles.clubInfo}>
                <View style={styles.clubTitleRow}>
                  <Text style={styles.clubName}>{club.name}</Text>
                  <NovaBadge
                    label={club.tier}
                    color={club.tierColor}
                    style={styles.tierPill}
                  />
                </View>
                <Text style={styles.clubDesc}>{club.desc}</Text>
                <Text style={styles.clubMeta}>{club.members}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <NovaButton
          title="Create a club  ·  1,000 coins"
          variant="primary"
          onPress={handleCreateClub}
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: NOVA_COLORS.textPrimary,
    fontSize: 14,
  },
  sectionHeading: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 14,
  },
  clubsList: {},
  clubCard: {
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  clubIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(185, 162, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  clubInfo: {
    flex: 1,
  },
  clubTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  clubName: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  tierPill: {
    height: 22,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  clubDesc: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
  clubMeta: {
    color: NOVA_COLORS.accentPurple,
    fontSize: 11,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
});
