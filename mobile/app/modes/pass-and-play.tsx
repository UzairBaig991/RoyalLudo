import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { NOVA_COLORS } from '../../src/theme/colors';
import { NovaHeader } from '../../src/components/nova/NovaHeader';
import { NovaButton } from '../../src/components/nova/NovaButton';

export default function PassAndPlayScreen() {
  const router = useRouter();
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(4);

  const [players, setPlayers] = useState([
    { id: 0, name: 'Alex', label: 'Player 1', color: NOVA_COLORS.coral },
    { id: 1, name: 'Maya', label: 'Player 2', color: NOVA_COLORS.mint },
    { id: 2, name: 'Sam', label: 'Player 3', color: NOVA_COLORS.blue },
    { id: 3, name: 'Zara', label: 'Player 4', color: NOVA_COLORS.gold },
  ]);

  const handleNameChange = (index: number, text: string) => {
    const updated = [...players];
    updated[index].name = text;
    setPlayers(updated);
  };

  const handleStart = () => {
    router.push({
      pathname: '/gameplay/[matchId]',
      params: { matchId: 'local_pass_play', mode: 'pass_and_play', players: playerCount },
    } as any);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <NovaHeader
        title="Pass and play"
        subtitle="One phone. Everyone’s invited."
        showBack={true}
        onBack={() => router.back()}
      />

      <View style={styles.content}>
        <Text style={styles.sectionHeading}>Who’s at the table?</Text>

        {/* Count Toggle */}
        <View style={styles.toggleRow}>
          {([2, 3, 4] as const).map((cnt) => (
            <TouchableOpacity
              key={cnt}
              style={[
                styles.toggleBtn,
                playerCount === cnt && styles.toggleBtnActive,
              ]}
              onPress={() => setPlayerCount(cnt)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.toggleBtnText,
                  playerCount === cnt && styles.toggleBtnTextActive,
                ]}
              >
                {cnt} players
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Player Names List */}
        <View style={styles.playersList}>
          {players.slice(0, playerCount).map((p, idx) => (
            <View key={p.id} style={styles.playerRow}>
              <View style={[styles.colorDot, { backgroundColor: p.color }]} />
              <View style={styles.playerInfo}>
                <TextInput
                  style={styles.nameInput}
                  value={p.name}
                  onChangeText={(text) => handleNameChange(idx, text)}
                  placeholder={`Player ${idx + 1}`}
                  placeholderTextColor={NOVA_COLORS.textMuted}
                />
                <Text style={styles.playerLabel}>{p.label}</Text>
              </View>
              <View style={styles.checkBadge}>
                <Ionicons name="checkmark" size={16} color="#0d101e" />
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.hintText}>
          No internet needed. Pass the phone after each roll and have fun!
        </Text>
      </View>

      <View style={styles.footer}>
        <NovaButton
          title="Start local game"
          variant="primary"
          onPress={handleStart}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: NOVA_COLORS.bg,
    justifyContent: 'space-between',
    paddingBottom: 28,
  },
  content: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  sectionHeading: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: {
    backgroundColor: NOVA_COLORS.accentPurple,
  },
  toggleBtnText: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  toggleBtnTextActive: {
    color: NOVA_COLORS.textDark,
  },
  playersList: {
    marginBottom: 16,
  },
  playerRow: {
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 14,
  },
  playerInfo: {
    flex: 1,
  },
  nameInput: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    padding: 0,
  },
  playerLabel: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: NOVA_COLORS.accentMint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintText: {
    color: NOVA_COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 10,
  },
  footer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
});
