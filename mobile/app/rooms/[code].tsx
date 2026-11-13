import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ROYAL_COLORS, COLOR_MAP } from '../../src/theme/colors';
import { AvatarWithFrame } from '../../src/components/ui/AvatarWithFrame';
import { RoyalCard } from '../../src/components/ui/RoyalCard';
import { RoyalButton } from '../../src/components/ui/RoyalButton';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useGameStore } from '../../src/store/useGameStore';

interface SlotParticipant {
  seatIndex: number;
  colorKey: 'RED' | 'GREEN' | 'YELLOW' | 'BLUE';
  username: string | null;
  isHost: boolean;
  isReady: boolean;
  isBot: boolean;
}

export default function WaitingRoomScreen() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code: string }>();
  const { profile } = useAuthStore();
  const { startNewGame } = useGameStore();

  const [isReady, setIsReady] = useState(true);
  const [participants, setParticipants] = useState<SlotParticipant[]>([
    {
      seatIndex: 0,
      colorKey: 'RED',
      username: profile?.username || 'You',
      isHost: true,
      isReady: true,
      isBot: false,
    },
    {
      seatIndex: 1,
      colorKey: 'GREEN',
      username: 'QueenSophia',
      isHost: false,
      isReady: true,
      isBot: false,
    },
    {
      seatIndex: 2,
      colorKey: 'YELLOW',
      username: null, // Empty slot
      isHost: false,
      isReady: false,
      isBot: false,
    },
    {
      seatIndex: 3,
      colorKey: 'BLUE',
      username: null, // Empty slot
      isHost: false,
      isReady: false,
      isBot: false,
    },
  ]);

  const handleStartGame = () => {
    // Fill vacant seats with bots and launch game
    const filledPlayers = participants.map((p) => {
      if (p.username) {
        return {
          id: p.isHost ? (profile?.userId || 'p1') : `player_${p.seatIndex}`,
          username: p.username,
          isBot: p.isBot,
        };
      }
      return {
        id: `bot_${p.seatIndex}`,
        username: `Bot ${p.colorKey}`,
        isBot: true,
      };
    });

    startNewGame({
      mode: 'classic',
      playerCount: 4,
      players: filledPlayers,
    });

    router.replace(`/gameplay/room_${code}`);
  };

  const handleCopyCode = () => {
    Alert.alert('Code Copied! 📋', `Share code ${code} with friends to invite them to this table.`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Table Code Header Card */}
        <RoyalCard style={styles.codeCard} goldBorder>
          <Text style={styles.codeLabel}>PRIVATE TABLE CODE</Text>
          <Text style={styles.codeDisplay}>{code || 'RL9482'}</Text>
          <RoyalButton
            title="SHARE / COPY CODE"
            variant="secondary"
            size="small"
            onPress={handleCopyCode}
            style={styles.copyBtn}
          />
        </RoyalCard>

        {/* 4 Seat Quadrant Grid */}
        <Text style={styles.sectionTitle}>PLAYERS AT TABLE (4 SEATS)</Text>
        <View style={styles.seatsGrid}>
          {participants.map((seat) => {
            const color = COLOR_MAP[seat.colorKey];
            const isOccupied = seat.username !== null;

            return (
              <RoyalCard
                key={seat.seatIndex}
                style={[
                  styles.seatCard,
                  isOccupied && { borderColor: color.primary },
                ]}
              >
                <View
                  style={[
                    styles.seatBadge,
                    { backgroundColor: color.primary },
                  ]}
                >
                  <Text style={styles.seatBadgeText}>{seat.colorKey}</Text>
                </View>

                {isOccupied ? (
                  <View style={{ alignItems: 'center', marginTop: 8 }}>
                    <AvatarWithFrame username={seat.username!} size={52} />
                    <Text style={styles.seatedName} numberOfLines={1}>
                      {seat.username}
                    </Text>
                    <Text style={[styles.readyStatusText, { color: seat.isReady ? ROYAL_COLORS.green : ROYAL_COLORS.yellow }]}>
                      {seat.isHost ? '👑 HOST' : seat.isReady ? '✓ READY' : 'WAITING'}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.emptySlot}>
                    <Text style={{ fontSize: 32, opacity: 0.5 }}>➕</Text>
                    <Text style={styles.waitingText}>Vacant Slot</Text>
                    <Text style={styles.botNote}>Will be filled by Bot if started</Text>
                  </View>
                )}
              </RoyalCard>
            );
          })}
        </View>

        {/* Start Game Action Button */}
        <RoyalButton
          title="START MATCH NOW"
          variant="gold"
          size="large"
          onPress={handleStartGame}
          style={styles.startBtn}
        />
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
    padding: 20,
    paddingBottom: 40,
  },
  codeCard: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 24,
  },
  codeLabel: {
    color: ROYAL_COLORS.gold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },
  codeDisplay: {
    color: ROYAL_COLORS.textPrimary,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 6,
    marginVertical: 8,
  },
  copyBtn: {
    marginTop: 4,
  },
  sectionTitle: {
    color: ROYAL_COLORS.goldLight,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 12,
  },
  seatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  seatCard: {
    width: '48%',
    minHeight: 150,
    alignItems: 'center',
    padding: 12,
    marginBottom: 14,
    position: 'relative',
  },
  seatBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  seatBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
  },
  seatedName: {
    color: ROYAL_COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 8,
  },
  readyStatusText: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 4,
  },
  emptySlot: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  waitingText: {
    color: ROYAL_COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
  botNote: {
    color: ROYAL_COLORS.textMuted,
    fontSize: 9,
    marginTop: 2,
    textAlign: 'center',
  },
  startBtn: {
    width: '100%',
  },
});
