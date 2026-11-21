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
      hpMult: 0.80,
      atkMult: 0.78,
      rewardMult: 1.0,
      desc: "每章 6 波 · 敌军眩晕 5% (0.35s) · 适合熟悉流派"
    },
    {
      id: "normal",
      name: "中等",
      wavesPerChapter: 10,
      stunChance: 0.10,
      stunDur: 0.45,
      hpMult: 0.96,
      atkMult: 0.92,
      rewardMult: 1.35,
      desc: "每章 10 波 · 敌军眩晕 10% (0.45s) · 标准进阶挑战"
    },
    {
      id: "hard",
      name: "困难",
      wavesPerChapter: 15,
      stunChance: 0.16,
      stunDur: 0.55,
      hpMult: 1.16,
      atkMult: 1.10,
      rewardMult: 1.75,
      desc: "每章 15 波 · 敌军眩晕 16% (0.55s) · 高压构筑考验"
    },
    {
      id: "nightmare",
      name: "噩梦",
      wavesPerChapter: 20,
      stunChance: 0.22,
      stunDur: 0.65,
      hpMult: 1.38,
      atkMult: 1.28,
      rewardMult: 2.35,
      desc: "每章 20 波 · 敌军眩晕 22% (0.65s) · 满强度噩梦人机"
    }
  ];

  // 13-node Star / Radial Tech Tree with prerequisites (x, y in 0..100 percentage coordinates)
  const META_UPGRADES = {
    star_core: {
      id: "star_core", branch: "center", name: "星陨指挥中枢", icon: "⭐",
      x: 50, y: 50, requires: [],
      maxLevel: 4, costs: [4, 10, 20, 36],
      desc: lv => `所有分支的星盘核心 · 全军基础生命与攻击 +${lv * 5}%（Lv.1 解锁四方星臂）`
    },
    // NORTH ARM: Economy & Interest
    startGold: {
      id: "startGold", branch: "econ", name: "初始军费金库", icon: "🪙",
      x: 50, y: 28, requires: [{ id: "star_core", lv: 1 }],
      maxLevel: 5, costs: [6, 11, 18, 28, 42],
      desc: lv => `开局初始金币 ${100 + lv * 10}G（每级 +10G，150G 封顶）`
    },
    interestBank: {
      id: "interestBank", branch: "econ", name: "星陨复利银行", icon: "🏦",
      x: 35, y: 12, requires: [{ id: "startGold", lv: 2 }],
      maxLevel: 4, costs: [10, 18, 30, 48],
      desc: lv => lv === 0
        ? "未解锁：升级后每波胜利按存款产生金币利息"
        : `每存 20G 产 +${1 + lv}G 利息（单波上限 +${[0, 15, 25, 35, 50][lv]}G）`
    },
    mercenaryRefund: {
      id: "mercenaryRefund", branch: "econ", name: "民兵退役补贴", icon: "💼",
      x: 65, y: 12, requires: [{ id: "startGold", lv: 1 }],
      maxLevel: 3, costs: [8, 16, 28],
      desc: lv => `1~2 费打工卡战后补贴 +${lv * 2}G/人，出售返现比例额外 +${lv * 10}%`
    },
    // EAST ARM: Army & Synergies
    popCap: {
      id: "popCap", branch: "army", name: "军团统帅编制", icon: "🚩",
      x: 74, y: 50, requires: [{ id: "star_core", lv: 1 }],
      maxLevel: 3, costs: [10, 22, 40],
      desc: lv => `开局默认出战人数上限 ${6 + lv} 人（最高 9 人）`
    },
    synergyMaster: {
      id: "synergyMaster", branch: "army", name: "羁绊共鸣徽章", icon: "🎖️",
      x: 89, y: 34, requires: [{ id: "popCap", lv: 1 }],
      maxLevel: 4, costs: [10, 20, 34, 52],
      desc: lv => `每激活 1 条职业或阵营羁绊，全军伤害与护盾额外 +${lv * 4}%`
    },
    vanguardReserve: {
      id: "vanguardReserve", branch: "army", name: "备战扩编营地", icon: "⛺",
      x: 89, y: 66, requires: [{ id: "popCap", lv: 1 }],
      maxLevel: 2, costs: [12, 26],
      desc: lv => `开局默认备战席位 ${2 + lv} 格（最高 4 格，方便留打工与羁绊卡）`
    },
    // SOUTH ARM: Slot Machine & High-Tier Odds
    reelTech: {
      id: "reelTech", branch: "reel", name: "星陨轮盘锻造", icon: "⚙️",
      x: 50, y: 72, requires: [{ id: "star_core", lv: 1 }],
      maxLevel: 4, costs: [8, 16, 28, 44],
      desc: lv => `轮盘升阶金币消耗 -${lv * 7}% · 狂热充能速度 +${lv * 8}%`
    },
    heroArchive: {
      id: "heroArchive", branch: "reel", name: "高阶英灵祝福", icon: "⚔️",
      x: 35, y: 88, requires: [{ id: "reelTech", lv: 1 }],
      maxLevel: 4, costs: [12, 22, 38, 60],
      desc: lv => `额外提升 4 费紫率 +${(lv * 0.9).toFixed(1)}% · 5 费金率 +${(lv * 0.15).toFixed(2)}%`
    },
    shopVault: {
      id: "shopVault", branch: "reel", name: "秘宝商会特许", icon: "🏪",
      x: 65, y: 88, requires: [{ id: "reelTech", lv: 2 }],
      maxLevel: 3, costs: [12, 24, 42],
      desc: lv => `解锁高级商店货品（神铸金骰/高级轮盘券）· 商店等级 Lv.${lv + 1}`
    },
    // WEST ARM: Cores & Rerolls
    coreWorkshop: {
      id: "coreWorkshop", branch: "core", name: "转运核心工坊", icon: "🎲",
      x: 26, y: 50, requires: [{ id: "star_core", lv: 1 }],
      maxLevel: 4, costs: [8, 16, 28, 46],
      desc: lv => `稀有/传说核心爆率 +${lv * 10}%${lv >= 2 ? " · 核心 4 选 1 已开启" : "（Lv.2 开启核心 4 选 1）"}`
    },
    coreReroll: {
      id: "coreReroll", branch: "core", name: "核心重铸许可", icon: "🔄",
      x: 11, y: 34, requires: [{ id: "coreWorkshop", lv: 1 }],
      maxLevel: 2, costs: [10, 24],
      desc: lv => `单局转运核心免费刷新次数：${1 + lv} 次（最多 3 次，之后消耗递增水晶）`
    },
    coreSlotMeta: {
      id: "coreSlotMeta", branch: "core", name: "遗物核心扩槽", icon: "💎",
      x: 11, y: 66, requires: [{ id: "coreWorkshop", lv: 2 }],
      maxLevel: 2, costs: [16, 34],
      desc: lv => `开局默认转运核心槽位 ${4 + lv} 格（最高 6 格）`
    }
  };

  function createDefaultMeta() {
    return {
      crystals: 10,
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
        star_core: 0,
        startGold: 0,
        interestBank: 0,
        mercenaryRefund: 0,
        popCap: 0,
        synergyMaster: 0,
        vanguardReserve: 0,
        reelTech: 0,
        heroArchive: 0,
        shopVault: 0,
        coreWorkshop: 0,
        coreReroll: 0,
        coreSlotMeta: 0
      }
    };
  }

  function loadMeta() {
    try {
      const raw = localStorage.getItem(META_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const base = createDefaultMeta();
        const upgrades = { ...base.upgrades, ...(parsed.upgrades || {}) };
        // If returning player already had child upgrades before the tree existed, auto-grant star_core Lv.1!
        const hasChild = Object.entries(upgrades).some(([k, v]) => k !== "star_core" && v > 0);
        if (hasChild && (upgrades.star_core || 0) < 1) upgrades.star_core = 1;
        return {
          ...base,
          ...parsed,
          codex: {
            heroes: parsed.codex?.heroes || [],
            evos: parsed.codex?.evos || [],
            enemies: parsed.codex?.enemies || []
          },
          unlockedChapters: { ...base.unlockedChapters, ...(parsed.unlockedChapters || {}) },
          upgrades
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

  function isUpgradeUnlocked(meta, key) {
    const def = META_UPGRADES[key];
    if (!def) return false;
    return (def.requires || []).every(req => (meta.upgrades?.[req.id] || 0) >= req.lv);
  }

  function getUpgradeReqText(meta, key) {
    const def = META_UPGRADES[key];
    if (!def || !def.requires?.length) return "";
    const missing = def.requires.filter(req => (meta.upgrades?.[req.id] || 0) < req.lv);
    if (!missing.length) return "";
    return "需前置：" + missing.map(r => `【${META_UPGRADES[r.id]?.name || r.id} Lv.${r.lv}】`).join(" + ");
  }

  function getUpgradeCost(meta, key) {
    const def = META_UPGRADES[key];
    if (!def) return null;
    const lv = meta.upgrades[key] || 0;
    if (lv >= def.maxLevel) return null;
    return def.costs[lv] ?? null;
  }

  function buyMetaUpgrade(meta, key) {
    if (!isUpgradeUnlocked(meta, key)) return false;
    const cost = getUpgradeCost(meta, key);
    if (cost === null || meta.crystals < cost) return false;
    meta.crystals -= cost;
    meta.upgrades[key] = (meta.upgrades[key] || 0) + 1;
    saveMeta(meta);
    return true;
  }

  function getMaxUnlockedRarityTier() {
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
    isUpgradeUnlocked,
    getUpgradeReqText,
    getUpgradeCost,
    buyMetaUpgrade,
    getMaxUnlockedRarityTier,
    unlockCodexHero,
    unlockCodexEvo,
    unlockCodexEnemy
  };
})();
