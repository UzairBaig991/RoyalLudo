import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { NOVA_COLORS } from '../../src/theme/colors';
import { NovaHeader } from '../../src/components/nova/NovaHeader';
import { NovaBadge } from '../../src/components/nova/NovaBadge';
import { useSocialStore } from '../../src/store/useSocialStore';
import { useEconomyStore } from '../../src/store/useEconomyStore';

export default function InboxScreen() {
  const router = useRouter();
  const { inbox, claimInboxItem } = useSocialStore();
  const { addGold } = useEconomyStore();

  const [activeFilter, setActiveFilter] = useState<'all' | 'gifts' | 'updates'>('all');

  const giftCount = inbox.filter((i) => i.type === 'gift' && !i.claimed).length;

  const filteredInbox = inbox.filter((item) => {
    if (activeFilter === 'gifts' && item.type !== 'gift') return false;
    if (activeFilter === 'updates' && item.type === 'gift') return false;
    return true;
  });

  const handleAction = (item: typeof inbox[0]) => {
    if (item.type === 'gift') {
      const reward = claimInboxItem(item.id);
      if (reward > 0) {
        addGold(reward);
        Alert.alert('Gift Claimed! 🎁', `You received ${reward} coins!`);
      }
    } else if (item.type === 'invite') {
      router.push({
        pathname: '/gameplay/[matchId]',
        params: { matchId: 'team_invite', mode: 'team' },
      } as any);
    } else if (item.type === 'league') {
      router.push('/social/leagues' as any);
    } else if (item.type === 'reward') {
      router.push('/rewards/daily' as any);
    } else if (item.type === 'info') {
      router.push('/settings/rules' as any);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <NovaHeader
        title="A little news for you"
        subtitle="Invites, gifts and the good stuff."
        showBack={true}
        onBack={() => router.back()}
      />

      <View style={styles.content}>
        {/* Filter Badges Row */}
        <View style={styles.badgesRow}>
          <TouchableOpacity onPress={() => setActiveFilter('all')} activeOpacity={0.8}>
            <NovaBadge
              label="ALL"
              color={activeFilter === 'all' ? 'purple' : 'gold'}
              style={styles.filterBadge}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setActiveFilter('gifts')} activeOpacity={0.8}>
            <NovaBadge
              label={`GIFTS  ${giftCount}`}
              color={activeFilter === 'gifts' ? 'purple' : 'mint'}
              style={styles.filterBadge}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setActiveFilter('updates')} activeOpacity={0.8}>
            <NovaBadge
              label="UPDATES"
              color={activeFilter === 'updates' ? 'purple' : 'blue'}
              style={styles.filterBadge}
            />
          </TouchableOpacity>
        </View>

        {/* Message Items List */}
        <View style={styles.list}>
          {filteredInbox.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.iconCircle}>
                <Ionicons
                  name={
                    item.type === 'gift'
                      ? 'gift'
                      : item.type === 'invite'
                      ? 'people'
                      : item.type === 'league'
                      ? 'trophy'
                      : item.type === 'reward'
                      ? 'star'
                      : 'shield-checkmark'
                  }
                  size={20}
                  color={NOVA_COLORS.accentPurple}
                />
              </View>

              <View style={styles.itemMeta}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.actionPill,
                  item.claimed && styles.actionPillClaimed,
                ]}
                onPress={() => handleAction(item)}
                disabled={item.claimed}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.actionText,
                    item.claimed && styles.actionTextClaimed,
                  ]}
                >
                  {item.actionLabel}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <Text style={styles.caughtUpText}>You’re all caught up.</Text>
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
  badgesRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  filterBadge: {
    marginRight: 10,
  },
  list: {},
  itemRow: {
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(185, 162, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  itemMeta: {
    flex: 1,
    paddingRight: 10,
  },
  itemTitle: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  itemSubtitle: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 12,
  },
  actionPill: {
    backgroundColor: NOVA_COLORS.surfaceBadge,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  actionPillClaimed: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  actionText: {
    color: NOVA_COLORS.accentPurple,
    fontSize: 12,
    fontWeight: '700',
  },
  actionTextClaimed: {
    color: NOVA_COLORS.textMuted,
  },
  caughtUpText: {
    color: NOVA_COLORS.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 20,
  },
});
