# Royal Ludo - System Requirements & Functional Specifications

## 1. Overview
**Royal Ludo** is an enterprise-grade, high-performance multiplayer mobile board game application inspired by Ludo Star. It delivers a royal gaming aesthetic, real-time authoritative multiplayer, rich economy loops, autonomous AI, social community features (Clubs, Chat, Gifts), and competitive tournaments.

## 2. Platform Architecture
- **Client**: React Native / Expo (TypeScript, Expo Router, Reanimated, SVG, Zustand)
- **Server**: Node.js / Express / TypeScript / Socket.IO (Authoritative multiplayer state)
- **Database**: MongoDB (Mongoose ODM) with optional Redis cache for distributed rooms
- **Real-Time Layer**: WebSockets via Socket.IO with heartbeat and auto-reconnect
- **Security**: JWT authentication, client input sanitization, anti-cheat validation

## 3. Core Functional Requirements
1. **Game Engine**:
   - 15x15 standard grid with 4 quadrants (Red, Green, Yellow, Blue).
   - 52 common perimeter cells, 8 designated safe cells (starting stars + safe stars).
   - 4 tokens per player.
   - Entry requirement: Rolling a 6 (configurable in custom/master modes).
   - Capturing: Knocking opponent tokens back to base unless on safe cells.
   - Extra turns awarded on rolling 6, capturing an opponent, or reaching home.
   - 3 consecutive 6s rule: Third 6 is forfeited to prevent runaway rolls.
   - Exact roll required to reach the center finish triangle.
2. **Game Variations**:
   - **Classic**: Standard international Ludo rules.
   - **Master**: Stacking allowed, blockade creation, magic entry requirements.
   - **Quick**: Shorter path / 2 tokens to finish for high-tempo 5-minute matches.
   - **Arrow**: Fast-track arrow shortcuts allowing aggressive token progression.
   - **Custom**: Host-configurable turn timer, safe cells, and entry requirements.
3. **Multiplayer Capabilities**:
   - 1v1 (2 Players)
   - 4-Player Free-For-All
   - 2v2 Team Up (allied partners cannot capture each other; combined victory)
   - Private Table with 6-digit alphanumeric room codes
   - Ranked Random Matchmaking based on MMR / ELO rating
   - Offline Pass-and-Play & Offline AI (Easy, Medium, Hard)
4. **Economy & Customization**:
   - Currencies: Gold Coins (primary in-game currency), Gems (premium), XP (level progression).
   - 20+ collectible 3D-styled dice with unique roll animations and VFX.
   - Customizable boards, token skins, chat emojis, and avatar frames.
5. **Social & Engagement**:
   - Player profiles, match statistics, win rate, capture counter.
   - In-game live chat, quick canned phrases, animated emojis, and coin/gem gifts.
   - Clubs: Creation, roles (Owner, Admin, Member), club chat, club leaderboards.
   - Daily Rewards, Lucky Dice (friend gift cycle), Daily Scratch Cards.
   - Season Pass (Free & Royal tiers with 30 reward milestones).
   - Weekly Tournaments with knockout brackets.
