import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { NOVA_COLORS } from '../../src/theme/colors';
import { NovaHeader } from '../../src/components/nova/NovaHeader';
import { NovaCard } from '../../src/components/nova/NovaCard';
import { NovaButton } from '../../src/components/nova/NovaButton';
import { useSettingsStore } from '../../src/store/useSettingsStore';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function AccountPrivacyScreen() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const {
    showOnlineStatus,
    allowFriendRequests,
    personalizedOffers,
    toggleSetting,
  } = useSettingsStore();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/(auth)/welcome' as any);
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert('Delete Account', 'Deleting your account is permanent. All progress and tokens will be deleted.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/(auth)/welcome' as any);
        },
      },
    ]);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <NovaHeader
        title="Account & privacy"
        subtitle="Your game. Your choices."
        showBack={true}
        onBack={() => router.back()}
      />

      <View style={styles.content}>
        {/* Status Card */}
        <NovaCard variant="purple" style={styles.statusCard}>
          <View style={styles.shieldWrap}>
            <Ionicons name="shield-checkmark" size={24} color={NOVA_COLORS.accentMint} />
          </View>
          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>Your progress is safe</Text>
            <Text style={styles.statusSub}>Connected with Apple  ·  ID 849 225</Text>
          </View>
        </NovaCard>

        {/* PRIVACY Section */}
        <Text style={styles.sectionHeader}>PRIVACY</Text>
        <View style={styles.groupCard}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Show online status</Text>
            <Switch
              value={showOnlineStatus}
              onValueChange={() => toggleSetting('showOnlineStatus')}
              trackColor={{ false: '#2a2e45', true: NOVA_COLORS.accentPurple }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Allow friend requests</Text>
            <Switch
              value={allowFriendRequests}
              onValueChange={() => toggleSetting('allowFriendRequests')}
              trackColor={{ false: '#2a2e45', true: NOVA_COLORS.accentPurple }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Personalized offers</Text>
            <Switch
              value={personalizedOffers}
              onValueChange={() => toggleSetting('personalizedOffers')}
              trackColor={{ false: '#2a2e45', true: NOVA_COLORS.accentPurple }}
              thumbColor="#ffffff"
            />
          </View>

          <TouchableOpacity style={styles.row} activeOpacity={0.7}>
            <Text style={styles.rowLabel}>Blocked players</Text>
            <Text style={styles.rowValue}>3 players</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.row}
            onPress={() => Alert.alert('Download Data', 'A download link will be prepared and sent to your email.')}
            activeOpacity={0.7}
          >
            <Text style={styles.rowLabel}>Download my data</Text>
            <Ionicons name="chevron-forward" size={18} color={NOVA_COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.row, styles.lastRow]}
            onPress={() => Alert.alert('Privacy Policy', 'Ludo Nova respects your privacy and uses end-to-end encryption for game data.')}
            activeOpacity={0.7}
          >
            <Text style={styles.rowLabel}>Privacy policy</Text>
            <Ionicons name="chevron-forward" size={18} color={NOVA_COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Account Actions */}
        <NovaButton
          title="Sign out"
          variant="dark"
          onPress={handleSignOut}
          style={styles.btnSpacing}
        />

        <TouchableOpacity onPress={handleDeleteAccount} style={styles.deleteLink}>
          <Text style={styles.deleteText}>Delete account</Text>
        </TouchableOpacity>
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
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 24,
  },
  shieldWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(131, 230, 192, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  statusSub: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
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
    marginBottom: 24,
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
    color: NOVA_COLORS.textSecondary,
    fontSize: 13,
  },
  btnSpacing: {
    marginBottom: 12,
  },
  deleteLink: {
    alignSelf: 'center',
    paddingVertical: 10,
  },
  deleteText: {
    color: '#e04f5f',
    fontSize: 14,
    fontWeight: '700',
  },
});
