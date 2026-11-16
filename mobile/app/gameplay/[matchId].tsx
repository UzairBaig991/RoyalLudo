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
  const { matchId, mode: routeMode, prize: routePrize, players: routePlayers } = useLocalSearchParams<{
    matchId: string;
    mode?: string;
    prize?: string;
    players?: string;
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
    startNewGame,
    resetGame,
  } = useGameStore();

  // Screen 15 (Game Chat) and Screen 16 (Game Menu) modal states
  const [showChatModal, setShowChatModal] = useState<boolean>(false);
  const [showMenuModal, setShowMenuModal] = useState<boolean>(false);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [voiceOn, setVoiceOn] = useState<boolean>(false);

  // Auto-Roll Toggle & In-game Celebration Banners
  const [autoRollEnabled, setAutoRollEnabled] = useState<boolean>(false);
  const [captureBanner, setCaptureBanner] = useState<string | null>(null);
  const [celebrateSix, setCelebrateSix] = useState<boolean>(false);

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

  const isTwoPlayerMode =
    routePlayers === '2' ||
    gameState?.rules.playerCount === 2 ||
    gameState?.players.length === 2;

  // Initialize Game if opened directly or refreshed
  useEffect(() => {
    if (!gameState) {
      const isTwo = routePlayers === '2';
      const pCount: 2 | 4 = isTwo ? 2 : 4;
      const myName = profile?.username || 'You';
      const companionName = routeMode === 'bot' ? 'Nova Bot (Yellow)' : 'Companion (Yellow)';
      startNewGame({
        mode: (routeMode as any) || 'classic',
        playerCount: pCount,
        players: isTwo
          ? [
              { id: profile?.id || 'usr_me', username: myName, isBot: false },
              { id: 'usr_companion', username: companionName, isBot: true },
            ]
          : [
              { id: profile?.id || 'usr_me', username: myName, isBot: false },
              { id: 'b1', username: 'Maya', isBot: true },
              { id: 'b2', username: 'Zara', isBot: true },
              { id: 'b3', username: 'Sam', isBot: true },
            ],
      });
    }
  }, [gameState, routePlayers]);

  const currentTurnSeat = gameState?.currentTurnSeat ?? 0;
  const isMyTurn = currentTurnSeat === 0;
  const canRollDice = isMyTurn && gameState?.turnPhase === 'ROLL_DICE' && !isRolling;

  // Exit Prompt Handler
  const handlePromptExit = () => {
    Alert.alert(
      'Exit Game',
      'Are you sure you want to leave the game? Your match will end and you will return to the lobby.',
      [
        { text: 'Resume Play', style: 'cancel' },
        {
          text: 'Leave Game',
          style: 'destructive',
          onPress: () => {
            sfxEngine.playTokenStep();
            resetGame();
            router.replace('/(tabs)');
          },
        },
      ]
    );
  };

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

  // Handle Turn Countdown Timer with low-time warning sounds
  useEffect(() => {
    setTurnSecondsLeft(12);
    const interval = setInterval(() => {
      setTurnSecondsLeft((prev) => {
        if (prev <= 4 && prev > 1 && isMyTurn) {
          sfxEngine.playTimerWarning();
        }
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

  // Celebrate rolling a 6 with special sound and celebratory banner
  useEffect(() => {
    if (lastDiceRoll === 6 && !isRolling) {
      setCelebrateSix(true);
      if (isMyTurn) {
        sfxEngine.playRollSix();
        triggerReaction('🎲');
      }
      const timer = setTimeout(() => {
        setCelebrateSix(false);
      }, 2600);
      return () => clearTimeout(timer);
    } else {
      setCelebrateSix(false);
    }
  }, [lastDiceRoll, isRolling, isMyTurn]);

  // Auto-roll trigger if user enabled Auto-Roll
  useEffect(() => {
    if (autoRollEnabled && canRollDice && !isRolling) {
      const autoTimer = setTimeout(() => {
        handleRoll();
      }, 350);
      return () => clearTimeout(autoTimer);
    }
  }, [autoRollEnabled, canRollDice, isRolling]);

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
          setCaptureBanner('⚔️ SMASH! Opponent Captured! +1 Free Turn!');
          setTimeout(() => setCaptureBanner(null), 2800);
        } else if (move.isFinish) {
          sfxEngine.playFinish();
          triggerReaction('👑');
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

  const p0 = gameState.players.find((p) => p.seatIndex === 0) || {
    username: profile?.username || 'Alex · You',
    tokensHome: 0,
    seatIndex: 0,
  };
  const p1 = gameState.players.find((p) => p.seatIndex === 1) || {
    username: 'Maya',
    tokensHome: 0,
    seatIndex: 1,
  };
  const p2 = gameState.players.find((p) => p.seatIndex === 2) || {
    username: isTwoPlayerMode ? 'Companion' : 'Zara',
    tokensHome: 0,
    seatIndex: 2,
  };
  const p3 = gameState.players.find((p) => p.seatIndex === 3) || {
    username: 'Sam',
    tokensHome: 0,
    seatIndex: 3,
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. TOP HEADER (Screen 14 · Live game + Exit & Rules Options) */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => setShowMenuModal(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="menu" size={20} color={NOVA_COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>
            {isTwoPlayerMode ? '1v1 Diagonal Table' : 'Classic Table'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isTwoPlayerMode ? 'Red vs Yellow · Diagonal' : `Round 0${roundNumber} · 4 Players`}
          </Text>
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={styles.rulesBtn}
            onPress={() => setShowRulesModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="help-circle-outline" size={16} color={NOVA_COLORS.gold} />
            <Text style={styles.rulesBtnText}>Rules</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.exitBtn}
            onPress={handlePromptExit}
            activeOpacity={0.7}
          >
            <Ionicons name="exit-outline" size={15} color="#FFFFFF" />
            <Text style={styles.exitBtnText}>Exit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. TOP OPPONENTS ROW */}
      <View style={styles.playersRow}>
        {/* Top-Left Slot: Green (Player 1 in 4P mode, Hidden spacer in 2P mode) */}
        {!isTwoPlayerMode ? (
          <View style={[styles.playerCard, currentTurnSeat === 1 && styles.playerCardActive]}>
            <View style={[styles.playerDot, { backgroundColor: NOVA_COLORS.mint }]} />
            <View style={styles.playerMeta}>
              <Text style={styles.playerName} numberOfLines={1}>{p1.username}</Text>
              <Text style={styles.playerStatus}>
                {currentTurnSeat === 1 ? 'Rolling…' : `${p1.tokensHome} tokens home`}
              </Text>
            </View>
          </View>
        ) : (
          <View style={[styles.playerCard, styles.playerCardSpacer]} />
        )}

        {/* Top-Right Slot: Yellow (Companion in 2P mode, Player 2 in 4P mode — DIAGONAL) */}
        <View style={[styles.playerCard, currentTurnSeat === 2 && styles.playerCardActive]}>
          <View style={[styles.playerDot, { backgroundColor: NOVA_COLORS.gold }]} />
          <View style={styles.playerMeta}>
            <View style={styles.nameBadgeRow}>
              <Text style={styles.playerName} numberOfLines={1}>{p2.username}</Text>
              {isTwoPlayerMode && <NovaBadge label="DIAGONAL" color="gold" />}
            </View>
            <Text style={[styles.playerStatus, currentTurnSeat === 2 && styles.statusActive]}>
              {currentTurnSeat === 2 ? 'Rolling…' : `${p2.tokensHome} home · Diagonal`}
            </Text>
          </View>
        </View>
      </View>

      {/* 3. CENTER LUDO BOARD */}
      <View style={styles.boardWrapper}>
        <LudoBoardSvg
          size={BOARD_SIZE}
          gameState={gameState}
          validMoves={gameState.validMoves}
          onSelectToken={(seatIndex, tokenId) => {
            handleSelectToken(seatIndex, tokenId);
          }}
          onTilePress={(gridX, gridY) => {
            if (isMyTurn && gameState.validMoves.length > 0) {
              handleSelectToken(0, gameState.validMoves[0].tokenId);
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
        {/* Bottom-Left Slot: Red (Player 0 / You — Seat 0) */}
        <View style={[styles.playerCard, isMyTurn && styles.playerCardActive]}>
          <View style={[styles.playerDot, { backgroundColor: NOVA_COLORS.coral }]} />
          <View style={styles.playerMeta}>
            <View style={styles.nameBadgeRow}>
              <Text style={styles.playerName} numberOfLines={1}>Alex · You</Text>
              {isTwoPlayerMode && <NovaBadge label="YOU (RED)" color="mint" />}
            </View>
            <Text style={[styles.playerStatus, isMyTurn && styles.statusActive]}>
              {isMyTurn ? 'Your turn to roll' : `${p0.tokensHome} tokens home`}
            </Text>
          </View>
        </View>

        {/* Bottom-Right Slot: Blue (Player 3 in 4P mode, Hidden spacer in 2P mode) */}
        {!isTwoPlayerMode ? (
          <View style={[styles.playerCard, currentTurnSeat === 3 && styles.playerCardActive]}>
            <View style={[styles.playerDot, { backgroundColor: NOVA_COLORS.blue }]} />
            <View style={styles.playerMeta}>
              <Text style={styles.playerName} numberOfLines={1}>{p3.username}</Text>
              <Text style={styles.playerStatus}>
                {currentTurnSeat === 3 ? 'Rolling…' : `${p3.tokensHome} token home`}
              </Text>
            </View>
          </View>
        ) : (
          <View style={[styles.playerCard, styles.playerCardSpacer]} />
        )}
      </View>

      {/* CELEBRATION BANNERS */}
      {celebrateSix && (
        <View style={styles.celebrationBanner}>
          <Text style={styles.celebrationBannerText}>🎉 SIX! Roll again! ⚡</Text>
        </View>
      )}

      {captureBanner && (
        <View style={styles.captureBanner}>
          <Text style={styles.captureBannerText}>{captureBanner}</Text>
        </View>
      )}

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

      {/* TURN TIMER PROGRESS BAR */}
      <View style={styles.timerProgressContainer}>
        <View style={styles.timerMetaRow}>
          <View style={styles.timerMetaLeft}>
            <View
              style={[
                styles.timerPulsingDot,
                {
                  backgroundColor:
                    turnSecondsLeft <= 3
                      ? '#ff4757'
                      : turnSecondsLeft <= 6
                      ? '#ffd700'
                      : '#2ed573',
                },
              ]}
            />
            <Text style={styles.timerLabel}>
              {isMyTurn ? 'YOUR TURN' : `${gameState.players[currentTurnSeat]?.username || 'PLAYER'}'S TURN`}
            </Text>
          </View>
          <Text
            style={[
              styles.timerCountdown,
              turnSecondsLeft <= 3 && styles.timerCountdownCritical,
            ]}
          >
            {turnSecondsLeft < 10 ? `0${turnSecondsLeft}s` : `${turnSecondsLeft}s`}
          </Text>
        </View>
        <View style={styles.timerTrack}>
          <View
            style={[
              styles.timerFill,
              {
                width: `${Math.max(0, Math.min(100, (turnSecondsLeft / 12) * 100))}%`,
                backgroundColor:
                  turnSecondsLeft <= 3
                    ? '#ff4757'
                    : turnSecondsLeft <= 6
                    ? '#ffd700'
                    : '#2ed573',
              },
            ]}
          />
        </View>
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

        <View style={styles.actionRightControls}>
          <TouchableOpacity
            style={[styles.autoRollToggle, autoRollEnabled && styles.autoRollToggleActive]}
            onPress={() => {
              sfxEngine.playTokenStep();
              setAutoRollEnabled((prev) => !prev);
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={autoRollEnabled ? 'flash' : 'flash-outline'}
              size={12}
              color={autoRollEnabled ? '#0d101e' : NOVA_COLORS.textMuted}
            />
            <Text style={[styles.autoRollText, autoRollEnabled && styles.autoRollTextActive]}>
              {autoRollEnabled ? 'Auto ⚡' : 'Auto'}
            </Text>
          </TouchableOpacity>

          {canRollDice && (
            <TouchableOpacity style={styles.tapPrompt} onPress={handleRoll}>
              <Ionicons name="finger-print" size={24} color={NOVA_COLORS.accentPurple} />
            </TouchableOpacity>
          )}
        </View>
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

      {/* ======================================================= */}
      {/* QUICK RULES MODAL                                       */}
      {/* ======================================================= */}
      <Modal visible={showRulesModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.rulesCard}>
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Royal Ludo Rules</Text>
                <Text style={styles.sheetSubtitle}>Master the board and claim the crown</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowRulesModal(false)}
                style={styles.sheetCloseBtn}
              >
                <Ionicons name="close" size={22} color={NOVA_COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.rulesList} showsVerticalScrollIndicator={false}>
              <View style={styles.ruleItem}>
                <Text style={styles.ruleEmoji}>🎲</Text>
                <View style={styles.ruleTextWrap}>
                  <Text style={styles.ruleHeading}>Roll a 6 to Enter</Text>
                  <Text style={styles.ruleDesc}>
                    Tokens stay safe in the yard until you roll a 6 to move them onto the track.
                  </Text>
                </View>
              </View>

              <View style={styles.ruleItem}>
                <Text style={styles.ruleEmoji}>⚡</Text>
                <View style={styles.ruleTextWrap}>
                  <Text style={styles.ruleHeading}>Bonus Turns</Text>
                  <Text style={styles.ruleDesc}>
                    Rolling a 6 or capturing an opponent's piece awards an immediate extra roll!
                  </Text>
                </View>
              </View>

              <View style={styles.ruleItem}>
                <Text style={styles.ruleEmoji}>🛡️</Text>
                <View style={styles.ruleTextWrap}>
                  <Text style={styles.ruleHeading}>Safe Star Zones</Text>
                  <Text style={styles.ruleDesc}>
                    The 4 starting tiles and 4 Star (🌟) tiles are safe havens. Tokens on these tiles cannot be captured.
                  </Text>
                </View>
              </View>

              <View style={styles.ruleItem}>
                <Text style={styles.ruleEmoji}>⚔️</Text>
                <View style={styles.ruleTextWrap}>
                  <Text style={styles.ruleHeading}>Capturing Opponents</Text>
                  <Text style={styles.ruleDesc}>
                    Landing on an unprotected opponent sends their token back to base and gives you a free turn!
                  </Text>
                </View>
              </View>

              <View style={styles.ruleItem}>
                <Text style={styles.ruleEmoji}>👑</Text>
                <View style={styles.ruleTextWrap}>
                  <Text style={styles.ruleHeading}>Victory Condition</Text>
                  <Text style={styles.ruleDesc}>
                    First player to navigate all 4 tokens around the board and into the home triangle wins the match!
                  </Text>
                </View>
              </View>

              <View style={styles.ruleItem}>
                <Text style={styles.ruleEmoji}>🚫</Text>
                <View style={styles.ruleTextWrap}>
                  <Text style={styles.ruleHeading}>Three 6s Penalty</Text>
                  <Text style={styles.ruleDesc}>
                    Rolling three consecutive 6s forfeits your turn to keep matches fair and competitive.
                  </Text>
                </View>
              </View>
            </ScrollView>

            <NovaButton
              title="Got It! Back to Match"
              variant="primary"
              onPress={() => setShowRulesModal(false)}
              style={styles.ruleCloseBtn}
            />
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
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: NOVA_COLORS.accentGold,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
  exitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 124, 124, 0.22)',
    borderWidth: 1,
    borderColor: NOVA_COLORS.coral,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  exitBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
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
  playerCardSpacer: {
    opacity: 0,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
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
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rulesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderWidth: 1,
    borderColor: NOVA_COLORS.gold,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  rulesBtnText: {
    color: NOVA_COLORS.gold,
    fontSize: 12,
    fontWeight: '800',
  },
  celebrationBanner: {
    backgroundColor: 'rgba(255, 215, 0, 0.22)',
    borderWidth: 1.5,
    borderColor: NOVA_COLORS.gold,
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginVertical: 2,
  },
  celebrationBannerText: {
    color: NOVA_COLORS.gold,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  captureBanner: {
    backgroundColor: 'rgba(255, 71, 87, 0.25)',
    borderWidth: 1.5,
    borderColor: '#ff4757',
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginVertical: 2,
  },
  captureBannerText: {
    color: '#ff4757',
    fontSize: 12,
    fontWeight: '900',
  },
  timerProgressContainer: {
    backgroundColor: '#13182b',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginVertical: 3,
    borderWidth: 1,
    borderColor: '#222943',
  },
  timerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  timerMetaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerPulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timerLabel: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timerCountdown: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '800',
  },
  timerCountdownCritical: {
    color: '#ff4757',
  },
  timerTrack: {
    height: 4,
    backgroundColor: '#222943',
    borderRadius: 2,
    overflow: 'hidden',
  },
  timerFill: {
    height: '100%',
    borderRadius: 2,
  },
  actionRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  autoRollToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#191e33',
    borderWidth: 1,
    borderColor: '#30254e',
    paddingHorizontal: 7,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 3,
  },
  autoRollToggleActive: {
    backgroundColor: NOVA_COLORS.gold,
    borderColor: NOVA_COLORS.gold,
  },
  autoRollText: {
    color: NOVA_COLORS.textMuted,
    fontSize: 10,
    fontWeight: '800',
  },
  autoRollTextActive: {
    color: '#0d101e',
    fontWeight: '900',
  },
  rulesCard: {
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 20,
    padding: 18,
    width: '92%',
    maxHeight: '82%',
    borderWidth: 1.5,
    borderColor: '#30254e',
  },
  rulesList: {
    marginVertical: 12,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 10,
  },
  ruleEmoji: {
    fontSize: 22,
  },
  ruleTextWrap: {
    flex: 1,
  },
  ruleHeading: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  ruleDesc: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },
  ruleCloseBtn: {
    marginTop: 6,
  },
});
