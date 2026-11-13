import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ROYAL_COLORS } from '../../src/theme/colors';
import { RoyalCard } from '../../src/components/ui/RoyalCard';
import { useGameStore } from '../../src/store/useGameStore';

export default function SettingsScreen() {
  const { soundEnabled, vibrationEnabled, toggleSound, toggleVibration } = useGameStore();
  const [musicEnabled, setMusicEnabled] = React.useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  const handleSupport = () => {
    Alert.alert('Royal Support', 'For assistance, inquiries, or bug reports, please contact: support@royalludo.com');
  };

  const handlePrivacy = () => {
    Alert.alert('Privacy Policy', 'Royal Ludo values your privacy. No personal data is sold or shared with 3rd parties.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>AUDIO & HAPTICS</Text>
        <RoyalCard style={styles.card}>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Sound Effects</Text>
              <Text style={styles.settingSub}>Dice rolling, token jumps and capture SFX</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={toggleSound}
              thumbColor={soundEnabled ? ROYAL_COLORS.gold : '#718096'}
              trackColor={{ false: ROYAL_COLORS.surfaceBg, true: ROYAL_COLORS.borderGold }}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Haptic Feedback</Text>
              <Text style={styles.settingSub}>Vibrate device on your turn & captures</Text>
            </View>
            <Switch
              value={vibrationEnabled}
              onValueChange={toggleVibration}
              thumbColor={vibrationEnabled ? ROYAL_COLORS.gold : '#718096'}
              trackColor={{ false: ROYAL_COLORS.surfaceBg, true: ROYAL_COLORS.borderGold }}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Background Music</Text>
              <Text style={styles.settingSub}>Ambient royal orchestra music</Text>
            </View>
            <Switch
              value={musicEnabled}
              onValueChange={setMusicEnabled}
              thumbColor={musicEnabled ? ROYAL_COLORS.gold : '#718096'}
              trackColor={{ false: ROYAL_COLORS.surfaceBg, true: ROYAL_COLORS.borderGold }}
            />
          </View>
        </RoyalCard>

        <Text style={styles.sectionTitle}>GAME NOTIFICATIONS</Text>
        <RoyalCard style={styles.card}>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingSub}>Daily card reminders & friend match invites</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              thumbColor={notificationsEnabled ? ROYAL_COLORS.gold : '#718096'}
              trackColor={{ false: ROYAL_COLORS.surfaceBg, true: ROYAL_COLORS.borderGold }}
            />
          </View>
        </RoyalCard>

        <Text style={styles.sectionTitle}>INFORMATION & SUPPORT</Text>
        <RoyalCard style={styles.card}>
          <TouchableOpacity style={styles.navRow} onPress={handleSupport}>
            <Text style={styles.navLabel}>Help & Customer Support</Text>
            <Text style={styles.navArrow}>&gt;</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.navRow} onPress={handlePrivacy}>
            <Text style={styles.navLabel}>Privacy Policy & Terms</Text>
            <Text style={styles.navArrow}>&gt;</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.navRow}>
            <Text style={styles.navLabel}>Application Version</Text>
            <Text style={styles.versionText}>1.0.0 (Royal Edition)</Text>
          </View>
        </RoyalCard>
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
  sectionTitle: {
    color: ROYAL_COLORS.goldLight,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 10,
  },
  card: {
    marginBottom: 16,
    padding: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  settingLabel: {
    color: ROYAL_COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  settingSub: {
    color: ROYAL_COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: ROYAL_COLORS.border,
    marginVertical: 12,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  navLabel: {
    color: ROYAL_COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  navArrow: {
    color: ROYAL_COLORS.textMuted,
    fontSize: 16,
    fontWeight: '700',
  },
  versionText: {
    color: ROYAL_COLORS.gold,
    fontSize: 12,
    fontWeight: '700',
  },
});
