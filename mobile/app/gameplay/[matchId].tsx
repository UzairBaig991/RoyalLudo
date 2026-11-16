import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  Modal,
  Animated,
  TextInput,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NOVA_COLORS } from '../../src/theme/colors';
import { NovaBadge } from '../../src/components/nova/NovaBadge';
import { NovaDie } from '../../src/components/nova/NovaDie';
import { NovaButton } from '../../src/components/nova/NovaButton';
import { LudoBoardSvg } from '../../src/components/board/LudoBoardSvg';
import { soundEffects as sfxEngine } from '../../src/utils/soundEffects';
import { useGameStore } from '../../src/store/useGameStore';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useEconomyStore } from '../../src/store/useEconomyStore';
import { useSettingsStore } from '../../src/store/useSettingsStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
// Scaled so the entire screen fits 100% on one page without scrolling
const BOARD_SIZE = Math.min(SCREEN_WIDTH - 24, SCREEN_HEIGHT * 0.44, 342);

export default function LiveGameScreen() {
  const router = useRouter();
  const { matchId, mode: routeMode, prize: routePrize } = useLocalSearchParams<{
    matchId: string;
    mode?: string;
    prize?: string;
  }>();

  const { profile } = useAuthStore();
  const { gold, gems, addGold, spendGems } = useEconomyStore();
  const { soundEffects, gameMusic, allowVoiceChat, toggleSetting } = useSettingsStore();

  const {
    gameState,
    isRolling,
    lastDiceRoll,
    rollDice,
    selectAndMoveToken,
    usePowerUp,
    triggerBotTurn,
    resetGame,
  } = useGameStore();

  // Screen 15 (Game Chat) and Screen 16 (Game Menu) modal states
  const [showChatModal, setShowChatModal] = useState<boolean>(false);
  const [showMenuModal, setShowMenuModal] = useState<boolean>(false);
  const [voiceOn, setVoiceOn] = useState<boolean>(false);

  // Floating Animated Reactions & Speech Bubble
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: string; emoji: string; anim: Animated.Value }[]>([]);
  const [activeSpeech, setActiveSpeech] = useState<{ sender: string; text: string } | null>(null);

  // In-Game Chat History
  const [chatMessages, setChatMessages] = useState([
    { id: '1', sender: 'MAYA', text: 'That was a close one!' },
    { id: '2', sender: 'YOU', text: 'The comeback starts now.' },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Turn timer countdown (15s)
  const [turnSecondsLeft, setTurnSecondsLeft] = useState<number>(12);
  const [roundNumber, setRoundNumber] = useState<number>(8);

  const currentTurnSeat = gameState?.currentTurnSeat ?? 0;
  const isMyTurn = currentTurnSeat === 0;
  const canRollDice = isMyTurn && gameState?.turnPhase === 'ROLL_DICE' && !isRolling;

  const triggerReaction = (emoji: string) => {
    sfxEngine.playEmoji();
    const anim = new Animated.Value(0);
    const id = Date.now().toString() + Math.random();
    setFloatingEmojis((prev) => [...prev, { id, emoji, anim }]);
    Animated.timing(anim, {
      toValue: 1,
      duration: 1700,
      useNativeDriver: true,
    }).start(() => {
      setFloatingEmojis((prev) => prev.filter((item) => item.id !== id));
    });
  };

  const handleUsePowerUp = (type: 'REROLL' | 'MAGIC_SIX' | 'SHIELD') => {
    if (!isMyTurn) {
      Alert.alert('Turn Required', 'Wait for your turn to activate boosters!');
      return;
    }
    const cost = type === 'MAGIC_SIX' ? 2 : 1;
    if (gems < cost) {
      Alert.alert('Gems Needed', `This booster requires ${cost} gems. Visit the Shop to get gems!`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Go to Shop', onPress: () => router.push('/shop/gems' as any) },
      ]);
      return;
    }

    const spent = spendGems(cost);
    if (!spent) return;

    sfxEngine.playPowerUp();
    const res = usePowerUp(0, type);
    if (res.success) {
      triggerReaction(type === 'MAGIC_SIX' ? '🎯' : type === 'SHIELD' ? '🛡️' : '⚡');
    } else {
      Alert.alert('Booster', res.message);
    }
  };

  // Handle Turn Countdown Timer
  useEffect(() => {
    setTurnSecondsLeft(12);
    const interval = setInterval(() => {
      setTurnSecondsLeft((prev) => {
        if (prev <= 1) {
          if (isMyTurn) {
            if (canRollDice) {
              handleRoll();
            } else if (gameState?.turnPhase === 'SELECT_TOKEN' && gameState.validMoves.length > 0) {
              handleSelectToken(0, gameState.validMoves[0].tokenId);
            }
          }
          return 12;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTurnSeat, gameState?.turnPhase, isMyTurn, canRollDice]);

  // Handle Game Over
  useEffect(() => {
    if (gameState?.turnPhase === 'GAME_OVER') {
      const winner = gameState.rankings[0];
      const isWinner = winner && (winner.username === profile?.username || winner.username === 'You' || winner.seatIndex === 0);
      if (isWinner) {
        sfxEngine.playVictory();
        addGold(2000);
      }
      setTimeout(() => {
        router.replace({
          pathname: '/gameplay/result',
          params: { won: isWinner ? 'true' : 'false', coins: '2000' },
        } as any);
      }, 1400);
    }
  }, [gameState?.turnPhase]);

  const handleRoll = () => {
    if (canRollDice) {
      sfxEngine.playDiceRoll();
      rollDice(0);
    }
  };

  const handleSelectToken = (seatIndex: number, tokenId: number) => {
    if (seatIndex === currentTurnSeat && gameState?.turnPhase === 'SELECT_TOKEN') {
      const move = gameState.validMoves.find((m) => m.tokenId === tokenId);
      if (move) {
        if (move.capturesToken) {
          sfxEngine.playCapture();
          triggerReaction('💥');
        } else if (move.isFinish) {
          sfxEngine.playFinish();
          triggerReaction('⭐');
        } else {
          sfxEngine.playTokenStep();
        }
      }
      selectAndMoveToken(seatIndex, tokenId);
    }
  };

  const handleSendChat = (message: string) => {
    if (!message.trim()) return;
    sfxEngine.playEmoji();
    setChatMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender: 'YOU', text: message.trim() },
    ]);
    setActiveSpeech({ sender: 'YOU', text: message.trim() });
    setTimeout(() => setActiveSpeech(null), 3200);
    setChatInput('');
  };

  const handleForfeit = () => {
    setShowMenuModal(false);
    resetGame();
    router.replace('/(tabs)');
  };

  const getStatusMessage = () => {
    if (isRolling) return 'Rolling dice…';
    if (lastDiceRoll === 6) return 'A six! Roll again.';
    if (isMyTurn) {
      if (gameState?.turnPhase === 'SELECT_TOKEN') return 'Select a token to move!';
      return 'Your turn to roll!';
    }
    const currentName = gameState?.players[currentTurnSeat]?.username || 'Maya';
    return `${currentName} is thinking…`;
  };

  const getSubStatus = () => {
    if (isMyTurn) {
      return `Tap the dice  ·  ${turnSecondsLeft}s left`;
    }
    return `Turn in progress  ·  ${turnSecondsLeft}s left`;
  };

  if (!gameState) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Setting up the table…</Text>
      </SafeAreaView>
    );
  }

  const p0 = gameState.players[0] || { username: profile?.username || 'Alex · You', tokensHome: 0 };
  const p1 = gameState.players[1] || { username: 'Maya', tokensHome: 2 };
  const p2 = gameState.players[2] || { username: 'Zara', tokensHome: 1 };
  const p3 = gameState.players[3] || { username: 'Sam', tokensHome: 1 };

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. TOP HEADER (Screen 14 · Live game) */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => setShowMenuModal(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={NOVA_COLORS.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Classic table</Text>

        <View style={styles.headerBadges}>
          <NovaBadge
            label="◈  2,000 prize"
            color="gold"
            style={styles.prizeBadge}
          />
          <NovaBadge
            label={`ROUND 0${roundNumber}`}
            color="mint"
            style={styles.roundBadge}
          />
        </View>
      </View>

      {/* 2. TOP OPPONENTS ROW */}
      <View style={styles.playersRow}>
        {/* Player 1: Maya (Coral/Mint) */}
        <View style={[styles.playerCard, currentTurnSeat === 1 && styles.playerCardActive]}>
          <View style={[styles.playerDot, { backgroundColor: NOVA_COLORS.coral }]} />
          <View style={styles.playerMeta}>
            <Text style={styles.playerName} numberOfLines={1}>{p1.username}</Text>
            <Text style={styles.playerStatus}>
              {currentTurnSeat === 1 ? 'Rolling…' : `${p1.tokensHome} tokens home`}
            </Text>
          </View>
        </View>

        {/* Player 2: Zara (Mint) */}
        <View style={[styles.playerCard, currentTurnSeat === 2 && styles.playerCardActive]}>
          <View style={[styles.playerDot, { backgroundColor: NOVA_COLORS.mint }]} />
          <View style={styles.playerMeta}>
            <Text style={styles.playerName} numberOfLines={1}>{p2.username}</Text>
            <Text style={styles.playerStatus}>
              {currentTurnSeat === 2 ? 'Rolling…' : `${p2.tokensHome} token home`}
            </Text>
          </View>
        </View>
      </View>

      {/* 3. CENTER LUDO BOARD */}
      <View style={styles.boardWrapper}>
        <LudoBoardSvg
          size={BOARD_SIZE}
          onTilePress={(gridX, gridY) => {
            // Find if any of my valid moves are on this tile
            const move = gameState.validMoves.find((m) => m.fromStep !== undefined);
            if (move && isMyTurn) {
              handleSelectToken(0, move.tokenId);
            }
          }}
          onTokenPress={(seatIndex, tokenId) => {
            if (seatIndex === 0 && isMyTurn) {
              handleSelectToken(0, tokenId);
            }
          }}
        />
      </View>

      {/* 4. BOTTOM OPPONENTS ROW */}
      <View style={styles.playersRow}>
        {/* Player 3: Alex · You (Blue/Coral) */}
        <View style={[styles.playerCard, isMyTurn && styles.playerCardActive]}>
          <View style={[styles.playerDot, { backgroundColor: NOVA_COLORS.blue }]} />
          <View style={styles.playerMeta}>
            <Text style={styles.playerName} numberOfLines={1}>Alex · You</Text>
            <Text style={[styles.playerStatus, isMyTurn && styles.statusActive]}>
              {isMyTurn ? 'Your turn' : `${p0.tokensHome} tokens home`}
            </Text>
          </View>
        </View>

        {/* Player 4: Sam (Gold) */}
        <View style={[styles.playerCard, currentTurnSeat === 3 && styles.playerCardActive]}>
          <View style={[styles.playerDot, { backgroundColor: NOVA_COLORS.gold }]} />
          <View style={styles.playerMeta}>
            <Text style={styles.playerName} numberOfLines={1}>{p3.username}</Text>
            <Text style={styles.playerStatus}>
              {currentTurnSeat === 3 ? 'Rolling…' : `${p3.tokensHome} token home`}
            </Text>
          </View>
        </View>
      </View>

      {/* ACTIVE SPEECH BUBBLE */}
      {activeSpeech && (
        <View style={styles.speechBubble}>
          <Text style={styles.speechBubbleText}>💬 {activeSpeech.sender}: {activeSpeech.text}</Text>
        </View>
      )}

      {/* 4.5. BOOSTERS & QUICK REACTIONS BAR */}
      <View style={styles.boostersAndReactionsRow}>
        <View style={styles.boostersGroup}>
          <TouchableOpacity
            style={[styles.boosterBtn, (!isMyTurn || gems < 1) && styles.boosterBtnDisabled]}
            onPress={() => handleUsePowerUp('REROLL')}
            activeOpacity={0.7}
          >
            <Text style={styles.boosterEmoji}>⚡</Text>
            <Text style={styles.boosterText}>Reroll 1◇</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.boosterBtn, (!isMyTurn || gems < 2) && styles.boosterBtnDisabled]}
            onPress={() => handleUsePowerUp('MAGIC_SIX')}
            activeOpacity={0.7}
          >
            <Text style={styles.boosterEmoji}>🎯</Text>
            <Text style={styles.boosterText}>Six 2◇</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.boosterBtn, (!isMyTurn || gems < 1) && styles.boosterBtnDisabled]}
            onPress={() => handleUsePowerUp('SHIELD')}
            activeOpacity={0.7}
          >
            <Text style={styles.boosterEmoji}>🛡️</Text>
            <Text style={styles.boosterText}>Shield 1◇</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.reactionsScroll}
        >
          {['😂', '😡', '🔥', '👑', '🎲', '💎', '👏'].map((em) => (
            <TouchableOpacity
              key={em}
              style={styles.reactionPill}
              onPress={() => triggerReaction(em)}
              activeOpacity={0.6}
            >
              <Text style={styles.reactionEmoji}>{em}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 5. INTERACTIVE DIE & ACTION CARD (Figma Surface #30254e) */}
      <View style={styles.actionCard}>
        <View style={styles.dieWrapper}>
          <NovaDie
            value={lastDiceRoll || 6}
            size={58}
            rolling={isRolling}
            onPress={handleRoll}
            disabled={!canRollDice}
            theme="nova"
          />
        </View>

        <View style={styles.actionTextWrap}>
          <Text style={styles.statusTitle}>{getStatusMessage()}</Text>
          <Text style={styles.statusSubtitle}>{getSubStatus()}</Text>
        </View>

        {canRollDice && (
          <TouchableOpacity style={styles.tapPrompt} onPress={handleRoll}>
            <Ionicons name="finger-print" size={24} color={NOVA_COLORS.accentPurple} />
          </TouchableOpacity>
        )}
      </View>

      {/* 6. BOTTOM BAR (Chat & Voice) */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.chatBtn}
          onPress={() => setShowChatModal(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubble-outline" size={20} color={NOVA_COLORS.accentPurple} />
          <Text style={styles.chatBtnText}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.voiceBtn}
          onPress={() => setVoiceOn(!voiceOn)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={voiceOn ? 'mic' : 'mic-off-outline'}
            size={20}
            color={voiceOn ? NOVA_COLORS.accentMint : NOVA_COLORS.textSecondary}
          />
          <Text
            style={[
              styles.voiceBtnText,
              voiceOn && { color: NOVA_COLORS.accentMint },
            ]}
          >
            {voiceOn ? 'Voice on' : 'Voice off'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ======================================================= */}
      {/* SCREEN 15 · GAME CHAT MODAL                             */}
      {/* ======================================================= */}
      <Modal visible={showChatModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.chatSheet}>
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Table chat</Text>
                <Text style={styles.sheetSubtitle}>Be kind. Play fair. Have fun.</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowChatModal(false)}
                style={styles.sheetCloseBtn}
              >
                <Ionicons name="close" size={22} color={NOVA_COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Quick chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
              {['Good luck!', 'Nice move!', 'Well played', 'That was a close one!', 'The comeback starts now.'].map(
                (chip, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.chip}
                    onPress={() => handleSendChat(chip)}
                  >
                    <Text style={styles.chipText}>{chip}</Text>
                  </TouchableOpacity>
                )
              )}
            </ScrollView>

            {/* Messages stream */}
            <ScrollView style={styles.messagesList} showsVerticalScrollIndicator={false}>
              {chatMessages.map((msg) => (
                <View
                  key={msg.id}
                  style={[
                    styles.msgBubble,
                    msg.sender === 'YOU' ? styles.myMsg : styles.theirMsg,
                  ]}
                >
                  <Text style={styles.msgSender}>{msg.sender}</Text>
                  <Text style={styles.msgText}>{msg.text}</Text>
                </View>
              ))}
            </ScrollView>

            {/* Message input */}
            <View style={styles.chatInputRow}>
              <TextInput
                style={styles.chatTextInput}
                placeholder="Send a friendly message…"
                placeholderTextColor={NOVA_COLORS.textMuted}
                value={chatInput}
                onChangeText={setChatInput}
                onSubmitEditing={() => handleSendChat(chatInput)}
              />
              <TouchableOpacity
                style={styles.sendBtn}
                onPress={() => handleSendChat(chatInput)}
              >
                <Ionicons name="send" size={18} color="#0d101e" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================= */}
      {/* SCREEN 16 · GAME MENU MODAL                             */}
      {/* ======================================================= */}
      <Modal visible={showMenuModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.menuCard}>
            <Text style={styles.menuTitle}>Take a moment</Text>
            <Text style={styles.menuSubtitle}>
              The match is still live. Your turn timer continues.
            </Text>

            {/* Sound effects toggle */}
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Sound effects</Text>
              <TouchableOpacity
                style={[styles.togglePill, soundEffects && styles.togglePillActive]}
                onPress={() => toggleSetting('soundEffects')}
              >
                <Text style={styles.togglePillText}>{soundEffects ? 'On' : 'Off'}</Text>
              </TouchableOpacity>
            </View>

            {/* Game music toggle */}
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Game music</Text>
              <TouchableOpacity
                style={[styles.togglePill, gameMusic && styles.togglePillActive]}
                onPress={() => toggleSetting('gameMusic')}
              >
                <Text style={styles.togglePillText}>{gameMusic ? 'On' : 'Off'}</Text>
              </TouchableOpacity>
            </View>

            {/* Voice chat toggle */}
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Voice chat</Text>
              <TouchableOpacity
                style={[styles.togglePill, allowVoiceChat && styles.togglePillActive]}
                onPress={() => toggleSetting('allowVoiceChat')}
              >
                <Text style={styles.togglePillText}>{allowVoiceChat ? 'Active' : 'Muted'}</Text>
              </TouchableOpacity>
            </View>

            <NovaButton
              title="Back to game"
              variant="primary"
              onPress={() => setShowMenuModal(false)}
              style={styles.menuBtn}
            />

            <NovaButton
              title="Leave match"
              variant="danger"
              onPress={handleForfeit}
              style={styles.menuBtn}
            />

            <Text style={styles.menuForfeitHint}>
              Leaving forfeits your entry coins.
            </Text>
          </View>
        </View>
      </Modal>

      {/* FLOATING EMOJI ANIMATED OVERLAY */}
      {floatingEmojis.map((item) => (
        <Animated.View
          key={item.id}
          pointerEvents="none"
          style={[
            styles.floatingEmoji,
            {
              opacity: item.anim.interpolate({
                inputRange: [0, 0.2, 0.75, 1],
                outputRange: [0, 1, 1, 0],
              }),
              transform: [
                {
                  translateY: item.anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -160],
                  }),
                },
                {
                  scale: item.anim.interpolate({
                    inputRange: [0, 0.3, 1],
                    outputRange: [0.6, 1.4, 1.1],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.floatingEmojiText}>{item.emoji}</Text>
        </Animated.View>
      ))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NOVA_COLORS.bg,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: NOVA_COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: NOVA_COLORS.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  headerBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prizeBadge: {
    height: 28,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginRight: 6,
  },
  roundBadge: {
    height: 28,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  playersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  playerCard: {
    width: '48%',
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 14,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  playerCardActive: {
    borderColor: NOVA_COLORS.accentPurple,
    backgroundColor: '#1f2642',
  },
  playerDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#ffffff',
    marginRight: 8,
  },
  playerMeta: {
    flex: 1,
  },
  playerName: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  playerStatus: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 10,
    marginTop: 1,
  },
  statusActive: {
    color: NOVA_COLORS.accentPurple,
    fontWeight: '700',
  },
  boardWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  actionCard: {
    backgroundColor: NOVA_COLORS.surfaceBadge,
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dieWrapper: {
    marginRight: 12,
  },
  actionTextWrap: {
    flex: 1,
  },
  statusTitle: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  statusSubtitle: {
    color: NOVA_COLORS.accentPurple,
    fontSize: 12,
    fontWeight: '600',
  },
  tapPrompt: {
    padding: 6,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 6,
  },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatBtnText: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  voiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voiceBtnText: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  chatSheet: {
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '65%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sheetTitle: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  sheetSubtitle: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  sheetCloseBtn: {
    padding: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  chip: {
    backgroundColor: NOVA_COLORS.surfaceBadge,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  chipText: {
    color: NOVA_COLORS.accentPurple,
    fontSize: 12,
    fontWeight: '600',
  },
  messagesList: {
    maxHeight: 180,
    marginBottom: 12,
  },
  msgBubble: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
    maxWidth: '80%',
  },
  myMsg: {
    backgroundColor: NOVA_COLORS.accentPurple,
    alignSelf: 'flex-end',
  },
  theirMsg: {
    backgroundColor: NOVA_COLORS.surfaceElevated,
    alignSelf: 'flex-start',
  },
  msgSender: {
    fontSize: 10,
    fontWeight: '700',
    color: NOVA_COLORS.textMuted,
    marginBottom: 2,
  },
  msgText: {
    fontSize: 13,
    color: NOVA_COLORS.textDark,
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatTextInput: {
    flex: 1,
    backgroundColor: NOVA_COLORS.surfaceElevated,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 44,
    color: NOVA_COLORS.textPrimary,
    fontSize: 14,
    marginRight: 10,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: NOVA_COLORS.accentPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuCard: {
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  menuTitle: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  menuSubtitle: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: NOVA_COLORS.surfaceElevated,
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  settingLabel: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  togglePill: {
    backgroundColor: NOVA_COLORS.surfaceCard,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  togglePillActive: {
    backgroundColor: NOVA_COLORS.accentPurple,
  },
  togglePillText: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  menuBtn: {
    marginTop: 10,
  },
  menuForfeitHint: {
    color: NOVA_COLORS.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 10,
  },
  speechBubble: {
    alignSelf: 'center',
    backgroundColor: '#30254e',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: NOVA_COLORS.accentPurple,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  speechBubbleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  boostersAndReactionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
    gap: 8,
  },
  boostersGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  boosterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#191e33',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#30254e',
    gap: 4,
  },
  boosterBtnDisabled: {
    opacity: 0.45,
  },
  boosterEmoji: {
    fontSize: 13,
  },
  boosterText: {
    color: NOVA_COLORS.accentPurple,
    fontSize: 10,
    fontWeight: '800',
  },
  reactionsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 6,
  },
  reactionPill: {
    backgroundColor: '#191e33',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#30254e',
  },
  reactionEmoji: {
    fontSize: 16,
  },
  floatingEmoji: {
    position: 'absolute',
    bottom: 200,
    alignSelf: 'center',
    zIndex: 999,
  },
  floatingEmojiText: {
    fontSize: 48,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
});
