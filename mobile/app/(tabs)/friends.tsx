import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEconomyStore } from '../../src/store/useEconomyStore';

interface Friend {
  id: string;
  name: string;
  avatar: string;
  level: number;
  isOnline: boolean;
  giftSent: boolean;
}

const INITIAL_FRIENDS: Friend[] = [
  { id: 'f1', name: 'Shivali Mahajan', avatar: '👩', level: 12, isOnline: true, giftSent: false },
  { id: 'f2', name: 'Sachin Kumar Sh', avatar: '🧔', level: 14, isOnline: true, giftSent: false },
  { id: 'f3', name: 'Thiago Rodrigues', avatar: '👱‍♂️', level: 9, isOnline: false, giftSent: false },
  { id: 'f4', name: 'Ammar Alhatmi', avatar: '👨', level: 18, isOnline: true, giftSent: false },
  { id: 'f5', name: 'Phyrnai Syiem', avatar: '👨‍🦱', level: 21, isOnline: false, giftSent: false },
  { id: 'f6', name: 'Elena Rostova', avatar: '👱‍♀️', level: 11, isOnline: true, giftSent: false },
];

export default function FriendsScreen() {
  const { gold, gems, addGold } = useEconomyStore();
  const [friends, setFriends] = useState<Friend[]>(INITIAL_FRIENDS);

  const handleSendGift = (id: string, name: string) => {
    setFriends((prev) =>
      prev.map((f) => (f.id === id ? { ...f, giftSent: true } : f))
    );
    Alert.alert('Gift Dispatched! 🎁', `You sent 100 free coins to ${name}!`);
  };

  const handleSendAll = () => {
    setFriends((prev) => prev.map((f) => ({ ...f, giftSent: true })));
    Alert.alert('All Gifts Sent! 🌟', 'Sent free daily coins to all your friends!');
  };

  const handleCollectGifts = () => {
    addGold(600);
    Alert.alert('Gifts Collected! 🪙', 'You collected 600 Gold Coins sent from 6 friends!');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>BUDDIES & FRIENDS</Text>
          <Text style={styles.headerSub}>Send & Receive Daily Coins</Text>
        </View>
        <View style={styles.walletRow}>
          <Text style={styles.walletBadge}>🪙 {gold.toLocaleString()}</Text>
          <Text style={styles.walletBadge}>💎 {gems}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Send / Collect Actions */}
        <View style={styles.actionBanner}>
          <TouchableOpacity style={styles.bannerBtnGreen} onPress={handleCollectGifts}>
            <Text style={{ fontSize: 20 }}>🎁</Text>
            <Text style={styles.bannerBtnText}>COLLECT ALL (600 🪙)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bannerBtnGold} onPress={handleSendAll}>
            <Text style={{ fontSize: 20 }}>📤</Text>
            <Text style={styles.bannerBtnTextDark}>SEND TO ALL</Text>
          </TouchableOpacity>
        </View>

        {/* Invite Friend Promo */}
        <View style={styles.inviteCard}>
          <Text style={{ fontSize: 32 }}>💌</Text>
          <View style={{ flex: 1, marginHorizontal: 12 }}>
            <Text style={styles.inviteTitle}>Invite Friends to Royal Ludo</Text>
            <Text style={styles.inviteSub}>Get 5,000 Gold Coins + 10 Gems for every buddy who joins!</Text>
          </View>
          <TouchableOpacity
            style={styles.inviteBtn}
            onPress={() => Alert.alert('Share Link Copied! 📋', 'Send your invitation link: https://royalludo.app/invite?ref=govind')}
          >
            <Text style={styles.inviteBtnText}>INVITE</Text>
          </TouchableOpacity>
        </View>

        {/* Friends List */}
        <Text style={styles.sectionHeader}>YOUR BUDDIES ({friends.length})</Text>

        {friends.map((friend) => (
          <View key={friend.id} style={styles.friendRow}>
            {/* Avatar with Online Dot */}
            <View style={styles.avatarContainer}>
              <Text style={{ fontSize: 28 }}>{friend.avatar}</Text>
              <View style={[styles.statusDot, { backgroundColor: friend.isOnline ? '#27AE70' : '#888' }]} />
            </View>

            {/* Friend Info */}
            <View style={styles.friendInfo}>
              <Text style={styles.friendName}>{friend.name}</Text>
              <Text style={styles.friendLevel}>Level {friend.level} • {friend.isOnline ? '🟢 Online' : 'Offline'}</Text>
            </View>

            {/* Actions: Send Gift & Play */}
            <View style={styles.friendActions}>
              <TouchableOpacity
                style={[styles.giftBtn, friend.giftSent && styles.giftBtnSent]}
                onPress={() => handleSendGift(friend.id, friend.name)}
                disabled={friend.giftSent}
              >
                <Text style={styles.giftBtnText}>{friend.giftSent ? '✓ SENT' : '🪙 SEND'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={{ height: 90 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#370A36',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#521350',
    backgroundColor: '#2F062E',
  },
  headerTitle: {
    color: '#FFDF00',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  headerSub: {
    color: '#E6C985',
    fontSize: 11,
    fontWeight: '700',
  },
  walletRow: {
    flexDirection: 'row',
  },
  walletBadge: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
    backgroundColor: '#1E051E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 6,
    borderWidth: 1,
    borderColor: '#752273',
  },
  scrollContent: {
    padding: 14,
  },
  actionBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  bannerBtnGreen: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27AE70',
    borderRadius: 14,
    paddingVertical: 10,
    marginRight: 6,
  },
  bannerBtnGold: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFDF00',
    borderRadius: 14,
    paddingVertical: 10,
    marginLeft: 6,
  },
  bannerBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 6,
  },
  bannerBtnTextDark: {
    color: '#000',
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 6,
  },
  inviteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#521350',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#F5A623',
  },
  inviteTitle: {
    color: '#FFDF00',
    fontSize: 13,
    fontWeight: '900',
  },
  inviteSub: {
    color: '#D4B8D3',
    fontSize: 10,
    marginTop: 2,
  },
  inviteBtn: {
    backgroundColor: '#F5A623',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  inviteBtnText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '900',
  },
  sectionHeader: {
    color: '#E6C985',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 8,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#521350',
    borderRadius: 14,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#752273',
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2F062E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#521350',
  },
  friendInfo: {
    flex: 1,
    marginLeft: 10,
  },
  friendName: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  friendLevel: {
    color: '#E6C985',
    fontSize: 10,
    marginTop: 2,
  },
  friendActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  giftBtn: {
    backgroundColor: '#FFDF00',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  giftBtnSent: {
    backgroundColor: '#370A36',
    borderWidth: 1,
    borderColor: '#752273',
  },
  giftBtnText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '900',
  },
});
