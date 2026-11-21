(() => {
  "use strict";

  const G = globalThis.Slotbound;
  const Meta = globalThis.SlotboundMeta;
  const SFX = globalThis.SFX;
  const Art = globalThis.GameArt;
  const $ = id => document.getElementById(id);
  const wait = ms => new Promise(r => setTimeout(r, ms));

  const SAVE_KEY = "slotbound-zh-v2";
  const PROFILE_KEY = "slotbound-records-v1";
  const RARITY_LABEL = {
    common: "普通核心",
    rare: "稀有核心",
    legendary: "传说核心"
  };

  const CELL_CENTERS = [
    [50, 50], [150, 50], [250, 50],
    [50, 150], [150, 150], [250, 150],
    [50, 250], [150, 250], [250, 250]
  ];

  // Freeform army roster slots: starts at 6 pop cap, expandable to 7, 8, max 9!
  const FORMATION_ORDER = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  let run = loadRun();
  const profile = loadProfile();
  let busy = false;
  let spinningCols = [false, false, false];
  let anticipationCol = -1;
  let displayBoard = [...run.board];
  let selectedSlot = null;
  let armyMode = "swap";
  let speedMult = 1;
  let toastTimer = null;
  let selectedMetaNode = "star_core";

  const arena = new globalThis.BattleArena($("battle-canvas"));
  arena.onUnitSelect = unitId => {
    const loc = G.findUnitLocation(run, unitId);
    if (loc && loc.area === "field") {
      selectedSlot = { area: "field", index: loc.index };
      renderArmy();
    }
  };
  arena.onUnitMove = () => {
    save();
    renderArmy();
  };

  // Hydrate static metallic UI icons
  $("brand-crest").innerHTML = Art.UI_ICONS.crest;
  $("ico-gold").innerHTML = Art.UI_ICONS.coin;
  $("ico-hp").innerHTML = Art.UI_ICONS.heart;
  $("ico-power").innerHTML = Art.UI_ICONS.sword;
  $("ico-rig").innerHTML = Art.UI_ICONS.rig;
  $("ico-fight").innerHTML = Art.UI_ICONS.sword;
  $("ico-absorb").innerHTML = Art.UI_ICONS.absorb;
  $("btn-mute").innerHTML = Art.UI_ICONS.soundOn;

  function loadRun() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.field) && Array.isArray(parsed.board)) {
          parsed.reelLevel ??= 1;
          parsed.fever ??= 0;
          parsed.feverActive ??= false;
          parsed.cellEnchants ??= Array(9).fill(null);
          parsed.nudgesLeft ??= 1;
          parsed.nudgePreview ??= ["knight", "archer", "mage"];
          parsed.chapter ??= G.getWave(parsed).chapter;
          parsed.crystals ??= 0;
          parsed.pendingChapterClear ??= null;
          return G.restoreRun(parsed);
        }
      }
    } catch {
      // ignore
    }
    return G.createRun();
  }

  function loadProfile() {
    const defaults = { maxLines: 0, highestEndless: 0, champion: null, fastest: null };
    try {
      return { ...defaults, ...JSON.parse(localStorage.getItem(PROFILE_KEY)) };
    } catch {
      return defaults;
    }
  }

  function recordProfile() {
    profile.maxLines = Math.max(profile.maxLines, run.maxLines);
    if (run.mode === "endless") {
      profile.highestEndless = Math.max(profile.highestEndless, run.endlessWave - 1);
    } else if (run.outcome === "victory" && run.wave === G.WAVES.length) {
      profile.champion = { ...run };
      if (run.startedAt && !run.completedAt) run.completedAt = Date.now();
      const duration = run.completedAt - run.startedAt;
      if (duration > 0 && (!profile.fastest || duration < profile.fastest.duration)) {
        profile.fastest = { duration, units: run.field.filter(Boolean).map(unit => ({ ...unit })) };
      }
    }
  }

  function save() {
    recordProfile();
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(run));
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch {
      // ignore
    }
  }

  let alertTimer = null;

  function showAlertPopup(title, msg, ms = 2800) {
    const el = $("game-alert-toast");
    $("alert-toast-title").textContent = title;
    $("alert-toast-msg").textContent = msg;
    el.hidden = false;
    clearTimeout(alertTimer);
    alertTimer = setTimeout(() => {
      el.hidden = true;
    }, ms);
  }

  function showToast(text) {
    const el = $("jackpot-toast");
    el.textContent = text;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.hidden = true;
    }, 2200);
  }

  function setTicker(title, sub, kind = "") {
    const box = $("spin-ticker");
    box.className = "spin-ticker" + (kind ? " " + kind : "");
    $("ticker-title").textContent = title;
    $("ticker-sub").textContent = sub;
  }

  function renderTopbar() {
    const chapter = G.getChapter(run);
    const waveDef = G.getWave(run);
    const endless = run.mode === "endless";
    const chapterWave = waveDef.wave - chapter.waves[0].wave + 1;
    $("wave-badge").textContent = endless ? `无尽第 ${run.endlessWave} 波 · ${chapter.name}`
      : `第 ${chapter.id} 章 · ${chapter.name}（${chapterWave}/${chapter.waves.length} 波）`;
    $("wave-dots").hidden = endless;
    $("btn-endless").disabled = busy || !profile.champion;
    $("btn-endless").title = profile.champion ? "使用通关阵容直接挑战" : "通关五章后解锁";
    const affixes = $("endless-affixes");
    affixes.hidden = !endless;
    if (endless) {
      const effects = run.endlessAffixes.map(id => G.ENDLESS_AFFIXES[id]);
      affixes.textContent = effects.map(effect => effect.name).join(" · ");
      affixes.title = effects.map(effect => effect.name + " " + effect.desc).join(" · ");
    }
    const diff = Meta ? Meta.getDifficulty(run.difficulty || "easy") : { name: "简单", wavesPerChapter: 6 };
    const wInCh = waveDef.waveInChapter || run.waveInChapter || 1;
    const totalW = waveDef.totalWavesInChapter || diff.wavesPerChapter || 6;
    $("wave-badge").textContent = endless
      ? `无尽 W${run.endlessWave}`
      : `第${chapter.id}章·${chapter.name} ${wInCh}/${totalW}`;
    $("wave-badge").style.color = chapter.themeColor;
    $("wave-name").textContent = waveDef.name.replace(/\s*\(\d+\/\d+\)$/, "");
    $("hud-gold").textContent = run.gold;
    $("hud-crystals").textContent = run.crystals;
    $("hud-hp").textContent = `${run.hp}/${run.maxHp}`;
    $("hud-power").textContent = G.getTotalPower(run);

    $("wave-dots").innerHTML = Array.from({ length: totalW }, (_, index) => {
      const wNum = index + 1;
      const cls = [
        "wave-dot",
        wNum < wInCh ? "past" : wNum === wInCh ? "current" : "",
        wNum === totalW ? "boss" : ""
      ].filter(Boolean).join(" ");
      return `<span class="${cls}" title="本章第 ${wNum}/${totalW} 波"></span>`;
    }).join("");

    // Side Quest bar & Elite Wheel button
    const q = run.sideQuest;
    if ($("quest-text")) {
      const fullQuest = q
        ? (q.completed
          ? `✅ 支线【${q.name}】已完成！已发放高级轮盘券`
          : `🎯 支线【${q.name}】：${q.desc}（${q.progress}/${q.target} · 剩${q.wavesLeft}波）`)
        : "🎯 支线挑战：完成任务赢取高级轮盘免费转";
      $("quest-text").textContent = q
        ? (q.completed
          ? `✅ ${q.name} 已完成`
          : `🎯 ${q.name} ${q.progress}/${q.target} (${q.wavesLeft}波)`)
        : "🎯 支线挑战";
      $("quest-text").title = fullQuest;
    }
    const eliteBtn = $("btn-elite-wheel");
    if (eliteBtn) {
      const tokens = run.eliteWheelTokens || 0;
      eliteBtn.hidden = tokens <= 0;
      eliteBtn.textContent = `🎰 高级轮盘 ×${tokens}`;
    }

    const bossPill = $("boss-pill");
    const env = chapter.env;
    const threatBadge = $("enemy-threat");
    threatBadge.hidden = !env?.name;
    if (env?.name) {
      threatBadge.textContent = `${env.name} -${Math.round(env.healPenalty * 100)}%疗`;
      threatBadge.title = `章节环境效果【${env.name}】：${env.desc}`;
    }
    if (waveDef.boss) {
      bossPill.hidden = false;
      bossPill.innerHTML = `${Art.UI_ICONS.boss}<span>${waveDef.bossTitle}</span>`;
      $("enemy-intel").textContent = waveDef.bossSkill;
    } else {
      bossPill.hidden = true;
      const totalEnemies = waveDef.phases.reduce((s, p) => s + p.enemies.length, 0);
      $("enemy-intel").textContent = `敌军 ${totalEnemies} 名 · 赏金 +${waveDef.reward}G`;
    }

    $("enemy-warning").hidden = !waveDef.enemies.some(enemy => enemy.tactic === "backline_diver");
    if (!busy) renderReinforcements(0, waveDef.phases.length, 0, waveDef.phases.at(-1).delay, 0);

    const hasOverflow = (run.overflowUnits?.length || 0) > 0;
    const canFight = !busy && !run.outcome && run.field.some(Boolean) && !hasOverflow;
    $("btn-fight").disabled = !canFight;
    $("btn-fight").lastElementChild.textContent = arena.mode === "fighting"
      ? "激战中…"
      : hasOverflow ? "超编待清理" : "开战迎敌";
  }

  function renderReinforcements(count, total, time, lastDelay, nextDelay) {
    const progress = $("reinforcement-progress");
    const status = $("reinforcement-count");
    const next = $("reinforcement-next");
    const label = `援军 ${count}/${total}`;
    const description = !count ? "分批抵达"
      : nextDelay === undefined ? "全部抵达" : `下一批 ${Math.max(0, Math.ceil(nextDelay - time))} 秒`;
    progress.max = lastDelay || 1;
    progress.value = count === total ? progress.max : Math.min(lastDelay, time);
    if (status.textContent !== label) status.textContent = label;
    if (next.textContent !== description) next.textContent = description;
  }

  function renderReels() {
    const tier = G.getReelTier(run);
    $("tier-badge").textContent = `Lv.${tier.level} ${tier.name}`;
    $("tier-sub").textContent = tier.desc;
    if ($("rarity-odds-strip") && G.getEffectiveRarityOdds) {
      const o = G.getEffectiveRarityOdds(run);
      const pct = v => `${(v * 100).toFixed(v > 0 && v < 0.02 ? 1 : 0)}%`;
      $("rarity-odds-strip").innerHTML =
        `<span style="color:#dce4f2">白 ${pct(o.white)}</span>`
        + `<span style="color:#4fd1a5">绿 ${pct(o.green)}</span>`
        + `<span style="color:#5cc8ff">蓝 ${pct(o.blue)}</span>`
        + `<span style="color:#c084fc">紫 ${pct(o.purple)}</span>`
        + `<span style="color:#ffd86b">金 ${pct(o.gold)}</span>`;
    }
    const tierBtn = $("btn-tier-up");
    const upCost = G.getReelUpgradeCost ? G.getReelUpgradeCost(run) : tier.upgradeCost;
    if (upCost) {
      tierBtn.textContent = `↑ 升阶 ${upCost}G`;
      tierBtn.disabled = busy || !!run.outcome || run.gold < upCost;
      const nextTier = G.REEL_TIERS[tier.level];
      tierBtn.title = nextTier ? `升至 Lv.${nextTier.level} ${nextTier.name}：${nextTier.desc}` : "";
    } else {
      tierBtn.textContent = "MAX 神机";
      tierBtn.disabled = true;
      tierBtn.title = "轮盘已达最高阶";
    }

    // Fever meter
    const feverPct = run.feverActive ? 100 : Math.min(100, run.fever || 0);
    $("fever-fill").style.width = `${feverPct}%`;
    $("fever-bar").classList.toggle("ready", !!run.feverActive);
    document.querySelector(".cabinet").classList.toggle("fever-mode", !!run.feverActive);
    $("fever-text").textContent = run.feverActive
      ? "🔥 狂热就绪 · 免费双倍百搭！"
      : `狂热充能 ${feverPct}%`;

    const matchedSet = new Set();
    if (!spinningCols.some(Boolean)) {
      for (const line of run.lastLines) {
        for (const c of line.cells) matchedSet.add(c);
      }
    }
    const enchants = run.cellEnchants || Array(9).fill(null);

    $("reel-grid").innerHTML = displayBoard.map((symId, idx) => {
      const sym = G.SYMBOLS[symId] || G.SYMBOLS.knight;
      const col = idx % 3;
      const isSpin = spinningCols[col] && !run.locked.includes(idx);
      const isLocked = run.locked.includes(idx);
      const isMatched = !isSpin && matchedSet.has(idx);
      const isAntic = anticipationCol === col && isSpin;
      const enchant = enchants[idx];
      const enchInfo = enchant ? G.CELL_ENCHANT_INFO[enchant] : null;
      const cls = [
        "reel-cell",
        isSpin ? "spinning" : "",
        isLocked ? "locked" : "",
        isMatched ? "matched" : "",
        isAntic ? "anticipation" : ""
      ].filter(Boolean).join(" ");
      return `<button type="button" class="${cls}" data-cell="${idx}" style="--sym-color:${sym.color}" title="${sym.name}：${sym.skillDesc}${enchInfo ? " | " + enchInfo.name + "：" + enchInfo.desc : ""}"${busy || run.outcome ? " disabled" : ""}>
        ${enchInfo ? `<span class="enchant-badge ${enchant}">${enchInfo.badge}</span>` : ""}
        ${isLocked ? `<span class="lock-badge">${Art.UI_ICONS.lock}</span>` : ""}
        <span class="cell-art">${Art.renderPortraitImg(symId, sym.name, "reel-sprite")}</span>
        <span class="cell-name">${sym.short}</span>
      </button>`;
    }).join("");

    // Top incoming symbol preview & winning-nudge hint ONLY unlocked via Core 【透视魔眼 (reel_oracle)】!
    const hasOracle = G.hasCore(run, "reel_oracle");
    const preview = run.nudgePreview || ["knight", "archer", "mage"];
    const nudgeCost = G.getNudgeCost ? G.getNudgeCost(run) : ((run.nudgesLeft || 0) > 0 ? 0 : 10);
    const canNudge = !busy && !run.outcome && nudgeCost !== null && (nudgeCost === 0 || run.gold >= nudgeCost);
    const winCols = (hasOracle && canNudge && G.getWinningNudgeCols) ? G.getWinningNudgeCols(run) : [];

    $("nudge-preview-row").hidden = !hasOracle;
    if (hasOracle) {
      $("nudge-preview-row").innerHTML = [0, 1, 2].map(col => {
        const inc = preview[col] || "knight";
        const sym = G.SYMBOLS[inc] || G.SYMBOLS.knight;
        const isHot = winCols.includes(col);
        return `<div class="preview-chip${isHot ? " hot" : ""}" style="--sym-color:${sym.color}" title="透视魔眼：下调第 ${col + 1} 列将顶入【${sym.name}】">
          <span>↓</span>
          ${Art.renderPortraitImg(inc, sym.short, "")}
          <span>${sym.short}</span>
        </div>`;
      }).join("");
    }

    $("nudge-row").innerHTML = [0, 1, 2].map(col => {
      const inc = preview[col] || "knight";
      const isHot = hasOracle && winCols.includes(col);
      const costTag = nudgeCost === null ? "本转已满" : nudgeCost === 0 ? "免费" : `${nudgeCost}G`;
      return `<button type="button" class="nudge-btn${isHot ? " hot" : ""}" data-nudge="${col}" title="将第 ${col + 1} 列往下调 1 格${hasOracle ? `（顶入【${G.SYMBOLS[inc].name}】）` : ""}（${nudgeCost === null ? "本转付费微调已达上限" : nudgeCost === 0 ? `免费剩余 ${run.nudgesLeft} 次` : `花费 ${nudgeCost} 金币`}）"${canNudge ? "" : " disabled"}>
        <span>${isHot ? "↓ 可连线!" : `↓ 下调(${costTag})`}</span>
      </button>`;
    }).join("");

    const svg = $("payline-svg");
    if (spinningCols.some(Boolean) || run.lastLines.length === 0) {
      svg.innerHTML = "";
    } else {
      svg.innerHTML = run.lastLines.map(line => {
        const [a, , c] = line.cells;
        const [x1, y1] = CELL_CENTERS[a];
        const [x2, y2] = CELL_CENTERS[c];
        const color = line.superJackpot ? "#ffd86b" : (G.SYMBOLS[line.symbol]?.color || "#ffd86b");
        return `<line class="payline-stroke" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" />`;
      }).join("");
    }

    const totalCost = G.getTotalSpinCost(run);
    const lockCost = G.getLockCost(run);
    const maxLocks = G.getMaxLocks(run);
    const maxSpinsWave = G.getMaxSpinsPerWave ? G.getMaxSpinsPerWave(run) : 5;
    const spinsUsed = run.spinsThisWave || 0;
    const spinCapped = spinsUsed >= maxSpinsWave;
    const hasOverflow = (run.overflowUnits?.length || 0) > 0;
    const disabledSpin = busy || !!run.outcome || run.gold < totalCost || spinCapped || hasOverflow;
    $("btn-spin").disabled = disabledSpin;
    $("mech-lever").disabled = disabledSpin;

    if (hasOverflow) {
      $("spin-cost-label").textContent = "超编待清理";
    } else if (spinCapped) {
      $("spin-cost-label").textContent = `本波已满 (${spinsUsed}/${maxSpinsWave})`;
    } else if (run.feverActive) {
      $("spin-cost-label").textContent = totalCost > 0 ? `狂热 + 锁 ${totalCost}G` : "狂热免费！";
    } else if (run.freeSpins > 0 && run.locked.length === 0) {
      $("spin-cost-label").textContent = `免费 ×${run.freeSpins}`;
    } else if (run.freeSpins > 0) {
      $("spin-cost-label").textContent = `免费 + 锁 ${totalCost}G`;
    } else {
      $("spin-cost-label").textContent = `${totalCost} 金币`;
    }
    $("lock-status").textContent = `摇杆 ${spinsUsed}/${maxSpinsWave} · 锁 ${run.locked.length}/${maxLocks}(${lockCost}G) · 微调 ${run.nudgesLeft || 0}`;
    $("btn-rig").disabled = busy || !!run.outcome;
  }

  function renderCores() {
    $("core-count").textContent = `${run.cores.length}/${run.unlockedCoreSlots}`;
    if ($("core-milestone-pill") && G.getNextCoreMilestone) {
      const nextM = G.getNextCoreMilestone(run);
      $("core-milestone-pill").textContent = nextM
        ? `下枚核心 ${Math.max(0, nextM - (run.totalSpins || 0))} 转`
        : "里程碑已满";
    }
    const levels = run.coreLevels || {};
    const slots = [];
    for (let i = 0; i < 6; i += 1) {
      const id = run.cores[i];
      if (!id) {
        const isOpen = i < run.unlockedCoreSlots;
        slots.push(`<div class="core-slot empty${isOpen ? "" : " sealed"}" title="${isOpen ? "空核心槽位（累计转动达里程碑即可三选一装备）" : "封印核心槽（可在秘宝商店消耗水晶解锁）"}">${isOpen ? "◇" : "🔒"}</div>`);
      } else {
        const core = G.CORES.find(c => c.id === id);
        const lv = levels[id] || 1;
        slots.push(`<div class="core-slot ${core.rarity}" title="${core.name} Lv.${lv}（${RARITY_LABEL[core.rarity]}）：${core.desc}">
          <span class="c-medallion">${core.icon}</span>
          ${lv > 1 ? `<span class="c-lv">L${lv}</span>` : ""}
          <span class="c-name">${core.name}</span>
        </div>`);
      }
    }
    $("cores-grid").innerHTML = slots.join("");
  }

  function renderSynergies() {
    const syns = G.getActiveSynergies(run);
    $("synergy-bar").innerHTML = syns.map(s => {
      const sym = G.SYMBOLS[s.type];
      const reqMax = s.reqMax || 4;
      const isMax = s.tier >= reqMax;
      const denom = s.count >= s.req ? reqMax : s.req;
      const badge = isMax ? "★★" : s.active ? "★" : "";
      const members = (s.types || [s.type]).map(t => G.SYMBOLS[t]?.short || t).join(" / ");
      return `<div class="syn-pill${s.active ? " active" : ""}${isMax ? " max-tier" : ""}" style="--syn-color:${sym.color}" title="【${s.name}】成员（同名不叠加）：${members}\n${s.desc}">
        ${Art.renderPortraitImg(s.type, sym.short, "syn-thumb")}
        <span>${s.name}</span>
        <span class="syn-cnt">${s.count}/${denom}${badge}</span>
      </div>`;
    }).join("");
    $("faction-bar").innerHTML = G.getFactionSynergies(run).map(flow => {
      const members = flow.types.map(type => G.SYMBOLS[type]?.short || type).join(" / ");
      const isMax = flow.tier >= 5;
      const denom = flow.count >= 3 ? 5 : 3;
      const badge = flow.tier ? `★${flow.tier}` : "";
      const title = `【2★及以上英雄觉醒阵营·同名不叠加】成员：${members}\n2人：${flow.desc}\n3人/5人：${flow.enhanced}`;
      return `<div class="syn-pill faction-pill${flow.tier ? " active" : ""}${isMax ? " max-tier" : ""}" style="--syn-color:${flow.color}" title="${title}">
        <span>${flow.short}</span><span class="syn-cnt">${flow.count}/${denom}${badge}</span>
      </div>`;
    }).join("");
  }

  function renderUnitCard(unit, area, index, emptyLabel) {
    const isSelected = selectedSlot && selectedSlot.area === area && selectedSlot.index === index;
    const selectedUnit = selectedSlot
      ? (selectedSlot.area === "field" ? run.field[selectedSlot.index]
        : selectedSlot.area === "bench" ? run.bench[selectedSlot.index]
        : (run.overflowUnits || [])[selectedSlot.index])
      : null;
    const isAbsorbCandidate = armyMode === "absorb" && selectedUnit && unit && unit.id !== selectedUnit.id;

    if (area !== "overflow" && !G.isSlotOpen(run, area, index)) {
      const cost = G.slotCost(run, area);
      return `<button type="button" class="unit-slot sealed" data-unlock="${area}" data-index="${index}" title="消耗 ${cost} 命运水晶扩充席位"
        ${busy || run.outcome || run.crystals < cost ? "disabled" : ""}>
        ${Art.UI_ICONS.lock}<span>扩充 · ${cost}💎</span>
      </button>`;
    }
    if (!unit) {
      return `<button type="button" class="unit-slot empty${isSelected ? " selected" : ""}" data-area="${area}" data-index="${index}"${busy || run.outcome ? " disabled" : ""}>${emptyLabel}</button>`;
    }

    const sym = G.SYMBOLS[unit.type];
    const st = G.getUnitStats(unit, run);
    const rarity = G.getUnitRarity(unit);
    const evoInfo = G.getUnitEvoInfo ? G.getUnitEvoInfo(unit) : null;
    const displayName = evoInfo ? evoInfo.name : sym.name;
    const cls = [
      "unit-slot",
      isSelected ? "selected" : "",
      isAbsorbCandidate ? "absorb-candidate" : "",
      unit.lucky ? "lucky" : "",
      unit.evolution ? "evolved" : ""
    ].filter(Boolean).join(" ");

    const nextReq = G.nextStarLevel(unit, st.heroLv);
    const prevReq = st.level <= 1 ? 1 : (rarity.starThresholds[st.level - 2] || 1);
    const xpPct = nextReq ? Math.min(100, Math.max(8, ((st.heroLv - prevReq) / Math.max(1, nextReq - prevReq)) * 100)) : 100;

    const factions = G.getUnitFactions ? G.getUnitFactions(unit.type) : [];
    const factionBadge = st.level >= 2
      ? factions.map(f => `<span class="u-tag" style="border-color:${f.color};color:${f.color}">${f.short}</span>`).join("")
      : "";

    const trait = G.getUnitTraitDisplay ? G.getUnitTraitDisplay(unit) : null;
    const cardTooltip = [
      `${displayName}（${rarity.label} · Lv.${st.heroLv} · ${st.level}★）`,
      `生命 ${st.hp} · 攻击 ${st.atk} · 技能栏 ${(unit.skills || []).length}/${rarity.slots}`,
      trait ? `天赋【${trait.name}】：${trait.desc}` : "",
      factions.length ? `阵营：${factions.map(f => f.name).join("/")}${st.level < 2 ? "（2★觉醒）" : ""}` : ""
    ].filter(Boolean).join("\n");

    const skills = unit.skills || [];
    const artKey = sym.artKey || unit.type;
    return `<button type="button" class="${cls}" data-area="${area}" data-index="${index}" data-uid="${unit.id}" title="${cardTooltip}" style="--u-color:${rarity.color}"${busy || run.outcome ? " disabled" : ""}>
      <div class="u-portrait">
        ${Art.renderPortraitImg(artKey, displayName, "unit-sprite")}
        <span class="u-lvl-badge">${"★".repeat(st.level)}</span>
      </div>
      <div class="u-body">
        <div class="u-top">
          <span class="u-name">${displayName}</span>
          <span class="u-lv-pill" style="color:${rarity.color}">Lv.${st.heroLv}</span>
          ${factionBadge}
        </div>
        <div class="u-xp-bar"><i style="width:${xpPct}%"></i></div>
        <div class="u-stats">
          <span class="u-hp">${Art.UI_ICONS.heart}${st.hp}</span>
          <span class="u-atk">${Art.UI_ICONS.sword}${st.atk}</span>
          <span class="u-sk" style="color:${rarity.color}">✦${skills.length}/${rarity.slots}</span>
        </div>
      </div>
    </button>`;
  }

  function renderArmy() {
    const unlockedCap = run.unlockedFieldSlots.length;
    const fieldUsed = run.field.filter(Boolean).length;
    if ($("field-count")) $("field-count").textContent = `${fieldUsed}/${unlockedCap}`;

    // Show all unlocked field slots + the next 1 expandable pop-cap slot (up to 9) so the grid stays super clean!
    const visibleFieldSlots = FORMATION_ORDER.filter(idx =>
      G.isSlotOpen(run, "field", idx) || idx === unlockedCap
    );
    $("formation-grid").innerHTML = visibleFieldSlots.map(idx =>
      renderUnitCard(run.field[idx], "field", idx, "+ 出战位")
    ).join("");

    $("bench-grid").innerHTML = run.bench.map((u, idx) =>
      renderUnitCard(u, "bench", idx, "+ 备战位")
    ).join("");

    const benchUsed = run.bench.filter(Boolean).length;
    $("bench-count").textContent = `${benchUsed}/${run.unlockedBenchSlots}`;

    // Render Overflow Queue (when roster is full, rolled units stay here until absorbed or sold!)
    const overflow = run.overflowUnits || [];
    const ob = $("overflow-box");
    if (ob) {
      ob.hidden = overflow.length === 0;
      if (overflow.length > 0) {
        $("overflow-count").textContent = `${overflow.length} 待处理`;
        $("overflow-grid").innerHTML = overflow.map((u, idx) =>
          renderUnitCard(u, "overflow", idx, "")
        ).join("");
      }
    }

    $("btn-mode-absorb").classList.toggle("active", armyMode === "absorb");
    $("army-tip").textContent = armyMode === "absorb"
      ? "🔥 吞噬模式：点击或拖拽叠放融合"
      : "拖拽换位 · 点击查看技能";

    const selUnit = selectedSlot
      ? (selectedSlot.area === "field" ? run.field[selectedSlot.index]
        : selectedSlot.area === "bench" ? run.bench[selectedSlot.index]
        : (run.overflowUnits || [])[selectedSlot.index])
      : null;
    arena.setSelectedUnit(selectedSlot?.area === "field" && selUnit ? selUnit.id : null);

    renderInspector();
  }

  function renderInspector() {
    const el = $("inspector");
    if (!selectedSlot) {
      el.hidden = true;
      el.innerHTML = "";
      return;
    }
    const unit = selectedSlot.area === "field" ? run.field[selectedSlot.index]
      : selectedSlot.area === "bench" ? run.bench[selectedSlot.index]
      : (run.overflowUnits || [])[selectedSlot.index];
    if (!unit) {
      el.hidden = true;
      el.innerHTML = "";
      return;
    }
    el.hidden = false;

    const sym = G.SYMBOLS[unit.type];
    const st = G.getUnitStats(unit, run);
    const rarity = G.getUnitRarity(unit);
    const evo = G.getUnitEvoInfo ? G.getUnitEvoInfo(unit) : (unit.evolution ? sym.evolutions[unit.evolution] : null);
    const sellVal = 15 + unit.xp * 10 + (unit.trait === "gold_donor" ? 30 : 0);
    const nextReq = G.nextStarLevel(unit, st.heroLv);
    const nextNeed = nextReq
      ? `Lv.${st.heroLv} / Lv.${nextReq} 升 ${st.level + 1}★`
      : `Lv.${st.heroLv}（已达 5★ 满星）`;

    const skills = unit.skills || [];
    const skillPills = [];
    for (let i = 0; i < rarity.slots; i += 1) {
      const sk = skills[i];
      if (sk && G.INNATE_SKILLS[sk.id]) {
        const def = G.INNATE_SKILLS[sk.id];
        skillPills.push(`<span class="skill-pill" style="border-color:${def.color};color:${def.color}" title="${def.name} Lv.${sk.level}：${def.desc(sk.level)}">${def.icon} ${def.name} Lv.${sk.level}</span>`);
      } else {
        skillPills.push(`<span class="skill-pill empty">空技能栏（吞噬可继承）</span>`);
      }
    }

    const masteryTags = (unit.masteryBuffs || []).map(id => {
      const allM = [...G.MASTERY_BUFFS.assassin, ...G.MASTERY_BUFFS.front, ...G.MASTERY_BUFFS.ranged];
      const def = allM.find(m => m.id === id);
      return def ? `<span class="skill-pill" style="border-color:#ffd86b;color:#ffd86b" title="${def.desc}">${def.icon} ${def.name}</span>` : "";
    }).join("");

    el.innerHTML = `<div class="ins-left">
      <div class="ins-avatar" style="--u-color:${rarity.color}">${Art.renderPortraitImg(sym.artKey || unit.type, sym.name, "ins-sprite")}</div>
      <div class="ins-info">
        <div class="ins-title">${evo ? evo.name : sym.name} · <span style="color:${rarity.color}">${rarity.label}</span> · <span class="gold-txt">${"★".repeat(st.level)}</span> ${unit.lucky ? '<span class="u-tag">幸运强化</span>' : ""}</div>
        <div class="ins-desc">生命 ${st.hp} · 攻击 ${st.atk} · 暴击 ${Math.round(st.crit * 100)}% · 攻速 ${(1 / st.atkCd).toFixed(2)}/s · 移速 ${st.moveSpd} · 射程 ${st.range} · ${nextNeed}</div>
        <div class="ins-skills">${skillPills.join("")}${masteryTags}</div>
      </div>
    </div>
    <div class="ins-actions">
      <button type="button" class="secondary-btn" id="btn-ins-absorb">${armyMode === "absorb" ? "点选素材吞噬" : "吞噬融合"}</button>
      <button type="button" class="danger-btn" id="btn-ins-sell">出售 +${sellVal}G</button>
      <button type="button" class="close-btn ins-close-btn" id="btn-ins-close" aria-label="关闭详情">×</button>
    </div>`;

    $("btn-ins-close").onclick = () => {
      selectedSlot = null;
      renderArmy();
    };
    $("btn-ins-absorb").onclick = () => {
      armyMode = "absorb";
      if (globalThis.NativeBridge) globalThis.NativeBridge.haptic("button_tap", 0.7);
      renderArmy();
    };
    $("btn-ins-sell").onclick = () => {
      const gained = G.sellUnit(run, unit.id);
      if (gained > 0) {
        SFX.coin();
        if (globalThis.NativeBridge) globalThis.NativeBridge.haptic("button_tap", 0.75);
        selectedSlot = null;
        save();
        renderAll();
        setTicker("出售单位", `获得 +${gained} 金币，可用于转动轮盘或刷新商店。`);
      } else {
        setTicker("无法出售", "至少需要保留 1 名军团单位迎战！");
      }
    };
  }

  function renderAll() {
    renderTopbar();
    renderReels();
    renderCores();
    renderSynergies();
    renderArmy();
    if (arena.mode !== "fighting") {
      arena.syncPreview(run);
    }
  }

  // SLOT MACHINE SPIN
  async function handleSpin() {
    if (busy || run.outcome) return;
    const cost = G.getTotalSpinCost(run);
    if (run.gold < cost) {
      setTicker("金币不足", "无法继续转动，调整阵型后点击【开战迎敌】赢取赏金！");
      return;
    }

    busy = true;
    selectedSlot = null;
    const lockedBefore = G.retainedCells(run);
    const result = G.executeSpin(run);
    if (!result) {
      busy = false;
      return;
    }

    // Animate physical mechanical lever
    const lever = $("mech-lever");
    lever.classList.add("pulled");
    setTimeout(() => lever.classList.remove("pulled"), 420);

    SFX.lever();
    if (globalThis.NativeBridge) globalThis.NativeBridge.haptic("reel_lever", 0.9);
    spinningCols = [true, true, true];
    anticipationCol = -1;
    setTicker(result.isFever ? "狂热转盘全速爆发中！" : "轮盘高速运转中…", "祈祷连线与百搭降临！");
    renderTopbar();
    renderReels();

    const col2Stop = result.nearMiss ? 1080 : 740;
    const stopTimes = [290, 510, col2Stop];
    const start = performance.now();
    let lastTick = 0;
    let anticStep = 0;
    const tierPool = G.getReelTier(run).unlocked;

    while (spinningCols.some(Boolean)) {
      const elapsed = performance.now() - start;
      for (let c = 0; c < 3; c += 1) {
        if (spinningCols[c] && elapsed >= stopTimes[c]) {
          spinningCols[c] = false;
          for (let r = 0; r < 3; r += 1) {
            displayBoard[r * 3 + c] = result.board[r * 3 + c];
          }
          SFX.reelStop(c);
          if (globalThis.NativeBridge) globalThis.NativeBridge.haptic("reel_stop", 0.8 + c * 0.1);
          if (c === 1 && result.nearMiss && spinningCols[2]) {
            anticipationCol = 2;
            setTicker("听牌悬念！第 3 列加速中…", "前两列已凑成 2 连，期待绝杀大奖！", "jackpot");
          }
        }
      }

      const tickInterval = anticipationCol === 2 ? 52 : 65;
      if (elapsed - lastTick >= tickInterval) {
        lastTick = elapsed;
        for (let i = 0; i < 9; i += 1) {
          const c = i % 3;
          if (spinningCols[c] && !lockedBefore.includes(i)) {
            displayBoard[i] = tierPool[Math.floor(Math.random() * tierPool.length)];
          }
        }
        if (spinningCols.some(Boolean)) {
          if (anticipationCol === 2) {
            SFX.anticipation(anticStep++);
            if (globalThis.NativeBridge) globalThis.NativeBridge.haptic("reel_tick", 0.7);
          } else {
            SFX.tick();
          }
        }
        renderReels();
      }
      await wait(22);
    }

    anticipationCol = -1;
    displayBoard = [...result.board];
    busy = false;
    save();
    renderAll();

    if (result.triggeredFever) {
      SFX.feverReady();
      if (globalThis.NativeBridge) globalThis.NativeBridge.haptic("fever_ready", 1.05);
      showToast("狂热槽蓄满！下一转免费 + 百搭 + 2× 收益！");
    }

    if (result.hits.length === 0) {
      G.addLog(run, "轮盘", `转动未连线（花费 ${cost}G，狂热 ${run.fever}%）`);
      setTicker(
        "本次未连线（狂热 +25%）",
        result.notes.length ? result.notes.join(" · ") : "可点击下方【↓微调】绝杀补连，或锁格再转！"
      );
    } else {
      const summonLog = result.summoned.map(u => G.SYMBOLS[u.type].short).join("、");
      G.addLog(run, "轮盘", `${result.isFever ? "狂热" : ""}${result.hits.length} 线连奖${summonLog ? `，召唤：${summonLog}` : ""}${result.goldGained ? `，+${result.goldGained}G` : ""}`);
      const isBig = result.isFever || result.hits.length >= 2 || result.hits.some(h => h.superJackpot);
      if (isBig) {
        SFX.jackpot();
        if (globalThis.NativeBridge) globalThis.NativeBridge.haptic("jackpot", 1.05);
        showToast(
          result.hits.some(h => h.superJackpot)
            ? "三王大满贯 SUPER JACKPOT!"
            : result.isFever
              ? `狂热双倍大爆发（${result.hits.length} 线）！`
              : `${result.hits.length} 重连线大爆发！`
        );
      } else if (result.hits.every(h => h.symbol === "gold")) {
        SFX.coin();
        if (globalThis.NativeBridge) globalThis.NativeBridge.haptic("match", 0.8);
        showToast("命运金币连线！+55 金币 & +1 免费转");
      } else {
        SFX.match();
        if (globalThis.NativeBridge) globalThis.NativeBridge.haptic("match", 0.85);
      }

      const summonNames = result.summoned.map(u => `${G.SYMBOLS[u.type].short}${u.lucky ? "(幸运)" : ""}`);
      const parts = [];
      if (summonNames.length) parts.push(`召唤：${summonNames.join("、")}`);
      if (result.goldGained) parts.push(`+${result.goldGained} 金币`);
      if (result.freeSpinsGained) parts.push(`+${result.freeSpinsGained} 免费转动`);
      if (result.notes.length) parts.push(...result.notes);

      setTicker(
        isBig ? `${result.isFever ? "狂热 " : ""}${result.hits.length} 线连奖大爆发！` : `连线成功（${result.hits.length} 线）`,
        parts.join(" · "),
        isBig ? "jackpot" : "win"
      );
    }

    checkPendingModals();
  }

  function handleTierUpgrade() {
    if (busy || run.outcome) return;
    const next = G.upgradeReelTier(run);
    if (!next) return;
    G.addLog(run, "轮盘", `轮盘升阶至 Lv.${next.level} ${next.name}`);
    SFX.tierUp();
    showToast(`轮盘升阶：Lv.${next.level} ${next.name}！`);
    setTicker(`轮盘升至 Lv.${next.level} ${next.name}`, next.desc, "jackpot");
    save();
    renderAll();
  }

  function handleNudge(col) {
    if (busy || run.outcome) return;
    const res = G.nudgeColumn(run, col);
    if (!res) return;
    SFX.nudge();
    displayBoard = [...res.board];
    save();
    renderAll();
    if (res.hits.length > 0) {
      SFX.jackpot();
      showToast(`微调绝杀！触发 ${res.hits.length} 线连奖！`);
      const summonNames = res.summoned.map(u => G.SYMBOLS[u.type].short);
      const parts = [];
      if (summonNames.length) parts.push(`召唤：${summonNames.join("、")}`);
      if (res.goldGained) parts.push(`+${res.goldGained} 金币`);
      setTicker(`微调绝杀成功（${res.hits.length} 线）！`, parts.join(" · "), "jackpot");
      checkPendingModals();
    } else {
      setTicker("微调完成", "第 " + (col + 1) + " 列已下移 1 格，可继续锁格或转动。");
    }
  }

  function handleCellClick(cellIdx) {
    if (busy || run.outcome) return;
    if (run.cellEnchants[cellIdx] === "lock") {
      setTicker("自动锁定格", "此格每次转动免费保留符号。");
      return;
    }
    const pos = run.locked.indexOf(cellIdx);
    if (pos !== -1) {
      run.locked.splice(pos, 1);
      SFX.lock();
    } else {
      if (run.locked.length >= G.getMaxLocks(run)) {
        setTicker("锁格已达上限", `当前最多锁定 ${G.getMaxLocks(run)} 格（装备【机械卡榫】可扩充上限）。`);
        return;
      }
      run.locked.push(cellIdx);
      SFX.lock();
    }
    save();
    renderReels();
  }

  function handleSlotClick(area, index) {
    if (busy || run.outcome) return;
    const getSlotUnit = (a, i) => a === "field" ? run.field[i] : a === "bench" ? run.bench[i] : (run.overflowUnits || [])[i];
    const clickedUnit = getSlotUnit(area, index);

    if (!selectedSlot) {
      if (!clickedUnit) return;
      selectedSlot = { area, index };
      renderArmy();
      return;
    }

    if (selectedSlot.area === area && selectedSlot.index === index) {
      selectedSlot = null;
      renderArmy();
      return;
    }

    const srcUnit = getSlotUnit(selectedSlot.area, selectedSlot.index);

    if (armyMode === "absorb" && srcUnit && clickedUnit) {
      openAbsorbDialog(srcUnit, clickedUnit);
      return;
    }

    if (G.swapSlots(run, selectedSlot.area, selectedSlot.index, area, index)) {
      SFX.lock();
      selectedSlot = null;
      save();
      renderAll();
    }
  }

  function openAbsorbDialog(target, donor) {
    G.ensureUnitSkillState(target);
    G.ensureUnitSkillState(donor);
    const tSym = G.SYMBOLS[target.type];
    const dSym = G.SYMBOLS[donor.type];
    const tRar = G.getUnitRarity(target);
    const dRar = G.getUnitRarity(donor);
    const crestBonus = G.coreLevel(run, "devour_crest") ? 1 : 0;
    const transferBonus = Math.floor(((donor.heroLv || 1) - 1) * 0.5);
    const pureGain = dRar.feedLevels + transferBonus + crestBonus;
    const inheritGain = 1 + crestBonus;

    const pureNextLv = (target.heroLv || 1) + pureGain;
    const pureNextStars = G.calcUnitStars(target, pureNextLv);
    const curStars = G.unitLevel(target);
    const inheritNextLv = (target.heroLv || 1) + inheritGain;
    const inheritNextStars = G.calcUnitStars(target, inheritNextLv);

    $("absorb-title").textContent = `${tSym.name} 吞噬 ${dSym.name}`;
    $("absorb-summary").innerHTML =
      `主体：<strong style="color:${tRar.color}">${tSym.name}（${tRar.label} · Lv.${target.heroLv} · ${curStars}★ · 技能栏 ${target.skills.length}/${tRar.slots}）</strong>`
      + ` ← 吞噬素材：<strong style="color:${dRar.color}">${dSym.name}（${dRar.label} · Lv.${donor.heroLv}）</strong>`;

    const donorSkills = donor.skills && donor.skills.length ? donor.skills : [{ id: G.getInnateSkill(donor.type).id, level: 1 }];
    const inheritCards = donorSkills.map(ds => {
      const sk = G.INNATE_SKILLS[ds.id];
      if (!sk) return "";
      const existing = target.skills.find(s => s.id === sk.id);
      const starHint = inheritNextStars > curStars ? ` · ✨突破升至 ${inheritNextStars}★！` : "";
      if (existing) {
        const nextSkLv = Math.min(5, existing.level + 1);
        const maxed = existing.level >= 5;
        return `<button type="button" class="absorb-choice-card inherit" data-absorb-mode="inherit" data-skill="${sk.id}"${maxed ? " disabled" : ""}>
          <div class="ac-head"><span>${sk.icon} 继承升级：${sk.name}</span><span class="ac-lv">仅 +${inheritGain} 级${starHint}</span></div>
          <p class="ac-desc">${maxed ? "该技能已达满级 Lv.5" : `Lv.${existing.level} → Lv.${nextSkLv}：${sk.desc(nextSkLv)}`}</p>
        </button>`;
      }
      if (target.skills.length < tRar.slots) {
        return `<button type="button" class="absorb-choice-card inherit" data-absorb-mode="inherit" data-skill="${sk.id}">
          <div class="ac-head"><span>${sk.icon} 继承新技能：${sk.name} Lv.1</span><span class="ac-lv">仅 +${inheritGain} 级${starHint}</span></div>
          <p class="ac-desc">装入空技能栏（${target.skills.length + 1}/${tRar.slots}）：${sk.desc(1)}</p>
        </button>`;
      }
      // Skill slots full: offer replacing each existing slot!
      const replaceBtns = target.skills.map((oldSk, rIdx) => {
        const oldDef = G.INNATE_SKILLS[oldSk.id];
        return `<button type="button" class="secondary-btn" data-absorb-mode="inherit" data-skill="${sk.id}" data-replace="${rIdx}">替换【${oldDef?.name || "旧技"} Lv.${oldSk.level}】</button>`;
      }).join("");
      return `<div class="absorb-choice-card inherit full">
        <div class="ac-head"><span>${sk.icon} 继承替换：${sk.name} Lv.1</span><span class="ac-lv">仅 +${inheritGain} 级${starHint}</span></div>
        <p class="ac-desc">技能栏已满（${tRar.slots}/${tRar.slots}），点击下方槽位替换：${sk.desc(1)}</p>
        <div class="ac-replace-row">${replaceBtns}</div>
      </div>`;
    }).join("");

    const pureStarHint = pureNextStars > curStars ? ` · ✨突破升至 ${pureNextStars}★！` : "";
    const feedCard = `<button type="button" class="absorb-choice-card feed" data-absorb-mode="feed">
      <div class="ac-head"><span>🔥 不继承技能 · 纯吞噬冲级</span><span class="ac-lv gold-txt">直升 +${pureGain} 级${pureStarHint}</span></div>
      <p class="ac-desc">消耗【${dRar.label}】素材（基础 +${dRar.feedLevels} 级${transferBonus ? ` + 经验传承 +${transferBonus} 级` : ""}），主体等级 Lv.${target.heroLv} → <strong>Lv.${pureNextLv}</strong>！</p>
    </button>`;

    const box = $("absorb-options");
    box.innerHTML = feedCard + inheritCards;
    box.onclick = ev => {
      const btn = ev.target.closest("[data-absorb-mode]");
      if (!btn || btn.disabled) return;
      const mode = btn.dataset.absorbMode;
      const skillId = btn.dataset.skill;
      const replaceIndex = btn.dataset.replace !== undefined ? Number(btn.dataset.replace) : undefined;
      const res = G.absorbUnit(run, target.id, donor.id, { mode, skillId, replaceIndex });
      if (res?.error) {
        SFX.lock();
        showAlertPopup("无法吞噬", res.error);
        return;
      }
      if (res) {
        $("absorb-dialog").close();
        G.addLog(run, "军团", `${G.SYMBOLS[res.target.type].name} 吞噬 +${res.lvGain}级 → Lv.${res.target.heroLv}（${res.inherited}）`);
        SFX.absorb();
        if (globalThis.NativeBridge) {
          globalThis.NativeBridge.haptic(res.afterStars > res.beforeStars ? "jackpot" : "absorb_evolve", 1.05);
        }
        if (res.afterStars > res.beforeStars) {
          SFX.jackpot();
          showToast(`升星突破！${G.SYMBOLS[res.target.type].name} → ${"★".repeat(res.afterStars)}！`);
        }
        setTicker(
          res.afterStars > res.beforeStars ? `升星突破 → ${"★".repeat(res.afterStars)}！` : "吞噬融合成功！",
          `${G.SYMBOLS[res.target.type].name} Lv.${res.target.heroLv}（${res.inherited}）`,
          res.afterStars > res.beforeStars ? "jackpot" : "win"
        );
        save();
        renderAll();
        checkPendingModals();
      }
    };
    $("absorb-dialog").showModal();
  }

  function handleFight() {
    if (busy || run.outcome) return;
    if (!run.field.some(Boolean)) {
      setTicker("阵型为空", "请先将至少 1 名单位部署到出战阵型中！");
      return;
    }
    busy = true;
    selectedSlot = null;
    renderAll();

    arena.startBattle(run, (won, battle) => {
      const summary = G.resolveWave(run, won, battle);
      G.addLog(run, "战斗", `${summary.wave.name}${won ? "胜利" : "失守"}：+${summary.reward}G${summary.crystalsGained ? ` +${summary.crystalsGained}水晶` : ""}${summary.dmg ? ` -${summary.dmg}城防` : ""}`);
      busy = false;
      displayBoard = [...run.board];
      save();
      renderAll();

      if (!summary.finished) {
        const bonusTxt = summary.interest ? `（含利息 +${summary.interest}）` : "";
        const crystalTxt = summary.crystalsGained ? ` · +${summary.crystalsGained} 水晶` : "";
        setTicker(
          won ? `第 ${summary.wave.wave} 波告捷！` : `防线受损（-${summary.dmg} 耐久）`,
          `获得 +${summary.reward} 金币${bonusTxt}${crystalTxt}，已刷新 ${run.freeSpins} 次免费转动！`,
          won ? "win" : ""
        );
      }
      checkPendingModals();
    }, renderReinforcements);
  }

  function checkPendingModals() {
    if (run.pendingChapterClear) {
      openChapterDialog();
      return;
    }
    if (run.pendingMastery && run.pendingMastery.length > 0) {
      openMasteryDialog();
      return;
    }
    if (run.pendingEvolutions.length > 0) {
      openEvoDialog();
      return;
    }
    if (run.pendingCoreChoices && run.pendingCoreChoices.length > 0) {
      openCoreDialog();
      return;
    }
    if (run.pendingEncounter) {
      openEncounter();
      return;
    }
    if (run.pendingShop) {
      openShopDialog();
      return;
    }
    if (run.outcome) openEndDialog();
  }

  function openEncounter() {
    $("encounter-choices").innerHTML = run.pendingEncounter.map(id => {
      const option = G.ENCOUNTERS[id];
      return `<button type="button" class="core-card" data-encounter="${id}" ${G.encounterAvailable(run, id) ? "" : "disabled"}>
        <strong>${option.name}</strong><p>${option.desc}</p>
      </button>`;
    }).join("");
    if (!$("encounter-dialog").open) $("encounter-dialog").showModal();
  }

  function openShopDialog() {
    const shop = run.pendingShop;
    const dialog = $("shop-dialog");
    $("shop-title").textContent = shop.halfPrice ? "神秘黑市" : "命运秘宝商店";
    $("shop-balance").textContent = `${run.crystals} 命运水晶 · ${run.gold} 金币`;
    $("btn-shop-refresh").hidden = shop.halfPrice;
    $("btn-shop-refresh").disabled = run.gold < 15;
    const expansion = shop.halfPrice ? [] : Object.entries(G.SLOT_UPGRADES)
      .filter(([area]) => G.slotCost(run, area) !== null).map(([area, upgrade]) => {
        const cost = G.slotCost(run, area);
        return `<div class="shop-card">
          ${Art.renderPortraitImg("shopSlot", "", "shop-icon")}
          <strong>解锁${upgrade.name}</strong>
          <button type="button" class="secondary-btn" data-shop-slot="${area}" ${run.crystals < cost ? "disabled" : ""}>${cost} 水晶</button>
        </div>`;
      });
    const offers = shop.offers.map(id => {
      const item = G.SHOP_ITEMS[id];
      const cost = G.shopPrice(run, id);
      const sold = shop.bought.includes(id);
      const unavailable = sold || run.crystals < cost || (id === "repair" && run.hp >= run.maxHp);
      const enchantOptions = Object.entries(G.CELL_ENCHANT_INFO).map(([key, info]) =>
        `<option value="${key}">${info.name}</option>`).join("");
      const symbolOptions = G.SYMBOL_IDS.filter(key => G.getEffectiveWeights(run)[key] > 0).map(key =>
        `<option value="${key}">${G.SYMBOLS[key].name}</option>`).join("");
      const fields = id === "enchant" ? `<label>格位<select data-option="index">${run.board.map((_, i) =>
        `<option value="${i}">第 ${Math.floor(i / 3) + 1} 行 · 第 ${i % 3 + 1} 列</option>`).join("")}</select></label>
        <label>符文<select data-option="enchant">${enchantOptions}</select></label>`
        : id === "dice" ? `<label>符号<select data-option="symbol">${symbolOptions}</select></label>
          <label>效果<select data-option="action"><option value="boost">兵种权重 +20</option><option value="ban">移除出签池</option></select></label>` : "";
      return `<div class="shop-card">
        ${Art.renderPortraitImg(item.art, "", "shop-icon")}
        <strong>${item.name}</strong><p>${item.desc}</p>${sold ? "" : fields}
        <button type="button" class="secondary-btn" data-buy="${id}" ${unavailable ? "disabled" : ""}>
          ${sold ? "已购买" : id === "repair" && run.hp >= run.maxHp ? "城防已满" : `${cost} 水晶`}
        </button>
      </div>`;
    });
    $("shop-items").innerHTML = [...expansion, ...offers].join("");
    if (!dialog.open) {
      $("shop-notice").textContent = "";
      dialog.showModal();
    }
  }

  function closeShop() {
    run.pendingShop = run.queuedShop;
    run.queuedShop = null;
    $("shop-dialog").close();
    save();
    checkPendingModals();
  }

  function openChapterDialog() {
    const chapter = G.CHAPTERS[run.pendingChapterClear - 1];
    const next = G.CHAPTERS[chapter.id];
    const dialog = $("chapter-dialog");
    dialog.style.setProperty("--chapter-accent", chapter.themeColor);
    $("chapter-banner-map").src = chapter.mapAsset;
    $("chapter-title").textContent = chapter.name;
    $("chapter-boss").textContent = `已击败 ${chapter.bossName}`;
    $("chapter-restored").textContent = `城防已恢复至 ${run.maxHp} / ${run.maxHp}`;
    $("chapter-reward").textContent = `+${chapter.crystalReward} 命运水晶`;
    $("chapter-next").textContent = next
      ? `下一章 · ${next.name}`
      : "五章战役已全部征服，无尽轮回已解锁";
    $("btn-chapter-continue").textContent = next ? `进入${next.name}` : "领取战后奖励";
    if (!dialog.open) dialog.showModal();
  }

  function openEvoDialog() {
    const unitId = run.pendingEvolutions[0];
    const loc = G.findUnitLocation(run, unitId);
    const evoData = loc ? G.getEvolutionChoices(loc.unit) : null;
    if (!loc || !evoData) {
      run.pendingEvolutions.shift();
      checkPendingModals();
      return;
    }
    const sym = G.SYMBOLS[loc.unit.type];
    const isTier3 = evoData.tier === 3;
    $("evo-hero-preview").innerHTML = Art.renderPortraitImg(loc.unit.type, sym.name, "evo-sprite");
    $("evo-title").textContent = isTier3
      ? `${evoData.parent.name} · 3★ 终极二转`
      : `${sym.name} · 2★ 进阶转职`;
    $("evo-desc").textContent = isTier3
      ? "该单位已突破至 3★！请从当前分支中选择一项终极职业形态："
      : "该单位已突破至 2★（同时觉醒阵营羁绊），请选择一项进阶转职方向：";
    $("evo-choices").innerHTML = evoData.options.map(evo => `
      <button type="button" class="evo-card" data-evo="${evo.id}">
        <span class="evo-badge">${evo.tag}</span>
        <strong>${evo.name}</strong>
        <p>${evo.desc}</p>
        <p class="evo-mult">生命 ×${evo.hpMult} · 攻击 ×${evo.atkMult}</p>
      </button>
    `).join("");

    $("evo-choices").querySelectorAll("[data-evo]").forEach(btn => {
      btn.onclick = () => {
        G.applyEvolution(run, unitId, btn.dataset.evo);
        SFX.evolve();
        $("evo-dialog").close();
        save();
        renderAll();
        checkPendingModals();
      };
    });

    if (!$("evo-dialog").open) $("evo-dialog").showModal();
  }

  function openCoreDialog() {
    const choices = run.pendingCoreChoices || [];
    const levels = run.coreLevels || {};
    const slotsFull = run.cores.length >= run.unlockedCoreSlots;
    $("core-choices").innerHTML = choices.map(id => {
      const c = G.CORES.find(item => item.id === id);
      const owned = run.cores.includes(id);
      const nextLv = (levels[id] || 1) + 1;
      const badge = owned
        ? `核心升阶 → Lv.${nextLv}`
        : (slotsFull ? `${RARITY_LABEL[c.rarity]} · 替换旧核` : RARITY_LABEL[c.rarity]);
      const desc = owned ? G.coreUpgradeDesc(c.id, nextLv) : c.desc;
      return `<button type="button" class="core-card ${c.rarity}" data-core="${c.id}">
        <span class="card-medallion">${c.icon}</span>
        <span class="card-rarity">${badge}</span>
        <strong>${c.name}</strong>
        <p>${desc}</p>
      </button>`;
    }).join("");

    $("core-choices").querySelectorAll("[data-core]").forEach(btn => {
      btn.onclick = () => {
        const coreId = btn.dataset.core;
        const c = G.CORES.find(item => item.id === coreId);
        const wasOwned = run.cores.includes(coreId);
        G.pickCore(run, coreId);
        const lv = G.coreLevel(run, coreId);
        G.addLog(run, "核心", wasOwned ? `核心升阶：${c.name} → Lv.${lv}` : `装备核心：${c.name}（${RARITY_LABEL[c.rarity]}）`);
        SFX.evolve();
        $("core-dialog").close();
        save();
        renderAll();
        checkPendingModals();
      };
    });

    const rerollBtn = $("btn-core-reroll");
    const rerollInfo = $("core-reroll-info");
    if (rerollBtn && G.getCoreRerollCost) {
      const rCost = G.getCoreRerollCost(run);
      const canReroll = rCost === 0 || (run.crystals || 0) >= rCost;
      rerollBtn.disabled = !canReroll;
      rerollBtn.textContent = rCost === 0
        ? `🔄 刷新核心（免费剩余 ${run.freeCoreRerolls} 次）`
        : `🔄 刷新核心（消耗 ${rCost} 💎）`;
      if (rerollInfo) rerollInfo.textContent = `当前水晶：${run.crystals || 0} 💎`;
      rerollBtn.onclick = () => {
        if (G.rerollCoreChoices(run)) {
          SFX.nudge();
          save();
          renderTopbar();
          openCoreDialog();
        }
      };
    }

    if (!$("core-dialog").open) $("core-dialog").showModal();
  }

  function openManualShop() {
    if (busy || run.outcome) return;
    run.pendingShop = G.ensureShop(run);
    openShopDialog();
  }

  function openLogDialog() {
    const logs = run.logs || [];
    $("log-summary").textContent = `共 ${logs.length} 条记录 · 当前战力 ${G.getTotalPower(run)}（保存在浏览器本地）`;
    $("action-log-list").innerHTML = logs.length
      ? logs.map(item => `<div class="log-entry">
          <span class="log-stamp">${item.stamp}</span>
          <span class="log-tag ${item.tag}">${item.tag}</span>
          <span class="log-text">${item.text}</span>
        </div>`).join("")
      : '<div class="inspector-empty">暂无行动记录，转动轮盘或开始战斗后将自动记录每一步操作。</div>';
    if (!$("log-dialog").open) $("log-dialog").showModal();
  }

  function exportLogs() {
    const payload = {
      exportedAt: new Date().toISOString(),
      chapter: run.chapter,
      wave: run.wave,
      mode: run.mode,
      gold: run.gold,
      crystals: run.crystals,
      hp: run.hp,
      reelLevel: run.reelLevel,
      power: G.getTotalPower(run),
      cores: run.cores.map(id => ({ id, lv: G.coreLevel(run, id) })),
      field: run.field.filter(Boolean).map(u => ({ type: u.type, xp: u.xp, evo: u.evolution, lucky: u.lucky, stats: G.getUnitStats(u, run) })),
      logs: run.logs || []
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `slotbound-log-c${run.chapter}-w${run.wave}.json`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function openRigDialog() {
    if (busy || run.outcome) return;
    renderRigList();
    if (!$("rig-dialog").open) $("rig-dialog").showModal();
  }

  function renderRigList() {
    const odds = G.getSymbolOdds(run);
    const crystals = run.crystals || 0;
    $("rig-gold-val").textContent = `${crystals} 命运水晶（过关掉落）`;
    $("rig-list").innerHTML = G.SYMBOL_IDS.map(id => {
      const sym = G.SYMBOLS[id];
      const pct = (odds[id] * 100).toFixed(1);
      const boosts = run.rigBoosts[id] || 0;
      const upCost = G.getRigBoostCost(run, id);
      const curW = run.weights[id] ?? sym.baseWeight;
      const available = odds[id] > 0;
      const canUp = available && crystals >= upCost && boosts < 4;
      const canDown = available && crystals >= 2 && curW > 4;
      const upLabel = !available ? (run.bannedSymbols.includes(id) ? "已移除" : "待升阶")
        : boosts >= 4 ? "已满" : `+权 ${upCost} 水晶`;
      return `<div class="rig-row" style="--sym-color:${sym.color}">
        <div class="rig-sym">${Art.renderPortraitImg(id, sym.name, "rig-thumb")}<span>${sym.name}</span></div>
        <div class="rig-bar-wrap"><div class="rig-bar-fill" style="width:${Math.min(100, odds[id] * 260)}%"></div></div>
        <div class="rig-pct">${pct}%</div>
        <div class="rig-btns">
          <button type="button" class="rig-act up" data-rig-up="${id}"${canUp ? "" : " disabled"}>${upLabel}</button>
          <button type="button" class="rig-act down" data-rig-down="${id}"${canDown ? "" : " disabled"}>-权 2水晶</button>
        </div>
      </div>`;
    }).join("");

    $("rig-list").querySelectorAll("[data-rig-up]").forEach(btn => {
      btn.onclick = () => {
        if (G.boostSymbolWeight(run, btn.dataset.rigUp)) {
          SFX.coin();
          save();
          renderRigList();
          renderTopbar();
          renderReels();
        }
      };
    });
    $("rig-list").querySelectorAll("[data-rig-down]").forEach(btn => {
      btn.onclick = () => {
        if (G.reduceSymbolWeight(run, btn.dataset.rigDown)) {
          SFX.lock();
          save();
          renderRigList();
          renderTopbar();
          renderReels();
        }
      };
    });
  }

  function openRecords() {
    const stats = profile.fastest;
    const duration = stats ? Math.round(stats.duration / 1000) : 0;
    const time = stats ? `${Math.floor(duration / 60)} 分 ${duration % 60} 秒` : "—";
    $("records-stats").innerHTML = [
      ["无尽最高通过波次", profile.highestEndless || "—"],
      ["最高单次连线", profile.maxLines || "—"],
      ["最快战役通关", time]
    ].map(([label, value]) => `<div class="end-stat"><span>${label}</span><strong>${value}</strong></div>`).join("");
    $("records-lineup").textContent = stats ? `通关阵容 · ${stats.units.map(unit => {
      const symbol = G.SYMBOLS[unit.type];
      return symbol.evolutions[unit.evolution]?.name ?? symbol.name;
    }).join("、")}` : "完成五章战役后记录用时和通关阵容。";
    $("records-dialog").showModal();
  }

  function openEndDialog() {
    const won = run.outcome === "victory";
    const legacyVictory = won && run.wave < G.WAVES.length;
    const endless = run.mode === "endless";
    $("end-tag").textContent = endless ? "无尽战绩" : won ? "荣耀通关" : "防线失守";
    $("end-title").textContent = won ? "命运由你掌控！" : "防线失守";
    $("end-desc").textContent = endless ? `通过了 ${run.endlessWave - 1} 波无尽挑战。`
      : legacyVictory ? "这局已通关。再来一局即可挑战五章战役。"
      : won ? `你击败了厄运魔龙，守住全部 ${G.WAVES.length} 波敌军！`
      : `你在${G.getChapter(run).name}的第 ${run.wave} 波倒下。`;
    $("btn-endless-continue").hidden = !profile.champion;
    const progress = endless ? String(run.endlessWave) : `${run.wave} / ${legacyVictory ? run.wave : G.WAVES.length}`;
    $("end-stats").innerHTML = `
      <div class="end-stat"><span>抵达波次</span><strong>${progress}</strong></div>
      <div class="end-stat"><span>累计转动</span><strong>${run.totalSpins}</strong></div>
      <div class="end-stat"><span>最高单次连线</span><strong>${run.maxLines}</strong></div>
      <div class="end-stat"><span>吞噬进化</span><strong>${run.totalAbsorbs}</strong></div>
    `;
    if (!$("end-dialog").open) $("end-dialog").showModal();
  }

  function startRun(next, title, detail) {
    run = next;
    displayBoard = [...run.board];
    selectedSlot = null;
    armyMode = "swap";
    save();
    document.querySelectorAll("dialog[open]").forEach(dialog => dialog.close());
    setTicker(title, detail);
    renderAll();
  }

  function restartGame() {
    if (busy) return;
    startRun(G.createRun(), "新征程开启", "使用免费转动召唤军团，准备第 1 波战斗。");
  }

  function enterEndless() {
    if (busy || !profile.champion) return;
    if (!run.outcome && !window.confirm("使用通关阵容开始无尽轮回？当前战局将结束。")) return;
    const base = run.mode === "campaign" && run.outcome === "victory" && run.wave === G.WAVES.length
      ? run : profile.champion;
    startRun(G.createEndlessRun(base), "无尽轮回开启", "每波携带随机词缀，每三波触发一次命运奇遇。");
  }

  $("btn-spin").addEventListener("click", handleSpin);
  $("mech-lever").addEventListener("click", handleSpin);
  $("btn-tier-up").addEventListener("click", handleTierUpgrade);
  $("nudge-row").addEventListener("click", e => {
    const btn = e.target.closest("[data-nudge]");
    if (btn && !btn.disabled) handleNudge(Number(btn.dataset.nudge));
  });
  $("btn-fight").addEventListener("click", handleFight);
  $("btn-rig").addEventListener("click", openRigDialog);
  $("btn-open-shop").addEventListener("click", openManualShop);
  $("btn-open-logs").addEventListener("click", openLogDialog);
  $("btn-export-logs").addEventListener("click", exportLogs);
  $("btn-restart").addEventListener("click", restartGame);
  $("btn-end-restart").addEventListener("click", restartGame);
  $("btn-endless").addEventListener("click", enterEndless);
  $("btn-endless-continue").addEventListener("click", enterEndless);
  $("btn-records").addEventListener("click", openRecords);
  $("encounter-choices").addEventListener("click", event => {
    const card = event.target.closest("[data-encounter]");
    if (!card || card.disabled || !G.pickEncounter(run, card.dataset.encounter)) return;
    $("encounter-dialog").close();
    save();
    renderAll();
    checkPendingModals();
  });
  $("btn-chapter-continue").addEventListener("click", () => {
    run.pendingChapterClear = null;
    $("chapter-dialog").close();
    save();
    checkPendingModals();
  });

    $("btn-open-hub").addEventListener("click", openHub);
    $("btn-open-codex").addEventListener("click", () => openCodexDialog("heroes"));
    $("btn-hub-codex").addEventListener("click", () => openCodexDialog("heroes"));
    $("tab-codex-heroes").addEventListener("click", () => renderCodex("heroes"));
    $("tab-codex-enemies").addEventListener("click", () => renderCodex("enemies"));

    let codexTab = "heroes";
    function openCodexDialog(tab = "heroes") {
      codexTab = tab;
      renderCodex(tab);
      if (!$("codex-dialog").open) $("codex-dialog").showModal();
    }

    function renderCodex(tab = codexTab) {
      codexTab = tab;
      const meta = Meta ? Meta.loadMeta() : { codex: { heroes: [], evos: [], enemies: [] } };
      // Also sync any heroes currently owned in the active run into the codex automatically!
      if (Meta && run) {
        [...run.field, ...run.bench].filter(Boolean).forEach(u => {
          Meta.unlockCodexHero(meta, u.type);
          if (u.evolution) Meta.unlockCodexEvo(meta, u.type, u.evolution);
          if (u.evolution3) Meta.unlockCodexEvo(meta, u.type, u.evolution3);
        });
      }
      const unlockedHeroes = new Set(meta.codex?.heroes || []);
      const unlockedEvos = new Set(meta.codex?.evos || []);
      const unlockedEnemies = new Set(meta.codex?.enemies || []);

      const allHeroes = G.ALL_HERO_IDS || G.UNIT_IDS;
      const allEnemies = G.getEnemyCodexCatalog ? G.getEnemyCodexCatalog() : [];
      $("codex-hero-cnt").textContent = `${unlockedHeroes.size}/${allHeroes.length}`;
      $("codex-enemy-cnt").textContent = `${unlockedEnemies.size}/${allEnemies.length}`;
      $("tab-codex-heroes").classList.toggle("active", tab === "heroes");
      $("tab-codex-enemies").classList.toggle("active", tab === "enemies");

      const body = $("codex-body");
      if (tab === "heroes") {
        body.innerHTML = allHeroes.map(id => {
          const sym = G.SYMBOLS[id];
          const rar = G.getUnitRarity(id);
          const unlocked = unlockedHeroes.has(id);
          if (!unlocked) {
            return `<div class="codex-card locked" style="--c-col:${rar.color}">
              <div class="codex-head">
                <div class="codex-portrait silhouette">${Art.renderPortraitImg(sym.artKey || id, "?", "codex-sprite")}</div>
                <div>
                  <strong style="color:${rar.color}">??? · ${rar.label}</strong>
                  <p class="codex-sub">尚未解锁 · 升级轮盘或在独立高级轮盘中召唤点亮（+1 局外水晶）</p>
                </div>
              </div>
            </div>`;
          }
          const sk = G.getInnateSkill(id);
          const evoTree = Object.values(sym.evolutions || {}).map(e2 => {
            const e2Open = unlockedEvos.has(`${id}:${e2.id}`);
            const t3Html = Object.values(e2.tier3 || {}).map(e3 => {
              const e3Open = unlockedEvos.has(`${id}:${e3.id}`);
              return `<span class="evo-node${e3Open ? " done" : ""}" title="${e3.desc}">3★ ${e3.name}${e3Open ? " ✓" : ""}</span>`;
            }).join("");
            return `<div class="codex-evo-branch">
              <div class="evo-t2${e2Open ? " done" : ""}" title="${e2.desc}"><strong>2★ ${e2.name}</strong>（${e2.tag}）${e2Open ? " ✓" : ""}：${e2.desc}</div>
              ${t3Html ? `<div class="evo-t3-row">↳ ${t3Html}</div>` : ""}
            </div>`;
          }).join("");

          return `<div class="codex-card" style="--c-col:${rar.color}">
            <div class="codex-head">
              <div class="codex-portrait">${Art.renderPortraitImg(sym.artKey || id, sym.name, "codex-sprite")}</div>
              <div class="codex-meta">
                <div class="codex-title-row">
                  <strong>${sym.name}</strong>
                  <span class="u-tag" style="border:1px solid ${rar.color};color:${rar.color}">${rar.label} · ${rar.slots}技能栏</span>
                  <span class="u-tag">${sym.role}</span>
                </div>
                <p class="codex-stats">血 ${sym.hp} · 攻 ${sym.atk} · 攻速 ${(1 / sym.atkCd).toFixed(2)}/s · 移速 ${sym.moveSpd} · 射程 ${sym.range} · 暴击 ${Math.round(sym.crit * 100)}%</p>
                <p class="codex-skill">${sk.icon} <strong>先天技·${sk.name}</strong>：${sk.desc(1)}（满级 Lv.5：${sk.desc(5)}）</p>
              </div>
            </div>
            <div class="codex-evo-tree">${evoTree}</div>
          </div>`;
        }).join("");
      } else {
        const kindLabel = { melee: "近战", tank: "重装坦克", ranged: "远程射手", caster: "法系施法", assassin: "后排刺客", boss: "关底 Boss" };
        body.innerHTML = allEnemies.map(e => {
          const unlocked = unlockedEnemies.has(e.key);
          if (!unlocked) {
            return `<div class="codex-card locked" style="--c-col:${e.themeColor}">
              <div class="codex-head">
                <div class="codex-portrait silhouette">${Art.renderPortraitImg(e.key, "?", "codex-sprite")}</div>
                <div>
                  <strong style="color:${e.themeColor}">??? · 第 ${e.chapterId} 章 ${e.chapterName}${e.isBoss ? " [关底 Boss]" : ""}</strong>
                  <p class="codex-sub">尚未遭遇 · 在战斗中遭遇该敌军即可点亮图鉴（+1 局外水晶）</p>
                </div>
              </div>
            </div>`;
          }
          return `<div class="codex-card${e.isBoss ? " boss-codex" : ""}" style="--c-col:${e.themeColor}">
            <div class="codex-head">
              <div class="codex-portrait">${Art.renderPortraitImg(e.key, e.name, "codex-sprite")}</div>
              <div class="codex-meta">
                <div class="codex-title-row">
                  <strong>${e.name}</strong>
                  <span class="u-tag" style="border:1px solid ${e.themeColor};color:${e.themeColor}">第 ${e.chapterId} 章 · ${e.chapterName}</span>
                  <span class="u-tag">${kindLabel[e.kind] || e.kind}</span>
                </div>
                <p class="codex-stats">基准生命 ${e.hp} · 攻击 ${e.atk} · 攻速 ${(1 / e.cd).toFixed(2)}/s · 移速 ${e.moveSpd} · 射程 ${e.range}</p>
                ${e.tactic ? `<p class="codex-skill">⚔️ 战术特性：${e.tactic}</p>` : ""}
                ${e.bossSkill ? `<p class="codex-skill" style="color:#ff9aa8">👑 Boss 考题技能：${e.bossSkill}</p>` : ""}
              </div>
            </div>
          </div>`;
        }).join("");
      }
    }
    $("btn-hub-resume").addEventListener("click", closeHub);
    $("btn-hub-start").addEventListener("click", () => {
      if (busy) return;
      const meta = Meta.loadMeta();
      closeHub();
      startRun(
        G.createRun({ chapter: meta.selectedChapter, difficulty: meta.selectedDifficulty }),
        `出征：第 ${meta.selectedChapter} 章 [${Meta.getDifficulty(meta.selectedDifficulty).name}]`,
        `初始军费 ${Math.min(150, 100 + (meta.upgrades.startGold || 0) * 10)}G，拉动轮盘召唤军团！`
      );
    });
    $("btn-elite-wheel").addEventListener("click", openEliteWheelDialog);
    $("btn-elite-spin").addEventListener("click", () => {
      const res = G.executeEliteWheel(run);
      if (!res) return;
      SFX.jackpot();
      const sym = G.SYMBOLS[res.unit.type];
      const rar = G.getUnitRarity(res.unit);
      $("elite-result-box").innerHTML = `<div class="elite-win" style="border-color:${rar.color}">
        ${Art.renderPortraitImg(sym.artKey || res.unit.type, sym.name, "ins-sprite")}
        <div><strong style="color:${rar.color}">🎉 抽中【${rar.label}】${sym.name}！</strong><p>${sym.skillDesc}</p></div>
      </div>`;
      $("btn-elite-spin").disabled = (run.eliteWheelTokens || 0) <= 0;
      $("btn-elite-spin").textContent = (run.eliteWheelTokens || 0) > 0
        ? `🎰 再转一次（剩余 ${run.eliteWheelTokens}）`
        : "已用完";
      save();
      renderAll();
    });

    $("btn-mode-absorb").addEventListener("click", () => {
      armyMode = armyMode === "absorb" ? "swap" : "absorb";
      renderArmy();
    });

    // Mobile-first 1:1 Pointer/Touch drag system:
    // - Quick drag & release onto another unit or empty slot -> smooth swap/deploy
    // - Hover over an absorbable target for 320ms (or in Absorb Mode) -> glowing amber ring + haptic -> release to Absorb Fusion!
    const ghostEl = $("touch-drag-ghost");
    let pointerDrag = null;
    let suppressNextRosterClick = false;

    const getUnitAt = (area, idx) => (
      area === "field" ? run.field[idx] : area === "bench" ? run.bench[idx] : (run.overflowUnits || [])[idx]
    );

    function clearDragHighlights() {
      document.querySelectorAll(".unit-slot.dragging, .unit-slot.drag-over-absorb, .unit-slot.drag-over-swap").forEach(n => {
        n.classList.remove("dragging", "drag-over-absorb", "drag-over-swap");
      });
    }

    function updateGhostBadge(text, mode = "swap") {
      if (!ghostEl) return;
      const badge = ghostEl.querySelector(".ghost-action-badge");
      if (badge) {
        badge.textContent = text;
        badge.dataset.mode = mode;
      }
    }

    function cancelPointerDrag() {
      if (!pointerDrag) return;
      if (pointerDrag.hoverTimer) clearTimeout(pointerDrag.hoverTimer);
      pointerDrag = null;
      clearDragHighlights();
      if (ghostEl) {
        ghostEl.hidden = true;
        ghostEl.innerHTML = "";
      }
    }

    function startTouchDragVisual(state, ev) {
      state.active = true;
      state.sourceCard.classList.add("dragging");
      if (globalThis.SFX?.dragPick) globalThis.SFX.dragPick();
      if (globalThis.NativeBridge) globalThis.NativeBridge.haptic("drag_pick", 0.75);
      if (ghostEl) {
        const donor = getUnitAt(state.area, state.index);
        const sym = donor ? G.SYMBOLS[donor.type] : null;
        const rarity = donor ? G.getUnitRarity(donor) : null;
        const st = donor ? G.getUnitStats(donor, run) : null;
        ghostEl.innerHTML = `
          <div class="ghost-card" style="--u-color:${rarity?.color || "#f5c451"}">
            ${sym ? Art.renderPortraitImg(sym.artKey || donor.type, sym.name, "ghost-sprite") : ""}
            <span class="ghost-name">${sym ? sym.short : ""} Lv.${st?.heroLv || 1}</span>
          </div>
          <div class="ghost-action-badge" data-mode="swap">拖放换位</div>
        `;
        ghostEl.hidden = false;
        const liftY = ev.pointerType === "touch" ? 42 : 18;
        ghostEl.style.transform = `translate3d(${ev.clientX}px, ${ev.clientY - liftY}px, 0)`;
      }
    }

    function setHoverTarget(state, targetEl) {
      if (state.hoverEl === targetEl) return;
      if (state.hoverTimer) {
        clearTimeout(state.hoverTimer);
        state.hoverTimer = null;
      }
      if (state.hoverEl) {
        state.hoverEl.classList.remove("drag-over-swap", "drag-over-absorb");
      }
      state.hoverEl = targetEl;
      state.hoverAbsorbReady = false;

      if (!targetEl) {
        updateGhostBadge("松手取消", "neutral");
        return;
      }

      const toArea = targetEl.dataset.area;
      const toIdx = Number(targetEl.dataset.index);
      if (toArea === state.area && toIdx === state.index) {
        updateGhostBadge("原位", "neutral");
        return;
      }

      const donor = getUnitAt(state.area, state.index);
      const receiver = getUnitAt(toArea, toIdx);
      if (!receiver) {
        if (toArea === "overflow") {
          updateGhostBadge("不可放回超编区", "neutral");
          return;
        }
        targetEl.classList.add("drag-over-swap");
        updateGhostBadge("松手部署 / 换位", "swap");
        return;
      }

      if (donor && receiver && donor.id !== receiver.id) {
        if (armyMode === "absorb") {
          state.hoverAbsorbReady = true;
          targetEl.classList.add("drag-over-absorb");
          updateGhostBadge("🔥 松手吞噬融合", "absorb");
        } else {
          targetEl.classList.add("drag-over-swap");
          updateGhostBadge("松手换位 · 停住吞噬", "swap");
          state.hoverTimer = setTimeout(() => {
            if (!pointerDrag || pointerDrag.hoverEl !== targetEl) return;
            pointerDrag.hoverAbsorbReady = true;
            targetEl.classList.remove("drag-over-swap");
            targetEl.classList.add("drag-over-absorb");
            updateGhostBadge("🔥 松手吞噬融合!", "absorb");
            if (globalThis.SFX?.dragHover) globalThis.SFX.dragHover();
            if (globalThis.NativeBridge) globalThis.NativeBridge.haptic("drag_hover_absorb", 1.0);
          }, 320);
        }
      }
    }

    const bindTouchDragZone = el => {
      if (!el) return;
      el.addEventListener("pointerdown", e => {
        if (e.button !== 0 && e.pointerType === "mouse") return;
        const card = e.target.closest("[data-area][data-uid]");
        if (!card || busy || run.outcome) return;
        pointerDrag = {
          pointerId: e.pointerId,
          area: card.dataset.area,
          index: Number(card.dataset.index),
          uid: Number(card.dataset.uid),
          sourceCard: card,
          startX: e.clientX,
          startY: e.clientY,
          active: false,
          hoverEl: null,
          hoverTimer: null,
          hoverAbsorbReady: false
        };
      });
    };

    window.addEventListener("pointermove", e => {
      if (!pointerDrag || e.pointerId !== pointerDrag.pointerId) return;
      const dist = Math.hypot(e.clientX - pointerDrag.startX, e.clientY - pointerDrag.startY);
      if (!pointerDrag.active) {
        if (dist < 8) return;
        startTouchDragVisual(pointerDrag, e);
      }
      e.preventDefault();
      if (ghostEl) {
        const liftY = e.pointerType === "touch" ? 42 : 18;
        ghostEl.style.transform = `translate3d(${e.clientX}px, ${e.clientY - liftY}px, 0)`;
      }
      const under = document.elementFromPoint(e.clientX, e.clientY);
      const targetSlot = under ? under.closest("[data-area]") : null;
      setHoverTarget(pointerDrag, targetSlot);
    }, { passive: false });

    const finishPointerDrag = e => {
      if (!pointerDrag || e.pointerId !== pointerDrag.pointerId) return;
      const state = pointerDrag;
      if (!state.active) {
        cancelPointerDrag();
        return;
      }
      suppressNextRosterClick = true;
      setTimeout(() => { suppressNextRosterClick = false; }, 120);

      const targetEl = state.hoverEl;
      const wantAbsorb = state.hoverAbsorbReady;
      cancelPointerDrag();

      if (!targetEl) return;
      const toArea = targetEl.dataset.area;
      const toIdx = Number(targetEl.dataset.index);
      if (state.area === toArea && state.index === toIdx) return;

      const donor = getUnitAt(state.area, state.index);
      const receiver = getUnitAt(toArea, toIdx);
      if (donor && receiver && donor.id !== receiver.id) {
        if (wantAbsorb || armyMode === "absorb") {
          openAbsorbDialog(receiver, donor);
        } else if (G.swapSlots(run, state.area, state.index, toArea, toIdx)) {
          if (globalThis.SFX?.dragSnap) globalThis.SFX.dragSnap();
          else SFX.lock();
          if (globalThis.NativeBridge) globalThis.NativeBridge.haptic("swap", 0.8);
          save();
          renderAll();
        }
      } else if (donor && !receiver && toArea !== "overflow") {
        if (G.swapSlots(run, state.area, state.index, toArea, toIdx)) {
          if (globalThis.SFX?.dragSnap) globalThis.SFX.dragSnap();
          else SFX.lock();
          if (globalThis.NativeBridge) globalThis.NativeBridge.haptic("drag_snap", 0.8);
          save();
          renderAll();
        }
      }
    };

    window.addEventListener("pointerup", finishPointerDrag);
    window.addEventListener("pointercancel", cancelPointerDrag);

    bindTouchDragZone($("formation-grid"));
    bindTouchDragZone($("bench-grid"));
    bindTouchDragZone($("overflow-grid"));

    function openMasteryDialog() {
      const item = run.pendingMastery?.[0];
      if (!item) return;
      const loc = G.findUnitLocation(run, item.unitId);
      if (!loc) {
        run.pendingMastery.shift();
        checkPendingModals();
        return;
      }
      const sym = G.SYMBOLS[loc.unit.type];
      $("mastery-title").textContent = `${sym.name} · 满 ${item.level} 级宗师觉醒`;
      $("mastery-desc").textContent = `恭喜【${sym.name}】突破 Lv.${item.level}！请从以下 3 项专属宗师 Buff 中任选其一：`;
      $("mastery-choices").innerHTML = item.options.map(opt => `
        <button type="button" class="core-card legendary" data-mastery="${opt.id}">
          <span class="core-ico">${opt.icon}</span>
          <strong>${opt.name}</strong>
          <p>${opt.desc}</p>
        </button>
      `).join("");
      $("mastery-choices").querySelectorAll("[data-mastery]").forEach(btn => {
        btn.onclick = () => {
          G.applyMastery(run, item.unitId, btn.dataset.mastery);
          SFX.evolve();
          $("mastery-dialog").close();
          save();
          renderAll();
          checkPendingModals();
        };
      });
      if (!$("mastery-dialog").open) $("mastery-dialog").showModal();
    }

    function openEliteWheelDialog() {
      const tokens = run.eliteWheelTokens || 0;
      $("elite-result-box").textContent = tokens > 0
        ? `你拥有 ${tokens} 次免费高级轮盘机会！点击下方按钮抽取蓝/紫/金高费英雄！`
        : "完成支线挑战任务或在秘宝商店购买高级轮盘券即可获得抽取机会！";
      $("btn-elite-spin").disabled = tokens <= 0;
      $("btn-elite-spin").textContent = tokens > 0 ? `🎰 免费转动高级轮盘 (×${tokens})` : "暂无次数";
      if (!$("elite-wheel-dialog").open) $("elite-wheel-dialog").showModal();
    }

    function renderHub() {
      if (!Meta) return;
      const meta = Meta.loadMeta();
      $("hub-crystals").textContent = meta.crystals || 0;

      // 1. Difficulty selector
      $("hub-diff-grid").innerHTML = Meta.DIFFICULTIES.map(d => {
        const unlocked = Meta.isDifficultyUnlocked(meta, d.id);
        const active = meta.selectedDifficulty === d.id;
        return `<button type="button" class="hub-card${active ? " active" : ""}${unlocked ? "" : " locked"}" data-hub-diff="${d.id}"${unlocked ? "" : " disabled"}>
          <div class="hub-card-head"><strong>${d.name}</strong><span>${unlocked ? `${d.wavesPerChapter} 波/章` : "🔒 未解锁"}</span></div>
          <p>${d.desc}</p>
        </button>`;
      }).join("");

      // 2. Chapter selector
      const diffId = meta.selectedDifficulty || "easy";
      $("hub-chapter-grid").innerHTML = G.CHAPTERS.map(ch => {
        const unlocked = Meta.isChapterUnlocked(meta, diffId, ch.id);
        const active = meta.selectedChapter === ch.id;
        return `<button type="button" class="hub-card${active ? " active" : ""}${unlocked ? "" : " locked"}" data-hub-ch="${ch.id}"${unlocked ? "" : " disabled"}>
          <div class="hub-card-head"><strong>第 ${ch.id} 章 · ${ch.name}</strong><span>${unlocked ? "已解锁" : "🔒 通关上一章解锁"}</span></div>
          <p>关底 Boss：${ch.bossName}</p>
        </button>`;
      }).join("");

      // 3. Interactive Star / Radial Tech Tree (SVG constellation lines + positioned nodes!)
      const nodes = Object.values(Meta.META_UPGRADES);
      if (!selectedMetaNode || !Meta.META_UPGRADES[selectedMetaNode]) selectedMetaNode = "star_core";

      const linesSvg = nodes.flatMap(n =>
        (n.requires || []).map(req => {
          const parent = Meta.META_UPGRADES[req.id];
          if (!parent) return "";
          const met = (meta.upgrades[req.id] || 0) >= req.lv;
          const childBought = (meta.upgrades[n.id] || 0) > 0;
          const stroke = childBought ? "#ffd86b" : met ? "#5cc8ff" : "#34415e";
          const dash = met ? "" : ' stroke-dasharray="3 3"';
          return `<line x1="${parent.x}" y1="${parent.y}" x2="${n.x}" y2="${n.y}" stroke="${stroke}" stroke-width="${childBought ? 1.4 : 0.9}"${dash} />`;
        })
      ).join("");

      const branchLabels = `
        <span class="star-arm-lbl" style="left:50%;top:2%">北·经济</span>
        <span class="star-arm-lbl" style="left:94%;top:50%">东·编制</span>
        <span class="star-arm-lbl" style="left:50%;top:97%">南·轮盘</span>
        <span class="star-arm-lbl" style="left:6%;top:50%">西·核心</span>`;

      const nodeBtns = nodes.map(up => {
        const lv = meta.upgrades[up.id] || 0;
        const unlocked = Meta.isUpgradeUnlocked(meta, up.id);
        const maxed = lv >= up.maxLevel;
        const active = selectedMetaNode === up.id;
        const cls = [
          "star-node",
          up.branch === "center" ? "center-node" : "",
          active ? "selected" : "",
          maxed ? "maxed" : lv > 0 ? "invested" : unlocked ? "unlockable" : "locked"
        ].filter(Boolean).join(" ");
        return `<button type="button" class="${cls}" data-star-node="${up.id}" style="left:${up.x}%;top:${up.y}%" title="${up.name} Lv.${lv}/${up.maxLevel}">
          <span class="sn-ico">${unlocked ? up.icon : "🔒"}</span>
          <span class="sn-lv">${lv}/${up.maxLevel}</span>
        </button>`;
      }).join("");

      $("hub-upgrades-grid").innerHTML = `
        <svg class="star-tree-svg" viewBox="0 0 100 100" preserveAspectRatio="none">${linesSvg}</svg>
        ${branchLabels}
        ${nodeBtns}`;

      // Render selected node inspector & upgrade button
      const cur = Meta.META_UPGRADES[selectedMetaNode];
      const curLv = meta.upgrades[cur.id] || 0;
      const curUnlocked = Meta.isUpgradeUnlocked(meta, cur.id);
      const curCost = Meta.getUpgradeCost(meta, cur.id);
      const reqText = Meta.getUpgradeReqText(meta, cur.id);
      const canBuy = curUnlocked && curCost !== null && meta.crystals >= curCost;
      if ($("star-tree-inspector")) {
        $("star-tree-inspector").innerHTML = `
          <div class="sti-info">
            <strong>${cur.icon} ${cur.name} <span class="gold-txt">Lv.${curLv}/${cur.maxLevel}</span></strong>
            <p>${cur.desc(curLv)}</p>
            ${reqText ? `<p class="sti-req">🔒 ${reqText}</p>` : ""}
          </div>
          <button type="button" class="secondary-btn" data-hub-up="${cur.id}"${canBuy ? "" : " disabled"}>
            ${!curUnlocked ? "前置未满" : curCost === null ? "已满级" : `升级 · ${curCost}💎`}
          </button>`;
      }
    }

    function openHub() {
      if (busy) return;
      renderHub();
      $("hub-view").hidden = false;
      $("game-view").hidden = true;
      if (SFX.setBgmMood) SFX.setBgmMood("hub");
    }

    function closeHub() {
      $("hub-view").hidden = true;
      $("game-view").hidden = false;
      if (SFX.setBgmMood) SFX.setBgmMood("prep");
      arena.resize();
      renderAll();
    }

    $("hub-diff-grid").addEventListener("click", e => {
      const btn = e.target.closest("[data-hub-diff]");
      if (!btn || btn.disabled) return;
      const meta = Meta.loadMeta();
      meta.selectedDifficulty = btn.dataset.hubDiff;
      if (!Meta.isChapterUnlocked(meta, meta.selectedDifficulty, meta.selectedChapter)) {
        meta.selectedChapter = 1;
      }
      Meta.saveMeta(meta);
      renderHub();
    });
    $("hub-chapter-grid").addEventListener("click", e => {
      const btn = e.target.closest("[data-hub-ch]");
      if (!btn || btn.disabled) return;
      const meta = Meta.loadMeta();
      meta.selectedChapter = Number(btn.dataset.hubCh);
      Meta.saveMeta(meta);
      renderHub();
    });
    $("hub-upgrades-grid").addEventListener("click", e => {
      const nodeBtn = e.target.closest("[data-star-node]");
      if (nodeBtn) {
        selectedMetaNode = nodeBtn.dataset.starNode;
        SFX.lock();
        renderHub();
      }
    });
    if ($("star-tree-inspector")) {
      $("star-tree-inspector").addEventListener("click", e => {
        const btn = e.target.closest("[data-hub-up]");
        if (!btn || btn.disabled) return;
        const meta = Meta.loadMeta();
        if (Meta.buyMetaUpgrade(meta, btn.dataset.hubUp)) {
          SFX.tierUp();
          renderHub();
        }
      });
    }

  $("btn-speed").addEventListener("click", () => {
    speedMult = speedMult === 1 ? 2 : 1;
    arena.setSpeed(speedMult);
    $("btn-speed").textContent = `${speedMult}×`;
    $("btn-speed").classList.toggle("active", speedMult === 2);
    if (globalThis.NativeBridge) globalThis.NativeBridge.haptic("button_tap", 0.65);
  });

  function syncMenuAudioToggles() {
    const muteBtn = $("btn-mute");
    if (muteBtn) {
      const m = SFX.isMuted();
      muteBtn.innerHTML = `${m ? Art.UI_ICONS.soundOff : Art.UI_ICONS.soundOn}<span>${m ? "音效：关" : "音效：开"}</span>`;
      muteBtn.classList.toggle("off", m);
    }
    const bgmBtn = $("btn-bgm");
    if (bgmBtn && SFX.isBgmMuted) {
      const bm = SFX.isBgmMuted();
      bgmBtn.textContent = bm ? "🔇 音乐：关" : "🎵 音乐：开";
      bgmBtn.classList.toggle("off", bm);
    }
    const hapBtn = $("btn-haptics");
    if (hapBtn && globalThis.NativeBridge) {
      const on = globalThis.NativeBridge.isHapticsEnabled();
      hapBtn.textContent = on ? "📳 震动：开" : "📴 震动：关";
      hapBtn.classList.toggle("off", !on);
    }
  }
  syncMenuAudioToggles();

  $("btn-mute").addEventListener("click", () => {
    SFX.toggleMute();
    syncMenuAudioToggles();
  });

  if ($("btn-bgm")) {
    $("btn-bgm").addEventListener("click", () => {
      if (SFX.toggleBgm) SFX.toggleBgm();
      syncMenuAudioToggles();
    });
  }

  if ($("btn-haptics")) {
    $("btn-haptics").addEventListener("click", () => {
      if (globalThis.NativeBridge) globalThis.NativeBridge.toggleHaptics();
      syncMenuAudioToggles();
    });
  }

  if ($("btn-open-menu") && $("menu-dialog")) {
    $("btn-open-menu").addEventListener("click", () => {
      if (globalThis.NativeBridge) globalThis.NativeBridge.haptic("button_tap", 0.65);
      syncMenuAudioToggles();
      if (!$("menu-dialog").open) $("menu-dialog").showModal();
    });
    $("menu-dialog").addEventListener("click", e => {
      if (e.target === $("menu-dialog")) {
        $("menu-dialog").close();
        return;
      }
      if (e.target.closest(".menu-action-btn")) {
        $("menu-dialog").close();
      }
    });
  }

  if ($("tier-badge") && $("rarity-odds-strip")) {
    $("tier-badge").addEventListener("click", () => {
      const strip = $("rarity-odds-strip");
      strip.hidden = !strip.hidden;
      if (globalThis.NativeBridge) globalThis.NativeBridge.haptic("button_tap", 0.55);
    });
  }

  if ($("top-more-menu")) {
    $("top-more-menu").addEventListener("click", e => {
      if (e.target.closest("button")) $("top-more-menu").open = false;
    });
    document.addEventListener("click", e => {
      const m = $("top-more-menu");
      if (m && m.open && !m.contains(e.target)) m.open = false;
    });
  }

  $("reel-grid").addEventListener("click", e => {
    const btn = e.target.closest("[data-cell]");
    if (btn && !btn.disabled) handleCellClick(Number(btn.dataset.cell));
  });

  const onRosterClick = e => {
    if (suppressNextRosterClick) return;
    const sealed = e.target.closest("[data-unlock]");
    if (sealed && !sealed.disabled && !busy && !run.outcome) {
      if (G.unlockSlot(run, sealed.dataset.unlock, Number(sealed.dataset.index))) {
        if (globalThis.NativeBridge) globalThis.NativeBridge.haptic("absorb_evolve", 0.85);
        save();
        renderAll();
        setTicker("阵位解锁", "新席位已可部署单位。", "win");
      }
      return;
    }
    const btn = e.target.closest("[data-area]");
    if (btn && !btn.disabled) handleSlotClick(btn.dataset.area, Number(btn.dataset.index));
  };
  $("formation-grid").addEventListener("click", onRosterClick);
  $("bench-grid").addEventListener("click", onRosterClick);
  if ($("overflow-grid")) $("overflow-grid").addEventListener("click", onRosterClick);

  document.querySelectorAll("[data-close]").forEach(btn => {
    btn.addEventListener("click", () => $(btn.dataset.close).close());
  });

  $("shop-items").addEventListener("click", event => {
    const button = event.target.closest("[data-buy], [data-shop-slot]");
    if (!button || button.disabled) return;
    const card = button.closest(".shop-card");
    const options = Object.fromEntries([...card.querySelectorAll("[data-option]")].map(select =>
      [select.dataset.option, select.dataset.option === "index" ? Number(select.value) : select.value]));
    const bought = button.dataset.shopSlot ? G.unlockSlot(run, button.dataset.shopSlot)
      : G.shopPurchase(run, button.dataset.buy, options);
    if (bought) {
      SFX.coin();
      save();
      renderAll();
      openShopDialog();
    }
    $("shop-notice").textContent = bought ? "购买成功。" : "当前选择无法购买，请检查目标和水晶余额。";
  });
  $("btn-shop-refresh").addEventListener("click", () => {
    if (!G.refreshShop(run)) return;
    save();
    renderAll();
    openShopDialog();
    $("shop-notice").textContent = "已刷新商品。";
  });
  $("btn-shop-continue").addEventListener("click", closeShop);
  $("shop-dialog").addEventListener("cancel", event => {
    event.preventDefault();
    closeShop();
  });

  ["core-dialog", "evo-dialog", "chapter-dialog", "encounter-dialog"].forEach(id => {
    $(id).addEventListener("cancel", e => e.preventDefault());
  });

  window.addEventListener("keydown", e => {
    if (document.querySelector("dialog[open]")) return;
    if (e.code === "Space") {
      e.preventDefault();
      handleSpin();
    } else if (e.code === "Enter") {
      e.preventDefault();
      handleFight();
    }
  });

  if (run.outcome === "victory" && run.wave === G.WAVES.length) save();
  renderAll();
  checkPendingModals();
})();
