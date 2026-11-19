(() => {
  "use strict";

  const G = globalThis.Slotbound;
  const SFX = globalThis.SFX;
  const Art = globalThis.GameArt;
  const $ = id => document.getElementById(id);
  const wait = ms => new Promise(r => setTimeout(r, ms));

  const SAVE_KEY = "slotbound-zh-v2";
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
  let busy = false;
  let spinningCols = [false, false, false];
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
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return G.createRun();
  }

  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(run));
    } catch {
      // ignore
    }
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
    const waveDef = G.WAVES[Math.min(run.wave - 1, G.WAVES.length - 1)];
    $("wave-badge").textContent = `第 ${run.wave} / ${G.WAVES.length} 波`;
    $("wave-name").textContent = waveDef.name;
    $("hud-gold").textContent = run.gold;
    $("hud-hp").textContent = `${run.hp} / ${run.maxHp}`;
    $("hud-power").textContent = G.getTotalPower(run);

    $("wave-dots").innerHTML = G.WAVES.map(w => {
      const cls = [
        "wave-dot",
        w.wave < run.wave ? "past" : w.wave === run.wave ? "current" : "",
        w.boss ? "boss" : ""
      ].filter(Boolean).join(" ");
      return `<span class="${cls}" title="第 ${w.wave} 波：${w.name}"></span>`;
    }).join("");

    const bossPill = $("boss-pill");
    if (waveDef.boss) {
      bossPill.hidden = false;
      bossPill.innerHTML = `${Art.UI_ICONS.boss}<span>${waveDef.bossTitle}</span>`;
      $("enemy-intel").textContent = waveDef.bossSkill;
    } else {
      bossPill.hidden = true;
      const totalHp = waveDef.enemies.reduce((s, e) => s + e.hp, 0);
      $("enemy-intel").textContent = `来袭 ${waveDef.enemies.length} 名敌军 · 总生命 ${totalHp} · 赏金 ${waveDef.reward} 金币`;
    }

    const canFight = !busy && !run.outcome && run.field.some(Boolean);
    $("btn-fight").disabled = !canFight;
    $("btn-fight").lastElementChild.textContent = arena.mode === "fighting" ? "激战中…" : "开战迎敌";
  }

  function renderReels() {
    const matchedSet = new Set();
    if (!spinningCols.some(Boolean)) {
      for (const line of run.lastLines) {
        for (const c of line.cells) matchedSet.add(c);
      }
    }

    $("reel-grid").innerHTML = displayBoard.map((symId, idx) => {
      const sym = G.SYMBOLS[symId] || G.SYMBOLS.knight;
      const col = idx % 3;
      const isSpin = spinningCols[col] && !run.locked.includes(idx);
      const isLocked = run.locked.includes(idx);
      const isMatched = !isSpin && matchedSet.has(idx);
      const cls = [
        "reel-cell",
        isSpin ? "spinning" : "",
        isLocked ? "locked" : "",
        isMatched ? "matched" : ""
      ].filter(Boolean).join(" ");
      return `<button type="button" class="${cls}" data-cell="${idx}" style="--sym-color:${sym.color}" title="${sym.name}：${sym.skillDesc}"${busy || run.outcome ? " disabled" : ""}>
        ${isLocked ? `<span class="lock-badge">${Art.UI_ICONS.lock}</span>` : ""}
        <span class="cell-art">${Art.renderPortraitImg(symId, sym.name, "reel-sprite")}</span>
        <span class="cell-name">${sym.short}</span>
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

    if (run.freeSpins > 0 && run.locked.length === 0) {
      $("spin-cost-label").textContent = `免费 ×${run.freeSpins}`;
    } else if (run.freeSpins > 0) {
      $("spin-cost-label").textContent = `免费 + 锁 ${totalCost}G`;
    } else {
      $("spin-cost-label").textContent = `${totalCost} 金币`;
    }
    $("lock-status").textContent = `锁格 ${run.locked.length} / ${maxLocks}（${lockCost} 金币/格）`;
    $("btn-rig").disabled = busy || !!run.outcome;
  }

  function renderCores() {
    $("core-count").textContent = `${run.cores.length} / 6`;
    const slots = [];
    for (let i = 0; i < 6; i += 1) {
      const id = run.cores[i];
      if (!id) {
        slots.push('<div class="core-slot empty">核心槽位</div>');
      } else {
        const core = G.CORES.find(c => c.id === id);
        slots.push(`<div class="core-slot ${core.rarity}" title="${core.name}（${RARITY_LABEL[core.rarity]}）：${core.desc}">
          <span class="c-medallion">${core.icon}</span>
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
      return `<div class="syn-pill${s.active ? " active" : ""}" style="--syn-color:${sym.color}" title="${s.desc}">
        ${Art.renderPortraitImg(s.type, sym.short, "syn-thumb")}
        <span>${s.name}</span>
        <span class="syn-cnt">${s.count}/${s.req}${s.active ? " ✓" : ""}</span>
      </div>`;
    }).join("");
  }

  function renderUnitCard(unit, area, index, emptyLabel) {
    const isSelected = selectedSlot && selectedSlot.area === area && selectedSlot.index === index;
    const selectedUnit = selectedSlot
      ? (selectedSlot.area === "field" ? run.field[selectedSlot.index] : run.bench[selectedSlot.index])
      : null;
    const isAbsorbCandidate = armyMode === "absorb" && selectedUnit && unit && unit.id !== selectedUnit.id;

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

    const xpPct = st.level === 1 ? Math.min(100, (unit.xp / 2) * 100)
      : st.level === 2 ? Math.min(100, ((unit.xp - 2) / 3) * 100) : 100;

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
    $("bench-count").textContent = `${benchUsed} / ${G.BENCH_SLOTS}`;

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
    const nextNeed = st.level === 1 ? `距 2 级转职还差 ${Math.max(0, 2 - unit.xp)} 经验`
      : st.level === 2 ? `距 3 级传说还差 ${Math.max(0, 5 - unit.xp)} 经验`
      : "已达满星传说";

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
        setTicker("出售单位", `获得 +${gained} 金币，可用于继续转动轮盘或调校概率。`);
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
    const lockedBefore = [...run.locked];
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
    setTicker("轮盘高速运转中…", "祈祷连线与百搭降临！");
    renderTopbar();
    renderReels();

    const stopTimes = [300, 520, 760];
    const start = performance.now();
    let lastTick = 0;

    while (spinningCols.some(Boolean)) {
      const elapsed = performance.now() - start;
      for (let c = 0; c < 3; c += 1) {
        if (spinningCols[c] && elapsed >= stopTimes[c]) {
          spinningCols[c] = false;
          for (let r = 0; r < 3; r += 1) {
            displayBoard[r * 3 + c] = result.board[r * 3 + c];
          }
          SFX.reelStop(c);
        }
      }

      if (elapsed - lastTick >= 65) {
        lastTick = elapsed;
        for (let i = 0; i < 9; i += 1) {
          const c = i % 3;
          if (spinningCols[c] && !lockedBefore.includes(i)) {
            displayBoard[i] = G.SYMBOL_IDS[Math.floor(Math.random() * G.SYMBOL_IDS.length)];
          }
        }
        if (spinningCols.some(Boolean)) SFX.tick();
        renderReels();
      }
      await wait(24);
    }

    displayBoard = [...result.board];
    busy = false;
    save();
    renderAll();

    if (result.hits.length === 0) {
      setTicker(
        "本次未连线",
        result.notes.length ? result.notes.join(" · ") : "可点击格面锁定关键符号再转，或直接开战！"
      );
    } else {
      const isBig = result.hits.length >= 2 || result.hits.some(h => h.superJackpot);
      if (isBig) {
        SFX.jackpot();
        showToast(result.hits.some(h => h.superJackpot) ? "三王大满贯 SUPER JACKPOT!" : `${result.hits.length} 重连线大爆发！`);
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
        isBig ? `${result.hits.length} 线连奖大爆发！` : `连线成功（${result.hits.length} 线）`,
        parts.join(" · "),
        isBig ? "jackpot" : "win"
      );
    }

    checkPendingModals();
  }

  function handleCellClick(cellIdx) {
    if (busy || run.outcome) return;
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
      if (res) {
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

    arena.startBattle(run, won => {
      const summary = G.resolveWave(run, won);
      busy = false;
      displayBoard = [...run.board];
      save();
      renderAll();

      if (summary.finished) {
        openEndDialog();
      } else {
        const bonusTxt = summary.interest ? `（含利息 +${summary.interest}）` : "";
        setTicker(
          won ? `第 ${run.wave - 1} 波告捷！` : `防线受损（-${summary.dmg} 耐久）`,
          `获得 +${summary.reward} 金币${bonusTxt}，已刷新 ${run.freeSpins} 次免费转动！`,
          won ? "win" : ""
        );
        checkPendingModals();
      }
    });
  }

  function checkPendingModals() {
    if (run.outcome) {
      openEndDialog();
      return;
    }
    if (run.pendingEvolutions.length > 0) {
      openEvoDialog();
      return;
    }
    if (run.pendingCoreChoices && run.pendingCoreChoices.length > 0) {
      openCoreDialog();
    }
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
    $("core-choices").innerHTML = choices.map(id => {
      const c = G.CORES.find(item => item.id === id);
      return `<button type="button" class="core-card ${c.rarity}" data-core="${c.id}">
        <span class="card-medallion">${c.icon}</span>
        <span class="card-rarity">${RARITY_LABEL[c.rarity]}</span>
        <strong>${c.name}</strong>
        <p>${c.desc}</p>
      </button>`;
    }).join("");

    $("core-choices").querySelectorAll("[data-core]").forEach(btn => {
      btn.onclick = () => {
        G.pickCore(run, btn.dataset.core);
        SFX.evolve();
        $("core-dialog").close();
        save();
        renderAll();
        checkPendingModals();
      };
    });

    if (!$("core-dialog").open) $("core-dialog").showModal();
  }

  function openRigDialog() {
    if (busy || run.outcome) return;
    renderRigList();
    if (!$("rig-dialog").open) $("rig-dialog").showModal();
  }

  function renderRigList() {
    const odds = G.getSymbolOdds(run);
    $("rig-gold-val").textContent = run.gold + " 金币";
    $("rig-list").innerHTML = G.SYMBOL_IDS.map(id => {
      const sym = G.SYMBOLS[id];
      const pct = (odds[id] * 100).toFixed(1);
      const boosts = run.rigBoosts[id] || 0;
      const upCost = 25 + boosts * 15;
      const curW = run.weights[id] ?? sym.baseWeight;
      const canUp = run.gold >= upCost && boosts < 4;
      const canDown = run.gold >= 30 && curW > 4;
      return `<div class="rig-row" style="--sym-color:${sym.color}">
        <div class="rig-sym">${Art.renderPortraitImg(id, sym.name, "rig-thumb")}<span>${sym.name}</span></div>
        <div class="rig-bar-wrap"><div class="rig-bar-fill" style="width:${Math.min(100, odds[id] * 260)}%"></div></div>
        <div class="rig-pct">${pct}%</div>
        <div class="rig-btns">
          <button type="button" class="rig-act up" data-rig-up="${id}"${canUp ? "" : " disabled"}>${boosts >= 4 ? "已满" : `+权 ${upCost}G`}</button>
          <button type="button" class="rig-act down" data-rig-down="${id}"${canDown ? "" : " disabled"}>-权 30G</button>
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

  function openEndDialog() {
    const won = run.outcome === "victory";
    $("end-tag").textContent = won ? "荣耀通关" : "防线失守";
    $("end-title").textContent = won ? "命运由你掌控！" : "厄运吞噬了防线";
    $("end-desc").textContent = won
      ? "你成功击溃了厄运魔龙与全部 10 波敌军，打造出无敌的转运军团！"
      : `你在第 ${run.wave} 波倒下。尝试搭配不同核心与概率调校，下一次必能改命！`;
    $("end-stats").innerHTML = `
      <div class="end-stat"><span>抵达波次</span><strong>${run.wave} / ${G.WAVES.length}</strong></div>
      <div class="end-stat"><span>累计转动</span><strong>${run.totalSpins}</strong></div>
      <div class="end-stat"><span>连线次数</span><strong>${run.totalMatches}</strong></div>
      <div class="end-stat"><span>吞噬进化</span><strong>${run.totalAbsorbs}</strong></div>
    `;
    if (!$("end-dialog").open) $("end-dialog").showModal();
  }

  function restartGame() {
    if (busy) return;
    run = G.createRun();
    displayBoard = [...run.board];
    selectedSlot = null;
    armyMode = "swap";
    save();
    ["core-dialog", "evo-dialog", "rig-dialog", "end-dialog"].forEach(id => {
      if ($(id).open) $(id).close();
    });
    setTicker("新征程开启！", "拉动轮盘召唤军团，记得合理利用免费转动与锁格机制！");
    renderAll();
  }

  $("btn-spin").addEventListener("click", handleSpin);
  $("mech-lever").addEventListener("click", handleSpin);
  $("btn-fight").addEventListener("click", handleFight);
  $("btn-rig").addEventListener("click", openRigDialog);
  $("btn-restart").addEventListener("click", restartGame);
  $("btn-end-restart").addEventListener("click", restartGame);

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
    const btn = e.target.closest("[data-area]");
    if (btn && !btn.disabled) handleSlotClick(btn.dataset.area, Number(btn.dataset.index));
  };
  $("formation-grid").addEventListener("click", onRosterClick);
  $("bench-grid").addEventListener("click", onRosterClick);

  document.querySelectorAll("[data-close]").forEach(btn => {
    btn.addEventListener("click", () => $(btn.dataset.close).close());
  });

  ["core-dialog", "evo-dialog"].forEach(id => {
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

  renderAll();
  checkPendingModals();
})();
