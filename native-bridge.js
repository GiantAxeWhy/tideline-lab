(() => {
  "use strict";

  const HAPTIC_KEY = "slotbound_haptics_v1";
  let hapticsEnabled = true;
  try {
    const saved = localStorage.getItem(HAPTIC_KEY);
    if (saved === "0") hapticsEnabled = false;
  } catch (_) {}

  function post(payload) {
    try {
      const handler = window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.nativeBridge;
      if (handler && typeof handler.postMessage === "function") {
        handler.postMessage(payload);
        return true;
      }
    } catch (_) {}
    return false;
  }

  const NativeBridge = {
    isNative() {
      return Boolean(window.__IOS_NATIVE__ || (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.nativeBridge));
    },

    isHapticsEnabled() {
      return hapticsEnabled;
    },

    toggleHaptics() {
      hapticsEnabled = !hapticsEnabled;
      try {
        localStorage.setItem(HAPTIC_KEY, hapticsEnabled ? "1" : "0");
      } catch (_) {}
      post({ action: "setHapticsEnabled", enabled: hapticsEnabled });
      if (hapticsEnabled) this.haptic("button_tap", 0.8);
      return hapticsEnabled;
    },

    haptic(cue, intensity = 1.0) {
      if (!hapticsEnabled) return;
      if (post({ action: "haptic", cue: String(cue || "button_tap"), intensity: Number(intensity) || 1.0 })) {
        return;
      }
      // Graceful fallback for non-iOS mobile browsers that support Vibration API.
      if (navigator && typeof navigator.vibrate === "function") {
        const msMap = {
          ultimate_cast: [20, 30, 55, 20, 35],
          boss_phase2: [40, 35, 65],
          boss_skill: [35, 25, 30],
          jackpot: [20, 25, 25, 25, 45],
          fever_ready: [20, 25, 35, 25, 45],
          absorb_evolve: [18, 20, 40],
          reel_lever: 18,
          reel_stop: 14,
          drag_hover_absorb: [14, 20, 22],
          drag_snap: 12,
          swap: 12,
          crit_hit: 10,
          drag_pick: 8,
          button_tap: 6
        };
        const pattern = msMap[cue];
        if (pattern) {
          try { navigator.vibrate(pattern); } catch (_) {}
        }
      }
    },

    audioUnlock() {
      post({ action: "audioUnlock" });
    },

    notifyReady() {
      post({ action: "setHapticsEnabled", enabled: hapticsEnabled });
      post({ action: "ready" });
    },

    _onLifecycle(active) {
      if (globalThis.SFX && typeof globalThis.SFX.setAppActive === "function") {
        globalThis.SFX.setAppActive(Boolean(active));
      }
    }
  };

  globalThis.NativeBridge = NativeBridge;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => NativeBridge.notifyReady(), { once: true });
  } else {
    NativeBridge.notifyReady();
  }
})();
