import fs from 'node:fs';

let html = fs.readFileSync('server/src/web/index.html', 'utf-8');

// 1. ADD CSS FOR ADVANCED CARDS & ANIMATIONS
const cardsCss = `
    /* ========================================================
       ADVANCED ANIMATED GAME MODE CARDS
       ======================================================== */
    .hero-modes-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 130px;
      margin-bottom: 14px;
    }

    .animated-game-card {
      border-radius: 20px;
      padding: 12px 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      min-height: 165px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .animated-game-card:hover {
      transform: translateY(-5px) scale(1.02);
      box-shadow: 0 14px 28px rgba(0,0,0,0.55);
    }

    .animated-game-card:active {
      transform: scale(0.96);
    }

    /* CARD SHIMMER SHEEN */
    .animated-game-card::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(
        60deg,
        transparent 30%,
        rgba(255, 255, 255, 0.2) 50%,
        transparent 70%
      );
      transform: rotate(25deg);
      animation: cardSheenSweep 5s infinite;
      pointer-events: none;
    }

    @keyframes cardSheenSweep {
      0% { transform: translateX(-100%) rotate(25deg); }
      30%, 100% { transform: translateX(100%) rotate(25deg); }
    }

    /* CARD 1: 2 PLAYER (GOLD/ORANGE) */
    .card-style-2p {
      background: linear-gradient(145deg, #FFB300 0%, #F57C00 100%);
      border: 3px solid #FFE082;
      box-shadow: 0 8px 0 #9E5306, 0 12px 20px rgba(0,0,0,0.4);
    }

    /* CARD 2: 4 PLAYERS (EMERALD/JADE) */
    .card-style-4p {
      background: linear-gradient(145deg, #27AE60 0%, #16A085 100%);
      border: 3px solid #A3E4D7;
      box-shadow: 0 8px 0 #0E6251, 0 12px 20px rgba(0,0,0,0.4);
    }

    /* CARD 3: PLAY WITH FRIENDS (ROYAL PURPLE/AMETHYST) */
    .card-style-friends {
      background: linear-gradient(145deg, #8E44AD 0%, #511B68 100%);
      border: 3px solid #D29BFD;
      box-shadow: 0 8px 0 #370B49, 0 12px 20px rgba(0,0,0,0.4);
    }

    /* CARD 4: TEAM UP 2v2 (ELECTRIC CYAN/BLUE) */
    .card-style-teamup {
      background: linear-gradient(145deg, #2980B9 0%, #6C3483 100%);
      border: 3px solid #85C1E9;
      box-shadow: 0 8px 0 #1B4F72, 0 12px 20px rgba(0,0,0,0.4);
    }

    /* CARD 5: PASS 'N PLAY (BRONZE/WOOD) */
    .card-style-local {
      background: linear-gradient(145deg, #D35400 0%, #A04000 100%);
      border: 3px solid #F5CBA7;
      box-shadow: 0 8px 0 #5E2602, 0 12px 20px rgba(0,0,0,0.4);
    }

    /* CARD 6: QUICK & ARROW (CRIMSON FLAME) */
    .card-style-quick {
      background: linear-gradient(145deg, #C0392B 0%, #7B241C 100%);
      border: 3px solid #FADBD8;
      box-shadow: 0 8px 0 #4A120D, 0 12px 20px rgba(0,0,0,0.4);
    }

    /* CARD HEADER BADGE */
    .card-tag-pill {
      font-size: 9px;
      font-weight: 900;
      color: #FFF;
      background: rgba(0,0,0,0.35);
      border-radius: 10px;
      padding: 2px 8px;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 2px;
    }

    .card-center-icon-area {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      width: 100%;
    }

    .card-bottom-pill-btn {
      width: 92%;
      background: rgba(0, 0, 0, 0.35);
      border-radius: 14px;
      padding: 5px 8px;
      text-align: center;
      border: 1px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
    }

    .card-title-main {
      font-family: 'Fredoka', cursive;
      font-size: 13px;
      font-weight: 900;
      color: #FFF;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }

    .card-sub-desc {
      font-size: 9px;
      color: rgba(255,255,255,0.85);
      font-weight: 700;
      margin-top: 1px;
    }
`;

// Insert CSS
html = html.replace('</style>', cardsCss + '\n</style>');

// 2. REPLACE THE VIEW-HOME HTML TO FEATURE ALL 6 TOP-TIER MODES
const oldViewHomeRegex = /<section class="screen-view active" id="view-home">[\s\S]*?<\/section>/;
const newViewHomeHtml = `
    <!-- ========================================================
         SCREEN 1: LUDO STAR PREMIER HOME SCREEN WITH ALL MODES
         ======================================================== -->
    <section class="screen-view active" id="view-home">
      <!-- 6 PREMIER ANIMATED GAME MODE CARDS -->
      <div class="hero-modes-grid">
        <!-- MODE 1: 2 PLAYER (1 ON 1) -->
        <div class="animated-game-card card-style-2p" onclick="openBetModal(2)" title="1 on 1 Match">
          <div class="card-tag-pill">
            <span>⚡ FAST DUEL</span> • <span>🟢 142K</span>
          </div>
          <div class="card-center-icon-area">
            <svg width="110" height="85" viewBox="0 0 120 90">
              <polygon points="60,10 110,40 60,70 10,40" fill="#2ECC71" stroke="#27AE60" stroke-width="2"/>
              <polygon points="60,70 110,40 110,50 60,80" fill="#1E8449"/>
              <polygon points="60,70 10,40 10,50 60,80" fill="#145A32"/>
              <text x="60" y="58" font-family="'Fredoka', cursive" font-size="52" font-weight="900" fill="#E74C3C" text-anchor="middle" stroke="#FFF" stroke-width="3" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.5))">2</text>
              <circle cx="85" cy="55" r="14" fill="#FFF" stroke="#F1C40F" stroke-width="2" filter="drop-shadow(0 3px 6px rgba(0,0,0,0.4))"/>
              <text x="85" y="60" font-size="14" text-anchor="middle">👑</text>
            </svg>
          </div>
          <div class="card-bottom-pill-btn">
            <div class="card-title-main">2 PLAYER</div>
            <div class="card-sub-desc">1 on 1 Online Battle</div>
          </div>
        </div>

        <!-- MODE 2: 4 PLAYERS (CLASSIC BATTLE) -->
        <div class="animated-game-card card-style-4p" onclick="openBetModal(4)" title="4 Players Rumble">
          <div class="card-tag-pill">
            <span>👑 4 PLAYERS</span> • <span>🔥 POPULAR</span>
          </div>
          <div class="card-center-icon-area">
            <svg width="110" height="85" viewBox="0 0 120 90">
              <polygon points="60,10 110,40 60,70 10,40" fill="#F1C40F" stroke="#D4AC0D" stroke-width="2"/>
              <polygon points="60,70 110,40 110,50 60,80" fill="#B7950B"/>
              <polygon points="60,70 10,40 10,50 60,80" fill="#7D6608"/>
              <circle cx="35" cy="40" r="11" fill="#E74C3C" stroke="#FFF" stroke-width="2"/>
              <circle cx="85" cy="40" r="11" fill="#2ECC71" stroke="#FFF" stroke-width="2"/>
              <circle cx="60" cy="22" r="11" fill="#F1C40F" stroke="#FFF" stroke-width="2"/>
              <circle cx="60" cy="58" r="11" fill="#3498DB" stroke="#FFF" stroke-width="2"/>
              <text x="60" y="44" font-size="16" text-anchor="middle">🎲</text>
            </svg>
          </div>
          <div class="card-bottom-pill-btn">
            <div class="card-title-main">4 PLAYER</div>
            <div class="card-sub-desc">4-Quadrant Rumble</div>
          </div>
        </div>

        <!-- MODE 3: PLAY WITH FRIENDS (PRIVATE ROOM) -->
        <div class="animated-game-card card-style-friends" onclick="openPrivateTableModal()" title="Play With Friends">
          <div class="card-tag-pill">
            <span>👥 WITH FRIENDS</span> • <span>🔒 CODE</span>
          </div>
          <div class="card-center-icon-area">
            <svg width="110" height="85" viewBox="0 0 120 90">
              <polygon points="60,10 110,40 60,70 10,40" fill="#E74C3C" stroke="#C0392B" stroke-width="2"/>
              <polygon points="60,70 110,40 110,50 60,80" fill="#922B21"/>
              <polygon points="60,70 10,40 10,50 60,80" fill="#78281F"/>
              <text x="60" y="52" font-size="38" text-anchor="middle" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.5))">💖</text>
              <circle cx="88" cy="24" r="12" fill="#3498DB" stroke="#FFF" stroke-width="1.5"/>
              <text x="88" y="29" font-size="12" text-anchor="middle">🎙️</text>
            </svg>
          </div>
          <div class="card-bottom-pill-btn">
            <div class="card-title-main">WITH FRIENDS</div>
            <div class="card-sub-desc">Private Room & Code</div>
          </div>
        </div>

        <!-- MODE 4: TEAM UP (2v2 ALLIED BATTLE) -->
        <div class="animated-game-card card-style-teamup" onclick="openTeamUpScreen()" title="Team Up 2v2">
          <div class="card-tag-pill">
            <span>🤝 TEAM UP</span> • <span>🎙️ VOICE</span>
          </div>
          <div class="card-center-icon-area">
            <div style="font-size: 38px; display: flex; align-items: center; justify-content: center;">
              ⚡
              <div style="background: #E74C4C; border: 2px solid #FFF; border-radius: 8px; padding: 2px 6px; font-weight: 900; font-size: 13px; margin-left: -10px; color: #FFF;">VS</div>
            </div>
          </div>
          <div class="card-bottom-pill-btn">
            <div class="card-title-main">TEAM UP (2v2)</div>
            <div class="card-sub-desc">Allied Team Clash</div>
          </div>
        </div>

        <!-- MODE 5: PASS 'N PLAY (LOCAL OFFLINE MULTIPLAYER) -->
        <div class="animated-game-card card-style-local" onclick="openPassAndPlayModal()" title="Pass 'n Play Offline">
          <div class="card-tag-pill">
            <span>📱 LOCAL PLAY</span> • <span>📶 NO WIFI</span>
          </div>
          <div class="card-center-icon-area">
            <div style="font-size: 40px; display: flex; align-items: center; justify-content: center;">
              📱
              <span style="font-size: 20px; margin-left: -6px;">👥</span>
            </div>
          </div>
          <div class="card-bottom-pill-btn">
            <div class="card-title-main">PASS 'N PLAY</div>
            <div class="card-sub-desc">Local 2-4 Players & AI</div>
          </div>
        </div>

        <!-- MODE 6: QUICK & ARROW MODE -->
        <div class="animated-game-card card-style-quick" onclick="openQuickArrowModal()" title="Quick & Arrow Mode">
          <div class="card-tag-pill">
            <span>🚀 RUSH MODE</span> • <span>🏹 ARROWS</span>
          </div>
          <div class="card-center-icon-area">
            <div style="font-size: 40px; display: flex; align-items: center; justify-content: center;">
              🏹
              <span style="font-size: 22px; margin-left: -8px;">⚡</span>
            </div>
          </div>
          <div class="card-bottom-pill-btn">
            <div class="card-title-main">ARROW & QUICK</div>
            <div class="card-sub-desc">2-Token Fast Win</div>
          </div>
        </div>
      </div>

      <!-- SECONDARY ACTION BUTTONS -->
      <div class="secondary-modes-grid" style="margin-top: 4px;">
        <div class="small-mode-card" onclick="openVipModal()">
          <div class="small-mode-icon">🏆</div>
          <div class="small-mode-label">VIP</div>
        </div>
        <div class="small-mode-card" onclick="openStreakModal()">
          <div class="small-mode-icon">⭐</div>
          <div class="small-mode-label">STREAK STARS</div>
        </div>
        <div class="small-mode-card" onclick="openLeagueModal()">
          <div class="small-mode-icon">🛡️</div>
          <div class="small-mode-label">LEAGUE</div>
        </div>
        <div class="small-mode-card" onclick="switchNavTab('collections')">
          <div class="small-mode-icon">🎲</div>
          <div class="small-mode-label">24 DICE</div>
        </div>
      </div>
    </section>
`;

html = html.replace(oldViewHomeRegex, newViewHomeHtml);

// 3. ADD PASS 'N PLAY MODAL & QUICK ARROW MODAL IN HTML
const newModalsHtml = `
    <!-- PASS 'N PLAY (LOCAL OFFLINE MULTIPLAYER) MODAL -->
    <div class="modal-backdrop" id="passPlayModal" onclick="if(event.target===this)closeModals()">
      <div class="modal-card" style="max-width: 400px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="font-family: 'Fredoka', cursive; font-size: 18px; font-weight: 800; color: var(--ls-gold-top);">📱 PASS 'N PLAY (LOCAL)</div>
          <button style="background: #E74C4C; border: none; color: #FFF; width: 28px; height: 28px; border-radius: 14px; font-weight: 900; cursor: pointer;" onclick="closeModals()">✕</button>
        </div>

        <div style="font-size: 11px; color: #E6C985; margin-bottom: 12px;">
          Play with buddies on this device or practice offline against smart AI bots! No internet needed.
        </div>

        <div style="font-family: 'Fredoka', cursive; font-size: 13px; font-weight: 800; color: #FFF; margin-bottom: 6px;">SELECT PLAYER COUNT:</div>
        <div style="display: flex; gap: 8px; margin-bottom: 14px;">
          <button id="pnp-count-2" class="ls-btn-gold" style="flex: 1; padding: 8px 0; font-size: 12px;" onclick="setPnpCount(2)">2 Players</button>
          <button id="pnp-count-3" class="side-control-btn" style="flex: 1; padding: 8px 0; font-size: 12px;" onclick="setPnpCount(3)">3 Players</button>
          <button id="pnp-count-4" class="side-control-btn" style="flex: 1; padding: 8px 0; font-size: 12px;" onclick="setPnpCount(4)">4 Players</button>
        </div>

        <div style="font-family: 'Fredoka', cursive; font-size: 13px; font-weight: 800; color: #FFF; margin-bottom: 6px;">SEAT CONFIGURATION:</div>
        <div id="pnpSeatsContainer" style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px;">
          <!-- Rendered via JS -->
        </div>

        <button class="ls-btn-gold" style="width: 100%; padding: 12px 0; font-size: 14px; font-weight: 900;" onclick="startPassAndPlayMatch()">
          START LOCAL MATCH ⚔️
        </button>
      </div>
    </div>
`;

html = html.replace('id="privateModal"', 'id="privateModal"' + '\n' + newModalsHtml);

// 4. ADD JAVASCRIPT FUNCTIONS FOR PASS 'N PLAY & QUICK ARROW
const newJsFunctions = `
    // PASS 'N PLAY LOGIC
    let pnpPlayerCount = 4;
    let pnpSeats = [
      { color: 'Red', type: 'Human', name: 'Player 1 (You)' },
      { color: 'Green', type: 'Human', name: 'Player 2' },
      { color: 'Yellow', type: 'Bot', name: 'Sir Lancelot (AI)' },
      { color: 'Blue', type: 'Bot', name: 'Lord Galahad (AI)' }
    ];

    function openPassAndPlayModal() {
      setPnpCount(4);
      document.getElementById('passPlayModal').classList.add('open');
    }

    function setPnpCount(count) {
      pnpPlayerCount = count;
      [2, 3, 4].forEach(c => {
        const btn = document.getElementById('pnp-count-' + c);
        if (btn) {
          btn.className = (c === count) ? 'ls-btn-gold' : 'side-control-btn';
        }
      });
      renderPnpSeats();
    }

    function renderPnpSeats() {
      const container = document.getElementById('pnpSeatsContainer');
      if (!container) return;
      container.innerHTML = '';

      for (let i = 0; i < pnpPlayerCount; i++) {
        const s = pnpSeats[i];
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.justifyContent = 'space-between';
        row.style.background = '#2F062E';
        row.style.padding = '8px 12px';
        row.style.borderRadius = '10px';
        row.style.border = '1px solid #752273';

        row.innerHTML = \`
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 14px; height: 14px; border-radius: 7px; background: \${s.color === 'Red' ? '#E74C3C' : s.color === 'Green' ? '#2ECC71' : s.color === 'Yellow' ? '#F1C40F' : '#3498DB'};"></div>
            <div style="font-weight: 800; font-size: 12px; color: #FFF;">\${s.name}</div>
          </div>
          <button class="\${s.type === 'Human' ? 'ls-btn-green' : 'side-control-btn'}" style="padding: 4px 10px; font-size: 11px;" onclick="togglePnpSeatType(\${i})">
            \${s.type === 'Human' ? '👤 HUMAN' : '🤖 BOT'}
          </button>
        \`;
        container.appendChild(row);
      }
    }

    function togglePnpSeatType(idx) {
      if (pnpSeats[idx].type === 'Human') {
        pnpSeats[idx].type = 'Bot';
        pnpSeats[idx].name = (idx === 1 ? 'Lady Guinevere (AI)' : idx === 2 ? 'Sir Lancelot (AI)' : 'Lord Galahad (AI)');
      } else {
        pnpSeats[idx].type = 'Human';
        pnpSeats[idx].name = 'Player ' + (idx + 1);
      }
      renderPnpSeats();
    }

    function startPassAndPlayMatch() {
      closeModals();
      gameState.activePlayerCount = pnpPlayerCount;
      gameState.isTeamMode = false;
      gameState.gameMode = 'classic';
      initGame();
      showScreen('view-game');
      showNotificationToast('📱 Pass \\'n Play match started (' + pnpPlayerCount + ' Players)!');
    }

    function openQuickArrowModal() {
      gameState.activePlayerCount = 4;
      gameState.gameMode = 'quick';
      selectVariation('quick');
      openBetModal(4);
    }
`;

const lastScriptTag = html.lastIndexOf('</script>');
if (lastScriptTag !== -1) {
  html = html.slice(0, lastScriptTag) + newJsFunctions + '\n  ' + html.slice(lastScriptTag);
}

fs.writeFileSync('server/src/web/index.html', html, 'utf-8');
console.log('Successfully added all 6 premier animated game modes to web/index.html!');
