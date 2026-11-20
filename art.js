(() => {
  "use strict";

  const INK = "#0d0a12";

  // Fallback enemy & legacy emblem SVGs (160x160)
  const CHARACTER_SVGS = {
    enemy_melee: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="eSkin" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#87b854"/><stop offset="100%" stop-color="#3c5e24"/></linearGradient>
        <linearGradient id="eIron" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#6e7685"/><stop offset="100%" stop-color="#222730"/></linearGradient>
      </defs>
      <path d="M48 84 L18 52 C10 70 12 96 28 108 L52 94 Z" fill="url(#eIron)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <line x1="66" y1="108" x2="28" y2="62" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
      <line x1="66" y1="108" x2="28" y2="62" stroke="#7d5336" stroke-width="5" stroke-linecap="round"/>
      <path d="M62 114 L54 142 L74 142 L78 116 Z" fill="url(#eIron)" stroke="${INK}" stroke-width="5"/>
      <path d="M92 114 L96 142 L116 142 L108 114 Z" fill="url(#eIron)" stroke="${INK}" stroke-width="5"/>
      <path d="M58 74 L112 74 L108 118 L62 118 Z" fill="url(#eIron)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M104 48 L126 38 L112 62 Z" fill="url(#eSkin)" stroke="${INK}" stroke-width="4.5"/>
      <circle cx="84" cy="58" r="24" fill="url(#eSkin)" stroke="${INK}" stroke-width="5"/>
      <path d="M58 52 C60 26 108 26 110 52 Z" fill="url(#eIron)" stroke="${INK}" stroke-width="5"/>
      <path d="M72 32 L64 16 L80 28 Z M96 32 L104 16 L88 28 Z" fill="#d9d2c5" stroke="${INK}" stroke-width="3.5"/>
      <ellipse cx="73" cy="58" rx="4.5" ry="3" fill="#ffdf4d"/>
      <ellipse cx="90" cy="58" rx="4.5" ry="3" fill="#ffdf4d"/>
      <path d="M66 72 L70 64 L74 72 M86 72 L90 64 L94 72" fill="#fff8e6" stroke="${INK}" stroke-width="3"/>
      <path d="M96 70 C114 60 128 70 124 88 L100 88 Z" fill="url(#eIron)" stroke="${INK}" stroke-width="5"/>
    </svg>`,

    enemy_tank: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="tArmor" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#7c8799"/><stop offset="55%" stop-color="#3a4252"/><stop offset="100%" stop-color="#191d26"/></linearGradient>
        <linearGradient id="tTrim" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#d9534f"/><stop offset="100%" stop-color="#6e1a1a"/></linearGradient>
      </defs>
      <path d="M64 114 L58 144 L80 144 L84 116 Z" fill="url(#tArmor)" stroke="${INK}" stroke-width="5"/>
      <path d="M92 114 L96 144 L118 144 L110 114 Z" fill="url(#tArmor)" stroke="${INK}" stroke-width="5"/>
      <path d="M56 68 L116 68 L110 120 L62 120 Z" fill="url(#tArmor)" stroke="${INK}" stroke-width="5"/>
      <path d="M60 44 L44 24 L68 34 Z M108 44 L124 24 L100 34 Z" fill="#d4cfc4" stroke="${INK}" stroke-width="4.5"/>
      <rect x="62" y="30" width="46" height="44" rx="14" fill="url(#tArmor)" stroke="${INK}" stroke-width="5"/>
      <path d="M68 50 L98 50 L96 64 L70 64 Z" fill="#101218"/>
      <circle cx="77" cy="57" r="4" fill="#ff595e"/>
      <circle cx="91" cy="57" r="4" fill="#ff595e"/>
      <path d="M26 66 L76 62 L76 124 C66 138 48 144 48 144 C48 144 30 136 26 122 Z" fill="url(#tArmor)" stroke="${INK}" stroke-width="5.5" stroke-linejoin="round"/>
      <path d="M34 72 L68 70 L68 118 C60 130 48 134 48 134 C48 134 36 128 34 116 Z" fill="none" stroke="url(#tTrim)" stroke-width="4.5"/>
      <circle cx="51" cy="98" r="10" fill="url(#tTrim)" stroke="${INK}" stroke-width="3.5"/>
    </svg>`,

    enemy_ranged: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="rHood" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#5d3f82"/><stop offset="100%" stop-color="#221436"/></linearGradient>
      </defs>
      <path d="M68 72 L120 76 L132 138 L66 134 Z" fill="url(#rHood)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M62 56 C62 24 116 24 118 58 L112 78 L66 78 Z" fill="url(#rHood)" stroke="${INK}" stroke-width="5"/>
      <circle cx="84" cy="58" r="18" fill="#e8e2d5" stroke="${INK}" stroke-width="4.5"/>
      <circle cx="76" cy="56" r="4.5" fill="#180e26"/>
      <circle cx="90" cy="56" r="4.5" fill="#180e26"/>
      <circle cx="76" cy="56" r="2.2" fill="#d07bff"/>
      <circle cx="90" cy="56" r="2.2" fill="#d07bff"/>
      <path d="M52 28 C20 48 18 112 52 132" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round"/>
      <path d="M52 28 C20 48 18 112 52 132" fill="none" stroke="#e8dfc8" stroke-width="5.5" stroke-linecap="round"/>
      <path d="M52 30 L76 82 L52 130" fill="none" stroke="#d5a8ff" stroke-width="2"/>
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
      <path d="M50 144 C46 112 56 76 88 76 C120 76 130 112 126 144 L108 134 L94 146 L82 134 L68 146 Z" fill="url(#lMantle)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <polygon points="62,42 56,14 74,30 88,10 102,30 120,14 114,42" fill="#f0c46c" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M62 44 C62 30 114 30 114 44 L110 74 C102 84 74 84 66 74 Z" fill="#eae2d6" stroke="${INK}" stroke-width="5"/>
      <circle cx="76" cy="56" r="6" fill="#18052e"/>
      <circle cx="98" cy="56" r="6" fill="#18052e"/>
      <circle cx="76" cy="56" r="3.2" fill="#e0aaff"/>
      <circle cx="98" cy="56" r="3.2" fill="#e0aaff"/>
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
      <path d="M96 64 C118 20 148 16 154 44 C142 56 138 72 146 92 C126 84 114 90 102 104 Z" fill="url(#dWing)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M68 58 C52 24 24 22 18 46 C32 54 40 66 36 82 L68 84 Z" fill="url(#dWing)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M104 114 C132 120 146 138 134 148 C122 144 114 134 98 130 Z" fill="url(#dScale)" stroke="${INK}" stroke-width="5"/>
      <path d="M56 76 C56 58 112 58 112 78 L116 128 C102 144 64 144 52 128 Z" fill="url(#dScale)" stroke="${INK}" stroke-width="5.5"/>
      <ellipse cx="78" cy="106" rx="18" ry="22" fill="url(#dCore)" stroke="${INK}" stroke-width="4"/>
      <path d="M64 40 L48 12 L74 30 Z M92 38 L114 12 L100 34 Z" fill="#f5c869" stroke="${INK}" stroke-width="4.5"/>
      <path d="M26 56 L54 40 C74 32 102 38 102 58 C102 74 78 82 54 78 L26 72 Z" fill="url(#dScale)" stroke="${INK}" stroke-width="5.5" stroke-linejoin="round"/>
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

  function svgToDataUrl(svg) {
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  // All 16 bespoke 32x32 Crisp Pixel-Art Hero SVGs (1~5 Cost)
  const HERO_SPRITES = {
    knight: "assets/heroes/hero-knight.svg",
    assassin: "assets/heroes/hero-assassin.svg",
    valkyrie: "assets/heroes/hero-valkyrie.svg",
    archer: "assets/heroes/hero-archer.svg",
    mage: "assets/heroes/hero-mage.svg",
    priest: "assets/heroes/hero-priest.svg",
    berserker: "assets/heroes/hero-berserker.svg",
    engineer: "assets/heroes/hero-engineer.svg",
    frost_warden: "assets/heroes/hero-frost-warden.svg",
    necromancer: "assets/heroes/hero-necromancer.svg",
    bard: "assets/heroes/hero-bard.svg",
    shadow_blade: "assets/heroes/hero-shadow-blade.svg",
    sun_templar: "assets/heroes/hero-sun-templar.svg",
    chrono_mage: "assets/heroes/hero-chrono-mage.svg",
    astral_valkyrie: "assets/heroes/hero-astral-valkyrie.svg",
    void_emperor: "assets/heroes/hero-void-emperor.svg"
  };

  // Unified art URL map
  const SPRITE_URLS = {
    ...HERO_SPRITES,
    joker: "assets/heroes/hero-joker.svg",
    turret: "assets/heroes/summon-turret.svg",
    arenaBg: "assets/arena-bg.webp",
    gold: "assets/sym-gold.png",
    boss_grom: "assets/boss-warlord.png",
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
    HERO_SPRITES,
    SPRITE_URLS,
    UI_ICONS,
    getSpriteImg,
    getEnemyArtKey,
    renderPortraitImg
  };
})();
