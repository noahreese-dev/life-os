// ═══════════════════════════════════════════════════════════════
// AGENT BTD — Save / Load (LocalStorage)
// ═══════════════════════════════════════════════════════════════
'use strict';

function saveGame() {
  try {
    var data = {
      cash: state.cash, lives: state.lives, round: state.round,
      totalPops: state.totalPops, warStartTime: state.warStartTime,
      autoSend: state.autoSend, gameSpeed: state.gameSpeed,
      peakRound: state.peakRound, towersPlaced: state.towersPlaced,
      towers: state.towers.map(function(t) {
        return { x: t.x, y: t.y, type: t.type, level: t.level,
                 range: t.range, rate: t.rate, dmg: t.dmg,
                 income: t.income, slow: t.slow, isFarm: t.isFarm,
                 targetMode: t.targetMode, kills: t.kills };
      }),
      savedAt: Date.now(),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch(e) {}
}

function loadGame() {
  try {
    var raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    var data = JSON.parse(raw);
    if (!data || !data.towers) return false;

    state.cash = data.cash || 650;
    state.lives = data.lives || 100;
    state.round = data.round || 0;
    state.totalPops = data.totalPops || 0;
    state.warStartTime = data.warStartTime || Date.now();
    state.autoSend = data.autoSend || false;
    state.gameSpeed = data.gameSpeed || 1;
    state.peakRound = data.peakRound || 0;
    state.towersPlaced = data.towersPlaced || 0;

    state.towers = data.towers.map(function(t) {
      return {
        x: t.x, y: t.y, type: t.type, level: t.level || 0,
        range: t.range, rate: t.rate, dmg: t.dmg,
        cooldown: 0, targetAngle: 0, fireScale: 1, rangePulse: 0,
        income: t.income || 0, slow: !!t.slow, isFarm: !!t.isFarm,
        targetMode: t.targetMode || 'first', kills: t.kills || 0,
        berserkerTimer: 0, burstTimer: 0, burstCooldown: 0, regenTimer: 0,
      };
    });

    if (data.savedAt) {
      var awayMinutes = (Date.now() - data.savedAt) / 60000;
      var offlineRounds = Math.floor(awayMinutes / 2);
      if (offlineRounds > 0) {
        var farmIncome = 0;
        for (var i = 0; i < state.towers.length; i++) {
          if (state.towers[i].isFarm) farmIncome += state.towers[i].income;
        }
        var offlineEarnings = offlineRounds * farmIncome;
        if (offlineEarnings > 0) {
          state.cash += offlineEarnings;
          showWelcomeBanner(offlineRounds, offlineEarnings);
        }
      }
    }

    if (state.autoSend) {
      document.getElementById('auto-btn').classList.add('active');
    }
    updateSpeedButtons();

    return true;
  } catch(e) {
    return false;
  }
}
