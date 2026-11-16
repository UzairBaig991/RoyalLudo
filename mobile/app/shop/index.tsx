import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { NOVA_COLORS } from '../../src/theme/colors';
import { NovaHeader } from '../../src/components/nova/NovaHeader';
import { NovaBadge } from '../../src/components/nova/NovaBadge';
import { NovaCard } from '../../src/components/nova/NovaCard';
import { NovaDie } from '../../src/components/nova/NovaDie';
import { useEconomyStore } from '../../src/store/useEconomyStore';

export default function ShopHubScreen() {
  const router = useRouter();
  const { gold, gems } = useEconomyStore();

  const categories = [
    {
      id: 'coins',
      title: 'Coins',
      desc: 'For your next game',
      icon: 'sparkles',
      color: NOVA_COLORS.accentGold,
      route: '/shop/coins',
    },
    {
      id: 'gems',
      title: 'Gems',
      desc: 'A little extra sparkle',
      icon: 'diamond',
      color: NOVA_COLORS.accentMint,
      route: '/shop/gems',
    },
    {
      id: 'dice',
      title: 'Dice',
      desc: 'Make every roll yours',
      icon: 'cube',
      color: NOVA_COLORS.accentPurple,
      route: '/shop/dice',
    },
    {
      id: 'boards',
      title: 'Boards',
      desc: 'Set the scene',
      icon: 'grid',
      color: NOVA_COLORS.blue,
      route: '/shop/boards',
    },
  ];

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <NovaHeader
        title="A little extra magic"
        subtitle="Make the game feel like you."
        showBack={true}
        onBack={() => router.back()}
      />

      <View style={styles.content}>
        {/* Balance Badges Row */}
        <View style={styles.badgesRow}>
          <TouchableOpacity onPress={() => router.push('/shop/coins' as any)}>
            <NovaBadge
              label={`◈  ${gold.toLocaleString()}`}
              color="gold"
              style={styles.balanceBadge}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/shop/gems' as any)}>
            <NovaBadge
              label={`◇  ${gems.toLocaleString()}`}
              color="mint"
              style={styles.balanceBadge}
            />
          </TouchableOpacity>
        </View>

        {/* Featured Collection Banner */}
        <TouchableOpacity
          style={styles.featuredCard}
          onPress={() => router.push('/shop/dice' as any)}
          activeOpacity={0.85}
        >
          <View style={styles.featuredLeft}>
            <NovaBadge
              label="THE NOVA COLLECTION"
              color="purple"
              style={styles.featuredBadge}
            />
            <Text style={styles.featuredTitle}>Roll in your own style.</Text>
            <Text style={styles.featuredLink}>Explore dice & themes  →</Text>
          </View>

          <View style={styles.featuredDieWrap}>
            <NovaDie value={5} size={64} theme="nova" />
          </View>
        </TouchableOpacity>

        {/* Category Grid */}
        <Text style={styles.sectionHeading}>Find your favorite</Text>

        <View style={styles.grid}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.catCard}
              onPress={() => router.push(cat.route as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.catIconWrap, { backgroundColor: 'rgba(255, 255, 255, 0.08)' }]}>
                <Ionicons name={cat.icon as any} size={24} color={cat.color} />
              </View>
              <Text style={styles.catTitle}>{cat.title}</Text>
              <Text style={styles.catDesc}>{cat.desc}</Text>
            </TouchableOpacity>
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
  balanceBadge: {
    marginRight: 10,
  },
  featuredCard: {
    backgroundColor: NOVA_COLORS.surfaceBadge,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  featuredLeft: {
    flex: 1,
  },
  featuredBadge: {
    marginBottom: 10,
  },
  featuredTitle: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  featuredLink: {
    color: NOVA_COLORS.accentPurple,
    fontSize: 13,
    fontWeight: '700',
  },
  featuredDieWrap: {
    marginLeft: 12,
  },
  sectionHeading: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  catCard: {
    width: '48%',
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  catIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  catTitle: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  catDesc: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
});
