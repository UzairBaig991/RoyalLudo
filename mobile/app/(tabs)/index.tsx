import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { NOVA_COLORS } from '../../src/theme/colors';
import { NovaBadge } from '../../src/components/nova/NovaBadge';
import { NovaDie } from '../../src/components/nova/NovaDie';
import { NovaButton } from '../../src/components/nova/NovaButton';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useEconomyStore } from '../../src/store/useEconomyStore';
import { useSocialStore } from '../../src/store/useSocialStore';
import { useCustomizationStore } from '../../src/store/useCustomizationStore';
import { useGameStore } from '../../src/store/useGameStore';
import { soundEffects as sfxEngine } from '../../src/utils/soundEffects';

export default function HomeLobbyScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const { gold, gems } = useEconomyStore();
  const { inbox } = useSocialStore();
  const { dice, equipDie } = useCustomizationStore();
  const { startNewGame } = useGameStore();
  const equippedDie = dice.find((d) => d.equipped) || dice[0];

  const [homeDieValue, setHomeDieValue] = useState<number>(6);
  const [homeDieRolling, setHomeDieRolling] = useState<boolean>(false);

  const handleTestRollHomeDie = () => {
    if (homeDieRolling) return;
    sfxEngine.playDiceRoll();
    setHomeDieRolling(true);
    setTimeout(() => {
      const nextVal = Math.floor(Math.random() * 6) + 1;
      setHomeDieValue(nextVal);
      setHomeDieRolling(false);
    }, 380);
  };

  const handleCycleDiceSkin = () => {
    sfxEngine.playTokenStep();
    const unlockedSkins = dice.filter((d) => d.unlocked);
    const curIdx = unlockedSkins.findIndex((d) => d.id === equippedDie.id);
    const nextSkin = unlockedSkins[(curIdx + 1) % unlockedSkins.length] || unlockedSkins[0];
    if (nextSkin) {
      equipDie(nextSkin.id);
    }
  };

  const handleInstantMatch = (playerCount: 2 | 4) => {
    sfxEngine.playTokenStep();
    const myName = profile?.username || 'You';
    startNewGame({
      mode: 'classic',
      playerCount,
      randomizeTurn: true,
      players:
        playerCount === 2
          ? [
              { id: profile?.id || 'usr_me', username: myName, isBot: false },
              { id: 'usr_companion', username: 'Companion (Yellow)', isBot: true },
            ]
          : [
              { id: profile?.id || 'usr_me', username: myName, isBot: false },
              { id: 'b1', username: 'Maya', isBot: true },
              { id: 'b2', username: 'Zara', isBot: true },
              { id: 'b3', username: 'Sam', isBot: true },
            ],
    });
    router.push({
      pathname: '/gameplay/[matchId]',
      params: { matchId: `instant_${Date.now()}`, mode: 'classic', players: playerCount.toString() },
    } as any);
  };

  const unreadCount = inbox.filter((i) => !i.claimed).length;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      {/* 1. Top Bar */}
      <View style={styles.statusBarMock}>
        <Text style={styles.clock}>9:41</Text>
        <Text style={styles.signal}>{`▰  ▰  ▱`}</Text>
      </View>

      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.playerInfo}
          onPress={() => router.push('/(tabs)/profile' as any)}
          activeOpacity={0.8}
        >
          <View style={styles.avatarCircle}>
            <View style={styles.avatarInner} />
          </View>
          <View style={styles.nameBlock}>
            <Text style={styles.greetingText}>GOOD EVENING</Text>
            <Text style={styles.playerName}>{profile?.username || 'Alex Nova'}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push('/settings' as any)}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={22} color={NOVA_COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* 2. Badges Row */}
      <View style={styles.badgesRow}>
        <TouchableOpacity
          onPress={() => router.push('/shop/coins' as any)}
          activeOpacity={0.8}
        >
          <NovaBadge
            label={`◈  ${gold.toLocaleString()}`}
            color="gold"
            style={styles.currencyBadge}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/shop/gems' as any)}
          activeOpacity={0.8}
        >
          <NovaBadge
            label={`◇  ${gems.toLocaleString()}`}
            color="mint"
            style={styles.currencyBadge}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.mailButton}
          onPress={() => router.push('/social/inbox' as any)}
          activeOpacity={0.7}
        >
          <Ionicons name="mail-outline" size={22} color={NOVA_COLORS.textPrimary} />
          {unreadCount > 0 && <View style={styles.unreadDot} />}
        </TouchableOpacity>
      </View>

      {/* 3. Hero Banner (Surface #30254e) */}
      <View style={styles.heroCard}>
        <View style={styles.heroLeft}>
          <NovaBadge
            label="YOUR NEXT GREAT GAME"
            color="purple"
            style={styles.heroBadge}
          />
          <Text style={styles.heroTitle}>Good times.{'\n'}Great rolls.</Text>
          <Text style={styles.heroSubtitle}>The classic, with a little more magic.</Text>
          <NovaButton
            title="Play online"
            variant="primary"
            onPress={() => router.push('/modes/classic' as any)}
            style={styles.playOnlineBtn}
          />
        </View>

        <View style={[styles.heroDieWrap, { alignItems: 'center' }]}>
          <NovaDie
            value={homeDieValue}
            size={66}
            rolling={homeDieRolling}
            onPress={handleTestRollHomeDie}
            theme={equippedDie.previewTheme}
          />
          <TouchableOpacity
            onPress={handleCycleDiceSkin}
            activeOpacity={0.75}
            style={{
              backgroundColor: 'rgba(255, 211, 123, 0.16)',
              borderWidth: 1,
              borderColor: NOVA_COLORS.accentGold,
              borderRadius: 8,
              paddingHorizontal: 8,
              paddingVertical: 3,
              marginTop: 6,
            }}
          >
            <Text style={{ color: NOVA_COLORS.accentGold, fontSize: 10, fontWeight: '800', textAlign: 'center' }}>
              🔄 {equippedDie.name}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3.5. Instant 1-Tap Quick Start Strip */}
      <Text style={styles.sectionTitle}>⚡ Instant 1-Tap Play</Text>
      <View style={styles.modeCardsRow}>
        <TouchableOpacity
          style={[styles.modeCard, { borderWidth: 1.5, borderColor: NOVA_COLORS.accentGold }]}
          onPress={() => handleInstantMatch(2)}
          activeOpacity={0.8}
        >
          <View style={[styles.modeIconCircle, { backgroundColor: 'rgba(255, 211, 123, 0.16)' }]}>
            <Ionicons name="flash" size={22} color={NOVA_COLORS.accentGold} />
          </View>
          <Text style={styles.modeTitle}>1v1 Quick Duel</Text>
          <Text style={styles.modeSubtitle}>Instant start · Random turn toss</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeCard, { borderWidth: 1.5, borderColor: NOVA_COLORS.accentMint }]}
          onPress={() => handleInstantMatch(4)}
          activeOpacity={0.8}
        >
          <View style={[styles.modeIconCircle, { backgroundColor: 'rgba(131, 230, 192, 0.16)' }]}>
            <Ionicons name="trophy" size={22} color={NOVA_COLORS.accentMint} />
          </View>
          <Text style={styles.modeTitle}>4P Royal Table</Text>
          <Text style={styles.modeSubtitle}>4 players · Full classic board</Text>
        </TouchableOpacity>
      </View>

      {/* 4. Section: Your kind of game */}
      <Text style={styles.sectionTitle}>Your kind of game</Text>

      <View style={styles.modeCardsRow}>
        {/* Card 1: Team up */}
        <TouchableOpacity
          style={styles.modeCard}
          onPress={() => router.push('/modes/team' as any)}
          activeOpacity={0.8}
        >
          <View style={styles.modeIconCircle}>
            <Ionicons name="shield-outline" size={22} color={NOVA_COLORS.accentPurple} />
          </View>
          <Text style={styles.modeTitle}>Team up</Text>
          <Text style={styles.modeSubtitle}>Win together</Text>
        </TouchableOpacity>

        {/* Card 2: With friends */}
        <TouchableOpacity
          style={styles.modeCard}
          onPress={() => router.push('/rooms' as any)}
          activeOpacity={0.8}
        >
          <View style={styles.modeIconCircle}>
            <Ionicons name="people-outline" size={22} color={NOVA_COLORS.accentPurple} />
          </View>
          <Text style={styles.modeTitle}>With friends</Text>
          <Text style={styles.modeSubtitle}>Your private table</Text>
        </TouchableOpacity>
      </View>

      {/* 5. Daily Gift Banner */}
      <TouchableOpacity
        style={styles.dailyGiftCard}
        onPress={() => router.push('/rewards/daily' as any)}
        activeOpacity={0.85}
      >
        <View style={styles.starIconWrapper}>
          <Ionicons name="star" size={26} color={NOVA_COLORS.accentGold} />
        </View>
        <View style={styles.giftInfo}>
          <Text style={styles.giftTitle}>Your daily gift is ready</Text>
          <Text style={styles.giftSubtitle}>Keep your 5-day streak going</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={NOVA_COLORS.textSecondary} />
      </TouchableOpacity>

      {/* Additional Quick Access: Modes hub & Lucky Roll */}
      <View style={styles.extraRow}>
        <TouchableOpacity
          style={styles.pillButton}
          onPress={() => router.push('/shop/dice' as any)}
          activeOpacity={0.8}
        >
          <Ionicons name="cube-outline" size={16} color={NOVA_COLORS.accentPurple} />
          <Text style={styles.pillButtonText}>Dice Skins</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.pillButton}
          onPress={() => router.push('/rewards/lucky-roll' as any)}
          activeOpacity={0.8}
        >
          <Ionicons name="disc-outline" size={16} color={NOVA_COLORS.accentMint} />
          <Text style={styles.pillButtonText}>Lucky Roll</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.pillButton}
          onPress={() => router.push('/social/leagues' as any)}
          activeOpacity={0.8}
        >
          <Ionicons name="trophy-outline" size={16} color={NOVA_COLORS.accentGold} />
          <Text style={styles.pillButtonText}>Leagues</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: NOVA_COLORS.bg,
  },
  statusBarMock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  clock: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  signal: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: NOVA_COLORS.coral,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  avatarInner: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ffffff',
  },
  nameBlock: {
    marginLeft: 14,
  },
  greetingText: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  playerName: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: NOVA_COLORS.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  currencyBadge: {
    marginRight: 10,
  },
  mailButton: {
    marginLeft: 'auto',
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: NOVA_COLORS.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: NOVA_COLORS.coral,
  },
  heroCard: {
    backgroundColor: NOVA_COLORS.surfaceBadge,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  heroLeft: {
    flex: 1,
  },
  heroBadge: {
    marginBottom: 10,
  },
  heroTitle: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 32,
    marginBottom: 6,
  },
  heroSubtitle: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 16,
  },
  playOnlineBtn: {
    height: 44,
    borderRadius: 14,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  heroDieWrap: {
    marginLeft: 12,
  },
  sectionTitle: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 12,
  },
  modeCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modeCard: {
    width: '48%',
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 20,
    padding: 16,
  },
  modeIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(185, 162, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modeTitle: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  modeSubtitle: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 11,
  },
  dailyGiftCard: {
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  starIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 211, 123, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  giftInfo: {
    flex: 1,
  },
  giftTitle: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  giftSubtitle: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  extraRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NOVA_COLORS.surfaceCard,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
  },
  pillButtonText: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
});
