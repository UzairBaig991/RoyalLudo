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

export default function DiceCollectionScreen() {
  const router = useRouter();
  const { dice, equipDie, unlockDie } = useCustomizationStore();
  const { gems, debitGems } = useEconomyStore();

  const [tab, setTab] = useState<'owned' | 'all'>('owned');

  const equippedDie = dice.find((d) => d.equipped) || dice[0];

  const filteredDice = dice.filter((d) => {
    if (tab === 'owned' && !d.unlocked) return false;
    return true;
  });

  const handleSelectDie = (item: typeof dice[0]) => {
    if (item.unlocked) {
      equipDie(item.id);
    } else if (item.priceGems) {
      if (gems < item.priceGems) {
        Alert.alert('Need More Gems 💎', `You need ${item.priceGems} gems to unlock this skin.`);
        return;
      }
      debitGems(item.priceGems);
      unlockDie(item.id);
      equipDie(item.id);
      Alert.alert('Dice Unlocked! 🎲✨', `Unlocked and equipped ${item.name}!`);
    } else {
      Alert.alert('Special Reward', 'Unlock this die from the Season Pass or Special Events!');
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <NovaHeader
        title="Every roll, your style"
        subtitle="Your collection  ·  6 of 24 dice"
        showBack={true}
        onBack={() => router.back()}
      />

      <View style={styles.content}>
        {/* Tabs Row */}
        <View style={styles.tabsRow}>
          <TouchableOpacity onPress={() => setTab('owned')} activeOpacity={0.8}>
            <NovaBadge
              label="OWNED"
              color={tab === 'owned' ? 'purple' : 'gold'}
              style={styles.tabBadge}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setTab('all')} activeOpacity={0.8}>
            <NovaBadge
              label="ALL DICE"
              color={tab === 'all' ? 'purple' : 'mint'}
              style={styles.tabBadge}
            />
          </TouchableOpacity>
        </View>

        {/* Currently Equipped Hero Card */}
        <NovaCard variant="purple" style={styles.heroCard}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroName}>{equippedDie.name}</Text>
            <NovaBadge
              label={`EQUIPPED · ${equippedDie.rarity.toUpperCase()}`}
              color="mint"
              style={styles.heroBadge}
            />
          </View>
          <View style={styles.heroDieWrap}>
            <NovaDie
              value={5}
              size={64}
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
                <View style={styles.dieBox}>
                  <NovaDie
                    value={dieValue}
                    size={46}
                    theme={item.previewTheme}
                  />
                </View>
                <Text style={styles.diceTitle}>{item.name}</Text>
                <Text
                  style={[
                    styles.diceStatus,
                    item.equipped && styles.statusEquipped,
                  ]}
                >
                  {item.equipped
                    ? 'Equipped'
                    : item.unlocked
                    ? 'Owned'
                    : item.priceGems
                    ? `${item.priceGems} gems`
                    : 'Pass reward'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.disclaimer}>
          Cosmetic only. Every die has the same odds.
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
    marginBottom: 8,
  },
  heroBadge: {
    height: 24,
    borderRadius: 8,
    paddingHorizontal: 10,
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
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  diceCardEquipped: {
    borderColor: NOVA_COLORS.accentPurple,
    backgroundColor: '#1d233d',
  },
  dieBox: {
    marginVertical: 6,
  },
  diceTitle: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 2,
  },
  diceStatus: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 12,
  },
  statusEquipped: {
    color: NOVA_COLORS.accentPurple,
    fontWeight: '700',
  },
  disclaimer: {
    color: NOVA_COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
});
