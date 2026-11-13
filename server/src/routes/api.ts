import { AuthService } from '../services/authService';
import { EconomyService } from '../services/economyService';
import { RoomService } from '../services/roomService';
import { SocialService } from '../services/socialService';
import { DataStore } from '../services/store';
import { DICE_CATALOG, BOARD_SKINS, LEAGUE_TIERS } from '../../../shared/src/constants/economy';

export interface ApiRequest {
  headers: Record<string, string | string[] | undefined>;
  query: Record<string, any>;
  params: Record<string, string>;
  body: any;
}

export interface ApiResponse {
  statusCode?: number;
  status(code: number): ApiResponse;
  json(data: any): void;
}

type RouteHandler = (req: ApiRequest, res: ApiResponse) => void | Promise<void>;

interface RouteEntry {
  method: string;
  path: string;
  handler: RouteHandler;
}

class SimpleRouter {
  public routes: RouteEntry[] = [];

  public get(path: string, handler: RouteHandler): void {
    this.routes.push({ method: 'GET', path, handler });
  }

  public post(path: string, handler: RouteHandler): void {
    this.routes.push({ method: 'POST', path, handler });
  }

  public put(path: string, handler: RouteHandler): void {
    this.routes.push({ method: 'PUT', path, handler });
  }

  public dispatch(pathname: string, method: string, req: ApiRequest, res: ApiResponse): boolean {
    const entry = this.routes.find((r) => r.method === method.toUpperCase() && r.path === pathname);
    if (entry) {
      entry.handler(req, res);
      return true;
    }
    return false;
  }
}

export const apiRouter = new SimpleRouter();

// Helper to extract authenticated userId
const extractUserId = (req: ApiRequest): string => {
  const authHeader = req.headers.authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const verified = AuthService.verifyToken(token);
    if (verified) return verified.userId;
  }
  return (req.query.userId as string) || 'guest_default';
};

// ================= AUTH =================
apiRouter.post('/auth/guest', (req, res) => {
  try {
    const session = AuthService.guestLogin(req.body?.username);
    res.json({ success: true, ...session });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.post('/auth/register', (req, res) => {
  try {
    const { email, password, username } = req.body;
    if (!email || !password || !username) {
      return res.status(400).json({ success: false, error: 'Email, password and username required.' });
    }
    const session = AuthService.register(email, password, username);
    res.json({ success: true, ...session });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.post('/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required.' });
    }
    const session = AuthService.login(email, password);
    res.json({ success: true, ...session });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ================= PROFILE =================
apiRouter.get('/profiles/me', (req, res) => {
  const userId = extractUserId(req);
  const profile = DataStore.profiles.get(userId);
  if (!profile) {
    const guest = AuthService.guestLogin();
    return res.json({ success: true, profile: guest.profile });
  }
  res.json({ success: true, profile });
});

apiRouter.put('/profiles/me', (req, res) => {
  const userId = extractUserId(req);
  const profile = DataStore.profiles.get(userId);
  if (!profile) return res.status(404).json({ success: false, error: 'Profile not found' });

  if (req.body.username) profile.username = req.body.username.trim().slice(0, 20);
  if (req.body.avatarUrl) profile.avatarUrl = req.body.avatarUrl;
  DataStore.profiles.set(userId, profile);

  res.json({ success: true, profile });
});

// ================= ECONOMY & SHOP =================
apiRouter.get('/wallet/balance', (req, res) => {
  const userId = extractUserId(req);
  const wallet = EconomyService.getWallet(userId);
  res.json({ success: true, wallet });
});

apiRouter.get('/shop/items', (_req, res) => {
  res.json({
    success: true,
    dice: DICE_CATALOG,
    boards: BOARD_SKINS,
  });
});

apiRouter.post('/shop/purchase', (req, res) => {
  try {
    const userId = extractUserId(req);
    const { itemId } = req.body;
    const result = EconomyService.purchaseItem(userId, itemId);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.get('/inventory', (req, res) => {
  const userId = extractUserId(req);
  const inventorySet = DataStore.userInventory.get(userId) || new Set();
  res.json({ success: true, items: Array.from(inventorySet) });
});

apiRouter.post('/inventory/equip', (req, res) => {
  try {
    const userId = extractUserId(req);
    const { type, itemId } = req.body;
    const updatedProfile = EconomyService.equipItem(userId, type, itemId);
    res.json({ success: true, profile: updatedProfile });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.post('/rewards/claim-daily', (req, res) => {
  try {
    const userId = extractUserId(req);
    const reward = EconomyService.claimDailyReward(userId);
    res.json({ success: true, ...reward });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ================= FRIENDS =================
apiRouter.get('/friends', (req, res) => {
  const userId = extractUserId(req);
  const friends = SocialService.getFriends(userId);
  res.json({ success: true, friends });
});

apiRouter.get('/friends/search', (req, res) => {
  const query = (req.query.q as string) || '';
  const results = SocialService.searchUsers(query);
  res.json({ success: true, results });
});

apiRouter.post('/friends/request', (req, res) => {
  try {
    const userId = extractUserId(req);
    const { toUserId } = req.body;
    const request = SocialService.sendFriendRequest(userId, toUserId);
    res.json({ success: true, request });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ================= ROOMS =================
apiRouter.post('/rooms/create', (req, res) => {
  try {
    const userId = extractUserId(req);
    const { mode, playerCount, entryFee } = req.body;
    const room = RoomService.createRoom(userId, mode, playerCount, entryFee);
    res.json({ success: true, room });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.post('/rooms/join', (req, res) => {
  try {
    const userId = extractUserId(req);
    const { roomCode } = req.body;
    const room = RoomService.joinRoom(userId, roomCode);
    res.json({ success: true, room });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ================= LEADERBOARD =================
apiRouter.get('/leaderboards', (_req, res) => {
  const allProfiles = Array.from(DataStore.profiles.values());
  const sorted = allProfiles.sort((a, b) => b.leaguePoints - a.leaguePoints).slice(0, 50);
  res.json({
    success: true,
    tiers: LEAGUE_TIERS,
    leaderboard: sorted,
  });
});
