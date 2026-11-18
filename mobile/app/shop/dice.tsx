import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { NOVA_COLORS } from '../../src/theme/colors';
import { NovaHeader } from '../../src/components/nova/NovaHeader';
import { NovaBadge } from '../../src/components/nova/NovaBadge';
import { NovaCard } from '../../src/components/nova/NovaCard';
import { NovaDie } from '../../src/components/nova/NovaDie';
import { useCustomizationStore } from '../../src/store/useCustomizationStore';
import { useEconomyStore } from '../../src/store/useEconomyStore';
import { soundEffects as sfxEngine } from '../../src/utils/soundEffects';

export default function DiceCollectionScreen() {
  const router = useRouter();
  const { dice, equipDie, unlockDie } = useCustomizationStore();
  const { gems, gold, debitGems, debitGold } = useEconomyStore();

  const [tab, setTab] = useState<'all' | 'owned'>('all');
  const [previewRollVal, setPreviewRollVal] = useState<number>(6);
  const [isTestRolling, setIsTestRolling] = useState<boolean>(false);

  const equippedDie = dice.find((d) => d.equipped) || dice[0];
  const ownedCount = dice.filter((d) => d.unlocked).length;

  const filteredDice = dice.filter((d) => {
    if (tab === 'owned' && !d.unlocked) return false;
    return true;
  });

  const handleTestRoll = () => {
    if (isTestRolling) return;
    sfxEngine.playDiceRoll();
    setIsTestRolling(true);
    setTimeout(() => {
      const nextVal = Math.floor(Math.random() * 6) + 1;
      setPreviewRollVal(nextVal);
      setIsTestRolling(false);
      if (nextVal === 6) sfxEngine.playRollSix();
    }, 450);
  };

  const handleSelectDie = (item: typeof dice[0]) => {
    if (item.unlocked) {
      sfxEngine.playTokenStep();
      equipDie(item.id);
      return;
    }

    if (item.priceGems && gems >= item.priceGems) {
      debitGems(item.priceGems);
      unlockDie(item.id);
      equipDie(item.id);
      sfxEngine.playPowerUp();
      Alert.alert('Dice Skin Unlocked! 🎲✨', `Unlocked and equipped ${item.name} with ${item.priceGems} gems!`);
      return;
    }

    if (item.priceCoins && gold >= item.priceCoins) {
      debitGold(item.priceCoins);
      unlockDie(item.id);
      equipDie(item.id);
      sfxEngine.playPowerUp();
      Alert.alert(
        'Dice Skin Unlocked! 🎲✨',
        `Unlocked and equipped ${item.name} with ${item.priceCoins.toLocaleString()} coins!`
      );
      return;
    }

    Alert.alert(
      'Unlock Dice Skin 🎲',
      `You need ${item.priceGems || 30} gems or ${(item.priceCoins || 3000).toLocaleString()} coins to unlock ${item.name}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Get Gems (Rs.)', onPress: () => router.push('/shop/gems' as any) },
      ]
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <NovaHeader
        title="Dice Skin Customizer"
        subtitle={`Your collection  ·  ${ownedCount} of ${dice.length} dice skins`}
        showBack={true}
        onBack={() => router.back()}
      />

      <View style={styles.content}>
        {/* Tabs & Balance Row */}
        <View style={styles.tabsRow}>
          <TouchableOpacity onPress={() => setTab('all')} activeOpacity={0.8}>
            <NovaBadge
              label={`ALL SKINS (${dice.length})`}
              color={tab === 'all' ? 'purple' : 'mint'}
              style={styles.tabBadge}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setTab('owned')} activeOpacity={0.8}>
            <NovaBadge
              label={`OWNED (${ownedCount})`}
              color={tab === 'owned' ? 'purple' : 'gold'}
              style={styles.tabBadge}
            />
          </TouchableOpacity>

          <View style={{ marginLeft: 'auto', flexDirection: 'row', gap: 6 }}>
            <NovaBadge label={`◈ ${gold.toLocaleString()}`} color="gold" />
            <NovaBadge label={`◇ ${gems}`} color="mint" />
          </View>
        </View>

        {/* Currently Equipped Hero Card with Interactive Test Roll */}
        <NovaCard variant="purple" style={styles.heroCard}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroName}>{equippedDie.name}</Text>
            {equippedDie.description && (
              <Text style={styles.heroDesc}>{equippedDie.description}</Text>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <NovaBadge
                label={`EQUIPPED · ${equippedDie.rarity.toUpperCase()}`}
                color="mint"
                style={styles.heroBadge}
              />
              <TouchableOpacity
                style={styles.testRollBtn}
                onPress={handleTestRoll}
                activeOpacity={0.8}
              >
                <Text style={styles.testRollBtnText}>
                  {isTestRolling ? 'Rolling…' : '🎲 Test Roll'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.heroDieWrap}>
            <NovaDie
              value={previewRollVal}
              size={66}
              rolling={isTestRolling}
              onPress={handleTestRoll}
              theme={equippedDie.previewTheme}
            />
          </View>
        </NovaCard>

        {/* Dice Grid */}
        <View style={styles.grid}>
          {filteredDice.map((item, index) => {
            const dieValue = (index % 6) + 1;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.diceCard,
                  item.equipped && styles.diceCardEquipped,
                ]}
                onPress={() => handleSelectDie(item)}
                activeOpacity={0.8}
              >
                <View style={styles.rarityPill}>
                  <Text style={styles.rarityPillText}>{item.rarity.toUpperCase()}</Text>
                </View>
                <View style={styles.dieBox}>
                  <NovaDie
                    value={dieValue}
                    size={48}
                    theme={item.previewTheme}
                  />
                </View>
                <Text style={styles.diceTitle}>{item.name}</Text>
                {item.description && (
                  <Text style={styles.diceDesc} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}
                <View
                  style={[
                    styles.actionTag,
                    item.equipped
                      ? styles.actionTagEquipped
                      : item.unlocked
                      ? styles.actionTagOwned
                      : styles.actionTagLocked,
                  ]}
                >
                  <Text
                    style={[
                      styles.diceStatus,
                      item.equipped && styles.statusEquipped,
                    ]}
                  >
                    {item.equipped
                      ? '✓ Equipped'
                      : item.unlocked
                      ? 'Tap to Equip'
                      : `◇ ${item.priceGems} or ◈ ${(item.priceCoins || 3000).toLocaleString()}`}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.disclaimer}>
          Cosmetic only. Every die skin has the same fair odds.
        </Text>
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
  tabsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tabBadge: {
    marginRight: 10,
  },
  heroCard: {
    padding: 20,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  heroLeft: {
    flex: 1,
  },
  heroName: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  heroDesc: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
  heroBadge: {
    height: 24,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  testRollBtn: {
    backgroundColor: NOVA_COLORS.accentGold,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  testRollBtnText: {
    color: '#0d101e',
    fontSize: 11,
    fontWeight: '800',
  },
  heroDieWrap: {
    marginLeft: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  diceCard: {
    width: '48%',
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  diceCardEquipped: {
    borderColor: NOVA_COLORS.accentPurple,
    backgroundColor: '#1d233d',
  },
  rarityPill: {
    backgroundColor: 'rgba(185, 162, 255, 0.14)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  rarityPillText: {
    color: NOVA_COLORS.accentPurple,
    fontSize: 9,
    fontWeight: '800',
  },
  dieBox: {
    marginVertical: 6,
  },
  diceTitle: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 2,
  },
  diceDesc: {
    color: NOVA_COLORS.textMuted,
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 13,
    marginBottom: 8,
    minHeight: 26,
  },
  actionTag: {
    width: '100%',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionTagEquipped: {
    backgroundColor: 'rgba(131, 230, 192, 0.18)',
  },
  actionTagOwned: {
    backgroundColor: 'rgba(185, 162, 255, 0.18)',
  },
  actionTagLocked: {
    backgroundColor: 'rgba(255, 211, 123, 0.15)',
  },
  diceStatus: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  statusEquipped: {
    color: NOVA_COLORS.accentMint,
    fontWeight: '800',
  },
  disclaimer: {
    color: NOVA_COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
});
