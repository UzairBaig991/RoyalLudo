import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { NOVA_COLORS } from '../../src/theme/colors';
import { NovaHeader } from '../../src/components/nova/NovaHeader';
import { NovaCard } from '../../src/components/nova/NovaCard';
import { useSocialStore } from '../../src/store/useSocialStore';

export default function ClubChatScreen() {
  const router = useRouter();
  const { clubMessages, clubGoalProgress, addClubMessage } = useSocialStore();
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;
    addClubMessage(inputText.trim());
    setInputText('');
  };

  const handleJoinTable = () => {
    router.push({
      pathname: '/gameplay/[matchId]',
      params: { matchId: 'club_team_match', mode: 'team' },
    } as any);
  };

  return (
    <View style={styles.container}>
      <NovaHeader
        title="Night Rollers chat"
        subtitle="12 online  ·  Keep it friendly."
        showBack={true}
        onBack={() => router.back()}
      />

      <View style={styles.content}>
        {/* Weekly Goal Progress Card */}
        <NovaCard variant="purple" style={styles.goalCard}>
          <View style={styles.goalTop}>
            <View style={styles.starWrap}>
              <Ionicons name="star" size={20} color={NOVA_COLORS.accentGold} />
            </View>
            <View style={styles.goalMeta}>
              <Text style={styles.goalTitle}>Club goal: 500 games this week</Text>
              <Text style={styles.goalCount}>{clubGoalProgress} / 500  ·  Keep rolling!</Text>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${(clubGoalProgress / 500) * 100}%` },
              ]}
            />
          </View>
        </NovaCard>

        {/* Chat Stream */}
        <ScrollView style={styles.messagesList} showsVerticalScrollIndicator={false}>
          {clubMessages.map((msg) => {
            if (msg.isInvite) {
              return (
                <View key={msg.id} style={styles.inviteCard}>
                  <View style={styles.inviteHeader}>
                    <Ionicons name="people" size={20} color={NOVA_COLORS.accentPurple} />
                    <Text style={styles.inviteTitle}>Team table is open</Text>
                  </View>
                  <Text style={styles.inviteDesc}>{msg.message}</Text>
                  <TouchableOpacity
                    style={styles.joinTableBtn}
                    onPress={handleJoinTable}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.joinTableText}>Join table</Text>
                    <Ionicons name="arrow-forward" size={16} color="#0d101e" />
                  </TouchableOpacity>
                </View>
              );
            }

            const isMe = msg.sender === 'YOU';
            return (
              <View
                key={msg.id}
                style={[styles.msgRow, isMe ? styles.myMsgRow : styles.theirMsgRow]}
              >
                <Text style={styles.msgSenderTime}>
                  {msg.sender}  ·  {msg.time}
                </Text>
                <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
                  <Text style={[styles.bubbleText, isMe && styles.myBubbleText]}>
                    {msg.message}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* Input Footer */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          placeholder="Message your club…"
          placeholderTextColor={NOVA_COLORS.textMuted}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Ionicons name="send" size={18} color="#0d101e" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NOVA_COLORS.bg,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  goalCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
  },
  goalTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  starWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 211, 123, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  goalMeta: {
    flex: 1,
  },
  goalTitle: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  goalCount: {
    color: NOVA_COLORS.accentPurple,
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: NOVA_COLORS.accentPurple,
  },
  messagesList: {
    flex: 1,
  },
  msgRow: {
    marginBottom: 14,
    maxWidth: '85%',
  },
  myMsgRow: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  theirMsgRow: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  msgSenderTime: {
    color: NOVA_COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  myBubble: {
    backgroundColor: NOVA_COLORS.accentPurple,
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
  myBubbleText: {
    color: NOVA_COLORS.textDark,
    fontWeight: '500',
  },
  inviteCard: {
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: NOVA_COLORS.accentPurple,
  },
  inviteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  inviteTitle: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  inviteDesc: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 12,
  },
  joinTableBtn: {
    backgroundColor: NOVA_COLORS.accentPurple,
    borderRadius: 12,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinTableText: {
    color: '#0d101e',
    fontSize: 13,
    fontWeight: '700',
    marginRight: 6,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: NOVA_COLORS.surfaceNav,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  textInput: {
    flex: 1,
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 46,
    color: NOVA_COLORS.textPrimary,
    fontSize: 14,
    marginRight: 10,
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: NOVA_COLORS.accentPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
