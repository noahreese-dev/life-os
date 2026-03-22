// ═══════════════════════════════════════════════════════════════
// AGENT BTD — Projectile Firing, Movement, Hit Detection
// ═══════════════════════════════════════════════════════════════
'use strict';

function fireProjectile(tower, target, tpos) {
  var style = PROJ_STYLES[tower.type] || { shape:'pellet', color:TOWER_DEFS[tower.type].fur, size:3 };
  var dmg = tower.dmg;
  var pierce = 1;
  var ability = TOWER_ABILITIES[tower.type];
  if (tower.type === 'ali' && tower.berserkerTimer > 0) dmg *= 2;
  if (tower.type === 'garage' && ability) pierce = ability.pierce;

  state.projectiles.push({
    x: tower.x, y: tower.y,
    tx: tpos.x, ty: tpos.y,
    dmg: dmg, slow: tower.slow,
    target: target, life: 2,
    color: style.color,
    trail: [],
    towerType: tower.type,
    sourceTower: tower,
    style: style,
    pierce: pierce,
    pierced: 0,
    angle: Math.atan2(tpos.y - tower.y, tpos.x - tower.x),
    spawnTime: state.gameTime,
  });
}

function hitBalloon(proj) {
  var target = proj.target;
  if (!target || !state.balloons.includes(target)) {
    var nearest = null, nearDist = Infinity;
    for (var i = 0; i < state.balloons.length; i++) {
      var b = state.balloons[i];
      var bpos = getPointAtDistance(b.dist);
      var dx = bpos.x - proj.tx, dy = bpos.y - proj.ty;
      var d = dx*dx + dy*dy;
      if (d < nearDist && d < 40*40) { nearDist = d; nearest = b; }
    }
    if (!nearest) return;
    target = nearest;
  }

  target.hp -= proj.dmg;
  target.hitFlash = 0.4;
  if (proj.slow) target.slowTimer = 2;

  // Hassan permafrost
  if (proj.towerType === 'hassan') target.slowTimer = Math.max(target.slowTimer, 3);

  // Jung mind control
  if (proj.towerType === 'jung' && Math.random() < 0.05) {
    target.dist = Math.max(0, target.dist - 80);
    spawnFloatingText(proj.tx, proj.ty, 'MIND CONTROL!', '#bb66ff');
  }

  // IM chain lightning
  if (proj.towerType === 'im' && proj.pierced === 0) {
    var chains = 0;
    for (var i = 0; i < state.balloons.length; i++) {
      var b = state.balloons[i];
      if (b === target || chains >= 2) continue;
      var bpos = getPointAtDistance(b.dist);
      var tpos = getPointAtDistance(target.dist);
      var dx = bpos.x - tpos.x, dy = bpos.y - tpos.y;
      if (dx*dx + dy*dy < 80*80) {
        b.hp -= Math.ceil(proj.dmg * 0.6);
        b.hitFlash = 0.3;
        if (b.hp <= 0) popBalloon(b);
        chains++;
      }
    }
  }

  if (target.hp <= 0) {
    popBalloon(target);
    if (proj.sourceTower && state.towers.includes(proj.sourceTower)) {
      proj.sourceTower.kills++;
      if (proj.sourceTower.type === 'ali' && proj.sourceTower.kills % 10 === 0) {
        proj.sourceTower.berserkerTimer = 3;
      }
    }
  }

  // Garage pierce
  if (proj.pierce > 1 && proj.pierced < proj.pierce - 1) {
    proj.pierced++;
    for (var i = 0; i < state.balloons.length; i++) {
      var b = state.balloons[i];
      if (b === target) continue;
      var bpos = getPointAtDistance(b.dist);
      var dx = bpos.x - proj.x, dy = bpos.y - proj.y;
      if (dx*dx + dy*dy < 60*60) {
        proj.target = b;
        proj.tx = bpos.x; proj.ty = bpos.y;
        proj.life = 1;
        return;
      }
    }
  }
}
