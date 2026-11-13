import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEconomyStore } from '../../src/store/useEconomyStore';

const { width } = Dimensions.get('window');

interface DiceSkin {
  id: string;
  name: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  price: number;
  currency: 'gold' | 'gems';
  icon: string;
  trailColor: string;
  description: string;
}

const DICE_VAULT: DiceSkin[] = [
  { id: 'dice_01', name: 'Classic Ivory', rarity: 'Common', price: 0, currency: 'gold', icon: '🎲', trailColor: '#FFF', description: 'Traditional white bone dice with polished black pips.' },
  { id: 'dice_02', name: 'Royal Gold', rarity: 'Rare', price: 5000, currency: 'gold', icon: '🪙', trailColor: '#FFDF00', description: 'Solid 24k polished gold with sparkling glint effect.' },
  { id: 'dice_03', name: 'Ruby Flame', rarity: 'Rare', price: 7500, currency: 'gold', icon: '🔥', trailColor: '#FF4136', description: 'Fiery red gemstone carved in active molten flames.' },
  { id: 'dice_04', name: 'Emerald Dragon', rarity: 'Rare', price: 10000, currency: 'gold', icon: '🐉', trailColor: '#2ECC40', description: 'Scaly green texture imbued with dragon fire breath.' },
  { id: 'dice_05', name: 'Diamond Ice', rarity: 'Epic', price: 20000, currency: 'gold', icon: '💎', trailColor: '#7FDBFF', description: 'Glacial crystalline cube with freezing frost aura.' },
  { id: 'dice_06', name: 'Cyber Neon', rarity: 'Epic', price: 30000, currency: 'gold', icon: '⚡', trailColor: '#01FF70', description: 'Futuristic grid lines pulsing with synthwave neon.' },
  { id: 'dice_07', name: 'Galaxy Nebula', rarity: 'Legendary', price: 50, currency: 'gems', icon: '🌌', trailColor: '#B10DC9', description: 'Swirling deep space cosmos with glittering stars.' },
  { id: 'dice_08', name: 'Pirate Skull', rarity: 'Epic', price: 25000, currency: 'gold', icon: '☠️', trailColor: '#AAAAAA', description: 'Carved pirate relic with bone crossbones pips.' },
  { id: 'dice_09', name: 'Phoenix Fire', rarity: 'Legendary', price: 75, currency: 'gems', icon: '🦅', trailColor: '#FF851B', description: 'Reborn in golden embers with flying feather trail.' },
  { id: 'dice_10', name: 'Obsidian Shadow', rarity: 'Rare', price: 12000, currency: 'gold', icon: '🖤', trailColor: '#333333', description: 'Dark volcanic glass with mysterious purple smoke.' },
  { id: 'dice_11', name: 'Amethyst Royalty', rarity: 'Rare', price: 15000, currency: 'gold', icon: '🔮', trailColor: '#9B51E0', description: 'Deep purple crystal radiating royal mystical magic.' },
  { id: 'dice_12', name: 'Steampunk Brass', rarity: 'Epic', price: 35000, currency: 'gold', icon: '⚙️', trailColor: '#D35400', description: 'Rotating brass clockwork gears and copper rivets.' },
  { id: 'dice_13', name: 'Cosmic Vortex', rarity: 'Legendary', price: 100, currency: 'gems', icon: '🌀', trailColor: '#6C5CE7', description: 'Miniature black hole warping spacetime around rolls.' },
  { id: 'dice_14', name: 'Toxic Slime', rarity: 'Rare', price: 8000, currency: 'gold', icon: '🧪', trailColor: '#A8E6CF', description: 'Bioluminescent green sludge with bubbling droplets.' },
  { id: 'dice_15', name: 'Electric Surge', rarity: 'Epic', price: 28000, currency: 'gold', icon: '⚡', trailColor: '#FFD700', description: 'Crackling blue lightning arcs bridging the edges.' },
  { id: 'dice_16', name: 'Celestial Pearl', rarity: 'Epic', price: 40000, currency: 'gold', icon: '🦪', trailColor: '#F5F6FA', description: 'Iridescent pearl shimmering with soft pastel rainbow.' },
  { id: 'dice_17', name: 'Vampire Blood', rarity: 'Rare', price: 18000, currency: 'gold', icon: '🩸', trailColor: '#C0392B', description: 'Crimson ruby pulsing with gothic blood droplets.' },
  { id: 'dice_18', name: 'Golden Pharaoh', rarity: 'Legendary', price: 120, currency: 'gems', icon: '🏺', trailColor: '#F1C40F', description: 'Ancient Egyptian gold infused with sun god Ra power.' },
  { id: 'dice_19', name: 'Mystic Rune', rarity: 'Epic', price: 32000, currency: 'gold', icon: '📜', trailColor: '#00CEC9', description: 'Ancient carved Norse runes glowing upon rolling sixes.' },
  { id: 'dice_20', name: 'Frostbite Frost', rarity: 'Rare', price: 14000, currency: 'gold', icon: '❄️', trailColor: '#74B9FF', description: 'Frozen ice cube leaving icy trails on board tiles.' },
  { id: 'dice_21', name: 'Magma Core', rarity: 'Epic', price: 45000, currency: 'gold', icon: '🌋', trailColor: '#E17055', description: 'Cracked earth with glowing volcanic magma chambers.' },
  { id: 'dice_22', name: 'Sakura Blossom', rarity: 'Rare', price: 16000, currency: 'gold', icon: '🌸', trailColor: '#FD79A8', description: 'Delicate pink cherry blossom petals fluttering around.' },
  { id: 'dice_23', name: 'Rainbow Prism', rarity: 'Legendary', price: 150, currency: 'gems', icon: '🌈', trailColor: '#FF7675', description: 'Splits sunlight into vibrant spectrum upon every stop.' },
  { id: 'dice_24', name: 'Ludo Star Crown', rarity: 'Legendary', price: 200, currency: 'gems', icon: '👑', trailColor: '#FFDF00', description: 'The ultimate royal dice with solid crown emblem on 6!' },
];

export default function CollectionsScreen() {
  const { gold, gems, debitGold, debitGems } = useEconomyStore();
  const [unlockedDice, setUnlockedDice] = useState<string[]>(['dice_01']);
  const [equippedDice, setEquippedDice] = useState<string>('dice_01');

  const handleEquipOrBuy = (dice: DiceSkin) => {
    if (unlockedDice.includes(dice.id)) {
      setEquippedDice(dice.id);
      Alert.alert('Dice Equipped! 🎲', `You equipped "${dice.name}"!`);
      return;
    }

    // Buy
    if (dice.currency === 'gold') {
      if (gold < dice.price) {
        Alert.alert('Insufficient Gold 🪙', `You need ${dice.price.toLocaleString()} gold to unlock this dice!`);
        return;
      }
      debitGold(dice.price);
    } else {
      if (gems < dice.price) {
        Alert.alert('Insufficient Gems 💎', `You need ${dice.price} gems to unlock this dice!`);
        return;
      }
      debitGems(dice.price);
    }

    setUnlockedDice([...unlockedDice, dice.id]);
    setEquippedDice(dice.id);
    Alert.alert('Dice Unlocked & Equipped! 🎉', `Congratulations! You unlocked the legendary "${dice.name}"!`);
  };

  const getRarityColor = (rarity: DiceSkin['rarity']) => {
    switch (rarity) {
      case 'Legendary': return '#FFDF00';
      case 'Epic': return '#B10DC9';
      case 'Rare': return '#3986D9';
      default: return '#AAAAAA';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>DICE COLLECTIONS</Text>
          <Text style={styles.headerSub}>24 Collectible 3D Dice Skins</Text>
        </View>
        <View style={styles.walletRow}>
          <Text style={styles.walletBadge}>🪙 {gold.toLocaleString()}</Text>
          <Text style={styles.walletBadge}>💎 {gems}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {DICE_VAULT.map((dice) => {
            const isUnlocked = unlockedDice.includes(dice.id);
            const isEquipped = equippedDice === dice.id;
            const rarityColor = getRarityColor(dice.rarity);

            return (
              <View
                key={dice.id}
                style={[
                  styles.diceCard,
                  isEquipped && styles.diceCardEquipped,
                ]}
              >
                {/* Rarity Pill */}
                <View style={[styles.rarityPill, { borderColor: rarityColor }]}>
                  <Text style={[styles.rarityText, { color: rarityColor }]}>
                    {dice.rarity.toUpperCase()}
                  </Text>
                </View>

                {/* Dice Graphic */}
                <View style={styles.diceGraphicBox}>
                  <Text style={{ fontSize: 44 }}>{dice.icon}</Text>
                </View>

                {/* Dice Name */}
                <Text style={styles.diceName} numberOfLines={1}>
                  {dice.name}
                </Text>
                <Text style={styles.diceDesc} numberOfLines={2}>
                  {dice.description}
                </Text>

                {/* Button: Equip / Equipped / Price */}
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    isEquipped
                      ? styles.actionBtnEquipped
                      : isUnlocked
                      ? styles.actionBtnEquip
                      : styles.actionBtnBuy,
                  ]}
                  onPress={() => handleEquipOrBuy(dice)}
                >
                  <Text style={styles.actionBtnText}>
                    {isEquipped
                      ? '✓ EQUIPPED'
                      : isUnlocked
                      ? 'EQUIP'
                      : dice.price === 0
                      ? 'FREE'
                      : `${dice.currency === 'gold' ? '🪙' : '💎'} ${dice.price.toLocaleString()}`}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
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
    padding: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  diceCard: {
    width: (width - 34) / 2,
    backgroundColor: '#521350',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#752273',
    alignItems: 'center',
  },
  diceCardEquipped: {
    borderColor: '#FFDF00',
    borderWidth: 2.5,
    backgroundColor: '#631B61',
  },
  rarityPill: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 6,
  },
  rarityText: {
    fontSize: 9,
    fontWeight: '900',
  },
  diceGraphicBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#2F062E',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#752273',
  },
  diceName: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 2,
  },
  diceDesc: {
    color: '#D4B8D3',
    fontSize: 10,
    textAlign: 'center',
    height: 26,
    marginBottom: 8,
  },
  actionBtn: {
    width: '100%',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionBtnEquipped: {
    backgroundColor: '#27AE70',
  },
  actionBtnEquip: {
    backgroundColor: '#3986D9',
  },
  actionBtnBuy: {
    backgroundColor: '#F5A623',
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '900',
  },
});
