// ═══════════════════════════════════════════════════════════════
// AGENT BTD — Audio & Music System
// ═══════════════════════════════════════════════════════════════
'use strict';

var audioCtx = null;
var noiseBuffer = null;

function initAudio() {
  if (audioCtx) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var sr = audioCtx.sampleRate;
    var len = sr * 0.1;
    noiseBuffer = audioCtx.createBuffer(1, len, sr);
    var data = noiseBuffer.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  } catch(e) {}
}

function playPopSound(bloonType) {
  if (!audioCtx || !noiseBuffer) { playSound('pop'); return; }
  try {
    var now = audioCtx.currentTime;
    var pitchMap = { red:1200, blue:1100, green:1000, yellow:900, pink:800, purple:700, black:600, white:1300, rainbow:500, ceramic:400, moab:200, bfb:120 };
    var basePitch = pitchMap[bloonType] || 800;
    var pitch = basePitch * (0.9 + Math.random() * 0.2);

    var noise = audioCtx.createBufferSource();
    noise.buffer = noiseBuffer;
    var nFilter = audioCtx.createBiquadFilter();
    nFilter.type = 'bandpass'; nFilter.frequency.value = pitch; nFilter.Q.value = 2;
    var nGain = audioCtx.createGain();
    nGain.gain.setValueAtTime(0.18, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    noise.connect(nFilter); nFilter.connect(nGain); nGain.connect(audioCtx.destination);
    noise.start(now); noise.stop(now + 0.06);

    var osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(pitch * 0.25, 60), now + 0.12);
    var oGain = audioCtx.createGain();
    oGain.gain.setValueAtTime(0.12, now);
    oGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(oGain); oGain.connect(audioCtx.destination);
    osc.start(now); osc.stop(now + 0.12);

    var res = audioCtx.createOscillator();
    res.type = 'sine'; res.frequency.value = pitch * 0.5;
    var rGain = audioCtx.createGain();
    rGain.gain.setValueAtTime(0.04, now + 0.04);
    rGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    res.connect(rGain); rGain.connect(audioCtx.destination);
    res.start(now + 0.04); res.stop(now + 0.22);
  } catch(e) {}
}

function playWaveComplete() {
  if (!audioCtx) return;
  try {
    var now = audioCtx.currentTime;
    var notes = [523, 659, 784, 1047];
    notes.forEach(function(freq, i) {
      var osc = audioCtx.createOscillator();
      osc.type = 'sine'; osc.frequency.value = freq;
      var g = audioCtx.createGain();
      g.gain.setValueAtTime(0, now + i * 0.12);
      g.gain.linearRampToValueAtTime(0.1, now + i * 0.12 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.25);
      osc.connect(g); g.connect(audioCtx.destination);
      osc.start(now + i * 0.12); osc.stop(now + i * 0.12 + 0.25);
    });
  } catch(e) {}
}

function playMoabHorn() {
  if (!audioCtx) return;
  try {
    var now = audioCtx.currentTime;
    var osc = audioCtx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(55, now);
    osc.frequency.linearRampToValueAtTime(65, now + 0.5);
    var g = audioCtx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.15, now + 0.1);
    g.gain.setValueAtTime(0.15, now + 0.35);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    var filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = 200;
    osc.connect(filter); filter.connect(g); g.connect(audioCtx.destination);
    osc.start(now); osc.stop(now + 0.6);
  } catch(e) {}
}

function playSound(type) {
  if (!audioCtx) return;
  try {
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    var now = audioCtx.currentTime;

    switch(type) {
      case 'pop':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.linearRampToValueAtTime(200, now + 0.08);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.08);
        osc.start(now); osc.stop(now + 0.08);
        break;
      case 'shoot':
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.04);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.04);
        osc.start(now); osc.stop(now + 0.04);
        break;
      case 'cash':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1318, now);
        osc.frequency.setValueAtTime(1568, now + 0.06);
        osc.frequency.setValueAtTime(2093, now + 0.12);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now); osc.stop(now + 0.2);
        if (noiseBuffer) {
          var n = audioCtx.createBufferSource();
          n.buffer = noiseBuffer;
          var ng = audioCtx.createGain();
          ng.gain.setValueAtTime(0.06, now);
          ng.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
          n.connect(ng); ng.connect(audioCtx.destination);
          n.start(now); n.stop(now + 0.03);
        }
        break;
      case 'place':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(300, now + 0.08);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.1);
        osc.start(now); osc.stop(now + 0.1);
        break;
      case 'roundstart':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(800, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.2);
        osc.start(now); osc.stop(now + 0.2);
        break;
      case 'moab':
        playMoabHorn();
        gain.gain.setValueAtTime(0, now);
        osc.start(now); osc.stop(now + 0.01);
        break;
    }
  } catch(e) {}
}

// ── Music System (Procedural) ──────────────────────────────────
var musicSystem = {
  padOscs: [], padGain: null, melodyGain: null, percGain: null, masterGain: null,
  isPlaying: false, isMuted: false, mode: 'idle',
  bpm: 90, beatTimer: 0, beat: 0,
  scale: [0,2,4,7,9],
  melodyPattern: [0,2,4,2,0,4,7,4],
  melodyIndex: 0,

  init: function() {
    if (!audioCtx || this.masterGain) return;
    this.masterGain = audioCtx.createGain();
    this.masterGain.gain.value = 0.25;
    this.masterGain.connect(audioCtx.destination);
    this.padGain = audioCtx.createGain();
    this.padGain.gain.value = 0;
    this.padGain.connect(this.masterGain);
    this.melodyGain = audioCtx.createGain();
    this.melodyGain.gain.value = 0;
    this.melodyGain.connect(this.masterGain);
    this.percGain = audioCtx.createGain();
    this.percGain.gain.value = 0;
    this.percGain.connect(this.masterGain);
  },

  start: function() {
    this.init();
    if (this.isPlaying || !audioCtx) return;
    this.isPlaying = true;
    var self = this;
    var baseFreq = 130.81;
    [1, 5/4, 3/2].forEach(function(ratio) {
      var osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = baseFreq * ratio;
      var lfo = audioCtx.createOscillator();
      lfo.type = 'sine'; lfo.frequency.value = 0.3 + Math.random() * 0.4;
      var lfoG = audioCtx.createGain(); lfoG.gain.value = 1.5;
      lfo.connect(lfoG); lfoG.connect(osc.frequency); lfo.start();
      osc.connect(self.padGain); osc.start();
      self.padOscs.push(osc, lfo);
    });
    this.setMode('calm');
  },

  stop: function() {
    this.isPlaying = false;
    this.padOscs.forEach(function(o) { try { o.stop(); } catch(e){} });
    this.padOscs = [];
    if (this.padGain) this.padGain.gain.value = 0;
  },

  setMode: function(mode) {
    if (mode === this.mode || !audioCtx) return;
    this.mode = mode;
    var now = audioCtx.currentTime;
    var t = now + 0.5;
    if (mode === 'calm') {
      this.padGain.gain.linearRampToValueAtTime(0.12, t);
      this.melodyGain.gain.linearRampToValueAtTime(0, t);
      this.percGain.gain.linearRampToValueAtTime(0, t);
      this.bpm = 90;
    } else if (mode === 'battle') {
      this.padGain.gain.linearRampToValueAtTime(0.1, t);
      this.melodyGain.gain.linearRampToValueAtTime(0.07, t);
      this.percGain.gain.linearRampToValueAtTime(0.08, t);
      this.bpm = 120;
    } else if (mode === 'boss') {
      this.padGain.gain.linearRampToValueAtTime(0.14, t);
      this.melodyGain.gain.linearRampToValueAtTime(0.09, t);
      this.percGain.gain.linearRampToValueAtTime(0.1, t);
      this.bpm = 150;
    }
  },

  update: function(dt) {
    if (!this.isPlaying || this.isMuted || !audioCtx || this.mode === 'idle') return;
    var beatDur = 60 / (this.bpm * Math.max(state.gameSpeed, 1));
    this.beatTimer += dt;
    if (this.beatTimer >= beatDur) {
      this.beatTimer -= beatDur;
      this.beat++;
      if (this.mode !== 'calm' && this.beat % 2 === 0) this.playMelody();
      if (this.mode !== 'calm') this.playPerc();
    }
  },

  playMelody: function() {
    if (!audioCtx) return;
    var baseFreq = 261.63;
    var deg = this.melodyPattern[this.melodyIndex % this.melodyPattern.length];
    var semi = this.scale[deg % this.scale.length];
    var freq = baseFreq * Math.pow(2, semi / 12);
    var now = audioCtx.currentTime;
    var osc = audioCtx.createOscillator();
    osc.type = this.mode === 'boss' ? 'sawtooth' : 'sine';
    osc.frequency.value = freq;
    var g = audioCtx.createGain();
    g.gain.setValueAtTime(0.06, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(g); g.connect(this.melodyGain);
    osc.start(now); osc.stop(now + 0.25);
    this.melodyIndex++;
  },

  playPerc: function() {
    if (!audioCtx || !noiseBuffer) return;
    var now = audioCtx.currentTime;
    var hh = audioCtx.createBufferSource(); hh.buffer = noiseBuffer;
    var hf = audioCtx.createBiquadFilter(); hf.type = 'highpass'; hf.frequency.value = 8000;
    var hg = audioCtx.createGain();
    hg.gain.setValueAtTime(0.03, now);
    hg.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    hh.connect(hf); hf.connect(hg); hg.connect(this.percGain);
    hh.start(now); hh.stop(now + 0.04);
    if (this.beat % 4 === 0) {
      var k = audioCtx.createOscillator(); k.type = 'sine';
      k.frequency.setValueAtTime(100, now);
      k.frequency.exponentialRampToValueAtTime(35, now + 0.08);
      var kg = audioCtx.createGain();
      kg.gain.setValueAtTime(0.1, now);
      kg.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      k.connect(kg); kg.connect(this.percGain);
      k.start(now); k.stop(now + 0.12);
    }
  },

  toggleMute: function() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : 0.25, audioCtx.currentTime + 0.2);
    }
  },
};
