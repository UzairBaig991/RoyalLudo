import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useEconomyStore } from '../../src/store/useEconomyStore';

export default function ShopScreen() {
  const { profile } = useAuthStore();
  const { gold, gems, addGold, addGems } = useEconomyStore();

  const handleBuyCoins = (amount: number, priceStr: string) => {
    addGold(amount);
    Alert.alert('Coins Purchased! 🪙', `Successfully added ${amount.toLocaleString()} Gold Coins to your wallet!`);
  };

  const handleBuyGems = (amount: number, priceStr: string) => {
    addGems(amount);
    Alert.alert('Gems Purchased! 💎', `Successfully added ${amount} Gems to your wallet!`);
  };

  const handleBuyVip = () => {
    Alert.alert('Royal VIP Activated! 👑', 'Welcome to Royal VIP! Enjoy 2x XP, golden name tag and exclusive VIP frames!');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>ROYAL SHOP</Text>
          <Text style={styles.headerSub}>Coins, Gems & VIP Pass</Text>
        </View>
        <View style={styles.walletRow}>
          <Text style={styles.walletBadge}>🪙 {gold.toLocaleString()}</Text>
          <Text style={styles.walletBadge}>💎 {gems}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* VIP Pass Hero Card */}
        <View style={styles.vipCard}>
          <View style={styles.vipHeader}>
            <Text style={{ fontSize: 32 }}>👑</Text>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.vipTitle}>ROYAL VIP PASS</Text>
              <Text style={styles.vipSub}>2x XP • Golden Chat Badge • Exclusive Frames</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.vipBtn} onPress={handleBuyVip}>
            <Text style={styles.vipBtnText}>UNLOCK VIP ($4.99 / MO)</Text>
          </TouchableOpacity>
        </View>

        {/* COIN PACKAGES */}
        <Text style={styles.sectionHeader}>🪙 GOLD COIN PACKAGES</Text>
        <View style={styles.packsGrid}>
          {[
            { amount: 10000, price: '$0.99', popular: false },
            { amount: 50000, price: '$2.99', popular: true },
            { amount: 250000, price: '$9.99', popular: false },
            { amount: 1000000, price: '$29.99', popular: false },
          ].map((pack) => (
            <View key={pack.amount} style={styles.packCard}>
              {pack.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>BEST VALUE</Text>
                </View>
              )}
              <Text style={{ fontSize: 36, marginVertical: 6 }}>🪙</Text>
              <Text style={styles.packAmount}>{pack.amount.toLocaleString()}</Text>
              <Text style={styles.packCoinsLabel}>Gold Coins</Text>
              <TouchableOpacity
                style={styles.buyBtn}
                onPress={() => handleBuyCoins(pack.amount, pack.price)}
              >
                <Text style={styles.buyBtnText}>{pack.price}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* GEM PACKAGES */}
        <Text style={styles.sectionHeader}>💎 GREEN GEM PACKAGES</Text>
        <View style={styles.packsGrid}>
          {[
            { amount: 50, price: '$1.99', popular: false },
            { amount: 250, price: '$7.99', popular: true },
            { amount: 1000, price: '$24.99', popular: false },
          ].map((pack) => (
            <View key={pack.amount} style={styles.packCard}>
              {pack.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>POPULAR</Text>
                </View>
              )}
              <Text style={{ fontSize: 36, marginVertical: 6 }}>💎</Text>
              <Text style={styles.packAmount}>{pack.amount}</Text>
              <Text style={styles.packCoinsLabel}>Gems</Text>
              <TouchableOpacity
                style={[styles.buyBtn, { backgroundColor: '#27AE70' }]}
                onPress={() => handleBuyGems(pack.amount, pack.price)}
              >
                <Text style={styles.buyBtnText}>{pack.price}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* CAREER STATS */}
        <Text style={styles.sectionHeader}>📊 CAREER STATISTICS</Text>
        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Player</Text>
            <Text style={styles.statVal}>{profile?.username || 'Govind'}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Matches Played</Text>
            <Text style={styles.statVal}>142</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Win Rate</Text>
            <Text style={styles.statVal}>68.4% (97 Wins)</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Highest Win Streak</Text>
            <Text style={styles.statVal}>🔥 9 Wins</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Tokens Knocked Out</Text>
            <Text style={styles.statVal}>⚔️ 384</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Gold Won</Text>
            <Text style={[styles.statVal, { color: '#FFDF00' }]}>2,480,000 🪙</Text>
          </View>
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#370A36',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#521350',
    backgroundColor: '#2F062E',
  },
  headerTitle: {
    color: '#FFDF00',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  headerSub: {
    color: '#E6C985',
    fontSize: 11,
    fontWeight: '700',
  },
  walletRow: {
    flexDirection: 'row',
  },
  walletBadge: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
    backgroundColor: '#1E051E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 6,
    borderWidth: 1,
    borderColor: '#752273',
  },
  scrollContent: {
    padding: 14,
  },
  vipCard: {
    backgroundColor: '#521350',
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FFDF00',
  },
  vipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  vipTitle: {
    color: '#FFDF00',
    fontSize: 16,
    fontWeight: '900',
  },
  vipSub: {
    color: '#D4B8D3',
    fontSize: 11,
    marginTop: 2,
  },
  vipBtn: {
    backgroundColor: '#FFDF00',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  vipBtnText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '900',
  },
  sectionHeader: {
    color: '#E6C985',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 6,
  },
  packsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  packCard: {
    width: '48%',
    backgroundColor: '#521350',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#752273',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    backgroundColor: '#E74C4C',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  popularText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '900',
  },
  packAmount: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
  },
  packCoinsLabel: {
    color: '#E6C985',
    fontSize: 11,
    marginBottom: 8,
  },
  buyBtn: {
    backgroundColor: '#FFDF00',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
  },
  buyBtnText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '900',
  },
  statsCard: {
    backgroundColor: '#521350',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#752273',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2F062E',
  },
  statLabel: {
    color: '#D4B8D3',
    fontSize: 12,
    fontWeight: '700',
  },
  statVal: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
