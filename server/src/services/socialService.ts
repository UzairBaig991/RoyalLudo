import { DataStore, type DBFriendRequest } from './store';
import type { FriendRequest, FriendUser, UserProfile } from '../../../shared/src/types';

export class SocialService {
  public static getFriends(userId: string): FriendUser[] {
    const friendIds = DataStore.friends.get(userId) || new Set();
    const result: FriendUser[] = [];

    for (const fid of friendIds) {
      const profile = DataStore.profiles.get(fid);
      if (profile) {
        const isOnline = DataStore.onlineSockets.has(fid);
        result.push({
          id: fid,
          userId: fid,
          username: profile.username,
          avatarUrl: profile.avatarUrl,
          avatarFrame: profile.avatarFrame,
          level: profile.level,
          isOnline,
        });
      }
    }

    return result;
  }

  public static sendFriendRequest(fromUserId: string, toUserId: string): DBFriendRequest {
    if (fromUserId === toUserId) throw new Error('You cannot add yourself as a friend.');
    const toProfile = DataStore.profiles.get(toUserId);
    if (!toProfile) throw new Error('Target user does not exist.');

    const reqId = `req_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const request: DBFriendRequest = {
      id: reqId,
      fromUserId,
      toUserId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    DataStore.friendRequests.set(reqId, request);
    return request;
  }

  public static acceptFriendRequest(requestId: string, recipientUserId: string): { success: boolean } {
    const req = DataStore.friendRequests.get(requestId);
    if (!req) throw new Error('Friend request not found.');
    if (req.toUserId !== recipientUserId) throw new Error('Unauthorized.');

    req.status = 'accepted';

    let setA = DataStore.friends.get(req.fromUserId);
    if (!setA) {
      setA = new Set();
      DataStore.friends.set(req.fromUserId, setA);
    }
    setA.add(req.toUserId);

    let setB = DataStore.friends.get(req.toUserId);
    if (!setB) {
      setB = new Set();
      DataStore.friends.set(req.toUserId, setB);
    }
    setB.add(req.fromUserId);

    return { success: true };
  }

  public static searchUsers(query: string): UserProfile[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const matches: UserProfile[] = [];
    for (const profile of DataStore.profiles.values()) {
      if (profile.username.toLowerCase().includes(q) || profile.userId.toLowerCase().includes(q)) {
        matches.push({ ...profile });
        if (matches.length >= 20) break;
      }
    }
    return matches;
  }
}
