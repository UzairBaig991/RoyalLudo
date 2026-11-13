# Royal Ludo - REST & Socket.IO API Documentation

## 1. Authentication Endpoints (`/api/auth`)
- `POST /api/auth/register` - Email/password sign-up
- `POST /api/auth/login` - Email/password login (returns JWT + user profile)
- `POST /api/auth/guest` - Instant anonymous guest session
- `POST /api/auth/google` - OAuth ID-token verification
- `POST /api/auth/link-account` - Upgrades guest account to full email or Google credentials

## 2. User & Profile Endpoints (`/api/users`, `/api/profiles`)
- `GET /api/profiles/me` - Current user profile, level, stats, equipped cosmetics
- `PUT /api/profiles/me` - Update username, avatar, bio, country flag
- `GET /api/profiles/:userId` - Inspect public player profile card
- `GET /api/profiles/:userId/history` - Recent 20 match history records

## 3. Economy & Customization (`/api/wallet`, `/api/shop`, `/api/inventory`)
- `GET /api/wallet/balance` - Gold and Gem balances
- `GET /api/shop/items` - Store catalog (Dice skins, boards, frames, token styles)
- `POST /api/shop/purchase` - Purchase item with coins/gems
- `GET /api/inventory` - Owned cosmetics
- `POST /api/inventory/equip` - Equip cosmetic item (dice, board, frame, avatar)
- `POST /api/rewards/daily-card` - Claim randomized daily card reward
- `POST /api/rewards/lucky-dice` - Send/claim lucky dice gift

## 4. Friends & Social (`/api/friends`, `/api/clubs`)
- `GET /api/friends` - Friend list with online presence
- `POST /api/friends/request` - Send friend invite by code/ID
- `POST /api/friends/respond` - Accept / reject friend invite
- `GET /api/clubs` - Club discovery with filters
- `POST /api/clubs/create` - Create new club with badge & description
- `POST /api/clubs/:id/join` - Request/join club membership

## 5. Socket.IO Real-Time Events
### Client to Server:
- `room:create` `{ mode: 'classic' | 'master' | 'quick' | 'arrow', playerCount: 2 | 4, entryFee: number }`
- `room:join` `{ roomCode: string }`
- `room:ready` `{ ready: boolean }`
- `matchmaking:queue` `{ mode: string, playerCount: number }`
- `matchmaking:cancel` `{}`
- `game:roll_dice` `{}`
- `game:move_token` `{ tokenId: number }`
- `game:emoji` `{ emojiId: string }`
- `game:chat` `{ message: string }`
- `game:send_gift` `{ targetSeat: number, giftId: string }`
- `game:rematch_request` `{}`

### Server to Client:
- `room:state` - Updated lobby state with participants
- `matchmaking:matched` `{ roomId: string, roomCode: string }`
- `game:start` `{ initialState: GameState }`
- `game:dice_rolled` `{ seatIndex: number, value: number, validMoves: number[], extraTurn: boolean }`
- `game:token_moved` `{ seatIndex: number, tokenId: number, from: Position, to: Position, capturedToken?: any }`
- `game:turn_change` `{ currentSeat: number, turnTimeRemaining: number }`
- `game:finished` `{ rankings: PlayerRank[], rewards: EconomyReward[] }`
- `game:emoji_broadcast` `{ seatIndex: number, emojiId: string }`
- `game:chat_broadcast` `{ seatIndex: number, message: string }`
