// ═══════════════════════════════════════════════════════════════
// AGENT BTD — State & Constants
// ═══════════════════════════════════════════════════════════════
'use strict';

var SHOP_W = 240;
var HUD_H = 52;
var PATH_W = 48;
var SAVE_KEY = 'agentBTD_save_v2';

// ── Tower Definitions ──────────────────────────────────────────
var TOWER_DEFS = {
  cos:      { name:'CoS',        full:'Chief of Staff',      fur:'#DAA520', face:'#F5DEB3', range:180, rate:1.0, dmg:3, cost:800, acc:'crown' },
  daily:    { name:'Daily-Ops',  full:'Daily Operations',    fur:'#8B6914', face:'#DEB887', range:130, rate:1.2, dmg:1, cost:200, acc:'headset' },
  jung:     { name:'Jung',       full:'Carl Jung',           fur:'#777777', face:'#C0C0C0', range:150, rate:0.8, dmg:2, cost:400, acc:'glasses' },
  ali:      { name:'Ali',        full:'Imam Ali',            fur:'#5C3317', face:'#C9A96E', range:110, rate:0.6, dmg:5, cost:500, acc:'headband' },
  hassan:   { name:'Hassan',     full:'Imam Hassan',         fur:'#7B5B3A', face:'#D2B48C', range:100, rate:0.5, dmg:1, cost:350, acc:'wrap', slow:true },
  meta:     { name:'Meta',       full:'System Improver',     fur:'#4A4A4A', face:'#999999', range:120, rate:1.0, dmg:2, cost:350, acc:'goggles' },
  garage:   { name:'Garage33',   full:'Web Developer',       fur:'#B8860B', face:'#FAEBD7', range:200, rate:0.5, dmg:4, cost:450, acc:'hardhat' },
  social:   { name:'SocialStar', full:'Media Producer',      fur:'#C4A265', face:'#FFE4C4', range:140, rate:1.5, dmg:1, cost:350, acc:'beret' },
  ultra:    { name:'Ultrawash',  full:'App Developer',       fur:'#5F7F9F', face:'#B0C4DE', range:90,  rate:2.0, dmg:1, cost:300, acc:'bandana' },
  im:       { name:'IM Web',     full:'Intelligence Masters',fur:'#3C3C5A', face:'#9999CC', range:160, rate:2.5, dmg:1, cost:700, acc:'orb' },
  health:   { name:'Health',     full:'Health Agent',        fur:'#A0A0A0', face:'#E0E0E0', range:80,  rate:0.8, dmg:2, cost:400, acc:'cross' },
  telegram: { name:'Telegram',   full:'Mobile Tunnel',       fur:'#2BBBAD', face:'#B0E0E0', range:0,   rate:0,   dmg:0, cost:600, acc:'antenna', isFarm:true, income:70 },
};
var TOWER_ORDER = ['cos','daily','jung','ali','hassan','meta','garage','social','ultra','im','health','telegram'];

// ── Projectile Visual Styles ─────────────────────────────────
var PROJ_STYLES = {
  cos:    { shape:'crown',  color:'#FFD700', size:10, spin:true },
  daily:  { shape:'dart',   color:'#4488ff', size:8 },
  jung:   { shape:'orb',    color:'#9944ff', size:9, glow:true },
  ali:    { shape:'slash',  color:'#ff3322', size:14 },
  hassan: { shape:'mist',   color:'#44cc66', size:11 },
  meta:   { shape:'bolt',   color:'#ff6600', size:7, spin:true },
  garage: { shape:'wrench', color:'#FFD700', size:9, spin:true },
  social: { shape:'star',   color:'#6633cc', size:8, spin:true },
  ultra:  { shape:'pellet', color:'#3399ff', size:5 },
  im:     { shape:'beam',   color:'#4466ff', size:8, glow:true },
  health: { shape:'cross',  color:'#22cc44', size:7 },
};

// ── Tower Abilities ──────────────────────────────────────────
var TOWER_ABILITIES = {
  cos:    { name:'Leadership',   desc:'+15% range nearby', radius:100, rangeBoost:0.15 },
  ali:    { name:'Berserker',    desc:'2x dmg after 10 pops', threshold:10, duration:3 },
  hassan: { name:'Permafrost',   desc:'Perma-slow 30%', slowMult:0.7 },
  jung:   { name:'Mind Control', desc:'5% reverse balloon', chance:0.05 },
  garage: { name:'Pierce',       desc:'Hits 3 balloons', pierce:3 },
  im:     { name:'Chain Lightning', desc:'Arcs to 2 nearby', chains:2 },
  ultra:  { name:'Rapid Fire',   desc:'3x rate 2s/10s', burstRate:3, burstDur:2, burstCd:10 },
  health: { name:'Regen Aura',   desc:'+1 life/30s', regenInterval:30 },
};

// ── Balloon Definitions ────────────────────────────────────────
var BLOON_COLORS = {
  red:     { color:'#FF1744', hp:1,  speed:1.0, cash:1,  children:null,  rbe:1 },
  blue:    { color:'#2979FF', hp:1,  speed:1.15, cash:1,  children:['red'], rbe:2 },
  green:   { color:'#00E676', hp:1,  speed:1.35, cash:1,  children:['blue'], rbe:3 },
  yellow:  { color:'#FFEA00', hp:1,  speed:1.6,  cash:1,  children:['green'], rbe:4 },
  pink:    { color:'#FF4081', hp:1,  speed:2.0,  cash:1,  children:['yellow'], rbe:5 },
  purple:  { color:'#7B1FA2', hp:1,  speed:1.3,  cash:1,  children:['pink','pink'], rbe:11 },
  black:   { color:'#212121', hp:1,  speed:1.5,  cash:1,  children:['pink','pink'], rbe:11 },
  white:   { color:'#F5F5F5', hp:1,  speed:1.5,  cash:1,  children:['pink','pink'], rbe:11 },
  rainbow: { color:'rainbow',  hp:1,  speed:1.4,  cash:2,  children:['black','white'], rbe:23 },
  ceramic: { color:'#8D6E63', hp:8,  speed:1.3,  cash:5,  children:['rainbow','rainbow'], rbe:54 },
  moab:    { color:'#2266cc', hp:200, speed:0.5, cash:50, children:['ceramic','ceramic','ceramic','ceramic'], rbe:616, isBlimp:true, blimpName:'MOAB' },
  bfb:     { color:'#cc2222', hp:700, speed:0.3, cash:100,children:['moab','moab','moab','moab'], rbe:3164, isBlimp:true, blimpName:'BFB' },
};

// ── Map Waypoints ──────────────────────────────────────────────
var RAW_WAYPOINTS = [
  {x:-40,  y:200},
  {x:100,  y:200},
  {x:280,  y:140},
  {x:450,  y:100},
  {x:620,  y:160},
  {x:720,  y:300},
  {x:650,  y:450},
  {x:480,  y:500},
  {x:300,  y:440},
  {x:180,  y:520},
  {x:200,  y:680},
  {x:380,  y:720},
  {x:560,  y:660},
  {x:740,  y:620},
  {x:900,  y:680},
  {x:1050, y:600},
  {x:1180, y:480},
  {x:1280, y:350},
  {x:1400, y:300},
  {x:1640, y:320},
];

var ZONE_LABELS = [
  { pathPct: 0.10, text: 'HARDWARE AD+' },
  { pathPct: 0.30, text: 'BOZ AGENTIC' },
  { pathPct: 0.50, text: 'ULTRAWASH' },
  { pathPct: 0.70, text: 'IM WEBSITE' },
  { pathPct: 0.90, text: 'VISION' },
];

// ── Game State ─────────────────────────────────────────────────
var gameW = 1600, gameH = 900;
var pathPoints = [];
var pathDistances = [];
var totalPathLength = 0;
var mouseX = 0, mouseY = 0;

var state = {
  cash: 650, lives: 100, round: 0, totalPops: 0,
  gameSpeed: 1, autoSend: false, waveActive: false,
  warStartTime: Date.now(), placingTower: null, selectedTower: null,
  towers: [], balloons: [], projectiles: [], particles: [], floatingTexts: [],
  roundBalloons: [], spawnTimer: 0, spawnIndex: 0,
  shakeX: 0, shakeY: 0, shakeDuration: 0,
  waveBannerTimer: 0, autoSendTimer: 0,
  roundIncome: 0,
  comboCount: 0, comboTimer: 0, bestCombo: 0,
  aiEnabled: false, aiTickTimer: 0, aiLastDecision: '',
  slowMoTimer: 0, slowMoFactor: 1,
  flashFrame: 0, gameTime: 0,
  clouds: [], ambientMotes: [],
  musicPlaying: false,
  towersPlaced: 0, cashEarned: 0, peakRound: 0,
  teleporting: null,
};

// ── Catmull-Rom Spline ─────────────────────────────────────────
function catmullRom(points, segments) {
  var result = [];
  for (var i = 0; i < points.length - 1; i++) {
    var p0 = points[Math.max(i - 1, 0)];
    var p1 = points[i];
    var p2 = points[i + 1];
    var p3 = points[Math.min(i + 2, points.length - 1)];
    for (var t = 0; t < segments; t++) {
      var s = t / segments;
      var s2 = s * s, s3 = s2 * s;
      var x = 0.5 * ((2*p1.x) + (-p0.x+p2.x)*s + (2*p0.x-5*p1.x+4*p2.x-p3.x)*s2 + (-p0.x+3*p1.x-3*p2.x+p3.x)*s3);
      var y = 0.5 * ((2*p1.y) + (-p0.y+p2.y)*s + (2*p0.y-5*p1.y+4*p2.y-p3.y)*s2 + (-p0.y+3*p1.y-3*p2.y+p3.y)*s3);
      result.push({x: x, y: y});
    }
  }
  result.push(points[points.length - 1]);
  return result;
}

function computePathDistances() {
  pathDistances = [0];
  totalPathLength = 0;
  for (var i = 1; i < pathPoints.length; i++) {
    var dx = pathPoints[i].x - pathPoints[i-1].x;
    var dy = pathPoints[i].y - pathPoints[i-1].y;
    totalPathLength += Math.sqrt(dx*dx + dy*dy);
    pathDistances.push(totalPathLength);
  }
}

function getPointAtDistance(dist) {
  if (dist <= 0) return { x: pathPoints[0].x, y: pathPoints[0].y };
  if (dist >= totalPathLength) return { x: pathPoints[pathPoints.length-1].x, y: pathPoints[pathPoints.length-1].y };
  for (var i = 1; i < pathDistances.length; i++) {
    if (pathDistances[i] >= dist) {
      var segLen = pathDistances[i] - pathDistances[i-1];
      var t = segLen > 0 ? (dist - pathDistances[i-1]) / segLen : 0;
      return {
        x: pathPoints[i-1].x + (pathPoints[i].x - pathPoints[i-1].x) * t,
        y: pathPoints[i-1].y + (pathPoints[i].y - pathPoints[i-1].y) * t,
      };
    }
  }
  return { x: pathPoints[pathPoints.length-1].x, y: pathPoints[pathPoints.length-1].y };
}

function isOnPath(x, y, margin) {
  margin = margin || PATH_W + 10;
  for (var i = 0; i < pathPoints.length - 1; i++) {
    var p = pathPoints[i];
    var dx = x - p.x, dy = y - p.y;
    if (dx*dx + dy*dy < margin*margin) return true;
  }
  return false;
}

// ── Color Utilities ────────────────────────────────────────────
function darkenColor(hex, amount) {
  if (hex === 'rainbow') return '#996600';
  var r = parseInt(hex.slice(1,3),16);
  var g = parseInt(hex.slice(3,5),16);
  var b = parseInt(hex.slice(5,7),16);
  r = Math.max(0, r - amount);
  g = Math.max(0, g - amount);
  b = Math.max(0, b - amount);
  return '#' + [r,g,b].map(function(v) { return v.toString(16).padStart(2,'0'); }).join('');
}

function lightenColor(hex, amount) {
  if (hex === 'rainbow') return '#ffcc66';
  var r = parseInt(hex.slice(1,3),16);
  var g = parseInt(hex.slice(3,5),16);
  var b = parseInt(hex.slice(5,7),16);
  r = Math.min(255, r + amount);
  g = Math.min(255, g + amount);
  b = Math.min(255, b + amount);
  return '#' + [r,g,b].map(function(v) { return v.toString(16).padStart(2,'0'); }).join('');
}

function hexToNum(hex) {
  if (hex === 'rainbow') return 0xff6600;
  if (!hex || typeof hex !== 'string') return 0xffffff;
  if (hex.charAt(0) === '#') return parseInt(hex.slice(1), 16) || 0xffffff;
  // Handle rgba(r,g,b,a) strings
  var m = hex.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (m) return (parseInt(m[1]) << 16) | (parseInt(m[2]) << 8) | parseInt(m[3]);
  return 0xffffff;
}
