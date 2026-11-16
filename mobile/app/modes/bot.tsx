import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { NOVA_COLORS } from '../../src/theme/colors';
import { NovaHeader } from '../../src/components/nova/NovaHeader';
import { NovaDie } from '../../src/components/nova/NovaDie';
import { NovaButton } from '../../src/components/nova/NovaButton';

const DIFFICULTIES = [
  {
    id: 'easy',
    name: 'Easy',
    desc: 'A friendly warm-up',
    color: NOVA_COLORS.accentMint,
  },
  {
    id: 'balanced',
    name: 'Balanced',
    desc: 'A little challenge, a lot of fun',
    color: NOVA_COLORS.accentPurple,
  },
  {
    id: 'expert',
    name: 'Expert',
    desc: 'Make every move count',
    color: NOVA_COLORS.accentCoral,
  },
];

export default function PlayComputerScreen() {
  const router = useRouter();
  const [selectedDiff, setSelectedDiff] = useState('balanced');

  const handlePlayBot = () => {
    router.push({
      pathname: '/gameplay/[matchId]',
      params: { matchId: `bot_${selectedDiff}`, mode: 'bot', difficulty: selectedDiff },
    } as any);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <NovaHeader
        title="A little solo practice"
        subtitle="Play your way. No pressure."
        showBack={true}
        onBack={() => router.back()}
      />

      <View style={styles.content}>
        <View style={styles.dieWrap}>
          <NovaDie value={6} size={64} theme="nova" />
        </View>

        <Text style={styles.heading}>Meet Nova Bot</Text>
        <Text style={styles.subtext}>
          Sharpen your strategy before your next match.
        </Text>

        <Text style={styles.label}>DIFFICULTY</Text>

        <View style={styles.diffList}>
          {DIFFICULTIES.map((diff) => {
            const isSelected = selectedDiff === diff.id;
            return (
              <TouchableOpacity
                key={diff.id}
                style={[
                  styles.diffCard,
                  isSelected && styles.diffCardActive,
                ]}
                onPress={() => setSelectedDiff(diff.id)}
                activeOpacity={0.8}
              >
                <View style={styles.diffInfo}>
                  <Text style={styles.diffName}>{diff.name}</Text>
                  <Text style={styles.diffDesc}>{diff.desc}</Text>
                </View>

                {isSelected ? (
                  <View style={styles.checkWrap}>
                    <Ionicons name="checkmark" size={16} color="#0d101e" />
                  </View>
                ) : (
                  <View style={styles.radioOuter} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <NovaButton
          title="Play Nova Bot"
          variant="primary"
          onPress={handlePlayBot}
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
    alignItems: 'center',
    marginTop: 10,
  },
  dieWrap: {
    marginBottom: 16,
  },
  heading: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtext: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 26,
  },
  label: {
    alignSelf: 'flex-start',
    color: NOVA_COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  diffList: {
    width: '100%',
  },
  diffCard: {
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  diffCardActive: {
    borderColor: NOVA_COLORS.accentPurple,
    backgroundColor: '#1d233d',
  },
  diffInfo: {
    flex: 1,
  },
  diffName: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  diffDesc: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 12,
  },
  checkWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: NOVA_COLORS.accentPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  footer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
});
