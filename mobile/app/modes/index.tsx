import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { NOVA_COLORS } from '../../src/theme/colors';
import { NovaHeader } from '../../src/components/nova/NovaHeader';
import { NovaBadge } from '../../src/components/nova/NovaBadge';
import { NovaDie } from '../../src/components/nova/NovaDie';
import { useCustomizationStore } from '../../src/store/useCustomizationStore';

export default function ChooseModeScreen() {
  const router = useRouter();
  const { dice } = useCustomizationStore();
  const equippedDie = dice.find((d) => d.equipped) || dice[0];

  const modes = [
    {
      id: 'classic',
      name: 'Classic',
      desc: 'The original. Race all 4 tokens home.',
      badge: '2–4 PLAYERS',
      badgeColor: 'purple' as const,
      dieValue: 1,
      route: '/modes/classic',
    },
    {
      id: 'quick',
      name: 'Quick play',
      desc: 'One token. Fast finish. More fun.',
      badge: '~5 MIN',
      badgeColor: 'mint' as const,
      dieValue: 2,
      route: '/modes/classic?quick=true',
    },
    {
      id: 'team',
      name: 'Team up',
      desc: 'Two teams. One shared victory.',
      badge: '2 VS 2',
      badgeColor: 'gold' as const,
      dieValue: 3,
      route: '/modes/team',
    },
    {
      id: 'private',
      name: 'Private table',
      desc: 'Make room for your favorite people.',
      badge: 'FRIENDS',
      badgeColor: 'blue' as const,
      dieValue: 4,
      route: '/rooms',
    },
    {
      id: 'offline',
      name: 'Offline',
      desc: 'Pass and play, or challenge the bot.',
      badge: 'NO WI-FI',
      badgeColor: 'coral' as const,
      dieValue: 5,
      route: '/modes/pass-and-play',
    },
  ];

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <NovaHeader
        title="Find your game"
        subtitle="Different ways to play. One great feeling."
        showBack={true}
        onBack={() => router.back()}
      />

      <View style={styles.list}>
        {modes.map((mode) => (
          <TouchableOpacity
            key={mode.id}
            style={styles.modeCard}
            onPress={() => router.push(mode.route as any)}
            activeOpacity={0.8}
          >
            <View style={styles.dieWrap}>
              <NovaDie value={mode.dieValue} size={48} theme={equippedDie.previewTheme} />
            </View>

            <View style={styles.info}>
              <View style={styles.titleRow}>
                <Text style={styles.modeName}>{mode.name}</Text>
                <NovaBadge
                  label={mode.badge}
                  color={mode.badgeColor}
                  style={styles.modeBadge}
                />
              </View>
              <Text style={styles.modeDesc}>{mode.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: NOVA_COLORS.bg,
    paddingBottom: 30,
  },
  list: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  modeCard: {
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  dieWrap: {
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modeName: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  modeBadge: {
    height: 24,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  modeDesc: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
});
