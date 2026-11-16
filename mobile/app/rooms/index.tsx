import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { NOVA_COLORS } from '../../src/theme/colors';
import { NovaHeader } from '../../src/components/nova/NovaHeader';
import { NovaBoardPreview } from '../../src/components/nova/NovaBoardPreview';
import { NovaButton } from '../../src/components/nova/NovaButton';

export default function PrivateRoomsScreen() {
  const router = useRouter();

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <NovaHeader
        title="Your private table"
        subtitle="The best seat is the one beside your friends."
        showBack={true}
        onBack={() => router.back()}
      />

      <View style={styles.centerBlock}>
        <View style={styles.boardWrap}>
          <NovaBoardPreview size={210} />
        </View>

        <Text style={styles.heading}>Same game.{'\n'}Your favorite people.</Text>
        <Text style={styles.subtext}>
          Create a room or hop into a friend’s game.{'\n'}No pressure, just play.
        </Text>
      </View>

      <View style={styles.actions}>
        <NovaButton
          title="Create a room"
          variant="primary"
          onPress={() => router.push('/rooms/create' as any)}
          style={styles.btnSpacing}
        />

        <NovaButton
          title="Join with a code"
          variant="dark"
          onPress={() => router.push('/rooms/join' as any)}
          style={styles.btnSpacing}
        />

        <Text style={styles.infoTag}>
          Up to 4 players · Voice & chat · Custom rules
        </Text>
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
  centerBlock: {
    paddingHorizontal: 24,
    alignItems: 'center',
    marginVertical: 12,
  },
  boardWrap: {
    marginBottom: 20,
  },
  heading: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 34,
  },
  subtext: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
  actions: {
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
  },
  btnSpacing: {
    marginBottom: 12,
  },
  infoTag: {
    color: NOVA_COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
  },
});
