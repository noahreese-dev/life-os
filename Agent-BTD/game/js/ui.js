// ═══════════════════════════════════════════════════════════════
// AGENT BTD — UI (DOM-based HUD, Shop, Panels)
// ═══════════════════════════════════════════════════════════════
'use strict';

function updateHUD() {
  document.getElementById('hud-round').textContent = state.round;
  document.getElementById('hud-cash').textContent = '$' + state.cash;
  document.getElementById('hud-lives').textContent = state.lives;
  document.getElementById('hud-pops').textContent = state.totalPops;
  document.getElementById('hud-income').textContent = '$' + state.roundIncome;

  var livesEl = document.getElementById('hud-lives');
  livesEl.style.color = state.lives > 50 ? '#44ff88' : state.lives > 20 ? '#ffaa33' : '#ff3344';

  updateShopCards();

  if (state.selectedTower && state.towers.includes(state.selectedTower)) {
    showTowerDetail(state.selectedTower);
  }
}

function updateShopCards() {
  var cards = document.querySelectorAll('.tower-card');
  cards.forEach(function(card) {
    var key = card.dataset.tower;
    var def = TOWER_DEFS[key];
    if (state.cash < def.cost) {
      card.classList.add('disabled');
    } else {
      card.classList.remove('disabled');
    }
    if (state.placingTower === key) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  });
}

function buildShopPanel() {
  var list = document.getElementById('tower-list');
  while (list.firstChild) list.removeChild(list.firstChild);

  for (var ki = 0; ki < TOWER_ORDER.length; ki++) {
    var key = TOWER_ORDER[ki];
    var def = TOWER_DEFS[key];
    var card = document.createElement('div');
    card.className = 'tower-card';
    card.dataset.tower = key;

    var preview = renderTowerPreviewCanvas(key);
    card.appendChild(preview);

    var info = document.createElement('div');
    info.className = 'tower-info';

    var nameEl = document.createElement('div');
    nameEl.className = 'tower-name';
    nameEl.textContent = def.name;
    info.appendChild(nameEl);

    var costEl = document.createElement('div');
    costEl.className = 'tower-cost';
    costEl.textContent = '$' + def.cost;
    info.appendChild(costEl);

    var descEl = document.createElement('div');
    descEl.className = 'tower-desc';
    descEl.textContent = def.isFarm ? 'Income: $' + def.income + '/rd' : 'Dmg:' + def.dmg + ' Rng:' + def.range;
    info.appendChild(descEl);

    card.appendChild(info);
    (function(k) {
      card.addEventListener('click', function() { selectTowerForPlacement(k); });
    })(key);
    list.appendChild(card);
  }
}

// Mini Canvas 2D preview for shop cards (small, doesn't need PixiJS)
function renderTowerPreviewCanvas(key) {
  var def = TOWER_DEFS[key];
  var cvs = document.createElement('canvas');
  cvs.width = 44;
  cvs.height = 44;
  var c = cvs.getContext('2d');
  c.save();
  c.translate(22, 24);
  drawMonkeyCanvas2D(c, def, 32, 0, 0);
  c.restore();
  return cvs;
}

function showTowerDetail(tower) {
  state.selectedTower = tower;
  var panel = document.getElementById('tower-detail');
  var def = TOWER_DEFS[tower.type];
  panel.style.display = 'flex';

  document.getElementById('detail-name').textContent = def.full + ' (Lv.' + tower.level + ')';

  var statsEl = document.getElementById('detail-stats');
  while (statsEl.firstChild) statsEl.removeChild(statsEl.firstChild);

  if (tower.isFarm) {
    statsEl.textContent = 'Income: $' + Math.round(tower.income) + '/round';
  } else {
    statsEl.textContent = 'DMG: ' + tower.dmg + ' | Range: ' + Math.round(tower.range) + ' | Rate: ' + tower.rate.toFixed(2) + 's';
  }

  var upgCost = getUpgradeCost(tower);
  var upgBtn = document.getElementById('upgrade-btn');
  if (tower.level >= 5) {
    upgBtn.textContent = 'MAX LEVEL';
    upgBtn.disabled = true;
  } else {
    upgBtn.textContent = 'Upgrade $' + upgCost;
    upgBtn.disabled = state.cash < upgCost;
  }

  var sellVal = getSellValue(tower);
  document.getElementById('sell-btn').textContent = 'Sell $' + sellVal;

  var abilityEl = document.getElementById('detail-ability');
  var ability = TOWER_ABILITIES[tower.type];
  abilityEl.textContent = ability ? '\u26A1 ' + ability.name + ': ' + ability.desc : '';

  var targetEl = document.getElementById('detail-target');
  targetEl.textContent = tower.isFarm ? '' : '\uD83C\uDFAF Target: ' + tower.targetMode.toUpperCase() + ' (right-click to change)';

  document.getElementById('clone-btn').style.display = tower.isFarm ? 'none' : 'block';
  document.getElementById('teleport-btn').style.display = 'block';
}

function hideTowerDetail() {
  document.getElementById('tower-detail').style.display = 'none';
  state.selectedTower = null;
}

function showWaveBanner(text) {
  var banner = document.getElementById('wave-banner');
  banner.textContent = text;
  banner.classList.add('show');
  state.waveBannerTimer = 2;
}

function updateWavePreview() {
  var preview = document.getElementById('wave-preview');
  while (preview.firstChild) preview.removeChild(preview.firstChild);
  var nextWave = generateWave(state.round + 1);
  var counts = {};
  nextWave.forEach(function(b) { counts[b.type] = (counts[b.type] || 0) + 1; });
  var label = document.createElement('span');
  label.textContent = 'Next: ';
  label.style.color = '#556677';
  preview.appendChild(label);
  Object.keys(counts).slice(0, 6).forEach(function(type) {
    var def = BLOON_COLORS[type];
    var dot = document.createElement('span');
    dot.className = 'preview-bloon';
    dot.style.background = def.color === 'rainbow' ? 'linear-gradient(45deg,#f00,#0f0,#00f)' : def.color;
    dot.title = type + ' x' + counts[type];
    preview.appendChild(dot);
    var ct = document.createElement('span');
    ct.textContent = counts[type] + ' ';
    ct.style.fontSize = '9px';
    ct.style.color = '#778899';
    preview.appendChild(ct);
  });
}

function updateClock() {
  var now = new Date();
  var hours = now.getHours().toString().padStart(2, '0');
  var mins = now.getMinutes().toString().padStart(2, '0');
  var secs = now.getSeconds().toString().padStart(2, '0');
  var warDuration = Date.now() - state.warStartTime;
  var warMins = Math.floor(warDuration / 60000);
  var warSecs = Math.floor((warDuration % 60000) / 1000);
  var clockEl = document.getElementById('clock-display');
  clockEl.textContent = hours + ':' + mins + ':' + secs + ' | War: ' + warMins + 'm ' + warSecs + 's';
}

function spawnFloatingText(x, y, text, color) {
  state.floatingTexts.push({
    x: x, y: y, text: text, color: color,
    life: 1.0, maxLife: 1.0,
  });
}

function showWelcomeBanner(rounds, earnings) {
  var wb = document.getElementById('welcome-banner');
  wb.style.display = 'block';
  document.getElementById('welcome-title').textContent = 'Welcome Back, Agent';
  document.getElementById('welcome-text').textContent = 'While you were away (' + rounds + ' rounds), your farms earned $' + earnings + '.';
}

function updateSpeedButtons() {
  document.querySelectorAll('.speed-btn').forEach(function(btn) {
    var s = parseInt(btn.dataset.speed);
    if (s === state.gameSpeed) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function setSpeed(spd) {
  state.gameSpeed = spd;
  updateSpeedButtons();
}

function gameOver() {
  state.waveActive = false;
  state.peakRound = Math.max(state.peakRound, state.round);
  localStorage.removeItem(SAVE_KEY);

  var statsEl = document.getElementById('go-stats');
  while (statsEl.firstChild) statsEl.removeChild(statsEl.firstChild);
  var warDuration = Date.now() - state.warStartTime;
  var warMins = Math.floor(warDuration / 60000);
  var stats = [
    ['Round Reached', state.round],
    ['Total Pops', state.totalPops],
    ['Best Combo', state.bestCombo + 'x'],
    ['Towers Placed', state.towersPlaced],
    ['War Duration', warMins + ' min'],
    ['Peak Round (all time)', state.peakRound],
  ];
  stats.forEach(function(s) {
    var line = document.createElement('div');
    line.textContent = s[0] + ': ';
    var val = document.createElement('span');
    val.className = 'go-stat-value';
    val.textContent = s[1];
    line.appendChild(val);
    statsEl.appendChild(line);
  });
  document.getElementById('game-over-overlay').classList.add('show');
}

function resetGame() {
  document.getElementById('game-over-overlay').classList.remove('show');
  state.cash = 650;
  state.lives = 100;
  state.round = 0;
  state.totalPops = 0;
  state.towers = [];
  state.balloons = [];
  state.projectiles = [];
  state.particles = [];
  state.floatingTexts = [];
  state.warStartTime = Date.now();
  state.waveActive = false;
  state.towersPlaced = 0;
  state.cashEarned = 0;
  state.bestCombo = 0;
  state.comboCount = 0;
  document.getElementById('send-wave-btn').classList.remove('hidden');
  hideTowerDetail();
  updateHUD();
  // Reset PixiJS renderer state
  if (typeof pixiResetScene === 'function') pixiResetScene();
}
