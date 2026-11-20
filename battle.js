(() => {
  "use strict";

  const G = globalThis.Slotbound;
  const CHAPTER_AMBIENCE = {
    ch1: { count: 16, speed: -0.035, drift: 0.009, radius: 1.5 },
    ch2: { count: 20, speed: -0.024, drift: 0.007, radius: 2.6 },
    ch3: { count: 28, speed: 0.052, drift: 0.018, radius: 1.8 },
    ch4: { count: 24, speed: -0.13, drift: 0.011, radius: 1.6 },
    ch5: { count: 28, speed: -0.01, drift: 0.004, radius: 2.2 }
  };

  class BattleArena {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.speed = 1;
      this.mode = "preview"; // preview | fighting | result
      this.allies = [];
      this.enemies = [];
      this.projectiles = [];
      this.beams = [];
      this.rings = [];
      this.particles = [];
      this.texts = [];
      this.shake = 0;
      this.time = 0;
      this.healTick = 0;
      this.run = null;
      this.onFinish = null;
      this.resultBanner = null;
      this._raf = null;
      this._lastTs = 0;

      this.resize();
      window.addEventListener("resize", () => this.resize());
      this._loop = this._loop.bind(this);
      this._raf = requestAnimationFrame(this._loop);
    }

    resize() {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.w = Math.max(320, Math.floor(rect.width));
      this.h = Math.max(220, Math.floor(rect.height));
      this.canvas.width = Math.floor(this.w * dpr);
      this.canvas.height = Math.floor(this.h * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (this.run && this.mode === "preview") {
        this.syncPreview(this.run);
      }
    }

    setSpeed(mult) {
      this.speed = mult;
    }

    _allySlotPos(slotIdx) {
      // 0,1,2 front col (closer to center); 3,4,5 back col
      const isFront = slotIdx < 3;
      const row = slotIdx % 3;
      const x = isFront ? this.w * 0.40 : this.w * 0.24;
      const y = this.h * (0.24 + row * 0.26);
      return { x, y };
    }

    _enemySlotPos(idx, total) {
      const cols = total <= 3 ? 1 : 2;
      const col = idx < Math.ceil(total / cols) ? 0 : 1;
      const perCol = col === 0 ? Math.ceil(total / cols) : total - Math.ceil(total / cols);
      const rowIdx = col === 0 ? idx : idx - Math.ceil(total / cols);
      const x = cols === 1 ? this.w * 0.60 : (col === 0 ? this.w * 0.56 : this.w * 0.68);
      const y = perCol === 1
        ? this.h * 0.5
        : this.h * (0.22 + (rowIdx / Math.max(1, perCol - 1)) * 0.56);
      return { x, y };
    }

    syncPreview(run) {
      this.run = run;
      if (this.mode === "fighting") return;
      this.mode = "preview";
      this.resultBanner = null;
      this.projectiles = [];
      this.beams = [];
      this.rings = [];
      this.particles = [];
      this.texts = [];

      const syns = G.getActiveSynergies(run);
      const knightSyn = syns.find(s => s.type === "knight")?.active;
      this.factions = Object.fromEntries(G.getFactionSynergies(run).map(f => [f.id, f.tier]));

      this.allies = [];
      run.field.forEach((u, idx) => {
        if (!u) return;
        const pos = this._allySlotPos(idx);
        const st = G.getUnitStats(u, run);
        let shield = u.type === "knight" ? 18 : 0;
        if (u.trait === "iron_skin") shield += 25;
        if (knightSyn) shield += 22;
        if (idx < 3 && G.hasCore(run, "vanguard_oath")) shield += 24;
        if (u.evolution === "fortress") shield += Math.round(st.hp * 0.28);
      if (this.factions.alliance >= 3) shield += Math.round(st.hp * 0.25);

        this.allies.push({
          uid: u.id,
          side: "ally",
          slotIdx: idx,
          type: u.type,
          trait: u.trait || null,
          evolution: u.evolution,
          lucky: u.lucky,
          level: st.level,
          name: u.evolution ? G.SYMBOLS[u.type].evolutions[u.evolution].name : G.SYMBOLS[u.type].short,
          color: G.SYMBOLS[u.type].color,
          x: pos.x,
          y: pos.y,
          homeX: pos.x,
          homeY: pos.y,
          hp: st.hp,
          maxHp: st.hp,
          shield: Math.round(shield * this._holyShieldMultiplier()),
          atk: st.atk,
          crit: st.crit,
          atkCd: st.atkCd,
          cdTimer: st.atkCd * (0.3 + Math.random() * 0.4),
          atkCount: 0,
          fortressTimer: 4.0,
          lunge: 0,
          hitFlash: 0,
          slowTimer: 0,
          stunTimer: 0,
          invulnerable: 0,
          usedUndying: false,
          summonTimer: 5,
          soulStacks: 0,
          atkBuff: 1,
          alive: true,
          radius: st.level >= 3 ? 23 : st.level === 2 ? 20 : 18
        });
      });

      const waveDef = G.getWave(run);
      this.enemies = waveDef.enemies.map((def, index) =>
        this._createEnemy(def, this._enemySlotPos(index, waveDef.enemies.length), "preview-" + index));
    }

    _createEnemy(def, pos, uid, isReinforcement = false) {
      const isBoss = def.kind === "boss";
      return {
        uid, side: "enemy", kind: def.kind, artKey: def.artKey, tactic: def.tactic,
        definition: def, bossId: def.bossId, name: def.name, lv: def.lv,
        color: G.getChapter(this.run).themeColor,
        x: isReinforcement ? Math.min(this.w - 28, pos.x + 110) : pos.x, y: pos.y, homeX: pos.x, homeY: pos.y,
        hp: def.hp, maxHp: def.hp, shield: isBoss ? Math.round(def.hp * .22) : 0,
        atk: def.atk, crit: isBoss ? .15 : .08, atkCd: def.cd,
        cdTimer: def.cd * (.45 + Math.random() * .4),
        skillInterval: def.skillInterval, skillTimer: def.skillInterval,
        tacticTimer: 0, enrage: 1, lunge: 0, hitFlash: 0, slowTimer: 0,
        stunTimer: 0, spawnGrace: isReinforcement ? 0.22 : 0,
        alive: true, isBoss,
        radius: isBoss ? 29 : def.kind === "tank" ? 21 : 17
      };
    }

    _spawnPhase() {
      const phase = this.phases[this.phaseIndex];
      const isReinforcement = this.phaseIndex > 0;
      const occupied = this.enemies.filter(enemy => enemy.alive);
      const positions = Array.from({ length: 6 }, (_, index) => this._enemySlotPos(index, 6));
      for (const def of phase.enemies) {
        const pos = positions.find(candidate => !occupied.some(enemy =>
          Math.abs(enemy.homeX - candidate.x) < 12 && Math.abs(enemy.homeY - candidate.y) < 18))
          ?? this._enemySlotPos(occupied.length % 6, 6);
        const enemy = this._createEnemy(def, pos, "enemy-" + this.nextEnemyId++, isReinforcement);
        this.enemies.push(enemy);
        occupied.push(enemy);
        this._spawnParticles(pos.x, pos.y, enemy.color, enemy.isBoss ? 24 : 9);
        if (enemy.isBoss) {
          this.shake = Math.max(this.shake, 11);
          this.rings.push({ x: pos.x, y: pos.y, r: 18, maxR: 160, color: "#ff3b5c", life: 0.55 });
          this._spawnText(this.w * 0.5, 62, `⚠️ 审判降临：${enemy.name}`, "#ff5964", 19);
        }
      }
      if (isReinforcement) {
        this._spawnText(this.w * 0.72, 46, `第 ${this.phaseIndex + 1} 批援军抵达！`, "#ffd86b", 14);
      }
      this.phaseIndex += 1;
      this.phaseClearDelay = 0;
    }

    _updatePhaseProgress(force = false) {
      if (!this.onProgress) return;
      if (!force && this.battleTime - (this._lastProgTs || 0) < 0.15) return;
      this._lastProgTs = this.battleTime;
      const nextDelay = this.phases[this.phaseIndex]?.delay;
      this.onProgress(this.phaseIndex, this.phases.length, this.battleTime,
        this.phases.at(-1).delay, nextDelay);
    }

    startBattle(run, onFinish, onProgress) {
      this.syncPreview(run);
      this.mode = "fighting";
      this.onFinish = onFinish;
      this.onProgress = onProgress;
      this.phases = G.getWave(run).phases;
      this.phaseIndex = 0;
      this.nextEnemyId = 0;
      this.blasts = [];
      this.enemies = [];
      this.healTick = 0;
      this.battleTime = 0;
      this.flawless = true;
      this.battleGold = 0;
      this.battleCrystals = 0;
      this.kills = 0;
      this.nextSummonId = 0;
      this.warSong = this.allies.some(unit => unit.evolution === "war_song");

      const syns = G.getActiveSynergies(run);
      this.synergies = {
        archer: syns.find(s => s.type === "archer")?.active,
        mage: syns.find(s => s.type === "mage")?.active,
        priest: syns.find(s => s.type === "priest")?.active,
        assassin: syns.find(s => s.type === "assassin")?.active
      };

      this._spawnPhase();
      this._updatePhaseProgress();
      for (const unit of [...this.allies]) {
        if (unit.type === "engineer") this._summonAlly(unit, "turret");
        if (unit.evolution === "sky_charge") this._openSkyCharge(unit);
      }
      if (this.allies.length === 0) this._endBattle(false);
    }

    _holyShieldMultiplier() {
      return this.factions?.alliance >= 3 ? 1.6 : this.factions?.alliance >= 2 ? 1.35 : 1;
    }

    _grantShield(unit, amount) {
      const shield = Math.round(amount * (unit.side === "ally" ? this._holyShieldMultiplier() : 1));
      unit.shield += shield;
      return shield;
    }

    _getEnv() {
      return G.getChapter(this.run)?.env || { healPenalty: 0, speedPenalty: 0, burnPct: 0, poison: false, shieldPierce: 0 };
    }

    _heal(unit, amount) {
      const env = unit.side === "ally" ? this._getEnv() : null;
      const healMult = env ? Math.max(0.1, 1 - (env.healPenalty || 0)) : 1;
      const healed = Math.min(unit.maxHp - unit.hp, Math.round(amount * healMult));
      if (healed <= 0) return;
      unit.hp += healed;
      const col = env && env.healPenalty > 0 ? "#8ad9b3" : "#57e39c";
      this._spawnText(unit.x, unit.y - 6, `+${healed}`, col, 12);
    }

    _summonAlly(owner, summonKind) {
      const turret = summonKind === "turret";
      const swarm = owner.evolution === "swarm_turret";
      const armored = owner.evolution === "bone_lord";
      const existing = this.allies.filter(unit => unit.alive && unit.ownerId === owner.uid && unit.summonKind === summonKind);
      if (existing.length >= (turret ? (swarm ? 3 : 1) : 4)) return;
      const faction = this.factions.undead;
      const hp = Math.round(owner.maxHp * (turret ? .35 : armored ? .56 : .42) *
        (faction >= 3 ? 1.9 : faction >= 2 ? 1.55 : 1));
      const atk = Math.round(owner.atk * (turret ? .55 : .35) *
        (faction >= 3 ? 1.9 : faction >= 2 ? 1.55 : 1));
      const x = turret ? this.w * .27 : this.w * .39;
      const y = Math.max(35, Math.min(this.h - 55, owner.homeY + (existing.length - 1) * 29));
      this.allies.push({
        uid: "ally-summon-" + this.nextSummonId++, ownerId: owner.uid, side: "ally", summonKind,
        type: summonKind, artKey: turret ? "turret" : "enemy_tank", slotIdx: turret ? 3 : 0,
        name: turret ? "蒸汽炮台" : armored ? "持盾骸骨" : "骸骨战士",
        evolution: turret ? owner.evolution : null, taunt: !turret && armored,
        x, y, homeX: x, homeY: y, hp, maxHp: hp, atk, shield: 0,
        level: 1, crit: .08, atkBuff: 1, atkCount: 0, atkCd: swarm ? .46 : turret ? .95 : 1.2,
        cdTimer: .25, slowTimer: 0, stunTimer: 0, invulnerable: 0, hitFlash: 0,
        lunge: 0, alive: true, color: turret ? "#f2ba70" : "#8ce5aa"
      });
      if (armored && !turret) this._grantShield(this.allies.at(-1), hp * .35);
      this._spawnParticles(x, y, owner.color, 9);
    }

    _openSkyCharge(unit) {
      const first = this.enemies.filter(enemy => enemy.alive).sort((a, b) => a.homeX - b.homeX)[0];
      if (!first) return;
      const column = this.enemies.filter(enemy => enemy.alive && enemy.homeX === first.homeX);
      column.forEach(enemy => {
        enemy.x = Math.min(this.w - 24, enemy.x + 32);
        enemy.stunTimer = Math.max(enemy.stunTimer, 1.45);
        this._applyDamage(unit, enemy, unit.atk * 1.1, { color: "#ffe598", shieldMultiplier: 2 });
      });
    }

    _onDeath(attacker, target) {
      if (target.side === "enemy") {
        this.kills += 1;
        if (this.run.mode === "endless" && !target.summonKind) {
          const dropMultiplier = this.run.endlessAffixes.includes("gold_tide") ? 2 : 1;
          this.battleGold += 4 * dropMultiplier;
          this.battleCrystals += dropMultiplier;
        }
        if (this.factions.elves >= 3) this.battleGold += 5;
        if (this.factions.undead >= 3) {
          this.allies.filter(a => a.alive).forEach(a => this._heal(a, a.maxHp * 0.08));
        }
      }
      if (!target.summonKind) {
        for (const unit of this.allies.filter(ally => ally.alive && ally.type === "necromancer")) {
          this._summonAlly(unit, "skeleton");
          if (target.side === "enemy" && unit.evolution === "soul_mage") unit.soulStacks += 1;
        }
      }
      if (attacker?.alive && attacker.side === "ally" && attacker.evolution === "bladedancer") {
        attacker.cdTimer = 0.08;
        this._heal(attacker, attacker.maxHp * .25);
      }
    }

    _endBattle(won) {
      this.mode = "result";
      this.resultBanner = {
        won,
        alpha: 0,
        title: won ? "防线告捷！" : "防线被突破",
        sub: won ? "敌军已被全数歼灭" : "城防承受了敌军冲击"
      };
      if (globalThis.SFX) {
        if (won) globalThis.SFX.victory();
        else globalThis.SFX.defeat();
      }
      setTimeout(() => {
        if (this.onFinish) {
          const cb = this.onFinish;
          this.onFinish = null;
          cb(won, { flawless: this.flawless, gold: this.battleGold,
            crystals: this.battleCrystals, kills: this.kills, duration: this.battleTime });
        }
      }, 950);
    }

    _spawnText(x, y, text, color = "#ffffff", size = 14) {
      this.texts.push({
        x: x + (Math.random() - 0.5) * 14,
        y: y - 14,
        vy: -38,
        text,
        color,
        size,
        life: 0.9,
        maxLife: 0.9
      });
    }

    _spawnParticles(x, y, color, count = 8) {
      for (let i = 0; i < count; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const spd = 40 + Math.random() * 110;
        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          color,
          r: 2 + Math.random() * 2.5,
          life: 0.35 + Math.random() * 0.25,
          maxLife: 0.6
        });
      }
    }

    _applyDamage(attacker, target, rawDmg, opts = {}) {
      if (!target?.alive || target.invulnerable > 0) return 0;
      let dmg = Math.max(1, Math.round(rawDmg));
      // Chapter 2 Boss (Lich) Build Check: gains 14% dmg reduction per living minion (max 56%) -> forces AOE clear!
      if (target.bossId === "lich") {
        const minions = this.enemies.filter(e => e.alive && e !== target).length;
        if (minions > 0) {
          const dr = Math.min(0.56, minions * 0.14);
          dmg = Math.max(1, Math.round(dmg * (1 - dr)));
        }
      }
      const isCrit = !!opts.isCrit;
      const oldHp = target.hp;
      const oldShield = target.shield;
      if (oldShield > 0) {
        const envPierce = (attacker?.side === "enemy" ? (this._getEnv().shieldPierce || 0) : 0);
        const enemyPierce = ((attacker?.side === "enemy" && attacker.definition?.shieldPierce) || 0) + envPierce;
        const mult = (opts.shieldMultiplier ?? 1) * (1 + enemyPierce);
        const absorbed = Math.min(oldShield, Math.round(dmg * mult));
        target.shield -= absorbed;
        dmg = Math.max(0, Math.round(dmg - absorbed / mult));
      }
      // Chapter 2 Poison Miasma: enemy hits inflict 2.5s poison DoT
      if (target.side === "ally" && attacker?.side === "enemy" && this._getEnv().poison) {
        target.poisonTimer = 2.5;
      }
      target.hp = Math.max(0, target.hp - dmg);
      if (!target.hp && target.evolution === "undying" && !target.usedUndying) {
        target.hp = 1;
        target.usedUndying = true;
        target.invulnerable = 3;
        this._spawnText(target.x, target.y - 20, "不屈", "#ff806a", 16);
      }
      if (target.side === "ally" && !target.summonKind && target.hp < oldHp) this.flawless = false;
      target.hitFlash = 0.16;

      const dealt = oldHp - target.hp + oldShield - target.shield;
      const txt = isCrit ? `${dealt}!` : String(dealt);
      const col = opts.color || (isCrit ? "#ffd86b" : "#f5f7ff");
      this._spawnText(target.x, target.y, txt, col, isCrit ? 18 : 13);
      this._spawnParticles(target.x, target.y, opts.particleColor || target.color, isCrit ? 10 : 5);

      if (attacker?.alive && attacker.side === "ally" && attacker.trait === "vampiric" && dealt > 0 && !opts.isReflect) {
        this._heal(attacker, dealt * 0.15);
      }

      if (isCrit) {
        this.shake = Math.max(this.shake, 4);
        if (globalThis.SFX) globalThis.SFX.crit();
        if (attacker?.alive && attacker.side === "ally") {
          const horde = this.factions.horde;
          if (horde >= 2) this._heal(attacker, dealt * (horde >= 3 ? .38 : .22));
          if (this.goldPoet) this.battleGold += 2;
        }
      } else if (globalThis.SFX) {
        globalThis.SFX.hit();
      }

      if (target.hp <= 0) {
        target.alive = false;
        this._spawnParticles(target.x, target.y, target.color, target.isBoss ? 26 : 14);
        if (target.isBoss) this.shake = 10;
        this._onDeath(attacker, target);
      }

      if (target.side === "ally" && !opts.isReflect && attacker?.alive) {
        if (target.evolution === "thorns") {
          this._applyDamage(target, attacker, Math.max(3, rawDmg * .35), { color: "#4fd1a5", isReflect: true });
        }
        if (this.factions.alliance >= 2 && oldShield > 0 && target.shield === 0) {
          const holyDamage = oldShield * (this.factions.alliance >= 3 ? .65 : .4);
          this.enemies.filter(enemy => enemy.alive && Math.hypot(enemy.x - attacker.x, enemy.y - attacker.y) <= 105)
            .forEach(enemy => this._applyDamage(target, enemy, holyDamage, { color: "#ffe29a", isReflect: true }));
        }
      }
      return dealt;
    }

    _pickTarget(actor, foes) {
      const living = foes.filter(f => f.alive && !(f.spawnGrace > 0));
      if (living.length === 0) return null;

      if (actor.tactic === "backline_diver" && actor.dived) {
        const rear = living.filter(unit => unit.slotIdx >= 3);
        return rear.find(unit => unit.type === "knight" || unit.taunt)
          ?? [...(rear.length ? rear : living)].sort((a, b) => a.hp - b.hp)[0];
      }

      // Allied assassins target the opposing backline.
      if (actor.type === "assassin") {
        return [...living].sort((a, b) => (b.homeX - a.homeX) * (actor.side === "ally" ? 1 : -1) || a.hp - b.hp)[0];
      }

      // Prefer frontliners / tanks
      if (actor.side === "enemy") {
        const front = living.filter(u => u.slotIdx < 3);
        const pool = front.length ? front : living;
        // Prefer thorns/knight taunt
        const taunt = pool.find(u => u.taunt) || pool.find(u => u.type === "knight");
        return taunt || pool[0];
      } else {
        // Allies target nearest / frontmost enemy
        return [...living].sort((a, b) => a.homeX - b.homeX)[0];
      }
    }

    _performAllyAttack(u) {
      const target = this._pickTarget(u, this.enemies);
      if (!target) return;

      u.atkCount += 1;
      u.lunge = 1;

      const hasCritDice = G.hasCore(this.run, "crit_dice");
      const critMult = (hasCritDice ? 2.1 : 1.65) + (this.goldPoet ? .25 : 0);
      let critChance = u.crit + (this.synergies.assassin ? 0.18 : 0) + (u.evolution === "bladedancer" ? 0.15 : 0);
      let isCrit = Math.random() < critChance;
      let dmg = u.atk * u.atkBuff;

      if (G.hasCore(this.run, "berserk_banner") && u.hp / u.maxHp < 0.55) {
        dmg *= 1.45;
      }

      if (u.evolution === "sniper" && u.atkCount % 3 === 0) {
        isCrit = true;
        dmg *= 2.4;
      } else if (isCrit) {
        dmg *= critMult;
      }

      if (this.factions.elves >= 2 && u.atkCount % (this.factions.elves >= 3 ? 3 : 4) === 0) {
        const extra = this.enemies.filter(enemy => enemy.alive && enemy !== target).slice(0, 2);
        for (const enemy of [target, ...extra]) {
          this.beams.push({ x1: u.x, y1: u.y, x2: enemy.x, y2: enemy.y, color: "#7be7ff", life: .25, jagged: true });
          this._applyDamage(u, enemy, u.atk * .45, { color: "#a6f2ff" });
        }
      }

      if (u.type === "berserker") {
        const sweep = u.evolution === "bloodaxe";
        const targets = sweep ? this.enemies.filter(enemy => enemy.alive)
          .sort((a, b) => a.homeX - b.homeX).slice(0, 2) : [target];
        const dealt = targets.reduce((sum, enemy) => sum + this._applyDamage(u, enemy, dmg, { isCrit }), 0);
        this._heal(u, dealt * (sweep ? .35 : .2));
      } else if (u.type === "turret") {
        const heavy = u.evolution === "heavy_turret";
        this.rings.push({ x: target.x, y: target.y, r: 8, maxR: heavy ? 86 : 28, color: "#f7b86a", life: .26 });
        this._applyDamage(u, target, dmg, { isCrit });
        if (heavy) {
          target.stunTimer = Math.max(target.stunTimer ?? 0, .8);
          this.enemies.filter(e => e !== target && e.alive && Math.hypot(e.x - target.x, e.y - target.y) <= 103)
            .forEach(enemy => {
              enemy.stunTimer = Math.max(enemy.stunTimer ?? 0, .8);
              this._applyDamage(u, enemy, dmg * .6, { color: "#f7b86a" });
            });
        }
      } else if (u.type === "bard") {
        this.battleGold += 3;
        this._spawnText(u.x, u.y - 16, "+3 金币", "#f5c869", 13);
        this.rings.push({ x: u.x, y: u.y, r: 8, maxR: 85, color: "#e8a1f5", life: .4 });
        this._applyDamage(u, target, dmg, { isCrit, color: "#e8a1f5" });
      } else if (u.type === "valkyrie") {
        const rear = this.enemies.filter(enemy => enemy !== target && enemy.alive).sort((a, b) =>
          b.homeX - a.homeX || Math.abs(a.y - target.y) - Math.abs(b.y - target.y))[0];
        this.beams.push({ x1: u.x, y1: u.y, x2: (rear ?? target).x, y2: (rear ?? target).y,
          color: "#ffe598", life: .24, jagged: false });
        this._applyDamage(u, target, dmg, { isCrit, shieldMultiplier: 2 });
        if (rear) this._applyDamage(u, rear, dmg * .8, { isCrit, shieldMultiplier: 2 });
        if (isCrit && u.evolution === "dawn_spear") {
          this.allies.filter(ally => ally.alive).forEach(ally => this._grantShield(ally, u.atk * .26));
        }
      } else if (u.type === "necromancer" || u.type === "engineer") {
        this.beams.push({ x1: u.x, y1: u.y, x2: target.x, y2: target.y, color: u.color, life: .19, jagged: true });
        this._applyDamage(u, target, dmg * (1 + u.soulStacks * .15), { isCrit });
      } else if (u.type === "archer") {
        const fireArrow = (t, mult, offsetY = 0) => {
          this.projectiles.push({
            x: u.x + 12,
            y: u.y + offsetY,
            tx: t.x,
            ty: t.y,
            color: u.color,
            speed: 520,
            onHit: () => this._applyDamage(u, t, dmg * mult, { isCrit })
          });
        };
        fireArrow(target, 1, 0);
        if (u.evolution === "multishot") {
          const second = this.enemies.find(e => e.alive && e !== target) || target;
          fireArrow(second, 0.65, -7);
        }
      } else if (u.type === "mage") {
        const magicMult = (this.synergies.mage ? 1.25 : 1) * (G.hasCore(this.run, "arcane_echo") ? 1.25 : 1);
        const finalDmg = dmg * magicMult;
        if (globalThis.SFX) globalThis.SFX.magic();

        if (u.evolution === "frost") {
          this.rings.push({ x: target.x, y: target.y, r: 8, maxR: 78, color: "#6be5ff", life: 0.35 });
          this.enemies.filter(e => e.alive).forEach(e => {
            const d = Math.hypot(e.x - target.x, e.y - target.y);
            if (d <= 95 || e === target) {
              e.slowTimer = 2.6;
              this._applyDamage(u, e, e === target ? finalDmg : finalDmg * 0.65, {
                isCrit: e === target && isCrit,
                color: "#7be7ff"
              });
            }
          });
        } else {
          const maxChains = u.evolution === "storm" ? 3 : 2;
          const living = this.enemies.filter(e => e.alive);
          const chainTargets = [target, ...living.filter(e => e !== target).slice(0, maxChains - 1)];
          let prev = u;
          chainTargets.forEach((ct, idx) => {
            this.beams.push({ x1: prev.x, y1: prev.y, x2: ct.x, y2: ct.y, color: "#c59bff", life: 0.24, jagged: true });
            this._applyDamage(u, ct, finalDmg * (idx === 0 ? 1 : 0.65), {
              isCrit: idx === 0 && isCrit,
              color: "#d4b5ff"
            });
            prev = ct;
          });
        }
      } else if (u.type === "priest") {
        const healMult = (this.synergies.mage ? 1.15 : 1) * (G.hasCore(this.run, "arcane_echo") ? 1.25 : 1);
        const healAmt = Math.round((u.atk * 1.35 + 14) * healMult);
        if (globalThis.SFX) globalThis.SFX.heal();

        // Damage enemy
        this.projectiles.push({
          x: u.x + 10,
          y: u.y,
          tx: target.x,
          ty: target.y,
          color: "#ffe082",
          speed: 440,
          onHit: () => this._applyDamage(u, target, dmg, { isCrit, color: "#ffe082" })
        });

        // Heal lowest HP ally (or 2 for Seraph)
        const injured = this.allies
          .filter(a => a.alive)
          .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp);
        const count = u.evolution === "seraph" ? 2 : 1;
        injured.slice(0, count).forEach(ally => {
          this._heal(ally, healAmt);
          this.beams.push({ x1: u.x, y1: u.y, x2: ally.x, y2: ally.y, color: "#57e39c", life: 0.26, jagged: false });
            if (u.evolution === "seraph") {
            ally.atkBuff = Math.max(ally.atkBuff, 1.2);
          }
          if (u.evolution === "artificer") {
            const sh = this._grantShield(ally, healAmt * .9);
            this._spawnText(ally.x, ally.y - 20, `+${sh}盾`, "#6be5ff", 12);
          }
        });
      } else if (u.type === "assassin") {
        this.beams.push({ x1: u.x, y1: u.y, x2: target.x, y2: target.y, color: "#ff6b7a", life: 0.16, jagged: false });
        this._applyDamage(u, target, dmg, { isCrit });
        if (isCrit && u.evolution === "shadowbomb") {
          this.rings.push({ x: target.x, y: target.y, r: 8, maxR: 75, color: "#ff4d6d", life: 0.3 });
          this.enemies.filter(e => e.alive && e !== target).forEach(e => {
            if (Math.hypot(e.x - target.x, e.y - target.y) <= 95) {
              this._applyDamage(u, e, dmg * 0.65, { color: "#ff6b7a" });
            }
          });
        }
      } else {
        // Knight melee
        this._applyDamage(u, target, dmg, { isCrit });
      }
    }

    _performEnemyAttack(e) {
      const target = this._pickTarget(e, this.allies);
      if (!target) return;
      e.lunge = -1;
      const isCrit = Math.random() < e.crit;
      const dmg = e.atk * e.enrage * (isCrit ? 1.5 : 1);

      if (e.tactic === "shield_breaker") {
        if (target.slotIdx < 3) target.stunTimer = Math.max(target.stunTimer, 1);
        this._applyDamage(e, target, dmg, { isCrit, shieldMultiplier: 2 });
      } else if (e.kind === "ranged" || e.kind === "caster") {
        this.projectiles.push({
          x: e.x - 12,
          y: e.y,
          tx: target.x,
          ty: target.y,
          color: e.color,
          speed: 440,
          onHit: () => this._applyDamage(e, target, dmg, { isCrit })
        });
      } else {
        this._applyDamage(e, target, dmg, { isCrit });
      }
    }

    _enemyTactic(enemy, dt) {
      enemy.tacticTimer += dt;
      if (enemy.tactic === "backline_diver" && !enemy.dived && enemy.tacticTimer >= 1.2) {
        enemy.dived = true;
        const target = this._pickTarget(enemy, this.allies);
        if (target) {
          enemy.homeX = Math.max(30, target.homeX - 30);
          enemy.x = enemy.homeX;
          enemy.homeY = target.homeY;
          enemy.y = target.homeY;
          this._spawnParticles(enemy.x, enemy.y, enemy.color, 15);
          this._spawnText(enemy.x, enemy.y - 25, "后排突袭", "#ff7084", 14);
        }
      } else if (enemy.tactic === "summoner" && enemy.tacticTimer >= 5) {
        enemy.tacticTimer -= 5;
        const ownSummons = this.enemies.filter(unit => unit.alive && unit.ownerId === enemy.uid);
        for (let i = ownSummons.length; i < 2; i += 1) {
          const pos = { x: Math.max(this.w * .52, enemy.homeX - 52), y: Math.min(this.h - 55, Math.max(32, enemy.homeY + (i ? 38 : -38))) };
          const inferno = enemy.bossId === "balrog";
          const minion = this._createEnemy({
            name: inferno ? "熔岩小鬼" : "召唤食尸鬼", kind: "melee",
            artKey: inferno ? "ch4_lava_imp" : "ch2_crypt_ghoul",
            lv: enemy.lv, shieldPierce: enemy.definition.shieldPierce,
            hp: Math.round(enemy.maxHp * .16), atk: Math.round(enemy.atk * .42), cd: 1.25
          }, pos, "enemy-" + this.nextEnemyId++);
          minion.ownerId = enemy.uid;
          minion.summonKind = "enemy_minion";
          this.enemies.push(minion);
          this._spawnParticles(pos.x, pos.y, enemy.color, 10);
        }
      } else if (enemy.tactic === "healer_support" && enemy.tacticTimer >= 3.2) {
        enemy.tacticTimer -= 3.2;
        const living = this.enemies.filter(unit => unit.alive);
        const frontX = Math.min(...living.map(unit => unit.homeX));
        const target = living.filter(unit => unit.homeX === frontX).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
        if (target) {
          this._heal(target, enemy.atk * 1.3);
          this._grantShield(target, enemy.atk * .8);
          this.beams.push({ x1: enemy.x, y1: enemy.y, x2: target.x, y2: target.y, color: "#72f6ac", life: .28 });
        }
      } else if (enemy.tactic === "artillery_aoe" && enemy.tacticTimer >= 3.8) {
        enemy.tacticTimer -= 3.8;
        const target = this._pickTarget(enemy, this.allies);
        if (target) this.blasts.push({ enemy, x: target.x, y: target.y, radius: 83, time: 1.5 });
      }
    }

    _updateArtillery(dt) {
      for (let index = this.blasts.length - 1; index >= 0; index -= 1) {
        const blast = this.blasts[index];
        blast.time -= dt;
        if (blast.time > 0) continue;
        this.blasts.splice(index, 1);
        this.rings.push({ x: blast.x, y: blast.y, r: 10, maxR: blast.radius, color: "#ff5167", life: .48 });
        this.allies.filter(unit => unit.alive && Math.hypot(unit.x - blast.x, unit.y - blast.y) <= blast.radius)
          .forEach(unit => this._applyDamage(blast.enemy, unit, blast.enemy.atk * 1.2, { color: "#ff7855" }));
      }
    }

    _performBossSkill(boss) {
      const livingAllies = this.allies.filter(a => a.alive);
      if (livingAllies.length === 0) return;
      if (globalThis.SFX) globalThis.SFX.bossSkill();
      this.shake = 8;

      if (boss.bossId === "grom") {
        // Ch1 Exam: Basic Frontline & Sustain
        this.rings.push({ x: boss.x, y: boss.y, r: 16, maxR: 280, color: "#ff595e", life: 0.45 });
        boss.shield += Math.round(boss.maxHp * 0.14);
        this._spawnText(boss.x, boss.y - 24, "裂地重击!", "#ff595e", 16);
        livingAllies.forEach(a => this._applyDamage(boss, a, boss.atk * 0.88, { color: "#ff7a7e" }));
      } else if (boss.bossId === "lich") {
        // Ch2 Exam: AOE Clear (summons skeleton minions; each living minion gives Lich 14% DR!)
        this._spawnText(boss.x, boss.y - 24, "亡灵潮涌 · 幽冥连锁!", "#c77dff", 16);
        const existingMinions = this.enemies.filter(e => e.alive && e !== boss).length;
        for (let i = 0; i < Math.min(2, Math.max(0, 4 - existingMinions)); i += 1) {
          const pos = { x: Math.max(this.w * 0.52, boss.homeX - 46), y: Math.min(this.h - 48, Math.max(40, boss.homeY + (i ? 42 : -42))) };
          const minion = this._createEnemy({
            name: "亡灵侍从", kind: "melee", artKey: "ch2_crypt_ghoul",
            lv: boss.lv, hp: Math.round(boss.maxHp * 0.11), atk: Math.round(boss.atk * 0.36), cd: 1.2
          }, pos, "enemy-" + this.nextEnemyId++, true);
          minion.ownerId = boss.uid;
          this.enemies.push(minion);
          this._spawnParticles(pos.x, pos.y, "#38e8a8", 10);
        }
        let drained = 0;
        livingAllies.slice(0, 3).forEach(a => {
          this.beams.push({ x1: boss.x, y1: boss.y, x2: a.x, y2: a.y, color: "#b5179e", life: 0.32, jagged: true });
          drained += this._applyDamage(boss, a, boss.atk * 0.88, { color: "#e0aaff" });
        });
        const heal = Math.round(drained * 0.32);
        boss.hp = Math.min(boss.maxHp, boss.hp + heal);
        this._spawnText(boss.x, boss.y - 6, `+${heal}`, "#c77dff", 14);
      } else if (boss.bossId === "icequeen") {
        // Ch3 Exam: Backline Protection (snipes & freezes rear-row carries + chills whole team!)
        this.rings.push({ x: boss.x, y: boss.y, r: 18, maxR: 305, color: "#6be5ff", life: 0.55 });
        this._spawnText(boss.x, boss.y - 24, "极寒穿刺 · 冻结后排!", "#6be5ff", 16);
        const rear = livingAllies.filter(ally => ally.slotIdx >= 3);
        const snipeTarget = rear.length
          ? rear[Math.floor(Math.random() * rear.length)]
          : livingAllies[0];
        if (snipeTarget) {
          this.beams.push({ x1: boss.x, y1: boss.y, x2: snipeTarget.x, y2: snipeTarget.y, color: "#80f0ff", life: 0.35, jagged: true });
          this.rings.push({ x: snipeTarget.x, y: snipeTarget.y, r: 10, maxR: 58, color: "#6be5ff", life: 0.45 });
          this._applyDamage(boss, snipeTarget, boss.atk * 1.55, { color: "#a5f1ff", isCrit: true });
          snipeTarget.stunTimer = Math.max(snipeTarget.stunTimer, 1.2);
          this._spawnText(snipeTarget.x, snipeTarget.y - 22, "冻结!", "#80f0ff", 14);
        }
        livingAllies.forEach(ally => {
          this._applyDamage(boss, ally, boss.atk * 0.52, { color: "#a5f1ff" });
          ally.slowTimer = Math.max(ally.slowTimer, 2.2);
        });
      } else if (boss.bossId === "balrog") {
        // Ch4 Exam: Frontline Tankiness (massive shield-breaking smash on frontline; wipes backline if frontline falls!)
        const front = livingAllies.filter(ally => ally.slotIdx < 3);
        const targets = front.length ? front : livingAllies;
        this._spawnText(boss.x, boss.y - 24, front.length ? "熔岩断层 · 破盾重击!" : "防线崩塌 · 灭世火浪!", "#ff8b3d", 16);
        targets.forEach(ally => {
          this.rings.push({ x: ally.x, y: ally.y, r: 12, maxR: 64, color: "#ff6d24", life: 0.48 });
          this._applyDamage(boss, ally, boss.atk * (front.length ? 1.65 : 1.85), {
            color: "#ff9a57",
            shieldMultiplier: 1.6
          });
        });
      } else if (boss.bossId === "dragon") {
        // Ch5 Final Exam: Ultimate DPS Race & Full Build Check (stacks enrage + P2 spawns void assassins!)
        this.rings.push({ x: boss.x, y: boss.y, r: 20, maxR: 340, color: "#ff2a55", life: 0.5 });
        boss.enrage = Math.min(2.1, boss.enrage + 0.15);
        this._spawnText(boss.x, boss.y - 26, `毁灭龙息 · 狂暴×${boss.enrage.toFixed(2)}!`, "#ff4d6d", 17);
        livingAllies.forEach(a => this._applyDamage(boss, a, boss.atk * 0.96, { color: "#ff6b6b" }));
        if (boss.phaseTwo && !boss.summonedVoidGuards) {
          boss.summonedVoidGuards = true;
          for (let i = 0; i < 2; i += 1) {
            const pos = { x: this.w * 0.58, y: i ? this.h * 0.28 : this.h * 0.72 };
            const stalker = this._createEnemy({
              name: "虚空突袭者", kind: "assassin", artKey: "ch5_void_stalker", tactic: "backline_diver",
              lv: boss.lv, hp: Math.round(boss.maxHp * 0.12), atk: Math.round(boss.atk * 0.55), cd: 0.85
            }, pos, "enemy-" + this.nextEnemyId++, true);
            this.enemies.push(stalker);
          }
          this._spawnText(this.w * 0.5, 86, "⚠️ 魔龙召唤虚空刺客突袭后排！", "#ff75b5", 15);
        }
      }
    }

    _update(dt) {
      this.time += dt;
      if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 28);

      // Update FX even after result
      for (let i = this.projectiles.length - 1; i >= 0; i -= 1) {
        const p = this.projectiles[i];
        const dx = p.tx - p.x;
        const dy = p.ty - p.y;
        const dist = Math.hypot(dx, dy);
        const step = p.speed * dt;
        if (dist <= step + 6) {
          p.onHit();
          this.projectiles.splice(i, 1);
        } else {
          p.x += (dx / dist) * step;
          p.y += (dy / dist) * step;
        }
      }

      for (let i = this.beams.length - 1; i >= 0; i -= 1) {
        this.beams[i].life -= dt;
        if (this.beams[i].life <= 0) this.beams.splice(i, 1);
      }

      for (let i = this.rings.length - 1; i >= 0; i -= 1) {
        const r = this.rings[i];
        r.life -= dt;
        r.r += (r.maxR - r.r) * Math.min(1, dt * 8);
        if (r.life <= 0) this.rings.splice(i, 1);
      }

      for (let i = this.particles.length - 1; i >= 0; i -= 1) {
        const p = this.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.life -= dt;
        if (p.life <= 0) this.particles.splice(i, 1);
      }

      for (let i = this.texts.length - 1; i >= 0; i -= 1) {
        const t = this.texts[i];
        t.y += t.vy * dt;
        t.vy *= 0.92;
        t.life -= dt;
        if (t.life <= 0) this.texts.splice(i, 1);
      }

      if (this.resultBanner) {
        this.resultBanner.alpha = Math.min(1, this.resultBanner.alpha + dt * 3.5);
      }

      if (this.mode !== "fighting") return;
      this.battleTime += dt;
      const livingEnemiesNow = this.enemies.some(e => e.alive);
      if (this.phaseIndex < this.phases.length) {
        if (this.phases[this.phaseIndex].delay <= this.battleTime) {
          this._spawnPhase();
          this._updatePhaseProgress(true);
        } else if (!livingEnemiesNow) {
          // Pull forward next reinforcement smoothly instead of stalling on an empty arena!
          this.phaseClearDelay = (this.phaseClearDelay || 0) + dt;
          if (this.phaseClearDelay >= 0.42) {
            this.battleTime = Math.max(this.battleTime, this.phases[this.phaseIndex].delay);
            this._spawnPhase();
            this._updatePhaseProgress(true);
          }
        }
      }
      this._updatePhaseProgress();
      this._updateArtillery(dt);

      // Chapter Environmental Hazards (Lava Burn / Poison Miasma tick)
      const env = this._getEnv();
      if (env.burnPct > 0) {
        this.burnTick = (this.burnTick || 0) + dt;
        if (this.burnTick >= 3.0) {
          this.burnTick -= 3.0;
          this.allies.filter(a => a.alive && !a.summonKind).forEach(a => {
            const bdmg = Math.max(4, Math.round(a.maxHp * env.burnPct));
            this._applyDamage(null, a, bdmg, { color: "#ff7a38", isReflect: true });
          });
        }
      }
      if (env.poison) {
        this.poisonTick = (this.poisonTick || 0) + dt;
        if (this.poisonTick >= 1.0) {
          this.poisonTick -= 1.0;
          this.allies.filter(a => a.alive && a.poisonTimer > 0).forEach(a => {
            a.poisonTimer = Math.max(0, a.poisonTimer - 1.0);
            const pdmg = Math.max(3, Math.round(a.maxHp * 0.02));
            this._applyDamage(null, a, pdmg, { color: "#42e89d", isReflect: true });
          });
        }
      }

      // Priest synergy HoT
      if (this.synergies.priest) {
        this.healTick += dt;
        if (this.healTick >= 2.0) {
          this.healTick -= 2.0;
          this.allies.filter(a => a.alive).forEach(a => {
            this._heal(a, Math.max(4, Math.round(a.maxHp * 0.04)));
          });
        }
      }

      const bardActive = this.allies.some(unit => unit.alive && unit.type === "bard");
      this.goldPoet = this.allies.some(unit => unit.alive && unit.evolution === "gold_poet");
      const songSpeed = (bardActive ? 1.15 : 1) * (this.warSong && this.battleTime < 5 ? 1.35 : 1);

      // Allies tick
      for (const u of [...this.allies]) {
        if (!u.alive) continue;
        if (u.hitFlash > 0) u.hitFlash -= dt;
        if (u.lunge > 0) u.lunge = Math.max(0, u.lunge - dt * 5);
        u.slowTimer = Math.max(0, u.slowTimer - dt);
        u.invulnerable = Math.max(0, u.invulnerable - dt);
        u.stunTimer = Math.max(0, u.stunTimer - dt);
        if (u.stunTimer > 0) continue;
        if (u.type === "engineer") {
          u.summonTimer -= dt;
          if (u.summonTimer <= 0) {
            const turrets = this.allies.filter(ally =>
              ally.alive && ally.ownerId === u.uid && ally.summonKind === "turret");
            if (turrets.length >= (u.evolution === "swarm_turret" ? 3 : 1)) turrets[0].alive = false;
            this._summonAlly(u, "turret");
            u.summonTimer += 5;
          }
        }

        if (u.evolution === "fortress") {
          u.fortressTimer -= dt;
          if (u.fortressTimer <= 0) {
            u.fortressTimer = 4.5;
            const sh = this._grantShield(u, u.maxHp * .10);
            this._spawnText(u.x, u.y - 16, `+${sh}盾`, "#6be5ff", 12);
          }
        }

        const envSpeedMult = 1 - (env.speedPenalty || 0);
        let spdMult = envSpeedMult * songSpeed * (this.synergies.archer ? 1.18 : 1) * (u.slowTimer > 0 ? 0.65 : 1);
        if (u.type === "berserker") spdMult *= 1 + (1 - u.hp / u.maxHp) * .65;
        if (u.invulnerable > 0) spdMult *= 1.45;
        const bannerLv = G.coreLevel ? G.coreLevel(this.run, "berserk_banner") : (G.hasCore(this.run, "berserk_banner") ? 1 : 0);
        if (bannerLv > 0 && u.hp / u.maxHp < 0.55) {
          spdMult *= 1 + 0.45 + (bannerLv - 1) * 0.22;
        }
        u.cdTimer -= dt * spdMult;
        if (u.cdTimer <= 0) {
          if (this.enemies.some(enemy => enemy.alive && (enemy.spawnGrace || 0) <= 0)) {
            u.cdTimer = u.atkCd;
            this._performAllyAttack(u);
          } else {
            u.cdTimer = 0.14 + Math.random() * 0.18;
          }
        }
      }

      // Enemies tick
      for (const e of [...this.enemies]) {
        if (!e.alive) continue;
        if (e.spawnGrace > 0) {
          e.spawnGrace = Math.max(0, e.spawnGrace - dt);
          e.x += (e.homeX - e.x) * Math.min(1, dt * 11);
          continue;
        }
        if (e.isBoss && !e.phaseTwo && e.hp <= e.maxHp * .5) {
          e.phaseTwo = true;
          e.skillTimer = Math.min(e.skillTimer, e.skillInterval * .7);
          this.shake = Math.max(this.shake, 15);
          e.rageBubbleUntil = this.time + 2.2;
        }
        if (e.hitFlash > 0) e.hitFlash -= dt;
        if (e.lunge < 0) e.lunge = Math.min(0, e.lunge + dt * 5);
        if (e.slowTimer > 0) e.slowTimer -= dt;
        e.stunTimer = Math.max(0, (e.stunTimer ?? 0) - dt);
        if (e.stunTimer > 0) continue;

        this._enemyTactic(e, dt);

        // Melee enemies physically march/charge to the frontline defender before swinging!
        const isMelee = e.kind !== "ranged" && e.kind !== "caster";
        let inRange = true;
        if (isMelee) {
          const target = this._pickTarget(e, this.allies);
          if (target) {
            const standDist = e.isBoss ? 58 : 44;
            const laneOffset = ((parseInt(String(e.uid).replace(/\D/g, ""), 10) || 0) % 3 - 1) * 14;
            const engageX = Math.min(this.w - 40, target.x + standDist);
            const engageY = Math.max(36, Math.min(this.h - 44, target.y + laneOffset));
            const dx = engageX - e.x;
            const dy = engageY - e.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 18) {
              inRange = false;
              const moveSpd = (e.isBoss ? 420 : e.kind === "assassin" ? 680 : 540) * (e.slowTimer > 0 ? 0.65 : 1);
              const step = Math.min(dist, moveSpd * dt);
              e.x += (dx / dist) * step;
              e.y += (dy / dist) * step;
            }
          }
        } else {
          e.x += (e.homeX - e.x) * Math.min(1, dt * 4);
        }

        const affixSpeed = this.run.endlessAffixes?.includes("blood_tide") ? 1.25 : 1;
        const spdMult = (e.slowTimer > 0 ? 0.65 : 1) * e.enrage * affixSpeed;
        if (inRange) {
          e.cdTimer -= dt * spdMult;
          if (e.cdTimer <= 0) {
            e.cdTimer = e.atkCd;
            this._performEnemyAttack(e);
          }
        }
        if (e.isBoss) {
          e.skillTimer -= dt;
          if (e.skillTimer <= 0) {
            e.skillTimer = e.skillInterval * (e.phaseTwo ? .7 : 1);
            this._performBossSkill(e);
          }
        }
      }

      // Check win / loss
      const alliesAlive = this.allies.some(a => a.alive);
      const enemiesAlive = this.enemies.some(e => e.alive);
      if (!enemiesAlive && this.phaseIndex === this.phases.length && this.blasts.length === 0) {
        this._endBattle(true);
      } else if (!alliesAlive) {
        this._endBattle(false);
      }
    }

    _drawUnit(u, isAlly) {
      const ctx = this.ctx;
      const Art = globalThis.GameArt;
      const phase = this.time * 3.4 + (u.homeX * 0.04);
      const bob = Math.sin(phase) * 2.5;
      const breath = 1 + Math.sin(phase) * 0.025;
      const x = u.x + u.lunge * 18;
      const y = u.y + bob;
      const size = u.isBoss ? 116 : (isAlly ? 52 + (u.level - 1) * 5.5 : 56);
      const footY = y + size * 0.42;

      // Ground contact shadow on flagstones
      ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
      ctx.beginPath();
      ctx.ellipse(x, footY, size * 0.36, size * 0.13, 0, 0, Math.PI * 2);
      ctx.fill();

      // Lucky golden aura / Evolution rune / Boss crimson ring at feet
      if (u.lucky || u.isBoss || u.evolution) {
        ctx.save();
        ctx.strokeStyle = u.isBoss
          ? (u.phaseTwo ? "#ff9ce5" : "rgba(255, 70, 95, 0.75)")
          : u.lucky
            ? "rgba(255, 216, 107, 0.8)"
            : "rgba(92, 200, 255, 0.65)";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.ellipse(x, footY, size * 0.42 + Math.sin(this.time * 5) * 2, size * 0.16, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Shield bubble aura
      if (u.shield > 0) {
        ctx.save();
        const shGrad = ctx.createRadialGradient(x, y, size * 0.15, x, y, size * 0.48);
        shGrad.addColorStop(0, "rgba(107, 229, 255, 0.02)");
        shGrad.addColorStop(0.85, "rgba(107, 229, 255, 0.18)");
        shGrad.addColorStop(1, "rgba(140, 240, 255, 0.55)");
        ctx.fillStyle = shGrad;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.48, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // High Attack Power (ATK) blazing crimson-gold battle aura
      const atkTier = isAlly ? (u.atk >= 85 ? 2 : u.atk >= 40 ? 1 : 0) : (u.isBoss ? 2 : 0);
      if (atkTier > 0) {
        ctx.save();
        const auraR = size * (atkTier === 2 ? 0.52 : 0.44);
        const ag = ctx.createRadialGradient(x, y + 4, 4, x, y + 4, auraR);
        ag.addColorStop(0, atkTier === 2 ? "rgba(255, 90, 60, 0.34)" : "rgba(255, 196, 80, 0.24)");
        ag.addColorStop(1, "rgba(255, 80, 40, 0)");
        ctx.fillStyle = ag;
        ctx.beginPath();
        ctx.arc(x, y + 4, auraR + Math.sin(this.time * 8) * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // High Attack Speed (ASPD) orbiting cyan-gold wind streaks
      const isFast = isAlly && (u.atkCd <= 0.86 || (this.synergies && this.synergies.archer));
      if (isFast) {
        ctx.save();
        const spin = this.time * (u.atkCd <= 0.65 ? 9.5 : 6.2);
        ctx.strokeStyle = "rgba(120, 238, 255, 0.68)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y + 2, size * 0.43, spin, spin + 1.15);
        ctx.stroke();
        ctx.strokeStyle = "rgba(255, 230, 140, 0.55)";
        ctx.beginPath();
        ctx.arc(x, y + 2, size * 0.46, spin + Math.PI, spin + Math.PI + 0.9);
        ctx.stroke();
        ctx.restore();
      }

      // Draw full-body character sprite!
      const artKey = isAlly ? (u.artKey ?? u.type) : (Art ? Art.getEnemyArtKey(u) : "enemy_melee");
      const img = Art ? Art.getSpriteImg(artKey) : null;

      // Speed afterimage ghost during lunge
      if (isFast && Math.abs(u.lunge) > 0.18 && img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.globalAlpha = 0.32;
        ctx.translate(x - u.lunge * 14, footY);
        ctx.drawImage(img, -size / 2, -size * 0.92, size, size);
        ctx.restore();
      }

      ctx.save();
      ctx.translate(x, footY);
      ctx.scale(1 / breath, breath);
      if (u.hitFlash > 0) {
        ctx.filter = "brightness(2.4) saturate(0.4)";
      }
      if (img && img.complete && img.naturalWidth > 0) {
        const drawSize = u.summonKind === "turret" ? 54 : size;
        ctx.drawImage(img, -drawSize / 2, -drawSize * 0.92, drawSize, drawSize);
      } else {
        ctx.fillStyle = u.color;
        ctx.beginPath();
        ctx.arc(0, -size * 0.45, size * 0.32, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Melee crescent slash arc ONLY for melee units; ranged/caster/turret get an energy muzzle flare!
      if (Math.abs(u.lunge) > 0.35) {
        const isRangedUnit = isAlly
          ? ["archer", "mage", "priest", "engineer", "necromancer", "bard", "turret"].includes(u.type)
          : (u.kind === "ranged" || u.kind === "caster");
        ctx.save();
        const dir = isAlly ? 1 : -1;
        ctx.globalAlpha = Math.min(1, Math.abs(u.lunge));
        if (isRangedUnit) {
          const fx = x + dir * (size * 0.38);
          const fy = y - 2;
          const flareR = atkTier === 2 ? 12 : atkTier === 1 ? 9 : 7;
          ctx.fillStyle = atkTier === 2 ? "#ffd86b" : u.color;
          ctx.beginPath();
          ctx.arc(fx, fy, flareR, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(fx, fy, flareR + 4, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          const arcR = size * (atkTier === 2 ? 0.56 : atkTier === 1 ? 0.46 : 0.36);
          ctx.strokeStyle = atkTier === 2 ? "#ff6b4a" : atkTier === 1 ? "#ffd86b" : u.color;
          ctx.lineWidth = atkTier === 2 ? 4.5 : 3;
          ctx.beginPath();
          ctx.arc(x + dir * 10, y, arcR, dir > 0 ? -0.9 : Math.PI - 0.9, dir > 0 ? 0.9 : Math.PI + 0.9);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Stars / Boss crown above head
      const headY = y - size * 0.5;
      if (isAlly && u.level > 1) {
        ctx.fillStyle = "#ffd86b";
        ctx.strokeStyle = "rgba(0,0,0,0.9)";
        ctx.lineWidth = 3;
        ctx.font = "800 11px sans-serif";
        ctx.textAlign = "center";
        ctx.strokeText("★".repeat(u.level), x, headY);
        ctx.fillText("★".repeat(u.level), x, headY);
      } else if (u.isBoss) {
        ctx.fillStyle = "#ff5964";
        ctx.strokeStyle = "rgba(0,0,0,0.95)";
        ctx.lineWidth = 3.5;
        ctx.font = "900 11px sans-serif";
        ctx.textAlign = "center";
        ctx.strokeText("BOSS", x, headY);
        ctx.fillText("BOSS", x, headY);
      }

      // Crisp RPG HP Bar + Shield Bar under feet
      const bw = u.isBoss ? 68 : 48;
      const bh = u.isBoss ? 7 : 5;
      const bx = x - bw / 2;
      const by = footY + 5;
      ctx.fillStyle = "rgba(6, 8, 14, 0.9)";
      ctx.fillRect(bx - 1.5, by - 1.5, bw + 3, bh + 3);
      const hpRatio = Math.max(0, u.hp / u.maxHp);
      ctx.fillStyle = isAlly ? "#3ddc97" : (u.isBoss ? "#ff3355" : "#f25f5c");
      ctx.fillRect(bx, by, bw * hpRatio, bh);

      if (u.shield > 0) {
        const shRatio = Math.min(1, u.shield / u.maxHp);
        ctx.fillStyle = "#6be5ff";
        ctx.fillRect(bx, by - 3, bw * shRatio, 2.5);
      }

      // Name label with dark outline for readability over flagstones
      ctx.font = '700 10.5px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
      ctx.textAlign = "center";
      ctx.strokeStyle = "rgba(5, 7, 12, 0.92)";
      ctx.lineWidth = 3;
      ctx.strokeText(u.name, x, by + 15);
      ctx.fillStyle = isAlly ? "#eef4ff" : (u.isBoss ? "#ffb3b8" : "#f3d5d7");
      ctx.fillText(u.name, x, by + 15);
    }

    _drawChapterAmbience(chapter) {
      const ctx = this.ctx;
      const { count, speed, drift, radius } = CHAPTER_AMBIENCE[chapter.key];
      const color = chapter.themeColor;
      const flicker = 0.08 + Math.sin(this.time * 9) * 0.025;
      ctx.save();
      for (const x of [this.w * 0.08, this.w * 0.92]) {
        const glow = ctx.createRadialGradient(x, this.h * 0.46, 4, x, this.h * 0.46, 115);
        glow.addColorStop(0, color);
        glow.addColorStop(1, color + "00");
        ctx.globalAlpha = flicker * 2.1;
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, this.w, this.h);
      }

      ctx.fillStyle = color;
      for (let i = 0; i < count; i += 1) {
        const phase = this.time * (1 + i % 3 * 0.18) + i * 1.7;
        const x = i * 0.618 + this.time * drift + Math.sin(phase) * 0.028;
        const y = i * 0.414 + this.time * speed * (1 + i % 4 * 0.15);
        ctx.globalAlpha = 0.28 + 0.18 * Math.sin(phase);
        ctx.beginPath();
        ctx.arc((x - Math.floor(x)) * this.w, (y - Math.floor(y)) * this.h,
          radius * (0.6 + i % 5 * 0.13), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    _render() {
      const ctx = this.ctx;
      const Art = globalThis.GameArt;
      const chapter = G.getChapter(this.run);
      ctx.save();
      if (this.shake > 0.2) {
        ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);
      }

      const bgImg = Art?.getSpriteImg(chapter.mapAsset);
      if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
        const imgRatio = bgImg.naturalWidth / bgImg.naturalHeight;
        const canRatio = this.w / this.h;
        let dw = this.w, dh = this.h, dx = 0, dy = 0;
        if (canRatio > imgRatio) {
          dh = this.w / imgRatio;
          dy = (this.h - dh) * 0.62;
        } else {
          dw = this.h * imgRatio;
          dx = (this.w - dw) * 0.5;
        }
        ctx.drawImage(bgImg, dx, dy, dw, dh);
        // Subtle vignette so characters pop
        const vig = ctx.createRadialGradient(this.w * 0.5, this.h * 0.55, this.w * 0.18, this.w * 0.5, this.h * 0.5, this.w * 0.65);
        vig.addColorStop(0, "rgba(10, 12, 20, 0.14)");
        vig.addColorStop(1, "rgba(6, 8, 14, 0.62)");
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, this.w, this.h);
      } else {
        const bg = ctx.createRadialGradient(this.w * 0.5, this.h * 0.45, 20, this.w * 0.5, this.h * 0.5, this.w * 0.7);
        bg.addColorStop(0, "#1c2233");
        bg.addColorStop(1, "#0b0e16");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, this.w, this.h);
      }

      this._drawChapterAmbience(chapter);

      // Subtle golden rune rings on stone floor for ally formation
      if (this.mode === "preview") {
        for (let i = 0; i < 6; i += 1) {
          const pos = this._allySlotPos(i);
          ctx.strokeStyle = i < 3 ? "rgba(79, 209, 165, 0.28)" : "rgba(92, 200, 255, 0.24)";
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.ellipse(pos.x, pos.y + 24, 26, 10, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = "rgba(235, 224, 196, 0.58)";
        ctx.strokeStyle = "rgba(0, 0, 0, 0.75)";
        ctx.lineWidth = 2.5;
        ctx.font = '700 11px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
        ctx.textAlign = "center";
        ctx.strokeText("后排", this.w * 0.24, 20);
        ctx.fillText("后排", this.w * 0.24, 20);
        ctx.strokeText("前排", this.w * 0.40, 20);
        ctx.fillText("前排", this.w * 0.40, 20);
        ctx.strokeText("来袭敌军", this.w * 0.62, 20);
        ctx.fillText("来袭敌军", this.w * 0.62, 20);
      }

      // Rings (AoE)
      for (const blast of this.mode === "fighting" ? this.blasts : []) {
        ctx.beginPath();
        ctx.arc(blast.x, blast.y, blast.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 51, 78, .15)";
        ctx.fill();
        ctx.strokeStyle = "#ff536c";
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(blast.x, blast.y, blast.radius * (1 - blast.time / 1.5), 0, Math.PI * 2);
        ctx.stroke();
      }
      for (const r of this.rings) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, r.life * 2.2);
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Beams (lightning / heal)
      for (const b of this.beams) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, b.life * 4);
        ctx.strokeStyle = b.color;
        ctx.lineWidth = b.jagged ? 2.8 : 3.2;
        ctx.beginPath();
        ctx.moveTo(b.x1, b.y1);
        if (b.jagged) {
          const mx = (b.x1 + b.x2) / 2 + (Math.random() - 0.5) * 18;
          const my = (b.y1 + b.y2) / 2 + (Math.random() - 0.5) * 18;
          ctx.lineTo(mx, my);
        }
        ctx.lineTo(b.x2, b.y2);
        ctx.stroke();
        ctx.restore();
      }

      // Depth-sorted units (sort by Y so foreground units overlap cleanly!)
      const allLiving = [
        ...this.allies.filter(a => a.alive).map(u => ({ u, isAlly: true })),
        ...this.enemies.filter(e => e.alive).map(u => ({ u, isAlly: false }))
      ].sort((a, b) => a.u.y - b.u.y);
      for (const item of allLiving) {
        this._drawUnit(item.u, item.isAlly);
      }
      for (const boss of this.enemies) {
        if (!boss.alive || !(boss.rageBubbleUntil > this.time)) continue;
        const text = "第二阶段 · 狂暴觉醒";
        ctx.save();
        ctx.font = '800 13px sans-serif';
        ctx.textAlign = "center";
        const width = ctx.measureText(text).width + 24;
        const x = Math.min(this.w - width / 2 - 4, Math.max(width / 2 + 4, boss.x));
        const y = Math.max(10, boss.y - 64);
        ctx.beginPath();
        ctx.roundRect(x - width / 2, y, width, 23, 7);
        ctx.fillStyle = "#431d37";
        ctx.fill();
        ctx.strokeStyle = "#ff86ae";
        ctx.stroke();
        ctx.fillStyle = "#ffe0ed";
        ctx.fillText(text, x, y + 16);
        ctx.restore();
      }

      // Projectiles
      for (const p of this.projectiles) {
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Particles
      for (const p of this.particles) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Floating damage/heal texts
      for (const t of this.texts) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, (t.life / t.maxLife) * 2.4);
        ctx.font = `900 ${t.size}px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif`;
        ctx.textAlign = "center";
        ctx.strokeStyle = "rgba(0,0,0,0.95)";
        ctx.lineWidth = 3.5;
        ctx.strokeText(t.text, t.x, t.y);
        ctx.fillStyle = t.color;
        ctx.fillText(t.text, t.x, t.y);
        ctx.restore();
      }

      // Dedicated Top-of-Arena Raid Boss Health Bar when a Boss is active!
      const activeBoss = this.enemies.find(e => e.alive && e.isBoss);
      if (activeBoss) {
        const bw = Math.min(460, this.w - 80);
        const bx = (this.w - bw) / 2;
        const by = 12;
        ctx.save();
        ctx.fillStyle = "rgba(10, 8, 16, 0.86)";
        ctx.strokeStyle = activeBoss.phaseTwo ? "#ff9ce5" : "#ff4d6d";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect(bx - 10, by - 4, bw + 20, 34, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#ffe6a3";
        ctx.font = '800 12px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
        ctx.textAlign = "left";
        ctx.fillText(`☠️ ${activeBoss.name}${activeBoss.phaseTwo ? " · 狂暴 P2" : ""}`, bx, by + 10);

        ctx.textAlign = "right";
        ctx.fillStyle = "#ffb3be";
        ctx.font = '700 11.5px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
        ctx.fillText(`${Math.ceil(activeBoss.hp)} / ${activeBoss.maxHp}${activeBoss.shield > 0 ? ` (+${Math.ceil(activeBoss.shield)}盾)` : ""}`, bx + bw, by + 10);

        // Bar track
        ctx.fillStyle = "#1c121b";
        ctx.fillRect(bx, by + 16, bw, 9);
        const ratio = Math.max(0, activeBoss.hp / activeBoss.maxHp);
        const bgGrad = ctx.createLinearGradient(bx, 0, bx + bw, 0);
        bgGrad.addColorStop(0, "#c9184a");
        bgGrad.addColorStop(1, "#ff4d6d");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(bx, by + 16, bw * ratio, 9);
        if (activeBoss.shield > 0) {
          ctx.fillStyle = "#6be5ff";
          ctx.fillRect(bx, by + 13, bw * Math.min(1, activeBoss.shield / activeBoss.maxHp), 2.5);
        }
        ctx.restore();
      }

      // Result Banner
      if (this.resultBanner) {
        ctx.save();
        ctx.globalAlpha = this.resultBanner.alpha;
        ctx.fillStyle = "rgba(8, 10, 16, 0.72)";
        ctx.fillRect(0, this.h * 0.34, this.w, this.h * 0.32);
        ctx.textAlign = "center";
        ctx.fillStyle = this.resultBanner.won ? "#ffd86b" : "#ff595e";
        ctx.font = '900 26px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
        ctx.fillText(this.resultBanner.title, this.w * 0.5, this.h * 0.48);
        ctx.fillStyle = "#dbe4f3";
        ctx.font = '600 13px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
        ctx.fillText(this.resultBanner.sub, this.w * 0.5, this.h * 0.58);
        ctx.restore();
      }

      ctx.restore();
    }

    _loop(ts) {
      const rawDt = this._lastTs ? Math.min(0.05, (ts - this._lastTs) / 1000) : 0.016;
      this._lastTs = ts;
      const dt = this.mode === "fighting" ? rawDt * this.speed : rawDt;
      this._update(dt);
      this._render();
      this._raf = requestAnimationFrame(this._loop);
    }
  }

  globalThis.BattleArena = BattleArena;
})();
