// ═══════════════════════════════════════════════════════════════
// AGENT BTD — Wave Generation, Balloon Movement, Pop Logic
// ═══════════════════════════════════════════════════════════════
'use strict';

function generateWave(round) {
  var wave = [];
  var baseCount = 8 + round * 2;

  if (round <= 5) {
    for (var i = 0; i < baseCount; i++) {
      wave.push({ type: round <= 2 ? 'red' : (Math.random() < 0.6 ? 'red' : 'blue'), delay: i * 0.45 });
    }
  } else if (round <= 15) {
    var types1 = ['red','blue','green','yellow'];
    for (var i = 0; i < baseCount; i++) {
      var tier = Math.min(Math.floor(Math.random() * (1 + round * 0.2)), types1.length - 1);
      wave.push({ type: types1[tier], delay: i * 0.35 });
    }
  } else if (round <= 25) {
    var types2 = ['blue','green','yellow','pink','black','white'];
    for (var i = 0; i < baseCount; i++) {
      var tier = Math.min(Math.floor(Math.random() * (round * 0.15)), types2.length - 1);
      wave.push({ type: types2[tier], delay: i * 0.3 });
    }
  } else if (round <= 40) {
    var types3 = ['green','yellow','pink','black','white','rainbow','ceramic'];
    for (var i = 0; i < Math.floor(baseCount * 0.8); i++) {
      var tier = Math.min(Math.floor(Math.random() * (round * 0.12)), types3.length - 1);
      wave.push({ type: types3[tier], delay: i * 0.28 });
    }
  } else {
    var types4 = ['pink','black','white','rainbow','ceramic'];
    for (var i = 0; i < Math.floor(baseCount * 0.6); i++) {
      var tier = Math.min(Math.floor(Math.random() * types4.length), types4.length - 1);
      wave.push({ type: types4[tier], delay: i * 0.22 });
    }
    var moabCount = Math.floor((round - 40) / 5) + 1;
    for (var i = 0; i < moabCount; i++) {
      wave.push({ type: 'moab', delay: baseCount * 0.22 + i * 3 });
    }
    if (round >= 65) {
      var bfbCount = Math.floor((round - 65) / 10) + 1;
      for (var i = 0; i < bfbCount; i++) {
        wave.push({ type: 'bfb', delay: baseCount * 0.22 + moabCount * 3 + i * 5 });
      }
    }
  }

  if (round > 0 && round % 10 === 0) {
    var bossType = round >= 65 ? 'bfb' : 'moab';
    var bossCount = Math.floor(round / 20) + 1;
    var lastDelay = wave.length > 0 ? wave[wave.length - 1].delay + 2 : 0;
    for (var i = 0; i < bossCount; i++) {
      wave.push({ type: bossType, delay: lastDelay + i * 3 });
    }
  }

  return wave;
}

function startWave() {
  state.round++;
  state.waveActive = true;
  state.roundBalloons = generateWave(state.round);
  state.spawnTimer = 0;
  state.spawnIndex = 0;

  state.roundIncome = 0;
  for (var i = 0; i < state.towers.length; i++) {
    var t = state.towers[i];
    if (t.isFarm) {
      state.roundIncome += t.income;
    }
  }
  state.cash += state.roundIncome;
  if (state.roundIncome > 0) {
    playSound('cash');
  }

  var baseIncome = 100 + state.round;
  state.cash += baseIncome;
  state.roundIncome += baseIncome;

  playSound('roundstart');
  showWaveBanner('Round ' + state.round);

  if (state.roundBalloons.some(function(b) { return b.type === 'moab' || b.type === 'bfb'; })) {
    setTimeout(function() { playSound('moab'); }, 500);
  }

  document.getElementById('send-wave-btn').classList.add('hidden');
  updateHUD();
  updateWavePreview();
}

function spawnBalloon(type, dist) {
  state.balloons.push({
    type: type,
    dist: dist || (Math.random() * 5),
    hp: BLOON_COLORS[type].hp,
    slowTimer: 0,
    hitFlash: 0,
    id: Math.random(),
  });
}

function popBalloon(bloon) {
  var idx = state.balloons.indexOf(bloon);
  if (idx === -1) return;
  state.balloons.splice(idx, 1);

  var def = BLOON_COLORS[bloon.type];
  var pos = getPointAtDistance(bloon.dist);

  state.totalPops++;
  var cashEarned = def.cash || 1;
  state.cash += cashEarned;
  state.cashEarned += cashEarned;
  playPopSound(bloon.type);
  // Only show floating text for higher-value pops (reduces Text object churn)
  if (cashEarned >= 2 || def.isBlimp) {
    spawnFloatingText(pos.x, pos.y, '+$' + cashEarned, '#ffcc00');
  }

  state.comboCount++;
  state.comboTimer = 1.5;
  if (state.comboCount > state.bestCombo) state.bestCombo = state.comboCount;

  // Cap total particles to prevent GPU stall
  var pColor = def.color === 'rainbow' ? '#ff6600' : def.color;
  if (state.particles.length < 200) {
    var particleCount = def.isBlimp ? 16 : 6;
    spawnParticles(pos.x, pos.y, pColor, particleCount);

    // Air burst ring (reduced from 12 to 6)
    for (var ri = 0; ri < 6; ri++) {
      var angle = (ri / 6) * Math.PI * 2;
      var speed = 80 + Math.random() * 40;
      state.particles.push({
        x: pos.x, y: pos.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: '#ffffff', life: 0.2, maxLife: 0.2,
        size: 1.5, isRing: true,
      });
    }

    // Confetti for higher-tier pops
    if (def.rbe >= 5) {
      var confettiColors = ['#ff3366','#33ff66','#3366ff','#ffcc00'];
      for (var ci = 0; ci < 4; ci++) {
        var cAngle = Math.random() * Math.PI * 2;
        var cSpeed = 40 + Math.random() * 80;
        state.particles.push({
          x: pos.x, y: pos.y,
          vx: Math.cos(cAngle) * cSpeed,
          vy: Math.sin(cAngle) * cSpeed - 60,
          color: confettiColors[ci],
          life: 0.6 + Math.random() * 0.4, maxLife: 1.0,
          size: 1.5 + Math.random() * 2, isConfetti: true,
        });
      }
    }
  }

  // Screen shake for blimps
  if (def.isBlimp) {
    state.shakeDuration = 0.4;
    state.slowMoTimer = 0.5;
    state.slowMoFactor = 0.3;
    state.flashFrame = 2;
  }

  // Spawn children
  if (def.children) {
    for (var ci = 0; ci < def.children.length; ci++) {
      spawnBalloon(def.children[ci], bloon.dist + (Math.random() * 10 - 5));
    }
  }

  updateHUD();
}

function spawnParticles(x, y, color, count) {
  for (var i = 0; i < count; i++) {
    var angle = Math.random() * Math.PI * 2;
    var speed = 50 + Math.random() * 120;
    state.particles.push({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 40,
      color: color, life: 0.4 + Math.random() * 0.3,
      maxLife: 0.6, size: 2 + Math.random() * 3,
    });
  }
}
