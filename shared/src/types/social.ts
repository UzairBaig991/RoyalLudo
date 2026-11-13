export interface FriendUser {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string;
  avatarFrame: string;
  level: number;
  isOnline: boolean;
  currentRoomId?: string;
  lastSeen?: string;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUsername: string;
  fromAvatarUrl: string;
  createdAt: string;
}

export interface ClubSummary {
  id: string;
  name: string;
  tag: string;
  description: string;
  badge: string;
  memberCount: number;
  maxMembers: number;
  trophies: number;
  requiredLevel: number;
  isOpen: boolean;
}

export interface ClubMember {
  userId: string;
  username: string;
  avatarUrl: string;
  role: 'owner' | 'admin' | 'member';
  trophiesContributed: number;
  joinedAt: string;
}

export interface ClubMessage {
  id: string;
  clubId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRole: string;
  message: string;
  createdAt: string;
}

export interface GiftItem {
  id: string;
  name: string;
  icon: string;
  costGold: number;
  costGems: number;
}
