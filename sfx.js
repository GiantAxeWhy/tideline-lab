(() => {
  "use strict";

  const MUTE_KEY = "slotbound_sfx_muted_v1";
  const BGM_KEY = "slotbound_bgm_muted_v1";

  let ctx = null;
  let masterComp = null;
  let sfxBus = null;
  let bgmBus = null;

  let muted = false;
  let bgmMuted = false;
  let appActive = true;
  let bgmMood = "prep"; // hub | prep | battle | boss
  let bgmTimer = null;
  let bgmStep = 0;

  try {
    if (localStorage.getItem(MUTE_KEY) === "1") muted = true;
    if (localStorage.getItem(BGM_KEY) === "1") bgmMuted = true;
  } catch (_) {}

  function ensure() {
    if (!appActive) return null;
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      ctx = new AudioCtx();

      masterComp = ctx.createDynamicsCompressor();
      masterComp.threshold.value = -14;
      masterComp.knee.value = 18;
      masterComp.ratio.value = 6;
      masterComp.attack.value = 0.004;
      masterComp.release.value = 0.14;
      masterComp.connect(ctx.destination);

      sfxBus = ctx.createGain();
      sfxBus.gain.value = muted ? 0 : 0.92;
      sfxBus.connect(masterComp);

      bgmBus = ctx.createGain();
      bgmBus.gain.value = (muted || bgmMuted) ? 0 : 0.24;
      bgmBus.connect(masterComp);
    }
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function syncBusGains() {
    if (!ctx || !sfxBus || !bgmBus) return;
    const now = ctx.currentTime;
    sfxBus.gain.setTargetAtTime((muted || !appActive) ? 0 : 0.92, now, 0.02);
    bgmBus.gain.setTargetAtTime((muted || bgmMuted || !appActive) ? 0 : 0.24, now, 0.06);
  }

  function tone(freq, duration, type = "triangle", gain = 0.08, delay = 0, slideTo = null, bus = "sfx") {
    if (bus === "sfx" && muted) return;
    if (bus === "bgm" && (muted || bgmMuted)) return;
    const c = ensure();
    if (!c) return;
    const targetBus = bus === "bgm" ? bgmBus : sfxBus;
    if (!targetBus) return;

    const now = c.currentTime + delay;
    const osc = c.createOscillator();
    const amp = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(24, freq), now);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(24, slideTo), now + duration);
    }
    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.linearRampToValueAtTime(gain, now + Math.min(0.014, duration * 0.25));
    amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(amp);
    amp.connect(targetBus);
    osc.start(now);
    osc.stop(now + duration + 0.025);
  }

  function noise(duration, gain = 0.06, delay = 0, filterFreq = 1200, filterType = "bandpass", q = 1.2) {
    if (muted) return;
    const c = ensure();
    if (!c || !sfxBus) return;
    const now = c.currentTime + delay;
    const bufferSize = Math.max(1, Math.floor(c.sampleRate * duration));
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.35);
    }
    const src = c.createBufferSource();
    src.buffer = buffer;
    const filter = c.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = filterFreq;
    filter.Q.value = q;
    const amp = c.createGain();
    amp.gain.setValueAtTime(gain, now);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    src.connect(filter);
    filter.connect(amp);
    amp.connect(sfxBus);
    src.start(now);
  }

  // Dark-fantasy pixel procedural BGM sequencer
  const BGM_PATTERNS = {
    hub: {
      tempoMs: 420,
      bass: [110, 0, 110, 0, 98, 0, 87.31, 0],
      lead: [329.63, 392, 440, 523.25, 440, 392, 329.63, 293.66]
    },
    prep: {
      tempoMs: 360,
      bass: [110, 0, 130.81, 0, 98, 0, 123.47, 0],
      lead: [220, 261.63, 329.63, 0, 293.66, 329.63, 392, 0]
    },
    battle: {
      tempoMs: 215,
      bass: [110, 110, 130.81, 110, 98, 98, 123.47, 146.83],
      lead: [440, 0, 523.25, 493.88, 440, 392, 329.63, 392]
    },
    boss: {
      tempoMs: 175,
      bass: [82.41, 82.41, 98, 82.41, 73.42, 82.41, 110, 98],
      lead: [329.63, 349.23, 329.63, 293.66, 329.63, 440, 415.30, 329.63]
    }
  };

  function tickBgm() {
    if (!appActive || muted || bgmMuted || !ctx || ctx.state !== "running") return;
    const pat = BGM_PATTERNS[bgmMood] || BGM_PATTERNS.prep;
    const idx = bgmStep % pat.bass.length;
    const bFreq = pat.bass[idx];
    const lFreq = pat.lead[idx];
    const dur = (pat.tempoMs / 1000) * 0.88;

    if (bFreq > 0) {
      tone(bFreq, dur * 1.15, bgmMood === "boss" ? "sawtooth" : "triangle", bgmMood === "boss" ? 0.14 : 0.12, 0, null, "bgm");
    }
    if (lFreq > 0) {
      const wave = (bgmMood === "battle" || bgmMood === "boss") ? "square" : "triangle";
      tone(lFreq, dur * 0.72, wave, bgmMood === "boss" ? 0.075 : 0.055, 0, null, "bgm");
    }
    bgmStep = (bgmStep + 1) % 64;
  }

  function restartBgmLoop() {
    if (bgmTimer) {
      clearInterval(bgmTimer);
      bgmTimer = null;
    }
    if (!appActive || muted || bgmMuted) return;
    const pat = BGM_PATTERNS[bgmMood] || BGM_PATTERNS.prep;
    bgmTimer = setInterval(tickBgm, pat.tempoMs);
  }

  function unlockOnGesture() {
    if (globalThis.NativeBridge) globalThis.NativeBridge.audioUnlock();
    ensure();
    syncBusGains();
    if (!bgmTimer && !muted && !bgmMuted && appActive) {
      restartBgmLoop();
    }
  }

  window.addEventListener("pointerdown", unlockOnGesture, { passive: true });
  window.addEventListener("touchstart", unlockOnGesture, { passive: true });

  const SFX = {
    isMuted: () => muted,
    isBgmMuted: () => bgmMuted,

    toggleMute() {
      muted = !muted;
      try { localStorage.setItem(MUTE_KEY, muted ? "1" : "0"); } catch (_) {}
      syncBusGains();
      if (muted && bgmTimer) {
        clearInterval(bgmTimer);
        bgmTimer = null;
      } else if (!muted && !bgmMuted) {
        ensure();
        restartBgmLoop();
      }
      return muted;
    },

    toggleBgm() {
      bgmMuted = !bgmMuted;
      try { localStorage.setItem(BGM_KEY, bgmMuted ? "1" : "0"); } catch (_) {}
      syncBusGains();
      if (bgmMuted && bgmTimer) {
        clearInterval(bgmTimer);
        bgmTimer = null;
      } else if (!bgmMuted && !muted) {
        ensure();
        restartBgmLoop();
      }
      return bgmMuted;
    },

    setBgmMood(mood) {
      if (!BGM_PATTERNS[mood] || mood === bgmMood) return;
      bgmMood = mood;
      bgmStep = 0;
      restartBgmLoop();
    },

    setAppActive(active) {
      appActive = Boolean(active);
      if (!appActive) {
        if (bgmTimer) {
          clearInterval(bgmTimer);
          bgmTimer = null;
        }
        if (ctx && ctx.state === "running") {
          ctx.suspend().catch(() => {});
        }
      } else {
        if (ctx && ctx.state === "suspended") {
          ctx.resume().catch(() => {});
        }
        syncBusGains();
        if (!muted && !bgmMuted) restartBgmLoop();
      }
    },

    lever() {
      // Chunky mechanical slot lever pull + spring latch
      tone(150, 0.11, "sawtooth", 0.09, 0, 72);
      noise(0.06, 0.08, 0, 900, "bandpass", 1.5);
      tone(320, 0.08, "triangle", 0.08, 0.075, 520);
      noise(0.035, 0.05, 0.08, 2200, "highpass", 1.0);
    },

    tick() {
      // Crisp mechanical ratchet click
      tone(780 + Math.random() * 140, 0.025, "square", 0.024, 0, 420);
      noise(0.018, 0.025, 0, 2600, "bandpass", 2.0);
    },

    anticipation(step = 0) {
      const f = 480 + step * 62;
      tone(f, 0.065, "sawtooth", 0.052, 0, f * 1.14);
      tone(f * 0.5, 0.065, "triangle", 0.04, 0);
    },

    feverReady() {
      [440, 554.37, 659.25, 880, 1108.73, 1318.5].forEach((f, i) => {
        tone(f, 0.28, "sawtooth", 0.085, i * 0.055);
        tone(f * 0.5, 0.26, "triangle", 0.06, i * 0.055);
      });
      noise(0.18, 0.06, 0.25, 1800, "bandpass");
    },

    tierUp() {
      [330, 440, 554.37, 659.25, 880].forEach((f, i) => {
        tone(f, 0.24, "triangle", 0.11, i * 0.065);
        tone(f * 1.5, 0.18, "sine", 0.045, i * 0.065 + 0.02);
      });
    },

    nudge() {
      tone(280, 0.09, "triangle", 0.09, 0, 520);
      noise(0.03, 0.04, 0, 1600, "bandpass");
    },

    reelStop(col) {
      const base = [165, 205, 255][col] || 205;
      // Heavy mechanical lock-in thud + crisp metallic click
      tone(base, 0.11, "triangle", 0.13, 0, base * 0.52);
      tone(95, 0.09, "sine", 0.12, 0, 48);
      noise(0.045, 0.075, 0, 1300, "bandpass", 1.4);
    },

    match() {
      tone(523.25, 0.16, "triangle", 0.11, 0);
      tone(659.25, 0.18, "triangle", 0.11, 0.075);
      tone(783.99, 0.28, "sine", 0.12, 0.15);
      tone(1046.5, 0.22, "sine", 0.05, 0.19);
    },

    jackpot() {
      [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98].forEach((f, i) => {
        tone(f, 0.26, "triangle", 0.11, i * 0.062);
        tone(f * 0.5, 0.22, "sawtooth", 0.05, i * 0.062);
      });
      tone(130.81, 0.35, "sine", 0.14, 0.04, 65);
    },

    coin() {
      tone(1174.66, 0.075, "sine", 0.085, 0);
      tone(1567.98, 0.19, "sine", 0.095, 0.055);
      tone(2349.32, 0.12, "triangle", 0.03, 0.065);
    },

    lock() {
      tone(420, 0.065, "square", 0.048, 0, 640);
      noise(0.025, 0.04, 0, 2200, "bandpass");
    },

    dragPick() {
      tone(340, 0.05, "triangle", 0.06, 0, 480);
    },

    dragHover() {
      tone(520, 0.07, "sine", 0.075, 0, 740);
      tone(740, 0.08, "triangle", 0.065, 0.045, 980);
    },

    dragSnap() {
      tone(260, 0.07, "triangle", 0.085, 0, 170);
      noise(0.025, 0.04, 0, 1500, "bandpass");
    },

    absorb() {
      // Energy convergence whoosh + crystalline fusion pop
      tone(210, 0.22, "sawtooth", 0.08, 0, 640);
      tone(420, 0.26, "triangle", 0.11, 0.08, 960);
      noise(0.14, 0.06, 0.02, 1100, "bandpass");
      tone(880, 0.24, "sine", 0.09, 0.18, 1320);
    },

    evolve() {
      [392, 523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => {
        tone(f, 0.30, "triangle", 0.11, i * 0.072);
        tone(f * 0.5, 0.25, "sine", 0.06, i * 0.072);
      });
    },

    hit() {
      // Punchy combat impact with sub thump
      tone(155 + Math.random() * 45, 0.065, "square", 0.042, 0, 64);
      tone(90, 0.055, "sine", 0.065, 0, 42);
      noise(0.035, 0.04, 0, 1400, "bandpass");
    },

    crit() {
      // Heavy metallic slash + sub punch
      tone(340, 0.095, "sawtooth", 0.08, 0, 760);
      tone(110, 0.10, "sine", 0.12, 0, 44);
      noise(0.085, 0.085, 0, 2100, "bandpass", 1.1);
    },

    magic() {
      tone(720, 0.13, "sine", 0.055, 0, 340);
      tone(1080, 0.10, "triangle", 0.035, 0.02, 540);
    },

    heal() {
      tone(587.33, 0.12, "sine", 0.055, 0, 880);
      tone(880, 0.14, "triangle", 0.04, 0.04, 1174.66);
    },

    ultimate() {
      // Dramatic big-skill charge -> seismic impact -> resonant shimmer
      tone(240, 0.12, "sawtooth", 0.075, 0, 620);
      tone(125, 0.34, "sine", 0.22, 0.09, 36);
      tone(190, 0.28, "sawtooth", 0.11, 0.09, 58);
      noise(0.24, 0.13, 0.09, 950, "lowpass", 1.2);
      [523.25, 783.99, 1046.5].forEach((f, i) => {
        tone(f, 0.30, "triangle", 0.075, 0.11 + i * 0.035, f * 1.18);
      });
    },

    bossSkill() {
      tone(105, 0.36, "sawtooth", 0.13, 0, 46);
      tone(72, 0.38, "sine", 0.18, 0, 34);
      noise(0.24, 0.10, 0.04, 720, "lowpass");
    },

    bossPhase2() {
      // Twin tectonic slams + menacing brass swell
      tone(88, 0.24, "sine", 0.22, 0, 38);
      tone(110, 0.28, "sawtooth", 0.12, 0, 55);
      noise(0.18, 0.11, 0.02, 650, "lowpass");
      tone(82, 0.42, "sine", 0.24, 0.22, 32);
      tone(146.83, 0.42, "sawtooth", 0.13, 0.22, 73.42);
      noise(0.30, 0.12, 0.23, 800, "lowpass");
    },

    victory() {
      [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => {
        tone(f, 0.32, "triangle", 0.11, i * 0.09);
        tone(f * 0.5, 0.28, "sine", 0.06, i * 0.09);
      });
    },

    defeat() {
      [330, 293.66, 246.94, 196, 146.83].forEach((f, i) => {
        tone(f, 0.34, "sawtooth", 0.08, i * 0.11);
      });
    }
  };

  globalThis.SFX = SFX;
})();
