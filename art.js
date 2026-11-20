(() => {
  "use strict";

  const INK = "#0d0a12";

  // High-craft dark-fantasy chibi character & emblem SVGs (160x160)
  // Matching bold ink outlines, multi-stop cel shading, and glowing runes
  const CHARACTER_SVGS = {
    knight: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="kSteel" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#8aa0b8"/><stop offset="50%" stop-color="#435268"/><stop offset="100%" stop-color="#1f2736"/></linearGradient>
        <linearGradient id="kGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffe79e"/><stop offset="55%" stop-color="#d99c38"/><stop offset="100%" stop-color="#7c5012"/></linearGradient>
        <linearGradient id="kShield" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#3c5266"/><stop offset="100%" stop-color="#18222e"/></linearGradient>
        <radialGradient id="kGem" cx="50%" cy="40%" r="55%"><stop offset="0%" stop-color="#a8ffea"/><stop offset="55%" stop-color="#2ee5a8"/><stop offset="100%" stop-color="#0d6e52"/></radialGradient>
        <linearGradient id="kCape" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2c8f73"/><stop offset="100%" stop-color="#10382e"/></linearGradient>
      </defs>
      <!-- Cape -->
      <path d="M52 72 C24 88 22 122 30 140 L68 134 Z" fill="url(#kCape)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <!-- Broadsword behind/right -->
      <g transform="translate(8,0)">
        <path d="M114 34 L132 16 L136 32 L118 68 L108 62 Z" fill="url(#kSteel)" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
        <path d="M118 32 L130 20 L122 54" fill="none" stroke="#dbeeff" stroke-width="2.5" opacity=".7"/>
        <rect x="96" y="60" width="26" height="8" rx="3" transform="rotate(24 109 64)" fill="url(#kGold)" stroke="${INK}" stroke-width="4"/>
      </g>
      <!-- Legs & Boots -->
      <path d="M54 116 L46 142 L66 144 L72 118 Z" fill="url(#kSteel)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M84 116 L88 144 L110 142 L102 116 Z" fill="url(#kSteel)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <!-- Torso Plate -->
      <path d="M46 72 L104 72 L98 120 L52 120 Z" fill="url(#kSteel)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M68 74 L82 74 L79 116 L71 116 Z" fill="url(#kGold)" stroke="${INK}" stroke-width="3.5"/>
      <!-- Pauldrons -->
      <path d="M32 76 C34 56 54 54 62 72 L46 88 Z" fill="url(#kSteel)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M36 74 C40 62 50 60 56 68" fill="none" stroke="url(#kGold)" stroke-width="4" stroke-linecap="round"/>
      <!-- Helmet Plume -->
      <path d="M52 34 C38 14 58 6 76 18 C82 10 92 16 86 30 Z" fill="#2ee5a8" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
      <!-- Helmet Head -->
      <path d="M48 48 C48 26 102 26 102 48 L100 74 C92 82 58 82 50 74 Z" fill="url(#kSteel)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M72 28 L78 28 L80 76 L70 76 Z" fill="url(#kGold)" stroke="${INK}" stroke-width="3.5"/>
      <!-- Visor & Glowing Eyes -->
      <path d="M58 52 L96 52 L94 64 L60 64 Z" fill="#10151f" stroke="${INK}" stroke-width="3.5"/>
      <ellipse cx="70" cy="58" rx="4.5" ry="3" fill="#63ffd2"/>
      <ellipse cx="87" cy="58" rx="4.5" ry="3" fill="#63ffd2"/>
      <!-- Tower Shield Front -->
      <path d="M84 68 L136 74 L132 118 C126 134 108 144 108 144 C108 144 88 134 84 118 Z" fill="url(#kShield)" stroke="${INK}" stroke-width="5.5" stroke-linejoin="round"/>
      <path d="M90 74 L130 79 L126 115 C121 128 108 136 108 136 C108 136 93 128 90 115 Z" fill="none" stroke="url(#kGold)" stroke-width="4"/>
      <polygon points="109,86 121,105 109,124 97,105" fill="url(#kGem)" stroke="${INK}" stroke-width="3.5"/>
      <polygon points="109,91 115,103 109,108 103,103" fill="#e6fff9" opacity=".8"/>
    </svg>`,

    archer: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="aCloak" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#356aa8"/><stop offset="55%" stop-color="#1d3c68"/><stop offset="100%" stop-color="#0f1f3a"/></linearGradient>
        <linearGradient id="aLeather" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#8b5a3c"/><stop offset="100%" stop-color="#422618"/></linearGradient>
        <linearGradient id="aBow" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#b9ecff"/><stop offset="50%" stop-color="#4ca8e8"/><stop offset="100%" stop-color="#1d4d82"/></linearGradient>
        <linearGradient id="aGlow" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#6be5ff"/><stop offset="100%" stop-color="#ffffff"/></linearGradient>
      </defs>
      <!-- Quiver -->
      <path d="M40 44 L56 40 L62 84 L44 86 Z" fill="url(#aLeather)" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M42 40 L36 28 L46 32 Z M50 38 L48 25 L56 32 Z" fill="#6be5ff" stroke="${INK}" stroke-width="3"/>
      <!-- Flowing Cloak -->
      <path d="M46 72 C22 92 18 122 28 138 L66 130 Z" fill="url(#aCloak)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <!-- Boots -->
      <path d="M56 116 L48 142 L68 142 L72 116 Z" fill="url(#aLeather)" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M82 116 L88 142 L106 142 L98 116 Z" fill="url(#aLeather)" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
      <!-- Tunic -->
      <path d="M50 74 L96 74 L94 120 L52 120 Z" fill="url(#aCloak)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M52 96 L94 96 L94 106 L52 106 Z" fill="url(#aLeather)" stroke="${INK}" stroke-width="3.5"/>
      <rect x="68" y="95" width="12" height="12" rx="2" fill="#f5c869" stroke="${INK}" stroke-width="3"/>
      <!-- Hood & Face -->
      <path d="M40 60 C38 26 98 20 104 54 L98 76 L46 76 Z" fill="url(#aCloak)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M58 46 C64 40 94 42 96 58 C96 72 64 74 58 64 Z" fill="#f2d2bc" stroke="${INK}" stroke-width="4"/>
      <!-- Shadow under hood & sharp cyan eyes -->
      <path d="M58 48 C70 42 92 44 96 54 L58 54 Z" fill="#172844"/>
      <ellipse cx="73" cy="58" rx="3.8" ry="2.8" fill="#5ce1ff"/>
      <ellipse cx="89" cy="58" rx="3.8" ry="2.8" fill="#5ce1ff"/>
      <!-- Silver Shoulder Guard -->
      <path d="M40 74 C44 62 60 62 64 76 L48 86 Z" fill="#b7d2e8" stroke="${INK}" stroke-width="4.5"/>
      <!-- Recurve Bow -->
      <path d="M108 26 C138 46 142 112 108 134" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round"/>
      <path d="M108 26 C138 46 142 112 108 134" fill="none" stroke="url(#aBow)" stroke-width="5.5" stroke-linecap="round"/>
      <!-- Bowstring -->
      <path d="M108 28 L82 82 L108 132" fill="none" stroke="#d9f6ff" stroke-width="2.2" opacity=".85"/>
      <!-- Glowing Energy Arrow -->
      <line x1="78" y1="82" x2="146" y2="82" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
      <line x1="80" y1="82" x2="144" y2="82" stroke="url(#aGlow)" stroke-width="4" stroke-linecap="round"/>
      <polygon points="154,82 134,71 139,82 134,93" fill="#8ff2ff" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
    </svg>`,

    mage: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="mRobe" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#6c43b8"/><stop offset="55%" stop-color="#3c2072"/><stop offset="100%" stop-color="#1d0f3d"/></linearGradient>
        <linearGradient id="mGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffe79e"/><stop offset="100%" stop-color="#c98924"/></linearGradient>
        <radialGradient id="mOrb" cx="45%" cy="40%" r="55%"><stop offset="0%" stop-color="#ffffff"/><stop offset="40%" stop-color="#d89eff"/><stop offset="100%" stop-color="#772ce8"/></radialGradient>
      </defs>
      <!-- Robe Body -->
      <path d="M46 76 L98 76 L110 142 L34 142 Z" fill="url(#mRobe)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M66 78 L80 78 L84 140 L62 140 Z" fill="url(#mGold)" stroke="${INK}" stroke-width="3.5"/>
      <!-- Arcane Collar -->
      <path d="M42 74 L72 90 L102 74 L92 64 L52 64 Z" fill="url(#mGold)" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <!-- Shadowed Wizard Face -->
      <circle cx="72" cy="60" r="21" fill="#170f2b" stroke="${INK}" stroke-width="5"/>
      <ellipse cx="66" cy="62" rx="4.5" ry="3.2" fill="#e5b8ff"/>
      <ellipse cx="83" cy="62" rx="4.5" ry="3.2" fill="#e5b8ff"/>
      <!-- Wizard Pointed Hat -->
      <ellipse cx="72" cy="50" rx="42" ry="12" fill="url(#mRobe)" stroke="${INK}" stroke-width="5"/>
      <path d="M42 48 C48 22 68 8 92 10 C82 20 84 32 98 48 Z" fill="url(#mRobe)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M46 46 Q72 52 96 46" fill="none" stroke="url(#mGold)" stroke-width="5" stroke-linecap="round"/>
      <!-- Twisted Staff -->
      <path d="M120 144 L122 58 C122 44 110 38 114 28 C118 18 134 20 138 34 C140 44 130 52 126 58" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round"/>
      <path d="M120 144 L122 58 C122 44 110 38 114 28 C118 18 134 20 138 34 C140 44 130 52 126 58" fill="none" stroke="#85583a" stroke-width="5.5" stroke-linecap="round"/>
      <!-- Crackling Lightning Orb -->
      <circle cx="126" cy="36" r="14" fill="url(#mOrb)" stroke="${INK}" stroke-width="4"/>
      <path d="M112 20 L118 28 L112 32 M140 20 L134 30 L142 36 M136 48 L146 52" fill="none" stroke="#f0d6ff" stroke-width="3" stroke-linecap="round"/>
    </svg>`,

    priest: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="pRobe" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fff8e8"/><stop offset="60%" stop-color="#d7ccb8"/><stop offset="100%" stop-color="#9e927c"/></linearGradient>
        <linearGradient id="pGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff0b3"/><stop offset="55%" stop-color="#f0b949"/><stop offset="100%" stop-color="#996715"/></linearGradient>
        <radialGradient id="pSun" cx="50%" cy="50%" r="55%"><stop offset="0%" stop-color="#ffffff"/><stop offset="55%" stop-color="#ffe07d"/><stop offset="100%" stop-color="#e89422"/></radialGradient>
      </defs>
      <!-- Floating Halo -->
      <ellipse cx="70" cy="18" rx="22" ry="6" fill="none" stroke="${INK}" stroke-width="7"/>
      <ellipse cx="70" cy="18" rx="22" ry="6" fill="none" stroke="#ffe48f" stroke-width="3.5"/>
      <!-- Clerical Robe -->
      <path d="M44 76 L96 76 L108 142 L32 142 Z" fill="url(#pRobe)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M62 78 L78 78 L82 140 L58 140 Z" fill="url(#pGold)" stroke="${INK}" stroke-width="3.5"/>
      <!-- Gold Mantle -->
      <path d="M36 80 C44 64 96 64 104 80 L92 98 L48 98 Z" fill="url(#pGold)" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
      <!-- Hood / Hair & Warm Face -->
      <path d="M44 54 C44 26 96 26 96 54 L98 76 L42 76 Z" fill="url(#pRobe)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M52 46 C52 34 88 34 88 46 L88 68 C82 74 58 74 52 68 Z" fill="#f7dac4" stroke="${INK}" stroke-width="4"/>
      <path d="M50 40 Q70 30 90 40" fill="none" stroke="url(#pGold)" stroke-width="5" stroke-linecap="round"/>
      <circle cx="64" cy="56" r="3.5" fill="#47301a"/>
      <circle cx="80" cy="56" r="3.5" fill="#47301a"/>
      <circle cx="65" cy="55" r="1.2" fill="#ffffff"/>
      <circle cx="81" cy="55" r="1.2" fill="#ffffff"/>
      <!-- Sun Staff -->
      <line x1="124" y1="144" x2="124" y2="50" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
      <line x1="124" y1="144" x2="124" y2="50" stroke="url(#pGold)" stroke-width="5" stroke-linecap="round"/>
      <!-- Sun Crest -->
      <polygon points="124,14 130,28 144,24 134,36 146,44 130,44 124,58 118,44 102,44 114,36 104,24 118,28" fill="url(#pGold)" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <circle cx="124" cy="36" r="9" fill="url(#pSun)" stroke="${INK}" stroke-width="3"/>
    </svg>`,

    assassin: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="sDark" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#3c4459"/><stop offset="55%" stop-color="#1d2230"/><stop offset="100%" stop-color="#0d1018"/></linearGradient>
        <linearGradient id="sRed" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ff5e73"/><stop offset="60%" stop-color="#b81d38"/><stop offset="100%" stop-color="#5e0d1d"/></linearGradient>
        <linearGradient id="sBlade" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ffffff"/><stop offset="50%" stop-color="#ff7a8a"/><stop offset="100%" stop-color="#a81632"/></linearGradient>
      </defs>
      <!-- Flowing Crimson Scarf -->
      <path d="M54 74 C24 68 12 84 18 98 C30 92 40 94 52 90 Z" fill="url(#sRed)" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
      <!-- Back Curved Dagger -->
      <path d="M36 92 C20 76 18 54 34 40 C30 58 34 72 48 84 Z" fill="url(#sBlade)" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
      <!-- Legs crouched -->
      <path d="M54 114 L40 142 L62 142 L72 118 Z" fill="url(#sDark)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M84 114 L96 142 L116 140 L102 114 Z" fill="url(#sDark)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <!-- Armored Torso -->
      <path d="M48 76 L102 74 L98 118 L52 118 Z" fill="url(#sDark)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M50 84 L100 98 L98 108 L48 94 Z" fill="url(#sRed)" stroke="${INK}" stroke-width="3.5"/>
      <!-- Hooded Head -->
      <path d="M44 58 C44 24 104 22 108 58 L100 78 L50 78 Z" fill="url(#sDark)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <!-- Mask & Glowing Crimson Eyes -->
      <path d="M58 58 L102 58 L98 76 L60 76 Z" fill="url(#sRed)" stroke="${INK}" stroke-width="4"/>
      <path d="M62 50 L74 54 L62 56 Z" fill="#ff4d6d"/>
      <path d="M94 50 L82 54 L94 56 Z" fill="#ff4d6d"/>
      <!-- Front Curved Ruby Dagger -->
      <path d="M104 94 C126 88 144 68 146 44 C132 62 120 74 96 84 Z" fill="url(#sBlade)" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
      <rect x="92" y="80" width="16" height="8" rx="3" transform="rotate(-24 100 84)" fill="#f5c869" stroke="${INK}" stroke-width="3.5"/>
    </svg>`,

    joker: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="jPurp" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e66bff"/><stop offset="55%" stop-color="#8b2be2"/><stop offset="100%" stop-color="#3f1070"/></linearGradient>
        <linearGradient id="jMag" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ff6eb4"/><stop offset="100%" stop-color="#9e175b"/></linearGradient>
        <linearGradient id="jGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff0a6"/><stop offset="55%" stop-color="#f2b63d"/><stop offset="100%" stop-color="#945d10"/></linearGradient>
      </defs>
      <!-- Three-pointed Jester Hat -->
      <path d="M64 56 C44 26 22 30 18 54 C32 48 44 54 54 70 Z" fill="url(#jPurp)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M96 56 C116 26 138 30 142 54 C128 48 116 54 106 70 Z" fill="url(#jMag)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M58 58 C66 20 94 14 104 34 C94 34 90 44 96 58 Z" fill="url(#jGold)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <!-- Bells -->
      <circle cx="18" cy="56" r="9" fill="url(#jGold)" stroke="${INK}" stroke-width="4"/>
      <circle cx="142" cy="56" r="9" fill="url(#jGold)" stroke="${INK}" stroke-width="4"/>
      <circle cx="104" cy="34" r="9" fill="url(#jGold)" stroke="${INK}" stroke-width="4"/>
      <!-- Ornate Mask -->
      <path d="M40 62 C40 48 120 48 120 62 L114 114 C106 136 80 144 80 144 C80 144 54 136 46 114 Z" fill="#f7f1e3" stroke="${INK}" stroke-width="5.5" stroke-linejoin="round"/>
      <path d="M80 54 L118 62 L112 114 C104 134 80 142 80 142 Z" fill="url(#jPurp)" opacity=".88"/>
      <!-- Gilded Collar Trim -->
      <path d="M40 64 Q80 74 120 64" fill="none" stroke="url(#jGold)" stroke-width="6"/>
      <!-- Mischievous Glowing Eyes -->
      <path d="M52 84 Q62 74 72 86 Q62 94 52 84 Z" fill="#ffd86b" stroke="${INK}" stroke-width="3.5"/>
      <path d="M108 84 Q98 74 88 86 Q98 94 108 84 Z" fill="#ffd86b" stroke="${INK}" stroke-width="3.5"/>
      <!-- Grin -->
      <path d="M56 108 Q80 128 104 108 Q80 118 56 108 Z" fill="#ff4d79" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    </svg>`,

    enemy_melee: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="eSkin" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#87b854"/><stop offset="100%" stop-color="#3c5e24"/></linearGradient>
        <linearGradient id="eIron" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#6e7685"/><stop offset="100%" stop-color="#222730"/></linearGradient>
      </defs>
      <!-- Cleaver Axe (facing left) -->
      <path d="M48 84 L18 52 C10 70 12 96 28 108 L52 94 Z" fill="url(#eIron)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <line x1="66" y1="108" x2="28" y2="62" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
      <line x1="66" y1="108" x2="28" y2="62" stroke="#7d5336" stroke-width="5" stroke-linecap="round"/>
      <!-- Legs -->
      <path d="M62 114 L54 142 L74 142 L78 116 Z" fill="url(#eIron)" stroke="${INK}" stroke-width="5"/>
      <path d="M92 114 L96 142 L116 142 L108 114 Z" fill="url(#eIron)" stroke="${INK}" stroke-width="5"/>
      <!-- Body -->
      <path d="M58 74 L112 74 L108 118 L62 118 Z" fill="url(#eIron)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <!-- Head & Ears -->
      <path d="M104 48 L126 38 L112 62 Z" fill="url(#eSkin)" stroke="${INK}" stroke-width="4.5"/>
      <circle cx="84" cy="58" r="24" fill="url(#eSkin)" stroke="${INK}" stroke-width="5"/>
      <!-- Iron Helm -->
      <path d="M58 52 C60 26 108 26 110 52 Z" fill="url(#eIron)" stroke="${INK}" stroke-width="5"/>
      <path d="M72 32 L64 16 L80 28 Z M96 32 L104 16 L88 28 Z" fill="#d9d2c5" stroke="${INK}" stroke-width="3.5"/>
      <!-- Fierce Eyes & Tusks -->
      <ellipse cx="73" cy="58" rx="4.5" ry="3" fill="#ffdf4d"/>
      <ellipse cx="90" cy="58" rx="4.5" ry="3" fill="#ffdf4d"/>
      <path d="M66 72 L70 64 L74 72 M86 72 L90 64 L94 72" fill="#fff8e6" stroke="${INK}" stroke-width="3"/>
      <!-- Spiked Pauldron -->
      <path d="M96 70 C114 60 128 70 124 88 L100 88 Z" fill="url(#eIron)" stroke="${INK}" stroke-width="5"/>
    </svg>`,

    enemy_tank: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="tArmor" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#7c8799"/><stop offset="55%" stop-color="#3a4252"/><stop offset="100%" stop-color="#191d26"/></linearGradient>
        <linearGradient id="tTrim" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#d9534f"/><stop offset="100%" stop-color="#6e1a1a"/></linearGradient>
      </defs>
      <!-- Heavy Legs -->
      <path d="M64 114 L58 144 L80 144 L84 116 Z" fill="url(#tArmor)" stroke="${INK}" stroke-width="5"/>
      <path d="M92 114 L96 144 L118 144 L110 114 Z" fill="url(#tArmor)" stroke="${INK}" stroke-width="5"/>
      <!-- Torso -->
      <path d="M56 68 L116 68 L110 120 L62 120 Z" fill="url(#tArmor)" stroke="${INK}" stroke-width="5"/>
      <!-- Horned Skull Helm -->
      <path d="M60 44 L44 24 L68 34 Z M108 44 L124 24 L100 34 Z" fill="#d4cfc4" stroke="${INK}" stroke-width="4.5"/>
      <rect x="62" y="30" width="46" height="44" rx="14" fill="url(#tArmor)" stroke="${INK}" stroke-width="5"/>
      <path d="M68 50 L98 50 L96 64 L70 64 Z" fill="#101218"/>
      <circle cx="77" cy="57" r="4" fill="#ff595e"/>
      <circle cx="91" cy="57" r="4" fill="#ff595e"/>
      <!-- Giant Iron Tower Shield (left side) -->
      <path d="M26 66 L76 62 L76 124 C66 138 48 144 48 144 C48 144 30 136 26 122 Z" fill="url(#tArmor)" stroke="${INK}" stroke-width="5.5" stroke-linejoin="round"/>
      <path d="M34 72 L68 70 L68 118 C60 130 48 134 48 134 C48 134 36 128 34 116 Z" fill="none" stroke="url(#tTrim)" stroke-width="4.5"/>
      <circle cx="51" cy="98" r="10" fill="url(#tTrim)" stroke="${INK}" stroke-width="3.5"/>
    </svg>`,

    enemy_ranged: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="rHood" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#5d3f82"/><stop offset="100%" stop-color="#221436"/></linearGradient>
      </defs>
      <!-- Tattered Cloak -->
      <path d="M68 72 L120 76 L132 138 L66 134 Z" fill="url(#rHood)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <!-- Hood & Skull -->
      <path d="M62 56 C62 24 116 24 118 58 L112 78 L66 78 Z" fill="url(#rHood)" stroke="${INK}" stroke-width="5"/>
      <circle cx="84" cy="58" r="18" fill="#e8e2d5" stroke="${INK}" stroke-width="4.5"/>
      <circle cx="76" cy="56" r="4.5" fill="#180e26"/>
      <circle cx="90" cy="56" r="4.5" fill="#180e26"/>
      <circle cx="76" cy="56" r="2.2" fill="#d07bff"/>
      <circle cx="90" cy="56" r="2.2" fill="#d07bff"/>
      <!-- Bone Bow facing left -->
      <path d="M52 28 C20 48 18 112 52 132" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round"/>
      <path d="M52 28 C20 48 18 112 52 132" fill="none" stroke="#e8dfc8" stroke-width="5.5" stroke-linecap="round"/>
      <path d="M52 30 L76 82 L52 130" fill="none" stroke="#d5a8ff" stroke-width="2"/>
      <!-- Shadow Arrow -->
      <line x1="78" y1="82" x2="16" y2="82" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
      <line x1="76" y1="82" x2="18" y2="82" stroke="#f7c85c" stroke-width="4" stroke-linecap="round"/>
      <polygon points="8,82 26,72 22,82 26,92" fill="#ffe28a" stroke="${INK}" stroke-width="3.5"/>
    </svg>`,

    enemy_caster: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="cRobe" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#8a2c7c"/><stop offset="100%" stop-color="#2b0c2e"/></linearGradient>
        <radialGradient id="cOrb" cx="50%" cy="45%" r="55%"><stop offset="0%" stop-color="#ffffff"/><stop offset="45%" stop-color="#ff5ce6"/><stop offset="100%" stop-color="#750c7a"/></radialGradient>
      </defs>
      <path d="M62 74 L114 74 L126 142 L50 142 Z" fill="url(#cRobe)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M64 40 L48 16 L74 30 Z M108 40 L124 16 L98 30 Z" fill="#2c1938" stroke="${INK}" stroke-width="4.5"/>
      <path d="M60 60 C60 26 112 26 114 60 L108 78 L66 78 Z" fill="url(#cRobe)" stroke="${INK}" stroke-width="5"/>
      <circle cx="84" cy="58" r="16" fill="#14081c"/>
      <ellipse cx="77" cy="58" rx="4" ry="2.8" fill="#ff5ce6"/>
      <ellipse cx="91" cy="58" rx="4" ry="2.8" fill="#ff5ce6"/>
      <!-- Necro Staff -->
      <line x1="36" y1="142" x2="36" y2="48" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
      <line x1="36" y1="142" x2="36" y2="48" stroke="#4d3257" stroke-width="5" stroke-linecap="round"/>
      <circle cx="36" cy="36" r="15" fill="url(#cOrb)" stroke="${INK}" stroke-width="4.5"/>
    </svg>`,

    enemy_assassin: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="eaBody" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#402030"/><stop offset="100%" stop-color="#140912"/></linearGradient>
      </defs>
      <path d="M106 72 C132 68 144 84 138 98 C126 92 116 94 104 90 Z" fill="#e63956" stroke="${INK}" stroke-width="4.5"/>
      <path d="M60 114 L50 142 L70 142 L78 116 Z" fill="url(#eaBody)" stroke="${INK}" stroke-width="5"/>
      <path d="M90 114 L100 142 L118 142 L106 114 Z" fill="url(#eaBody)" stroke="${INK}" stroke-width="5"/>
      <path d="M56 76 L108 76 L104 118 L60 118 Z" fill="url(#eaBody)" stroke="${INK}" stroke-width="5"/>
      <path d="M54 58 C54 24 110 24 112 58 L104 78 L60 78 Z" fill="url(#eaBody)" stroke="${INK}" stroke-width="5"/>
      <path d="M64 50 L76 54 L64 56 Z M94 50 L82 54 L94 56 Z" fill="#ff3b5c"/>
      <path d="M54 92 C32 86 16 66 14 44 C28 62 40 74 62 84 Z" fill="#ff6b81" stroke="${INK}" stroke-width="4.5"/>
    </svg>`,

    boss_lich: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="lMantle" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#7b2cbf"/><stop offset="55%" stop-color="#3c096c"/><stop offset="100%" stop-color="#10002b"/></linearGradient>
        <linearGradient id="lScythe" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f3d5ff"/><stop offset="50%" stop-color="#c77dff"/><stop offset="100%" stop-color="#5a189a"/></linearGradient>
      </defs>
      <!-- Floating Soul Flame -->
      <path d="M50 144 C46 112 56 76 88 76 C120 76 130 112 126 144 L108 134 L94 146 L82 134 L68 146 Z" fill="url(#lMantle)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <!-- Bone Crown -->
      <polygon points="62,42 56,14 74,30 88,10 102,30 120,14 114,42" fill="#f0c46c" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
      <!-- Lich Skull -->
      <path d="M62 44 C62 30 114 30 114 44 L110 74 C102 84 74 84 66 74 Z" fill="#eae2d6" stroke="${INK}" stroke-width="5"/>
      <circle cx="76" cy="56" r="6" fill="#18052e"/>
      <circle cx="98" cy="56" r="6" fill="#18052e"/>
      <circle cx="76" cy="56" r="3.2" fill="#e0aaff"/>
      <circle cx="98" cy="56" r="3.2" fill="#e0aaff"/>
      <!-- Soul Scythe -->
      <line x1="42" y1="146" x2="46" y2="28" stroke="${INK}" stroke-width="11" stroke-linecap="round"/>
      <line x1="42" y1="146" x2="46" y2="28" stroke="#6c4d8a" stroke-width="5.5" stroke-linecap="round"/>
      <path d="M46 28 C12 24 4 56 14 84 C20 58 32 48 54 46 Z" fill="url(#lScythe)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    </svg>`,

    boss_dragon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="dScale" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#474254"/><stop offset="55%" stop-color="#221e2b"/><stop offset="100%" stop-color="#0d0b12"/></linearGradient>
        <linearGradient id="dWing" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ff3b5c"/><stop offset="100%" stop-color="#6b0d24"/></linearGradient>
        <radialGradient id="dCore" cx="50%" cy="50%" r="55%"><stop offset="0%" stop-color="#fff3b0"/><stop offset="50%" stop-color="#ff6d00"/><stop offset="100%" stop-color="#c9184a"/></radialGradient>
      </defs>
      <!-- Spread Dragon Wings -->
      <path d="M96 64 C118 20 148 16 154 44 C142 56 138 72 146 92 C126 84 114 90 102 104 Z" fill="url(#dWing)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M68 58 C52 24 24 22 18 46 C32 54 40 66 36 82 L68 84 Z" fill="url(#dWing)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <!-- Tail -->
      <path d="M104 114 C132 120 146 138 134 148 C122 144 114 134 98 130 Z" fill="url(#dScale)" stroke="${INK}" stroke-width="5"/>
      <!-- Body & Molten Chest -->
      <path d="M56 76 C56 58 112 58 112 78 L116 128 C102 144 64 144 52 128 Z" fill="url(#dScale)" stroke="${INK}" stroke-width="5.5"/>
      <ellipse cx="78" cy="106" rx="18" ry="22" fill="url(#dCore)" stroke="${INK}" stroke-width="4"/>
      <!-- Horns -->
      <path d="M64 40 L48 12 L74 30 Z M92 38 L114 12 L100 34 Z" fill="#f5c869" stroke="${INK}" stroke-width="4.5"/>
      <!-- Dragon Head facing left -->
      <path d="M26 56 L54 40 C74 32 102 38 102 58 C102 74 78 82 54 78 L26 72 Z" fill="url(#dScale)" stroke="${INK}" stroke-width="5.5" stroke-linejoin="round"/>
      <!-- Glowing Eye & Flame Nostril -->
      <polygon points="58,52 72,56 60,62" fill="#ffe169"/>
      <path d="M26 68 L10 74 L24 78 Z" fill="#ff6d00"/>
    </svg>`,

    iron: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <defs><linearGradient id="irG" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#8b95a8"/><stop offset="55%" stop-color="#475063"/><stop offset="100%" stop-color="#1d222e"/></linearGradient></defs>
      <polygon points="44,124 26,86 54,42 106,36 134,74 118,124" fill="url(#irG)" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
      <polygon points="54,42 86,62 66,118 44,124 26,86" fill="#6b758a" opacity="0.55"/>
      <polyline points="54,42 86,62 134,74" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
      <line x1="86" y1="62" x2="66" y2="118" stroke="${INK}" stroke-width="4.5"/>
      <polygon points="62,56 76,64 68,78" fill="#cbd5e8" opacity="0.55"/>
    </svg>`,

    ember: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <defs><radialGradient id="emG" cx="50%" cy="60%" r="55%"><stop offset="0%" stop-color="#fff4b8"/><stop offset="48%" stop-color="#ff8c38"/><stop offset="100%" stop-color="#a8202c"/></radialGradient></defs>
      <path d="M80,22 C102,52 126,72 118,108 C112,130 96,140 80,140 C64,140 48,130 42,108 C34,76 58,56 66,40 C68,54 74,56 80,22 Z" fill="url(#emG)" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
      <path d="M80,68 C94,86 96,106 80,124 C64,106 66,86 80,68 Z" fill="#fff3b0" opacity="0.82"/>
    </svg>`
  };

  // Bespoke metallic UI icons (zero system emojis!)
  const UI_ICONS = {
    coin: `<svg viewBox="0 0 24 24" class="ui-ico"><circle cx="12" cy="12" r="9.5" fill="#f5c869" stroke="#1c1406" stroke-width="2"/><circle cx="12" cy="12" r="6.5" fill="none" stroke="#a66f17" stroke-width="1.5"/><path d="M12 7.5v9M9.5 10.5L12 8l2.5 2.5" stroke="#7a4c0a" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>`,
    heart: `<svg viewBox="0 0 24 24" class="ui-ico"><path d="M12 20.5s-7.5-4.7-9.2-9.1C1.7 8.4 3.6 5 6.9 5c2 0 3.5 1.1 5.1 2.9C13.6 6.1 15.1 5 17.1 5c3.3 0 5.2 3.4 4.1 6.4-1.7 4.4-9.2 9.1-9.2 9.1Z" fill="#ff5964" stroke="#24090d" stroke-width="1.8"/></svg>`,
    sword: `<svg viewBox="0 0 24 24" class="ui-ico"><path d="M19.5 4.5 13 11l-2-2 6.5-6.5h2v2ZM4.5 19.5l4-4m-2-2 4 4" stroke="#7fd4ff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M4.5 4.5 11 11l2-2L6.5 2.5h-2v2ZM19.5 19.5l-4-4m2-2-4 4" stroke="#cceeff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`,
    rig: `<svg viewBox="0 0 24 24" class="ui-ico"><path d="M4 7h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="9" cy="7" r="3" fill="#b78bfa" stroke="#160f24" stroke-width="1.6"/><circle cx="15" cy="17" r="3" fill="#f5c869" stroke="#160f24" stroke-width="1.6"/></svg>`,
    lock: `<svg viewBox="0 0 24 24" class="ui-ico"><rect x="5" y="10" width="14" height="11" rx="2.5" fill="#f5c869" stroke="#1a1205" stroke-width="1.8"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="#ffe5a3" stroke-width="2.2" stroke-linecap="round"/></svg>`,
    soundOn: `<svg viewBox="0 0 24 24" class="ui-ico"><path d="M4 9.5h4l5-4v13l-5-4H4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
    soundOff: `<svg viewBox="0 0 24 24" class="ui-ico"><path d="M4 9.5h4l5-4v13l-5-4H4z" fill="currentColor" opacity=".5"/><path d="M16 9l5 6m0-6-5 6" stroke="#ff5964" stroke-width="2.2" stroke-linecap="round"/></svg>`,
    swap: `<svg viewBox="0 0 24 24" class="ui-ico"><path d="M7 7h12m0 0-3-3m3 3-3 3M17 17H5m0 0 3-3m-3 3 3 3" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    absorb: `<svg viewBox="0 0 24 24" class="ui-ico"><path d="M12 3c2.5 3.5 6 5.5 6 10a6 6 0 1 1-12 0c0-2.5 1.3-4.6 3-6.2.2 1.8 1.4 2.7 2.4 2.7C11.4 7 11.2 4.8 12 3Z" fill="#ff6b6b" stroke="#26080d" stroke-width="1.6"/></svg>`,
    boss: `<svg viewBox="0 0 24 24" class="ui-ico"><path d="M5 18v-5a7 7 0 1 1 14 0v5l-3-1.5-2 2-2-2-2 2-2-2Z" fill="#ff5964" stroke="#24080d" stroke-width="1.6"/><circle cx="9.5" cy="11.5" r="1.5" fill="#1a060a"/><circle cx="14.5" cy="11.5" r="1.5" fill="#1a060a"/></svg>`,
    crest: `<svg viewBox="0 0 32 32" class="ui-ico-lg"><path d="M6 12l5 4 5-10 5 10 5-4-2 13H8Z" fill="#f5c869" stroke="#241705" stroke-width="2" stroke-linejoin="round"/><circle cx="16" cy="18" r="2.6" fill="#ff5964"/></svg>`
  };

  function svgToDataUrl(svg) {
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  // Unified art URL map (mixes real AI-generated transparent PNGs + high-craft vector chibi sprites)
  const SPRITE_URLS = {
    arenaBg: "assets/arena-bg.webp",
    gold: "assets/sym-gold.png",
    boss_grom: "assets/boss-warlord.png",
    fateCrystal: "assets/items/crystal-fate.svg",
    shopSlot: "assets/items/shop-unlock-slot.svg",
    shopAnvil: "assets/items/shop-enchant-anvil.svg",
    shopHourglass: "assets/items/shop-potion-nudge.svg",
    shopDice: "assets/items/shop-dice-rig.svg",
    endlessCrown: "assets/items/endless-crown.svg",
    berserker: "assets/heroes/hero-berserker.svg",
    engineer: "assets/heroes/hero-engineer.svg",
    necromancer: "assets/heroes/hero-necromancer.svg",
    bard: "assets/heroes/hero-bard.svg",
    valkyrie: "assets/heroes/hero-valkyrie.svg",
    turret: "assets/heroes/summon-turret.svg",
    map_citadel: "assets/maps/map-01-citadel.webp",
    map_catacombs: "assets/maps/map-02-catacombs.svg",
    map_frostpeak: "assets/maps/map-03-frostpeak.svg",
    map_inferno: "assets/maps/map-04-inferno.svg",
    map_astral: "assets/maps/map-05-astral.svg",
    ch1_goblin_raider: "assets/enemies/ch1/goblin-raider.svg",
    ch1_orc_brute: "assets/enemies/ch1/orc-brute.svg",
    ch1_boss_warlord: "assets/enemies/ch1/boss-warlord.png",
    ch2_crypt_ghoul: "assets/enemies/ch2/crypt-ghoul.svg",
    ch2_bone_archer: "assets/enemies/ch2/bone-archer.svg",
    ch2_bone_priest: "assets/enemies/ch2/necro-acolyte.svg",
    ch2_necro_acolyte: "assets/enemies/ch2/necro-acolyte.svg",
    ch2_boss_lich: "assets/enemies/ch2/boss-lich.svg",
    ch3_frost_guard: "assets/enemies/ch3/frost-guard.svg",
    ch3_blizzard_yeti: "assets/enemies/ch3/blizzard-yeti.svg",
    ch3_ice_assassin: "assets/enemies/ch3/ice-assassin.svg",
    ch3_boss_icequeen: "assets/enemies/ch3/boss-icequeen.svg",
    ch4_lava_imp: "assets/enemies/ch4/lava-imp.svg",
    ch4_hell_hound: "assets/enemies/ch4/hell-hound.svg",
    ch4_obsidian_golem: "assets/enemies/ch4/obsidian-golem.svg",
    ch4_boss_balrog: "assets/enemies/ch4/boss-balrog.svg",
    ch5_void_stalker: "assets/enemies/ch5/void-stalker.svg",
    ch5_astral_sentinel: "assets/enemies/ch5/astral-sentinel.svg",
    ch5_star_mage: "assets/enemies/ch5/star-mage.svg",
    ch5_boss_dragon: "assets/enemies/ch5/boss-dragon.svg",
    knight: svgToDataUrl(CHARACTER_SVGS.knight),
    archer: svgToDataUrl(CHARACTER_SVGS.archer),
    mage: svgToDataUrl(CHARACTER_SVGS.mage),
    priest: svgToDataUrl(CHARACTER_SVGS.priest),
    assassin: svgToDataUrl(CHARACTER_SVGS.assassin),
    joker: svgToDataUrl(CHARACTER_SVGS.joker),
    iron: svgToDataUrl(CHARACTER_SVGS.iron),
    ember: svgToDataUrl(CHARACTER_SVGS.ember),
    enemy_melee: svgToDataUrl(CHARACTER_SVGS.enemy_melee),
    enemy_tank: svgToDataUrl(CHARACTER_SVGS.enemy_tank),
    enemy_ranged: svgToDataUrl(CHARACTER_SVGS.enemy_ranged),
    enemy_caster: svgToDataUrl(CHARACTER_SVGS.enemy_caster),
    enemy_assassin: svgToDataUrl(CHARACTER_SVGS.enemy_assassin),
    boss_lich: svgToDataUrl(CHARACTER_SVGS.boss_lich),
    boss_dragon: svgToDataUrl(CHARACTER_SVGS.boss_dragon)
  };

  const IMAGE_CACHE = new Map();
  for (const [key, url] of Object.entries(SPRITE_URLS)) {
    const img = new Image();
    img.src = url;
    IMAGE_CACHE.set(key, img);
    IMAGE_CACHE.set(url, img);
  }

  function getSpriteImg(keyOrUrl) {
    return IMAGE_CACHE.get(keyOrUrl) ?? null;
  }

  function getEnemyArtKey(enemy) {
    if (enemy.artKey && SPRITE_URLS[enemy.artKey]) return enemy.artKey;
    if (enemy.bossId === "grom") return "boss_grom";
    if (enemy.bossId === "lich") return "boss_lich";
    if (enemy.bossId === "dragon") return "boss_dragon";
    return "enemy_" + (enemy.kind || "melee");
  }

  function renderPortraitImg(key, alt = "", cls = "art-sprite") {
    const url = SPRITE_URLS[key] || SPRITE_URLS.knight;
    return `<img src="${url}" alt="${alt}" class="${cls}" draggable="false">`;
  }

  globalThis.GameArt = {
    SPRITE_URLS,
    UI_ICONS,
    getSpriteImg,
    getEnemyArtKey,
    renderPortraitImg
  };
})();
