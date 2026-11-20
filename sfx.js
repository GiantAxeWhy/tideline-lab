(() => {
  "use strict";

  let ctx = null;
  let muted = false;

  function ensure() {
    if (muted) return null;
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      ctx = new AudioCtx();
    }
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function tone(freq, duration, type = "triangle", gain = 0.08, delay = 0, slideTo = null) {
    const c = ensure();
    if (!c) return;
    const now = c.currentTime + delay;
    const osc = c.createOscillator();
    const amp = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), now + duration);
    }
    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.linearRampToValueAtTime(gain, now + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(amp);
    amp.connect(c.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  function noise(duration, gain = 0.05, delay = 0) {
    const c = ensure();
    if (!c) return;
    const now = c.currentTime + delay;
    const bufferSize = Math.max(1, Math.floor(c.sampleRate * duration));
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const src = c.createBufferSource();
    src.buffer = buffer;
    const filter = c.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1200;
    const amp = c.createGain();
    amp.gain.setValueAtTime(gain, now);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    src.connect(filter);
    filter.connect(amp);
    amp.connect(c.destination);
    src.start(now);
  }

  const SFX = {
    isMuted: () => muted,
    toggleMute() {
      muted = !muted;
      return muted;
    },
    lever() {
      tone(220, 0.09, "sawtooth", 0.06, 0, 120);
      tone(340, 0.08, "triangle", 0.05, 0.07, 460);
    },
    tick() {
      tone(720 + Math.random() * 140, 0.03, "square", 0.02, 0);
    },
    anticipation(step = 0) {
      tone(520 + step * 55, 0.055, "sawtooth", 0.038, 0, 580 + step * 60);
    },
    feverReady() {
      [440, 554.37, 659.25, 880, 1108.73].forEach((f, i) => {
        tone(f, 0.24, "sawtooth", 0.075, i * 0.06);
      });
    },
    tierUp() {
      [330, 440, 554.37, 659.25, 880].forEach((f, i) => {
        tone(f, 0.22, "triangle", 0.09, i * 0.07);
      });
    },
    nudge() {
      tone(290, 0.08, "triangle", 0.07, 0, 480);
    },
    reelStop(col) {
      const base = [180, 220, 270][col] || 220;
      tone(base, 0.09, "triangle", 0.09, 0, base * 0.65);
      noise(0.04, 0.04);
    },
    match() {
      tone(523.25, 0.14, "triangle", 0.09, 0);
      tone(659.25, 0.16, "triangle", 0.09, 0.08);
      tone(783.99, 0.24, "sine", 0.1, 0.16);
    },
    jackpot() {
      [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => {
        tone(f, 0.22, "triangle", 0.1, i * 0.07);
      });
    },
    coin() {
      tone(1174.66, 0.08, "sine", 0.07, 0);
      tone(1567.98, 0.18, "sine", 0.08, 0.06);
    },
    lock() {
      tone(440, 0.06, "square", 0.04, 0, 620);
    },
    absorb() {
      tone(280, 0.18, "sawtooth", 0.06, 0, 560);
      tone(560, 0.24, "triangle", 0.09, 0.1, 880);
    },
    evolve() {
      [392, 523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        tone(f, 0.28, "triangle", 0.1, i * 0.08);
      });
    },
    hit() {
      tone(150 + Math.random() * 50, 0.06, "square", 0.035, 0, 70);
    },
    crit() {
      tone(320, 0.08, "sawtooth", 0.06, 0, 680);
      noise(0.07, 0.05);
    },
    magic() {
      tone(680, 0.12, "sine", 0.04, 0, 320);
    },
    heal() {
      tone(587.33, 0.1, "sine", 0.04, 0, 880);
    },
    bossSkill() {
      tone(110, 0.32, "sawtooth", 0.09, 0, 55);
      noise(0.2, 0.06, 0.05);
    },
    victory() {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        tone(f, 0.28, "triangle", 0.1, i * 0.1);
      });
    },
    defeat() {
      [330, 293.66, 246.94, 196].forEach((f, i) => {
        tone(f, 0.3, "sawtooth", 0.07, i * 0.12);
      });
    }
  };

  globalThis.SFX = SFX;
})();
