(() => {
  "use strict";

  const META_KEY = "slotbound-meta-v2";

  const DIFFICULTIES = [
    {
      id: "easy",
      name: "简单",
      wavesPerChapter: 6,
      stunChance: 0.05,
      stunDur: 0.35,
      hpMult: 0.82,
      atkMult: 0.80,
      rewardMult: 1.0,
      desc: "每章 6 波 · 敌军眩晕 5% (0.35s) · 适合熟悉流派"
    },
    {
      id: "normal",
      name: "中等",
      wavesPerChapter: 10,
      stunChance: 0.10,
      stunDur: 0.45,
      hpMult: 1.0,
      atkMult: 0.96,
      rewardMult: 1.35,
      desc: "每章 10 波 · 敌军眩晕 10% (0.45s) · 标准进阶挑战"
    },
    {
      id: "hard",
      name: "困难",
      wavesPerChapter: 15,
      stunChance: 0.16,
      stunDur: 0.55,
      hpMult: 1.22,
      atkMult: 1.15,
      rewardMult: 1.75,
      desc: "每章 15 波 · 敌军眩晕 16% (0.55s) · 高压构筑考验"
    },
    {
      id: "nightmare",
      name: "噩梦",
      wavesPerChapter: 20,
      stunChance: 0.22,
      stunDur: 0.65,
      hpMult: 1.48,
      atkMult: 1.38,
      rewardMult: 2.4,
      desc: "每章 20 波 · 敌军眩晕 22% (0.65s) · 当前满强度噩梦人机"
    }
  ];

  const META_UPGRADES = {
    startGold: {
      id: "startGold",
      name: "初始军费金库",
      icon: "🪙",
      maxLevel: 5,
      costs: [4, 6, 9, 12, 16],
      desc: lv => `开局初始金币 ${100 + lv * 10}G（每级 +10G，150G 封顶）`
    },
    popCap: {
      id: "popCap",
      name: "军团统帅编制",
      icon: "🚩",
      maxLevel: 3,
      costs: [6, 11, 18],
      desc: lv => `开局默认出战人数上限 ${6 + lv} 人（最高 9 人）`
    },
    coreWorkshop: {
      id: "coreWorkshop",
      name: "转运核心工坊",
      icon: "🎲",
      maxLevel: 4,
      costs: [5, 9, 14, 20],
      desc: lv => `解锁更多高阶核心 · 稀有/传说率 +${lv * 12}%${lv >= 2 ? " · 核心 4 选 1" : ""}`
    },
    reelTech: {
      id: "reelTech",
      name: "星陨轮盘锻造",
      icon: "⚙️",
      maxLevel: 4,
      costs: [5, 10, 15, 22],
      desc: lv => `解锁轮盘最高阶至 Lv.${Math.min(5, 2 + lv)} · 升阶费用 -${lv * 8}%`
    },
    shopVault: {
      id: "shopVault",
      name: "秘宝商会特许",
      icon: "🏪",
      maxLevel: 3,
      costs: [5, 10, 16],
      desc: lv => `解锁高级商店货品（含神铸金骰、星界卷轴等）· 商店等级 Lv.${lv + 1}`
    },
    interestBank: {
      id: "interestBank",
      name: "星陨复利银行",
      icon: "🏦",
      maxLevel: 4,
      costs: [4, 7, 11, 16],
      desc: lv => lv === 0
        ? "未解锁：升级后每波胜利按存款产生金币利息"
        : `每存 20G 产 +${1 + lv}G 利息（单波上限 +${[0, 15, 25, 35, 50][lv]}G）`
    },
    coreReroll: {
      id: "coreReroll",
      name: "核心重铸许可",
      icon: "🔄",
      maxLevel: 2,
      costs: [5, 10],
      desc: lv => `单局转运核心免费刷新次数：${1 + lv} 次（最多 3 次，之后消耗递增水晶）`
    },
    heroArchive: {
      id: "heroArchive",
      name: "高阶英灵祝福",
      icon: "⚔️",
      maxLevel: 4,
      costs: [5, 9, 14, 20],
      desc: lv => `全卡池已开放 · 额外提升紫率 +${(lv * 1.5).toFixed(1)}% · 金率 +${(lv * 0.25).toFixed(2)}%`
    }
  };

  function createDefaultMeta() {
    return {
      crystals: 12, // Starting war-hall crystals so new players can try an upgrade right away
      // Unlocked chapters per difficulty (chapter 1..5). Start with Ch1 unlocked on Easy!
      unlockedChapters: {
        easy: 1,
        normal: 0,
        hard: 0,
        nightmare: 0
      },
      clearedDiffs: [],
      selectedChapter: 1,
      selectedDifficulty: "easy",
      codex: {
        heroes: [],
        evos: [],
        enemies: []
      },
      upgrades: {
        startGold: 0,
        popCap: 0,
        coreWorkshop: 0,
        reelTech: 0,
        shopVault: 0,
        interestBank: 0,
        coreReroll: 0,
        heroArchive: 0
      }
    };
  }

  function loadMeta() {
    try {
      const raw = localStorage.getItem(META_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const base = createDefaultMeta();
        return {
          ...base,
          ...parsed,
          codex: {
            heroes: parsed.codex?.heroes || [],
            evos: parsed.codex?.evos || [],
            enemies: parsed.codex?.enemies || []
          },
          unlockedChapters: { ...base.unlockedChapters, ...(parsed.unlockedChapters || {}) },
          upgrades: { ...base.upgrades, ...(parsed.upgrades || {}) }
        };
      }
    } catch {}
    return createDefaultMeta();
  }

  function saveMeta(meta) {
    try {
      localStorage.setItem(META_KEY, JSON.stringify(meta));
    } catch {}
  }

  function getDifficulty(id) {
    return DIFFICULTIES.find(d => d.id === id) || DIFFICULTIES[0];
  }

  function isDifficultyUnlocked(meta, diffId) {
    if (diffId === "easy") return true;
    return (meta.unlockedChapters[diffId] || 0) >= 1;
  }

  function isChapterUnlocked(meta, diffId, chapterId) {
    if (!isDifficultyUnlocked(meta, diffId)) return false;
    return chapterId <= (meta.unlockedChapters[diffId] || 0);
  }

  function recordChapterClear(meta, diffId, chapterId) {
    const cur = meta.unlockedChapters[diffId] || 0;
    if (chapterId >= cur && chapterId < 5) {
      meta.unlockedChapters[diffId] = chapterId + 1;
    }
    // Clearing Chapter 1 (or any chapter >= 1) on a difficulty unlocks the next difficulty's Chapter 1!
    const diffIdx = DIFFICULTIES.findIndex(d => d.id === diffId);
    if (diffIdx >= 0 && diffIdx < DIFFICULTIES.length - 1) {
      const nextDiff = DIFFICULTIES[diffIdx + 1].id;
      if ((meta.unlockedChapters[nextDiff] || 0) < 1) {
        meta.unlockedChapters[nextDiff] = 1;
      }
    }
    if (chapterId === 5 && !meta.clearedDiffs.includes(diffId)) {
      meta.clearedDiffs.push(diffId);
    }
    saveMeta(meta);
  }

  function getUpgradeCost(meta, key) {
    const def = META_UPGRADES[key];
    if (!def) return null;
    const lv = meta.upgrades[key] || 0;
    if (lv >= def.maxLevel) return null;
    return def.costs[lv] ?? null;
  }

  function buyMetaUpgrade(meta, key) {
    const cost = getUpgradeCost(meta, key);
    if (cost === null || meta.crystals < cost) return false;
    meta.crystals -= cost;
    meta.upgrades[key] = (meta.upgrades[key] || 0) + 1;
    saveMeta(meta);
    return true;
  }

  function getMaxUnlockedRarityTier() {
    // All 1~5 cost pools are naturally gated by Reel Tier Lv.1~Lv.5; heroArchive boosts high-tier drop odds!
    return 5;
  }

  function unlockCodexHero(meta, heroId) {
    if (!meta || !heroId) return false;
    meta.codex ??= { heroes: [], evos: [], enemies: [] };
    if (meta.codex.heroes.includes(heroId)) return false;
    meta.codex.heroes.push(heroId);
    meta.crystals = (meta.crystals || 0) + 1;
    saveMeta(meta);
    return true;
  }

  function unlockCodexEvo(meta, heroId, evoId) {
    if (!meta || !heroId || !evoId) return false;
    meta.codex ??= { heroes: [], evos: [], enemies: [] };
    const key = `${heroId}:${evoId}`;
    if (meta.codex.evos.includes(key)) return false;
    meta.codex.evos.push(key);
    saveMeta(meta);
    return true;
  }

  function unlockCodexEnemy(meta, enemyKey) {
    if (!meta || !enemyKey) return false;
    meta.codex ??= { heroes: [], evos: [], enemies: [] };
    if (meta.codex.enemies.includes(enemyKey)) return false;
    meta.codex.enemies.push(enemyKey);
    meta.crystals = (meta.crystals || 0) + 1;
    saveMeta(meta);
    return true;
  }

  globalThis.SlotboundMeta = {
    DIFFICULTIES,
    META_UPGRADES,
    loadMeta,
    saveMeta,
    getDifficulty,
    isDifficultyUnlocked,
    isChapterUnlocked,
    recordChapterClear,
    getUpgradeCost,
    buyMetaUpgrade,
    getMaxUnlockedRarityTier,
    unlockCodexHero,
    unlockCodexEvo,
    unlockCodexEnemy
  };
})();
