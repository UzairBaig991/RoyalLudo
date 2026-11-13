import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ROYAL_COLORS } from '../../src/theme/colors';
import { RoyalCard } from '../../src/components/ui/RoyalCard';
import { RoyalButton } from '../../src/components/ui/RoyalButton';
import { CurrencyBadge } from '../../src/components/ui/CurrencyBadge';
import { useEconomyStore } from '../../src/store/useEconomyStore';
import { useAuthStore } from '../../src/store/useAuthStore';
import type { ShopItem } from '../../../shared/src/types';

export default function ShopScreen() {
  const { gold, gems, diceCatalog, boardCatalog, ownedItems, purchaseItem, addGold, addGems } = useEconomyStore();
  const { profile, updateProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'dice' | 'boards' | 'currency'>('dice');

  const handleBuy = (item: ShopItem) => {
    const success = purchaseItem(item);
    if (success) {
      Alert.alert('Purchase Successful! 🎉', `You unlocked the ${item.name}!`);
    } else {
      Alert.alert('Insufficient Balance', `You need more ${item.currency} to purchase this item.`);
    }
  };

  const handleEquip = (item: ShopItem) => {
    if (item.type === 'dice') {
      updateProfile({ equipped: { ...profile!.equipped, diceSkin: item.id } });
    } else if (item.type === 'board') {
      updateProfile({ equipped: { ...profile!.equipped, boardSkin: item.id } });
    }
    Alert.alert('Cosmetic Equipped', `${item.name} is now your active ${item.type}!`);
  };

  const items = activeTab === 'dice' ? diceCatalog : boardCatalog;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Balances Pill Header */}
        <View style={styles.balanceHeader}>
          <Text style={styles.shopTitle}>Royal Bazaar</Text>
          <View style={{ flexDirection: 'row' }}>
            <CurrencyBadge type="gold" amount={gold} />
            <View style={{ width: 8 }} />
            <CurrencyBadge type="gems" amount={gems} />
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabBar}>
          {(['dice', 'boards', 'currency'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'dice' ? '🎲 Dice Skins' : tab === 'boards' ? '🏰 Boards' : '🪙 Coin Packs'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Currency Packs Tab */}
        {activeTab === 'currency' ? (
          <View style={styles.currencyGrid}>
            {[
              { id: 'c1', goldAmt: 10000, price: '$0.99', badge: 'POPULAR' },
              { id: 'c2', goldAmt: 50000, price: '$3.99', badge: 'BEST VALUE' },
              { id: 'c3', goldAmt: 150000, price: '$9.99', badge: 'ROYAL CHEST' },
              { id: 'c4', goldAmt: 500000, price: '$24.99', badge: 'TREASURY' },
            ].map((pack) => (
              <RoyalCard key={pack.id} style={styles.packCard} goldBorder>
                <Text style={styles.packBadge}>{pack.badge}</Text>
                <Text style={{ fontSize: 36, marginVertical: 8 }}>🪙</Text>
                <Text style={styles.packGoldText}>{pack.goldAmt.toLocaleString()} Gold</Text>
                <RoyalButton
                  title={pack.price}
                  variant="gold"
                  size="small"
                  onPress={() => {
                    addGold(pack.goldAmt);
                    Alert.alert('Transaction Complete', `Added ${pack.goldAmt.toLocaleString()} Gold to your wallet!`);
                  }}
                  style={{ marginTop: 10, width: '100%' }}
                />
              </RoyalCard>
            ))}
          </View>
        ) : (
          /* Collectibles Grid (Dice and Boards) */
          <View style={styles.catalogGrid}>
            {items.map((item) => {
              const isOwned = ownedItems.includes(item.id);
              const isEquipped =
                item.type === 'dice'
                  ? profile?.equipped.diceSkin === item.id
                  : profile?.equipped.boardSkin === item.id;

              return (
                <RoyalCard key={item.id} style={styles.itemCard} goldBorder={item.rarity === 'royal'}>
                  <View style={styles.itemHeader}>
                    <Text style={[styles.rarityText, { color: item.rarity === 'legendary' ? '#F59E0B' : item.rarity === 'epic' ? '#A855F7' : ROYAL_COLORS.gold }]}>
                      {item.rarity.toUpperCase()}
                    </Text>
                    {isEquipped && <Text style={styles.equippedBadge}>EQUIPPED</Text>}
                  </View>

                  <View style={styles.itemPreviewBox}>
                    <Text style={{ fontSize: 44 }}>{item.type === 'dice' ? '🎲' : '🏰'}</Text>
                  </View>

                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>

                  {isOwned ? (
                    <RoyalButton
                      title={isEquipped ? 'IN USE' : 'EQUIP'}
                      variant={isEquipped ? 'secondary' : 'gold'}
                      size="small"
                      disabled={isEquipped}
                      onPress={() => handleEquip(item)}
                      style={{ marginTop: 10 }}
                    />
                  ) : (
                    <RoyalButton
                      title={`${item.cost.toLocaleString()} ${item.currency === 'gold' ? '🪙' : '💎'}`}
                      variant="gold"
                      size="small"
                      onPress={() => handleBuy(item)}
                      style={{ marginTop: 10 }}
                    />
                  )}
                </RoyalCard>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ROYAL_COLORS.primaryBg,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  shopTitle: {
    color: ROYAL_COLORS.gold,
    fontSize: 22,
    fontWeight: '900',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: ROYAL_COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ROYAL_COLORS.border,
    padding: 4,
    marginBottom: 20,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: ROYAL_COLORS.gold,
  },
  tabText: {
    color: ROYAL_COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#0A0F1D',
    fontWeight: '800',
  },
  catalogGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemCard: {
    width: '48%',
    padding: 12,
    marginBottom: 14,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  rarityText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  equippedBadge: {
    color: ROYAL_COLORS.green,
    fontSize: 9,
    fontWeight: '800',
  },
  itemPreviewBox: {
    height: 80,
    borderRadius: 12,
    backgroundColor: ROYAL_COLORS.surfaceBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  itemName: {
    color: ROYAL_COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  itemDesc: {
    color: ROYAL_COLORS.textSecondary,
    fontSize: 10,
    lineHeight: 14,
  },
  currencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  packCard: {
    width: '48%',
    padding: 16,
    alignItems: 'center',
    marginBottom: 14,
    position: 'relative',
  },
  packBadge: {
    color: ROYAL_COLORS.gold,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  packGoldText: {
    color: ROYAL_COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
});
