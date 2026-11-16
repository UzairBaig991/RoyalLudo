import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { NOVA_COLORS } from '../../src/theme/colors';
import { NovaHeader } from '../../src/components/nova/NovaHeader';
import { NovaBadge } from '../../src/components/nova/NovaBadge';
import { NovaBoardPreview } from '../../src/components/nova/NovaBoardPreview';
import { useCustomizationStore } from '../../src/store/useCustomizationStore';
import { useEconomyStore } from '../../src/store/useEconomyStore';

export default function BoardThemesScreen() {
  const router = useRouter();
  const { boards, equipBoard } = useCustomizationStore();
  const { gems, debitGems } = useEconomyStore();

  const handleSelectBoard = (item: typeof boards[0]) => {
    if (item.unlocked) {
      equipBoard(item.id);
    } else if (item.priceGems) {
      if (gems < item.priceGems) {
        Alert.alert('Need More Gems 💎', `You need ${item.priceGems} gems to unlock this board.`);
        return;
      }
      debitGems(item.priceGems);
      equipBoard(item.id);
      Alert.alert('Board Unlocked! 🎨', `Unlocked and equipped ${item.name}!`);
    } else {
      Alert.alert('Season Pass Reward', 'Unlock this board from Season Pass tier rewards!');
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <NovaHeader
        title="Set the scene"
        subtitle="A fresh board. The same favorite game."
        showBack={true}
        onBack={() => router.back()}
      />

      <View style={styles.content}>
        <View style={styles.list}>
          {boards.map((b) => (
            <TouchableOpacity
              key={b.id}
              style={[
                styles.boardCard,
                b.equipped && styles.boardCardEquipped,
              ]}
              onPress={() => handleSelectBoard(b)}
              activeOpacity={0.8}
            >
              <View style={styles.previewWrap}>
                <NovaBoardPreview size={120} />
              </View>

              <View style={styles.boardInfo}>
                <Text style={styles.boardTitle}>{b.name}</Text>
                <NovaBadge
                  label={
                    b.equipped
                      ? 'EQUIPPED'
                      : b.unlocked
                      ? 'OWNED'
                      : b.priceGems
                      ? `${b.priceGems} GEMS`
                      : 'SEASON REWARD'
                  }
                  color={b.equipped ? 'mint' : 'purple'}
                  style={styles.boardBadge}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.disclaimer}>
          Themes never change the rules or your odds.
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
  list: {
    marginBottom: 16,
  },
  boardCard: {
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  boardCardEquipped: {
    borderColor: NOVA_COLORS.accentPurple,
    backgroundColor: '#1d233d',
  },
  previewWrap: {
    marginRight: 16,
  },
  boardInfo: {
    flex: 1,
  },
  boardTitle: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  boardBadge: {
    height: 24,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  disclaimer: {
    color: NOVA_COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
});
