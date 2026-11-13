import fs from 'node:fs';

let html = fs.readFileSync('server/src/web/index.html', 'utf-8');

// 1. Fix head socket script tag
const headSocketRegex = /<script src="\/socket\.io\/socket\.io\.js">[\s\S]*?<\/script>/;
html = html.replace(headSocketRegex, '<script src="/socket.io/socket.io.js"></script>');

// 2. Extra Helpers logic to be placed inside the main script
const extraHelpers = `
    // ========================================================
    // FRIENDS & BUDDIES SYSTEM
    // ========================================================
    const FRIENDS_DATA = [
      { id: 'f1', name: 'Shivali Mahajan', avatar: '👩', level: 12, isOnline: true, sent: false },
      { id: 'f2', name: 'Sachin Kumar Sh', avatar: '🧔', level: 14, isOnline: true, sent: false },
      { id: 'f3', name: 'Thiago Rodrigues', avatar: '👱‍♂️', level: 9, isOnline: false, sent: false },
      { id: 'f4', name: 'Ammar Alhatmi', avatar: '👨', level: 18, isOnline: true, sent: false },
      { id: 'f5', name: 'Phyrnai Syiem', avatar: '👨‍🦱', level: 21, isOnline: false, sent: false },
      { id: 'f6', name: 'Elena Rostova', avatar: '👱‍♀️', level: 11, isOnline: true, sent: false },
    ];

    function renderFriendsList() {
      const container = document.getElementById('friendsListContainer');
      if (!container) return;
      container.innerHTML = '';

      FRIENDS_DATA.forEach(f => {
        const row = document.createElement('div');
        row.className = 'league-row';
        row.style.background = '#521350';
        row.style.padding = '10px 12px';
        row.style.borderRadius = '12px';
        row.style.border = '1px solid #752273';
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.justifyContent = 'space-between';

        row.innerHTML = \`
          <div style="display: flex; align-items: center;">
            <div style="position: relative; width: 38px; height: 38px; border-radius: 19px; background: #2F062E; display: flex; align-items: center; justify-content: center; font-size: 22px;">
              \${f.avatar}
              <div style="position: absolute; bottom: 0; right: 0; width: 10px; height: 10px; border-radius: 5px; background: \${f.isOnline ? '#27AE70' : '#888'}; border: 1.5px solid #521350;"></div>
            </div>
            <div style="margin-left: 10px;">
              <div style="font-weight: 800; font-size: 13px; color: #FFF;">\${f.name}</div>
              <div style="font-size: 10px; color: var(--ls-gold-top);">Level \${f.level} • \${f.isOnline ? '🟢 Online' : 'Offline'}</div>
            </div>
          </div>
          <div style="display: flex; gap: 6px;">
            <button class="\${f.sent ? 'side-control-btn' : 'ls-btn-gold'}" style="padding: 6px 12px; font-size: 11px;" onclick="sendFriendGift('\${f.id}', '\${f.name}')" \${f.sent ? 'disabled' : ''}>
              \${f.sent ? '✓ SENT' : '🪙 SEND'}
            </button>
            <button class="ls-btn-green" style="padding: 6px 12px; font-size: 11px;" onclick="startConfiguredPrivateGame()">
              ⚔️ PLAY
            </button>
          </div>
        \`;
        container.appendChild(row);
      });
    }

    function sendFriendGift(id, name) {
      const f = FRIENDS_DATA.find(x => x.id === id);
      if (f) {
        f.sent = true;
        renderFriendsList();
        playCoinSound();
        showNotificationToast('🎁 Sent 100 free coins to ' + name + '!');
      }
    }

    function collectAllGifts() {
      gameState.gold += 600;
      updateCurrencyDisplay();
      playCoinSound();
      showNotificationToast('🎁 Collected 600 Gold Coins from 6 buddies!');
    }

    function sendAllGifts() {
      FRIENDS_DATA.forEach(f => f.sent = true);
      renderFriendsList();
      playCoinSound();
      showNotificationToast('📤 Free daily coins sent to all buddies!');
    }

    function copyReferralLink() {
      navigator.clipboard?.writeText?.('https://royalludo.app/invite?ref=govind');
      showNotificationToast('📋 Referral Link Copied! Share with friends to earn 5,000 Coins!');
    }

    // ========================================================
    // SHOP ACTIONS
    // ========================================================
    function buyCoins(amount, price) {
      gameState.gold += amount;
      updateCurrencyDisplay();
      playCoinSound();
      showNotificationToast('🪙 Purchased ' + amount.toLocaleString() + ' Gold Coins (' + price + ')!');
    }

    function buyGems(amount, price) {
      gameState.gems += amount;
      updateCurrencyDisplay();
      playCoinSound();
      showNotificationToast('💎 Purchased ' + amount + ' Green Gems (' + price + ')!');
    }

    function buyVipPass() {
      showNotificationToast('👑 Royal VIP Pass Activated! Enjoy 2x XP and Golden Badges!');
    }

    // ========================================================
    // SETTINGS ACTIONS
    // ========================================================
    function openSettingsModal() {
      document.getElementById('settingsModal').classList.add('open');
    }

    let soundEnabled = true;
    function toggleSound() {
      soundEnabled = !soundEnabled;
      const btn = document.getElementById('soundToggleBtn');
      if (btn) {
        btn.textContent = soundEnabled ? 'ON' : 'OFF';
        btn.style.background = soundEnabled ? '#27AE70' : '#E74C4C';
      }
      showNotificationToast('Sound Effects ' + (soundEnabled ? 'Enabled 🔊' : 'Muted 🔇'));
    }

    let chatEnabled = true;
    function toggleChatBubbles() {
      chatEnabled = !chatEnabled;
      const btn = document.getElementById('chatToggleBtn');
      if (btn) {
        btn.textContent = chatEnabled ? 'ON' : 'OFF';
        btn.style.background = chatEnabled ? '#27AE70' : '#E74C4C';
      }
      showNotificationToast('Chat Bubbles ' + (chatEnabled ? 'Enabled 💬' : 'Hidden 🔕'));
    }

    // ========================================================
    // IN-GAME SLEEK NOTIFICATION TOAST
    // ========================================================
    function showNotificationToast(msg) {
      let toast = document.getElementById('appNotificationToast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'appNotificationToast';
        toast.style.position = 'fixed';
        toast.style.top = '70px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.background = 'linear-gradient(135deg, #FFDF00 0%, #F5A623 100%)';
        toast.style.color = '#000';
        toast.style.fontWeight = '900';
        toast.style.fontSize = '12px';
        toast.style.padding = '8px 18px';
        toast.style.borderRadius = '20px';
        toast.style.boxShadow = '0 4px 15px rgba(0,0,0,0.5)';
        toast.style.zIndex = '9999';
        toast.style.transition = 'all 0.3s ease';
        toast.style.pointerEvents = 'none';
        document.body.appendChild(toast);
      }
      toast.textContent = msg;
      toast.style.opacity = '1';
      toast.style.top = '70px';

      clearTimeout(window.__toastTimeout);
      window.__toastTimeout = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.top = '50px';
      }, 2500);
    }
`;

// Append extraHelpers and close tags properly
if (!html.includes('function renderFriendsList')) {
  html = html + '\n' + extraHelpers;
}

if (!html.includes('</script>')) {
  html = html + '\n  </script>\n</body>\n</html>';
}

fs.writeFileSync('server/src/web/index.html', html, 'utf-8');
console.log('Cleaned and fixed web/index.html successfully!');
