// ═══════════════════════════════════════════════════════════════
// AGENT BTD — PixiJS 8 GPU-Accelerated Renderer
// ═══════════════════════════════════════════════════════════════
'use strict';

var pixiApp = null;
var pixiStage = null;

// Layer containers (z-ordered)
var bgContainer = null;
var envContainer = null;
var pathWearContainer = null;
var placementContainer = null;
var towerContainer = null;
var balloonContainer = null;
var projContainer = null;
var effectContainer = null;
var textContainer = null;

// Tower sprite cache: type+level → RenderTexture
var towerTextureCache = {};

// Balloon texture cache: type → RenderTexture (pre-rendered once)
var balloonTextureCache = {};

// Sprite pools for reuse
var towerSprites = new Map();   // tower obj → PIXI.Container
var balloonSprites = new Map(); // bloon obj → PIXI.Container
var projSprites = new Map();    // proj obj → PIXI.Container

// Placement preview persistent objects
var placementRangeG = null;
var placementGhost = null;
var placementLastType = null;

// Water shimmer frame throttle
var waterFrameCounter = 0;

// Minimap (still Canvas 2D — separate small canvas)
var minimapCtx = null;

// ── Canvas 2D fallback for tower previews ──────────────────────
// Used in shop panel (tiny 44x44 previews — not worth PixiJS overhead)
function drawMonkeyCanvas2D(c, def, size, targetAngle, upgradeLevel) {
  var r = size * 0.48;
  var earR = r * 0.5;
  var faceR = r * 0.65;
  var eyeR = r * 0.18;
  var pupilR = r * 0.09;
  var OL = Math.max(1.5, r * 0.08);

  // Shadow
  c.fillStyle = 'rgba(0,0,0,0.3)';
  c.beginPath();
  c.ellipse(2, r + r * 0.5, r * 1.1, r * 0.25, 0, 0, Math.PI * 2);
  c.fill();

  // Body
  c.fillStyle = def.fur;
  c.strokeStyle = '#1a1a1a'; c.lineWidth = OL;
  var bodyW = r * 1.0, bodyH = r * 0.8;
  c.beginPath();
  c.moveTo(-bodyW/2 + 6, r * 0.2);
  c.lineTo(bodyW/2 - 6, r * 0.2);
  c.quadraticCurveTo(bodyW/2, r * 0.2, bodyW/2, r * 0.2 + 6);
  c.lineTo(bodyW/2, r * 0.2 + bodyH - 6);
  c.quadraticCurveTo(bodyW/2, r * 0.2 + bodyH, bodyW/2 - 6, r * 0.2 + bodyH);
  c.lineTo(-bodyW/2 + 6, r * 0.2 + bodyH);
  c.quadraticCurveTo(-bodyW/2, r * 0.2 + bodyH, -bodyW/2, r * 0.2 + bodyH - 6);
  c.lineTo(-bodyW/2, r * 0.2 + 6);
  c.quadraticCurveTo(-bodyW/2, r * 0.2, -bodyW/2 + 6, r * 0.2);
  c.closePath();
  c.fill(); c.stroke();

  // Head
  c.fillStyle = def.fur;
  c.beginPath(); c.arc(0, -r * 0.1, r, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#1a1a1a'; c.lineWidth = OL;
  c.beginPath(); c.arc(0, -r * 0.1, r, 0, Math.PI * 2); c.stroke();

  // Ears
  c.fillStyle = def.fur;
  c.beginPath(); c.arc(-r * 0.88, -r * 0.15, earR, 0, Math.PI * 2); c.fill(); c.stroke();
  c.beginPath(); c.arc(r * 0.88, -r * 0.15, earR, 0, Math.PI * 2); c.fill(); c.stroke();
  c.fillStyle = def.face;
  c.beginPath(); c.arc(-r * 0.88, -r * 0.15, earR * 0.6, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.arc(r * 0.88, -r * 0.15, earR * 0.6, 0, Math.PI * 2); c.fill();

  // Face
  c.fillStyle = def.face;
  c.beginPath(); c.arc(0, r * 0.05, faceR, 0, Math.PI * 2); c.fill();

  // Eyes
  var eyeOffX = r * 0.32;
  var eyeY = -r * 0.2;
  c.fillStyle = '#fff';
  c.beginPath(); c.arc(-eyeOffX, eyeY, eyeR * 1.2, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.arc(eyeOffX, eyeY, eyeR * 1.2, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#111';
  c.beginPath(); c.arc(-eyeOffX, eyeY, pupilR * 1.3, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.arc(eyeOffX, eyeY, pupilR * 1.3, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#fff';
  c.beginPath(); c.arc(-eyeOffX - pupilR * 0.3, eyeY - pupilR * 0.4, pupilR * 0.55, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.arc(eyeOffX - pupilR * 0.3, eyeY - pupilR * 0.4, pupilR * 0.55, 0, Math.PI * 2); c.fill();

  // Nose
  c.fillStyle = darkenColor(def.face, 30);
  c.beginPath(); c.ellipse(0, r * 0.12, r * 0.14, r * 0.09, 0, 0, Math.PI * 2); c.fill();
}

// ── PixiJS Initialization ──────────────────────────────────────
async function initPixiRenderer(canvasEl) {
  pixiApp = new PIXI.Application();
  await pixiApp.init({
    canvas: canvasEl,
    width: gameW,
    height: gameH,
    backgroundColor: 0x1a1a2e,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    preference: 'webgl',
  });

  // Disable PixiJS auto-render — we control the render loop
  pixiApp.ticker.stop();

  pixiStage = pixiApp.stage;
  pixiStage.sortableChildren = true;

  // Create layer containers
  bgContainer = new PIXI.Container();
  bgContainer.zIndex = 0;
  envContainer = new PIXI.Container();
  envContainer.zIndex = 1;
  pathWearContainer = new PIXI.Container();
  pathWearContainer.zIndex = 2;
  placementContainer = new PIXI.Container();
  placementContainer.zIndex = 3;
  towerContainer = new PIXI.Container();
  towerContainer.zIndex = 4;
  towerContainer.sortableChildren = true;
  balloonContainer = new PIXI.Container();
  balloonContainer.zIndex = 5;
  balloonContainer.sortableChildren = true;
  projContainer = new PIXI.Container();
  projContainer.zIndex = 6;
  effectContainer = new PIXI.Container();
  effectContainer.zIndex = 7;
  textContainer = new PIXI.Container();
  textContainer.zIndex = 8;

  pixiStage.addChild(bgContainer, envContainer, pathWearContainer,
    placementContainer, towerContainer, balloonContainer,
    projContainer, effectContainer, textContainer);

  // Render static background
  renderPixiBackground();

  // Init environment animations (clouds, motes)
  initEnvironment();

  // Path wear (animated)
  renderPathWear();

  // Setup minimap (still Canvas 2D)
  var mc = document.getElementById('minimap');
  if (mc) minimapCtx = mc.getContext('2d');
}

// ── Background (static — rendered once) ────────────────────────
function renderPixiBackground() {
  var g = new PIXI.Graphics();

  // Grass gradient (5 horizontal bands for smooth gradient)
  var grassColors = [0x5fa83e, 0x559c38, 0x4c9030, 0x438428, 0x3a7420];
  var bandH = gameH / grassColors.length;
  for (var gi = 0; gi < grassColors.length; gi++) {
    g.rect(0, gi * bandH, gameW, bandH + 1);
    g.fill(grassColors[gi]);
  }

  // Grass blades
  for (var i = 0; i < 400; i++) {
    var gx = Math.random() * gameW;
    var gy = Math.random() * gameH;
    var gh = 6 + Math.random() * 12;
    var angle = -0.3 + Math.random() * 0.6;
    var greens = [0x3d7a22, 0x4d8a2a, 0x5a9c35, 0x6aac40, 0x3a7020];
    g.moveTo(gx, gy);
    g.quadraticCurveTo(gx + angle * gh, gy - gh * 0.6, gx + angle * gh * 1.5, gy - gh);
    g.stroke({ width: 1 + Math.random(), color: greens[Math.floor(Math.random() * 5)] });
  }

  // Bush positions
  var bushPositions = [
    {x:80,y:380},{x:850,y:150},{x:1100,y:750},{x:1350,y:180},
    {x:500,y:280},{x:150,y:750},{x:950,y:480},{x:1250,y:650},
  ];
  for (var bi = 0; bi < bushPositions.length; bi++) {
    var b = bushPositions[bi];
    if (isOnPath(b.x, b.y, PATH_W + 30)) continue;
    g.circle(b.x, b.y, 18);
    g.fill(0x2d6018);
    g.circle(b.x + 12, b.y + 4, 14);
    g.fill(0x3d8028);
    g.circle(b.x - 10, b.y + 6, 12);
    g.fill(0x2d6018);
  }

  // Water pond
  var pondX = 1050, pondY = 180;
  if (!isOnPath(pondX, pondY, PATH_W + 40)) {
    g.ellipse(pondX, pondY, 40, 30);
    g.fill(0x3388aa);
    g.ellipse(pondX - 10, pondY - 8, 12, 6);
    g.fill({ color: 0xffffff, alpha: 0.25 });
  }

  // Wildflowers
  var flowerHexes = [0xff6688, 0xffaa44, 0xff44aa, 0x44aaff, 0xffff55, 0xff5555, 0xaa66ff];
  for (var fi = 0; fi < 100; fi++) {
    var fx = Math.random() * gameW, fy = Math.random() * gameH;
    if (isOnPath(fx, fy, PATH_W + 20)) continue;
    var fc = flowerHexes[Math.floor(Math.random() * flowerHexes.length)];
    var fr = 1.5 + Math.random() * 2;
    g.circle(fx, fy, fr);
    g.fill(fc);
  }

  // Rocks
  var rockPositions = [
    {x:200,y:320,s:1.2},{x:750,y:250,s:0.8},{x:1300,y:400,s:1.0},
    {x:400,y:650,s:0.7},{x:900,y:550,s:1.1},{x:1150,y:300,s:0.6},
    {x:550,y:150,s:0.9},{x:1400,y:700,s:1.0},
  ];
  for (var ri = 0; ri < rockPositions.length; ri++) {
    var rk = rockPositions[ri];
    if (isOnPath(rk.x, rk.y, PATH_W + 20)) continue;
    var rs = rk.s;
    g.ellipse(rk.x, rk.y - 1, 9 * rs, 5 * rs);
    g.fill(0x7a7a6a);
    g.ellipse(rk.x - 2, rk.y - 3, 4 * rs, 2 * rs);
    g.fill({ color: 0xffffff, alpha: 0.12 });
  }

  // Trees
  var treePositions = [
    {x:60,y:100},{x:1400,y:100},{x:1500,y:500},
    {x:80,y:600},{x:700,y:80},{x:1100,y:850},
  ];
  for (var ti = 0; ti < treePositions.length; ti++) {
    var tr = treePositions[ti];
    if (isOnPath(tr.x, tr.y, PATH_W + 40)) continue;
    g.rect(tr.x - 3, tr.y - 5, 6, 20);
    g.fill(0x5a4020);
    g.circle(tr.x, tr.y - 16, 13);
    g.fill(0x2d6018);
    g.circle(tr.x - 5, tr.y - 12, 11);
    g.fill(0x3a7822);
    g.circle(tr.x + 5, tr.y - 20, 10);
    g.fill(0x4d9030);
  }

  // Path — stone path with outlines
  // Outer dark border
  g.moveTo(pathPoints[0].x, pathPoints[0].y);
  for (var pi = 1; pi < pathPoints.length; pi++) {
    g.lineTo(pathPoints[pi].x, pathPoints[pi].y);
  }
  g.stroke({ width: PATH_W + 14, color: 0x3a3225, cap: 'round', join: 'round' });

  // Stone edge
  g.moveTo(pathPoints[0].x, pathPoints[0].y);
  for (var pi = 1; pi < pathPoints.length; pi++) {
    g.lineTo(pathPoints[pi].x, pathPoints[pi].y);
  }
  g.stroke({ width: PATH_W + 6, color: 0x6a5a48, cap: 'round', join: 'round' });

  // Main path surface
  g.moveTo(pathPoints[0].x, pathPoints[0].y);
  for (var pi = 1; pi < pathPoints.length; pi++) {
    g.lineTo(pathPoints[pi].x, pathPoints[pi].y);
  }
  g.stroke({ width: PATH_W, color: 0xb89e78, cap: 'round', join: 'round' });

  // Light center highlight
  g.moveTo(pathPoints[0].x, pathPoints[0].y);
  for (var pi = 1; pi < pathPoints.length; pi++) {
    g.lineTo(pathPoints[pi].x, pathPoints[pi].y);
  }
  g.stroke({ width: PATH_W * 0.35, color: 0xdcc8aa, alpha: 0.35, cap: 'round', join: 'round' });

  // Cobblestone dots
  for (var ci = 0; ci < pathPoints.length; ci += 8) {
    var pp = pathPoints[ci];
    for (var cj = 0; cj < 3; cj++) {
      var cx = pp.x + (Math.random() - 0.5) * PATH_W * 0.7;
      var cy = pp.y + (Math.random() - 0.5) * PATH_W * 0.7;
      g.circle(cx, cy, 1.5 + Math.random() * 2);
      g.fill({ color: 0x826e50, alpha: 0.15 + Math.random() * 0.1 });
    }
  }

  // Edge grass along path
  for (var ei = 0; ei < pathPoints.length; ei += 6) {
    var pp = pathPoints[ei];
    var nextP = pathPoints[Math.min(ei + 1, pathPoints.length - 1)];
    var dx = nextP.x - pp.x, dy = nextP.y - pp.y;
    var len = Math.sqrt(dx*dx + dy*dy) || 1;
    var nx = -dy / len, ny = dx / len;
    for (var side = -1; side <= 1; side += 2) {
      var gx = pp.x + nx * (PATH_W * 0.52 + 2) * side;
      var gy = pp.y + ny * (PATH_W * 0.52 + 2) * side;
      var gh = 5 + Math.random() * 8;
      var ga = (Math.random() - 0.5) * 0.4 + (side * 0.2);
      var grassColors = [0x3d7a22, 0x4d8a2a, 0x5a9c35];
      g.moveTo(gx, gy);
      g.quadraticCurveTo(gx + ga * gh, gy - gh * 0.6, gx + ga * gh * 1.5, gy - gh);
      g.stroke({ width: 1, color: grassColors[Math.floor(Math.random() * 3)] });
    }
  }

  // Zone labels
  for (var zi = 0; zi < ZONE_LABELS.length; zi++) {
    var zl = ZONE_LABELS[zi];
    var dist = zl.pathPct * totalPathLength;
    var pt = getPointAtDistance(dist);
    var label = new PIXI.Text({
      text: zl.text,
      style: { fontSize: 11, fontFamily: 'Segoe UI, sans-serif', fill: 0xffffff, alpha: 0.18 }
    });
    label.anchor.set(0.5, 1);
    label.position.set(pt.x, pt.y - PATH_W * 0.5 - 8);
    label.alpha = 0.18;
    bgContainer.addChild(label);
  }

  // Vignette (dark edges)
  var vigG = new PIXI.Graphics();
  vigG.rect(0, 0, gameW, gameH);
  vigG.fill({ color: 0x000000, alpha: 0.12 });
  // Brighter center cutout
  vigG.ellipse(gameW / 2, gameH / 2, gameW * 0.4, gameH * 0.45);
  vigG.cut();

  bgContainer.addChild(g, vigG);
}

function renderPathWear() {
  var g = new PIXI.Graphics();
  g.moveTo(pathPoints[0].x, pathPoints[0].y);
  for (var i = 1; i < pathPoints.length; i++) {
    g.lineTo(pathPoints[i].x, pathPoints[i].y);
  }
  g.stroke({ width: PATH_W * 0.25, color: 0x503c28, alpha: 0.15, cap: 'round', join: 'round' });
  pathWearContainer.addChild(g);
}

// ── Environment Animations ─────────────────────────────────────
var cloudSprites = [];
var moteSprites = [];
var waterGraphics = null;

function initEnvironment() {
  // Clouds
  for (var ci = 0; ci < 5; ci++) {
    var cloud = state.clouds[ci];
    if (!cloud) continue;
    var cg = new PIXI.Graphics();
    cg.ellipse(0, 0, cloud.w, cloud.h);
    cg.fill(0xffffff);
    cg.ellipse(-cloud.w * 0.5, 4, cloud.w * 0.55, cloud.h * 0.75);
    cg.fill(0xffffff);
    cg.ellipse(cloud.w * 0.45, 3, cloud.w * 0.5, cloud.h * 0.7);
    cg.fill(0xffffff);
    cg.ellipse(cloud.w * 0.1, -cloud.h * 0.4, cloud.w * 0.4, cloud.h * 0.5);
    cg.fill(0xffffff);
    cg.position.set(cloud.x, cloud.y);
    cg.alpha = cloud.a;
    envContainer.addChild(cg);
    cloudSprites.push(cg);
  }

  // Ambient motes
  for (var mi = 0; mi < state.ambientMotes.length; mi++) {
    var mote = state.ambientMotes[mi];
    var mg = new PIXI.Graphics();
    mg.circle(0, 0, mote.r);
    mg.fill(hexToNum(mote.color));
    mg.position.set(mote.x, mote.y);
    mg.alpha = mote.a;
    envContainer.addChild(mg);
    moteSprites.push(mg);
  }

  // Water shimmer (animated)
  waterGraphics = new PIXI.Graphics();
  envContainer.addChild(waterGraphics);
}

function updateEnvironment() {
  // Clouds
  for (var ci = 0; ci < cloudSprites.length; ci++) {
    var cloud = state.clouds[ci];
    if (!cloud) continue;
    cloudSprites[ci].position.set(cloud.x, cloud.y);
  }

  // Motes
  for (var mi = 0; mi < moteSprites.length; mi++) {
    var mote = state.ambientMotes[mi];
    if (!mote) continue;
    moteSprites[mi].position.set(mote.x, mote.y);
    moteSprites[mi].alpha = mote.a * (0.5 + Math.sin(state.gameTime * 2 + mote.phase) * 0.5);
  }

  // Water shimmer — only redraw every 4 frames to reduce GPU work
  waterFrameCounter++;
  if (waterGraphics && !isOnPath(1050, 180, PATH_W + 40) && (waterFrameCounter % 4 === 0)) {
    waterGraphics.clear();
    for (var sw = 0; sw < 8; sw++) {
      var sx = 1050 + Math.cos(state.gameTime * 1.2 + sw * 0.7) * 30 * Math.sin(sw * 0.5);
      var sy = 180 + Math.sin(state.gameTime * 1.8 + sw * 0.9) * 18;
      var shimmerAlpha = 0.2 + Math.sin(state.gameTime * 3.5 + sw * 1.3) * 0.15;
      waterGraphics.ellipse(sx, sy, 6 + Math.sin(state.gameTime * 1.5 + sw) * 3, 2.5);
      waterGraphics.fill({ color: 0x96dcff, alpha: shimmerAlpha });
    }
    for (var ri = 0; ri < 3; ri++) {
      var ringPhase = (state.gameTime * 0.8 + ri * 2.1) % 3;
      var ringR = ringPhase * 15;
      var ringAlpha = Math.max(0, 0.25 - ringPhase * 0.08);
      waterGraphics.ellipse(1050 + ri * 8, 180 + ri * 4, ringR + 5, ringR * 0.6 + 3);
      waterGraphics.stroke({ width: 1, color: 0xc8f0ff, alpha: ringAlpha });
    }
  }
}

// ── Tower Rendering ────────────────────────────────────────────
function drawMonkeyPixi(def, size, upgradeLevel) {
  var g = new PIXI.Graphics();
  var r = size * 0.48;
  var earR = r * 0.5;
  var faceR = r * 0.65;
  var eyeR = r * 0.18;
  var pupilR = r * 0.09;
  var OL = Math.max(1.5, r * 0.08);

  // Drop shadow
  g.ellipse(3, r + r * 0.6, r * 1.3, r * 0.3);
  g.fill({ color: 0x000000, alpha: 0.3 });

  // Base platform
  g.ellipse(0, r + r * 0.35, r * 1.1, r * 0.3);
  g.fill({ color: 0x8c8c8c, alpha: 0.35 });
  g.ellipse(0, r + r * 0.35, r * 1.1, r * 0.3);
  g.stroke({ width: 1, color: 0x000000, alpha: 0.15 });

  // Body
  g.roundRect(-r * 0.5, r * 0.2, r * 1.0, r * 0.8, 6);
  g.fill(hexToNum(def.fur));
  g.roundRect(-r * 0.5, r * 0.2, r * 1.0, r * 0.8, 6);
  g.stroke({ width: OL, color: 0x1a1a1a });

  // Arms
  g.ellipse(-r * 0.65, r * 0.5, r * 0.2, r * 0.35);
  g.fill(hexToNum(def.fur));
  g.ellipse(-r * 0.65, r * 0.5, r * 0.2, r * 0.35);
  g.stroke({ width: OL * 0.8, color: 0x1a1a1a });
  g.ellipse(r * 0.65, r * 0.5, r * 0.2, r * 0.35);
  g.fill(hexToNum(def.fur));
  g.ellipse(r * 0.65, r * 0.5, r * 0.2, r * 0.35);
  g.stroke({ width: OL * 0.8, color: 0x1a1a1a });

  // Head
  g.circle(0, -r * 0.1, r);
  g.fill(hexToNum(def.fur));
  g.circle(0, -r * 0.1, r);
  g.stroke({ width: OL, color: 0x1a1a1a });

  // Ears + inner ears
  g.circle(-r * 0.88, -r * 0.15, earR);
  g.fill(hexToNum(def.fur));
  g.circle(-r * 0.88, -r * 0.15, earR);
  g.stroke({ width: OL * 0.8, color: 0x1a1a1a });
  g.circle(r * 0.88, -r * 0.15, earR);
  g.fill(hexToNum(def.fur));
  g.circle(r * 0.88, -r * 0.15, earR);
  g.stroke({ width: OL * 0.8, color: 0x1a1a1a });
  g.circle(-r * 0.88, -r * 0.15, earR * 0.6);
  g.fill(hexToNum(def.face));
  g.circle(r * 0.88, -r * 0.15, earR * 0.6);
  g.fill(hexToNum(def.face));

  // Face patch
  g.circle(0, r * 0.05, faceR);
  g.fill(hexToNum(def.face));

  // Eyes — white
  g.circle(-r * 0.32, -r * 0.2, eyeR * 1.2);
  g.fill(0xffffff);
  g.circle(-r * 0.32, -r * 0.2, eyeR * 1.2);
  g.stroke({ width: OL * 0.6, color: 0x1a1a1a });
  g.circle(r * 0.32, -r * 0.2, eyeR * 1.2);
  g.fill(0xffffff);
  g.circle(r * 0.32, -r * 0.2, eyeR * 1.2);
  g.stroke({ width: OL * 0.6, color: 0x1a1a1a });

  // Pupils
  g.circle(-r * 0.32, -r * 0.2, pupilR * 1.3);
  g.fill(0x111111);
  g.circle(r * 0.32, -r * 0.2, pupilR * 1.3);
  g.fill(0x111111);

  // Eye highlights
  g.circle(-r * 0.32 - pupilR * 0.3, -r * 0.2 - pupilR * 0.4, pupilR * 0.55);
  g.fill(0xffffff);
  g.circle(r * 0.32 - pupilR * 0.3, -r * 0.2 - pupilR * 0.4, pupilR * 0.55);
  g.fill(0xffffff);

  // Nose
  g.ellipse(0, r * 0.12, r * 0.14, r * 0.09);
  g.fill(hexToNum(darkenColor(def.face, 30)));
  g.ellipse(0, r * 0.12, r * 0.14, r * 0.09);
  g.stroke({ width: OL * 0.4, color: 0x1a1a1a });

  // Mouth
  g.arc(0, r * 0.2, r * 0.15, 0.2, Math.PI - 0.2);
  g.stroke({ width: 1, color: hexToNum(darkenColor(def.face, 50)) });

  // Accessory
  drawAccessoryPixi(g, def.acc, r);

  // Upgrade stars
  if (upgradeLevel && upgradeLevel > 0) {
    var starY = r + r * 0.6;
    for (var si = 0; si < upgradeLevel; si++) {
      var starX = (si - (upgradeLevel - 1) / 2) * 7;
      drawStarPixi(g, starX, starY, 3, 5, 0xFFD700);
    }
  }

  return g;
}

function drawAccessoryPixi(g, acc, r) {
  switch(acc) {
    case 'crown':
      g.moveTo(-r*0.5, -r*0.85);
      g.lineTo(-r*0.6, -r*1.3); g.lineTo(-r*0.25, -r*1.1);
      g.lineTo(0, -r*1.4); g.lineTo(r*0.25, -r*1.1);
      g.lineTo(r*0.6, -r*1.3); g.lineTo(r*0.5, -r*0.85);
      g.closePath();
      g.fill(0xFFD700);
      g.circle(0, -r*1.05, r*0.08);
      g.fill(0xcc2222);
      break;
    case 'headset':
      g.arc(0, -r*0.3, r*0.85, -2.6, -0.5);
      g.stroke({ width: 2.5, color: 0x4488ff });
      g.circle(-r*0.7, r*0.3, r*0.15);
      g.fill(0x4488ff);
      break;
    case 'glasses':
      g.circle(-r*0.3, -r*0.2, r*0.22);
      g.stroke({ width: 1.5, color: 0x555555 });
      g.circle(r*0.3, -r*0.2, r*0.22);
      g.stroke({ width: 1.5, color: 0x555555 });
      g.moveTo(-r*0.08, -r*0.2); g.lineTo(r*0.08, -r*0.2);
      g.stroke({ width: 1.5, color: 0x555555 });
      break;
    case 'headband':
      g.rect(-r*0.9, -r*0.55, r*1.8, r*0.2);
      g.fill(0xcc2222);
      g.moveTo(r*0.9, -r*0.55);
      g.quadraticCurveTo(r*1.3, -r*0.3, r*1.1, -r*0.1);
      g.stroke({ width: 2, color: 0xcc2222 });
      break;
    case 'wrap':
      g.arc(0, -r*0.3, r*0.95, -2.8, -0.35, false);
      g.lineTo(r*0.5, -r*0.6);
      g.arc(0, -r*0.3, r*0.7, -0.35, -2.8, true);
      g.closePath();
      g.fill(0x2d8c4e);
      break;
    case 'goggles':
      g.ellipse(-r*0.3, -r*0.65, r*0.22, r*0.15);
      g.fill(0xff6600);
      g.ellipse(r*0.3, -r*0.65, r*0.22, r*0.15);
      g.fill(0xff6600);
      g.ellipse(-r*0.3, -r*0.65, r*0.16, r*0.1);
      g.fill({ color: 0xffc864, alpha: 0.4 });
      g.ellipse(r*0.3, -r*0.65, r*0.16, r*0.1);
      g.fill({ color: 0xffc864, alpha: 0.4 });
      g.moveTo(-r*0.08, -r*0.65); g.lineTo(r*0.08, -r*0.65);
      g.stroke({ width: 2, color: 0xff6600 });
      break;
    case 'hardhat':
      g.ellipse(0, -r*0.95, r*0.7, r*0.35);
      g.fill(0xFFD700);
      g.rect(-r*0.8, -r*0.98, r*1.6, r*0.12);
      g.fill(0xFFD700);
      break;
    case 'beret':
      g.circle(-r*0.2, -r*0.9, r*0.55);
      g.fill(0x6633cc);
      g.circle(-r*0.25, -r*1.0, r*0.12);
      g.fill(0x7744dd);
      break;
    case 'bandana':
      g.moveTo(-r*0.6, -r*0.65);
      g.lineTo(0, -r*1.25);
      g.lineTo(r*0.6, -r*0.65);
      g.closePath();
      g.fill(0x3399ff);
      break;
    case 'orb':
      g.circle(0, -r*1.4, r*0.2);
      g.fill(0x5522aa);
      g.circle(-r*0.05, -r*1.45, r*0.08);
      g.fill({ color: 0xbb88ff, alpha: 0.7 });
      g.moveTo(0, -r*1.2); g.lineTo(0, -r*0.9);
      g.stroke({ width: 1, color: 0x7744ff, alpha: 0.5 });
      break;
    case 'cross':
      g.circle(0, -r*0.7, r*0.2);
      g.fill(0xffffff);
      g.rect(-r*0.02, -r*0.85, r*0.04, r*0.3);
      g.fill(0xcc2222);
      g.rect(-r*0.12, -r*0.75, r*0.24, r*0.04);
      g.fill(0xcc2222);
      break;
    case 'antenna':
      g.moveTo(0, -r*0.9); g.lineTo(0, -r*1.6);
      g.stroke({ width: 1.5, color: 0x00ccff });
      g.circle(0, -r*1.65, r*0.12);
      g.fill(0x00ccff);
      g.circle(0, -r*1.65, r*0.22);
      g.fill({ color: 0x00ccff, alpha: 0.3 });
      break;
  }
}

function drawStarPixi(g, cx, cy, r, points, color) {
  var first = true;
  for (var i = 0; i < points * 2; i++) {
    var angle = (i * Math.PI / points) - Math.PI / 2;
    var radius = i % 2 === 0 ? r : r * 0.5;
    if (first) { g.moveTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)); first = false; }
    else g.lineTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
  }
  g.closePath();
  g.fill(color);
}

function getTowerTexture(type, level) {
  var key = type + '_' + level;
  if (towerTextureCache[key]) return towerTextureCache[key];

  var def = TOWER_DEFS[type];
  var graphics = drawMonkeyPixi(def, 58, level);
  var texture = pixiApp.renderer.generateTexture({
    target: graphics,
    resolution: 2,
  });
  graphics.destroy();
  towerTextureCache[key] = texture;
  return texture;
}

function clearTowerTextureCache() {
  for (var key in towerTextureCache) {
    towerTextureCache[key].destroy(true);
  }
  towerTextureCache = {};
}

// ── Balloon Rendering (PixiJS) ─────────────────────────────────
// Draw balloon graphics for a given type (used for texture caching)
function drawBalloonGraphics(type) {
  var def = BLOON_COLORS[type];
  if (!def) return null;

  var container = new PIXI.Container();
  var g = new PIXI.Graphics();

  if (def.isBlimp) {
    var w = def.blimpName === 'BFB' ? 65 : 48;
    var h = def.blimpName === 'BFB' ? 30 : 22;

    // Shadow
    g.ellipse(4, 8, w * 0.8, h * 0.4);
    g.fill({ color: 0x000000, alpha: 0.25 });

    // Body
    g.ellipse(0, 0, w, h);
    g.fill(hexToNum(def.color));
    g.ellipse(0, 0, w, h);
    g.stroke({ width: 3, color: 0x1a1a1a });

    // Specular
    g.ellipse(0, -h * 0.3, w * 0.85, h * 0.6);
    g.fill({ color: 0xffffff, alpha: 0.15 });

    // Fins
    g.moveTo(w * 0.7, -h * 0.3);
    g.lineTo(w + 10, -h * 0.9);
    g.lineTo(w + 10, -h * 0.05);
    g.closePath();
    g.fill(hexToNum(darkenColor(def.color, 40)));
    g.moveTo(w * 0.7, h * 0.3);
    g.lineTo(w + 10, h * 0.9);
    g.lineTo(w + 10, h * 0.05);
    g.closePath();
    g.fill(hexToNum(darkenColor(def.color, 40)));

    // Engine glow
    g.circle(w + 6, 0, 6);
    g.fill({ color: 0xffc832, alpha: 0.5 });

    // Cockpit
    g.ellipse(-w * 0.5, 0, 6, 5);
    g.fill({ color: 0xdcf0ff, alpha: 0.6 });

    // Name
    var nameText = new PIXI.Text({ text: def.blimpName, style: { fontSize: 9, fontFamily: 'sans-serif', fontWeight: 'bold', fill: 0xffffff } });
    nameText.anchor.set(0.5, 0.5);
    nameText.position.set(0, 0);
    container.addChild(nameText);

  } else {
    var radius = 16 + (type === 'ceramic' ? 4 : 0);

    // Shadow
    g.ellipse(2, radius * 1.3, radius * 0.7, radius * 0.25);
    g.fill({ color: 0x000000, alpha: 0.18 });

    // Teardrop body
    var fillColor = def.color === 'rainbow' ? 0xff6600 : hexToNum(def.color);
    g.moveTo(0, -radius * 1.15);
    g.bezierCurveTo(radius * 0.85, -radius * 1.15, radius * 1.0, -radius * 0.15, radius * 0.8, radius * 0.35);
    g.bezierCurveTo(radius * 0.55, radius * 0.85, radius * 0.15, radius * 1.1, 0, radius * 1.15);
    g.bezierCurveTo(-radius * 0.15, radius * 1.1, -radius * 0.55, radius * 0.85, -radius * 0.8, radius * 0.35);
    g.bezierCurveTo(-radius * 1.0, -radius * 0.15, -radius * 0.85, -radius * 1.15, 0, -radius * 1.15);
    g.closePath();
    g.fill(fillColor);

    // Thick outline
    g.moveTo(0, -radius * 1.15);
    g.bezierCurveTo(radius * 0.85, -radius * 1.15, radius * 1.0, -radius * 0.15, radius * 0.8, radius * 0.35);
    g.bezierCurveTo(radius * 0.55, radius * 0.85, radius * 0.15, radius * 1.1, 0, radius * 1.15);
    g.bezierCurveTo(-radius * 0.15, radius * 1.1, -radius * 0.55, radius * 0.85, -radius * 0.8, radius * 0.35);
    g.bezierCurveTo(-radius * 1.0, -radius * 0.15, -radius * 0.85, -radius * 1.15, 0, -radius * 1.15);
    g.closePath();
    g.stroke({ width: 2.5, color: 0x1a1a1a });

    // Specular highlight
    g.ellipse(-radius * 0.2, -radius * 0.6, radius * 0.35, radius * 0.25);
    g.fill({ color: 0xffffff, alpha: 0.35 });

    // Rubber sheen
    g.moveTo(-radius * 0.4, -radius * 0.85);
    g.quadraticCurveTo(-radius * 0.1, -radius * 1.0, radius * 0.15, -radius * 0.75);
    g.stroke({ width: 1.5, color: 0xffffff, alpha: 0.4, cap: 'round' });

    // Knot
    g.circle(0, radius * 1.2, 3);
    g.fill(hexToNum(def.color === 'rainbow' ? '#cc6600' : darkenColor(def.color, 25)));

    // String
    g.moveTo(0, radius * 1.23);
    g.lineTo(0, radius * 1.23 + 15);
    g.stroke({ width: 0.7, color: 0x000000, alpha: 0.25 });
  }

  container.addChild(g);
  return container;
}

function getBalloonTexture(type) {
  if (balloonTextureCache[type]) return balloonTextureCache[type];

  var graphics = drawBalloonGraphics(type);
  if (!graphics) return null;
  var texture = pixiApp.renderer.generateTexture({
    target: graphics,
    resolution: 2,
  });
  graphics.destroy({ children: true });
  balloonTextureCache[type] = texture;
  return texture;
}

function clearBalloonTextureCache() {
  for (var key in balloonTextureCache) {
    balloonTextureCache[key].destroy(true);
  }
  balloonTextureCache = {};
}

// ── Projectile Rendering (PixiJS) ──────────────────────────────
function drawProjectilePixi(proj) {
  var style = proj.style || { shape: 'pellet', size: 3, color: '#ffffff' };
  var g = new PIXI.Graphics();
  var s = style.size;
  var color = hexToNum(style.color || proj.color);

  switch(style.shape) {
    case 'crown':
      g.moveTo(-s*0.7, s*0.3); g.lineTo(-s*0.8, -s*0.6); g.lineTo(-s*0.3, -s*0.15);
      g.lineTo(0, -s*0.7); g.lineTo(s*0.3, -s*0.15); g.lineTo(s*0.8, -s*0.6);
      g.lineTo(s*0.7, s*0.3); g.closePath();
      g.fill(0xFFD700);
      break;
    case 'slash':
      g.moveTo(-s, s * 0.5); g.lineTo(s, -s * 0.5);
      g.stroke({ width: s * 0.5, color: color, cap: 'round' });
      g.moveTo(-s * 0.7, s * 0.35); g.lineTo(s * 0.7, -s * 0.35);
      g.stroke({ width: 1.5, color: 0xffffff, cap: 'round' });
      break;
    case 'mist':
      g.circle(0, 0, s);
      g.fill({ color: color, alpha: 0.5 });
      g.circle(s * 0.5, -s * 0.3, s * 0.7);
      g.fill({ color: color, alpha: 0.3 });
      break;
    case 'orb':
      g.circle(0, 0, s);
      g.fill(color);
      g.circle(-s * 0.3, -s * 0.3, s * 0.35);
      g.fill({ color: 0xffffff, alpha: 0.5 });
      break;
    case 'beam':
      g.moveTo(-s * 1.5, 0); g.lineTo(s * 1.5, 0);
      g.stroke({ width: s * 1.2, color: color, alpha: 0.3, cap: 'round' });
      g.moveTo(-s * 1.5, 0); g.lineTo(s * 1.5, 0);
      g.stroke({ width: s * 0.4, color: color, cap: 'round' });
      g.moveTo(-s, 0); g.lineTo(s, 0);
      g.stroke({ width: 1.5, color: 0xffffff, cap: 'round' });
      break;
    case 'wrench':
      g.rect(-s * 0.2, -s * 0.6, s * 0.4, s * 1.2);
      g.fill(color);
      g.circle(0, -s * 0.5, s * 0.35);
      g.fill(color);
      break;
    case 'star':
      drawStarPixi(g, 0, 0, s, 5, color);
      break;
    case 'cross':
      var cs = s * 0.3;
      g.rect(-cs, -s * 0.6, cs * 2, s * 1.2);
      g.fill(color);
      g.rect(-s * 0.6, -cs, s * 1.2, cs * 2);
      g.fill(color);
      break;
    case 'dart':
      var ds = s * 0.8;
      g.moveTo(ds, 0); g.lineTo(-ds * 0.5, -ds * 0.5);
      g.lineTo(-ds * 0.3, 0); g.lineTo(-ds * 0.5, ds * 0.5);
      g.closePath();
      g.fill(color);
      break;
    default: // pellet
      g.circle(0, 0, s);
      g.fill(color);
  }

  // Glow effect
  if (style.glow) {
    var glowG = new PIXI.Graphics();
    glowG.circle(0, 0, s * 2);
    glowG.fill({ color: color, alpha: 0.25 });
    var cont = new PIXI.Container();
    cont.addChild(glowG, g);
    return cont;
  }

  return g;
}

// ── Main Render Function ───────────────────────────────────────
function pixiRender() {
  if (!pixiApp) return;

  // Update stage transform (offset + shake)
  pixiStage.position.set(pixiOffsetX + state.shakeX, pixiOffsetY + state.shakeY);

  // Update environment
  updateEnvironment();

  // Update placement preview
  updatePlacementPreview();

  // Sync towers
  syncTowers();

  // Sync balloons
  syncBalloons();

  // Sync projectiles
  syncProjectiles();

  // Sync effects (particles + floating text)
  syncEffects();

  // Flash frame
  if (state.flashFrame > 0) {
    // White flash overlay (could use a cached sprite)
  }

  // Minimap (still Canvas 2D)
  renderMinimap();

  // Round progress bar (DOM)
  if (state.waveActive && state.roundBalloons.length > 0) {
    var spawned = state.spawnIndex / state.roundBalloons.length;
    var alive = state.balloons.length > 0 ? 0.5 : 1;
    var progress = spawned * alive * 100;
    document.getElementById('round-progress-fill').style.width = progress + '%';
  } else {
    document.getElementById('round-progress-fill').style.width = '0%';
  }

  // Manual render (auto-ticker is disabled for performance)
  pixiApp.render();
}

function updatePlacementPreview() {
  if (!state.placingTower) {
    // Hide persistent preview objects when not placing
    if (placementRangeG) placementRangeG.visible = false;
    if (placementGhost) placementGhost.visible = false;
    return;
  }

  var mx = (mouseX - pixiOffsetX) / pixiScaleFactor;
  var my = (mouseY - pixiOffsetY) / pixiScaleFactor;
  var def = TOWER_DEFS[state.placingTower];
  var valid = canPlaceTower(mx, my);

  // Ensure persistent range Graphics exists
  if (!placementRangeG) {
    placementRangeG = new PIXI.Graphics();
    placementContainer.addChild(placementRangeG);
  }
  placementRangeG.visible = true;
  placementRangeG.clear();
  placementRangeG.circle(mx, my, def.range);
  placementRangeG.fill({ color: valid ? 0x32c864 : 0xc83232, alpha: 0.1 });
  placementRangeG.circle(mx, my, def.range);
  placementRangeG.stroke({ width: 1, color: valid ? 0x32c864 : 0xc83232, alpha: 0.3 });

  // Ensure persistent ghost Sprite exists; update texture if tower type changed
  if (!placementGhost) {
    placementGhost = new PIXI.Sprite();
    placementGhost.anchor.set(0.5, 0.5);
    placementGhost.alpha = 0.6;
    placementContainer.addChild(placementGhost);
  }
  if (placementLastType !== state.placingTower) {
    placementGhost.texture = getTowerTexture(state.placingTower, 0);
    placementLastType = state.placingTower;
  }
  placementGhost.visible = true;
  placementGhost.position.set(mx, my);
}

function syncTowers() {
  // Track which towers still exist
  var existing = new Set();

  for (var i = 0; i < state.towers.length; i++) {
    var tower = state.towers[i];
    existing.add(tower);

    var sprite = towerSprites.get(tower);
    if (!sprite) {
      // Create new tower sprite
      sprite = new PIXI.Container();
      var tex = getTowerTexture(tower.type, tower.level);
      var towerSpr = new PIXI.Sprite(tex);
      towerSpr.anchor.set(0.5, 0.5);
      towerSpr.name = 'body';
      sprite.addChild(towerSpr);
      sprite._lastLevel = tower.level;

      towerContainer.addChild(sprite);
      towerSprites.set(tower, sprite);
    }

    // Update texture if level changed
    if (sprite._lastLevel !== tower.level) {
      var towerBody = sprite.getChildByName('body');
      if (towerBody) {
        towerBody.texture = getTowerTexture(tower.type, tower.level);
      }
      sprite._lastLevel = tower.level;
    }

    // Position + animation
    sprite.position.set(tower.x, tower.y);
    sprite.zIndex = tower.y;

    // Breathing animation
    var breathe = 1 + Math.sin(state.gameTime * 2.5) * 0.015;
    var recoil = tower.fireScale - 1;
    sprite.scale.set(1 - recoil * 0.5, breathe * (1 + recoil));

    // Upgrade glow aura with BlurFilter for polished look
    if (tower.level >= 2) {
      var glowColors = [0xFFD700, 0x66bbff, 0xff44aa, 0x44ffaa, 0xff6600];
      var glowColor = glowColors[Math.min(tower.level - 2, glowColors.length - 1)];
      var pulse = Math.sin(state.gameTime * 3 + tower.level) * 0.5 + 0.5;
      // Persistent glow Graphics child
      var existingGlow = sprite.getChildByName('glow');
      if (!existingGlow) {
        existingGlow = new PIXI.Graphics();
        existingGlow.name = 'glow';
        existingGlow.filters = [new PIXI.BlurFilter({ strength: 8, quality: 2 })];
        sprite.addChildAt(existingGlow, 0);
      }
      existingGlow.clear();
      var glowR = 23 * (1.3 + tower.level * 0.2 + pulse * 0.3);
      existingGlow.circle(0, 0, glowR);
      existingGlow.fill({ color: glowColor, alpha: 0.12 + pulse * 0.08 });
    }

    // Range pulse on fire
    if (tower.rangePulse > 0) {
      var existingPulse = sprite.getChildByName('pulse');
      if (!existingPulse) {
        existingPulse = new PIXI.Graphics();
        existingPulse.name = 'pulse';
        sprite.addChild(existingPulse);
      }
      existingPulse.clear();
      existingPulse.circle(0, 0, tower.range * (1 - tower.rangePulse * 0.08));
      existingPulse.stroke({ width: 2, color: hexToNum(TOWER_DEFS[tower.type].fur), alpha: tower.rangePulse * 0.12 });
    } else {
      var ep = sprite.getChildByName('pulse');
      if (ep) { ep.clear(); }
    }

    // Selection highlight
    if (state.selectedTower === tower) {
      var selCircle = sprite.getChildByName('select');
      if (!selCircle) {
        selCircle = new PIXI.Graphics();
        selCircle.name = 'select';
        sprite.addChild(selCircle);
      }
      selCircle.clear();
      selCircle.circle(0, 0, 20);
      selCircle.stroke({ width: 2, color: 0x66bbff });

      // Show range
      selCircle.circle(0, 0, tower.range);
      selCircle.fill({ color: 0x64b4ff, alpha: 0.05 });
      selCircle.circle(0, 0, tower.range);
      selCircle.stroke({ width: 1, color: 0x64b4ff, alpha: 0.3 });
    } else {
      var sc = sprite.getChildByName('select');
      if (sc) { sc.clear(); }
    }
  }

  // Remove stale sprites
  towerSprites.forEach(function(sprite, tower) {
    if (!existing.has(tower)) {
      towerContainer.removeChild(sprite);
      sprite.destroy({ children: true });
      towerSprites.delete(tower);
    }
  });
}

function syncBalloons() {
  var existing = new Set();

  for (var i = 0; i < state.balloons.length; i++) {
    var bloon = state.balloons[i];
    existing.add(bloon);

    var sprite = balloonSprites.get(bloon);
    if (!sprite) {
      // Use cached RenderTexture as a Sprite instead of creating new Graphics
      var tex = getBalloonTexture(bloon.type);
      if (!tex) continue;
      sprite = new PIXI.Sprite(tex);
      sprite.anchor.set(0.5, 0.5);
      sprite._bloonType = bloon.type;
      balloonContainer.addChild(sprite);
      balloonSprites.set(bloon, sprite);
    }

    // Update position
    var pos = getPointAtDistance(bloon.dist);
    var bobY = Math.sin(state.gameTime * 3 + bloon.id * 6.28) * 3;
    sprite.position.set(pos.x, pos.y + bobY);
    sprite.zIndex = pos.y;

    // Squash/stretch
    var def = BLOON_COLORS[bloon.type];
    if (!def.isBlimp) {
      var spd = def.speed;
      sprite.scale.set(1 - (spd - 1) * 0.04, 1 + (spd - 1) * 0.06);
    }

    // Hit flash
    if (bloon.hitFlash > 0) {
      sprite.alpha = 1;
      sprite.tint = 0xffffff;
    } else {
      sprite.alpha = 1;
      sprite.tint = 0xffffff;
    }

    // Slow indicator
    if (bloon.slowTimer > 0) {
      // Add subtle blue tint
      sprite.tint = 0xaaddff;
    }

    // Rainbow color cycling
    if (bloon.type === 'rainbow') {
      var hueShift = (Date.now() % 2000) / 2000;
      var r = Math.floor(128 + 127 * Math.sin(hueShift * Math.PI * 2));
      var gr = Math.floor(128 + 127 * Math.sin(hueShift * Math.PI * 2 + 2.09));
      var bl = Math.floor(128 + 127 * Math.sin(hueShift * Math.PI * 2 + 4.19));
      sprite.tint = (r << 16) | (gr << 8) | bl;
    }
  }

  // Remove stale
  balloonSprites.forEach(function(sprite, bloon) {
    if (!existing.has(bloon)) {
      balloonContainer.removeChild(sprite);
      sprite.destroy();
      balloonSprites.delete(bloon);
    }
  });
}

// Single reusable Graphics for all projectiles + trails (cleared each frame)
var projGraphicsLayer = null;

function syncProjectiles() {
  if (!projGraphicsLayer) {
    projGraphicsLayer = new PIXI.Graphics();
    projContainer.addChild(projGraphicsLayer);
  }
  projGraphicsLayer.clear();

  for (var i = 0; i < state.projectiles.length; i++) {
    var p = state.projectiles[i];
    var style = p.style || { shape: 'pellet', size: 3 };
    var color = hexToNum(style.color || p.color);

    // Trail dots
    for (var ti = 0; ti < p.trail.length; ti++) {
      var alpha = (ti + 1) / (p.trail.length + 1) * 0.5;
      projGraphicsLayer.circle(p.trail[ti].x, p.trail[ti].y, style.size * 0.5);
      projGraphicsLayer.fill({ color: color, alpha: alpha });
    }

    // Main projectile — simplified for performance (single circle + glow)
    if (style.glow) {
      projGraphicsLayer.circle(p.x, p.y, style.size * 1.8);
      projGraphicsLayer.fill({ color: color, alpha: 0.2 });
    }
    projGraphicsLayer.circle(p.x, p.y, style.size);
    projGraphicsLayer.fill(color);

    // White core for glow types
    if (style.glow) {
      projGraphicsLayer.circle(p.x, p.y, style.size * 0.4);
      projGraphicsLayer.fill({ color: 0xffffff, alpha: 0.6 });
    }
  }
}

// Single reusable Graphics for particles (cleared each frame)
var particleGraphicsLayer = null;
// Pool of text objects to avoid constant creation
var textPool = [];
var textPoolIdx = 0;

function getPooledText() {
  if (textPoolIdx < textPool.length) {
    var t = textPool[textPoolIdx++];
    t.visible = true;
    return t;
  }
  var t = new PIXI.Text({ text: '', style: { fontSize: 13, fontFamily: 'sans-serif', fontWeight: 'bold', fill: '#ffffff' } });
  t.anchor.set(0.5, 0.5);
  textContainer.addChild(t);
  textPool.push(t);
  textPoolIdx++;
  return t;
}

function syncEffects() {
  // Particles — single Graphics layer
  if (!particleGraphicsLayer) {
    particleGraphicsLayer = new PIXI.Graphics();
    particleGraphicsLayer.blendMode = 'add';
    effectContainer.addChild(particleGraphicsLayer);
  }
  particleGraphicsLayer.clear();

  for (var i = 0; i < state.particles.length; i++) {
    var p = state.particles[i];
    var alpha = p.life / p.maxLife;
    particleGraphicsLayer.circle(p.x, p.y, p.size * alpha);
    particleGraphicsLayer.fill({ color: hexToNum(p.color || '#ffffff'), alpha: alpha * 0.7 });
  }

  // Floating text — pooled
  textPoolIdx = 0;
  for (var i = 0; i < state.floatingTexts.length; i++) {
    var ft = state.floatingTexts[i];
    var alpha = ft.life / ft.maxLife;
    var txt = getPooledText();
    txt.text = ft.text;
    txt.style.fill = ft.color;
    txt.position.set(ft.x, ft.y);
    txt.alpha = alpha;
  }
  // Hide unused pool entries
  for (var i = textPoolIdx; i < textPool.length; i++) {
    textPool[i].visible = false;
  }
}

// ── Minimap (Canvas 2D) ────────────────────────────────────────
function renderMinimap() {
  if (!minimapCtx) return;
  var sx = 200 / gameW, sy = 120 / gameH;

  minimapCtx.clearRect(0, 0, 200, 120);
  minimapCtx.fillStyle = 'rgba(20,40,20,0.8)';
  minimapCtx.fillRect(0, 0, 200, 120);

  minimapCtx.strokeStyle = 'rgba(160,130,90,0.5)';
  minimapCtx.lineWidth = 2;
  minimapCtx.beginPath();
  minimapCtx.moveTo(pathPoints[0].x * sx, pathPoints[0].y * sy);
  for (var i = 10; i < pathPoints.length; i += 10) {
    minimapCtx.lineTo(pathPoints[i].x * sx, pathPoints[i].y * sy);
  }
  minimapCtx.stroke();

  for (var i = 0; i < state.towers.length; i++) {
    var t = state.towers[i];
    minimapCtx.fillStyle = TOWER_DEFS[t.type].fur;
    minimapCtx.beginPath();
    minimapCtx.arc(t.x * sx, t.y * sy, 2.5, 0, Math.PI * 2);
    minimapCtx.fill();
  }

  for (var i = 0; i < state.balloons.length; i++) {
    var b = state.balloons[i];
    var pos = getPointAtDistance(b.dist);
    var def = BLOON_COLORS[b.type];
    minimapCtx.fillStyle = def.color === 'rainbow' ? '#ff6600' : def.color;
    minimapCtx.beginPath();
    minimapCtx.arc(pos.x * sx, pos.y * sy, def.isBlimp ? 3 : 1.5, 0, Math.PI * 2);
    minimapCtx.fill();
  }
}

// ── Resize ─────────────────────────────────────────────────────
var pixiScaleFactor = 1;
var pixiOffsetX = 0;
var pixiOffsetY = 0;

function resizePixi() {
  if (!pixiApp) return;
  var availW = window.innerWidth - SHOP_W;
  var availH = window.innerHeight;
  var scaleX = availW / gameW;
  var scaleY = availH / gameH;
  pixiScaleFactor = Math.min(scaleX, scaleY);

  pixiApp.renderer.resize(availW, availH);
  pixiOffsetX = (availW - gameW * pixiScaleFactor) / 2;
  pixiOffsetY = (availH - gameH * pixiScaleFactor) / 2;

  pixiStage.scale.set(pixiScaleFactor);
  pixiStage.position.set(pixiOffsetX, pixiOffsetY);
}

// ── Reset ──────────────────────────────────────────────────────
function pixiResetScene() {
  // Clear all dynamic containers
  towerContainer.removeChildren();
  balloonContainer.removeChildren();
  projContainer.removeChildren();
  effectContainer.removeChildren();
  textContainer.removeChildren();
  placementContainer.removeChildren();

  towerSprites.clear();
  balloonSprites.clear();
  projSprites.clear();
  clearTowerTextureCache();
  clearBalloonTextureCache();

  // Reset persistent placement preview objects
  placementRangeG = null;
  placementGhost = null;
  placementLastType = null;

  // Reset reusable graphics layers
  projGraphicsLayer = null;
  particleGraphicsLayer = null;

  // Reset text pool
  textPool = [];
  textPoolIdx = 0;

  // Reset water frame counter
  waterFrameCounter = 0;
}
