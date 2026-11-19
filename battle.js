(() => {
  "use strict";

  const G = globalThis.Slotbound;

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
      // 0,1,2 front col (closer to center); 3,4,5 back col (closer to left)
      const isFront = slotIdx < 3;
      const row = slotIdx % 3;
      const x = isFront ? this.w * 0.34 : this.w * 0.16;
      const y = this.h * (0.24 + row * 0.26);
      return { x, y };
    }

    _enemySlotPos(idx, total) {
      const cols = total <= 3 ? 1 : 2;
      const col = idx < Math.ceil(total / cols) ? 0 : 1;
      const perCol = col === 0 ? Math.ceil(total / cols) : total - Math.ceil(total / cols);
      const rowIdx = col === 0 ? idx : idx - Math.ceil(total / cols);
      const x = cols === 1 ? this.w * 0.75 : (col === 0 ? this.w * 0.68 : this.w * 0.85);
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

      this.allies = [];
      run.field.forEach((u, idx) => {
        if (!u) return;
        const pos = this._allySlotPos(idx);
        const st = G.getUnitStats(u, run);
        let shield = u.type === "knight" ? 25 : 0;
        if (knightSyn) shield += 35;
        if (idx < 3 && G.hasCore(run, "vanguard_oath")) shield += 30;
        if (u.evolution === "fortress") shield += Math.round(st.hp * 0.5);

        this.allies.push({
          uid: u.id,
          side: "ally",
          slotIdx: idx,
          type: u.type,
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
          shield,
          atk: st.atk,
          crit: st.crit,
          atkCd: st.atkCd,
          cdTimer: st.atkCd * (0.3 + Math.random() * 0.4),
          atkCount: 0,
          fortressTimer: 4.0,
          lunge: 0,
          hitFlash: 0,
          slowTimer: 0,
          atkBuff: 1,
          alive: true,
          radius: st.level >= 3 ? 23 : st.level === 2 ? 20 : 18
        });
      });

      const waveDef = G.WAVES[Math.min(run.wave - 1, G.WAVES.length - 1)];
      this.enemies = waveDef.enemies.map((e, idx) => {
        const pos = this._enemySlotPos(idx, waveDef.enemies.length);
        const isBoss = e.kind === "boss";
        return {
          uid: "e-" + idx,
          side: "enemy",
          kind: e.kind,
          bossId: e.bossId || null,
          name: e.name,
          color: e.color,
          x: pos.x,
          y: pos.y,
          homeX: pos.x,
          homeY: pos.y,
          hp: e.hp,
          maxHp: e.hp,
          shield: isBoss ? Math.round(e.hp * 0.08) : 0,
          atk: e.atk,
          crit: isBoss ? 0.15 : 0.08,
          atkCd: e.cd,
          cdTimer: e.cd * (0.4 + Math.random() * 0.4),
          skillTimer: isBoss ? 4.2 : 999,
          enrage: 1,
          lunge: 0,
          hitFlash: 0,
          slowTimer: 0,
          alive: true,
          isBoss,
          radius: isBoss ? 29 : e.kind === "tank" ? 21 : 17
        };
      });
    }

    startBattle(run, onFinish) {
      this.syncPreview(run);
      this.mode = "fighting";
      this.onFinish = onFinish;
      this.healTick = 0;

      const syns = G.getActiveSynergies(run);
      this.synergies = {
        archer: syns.find(s => s.type === "archer")?.active,
        mage: syns.find(s => s.type === "mage")?.active,
        priest: syns.find(s => s.type === "priest")?.active,
        assassin: syns.find(s => s.type === "assassin")?.active
      };

      if (this.allies.length === 0) {
        this._endBattle(false);
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
          cb(won);
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
      if (!target || !target.alive) return 0;
      let dmg = Math.max(1, Math.round(rawDmg));
      const isCrit = !!opts.isCrit;

      if (target.shield > 0) {
        const absorbed = Math.min(target.shield, dmg);
        target.shield -= absorbed;
        dmg -= absorbed;
      }
      if (dmg > 0) {
        target.hp = Math.max(0, target.hp - dmg);
      }
      target.hitFlash = 0.16;

      const txt = isCrit ? `${Math.round(rawDmg)}!` : `${Math.round(rawDmg)}`;
      const col = opts.color || (isCrit ? "#ffd86b" : "#f5f7ff");
      this._spawnText(target.x, target.y, txt, col, isCrit ? 18 : 13);
      this._spawnParticles(target.x, target.y, opts.particleColor || target.color, isCrit ? 10 : 5);

      if (isCrit) {
        this.shake = Math.max(this.shake, 4);
        if (globalThis.SFX) globalThis.SFX.crit();
      } else if (globalThis.SFX) {
        globalThis.SFX.hit();
      }

      // Thorns reflection
      if (target.side === "ally" && target.evolution === "thorns" && attacker && attacker.alive && !opts.isReflect) {
        const refDmg = Math.max(3, Math.round(rawDmg * 0.35));
        this._applyDamage(target, attacker, refDmg, { color: "#4fd1a5", isReflect: true });
      }

      if (target.hp <= 0 && target.alive) {
        target.alive = false;
        this._spawnParticles(target.x, target.y, target.color, target.isBoss ? 26 : 14);
        if (target.isBoss) this.shake = 10;

        // Bladedancer kill reset
        if (attacker && attacker.side === "ally" && attacker.evolution === "bladedancer" && attacker.alive) {
          attacker.cdTimer = 0.08;
          const heal = Math.round(attacker.maxHp * 0.25);
          attacker.hp = Math.min(attacker.maxHp, attacker.hp + heal);
          this._spawnText(attacker.x, attacker.y - 10, `+${heal}`, "#4fd1a5", 13);
        }
      }
      return rawDmg;
    }

    _pickTarget(actor, foes) {
      const living = foes.filter(f => f.alive);
      if (living.length === 0) return null;

      // Assassins target backline / lowest HP
      if (actor.type === "assassin" || actor.kind === "assassin") {
        return [...living].sort((a, b) => (b.homeX - a.homeX) * (actor.side === "ally" ? 1 : -1) || a.hp - b.hp)[0];
      }

      // Prefer frontliners / tanks
      if (actor.side === "enemy") {
        const front = living.filter(u => u.slotIdx < 3);
        const pool = front.length ? front : living;
        // Prefer thorns/knight taunt
        const taunt = pool.find(u => u.type === "knight");
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
      const critMult = hasCritDice ? 2.1 : 1.65;
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

      if (u.type === "archer") {
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
          ally.hp = Math.min(ally.maxHp, ally.hp + healAmt);
          this.beams.push({ x1: u.x, y1: u.y, x2: ally.x, y2: ally.y, color: "#57e39c", life: 0.26, jagged: false });
          this._spawnText(ally.x, ally.y - 6, `+${healAmt}`, "#57e39c", 13);
          if (u.evolution === "seraph") {
            ally.atkBuff = Math.max(ally.atkBuff, 1.2);
          }
          if (u.evolution === "artificer") {
            const sh = Math.round(healAmt * 0.9);
            ally.shield += sh;
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

      if (e.kind === "ranged" || e.kind === "caster") {
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

    _performBossSkill(boss) {
      const livingAllies = this.allies.filter(a => a.alive);
      if (livingAllies.length === 0) return;
      if (globalThis.SFX) globalThis.SFX.bossSkill();
      this.shake = 8;

      if (boss.bossId === "grom") {
        this.rings.push({ x: boss.x, y: boss.y, r: 16, maxR: 280, color: "#ff595e", life: 0.45 });
        boss.shield += Math.round(boss.maxHp * 0.12);
        this._spawnText(boss.x, boss.y - 24, "裂地重击!", "#ff595e", 16);
        livingAllies.forEach(a => this._applyDamage(boss, a, boss.atk * 0.85, { color: "#ff7a7e" }));
      } else if (boss.bossId === "lich") {
        this._spawnText(boss.x, boss.y - 24, "幽冥连锁!", "#c77dff", 16);
        let drained = 0;
        livingAllies.slice(0, 3).forEach(a => {
          this.beams.push({ x1: boss.x, y1: boss.y, x2: a.x, y2: a.y, color: "#b5179e", life: 0.32, jagged: true });
          drained += this._applyDamage(boss, a, boss.atk * 0.9, { color: "#e0aaff" });
        });
        const heal = Math.round(drained * 0.35);
        boss.hp = Math.min(boss.maxHp, boss.hp + heal);
        this._spawnText(boss.x, boss.y - 6, `+${heal}`, "#c77dff", 14);
      } else {
        // Dragon
        this.rings.push({ x: boss.x, y: boss.y, r: 20, maxR: 340, color: "#ff2a55", life: 0.5 });
        boss.enrage = Math.min(1.6, boss.enrage + 0.14);
        this._spawnText(boss.x, boss.y - 26, "毁灭龙息!", "#ff4d6d", 17);
        livingAllies.forEach(a => this._applyDamage(boss, a, boss.atk * 0.95, { color: "#ff6b6b" }));
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

      // Priest synergy HoT
      if (this.synergies.priest) {
        this.healTick += dt;
        if (this.healTick >= 2.0) {
          this.healTick -= 2.0;
          this.allies.filter(a => a.alive).forEach(a => {
            const h = Math.max(4, Math.round(a.maxHp * 0.04));
            a.hp = Math.min(a.maxHp, a.hp + h);
            this._spawnText(a.x, a.y - 8, `+${h}`, "#57e39c", 11);
          });
        }
      }

      // Allies tick
      for (const u of this.allies) {
        if (!u.alive) continue;
        if (u.hitFlash > 0) u.hitFlash -= dt;
        if (u.lunge > 0) u.lunge = Math.max(0, u.lunge - dt * 5);

        if (u.evolution === "fortress") {
          u.fortressTimer -= dt;
          if (u.fortressTimer <= 0) {
            u.fortressTimer = 4.0;
            const sh = Math.round(u.maxHp * 0.18);
            u.shield += sh;
            this._spawnText(u.x, u.y - 16, `+${sh}盾`, "#6be5ff", 12);
          }
        }

        let spdMult = this.synergies.archer ? 1.18 : 1;
        if (G.hasCore(this.run, "berserk_banner") && u.hp / u.maxHp < 0.55) {
          spdMult *= 1.45;
        }
        u.cdTimer -= dt * spdMult;
        if (u.cdTimer <= 0) {
          u.cdTimer = u.atkCd;
          this._performAllyAttack(u);
        }
      }

      // Enemies tick
      for (const e of this.enemies) {
        if (!e.alive) continue;
        if (e.hitFlash > 0) e.hitFlash -= dt;
        if (e.lunge < 0) e.lunge = Math.min(0, e.lunge + dt * 5);
        if (e.slowTimer > 0) e.slowTimer -= dt;

        const spdMult = (e.slowTimer > 0 ? 0.65 : 1) * e.enrage;
        e.cdTimer -= dt * spdMult;
        if (e.cdTimer <= 0) {
          e.cdTimer = e.atkCd;
          this._performEnemyAttack(e);
        }
        if (e.isBoss) {
          e.skillTimer -= dt;
          if (e.skillTimer <= 0) {
            e.skillTimer = e.bossId === "dragon" ? 4.0 : 4.4;
            this._performBossSkill(e);
          }
        }
      }

      // Check win / loss
      const alliesAlive = this.allies.some(a => a.alive);
      const enemiesAlive = this.enemies.some(e => e.alive);
      if (!enemiesAlive) {
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
      const size = u.isBoss ? 86 : (isAlly && u.level >= 3 ? 68 : isAlly && u.level === 2 ? 62 : 56);
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
          ? "rgba(255, 70, 95, 0.75)"
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

      // Draw full-body character sprite!
      const artKey = isAlly ? u.type : (Art ? Art.getEnemyArtKey(u) : "enemy_melee");
      const img = Art ? Art.getSpriteImg(artKey) : null;

      ctx.save();
      ctx.translate(x, footY);
      ctx.scale(1 / breath, breath);
      if (u.hitFlash > 0) {
        ctx.filter = "brightness(2.4) saturate(0.4)";
      }
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, -size / 2, -size * 0.92, size, size);
      } else {
        // Minimal fallback if image still loading
        ctx.fillStyle = u.color;
        ctx.beginPath();
        ctx.arc(0, -size * 0.45, size * 0.32, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

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

    _render() {
      const ctx = this.ctx;
      const Art = globalThis.GameArt;
      ctx.save();
      if (this.shake > 0.2) {
        ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);
      }

      // Painted dark-fantasy castle courtyard arena backdrop
      const bgImg = Art ? Art.getSpriteImg("arenaBg") : null;
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

      // Ambient warm flickering torchlight & floating embers
      const flicker = 0.08 + Math.sin(this.time * 9) * 0.025 + Math.cos(this.time * 15) * 0.015;
      for (const tx of [this.w * 0.08, this.w * 0.92]) {
        const tg = ctx.createRadialGradient(tx, this.h * 0.46, 4, tx, this.h * 0.46, 115);
        tg.addColorStop(0, `rgba(255, 168, 64, ${flicker * 2.1})`);
        tg.addColorStop(1, "rgba(255, 120, 30, 0)");
        ctx.fillStyle = tg;
        ctx.fillRect(0, 0, this.w, this.h);
      }

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
        ctx.strokeText("后排", this.w * 0.16, 20);
        ctx.fillText("后排", this.w * 0.16, 20);
        ctx.strokeText("前排", this.w * 0.34, 20);
        ctx.fillText("前排", this.w * 0.34, 20);
        ctx.strokeText("来袭敌军", this.w * 0.76, 20);
        ctx.fillText("来袭敌军", this.w * 0.76, 20);
      }

      // Rings (AoE)
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
