import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { NOVA_COLORS } from '../../src/theme/colors';
import { NovaHeader } from '../../src/components/nova/NovaHeader';
import { NovaBadge } from '../../src/components/nova/NovaBadge';
import { NovaButton } from '../../src/components/nova/NovaButton';
import { useEconomyStore } from '../../src/store/useEconomyStore';

const GEM_PACKS = [
  { id: 'g1', name: 'A little shine', gems: 50, price: '$0.99' },
  { id: 'g2', name: 'Bright ideas', gems: 250, price: '$3.99' },
  { id: 'g3', name: 'Pure magic', gems: 700, price: '$8.99' },
  { id: 'g4', name: 'Supernova', gems: 2000, price: '$19.99' },
];

export default function GemPacksScreen() {
  const router = useRouter();
  const { gems, creditGems } = useEconomyStore();

  const handleBuy = (pack: typeof GEM_PACKS[0]) => {
    creditGems(pack.gems);
    Alert.alert('Gems Acquired! 💎', `+${pack.gems} gems added to your balance.`);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <NovaHeader
        title="A little sparkle"
        subtitle="Gems for the things that make you smile."
        showBack={true}
        onBack={() => router.back()}
      />

      <View style={styles.content}>
        <NovaBadge
          label={`BALANCE  ${gems}`}
          color="mint"
          style={styles.balanceBadge}
        />

        <View style={styles.packsList}>
          {GEM_PACKS.map((pack) => (
            <TouchableOpacity
              key={pack.id}
              style={styles.packCard}
              onPress={() => handleBuy(pack)}
              activeOpacity={0.8}
            >
              <View style={styles.iconWrap}>
                <Ionicons name="diamond" size={24} color={NOVA_COLORS.accentMint} />
              </View>

              <View style={styles.packInfo}>
                <Text style={styles.packName}>{pack.name}</Text>
                <Text style={styles.gemsVal}>◇ {pack.gems}</Text>
              </View>

              <View style={styles.pricePill}>
                <Text style={styles.priceText}>{pack.price}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.disclaimer}>
          Purchases are optional. Gems have no cash value.
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
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(131, 230, 192, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  packInfo: {
    flex: 1,
  },
  packName: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  gemsVal: {
    color: NOVA_COLORS.accentMint,
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
