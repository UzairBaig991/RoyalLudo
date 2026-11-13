# Royal Ludo - Database Schema & Data Models

## MongoDB Collections Overview

1. **Users** (`users`):
   - `_id`: ObjectId
   - `email`: String (indexed, unique, sparse)
   - `passwordHash`: String (bcrypt, select: false)
   - `authProvider`: 'email' | 'google' | 'guest'
   - `providerId`: String (sparse)
   - `isBanned`: Boolean
   - `createdAt`: Date, `updatedAt`: Date

2. **Profiles** (`profiles`):
   - `userId`: ObjectId (ref: User, indexed, unique)
   - `username`: String (indexed, unique)
   - `avatarUrl`: String
   - `avatarFrame`: String (default 'frame_royal_gold')
   - `level`: Number (default 1)
   - `xp`: Number (default 0)
   - `stats`:
     - `matchesPlayed`: Number
     - `matchesWon`: Number
     - `winStreak`: Number
     - `highestWinStreak`: Number
     - `tokensCaptured`: Number
     - `tokensFinished`: Number
   - `equipped`:
     - `diceSkin`: String (default 'dice_classic_gold')
     - `boardSkin`: String (default 'board_royal_navy')
     - `tokenSkin`: String (default 'token_crystal')
   - `leagueTier`: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Royal'

3. **Wallets** (`wallets`):
   - `userId`: ObjectId (ref: User, indexed, unique)
   - `goldCoins`: Number (min: 0, default 5000)
   - `gems`: Number (min: 0, default 50)
   - `version`: Number (optimistic locking counter)

4. **Transactions** (`transactions`):
   - `userId`: ObjectId
   - `type`: 'match_entry' | 'match_reward' | 'shop_purchase' | 'daily_reward' | 'gift'
   - `currency`: 'gold' | 'gems'
   - `amount`: Number (signed)
   - `balanceAfter`: Number
   - `referenceId`: String
   - `createdAt`: Date

5. **Inventory** (`inventories`):
   - `userId`: ObjectId
   - `itemType`: 'dice' | 'board' | 'token' | 'frame' | 'emoji'
   - `itemId`: String
   - `acquiredAt`: Date

6. **MatchHistory** (`match_histories`):
   - `roomId`: String
   - `mode`: 'classic' | 'master' | 'quick' | 'arrow'
   - `playerCount`: Number
   - `durationSeconds`: Number
   - `participants`: Array of `{ userId, username, seatIndex, rank, goldDelta, xpGained, tokensCaptured }`
   - `createdAt`: Date

7. **Clubs** (`clubs`):
   - `name`: String (unique)
   - `description`: String
   - `badgeIcon`: String
   - `ownerId`: ObjectId
   - `memberCount`: Number
   - `totalTrophies`: Number
   - `isOpen`: Boolean

8. **Tournaments** (`tournaments`):
   - `title`: String
   - `tier`: String
   - `entryFee`: Number
   - `prizePool`: Number
   - `maxParticipants`: Number (e.g. 16 or 32)
   - `status`: 'registration' | 'in_progress' | 'completed'
   - `brackets`: Array of Match Nodes
