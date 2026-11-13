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

export default function ChestsScreen() {
  const { gold, gems, addGold, addGems, debitGems } = useEconomyStore();
  const [woodenOpened, setWoodenOpened] = useState(false);
  const [dailyStreakDay, setDailyStreakDay] = useState(3);
  const [dailyClaimed, setDailyClaimed] = useState(false);

  const handleOpenWooden = () => {
    if (woodenOpened) {
      Alert.alert('Chest Recharging ⏳', 'Next Free Wooden Chest available in 3h 42m!');
      return;
    }
    const rewardGold = 1200;
    const rewardGems = 5;
    addGold(rewardGold);
    addGems(rewardGems);
    setWoodenOpened(true);
    Alert.alert('🎉 WOODEN CHEST OPENED!', `You found:\n🪙 ${rewardGold.toLocaleString()} Gold Coins\n💎 ${rewardGems} Gems!`);
  };

  const handleOpenSilver = () => {
    if (gems < 10) {
      Alert.alert('Need 10 Gems 💎', 'You need 10 gems to unlock this Silver Chest immediately!');
      return;
    }
    debitGems(10);
    const rewardGold = 3500;
    const rewardGems = 15;
    addGold(rewardGold);
    addGems(rewardGems);
    Alert.alert('🎉 SILVER CHEST UNLOCKED!', `You found:\n🪙 ${rewardGold.toLocaleString()} Gold Coins\n💎 ${rewardGems} Gems!`);
  };

  const handleOpenGold = () => {
    if (gems < 25) {
      Alert.alert('Need 25 Gems 💎', 'You need 25 gems to unlock this Gold Chest immediately!');
      return;
    }
    debitGems(25);
    const rewardGold = 10000;
    const rewardGems = 40;
    addGold(rewardGold);
    addGems(rewardGems);
    Alert.alert('👑 ROYAL GOLD CHEST UNLOCKED!', `Magnificent haul!\n🪙 ${rewardGold.toLocaleString()} Gold Coins\n💎 ${rewardGems} Gems!`);
  };

  const handleClaimDailyStreak = () => {
    if (dailyClaimed) {
      Alert.alert('Already Claimed', 'Come back tomorrow for Day 4 reward!');
      return;
    }
    const rewardGold = 2000;
    addGold(rewardGold);
    setDailyClaimed(true);
    Alert.alert('Day 3 Streak Claimed! 🔥', `You received 🪙 ${rewardGold.toLocaleString()} Gold Coins!`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>TREASURE CHESTS</Text>
          <Text style={styles.headerSub}>Unlock Free Coins, Gems & Dice</Text>
        </View>
        <View style={styles.walletRow}>
          <Text style={styles.walletBadge}>🪙 {gold.toLocaleString()}</Text>
          <Text style={styles.walletBadge}>💎 {gems}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 7-Day Login Streak Row */}
        <View style={styles.streakCard}>
          <View style={styles.streakHeader}>
            <Text style={styles.streakTitle}>🔥 7-DAY LOGIN STREAK</Text>
            <Text style={styles.streakSub}>Day {dailyStreakDay} of 7</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.streakDaysRow}>
            {[1, 2, 3, 4, 5, 6, 7].map((day) => {
              const isToday = day === dailyStreakDay;
              const isDone = day < dailyStreakDay;
              return (
                <View
                  key={day}
                  style={[
                    styles.dayPill,
                    isToday && styles.dayPillToday,
                    isDone && styles.dayPillDone,
                  ]}
                >
                  <Text style={styles.dayLabel}>Day {day}</Text>
                  <Text style={{ fontSize: 20, marginVertical: 4 }}>
                    {day === 7 ? '👑' : day % 2 === 0 ? '💎' : '🪙'}
                  </Text>
                  <Text style={styles.dayRewardText}>
                    {day === 7 ? '50💎' : `${day * 500}🪙`}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
          <TouchableOpacity
            style={[styles.claimStreakBtn, dailyClaimed && { backgroundColor: '#521350' }]}
            onPress={handleClaimDailyStreak}
            disabled={dailyClaimed}
          >
            <Text style={styles.claimStreakText}>
              {dailyClaimed ? '✓ CLAIMED TODAY' : 'CLAIM TODAY\'S REWARD'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Chest 1: Free Wooden Chest */}
        <View style={styles.chestCard}>
          <View style={styles.chestIconBox}>
            <Text style={{ fontSize: 48 }}>🪵</Text>
          </View>
          <View style={styles.chestInfo}>
            <Text style={styles.chestName}>Free Wooden Chest</Text>
            <Text style={styles.chestReward}>500 - 1,500 Coins + 5 Gems</Text>
            <Text style={styles.chestTimer}>
              {woodenOpened ? '⏳ Available in 3h 42m' : '🟢 Ready to Open!'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.chestActionBtn, woodenOpened && styles.chestBtnDisabled]}
            onPress={handleOpenWooden}
          >
            <Text style={styles.chestActionText}>{woodenOpened ? 'LOCKED' : 'OPEN'}</Text>
          </TouchableOpacity>
        </View>

        {/* Chest 2: Silver Chest */}
        <View style={styles.chestCard}>
          <View style={styles.chestIconBox}>
            <Text style={{ fontSize: 48 }}>🥈</Text>
          </View>
          <View style={styles.chestInfo}>
            <Text style={styles.chestName}>Silver Chest</Text>
            <Text style={styles.chestReward}>2,500 - 5,000 Coins + 15 Gems</Text>
            <Text style={styles.chestTimer}>⏳ Unlocks in 8 Hours</Text>
          </View>
          <TouchableOpacity style={[styles.chestActionBtn, { backgroundColor: '#3986D9' }]} onPress={handleOpenSilver}>
            <Text style={styles.chestActionText}>💎 10</Text>
          </TouchableOpacity>
        </View>

        {/* Chest 3: Royal Gold Chest */}
        <View style={styles.chestCard}>
          <View style={styles.chestIconBox}>
            <Text style={{ fontSize: 48 }}>👑</Text>
          </View>
          <View style={styles.chestInfo}>
            <Text style={styles.chestName}>Royal Gold Chest</Text>
            <Text style={styles.chestReward}>8,000 - 15,000 Coins + 40 Gems</Text>
            <Text style={styles.chestTimer}>⏳ Unlocks in 12 Hours</Text>
          </View>
          <TouchableOpacity style={[styles.chestActionBtn, { backgroundColor: '#FFDF00' }]} onPress={handleOpenGold}>
            <Text style={[styles.chestActionText, { color: '#000' }]}>💎 25</Text>
          </TouchableOpacity>
        </View>

        {/* Chest 4: Crown Chest */}
        <View style={styles.chestCard}>
          <View style={styles.chestIconBox}>
            <Text style={{ fontSize: 48 }}>🏆</Text>
          </View>
          <View style={styles.chestInfo}>
            <Text style={styles.chestName}>Victory Crown Chest</Text>
            <Text style={styles.chestReward}>Earn 10 Stars in Matches to Open!</Text>
            <Text style={styles.chestTimer}>⭐ Progress: 6 / 10 Stars</Text>
          </View>
          <TouchableOpacity
            style={[styles.chestActionBtn, styles.chestBtnDisabled]}
            onPress={() => Alert.alert('Crown Chest Progress', 'Win 4 more matches to unlock this chest!')}
          >
            <Text style={styles.chestActionText}>6 / 10</Text>
          </TouchableOpacity>
        </View>

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
  streakCard: {
    backgroundColor: '#521350',
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#F5A623',
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  streakTitle: {
    color: '#FFDF00',
    fontSize: 14,
    fontWeight: '900',
  },
  streakSub: {
    color: '#E6C985',
    fontSize: 12,
    fontWeight: '700',
  },
  streakDaysRow: {
    marginBottom: 12,
  },
  dayPill: {
    width: 62,
    backgroundColor: '#2F062E',
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#752273',
  },
  dayPillToday: {
    backgroundColor: '#752273',
    borderColor: '#FFDF00',
    borderWidth: 2,
  },
  dayPillDone: {
    opacity: 0.6,
  },
  dayLabel: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  dayRewardText: {
    color: '#FFDF00',
    fontSize: 10,
    fontWeight: '900',
  },
  claimStreakBtn: {
    backgroundColor: '#FFDF00',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  claimStreakText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '900',
  },
  chestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#521350',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#752273',
  },
  chestIconBox: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: '#2F062E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#752273',
  },
  chestInfo: {
    flex: 1,
    marginLeft: 12,
  },
  chestName: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '900',
  },
  chestReward: {
    color: '#FFDF00',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  chestTimer: {
    color: '#D4B8D3',
    fontSize: 10,
    marginTop: 2,
  },
  chestActionBtn: {
    backgroundColor: '#27AE70',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  chestBtnDisabled: {
    backgroundColor: '#370A36',
    borderWidth: 1,
    borderColor: '#752273',
  },
  chestActionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
  },
});
