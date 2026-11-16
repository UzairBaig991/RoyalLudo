import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { NOVA_COLORS } from '../../src/theme/colors';
import { NovaHeader } from '../../src/components/nova/NovaHeader';
import { NovaCard } from '../../src/components/nova/NovaCard';
import { NovaButton } from '../../src/components/nova/NovaButton';

export default function InviteFriendsScreen() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const inviteCode = 'A L E X 8 8';

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFacebook = () => {
    Alert.alert('Facebook Friends', 'Searching for Facebook friends on Ludo Nova…');
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <NovaHeader
        title="Make room for friends"
        subtitle="More familiar faces. More memorable games."
        showBack={true}
        onBack={() => router.back()}
      />

      <View style={styles.content}>
        {/* Banner Card */}
        <NovaCard variant="purple" style={styles.bannerCard}>
          <View style={styles.bannerIconWrap}>
            <Ionicons name="people" size={32} color={NOVA_COLORS.accentPurple} />
          </View>
          <Text style={styles.bannerTitle}>
            The best games start with “join me”.
          </Text>
          <Text style={styles.bannerDesc}>
            Invite a friend and you’ll both get 500 coins to celebrate your next match.
          </Text>
        </NovaCard>

        {/* Invite Code Box */}
        <TouchableOpacity
          style={styles.codeBox}
          onPress={handleCopy}
          activeOpacity={0.8}
        >
          <Text style={styles.codeLabel}>YOUR INVITE CODE</Text>
          <Text style={styles.codeText}>{inviteCode}</Text>
          <Text style={styles.copyHint}>
            {copied ? '✓ Code copied!' : 'Tap code to copy'}
          </Text>
        </TouchableOpacity>

        {/* Action Buttons */}
        <NovaButton
          title="Share invite"
          variant="primary"
          onPress={handleCopy}
          icon={<Ionicons name="share-social-outline" size={18} color="#0d101e" />}
          style={styles.btnSpacing}
        />

        <NovaButton
          title="Find friends on Facebook"
          variant="facebook"
          onPress={handleFacebook}
          icon={<Ionicons name="logo-facebook" size={18} color="#ffffff" />}
          style={styles.btnSpacing}
        />

        <Text style={styles.statsSummary}>
          3 friends invited  ·  1,500 coins earned
        </Text>
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
    alignItems: 'center',
  },
  bannerCard: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  bannerIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(185, 162, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  bannerTitle: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  bannerDesc: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  codeBox: {
    width: '100%',
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(185, 162, 255, 0.25)',
  },
  codeLabel: {
    color: NOVA_COLORS.accentPurple,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  codeText: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 6,
  },
  copyHint: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 12,
    marginTop: 6,
  },
  btnSpacing: {
    marginBottom: 12,
  },
  statsSummary: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 14,
  },
});
