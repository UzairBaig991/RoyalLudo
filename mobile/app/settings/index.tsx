import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { NOVA_COLORS } from '../../src/theme/colors';
import { NovaHeader } from '../../src/components/nova/NovaHeader';
import { useSettingsStore } from '../../src/store/useSettingsStore';

export default function SettingsScreen() {
  const router = useRouter();
  const {
    soundEffects,
    gameMusic,
    hapticFeedback,
    allowVoiceChat,
    notifications,
    language,
    toggleSetting,
  } = useSettingsStore();

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <NovaHeader
        title="Just the way you like it"
        subtitle="Settings"
        showBack={true}
        onBack={() => router.back()}
      />

      <View style={styles.content}>
        {/* SOUND & PLAY */}
        <Text style={styles.sectionHeader}>SOUND & PLAY</Text>
        <View style={styles.groupCard}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Sound effects</Text>
            <Switch
              value={soundEffects}
              onValueChange={() => toggleSetting('soundEffects')}
              trackColor={{ false: '#2a2e45', true: NOVA_COLORS.accentPurple }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Game music</Text>
            <Switch
              value={gameMusic}
              onValueChange={() => toggleSetting('gameMusic')}
              trackColor={{ false: '#2a2e45', true: NOVA_COLORS.accentPurple }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Haptic feedback</Text>
            <Switch
              value={hapticFeedback}
              onValueChange={() => toggleSetting('hapticFeedback')}
              trackColor={{ false: '#2a2e45', true: NOVA_COLORS.accentPurple }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={[styles.row, styles.lastRow]}>
            <Text style={styles.rowLabel}>Allow voice chat</Text>
            <Switch
              value={allowVoiceChat}
              onValueChange={() => toggleSetting('allowVoiceChat')}
              trackColor={{ false: '#2a2e45', true: NOVA_COLORS.accentPurple }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* YOUR EXPERIENCE */}
        <Text style={[styles.sectionHeader, { marginTop: 24 }]}>YOUR EXPERIENCE</Text>
        <View style={styles.groupCard}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Language</Text>
            <Text style={styles.rowValue}>{language}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Notifications</Text>
            <Switch
              value={notifications}
              onValueChange={() => toggleSetting('notifications')}
              trackColor={{ false: '#2a2e45', true: NOVA_COLORS.accentPurple }}
              thumbColor="#ffffff"
            />
          </View>

          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push('/settings/privacy' as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.rowLabel}>Account and privacy</Text>
            <Ionicons name="chevron-forward" size={18} color={NOVA_COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.row, styles.lastRow]}
            onPress={() => router.push('/settings/rules' as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.rowLabel}>Help and rules</Text>
            <Ionicons name="chevron-forward" size={18} color={NOVA_COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.versionTag}>Ludo Nova  ·  v1.0</Text>
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
  sectionHeader: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
    paddingLeft: 4,
  },
  groupCard: {
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  rowValue: {
    color: NOVA_COLORS.accentPurple,
    fontSize: 14,
    fontWeight: '700',
  },
  versionTag: {
    color: NOVA_COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 28,
  },
});
