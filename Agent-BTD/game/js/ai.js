// ═══════════════════════════════════════════════════════════════
// AGENT BTD — AI Auto-Play Controller
// ═══════════════════════════════════════════════════════════════
'use strict';

var aiTickAccum = 0;
var AI_TICK_INTERVAL = 1.2;

function aiCalculateThreat() {
  if (!state.waveActive) return 0;
  var rbe = 0;
  for (var i = 0; i < state.balloons.length; i++) {
    rbe += BLOON_COLORS[state.balloons[i].type].rbe || 1;
  }
  return rbe;
}

function aiCalculateDPS() {
  var dps = 0;
  for (var i = 0; i < state.towers.length; i++) {
    var t = state.towers[i];
    if (t.isFarm) continue;
    dps += t.dmg / Math.max(t.rate, 0.1);
  }
  return dps;
}

function aiTick(dt) {
  aiTickAccum += dt;
  if (aiTickAccum < AI_TICK_INTERVAL) return;
  aiTickAccum = 0;

  var aiEl = document.getElementById('ai-indicator');
  var threat = aiCalculateThreat();
  var dps = aiCalculateDPS();
  var isEmergency = state.lives < 20;
  var isPanic = state.lives < 5;

  if (isPanic) {
    for (var i = 0; i < state.towers.length; i++) {
      var t = state.towers[i];
      if (t.isFarm) { sellTower(t); state.aiLastDecision = 'PANIC: Sold farm for damage'; aiEl.textContent = 'AI: ' + state.aiLastDecision; return; }
    }
  }

  if (!state.waveActive && state.lives > 0 && state.towers.length > 0) {
    startWave();
    state.aiLastDecision = 'Starting round ' + state.round;
    aiEl.textContent = 'AI: ' + state.aiLastDecision;
    return;
  }

  if (isEmergency || (threat > dps * 1.5)) {
    if (aiTryUpgrade()) { aiEl.textContent = 'AI: \u26A0 ' + state.aiLastDecision; return; }
    if (aiTryPlace()) { aiEl.textContent = 'AI: \u26A0 ' + state.aiLastDecision; return; }
  }

  if (state.round >= 20) {
    if (aiTryUpgrade()) { aiEl.textContent = 'AI: ' + state.aiLastDecision; return; }
  }

  if (aiTryUpgrade()) { aiEl.textContent = 'AI: ' + state.aiLastDecision; return; }

  if (threat < dps * 0.5 && state.round > 5 && !isEmergency) {
    state.aiLastDecision = 'Eco mode \u2014 saving cash';
    aiEl.textContent = 'AI: ' + state.aiLastDecision;
    return;
  }

  if (aiTryPlace()) { aiEl.textContent = 'AI: ' + state.aiLastDecision; return; }

  state.aiLastDecision = 'Watching...';
  aiEl.textContent = 'AI: Watching (R' + state.round + ', DPS:' + Math.round(dps) + ')';
}

function aiTryUpgrade() {
  var best = null, bestScore = 0;
  for (var i = 0; i < state.towers.length; i++) {
    var t = state.towers[i];
    if (t.level >= 5 || t.isFarm) continue;
    var cost = getUpgradeCost(t);
    if (state.cash < cost) continue;
    if (state.round < 10 && state.cash < cost * 1.4) continue;
    var score = t.dmg * (6 - t.level) * (t.range / 100);
    if (score > bestScore) { bestScore = score; best = t; }
  }
  if (best) {
    upgradeTower(best);
    state.aiLastDecision = 'Upgraded ' + TOWER_DEFS[best.type].name + ' \u2192 Lv.' + best.level;
    return true;
  }
  for (var i = 0; i < state.towers.length; i++) {
    var t = state.towers[i];
    if (!t.isFarm || t.level >= 5) continue;
    var cost = getUpgradeCost(t);
    if (state.cash >= cost * 1.5) {
      upgradeTower(t);
      state.aiLastDecision = 'Upgraded farm \u2192 Lv.' + t.level;
      return true;
    }
  }
  return false;
}

function aiSelectTower() {
  var round = state.round;
  var count = state.towers.filter(function(t) { return !t.isFarm; }).length;
  var farmCount = state.towers.filter(function(t) { return t.isFarm; }).length;
  var hasType = function(type) { return state.towers.some(function(t) { return t.type === type; }); };

  if (state.lives < 20) return state.cash >= TOWER_DEFS.ali.cost ? 'ali' : 'daily';
  if (farmCount === 0 && count >= 2 && state.cash >= TOWER_DEFS.telegram.cost) return 'telegram';
  if (!hasType('hassan') && count >= 1 && state.cash >= TOWER_DEFS.hassan.cost) return 'hassan';
  if (!hasType('cos') && count >= 3 && state.cash >= TOWER_DEFS.cos.cost) return 'cos';

  if (round <= 10) {
    var early = ['daily','daily','ali','ultra','jung'];
    return early[Math.min(count, early.length - 1)];
  }
  if (round <= 25) {
    if (farmCount < 2 && state.cash >= TOWER_DEFS.telegram.cost * 1.3) return 'telegram';
    var mid = ['ali','garage','jung','cos','meta','im'];
    return mid[Math.floor(Math.random() * mid.length)];
  }
  if (round <= 40) {
    var late = ['cos','im','garage','ali'];
    return late[Math.floor(Math.random() * late.length)];
  }
  return ['cos','im','ali'][Math.floor(Math.random() * 3)];
}

function aiScorePosition(x, y, range) {
  var score = 0;
  for (var i = 0; i < pathPoints.length; i += 4) {
    var dx = pathPoints[i].x - x, dy = pathPoints[i].y - y;
    var d = Math.sqrt(dx*dx + dy*dy);
    if (d < range) score += 1 + (range - d) / range;
  }
  for (var i = 0; i < state.towers.length; i++) {
    var t = state.towers[i];
    var dx = t.x - x, dy = t.y - y;
    var d = Math.sqrt(dx*dx + dy*dy);
    if (d < 70) score *= 0.4;
    else if (d < 120) score *= 0.7;
  }
  return score;
}

function aiTryPlace() {
  var towerKey = aiSelectTower();
  if (!towerKey) return false;
  var def = TOWER_DEFS[towerKey];
  if (state.cash < def.cost) return false;
  if (state.round < 5 && state.cash < def.cost * 1.2) return false;

  var bestPos = null, bestScore = -1;
  var step = 45;
  for (var x = 60; x < gameW - 60; x += step) {
    for (var y = HUD_H + 60; y < gameH - 60; y += step) {
      if (!canPlaceTower(x, y)) continue;
      var score = aiScorePosition(x, y, def.range || 100);
      if (score > bestScore) { bestScore = score; bestPos = {x: x, y: y}; }
    }
  }

  if (!bestPos || bestScore < 2) return false;

  state.placingTower = towerKey;
  placeTower(bestPos.x, bestPos.y);
  state.aiLastDecision = 'Placed ' + def.name;
  return true;
}
