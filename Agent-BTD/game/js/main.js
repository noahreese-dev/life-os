// ═══════════════════════════════════════════════════════════════
// AGENT BTD — Main Loop & Initialization
// ═══════════════════════════════════════════════════════════════
'use strict';

var lastTime = 0;

function update(dt) {
  // Slow-mo effect
  if (state.slowMoTimer > 0) {
    state.slowMoTimer -= dt;
    state.slowMoFactor = Math.min(1, state.slowMoFactor + dt * 2);
  } else {
    state.slowMoFactor = 1;
  }
  var speed = state.gameSpeed * state.slowMoFactor;
  var adt = dt * speed;
  state.gameTime += dt;
  if (state.flashFrame > 0) state.flashFrame--;

  // Screen shake decay
  if (state.shakeDuration > 0) {
    state.shakeDuration -= dt;
    state.shakeX = (Math.random() - 0.5) * 6 * (state.shakeDuration / 0.3);
    state.shakeY = (Math.random() - 0.5) * 6 * (state.shakeDuration / 0.3);
    if (state.shakeDuration <= 0) { state.shakeX = 0; state.shakeY = 0; }
  }

  // Wave banner timer
  if (state.waveBannerTimer > 0) {
    state.waveBannerTimer -= dt;
    if (state.waveBannerTimer <= 0) {
      document.getElementById('wave-banner').classList.remove('show');
    }
  }

  // Spawn balloons
  if (state.waveActive && state.spawnIndex < state.roundBalloons.length) {
    state.spawnTimer += adt;
    while (state.spawnIndex < state.roundBalloons.length) {
      var next = state.roundBalloons[state.spawnIndex];
      if (state.spawnTimer >= next.delay) {
        spawnBalloon(next.type, 0);
        state.spawnIndex++;
      } else {
        break;
      }
    }
  }

  // Update balloons
  for (var i = state.balloons.length - 1; i >= 0; i--) {
    var b = state.balloons[i];
    var bdef = BLOON_COLORS[b.type];
    var spd = bdef.speed * 60 * adt;
    if (b.slowTimer > 0) {
      spd *= 0.5;
      b.slowTimer -= adt;
    }
    b.dist += spd;
    if (b.hitFlash > 0) b.hitFlash -= dt * 3;

    if (b.dist >= totalPathLength) {
      var rbe = bdef.rbe || 1;
      state.lives -= rbe;
      state.balloons.splice(i, 1);
      if (state.lives <= 0) {
        state.lives = 0;
        gameOver();
      }
      updateHUD();
    }
  }

  // Tower targeting and firing
  for (var ti = 0; ti < state.towers.length; ti++) {
    var tower = state.towers[ti];
    if (tower.isFarm) continue;
    tower.cooldown -= adt;

    if (tower.fireScale > 1) {
      tower.fireScale = Math.max(1, tower.fireScale - dt * 3);
    }

    // Ability timers
    if (tower.berserkerTimer > 0) tower.berserkerTimer -= adt;
    if (tower.burstCooldown > 0) tower.burstCooldown -= adt;
    if (tower.burstTimer > 0) tower.burstTimer -= adt;
    if (tower.type === 'ultra' && tower.burstCooldown <= 0) {
      tower.burstTimer = 2; tower.burstCooldown = 10;
    }
    if (tower.type === 'health') {
      tower.regenTimer += adt;
      if (tower.regenTimer >= 30) { tower.regenTimer = 0; state.lives = Math.min(state.lives + 1, 100 + state.round); }
    }
    if (tower.type === 'cos') {
      for (var oi = 0; oi < state.towers.length; oi++) {
        var ot = state.towers[oi];
        if (ot === tower || ot.isFarm) continue;
        var dx = ot.x - tower.x, dy = ot.y - tower.y;
        if (Math.sqrt(dx*dx+dy*dy) < 100) ot._leaderBoosted = true;
      }
    }

    var effectiveRate = tower.rate;
    if (tower.type === 'ultra' && tower.burstTimer > 0) effectiveRate = tower.rate / 3;
    var isLeaderBoosted = !!tower._leaderBoosted;
    tower._leaderBoosted = false;

    if (tower.cooldown <= 0) {
      var target = null;
      var bestScore = tower.targetMode === 'last' ? Infinity : -1;
      var effectiveRange = tower.range * (isLeaderBoosted ? 1.15 : 1);
      for (var bi = 0; bi < state.balloons.length; bi++) {
        var b = state.balloons[bi];
        var pos = getPointAtDistance(b.dist);
        var dx = pos.x - tower.x, dy = pos.y - tower.y;
        var d = Math.sqrt(dx*dx + dy*dy);
        if (d > effectiveRange) continue;
        var score;
        switch(tower.targetMode) {
          case 'first': score = b.dist; if (score > bestScore) { bestScore = score; target = b; } break;
          case 'last': score = b.dist; if (score < bestScore) { bestScore = score; target = b; } break;
          case 'strong': score = BLOON_COLORS[b.type].rbe; if (score > bestScore) { bestScore = score; target = b; } break;
          case 'close': score = -d; if (score > bestScore) { bestScore = score; target = b; } break;
          default: score = b.dist; if (score > bestScore) { bestScore = score; target = b; }
        }
      }
      if (target) {
        var tpos = getPointAtDistance(target.dist);
        tower.targetAngle = Math.atan2(tpos.y - tower.y, tpos.x - tower.x);
        fireProjectile(tower, target, tpos);
        tower.cooldown = effectiveRate;
        tower.fireScale = 1.2;
        tower.rangePulse = 1;
        playSound('shoot');
      }
    }
  }

  // Update projectiles
  for (var i = state.projectiles.length - 1; i >= 0; i--) {
    var p = state.projectiles[i];
    var pspd = 500 * adt;
    var dx = p.tx - p.x, dy = p.ty - p.y;
    var d = Math.sqrt(dx*dx + dy*dy);

    p.trail.push({x: p.x, y: p.y});
    if (p.trail.length > 8) p.trail.shift();

    if (d < pspd + 5) {
      hitBalloon(p);
      state.projectiles.splice(i, 1);
    } else {
      p.x += (dx / d) * pspd;
      p.y += (dy / d) * pspd;
      if (p.target && state.balloons.includes(p.target)) {
        var newPos = getPointAtDistance(p.target.dist);
        p.tx = newPos.x;
        p.ty = newPos.y;
      }
      p.life -= adt;
      if (p.life <= 0) state.projectiles.splice(i, 1);
    }
  }

  // Update particles
  for (var i = state.particles.length - 1; i >= 0; i--) {
    var p = state.particles[i];
    p.x += p.vx * adt;
    p.y += p.vy * adt;
    p.vy += 200 * adt;
    p.life -= adt;
    if (p.life <= 0) state.particles.splice(i, 1);
  }

  // Update floating texts
  for (var i = state.floatingTexts.length - 1; i >= 0; i--) {
    var ft = state.floatingTexts[i];
    ft.y -= 40 * adt;
    ft.life -= adt;
    if (ft.life <= 0) state.floatingTexts.splice(i, 1);
  }

  // Combo timer
  if (state.comboTimer > 0) {
    state.comboTimer -= dt;
    if (state.comboTimer <= 0) {
      state.comboCount = 0;
      document.getElementById('combo-display').classList.remove('show');
    }
  }
  if (state.comboCount >= 5) {
    var comboEl = document.getElementById('combo-display');
    comboEl.textContent = 'COMBO x' + state.comboCount + '!';
    comboEl.className = '';
    if (state.comboCount >= 20) comboEl.className = 'show streak-mega';
    else if (state.comboCount >= 10) comboEl.className = 'show streak-super';
    else comboEl.className = 'show streak-fire';
  }

  // Music system
  if (musicSystem.isPlaying) {
    musicSystem.update(dt);
    var hasBoss = state.balloons.some(function(b) { return BLOON_COLORS[b.type].isBlimp; });
    if (state.waveActive && hasBoss) musicSystem.setMode('boss');
    else if (state.waveActive) musicSystem.setMode('battle');
    else musicSystem.setMode('calm');
  }

  // Update clouds
  for (var ci = 0; ci < state.clouds.length; ci++) {
    var cloud = state.clouds[ci];
    cloud.x += cloud.speed * dt;
    if (cloud.x > gameW + cloud.w) cloud.x = -cloud.w;
  }

  // Update ambient motes
  for (var mi = 0; mi < state.ambientMotes.length; mi++) {
    var mote = state.ambientMotes[mi];
    mote.x += Math.sin(state.gameTime * 0.5 + mote.phase) * 8 * dt;
    mote.y -= mote.drift * dt;
    if (mote.y < -10) { mote.y = gameH + 10; mote.x = Math.random() * gameW; }
  }

  // AI tick
  if (state.aiEnabled) aiTick(dt);

  // Tower pulse decay
  for (var ti = 0; ti < state.towers.length; ti++) {
    var tower = state.towers[ti];
    if (tower.rangePulse > 0) tower.rangePulse -= dt * 3;
  }

  // Check wave complete
  if (state.waveActive && state.spawnIndex >= state.roundBalloons.length && state.balloons.length === 0) {
    state.waveActive = false;
    state.autoSendTimer = 4;
    playWaveComplete();
    document.getElementById('send-wave-btn').classList.remove('hidden');
    saveGame();
    updateHUD();
  }

  // Auto-send
  if (state.autoSend && !state.waveActive && state.lives > 0) {
    state.autoSendTimer -= dt;
    if (state.autoSendTimer <= 0) {
      startWave();
    }
  }
}

function gameLoop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  var dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;
  if (dt > 0.15) dt = 0.15; // Relaxed cap for GPU rendering overhead

  update(dt);
  pixiRender();
  updateClock();

  requestAnimationFrame(gameLoop);
}

// ── Input Handling ─────────────────────────────────────────────
function handleCanvasClick(e) {
  initAudio();
  var rect = pixiApp.canvas.getBoundingClientRect();
  var cx = e.clientX - rect.left;
  var cy = e.clientY - rect.top;
  var gx = (cx - pixiOffsetX) / pixiScaleFactor;
  var gy = (cy - pixiOffsetY) / pixiScaleFactor;

  if (state.teleporting) {
    if (canPlaceTower(gx, gy)) {
      state.teleporting.x = gx;
      state.teleporting.y = gy;
      spawnFloatingText(gx, gy, 'TELEPORTED!', '#33aaff');
      playSound('place');
      state.teleporting = null;
      return;
    }
    state.teleporting = null;
    return;
  }

  if (state.placingTower) {
    placeTower(gx, gy);
    return;
  }

  var clickedTower = null;
  for (var i = 0; i < state.towers.length; i++) {
    var t = state.towers[i];
    var dx = gx - t.x, dy = gy - t.y;
    if (dx*dx + dy*dy < 22*22) {
      clickedTower = t;
      break;
    }
  }

  if (clickedTower) {
    showTowerDetail(clickedTower);
  } else {
    hideTowerDetail();
  }
}

function handleCanvasMove(e) {
  var rect = pixiApp.canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
}

function handleKeyDown(e) {
  initAudio();
  switch(e.key) {
    case ' ':
      e.preventDefault();
      if (!state.waveActive && state.lives > 0) startWave();
      break;
    case '1': setSpeed(1); break;
    case '2': setSpeed(2); break;
    case '3': setSpeed(3); break;
    case 'Escape':
      state.placingTower = null;
      hideTowerDetail();
      updateShopCards();
      break;
  }
}

// ── Init ───────────────────────────────────────────────────────
async function init() {
  var canvas = document.getElementById('game-canvas');

  // Generate smooth path
  pathPoints = catmullRom(RAW_WAYPOINTS, 16);
  computePathDistances();

  // Initialize clouds
  for (var ci = 0; ci < 5; ci++) {
    state.clouds.push({
      x: Math.random() * gameW,
      y: 15 + Math.random() * 70,
      w: 90 + Math.random() * 80,
      h: 25 + Math.random() * 20,
      speed: 5 + Math.random() * 8,
      a: 0.12 + Math.random() * 0.08,
    });
  }

  // Initialize ambient motes
  for (var mi = 0; mi < 50; mi++) {
    state.ambientMotes.push({
      x: Math.random() * gameW,
      y: Math.random() * gameH,
      r: 1 + Math.random() * 3,
      a: 0.3 + Math.random() * 0.4,
      drift: 3 + Math.random() * 5,
      phase: Math.random() * Math.PI * 2,
      color: ['#ffffaa','#ffdd66','#aaffaa','#ddffcc','#ffccff','#aaddff'][Math.floor(Math.random() * 6)],
    });
  }

  // Initialize PixiJS renderer
  await initPixiRenderer(canvas);

  // Build UI
  buildShopPanel();
  resizePixi();

  // Load saved game
  loadGame();
  updateHUD();

  // Event listeners
  pixiApp.canvas.addEventListener('click', handleCanvasClick);
  pixiApp.canvas.addEventListener('mousemove', handleCanvasMove);
  document.addEventListener('keydown', handleKeyDown);
  window.addEventListener('resize', resizePixi);

  document.getElementById('send-wave-btn').addEventListener('click', function() {
    initAudio();
    if (!state.waveActive && state.lives > 0) startWave();
  });

  document.querySelectorAll('.speed-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      initAudio();
      setSpeed(parseInt(btn.dataset.speed));
    });
  });

  document.getElementById('auto-btn').addEventListener('click', function() {
    initAudio();
    state.autoSend = !state.autoSend;
    state.aiEnabled = state.autoSend;
    var aiEl = document.getElementById('ai-indicator');
    if (state.autoSend) {
      this.classList.add('active');
      aiEl.classList.remove('inactive');
      aiEl.textContent = 'AI: Active \u2014 analyzing...';
    } else {
      this.classList.remove('active');
      aiEl.classList.add('inactive');
      aiEl.textContent = 'AI: OFF';
    }
  });

  document.getElementById('upgrade-btn').addEventListener('click', function() {
    if (state.selectedTower) upgradeTower(state.selectedTower);
  });

  document.getElementById('sell-btn').addEventListener('click', function() {
    if (state.selectedTower) sellTower(state.selectedTower);
  });

  document.getElementById('welcome-close').addEventListener('click', function() {
    document.getElementById('welcome-banner').style.display = 'none';
  });

  document.getElementById('music-btn').addEventListener('click', function() {
    initAudio();
    if (!musicSystem.isPlaying) {
      musicSystem.start();
      this.classList.add('active');
      this.textContent = '\u266A ON';
    } else {
      musicSystem.toggleMute();
      this.textContent = musicSystem.isMuted ? '\u266A OFF' : '\u266A ON';
    }
  });

  document.getElementById('go-retry').addEventListener('click', function() {
    initAudio();
    resetGame();
  });

  // Right-click targeting
  pixiApp.canvas.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    var rect = pixiApp.canvas.getBoundingClientRect();
    var gx = (e.clientX - rect.left - pixiOffsetX) / pixiScaleFactor;
    var gy = (e.clientY - rect.top - pixiOffsetY) / pixiScaleFactor;
    var clickedTower = null;
    for (var i = 0; i < state.towers.length; i++) {
      var t = state.towers[i];
      var dx = gx - t.x, dy = gy - t.y;
      if (dx*dx + dy*dy < 22*22) { clickedTower = t; break; }
    }
    if (clickedTower && !clickedTower.isFarm) {
      var popup = document.getElementById('targeting-popup');
      popup.style.display = 'block';
      popup.style.left = e.clientX + 'px';
      popup.style.top = e.clientY + 'px';
      popup._tower = clickedTower;
      popup.querySelectorAll('.target-opt').forEach(function(opt) {
        opt.classList.toggle('active', opt.dataset.mode === clickedTower.targetMode);
      });
    }
  });

  document.querySelectorAll('.target-opt').forEach(function(opt) {
    opt.addEventListener('click', function() {
      var popup = document.getElementById('targeting-popup');
      if (popup._tower) {
        popup._tower.targetMode = opt.dataset.mode;
        if (state.selectedTower === popup._tower) showTowerDetail(popup._tower);
      }
      popup.style.display = 'none';
    });
  });

  document.addEventListener('click', function() {
    document.getElementById('targeting-popup').style.display = 'none';
  });

  // Clone agent
  document.getElementById('clone-btn').addEventListener('click', function() {
    if (!state.selectedTower) return;
    var t = state.selectedTower;
    var offsets = [{x:40,y:0},{x:-40,y:0},{x:0,y:40},{x:0,y:-40},{x:30,y:30},{x:-30,y:-30}];
    for (var oi = 0; oi < offsets.length; oi++) {
      var off = offsets[oi];
      var cx = t.x + off.x, cy = t.y + off.y;
      if (canPlaceTower(cx, cy)) {
        state.placingTower = t.type;
        placeTower(cx, cy);
        var clone = state.towers[state.towers.length - 1];
        clone.level = Math.max(0, t.level - 1);
        clone.targetMode = t.targetMode;
        spawnFloatingText(cx, cy, 'CLONED!', '#ff8800');
        playSound('cash');
        break;
      }
    }
  });

  // Teleport agent
  document.getElementById('teleport-btn').addEventListener('click', function() {
    if (!state.selectedTower) return;
    state.teleporting = state.selectedTower;
    state.placingTower = null;
    spawnFloatingText(state.selectedTower.x, state.selectedTower.y, 'SELECT NEW POSITION', '#33aaff');
  });

  // Expose game state for Playwright testing
  window.__AGENT_BTD__ = {
    getState: function() { return state; },
    startWave: startWave,
    enableAI: function() {
      state.autoSend = true;
      state.aiEnabled = true;
      document.getElementById('auto-btn').classList.add('active');
      document.getElementById('ai-indicator').classList.remove('inactive');
      document.getElementById('ai-indicator').textContent = 'AI: Active';
    },
    placeTowerAt: function(key, x, y) {
      state.placingTower = key;
      placeTower(x, y);
    },
  };

  // Start game loop
  requestAnimationFrame(gameLoop);
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() { init(); });
} else {
  init();
}
