// ═══════════════════════════════════════════════════════════════
// AGENT BTD — Tower Placement, Targeting, Upgrades, Selling
// ═══════════════════════════════════════════════════════════════
'use strict';

function selectTowerForPlacement(key) {
  initAudio();
  if (state.cash < TOWER_DEFS[key].cost) return;
  if (state.placingTower === key) {
    state.placingTower = null;
  } else {
    state.placingTower = key;
    state.selectedTower = null;
    hideTowerDetail();
  }
  updateShopCards();
}

function canPlaceTower(x, y) {
  if (isOnPath(x, y, PATH_W * 0.6 + 14)) return false;
  if (x < 10 || x > gameW - 10 || y < HUD_H + 10 || y > gameH - 10) return false;
  for (var i = 0; i < state.towers.length; i++) {
    var t = state.towers[i];
    var dx = t.x - x, dy = t.y - y;
    if (dx*dx + dy*dy < 30*30) return false;
  }
  return true;
}

function placeTower(x, y) {
  var key = state.placingTower;
  var def = TOWER_DEFS[key];
  if (!canPlaceTower(x, y)) return;
  if (state.cash < def.cost) return;

  state.cash -= def.cost;
  var tower = {
    x: x, y: y, type: key,
    range: def.range, rate: def.rate, dmg: def.dmg,
    cooldown: 0, level: 0, targetAngle: 0, fireScale: 1, rangePulse: 0,
    isFarm: !!def.isFarm, income: def.income || 0, slow: !!def.slow,
    targetMode: 'first',
    kills: 0, berserkerTimer: 0, burstTimer: 0, burstCooldown: 0, regenTimer: 0,
  };
  state.towers.push(tower);
  state.towersPlaced++;
  state.placingTower = null;
  playSound('place');
  updateShopCards();
  updateHUD();
}

function getUpgradeCost(tower) {
  var base = Math.round(TOWER_DEFS[tower.type].cost * 0.6);
  return Math.round(base * Math.pow(1.6, tower.level));
}

function getSellValue(tower) {
  var baseCost = TOWER_DEFS[tower.type].cost;
  var total = baseCost;
  var upgradeBase = Math.round(baseCost * 0.6);
  for (var i = 0; i < tower.level; i++) {
    total += Math.round(upgradeBase * Math.pow(1.6, i));
  }
  return Math.round(total * 0.7);
}

function upgradeTower(tower) {
  if (tower.level >= 5) return;
  var cost = getUpgradeCost(tower);
  if (state.cash < cost) return;
  state.cash -= cost;
  tower.level++;
  if (tower.isFarm) {
    tower.income = Math.round(tower.income * 1.5);
  } else {
    tower.range = Math.round(tower.range * 1.12);
    tower.dmg += 1;
    tower.rate *= 0.85;
  }
  playSound('cash');
  showTowerDetail(tower);
  updateHUD();
}

function sellTower(tower) {
  var val = getSellValue(tower);
  state.cash += val;
  state.towers = state.towers.filter(function(t) { return t !== tower; });
  hideTowerDetail();
  playSound('cash');
  spawnFloatingText(tower.x, tower.y, '+$' + val, '#ffcc00');
  updateHUD();
}
