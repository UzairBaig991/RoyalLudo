import { create } from 'zustand';

export interface FriendItem {
  id: string;
  name: string;
  status: 'online' | 'in_game' | 'offline';
  subtitle: string;
  avatarColor: string;
  action: 'Play' | 'Watch' | 'Invite';
}

export interface InboxItem {
  id: string;
  title: string;
  subtitle: string;
  type: 'gift' | 'invite' | 'league' | 'reward' | 'info';
  actionLabel: string;
  claimed: boolean;
  rewardCoins?: number;
}

export interface ClubChatMessage {
  id: string;
  sender: string;
  time: string;
  message: string;
  isInvite?: boolean;
}

interface SocialState {
  friends: FriendItem[];
  inbox: InboxItem[];
  clubGoalProgress: number; // e.g. 384 of 500
  clubMessages: ClubChatMessage[];
  clanChestLevel: number;
  clanChestTrophies: number;
  clanChestMaxTrophies: number;
  clanChestClaimed: boolean;
  claimInboxItem: (id: string) => number;
  sendGiftToFriend: (friendName: string, amount: number, note: string) => boolean;
  addClubMessage: (message: string) => void;
  inviteFriend: (code: string) => void;
  claimClanChest: () => { coins: number; gems: number };
}

export const useSocialStore = create<SocialState>((set, get) => ({
  clanChestLevel: 7,
  clanChestTrophies: 3840,
  clanChestMaxTrophies: 5000,
  clanChestClaimed: false,
  friends: [
    {
      id: 'f1',
      name: 'Maya',
      status: 'online',
      subtitle: 'Online · Ready to play',
      avatarColor: '#ff7c7c',
      action: 'Play',
    },
    {
      id: 'f2',
      name: 'Sam',
      status: 'in_game',
      subtitle: 'In a classic game',
      avatarColor: '#71aaff',
      action: 'Watch',
    },
    {
      id: 'f3',
      name: 'Zara',
      status: 'online',
      subtitle: 'Online · Ready to play',
      avatarColor: '#83e6c0',
      action: 'Play',
    },
    {
      id: 'f4',
      name: 'Leo',
      status: 'online',
      subtitle: 'Online · In the lobby',
      avatarColor: '#ffd37b',
      action: 'Play',
    },
    {
      id: 'f5',
      name: 'Nina',
      status: 'offline',
      subtitle: 'Last played 2 hours ago',
      avatarColor: '#b9a2ff',
      action: 'Invite',
    },
  ],
  inbox: [
    {
      id: 'i1',
      title: 'A gift from Maya',
      subtitle: '500 coins · “For our next game!”',
      type: 'gift',
      actionLabel: 'Claim  →',
      claimed: false,
      rewardCoins: 500,
    },
    {
      id: 'i2',
      title: 'Your team is waiting',
      subtitle: 'Sam invited you to a team table.',
      type: 'invite',
      actionLabel: 'Join  →',
      claimed: false,
    },
    {
      id: 'i3',
      title: 'Welcome to Gold III',
      subtitle: 'A new league. A fresh challenge.',
      type: 'league',
      actionLabel: 'View  →',
      claimed: false,
    },
    {
      id: 'i4',
      title: 'Your daily reward is ready',
      subtitle: 'Keep your 5-day streak alive.',
      type: 'reward',
      actionLabel: 'Open  →',
      claimed: false,
      rewardCoins: 500,
    },
    {
      id: 'i5',
      title: 'A safer place to play',
      subtitle: 'Read our updated fair-play guide.',
      type: 'info',
      actionLabel: 'Read  →',
      claimed: false,
    },
  ],
  clubGoalProgress: 384,
  clubMessages: [
    {
      id: 'm1',
      sender: 'MAYA',
      time: '9:34',
      message: 'Anyone up for a quick team game? I’m ready for a rematch!',
    },
    {
      id: 'm2',
      sender: 'YOU',
      time: '9:35',
      message: 'Count me in. Sending an invite!',
    },
    {
      id: 'm3',
      sender: 'Alex',
      time: '9:36',
      message: 'Team table is open. Looking for a teammate.',
      isInvite: true,
    },
  ],
  claimInboxItem: (id: string) => {
    let coins = 0;
    set((state) => ({
      inbox: state.inbox.map((item) => {
        if (item.id === id && !item.claimed) {
          coins = item.rewardCoins || 0;
          return { ...item, claimed: true, actionLabel: 'Claimed ✓' };
        }
        return item;
      }),
    }));
    return coins;
  },
  sendGiftToFriend: (friendName: string, amount: number, note: string) => {
    return true;
  },
  addClubMessage: (message: string) => {
    const newMsg: ClubChatMessage = {
      id: 'm_' + Date.now(),
      sender: 'YOU',
      time: 'Just now',
      message,
    };
    set((state) => ({
      clubMessages: [...state.clubMessages, newMsg],
      clubGoalProgress: Math.min(500, state.clubGoalProgress + 1),
    }));
  },
  inviteFriend: (code: string) => {
    // invite logic
  },
  claimClanChest: () => {
    const { clanChestClaimed } = get();
    if (clanChestClaimed) return { coins: 0, gems: 0 };
    set({ clanChestClaimed: true });
    return { coins: 3500, gems: 35 };
  },
}));
