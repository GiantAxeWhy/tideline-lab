(() => {
  "use strict";

  const SYMBOLS = {
    knight: {
      id: "knight",
      kind: "unit",
      name: "圣盾骑士",
      short: "骑士",
      role: "前排 · 坦克",
      color: "#4fd1a5",
      bg: "#16382e",
      baseWeight: 22,
      hp: 155,
      atk: 14,
      atkCd: 1.15,
      range: 1,
      crit: 0.08,
      skillDesc: "前排承伤，开局自带 25 点护盾。",
      evolutions: {
        thorns: {
          id: "thorns",
          name: "荆棘圣殿",
          tag: "反伤嘲讽",
          desc: "受击反弹 35% 伤害，最大生命 +45%，攻速提升。",
          hpMult: 1.45,
          atkMult: 1.25
        },
        fortress: {
          id: "fortress",
          name: "铁壁要塞",
          tag: "圣盾光环",
          desc: "开局获得 50% 最大生命护盾，每 4 秒刷新护盾。",
          hpMult: 1.55,
          atkMult: 1.15
        }
      }
    },
    archer: {
      id: "archer",
      kind: "unit",
      name: "秘银游侠",
      short: "游侠",
      role: "后排 · 连射",
      color: "#5cc8ff",
      bg: "#142f42",
      baseWeight: 22,
      hp: 92,
      atk: 21,
      atkCd: 0.85,
      range: 4,
      crit: 0.16,
      skillDesc: "高速远程射击，精准打击敌方前排。",
      evolutions: {
        multishot: {
          id: "multishot",
          name: "疾风连射",
          tag: "双重箭矢",
          desc: "每次普攻同时发射 2 支箭矢（副箭造成 65% 伤害）。",
          hpMult: 1.25,
          atkMult: 1.28
        },
        sniper: {
          id: "sniper",
          name: "破甲狙击",
          tag: "必爆斩杀",
          desc: "每第 3 次攻击必定暴击造成 240% 穿透伤害。",
          hpMult: 1.2,
          atkMult: 1.45
        }
      }
    },
    mage: {
      id: "mage",
      kind: "unit",
      name: "雷鸣法师",
      short: "法师",
      role: "后排 · 群伤",
      color: "#b78bfa",
      bg: "#281c42",
      baseWeight: 18,
      hp: 86,
      atk: 20,
      atkCd: 1.25,
      range: 4,
      crit: 0.12,
      skillDesc: "释放连锁闪电，主目标受全额伤害并弹射 1 名敌人。",
      evolutions: {
        storm: {
          id: "storm",
          name: "天雷唤术",
          tag: "三重连锁",
          desc: "连锁闪电弹射至多 3 名敌人，法术伤害大幅提升。",
          hpMult: 1.22,
          atkMult: 1.42
        },
        frost: {
          id: "frost",
          name: "凛冬秘术",
          tag: "冰霜减速",
          desc: "释放寒冰新星造成范围伤害，并降低命中目标 35% 攻速。",
          hpMult: 1.32,
          atkMult: 1.32
        }
      }
    },
    priest: {
      id: "priest",
      kind: "unit",
      name: "圣光祭司",
      short: "祭司",
      role: "后排 · 支援",
      color: "#f7cf6d",
      bg: "#3b2f16",
      baseWeight: 16,
      hp: 100,
      atk: 13,
      atkCd: 1.3,
      range: 4,
      crit: 0.1,
      skillDesc: "发射圣光箭，同时治疗血量比例最低的友军。",
      evolutions: {
        seraph: {
          id: "seraph",
          name: "炽天使",
          tag: "双人圣疗",
          desc: "同时治疗 2 名友军，并赋予其 +20% 攻击力祝福。",
          hpMult: 1.32,
          atkMult: 1.35
        },
        artificer: {
          id: "artificer",
          name: "圣盾工匠",
          tag: "护盾充能",
          desc: "治疗同时为目标叠加厚重圣盾，并对敌方附加圣光灼烧。",
          hpMult: 1.38,
          atkMult: 1.28
        }
      }
    },
    assassin: {
      id: "assassin",
      kind: "unit",
      name: "暗影决斗士",
      short: "刺客",
      role: "突袭 · 爆发",
      color: "#ff6b7a",
      bg: "#3f1922",
      baseWeight: 15,
      hp: 96,
      atk: 26,
      atkCd: 0.9,
      range: 1.3,
      crit: 0.28,
      skillDesc: "高暴击近战，优先切入敌方脆弱的后排目标。",
      evolutions: {
        bladedancer: {
          id: "bladedancer",
          name: "嗜血刃舞",
          tag: "击杀连斩",
          desc: "暴击率 +15%，击杀敌人立即回复 25% 生命并重置攻击冷却。",
          hpMult: 1.3,
          atkMult: 1.4
        },
        shadowbomb: {
          id: "shadowbomb",
          name: "暗影爆破",
          tag: "暴击爆炸",
          desc: "每次暴击在目标周围引爆暗影冲击，造成 65% 范围溅射。",
          hpMult: 1.25,
          atkMult: 1.48
        }
      }
    },
    gold: {
      id: "gold",
      kind: "resource",
      name: "命运金币",
      short: "金币",
      role: "经济 · 爆发",
      color: "#ffd86b",
      bg: "#3d2f12",
      baseWeight: 13,
      skillDesc: "三连立即获得 +55 金币与 +1 次免费转动！"
    },
    joker: {
      id: "joker",
      kind: "wild",
      name: "命运百搭",
      short: "百搭",
      role: "万能 · 幸运",
      color: "#ff99e5",
      bg: "#3c1a38",
      baseWeight: 6,
      skillDesc: "可替代任意符号连线！参与召唤的单位获得【幸运强化】+20%全属性。"
    }
  };

  const UNIT_IDS = ["knight", "archer", "mage", "priest", "assassin"];
  const SYMBOL_IDS = Object.keys(SYMBOLS);

  const PAYLINES = [
    { id: "row0", cells: [0, 1, 2], label: "上排横线" },
    { id: "row1", cells: [3, 4, 5], label: "中排横线" },
    { id: "row2", cells: [6, 7, 8], label: "下排横线" },
    { id: "col0", cells: [0, 3, 6], label: "左列竖线" },
    { id: "col1", cells: [1, 4, 7], label: "中列竖线" },
    { id: "col2", cells: [2, 5, 8], label: "右列竖线" },
    { id: "diag0", cells: [0, 4, 8], label: "主对角线" },
    { id: "diag1", cells: [2, 4, 6], label: "副对角线" }
  ];

  const SYNERGIES = {
    knight: { name: "钢铁防线", req: 2, desc: "2+ 骑士：全军开局获得 +35 护盾" },
    archer: { name: "箭雨齐发", req: 2, desc: "2+ 游侠：全军攻击速度 +18%" },
    mage: { name: "奥术共鸣", req: 2, desc: "2+ 法师：全军技能与法术伤害 +25%" },
    priest: { name: "圣光庇护", req: 2, desc: "2+ 祭司：全军每 2 秒回复 4% 最大生命" },
    assassin: { name: "致命突袭", req: 2, desc: "2+ 刺客：全军暴击率 +18%" }
  };

  const CORES = [
    {
      id: "lucky_bell",
      name: "回响铜铃",
      rarity: "common",
      icon: "🔔",
      desc: "每波首次转动若未连线，立即返还 1 次免费转动。"
    },
    {
      id: "black_note",
      name: "黑桃密令",
      rarity: "rare",
      icon: "♠️",
      desc: "每波第 1 次转动时，正中心格必定出现【命运百搭】。"
    },
    {
      id: "coin_sack",
      name: "聚宝钱袋",
      rarity: "common",
      icon: "💰",
      desc: "转动落空获得 +14 金币安慰奖；连线成功额外 +10 金币。"
    },
    {
      id: "blast_cart",
      name: "连爆矿车",
      rarity: "rare",
      icon: "🧨",
      desc: "单次转动触发 2 条及以上连线时，额外奖励 +50 金币并全军永久 +2 攻击。"
    },
    {
      id: "devour_crest",
      name: "贪婪纹章",
      rarity: "rare",
      icon: "🩸",
      desc: "吞噬单位时，额外获得 +1 经验，并返还 18 金币。"
    },
    {
      id: "extra_lock",
      name: "机械卡榫",
      rarity: "common",
      icon: "🔒",
      desc: "单次锁格上限 +2（最多 4 格），且锁格费用减半。"
    },
    {
      id: "wild_surge",
      name: "狂野魔方",
      rarity: "legendary",
      icon: "🎲",
      desc: "【命运百搭】权重翻倍，且百搭连线召唤出的单位自带 +2 经验！"
    },
    {
      id: "vanguard_oath",
      name: "先锋誓约",
      rarity: "common",
      icon: "🛡️",
      desc: "前排单位最大生命 +30%，开局额外获得 30 点护盾。"
    },
    {
      id: "arcane_echo",
      name: "奥术回响",
      rarity: "rare",
      icon: "⚡",
      desc: "法师与祭司的攻击速度 +22%，连锁与治疗效果 +25%。"
    },
    {
      id: "crit_dice",
      name: "命运骰子",
      rarity: "rare",
      icon: "🎯",
      desc: "全军暴击率 +20%，暴击伤害从 165% 提升至 210%。"
    },
    {
      id: "interest_ledger",
      name: "复利账本",
      rarity: "common",
      icon: "📜",
      desc: "每波胜利后，每持有 20 金币额外产生 +5 金币利息（上限 +45）。"
    },
    {
      id: "berserk_banner",
      name: "血战军旗",
      rarity: "legendary",
      icon: "🚩",
      desc: "军团单位生命低于 55% 时，攻速与攻击力暴涨 45%。"
    },
    {
      id: "midas_reel",
      name: "点金滚轮",
      rarity: "legendary",
      icon: "👑",
      desc: "金币符号权重 +10；每次触发金币连线时，全军永久 +16 生命、+3 攻击。"
    },
    {
      id: "free_spin_gear",
      name: "永动齿轮",
      rarity: "rare",
      icon: "⚙️",
      desc: "每波开始额外获得 +2 次免费转动。"
    },
    {
      id: "royal_decree",
      name: "皇室敕令",
      rarity: "legendary",
      icon: "🏰",
      desc: "每次兵种连线有 40% 概率额外召唤 1 名同职业单位，且全军攻击 +12%。"
    }
  ];

  const WAVES = [
    {
      wave: 1,
      name: "斥候试探",
      boss: false,
      reward: 55,
      enemies: [
        { name: "哥布林刀手", kind: "melee", hp: 105, atk: 10, cd: 1.15, color: "#90be6d" },
        { name: "哥布林刀手", kind: "melee", hp: 105, atk: 10, cd: 1.15, color: "#90be6d" },
        { name: "短弓斥候", kind: "ranged", hp: 70, atk: 11, cd: 1.1, color: "#f9c74f" }
      ]
    },
    {
      wave: 2,
      name: "骸骨前哨",
      boss: false,
      reward: 65,
      enemies: [
        { name: "骸骨盾兵", kind: "tank", hp: 175, atk: 11, cd: 1.25, color: "#adb5bd" },
        { name: "骸骨射手", kind: "ranged", hp: 90, atk: 15, cd: 1.0, color: "#f9c74f" },
        { name: "骸骨射手", kind: "ranged", hp: 90, atk: 15, cd: 1.0, color: "#f9c74f" }
      ]
    },
    {
      wave: 3,
      name: "兽人突击队",
      boss: false,
      reward: 75,
      enemies: [
        { name: "兽人重斧", kind: "tank", hp: 235, atk: 17, cd: 1.2, color: "#f8961e" },
        { name: "兽人狂战", kind: "melee", hp: 165, atk: 20, cd: 0.95, color: "#f3722c" },
        { name: "萨满祭司", kind: "caster", hp: 120, atk: 18, cd: 1.25, color: "#c77dff" },
        { name: "短弓斥候", kind: "ranged", hp: 105, atk: 16, cd: 1.0, color: "#f9c74f" }
      ]
    },
    {
      wave: 4,
      name: "审判波次 · 赤甲战神",
      boss: true,
      bossTitle: "赤甲战神 · 格罗姆",
      bossSkill: "每 4.5 秒释放【裂地重击】对全体造成范围伤害并获得护盾",
      reward: 110,
      enemies: [
        { name: "赤甲战神", kind: "boss", bossId: "grom", hp: 680, atk: 30, cd: 1.35, color: "#ff595e" },
        { name: "兽人狂战", kind: "melee", hp: 180, atk: 18, cd: 1.0, color: "#f3722c" },
        { name: "兽人弩手", kind: "ranged", hp: 135, atk: 19, cd: 1.05, color: "#f9c74f" }
      ]
    },
    {
      wave: 5,
      name: "暗影伏击",
      boss: false,
      reward: 85,
      enemies: [
        { name: "黑铁重甲", kind: "tank", hp: 330, atk: 20, cd: 1.2, color: "#6c757d" },
        { name: "暗影刺客", kind: "assassin", hp: 195, atk: 30, cd: 0.88, color: "#ff4d6d" },
        { name: "暗影刺客", kind: "assassin", hp: 195, atk: 30, cd: 0.88, color: "#ff4d6d" },
        { name: "毒箭手", kind: "ranged", hp: 165, atk: 24, cd: 0.95, color: "#80ed99" }
      ]
    },
    {
      wave: 6,
      name: "冰霜死灵阵",
      boss: false,
      reward: 95,
      enemies: [
        { name: "霜甲骑士", kind: "tank", hp: 420, atk: 24, cd: 1.2, color: "#4cc9f0" },
        { name: "霜甲骑士", kind: "tank", hp: 380, atk: 22, cd: 1.2, color: "#4cc9f0" },
        { name: "死灵法师", kind: "caster", hp: 230, atk: 31, cd: 1.15, color: "#b5179e" },
        { name: "死灵法师", kind: "caster", hp: 230, atk: 31, cd: 1.15, color: "#b5179e" }
      ]
    },
    {
      wave: 7,
      name: "审判波次 · 深渊巫妖",
      boss: true,
      bossTitle: "深渊巫妖 · 玛尔扎",
      bossSkill: "每 4.2 秒释放【幽冥连锁】打击 3 名目标并汲取生命",
      reward: 130,
      enemies: [
        { name: "深渊巫妖", kind: "boss", bossId: "lich", hp: 1220, atk: 40, cd: 1.25, color: "#9d4edd" },
        { name: "骸骨重卫", kind: "tank", hp: 440, atk: 24, cd: 1.2, color: "#adb5bd" },
        { name: "暗影刺客", kind: "assassin", hp: 240, atk: 34, cd: 0.9, color: "#ff4d6d" },
        { name: "死灵法师", kind: "caster", hp: 260, atk: 32, cd: 1.15, color: "#c77dff" }
      ]
    },
    {
      wave: 8,
      name: "堕落圣殿团",
      boss: false,
      reward: 110,
      enemies: [
        { name: "堕落圣骑", kind: "tank", hp: 600, atk: 32, cd: 1.15, color: "#e63946" },
        { name: "堕落圣骑", kind: "tank", hp: 600, atk: 32, cd: 1.15, color: "#e63946" },
        { name: "猩红游侠", kind: "ranged", hp: 310, atk: 40, cd: 0.88, color: "#ff758f" },
        { name: "猩红游侠", kind: "ranged", hp: 310, atk: 40, cd: 0.88, color: "#ff758f" },
        { name: "鲜血祭司", kind: "caster", hp: 290, atk: 34, cd: 1.1, color: "#c9184a" }
      ]
    },
    {
      wave: 9,
      name: "炼狱双子卫队",
      boss: false,
      reward: 125,
      enemies: [
        { name: "熔岩巨像", kind: "tank", hp: 820, atk: 42, cd: 1.25, color: "#ff6d00" },
        { name: "熔岩巨像", kind: "tank", hp: 820, atk: 42, cd: 1.25, color: "#ff6d00" },
        { name: "炼狱魔导", kind: "caster", hp: 390, atk: 48, cd: 1.05, color: "#ff006e" },
        { name: "暗影处刑官", kind: "assassin", hp: 380, atk: 52, cd: 0.82, color: "#ff4d6d" },
        { name: "炼狱魔导", kind: "caster", hp: 390, atk: 48, cd: 1.05, color: "#ff006e" }
      ]
    },
    {
      wave: 10,
      name: "终极审判 · 厄运魔龙",
      boss: true,
      bossTitle: "命运吞噬者 · 厄运魔龙",
      bossSkill: "每 4.0 秒喷吐【毁灭龙息】灼烧全军并叠加狂暴攻速",
      reward: 200,
      enemies: [
        { name: "厄运魔龙", kind: "boss", bossId: "dragon", hp: 2450, atk: 62, cd: 1.2, color: "#ff2a55" },
        { name: "熔岩巨像", kind: "tank", hp: 780, atk: 38, cd: 1.25, color: "#ff6d00" },
        { name: "暗影处刑官", kind: "assassin", hp: 420, atk: 54, cd: 0.85, color: "#ff4d6d" },
        { name: "炼狱魔导", kind: "caster", hp: 420, atk: 50, cd: 1.05, color: "#ff006e" }
      ]
    }
  ];

  const FIELD_SLOTS = 6; // 0,1,2 front row; 3,4,5 back row
  const BENCH_SLOTS = 4;

  function createUnit(id, type, opts = {}) {
    return {
      id,
      type,
      xp: opts.xp || 0,
      evolution: opts.evolution || null,
      lucky: !!opts.lucky,
      bonusHp: opts.bonusHp || 0,
      bonusAtk: opts.bonusAtk || 0,
      bonusCrit: opts.bonusCrit || 0
    };
  }

  function unitLevel(unit) {
    if (unit.xp >= 5) return 3;
    if (unit.xp >= 2) return 2;
    return 1;
  }

  function hasCore(run, coreId) {
    return run.cores.includes(coreId);
  }

  function getUnitStats(unit, run) {
    const def = SYMBOLS[unit.type];
    const lvl = unitLevel(unit);
    let hp = def.hp * (1 + unit.xp * 0.28) + unit.bonusHp + (run?.globalBonusHp || 0);
    let atk = def.atk * (1 + unit.xp * 0.25) + unit.bonusAtk + (run?.globalBonusAtk || 0);
    let crit = def.crit + unit.bonusCrit + (lvl - 1) * 0.04;
    let atkCd = def.atkCd * (1 - (lvl - 1) * 0.06);

    if (unit.lucky) {
      hp *= 1.2;
      atk *= 1.2;
    }
    if (unit.evolution && def.evolutions[unit.evolution]) {
      const evo = def.evolutions[unit.evolution];
      hp *= evo.hpMult;
      atk *= evo.atkMult;
    }
    if (run) {
      if (hasCore(run, "royal_decree")) atk *= 1.12;
      if (hasCore(run, "crit_dice")) crit += 0.2;
      if (hasCore(run, "arcane_echo") && (unit.type === "mage" || unit.type === "priest")) {
        atkCd *= 0.78;
      }
      const fieldIdx = run.field.findIndex(u => u && u.id === unit.id);
      if (fieldIdx >= 0 && fieldIdx < 3 && hasCore(run, "vanguard_oath")) {
        hp *= 1.3;
      }
    }

    return {
      hp: Math.round(hp),
      atk: Math.round(atk),
      crit: Math.min(0.85, crit),
      atkCd: Math.max(0.35, atkCd),
      level: lvl
    };
  }

  function getActiveSynergies(run) {
    const counts = {};
    for (const u of run.field) {
      if (!u) continue;
      counts[u.type] = (counts[u.type] || 0) + 1;
    }
    return Object.entries(SYNERGIES).map(([type, info]) => ({
      type,
      ...info,
      count: counts[type] || 0,
      active: (counts[type] || 0) >= info.req
    }));
  }

  function createRun() {
    const weights = {};
    for (const id of SYMBOL_IDS) {
      weights[id] = SYMBOLS[id].baseWeight;
    }
    const field = Array(FIELD_SLOTS).fill(null);
    field[1] = createUnit(1, "knight");
    field[4] = createUnit(2, "archer");

    return {
      wave: 1,
      gold: 115,
      hp: 5,
      maxHp: 5,
      freeSpins: 2,
      paidSpinsThisWave: 0,
      spinsThisWave: 0,
      totalSpins: 0,
      totalMatches: 0,
      totalAbsorbs: 0,
      nextId: 3,
      field,
      bench: Array(BENCH_SLOTS).fill(null),
      board: ["knight", "archer", "mage", "gold", "joker", "priest", "assassin", "knight", "archer"],
      locked: [],
      lastLines: [],
      cores: [],
      weights,
      rigBoosts: {},
      globalBonusHp: 0,
      globalBonusAtk: 0,
      pendingEvolutions: [],
      pendingCoreChoices: null,
      outcome: null // null | "victory" | "defeat"
    };
  }

  function getEffectiveWeights(run) {
    const w = {};
    for (const id of SYMBOL_IDS) {
      let val = run.weights[id] ?? SYMBOLS[id].baseWeight;
      if (id === "joker" && hasCore(run, "wild_surge")) val *= 2;
      if (id === "gold" && hasCore(run, "midas_reel")) val += 10;
      w[id] = Math.max(2, val);
    }
    return w;
  }

  function getSymbolOdds(run) {
    const w = getEffectiveWeights(run);
    const total = Object.values(w).reduce((a, b) => a + b, 0);
    const odds = {};
    for (const id of SYMBOL_IDS) {
      odds[id] = w[id] / total;
    }
    return odds;
  }

  function rollSymbol(run) {
    const w = getEffectiveWeights(run);
    const total = Object.values(w).reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (const id of SYMBOL_IDS) {
      r -= w[id];
      if (r <= 0) return id;
    }
    return "knight";
  }

  function getMaxLocks(run) {
    return hasCore(run, "extra_lock") ? 4 : 2;
  }

  function getLockCost(run) {
    return hasCore(run, "extra_lock") ? 5 : 10;
  }

  function getSpinCost(run) {
    if (run.freeSpins > 0) return 0;
    return 20 + run.paidSpinsThisWave * 10;
  }

  function getTotalSpinCost(run) {
    return getSpinCost(run) + run.locked.length * getLockCost(run);
  }

  function evaluateBoard(board) {
    const hits = [];
    for (const line of PAYLINES) {
      const syms = line.cells.map(i => board[i]);
      const nonWild = syms.filter(s => s !== "joker");
      if (nonWild.length === 0) {
        hits.push({ ...line, symbol: "joker", hasWild: true, superJackpot: true });
      } else if (nonWild.every(s => s === nonWild[0])) {
        hits.push({
          ...line,
          symbol: nonWild[0],
          hasWild: nonWild.length < 3,
          superJackpot: false
        });
      }
    }
    return hits;
  }

  function addUnitToRoster(run, unit) {
    // Prefer appropriate row: tanks/assassins front (0..2), ranged/support back (3..5)
    const isFront = unit.type === "knight" || unit.type === "assassin";
    const order = isFront ? [1, 0, 2, 4, 3, 5] : [4, 3, 5, 1, 0, 2];
    for (const idx of order) {
      if (!run.field[idx]) {
        run.field[idx] = unit;
        return { placed: "field", index: idx };
      }
    }
    for (let i = 0; i < run.bench.length; i += 1) {
      if (!run.bench[i]) {
        run.bench[i] = unit;
        return { placed: "bench", index: i };
      }
    }
    // Roster completely full -> auto-convert into XP for same-type unit or gold!
    const allUnits = [...run.field, ...run.bench].filter(Boolean);
    const same = allUnits.find(u => u.type === unit.type);
    if (same) {
      const before = unitLevel(same);
      same.xp += 1;
      if (before < 2 && unitLevel(same) >= 2 && !same.evolution && !run.pendingEvolutions.includes(same.id)) {
        run.pendingEvolutions.push(same.id);
      }
      run.gold += 15;
      return { placed: "overflow_xp", target: same.id, gold: 15 };
    }
    run.gold += 25;
    return { placed: "overflow_gold", gold: 25 };
  }

  function executeSpin(run) {
    const cost = getTotalSpinCost(run);
    if (run.gold < cost) return null;

    run.gold -= cost;
    const usedFree = run.freeSpins > 0;
    if (usedFree) {
      run.freeSpins -= 1;
    } else {
      run.paidSpinsThisWave += 1;
    }
    run.spinsThisWave += 1;
    run.totalSpins += 1;

    const nextBoard = Array.from({ length: 9 }, (_, i) =>
      run.locked.includes(i) ? run.board[i] : rollSymbol(run)
    );

    if (run.spinsThisWave === 1 && hasCore(run, "black_note") && !run.locked.includes(4)) {
      nextBoard[4] = "joker";
    }

    run.board = nextBoard;
    run.locked = [];

    const hits = evaluateBoard(nextBoard);
    run.lastLines = hits;

    const summary = {
      board: [...nextBoard],
      hits,
      goldGained: 0,
      freeSpinsGained: 0,
      summoned: [],
      notes: []
    };

    if (hits.length === 0) {
      if (run.spinsThisWave === 1 && hasCore(run, "lucky_bell")) {
        run.freeSpins += 1;
        summary.freeSpinsGained += 1;
        summary.notes.push("回响铜铃触发：+1 免费转动！");
      }
      if (hasCore(run, "coin_sack")) {
        run.gold += 14;
        summary.goldGained += 14;
        summary.notes.push("聚宝钱袋：+14 金币");
      }
      return summary;
    }

    run.totalMatches += hits.length;

    if (hasCore(run, "coin_sack")) {
      run.gold += 10;
      summary.goldGained += 10;
    }

    if (hits.length >= 2) {
      const comboGold = 25 * (hits.length - 1);
      run.gold += comboGold;
      summary.goldGained += comboGold;
      summary.notes.push(`${hits.length} 重连线暴击！额外 +${comboGold} 金币`);

      if (hasCore(run, "blast_cart")) {
        run.gold += 50;
        run.globalBonusAtk += 2;
        summary.goldGained += 50;
        summary.notes.push("连爆矿车：+50 金币，全军永久 +2 攻击！");
      }
    }

    for (const hit of hits) {
      if (hit.superJackpot) {
        run.gold += 120;
        summary.goldGained += 120;
        const randType = UNIT_IDS[Math.floor(Math.random() * UNIT_IDS.length)];
        const unit = createUnit(run.nextId++, randType, { xp: 2, lucky: true });
        addUnitToRoster(run, unit);
        if (!run.pendingEvolutions.includes(unit.id)) {
          run.pendingEvolutions.push(unit.id);
        }
        summary.summoned.push(unit);
        summary.notes.push("三王大满贯！+120 金币 & 召唤 2 级幸运精锐！");
      } else if (hit.symbol === "gold") {
        run.gold += 55;
        run.freeSpins += 1;
        summary.goldGained += 55;
        summary.freeSpinsGained += 1;
        if (hasCore(run, "midas_reel")) {
          run.globalBonusHp += 16;
          run.globalBonusAtk += 3;
          summary.notes.push("点金滚轮：全军永久 +16 生命、+3 攻击！");
        }
      } else {
        const extraXp = (hits.length >= 2 ? 1 : 0) + (hit.hasWild && hasCore(run, "wild_surge") ? 2 : 0);
        const spawnOne = () => {
          const unit = createUnit(run.nextId++, hit.symbol, {
            xp: extraXp,
            lucky: hit.hasWild
          });
          const placement = addUnitToRoster(run, unit);
          if (unitLevel(unit) >= 2 && !unit.evolution && placement.placed !== "overflow_gold" && placement.placed !== "overflow_xp") {
            if (!run.pendingEvolutions.includes(unit.id)) {
              run.pendingEvolutions.push(unit.id);
            }
          }
          summary.summoned.push(unit);
        };
        spawnOne();
        if (hasCore(run, "royal_decree") && Math.random() < 0.4) {
          spawnOne();
          summary.notes.push("皇室敕令：额外召唤 1 名同职业单位！");
        }
      }
    }

    return summary;
  }

  function findUnitLocation(run, unitId) {
    const fIdx = run.field.findIndex(u => u && u.id === unitId);
    if (fIdx !== -1) return { area: "field", index: fIdx, unit: run.field[fIdx] };
    const bIdx = run.bench.findIndex(u => u && u.id === unitId);
    if (bIdx !== -1) return { area: "bench", index: bIdx, unit: run.bench[bIdx] };
    return null;
  }

  function swapSlots(run, fromArea, fromIdx, toArea, toIdx) {
    if (fromArea === toArea && fromIdx === toIdx) return false;
    const srcArr = fromArea === "field" ? run.field : run.bench;
    const dstArr = toArea === "field" ? run.field : run.bench;
    const temp = srcArr[fromIdx];
    srcArr[fromIdx] = dstArr[toIdx];
    dstArr[toIdx] = temp;
    return true;
  }

  function absorbUnit(run, targetId, donorId) {
    if (targetId === donorId) return null;
    const tLoc = findUnitLocation(run, targetId);
    const dLoc = findUnitLocation(run, donorId);
    if (!tLoc || !dLoc) return null;

    const target = tLoc.unit;
    const donor = dLoc.unit;
    const beforeLevel = unitLevel(target);
    const sameClass = target.type === donor.type;

    let xpGain = (sameClass ? 2 : 1) + Math.floor(donor.xp / 2);
    if (hasCore(run, "devour_crest")) {
      xpGain += 1;
      run.gold += 18;
    }
    target.xp += xpGain;
    if (donor.lucky) target.lucky = true;

    // Cross-class inheritance mini-trait!
    let inherited = "";
    if (!sameClass) {
      if (donor.type === "knight") { target.bonusHp += 28; inherited = "+28 生命"; }
      else if (donor.type === "archer") { target.bonusAtk += 5; inherited = "+5 攻击"; }
      else if (donor.type === "mage") { target.bonusAtk += 6; inherited = "+6 法强"; }
      else if (donor.type === "priest") { target.bonusHp += 20; target.bonusAtk += 3; inherited = "+20 生命 +3 攻击"; }
      else if (donor.type === "assassin") { target.bonusCrit += 0.06; inherited = "+6% 暴击"; }
    } else {
      target.bonusHp += 15;
      target.bonusAtk += 4;
      inherited = "同职共鸣 +15 生命 +4 攻击";
    }

    // Remove donor
    if (dLoc.area === "field") run.field[dLoc.index] = null;
    else run.bench[dLoc.index] = null;

    run.totalAbsorbs += 1;

    const afterLevel = unitLevel(target);
    let triggeredEvo = false;
    if (beforeLevel < 2 && afterLevel >= 2 && !target.evolution) {
      if (!run.pendingEvolutions.includes(target.id)) {
        run.pendingEvolutions.push(target.id);
      }
      triggeredEvo = true;
    }

    return { target, xpGain, sameClass, inherited, triggeredEvo };
  }

  function sellUnit(run, unitId) {
    const loc = findUnitLocation(run, unitId);
    if (!loc) return 0;
    const deployedCount = run.field.filter(Boolean).length;
    if (loc.area === "field" && deployedCount <= 1 && run.bench.every(u => !u)) {
      return 0; // Keep at least 1 unit alive
    }
    const value = 15 + loc.unit.xp * 10;
    run.gold += value;
    if (loc.area === "field") run.field[loc.index] = null;
    else run.bench[loc.index] = null;
    run.pendingEvolutions = run.pendingEvolutions.filter(id => id !== unitId);
    return value;
  }

  function applyEvolution(run, unitId, evoId) {
    const loc = findUnitLocation(run, unitId);
    if (!loc) return false;
    const def = SYMBOLS[loc.unit.type];
    if (!def.evolutions[evoId]) return false;
    loc.unit.evolution = evoId;
    run.pendingEvolutions = run.pendingEvolutions.filter(id => id !== unitId);
    return true;
  }

  function boostSymbolWeight(run, symId) {
    const count = run.rigBoosts[symId] || 0;
    const cost = 25 + count * 15;
    if (run.gold < cost || count >= 4) return false;
    run.gold -= cost;
    run.weights[symId] = (run.weights[symId] || SYMBOLS[symId].baseWeight) + 12;
    run.rigBoosts[symId] = count + 1;
    return true;
  }

  function reduceSymbolWeight(run, symId) {
    const cost = 30;
    const current = run.weights[symId] ?? SYMBOLS[symId].baseWeight;
    if (run.gold < cost || current <= 4) return false;
    run.gold -= cost;
    run.weights[symId] = Math.max(4, current - 10);
    return true;
  }

  function draftCoreChoices(run) {
    const pool = CORES.filter(c => !run.cores.includes(c.id));
    if (pool.length === 0) return [];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(3, shuffled.length)).map(c => c.id);
  }

  function pickCore(run, coreId) {
    if (!run.cores.includes(coreId)) {
      run.cores.push(coreId);
      if (coreId === "free_spin_gear") {
        run.freeSpins += 2;
      }
    }
    run.pendingCoreChoices = null;
  }

  function resolveWave(run, won) {
    const waveDef = WAVES[run.wave - 1];
    let reward = won ? waveDef.reward : Math.round(waveDef.reward * 0.65);
    let interest = 0;
    if (won && hasCore(run, "interest_ledger")) {
      interest = Math.min(45, Math.floor(run.gold / 20) * 5);
      reward += interest;
    }
    run.gold += reward;

    const dmg = won ? 0 : (waveDef.boss ? 2 : 1);
    run.hp = Math.max(0, run.hp - dmg);

    if (run.hp <= 0) {
      run.outcome = "defeat";
      return { won, reward, interest, dmg, finished: true };
    }
    if (won && run.wave >= WAVES.length) {
      run.outcome = "victory";
      return { won, reward, interest, dmg, finished: true };
    }

    // Advance wave if won, or advance anyway after taking damage so run progresses
    if (run.wave < WAVES.length) {
      run.wave += 1;
    }
    run.freeSpins = 2 + (hasCore(run, "free_spin_gear") ? 2 : 0);
    run.paidSpinsThisWave = 0;
    run.spinsThisWave = 0;
    run.locked = [];
    run.lastLines = [];

    // Offer a Roguelike Core choice after every wave!
    if (run.cores.length < 6) {
      run.pendingCoreChoices = draftCoreChoices(run);
    }

    return { won, reward, interest, dmg, finished: false };
  }

  function getTotalPower(run) {
    return run.field.filter(Boolean).reduce((sum, u) => {
      const s = getUnitStats(u, run);
      return sum + Math.round(s.atk * 2.5 + s.hp * 0.35);
    }, 0);
  }

  globalThis.Slotbound = {
    SYMBOLS,
    UNIT_IDS,
    SYMBOL_IDS,
    PAYLINES,
    SYNERGIES,
    CORES,
    WAVES,
    FIELD_SLOTS,
    BENCH_SLOTS,
    createRun,
    createUnit,
    unitLevel,
    hasCore,
    getUnitStats,
    getActiveSynergies,
    getEffectiveWeights,
    getSymbolOdds,
    getMaxLocks,
    getLockCost,
    getSpinCost,
    getTotalSpinCost,
    evaluateBoard,
    executeSpin,
    findUnitLocation,
    swapSlots,
    absorbUnit,
    sellUnit,
    applyEvolution,
    boostSymbolWeight,
    reduceSymbolWeight,
    pickCore,
    resolveWave,
    getTotalPower
  };
})();
