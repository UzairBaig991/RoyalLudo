import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { NOVA_COLORS } from '../../src/theme/colors';
import { NovaHeader } from '../../src/components/nova/NovaHeader';
import { NovaBadge } from '../../src/components/nova/NovaBadge';
import { NovaButton } from '../../src/components/nova/NovaButton';
import { useSocialStore } from '../../src/store/useSocialStore';

export default function FriendsScreen() {
  const router = useRouter();
  const { friends } = useSocialStore();
  const [filter, setFilter] = useState<'online' | 'all'>('online');
  const [search, setSearch] = useState('');

  const onlineCount = friends.filter((f) => f.status === 'online').length;

  const filteredFriends = friends.filter((f) => {
    if (filter === 'online' && f.status === 'offline') return false;
    if (search.trim() && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleAction = (friend: typeof friends[0]) => {
    if (friend.action === 'Play') {
      router.push({
        pathname: '/gameplay/[matchId]',
        params: { matchId: `friend_${friend.id}`, mode: 'friends' },
      } as any);
    } else if (friend.action === 'Watch') {
      router.push({
        pathname: '/gameplay/[matchId]',
        params: { matchId: `spectate_${friend.id}`, mode: 'spectate' },
      } as any);
    } else {
      router.push('/friends/invite' as any);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <NovaHeader
        title="Your people"
        subtitle="A good game is better with friends."
        showBack={true}
        onBack={() => router.back()}
      />

      <View style={styles.content}>
        {/* Invite Friends Top Card */}
        <TouchableOpacity
          style={styles.inviteCard}
          onPress={() => router.push('/friends/invite' as any)}
          activeOpacity={0.8}
        >
          <View style={styles.inviteIconCircle}>
            <Ionicons name="person-add" size={20} color={NOVA_COLORS.accentPurple} />
          </View>
          <View style={styles.inviteTextWrap}>
            <Text style={styles.inviteTitle}>Invite friends</Text>
            <Text style={styles.inviteDesc}>Get 500 coins for every friend who joins</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={NOVA_COLORS.textSecondary} />
        </TouchableOpacity>

        {/* Filter Badges Row */}
        <View style={styles.badgesRow}>
          <TouchableOpacity onPress={() => setFilter('online')} activeOpacity={0.7}>
            <NovaBadge
              label={`ONLINE  ${onlineCount}`}
              color={filter === 'online' ? 'mint' : 'purple'}
              style={styles.filterBadge}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setFilter('all')} activeOpacity={0.7}>
            <NovaBadge
              label="ALL FRIENDS"
              color={filter === 'all' ? 'gold' : 'purple'}
              style={styles.filterBadge}
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={NOVA_COLORS.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search friends…"
            placeholderTextColor={NOVA_COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Friends List */}
        <View style={styles.list}>
          {filteredFriends.map((f) => (
            <View key={f.id} style={styles.friendRow}>
              <View style={[styles.avatarCircle, { backgroundColor: f.avatarColor }]}>
                <View style={styles.avatarDot} />
              </View>

              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{f.name}</Text>
                <Text style={styles.friendSubtitle}>{f.subtitle}</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  f.action === 'Play' && styles.actionPlay,
                  f.action === 'Watch' && styles.actionWatch,
                ]}
                onPress={() => handleAction(f)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.actionText,
                    f.action === 'Play' && styles.actionTextPlay,
                  ]}
                >
                  {f.action}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: NOVA_COLORS.bg,
    paddingBottom: 24,
  },
  content: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  inviteCard: {
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  inviteIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(185, 162, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  inviteTextWrap: {
    flex: 1,
  },
  inviteTitle: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  inviteDesc: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterBadge: {
    marginRight: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: NOVA_COLORS.textPrimary,
    fontSize: 14,
  },
  list: {},
  friendRow: {
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 16,
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
  avatarDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  friendSubtitle: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: NOVA_COLORS.surfaceElevated,
  },
  actionPlay: {
    backgroundColor: NOVA_COLORS.accentPurple,
  },
  actionWatch: {
    backgroundColor: NOVA_COLORS.surfaceBadge,
  },
  actionText: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  actionTextPlay: {
    color: NOVA_COLORS.textDark,
  },
});
