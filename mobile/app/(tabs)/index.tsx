import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useEconomyStore } from '../../src/store/useEconomyStore';
import { useGameStore } from '../../src/store/useGameStore';

const { width } = Dimensions.get('window');

// 30 Group Players for authentic Ludo Star League leaderboard
const LEAGUE_GROUP = [
  { rank: 1, name: 'الجنّي البريطاني', title: 'SKILLED - II', earning: '35 M', flag: '🇸🇦', avatar: '👳' },
  { rank: 2, name: 'Phyrnai Syiem', title: 'PROFESSIONAL - I', earning: '30 M', flag: '🇮🇳', avatar: '👨‍🦱' },
  { rank: 3, name: 'BoODooS', title: 'BIGGUN - II', earning: '23 M', flag: '🇪🇸', avatar: '🧔' },
  { rank: 4, name: 'Ammar Alhatmi', title: 'SEMIPRO - I', earning: '20 M', flag: '🇴🇲', avatar: '👨' },
  { rank: 5, name: 'Mashari', title: 'GENIUS - II', earning: '14.01 M', flag: '🇸🇦', avatar: '🧑' },
  { rank: 6, name: 'Meeeeem', title: 'HOTSHOT - III', earning: '11 M', flag: '🇰🇼', avatar: '👩' },
  { rank: 7, name: 'Alexandre', title: 'MASTER - I', earning: '9.5 M', flag: '🇧🇷', avatar: '👱' },
  { rank: 8, name: 'Fatima Zahra', title: 'EXPERT - II', earning: '7.8 M', flag: '🇲🇦', avatar: '🧕' },
  { rank: 9, name: 'Vikram Singh', title: 'WARRIOR - I', earning: '6.2 M', flag: '🇮🇳', avatar: '👳‍♂️' },
  { rank: 10, name: 'John Doe', title: 'VETERAN - III', earning: '5.1 M', flag: '🇺🇸', avatar: '👨‍🦰' },
  { rank: 29, name: 'Govind (You)', title: 'SKILLED - II', earning: '67.5 K', flag: '🇮🇳', avatar: '😎', isUser: true },
  { rank: 30, name: 'Lucas Silva', title: 'ROOKIE - I', earning: '42.0 K', flag: '🇧🇷', avatar: '👦' },
];

export default function LudoStarHomeScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const { gold, gems, addGold, addGems } = useEconomyStore();
  const { startNewGame } = useGameStore();

  // Modals state
  const [betModalVisible, setBetModalVisible] = useState(false);
  const [leagueModalVisible, setLeagueModalVisible] = useState(false);
  const [teamUpModalVisible, setTeamUpModalVisible] = useState(false);
  const [wheelModalVisible, setWheelModalVisible] = useState(false);
  const [clubsModalVisible, setClubsModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [privateRoomModalVisible, setPrivateRoomModalVisible] = useState(false);
  const [passPlayModalVisible, setPassPlayModalVisible] = useState(false);

  // Private room state
  const [privateTab, setPrivateTab] = useState<'create' | 'join'>('create');
  const [privateRoomCode, setPrivateRoomCode] = useState('RL' + Math.floor(1000 + Math.random() * 9000));
  const [joinCodeInput, setJoinCodeInput] = useState('');

  // Pass 'n Play state
  const [pnpPlayerCount, setPnpPlayerCount] = useState<number>(4);
  const [pnpSeats, setPnpSeats] = useState([
    { color: 'Red', type: 'Human', name: 'Player 1 (You)' },
    { color: 'Green', type: 'Human', name: 'Player 2' },
    { color: 'Yellow', type: 'Bot', name: 'Sir Lancelot (AI)' },
    { color: 'Blue', type: 'Bot', name: 'Lord Galahad (AI)' },
  ]);

  // Match configuration state
  const [selectedMode, setSelectedMode] = useState<'2player' | '4player' | 'teamup' | 'private' | 'quick'>('2player');
  const [selectedVariation, setSelectedVariation] = useState<'classic' | 'master' | 'quick' | 'arrow'>('classic');
  const [selectedBet, setSelectedBet] = useState<number>(500);

  // Spin wheel animation
  const [spinValue] = useState(new Animated.Value(0));
  const [isSpinning, setIsSpinning] = useState(false);

  const betsList = [
    { bet: 500, prize: '1,000' },
    { bet: 2000, prize: '4,000' },
    { bet: 10000, prize: '20,000' },
    { bet: 50000, prize: '100,000' },
    { bet: 250000, prize: '500,000' },
    { bet: 1000000, prize: '2,000,000' },
  ];

  const handleOpenBet = (mode: '2player' | '4player' | 'teamup' | 'private' | 'quick') => {
    setSelectedMode(mode);
    if (mode === 'teamup') {
      setTeamUpModalVisible(true);
    } else if (mode === 'private') {
      setPrivateRoomModalVisible(true);
    } else if (mode === 'quick') {
      setSelectedVariation('quick');
      setBetModalVisible(true);
    } else {
      setBetModalVisible(true);
    }
  };

  const handleStartGame = () => {
    setBetModalVisible(false);
    setTeamUpModalVisible(false);
    setPrivateRoomModalVisible(false);
    setPassPlayModalVisible(false);

    const playerCount = selectedMode === '2player' ? 2 : 4;
    const players = [
      { id: profile?.userId || 'p1', username: profile?.username || 'Govind', isBot: false },
      { id: 'b1', username: 'Shivali Mahajan', isBot: true },
    ];
    if (playerCount === 4) {
      players.push({ id: 'b2', username: 'Sachin Kumar Sh', isBot: true });
      players.push({ id: 'b3', username: 'Thiago Rodrigues', isBot: true });
    }

    startNewGame({
      mode: selectedVariation,
      playerCount,
      players,
    });

    router.push('/gameplay/active_match');
  };

  const handleStartPassAndPlay = () => {
    setPassPlayModalVisible(false);
    const players = [];
    for (let i = 0; i < pnpPlayerCount; i++) {
      const s = pnpSeats[i];
      players.push({
        id: `pnp_${i}`,
        username: s.name,
        isBot: s.type === 'Bot',
      });
    }

    startNewGame({
      mode: 'classic',
      playerCount: pnpPlayerCount,
      players,
    });

    router.push('/gameplay/active_match');
  };

  const togglePnpSeat = (idx: number) => {
    setPnpSeats((prev) => {
      const copy = [...prev];
      if (copy[idx].type === 'Human') {
        copy[idx].type = 'Bot';
        copy[idx].name = idx === 1 ? 'Lady Guinevere (AI)' : idx === 2 ? 'Sir Lancelot (AI)' : 'Lord Galahad (AI)';
      } else {
        copy[idx].type = 'Human';
        copy[idx].name = `Player ${idx + 1}`;
      }
      return copy;
    });
  };

  const handleSpinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    spinValue.setValue(0);

    Animated.timing(spinValue, {
      toValue: 8,
      duration: 3500,
      useNativeDriver: true,
    }).start(() => {
      setIsSpinning(false);
      const wonGold = 2500;
      const wonGems = 10;
      addGold(wonGold);
      addGems(wonGems);
      Alert.alert('🎉 LUCKY WIN!', `You won ${wonGold.toLocaleString()} Coins and ${wonGems} Gems!`);
      setWheelModalVisible(false);
    });
  };

  const spinRotation = spinValue.interpolate({
    inputRange: [0, 8],
    outputRange: ['0deg', '2880deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Crown & Logo Watermark */}
      <View style={styles.watermarkContainer}>
        <Text style={styles.crownWatermark}>👑</Text>
        <Text style={styles.titleWatermark}>LUDO</Text>
        <Text style={styles.subtitleWatermark}>STAR</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* TOP STATUS BAR (Image 1 replica) */}
        <View style={styles.topBar}>
          {/* Level Star Pill */}
          <View style={styles.pillContainer}>
            <Text style={styles.starIcon}>⭐</Text>
            <Text style={styles.pillText}>10/50</Text>
          </View>

          {/* Energy Pill */}
          <View style={styles.pillContainer}>
            <Text style={styles.energyIcon}>⚡</Text>
          </View>

          {/* Gold Coins Pill */}
          <View style={[styles.pillContainer, styles.currencyPill]}>
            <Text style={styles.coinIcon}>🪙</Text>
            <Text style={styles.currencyAmount}>{gold.toLocaleString()}</Text>
            <TouchableOpacity style={styles.plusButton} onPress={() => router.push('/profile')}>
              <Text style={styles.plusText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Gems Pill */}
          <View style={[styles.pillContainer, styles.currencyPill]}>
            <Text style={styles.gemIcon}>💎</Text>
            <Text style={styles.currencyAmount}>{gems}</Text>
            <TouchableOpacity style={styles.plusButton} onPress={() => router.push('/profile')}>
              <Text style={styles.plusText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Settings Cog */}
          <TouchableOpacity style={styles.settingsBtn} onPress={() => setSettingsModalVisible(true)}>
            <Text style={styles.cogIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* USER PROFILE CARD & TOP LEVEL UNLOCKS */}
        <View style={styles.profileRow}>
          {/* User Profile Banner */}
          <View style={styles.profileBadge}>
            <View style={styles.avatarCircle}>
              <Text style={{ fontSize: 26 }}>😎</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName} numberOfLines={1}>
                {profile?.username || 'Govind'}
              </Text>
              <View style={styles.profileSubRow}>
                <Text style={styles.flagIcon}>🇮🇳</Text>
                <Text style={styles.profileLevel}>Level 9</Text>
              </View>
            </View>
          </View>

          {/* 3 Top Mini Badges */}
          <View style={styles.miniBadgesRow}>
            {/* Leaderboard Podium */}
            <TouchableOpacity style={styles.miniBadge} onPress={() => setLeagueModalVisible(true)}>
              <Text style={{ fontSize: 20 }}>📊</Text>
              <View style={styles.lockBadge}>
                <Text style={styles.lockText}>🔒 Lvl 4</Text>
              </View>
            </TouchableOpacity>

            {/* League Shield */}
            <TouchableOpacity style={styles.miniBadge} onPress={() => setLeagueModalVisible(true)}>
              <Text style={{ fontSize: 20 }}>🛡️</Text>
              <View style={styles.lockBadge}>
                <Text style={styles.lockText}>🔒 Lvl 4</Text>
              </View>
            </TouchableOpacity>

            {/* Big Win */}
            <TouchableOpacity style={styles.miniBadge} onPress={() => handleOpenBet('4player')}>
              <Text style={styles.bigWinText}>BIG</Text>
              <Text style={styles.bigWinSub}>WIN</Text>
              <View style={styles.lockBadge}>
                <Text style={styles.lockText}>🔒 Lvl 5</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* LEFT FLOATING ACTION BUTTONS */}
        <View style={styles.floatingActionsRow}>
          <TouchableOpacity style={styles.floatingActionBtn} onPress={() => setWheelModalVisible(true)}>
            <Text style={{ fontSize: 24 }}>🎬</Text>
            <View style={styles.notificationDot}>
              <Text style={styles.notificationDotText}>6</Text>
            </View>
            <Text style={styles.floatingActionLabel}>SPIN</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.floatingActionBtn} onPress={() => setClubsModalVisible(true)}>
            <Text style={{ fontSize: 24 }}>🏛️</Text>
            <View style={styles.notificationDot}>
              <Text style={styles.notificationDotText}>1</Text>
            </View>
            <Text style={styles.floatingActionLabel}>CLUBS</Text>
          </TouchableOpacity>
        </View>

        {/* ========================================================
             ALL 6 PREMIER ANIMATED GAME MODE CARDS (2x3 GRID)
             ======================================================== */}
        <View style={styles.modesGrid}>
          {/* 1. 2 PLAYER (1 ON 1) */}
          <TouchableOpacity
            style={[styles.modeCardBase, styles.card2Player]}
            activeOpacity={0.85}
            onPress={() => handleOpenBet('2player')}
          >
            <View style={styles.cardHeaderTag}>
              <Text style={styles.cardTagText}>⚡ FAST DUEL • 🟢 142K</Text>
            </View>
            <View style={styles.cardCenterGraphic}>
              <Text style={styles.number3D}>2</Text>
              <View style={styles.tokenPairRow}>
                <Text style={{ fontSize: 26, marginRight: -6 }}>🔴</Text>
                <Text style={{ fontSize: 26 }}>🔵</Text>
              </View>
              <Text style={{ fontSize: 28, marginTop: -6 }}>🎲</Text>
            </View>
            <View style={styles.cardBottomPill}>
              <Text style={styles.cardBottomTitle}>2 PLAYER</Text>
              <Text style={styles.cardBottomSub}>1 on 1 Online Duel</Text>
            </View>
          </TouchableOpacity>

          {/* 2. 4 PLAYERS (ROYAL RUMBLE) */}
          <TouchableOpacity
            style={[styles.modeCardBase, styles.card4Player]}
            activeOpacity={0.85}
            onPress={() => handleOpenBet('4player')}
          >
            <View style={styles.cardHeaderTag}>
              <Text style={styles.cardTagText}>👑 4 PLAYERS • 🔥 POPULAR</Text>
            </View>
            <View style={styles.cardCenterGraphic}>
              <View style={styles.circle4Tokens}>
                <Text style={{ fontSize: 24 }}>🔴 🟢</Text>
                <Text style={{ fontSize: 24 }}>🟡 🔵</Text>
              </View>
              <Text style={{ fontSize: 26, marginTop: -6 }}>👑</Text>
            </View>
            <View style={styles.cardBottomPill}>
              <Text style={styles.cardBottomTitle}>4 PLAYERS</Text>
              <Text style={styles.cardBottomSub}>4-Quadrant Battle</Text>
            </View>
          </TouchableOpacity>

          {/* 3. PLAY WITH FRIENDS (PRIVATE TABLE) */}
          <TouchableOpacity
            style={[styles.modeCardBase, styles.cardFriends]}
            activeOpacity={0.85}
            onPress={() => setPrivateRoomModalVisible(true)}
          >
            <View style={styles.cardHeaderTag}>
              <Text style={styles.cardTagText}>👥 WITH FRIENDS • 🔒 CODE</Text>
            </View>
            <View style={styles.cardCenterGraphic}>
              <View style={styles.micCornerBadge}>
                <Text style={{ fontSize: 11 }}>🎙️</Text>
              </View>
              <Text style={{ fontSize: 44, marginVertical: 4 }}>💖</Text>
              <View style={styles.roomCodeMiniTag}>
                <Text style={styles.roomCodeMiniText}>#TABLE CODE</Text>
              </View>
            </View>
            <View style={styles.cardBottomPill}>
              <Text style={styles.cardBottomTitle}>WITH FRIENDS</Text>
              <Text style={styles.cardBottomSub}>Private Room & Code</Text>
            </View>
          </TouchableOpacity>

          {/* 4. TEAM UP (2v2 ALLIED CLASH) */}
          <TouchableOpacity
            style={[styles.modeCardBase, styles.cardTeamUp]}
            activeOpacity={0.85}
            onPress={() => setTeamUpModalVisible(true)}
          >
            <View style={styles.cardHeaderTag}>
              <Text style={styles.cardTagText}>🤝 TEAM UP • 🎙️ VOICE</Text>
            </View>
            <View style={styles.cardCenterGraphic}>
              <Text style={{ fontSize: 42 }}>⚡</Text>
              <View style={styles.vsCenterBadge}>
                <Text style={styles.vsCenterText}>VS</Text>
              </View>
            </View>
            <View style={styles.cardBottomPill}>
              <Text style={styles.cardBottomTitle}>TEAM UP (2v2)</Text>
              <Text style={styles.cardBottomSub}>Allied Team Battle</Text>
            </View>
          </TouchableOpacity>

          {/* 5. PASS 'N PLAY (LOCAL OFFLINE MULTIPLAYER) */}
          <TouchableOpacity
            style={[styles.modeCardBase, styles.cardLocal]}
            activeOpacity={0.85}
            onPress={() => setPassPlayModalVisible(true)}
          >
            <View style={styles.cardHeaderTag}>
              <Text style={styles.cardTagText}>📱 LOCAL PLAY • 📶 OFFLINE</Text>
            </View>
            <View style={styles.cardCenterGraphic}>
              <Text style={{ fontSize: 42 }}>📱</Text>
              <Text style={{ fontSize: 16, marginTop: -4 }}>👥 🤖</Text>
            </View>
            <View style={styles.cardBottomPill}>
              <Text style={styles.cardBottomTitle}>PASS 'N PLAY</Text>
              <Text style={styles.cardBottomSub}>Same Device & Bots</Text>
            </View>
          </TouchableOpacity>

          {/* 6. ARROW & QUICK MODE */}
          <TouchableOpacity
            style={[styles.modeCardBase, styles.cardQuick]}
            activeOpacity={0.85}
            onPress={() => handleOpenBet('quick')}
          >
            <View style={styles.cardHeaderTag}>
              <Text style={styles.cardTagText}>🚀 RUSH • 🏹 ARROWS</Text>
            </View>
            <View style={styles.cardCenterGraphic}>
              <Text style={{ fontSize: 42 }}>🏹</Text>
              <Text style={{ fontSize: 16, marginTop: -4 }}>⚡ 2-TOKEN WIN</Text>
            </View>
            <View style={styles.cardBottomPill}>
              <Text style={styles.cardBottomTitle}>QUICK & ARROW</Text>
              <Text style={styles.cardBottomSub}>Fast 2-Token Win</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* SECONDARY ACTION CARDS ROW */}
        <View style={styles.secondaryCardsRow}>
          <TouchableOpacity style={styles.secondaryCard} onPress={() => router.push('/profile')}>
            <Text style={{ fontSize: 24 }}>🏆</Text>
            <Text style={styles.secondaryCardLabel}>VIP</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryCard} onPress={() => setLeagueModalVisible(true)}>
            <Text style={{ fontSize: 24 }}>⭐</Text>
            <Text style={styles.secondaryCardLabel}>STREAK</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryCard} onPress={() => setLeagueModalVisible(true)}>
            <Text style={{ fontSize: 24 }}>🛡️</Text>
            <Text style={styles.secondaryCardLabel}>LEAGUE</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryCard} onPress={() => router.push('/play')}>
            <Text style={{ fontSize: 24 }}>🎲</Text>
            <Text style={styles.secondaryCardLabel}>24 DICE</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* ============================================================ */}
      {/* 1. BET SELECTION MODAL */}
      {/* ============================================================ */}
      <Modal visible={betModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.betModalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitleText}>SELECT ENTRY BET</Text>
              <TouchableOpacity onPress={() => setBetModalVisible(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionSubtitle}>SELECT GAME RULES</Text>
            <View style={styles.variationRow}>
              {(['classic', 'master', 'quick', 'arrow'] as const).map((v) => (
                <TouchableOpacity
                  key={v}
                  style={[
                    styles.variationPill,
                    selectedVariation === v && styles.variationPillActive,
                  ]}
                  onPress={() => setSelectedVariation(v)}
                >
                  <Text
                    style={[
                      styles.variationText,
                      selectedVariation === v && styles.variationTextActive,
                    ]}
                  >
                    {v.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionSubtitle}>SELECT COIN BET</Text>
            <View style={styles.betsGrid}>
              {betsList.map((item) => (
                <TouchableOpacity
                  key={item.bet}
                  style={[
                    styles.betChip,
                    selectedBet === item.bet && styles.betChipActive,
                  ]}
                  onPress={() => setSelectedBet(item.bet)}
                >
                  <Text style={styles.betChipAmount}>🪙 {item.bet.toLocaleString()}</Text>
                  <Text style={styles.betChipPrize}>WIN {item.prize}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.startMatchBtn} onPress={handleStartGame}>
              <Text style={styles.startMatchBtnText}>START MATCH ⚔️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ============================================================ */}
      {/* 2. PLAY WITH FRIENDS (PRIVATE ROOM) MODAL */}
      {/* ============================================================ */}
      <Modal visible={privateRoomModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.betModalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitleText}>👥 PLAY WITH FRIENDS</Text>
              <TouchableOpacity onPress={() => setPrivateRoomModalVisible(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Tabs: Create / Join */}
            <View style={styles.tabToggleRow}>
              <TouchableOpacity
                style={[styles.tabToggleBtn, privateTab === 'create' && styles.tabToggleActive]}
                onPress={() => setPrivateTab('create')}
              >
                <Text style={[styles.tabToggleText, privateTab === 'create' && styles.tabToggleTextActive]}>
                  CREATE TABLE
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabToggleBtn, privateTab === 'join' && styles.tabToggleActive]}
                onPress={() => setPrivateTab('join')}
              >
                <Text style={[styles.tabToggleText, privateTab === 'join' && styles.tabToggleTextActive]}>
                  JOIN TABLE
                </Text>
              </TouchableOpacity>
            </View>

            {privateTab === 'create' ? (
              <View>
                <Text style={styles.sectionSubtitle}>YOUR PRIVATE ROOM CODE:</Text>
                <View style={styles.codeDisplayCard}>
                  <Text style={styles.codeText}>{privateRoomCode}</Text>
                  <TouchableOpacity
                    style={styles.copyBtn}
                    onPress={() => Alert.alert('Code Copied! 📋', `Share code ${privateRoomCode} with your buddies!`)}
                  >
                    <Text style={styles.copyBtnText}>COPY</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.sectionSubtitle}>SELECT BET:</Text>
                <View style={styles.betsGrid}>
                  {betsList.slice(0, 4).map((item) => (
                    <TouchableOpacity
                      key={item.bet}
                      style={[styles.betChip, selectedBet === item.bet && styles.betChipActive]}
                      onPress={() => setSelectedBet(item.bet)}
                    >
                      <Text style={styles.betChipAmount}>🪙 {item.bet.toLocaleString()}</Text>
                      <Text style={styles.betChipPrize}>WIN {item.prize}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity style={styles.startMatchBtn} onPress={handleStartGame}>
                  <Text style={styles.startMatchBtnText}>CREATE & LAUNCH TABLE ⚔️</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={styles.sectionSubtitle}>ENTER 6-DIGIT ROOM CODE:</Text>
                <TextInput
                  style={styles.codeInputField}
                  placeholder="e.g. RL8492"
                  placeholderTextColor="#999"
                  value={joinCodeInput}
                  onChangeText={setJoinCodeInput}
                  autoCapitalize="characters"
                  maxLength={8}
                />
                <TouchableOpacity
                  style={[styles.startMatchBtn, { marginTop: 16 }]}
                  onPress={() => {
                    if (!joinCodeInput.trim()) {
                      Alert.alert('Enter Code', 'Please enter a valid room code.');
                      return;
                    }
                    handleStartGame();
                  }}
                >
                  <Text style={styles.startMatchBtnText}>JOIN PRIVATE TABLE 🚀</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* ============================================================ */}
      {/* 3. PASS 'N PLAY (LOCAL OFFLINE MULTIPLAYER) MODAL */}
      {/* ============================================================ */}
      <Modal visible={passPlayModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.betModalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitleText}>📱 PASS 'N PLAY (LOCAL)</Text>
              <TouchableOpacity onPress={() => setPassPlayModalVisible(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionSubtitle}>NUMBER OF PLAYERS:</Text>
            <View style={styles.pnpCountRow}>
              {[2, 3, 4].map((count) => (
                <TouchableOpacity
                  key={count}
                  style={[styles.pnpCountBtn, pnpPlayerCount === count && styles.pnpCountBtnActive]}
                  onPress={() => setPnpPlayerCount(count)}
                >
                  <Text style={[styles.pnpCountText, pnpPlayerCount === count && styles.pnpCountTextActive]}>
                    {count} Players
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionSubtitle}>SEAT CONFIGURATION:</Text>
            {pnpSeats.slice(0, pnpPlayerCount).map((s, idx) => (
              <View key={s.color} style={styles.pnpSeatRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={[
                      styles.seatDot,
                      {
                        backgroundColor:
                          s.color === 'Red'
                            ? '#E74C3C'
                            : s.color === 'Green'
                            ? '#27AE60'
                            : s.color === 'Yellow'
                            ? '#F1C40F'
                            : '#2980B9',
                      },
                    ]}
                  />
                  <Text style={styles.seatName}>{s.name}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.seatTypeBtn, s.type === 'Human' ? styles.seatTypeHuman : styles.seatTypeBot]}
                  onPress={() => togglePnpSeat(idx)}
                >
                  <Text style={styles.seatTypeText}>{s.type === 'Human' ? '👤 HUMAN' : '🤖 BOT'}</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={[styles.startMatchBtn, { marginTop: 16 }]}
              onPress={handleStartPassAndPlay}
            >
              <Text style={styles.startMatchBtnText}>START LOCAL MATCH ⚔️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ============================================================ */}
      {/* 4. LEAGUE MODAL */}
      {/* ============================================================ */}
      <Modal visible={leagueModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.leagueModalContent}>
            <View style={styles.leagueRibbon}>
              <Text style={styles.leagueRibbonText}>LEAGUE</Text>
              <TouchableOpacity onPress={() => setLeagueModalVisible(false)} style={styles.leagueCloseBtn}>
                <Text style={styles.leagueCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.leagueTierHeader}>
              <View>
                <Text style={styles.tierName}>Current League: BRONZE</Text>
                <Text style={styles.tierTimer}>*Ends in 1 Day 19 Hr</Text>
              </View>
              <View style={styles.tierActionsRight}>
                <TouchableOpacity style={styles.tierSmallBtn}>
                  <Text style={{ fontSize: 16 }}>🏆</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tierSmallBtn}>
                  <Text style={{ fontSize: 16 }}>ℹ️</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.groupHeaderBar}>
              <Text style={styles.groupHeaderText}>YOUR GROUP</Text>
            </View>
            <ScrollView style={styles.leaderboardScroll} showsVerticalScrollIndicator={false}>
              {LEAGUE_GROUP.map((item) => (
                <View
                  key={item.rank}
                  style={[styles.rankRow, item.isUser && styles.userHighlightRow]}
                >
                  <View style={styles.rankCol}>
                    <Text style={[styles.rankNumber, item.isUser && styles.userRankText]}>
                      {item.rank}
                    </Text>
                  </View>
                  <View style={styles.rankAvatar}>
                    <Text style={{ fontSize: 24 }}>{item.avatar}</Text>
                  </View>
                  <View style={styles.rankInfoCol}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ fontSize: 14, marginRight: 5 }}>{item.flag}</Text>
                      <Text style={[styles.rankPlayerName, item.isUser && styles.userPlayerName]} numberOfLines={1}>
                        {item.name}
                      </Text>
                    </View>
                    <Text style={styles.rankPlayerTitle}>{item.title}</Text>
                  </View>
                  <View style={styles.rankEarningCol}>
                    <Text style={[styles.earningText, item.isUser && styles.userEarningText]}>
                      {item.earning}
                    </Text>
                    <Text style={{ fontSize: 16, marginLeft: 4 }}>🪙</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ============================================================ */}
      {/* 5. TEAM UP 2v2 MODAL */}
      {/* ============================================================ */}
      <Modal visible={teamUpModalVisible} transparent animationType="slide">
        <View style={styles.teamUpContainer}>
          <View style={styles.teamUpTopBar}>
            <TouchableOpacity style={styles.teamUpInfoBtn}>
              <Text style={{ fontSize: 18, color: '#fff' }}>ℹ️</Text>
            </TouchableOpacity>
            <Text style={styles.teamUpHeaderTitle}>TEAM UP</Text>
            <TouchableOpacity onPress={() => setTeamUpModalVisible(false)} style={styles.teamUpCloseBtn}>
              <Text style={{ fontSize: 18, color: '#fff', fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.teamUpContent}>
            <View style={styles.teamUpGraphicBox}>
              <Text style={{ fontSize: 68 }}>🎲</Text>
              <View style={styles.vsBadge}>
                <Text style={styles.vsBadgeText}>VS</Text>
              </View>
            </View>
            <Text style={styles.teamUpInstruction}>
              INVITE a friend to make a team.{'\n'}
              Game will start when your team is formed.
            </Text>
            <View style={styles.teamCodeCard}>
              <Text style={styles.teamCodeLabel}>TEAM CODE</Text>
              <Text style={styles.teamCodeValue}>1129385</Text>
            </View>
            <View style={styles.slotsRow}>
              <View style={styles.teamSlot}>
                <View style={styles.slotAvatarCircle}>
                  <Text style={{ fontSize: 40 }}>😎</Text>
                </View>
                <Text style={styles.slotName}>Govind (Host)</Text>
              </View>
              <TouchableOpacity
                style={[styles.teamSlot, styles.slotDotted]}
                onPress={() => Alert.alert('Teammate Joined! 🤝', 'Partner Sir Lancelot joined your 2v2 team!')}
              >
                <View style={styles.slotAddCircle}>
                  <Text style={{ fontSize: 32, color: '#fff' }}>+</Text>
                </View>
                <Text style={styles.slotInviteText}>TAP TO INVITE</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.startTeamGameBtn} onPress={handleStartGame}>
              <Text style={styles.startTeamGameText}>START 2v2 BATTLE ⚔️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backPillBtn} onPress={() => setTeamUpModalVisible(false)}>
              <Text style={styles.backPillText}>BACK</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* ============================================================ */}
      {/* 6. LUCKY WHEEL SPINNER MODAL */}
      {/* ============================================================ */}
      <Modal visible={wheelModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.wheelModalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitleText}>🎰 LUCKY WHEEL</Text>
              <TouchableOpacity onPress={() => setWheelModalVisible(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.wheelSubtitle}>SPIN FOR FREE COINS & GEMS!</Text>
            <View style={styles.wheelOuter}>
              <View style={styles.wheelPointer}>
                <Text style={{ fontSize: 28 }}>▼</Text>
              </View>
              <Animated.View style={[styles.wheelCircle, { transform: [{ rotate: spinRotation }] }]}>
                <Text style={{ fontSize: 40 }}>🎡</Text>
              </Animated.View>
            </View>
            <TouchableOpacity
              style={[styles.spinBtn, isSpinning && { opacity: 0.6 }]}
              onPress={handleSpinWheel}
              disabled={isSpinning}
            >
              <Text style={styles.spinBtnText}>{isSpinning ? 'SPINNING...' : 'SPIN FREE!'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ============================================================ */}
      {/* 7. CLUBS & SETTINGS MODALS */}
      {/* ============================================================ */}
      <Modal visible={clubsModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.betModalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitleText}>🏛️ ROYAL CLUBS</Text>
              <TouchableOpacity onPress={() => setClubsModalVisible(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionSubtitle}>YOUR CLUB: KINGS OF LUDO</Text>
            <View style={styles.clubCard}>
              <Text style={{ fontSize: 32 }}>👑</Text>
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.clubTitle}>Kings of Ludo</Text>
                <Text style={styles.clubMembers}>Members: 28/30 • Weekly Coins: 450M</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.startMatchBtn}
              onPress={() => {
                addGold(1000);
                Alert.alert('Club Reward Claimed! 🪙', 'You received 1,000 Gold from Club Chest!');
                setClubsModalVisible(false);
              }}
            >
              <Text style={styles.startMatchBtnText}>CLAIM CLUB CHEST (1,000 🪙)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={settingsModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.betModalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitleText}>⚙️ SETTINGS</Text>
              <TouchableOpacity onPress={() => setSettingsModalVisible(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.settingsRow}>
              <Text style={styles.settingsLabel}>Sound Effects</Text>
              <Text style={styles.settingsToggle}>🟢 ON</Text>
            </View>
            <View style={styles.settingsRow}>
              <Text style={styles.settingsLabel}>Chat Bubbles</Text>
              <Text style={styles.settingsToggle}>🟢 ON</Text>
            </View>
            <View style={styles.settingsRow}>
              <Text style={styles.settingsLabel}>Vibrations</Text>
              <Text style={styles.settingsToggle}>🟢 ON</Text>
            </View>
            <TouchableOpacity
              style={[styles.startMatchBtn, { backgroundColor: '#752273', marginTop: 15 }]}
              onPress={() => setSettingsModalVisible(false)}
            >
              <Text style={styles.startMatchBtnText}>SAVE & CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#370A36',
  },
  watermarkContainer: {
    position: 'absolute',
    top: '26%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.1,
  },
  crownWatermark: {
    fontSize: 54,
  },
  titleWatermark: {
    fontSize: 54,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 4,
  },
  subtitleWatermark: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 6,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 6,
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E051E',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#521350',
  },
  currencyPill: {
    paddingRight: 4,
  },
  starIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  energyIcon: {
    fontSize: 15,
  },
  coinIcon: {
    fontSize: 15,
    marginRight: 4,
  },
  gemIcon: {
    fontSize: 13,
    marginRight: 4,
  },
  pillText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  currencyAmount: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
    marginRight: 5,
  },
  plusButton: {
    backgroundColor: '#27AE70',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
    marginTop: -2,
  },
  settingsBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1E051E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#521350',
  },
  cogIcon: {
    fontSize: 16,
  },

  // Profile Row
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#521350',
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderWidth: 1.5,
    borderColor: '#752273',
    maxWidth: width * 0.44,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFDF00',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  profileInfo: {
    marginLeft: 6,
  },
  profileName: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  profileSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagIcon: {
    fontSize: 11,
    marginRight: 3,
  },
  profileLevel: {
    color: '#E6C985',
    fontSize: 10,
    fontWeight: '700',
  },
  miniBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniBadge: {
    width: 44,
    height: 46,
    backgroundColor: '#521350',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
    borderWidth: 1.5,
    borderColor: '#752273',
  },
  bigWinText: {
    color: '#FFDF00',
    fontSize: 10,
    fontWeight: '900',
    lineHeight: 11,
  },
  bigWinSub: {
    color: '#FFDF00',
    fontSize: 8,
    fontWeight: '900',
    lineHeight: 9,
  },
  lockBadge: {
    position: 'absolute',
    bottom: -5,
    backgroundColor: '#F5A623',
    borderRadius: 6,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  lockText: {
    color: '#000',
    fontSize: 7,
    fontWeight: '900',
  },

  // Floating Actions
  floatingActionsRow: {
    position: 'absolute',
    left: 8,
    top: 96,
    zIndex: 10,
  },
  floatingActionBtn: {
    width: 42,
    height: 44,
    backgroundColor: '#FFDF00',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 5,
  },
  notificationDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#E74C4C',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  notificationDotText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
  },
  floatingActionLabel: {
    fontSize: 7,
    fontWeight: '900',
    color: '#521350',
    marginTop: -2,
  },

  // 6-Mode Grid
  modesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 80,
    marginBottom: 10,
  },
  modeCardBase: {
    width: '48.5%',
    height: 160,
    borderRadius: 18,
    padding: 8,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
  card2Player: {
    backgroundColor: '#F57C00',
    borderWidth: 2.5,
    borderColor: '#FFE082',
  },
  card4Player: {
    backgroundColor: '#27AE60',
    borderWidth: 2.5,
    borderColor: '#A3E4D7',
  },
  cardFriends: {
    backgroundColor: '#8E44AD',
    borderWidth: 2.5,
    borderColor: '#D29BFD',
  },
  cardTeamUp: {
    backgroundColor: '#2980B9',
    borderWidth: 2.5,
    borderColor: '#85C1E9',
  },
  cardLocal: {
    backgroundColor: '#D35400',
    borderWidth: 2.5,
    borderColor: '#F5CBA7',
  },
  cardQuick: {
    backgroundColor: '#C0392B',
    borderWidth: 2.5,
    borderColor: '#FADBD8',
  },
  cardHeaderTag: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  cardTagText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '900',
  },
  cardCenterGraphic: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  number3D: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFF',
    textShadowColor: '#A66606',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2,
  },
  tokenPairRow: {
    flexDirection: 'row',
    marginTop: -8,
  },
  circle4Tokens: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  micCornerBadge: {
    position: 'absolute',
    top: 0,
    right: 4,
    backgroundColor: '#3986D9',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomCodeMiniTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginTop: -4,
  },
  roomCodeMiniText: {
    color: '#FFF',
    fontSize: 7,
    fontWeight: '900',
  },
  vsCenterBadge: {
    position: 'absolute',
    backgroundColor: '#E74C3C',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  vsCenterText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
  },
  cardBottomPill: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 10,
    paddingVertical: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  cardBottomTitle: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  cardBottomSub: {
    color: '#EEE',
    fontSize: 8,
    fontWeight: '700',
  },

  // Secondary Cards
  secondaryCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  secondaryCard: {
    width: '23%',
    height: 64,
    backgroundColor: '#521350',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#752273',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryCardLabel: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
    marginTop: 2,
  },

  // Common Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  betModalContent: {
    width: '100%',
    backgroundColor: '#420A3F',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#F5A623',
    padding: 16,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitleText: {
    color: '#FFDF00',
    fontSize: 16,
    fontWeight: '900',
  },
  closeBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E74C4C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '900',
  },
  sectionSubtitle: {
    color: '#E6C985',
    fontSize: 11,
    fontWeight: '800',
    marginVertical: 6,
  },
  variationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  variationPill: {
    flex: 1,
    backgroundColor: '#2F062E',
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: 'center',
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: '#752273',
  },
  variationPillActive: {
    backgroundColor: '#F5A623',
    borderColor: '#FFDF00',
  },
  variationText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
  variationTextActive: {
    color: '#000',
    fontWeight: '900',
  },
  betsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  betChip: {
    width: '31%',
    backgroundColor: '#2F062E',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#752273',
  },
  betChipActive: {
    backgroundColor: '#521350',
    borderColor: '#FFDF00',
    borderWidth: 2,
  },
  betChipAmount: {
    color: '#FFDF00',
    fontSize: 10,
    fontWeight: '800',
  },
  betChipPrize: {
    color: '#27AE70',
    fontSize: 8,
    fontWeight: '700',
    marginTop: 2,
  },
  startMatchBtn: {
    backgroundColor: '#F5A623',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  startMatchBtnText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '900',
  },

  // Private Table Specific
  tabToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#2F062E',
    borderRadius: 10,
    padding: 3,
    marginBottom: 12,
  },
  tabToggleBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabToggleActive: {
    backgroundColor: '#752273',
  },
  tabToggleText: {
    color: '#AAA',
    fontSize: 11,
    fontWeight: '800',
  },
  tabToggleTextActive: {
    color: '#FFF',
    fontWeight: '900',
  },
  codeDisplayCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2F062E',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#FFDF00',
    marginBottom: 12,
  },
  codeText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },
  copyBtn: {
    backgroundColor: '#27AE70',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  copyBtnText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
  },
  codeInputField: {
    backgroundColor: '#2F062E',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#752273',
  },

  // Pass 'n Play Specific
  pnpCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pnpCountBtn: {
    flex: 1,
    backgroundColor: '#2F062E',
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: 'center',
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: '#752273',
  },
  pnpCountBtnActive: {
    backgroundColor: '#FFDF00',
    borderColor: '#FFF',
  },
  pnpCountText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  pnpCountTextActive: {
    color: '#000',
    fontWeight: '900',
  },
  pnpSeatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2F062E',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#752273',
  },
  seatDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  seatName: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  seatTypeBtn: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  seatTypeHuman: {
    backgroundColor: '#27AE70',
  },
  seatTypeBot: {
    backgroundColor: '#3986D9',
  },
  seatTypeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
  },

  // League Modal (Image 2 Screen 2 replica)
  leagueModalContent: {
    width: '100%',
    height: '85%',
    backgroundColor: '#420A3F',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#F5A623',
    overflow: 'hidden',
  },
  leagueRibbon: {
    backgroundColor: '#E74C4C',
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#F5A623',
  },
  leagueRibbonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
  leagueCloseBtn: {
    position: 'absolute',
    right: 10,
    top: 7,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leagueCloseText: {
    color: '#E74C4C',
    fontSize: 12,
    fontWeight: '900',
  },
  leagueTierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2F062E',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#752273',
  },
  tierName: {
    color: '#FFDF00',
    fontSize: 13,
    fontWeight: '900',
  },
  tierTimer: {
    color: '#FFF',
    fontSize: 10,
    marginTop: 2,
  },
  tierActionsRight: {
    flexDirection: 'row',
  },
  tierSmallBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3986D9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  groupHeaderBar: {
    backgroundColor: '#1E051E',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  groupHeaderText: {
    color: '#E6C985',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  leaderboardScroll: {
    flex: 1,
    paddingHorizontal: 6,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#521350',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginVertical: 2,
    borderWidth: 1,
    borderColor: '#752273',
  },
  userHighlightRow: {
    backgroundColor: '#27AE70',
    borderColor: '#72F3B6',
    borderWidth: 2,
  },
  rankCol: {
    width: 24,
  },
  rankNumber: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
  },
  userRankText: {
    color: '#000',
  },
  rankAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  rankInfoCol: {
    flex: 1,
  },
  rankPlayerName: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  userPlayerName: {
    color: '#000',
  },
  rankPlayerTitle: {
    color: '#E6C985',
    fontSize: 9,
    fontWeight: '700',
  },
  rankEarningCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  earningText: {
    color: '#FFDF00',
    fontSize: 12,
    fontWeight: '900',
  },
  userEarningText: {
    color: '#000',
  },

  // Team Up Screen
  teamUpContainer: {
    flex: 1,
    backgroundColor: '#2C8E4A',
  },
  teamUpTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#1E6635',
  },
  teamUpInfoBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamUpHeaderTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
  teamUpCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: '#E74C3C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamUpContent: {
    padding: 16,
    alignItems: 'center',
  },
  teamUpGraphicBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  vsBadge: {
    position: 'absolute',
    backgroundColor: '#E74C3C',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  vsBadgeText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
  },
  teamUpInstruction: {
    color: '#D4F5DE',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 16,
  },
  teamCodeCard: {
    backgroundColor: '#1E6635',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 26,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#72F3B6',
  },
  teamCodeLabel: {
    color: '#72F3B6',
    fontSize: 10,
    fontWeight: '800',
  },
  teamCodeValue: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 3,
    marginTop: 2,
  },
  slotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    width: '100%',
  },
  teamSlot: {
    alignItems: 'center',
    marginHorizontal: 14,
  },
  slotAvatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFDF00',
  },
  slotName: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 6,
  },
  slotDotted: {
    alignItems: 'center',
  },
  slotAddCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: '#FFF',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotInviteText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 6,
  },
  startTeamGameBtn: {
    backgroundColor: '#FFDF00',
    borderRadius: 14,
    paddingVertical: 12,
    width: '80%',
    alignItems: 'center',
    marginBottom: 10,
  },
  startTeamGameText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '900',
  },
  backPillBtn: {
    backgroundColor: '#A3D9B1',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  backPillText: {
    color: '#1E6635',
    fontSize: 12,
    fontWeight: '900',
  },

  // Wheel Modal
  wheelModalContent: {
    width: '88%',
    backgroundColor: '#420A3F',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FFDF00',
    padding: 14,
    alignItems: 'center',
  },
  wheelSubtitle: {
    color: '#E6C985',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 14,
  },
  wheelOuter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  wheelPointer: {
    position: 'absolute',
    top: -14,
    zIndex: 10,
  },
  wheelCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#521350',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFDF00',
  },
  spinBtn: {
    backgroundColor: '#FFDF00',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginTop: 8,
  },
  spinBtnText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '900',
  },

  // Club & Settings
  clubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2F062E',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#752273',
  },
  clubTitle: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  clubMembers: {
    color: '#E6C985',
    fontSize: 10,
    marginTop: 2,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2F062E',
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
  },
  settingsLabel: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  settingsToggle: {
    color: '#27AE70',
    fontSize: 11,
    fontWeight: '900',
  },
});
