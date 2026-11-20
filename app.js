(() => {
  "use strict";

  const G = globalThis.Slotbound;
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

  // Visual order for 2-col x 3-row formation grid: left=back(3,4,5), right=front(0,1,2)
  const FORMATION_ORDER = [3, 0, 4, 1, 5, 2];

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

  const arena = new globalThis.BattleArena($("battle-canvas"));

  // Hydrate static metallic UI icons
  $("brand-crest").innerHTML = Art.UI_ICONS.crest;
  $("ico-gold").innerHTML = Art.UI_ICONS.coin;
  $("ico-hp").innerHTML = Art.UI_ICONS.heart;
  $("ico-power").innerHTML = Art.UI_ICONS.sword;
  $("ico-rig").innerHTML = Art.UI_ICONS.rig;
  $("ico-fight").innerHTML = Art.UI_ICONS.sword;
  $("ico-swap").innerHTML = Art.UI_ICONS.swap;
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
    $("wave-badge").style.color = chapter.themeColor;
    $("wave-name").textContent = waveDef.name;
    $("hud-gold").textContent = run.gold;
    $("hud-crystals").textContent = run.crystals;
    $("hud-hp").textContent = `${run.hp} / ${run.maxHp}`;
    $("hud-power").textContent = G.getTotalPower(run);

    $("wave-dots").innerHTML = chapter.waves.map((w, index) => {
      const cls = [
        "wave-dot",
        w.wave < run.wave ? "past" : w.wave === run.wave ? "current" : "",
        w.boss ? "boss" : ""
      ].filter(Boolean).join(" ");
      return `<span class="${cls}" title="本章第 ${index + 1} 波 · ${w.name}"></span>`;
    }).join("");

    const bossPill = $("boss-pill");
    const threat = waveDef.threat;
    const threatBadge = $("enemy-threat");
    threatBadge.hidden = !threat?.label;
    if (threat?.label) {
      const hp = Math.round((threat.hpMult - 1) * 100);
      const atk = Math.round((threat.atkMult - 1) * 100);
      const shield = Math.round(threat.shieldPierce * 100);
      threatBadge.textContent = `敌军升阶 · ${threat.label} · 破盾 +${shield}%`;
      threatBadge.title = `受出战英雄星级影响：敌军生命 +${hp}%，攻击 +${atk}%，对护盾伤害 +${shield}%`;
    }
    if (waveDef.boss) {
      bossPill.hidden = false;
      bossPill.innerHTML = `${Art.UI_ICONS.boss}<span>${waveDef.bossTitle}</span>`;
      $("enemy-intel").textContent = waveDef.bossSkill;
    } else {
      bossPill.hidden = true;
      const totalHp = waveDef.phases.flatMap(p => p.enemies).reduce((s, e) => s + e.hp, 0);
      $("enemy-intel").textContent = `来袭 ${waveDef.phases.length} 批敌军 · 总生命 ${totalHp} · 赏金 ${waveDef.reward} 金币`;
    }

    $("enemy-warning").hidden = !waveDef.enemies.some(enemy => enemy.tactic === "backline_diver");
    if (!busy) renderReinforcements(0, waveDef.phases.length, 0, waveDef.phases.at(-1).delay, 0);

    const canFight = !busy && !run.outcome && run.field.some(Boolean);
    $("btn-fight").disabled = !canFight;
    $("btn-fight").lastElementChild.textContent = arena.mode === "fighting" ? "激战中…" : "开战迎敌";
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
    const tierBtn = $("btn-tier-up");
    if (tier.upgradeCost) {
      tierBtn.textContent = `↑ 升阶 ${tier.upgradeCost}G`;
      tierBtn.disabled = busy || !!run.outcome || run.gold < tier.upgradeCost;
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
      ? "狂热就绪！下一转免费 + 中心百搭 + 2× 收益"
      : `命运狂热槽 ${feverPct}%（满额必爆双倍百搭）`;

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

    // Top incoming symbol preview + bottom Nudge buttons (with glowing "可连线！" highlight!)
    const preview = run.nudgePreview || ["knight", "archer", "mage"];
    const nudgeCost = G.getNudgeCost ? G.getNudgeCost(run) : ((run.nudgesLeft || 0) > 0 ? 0 : 10);
    const canNudge = !busy && !run.outcome && (nudgeCost === 0 || run.gold >= nudgeCost);
    const winCols = (!busy && !run.outcome && G.getWinningNudgeCols) ? G.getWinningNudgeCols(run) : [];

    $("nudge-preview-row").innerHTML = [0, 1, 2].map(col => {
      const inc = preview[col] || "knight";
      const sym = G.SYMBOLS[inc] || G.SYMBOLS.knight;
      const isHot = winCols.includes(col);
      return `<div class="preview-chip${isHot ? " hot" : ""}" style="--sym-color:${sym.color}" title="下调第 ${col + 1} 列将从顶部顶入【${sym.name}】">
        <span>↓</span>
        ${Art.renderPortraitImg(inc, sym.short, "")}
        <span>${sym.short}</span>
      </div>`;
    }).join("");

    $("nudge-row").innerHTML = [0, 1, 2].map(col => {
      const inc = preview[col] || "knight";
      const isHot = winCols.includes(col);
      const costTag = nudgeCost === 0 ? "免费" : `${nudgeCost}G`;
      return `<button type="button" class="nudge-btn${isHot ? " hot" : ""}" data-nudge="${col}" title="将第 ${col + 1} 列往下调 1 格，顶入【${G.SYMBOLS[inc].name}】（${nudgeCost === 0 ? `免费剩余 ${run.nudgesLeft} 次` : `花费 ${nudgeCost} 金币`}）"${canNudge ? "" : " disabled"}>
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
    const disabledSpin = busy || !!run.outcome || run.gold < totalCost;
    $("btn-spin").disabled = disabledSpin;
    $("mech-lever").disabled = disabledSpin;

    if (run.feverActive) {
      $("spin-cost-label").textContent = totalCost > 0 ? `狂热 + 锁 ${totalCost}G` : "狂热免费！";
    } else if (run.freeSpins > 0 && run.locked.length === 0) {
      $("spin-cost-label").textContent = `免费 ×${run.freeSpins}`;
    } else if (run.freeSpins > 0) {
      $("spin-cost-label").textContent = `免费 + 锁 ${totalCost}G`;
    } else {
      $("spin-cost-label").textContent = `${totalCost} 金币`;
    }
    $("lock-status").textContent = `锁格 ${run.locked.length} / ${maxLocks}（${lockCost}G/格） · 微调 ${run.nudgesLeft || 0}/1`;
    $("btn-rig").disabled = busy || !!run.outcome;
  }

  function renderCores() {
    $("core-count").textContent = `${run.cores.length} / ${run.unlockedCoreSlots}`;
    const levels = run.coreLevels || {};
    const slots = [];
    for (let i = 0; i < 6; i += 1) {
      const id = run.cores[i];
      if (!id) {
        const label = i < run.unlockedCoreSlots ? "核心槽位" : "封印槽位";
        slots.push(`<div class="core-slot empty">${label}</div>`);
      } else {
        const core = G.CORES.find(c => c.id === id);
        const lv = levels[id] || 1;
        slots.push(`<div class="core-slot ${core.rarity}" title="${core.name} Lv.${lv}（${RARITY_LABEL[core.rarity]}）：${core.desc}">
          <span class="c-medallion">${core.icon}</span>
          <span class="c-name">${core.name}${lv > 1 ? ` Lv.${lv}` : ""}</span>
        </div>`);
      }
    }
    $("cores-grid").innerHTML = slots.join("");
  }

  function renderSynergies() {
    const syns = G.getActiveSynergies(run);
    $("synergy-bar").innerHTML = syns.map(s => {
      const sym = G.SYMBOLS[s.type];
      return `<div class="syn-pill${s.active ? " active" : ""}" style="--syn-color:${sym.color}" title="${s.desc}">
        ${Art.renderPortraitImg(s.type, sym.short, "syn-thumb")}
        <span>${s.name}</span>
        <span class="syn-cnt">${s.count}/${s.req}${s.active ? " ✓" : ""}</span>
      </div>`;
    }).join("");
    $("faction-bar").innerHTML = G.getFactionSynergies(run).map(flow => {
      const title = `${flow.types.map(type => G.SYMBOLS[type].short).join(" / ")}${flow.cores ? " + 经济核心" : ""} · ${flow.tier === 4 ? flow.enhanced : flow.desc}`;
      return `<div class="syn-pill${flow.tier ? " active" : ""}" style="--syn-color:${flow.color}" title="${title}">
        <span>${flow.name}</span><span class="syn-cnt">${flow.tier ? `${flow.tier} 阶` : `${flow.count} 人`}</span>
      </div>`;
    }).join("");
  }

  function renderUnitCard(unit, area, index, emptyLabel) {
    const isSelected = selectedSlot && selectedSlot.area === area && selectedSlot.index === index;
    const selectedUnit = selectedSlot
      ? (selectedSlot.area === "field" ? run.field[selectedSlot.index] : run.bench[selectedSlot.index])
      : null;
    const isAbsorbCandidate = armyMode === "absorb" && selectedUnit && unit && unit.id !== selectedUnit.id;

    if (!G.isSlotOpen(run, area, index)) {
      const cost = G.slotCost(run, area);
      return `<button type="button" class="unit-slot sealed" data-unlock="${area}" data-index="${index}"
        ${busy || run.outcome || run.crystals < cost ? "disabled" : ""}>
        ${Art.UI_ICONS.lock}<span>封印${area === "field" ? "阵位" : "备战位"} · ${cost} 水晶</span>
      </button>`;
    }
    if (!unit) {
      return `<button type="button" class="unit-slot empty${isSelected ? " selected" : ""}" data-area="${area}" data-index="${index}"${busy || run.outcome ? " disabled" : ""}>${emptyLabel}</button>`;
    }

    const sym = G.SYMBOLS[unit.type];
    const st = G.getUnitStats(unit, run);
    const displayName = unit.evolution ? sym.evolutions[unit.evolution].name : sym.name;
    const cls = [
      "unit-slot",
      isSelected ? "selected" : "",
      isAbsorbCandidate ? "absorb-candidate" : "",
      unit.lucky ? "lucky" : "",
      unit.evolution ? "evolved" : ""
    ].filter(Boolean).join(" ");

    const curFloor = G.STAR_THRESHOLDS ? G.STAR_THRESHOLDS[st.level - 1] : 0;
    const nextReq = G.nextStarXp ? G.nextStarXp(st.level) : null;
    const xpPct = nextReq !== null
      ? Math.min(100, Math.max(0, ((unit.xp - curFloor) / Math.max(1, nextReq - curFloor)) * 100))
      : 100;

    return `<button type="button" class="${cls}" data-area="${area}" data-index="${index}" style="--u-color:${sym.color}"${busy || run.outcome ? " disabled" : ""}>
      <div class="u-portrait">
        ${Art.renderPortraitImg(unit.type, displayName, "unit-sprite")}
        <span class="u-lvl-badge">${"★".repeat(st.level)}</span>
      </div>
      <div class="u-body">
        <div class="u-top">
          <span class="u-name">${displayName}</span>
          ${unit.lucky ? '<span class="u-tag">幸运</span>' : ""}
          ${unit.evolution ? `<span class="u-tag evo-t">${sym.evolutions[unit.evolution].tag}</span>` : ""}
        </div>
        <div class="u-xp-bar" title="经验 ${unit.xp}"><i style="width:${xpPct}%"></i></div>
        <div class="u-stats">
          <span class="u-hp">${Art.UI_ICONS.heart}${st.hp}</span>
          <span class="u-atk">${Art.UI_ICONS.sword}${st.atk}</span>
        </div>
      </div>
    </button>`;
  }

  function renderArmy() {
    $("formation-grid").innerHTML = FORMATION_ORDER.map(idx => {
      const label = idx < 3 ? "+ 前排" : "+ 后排";
      return renderUnitCard(run.field[idx], "field", idx, label);
    }).join("");

    $("bench-grid").innerHTML = run.bench.map((u, idx) =>
      renderUnitCard(u, "bench", idx, "+ 备战位")
    ).join("");

    const benchUsed = run.bench.filter(Boolean).length;
    $("bench-count").textContent = `${benchUsed} / ${run.unlockedBenchSlots}`;

    $("btn-mode-swap").classList.toggle("active", armyMode === "swap");
    $("btn-mode-absorb").classList.toggle("active", armyMode === "absorb");
    $("army-tip").textContent = armyMode === "absorb"
      ? "吞噬模式：先点【强化目标】，再点【素材单位】（同职业双倍经验，2 级解锁分支转职！）"
      : "换位模式：点选任意单位，再点另一格即可快速调整前后排或上下阵";

    renderInspector();
  }

  function renderInspector() {
    const el = $("inspector");
    if (!selectedSlot) {
      el.innerHTML = '<div class="inspector-empty">点选任意军团单位查看详细属性、技能与吞噬强化选项。</div>';
      return;
    }
    const unit = selectedSlot.area === "field" ? run.field[selectedSlot.index] : run.bench[selectedSlot.index];
    if (!unit) {
      el.innerHTML = '<div class="inspector-empty">已选中空位，再点击任意单位即可将其调动到此位置。</div>';
      return;
    }

    const sym = G.SYMBOLS[unit.type];
    const st = G.getUnitStats(unit, run);
    const evo = unit.evolution ? sym.evolutions[unit.evolution] : null;
    const sellVal = 15 + unit.xp * 10;
    const nextReq = G.nextStarXp ? G.nextStarXp(st.level) : null;
    const nextNeed = nextReq !== null
      ? `距 ${st.level + 1} 星${st.level === 1 ? "（转职）" : ""}还差 ${Math.max(0, nextReq - unit.xp)} 经验`
      : "已达 5 星神话满星";

    el.innerHTML = `<div class="ins-left">
      <div class="ins-avatar" style="--u-color:${sym.color}">${Art.renderPortraitImg(unit.type, sym.name, "ins-sprite")}</div>
      <div class="ins-info">
        <div class="ins-title">${evo ? evo.name : sym.name} · <span class="gold-txt">${"★".repeat(st.level)}</span> ${unit.lucky ? '<span class="u-tag">幸运强化 +20%</span>' : ""}</div>
        <div class="ins-desc">生命 ${st.hp} · 攻击 ${st.atk} · 暴击 ${Math.round(st.crit * 100)}% · 攻速 ${(1 / st.atkCd).toFixed(2)}/s · ${nextNeed}</div>
        <div class="ins-desc">${evo ? `【${evo.tag}】${evo.desc}` : sym.skillDesc}</div>
      </div>
    </div>
    <div class="ins-actions">
      <button type="button" class="secondary-btn" id="btn-ins-absorb">${armyMode === "absorb" ? "点选素材喂养" : "吞噬强化"}</button>
      <button type="button" class="danger-btn" id="btn-ins-sell">出售 +${sellVal}G</button>
    </div>`;

    $("btn-ins-absorb").onclick = () => {
      armyMode = "absorb";
      renderArmy();
    };
    $("btn-ins-sell").onclick = () => {
      const gained = G.sellUnit(run, unit.id);
      if (gained > 0) {
        SFX.coin();
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
          if (anticipationCol === 2) SFX.anticipation(anticStep++);
          else SFX.tick();
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
        showToast(
          result.hits.some(h => h.superJackpot)
            ? "三王大满贯 SUPER JACKPOT!"
            : result.isFever
              ? `狂热双倍大爆发（${result.hits.length} 线）！`
              : `${result.hits.length} 重连线大爆发！`
        );
      } else if (result.hits.every(h => h.symbol === "gold")) {
        SFX.coin();
        showToast("命运金币连线！+55 金币 & +1 免费转");
      } else {
        SFX.match();
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
    const clickedUnit = area === "field" ? run.field[index] : run.bench[index];

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

    const srcUnit = selectedSlot.area === "field" ? run.field[selectedSlot.index] : run.bench[selectedSlot.index];

    if (armyMode === "absorb" && srcUnit && clickedUnit) {
      const res = G.absorbUnit(run, srcUnit.id, clickedUnit.id);
      if (res?.error) {
        SFX.lock();
        showAlertPopup("无法吞噬", res.error);
        setTicker("无法吞噬", res.error);
        return;
      }
      if (res) {
        G.addLog(run, "军团", `${G.SYMBOLS[res.target.type].name} 吞噬强化 +${res.xpGain} 经验（${res.inherited}）`);
        SFX.absorb();
        setTicker(
          "吞噬进化成功！",
          `${G.SYMBOLS[res.target.type].name} 获得 +${res.xpGain} 经验（${res.inherited}）`,
          "win"
        );
        save();
        renderAll();
        checkPendingModals();
      }
      return;
    }

    if (G.swapSlots(run, selectedSlot.area, selectedSlot.index, area, index)) {
      SFX.lock();
      selectedSlot = null;
      save();
      renderAll();
    }
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
    if (!loc) {
      run.pendingEvolutions.shift();
      checkPendingModals();
      return;
    }
    const sym = G.SYMBOLS[loc.unit.type];
    $("evo-hero-preview").innerHTML = Art.renderPortraitImg(loc.unit.type, sym.name, "evo-sprite");
    $("evo-title").textContent = `${sym.name} · 进阶转职`;
    $("evo-desc").textContent = "该单位已升至 2 级，请选择一项永久分支转职方向：";
    $("evo-choices").innerHTML = Object.values(sym.evolutions).map(evo => `
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

  $("btn-mode-swap").addEventListener("click", () => {
    armyMode = "swap";
    renderArmy();
  });
  $("btn-mode-absorb").addEventListener("click", () => {
    armyMode = "absorb";
    renderArmy();
  });

  $("btn-speed").addEventListener("click", () => {
    speedMult = speedMult === 1 ? 2 : 1;
    arena.setSpeed(speedMult);
    $("btn-speed").textContent = `${speedMult}×倍速`;
    $("btn-speed").classList.toggle("active", speedMult === 2);
  });

  $("btn-mute").addEventListener("click", () => {
    const m = SFX.toggleMute();
    $("btn-mute").innerHTML = m ? Art.UI_ICONS.soundOff : Art.UI_ICONS.soundOn;
  });

  $("reel-grid").addEventListener("click", e => {
    const btn = e.target.closest("[data-cell]");
    if (btn && !btn.disabled) handleCellClick(Number(btn.dataset.cell));
  });

  const onRosterClick = e => {
    const sealed = e.target.closest("[data-unlock]");
    if (sealed && !sealed.disabled && !busy && !run.outcome) {
      if (G.unlockSlot(run, sealed.dataset.unlock, Number(sealed.dataset.index))) {
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
