import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { NOVA_COLORS } from '../../src/theme/colors';
import { NovaHeader } from '../../src/components/nova/NovaHeader';
import { NovaBadge } from '../../src/components/nova/NovaBadge';
import { NovaButton } from '../../src/components/nova/NovaButton';
import { useEconomyStore } from '../../src/store/useEconomyStore';

const PACKS = [
  { id: 'p1', name: 'Pocketful', coins: 5000, price: '$0.99' },
  { id: 'p2', name: 'Good company', coins: 25000, price: '$3.99' },
  { id: 'p3', name: 'Game night', coins: 75000, price: '$8.99', isBestValue: true },
  { id: 'p4', name: 'The big table', coins: 200000, price: '$19.99' },
];

export default function CoinPacksScreen() {
  const router = useRouter();
  const { gold, addGold } = useEconomyStore();

  const handleBuy = (pack: typeof PACKS[0]) => {
    addGold(pack.coins);
    Alert.alert('Coins Purchased! ✨', `+${pack.coins.toLocaleString()} coins added to your balance.`);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <NovaHeader
        title="A few more rounds"
        subtitle="Virtual coins for more games together."
        showBack={true}
        onBack={() => router.back()}
      />

      <View style={styles.content}>
        <NovaBadge
          label={`BALANCE  ${gold.toLocaleString()}`}
          color="gold"
          style={styles.balanceBadge}
        />

        <View style={styles.packsList}>
          {PACKS.map((pack) => (
            <TouchableOpacity
              key={pack.id}
              style={[
                styles.packCard,
                pack.isBestValue && styles.packCardHighlight,
              ]}
              onPress={() => handleBuy(pack)}
              activeOpacity={0.8}
            >
              <View style={styles.iconWrap}>
                <Ionicons name="sparkles" size={26} color={NOVA_COLORS.accentGold} />
              </View>

              <View style={styles.packInfo}>
                <View style={styles.titleRow}>
                  <Text style={styles.packName}>{pack.name}</Text>
                  {pack.isBestValue && (
                    <NovaBadge
                      label="BEST VALUE"
                      color="gold"
                      style={styles.bestValBadge}
                    />
                  )}
                </View>
                <Text style={styles.coinsVal}>◈ {pack.coins.toLocaleString()}</Text>
              </View>

              <View style={styles.pricePill}>
                <Text style={styles.priceText}>{pack.price}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.disclaimer}>
          Purchases are optional. Coins have no cash value.
        </Text>
      </View>

      <View style={styles.footer}>
        <NovaButton
          title="Restore purchases"
          variant="dark"
          onPress={() => Alert.alert('Restore Purchases', 'All prior in-app purchases have been restored.')}
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
  balanceBadge: {
    marginBottom: 20,
  },
  packsList: {
    marginBottom: 16,
  },
  packCard: {
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  packCardHighlight: {
    borderColor: NOVA_COLORS.accentGold,
    backgroundColor: '#1d233d',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 211, 123, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  packInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  packName: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  bestValBadge: {
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  coinsVal: {
    color: NOVA_COLORS.accentGold,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  pricePill: {
    backgroundColor: NOVA_COLORS.accentPurple,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  priceText: {
    color: '#0d101e',
    fontSize: 14,
    fontWeight: '800',
  },
  disclaimer: {
    color: NOVA_COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
});
