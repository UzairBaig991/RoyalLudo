# 👑 ROYAL LUDO - ULTIMATE MULTIPLAYER BOARD GAME

> **Royal Ludo** is an enterprise-grade, commercial-quality multiplayer mobile board game inspired by *Ludo Star*. Built with a royal aesthetic, authoritative real-time gameplay, autonomous AI, rich economy loops, social clubs, and competitive tournaments.

---

## 🌟 Key Features

1. **Complete Traditional Ludo Gameplay**: Authoritative 15x15 board matrix, 52 common perimeter tiles, 8 safe star cells, 4 colored home stretches, and exact center finish requirements.
2. **5 Game Variations**:
   - **Classic**: Traditional 4-player token race with standard safe cells.
   - **Master**: Strategic token blockades, stacking, and 1 or 6 entry rules.
   - **Quick**: High-tempo 2-token victory mode with 10s turn timers.
   - **Arrow**: Board shortcuts for rapid quadrant transitions.
   - **Custom**: Host-configurable safe cells, timers, and entry conditions.
3. **Multiplayer Capabilities**:
   - 1v1 Duels & 4-Player Free-for-all
   - 2v2 Team Up mode (allied cooperation)
   - Private Tables with 6-digit room codes (e.g. `RL9482`)
   - Ranked Random Matchmaking based on MMR
   - Offline Pass & Play on a single device
   - Offline AI Practice (Easy, Medium, and Hard heuristic threat evaluation)
4. **Economy & Customization**:
   - Currencies: Gold Coins 🪙, Royal Gems 💎, and Level XP ⭐
   - 20+ collectible 3D-styled dice skins (e.g. Royal Sovereign, Ruby Emperor, Sapphire Frost)
   - Board themes (Royal Midnight, Marble Palace, Cyber Arena)
   - Avatar frames & animated victory effects
5. **Social & Community**:
   - Real-time in-game live chat & animated emoji reactions
   - Friend system (Search, Requests, Presence, Game Invitations)
   - Lucky Dice gift exchange
   - Clubs & Communities with roles, club chat, and leaderboards
6. **Engagement & Tournaments**:
   - Daily Fortune Cards & Lucky Dice rewards
   - Daily & Weekly missions with progression trackers
   - 30-Day Season Pass (Free & Royal reward tracks)
   - 6 League divisions (Bronze to Royal) with weekly leaderboards

---

## 🏗️ Architecture & Technology Stack

```
d:\LudoGame/
├── shared/                 # Shared contracts, deterministic game engine & rules
│   ├── src/engine/         # LudoBoard, PathCalculator, MoveValidator, DiceRoller, BotAI, LudoGame
│   ├── src/rules/          # ClassicRules, MasterRules, QuickRules, ArrowRules, RuleSetFactory
│   ├── src/constants/      # Coordinates, colors, economy catalog, leagues
│   └── tests/              # 45 engine unit tests
├── server/                 # Authoritative Node.js / Express / Socket.IO server
│   ├── src/services/       # AuthService, EconomyService, RoomService, MatchmakingService, SocialService
│   ├── src/socket/         # Real-time game state, chat, emojis, reconnection grace
│   ├── src/routes/         # REST API endpoints (/api/auth, /api/wallet, /api/rooms, etc.)
│   └── tests/              # 22 backend integration tests
├── mobile/                 # React Native / Expo Mobile Application
│   ├── app/                # Expo Router screens (Splash, Auth, Tabs, Gameplay, Rooms, Shop, Settings)
│   ├── src/components/     # 15x15 SVG board renderer, 3D dice view, royal UI components
│   ├── src/store/          # Zustand stores (useGameStore, useAuthStore, useEconomyStore)
│   └── tests/              # 17 mobile client tests
├── docs/                   # Full technical specifications & architecture documentation
└── scripts/                # Master test runner & loaders
```

---

## 🚀 Getting Started

### 1. Run Automated Test Suite
To execute all 84 unit and integration tests across the engine, backend, and client:
```bash
npm test
```

### 2. Start Backend Server
```bash
npm run start:server
```
The server will be available at `http://localhost:4000` with the health check at `http://localhost:4000/health`.

### 3. Launch Mobile Client (Expo)
```bash
cd mobile
npx expo start
```
Or from root:
```bash
npm run start:mobile
```
Scan the QR code with Expo Go on Android or iOS, or press `a` for Android Emulator / `w` for Web.

---

## 🛡️ Anti-Cheat & Security Principles

- **Authoritative Dice**: In online multiplayer, dice values are generated on the server using cryptographically fair RNG. Client-supplied dice numbers are rejected.
- **Authoritative Movement**: Every token position transition is validated against legal step bounds, safe cell indices, and blockade rules.
- **Authoritative Economy**: Currency additions, deductions, purchases, and daily reward claims are tracked through an append-only transaction ledger on the server.
- **Reconnection Grace**: Disconnected players are granted a 30-second grace window to resync identical match snapshots, after which an autonomous bot takes over to prevent stalling the table.

---

## 📄 License
Commercial Mobile Gaming Application - All Rights Reserved.
