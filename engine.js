(() => {
  "use strict";

  function evolution(id, name, tag, desc, hpMult, atkMult, tier3 = null) {
    return { id, name, tag, desc, hpMult, atkMult, tier3 };
  }

  const SYMBOLS = {
    knight: {
      id: "knight",
      kind: "unit",
      name: "圣盾步兵",
      short: "步兵",
      role: "前排 · 坦克",
      color: "#4fd1a5",
      bg: "#16382e",
      baseWeight: 18,
      hp: 165,
      atk: 15,
      atkCd: 1.15,
      moveSpd: 92,
      range: 52,
      crit: 0.08,
      skillDesc: "前排坚实步兵，开局自带圣盾壁垒与受击反伤。",
      evolutions: {
        thorns: evolution("thorns", "荆棘重盾", "反伤嘲讽", "受击反弹 35% 伤害，最大生命 +45%，攻速提升。", 1.45, 1.25, {
          iron_maiden: evolution("iron_maiden", "血棘暴君", "极致反伤", "受击反弹提升至 65%，每次受击回复 6% 生命！", 1.55, 1.35),
          war_colossus: evolution("war_colossus", "震地巨像", "重击震荡", "每第 3 次攻击释放震荡波，眩晕周围敌军并造成范围重伤！", 1.65, 1.4)
        }),
        fortress: evolution("fortress", "铁壁要塞", "圣盾刷新", "开局获得 50% 最大生命护盾，每 4 秒刷新护盾。", 1.55, 1.15, {
          aegis_bastion: evolution("aegis_bastion", "圣域壁垒", "群体护盾", "每 3.5 秒为全体友军叠加厚重圣盾，铁桶阵核心！", 1.6, 1.25),
          immortal_guard: evolution("immortal_guard", "不朽卫士", "锁血反盾", "每战首次受致命伤锁血无敌 3 秒并立即回满 55% 护盾！", 1.7, 1.3)
        })
      }
    },
    archer: {
      id: "archer",
      kind: "unit",
      name: "秘银弓手",
      short: "弓手",
      role: "后排 · 连射",
      color: "#5cc8ff",
      bg: "#142f42",
      baseWeight: 18,
      hp: 92,
      atk: 21,
      atkCd: 0.85,
      moveSpd: 108,
      range: 310,
      crit: 0.16,
      skillDesc: "高速远程弓手，每 3 击齐射追踪箭矢。",
      evolutions: {
        multishot: evolution("multishot", "疾风连射", "双重箭矢", "每次普攻同时发射 2 支箭矢（副箭造成 65% 伤害）。", 1.25, 1.28, {
          arrow_tempest: evolution("arrow_tempest", "箭雨风暴", "三重齐射", "每次普攻齐射 3 支追踪箭矢，清杂效率翻倍！", 1.32, 1.45),
          gale_ranger: evolution("gale_ranger", "飓风游侠", "极速溅射", "攻速飙升 +35%，箭矢命中引发疾风范围溅射！", 1.3, 1.4)
        }),
        sniper: evolution("sniper", "破甲狙击", "必爆斩杀", "每第 3 次攻击必定暴击造成 240% 穿透伤害。", 1.2, 1.45, {
          rail_marksman: evolution("rail_marksman", "穿云神射", "双倍破盾", "每第 2 次攻击必定暴击造成 280% 穿透并双倍破盾！", 1.28, 1.6),
          headhunter: evolution("headhunter", "赏金猎手", "斩杀爆金", "对半血以下敌军造成 320% 斩杀重伤，击杀额外 +5 金币！", 1.3, 1.52)
        })
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
      baseWeight: 17,
      hp: 86,
      atk: 20,
      atkCd: 1.25,
      moveSpd: 98,
      range: 270,
      crit: 0.12,
      skillDesc: "释放连锁闪电，主目标受全额伤害并弹射额外敌人。",
      evolutions: {
        storm: evolution("storm", "天雷唤术", "三重连锁", "连锁闪电弹射至多 3 名敌人，法术伤害大幅提升。", 1.22, 1.42, {
          zeus_archon: evolution("zeus_archon", "雷霆主宰", "五重天雷", "连锁闪电飙升至 5 名敌人，伤害 +45% 且暴击麻痹！", 1.3, 1.58),
          arcane_nova: evolution("arcane_nova", "奥术崩星", "闪电爆裂", "每次连锁闪电在主目标处引爆奥术冲击，毁灭人海！", 1.32, 1.52)
        }),
        frost: evolution("frost", "凛冬秘术", "冰霜减速", "释放寒冰新星造成范围伤害，并降低命中目标 35% 攻速。", 1.32, 1.32, {
          glacier_empress: evolution("glacier_empress", "极冰女巫", "群体冻结", "寒冰新星范围扩大并冻结目标 0.8 秒，强控战场！", 1.42, 1.48),
          astral_chrono: evolution("astral_chrono", "星界时法", "时空加速", "减速敌军同时为全军赋予 +18% 攻速时空加速！", 1.4, 1.42)
        })
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
      baseWeight: 15,
      hp: 100,
      atk: 13,
      atkCd: 1.3,
      moveSpd: 96,
      range: 255,
      crit: 0.1,
      skillDesc: "发射圣光箭，同时治疗血量比例最低的友军。",
      evolutions: {
        seraph: evolution("seraph", "炽天使", "双人圣疗", "同时治疗 2 名友军，并赋予其 +20% 攻击力祝福。", 1.32, 1.35, {
          radiant_saint: evolution("radiant_saint", "辉光圣女", "三人圣疗", "同时治疗 3 名友军，并赋予 +35% 攻击力圣光祝福！", 1.45, 1.5),
          judgement_angel: evolution("judgement_angel", "审判炽天使", "圣光天罚", "治疗同时降下圣光天罚，对敌方最高血目标造成 220% 圣伤！", 1.4, 1.58)
        }),
        artificer: evolution("artificer", "圣盾工匠", "护盾充能", "治疗同时为目标叠加厚重圣盾，强化生存。", 1.38, 1.28, {
          aegis_oracle: evolution("aegis_oracle", "圣佑先知", "群体圣盾", "治疗同时为 3 名友军叠加 130% 护盾，对抗爆发神技！", 1.5, 1.42),
          war_chaplain: evolution("war_chaplain", "战歌牧师", "战歌赏金", "存活时全军攻速 +20%，每次施法额外产出 +3 金币！", 1.42, 1.45)
        })
      }
    },
    assassin: {
      id: "assassin",
      kind: "unit",
      name: "暗影刺客",
      short: "刺客",
      role: "前排 · 突袭",
      color: "#ff6b7a",
      bg: "#3f1922",
      baseWeight: 16,
      hp: 98,
      atk: 26,
      atkCd: 0.9,
      moveSpd: 165,
      range: 54,
      crit: 0.28,
      skillDesc: "高移速高暴击近战，优先切入敌方脆弱的后排目标。",
      evolutions: {
        bladedancer: evolution("bladedancer", "嗜血刃舞", "击杀连斩", "暴击率 +15%，击杀敌人立即回复 25% 生命并重置攻击冷却。", 1.3, 1.4, {
          crimson_reaper: evolution("crimson_reaper", "猩红收割者", "杀戮叠加", "暴击率再 +15%，每次击杀本战永久 +12% 攻击力！", 1.38, 1.58),
          phantom_blade: evolution("phantom_blade", "幻影剑圣", "双重瞬斩", "每第 2 次攻击瞬间打出双重暴击连斩，爆发拉满！", 1.35, 1.55)
        }),
        shadowbomb: evolution("shadowbomb", "暗影爆破", "暴击爆炸", "每次暴击在目标周围引爆暗影冲击，造成 65% 范围溅射。", 1.25, 1.48, {
          void_detonator: evolution("void_detonator", "虚空爆裂者", "破盾大爆", "暴击引爆超大范围 110% 暗影爆破并双倍破盾！", 1.32, 1.62),
          venom_stalker: evolution("venom_stalker", "剧毒影魔", "影毒减速", "暴击溅射附带减速与 25% 吸血，持续收割后排！", 1.4, 1.52)
        })
      }
    },
    valkyrie: {
      id: "valkyrie",
      kind: "unit",
      name: "圣枪骑兵",
      short: "骑兵",
      role: "前排 · 冲锋",
      color: "#f8e296",
      bg: "#403a21",
      baseWeight: 16,
      hp: 152,
      atk: 23,
      atkCd: 1.08,
      moveSpd: 142,
      range: 92,
      crit: 0.16,
      skillDesc: "高速长枪骑兵，穿透前后排并对护盾造成双倍伤害。",
      evolutions: {
        sky_charge: evolution("sky_charge", "冲锋轻骑", "击退冲锋", "开战冲锋，击退并眩晕敌方前排。", 1.34, 1.42, {
          thunder_lancer: evolution("thunder_lancer", "雷霆龙骑", "雷暴穿透", "长枪穿透最多 3 名敌人并附带连锁雷爆！", 1.45, 1.58),
          storm_hussar: evolution("storm_hussar", "疾风翼骑", "极速铁蹄", "移速与攻速 +35%，持续冲散敌方阵型！", 1.42, 1.52)
        }),
        dawn_spear: evolution("dawn_spear", "破晓重骑", "暴击圣盾", "穿透暴击为全军叠加圣盾。", 1.42, 1.34, {
          sun_paladin: evolution("sun_paladin", "烈阳圣骑", "破盾圣疗", "三倍破盾，每次穿透暴击为全军同时叠盾与回血！", 1.55, 1.46),
          dread_knight: evolution("dread_knight", "暗黑铁骑", "嗜血冲阵", "穿透攻击自带 35% 生命偷取，血越低攻速越高！", 1.5, 1.54)
        })
      }
    },
    // ===== 2费 · 绿色独立卡池（2 技能栏 · 独立职业与 2★/3★ 转职树） =====
    berserker: {
      id: "berserker", kind: "pool", rarity: "green", artKey: "berserker", name: "狂战斧手", short: "狂战",
      role: "前排 · 2费绿", color: "#4fd1a5", bg: "#1c382c", baseWeight: 0,
      hp: 175, atk: 27, atkCd: 1.02, moveSpd: 128, range: 58, crit: 0.14,
      skillDesc: "【2费绿卡】血陨部落的狂战士，血越低攻速越高且自带强力吸血。",
      evolutions: {
        bloodaxe: evolution("bloodaxe", "血斧战神", "横扫吸血", "横扫最多 2 名目标，吸血提高至 35%。", 1.38, 1.38, {
          crimson_tyrant: evolution("crimson_tyrant", "猩红战尊", "狂血大扫", "横扫 3 名敌军并造成 50% 吸血，越战越勇！", 1.5, 1.55),
          soul_reaver: evolution("soul_reaver", "噬魂狂神", "斩杀狂暴", "每次击杀永久提升 +14% 攻击与移速！", 1.44, 1.58)
        }),
        undying: evolution("undying", "不屈狂魔", "锁血狂暴", "每战首次受致命伤锁血无敌 3 秒且攻速暴涨。", 1.36, 1.4, {
          iron_immortal: evolution("iron_immortal", "钢铁不灭", "二次不屈", "锁血时回复 45% 护盾并击退周围所有敌军！", 1.55, 1.48),
          doom_tide: evolution("doom_tide", "毁灭狂潮", "低血毁灭", "低血状态暴击率 +40%，普攻附带范围震爆！", 1.45, 1.6)
        })
      }
    },
    engineer: {
      id: "engineer", kind: "pool", rarity: "green", artKey: "engineer", name: "蒸汽炮手", short: "炮手",
      role: "后排 · 2费绿", color: "#4fd1a5", bg: "#1f3428", baseWeight: 0,
      hp: 120, atk: 23, atkCd: 1.12, moveSpd: 94, range: 245, crit: 0.12,
      skillDesc: "【2费绿卡】像素工坊的齿轮技师，定时部署自动火炮。",
      evolutions: {
        heavy_turret: evolution("heavy_turret", "重炮堡垒", "范围重炮", "重炮攻击造成范围溅射并小概率震晕敌人。", 1.32, 1.42, {
          doom_cannon: evolution("doom_cannon", "末日火炮", "超载轰炸", "重炮溅射范围翻倍且附带 2 倍破盾！", 1.42, 1.58),
          thunder_fort: evolution("thunder_fort", "雷霆要塞", "电网炮台", "炮台攻击额外弹射连锁电流！", 1.45, 1.5)
        }),
        swarm_turret: evolution("swarm_turret", "机械蜂群", "三座炮台", "可同时维持 3 座高速射击的机枪炮台。", 1.34, 1.36, {
          hive_carrier: evolution("hive_carrier", "蜂群母舰", "四座机炮", "最多维持 4 座超高速炮台，弹幕倾泻！", 1.44, 1.52),
          nano_smith: evolution("nano_smith", "纳米工匠", "炮台护盾", "部署炮台同时为全军叠加机械护盾！", 1.5, 1.45)
        })
      }
    },
    frost_warden: {
      id: "frost_warden", kind: "pool", rarity: "green", artKey: "knight", name: "霜刃守卫", short: "霜卫",
      role: "前排 · 2费绿", color: "#4fd1a5", bg: "#17333a", baseWeight: 0,
      hp: 195, atk: 20, atkCd: 1.15, moveSpd: 96, range: 56, crit: 0.1,
      skillDesc: "【2费绿卡】凛冬要塞的寒冰卫士，受击与攻击均冻结减速敌军。",
      evolutions: {
        ice_paladin: evolution("ice_paladin", "寒冰圣骑", "冰甲反控", "开局自带 35% 冰霜护盾，受击大幅减速攻击者。", 1.45, 1.28, {
          permafrost_wall: evolution("permafrost_wall", "永冻壁垒", "群体冰甲", "每 4 秒释放寒冰光环为前排叠盾并减速四周！", 1.6, 1.38),
          aurora_lord: evolution("aurora_lord", "极光领主", "极光反弹", "受击反弹 45% 冰霜伤害并回复自身生命！", 1.55, 1.42)
        }),
        frost_warlord: evolution("frost_warlord", "霜狼督军", "冰刃横扫", "攻击释放冰锥横扫前方敌军造成减速与破甲。", 1.38, 1.4, {
          glacial_tyrant: evolution("glacial_tyrant", "冰原暴君", "碎冰斩杀", "对减速目标造成 180% 碎冰暴击伤害！", 1.48, 1.58),
          rime_general: evolution("rime_general", "霜魂战将", "寒霜领军", "提升全军 15% 攻速并令全军普攻附带寒意！", 1.5, 1.46)
        })
      }
    },
    // ===== 3费 · 蓝色独立卡池（3 技能栏 · 独立职业与 2★/3★ 转职树） =====
    necromancer: {
      id: "necromancer", kind: "pool", rarity: "blue", artKey: "necromancer", name: "亡灵唤师", short: "唤师",
      role: "后排 · 3费蓝", color: "#5cc8ff", bg: "#152b3c", baseWeight: 0,
      hp: 138, atk: 29, atkCd: 1.2, moveSpd: 95, range: 270, crit: 0.14,
      skillDesc: "【3费蓝卡】幽冥地窟的死灵大师，召唤骸骨大军淹没敌阵。",
      evolutions: {
        bone_lord: evolution("bone_lord", "骸骨君主", "持盾嘲讽", "召唤持盾强化骸骨，优先替友军承伤。", 1.42, 1.32, {
          underworld_king: evolution("underworld_king", "冥界暴君", "亡灵军团", "骸骨上限 +2 且骸骨阵亡引爆冥火溅射！", 1.55, 1.48),
          bone_citadel: evolution("bone_citadel", "白骨圣殿", "骸骨反伤", "骸骨获得 60% 额外护盾并反伤 35%！", 1.6, 1.42)
        }),
        soul_mage: evolution("soul_mage", "噬魂巫师", "灵魂叠加", "每有一名敌军阵亡，本战永久 +15% 法强。", 1.32, 1.45, {
          soul_harvester: evolution("soul_harvester", "灵魂收割", "收割爆发", "每击杀敌军触发全屏灵魂冲击并回血！", 1.42, 1.62),
          abyss_archmage: evolution("abyss_archmage", "深渊魔导", "暗影连锁", "普攻进化为暗影 3 重连锁法球！", 1.4, 1.58)
        })
      }
    },
    bard: {
      id: "bard", kind: "pool", rarity: "blue", artKey: "bard", name: "命运吟游者", short: "吟游",
      role: "后排 · 3费蓝", color: "#5cc8ff", bg: "#1d2642", baseWeight: 0,
      hp: 130, atk: 22, atkCd: 1.45, moveSpd: 115, range: 245, crit: 0.16,
      skillDesc: "【3费蓝卡】星陨酒馆的吟游诗人，战歌加速全军并持续爆金。",
      evolutions: {
        gold_poet: evolution("gold_poet", "黄金诗人", "暴击赏金", "全军暴伤 +25%，每次暴击额外 +2 金币。", 1.35, 1.3, {
          fortune_maestro: evolution("fortune_maestro", "财神乐圣", "黄金暴雨", "全军暴伤 +50%，每次演奏额外爆 +6 金币！", 1.48, 1.45),
          star_singer: evolution("star_singer", "星辉歌者", "星落协奏", "演奏同时降下星落范围法伤！", 1.45, 1.55)
        }),
        war_song: evolution("war_song", "战歌领主", "开场狂热", "开战前 5 秒全军攻速额外 +35%。", 1.38, 1.35, {
          berserk_horn: evolution("berserk_horn", "狂战号角", "全程狂奏", "全军攻速常驻 +35% 且移速 +20%！", 1.5, 1.48),
          eternal_symphony: evolution("eternal_symphony", "永恒交响", "战歌圣疗", "每次演奏同时为全体友军回复 8% 生命！", 1.55, 1.42)
        })
      }
    },
    shadow_blade: {
      id: "shadow_blade", kind: "pool", rarity: "blue", artKey: "assassin", name: "夜刃影舞", short: "夜刃",
      role: "刺客 · 3费蓝", color: "#5cc8ff", bg: "#221a3c", baseWeight: 0,
      hp: 142, atk: 34, atkCd: 0.84, moveSpd: 180, range: 56, crit: 0.34,
      skillDesc: "【3费蓝卡】暗影议会的高阶刺客，开局跃迁敌方后排精准斩杀。",
      evolutions: {
        phantom_assassin: evolution("phantom_assassin", "幽影刺客", "背刺必爆", "切入后排前 3 次攻击必定暴击并附带破盾！", 1.34, 1.48, {
          void_blade: evolution("void_blade", "虚空之刃", "孤立斩杀", "攻击孤立后排造成 220% 真实暴击！", 1.42, 1.65),
          silent_king: evolution("silent_king", "寂灭影王", "影遁无敌", "击杀后排立即隐身无敌 1.2 秒并跳向下一目标！", 1.46, 1.6)
        }),
        bloodmoon_duelist: evolution("bloodmoon_duelist", "血月剑豪", "血刃连舞", "高额吸血与高速连斩，在敌阵后排永动收割。", 1.4, 1.44, {
          crimson_master: evolution("crimson_master", "猩红剑圣", "四连瞬斩", "每 2 击瞬发双重血刃并回复 30% 造成伤害！", 1.48, 1.62),
          soul_dancer: evolution("soul_dancer", "断魂舞者", "血月爆破", "暴击引爆血月范围溅射并恐惧减速周围敌军！", 1.5, 1.58)
        })
      }
    },
    // ===== 4费 · 紫色独立卡池（4 技能栏 · 独立史诗职业与 2★/3★ 转职树） =====
    sun_templar: {
      id: "sun_templar", kind: "pool", rarity: "purple", artKey: "knight", name: "烈阳圣殿骑", short: "烈阳骑",
      role: "前排 · 4费紫", color: "#c084fc", bg: "#2c1a40", baseWeight: 0,
      hp: 265, atk: 34, atkCd: 1.05, moveSpd: 112, range: 72, crit: 0.16,
      skillDesc: "【4费紫卡】星陨圣殿的紫金统帅，群体圣盾 + 烈阳范围灼烧。",
      evolutions: {
        radiant_overlord: evolution("radiant_overlord", "辉光大领主", "全军圣域", "开局为全军赋予 30% 最大生命圣盾并持续灼烧近身敌军。", 1.5, 1.38, {
          solar_guardian: evolution("solar_guardian", "太阳神卫", "不灭圣光", "每 3 秒全军刷新圣盾并回复 10% 生命！", 1.68, 1.52),
          immortal_domain: evolution("immortal_domain", "不朽圣域", "绝对反伤", "全军护盾反伤 45%，坦克终极形态！", 1.72, 1.48)
        }),
        judgement_templar: evolution("judgement_templar", "审判圣骑士", "圣火重击", "长剑附带烈阳范围斩击，对护盾造成 2.5 倍伤害。", 1.44, 1.52, {
          wrath_blade: evolution("wrath_blade", "天罚之剑", "圣剑天降", "每 3 击召唤天罚圣剑轰击敌方集群！", 1.56, 1.68),
          holy_verdict: evolution("holy_verdict", "圣火裁决", "灼烧处决", "对半血以下敌军造成双倍圣火斩杀！", 1.58, 1.64)
        })
      }
    },
    chrono_mage: {
      id: "chrono_mage", kind: "pool", rarity: "purple", artKey: "mage", name: "星界时法师", short: "时法",
      role: "后排 · 4费紫", color: "#c084fc", bg: "#26183d", baseWeight: 0,
      hp: 168, atk: 42, atkCd: 1.12, moveSpd: 102, range: 295, crit: 0.2,
      skillDesc: "【4费紫卡】掌控像素星轨的时空大魔导，扭曲敌我攻速并降下星爆。",
      evolutions: {
        void_starcaller: evolution("void_starcaller", "虚空星使", "星陨风暴", "每次施法召唤 3 道星陨轰炸敌方密集区域。", 1.36, 1.54, {
          starfall_god: evolution("starfall_god", "崩星法神", "全屏星爆", "星陨风暴覆盖 5 名目标并附带 50% 破盾！", 1.48, 1.72),
          galaxy_ruler: evolution("galaxy_ruler", "银河主宰", "引力漩涡", "施法触发引力冲击大幅减速并持续灼烧敌军！", 1.5, 1.66)
        }),
        time_sage: evolution("time_sage", "逆时贤者", "时空加速", "全军攻速永久 +25%，敌军攻速 -20%。", 1.42, 1.45, {
          eternal_clock: evolution("eternal_clock", "永恒时计", "极速超频", "全军攻速 +45%，每 4 秒重置 1 名友军冷却！", 1.54, 1.6),
          fate_weaver: evolution("fate_weaver", "命运织者", "双倍回响", "每次施法有 45% 概率立即双重施法！", 1.5, 1.65)
        })
      }
    },
    // ===== 5费 · 金色传说独立卡池（5 技能栏 · 独立神级职业与 2★/3★ 转职树） =====
    astral_valkyrie: {
      id: "astral_valkyrie", kind: "pool", rarity: "gold", artKey: "valkyrie", name: "天穹女武神", short: "女武神",
      role: "前排 · 5费金", color: "#ffd86b", bg: "#3f3314", baseWeight: 0,
      hp: 340, atk: 52, atkCd: 0.94, moveSpd: 162, range: 110, crit: 0.25,
      skillDesc: "【5费金卡】星陨神殿的传说英灵，5 技能栏！贯通全场的终极圣枪。",
      evolutions: {
        dawn_spear_god: evolution("dawn_spear_god", "破晓神枪", "全屏贯穿", "圣枪穿透 4 名敌军，3 倍破盾并为全军叠盾。", 1.52, 1.56, {
          final_spear: evolution("final_spear", "终焉圣枪", "毁天灭地", "圣枪贯通全场所有敌人，必定暴击并撕碎护盾！", 1.7, 1.8),
          dawn_oracle: evolution("dawn_oracle", "黎明神谕", "神圣庇护", "每次贯穿同时为全体友军回复 15% 生命与护盾！", 1.75, 1.7)
        }),
        sky_warlord: evolution("sky_warlord", "苍穹战神", "天降神罚", "开战天降神雷轰击敌方全体并大幅加速。", 1.55, 1.58, {
          thunder_wings: evolution("thunder_wings", "雷霆神翼", "极速雷暴", "攻速移速 +45%，每击附带 4 重神雷！", 1.68, 1.78),
          eternal_einherjar: evolution("eternal_einherjar", "永恒英灵", "不死神躯", "致命伤无敌 4 秒并召唤英灵虚影协同作战！", 1.78, 1.72)
        })
      }
    },
    void_emperor: {
      id: "void_emperor", kind: "pool", rarity: "gold", artKey: "mage", name: "虚空星主", short: "星主",
      role: "后排 · 5费金", color: "#ffd86b", bg: "#3a2518", baseWeight: 0,
      hp: 245, atk: 62, atkCd: 1.02, moveSpd: 112, range: 325, crit: 0.28,
      skillDesc: "【5费金卡】掌控命运轮盘的虚空之主，5 技能栏！全图星界黑洞斩杀。",
      evolutions: {
        annihilation_lord: evolution("annihilation_lord", "湮灭君王", "黑洞塌缩", "普攻在目标处引爆虚空黑洞，造成超大范围毁灭伤害。", 1.48, 1.62, {
          omega_singularity: evolution("omega_singularity", "终极奇点", "万物湮灭", "黑洞伤害 +80%，直接斩杀 15% 血量以下非 Boss 敌人！", 1.64, 1.85),
          cataclysm_god: evolution("cataclysm_god", "灭世星神", "多重奇点", "每次施法同时引爆 2 个虚空奇点！", 1.62, 1.82)
        }),
        chaos_weaver: evolution("chaos_weaver", "混沌织星者", "命运律令", "存活时全军全属性 +22%，每 3 击额外爆 +8 金币！", 1.52, 1.54, {
          fate_sovereign: evolution("fate_sovereign", "命运主宰", "全军神化", "存活时全军暴击 +30%、攻速 +35%！", 1.68, 1.75),
          void_omnipotent: evolution("void_omnipotent", "虚空万象", "万法归宗", "每装备 1 个继承技能，自身全属性额外 +25%！", 1.7, 1.78)
        })
      }
    },
    joker: {
      id: "joker",
      kind: "wild",
      name: "命运百搭",
      short: "百搭",
      role: "万能 · 幸运",
      color: "#ff99e5",
      bg: "#3c1a38",
      baseWeight: 2,
      skillDesc: "可替代任意兵种连线！参与召唤的单位获得【幸运强化】+12%全属性且爆高阶率提升。"
    }
  };

  const UNIT_IDS = Object.keys(SYMBOLS).filter(id => SYMBOLS[id].kind === "unit");
  const ALL_HERO_IDS = Object.keys(SYMBOLS).filter(id => SYMBOLS[id].kind === "unit" || SYMBOLS[id].kind === "pool");
  const FRONTLINE = new Set(["knight", "assassin", "valkyrie", "berserker", "frost_warden", "shadow_blade", "sun_templar", "astral_valkyrie"]);
  const ASSASSIN_TYPES = new Set(["assassin", "shadow_blade"]);

  const HERO_POOL_BY_RARITY = {
    white: ["knight", "assassin", "valkyrie", "archer", "mage", "priest"],
    green: ["berserker", "engineer", "frost_warden"],
    blue: ["necromancer", "bard", "shadow_blade"],
    purple: ["sun_templar", "chrono_mage"],
    gold: ["astral_valkyrie", "void_emperor"]
  };

  function isUnitFrontline(type) {
    return FRONTLINE.has(type);
  }
  const SYMBOL_IDS = [...UNIT_IDS, "joker"];

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
    knight: { name: "钢铁防线", req: 2, desc: "2+ 步兵：全军开局获得 +35 护盾" },
    archer: { name: "箭雨齐发", req: 2, desc: "2+ 弓手：全军攻击速度 +18%" },
    mage: { name: "奥术共鸣", req: 2, desc: "2+ 法师：全军技能与法术伤害 +25%" },
    priest: { name: "圣光庇护", req: 2, desc: "2+ 祭司：全军每 2 秒回复 4% 最大生命" },
    assassin: { name: "致命突袭", req: 2, desc: "2+ 刺客：全军暴击率 +18%" },
    valkyrie: { name: "铁骑冲锋", req: 2, desc: "2+ 骑兵：全军移速 +18%，对护盾伤害 +40%" }
  };

  const FACTION_SYNERGIES = {
    alliance: {
      name: "圣辉联盟", short: "联盟",
      types: ["knight", "priest", "valkyrie"],
      color: "#f8e296",
      desc: "2名 2★+：护盾 +35% 且破盾反弹圣伤",
      enhanced: "3名 2★+：护盾 +60%、开局全军 25% 护盾、全军攻击 +18%"
    },
    elves: {
      name: "银月精灵", short: "精灵",
      types: ["archer", "mage", "priest"],
      color: "#7be7ff",
      desc: "2名 2★+：全军攻速 +18%，每 4 击触发星落爆裂",
      enhanced: "3名 2★+：全军攻速 +38%，每 3 击星落爆裂，击杀 +5 金币"
    },
    horde: {
      name: "赤血部落", short: "部落",
      types: ["assassin", "valkyrie", "archer"],
      color: "#ff7a6b",
      desc: "2名 2★+：全军暴击吸血 22%，暴击率 +12%",
      enhanced: "3名 2★+：全军暴击吸血 38%，全军攻击 +25%"
    },
    undead: {
      name: "幽冥议会", short: "幽冥",
      types: ["mage", "assassin", "knight"],
      color: "#a8ffcf",
      desc: "2名 2★+：全军技能伤害 +20%，受击反伤 +15%",
      enhanced: "3名 2★+：技能伤害 +40%，每击杀敌军全军回血 8%"
    }
  };

  const UNIT_UNLOCK_TIER = {
    knight: 1, archer: 1, mage: 1, priest: 1, assassin: 1, valkyrie: 1,
    berserker: 2, engineer: 2, necromancer: 3, bard: 3
  };

  const UNIT_RARITIES = {
    white:  { id: "white",  name: "白", label: "白色·普通", color: "#dce4f2", slots: 1, feedLevels: 2, starThresholds: [5, 12, 22, 35] },
    green:  { id: "green",  name: "绿", label: "绿色·精良", color: "#4fd1a5", slots: 2, feedLevels: 3, starThresholds: [6, 14, 25, 40] },
    blue:   { id: "blue",   name: "蓝", label: "蓝色·稀有", color: "#5cc8ff", slots: 3, feedLevels: 4, starThresholds: [8, 16, 28, 44] },
    purple: { id: "purple", name: "紫", label: "紫色·史诗", color: "#c084fc", slots: 4, feedLevels: 5, starThresholds: [10, 20, 34, 52] },
    gold:   { id: "gold",   name: "金", label: "金色·传说", color: "#ffd86b", slots: 5, feedLevels: 6, starThresholds: [12, 24, 40, 60] }
  };

  const UNIT_RARITY_MAP = {
    knight: "white",
    archer: "white",
    mage: "white",
    priest: "white",
    assassin: "white",
    valkyrie: "white",
    berserker: "green",
    engineer: "green",
    frost_warden: "green",
    necromancer: "blue",
    bard: "blue",
    shadow_blade: "blue",
    sun_templar: "purple",
    chrono_mage: "purple",
    astral_valkyrie: "gold",
    void_emperor: "gold"
  };

  const INNATE_SKILLS = {
    aegis_wall: {
      id: "aegis_wall", owner: "knight", name: "圣盾壁垒", icon: "🛡️", color: "#4fd1a5",
      desc: lv => `开局获得 ${[15, 25, 36, 48, 65][lv - 1]}% 最大生命护盾，受击反弹 ${[12, 20, 28, 38, 50][lv - 1]}% 伤害。`
    },
    rapid_volley: {
      id: "rapid_volley", owner: "archer", name: "疾风连矢", icon: "🏹", color: "#5cc8ff",
      desc: lv => `每 3 次攻击额外齐射 ${[1, 1, 2, 2, 3][lv - 1]} 支追踪箭，每支造成 ${[55, 75, 80, 100, 125][lv - 1]}% 伤害。`
    },
    chain_bolt: {
      id: "chain_bolt", owner: "mage", name: "连锁天雷", icon: "⚡", color: "#b78bfa",
      desc: lv => `普攻触发连锁闪电弹射 ${[1, 2, 2, 3, 4][lv - 1]} 名额外敌人，造成 ${[40, 55, 70, 85, 105][lv - 1]}% 法伤。`
    },
    holy_mend: {
      id: "holy_mend", owner: "priest", name: "圣光愈合", icon: "💚", color: "#f7cf6d",
      desc: lv => `每次攻击治疗血量最低的友军，回复 ${[35, 55, 75, 100, 130][lv - 1]}% 攻击力的生命。`
    },
    shadow_crit: {
      id: "shadow_crit", owner: "assassin", name: "致命影袭", icon: "🗡️", color: "#ff6b7a",
      desc: lv => `暴击率 +${[10, 18, 26, 35, 45][lv - 1]}%，暴击伤害额外 +${[15, 30, 45, 65, 90][lv - 1]}%。`
    },
    pierce_lance: {
      id: "pierce_lance", owner: "valkyrie", name: "轻骑穿刺", icon: "🔱", color: "#f8e296",
      desc: lv => `攻击穿透第二目标造成 ${[45, 60, 75, 95, 120][lv - 1]}% 伤害，对护盾造成 ${[1.5, 1.75, 2.0, 2.25, 2.6][lv - 1]}× 伤害。`
    },
    blood_frenzy: {
      id: "blood_frenzy", owner: "berserker", name: "嗜血狂怒", icon: "🩸", color: "#ff806a",
      desc: lv => `普攻附加 ${[12, 18, 25, 32, 42][lv - 1]}% 生命偷取，损失生命时攻速最高 +${[25, 40, 55, 70, 90][lv - 1]}%。`
    },
    auto_turret: {
      id: "auto_turret", owner: "engineer", name: "蒸汽炮台", icon: "⚙️", color: "#f2ba70",
      desc: lv => `每 ${[7, 6.2, 5.4, 4.6, 3.8][lv - 1]} 秒部署自动炮台，继承 ${[45, 65, 85, 110, 140][lv - 1]}% 攻击力。`
    },
    frost_armor: {
      id: "frost_armor", owner: "frost_warden", name: "凛冬冰甲", icon: "❄️", color: "#6be5ff",
      desc: lv => `开局 +${[20, 30, 42, 55, 72][lv - 1]}% 冰霜护盾，普攻与受击令敌人减速 ${[25, 32, 40, 48, 55][lv - 1]}%。`
    },
    raise_bone: {
      id: "raise_bone", owner: "necromancer", name: "亡灵复生", icon: "💀", color: "#8ce5aa",
      desc: lv => `敌军阵亡时召唤骸骨战士抗伤，属性 ${[35, 50, 68, 88, 115][lv - 1]}%，上限 ${[1, 2, 2, 3, 4][lv - 1]} 只。`
    },
    war_hymn: {
      id: "war_hymn", owner: "bard", name: "黄金战歌", icon: "🎵", color: "#eea7f4",
      desc: lv => `全军攻速 +${[8, 13, 19, 26, 35][lv - 1]}%，每次攻击额外产出 +${[2, 3, 4, 5, 7][lv - 1]} 金币。`
    },
    night_ambush: {
      id: "night_ambush", owner: "shadow_blade", name: "夜刃背刺", icon: "🌙", color: "#9d7bff",
      desc: lv => `对孤立或后排目标伤害 +${[22, 34, 48, 65, 88][lv - 1]}%，暴击回复 ${[10, 15, 22, 28, 36][lv - 1]}% 生命。`
    },
    solar_burn: {
      id: "solar_burn", owner: "sun_templar", name: "烈阳圣域", icon: "☀️", color: "#ffb84d",
      desc: lv => `每 3 击引爆烈阳冲击波，对周围敌军造成 ${[65, 90, 120, 155, 200][lv - 1]}% 圣伤并为自身叠盾。`
    },
    chrono_warp: {
      id: "chrono_warp", owner: "chrono_mage", name: "时空扭曲", icon: "⏳", color: "#c084fc",
      desc: lv => `全军攻速 +${[10, 16, 22, 30, 40][lv - 1]}%，普攻附带范围星爆减速敌军。`
    },
    sky_spear: {
      id: "sky_spear", owner: "astral_valkyrie", name: "天穹神枪", icon: "🌟", color: "#ffd86b",
      desc: lv => `普攻穿透 ${[2, 3, 3, 4, 5][lv - 1]} 名敌人，破盾 ${[2, 2.4, 2.8, 3.2, 3.8][lv - 1]}× 并为全军叠盾！`
    },
    void_singularity: {
      id: "void_singularity", owner: "void_emperor", name: "虚空奇点", icon: "🕳️", color: "#ff75b5",
      desc: lv => `每次攻击在目标处引爆虚空黑洞，造成 ${[75, 105, 140, 185, 240][lv - 1]}% 范围毁灭法伤！`
    }
  };

  // Level 30 (and 60) Master Awakening 3-choice buffs tailored by role!
  const MASTERY_BUFFS = {
    assassin: [
      { id: "isolation", name: "孤立无援", icon: "🐺", desc: "目标周围 95px 内无其他敌军时，伤害 +65% 且必定暴击！" },
      { id: "shadow_double", name: "暗影连斩", icon: "⚔️", desc: "暴击时有 45% 概率瞬间追加一次 80% 伤害的影刃连斩！" },
      { id: "phantom_cloak", name: "影遁吸血", icon: "🦇", desc: "开局跃迁切后排获得 2.5 秒 45% 减伤，并永久获得 +28% 吸血！" }
    ],
    front: [
      { id: "titan_body", name: "泰坦之躯", icon: "🗿", desc: "最大生命永久 +45%，碰撞质量翻倍，稳如磐石挡住敌军！" },
      { id: "thorn_armor", name: "真实反甲", icon: "🦔", desc: "受击反弹 40% 伤害给攻击者，且开局额外 +35% 护盾！" },
      { id: "aegis_heart", name: "不屈壁垒", icon: "💠", desc: "自身获得的所有护盾效果 +65%，每 4 秒自动回复 10% 生命！" }
    ],
    ranged: [
      { id: "overdrive_shot", name: "超载射击", icon: "🎯", desc: "攻击距离 +65px，攻击速度永久 +30%！" },
      { id: "arcane_overload", name: "奥术过载", icon: "🔮", desc: "攻击与所有继承技能伤害永久 +45%！" },
      { id: "holy_resonance", name: "神圣共鸣", icon: "✨", desc: "暴击率 +22%，每次攻击有 35% 概率为血量最低友军叠盾回血！" }
    ]
  };

  function getMasteryPoolForUnit(unit) {
    if (ASSASSIN_TYPES.has(unit.type)) return MASTERY_BUFFS.assassin;
    if (isUnitFrontline(unit.type)) return MASTERY_BUFFS.front;
    return MASTERY_BUFFS.ranged;
  }

  const UNIT_INNATE_SKILL_ID = Object.fromEntries(
    Object.values(INNATE_SKILLS).map(sk => [sk.owner, sk.id])
  );

  function getUnitRarity(unitOrType) {
    if (unitOrType && typeof unitOrType === "object") {
      return UNIT_RARITIES[unitOrType.rarity || UNIT_RARITY_MAP[unitOrType.type] || "white"] || UNIT_RARITIES.white;
    }
    return UNIT_RARITIES[UNIT_RARITY_MAP[unitOrType] || "white"] || UNIT_RARITIES.white;
  }

  function getInnateSkill(type) {
    return INNATE_SKILLS[UNIT_INNATE_SKILL_ID[type] || "aegis_wall"];
  }

  function calcUnitStars(unitOrType, heroLv = 1) {
    const thresholds = getUnitRarity(unitOrType).starThresholds;
    let stars = 1;
    for (const req of thresholds) {
      if (heroLv >= req) stars += 1;
    }
    return Math.min(5, stars);
  }

  function nextStarLevel(unitOrType, heroLv = 1) {
    const thresholds = getUnitRarity(unitOrType).starThresholds;
    return thresholds.find(req => heroLv < req) ?? null;
  }

  function getEvolutionChoices(unit) {
    if (!unit) return null;
    const def = SYMBOLS[unit.type];
    if (!def?.evolutions) return null;
    const stars = unitLevel(unit);
    if (stars >= 2 && !unit.evolution) {
      return { tier: 2, options: Object.values(def.evolutions) };
    }
    if (stars >= 3 && unit.evolution && !unit.evolution3) {
      const t2 = def.evolutions[unit.evolution];
      if (t2?.tier3) return { tier: 3, parent: t2, options: Object.values(t2.tier3) };
    }
    return null;
  }

  function getUnitEvoInfo(unit) {
    if (!unit) return null;
    const def = SYMBOLS[unit.type];
    const t2 = unit.evolution ? def?.evolutions?.[unit.evolution] : null;
    const t3 = (t2 && unit.evolution3) ? t2.tier3?.[unit.evolution3] : null;
    return t3 || t2 || null;
  }

  function getUnitFactions(type) {
    return Object.entries(FACTION_SYNERGIES)
      .filter(([, info]) => info.types.includes(type))
      .map(([id, info]) => ({ id, short: info.short, name: info.name, color: info.color }));
  }

  function getFactionSynergies(run) {
    // ONLY 2-star+ heroes awaken their Faction Crest and count toward Faction Synergies!
    const awakened = run.field.filter(u => u && unitLevel(u) >= 2).map(u => u.type);
    const uniqueAwakened = new Set(awakened);
    return Object.entries(FACTION_SYNERGIES).map(([id, info]) => {
      const count = info.types.filter(t => uniqueAwakened.has(t)).length;
      const tier = count >= 3 ? 3 : count >= 2 ? 2 : 0;
      return { id, ...info, count, tier };
    });
  }

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
      desc: "每次兵种连线额外爆出 +18 金币，且全军永久 +10 生命、+2 攻击。"
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
    },
    {
      id: "iron_forge",
      name: "秘银锻炉",
      rarity: "common",
      icon: "⚒️",
      desc: "全军单位最大生命 +18%、基础攻击 +10%。"
    },
    {
      id: "swift_boots",
      name: "疾风战靴",
      rarity: "common",
      icon: "🥾",
      desc: "全军攻击速度提升 14%，更容易触发高速残影压制。"
    },
    {
      id: "fever_catalyst",
      name: "狂热催化器",
      rarity: "rare",
      icon: "🔥",
      desc: "轮盘狂热槽充能速度 +40%，更快触发免费百搭双倍狂热！"
    },
    {
      id: "crystal_prism",
      name: "源晶棱镜",
      rarity: "rare",
      icon: "💎",
      desc: "每波战斗胜利额外获得 +1 命运水晶，助力商店与改命。"
    },
    {
      id: "twin_nudge",
      name: "齿轮校准仪",
      rarity: "common",
      icon: "🧭",
      desc: "每波额外获得 +1 次免费单列微调机会。"
    },
    {
      id: "executioner_axe",
      name: "斩首巨斧",
      rarity: "rare",
      icon: "🪓",
      desc: "全军攻击力 +18%，暴击率额外 +8%。"
    },
    {
      id: "guardian_angel",
      name: "辉光圣佑",
      rarity: "legendary",
      icon: "🪽",
      desc: "全军最大生命 +25%、攻击力 +15%，每波开局额外 +1 免费转动。"
    },
    {
      id: "gold_compass",
      name: "黄金罗盘",
      rarity: "rare",
      icon: "🧭",
      desc: "轮盘 5 费金色英雄爆率永久 +1.2%，4 费紫色爆率 +4%！"
    },
    {
      id: "astral_altar",
      name: "星界召唤阵",
      rarity: "legendary",
      icon: "🌠",
      desc: "轮盘 5 费金色爆率 +1.8%、紫率 +6%，每次召唤高费英雄全军 +3 攻击！"
    },
    {
      id: "lone_wolf",
      name: "孤狼徽记",
      rarity: "rare",
      icon: "🐺",
      desc: "我方刺客与前排攻击周围无其他敌军的孤立目标时，伤害 +40%！"
    },
    {
      id: "skill_resonator",
      name: "技能共鸣器",
      rarity: "legendary",
      icon: "💎",
      desc: "英雄每多装备 1 个继承技能，自身全属性额外 +12%！"
    },
    {
      id: "high_roller",
      name: "豪赌筹码",
      rarity: "rare",
      icon: "🎰",
      desc: "每消耗 100 金币转动轮盘，永久提升 +0.4% 金率与 +2% 紫率！"
    },
    {
      id: "shadow_pact",
      name: "暗影契约",
      rarity: "rare",
      icon: "🌑",
      desc: "所有刺客开局跃迁敌方后排后，获得 1.5 秒无敌且首击必定暴击！"
    },
    {
      id: "underdog_fury",
      name: "绝地反击",
      rarity: "common",
      icon: "⚡",
      desc: "任意英雄血量首次低于 35% 时，立刻获得 25% 最大生命护盾！"
    },
    {
      id: "mastery_tome",
      name: "宗师秘典",
      rarity: "legendary",
      icon: "📖",
      desc: "吞噬冲级额外 +1 级，全军每有 1 名满 30 级宗师英雄则全军攻速 +15%！"
    }
  ];

  const CORE_SPIN_MILESTONES = [5, 10, 18, 28, 40, 55, 75, 100];

  const SIDE_QUESTS = [
    { id: "no_death", name: "完美防线", target: 2, window: 3, desc: "在 3 波内累计 2 波战斗无英雄阵亡", reward: "免费开启【高级命运轮盘】1 次（高爆紫/金！）" },
    { id: "no_spin", name: "节俭赌徒", target: 1, window: 2, desc: "在 2 波内不使用轮盘摇杆并赢得 1 场战斗", reward: "免费开启【高级命运轮盘】1 次（高爆紫/金！）" },
    { id: "no_shop", name: "清心寡欲", target: 2, window: 3, desc: "在 3 波内不购买商店货品并赢得 2 场战斗", reward: "免费开启【高级命运轮盘】1 次（高爆紫/金！）" },
    { id: "combo_line", name: "连线大师", target: 1, window: 3, desc: "在 3 波内触发 1 次 2 线及以上多重连线", reward: "免费开启【高级命运轮盘】1 次（高爆紫/金！）" }
  ];

  function assignSideQuest(run) {
    const prevId = run.sideQuest?.id;
    const pool = SIDE_QUESTS.filter(q => q.id !== prevId);
    const q = pool[Math.floor(Math.random() * pool.length)] || SIDE_QUESTS[0];
    run.sideQuest = {
      id: q.id,
      name: q.name,
      desc: q.desc,
      target: q.target,
      progress: 0,
      wavesLeft: q.window,
      completed: false,
      failed: false
    };
    run.shopBoughtThisWave = false;
  }

  function coreLevel(run, coreId) {
    if (!run || !run.cores.includes(coreId)) return 0;
    return run.coreLevels?.[coreId] || 1;
  }

  function coreUpgradeDesc(coreId, nextLv) {
    const core = CORES.find(c => c.id === coreId);
    const mult = nextLv === 2 ? "1.5×" : "2.1×";
    const map = {
      lucky_bell: `升至 Lv.${nextLv}：首转落空返还 +${nextLv} 次免费转动，且全军生命 +${nextLv * 15}。`,
      black_note: `升至 Lv.${nextLv}：每波前 ${nextLv} 次转动中心必出【命运百搭】！`,
      coin_sack: `升至 Lv.${nextLv}：落空安慰奖提升至 +${14 + (nextLv - 1) * 10}G，连线额外 +${10 + (nextLv - 1) * 8}G。`,
      blast_cart: `升至 Lv.${nextLv}：多重连线奖励提升至 +${50 + (nextLv - 1) * 30}G 且全军永久 +${2 * nextLv} 攻击！`,
      devour_crest: `升至 Lv.${nextLv}：吞噬额外 +${nextLv} 经验并返还 ${18 + (nextLv - 1) * 12}G。`,
      extra_lock: `升至 Lv.${nextLv}：锁格上限再 +1，且全军基础攻速 +${nextLv * 5}%。`,
      wild_surge: `升至 Lv.${nextLv}：百搭权重大幅提升，百搭召唤单位自带 +${nextLv + 1} 经验！`,
      vanguard_oath: `升至 Lv.${nextLv}：前排生命加成提升至 +${30 + (nextLv - 1) * 18}%，护盾 +${30 * nextLv}。`,
      arcane_echo: `升至 Lv.${nextLv}：法师与祭司攻速提升至 +${22 + (nextLv - 1) * 12}%，技能效果大幅强化。`,
      crit_dice: `升至 Lv.${nextLv}：全军暴击率提升至 +${20 + (nextLv - 1) * 12}%，暴击伤害提升！`,
      interest_ledger: `升至 Lv.${nextLv}：每波利息上限提升至 +${45 + (nextLv - 1) * 25}G。`,
      berserk_banner: `升至 Lv.${nextLv}：低血量狂暴加成飙升至 +${45 + (nextLv - 1) * 22}% 攻速与攻击！`,
      midas_reel: `升至 Lv.${nextLv}：每次兵种连线额外 +${18 * nextLv} 金币，全军永久 +${10 * nextLv} 生命、+${2 * nextLv} 攻击！`,
      free_spin_gear: `升至 Lv.${nextLv}：每波免费转动提升至 +${1 + nextLv} 次！`,
      royal_decree: `升至 Lv.${nextLv}：双倍召唤概率提升至 ${Math.min(85, 40 + (nextLv - 1) * 20)}%，全军攻击 +${12 * nextLv}%！`,
      iron_forge: `升至 Lv.${nextLv}：全军生命 +${18 * nextLv}%、攻击 +${10 * nextLv}%。`,
      swift_boots: `升至 Lv.${nextLv}：全军攻速提升至 +${14 * nextLv}%！`,
      fever_catalyst: `升至 Lv.${nextLv}：狂热充能速度提升至 +${40 * nextLv}%！`,
      crystal_prism: `升至 Lv.${nextLv}：每波胜利额外掉落 +${nextLv} 命运水晶！`,
      twin_nudge: `升至 Lv.${nextLv}：每波免费微调提升至 +${nextLv} 次！`,
      executioner_axe: `升至 Lv.${nextLv}：全军攻击 +${18 * nextLv}%，暴击率 +${8 * nextLv}%！`,
      guardian_angel: `升至 Lv.${nextLv}：全军生命 +${25 * nextLv}%、攻击 +${15 * nextLv}%！`
    };
    return map[coreId] || `${core?.desc || ""}（Lv.${nextLv} 效果强化至 ${mult}）`;
  }

  const ENEMY_TACTICS = {
    ch1_orc_brute: "shield_breaker",
    ch2_necro_acolyte: "summoner",
    ch2_bone_priest: "healer_support",
    ch3_blizzard_yeti: "artillery_aoe",
    ch3_ice_assassin: "backline_diver",
    ch4_lava_imp: "artillery_aoe",
    ch4_obsidian_golem: "shield_breaker",
    ch4_boss_balrog: "summoner",
    ch5_void_stalker: "backline_diver",
    ch5_star_mage: "healer_support"
  };

  const ENEMY_PHYSICS_BY_KIND = {
    boss: { moveSpd: 78, range: 76 },
    tank: { moveSpd: 82, range: 54 },
    melee: { moveSpd: 112, range: 50 },
    assassin: { moveSpd: 158, range: 52 },
    ranged: { moveSpd: 96, range: 260 },
    caster: { moveSpd: 90, range: 245 }
  };

  function campaignEnemy(name, kind, artKey, hp, atk, cd) {
    const phys = ENEMY_PHYSICS_BY_KIND[kind] || ENEMY_PHYSICS_BY_KIND.melee;
    return {
      name, kind, artKey, hp, atk, cd,
      moveSpd: phys.moveSpd,
      range: phys.range,
      tactic: ENEMY_TACTICS[artKey]
    };
  }

  function addPhases(wave) {
    const boss = wave.enemies.filter(unit => unit.kind === "boss");
    const regular = wave.enemies.filter(unit => unit.kind !== "boss");
    const scaleUnit = (u, hpM, atkM = hpM) => ({
      ...u,
      hp: Math.round(u.hp * hpM),
      atk: Math.round(u.atk * atkM),
      cd: Math.max(0.65, Number((u.cd * 0.88).toFixed(2)))
    });

    const makeSquad = (size, hpM, atkM, offset = 0) =>
      Array.from({ length: size }, (_, i) => scaleUnit(regular[(i + offset) % regular.length], hpM, atkM));

    if (boss.length > 0) {
      const boostedBoss = boss.map(b => ({ ...b, cd: Math.max(0.62, Number((b.cd * 0.76).toFixed(2))) }));
      const bossPatterns = [
        [5, 6, 5],
        [5, 7, 6],
        [6, 7, 6],
        [6, 8, 6],
        [7, 8, 7]
      ];
      const [p1, p2, p3] = bossPatterns[(wave.chapter - 1) % bossPatterns.length];
      return {
        ...wave,
        phases: [
          { delay: 0, enemies: makeSquad(p1, 1.08, 1.05, 0) },
          { delay: 4.2, enemies: makeSquad(p2, 1.32, 1.20, 1) },
          { delay: 8.4, enemies: [...boostedBoss, ...makeSquad(p3, 1.48, 1.28, 2)] }
        ]
      };
    }

    // Dense, asymmetric enemy swarms per wave!
    const idxInCh = ((wave.wave - 1) % 6);
    const wavePatterns = [
      [4, 5, 4], // W1: 13 enemies
      [5, 5, 6], // W2: 16 enemies
      [5, 6, 5], // W3 Mini-Boss: 16 enemies
      [5, 7, 7], // W4: 19 enemies
      [6, 7, 8]  // W5: 21 enemies
    ];
    const pat = wavePatterns[idxInCh] || [5, 6, 6];
    const chExtra = wave.chapter >= 5 ? 2 : wave.chapter >= 3 ? 1 : 0;
    const w1Scale = (!wave.endless && wave.wave === 1) ? 0.76 : 1;
    return {
      ...wave,
      phases: [
        { delay: 0, enemies: makeSquad(pat[0], 1.0 * w1Scale, 1.0 * w1Scale, 0) },
        { delay: 4.5, enemies: makeSquad(pat[1] + chExtra, 1.15 * w1Scale, 1.1 * w1Scale, 1) },
        { delay: 9.0, enemies: makeSquad(pat[2] + chExtra, 1.32 * w1Scale, 1.2 * w1Scale, 2) }
      ]
    };
  }

  const CHAPTER_HP_MULT = [0.72, 2.2, 4.8, 9.0, 16.0];
  const CHAPTER_ATK_MULT = [0.75, 1.75, 3.2, 5.2, 8.2];

  function chapterWaves(chapter, enemies, encounters, boss) {
    const firstWave = (chapter.id - 1) * (encounters.length + 1) + 1;
    const reward = 20 + (chapter.id - 1) * 8;
    const hpMult = CHAPTER_HP_MULT[chapter.id - 1] || 1;
    const atkMult = CHAPTER_ATK_MULT[chapter.id - 1] || 1;
    const normalWaves = encounters.map(([name, roster], index) => {
      const isMiniBoss = index === 2; // Wave 3 of each chapter = Mini-Boss spike!
      const growth = isMiniBoss ? 1.55 : (1 + index * 0.12);
      const atkGrowth = isMiniBoss ? 1.38 : (1 + index * 0.10);
      return {
        chapter: chapter.id,
        wave: firstWave + index,
        name: isMiniBoss ? `精英小首领 · ${name}` : name,
        boss: false,
        miniBoss: isMiniBoss,
        reward: reward + index * 2 + (isMiniBoss ? 8 : 0),
        enemies: roster.map((key, eIdx) => {
          const enemy = enemies[key];
          const isLead = isMiniBoss && eIdx === 0;
          return {
            ...enemy,
            name: isLead ? `精锐首领·${enemy.name}` : enemy.name,
            lv: chapter.id,
            hp: Math.round(enemy.hp * hpMult * growth * (isLead ? 1.45 : 1)),
            atk: Math.round(enemy.atk * atkMult * atkGrowth * (isLead ? 1.22 : 1)),
            shieldPierce: isMiniBoss ? 0.25 : 0
          };
        })
      };
    });
    const { skill, escorts, ...bossEnemy } = boss;
    const bossHpScale = [4.2, 4.6, 5.0, 5.4, 6.2][chapter.id - 1] || 5.0;
    const bossAtkScale = [2.2, 2.3, 2.4, 2.5, 2.75][chapter.id - 1] || 2.4;
    return [...normalWaves, {
      chapter: chapter.id,
      wave: firstWave + encounters.length,
      name: "审判波次 · " + boss.name,
      boss: true,
      bossTitle: chapter.bossName,
      bossSkill: skill,
      reward: reward + 32,
      enemies: [
        {
          ...bossEnemy,
          lv: chapter.id,
          hp: Math.round(bossEnemy.hp * hpMult * bossHpScale),
          atk: Math.round(bossEnemy.atk * atkMult * bossAtkScale),
          shieldPierce: 0.55,
          skillInterval: Math.max(2.2, Number(((bossEnemy.skillInterval || 4.0) * 0.72).toFixed(2))),
          bossId: chapter.bossId
        },
        ...escorts.map(key => {
          const e = enemies[key];
          return {
            ...e,
            lv: chapter.id,
            hp: Math.round(e.hp * hpMult * 1.65),
            atk: Math.round(e.atk * atkMult * 1.45)
          };
        })
      ]
    }];
  }

  const CHAPTERS = [
    {
      id: 1, key: "ch1", name: "暮色古堡",
      mapAsset: "assets/maps/map-01-citadel.webp", themeColor: "#f5c869",
      env: { name: "", healPenalty: 0, speedPenalty: 0, burnPct: 0, poison: false, shieldPierce: 0, desc: "" },
      bossId: "grom", bossName: "赤甲战神 · 格罗姆", crystalReward: 10,
      enemies: {
        raider: campaignEnemy("哥布林掠袭者", "melee", "ch1_goblin_raider", 105, 10, 1.15),
        brute: campaignEnemy("兽人重斧", "tank", "ch1_orc_brute", 165, 12, 1.25),
        scout: campaignEnemy("哥布林弓手", "ranged", "enemy_ranged", 70, 11, 1.10)
      },
      encounters: [
        ["斥候试探", ["raider", "raider", "scout"]],
        ["破门先锋", ["brute", "raider", "scout"]],
        ["城门争夺", ["brute", "raider", "raider", "scout"]],
        ["赤斧巡队", ["brute", "brute", "raider", "scout"]],
        ["王庭守备", ["brute", "brute", "raider", "scout", "scout"]]
      ],
      boss: {
        ...campaignEnemy("赤甲战神", "boss", "ch1_boss_warlord", 620, 26, 1.35),
        skillInterval: 4.5, escorts: ["brute", "scout"],
        skill: "【考题：基础承伤】裂地重击震荡全军并为自身叠 14% 护盾"
      }
    },
    {
      id: 2, key: "ch2", name: "幽冥地窟",
      mapAsset: "assets/maps/map-02-catacombs.svg", themeColor: "#38e8a8",
      env: { name: "瘟疫毒雾", healPenalty: 0.35, speedPenalty: 0, burnPct: 0, poison: true, shieldPierce: 0, desc: "治疗/吸血 -35%，受击附带尸毒持续掉血" },
      bossId: "lich", bossName: "深渊巫妖 · 玛尔扎", crystalReward: 12,
      enemies: {
        ghoul: campaignEnemy("墓穴食尸鬼", "melee", "ch2_crypt_ghoul", 232, 18, 1.05),
        archer: campaignEnemy("骸骨弓手", "ranged", "ch2_bone_archer", 156, 20, 1.0),
        acolyte: campaignEnemy("死灵侍僧", "caster", "ch2_necro_acolyte", 178, 22, 1.2),
        priest: campaignEnemy("骸骨祭司", "caster", "ch2_bone_priest", 160, 16, 1.4)
      },
      encounters: [
        ["墓门尸潮", ["ghoul", "ghoul", "archer"]],
        ["骸骨伏兵", ["ghoul", "archer", "archer", "acolyte"]],
        ["尸灯长廊", ["ghoul", "ghoul", "archer", "priest"]],
        ["亡灵祭仪", ["ghoul", "ghoul", "acolyte", "priest"]],
        ["白骨护卫", ["ghoul", "ghoul", "archer", "archer", "acolyte"]]
      ],
      boss: {
        ...campaignEnemy("深渊巫妖", "boss", "ch2_boss_lich", 1120, 35, 1.25),
        skillInterval: 4.2, escorts: ["ghoul", "archer", "acolyte"],
        skill: "【考题：清杂 AOE】召唤亡灵海，每存活 1 只小怪令巫妖获得 14% 减伤！"
      }
    },
    {
      id: 3, key: "ch3", name: "凛冬要塞",
      mapAsset: "assets/maps/map-03-frostpeak.svg", themeColor: "#6be5ff",
      env: { name: "极寒冻伤", healPenalty: 0.25, speedPenalty: 0.12, burnPct: 0, poison: false, shieldPierce: 0, desc: "治疗/吸血 -25%，全军攻速 -12%" },
      bossId: "icequeen", bossName: "霜狱女皇 · 芙蕾雅", crystalReward: 14,
      enemies: {
        guard: campaignEnemy("霜甲卫兵", "tank", "ch3_frost_guard", 385, 25, 1.2),
        yeti: campaignEnemy("风雪巨兽", "melee", "ch3_blizzard_yeti", 285, 30, 1.25),
        assassin: campaignEnemy("冰霜刺客", "assassin", "ch3_ice_assassin", 205, 26, 0.94)
      },
      encounters: [
        ["寒关警戒", ["guard", "yeti", "assassin"]],
        ["冰刃潜伏", ["guard", "yeti", "assassin", "assassin"]],
        ["铁门风暴", ["guard", "guard", "yeti", "assassin"]],
        ["雪兽围袭", ["guard", "yeti", "yeti", "assassin", "assassin"]],
        ["霜狱近卫", ["guard", "guard", "yeti", "assassin", "assassin"]]
      ],
      boss: {
        ...campaignEnemy("霜狱女皇", "boss", "ch3_boss_icequeen", 1620, 42, 1.25),
        skillInterval: 4.8, escorts: ["guard", "yeti", "assassin"],
        skill: "【考题：保后排】冰刺狙杀并冻结后排输出 1.2 秒，同时全军减速！"
      }
    },
    {
      id: 4, key: "ch4", name: "熔岩祭坛",
      mapAsset: "assets/maps/map-04-inferno.svg", themeColor: "#ff6d24",
      env: { name: "地狱灼烧", healPenalty: 0.45, speedPenalty: 0, burnPct: 0.025, poison: false, shieldPierce: 0.12, desc: "重伤治疗 -45%，每 3 秒灼烧 2.5% 生命" },
      bossId: "balrog", bossName: "炎魔领主 · 卡扎克", crystalReward: 16,
      enemies: {
        imp: campaignEnemy("熔岩小鬼", "caster", "ch4_lava_imp", 310, 36, 1.1),
        hound: campaignEnemy("炼狱猎犬", "melee", "ch4_hell_hound", 430, 37, 0.95),
        golem: campaignEnemy("黑曜巨像", "tank", "ch4_obsidian_golem", 600, 33, 1.3)
      },
      encounters: [
        ["地火警报", ["golem", "hound", "imp"]],
        ["焦土追猎", ["golem", "hound", "hound", "imp"]],
        ["炽炎哨站", ["golem", "hound", "imp", "imp"]],
        ["黑曜壁垒", ["golem", "golem", "hound", "imp", "imp"]],
        ["熔炉卫队", ["golem", "golem", "hound", "hound", "imp"]]
      ],
      boss: {
        ...campaignEnemy("炎魔领主", "boss", "ch4_boss_balrog", 2130, 49, 1.24),
        skillInterval: 4.3, escorts: ["golem", "hound", "imp"],
        skill: "【考题：前排坦度】破盾重击存活前排；前排全灭则熔岩火浪席卷后排！"
      }
    },
    {
      id: 5, key: "ch5", name: "星界神殿",
      mapAsset: "assets/maps/map-05-astral.svg", themeColor: "#c77dff",
      env: { name: "虚空侵蚀", healPenalty: 0.50, speedPenalty: 0.08, burnPct: 0.02, poison: false, shieldPierce: 0.20, desc: "重伤治疗 -50%，敌军额外 +20% 破盾" },
      bossId: "dragon", bossName: "厄运魔龙 · 阿斯特拉", crystalReward: 20,
      enemies: {
        stalker: campaignEnemy("虚空潜行者", "assassin", "ch5_void_stalker", 463, 43, 0.91),
        sentinel: campaignEnemy("星界哨兵", "tank", "ch5_astral_sentinel", 810, 40, 1.25),
        mage: campaignEnemy("星辉法师", "caster", "ch5_star_mage", 490, 45, 1.07)
      },
      encounters: [
        ["虚空裂隙", ["sentinel", "stalker", "mage"]],
        ["星矛巡行", ["sentinel", "sentinel", "stalker", "mage"]],
        ["流星围猎", ["sentinel", "stalker", "stalker", "mage", "mage"]],
        ["神殿屏障", ["sentinel", "sentinel", "stalker", "mage", "mage"]],
        ["命运守卫", ["sentinel", "sentinel", "stalker", "stalker", "mage"]]
      ],
      boss: {
        ...campaignEnemy("厄运魔龙", "boss", "ch5_boss_dragon", 2240, 60, 1.2),
        skillInterval: 4, escorts: ["sentinel", "stalker", "mage"],
        skill: "【终极考题：爆发斩杀】龙息永久叠狂暴，半血召唤虚空刺客切后排！"
      }
    }
  ].map(({ enemies, encounters, boss, ...chapter }) => ({
    ...chapter,
    waves: chapterWaves(chapter, enemies, encounters, boss).map(addPhases)
  }));

  const WAVES = CHAPTERS.flatMap(chapter => chapter.waves);

  const ENDLESS_AFFIXES = {
    blood_tide: { name: "嗜血狂潮", desc: "敌军攻速 +25%" },
    twin_kings: { name: "双王降临", desc: "两名不同章节的 Boss 加入末批" },
    gold_tide: { name: "黄金狂潮", desc: "每次击杀获得双倍额外金币与水晶" },
    iron_vow: { name: "铁壁军势", desc: "敌军额外生命 +20%" }
  };

  function putEndlessWave(run, number) {
    run.endlessWave = number;
    run.chapter = (number - 1) % CHAPTERS.length + 1;
    run.endlessAffixes = sample(Object.keys(ENDLESS_AFFIXES), Math.random() < .55 ? 1 : 2);
  }

  function getEndlessWave(run) {
    const number = run.endlessWave;
    const chapter = CHAPTERS[run.chapter - 1];
    const dual = run.endlessAffixes.includes("twin_kings");
    const boss = dual || number % 3 === 0;
    const base = chapter.waves[boss ? 5 : (number - 1) % 5];
    const enemies = base.enemies.map(unit => ({ unit, chapter: run.chapter }));
    if (dual) {
      const next = CHAPTERS[run.chapter % CHAPTERS.length];
      enemies.push({ unit: next.waves.at(-1).enemies[0], chapter: next.id });
    }
    const extraHp = run.endlessAffixes.includes("iron_vow") ? 1.2 : 1;
    return addPhases({
      ...base,
      endless: true,
      wave: number,
      name: boss ? (dual ? "双王降临" : base.name) : "无尽轮回 · " + base.name,
      boss,
      bossTitle: dual ? "双王降临 · 两名章节 Boss" : base.bossTitle,
      bossSkill: dual ? "两名首领将在最后一批同时出战" : base.bossSkill,
      reward: base.reward + number * 25,
      enemies: enemies.map(({ unit, chapter: origin }) => ({
        ...unit,
        lv: 5 + number,
        hp: Math.round(unit.hp / CHAPTER_HP_MULT[origin - 1] * CHAPTER_HP_MULT.at(-1)
          * Math.pow(1.22, number) * extraHp),
        atk: Math.round(unit.atk / CHAPTER_ATK_MULT[origin - 1] * CHAPTER_ATK_MULT.at(-1)
          * Math.pow(1.15, number))
      }))
    });
  }

  function createEndlessRun(champion) {
    const run = restoreRun(JSON.parse(JSON.stringify(champion)));
    Object.assign(run, {
      mode: "endless", wave: 30, outcome: null, pendingChapterClear: null,
      pendingCoreChoices: null, pendingShop: null, queuedShop: null, pendingEncounter: null,
      totalSpins: 0, totalMatches: 0, totalAbsorbs: 0, maxLines: 0, startedAt: Date.now(),
      hp: run.maxHp
    });
    putEndlessWave(run, 1);
    prepareNextWave(run);
    return run;
  }

  function getEnemyThreatScale() {
    // No auto rubber-banding on star-up so players enjoy crushing 2 normal waves;
    // real difficulty jumps happen on Wave 3 (Mini-Boss) & Wave 6 (Chapter Boss)!
    return { maxStar: 1, hpMult: 1, atkMult: 1, shieldPierce: 0, label: "" };
  }

  function getWave(run) {
    if (run?.mode === "endless") return getEndlessWave(run);
    const Meta = globalThis.SlotboundMeta;
    const diff = Meta ? Meta.getDifficulty(run?.difficulty || "easy") : { id: "easy", wavesPerChapter: 6, hpMult: 0.85, atkMult: 0.82, rewardMult: 1 };
    const totalWaves = diff.wavesPerChapter || 6;
    const chId = Math.max(1, Math.min(CHAPTERS.length, run?.chapter || 1));
    const chapter = CHAPTERS[chId - 1] || CHAPTERS[0];
    const waveInCh = Math.max(1, Math.min(totalWaves, run?.waveInChapter || ((run?.wave || 1) - 1) % totalWaves + 1));

    const isBoss = waveInCh === totalWaves;
    const isMiniBoss = !isBoss && waveInCh > 1 && (waveInCh % Math.max(3, Math.floor(totalWaves / 3)) === 0);
    // Map current waveInCh onto the 5 normal encounter templates or boss template of this chapter
    const tpl = isBoss
      ? chapter.waves[5]
      : chapter.waves[Math.min(4, Math.floor(((waveInCh - 1) / Math.max(1, totalWaves - 1)) * 5))];

    // Wave 1 Floor Guarantee (Ch1-W1): even a single weakest 1-cost white hero can clear Wave 1!
    if (chId === 1 && waveInCh === 1) {
      const baseEnemy = tpl.enemies[0];
      const lightEnemy = {
        ...baseEnemy,
        name: "巡逻斥候",
        hp: 42,
        atk: 5,
        cd: 1.45,
        shieldPierce: 0
      };
      return {
        ...tpl,
        chapter: 1,
        wave: 1,
        waveInChapter: 1,
        totalWavesInChapter: totalWaves,
        name: "初阵试炼 · 巡逻斥候",
        boss: false,
        miniBoss: false,
        reward: 22,
        enemies: [lightEnemy, lightEnemy, lightEnemy],
        phases: [
          { delay: 0, enemies: [lightEnemy, lightEnemy] },
          { delay: 4.0, enemies: [lightEnemy] }
        ]
      };
    }

    const progressRatio = (waveInCh - 1) / Math.max(1, totalWaves - 1);
    const waveScaleHp = (0.85 + progressRatio * 0.55) * diff.hpMult * (isMiniBoss ? 1.25 : 1);
    const waveScaleAtk = (0.88 + progressRatio * 0.42) * diff.atkMult * (isMiniBoss ? 1.18 : 1);
    const scaleList = list => list.map(e => ({
      ...e,
      hp: Math.max(25, Math.round(e.hp * waveScaleHp)),
      atk: Math.max(4, Math.round(e.atk * waveScaleAtk))
    }));

    return {
      ...tpl,
      chapter: chId,
      wave: (chId - 1) * totalWaves + waveInCh,
      waveInChapter: waveInCh,
      totalWavesInChapter: totalWaves,
      boss: isBoss,
      miniBoss: isMiniBoss,
      name: isBoss ? tpl.name : (isMiniBoss ? `精英小首领 · 第 ${waveInCh} 波` : `${tpl.name} (${waveInCh}/${totalWaves})`),
      reward: Math.round(tpl.reward * (diff.rewardMult || 1)),
      enemies: scaleList(tpl.enemies),
      phases: tpl.phases.map(p => ({ ...p, enemies: scaleList(p.enemies) }))
    };
  }

  function getChapter(run) {
    return CHAPTERS[(run?.chapter ?? getWave(run).chapter) - 1] ?? CHAPTERS[0];
  }

  const FIELD_SLOTS = 9; // Freeform left-half arena: starts at 6 pop cap, expandable 6 -> 7 -> 8 -> 9!
  const BENCH_SLOTS = 4;
  const START_FIELD = [0, 1, 2, 3, 4, 5];
  const SHOP_ITEMS = {
    gold_dice: { name: "神铸金骰 (+0.8%金率)", cost: 3, art: "shopDice", desc: "本局永久提升 5 费金色爆率 +0.8%、4 费紫率 +3%！", reqVault: 0 },
    enchant: { name: "单格附魔铁砧", cost: 3, art: "shopAnvil", desc: "为指定盘面格永久设置一种符文。", reqVault: 0 },
    nudge: { name: "时间微调沙漏", cost: 2, art: "shopHourglass", desc: "补充 2 次可跨波保留的微调。", reqVault: 0 },
    dice: { name: "灌铅命运骰", cost: 3, art: "shopDice", desc: "增加指定兵种 20 权重，或移除一种符号。", reqVault: 0 },
    repair: { name: "修复基地生命 (+1 ❤️)", cost: 2, art: "fateCrystal", desc: "恢复 1 点顶部红心【基地城防生命】。", reqVault: 0 },
    spins: { name: "免费转包", cost: 2, art: "shopDice", desc: "下一场战斗前可额外免费转动 3 次。", reqVault: 0 },
    elite_ticket: { name: "高级轮盘券", cost: 5, art: "shopSlot", desc: "立即获得 1 次【独立高级命运轮盘】免费转动（40%蓝/45%紫/15%金）！", reqVault: 1 }
  };
  const SLOT_UPGRADES = {
    field: { name: "出战人口 (+1)", base: 6, max: FIELD_SLOTS, costs: [3, 5, 7] },
    bench: { name: "备战席位", base: 2, max: BENCH_SLOTS, costs: [3, 5] },
    core: { name: "核心槽位", base: 4, max: 6, costs: [4, 5] }
  };

  function defaultUnitPos(run, unit, skipId = null) {
    const isFront = isUnitFrontline(unit.type);
    const xCols = isFront ? [0.40, 0.34, 0.44] : [0.16, 0.23, 0.10];
    const yRows = [0.50, 0.28, 0.72, 0.18, 0.82, 0.39, 0.61];
    const occupied = (run?.field || [])
      .filter(u => u && u.id !== skipId && u.pos)
      .map(u => u.pos);

    let best = { x: xCols[0], y: yRows[0] };
    let bestScore = -1;
    for (const x of xCols) {
      for (const y of yRows) {
        let minDist = 999;
        for (const p of occupied) {
          const d = Math.hypot((p.x - x) * 1.4, p.y - y);
          if (d < minDist) minDist = d;
        }
        if (minDist > bestScore) {
          bestScore = minDist;
          best = { x, y };
        }
      }
    }
    return best;
  }

  function setUnitPos(run, unitId, normX, normY) {
    const loc = findUnitLocation(run, unitId);
    if (!loc || loc.area !== "field") return false;
    loc.unit.pos = {
      x: Math.max(0.06, Math.min(0.46, Number(normX.toFixed(4)))),
      y: Math.max(0.15, Math.min(0.87, Number(normY.toFixed(4))))
    };
    return true;
  }

  function restoreRun(run) {
    run.field ??= Array(FIELD_SLOTS).fill(null);
    while (run.field.length < FIELD_SLOTS) run.field.push(null);
    if (run.field.length > FIELD_SLOTS) run.field.length = FIELD_SLOTS;
    const baseUnlocked = Array.isArray(run.unlockedFieldSlots) ? run.unlockedFieldSlots : [];
    run.unlockedFieldSlots = [...new Set([...START_FIELD, ...baseUnlocked, ...run.field.flatMap((u, i) => u ? [i] : [])])]
      .filter(i => i >= 0 && i < FIELD_SLOTS)
      .sort((a, b) => a - b);
    run.field.forEach(u => {
      if (u) {
        if (!u.pos) u.pos = defaultUnitPos(run, u, u.id);
        ensureUnitSkillState(u);
      }
    });
    run.bench.forEach(u => {
      if (u) ensureUnitSkillState(u);
    });
    run.unlockedBenchSlots ??= Math.max(2, run.bench.findLastIndex(Boolean) + 1);
    run.unlockedCoreSlots ??= Math.max(4, run.cores.length);
    run.nudgeReserve ??= 0;
    run.purchasedEnchants ??= {};
    run.bannedSymbols ??= [];
    run.coreLevels ??= {};
    run.shop ??= createShop(false);
    run.logs ??= [];
    run.difficulty ??= "easy";
    run.waveInChapter ??= 1;
    run.eliteWheelTokens ??= 0;
    run.goldRateBonus ??= 0;
    run.purpleRateBonus ??= 0;
    run.totalGoldSpentOnSpins ??= 0;
    run.nextCoreMilestoneIdx ??= 0;
    run.pendingMastery ??= [];
    run.shopBoughtThisWave ??= false;
    if (!run.sideQuest) assignSideQuest(run);
    run.pendingShop ??= null;
    run.queuedShop ??= null;
    run.pendingEncounter ??= null;
    run.mode ??= "campaign";
    run.maxLines ??= Math.min(8, run.lastLines?.length ?? 0);
    // Sanitize legacy saves that had removed symbols on the reel
    if (Array.isArray(run.board)) {
      run.board = run.board.map(s => (SYMBOLS[s] && SYMBOLS[s].kind !== "legacy") ? s : "knight");
    }
    if (Array.isArray(run.nudgePreview)) {
      run.nudgePreview = run.nudgePreview.map(s => (SYMBOLS[s] && SYMBOLS[s].kind !== "legacy") ? s : "archer");
    }
    return run;
  }

  function isSlotOpen(run, area, index) {
    return area === "field" ? run.unlockedFieldSlots.includes(index) : index < run.unlockedBenchSlots;
  }

  function slotCost(run, area) {
    const config = SLOT_UPGRADES[area];
    if (!config) return null;
    const count = area === "field" ? run.unlockedFieldSlots.length
      : area === "bench" ? run.unlockedBenchSlots : run.unlockedCoreSlots;
    return config.costs[count - config.base] ?? null;
  }

  function unlockSlot(run, area, fieldIndex) {
    const cost = slotCost(run, area);
    if (cost === null || run.crystals < cost) return false;
    if (area === "field") {
      const expandable = [6, 7, 8];
      const index = fieldIndex ?? expandable.find(slot => !isSlotOpen(run, "field", slot));
      if (!expandable.includes(index) || isSlotOpen(run, "field", index)) return false;
      run.unlockedFieldSlots.push(index);
      run.unlockedFieldSlots.sort((a, b) => a - b);
    } else if (area === "bench") {
      run.unlockedBenchSlots += 1;
    } else {
      run.unlockedCoreSlots += 1;
    }
    run.crystals -= cost;
    return true;
  }

  function sample(items, count) {
    const pool = [...items];
    return Array.from({ length: Math.min(count, pool.length) }, () =>
      pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }

  function createShop(halfPrice = false) {
    return {
      halfPrice,
      offers: halfPrice ? sample(Object.keys(SHOP_ITEMS), 3) : Object.keys(SHOP_ITEMS),
      bought: [], rerolls: 0
    };
  }

  function shopPrice(run, item) {
    return Math.ceil(SHOP_ITEMS[item].cost * (run.pendingShop.halfPrice ? 0.5 : 1));
  }

  function refreshShop(run) {
    if (!run.pendingShop || run.pendingShop.halfPrice || run.gold < 15) return false;
    const pool = Object.keys(SHOP_ITEMS);
    const previous = run.pendingShop.offers;
    const offers = sample(pool, 3);
    if (offers.length === previous.length && offers.every(id => previous.includes(id))) {
      offers[2] = sample(pool.filter(id => !previous.includes(id)), 1)[0];
    }
    run.gold -= 15;
    run.pendingShop = { ...run.pendingShop, offers, bought: [], rerolls: run.pendingShop.rerolls + 1 };
    return true;
  }

  function setPurchasedEnchant(run, index, enchant) {
    if (!Number.isInteger(index) || index < 0 || index > 8 || !Object.hasOwn(CELL_ENCHANT_INFO, enchant)) return false;
    run.purchasedEnchants[index] = enchant;
    run.cellEnchants[index] = enchant;
    return true;
  }

  function canModifySymbol(run, id, action) {
    const weights = getEffectiveWeights(run);
    if (!weights[id]) return false;
    if (action === "boost") return UNIT_IDS.includes(id);
    return action === "ban" && Object.values(weights).filter(Boolean).length > 1;
  }

  function shopPurchase(run, item, options = {}) {
    const shop = run.pendingShop;
    if (!shop || !shop.offers.includes(item) || shop.bought.includes(item)) return false;
    const cost = shopPrice(run, item);
    if (run.crystals < cost) return false;

    switch (item) {
      case "enchant":
        if (!setPurchasedEnchant(run, options.index, options.enchant)) return false;
        break;
      case "nudge":
        run.nudgeReserve += 2;
        run.nudgesLeft += 2;
        break;
      case "dice": {
        const { symbol, action } = options;
        if (!canModifySymbol(run, symbol, action)) return false;
        if (action === "boost") {
          run.weights[symbol] = (run.weights[symbol] ?? SYMBOLS[symbol].baseWeight) + 20;
        } else {
          run.bannedSymbols.push(symbol);
        }
        run.nudgePreview = [rollSymbol(run), rollSymbol(run), rollSymbol(run)];
        break;
      }
      case "repair":
        if (run.hp >= run.maxHp) return false;
        run.hp += 1;
        break;
      case "spins":
        run.freeSpins += 3;
        break;
      case "gold_dice":
        run.goldRateBonus = (run.goldRateBonus || 0) + 0.008;
        run.purpleRateBonus = (run.purpleRateBonus || 0) + 0.03;
        break;
      case "elite_ticket":
        run.eliteWheelTokens = (run.eliteWheelTokens || 0) + 1;
        break;
    }
    run.crystals -= cost;
    run.shopBoughtThisWave = true;
    shop.bought.push(item);
    return true;
  }

  function retainedCells(run) {
    return [...new Set([...run.locked, ...run.cellEnchants.flatMap((enchant, index) =>
      enchant === "lock" ? [index] : [])])];
  }

  const CORE_SIX_POOL = ["knight", "assassin", "valkyrie", "archer", "mage", "priest", "joker"];

  const REEL_TIERS = [
    {
      level: 1,
      name: "铁制初机",
      upgradeCost: 55,
      maxLocks: 1,
      jokerBonus: 0,
      statBonus: 0,
      bonusSpins: 0,
      bonusXp: 0,
      rarityOdds: { white: 0.94, green: 0.06, blue: 0, purple: 0, gold: 0 },
      unlocked: CORE_SIX_POOL,
      desc: "白 94% · 绿 6%（1~2费卡池）· 1 锁格位"
    },
    {
      level: 2,
      name: "秘银轮盘",
      upgradeCost: 105,
      maxLocks: 2,
      jokerBonus: 2,
      statBonus: 0.08,
      bonusSpins: 0,
      bonusXp: 0,
      rarityOdds: { white: 0.76, green: 0.21, blue: 0.03, purple: 0, gold: 0 },
      unlocked: CORE_SIX_POOL,
      desc: "白 76% · 绿 21% · 蓝 3% · 锁格 +1 · 全军属性 +8%"
    },
    {
      level: 3,
      name: "符文机台",
      upgradeCost: 170,
      maxLocks: 2,
      jokerBonus: 4,
      statBonus: 0.16,
      bonusSpins: 1,
      bonusXp: 0,
      rarityOdds: { white: 0.58, green: 0.28, blue: 0.12, purple: 0.02, gold: 0 },
      unlocked: CORE_SIX_POOL,
      enchantCells: { 4: "double" },
      desc: "白 58% · 绿 28% · 蓝 12% · 紫 2% · 中心【×2 双倍格】"
    },
    {
      level: 4,
      name: "鎏金圣轮",
      upgradeCost: 260,
      maxLocks: 3,
      jokerBonus: 6,
      statBonus: 0.26,
      bonusSpins: 1,
      bonusXp: 1,
      rarityOdds: { white: 0.42, green: 0.32, blue: 0.18, purple: 0.075, gold: 0.005 },
      unlocked: CORE_SIX_POOL,
      enchantCells: { 4: "double", 0: "gold", 8: "gold" },
      desc: "白 42% · 绿 32% · 蓝 18% · 紫 7.5% · 金 0.5% · 对角【+25G】"
    },
    {
      level: 5,
      name: "命运神机",
      upgradeCost: null,
      maxLocks: 3,
      jokerBonus: 9,
      statBonus: 0.38,
      bonusSpins: 2,
      bonusXp: 2,
      rarityOdds: { white: 0.30, green: 0.32, blue: 0.23, purple: 0.14, gold: 0.01 },
      unlocked: CORE_SIX_POOL,
      enchantCells: { 4: "double", 0: "gold", 8: "gold", 2: "lucky", 6: "lucky" },
      desc: "白 30% · 绿 32% · 蓝 23% · 紫 14% · 金 1.0%（核心/商店可再提金率！）"
    }
  ];

  function getEffectiveRarityOdds(run) {
    const tier = getReelTier(run);
    const base = { ...(tier.rarityOdds || { white: 1, green: 0, blue: 0, purple: 0, gold: 0 }) };
    const Meta = globalThis.SlotboundMeta;
    const meta = Meta ? Meta.loadMeta() : null;
    const maxTier = Meta && meta ? Meta.getMaxUnlockedRarityTier(meta) : 5;

    let goldBonus = (run?.goldRateBonus || 0);
    let purpleBonus = (run?.purpleRateBonus || 0);
    if (run) {
      const compLv = coreLevel(run, "gold_compass");
      if (compLv) { goldBonus += 0.012 * compLv; purpleBonus += 0.04 * compLv; }
      const altarLv = coreLevel(run, "astral_altar");
      if (altarLv) { goldBonus += 0.018 * altarLv; purpleBonus += 0.06 * altarLv; }
      const rollerLv = coreLevel(run, "high_roller");
      if (rollerLv) {
        const stacks = Math.floor((run.totalGoldSpentOnSpins || 0) / 100);
        goldBonus += stacks * 0.004 * rollerLv;
        purpleBonus += stacks * 0.02 * rollerLv;
      }
    }
    if ((meta?.upgrades?.heroArchive || 0) >= 4) goldBonus += 0.003;

    if (maxTier < 5) { base.gold = 0; goldBonus = 0; }
    if (maxTier < 4) { base.purple = 0; purpleBonus = 0; }
    if (maxTier < 3) { base.blue = 0; }

    base.gold = Math.min(0.18, (base.gold || 0) + (base.gold > 0 || (run?.reelLevel || 1) >= 4 ? goldBonus : 0));
    base.purple = Math.min(0.40, (base.purple || 0) + (base.purple > 0 || (run?.reelLevel || 1) >= 3 ? purpleBonus : 0));

    // Rebalance white down so total sums to 1.0 cleanly
    const highSum = base.green + base.blue + base.purple + base.gold;
    base.white = Math.max(0.05, 1 - highSum);
    const total = base.white + base.green + base.blue + base.purple + base.gold;
    for (const k of Object.keys(base)) base[k] = Number((base[k] / total).toFixed(4));
    return base;
  }

  function rollRarityForTier(run, lucky = false) {
    const odds = getEffectiveRarityOdds(run);
    const order = ["white", "green", "blue", "purple", "gold"];
    let r = Math.random();
    if (lucky) r = Math.min(0.999, r + 0.06);
    let acc = 0;
    for (const id of order) {
      acc += odds[id] || 0;
      if (r <= acc) return id;
    }
    return "white";
  }

  function pickHeroForRoll(run, symbolId, isLucky = false, forcedRarity = null) {
    const rarity = forcedRarity || rollRarityForTier(run, isLucky);
    if (rarity === "white") return { type: symbolId, rarity: "white" };
    const pool = HERO_POOL_BY_RARITY[rarity] || HERO_POOL_BY_RARITY.white;
    const wantFront = isUnitFrontline(symbolId);
    const matchedRole = pool.filter(id => isUnitFrontline(id) === wantFront);
    const candidates = matchedRole.length > 0 && Math.random() < 0.7 ? matchedRole : pool;
    const chosen = candidates[Math.floor(Math.random() * candidates.length)] || symbolId;
    return { type: chosen, rarity };
  }

  function executeEliteWheel(run) {
    if (!run || (run.eliteWheelTokens || 0) <= 0) return null;
    run.eliteWheelTokens -= 1;
    // Independent High-Tier Wheel: 40% Blue / 45% Purple / 15% Gold!
    const r = Math.random();
    const rarity = r < 0.15 ? "gold" : r < 0.60 ? "purple" : "blue";
    const pool = HERO_POOL_BY_RARITY[rarity];
    const heroType = pool[Math.floor(Math.random() * pool.length)];
    const unit = createUnit(run.nextId++, heroType, { rarity, heroLv: 2, lucky: true });
    const placement = addUnitToRoster(run, unit);
    if (getEvolutionChoices(unit) && placement.placed !== "overflow_gold" && placement.placed !== "overflow_xp") {
      if (findUnitLocation(run, unit.id) && !run.pendingEvolutions.includes(unit.id)) {
        run.pendingEvolutions.push(unit.id);
      }
    }
    addLog(run, "高级轮盘", `开启独立高级命运轮盘，抽中【${getUnitRarity(unit).label}】${SYMBOLS[heroType].name}！`);
    return { unit, rarity, placement };
  }

  const CELL_ENCHANT_INFO = {
    double: { badge: "×2", name: "双倍符文格", desc: "连线经过此格时，金币与召唤效果翻倍！" },
    gold: { badge: "+25G", name: "鎏金聚财格", desc: "连线经过此格时，额外爆出 +25 金币！" },
    lucky: { badge: "★2", name: "命运赐福格", desc: "连线经过此格召唤的单位自带 +2 经验直达转职！" },
    lock: { badge: "锁定", name: "自动锁定格", desc: "每次转动免费保留当前符号，不占手动锁格额度。" }
  };

  const UNIT_TRAITS = {
    gem_donor: { id: "gem_donor", name: "源晶矿脉", badge: "💎吞噬+1~5晶", color: "#7be7ff", desc: "被吞噬或合星消耗时，随机爆出 1~5 颗命运水晶！" },
    gold_donor: { id: "gold_donor", name: "黄金血脉", badge: "🪙吞噬+30G", color: "#ffd86b", desc: "被吞噬、合星消耗或出售时，额外爆出 +30 金币！" },
    swift_soul: { id: "swift_soul", name: "疾风之魂", badge: "⚡攻速+16%", color: "#5ce1ff", desc: "天生迅捷，自身攻击速度永久 +16%。" },
    iron_skin: { id: "iron_skin", name: "秘银之躯", badge: "🛡️血+22%", color: "#4fd1a5", desc: "天生铁骨，最大生命 +22% 且开局自带 +25 护盾。" },
    fierce_blade: { id: "fierce_blade", name: "嗜血锋芒", badge: "⚔️攻+18%", color: "#ff7a6b", desc: "天生战狂，自身攻击力永久 +18%。" },
    lucky_eye: { id: "lucky_eye", name: "鹰眼致命", badge: "🎯暴击+14%", color: "#f7cf6d", desc: "精准致命，自身暴击率永久 +14%。" },
    vampiric: { id: "vampiric", name: "血族契约", badge: "🩸吸血15%", color: "#ff5c8a", desc: "普攻自带 15% 生命偷取，续航极强。" },
    xp_seed: { id: "xp_seed", name: "传承火种", badge: "🔥吞噬强育", color: "#b78bfa", desc: "被吞噬时，为主体额外提供 +2 经验、+20 生命、+5 攻击！" }
  };
  const UNIT_TRAIT_IDS = Object.keys(UNIT_TRAITS);

  function rollUnitTrait() {
    return UNIT_TRAIT_IDS[Math.floor(Math.random() * UNIT_TRAIT_IDS.length)];
  }

  function triggerConsumedTrait(run, unit, target) {
    if (!unit?.trait) return "";
    if (unit.trait === "gem_donor") {
      const gems = 1 + Math.floor(Math.random() * 5);
      run.crystals = (run.crystals || 0) + gems;
      return `源晶矿脉爆出 +${gems} 颗水晶！`;
    }
    if (unit.trait === "gold_donor") {
      run.gold += 30;
      return "黄金血脉爆出 +30 金币！";
    }
    if (unit.trait === "xp_seed" && target) {
      target.xp = (target.xp || 0) + 2;
      target.bonusHp = (target.bonusHp || 0) + 20;
      target.bonusAtk = (target.bonusAtk || 0) + 5;
      return "传承火种：+2 经验/+20 血/+5 攻！";
    }
    return "";
  }

  function ensureUnitSkillState(unit) {
    if (!unit) return unit;
    if (!unit.rarity || !UNIT_RARITIES[unit.rarity]) {
      unit.rarity = UNIT_RARITY_MAP[unit.type] || "white";
    }
    if (!Number.isFinite(unit.heroLv) || unit.heroLv < 1) {
      const legacyStars = Math.max(1, unit.stars || 1);
      const th = getUnitRarity(unit).starThresholds;
      unit.heroLv = legacyStars >= 2 ? (th[legacyStars - 2] || 1) : Math.max(1, 1 + Math.floor((unit.xp || 0) / 2));
    }
    if (!Array.isArray(unit.skills) || unit.skills.length === 0) {
      const innate = getInnateSkill(unit.type);
      unit.skills = [{ id: innate.id, level: 1 }];
    }
    unit.evolution3 ??= null;
    unit.stars = calcUnitStars(unit, unit.heroLv);
    return unit;
  }

  function createUnit(id, type, opts = {}) {
    const innate = getInnateSkill(type);
    const rarity = opts.rarity && UNIT_RARITIES[opts.rarity] ? opts.rarity : (UNIT_RARITY_MAP[type] || "white");
    const startLv = Math.max(1, opts.heroLv || (1 + Math.floor((opts.xp || 0) / 2)));
    return {
      id,
      type,
      rarity,
      heroLv: startLv,
      stars: calcUnitStars({ type, rarity }, startLv),
      xp: opts.xp || 0,
      skills: opts.skills ? opts.skills.map(s => ({ ...s })) : [{ id: innate.id, level: 1 }],
      trait: opts.trait === undefined ? rollUnitTrait() : opts.trait,
      evolution: opts.evolution || null,
      evolution3: opts.evolution3 || null,
      lucky: !!opts.lucky,
      bonusHp: opts.bonusHp || 0,
      bonusAtk: opts.bonusAtk || 0,
      bonusCrit: opts.bonusCrit || 0
    };
  }

  const STAR_THRESHOLDS = [5, 12, 22, 35];

  function unitLevel(unit) {
    if (!unit) return 1;
    const lv = unit.heroLv || 1;
    return calcUnitStars(unit, lv);
  }

  function nextStarXp(lvl, unit) {
    if (unit) return nextStarLevel(unit, unit.heroLv || 1);
    return STAR_THRESHOLDS[lvl - 1] ?? null;
  }

  function tryAutoMerge(run) {
    const merges = [];
    let merged = true;
    while (merged) {
      merged = false;
      const all = [];
      run.field.forEach((u, idx) => { if (u) all.push({ area: "field", idx, u }); });
      run.bench.forEach((u, idx) => { if (u) all.push({ area: "bench", idx, u }); });

      const groups = new Map();
      for (const entry of all) {
        const s = unitLevel(entry.u);
        if (s >= 5) continue;
        const key = `${entry.u.type}:${s}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(entry);
      }

      for (const entries of groups.values()) {
        if (entries.length < 3) continue;
        // Prefer keeping a unit already on the field, evolved, or with highest bonus/xp
        entries.sort((a, b) =>
          (a.area === "field" ? 0 : 1) - (b.area === "field" ? 0 : 1)
          || (b.u.evolution ? 1 : 0) - (a.u.evolution ? 1 : 0)
          || (b.u.xp || 0) - (a.u.xp || 0)
        );
        const [keep, sac1, sac2] = entries;
        keep.u.stars = unitLevel(keep.u) + 1;
        keep.u.lucky = !!(keep.u.lucky || sac1.u.lucky || sac2.u.lucky);
        keep.u.xp = (keep.u.xp || 0) + (sac1.u.xp || 0) + (sac2.u.xp || 0);
        keep.u.bonusHp = (keep.u.bonusHp || 0) + (sac1.u.bonusHp || 0) + (sac2.u.bonusHp || 0);
        keep.u.bonusAtk = (keep.u.bonusAtk || 0) + (sac1.u.bonusAtk || 0) + (sac2.u.bonusAtk || 0);
        keep.u.bonusCrit = (keep.u.bonusCrit || 0) + (sac1.u.bonusCrit || 0) + (sac2.u.bonusCrit || 0);
        if (!keep.u.evolution) keep.u.evolution = sac1.u.evolution || sac2.u.evolution || null;

        const traitLogs = [];
        for (const sac of [sac1, sac2]) {
          const tMsg = triggerConsumedTrait(run, sac.u, keep.u);
          if (tMsg) traitLogs.push(tMsg);
          if (sac.area === "field") run.field[sac.idx] = null;
          else run.bench[sac.idx] = null;
          run.pendingEvolutions = run.pendingEvolutions.filter(id => id !== sac.u.id);
        }

        if (keep.u.stars >= 2 && !keep.u.evolution && !run.pendingEvolutions.includes(keep.u.id)) {
          run.pendingEvolutions.push(keep.u.id);
        }
        merges.push({ type: keep.u.type, stars: keep.u.stars, id: keep.u.id, traitLogs });
        merged = true;
        break;
      }
    }
    return merges;
  }

  function hasCore(run, coreId) {
    return run.cores.includes(coreId);
  }

  function getUnitStats(unit, run) {
    ensureUnitSkillState(unit);
    const def = SYMBOLS[unit.type];
    const lvl = unitLevel(unit); // 1..5 stars
    const heroLv = unit.heroLv || 1;
    const effLv = heroLv <= 24 ? (heroLv - 1) : 23 + (heroLv - 24) * 0.6;
    // Higher-rarity slot units have higher base quality (White 1.0, Green 1.08, Blue 1.18, Purple 1.30, Gold 1.46)
    const rarityId = getUnitRarity(unit).id;
    const rarityMult = { white: 1, green: 1.08, blue: 1.18, purple: 1.30, gold: 1.46 }[rarityId] || 1;
    // Strong per-level growth (+12% HP / +10% ATK per heroLv) + unmistakable star-up jump (+25% HP / +22% ATK per star)!
    let hp = def.hp * rarityMult * (1 + effLv * 0.12 + (lvl - 1) * 0.25) + unit.bonusHp + (run?.globalBonusHp || 0);
    let atk = def.atk * rarityMult * (1 + effLv * 0.10 + (lvl - 1) * 0.22) + unit.bonusAtk + (run?.globalBonusAtk || 0);
    let crit = def.crit + unit.bonusCrit + (lvl - 1) * 0.025;
    let atkCd = def.atkCd * (1 - (lvl - 1) * 0.04);
    let moveSpd = def.moveSpd || 100;
    let range = def.range || 55;

    // Apply passive stat bonuses from inherited/innate skills
    const shadowSkill = unit.skills?.find(s => s.id === "shadow_crit");
    if (shadowSkill) {
      crit += [0.10, 0.18, 0.26, 0.35, 0.45][Math.min(5, shadowSkill.level) - 1] || 0;
    }

    // Apply Level 30/60 Master Awakening Buffs
    const masteries = unit.masteryBuffs || [];
    if (masteries.includes("titan_body")) hp *= 1.45;
    if (masteries.includes("overdrive_shot")) { range += 65; atkCd *= 0.77; }
    if (masteries.includes("arcane_overload")) atk *= 1.45;
    if (masteries.includes("holy_resonance")) crit += 0.22;

    // Skill Resonator core & Void Omnipotent evo
    if (run && coreLevel(run, "skill_resonator") > 0) {
      const extraSkills = Math.max(0, (unit.skills?.length || 1) - 1);
      if (extraSkills > 0) {
        const mult = 1 + extraSkills * 0.12 * coreLevel(run, "skill_resonator");
        hp *= mult;
        atk *= mult;
      }
    }
    if (unit.evolution3 === "void_omnipotent") {
      const extraSkills = Math.max(0, (unit.skills?.length || 1) - 1);
      if (extraSkills > 0) {
        hp *= (1 + extraSkills * 0.25);
        atk *= (1 + extraSkills * 0.25);
      }
    }

    if (run) {
      const fMap = Object.fromEntries(getFactionSynergies(run).map(f => [f.id, f.tier]));
      if (fMap.alliance >= 3) atk *= 1.18;
      if (fMap.horde >= 2) crit += 0.12;
      if (fMap.horde >= 3) atk *= 1.25;
      if (fMap.elves >= 3) atkCd *= 0.72;
      else if (fMap.elves >= 2) atkCd *= 0.85;
    }

    if (unit.trait === "swift_soul") { atkCd *= 0.84; moveSpd *= 1.15; }
    if (unit.trait === "iron_skin") hp *= 1.22;
    if (unit.trait === "fierce_blade") atk *= 1.18;
    if (unit.trait === "lucky_eye") crit += 0.14;

    if (unit.lucky) {
      hp *= 1.12;
      atk *= 1.12;
    }
    if (unit.evolution && def.evolutions[unit.evolution]) {
      const evo = def.evolutions[unit.evolution];
      const softHp = 1 + (evo.hpMult - 1) * 0.52;
      const softAtk = 1 + (evo.atkMult - 1) * 0.55;
      hp *= softHp;
      atk *= softAtk;
      if (unit.evolution3 && evo.tier3?.[unit.evolution3]) {
        const evo3 = evo.tier3[unit.evolution3];
        hp *= 1 + (evo3.hpMult - 1) * 0.55;
        atk *= 1 + (evo3.atkMult - 1) * 0.58;
        if (unit.evolution3 === "gale_ranger" || unit.evolution3 === "storm_hussar") {
          atkCd *= 0.74;
          moveSpd *= 1.35;
        }
        if (unit.evolution3 === "crimson_reaper") crit += 0.15;
      }
    }
    if (run) {
      const tier = getReelTier(run);
      if (tier.statBonus > 0) {
        hp *= (1 + tier.statBonus);
        atk *= (1 + tier.statBonus);
      }
      const royalLv = coreLevel(run, "royal_decree");
      if (royalLv) atk *= (1 + 0.12 * royalLv);
      const critLv = coreLevel(run, "crit_dice");
      if (critLv) crit += 0.2 + (critLv - 1) * 0.12;
      const arcaneLv = coreLevel(run, "arcane_echo");
      if (arcaneLv && (unit.type === "mage" || unit.type === "priest")) {
        atkCd *= Math.max(0.5, 1 - (0.22 + (arcaneLv - 1) * 0.12));
      }
      const forgeLv = coreLevel(run, "iron_forge");
      if (forgeLv) { hp *= (1 + 0.18 * forgeLv); atk *= (1 + 0.1 * forgeLv); }
      const bootsLv = coreLevel(run, "swift_boots");
      if (bootsLv) {
        atkCd *= Math.max(0.55, 1 - 0.14 * bootsLv);
        moveSpd *= (1 + 0.12 * bootsLv);
      }
      const axeLv = coreLevel(run, "executioner_axe");
      if (axeLv) { atk *= (1 + 0.18 * axeLv); crit += 0.08 * axeLv; }
      const angelLv = coreLevel(run, "guardian_angel");
      if (angelLv) { hp *= (1 + 0.25 * angelLv); atk *= (1 + 0.15 * angelLv); }
      const fieldIdx = run.field.findIndex(u => u && u.id === unit.id);
      const vanLv = coreLevel(run, "vanguard_oath");
      const inFrontZone = (unit.pos?.x ?? (isUnitFrontline(unit.type) ? 0.38 : 0.18)) >= 0.28;
      if (fieldIdx >= 0 && inFrontZone && vanLv) {
        hp *= (1 + 0.3 + (vanLv - 1) * 0.18);
      }
    }

    return {
      hp: Math.round(hp),
      atk: Math.round(atk),
      crit: Math.min(0.95, crit),
      atkCd: Math.max(0.32, atkCd),
      moveSpd: Math.round(moveSpd),
      range: Math.round(range),
      heroLv,
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

  function createRun(opts = {}) {
    const Meta = globalThis.SlotboundMeta;
    const meta = Meta ? Meta.loadMeta() : null;
    const startGoldLv = meta?.upgrades?.startGold || 0;
    const startPopLv = meta?.upgrades?.popCap || 0;
    const startGold = Math.min(150, 100 + startGoldLv * 10);
    const startUnlockedField = Array.from({ length: Math.min(FIELD_SLOTS, 6 + startPopLv) }, (_, i) => i);

    const weights = {};
    for (const id of SYMBOL_IDS) {
      weights[id] = SYMBOLS[id].baseWeight;
    }
    const field = Array(FIELD_SLOTS).fill(null);

    const run = restoreRun({
      mode: "campaign",
      chapter: opts.chapter || meta?.selectedChapter || 1,
      difficulty: opts.difficulty || meta?.selectedDifficulty || "easy",
      wave: 1,
      waveInChapter: 1,
      startedAt: Date.now(),
      gold: startGold,
      crystals: 2,
      hp: 5,
      maxHp: 5,
      freeSpins: 0,
      paidSpinsThisWave: 0,
      spinsThisWave: 0,
      totalSpins: 0,
      totalGoldSpentOnSpins: 0,
      nextCoreMilestoneIdx: 0,
      totalMatches: 0,
      totalAbsorbs: 0,
      nextId: 3,
      reelLevel: 1,
      fever: 0,
      feverActive: false,
      cellEnchants: Array(9).fill(null),
      nudgesLeft: 2,
      nudgePreview: ["knight", "archer", "mage"],
      unlockedFieldSlots: startUnlockedField,
      field,
      bench: Array(BENCH_SLOTS).fill(null),
      board: ["knight", "archer", "mage", "priest", "assassin", "valkyrie", "archer", "mage", "priest"],
      locked: [],
      lastLines: [],
      cores: [],
      coreLevels: {},
      weights,
      rigBoosts: {},
      globalBonusHp: 0,
      globalBonusAtk: 0,
      goldRateBonus: 0,
      purpleRateBonus: 0,
      eliteWheelTokens: 0,
      shopBoughtThisWave: false,
      pendingEvolutions: [],
      pendingMastery: [],
      pendingCoreChoices: null,
      pendingChapterClear: null,
      outcome: null
    });
    assignSideQuest(run);
    return run;
  }

  function getReelTier(run) {
    return REEL_TIERS[Math.min((run.reelLevel || 1) - 1, REEL_TIERS.length - 1)];
  }

  function getEffectiveWeights(run) {
    const tier = getReelTier(run);
    const unlocked = new Set(tier.unlocked);
    const w = {};
    for (const id of SYMBOL_IDS) {
      if (!unlocked.has(id) || run.bannedSymbols?.includes(id)) {
        w[id] = 0;
        continue;
      }
      let val = run.weights[id] ?? SYMBOLS[id].baseWeight;
      if (id === "joker") {
        val += tier.jokerBonus;
        if (hasCore(run, "wild_surge")) val *= 2;
      }
      w[id] = Math.max(2, val);
    }
    return w;
  }

  function getSymbolOdds(run) {
    const w = getEffectiveWeights(run);
    const total = Object.values(w).reduce((a, b) => a + b, 0) || 1;
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
      if (w[id] <= 0) continue;
      r -= w[id];
      if (r <= 0) return id;
    }
    return "knight";
  }

  function getMaxLocks(run) {
    const tier = getReelTier(run);
    return tier.maxLocks + (hasCore(run, "extra_lock") ? 2 : 0);
  }

  function getLockCost(run) {
    return hasCore(run, "extra_lock") ? 5 : 10;
  }

  function getSpinCost(run) {
    if (run.feverActive || run.freeSpins > 0) return 0;
    return 20 + run.paidSpinsThisWave * 10;
  }

  function getTotalSpinCost(run) {
    return getSpinCost(run) + run.locked.length * getLockCost(run);
  }

  function upgradeReelTier(run) {
    const cur = getReelTier(run);
    if (!cur.upgradeCost || run.gold < cur.upgradeCost || run.reelLevel >= REEL_TIERS.length) {
      return null;
    }
    run.gold -= cur.upgradeCost;
    run.reelLevel += 1;
    const next = getReelTier(run);
    run.cellEnchants = Array(9).fill(null);
    if (next.enchantCells) {
      for (const [cellIdx, enchant] of Object.entries(next.enchantCells)) {
        run.cellEnchants[Number(cellIdx)] = enchant;
      }
    }
    for (const [index, enchant] of Object.entries(run.purchasedEnchants)) {
      run.cellEnchants[index] = enchant;
    }
    run.nudgePreview = [rollSymbol(run), rollSymbol(run), rollSymbol(run)];
    return next;
  }

  function hasNearMiss(board) {
    // Check if col 0 & col 1 already form a 2-match on any row or diagonal
    const pairs = [
      [0, 1], [3, 4], [6, 7], // rows
      [0, 4], [6, 4]          // diagonals
    ];
    return pairs.some(([a, b]) => board[a] === board[b] || board[a] === "joker" || board[b] === "joker");
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
    for (let idx = 0; idx < FIELD_SLOTS; idx += 1) {
      if (isSlotOpen(run, "field", idx) && !run.field[idx]) {
        if (!unit.pos) unit.pos = defaultUnitPos(run, unit, unit.id);
        run.field[idx] = unit;
        return { placed: "field", index: idx };
      }
    }
    for (let i = 0; i < run.unlockedBenchSlots; i += 1) {
      if (!run.bench[i]) {
        run.bench[i] = unit;
        return { placed: "bench", index: i };
      }
    }
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

  function awardHits(run, hits, isFever, summary) {
    const enchants = run.cellEnchants || Array(9).fill(null);
    run.totalMatches += hits.length;
    run.maxLines = Math.max(run.maxLines ?? 0, hits.length);
    if (hits.length >= 3 && Math.random() < 0.35) {
      run.crystals += 1;
      summary.notes.push("连线暴击：+1 命运水晶！");
    }

    if (hasCore(run, "coin_sack")) {
      run.gold += 10;
      summary.goldGained += 10;
    }

    if (hits.length >= 2) {
      const comboGold = 14 * (hits.length - 1) * (isFever ? 2 : 1);
      run.gold += comboGold;
      summary.goldGained += comboGold;
      summary.notes.push(`${hits.length} 重连线暴击！额外 +${comboGold} 金币`);

      // Check combo_line side quest
      if (run.sideQuest && !run.sideQuest.completed && run.sideQuest.id === "combo_line") {
        run.sideQuest.progress = Math.min(run.sideQuest.target, (run.sideQuest.progress || 0) + 1);
        if (run.sideQuest.progress >= run.sideQuest.target) {
          run.sideQuest.completed = true;
          run.eliteWheelTokens = (run.eliteWheelTokens || 0) + 1;
          summary.notes.push("🎯 支线完成！奖励【独立高级命运轮盘】免费 1 转！");
        }
      }

      if (hasCore(run, "blast_cart")) {
        run.gold += 35;
        run.globalBonusAtk += 2;
        summary.goldGained += 35;
        summary.notes.push("连爆矿车：+35 金币，全军永久 +2 攻击！");
      }
    }

    for (const hit of hits) {
      const lineEnchants = hit.cells.map(c => enchants[c]).filter(Boolean);
      const hasDouble = lineEnchants.includes("double");
      const goldCells = lineEnchants.filter(e => e === "gold").length;
      const hasLuckyCell = lineEnchants.includes("lucky");

      if (goldCells > 0) {
        const bonus = goldCells * 25 * (isFever ? 2 : 1);
        run.gold += bonus;
        summary.goldGained += bonus;
        summary.notes.push(`鎏金格触发 +${bonus} 金币`);
      }

      const mult = (hasDouble ? 2 : 1) * (isFever ? 2 : 1);

      if (hit.superJackpot) {
        const g = 120 * mult;
        run.gold += g;
        summary.goldGained += g;
        const pool = getReelTier(run).unlocked.filter(id => UNIT_IDS.includes(id) && !run.bannedSymbols.includes(id));
        const randType = sample(pool.length > 0 ? pool : getReelTier(run).unlocked.filter(id => UNIT_IDS.includes(id)), 1)[0];
        const unit = createUnit(run.nextId++, randType, { xp: 2 + (isFever ? 1 : 0), lucky: true });
        addUnitToRoster(run, unit);
        if (!run.pendingEvolutions.includes(unit.id)) {
          run.pendingEvolutions.push(unit.id);
        }
        summary.summoned.push(unit);
        summary.notes.push(`三王大满贯！+${g} 金币 & 召唤 2 星幸运精锐！`);
      } else {
        const midasLv = coreLevel(run, "midas_reel");
        if (midasLv) {
          const mg = 18 * midasLv;
          run.gold += mg;
          run.globalBonusHp += 10 * midasLv;
          run.globalBonusAtk += 2 * midasLv;
          summary.goldGained += mg;
          summary.notes.push(`点金滚轮 Lv.${midasLv}：+${mg}G，全军 +${10 * midasLv}血/+${2 * midasLv}攻`);
        }
        const tier = getReelTier(run);
        const wildLv = coreLevel(run, "wild_surge");
        const extraXp = (hits.length >= 2 ? 1 : 0)
          + (hit.hasWild && wildLv ? wildLv + 1 : 0)
          + (isFever ? 1 : 0)
          + (hasLuckyCell ? 2 : 0)
          + (tier.bonusXp || 0);
        const royalLv = coreLevel(run, "royal_decree");
        const royalChance = royalLv ? Math.min(0.85, 0.4 + (royalLv - 1) * 0.2) : 0;
        const spawnCount = (hasDouble ? 2 : 1) + (royalLv && Math.random() < royalChance ? 1 : 0);
        if (hasDouble) summary.notes.push("双倍符文格：双倍召唤！");
        if (hasLuckyCell) summary.notes.push("命运赐福格：直出高阶经验！");

        for (let s = 0; s < spawnCount; s += 1) {
          const isLucky = hit.hasWild || isFever || hasLuckyCell;
          const rolled = pickHeroForRoll(run, hit.symbol, isLucky);
          const unit = createUnit(run.nextId++, rolled.type, {
            rarity: rolled.rarity,
            heroLv: 1 + (hasLuckyCell ? 2 : 0) + (tier.bonusXp || 0),
            xp: extraXp,
            lucky: isLucky
          });
          if (rolled.rarity !== "white" && coreLevel(run, "astral_altar") > 0) {
            run.globalBonusAtk += 3 * coreLevel(run, "astral_altar");
          }
          const placement = addUnitToRoster(run, unit);
          if (getEvolutionChoices(unit) && placement.placed !== "overflow_gold" && placement.placed !== "overflow_xp") {
            if (findUnitLocation(run, unit.id) && !run.pendingEvolutions.includes(unit.id)) {
              run.pendingEvolutions.push(unit.id);
            }
          }
          summary.summoned.push(unit);
        }
      }
    }
  }

  function executeSpin(run) {
    const cost = getTotalSpinCost(run);
    if (run.gold < cost) return null;

    run.gold -= cost;
    run.totalGoldSpentOnSpins = (run.totalGoldSpentOnSpins || 0) + cost;
    const isFever = !!run.feverActive;
    if (isFever) {
      run.feverActive = false;
      run.fever = 0;
    } else if (run.freeSpins > 0) {
      run.freeSpins -= 1;
    } else {
      run.paidSpinsThisWave += 1;
    }
    run.spinsThisWave += 1;
    run.totalSpins += 1;

    // Spin-linked Core Draft milestone (5, 10, 18, 28, 40, 55... spins!)
    const nextMilestone = CORE_SPIN_MILESTONES[run.nextCoreMilestoneIdx || 0];
    if (nextMilestone && run.totalSpins >= nextMilestone) {
      run.nextCoreMilestoneIdx = (run.nextCoreMilestoneIdx || 0) + 1;
      const choices = draftCoreChoices(run);
      if (choices.length) run.pendingCoreChoices = choices;
    }

    const retained = retainedCells(run);
    const nextBoard = Array.from({ length: 9 }, (_, i) =>
      retained.includes(i) ? run.board[i] : rollSymbol(run)
    );

    if ((isFever || (run.spinsThisWave === 1 && hasCore(run, "black_note"))) && !run.locked.includes(4)) {
      nextBoard[4] = "joker";
    }

    run.board = nextBoard;
    run.locked = [];
    run.paidNudgesThisSpin = 0;
    run.nudgePreview = [rollSymbol(run), rollSymbol(run), rollSymbol(run)];

    let hits = evaluateBoard(nextBoard);
    const totalOwnedUnits = [...run.field, ...run.bench].filter(Boolean).length;
    let pityTriggered = false;
    // Anti-brick pity ONLY when player has 0 units AND cannot afford another spin (won't fire if holding gold for interest!)
    if (hits.length === 0 && totalOwnedUnits === 0 && run.freeSpins <= 0 && !run.feverActive && run.gold < getSpinCost(run)) {
      const unitPool = getReelTier(run).unlocked.filter(id => UNIT_IDS.includes(id));
      const rescueSym = unitPool[Math.floor(Math.random() * unitPool.length)] || "knight";
      nextBoard[3] = rescueSym;
      nextBoard[4] = rescueSym;
      nextBoard[5] = rescueSym;
      run.board = nextBoard;
      hits = evaluateBoard(nextBoard);
      pityTriggered = true;
    }
    run.lastLines = hits;
    run.claimedLines = hits.map(h => h.id);

    const summary = {
      board: [...nextBoard],
      hits,
      isFever,
      nearMiss: hasNearMiss(nextBoard),
      goldGained: 0,
      freeSpinsGained: 0,
      summoned: [],
      notes: pityTriggered ? ["零兵绝境保底触发！强制连线召唤首发英雄！"] : [],
      triggeredFever: false
    };

    if (hits.length === 0) {
      if (!isFever) {
        run.fever = Math.min(100, (run.fever || 0) + 25);
        if (run.fever >= 100) {
          run.feverActive = true;
          summary.triggeredFever = true;
          summary.notes.push("狂热槽蓄满！下一转【狂热转盘】免费+中心百搭+双倍奖励！");
        }
      }
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

    if (!isFever) {
      run.fever = Math.min(100, (run.fever || 0) + 12);
      if (run.fever >= 100) {
        run.feverActive = true;
        summary.triggeredFever = true;
      }
    }

    awardHits(run, hits, isFever, summary);
    return summary;
  }

  function getNudgeCost(run) {
    if ((run.nudgesLeft || 0) > 0) return 0;
    return (run.paidNudgesThisSpin || 0) >= 2 ? null : 10;
  }

  function getWinningNudgeCols(run) {
    const preview = run.nudgePreview || [];
    const claimed = new Set(run.claimedLines || []);
    const cols = [];
    for (let col = 0; col < 3; col += 1) {
      const inc = preview[col];
      if (!inc) continue;
      const b = [...run.board];
      b[col + 6] = b[col + 3];
      b[col + 3] = b[col];
      b[col] = inc;
      const newHits = evaluateBoard(b).filter(line =>
        !claimed.has(line.id) && line.cells.some(c => c % 3 === col)
      );
      if (newHits.length > 0) cols.push(col);
    }
    return cols;
  }

  function nudgeColumn(run, col) {
    if (col < 0 || col > 2) return null;
    const cost = getNudgeCost(run);
    if (cost === null) return null;
    if (cost > 0) {
      if (run.gold < cost) return null;
      run.gold -= cost;
      run.paidNudgesThisSpin = (run.paidNudgesThisSpin || 0) + 1;
    } else {
      if (run.nudgesLeft <= run.nudgeReserve) run.nudgeReserve -= 1;
      run.nudgesLeft -= 1;
    }
    const incoming = (run.nudgePreview && run.nudgePreview[col]) || rollSymbol(run);
    const b = [...run.board];
    b[col + 6] = b[col + 3];
    b[col + 3] = b[col];
    b[col] = incoming;
    run.board = b;
    run.nudgePreview[col] = rollSymbol(run);

    const claimed = new Set(run.claimedLines || []);
    const allHits = evaluateBoard(b);
    // ONLY award NEW paylines that actually pass through the nudged column and haven't been claimed on this spin!
    const newHits = allHits.filter(line =>
      !claimed.has(line.id) && line.cells.some(c => c % 3 === col)
    );
    for (const h of newHits) claimed.add(h.id);
    run.claimedLines = [...claimed];
    run.lastLines = newHits;

    const summary = {
      board: [...b],
      hits: newHits,
      cost,
      isFever: false,
      goldGained: 0,
      freeSpinsGained: 0,
      summoned: [],
      notes: []
    };
    if (newHits.length > 0) {
      awardHits(run, newHits, false, summary);
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
    if (!isSlotOpen(run, fromArea, fromIdx) || !isSlotOpen(run, toArea, toIdx)) return false;
    const srcArr = fromArea === "field" ? run.field : run.bench;
    const dstArr = toArea === "field" ? run.field : run.bench;
    const temp = srcArr[fromIdx];
    srcArr[fromIdx] = dstArr[toIdx];
    dstArr[toIdx] = temp;
    if (toArea === "field" && dstArr[toIdx] && !dstArr[toIdx].pos) {
      dstArr[toIdx].pos = defaultUnitPos(run, dstArr[toIdx], dstArr[toIdx].id);
    }
    if (fromArea === "field" && srcArr[fromIdx] && !srcArr[fromIdx].pos) {
      srcArr[fromIdx].pos = defaultUnitPos(run, srcArr[fromIdx], srcArr[fromIdx].id);
    }
    return true;
  }

  function absorbUnit(run, targetId, donorId, options = {}) {
    if (targetId === donorId) return null;
    const tLoc = findUnitLocation(run, targetId);
    const dLoc = findUnitLocation(run, donorId);
    if (!tLoc || !dLoc) return null;

    const target = ensureUnitSkillState(tLoc.unit);
    const donor = ensureUnitSkillState(dLoc.unit);
    const targetRarity = getUnitRarity(target);
    const donorRarity = getUnitRarity(donor);
    const beforeStars = unitLevel(target);

    const mode = options.mode === "inherit" ? "inherit" : "feed";
    const crestLv = coreLevel(run, "devour_crest");
    let lvGain = 1;
    let skillSummary = "";

    if (mode === "inherit") {
      // Choosing to inherit a skill grants ONLY +1 level (+1 extra if Devour Crest core)
      lvGain = 1 + (crestLv ? 1 : 0);
      const chosenSkillId = options.skillId || getInnateSkill(donor.type).id;
      const skillDef = INNATE_SKILLS[chosenSkillId] || getInnateSkill(donor.type);
      const existing = target.skills.find(s => s.id === skillDef.id);
      if (existing) {
        if (existing.level < 5) {
          existing.level += 1;
          skillSummary = `技能升级：【${skillDef.name}】→ Lv.${existing.level}`;
        } else {
          skillSummary = `【${skillDef.name}】已满级 Lv.5`;
        }
      } else if (target.skills.length < targetRarity.slots) {
        target.skills.push({ id: skillDef.id, level: 1 });
        skillSummary = `习得技能：【${skillDef.name}】Lv.1`;
      } else if (Number.isInteger(options.replaceIndex) && options.replaceIndex >= 0 && options.replaceIndex < target.skills.length) {
        const replacedDef = INNATE_SKILLS[target.skills[options.replaceIndex].id];
        target.skills[options.replaceIndex] = { id: skillDef.id, level: 1 };
        skillSummary = `替换【${replacedDef?.name || "旧技能"}】→ 习得【${skillDef.name}】Lv.1`;
      } else {
        return { error: "技能栏已满，请选择要替换的技能槽位，或改为【纯吞噬升多级】！" };
      }
    } else {
      // Pure feed (no skill inheritance): White +2, Green +3, Blue +4, Purple +5, Gold +6 (+ partial donor level transfer!)
      const transferBonus = Math.floor(((donor.heroLv || 1) - 1) * 0.5);
      lvGain = donorRarity.feedLevels + transferBonus + (crestLv ? 1 : 0);
      skillSummary = `纯吞噬【${donorRarity.name}色兵】直升 +${lvGain} 级`;
    }

    if (crestLv) {
      run.gold += 18 + (crestLv - 1) * 12;
    }

    const beforeHeroLv = target.heroLv || 1;
    const tomeBonus = coreLevel(run, "mastery_tome") > 0 ? 1 : 0;
    target.heroLv = beforeHeroLv + lvGain + (mode === "feed" ? tomeBonus : 0);
    target.xp = (target.xp || 0) + lvGain;
    if (donor.lucky) target.lucky = true;
    // Rarity NEVER changes from absorbing! Only level & stars progress within the hero's own rarity!
    target.stars = calcUnitStars(target, target.heroLv);

    // Every 30 levels (Lv.30, Lv.60...), trigger a 3-choice Master Awakening Buff!
    const beforeMasteryTier = Math.floor(beforeHeroLv / 30);
    const afterMasteryTier = Math.floor(target.heroLv / 30);
    if (afterMasteryTier > beforeMasteryTier) {
      run.pendingMastery ??= [];
      const owned = new Set(target.masteryBuffs || []);
      const pool = getMasteryPoolForUnit(target).filter(b => !owned.has(b.id));
      if (pool.length > 0) {
        run.pendingMastery.push({
          unitId: target.id,
          level: afterMasteryTier * 30,
          options: pool.slice(0, 3)
        });
      }
    }

    const traitBonus = triggerConsumedTrait(run, donor, target);
    const inherited = [skillSummary, traitBonus].filter(Boolean).join(" · ");

    if (dLoc.area === "field") run.field[dLoc.index] = null;
    else run.bench[dLoc.index] = null;
    run.pendingEvolutions = run.pendingEvolutions.filter(id => id !== donor.id);

    run.totalAbsorbs += 1;

    const afterStars = unitLevel(target);
    let triggeredEvo = false;
    if (getEvolutionChoices(target)) {
      if (!run.pendingEvolutions.includes(target.id)) {
        run.pendingEvolutions.push(target.id);
      }
      triggeredEvo = true;
    }

    return {
      target,
      xpGain: lvGain,
      lvGain,
      beforeStars,
      afterStars,
      sameClass: target.type === donor.type,
      inherited,
      triggeredEvo
    };
  }

  function sellUnit(run, unitId) {
    const loc = findUnitLocation(run, unitId);
    if (!loc) return 0;
    const deployedCount = run.field.filter(Boolean).length;
    if (loc.area === "field" && deployedCount <= 1 && run.bench.every(u => !u)) {
      return 0; // Keep at least 1 unit alive
    }
    const value = 15 + loc.unit.xp * 10 + (loc.unit.trait === "gold_donor" ? 30 : 0);
    run.gold += value;
    if (loc.area === "field") run.field[loc.index] = null;
    else run.bench[loc.index] = null;
    run.pendingEvolutions = run.pendingEvolutions.filter(id => id !== unitId);
    return value;
  }

  function applyEvolution(run, unitId, evoId) {
    const loc = findUnitLocation(run, unitId);
    if (!loc) return false;
    const unit = loc.unit;
    const choices = getEvolutionChoices(unit);
    if (!choices || !choices.options.some(o => o.id === evoId)) return false;
    if (choices.tier === 2) {
      unit.evolution = evoId;
    } else if (choices.tier === 3) {
      unit.evolution3 = evoId;
    }
    // Keep in pendingEvolutions if unit jumped straight from 1★ to 3★ and still needs Tier 3 choice!
    if (!getEvolutionChoices(unit)) {
      run.pendingEvolutions = run.pendingEvolutions.filter(id => id !== unitId);
    }
    return true;
  }

  function applyMastery(run, unitId, buffId) {
    const loc = findUnitLocation(run, unitId);
    if (!loc) {
      run.pendingMastery = (run.pendingMastery || []).filter(m => m.unitId !== unitId);
      return false;
    }
    loc.unit.masteryBuffs ??= [];
    if (!loc.unit.masteryBuffs.includes(buffId)) {
      loc.unit.masteryBuffs.push(buffId);
    }
    const idx = (run.pendingMastery || []).findIndex(m => m.unitId === unitId);
    if (idx >= 0) run.pendingMastery.splice(idx, 1);
    return true;
  }

  function getNextCoreMilestone(run) {
    return CORE_SPIN_MILESTONES[run?.nextCoreMilestoneIdx || 0] ?? null;
  }

  function getRigBoostCost(run, symId) {
    const count = run.rigBoosts[symId] || 0;
    return count < 2 ? 1 : 2; // Costs Fate Crystals!
  }

  function boostSymbolWeight(run, symId) {
    const count = run.rigBoosts[symId] || 0;
    const cost = getRigBoostCost(run, symId);
    if (!getEffectiveWeights(run)[symId] || run.crystals < cost || count >= 4) return false;
    run.crystals -= cost;
    run.weights[symId] = (run.weights[symId] || SYMBOLS[symId].baseWeight) + 12;
    run.rigBoosts[symId] = count + 1;
    return true;
  }

  function reduceSymbolWeight(run, symId) {
    const cost = 2; // 2 Fate Crystals
    const current = run.weights[symId] ?? SYMBOLS[symId].baseWeight;
    if (!getEffectiveWeights(run)[symId] || run.crystals < cost || current <= 4) return false;
    run.crystals -= cost;
    run.weights[symId] = Math.max(4, current - 10);
    return true;
  }

  function addLog(run, tag, text) {
    if (!run) return;
    run.logs ??= [];
    const stamp = run.mode === "endless"
      ? `无尽 W${run.endlessWave || 1}`
      : `C${run.chapter || 1}-W${((run.wave - 1) % 6) + 1}`;
    run.logs.unshift({ at: Date.now(), stamp, tag, text });
    if (run.logs.length > 120) run.logs.length = 120;
  }

  function ensureShop(run) {
    if (!run.shop) run.shop = createShop(false);
    return run.shop;
  }

  function draftCoreChoices(run) {
    const ch = run.chapter || 1;
    const levels = run.coreLevels || {};
    const slotsFull = run.cores.length >= run.unlockedCoreSlots;
    const Meta = globalThis.SlotboundMeta;
    const meta = Meta ? Meta.loadMeta() : null;
    const workshopLv = meta?.upgrades?.coreWorkshop || 0;
    const choiceCount = workshopLv >= 2 ? 4 : 3;

    const baseOdds = ch === 1
      ? { common: 0.78, rare: 0.20, legendary: 0.02 }
      : ch === 2
        ? { common: 0.58, rare: 0.34, legendary: 0.08 }
        : ch === 3
          ? { common: 0.38, rare: 0.44, legendary: 0.18 }
          : ch === 4
            ? { common: 0.20, rare: 0.50, legendary: 0.30 }
            : { common: 0.10, rare: 0.44, legendary: 0.46 };

    const legBoost = workshopLv * 0.06;
    const rareBoost = workshopLv * 0.06;
    const rarityOdds = {
      common: Math.max(0.05, baseOdds.common - legBoost - rareBoost),
      rare: baseOdds.rare + rareBoost,
      legendary: baseOdds.legendary + legBoost
    };
    const sum = rarityOdds.common + rarityOdds.rare + rarityOdds.legendary;
    rarityOdds.common /= sum;
    rarityOdds.rare /= sum;
    rarityOdds.legendary /= sum;

    const pickWeighted = (list, count, picked) => {
      const rem = list.filter(c => !picked.includes(c.id));
      while (picked.length < count && rem.length > 0) {
        const r = Math.random();
        const targetRarity = r < rarityOdds.common ? "common"
          : r < rarityOdds.common + rarityOdds.rare ? "rare" : "legendary";
        let candidates = rem.filter(c => c.rarity === targetRarity);
        if (candidates.length === 0) candidates = rem;
        const chosen = candidates[Math.floor(Math.random() * candidates.length)];
        picked.push(chosen.id);
        rem.splice(rem.indexOf(chosen), 1);
      }
    };

    const picked = [];
    const unowned = CORES.filter(c => !run.cores.includes(c.id));
    const upgradeable = CORES.filter(c => run.cores.includes(c.id) && (levels[c.id] || 1) < 3);

    if (!slotsFull) {
      pickWeighted(unowned, choiceCount, picked);
      pickWeighted(upgradeable, choiceCount, picked);
    } else {
      pickWeighted(upgradeable, Math.min(2, upgradeable.length), picked);
      pickWeighted(unowned, choiceCount, picked);
      pickWeighted(upgradeable, choiceCount, picked);
    }
    return picked;
  }

  function pickCore(run, coreId) {
    run.coreLevels ??= {};
    if (!run.cores.includes(coreId)) {
      if (run.cores.length >= run.unlockedCoreSlots) {
        // Replace oldest non-legendary core (or oldest core) so full slots never block drafting!
        const rarityRank = id => ({ common: 0, rare: 1, legendary: 2 }[CORES.find(c => c.id === id)?.rarity] ?? 0);
        const replaceIdx = run.cores.reduce((best, id, idx) =>
          rarityRank(id) < rarityRank(run.cores[best]) ? idx : best, 0);
        const removed = run.cores[replaceIdx];
        delete run.coreLevels[removed];
        run.cores[replaceIdx] = coreId;
      } else {
        run.cores.push(coreId);
      }
      run.coreLevels[coreId] = 1;
      if (coreId === "free_spin_gear") run.freeSpins += 2;
      if (coreId === "guardian_angel") run.freeSpins += 1;
    } else {
      run.coreLevels[coreId] = Math.min(3, (run.coreLevels[coreId] || 1) + 1);
      if (coreId === "free_spin_gear") run.freeSpins += 1;
      if (coreId === "lucky_bell") run.globalBonusHp += 15;
    }
    run.pendingCoreChoices = null;
    return true;
  }

  const ENCOUNTERS = {
    cede: { name: "赌命祭坛", desc: "牺牲 1 点城防，获得一枚未持有的传说核心和 100 金币。核心槽满时替换一枚较低稀有度核心。" },
    safe: { name: "祭坛赠礼", desc: "领取 35 金币。" },
    mirror: { name: "镜像熔炉", desc: "复制出战战力最高的单位至空备战位，保留经验、转职与强化属性。" },
    recast: { name: "混沌重铸", desc: "随机把一枚普通核心替换为未持有的传说核心，继承等级。" },
    runes: { name: "混沌铭文", desc: "随机获得 2 个永久双倍格。优先使用空白格。" },
    market: { name: "神秘黑市", desc: "打开黑市，半价购买三件随机秘宝。水晶价格向上取整。" },
    supply: { name: "水晶遗馈", desc: "领取 3 枚命运水晶。" }
  };

  function legendaryChoices(run) {
    return CORES.filter(core => core.rarity === "legendary" && !run.cores.includes(core.id));
  }

  function encounterAvailable(run, id) {
    const rarityOf = key => CORES.find(core => core.id === key)?.rarity;
    if (id === "cede") {
      return run.hp > 1 && legendaryChoices(run).length > 0
        && (run.cores.length < run.unlockedCoreSlots || run.cores.some(key => rarityOf(key) !== "legendary"));
    }
    if (id === "mirror") return run.field.some(Boolean) && run.bench.slice(0, run.unlockedBenchSlots).includes(null);
    if (id === "recast") return legendaryChoices(run).length > 0 && run.cores.some(key => rarityOf(key) === "common");
    if (id === "runes") return run.cellEnchants.filter(enchant => enchant !== "double").length >= 2;
    return id === "safe" || id === "market" || id === "supply";
  }

  function draftEncounter(run) {
    const options = Object.keys(ENCOUNTERS).filter(id => !["safe", "supply"].includes(id)
      && encounterAvailable(run, id));
    if (options.length < 2) options.push("supply");
    return ["safe", ...sample(options, 2)];
  }

  function cashInLegendary(run, old) {
    const [legendary] = sample(legendaryChoices(run), 1);
    if (old) {
      run.cores[run.cores.indexOf(old)] = legendary.id;
      run.coreLevels[legendary.id] = run.coreLevels[old] ?? 1;
      delete run.coreLevels[old];
    } else {
      pickCore(run, legendary.id);
    }
  }

  function pickEncounter(run, id) {
    if (!run.pendingEncounter?.includes(id) || !encounterAvailable(run, id)) return false;
    if (id === "safe") {
      run.gold += 35;
    } else if (id === "supply") {
      run.crystals += 3;
    } else if (id === "cede" || id === "recast") {
      const eligible = CORES.filter(core => run.cores.includes(core.id) &&
        (id === "recast" ? core.rarity === "common" : core.rarity !== "legendary"));
      const [replaced] = id === "recast" || run.cores.length >= run.unlockedCoreSlots ? sample(eligible, 1) : [];
      cashInLegendary(run, replaced?.id);
      if (id === "cede") {
        run.hp -= 1;
        run.gold += 100;
      }
    } else if (id === "mirror") {
      const index = run.bench.slice(0, run.unlockedBenchSlots).indexOf(null);
      const strongest = run.field.filter(Boolean).sort((a, b) => unitPower(b, run) - unitPower(a, run))[0];
      const copy = { ...strongest, id: run.nextId++ };
      run.bench[index] = copy;
      if (unitLevel(copy) >= 2 && !copy.evolution) run.pendingEvolutions.push(copy.id);
    } else if (id === "runes") {
      const empty = run.cellEnchants.flatMap((enchant, index) => !enchant ? [index] : []);
      const existing = run.cellEnchants.flatMap((enchant, index) => enchant && enchant !== "double" ? [index] : []);
      const cells = [...sample(empty, 2), ...sample(existing, 2)].slice(0, 2);
      cells.forEach(index => setPurchasedEnchant(run, index, "double"));
    } else if (id === "market") {
      run.queuedShop = run.pendingShop;
      run.pendingShop = createShop(true);
    }
    run.pendingEncounter = null;
    return true;
  }

  function prepareNextWave(run) {
    const tier = getReelTier(run);
    const gearLv = coreLevel(run, "free_spin_gear");
    const angelLv = coreLevel(run, "guardian_angel");
    const nudgeLv = coreLevel(run, "twin_nudge");
    run.freeSpins = 1 + (tier.bonusSpins || 0) + (gearLv ? gearLv + 1 : 0) + (angelLv ? 1 : 0);
    run.paidSpinsThisWave = 0;
    run.spinsThisWave = 0;
    run.nudgesLeft = 2 + nudgeLv + run.nudgeReserve;
    run.locked = [];
    run.lastLines = [];
  }

  function resolveWave(run, won, battle = {}) {
    const waveDef = getWave(run);
    const endless = run.mode === "endless";
    let reward = (won ? waveDef.reward : Math.round(waveDef.reward * 0.65)) + (battle.gold ?? 0);
    let interest = 0;
    const ledgerLv = coreLevel(run, "interest_ledger");
    if (won && ledgerLv) {
      interest = Math.min(45 + (ledgerLv - 1) * 25, Math.floor(run.gold / 20) * 5);
      reward += interest;
    }
    run.gold += reward;
    const prismLv = coreLevel(run, "crystal_prism");
    const crystalBonus = won ? (waveDef.boss ? 5 : 2) + Number(!!battle.flawless) + prismLv : 0;
    const crystalsGained = crystalBonus + (battle.crystals ?? 0);
    run.crystals += crystalsGained;
    // Sync earned crystals into permanent Meta War-Hall treasury!
    const Meta = globalThis.SlotboundMeta;
    if (Meta && crystalsGained > 0) {
      const meta = Meta.loadMeta();
      meta.crystals = (meta.crystals || 0) + Math.max(1, Math.round(crystalsGained * 0.7));
      Meta.saveMeta(meta);
    }

    // Evaluate Side Quest progress!
    let questNote = "";
    if (run.sideQuest && !run.sideQuest.completed) {
      const q = run.sideQuest;
      if (won) {
        if (q.id === "no_death" && !battle.anyAllyDied) q.progress += 1;
        if (q.id === "no_spin" && (run.spinsThisWave || 0) === 0) q.progress += 1;
        if (q.id === "no_shop" && !run.shopBoughtThisWave) q.progress += 1;
      }
      if (q.progress >= q.target) {
        q.completed = true;
        run.eliteWheelTokens = (run.eliteWheelTokens || 0) + 1;
        questNote = `🎯 支线【${q.name}】完成！获得【高级命运轮盘】免费 1 转！`;
      } else {
        q.wavesLeft = Math.max(0, (q.wavesLeft || 1) - 1);
        if (q.wavesLeft === 0) assignSideQuest(run);
      }
    } else if (run.sideQuest?.completed) {
      assignSideQuest(run);
    }
    run.shopBoughtThisWave = false;

    const dmg = won ? 0 : (waveDef.boss ? 2 : 1);
    run.hp = Math.max(0, run.hp - dmg);
    const summary = { wave: waveDef, won, reward, interest, crystalsGained, dmg, questNote, finished: true };
    if (!run.hp) {
      run.outcome = "defeat";
      return summary;
    }

    // Refresh persistent shop stock without forcing a popup every wave!
    if (won) run.shop = createShop(false);
    if (won && waveDef.boss && !endless) {
      const chapterReward = getChapter(run).crystalReward;
      run.crystals += chapterReward;
      summary.crystalsGained += chapterReward;
      if (Meta) {
        const meta = Meta.loadMeta();
        meta.crystals = (meta.crystals || 0) + chapterReward;
        Meta.recordChapterClear(meta, run.difficulty || "easy", run.chapter || 1);
      }
      run.hp = run.maxHp;
      run.pendingChapterClear = waveDef.chapter;
      run.pendingShop = run.shop;
      if ((run.chapter || 1) >= CHAPTERS.length) run.outcome = "victory";
    }

    const advanced = won || (!endless && !waveDef.boss);
    if (advanced && waveDef.waveInChapter && waveDef.waveInChapter % 3 === 0) run.pendingEncounter = draftEncounter(run);
    if (run.outcome === "victory") return summary;

    if (advanced) {
      if (endless) putEndlessWave(run, run.endlessWave + 1);
      else {
        const totalInCh = waveDef.totalWavesInChapter || 6;
        if ((run.waveInChapter || 1) >= totalInCh) {
          run.chapter = Math.min(CHAPTERS.length, (run.chapter || 1) + 1);
          run.waveInChapter = 1;
        } else {
          run.waveInChapter = (run.waveInChapter || 1) + 1;
        }
        run.wave = (run.chapter - 1) * totalInCh + run.waveInChapter;
      }
    }
    prepareNextWave(run);
    return { ...summary, finished: false };
  }

  function unitPower(unit, run) {
    const stats = getUnitStats(unit, run);
    return Math.round(stats.atk * 2.5 + stats.hp * .35);
  }

  function getTotalPower(run) {
    return run.field.filter(Boolean).reduce((sum, unit) => sum + unitPower(unit, run), 0);
  }

  globalThis.Slotbound = {
    SYMBOLS,
    UNIT_IDS,
    SYMBOL_IDS,
    PAYLINES,
    SYNERGIES,
    CORES,
    CHAPTERS,
    WAVES,
    getWave,
    getEnemyThreatScale,
    getChapter,
    FIELD_SLOTS,
    BENCH_SLOTS,
    REEL_TIERS,
    CELL_ENCHANT_INFO,
    SHOP_ITEMS,
    SLOT_UPGRADES,
    ENDLESS_AFFIXES,
    ENCOUNTERS,
    createEndlessRun,
    encounterAvailable,
    pickEncounter,
    restoreRun,
    isSlotOpen,
    slotCost,
    unlockSlot,
    refreshShop,
    shopPrice,
    shopPurchase,
    canModifySymbol,
    retainedCells,
    createRun,
    STAR_THRESHOLDS,
    UNIT_RARITIES,
    UNIT_RARITY_MAP,
    HERO_POOL_BY_RARITY,
    ALL_HERO_IDS,
    ASSASSIN_TYPES,
    INNATE_SKILLS,
    MASTERY_BUFFS,
    CORE_SPIN_MILESTONES,
    SIDE_QUESTS,
    getUnitRarity,
    getInnateSkill,
    getEvolutionChoices,
    getUnitEvoInfo,
    getEffectiveRarityOdds,
    rollRarityForTier,
    pickHeroForRoll,
    executeEliteWheel,
    applyMastery,
    getNextCoreMilestone,
    assignSideQuest,
    calcUnitStars,
    nextStarLevel,
    ensureUnitSkillState,
    UNIT_TRAITS,
    createUnit,
    unitLevel,
    nextStarXp,
    hasCore,
    coreLevel,
    coreUpgradeDesc,
    addLog,
    ensureShop,
    getReelTier,
    upgradeReelTier,
    getUnitStats,
    getActiveSynergies,
    getFactionSynergies,
    getUnitFactions,
    UNIT_UNLOCK_TIER,
    getEffectiveWeights,
    getSymbolOdds,
    getMaxLocks,
    getLockCost,
    getSpinCost,
    getTotalSpinCost,
    evaluateBoard,
    hasNearMiss,
    executeSpin,
    getNudgeCost,
    getWinningNudgeCols,
    nudgeColumn,
    findUnitLocation,
    defaultUnitPos,
    setUnitPos,
    swapSlots,
    absorbUnit,
    sellUnit,
    applyEvolution,
    getRigBoostCost,
    boostSymbolWeight,
    reduceSymbolWeight,
    pickCore,
    resolveWave,
    getTotalPower
  };
})();
