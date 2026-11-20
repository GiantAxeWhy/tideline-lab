(() => {
  "use strict";

  // Bespoke 16x16 Crisp Pixel-Art HUD & Arcade UI Icons (zero system emojis!)
  const UI_ICONS = {
    coin: `<svg viewBox="0 0 16 16" shape-rendering="crispEdges" class="ui-ico">
      <rect x="5" y="1" width="6" height="1" fill="#0b0914"/><rect x="3" y="2" width="2" height="1" fill="#0b0914"/><rect x="11" y="2" width="2" height="1" fill="#0b0914"/>
      <rect x="2" y="3" width="1" height="2" fill="#0b0914"/><rect x="13" y="3" width="1" height="2" fill="#0b0914"/>
      <rect x="1" y="5" width="1" height="6" fill="#0b0914"/><rect x="14" y="5" width="1" height="6" fill="#0b0914"/>
      <rect x="2" y="11" width="1" height="2" fill="#0b0914"/><rect x="13" y="11" width="1" height="2" fill="#0b0914"/>
      <rect x="3" y="13" width="2" height="1" fill="#0b0914"/><rect x="11" y="13" width="2" height="1" fill="#0b0914"/><rect x="5" y="14" width="6" height="1" fill="#0b0914"/>
      <rect x="5" y="2" width="6" height="1" fill="#fff3b0"/><rect x="3" y="3" width="10" height="2" fill="#f7cf6d"/>
      <rect x="2" y="5" width="12" height="6" fill="#f5c451"/><rect x="3" y="11" width="10" height="2" fill="#d19226"/><rect x="5" y="13" width="6" height="1" fill="#9e6914"/>
      <rect x="4" y="3" width="2" height="2" fill="#ffffff"/><rect x="7" y="4" width="2" height="8" fill="#a86d12"/><rect x="6" y="5" width="1" height="6" fill="#fff3b0"/>
    </svg>`,
    heart: `<svg viewBox="0 0 16 16" shape-rendering="crispEdges" class="ui-ico">
      <rect x="2" y="2" width="4" height="1" fill="#0b0914"/><rect x="10" y="2" width="4" height="1" fill="#0b0914"/>
      <rect x="1" y="3" width="1" height="5" fill="#0b0914"/><rect x="6" y="3" width="1" height="1" fill="#0b0914"/><rect x="9" y="3" width="1" height="1" fill="#0b0914"/><rect x="14" y="3" width="1" height="5" fill="#0b0914"/>
      <rect x="7" y="4" width="2" height="1" fill="#0b0914"/>
      <rect x="2" y="8" width="1" height="2" fill="#0b0914"/><rect x="13" y="8" width="1" height="2" fill="#0b0914"/>
      <rect x="3" y="10" width="2" height="1" fill="#0b0914"/><rect x="11" y="10" width="2" height="1" fill="#0b0914"/>
      <rect x="5" y="11" width="1" height="2" fill="#0b0914"/><rect x="10" y="11" width="1" height="2" fill="#0b0914"/>
      <rect x="6" y="13" width="1" height="1" fill="#0b0914"/><rect x="9" y="13" width="1" height="1" fill="#0b0914"/><rect x="7" y="14" width="2" height="1" fill="#0b0914"/>
      <rect x="2" y="3" width="4" height="5" fill="#ff5964"/><rect x="10" y="3" width="4" height="5" fill="#ff5964"/>
      <rect x="6" y="4" width="1" height="4" fill="#ff5964"/><rect x="9" y="4" width="1" height="4" fill="#ff5964"/><rect x="7" y="5" width="2" height="8" fill="#e63950"/>
      <rect x="3" y="8" width="10" height="2" fill="#e63950"/><rect x="5" y="10" width="6" height="1" fill="#b81d38"/><rect x="6" y="11" width="4" height="2" fill="#b81d38"/><rect x="7" y="13" width="2" height="1" fill="#8f1128"/>
      <rect x="3" y="4" width="2" height="2" fill="#ffb8c1"/>
    </svg>`,
    sword: `<svg viewBox="0 0 16 16" shape-rendering="crispEdges" class="ui-ico">
      <rect x="11" y="1" width="4" height="4" fill="#ffffff"/><rect x="9" y="3" width="4" height="4" fill="#9ee6ff"/><rect x="7" y="5" width="4" height="4" fill="#5cc8ff"/><rect x="5" y="7" width="4" height="4" fill="#3898d6"/>
      <rect x="3" y="8" width="2" height="2" fill="#ffd86b"/><rect x="6" y="11" width="2" height="2" fill="#ffd86b"/><rect x="4" y="10" width="2" height="2" fill="#f5b841"/>
      <rect x="2" y="12" width="2" height="2" fill="#8f5b3c"/><rect x="1" y="13" width="2" height="2" fill="#ffd86b"/>
    </svg>`,
    rig: `<svg viewBox="0 0 16 16" shape-rendering="crispEdges" class="ui-ico">
      <rect x="2" y="4" width="12" height="2" fill="#5d6e96"/><rect x="2" y="10" width="12" height="2" fill="#5d6e96"/>
      <rect x="4" y="2" width="4" height="6" fill="#c084fc"/><rect x="5" y="3" width="2" height="4" fill="#f3e8ff"/>
      <rect x="9" y="8" width="4" height="6" fill="#ffd86b"/><rect x="10" y="9" width="2" height="4" fill="#fff7d6"/>
    </svg>`,
    lock: `<svg viewBox="0 0 16 16" shape-rendering="crispEdges" class="ui-ico">
      <rect x="5" y="2" width="6" height="2" fill="#ffe6a3"/><rect x="4" y="4" width="2" height="3" fill="#f5c869"/><rect x="10" y="4" width="2" height="3" fill="#f5c869"/>
      <rect x="3" y="7" width="10" height="7" fill="#f5c869"/><rect x="3" y="7" width="10" height="2" fill="#ffe8a3"/><rect x="3" y="13" width="10" height="1" fill="#a8741a"/>
      <rect x="7" y="9" width="2" height="3" fill="#1a1206"/>
    </svg>`,
    soundOn: `<svg viewBox="0 0 16 16" shape-rendering="crispEdges" class="ui-ico">
      <rect x="2" y="6" width="3" height="4" fill="currentColor"/><rect x="5" y="4" width="2" height="8" fill="currentColor"/><rect x="7" y="2" width="2" height="12" fill="currentColor"/>
      <rect x="11" y="5" width="1" height="6" fill="#6be5ff"/><rect x="13" y="3" width="1" height="10" fill="#6be5ff"/>
    </svg>`,
    soundOff: `<svg viewBox="0 0 16 16" shape-rendering="crispEdges" class="ui-ico">
      <rect x="2" y="6" width="3" height="4" fill="currentColor" fill-opacity=".45"/><rect x="5" y="4" width="2" height="8" fill="currentColor" fill-opacity=".45"/><rect x="7" y="2" width="2" height="12" fill="currentColor" fill-opacity=".45"/>
      <rect x="10" y="5" width="2" height="2" fill="#ff5964"/><rect x="13" y="5" width="2" height="2" fill="#ff5964"/><rect x="11" y="7" width="3" height="2" fill="#ff5964"/><rect x="10" y="9" width="2" height="2" fill="#ff5964"/><rect x="13" y="9" width="2" height="2" fill="#ff5964"/>
    </svg>`,
    swap: `<svg viewBox="0 0 16 16" shape-rendering="crispEdges" class="ui-ico">
      <rect x="3" y="4" width="8" height="2" fill="currentColor"/><rect x="9" y="2" width="2" height="2" fill="currentColor"/><rect x="11" y="4" width="2" height="2" fill="currentColor"/><rect x="9" y="6" width="2" height="2" fill="currentColor"/>
      <rect x="5" y="10" width="8" height="2" fill="currentColor"/><rect x="5" y="8" width="2" height="2" fill="currentColor"/><rect x="3" y="10" width="2" height="2" fill="currentColor"/><rect x="5" y="12" width="2" height="2" fill="currentColor"/>
    </svg>`,
    absorb: `<svg viewBox="0 0 16 16" shape-rendering="crispEdges" class="ui-ico">
      <rect x="7" y="1" width="2" height="2" fill="#ffd86b"/><rect x="6" y="3" width="4" height="2" fill="#ff8c38"/>
      <rect x="4" y="5" width="8" height="3" fill="#ff5964"/><rect x="3" y="8" width="10" height="4" fill="#e63950"/><rect x="5" y="12" width="6" height="2" fill="#b81d38"/>
      <rect x="6" y="7" width="4" height="4" fill="#fff3b0"/>
    </svg>`,
    boss: `<svg viewBox="0 0 16 16" shape-rendering="crispEdges" class="ui-ico">
      <rect x="4" y="2" width="8" height="2" fill="#ff8c96"/><rect x="3" y="4" width="10" height="6" fill="#ff5964"/>
      <rect x="4" y="10" width="8" height="2" fill="#e63950"/><rect x="4" y="12" width="2" height="2" fill="#e63950"/><rect x="7" y="12" width="2" height="2" fill="#e63950"/><rect x="10" y="12" width="2" height="2" fill="#e63950"/>
      <rect x="5" y="6" width="2" height="2" fill="#14060a"/><rect x="9" y="6" width="2" height="2" fill="#14060a"/>
    </svg>`,
    crest: `<svg viewBox="0 0 16 16" shape-rendering="crispEdges" class="ui-ico-lg">
      <rect x="7" y="2" width="2" height="2" fill="#fff6bd"/><rect x="2" y="4" width="2" height="2" fill="#ffe07d"/><rect x="12" y="4" width="2" height="2" fill="#ffe07d"/>
      <rect x="6" y="4" width="4" height="3" fill="#ffd86b"/><rect x="2" y="6" width="12" height="4" fill="#f5c451"/>
      <rect x="3" y="10" width="10" height="2" fill="#d99526"/><rect x="3" y="12" width="10" height="2" fill="#9e6712"/>
      <rect x="7" y="7" width="2" height="3" fill="#ff4d6d"/><rect x="4" y="8" width="1" height="2" fill="#6be5ff"/><rect x="11" y="8" width="1" height="2" fill="#6be5ff"/>
    </svg>`
  };

  // All 29 Bespoke 32x32 Crisp Pixel-Art Hero SVGs (1~5 Cost: 6 White + 6 Green + 6 Blue + 6 Purple + 5 Gold)
  const HERO_SPRITES = {
    // 1-Cost White (6)
    knight: "assets/heroes/hero-knight.svg",
    assassin: "assets/heroes/hero-assassin.svg",
    valkyrie: "assets/heroes/hero-valkyrie.svg",
    archer: "assets/heroes/hero-archer.svg",
    mage: "assets/heroes/hero-mage.svg",
    priest: "assets/heroes/hero-priest.svg",
    // 2-Cost Green (6)
    berserker: "assets/heroes/hero-berserker.svg",
    engineer: "assets/heroes/hero-engineer.svg",
    frost_warden: "assets/heroes/hero-frost-warden.svg",
    moon_druid: "assets/heroes/hero-moon-druid.svg",
    plague_alchemist: "assets/heroes/hero-plague-alchemist.svg",
    royal_halberd: "assets/heroes/hero-royal-halberd.svg",
    // 3-Cost Blue (6)
    necromancer: "assets/heroes/hero-necromancer.svg",
    bard: "assets/heroes/hero-bard.svg",
    shadow_blade: "assets/heroes/hero-shadow-blade.svg",
    thunder_shaman: "assets/heroes/hero-thunder-shaman.svg",
    star_ranger: "assets/heroes/hero-star-ranger.svg",
    iron_inquisitor: "assets/heroes/hero-iron-inquisitor.svg",
    // 4-Cost Purple (6)
    sun_templar: "assets/heroes/hero-sun-templar.svg",
    chrono_mage: "assets/heroes/hero-chrono-mage.svg",
    dread_knight_lord: "assets/heroes/hero-dread-knight.svg",
    dragon_cannoneer: "assets/heroes/hero-dragon-cannoneer.svg",
    blood_empress: "assets/heroes/hero-blood-empress.svg",
    sylvan_archon: "assets/heroes/hero-sylvan-archon.svg",
    // 5-Cost Gold (5)
    astral_valkyrie: "assets/heroes/hero-astral-valkyrie.svg",
    void_emperor: "assets/heroes/hero-void-emperor.svg",
    titan_warlord: "assets/heroes/hero-titan-warlord.svg",
    celestial_seraph: "assets/heroes/hero-celestial-seraph.svg",
    celestial_artemis: "assets/heroes/hero-celestial-artemis.svg"
  };

  // All 21 Bespoke Crisp Pixel-Art Enemy (32x32) & Chapter Boss (48x48) SVGs — zero realistic PNGs or vector blobs!
  const ENEMY_SPRITES = {
    // Chapter 1: 暮色古堡
    ch1_goblin_raider: "assets/enemies/ch1/goblin-raider.svg",
    ch1_orc_brute: "assets/enemies/ch1/orc-brute.svg",
    ch1_goblin_scout: "assets/enemies/ch1/goblin-scout.svg",
    ch1_boss_warlord: "assets/enemies/ch1/boss-warlord.svg",
    // Chapter 2: 幽冥地窟
    ch2_crypt_ghoul: "assets/enemies/ch2/crypt-ghoul.svg",
    ch2_bone_archer: "assets/enemies/ch2/bone-archer.svg",
    ch2_necro_acolyte: "assets/enemies/ch2/necro-acolyte.svg",
    ch2_bone_priest: "assets/enemies/ch2/bone-priest.svg",
    ch2_boss_lich: "assets/enemies/ch2/boss-lich.svg",
    // Chapter 3: 凛冬要塞
    ch3_frost_guard: "assets/enemies/ch3/frost-guard.svg",
    ch3_blizzard_yeti: "assets/enemies/ch3/blizzard-yeti.svg",
    ch3_ice_assassin: "assets/enemies/ch3/ice-assassin.svg",
    ch3_boss_icequeen: "assets/enemies/ch3/boss-icequeen.svg",
    // Chapter 4: 熔岩祭坛
    ch4_lava_imp: "assets/enemies/ch4/lava-imp.svg",
    ch4_hell_hound: "assets/enemies/ch4/hell-hound.svg",
    ch4_obsidian_golem: "assets/enemies/ch4/obsidian-golem.svg",
    ch4_boss_balrog: "assets/enemies/ch4/boss-balrog.svg",
    // Chapter 5: 星界神殿
    ch5_void_stalker: "assets/enemies/ch5/void-stalker.svg",
    ch5_astral_sentinel: "assets/enemies/ch5/astral-sentinel.svg",
    ch5_star_mage: "assets/enemies/ch5/star-mage.svg",
    ch5_boss_dragon: "assets/enemies/ch5/boss-dragon.svg",
    // Clean pixel-art role & boss fallback aliases
    enemy_melee: "assets/enemies/ch1/goblin-raider.svg",
    enemy_tank: "assets/enemies/ch1/orc-brute.svg",
    enemy_ranged: "assets/enemies/ch1/goblin-scout.svg",
    enemy_caster: "assets/enemies/ch2/necro-acolyte.svg",
    enemy_assassin: "assets/enemies/ch3/ice-assassin.svg",
    boss_grom: "assets/enemies/ch1/boss-warlord.svg",
    boss_lich: "assets/enemies/ch2/boss-lich.svg",
    boss_icequeen: "assets/enemies/ch3/boss-icequeen.svg",
    boss_balrog: "assets/enemies/ch4/boss-balrog.svg",
    boss_dragon: "assets/enemies/ch5/boss-dragon.svg"
  };

  // Unified art URL map
  const SPRITE_URLS = {
    ...HERO_SPRITES,
    ...ENEMY_SPRITES,
    joker: "assets/heroes/hero-joker.svg",
    turret: "assets/heroes/summon-turret.svg",
    skeleton: "assets/heroes/summon-skeleton.svg",
    arenaBg: "assets/arena-bg.webp",
    fateCrystal: "assets/items/crystal-fate.svg",
    shopSlot: "assets/items/shop-unlock-slot.svg",
    shopAnvil: "assets/items/shop-enchant-anvil.svg",
    shopHourglass: "assets/items/shop-potion-nudge.svg",
    shopDice: "assets/items/shop-dice-rig.svg",
    endlessCrown: "assets/items/endless-crown.svg",
    map_citadel: "assets/maps/map-01-citadel.webp",
    map_catacombs: "assets/maps/map-02-catacombs.svg",
    map_frostpeak: "assets/maps/map-03-frostpeak.svg",
    map_inferno: "assets/maps/map-04-inferno.svg",
    map_astral: "assets/maps/map-05-astral.svg"
  };

  const IMAGE_CACHE = new Map();

  function loadSpriteUrl(url) {
    if (!url) return null;
    if (IMAGE_CACHE.has(url)) return IMAGE_CACHE.get(url);
    const img = new Image();
    img._retries = 0;
    img.onerror = () => {
      if (img._retries < 3) {
        img._retries += 1;
        const delay = img._retries * 350;
        setTimeout(() => {
          img.src = `${url}${url.includes("?") ? "&" : "?"}r=${img._retries}`;
        }, delay);
      }
    };
    img.src = url;
    IMAGE_CACHE.set(url, img);
    return img;
  }

  function getSpriteImg(keyOrUrl) {
    if (!keyOrUrl) return null;
    const url = SPRITE_URLS[keyOrUrl] || keyOrUrl;
    return loadSpriteUrl(url);
  }

  function getEnemyArtKey(enemy) {
    if (enemy.artKey && SPRITE_URLS[enemy.artKey]) return enemy.artKey;
    if (enemy.bossId && SPRITE_URLS["boss_" + enemy.bossId]) return "boss_" + enemy.bossId;
    return "enemy_" + (enemy.kind || "melee");
  }

  function renderPortraitImg(key, alt = "", cls = "art-sprite") {
    const url = SPRITE_URLS[key] || SPRITE_URLS.knight;
    return `<img src="${url}" alt="${alt}" class="${cls}" draggable="false">`;
  }

  globalThis.GameArt = {
    HERO_SPRITES,
    ENEMY_SPRITES,
    SPRITE_URLS,
    UI_ICONS,
    getSpriteImg,
    getEnemyArtKey,
    renderPortraitImg
  };
})();
