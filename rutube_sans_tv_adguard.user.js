// ==UserScript==
// @name         Рутубочист
// @namespace    https://github.com/npekpacHo/rutubochist
// @version      1.2.3
// @description  Рутубочист: прячет на RUTUBE политоту, телевизионщину, Shorts, нежелательные каналы, комментарии и лишнее вокруг просмотра. Есть рекомендации что посмотреть, чистый плеер, анти-автозапуск, импорт/экспорт ЧС.
// @author       elekt_riki
// @license      MIT
// @homepageURL  https://npekpacho.github.io/rutubochist/
// @supportURL   https://github.com/npekpacHo/rutubochist/issues
// @updateURL    https://npekpacho.github.io/rutubochist/rutube_sans_tv_adguard.user.js
// @downloadURL  https://npekpacho.github.io/rutubochist/rutube_sans_tv_adguard.user.js
// @match        https://rutube.ru/*
// @match        https://*.rutube.ru/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const STORE_KEY = 'rtSansTvSettings:v1';
  const UI_VERSION = '1.2.3';

  const DEFAULT_BLOCKED_CHANNELS = [
    // Телевизор и пропаганда
    'Первый канал', 'Россия 1', 'Россия 24', 'НТВ', 'Пятый канал', 'РЕН ТВ', 'ТВЦ', 'ТВ Центр',
    'Звезда', 'СПАС', 'RT', 'RTД на русском', 'РИА Новости', 'ТАСС', 'Известия', 'Комсомольская правда',
    'Царьград', 'Соловьёв LIVE', 'Соловьев LIVE', 'БесогонТВ', 'БесогонТВ | besogontv', 'Дмитрий Пучков', 
    'ЛДПР ТВ', 'Москва 24', '360', 'Sputnik', 'ВЕСТИ', 'СМЕРШ',
    
    // Развлекательное ТВ
    'ТНТ', 'СТС', 'Пятница!', 'Муз-ТВ', 'Телеканал Ю', 'Домашний', 'МАТЧ!', 'МАТЧ ТВ',

    // Главные рассадники детского треша
    'Влад А4', 'А4', 'Компот', 'Глент', 'Кобяков'
  ];

  const DEFAULT_BLOCKED_WORDS = [
    // === ДЕТСКИЙ ТРЕШ И ИГРЫ ===
    'roblox', 'роблокс', 'minecraft', 'майнкрафт', 'майн', 'brawl stars', 'бравл старс', 'бравл', 
    'летсплей', 'прохождение', 'а4', 'глент', 'кобяков', 'компот', 'сиреноголовый', 'хаги ваги', 
    'скибиди', 'skibidi', 'among us', 'амонг ас', 'fnaf', 'фнаф', 'челлендж', 'прятки', '24 часа', 'короче говоря',
    
    // === ТВ И ШОУ-БИЗНЕС ===
    'мусагалиев', 'дорохов', 'шастун', 'шоу воли', 'однажды в россии', 'импровизация', 'прожарка', 
    'где логика', 'решалы', 'мужское женское', 'мужское/женское', 'малахов', 'пусть говорят', 
    'давай поженимся', 'дом 2', 'дом-2', 'битва экстрасенсов', 'экстрасенс', 'камеди клаб', 
    'comedy club', 'харламов', 'павел воля', 'чбд', 'что было дальше', 'сабуров', 'квн', 
    'уральские пельмени', 'звезды сошлись', 'секрет на миллион', 'ивлеева', 'бузова', 
    'даня милохин', 'моргенштерн', 'инстасамка', 'вдудь', 'собчак', 'шокирующая правда', 'скандал',

    // === ЯВНАЯ ПОЛИТИКА / НОВОСТИ ===
    'новости', 'срочные новости', 'экстренное', 'сенсация', 'политика', 'геополитика', 'госдума', 
    'совфед', 'кремль', 'правительство', 'минобороны', 'мид россии', 'песков', 'медведев', 'война',
    'захарова', 'лавров', 'путин', 'зеленский', 'байден', 'трамп', 'нато', 'санкции', 'выборы', 
    'депутат', 'послание президента', 'прямая линия', 'брикс', 'запад', 'европа', 'вашингтон',

    // === ВОЕННАЯ ПОВЕСТКА ===
    'сво', 'спецоперация', 'специальная военная операция', 'украина', 'донбасс', 'днр', 'лнр', 
    'фронт', 'мобилизация', 'контрнаступление', 'всу', 'вкс', 'военкор', 'военная хроника', 
    'линия соприкосновения', 'удар по', 'ракетный удар', 'дрон', 'бпла', 'наши', 'герои сво', 
    'победа будет за нами', 'отважные', 'террорист', 'террористов', 'конфликт', 'конфликта', 'конфликтов',

    // === ТВ-ФОРМАТЫ И ПРОПАГАНДИСТЫ ===
    'время покажет', '60 минут', 'вечер с владимиром соловьевым', 'вечер с владимиром соловьёвым', 
    'соловьев live', 'соловьёв live', 'бесогон', 'место встречи', 'открытый эфир', 'разговоры о важном', 
    'итоги недели', 'вести недели', 'вести', 'события', 'прямой эфир', 'ток-шоу', 'воскресный вечер', 
    'антифейк', 'скабеева', 'шейнин', 'кузичев', 'мардан', 'киселев', 'кеосаян', 'симоньян', 'михеев', 
    'корчевников', 'норкин', 'куликов', 'понасенков'
  ];

  const SETTINGS_DEFAULTS = {
    enabled: true, showHidden: false, hideSideMenuPolitics: true, hideShorts: false, hardRemove: false,
    cleanRutubeChrome: true, cleanWatchPage: true, disableAutoplay: true, hideComments: false,
    safeRouterPatch060: true, safeDelayedScan070: true,
    blockedChannels: DEFAULT_BLOCKED_CHANNELS, blockedWords: DEFAULT_BLOCKED_WORDS, userChannels: [], userWords: []
  };

  let settings = loadSettings();
  let scanTimer = null;
  let observer = null;
  let lastUrl = location.href;
  let hiddenCount = 0;
  let removedCount = 0;
  let suspendScanUntil = 0;
  let lastUserGestureAt = 0;
  let nextAutoplayBlockUntil = 0;
  let lastVideoEndedAt = 0;
  let autoplayGuardInstalled = false;

  const MOVIE_DB_BASE_URLS = [
    'https://npekpacho.github.io/rutubochist/movies/',
    'https://raw.githubusercontent.com/npekpacHo/rutubochist/main/movies/'
  ];
  const MOVIE_DB_INDEX_FILE = 'index.json';
  const MOVIE_DB_CACHE_KEY = 'rtstMovieDbCache:v1';
  const MOVIE_DB_UPDATE_INTERVAL_MS = 3 * 24 * 60 * 60 * 1000;
  const PROJECT_URL = 'https://github.com/npekpacHo/rutubochist';
  const movieCache = { index: null, batches: new Map(), currentIndex: 0, currentBatch: null, source: 'none', savedAt: 0 };
  let githubState = { state: 'unknown', checkedAt: 0, message: 'GitHub ещё не проверялся.' };

  function loadSettings() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return structuredCloneSafe(SETTINGS_DEFAULTS);
      const saved = JSON.parse(raw);
      const merged = {
        ...structuredCloneSafe(SETTINGS_DEFAULTS), ...saved,
        blockedChannels: unique([...(saved.blockedChannels || DEFAULT_BLOCKED_CHANNELS)]),
        blockedWords: unique([...(saved.blockedWords || DEFAULT_BLOCKED_WORDS)]),
        userChannels: unique([...(saved.userChannels || [])]), userWords: unique([...(saved.userWords || [])])
      };
      merged.hardRemove = false;
      return merged;
    } catch (e) {
      console.warn('[RUTUBE Sans TV] Не удалось прочитать настройки:', e);
      return structuredCloneSafe(SETTINGS_DEFAULTS);
    }
  }

  function saveSettings() {
    localStorage.setItem(STORE_KEY, JSON.stringify(settings));
  }

  function structuredCloneSafe(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function unique(arr) {
    const seen = new Set();
    const out = [];
    for (const item of arr) {
      const clean = String(item || '').trim();
      const key = normalize(clean);
      if (!clean || seen.has(key)) continue;
      seen.add(key);
      out.push(clean);
    }
    return out;
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/ё/g, 'е').replace(/[#«»"'`´“”„]/g, '').replace(/\s+/g, ' ').trim();
  }

  function compactText(el) {
    return normalize((el && el.textContent) || '');
  }

  function allBlockedChannels() {
    return unique([...settings.blockedChannels, ...settings.userChannels]);
  }

  function allBlockedWords() {
    return unique([...settings.blockedWords, ...settings.userWords]);
  }

  function containsBlocked(text, list) {
    const nText = normalize(text);
    if (!nText) return null;
    for (const item of list) {
      const nItem = normalize(item);
      if (!nItem) continue;
      if (nItem.length <= 4 && /^[a-zа-я0-9]+$/i.test(nItem)) {
        const re = new RegExp(`(^|[^a-zа-я0-9])${escapeRegExp(nItem)}([^a-zа-я0-9]|$)`, 'i');
        if (re.test(nText)) return item;
      } else if (nText.includes(nItem)) {
        return item;
      }
    }
    return null;
  }

  function escapeRegExp(str) {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function addStyle() {
    const css = `
      body[data-page="video"] .video-page-layout-module__right,
      body[data-page="video"] .wdp-see-also-module__wrapper,
      body[data-page="video"] section[aria-label="Рекомендации" i] {
        display: none !important;
      }
      .rtst-hidden {
        display: none !important; width: 0 !important; height: 0 !important;
        min-width: 0 !important; min-height: 0 !important; margin: 0 !important;
        padding: 0 !important; border: 0 !important; overflow: hidden !important;
      }
      .rtst-chrome-hidden, .rtst-view-hidden { display: none !important; }
      .rtst-dim {
        opacity: .28 !important; filter: grayscale(1) blur(.4px) !important;
        outline: 2px dashed rgba(0,0,0,.28) !important; position: relative !important;
      }
      .rtst-dim::before {
        content: attr(data-rtst-reason); position: absolute; z-index: 2147483001;
        left: 8px; top: 8px; max-width: calc(100% - 16px); padding: 6px 9px;
        border-radius: 9px; background: rgba(0,0,0,.78); color: #fff;
        font: 12px/1.25 Arial, sans-serif; pointer-events: none;
      }
      .rtst-block-btn {
        display: inline-flex !important; align-items: center !important; justify-content: center !important;
        width: 24px !important; height: 24px !important; min-width: 24px !important; min-height: 24px !important;
        margin: 3px 0 3px 8px !important; padding: 0 !important; border: 1px solid rgba(255,255,255,.55) !important;
        border-radius: 6px !important; background: rgba(18,18,18,.92) !important; color: #fff !important;
        cursor: pointer !important; font: 700 15px/1 Arial, sans-serif !important;
        box-shadow: 0 1px 2px rgba(255,255,255,.18), 0 2px 7px rgba(0,0,0,.34) !important;
        text-decoration: none !important; user-select: none !important; vertical-align: middle !important; flex: 0 0 auto !important;
      }
      .rtst-block-btn:hover { background: #f2f2f2 !important; border-color: rgba(0,0,0,.45) !important; color: #111 !important; }
      .rtst-block-btn:active { transform: scale(.96) !important; }
      .rtst-home-link {
        display: inline-flex !important; align-items: center !important; justify-content: center !important;
        min-height: 36px !important; min-width: 0 !important; margin: 0 8px 0 0 !important; text-decoration: none !important;
        white-space: nowrap !important; box-sizing: border-box !important; flex: 0 0 auto !important;
      }
      .rtst-home-link:not([class*="__wdp_"]) {
        padding: 0 14px !important; border: 1px solid rgba(255,255,255,.16) !important; border-radius: 6px !important;
        background: var(--pen-button-primary, #00A1E7) !important; color: var(--pen-button-primary-text, #fff) !important;
        font: 700 14px/1 Arial, sans-serif !important;
      }
      .rtst-home-link:not([class*="__wdp_"]):hover {
        background: var(--pen-button-primary-hover, #1EABE9) !important; color: var(--pen-button-primary-hover-text, #fff) !important;
      }
      .rtst-home-link .rtst-home-content { display: inline-flex !important; align-items: center !important; justify-content: center !important; gap: 4px !important; }
      .rtst-panel {
        position: fixed !important; right: 14px !important; bottom: 14px !important; z-index: 2147483600 !important;
        width: 336px !important; max-width: calc(100vw - 28px) !important; max-height: calc(100vh - 28px) !important;
        overflow: auto !important; border: 1px solid rgba(186,242,198,.28) !important; border-radius: 8px !important;
        background: rgba(18,18,18,.97) !important; color: #f4fff7 !important; box-shadow: 0 14px 42px rgba(0,0,0,.42) !important;
        font: 13px/1.35 Arial, sans-serif !important; backdrop-filter: blur(10px) !important;
      }
      .rtst-panel * { box-sizing: border-box !important; }
      .rtst-panel[data-collapsed="1"] { width: auto !important; min-width: 0 !important; max-width: none !important; overflow: visible !important; border-radius: 6px !important; }
      .rtst-panel[data-collapsed="1"] .rtst-panel-body, .rtst-panel[data-collapsed="1"] .rtst-panel-main, .rtst-panel[data-collapsed="1"] .rtst-panel-caret { display: none !important; }
      .rtst-panel[data-collapsed="1"] .rtst-panel-head { width: auto !important; min-width: 40px !important; height: 40px !important; padding: 0 9px !important; justify-content: center !important; gap: 6px !important; border-bottom: 0 !important; }
      .rtst-panel[data-collapsed="1"][data-page="video"] .rtst-panel-head { width: 40px !important; min-width: 40px !important; padding: 0 !important; }
      .rtst-panel[data-collapsed="1"] .rtst-panel-compact { display: inline-flex !important; }
      .rtst-panel[data-collapsed="1"][data-page="video"] .rtst-panel-compact-count { display: none !important; }
      .rtst-panel-main { min-width: 0 !important; }
      .rtst-panel-compact { display: none !important; align-items: center !important; justify-content: center !important; gap: 5px !important; font: 800 14px/1 Arial, sans-serif !important; color: #f4fff7 !important; white-space: nowrap !important; }
      .rtst-panel-compact-icon { display: inline-flex !important; align-items: center !important; justify-content: center !important; width: 18px !important; height: 18px !important; color: #f4fff7 !important; }
      .rtst-panel-compact-count { min-width: 1ch !important; color: rgba(244,255,247,.78) !important; font-weight: 800 !important; }
      .rtst-panel-head { display: flex !important; align-items: center !important; justify-content: space-between !important; gap: 10px !important; padding: 12px 14px !important; cursor: pointer !important; border-bottom: 1px solid rgba(255,255,255,.12) !important; background: rgba(255,255,255,.035) !important; }
      .rtst-panel-title { font-weight: 800 !important; font-size: 16px !important; letter-spacing: .2px !important; }
      .rtst-panel-subtitle { margin-top: 1px !important; opacity: .72 !important; font-size: 12px !important; }
      .rtst-panel-counter { margin-top: 3px !important; opacity: .78 !important; font-size: 12px !important; }
      .rtst-panel-caret { width: 28px !important; height: 28px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; border-radius: 6px !important; background: rgba(255,255,255,.08) !important; border: 1px solid rgba(255,255,255,.11) !important; }
      .rtst-panel .rtst-head-gear { width: 28px !important; height: 28px !important; min-width: 28px !important; min-height: 28px !important; padding: 0 !important; border-radius: 6px !important; background: rgba(255,255,255,.08) !important; border: 1px solid rgba(255,255,255,.11) !important; color: #f4fff7 !important; box-shadow: none !important; font: 700 15px/1 Arial, sans-serif !important; }
    .rtst-panel .rtst-head-gear:hover { background: rgba(255,255,255,.16) !important; filter: none !important; }
    .rtst-panel[data-collapsed="1"] .rtst-head-gear { display: none !important; }
    .rtst-panel-body { padding: 12px 14px 14px !important; }
      .rtst-row { display: flex !important; gap: 8px !important; align-items: center !important; flex-wrap: wrap !important; margin: 8px 0 !important; }
      .rtst-panel label { display: flex !important; gap: 7px !important; align-items: center !important; cursor: pointer !important; }
      .rtst-panel input[type="text"] { width: 100% !important; min-height: 32px !important; padding: 6px 8px !important; border-radius: 11px !important; border: 1px solid rgba(186,242,198,.22) !important; background: rgba(255,255,255,.08) !important; color: #f4fff7 !important; outline: none !important; }
      .rtst-panel textarea { width: 100% !important; min-height: 90px !important; padding: 7px 8px !important; border-radius: 11px !important; border: 1px solid rgba(186,242,198,.22) !important; background: rgba(255,255,255,.08) !important; color: #f4fff7 !important; outline: none !important; resize: vertical !important; font: 12px/1.35 Consolas, monospace !important; }
      .rtst-panel button { min-height: 30px !important; padding: 6px 9px !important; border: 0 !important; border-radius: 999px !important; background: linear-gradient(135deg, #e9ffed, #bdf2c8) !important; color: #122216 !important; cursor: pointer !important; font: 700 12px/1.2 Arial, sans-serif !important; box-shadow: 0 2px 8px rgba(0,0,0,.18) !important; }
      .rtst-panel button:hover { filter: brightness(.9) !important; }
      #rtst-import-file { display: none !important; }
      .rtst-panel .rtst-danger { background: linear-gradient(135deg, #ffe4e1, #ffb9b1) !important; color: #3b0d08 !important; }
      .rtst-small { opacity: .72 !important; font-size: 12px !important; }
      .rtst-section { margin: 10px 0 !important; padding: 10px !important; border: 1px solid rgba(255,255,255,.10) !important; border-radius: 7px !important; background: rgba(255,255,255,.045) !important; }
      .rtst-section-title { margin: 0 0 8px !important; font: 700 12px/1.2 Arial, sans-serif !important; color: rgba(244,255,247,.86) !important; letter-spacing: .2px !important; }
      .rtst-radio-group { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 6px !important; }
      .rtst-radio { min-height: 30px !important; padding: 6px 8px !important; border: 1px solid rgba(255,255,255,.14) !important; border-radius: 6px !important; background: rgba(255,255,255,.055) !important; }
      .rtst-panel input[type="radio"], .rtst-panel input[type="checkbox"] { accent-color: #bdf2c8 !important; }
      .rtst-actions { display: flex !important; gap: 6px !important; flex-wrap: wrap !important; margin-top: 8px !important; }
    .rtst-panel .rtst-movie-cta { margin: 2px 0 13px !important; padding: 0 !important; }
    .rtst-panel .rtst-movie-cta-btn { width: 100% !important; min-height: 42px !important; padding: 8px 14px !important; border-radius: 10px !important; font: 800 14px/1.2 Arial, sans-serif !important; letter-spacing: .1px !important; }
    .rtst-panel .rtst-movie-cta-caption { margin-top: 7px !important; color: rgba(244,255,247,.66) !important; font: 12px/1.35 Arial, sans-serif !important; text-align: center !important; }
    .rtst-panel-footer { display: flex !important; align-items: center !important; justify-content: space-between !important; gap: 10px !important; margin-top: 12px !important; padding-top: 10px !important; border-top: 1px solid rgba(255,255,255,.10) !important; }
    .rtst-panel-footer .rtst-small { flex: 1 1 auto !important; }
    .rtst-panel .rtst-github-link { flex: 0 0 auto !important; width: 34px !important; height: 34px !important; min-width: 34px !important; min-height: 34px !important; padding: 0 !important; border-radius: 10px !important; border: 1px solid rgba(255,255,255,.14) !important; background: rgba(255,255,255,.08) !important; box-shadow: none !important; color: #cfcfcf !important; font: 20px/1 Arial, sans-serif !important; }
    .rtst-panel .rtst-github-link[data-state="ok"] { color: #53ff7c !important; border-color: rgba(83,255,124,.42) !important; background: rgba(83,255,124,.11) !important; }
    .rtst-panel .rtst-github-link[data-state="bad"] { color: #ff6b6b !important; border-color: rgba(255,107,107,.42) !important; background: rgba(255,107,107,.11) !important; }
    .rtst-panel .rtst-github-link[data-state="checking"] { color: #ffd166 !important; border-color: rgba(255,209,102,.42) !important; background: rgba(255,209,102,.10) !important; }
    .rtst-panel .rtst-github-link:hover { filter: none !important; background: rgba(255,255,255,.16) !important; }

      .rtst-panel .rtst-mini-btn { min-height: 28px !important; padding: 5px 8px !important; border-radius: 6px !important; background: rgba(255,255,255,.10) !important; color: #f4fff7 !important; border: 1px solid rgba(255,255,255,.14) !important; box-shadow: none !important; font-weight: 600 !important; }
      .rtst-panel .rtst-mini-btn:hover { background: rgba(255,255,255,.18) !important; }
      .rtst-count { opacity: .62 !important; font-weight: 400 !important; }
      .rtst-modal-backdrop { position: fixed !important; inset: 0 !important; z-index: 2147483650 !important; display: flex !important; align-items: center !important; justify-content: center !important; padding: 16px !important; background: rgba(0,0,0,.58) !important; font-family: Arial, sans-serif !important; }
      .rtst-modal { width: 520px !important; max-width: calc(100vw - 32px) !important; max-height: calc(100vh - 32px) !important; overflow: auto !important; border: 1px solid rgba(255,255,255,.14) !important; border-radius: 8px !important; background: #171717 !important; color: #f4fff7 !important; box-shadow: 0 18px 56px rgba(0,0,0,.55) !important; }
      .rtst-modal-head { display: flex !important; justify-content: space-between !important; align-items: center !important; gap: 10px !important; padding: 12px 14px !important; border-bottom: 1px solid rgba(255,255,255,.10) !important; }
      .rtst-modal-title { font: 700 15px/1.2 Arial, sans-serif !important; }
      .rtst-modal-body { padding: 12px 14px 14px !important; }
      .rtst-modal textarea { width: 100% !important; min-height: 260px !important; padding: 8px !important; border: 1px solid rgba(255,255,255,.16) !important; border-radius: 6px !important; background: rgba(255,255,255,.06) !important; color: #f4fff7 !important; outline: none !important; resize: vertical !important; font: 12px/1.35 Consolas, monospace !important; }
      .rtst-modal-actions { display: flex !important; justify-content: space-between !important; gap: 8px !important; flex-wrap: wrap !important; margin-top: 10px !important; }
      .rtst-modal button { min-height: 30px !important; padding: 6px 10px !important; border: 1px solid rgba(255,255,255,.14) !important; border-radius: 6px !important; background: #ececec !important; color: #111 !important; cursor: pointer !important; font: 600 12px/1.2 Arial, sans-serif !important; }
      .rtst-modal .rtst-danger { background: #ffcbc6 !important; color: #2a0805 !important; }
      .rtst-modal.rtst-movie-modal { width: 820px !important; max-width: calc(100vw - 32px) !important; }
    .rtst-movie-source { color: rgba(244,255,247,.76) !important; text-decoration: underline !important; }
    .rtst-modal .rtst-movie-source-btn { min-height: 0 !important; padding: 0 !important; border: 0 !important; border-radius: 0 !important; background: transparent !important; color: rgba(244,255,247,.76) !important; box-shadow: none !important; text-decoration: underline !important; font: 12px/1.35 Arial, sans-serif !important; cursor: pointer !important; }
    .rtst-modal .rtst-movie-source-btn:hover { color: #f4fff7 !important; filter: none !important; }
    .rtst-movie-toolbar { display: flex !important; align-items: center !important; justify-content: space-between !important; gap: 8px !important; flex-wrap: wrap !important; margin: 0 0 10px !important; }
    .rtst-movie-nav { display: flex !important; gap: 6px !important; flex-wrap: wrap !important; align-items: center !important; }
    .rtst-movie-status { color: rgba(244,255,247,.78) !important; font: 12px/1.35 Arial, sans-serif !important; }
    .rtst-movie-list { display: flex !important; flex-direction: column !important; gap: 6px !important; margin-top: 8px !important; }
    .rtst-modal .rtst-movie-row { display: block !important; width: 100% !important; min-height: 0 !important; margin: 0 !important; padding: 8px 10px !important; border: 1px solid rgba(255,255,255,.10) !important; border-radius: 8px !important; background: rgba(255,255,255,.055) !important; color: #f4fff7 !important; cursor: pointer !important; text-align: left !important; box-shadow: none !important; font: 13px/1.35 Arial, sans-serif !important; }
    .rtst-modal .rtst-movie-row:hover { background: rgba(255,255,255,.105) !important; filter: none !important; }
    .rtst-movie-title-line { display: block !important; color: #f4fff7 !important; font-weight: 800 !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; }
    .rtst-movie-meta-line { display: block !important; margin-top: 2px !important; color: rgba(244,255,247,.76) !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; font-size: 12px !important; }
    .rtst-movie-loading, .rtst-movie-error, .rtst-movie-empty { padding: 12px !important; border: 1px solid rgba(255,255,255,.10) !important; border-radius: 8px !important; background: rgba(255,255,255,.055) !important; color: rgba(244,255,247,.82) !important; font: 13px/1.45 Arial, sans-serif !important; }
    .rtst-movie-error { color: #ffd6d2 !important; }
    @media (max-width: 680px) { .rtst-modal.rtst-movie-modal { width: calc(100vw - 20px) !important; max-width: calc(100vw - 20px) !important; } .rtst-movie-meta-line { white-space: normal !important; } }
    .rtst-toast { position: fixed !important; right: 14px !important; bottom: 14px !important; z-index: 2147483647 !important; max-width: calc(100vw - 28px) !important; padding: 10px 12px !important; border-radius: 12px !important; background: rgba(0,0,0,.86) !important; color: #fff !important; font: 13px/1.35 Arial, sans-serif !important; box-shadow: 0 8px 30px rgba(0,0,0,.3) !important; }
    `;

    const inject = () => {
      if (document.getElementById('rtst-style')) return;
      const style = document.createElement('style');
      style.id = 'rtst-style';
      style.textContent = css;
      (document.head || document.documentElement).appendChild(style);
    };

    if (document.head || document.documentElement) inject();
    else document.addEventListener('DOMContentLoaded', inject, { once: true });
  }

  function refreshLegacyControls() {
    document.querySelectorAll('.rtst-block-btn[data-rtst-action="block-card-channel"]').forEach((btn) => {
      if (isWatchPage()) { btn.remove(); return; }
      btn.textContent = '⊘';
      if (!btn.getAttribute('aria-label')) {
        const channel = btn.dataset.rtstChannel || 'канал';
        btn.setAttribute('aria-label', `Скрыть канал: ${channel}`);
      }
    });

    const current = document.getElementById('rtst-current-channel-btn');
    if (current) {
      if (isWatchPage()) current.remove();
      else current.textContent = '⊘ скрыть канал';
    }
  }

  function createPanel() {
    const oldPanel = document.getElementById('rtst-panel');
    if (oldPanel && oldPanel.dataset.rtstUiVersion === UI_VERSION) {
      syncPanel();
      return;
    }
    if (oldPanel) oldPanel.remove();

    const panel = document.createElement('div');
    panel.id = 'rtst-panel';
    panel.className = 'rtst-panel';
    panel.dataset.collapsed = '1';
    panel.dataset.rtstUiVersion = UI_VERSION;

    panel.innerHTML = `
      <div class="rtst-panel-head" data-rtst-action="toggle-panel" title="Открыть Рутубочист">
        <div class="rtst-panel-main">
          <div class="rtst-panel-title">Рутубочист</div>
          <div class="rtst-panel-subtitle">Мне это совсем не нравится!</div>
          <div class="rtst-panel-counter" id="rtst-counter">скрыто: 0</div>
        </div>
        <div class="rtst-panel-compact" aria-hidden="true">
          <span class="rtst-panel-compact-icon">⊘</span>
          <span class="rtst-panel-compact-count" id="rtst-compact-count">0</span>
        </div>
        <button type="button" class="rtst-head-gear" data-rtst-action="open-settings-modal" title="Настройки">⚙</button>
        <div class="rtst-panel-caret">▾</div>
      </div>
      <div class="rtst-panel-body">
        <div class="rtst-movie-cta">
          <button type="button" class="rtst-movie-cta-btn" data-rtst-action="open-movie-modal">Что посмотреть?</button>
          <div class="rtst-movie-cta-caption">подборки от CentralZD</div>
        </div>
        <div class="rtst-panel-footer">
          <div class="rtst-small">Кнопка «⊘» скрывает канал. Чистый просмотр оставляет видео, описание и действия и точечно убирает рекомендательные секции.</div>
          <button type="button" class="rtst-github-link" id="rtst-github-link" data-rtst-action="open-project" data-state="unknown" title="Открыть GitHub проекта">🐙</button>
        </div>
      </div>
    `;

    document.documentElement.appendChild(panel);
    updatePanelRouteState();
    syncGithubBadge();
    syncPanel();
  }

  function updatePanelRouteState() {
    const isVideo = /^\/video\//.test(location.pathname);
    document.body.dataset.page = isVideo ? 'video' : 'other';
    const panel = document.getElementById('rtst-panel');
    if (!panel) return;
    panel.dataset.page = isVideo ? 'video' : 'other';
  }

  function syncPanel() {
    updatePanelRouteState();
    const enabledOn = document.getElementById('rtst-enabled-on');
    const enabledOff = document.getElementById('rtst-enabled-off');
    if (enabledOn && enabledOff) {
      enabledOn.checked = Boolean(settings.enabled);
      enabledOff.checked = !settings.enabled;
    }
    const showHidden = document.getElementById('rtst-show-hidden');
    if (showHidden) showHidden.checked = Boolean(settings.showHidden);
    const hideMenu = document.getElementById('rtst-hide-menu');
    if (hideMenu) hideMenu.checked = Boolean(settings.hideSideMenuPolitics || settings.cleanRutubeChrome);
    const hideShorts = document.getElementById('rtst-hide-shorts');
    if (hideShorts) hideShorts.checked = Boolean(settings.hideShorts);
    const cleanWatch = document.getElementById('rtst-clean-watch');
    if (cleanWatch) cleanWatch.checked = Boolean(settings.cleanWatchPage);
    const disableAutoplay = document.getElementById('rtst-disable-autoplay');
    if (disableAutoplay) disableAutoplay.checked = Boolean(settings.disableAutoplay);
    const hideCommentsToggle = document.getElementById('rtst-hide-comments');
    if (hideCommentsToggle) hideCommentsToggle.checked = Boolean(settings.hideComments);
    
    const channelCount = document.getElementById('rtst-channel-count');
    if (channelCount) channelCount.textContent = `(${settings.userChannels.length})`;
    
    const wordCount = document.getElementById('rtst-word-count');
    if (wordCount) wordCount.textContent = `(${settings.userWords.length})`;
    updateMovieCacheStatusText();
    syncGithubBadge();
    
    updateCounter();
  }

  function bindEvents() {
    document.addEventListener('change', (event) => {
      const target = event.target;
      if (!target) return;
      if (target.name === 'rtst-enabled-radio') { settings.enabled = target.value === 'on'; saveSettings(); rescanNow(); }
      if (target.id === 'rtst-show-hidden') { settings.showHidden = target.checked; saveSettings(); applyHiddenVisibility(); }
      if (target.id === 'rtst-hide-menu') { settings.hideSideMenuPolitics = target.checked; settings.cleanRutubeChrome = target.checked; saveSettings(); rescanNow(); }
      if (target.id === 'rtst-hide-shorts') { settings.hideShorts = target.checked; saveSettings(); rescanNow(); }
      if (target.id === 'rtst-clean-watch') { settings.cleanWatchPage = target.checked; saveSettings(); rescanNow(); }
      if (target.id === 'rtst-disable-autoplay') { settings.disableAutoplay = target.checked; saveSettings(); scanAutoplayVideos(); }
      if (target.id === 'rtst-hide-comments') { settings.hideComments = target.checked; saveSettings(); rescanNow(); }
      if (target.id === 'rtst-import-file' && target.files && target.files[0]) { importSettingsFromFile(target.files[0]); target.value = ''; }
    }, true);

    document.addEventListener('click', (event) => {
      const linkEl = event.target && event.target.closest && event.target.closest('a[href]');
      if (linkEl && !linkEl.closest('#rtst-panel')) suspendScanUntil = Date.now() + 1400;
      if (event.target && event.target.classList && event.target.classList.contains('rtst-modal-backdrop')) { closeModal(); return; }

      const actionEl = event.target && event.target.closest('[data-rtst-action]');
      if (!actionEl) return;
      const action = actionEl.dataset.rtstAction;

      if (action === 'toggle-panel') {
        const panel = document.getElementById('rtst-panel');
        if (panel) panel.dataset.collapsed = panel.dataset.collapsed === '1' ? '0' : '1';
        return;
      }
      if (action === 'block-card-channel') {
        event.preventDefault(); event.stopPropagation();
        const channel = actionEl.dataset.rtstChannel || '';
        if (channel) blockChannel(channel);
        const card = actionEl.closest('[data-rtst-card="1"]');
        if (card) hideElement(card, `канал: ${channel}`);
        return;
      }
      if (action === 'block-current-channel') {
        event.preventDefault(); event.stopPropagation();
        const channel = detectCurrentPageChannel();
        if (channel) blockChannel(channel);
        else toast('Не смог определить канал.');
        return;
      }
      if (action === 'open-movie-modal') { openMovieModal(); return; }
      if (action === 'open-settings-modal') { openSettingsModal(); return; }
      if (action === 'open-project') { event.preventDefault(); event.stopPropagation(); openProjectPage(); return; }
      if (action === 'movie-newer') { switchMovieBatch(-1); return; }
      if (action === 'movie-older') { switchMovieBatch(1); return; }
      if (action === 'movie-refresh') { refreshMovieNavigator(); return; }
      if (action === 'movie-random') { openRandomMovieSearch(); return; }
      if (action === 'movie-search') { event.preventDefault(); event.stopPropagation(); openRutubeMovieSearch(actionEl.dataset.rtstQuery || '', actionEl.dataset.rtstTrailer === '1'); return; }
      if (action === 'movie-source') { event.preventDefault(); event.stopPropagation(); openExternalMovieSource(actionEl.dataset.rtstUrl || ''); return; }
      if (action === 'update-movie-db') { event.preventDefault(); event.stopPropagation(); updateMovieDbFromSettings(actionEl); return; }
      if (action === 'open-list-modal') { openListModal(actionEl.dataset.rtstList || 'channels'); return; }
      if (action === 'close-modal') { closeModal(); return; }
      if (action === 'modal-save-list') { saveListFromModal(actionEl.dataset.rtstList || 'channels'); return; }
      if (action === 'modal-clear-list') { clearListFromModal(actionEl.dataset.rtstList || 'channels'); return; }
      if (action === 'add-channel') {
        const input = document.getElementById('rtst-add-input');
        const value = input ? input.value.trim() : '';
        if (value) { blockChannel(value); input.value = ''; }
        return;
      }
      if (action === 'add-word') {
        const input = document.getElementById('rtst-add-input');
        const value = input ? input.value.trim() : '';
        if (value) { addUserWord(value); input.value = ''; }
        return;
      }
      if (action === 'reset-user') {
        settings.userChannels = []; settings.userWords = []; saveSettings(); syncPanel();
        toast('Пользовательские списки очищены.'); rescanNow();
        return;
      }
      if (action === 'export-settings') { exportSettings(); return; }
      if (action === 'import-settings') { const input = document.getElementById('rtst-import-file'); if (input) input.click(); }
    }, true);
  }

  function openSettingsModal() {
    closeModal();
    const modal = document.createElement('div');
    modal.className = 'rtst-modal-backdrop';
    modal.innerHTML = `
      <div class="rtst-modal" role="dialog" aria-modal="true">
        <div class="rtst-modal-head">
          <div><div class="rtst-modal-title">Настройки Рутубочиста</div><div class="rtst-small">Всё хозяйство убрано сюда, чтобы панель больше не изображала шкаф управления.</div></div>
          <button type="button" data-rtst-action="close-modal">×</button>
        </div>
        <div class="rtst-modal-body">
          <div class="rtst-section">
            <div class="rtst-section-title">Состояние фильтра</div>
            <div class="rtst-radio-group">
              <label class="rtst-radio"><input type="radio" name="rtst-enabled-radio" id="rtst-enabled-on" value="on"> включён</label>
              <label class="rtst-radio"><input type="radio" name="rtst-enabled-radio" id="rtst-enabled-off" value="off"> выключен</label>
            </div>
          </div>

          <div class="rtst-section">
            <div class="rtst-section-title">Отображение</div>
            <div class="rtst-row"><label><input type="checkbox" id="rtst-show-hidden"> показывать скрытое бледным</label></div>
            <div class="rtst-row"><label><input type="checkbox" id="rtst-hide-menu"> чистить боковое меню</label></div>
            <div class="rtst-row"><label><input type="checkbox" id="rtst-hide-shorts"> скрывать Shorts</label></div>
          </div>

          <div class="rtst-section">
            <div class="rtst-section-title">Страница просмотра</div>
            <div class="rtst-row"><label><input type="checkbox" id="rtst-clean-watch"> чистый просмотр видео</label></div>
            <div class="rtst-row"><label><input type="checkbox" id="rtst-disable-autoplay"> подавлять автовоспроизведение</label></div>
            <div class="rtst-row"><label><input type="checkbox" id="rtst-hide-comments"> скрывать комментарии</label></div>
          </div>

          <div class="rtst-section">
            <div class="rtst-section-title">Добавить в Чёрный список</div>
            <input type="text" id="rtst-add-input" placeholder="Название канала или слово/фраза">
            <div class="rtst-actions">
              <button type="button" class="rtst-mini-btn" data-rtst-action="add-channel">Добавить канал</button>
              <button type="button" class="rtst-mini-btn" data-rtst-action="add-word">Добавить фразу</button>
            </div>
          </div>

          <div class="rtst-section">
            <div class="rtst-section-title">Списки блокировок</div>
            <div class="rtst-actions">
              <button type="button" class="rtst-mini-btn" data-rtst-action="open-list-modal" data-rtst-list="channels">Каналы <span class="rtst-count" id="rtst-channel-count"></span></button>
              <button type="button" class="rtst-mini-btn" data-rtst-action="open-list-modal" data-rtst-list="words">Фразы <span class="rtst-count" id="rtst-word-count"></span></button>
            </div>
          </div>

          <div class="rtst-section">
            <div class="rtst-section-title">Рекомендации</div>
            <div class="rtst-small" id="rtst-movie-cache-status">${escapeHtml(movieCacheStatusText())}</div>
            <div class="rtst-actions">
              <button type="button" class="rtst-mini-btn" data-rtst-action="update-movie-db">Обновить базу рекомендаций</button>
            </div>
          </div>

          <div class="rtst-section">
            <div class="rtst-section-title">Резервная копия</div>
            <div class="rtst-actions">
              <button type="button" class="rtst-mini-btn" data-rtst-action="export-settings">Экспорт</button>
              <button type="button" class="rtst-mini-btn" data-rtst-action="import-settings">Импорт</button>
              <button type="button" class="rtst-mini-btn rtst-danger" data-rtst-action="reset-user">Очистить списки</button>
              <input type="file" id="rtst-import-file" accept="application/json,.json">
            </div>
          </div>

          <div class="rtst-modal-actions">
            <button type="button" data-rtst-action="close-modal">Закрыть</button>
          </div>
        </div>
      </div>`;
    document.documentElement.appendChild(modal);
    syncPanel();
  }

  function openMovieModal(index) {
    closeModal();
    movieCache.currentIndex = Number.isFinite(index) ? index : (movieCache.currentIndex || 0);
    const modal = document.createElement('div');
    modal.className = 'rtst-modal-backdrop';
    modal.innerHTML = `
      <div class="rtst-modal rtst-movie-modal" role="dialog" aria-modal="true">
        <div class="rtst-modal-head">
          <div>
            <div class="rtst-modal-title">Что посмотреть?</div>
            <div class="rtst-small">Компактные подборки фильмов из базы Рутубочиста. Клик по фильму открывает поиск на RUTUBE.</div>
          </div>
          <button type="button" data-rtst-action="close-modal">×</button>
        </div>
        <div class="rtst-modal-body" id="rtst-movie-body">
          <div class="rtst-movie-loading">Загружаю подборки. Если GitHub опять решил быть GitHub, подождём секунду.</div>
        </div>
      </div>`;
    document.documentElement.appendChild(modal);
    renderMovieBatch(movieCache.currentIndex);
  }

  async function renderMovieBatch(index) {
    const body = document.getElementById('rtst-movie-body');
    if (!body) return;
    body.innerHTML = '<div class="rtst-movie-loading">Загружаю подборку...</div>';
    try {
      const result = await loadMovieBatch(index);
      const stillBody = document.getElementById('rtst-movie-body');
      if (!stillBody) return;
      stillBody.innerHTML = renderMovieBatchHtml(result.batch, result.entry, result.indexData, result.index);
    } catch (e) {
      const stillBody = document.getElementById('rtst-movie-body');
      if (!stillBody) return;
      stillBody.innerHTML = `
        <div class="rtst-movie-error">
          Не удалось загрузить базу фильмов.<br>
          Проверь локальный кэш или обнови базу рекомендаций в настройках.<br>
          <span class="rtst-small">${escapeHtml(e && e.message ? e.message : String(e))}</span>
        </div>`;
    }
  }

  function renderMovieBatchHtml(batch, entry, indexData, index) {
    const items = Array.isArray(batch.items) ? batch.items : [];
    const total = Array.isArray(indexData.batches) ? indexData.batches.length : 0;
    const title = batch.title || (entry && entry.title) || 'Подборка фильмов';
    const sourceUrl = batch.sourceUrl || (entry && entry.sourceUrl) || '';
    const sourceLink = sourceUrl ? `<button type="button" class="rtst-movie-source-btn" data-rtst-action="movie-source" data-rtst-url="${escapeAttribute(sourceUrl)}">пост на Пикабу</button>` : '';
    const rows = items.length ? items.map(renderMovieRow).join('') : '<div class="rtst-movie-empty">В этой подборке пусто. Даже кино не выдержало.</div>';
    return `
      <div class="rtst-movie-toolbar">
        <div>
          <div class="rtst-modal-title">${escapeHtml(title)}</div>
          <div class="rtst-movie-status">${escapeHtml(String(index + 1))} из ${escapeHtml(String(total))} · фильмов: ${escapeHtml(String(items.length))}${sourceLink ? ' · ' + sourceLink : ''}</div>
        </div>
        <div class="rtst-movie-nav">
          <button type="button" data-rtst-action="movie-newer" ${index <= 0 ? 'disabled' : ''}>← новее</button>
          <button type="button" data-rtst-action="movie-random">случайный</button>
          <button type="button" data-rtst-action="movie-refresh">обновить</button>
          <button type="button" data-rtst-action="movie-older" ${index >= total - 1 ? 'disabled' : ''}>старее →</button>
        </div>
      </div>
      <div class="rtst-movie-list">${rows}</div>`;
  }

  function renderMovieRow(movie) {
    const query = movie && (movie.query || buildMovieQuery(movie));
    const title = movieTitleLine(movie);
    const meta = [renderMovieGenres(movie && movie.genres), renderMovieRatings(movie && movie.ratings)].filter(Boolean).join('   ');
    return `
      <button type="button" class="rtst-movie-row" data-rtst-action="movie-search" data-rtst-query="${escapeAttribute(query)}" title="Искать на RUTUBE: ${escapeAttribute(query)}">
        <span class="rtst-movie-title-line">${escapeHtml(title)}</span>
        <span class="rtst-movie-meta-line">${escapeHtml(meta || 'без жанров и рейтингов')}</span>
      </button>`;
  }

  function movieTitleLine(movie) {
    if (!movie) return 'Без названия';
    const title = String(movie.title || '').trim() || 'Без названия';
    const original = String(movie.originalTitle || '').trim();
    const year = movie.year ? ` (${movie.year})` : '';
    return `${title}${original ? ' / ' + original : ''}${year}`;
  }

  function buildMovieQuery(movie) {
    if (!movie) return '';
    return [movie.title, movie.originalTitle, movie.year].filter(Boolean).join(' ');
  }

  function renderMovieGenres(genres) {
    if (!Array.isArray(genres) || !genres.length) return '';
    const shown = genres.slice(0, 3).map((genre) => `${movieGenreIcon(genre)} ${genre}`);
    const rest = genres.length - shown.length;
    if (rest > 0) shown.push(`+${rest}`);
    return shown.join('   ');
  }

  function movieGenreIcon(genre) {
    const g = normalize(genre);
    if (g.includes('мюзикл') || g.includes('музык')) return '🎵';
    if (g.includes('драма')) return '🎭';
    if (g.includes('комед')) return '😄';
    if (g.includes('боев')) return '💥';
    if (g.includes('трилл')) return '⚡';
    if (g.includes('ужас')) return '👻';
    if (g.includes('фантаст')) return '🚀';
    if (g.includes('фэнт')) return '🐉';
    if (g.includes('мульт') || g.includes('анима')) return '🎨';
    if (g.includes('детектив')) return '🕵️';
    if (g.includes('криминал')) return '🧩';
    if (g.includes('приключ')) return '🧭';
    if (g.includes('мелодрам')) return '💞';
    if (g.includes('документ')) return '📚';
    if (g.includes('семейн')) return '🏠';
    if (g.includes('вестерн')) return '🤠';
    if (g.includes('воен')) return '🪖';
    if (g.includes('биограф')) return '👤';
    if (g.includes('истор')) return '🏛️';
    if (g.includes('спорт')) return '🏆';
    return '🎬';
  }

  function renderMovieRatings(ratings) {
    if (!ratings || typeof ratings !== 'object') return '';
    const parts = [];
    if (ratings.imdb && Number.isFinite(Number(ratings.imdb.value))) {
      const percent = Number.isFinite(Number(ratings.imdb.percent)) ? Number(ratings.imdb.percent) : Number(ratings.imdb.value) * 10;
      parts.push(`IMDb ${movieRatingBar(percent)} ${formatMovieRatingValue(ratings.imdb.value)}/10`);
    }
    if (ratings.kinopoisk && Number.isFinite(Number(ratings.kinopoisk.value))) {
      const percent = Number.isFinite(Number(ratings.kinopoisk.percent)) ? Number(ratings.kinopoisk.percent) : Number(ratings.kinopoisk.value) * 10;
      parts.push(`КП ${movieRatingBar(percent)} ${formatMovieRatingValue(ratings.kinopoisk.value)}/10`);
    }
    if (ratings.rottenTomatoes && typeof ratings.rottenTomatoes === 'object') {
      const critics = ratings.rottenTomatoes.critics != null ? ratings.rottenTomatoes.critics : '–';
      const audience = ratings.rottenTomatoes.audience != null ? ratings.rottenTomatoes.audience : '–';
      parts.push(`🍅 ${critics}/${audience}`);
    }
    return parts.join('   ');
  }

  function formatMovieRatingValue(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return String(value || '');
    return Number.isInteger(n) ? String(n) : String(Math.round(n * 10) / 10);
  }

  function movieRatingBar(percent) {
    const filled = Math.max(0, Math.min(10, Math.round((Number(percent) || 0) / 10)));
    return '█'.repeat(filled) + '░'.repeat(10 - filled);
  }

  async function loadMovieBatch(index) {
    const indexData = await loadMovieIndex();
    const batches = Array.isArray(indexData.batches) ? indexData.batches : [];
    if (!batches.length) throw new Error('В локальной базе нет batches. Прекрасно, база есть, а фильмов нет.');
    const safeIndex = Math.max(0, Math.min(batches.length - 1, Number(index) || 0));
    const entry = batches[safeIndex];
    const cacheKey = entry.id || entry.file || String(safeIndex);
    let batch = movieCache.batches.get(cacheKey);
    if (!batch) throw new Error(`В локальном кэше нет подборки ${entry.title || cacheKey}. Нажми «Обновить базу рекомендаций» в настройках.`);
    movieCache.currentIndex = safeIndex;
    movieCache.currentBatch = batch;
    maybeUpdateMovieDbInBackground();
    return { indexData, entry, batch, index: safeIndex };
  }

  async function loadMovieIndex() {
    if (movieCache.index) return movieCache.index;
    if (loadMovieDbFromLocalCache()) return movieCache.index;
    await refreshMovieDbCache({ silent: false });
    return movieCache.index;
  }

  function loadMovieDbFromLocalCache() {
    try {
      const raw = localStorage.getItem(MOVIE_DB_CACHE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data || !data.index || !Array.isArray(data.index.batches)) return false;
      movieCache.index = data.index;
      movieCache.batches = new Map(Object.entries(data.batches || {}));
      movieCache.source = data.source || 'local';
      movieCache.savedAt = Number(data.savedAt) || 0;
      return movieCache.batches.size > 0;
    } catch (e) {
      console.warn('[Рутубочист] Не удалось прочитать локальную базу фильмов:', e);
      return false;
    }
  }

  function saveMovieDbToLocalCache(indexData, batches, source) {
    const payload = {
      version: 1,
      savedAt: Date.now(),
      source: source || 'github',
      index: indexData,
      batches
    };
    localStorage.setItem(MOVIE_DB_CACHE_KEY, JSON.stringify(payload));
    movieCache.index = indexData;
    movieCache.batches = new Map(Object.entries(batches || {}));
    movieCache.source = payload.source;
    movieCache.savedAt = payload.savedAt;
  }

  async function refreshMovieDbCache(options = {}) {
    const silent = Boolean(options.silent);
    try {
      const indexData = await loadMovieJsonRemote(MOVIE_DB_INDEX_FILE);
      const batches = Array.isArray(indexData.batches) ? indexData.batches : [];
      if (!batches.length) throw new Error('movies/index.json загружен, но в нём нет batches. Прекрасно, база есть, а фильмов нет.');
      const packed = {};
      for (let i = 0; i < batches.length; i += 1) {
        const entry = batches[i];
        const cacheKey = entry.id || entry.file || String(i);
        if (!entry.file) continue;
        packed[cacheKey] = await loadMovieJsonRemote(entry.file);
      }
      saveMovieDbToLocalCache(indexData, packed, 'github');
      setGithubState('ok', `GitHub доступен. База обновлена: ${formatDateTime(new Date())}.`);
      if (!silent) toast('База рекомендаций обновлена и сохранена локально.');
      return true;
    } catch (e) {
      setGithubState('bad', `GitHub недоступен: ${e && e.message ? e.message : String(e)}`);
      if (!silent) toast('Не удалось обновить базу рекомендаций. Беру локальный кэш, как взрослая программа.');
      if (!movieCache.index) loadMovieDbFromLocalCache();
      return false;
    }
  }

  function maybeUpdateMovieDbInBackground() {
    const now = Date.now();
    if (!movieCache.savedAt) loadMovieDbFromLocalCache();
    if (movieCache.savedAt && now - movieCache.savedAt < MOVIE_DB_UPDATE_INTERVAL_MS) return;
    refreshMovieDbCache({ silent: true });
  }

  async function loadMovieJsonRemote(path) {
    const cleanPath = String(path || '').replace(/^\/+/, '');
    const urls = /^https?:\/\//i.test(cleanPath) ? [cleanPath] : MOVIE_DB_BASE_URLS.map((base) => base + cleanPath);
    let lastError = null;
    for (const baseUrl of urls) {
      const url = baseUrl + (baseUrl.includes('?') ? '&' : '?') + 'rtst=' + Date.now();
      try {
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        return await response.json();
      } catch (e) {
        lastError = e;
      }
    }
    throw lastError || new Error('Не удалось загрузить JSON базы фильмов.');
  }

  function switchMovieBatch(delta) {
    renderMovieBatch((movieCache.currentIndex || 0) + delta);
  }

  async function refreshMovieNavigator() {
    await refreshMovieDbCache({ silent: false });
    renderMovieBatch(movieCache.currentIndex || 0);
  }

  async function updateMovieDbFromSettings(button) {
    if (button) { button.disabled = true; button.textContent = 'Обновляю...'; }
    await refreshMovieDbCache({ silent: false });
    updateMovieCacheStatusText();
    if (button) { button.disabled = false; button.textContent = 'Обновить базу рекомендаций'; }
  }

  function movieCacheStatusText() {
    if (!movieCache.index) loadMovieDbFromLocalCache();
    if (!movieCache.savedAt) return 'Локальная база рекомендаций ещё не загружена.';
    const source = movieCache.source === 'github' ? 'GitHub' : 'локальный кэш';
    const count = movieCache.index && Array.isArray(movieCache.index.batches) ? movieCache.index.batches.length : 0;
    return `Локальная база: ${count} подборок, источник: ${source}, обновлена ${formatDateTime(new Date(movieCache.savedAt))}.`;
  }

  function updateMovieCacheStatusText() {
    const el = document.getElementById('rtst-movie-cache-status');
    if (el) el.textContent = movieCacheStatusText();
  }

  function formatDateTime(date) {
    try {
      return date.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return String(date);
    }
  }

  function setGithubState(state, message) {
    githubState = { state, checkedAt: Date.now(), message: message || '' };
    syncGithubBadge();
  }

  function syncGithubBadge() {
    const btn = document.getElementById('rtst-github-link');
    if (!btn) return;
    btn.dataset.state = githubState.state || 'unknown';
    const label = githubState.state === 'ok'
      ? 'GitHub доступен. Открыть страницу проекта.'
      : githubState.state === 'bad'
        ? 'GitHub недоступен. Открыть страницу проекта.'
        : githubState.state === 'checking'
          ? 'Проверяю GitHub...'
          : 'GitHub ещё не проверялся. Открыть страницу проекта.';
    btn.title = githubState.message ? `${label}
${githubState.message}` : label;
  }

  async function checkGithubAvailability() {
    setGithubState('checking', 'Проверяю доступность GitHub...');
    try {
      await loadMovieJsonRemote(MOVIE_DB_INDEX_FILE);
      setGithubState('ok', 'GitHub доступен.');
    } catch (e) {
      setGithubState('bad', e && e.message ? e.message : String(e));
    }
  }

  function openProjectPage() {
    window.open(PROJECT_URL, '_blank', 'noopener,noreferrer');
  }

  function openRandomMovieSearch() {
    const items = movieCache.currentBatch && Array.isArray(movieCache.currentBatch.items) ? movieCache.currentBatch.items : [];
    if (!items.length) { toast('В текущей подборке фильмов нет. Даже случайности не из чего выбирать.'); return; }
    const movie = items[Math.floor(Math.random() * items.length)];
    openRutubeMovieSearch(movie.query || buildMovieQuery(movie), false);
  }

  function openRutubeMovieSearch(query, trailer) {
    const clean = String(query || '').trim();
    if (!clean) { toast('Пустой поисковый запрос. Кино без названия, артхаус победил.'); return; }
    const finalQuery = trailer ? `${clean} трейлер` : clean;
    const params = new URLSearchParams({ query: finalQuery, content_type: 'video' });
    window.open('https://rutube.ru/search/?' + params.toString(), '_blank', 'noopener');
  }

  function openExternalMovieSource(url) {
    const clean = String(url || '').trim();
    if (!/^https:\/\/pikabu\.ru\//i.test(clean)) { toast('Ссылка на источник выглядит подозрительно. Не открываю.'); return; }
    const opened = window.open(clean, '_blank', 'noopener,noreferrer');
    if (!opened) toast('Браузер заблокировал новую вкладку. Такое вот цифровое гостеприимство.');
  }

  function openListModal(type) {
    closeModal();
    const isWords = type === 'words';
    const title = isWords ? 'Слова и фразы' : 'Скрытые каналы';
    const hint = isWords ? 'По одному слову или фразе в строке.' : 'По одному названию канала в строке.';
    const values = isWords ? settings.userWords : settings.userChannels;

    const modal = document.createElement('div');
    modal.className = 'rtst-modal-backdrop';
    modal.innerHTML = `
      <div class="rtst-modal" role="dialog" aria-modal="true">
        <div class="rtst-modal-head">
          <div><div class="rtst-modal-title">${title}</div><div class="rtst-small">${hint}</div></div>
          <button type="button" data-rtst-action="close-modal">×</button>
        </div>
        <div class="rtst-modal-body">
          <textarea id="rtst-modal-list" spellcheck="false">${escapeHtml(values.join('\n'))}</textarea>
          <div class="rtst-modal-actions">
            <div>
              <button type="button" data-rtst-action="modal-save-list" data-rtst-list="${isWords ? 'words' : 'channels'}">Сохранить список</button>
              <button type="button" data-rtst-action="close-modal">Закрыть</button>
            </div>
            <button type="button" class="rtst-danger" data-rtst-action="modal-clear-list" data-rtst-list="${isWords ? 'words' : 'channels'}">Очистить этот список</button>
          </div>
        </div>
      </div>
    `;
    document.documentElement.appendChild(modal);
    const textarea = document.getElementById('rtst-modal-list');
    if (textarea) textarea.focus();
  }

  function closeModal() { document.querySelectorAll('.rtst-modal-backdrop').forEach((el) => el.remove()); }

  function saveListFromModal(type) {
    const textarea = document.getElementById('rtst-modal-list');
    const values = linesFromTextarea(textarea && textarea.value);
    if (type === 'words') settings.userWords = values; else settings.userChannels = values;
    saveSettings(); syncPanel(); closeModal(); toast('Список сохранён.'); rescanNow();
  }

  function clearListFromModal(type) {
    if (type === 'words') settings.userWords = []; else settings.userChannels = [];
    saveSettings(); syncPanel(); closeModal(); toast(type === 'words' ? 'Список фраз очищен.' : 'Список каналов очищен.'); rescanNow();
  }

  function escapeHtml(value) { return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function linesFromTextarea(value) { return unique(String(value || '').split('\n').map((line) => line.trim()).filter(Boolean)); }

  function blockChannel(channel) {
    const clean = String(channel || '').trim();
    if (!clean) return;
    settings.userChannels = unique([...settings.userChannels, clean]);
    saveSettings(); syncPanel(); toast(`Канал скрыт: ${clean}`); rescanNow();
  }

  function addUserWord(word) {
    const clean = String(word || '').trim();
    if (!clean) return;
    settings.userWords = unique([...settings.userWords, clean]);
    saveSettings(); syncPanel(); toast(`Фраза добавлена: ${clean}`); rescanNow();
  }

  function exportSettings() {
    const payload = {
      app: 'RUTUBE Sans TV', version: '1.2.3', exportedAt: new Date().toISOString(),
      settings: {
        enabled: settings.enabled, showHidden: settings.showHidden, hideSideMenuPolitics: settings.hideSideMenuPolitics,
        hideShorts: settings.hideShorts, hardRemove: settings.hardRemove, cleanRutubeChrome: settings.cleanRutubeChrome,
        blockedChannels: allBlockedChannels(), blockedWords: allBlockedWords(), userChannels: settings.userChannels, userWords: settings.userWords
      }
    };
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'rutube-sans-tv-blocklist.json';
    document.documentElement.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(json).catch(() => {});
    toast('Экспорт готов: JSON скачан.');
  }

  function importSettingsFromFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try { importSettingsData(JSON.parse(String(reader.result || '{}'))); }
      catch (e) { toast('Не смог прочитать JSON.'); }
    };
    reader.readAsText(file, 'utf-8');
  }

  function importSettingsData(data) {
    const src = data && data.settings ? data.settings : data;
    if (!src || typeof src !== 'object') throw new Error('bad settings json');
    const next = { ...settings };
    for (const key of ['blockedChannels', 'blockedWords', 'userChannels', 'userWords']) { if (Array.isArray(src[key])) next[key] = unique(src[key]); }
    for (const key of ['enabled', 'showHidden', 'hideSideMenuPolitics', 'hideShorts', 'hardRemove', 'cleanRutubeChrome', 'cleanWatchPage', 'disableAutoplay', 'hideComments']) {
      if (typeof src[key] === 'boolean') next[key] = src[key];
    }
    settings = next; saveSettings(); syncPanel(); toast('Импорт применён.'); rescanNow();
  }

  function toast(message) {
    const old = document.querySelector('.rtst-toast');
    if (old) old.remove();
    const el = document.createElement('div');
    el.className = 'rtst-toast'; el.textContent = message;
    document.documentElement.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }

  function updateCounter() {
    const counter = document.getElementById('rtst-counter');
    const compactCounter = document.getElementById('rtst-compact-count');
    if (counter) counter.textContent = `скрыто на странице: ${hiddenCount}`;
    if (compactCounter) compactCounter.textContent = String(hiddenCount);
    updatePanelRouteState();
  }

  function scheduleScan() {
    if (scanTimer) clearTimeout(scanTimer);
    const delay = Math.max(700, suspendScanUntil - Date.now() + 120);
    scanTimer = setTimeout(scanPage, delay);
  }

  function rescanNow() { clearAllMarks(); scanPage(); }

  function clearAllMarks() {
    hiddenCount = 0; removedCount = 0;
    document.querySelectorAll('.rtst-hidden,.rtst-dim,.rtst-chrome-hidden,.rtst-view-hidden').forEach((el) => {
      el.classList.remove('rtst-hidden', 'rtst-dim', 'rtst-view-hidden', 'rtst-chrome-hidden');
      el.removeAttribute('data-rtst-hidden'); el.removeAttribute('data-rtst-hide-target');
      el.removeAttribute('data-rtst-reason'); el.removeAttribute('data-rtst-chrome-hidden'); el.removeAttribute('data-rtst-view-hidden');
    });
    document.querySelectorAll('[data-rtst-processed]').forEach((el) => {
      el.removeAttribute('data-rtst-processed'); el.removeAttribute('data-rtst-card'); el.removeAttribute('data-rtst-hidden-child');
    });
    updateCounter();
  }

  function reorderSidebar() {
    if (isWatchPage()) return; 

    const targetItems = [
      { text: 'моё', order: '-2' },
      { text: 'мои подписки', order: '-1' }
    ];

    document.querySelectorAll('a[href]').forEach(a => {
      if (a.closest('#rtst-panel')) return;

      const text = normalize(a.textContent || '');
      const match = targetItems.find(item => item.text === text);
      
      if (match) {
        const listItem = a.closest('li, [role="listitem"]') || a.parentElement;
        if (!listItem) return;

        listItem.style.setProperty('order', match.order, 'important');

        const listContainer = listItem.parentElement;
        if (listContainer) {
          const currentDisplay = getComputedStyle(listContainer).display;
          if (currentDisplay !== 'flex' && currentDisplay !== 'inline-flex') {
            listContainer.style.setProperty('display', 'flex', 'important');
            listContainer.style.setProperty('flex-direction', 'column', 'important');
          }
        }
      }
    });
  }

  function hideShortsBlocks() {
    if (!settings.hideShorts) return;
    
    document.querySelectorAll('section, [class*="section"], [class*="Carousel"]').forEach(el => {
       const aria = normalize(el.getAttribute('aria-label') || '');
       const title = normalize((el.querySelector('h1, h2, h3') || {}).textContent || '');
       
       if (aria.includes('shorts') || aria.includes('шортс') || title.includes('shorts') || title.includes('шортс')) {
           softHideViewElement(el, 'блок shorts');
       }
    });
  }

  function scanPage() {
    if (!document.body) return;
    if (Date.now() < suspendScanUntil) { scheduleScan(); return; }

    if (location.href !== lastUrl) {
      lastUrl = location.href; clearAllMarks(); suspendScanUntil = Date.now() + 2200; scheduleScan(); return;
    }

    createPanel();
    refreshLegacyControls();

    if (!settings.enabled) { clearAllMarks(); updateCounter(); return; }

    addCurrentChannelButton();
    addHomeButtonNearSubscribe();

    hiddenCount = removedCount;

    // Личный раздел /my/... не фильтруем как обычную выдачу.
    // Иначе можно случайно спрятать весь список подписок, потому что Rutube разметил всё как карточки.
    if (isMyPage()) {
      if (settings.hideSideMenuPolitics || settings.cleanRutubeChrome) {
        scanNavigationLinks();
        cleanRutubeChrome();
        reorderSidebar();
      }
      applyHiddenVisibility();
      updateCounter();
      return;
    }

    // Страницы поиска не трогаем фильтрами просмотра и комментариев.
    // Rutube на /search/ легко превращается в чёрный прямоугольник, если прятать слишком широкие блоки.
    if (isSearchPage()) {
      if (settings.hideSideMenuPolitics || settings.cleanRutubeChrome) {
        scanNavigationLinks();
        cleanRutubeChrome();
        reorderSidebar();
      }
      if (settings.disableAutoplay) scanAutoplayVideos();
      applyHiddenVisibility();
      updateCounter();
      return;
    }

    scanCards();
    if (settings.hideSideMenuPolitics || settings.cleanRutubeChrome) {
      scanNavigationLinks();
      cleanRutubeChrome();
      reorderSidebar(); 
    }
    hideShortsBlocks(); 
    if (settings.cleanWatchPage) cleanWatchPage();
    if (settings.hideComments && isVideoPage()) hideComments();
    if (settings.disableAutoplay) scanAutoplayVideos();
    
    applyHiddenVisibility();
    updateCounter();
  }

  function scanCards() {
    const links = Array.from(document.querySelectorAll('a[href]')).filter((a) => isVideoLikeLink(a) || isChannelLikeLink(a));
    for (const link of links) {
      const card = findCard(link);
      if (!card || card.dataset.rtstProcessed === '1' || card.closest('#rtst-panel')) continue;
      card.dataset.rtstProcessed = '1'; card.dataset.rtstCard = '1';
      const info = readCardInfo(card, link);
      addBlockChannelButton(card, info.channel);
      const reason = getBlockReason(info);
      if (reason) hideElement(card, reason);
    }
  }

  function containsVideoPlayer(el) {
    if (!el || !el.querySelector) return false;
    return Boolean(el.querySelector('video, iframe, [class*="wdp-player"], [class*="video-player"], [class*="VideoPlayer"]'));
  }

  function isInsidePlayer(el) { 
    return Boolean(el && el.closest('video, iframe, [class*="wdp-player"], [class*="video-player"], [class*="VideoPlayer"], [id*="player"], [data-testid*="player" i]')); 
  }

  function isVideoPage() { return /^\/video\//.test(location.pathname); }
  function isPlaylistPage() { return /^\/plst\//.test(location.pathname); }
  function isWatchPage() { return isVideoPage() || isPlaylistPage(); }
  function isMyPage() { return /^\/my(?:\/|$)/.test(location.pathname); }
  function isSearchPage() { return /^\/search(?:\/|$)/.test(location.pathname); }
  function isProtectedHeader(el) { return Boolean(el && el.closest('header, [role="banner"], .wdp-header-module__header, [class*="header-module__header"], [class*="Header-module__header"]')); }

  function cleanWatchPage() {
    if (!isWatchPage()) return;
    addHomeButtonNearSubscribe();
    hideWatchRecommendationsBySelector();
    hideRutubeSelfPromo();
  }

  function hideWatchRecommendationsBySelector() {
    if (!isWatchPage()) return;
    const selectors = [
      '.wdp-see-also-module__wrapper', '.additional-recommendations-module__section',
      'section[aria-label="Рекомендации" i]', 'aside[aria-label="Рекомендации" i]',
      '.video-page-layout-module__right', '.video-page-layout-module__side'
    ];
    document.querySelectorAll(selectors.join(',')).forEach((el) => {
      if (!el || el.closest('#rtst-panel') || isInsidePlayer(el) || containsVideoPlayer(el) || isProtectedHeader(el)) return;
      if (el.closest('section[aria-label="блок действий" i], section[aria-label="информация о видео" i], section[aria-label="описание видео" i]')) return;
      const target = el.closest('.wdp-see-also-module__wrapper') || el.closest('.video-page-layout-module__right') || el;
      if (!target || target.closest('#rtst-panel') || (target.querySelector && target.querySelector('#rtst-home-link'))) return;
      
      const text = normalize(target.textContent || target.getAttribute('aria-label') || '');
      const label = normalize(el.getAttribute('aria-label') || '');
      const hasRecLabel = label.includes('рекомендации') || text.includes('рекомендации');
      const hasGrid = Boolean(target.querySelector('[data-testid="grid"], .wdp-grid-module__grid, .wdp-grid-module__item, .wdp-card-skeleton-module__card'));
      const hasVideoLinks = target.querySelectorAll ? target.querySelectorAll('a[href*="/video/"], a[href*="/shorts/"], a[href*="/plst/"]').length >= 1 : false;
      const isKnownRecWrapper = /wdp-see-also-module|additional-recommendations-module|video-page-layout-module__(right|side)/i.test(String(target.className || ''));
      
      if (!(hasRecLabel || hasGrid || hasVideoLinks || isKnownRecWrapper)) return;
      softHideViewElement(target, 'рекомендации под видео');
    });
  }

  function addHomeButtonNearSubscribe() {
    const old = document.getElementById('rtst-home-link');
    if (!isWatchPage()) { if (old) old.remove(); return; }

    const subscribeButton = document.querySelector('section[aria-label="блок действий" i] button[aria-label*="Подпис" i], button[class*="subscribe" i], button[aria-label*="Подпис" i]');
    const toolbarRight = (subscribeButton && subscribeButton.closest('.wdp-video-options-row-module__wdpVideoOptionsRow__toolbar-right')) || (subscribeButton && subscribeButton.parentElement) || document.querySelector('section[aria-label="блок действий" i] .wdp-video-options-row-module__wdpVideoOptionsRow__toolbar-right');

    if (!toolbarRight || toolbarRight.closest('#rtst-panel')) return;

    let link = old;
    if (!link) {
      link = document.createElement('a'); link.id = 'rtst-home-link'; link.href = '/'; link.title = 'На главную RUTUBE'; link.setAttribute('aria-label', 'На главную RUTUBE');
    }
    syncHomeButtonStyle(link, subscribeButton);

    if (link.parentElement !== toolbarRight) {
      if (subscribeButton && subscribeButton.parentElement === toolbarRight) toolbarRight.insertBefore(link, subscribeButton);
      else toolbarRight.insertBefore(link, toolbarRight.firstChild);
    }
  }

  function syncHomeButtonStyle(link, subscribeButton) {
    if (!link) return;
    const baseClass = 'rtst-home-link';
    const subscribeClasses = subscribeButton && subscribeButton.className ? String(subscribeButton.className) : '';
    const content = subscribeButton && subscribeButton.querySelector('span') ? subscribeButton.querySelector('span') : null;
    const contentClass = content && content.className ? String(content.className) : '';
    link.className = `${baseClass}${subscribeClasses ? ' ' + subscribeClasses : ''}`;
    link.href = '/'; link.title = 'На главную RUTUBE'; link.setAttribute('aria-label', 'На главную RUTUBE'); link.setAttribute('role', 'button');
    link.innerHTML = contentClass ? `<span class="rtst-home-content ${escapeAttribute(contentClass)}">⌂ Главная</span>` : '<span class="rtst-home-content">⌂ Главная</span>';
  }

  function escapeAttribute(value) { return String(value || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function hideWatchBlocksByText() {
    const watchBlockWords = ['смотрите также', 'вам может понравиться', 'похожие видео', 'рекомендуем', 'рекомендации', 'следующее видео', 'популярное', 'сейчас смотрят', 'больше видео', 'ещё видео', 'еще видео'];
    document.querySelectorAll('h1,h2,h3,h4,h5,h6,span,p,div').forEach((el) => {
      if (el.closest('#rtst-panel') || isInsidePlayer(el) || containsVideoPlayer(el)) return;
      const raw = String(el.textContent || '').trim();
      if (!raw || raw.length > 90) return;
      const text = normalize(raw);
      const match = watchBlockWords.find((word) => text === normalize(word) || text.includes(normalize(word)));
      if (!match) return;
      const target = findWatchBlockTarget(el);
      softHideViewElement(target, `чистый просмотр: ${match}`);
    });
  }

  function hideRutubeSelfPromo() {
    const promoWords = ['отключить рекламу', 'смотреть без рекламы', 'подписка', '99 ₽', '99 рублей', 'rutube premium', 'premium'];
    document.querySelectorAll('div,section,aside,article').forEach((el) => {
      if (el.closest('#rtst-panel') || isInsidePlayer(el) || containsVideoPlayer(el)) return;
      const text = normalize(el.textContent || '');
      if (!text || text.length > 900) return;
      const match = containsBlocked(text, promoWords);
      if (!match) return;
      const target = findSmallViewTarget(el);
      softHideViewElement(target, `самореклама: ${match}`);
    });
  }

  function hideComments() {
    // На /plst/ блоки плейлиста разметкой похожи на комментарии/списки,
    // поэтому скрываем комментарии только на обычных страницах /video/.
    if (!isVideoPage()) return;
    const directSelectors = ['section[aria-label="комментарии" i]', '[aria-label="комментарии" i]', '[class*="comments-module" i]', '[class*="Comments" i]', '[class*="comments" i]'];
    document.querySelectorAll(directSelectors.join(',')).forEach((el) => {
      if (el.closest('#rtst-panel') || isInsidePlayer(el) || containsVideoPlayer(el)) return;
      const text = normalize(el.textContent || el.getAttribute('aria-label') || '');
      const className = String(el.className || '');
      const isLikelyComments = text.includes('коммент') || normalize(el.getAttribute('aria-label') || '').includes('комментарии') || /comments/i.test(className);
      if (!isLikelyComments) return;
      softHideViewElement(el, 'комментарии');
    });

    const commentWords = ['комментарии', 'оставить комментарий', 'написать комментарий', 'войдите, чтобы оставить комментарий'];
    document.querySelectorAll('section,article,div,h2,h3,h4').forEach((el) => {
      if (el.closest('#rtst-panel') || isInsidePlayer(el) || containsVideoPlayer(el) || el.dataset.rtstViewHidden === '1') return;
      const raw = String(el.textContent || el.getAttribute('aria-label') || '').trim();
      if (!raw) return;
      const aria = normalize(el.getAttribute('aria-label') || '');
      const text = normalize(raw.slice(0, 3000));
      const hasCommentWord = aria.includes('комментарии') || commentWords.some((word) => text.includes(normalize(word)));
      if (!hasCommentWord) return;
      const hasCommentForm = Boolean(el.querySelector('textarea,input[placeholder*="коммент" i],button,[class*="comment" i],[class*="Comment" i]'));
      const target = hasCommentForm || aria.includes('комментарии') ? findSmallViewTarget(el) : findWatchBlockTarget(el);
      softHideViewElement(target, 'комментарии');
    });
  }

  function findWatchBlockTarget(el) {
    let target = el;
    for (let i = 0; i < 6 && target && target.parentElement; i++) {
      const parent = target.parentElement;
      if (!parent || parent === document.body || parent === document.documentElement) break;
      if (parent.closest('#rtst-panel') || isInsidePlayer(parent) || containsVideoPlayer(parent)) break;
      
      const tag = parent.tagName ? parent.tagName.toLowerCase() : '';
      if (['main', 'header', 'footer', 'nav'].includes(tag)) break;

      const text = String(parent.textContent || '').trim();
      const linkCount = parent.querySelectorAll ? parent.querySelectorAll('a[href]').length : 0;
      const videoLinkCount = parent.querySelectorAll ? parent.querySelectorAll('a[href*="/video/"], a[href*="/shorts/"], a[href*="/plst/"]').length : 0;
      const className = String(parent.className || '');
      const looksLikeBlock = /recommend|related|comment|feed|list|section|block|wrapper|aside|sidebar/i.test(className);

      if ((looksLikeBlock && text.length < 2600) || (videoLinkCount >= 2 && linkCount <= 30 && text.length < 3200)) { target = parent; continue; }
      break;
    }
    return target;
  }

  function findSmallViewTarget(el) {
    let target = el;
    for (let i = 0; i < 5 && target && target.parentElement; i++) {
      const parent = target.parentElement;
      if (!parent || parent === document.body || parent === document.documentElement) break;
      if (parent.closest('#rtst-panel') || isInsidePlayer(parent) || containsVideoPlayer(parent)) break;
      
      const tag = parent.tagName ? parent.tagName.toLowerCase() : '';
      if (['main', 'header', 'footer', 'nav'].includes(tag)) break;

      const text = String(parent.textContent || '').trim();
      const linkCount = parent.querySelectorAll ? parent.querySelectorAll('a[href]').length : 0;
      if (text.length <= 1000 && linkCount <= 8) { target = parent; continue; }
      break;
    }
    return target;
  }

  function softHideViewElement(el, reason) {
    if (!el || el.closest('#rtst-panel') || isProtectedHeader(el) || el === document.body || el === document.documentElement) return;
    const tag = el.tagName ? el.tagName.toLowerCase() : '';
    if (['main', 'header', 'footer', 'nav'].includes(tag) || isInsidePlayer(el) || containsVideoPlayer(el)) return;
    el.dataset.rtstViewHidden = '1'; el.dataset.rtstReason = `скрыто, ${reason}`; el.classList.add('rtst-view-hidden');
  }

  function scanNavigationLinks() {
    const navWords = ['новости и сми', 'разговоры о важном', 'тв онлайн', 'rutube tv', 'rutube x premier', 'rutube x start', 'телеканалы', 'первый канал', 'россия 1', 'россия 24', 'рен тв', 'звезда', 'нтв', 'известия', 'царьград', 'соловьев live', 'соловьёв live', 'лдпр тв'];
    if (settings.hideShorts) navWords.push('shorts', 'шортсы');
    document.querySelectorAll('a[href]').forEach((a) => {
      if (a.closest('#rtst-panel')) return;
      const match = containsBlocked(compactText(a), navWords);
      if (match) softHideChromeElement(a.closest('li, [role="listitem"], [class*="item"], [class*="Item"]') || a, `раздел: ${match}`);
    });
  }

  function cleanRutubeChrome() {
    const exactItems = ['rutube для блогеров', 'rutube x premier', 'rutube x start', 'вопросы и ответы', 'сообщить о проблеме', 'письмо в поддержку', 'поддержка в max', 'help@rutube.ru', 'о rutube', 'направления деятельности', 'пользовательское соглашение', 'конфиденциальность', 'правовая информация', 'рекомендательная система', 'фирменный стиль'];
    const blockHeadings = ['rutube всегда с вами', 'cкачать приложения', 'скачать приложения', 'больше от rutube', 'rutube в других соцсетях'];

    document.querySelectorAll('section[aria-label="Моё" i], section[aria-label="Мое" i]').forEach((section) => {
      if (!section.closest('#rtst-panel')) forceHideChromeElement(section, 'раздел: мое');
    });

    document.querySelectorAll('a[href*="/feeds/start/"], a[href*="/feeds/premier/"]').forEach((a) => {
      if (!a.closest('#rtst-panel')) softHideChromeElement(findChromeItemTarget(a), 'пункт: rutube x start/premier');
    });

    document.querySelectorAll('section[aria-label*="качать приложения" i], section[aria-label*="скачать приложения" i], section[class*="menu-app-section" i]').forEach((section) => {
      if (!section.closest('#rtst-panel')) forceHideChromeElement(section, 'блок: rutube всегда с вами');
    });

    document.querySelectorAll('ul[aria-label="Секция инструкции" i], ul[class*="menu-guide-section" i], ul[aria-label*="социальных сетях" i], ul[class*="menu-social" i]').forEach((list) => {
      if (list.closest('#rtst-panel')) return;
      const section = list.closest('section[class*="menu-section-module__section"], section') || list;
      forceHideChromeElement(section, 'блок: приложения/соцсети rutube');
    });

    document.querySelectorAll('a[href], button, [role="link"], [role="button"]').forEach((el) => {
      if (el.closest('#rtst-panel')) return;
      const text = normalize(el.textContent || el.getAttribute('aria-label') || '');
      const match = text && exactItems.find((item) => text === normalize(item));
      if (match) softHideChromeElement(findChromeItemTarget(el), `пункт: ${match}`);
    });

    document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,div').forEach((el) => {
      if (el.closest('#rtst-panel')) return;
      const raw = String(el.textContent || '').trim();
      if (!raw || raw.length > 80) return;
      const text = normalize(raw);
      const match = blockHeadings.find((heading) => text === normalize(heading));
      if (match) softHideChromeElement(findChromeBlockTarget(el), `блок: ${match}`);
    });
  }

  function softHideChromeElement(el, reason) {
    if (!el || el.closest('#rtst-panel') || isProtectedHeader(el) || containsCoreMenuText(normalize(el.textContent || ''))) return;
    el.dataset.rtstChromeHidden = '1'; el.dataset.rtstReason = `скрыто, ${reason}`; el.classList.add('rtst-chrome-hidden');
  }

  function forceHideChromeElement(el, reason) {
    if (!el || el.closest('#rtst-panel') || isProtectedHeader(el)) return;
    el.dataset.rtstChromeHidden = '1';
    el.dataset.rtstReason = `скрыто, ${reason}`;
    el.classList.add('rtst-chrome-hidden');
  }

  function findChromeItemTarget(el) {
    const direct = el.closest('li, [role="listitem"]');
    if (direct && !containsCoreMenuText(normalize(direct.textContent || ''))) return direct;
    let target = el;
    for (let i = 0; i < 5 && target && target.parentElement; i++) {
      const parent = target.parentElement;
      if (!parent || parent === document.body || parent === document.documentElement || parent.closest('#rtst-panel')) break;
      const tag = parent.tagName ? parent.tagName.toLowerCase() : '';
      if (['main', 'header', 'footer', 'nav', 'aside', 'section'].includes(tag)) break;
      const targetText = String(target.textContent || '').trim();
      const parentText = String(parent.textContent || '').trim();
      if (containsCoreMenuText(normalize(parentText))) break;
      const className = String(parent.className || '');
      const compactWrapper = parent.children.length <= 3 && parentText.length <= Math.max(targetText.length + 90, 160);
      const classWrapper = /item|link|menu|row|cell|wrapper/i.test(className) && parentText.length <= 240;
      if (compactWrapper || classWrapper) { target = parent; continue; }
      break;
    }
    return target;
  }

  function findChromeBlockTarget(el) {
    let target = el;
    for (let i = 0; i < 5 && target && target.parentElement; i++) {
      const parent = target.parentElement;
      if (!parent || parent === document.body || parent === document.documentElement || parent.closest('#rtst-panel')) break;
      const tag = parent.tagName ? parent.tagName.toLowerCase() : '';
      if (['main', 'header', 'footer', 'nav', 'aside', 'section'].includes(tag)) break;
      const text = String(parent.textContent || '').trim();
      if (containsCoreMenuText(normalize(text))) break;
      const linkCount = parent.querySelectorAll ? parent.querySelectorAll('a[href]').length : 0;
      const className = String(parent.className || '');
      const looksLikeSmallBlock = text.length <= 520 && linkCount <= 8;
      const looksLikeNamedBlock = /block|section|footer|social|apps|links|group|wrapper/i.test(className) && text.length <= 700 && linkCount <= 10;
      if (looksLikeSmallBlock || looksLikeNamedBlock) { target = parent; continue; }
      break;
    }
    return target;
  }

  function containsCoreMenuText(text) {
    return ['главная', 'подписки', 'история просмотра', 'плейлисты', 'смотреть позже', 'комментарии', 'понравилось', 'по темам', 'каталог', 'в топе', 'трансляции', 'мое', 'моё'].some((word) => text.includes(word));
  }

  function isVideoLikeLink(a) { return (a.href || '').includes('/video/') || (a.href || '').includes('/shorts/') || (a.href || '').includes('/plst/'); }
  function isChannelLikeLink(a) { return (a.href || '').includes('/channel/') || (a.href || '').includes('/u/') || (a.href || '').includes('/feeds/'); }

  function findCard(startEl) {
    const hard = startEl.closest(['article', 'li', '[data-testid*="card" i]', '[data-testid*="video" i]', '[class*="VideoCard"]', '[class*="video-card"]', '[class*="Card"]', '[class*="card"]', '[class*="Tile"]', '[class*="tile"]'].join(','));
    if (isUsableCard(hard)) return hard;
    let el = startEl;
    for (let i = 0; i < 7 && el && el.parentElement; i++) {
      el = el.parentElement;
      if (isUsableCard(el)) return el;
    }
    return null;
  }

  function isUsableCard(el) {
    if (!el || el === document.body || el === document.documentElement) return false;
    if (el.id === 'rtst-panel' || el.closest('#rtst-panel')) return false;

    const tag = el.tagName ? el.tagName.toLowerCase() : '';
    if (['main', 'header', 'footer', 'nav', 'aside'].includes(tag)) return false;

    const hasCardAttr = el.hasAttribute('data-testid') && /card|video/i.test(el.getAttribute('data-testid'));
    const isArticle = tag === 'article';
    const className = String(el.className || '');
    const isCardClass = /wdp-card-module__wrapper|pen-video-card|video-card/i.test(className);

    if (!(hasCardAttr || isArticle || isCardClass)) {
      const textLen = (el.textContent || '').trim().length;
      if (textLen < 3 || textLen > 2200) return false;
    }

    const linkCount = el.querySelectorAll ? el.querySelectorAll('a[href]').length : 0;
    return linkCount >= 1;
  }

  function readCardInfo(card, primaryLink) {
    const text = compactText(card);
    const title = normalize(primaryLink && primaryLink.textContent);
    const channel = detectChannelName(card, title);
    const isShort = Boolean((primaryLink && (primaryLink.href || '').includes('/shorts/')) || card.querySelector('a[href*="/shorts/"]') || /(^|\s)shorts(\s|$)/i.test(text));
    return { text, title, channel, isShort, element: card };
  }

  function detectChannelName(card, title) {
    const channelSelectors = ['a[href*="/channel/"]', 'a[href*="/u/"]', 'a[href*="/feeds/"]', 'a[href*="/metainfo/"]'];
    const candidates = [];
    for (const a of card.querySelectorAll(channelSelectors.join(','))) {
      const text = String(a.textContent || a.getAttribute('aria-label') || '').trim();
      if (!text || normalize(text) === normalize(title) || text.length > 80) continue;
      candidates.push(text);
    }
    const imgAlt = Array.from(card.querySelectorAll('img[alt]')).map((img) => String(img.getAttribute('alt') || '').trim()).find((alt) => /иконка канала|канал/i.test(alt) && alt.length < 120);
    if (imgAlt) {
      const cleaned = imgAlt.replace(/^иконка канала\s*/i, '').replace(/^канал\s*/i, '').trim();
      if (cleaned) candidates.push(cleaned);
    }
    const cleanCandidates = unique(candidates).filter((name) => name.length >= 2 && name.length <= 80);
    return cleanCandidates[0] || '';
  }

  function getBlockReason(info) {
    if (settings.hideShorts && info.isShort) return 'shorts';
    const channelMatch = info.channel && containsBlocked(info.channel, allBlockedChannels());
    if (channelMatch) return `канал: ${channelMatch}`;
    const wordMatch = containsBlocked(info.text, allBlockedWords());
    if (wordMatch) return `слово: ${wordMatch}`;
    return '';
  }

  function hideElement(el, reason) {
    if (!el || el.closest('#rtst-panel') || isProtectedHeader(el)) return;
    const target = findBestHideTarget(el);
    if (!target || target.closest('#rtst-panel') || isDangerousHideTarget(target)) return;
    if (target.dataset.rtstHidden !== '1') hiddenCount += 1;
    target.dataset.rtstHidden = '1'; target.dataset.rtstHideTarget = '1'; target.dataset.rtstReason = `скрыто, ${reason}`;
    if (target !== el) el.dataset.rtstHiddenChild = '1';
    if (settings.showHidden) { target.classList.remove('rtst-hidden'); target.classList.add('rtst-dim'); }
    else { target.classList.remove('rtst-dim'); target.classList.add('rtst-hidden'); }
  }

  function isDangerousHideTarget(target) {
    if (!target || target === document.body || target === document.documentElement) return true;
    const tag = target.tagName ? target.tagName.toLowerCase() : '';
    if (['main', 'header', 'footer', 'nav', 'aside', 'section'].includes(tag)) return true;
    if (target.id && /root|app|layout|page/i.test(target.id)) return true;
    const textLen = (target.textContent || '').trim().length;
    const linkCount = target.querySelectorAll ? target.querySelectorAll('a[href]').length : 0;
    const videoLinkCount = target.querySelectorAll ? target.querySelectorAll('a[href*="/video/"], a[href*="/shorts/"], a[href*="/plst/"]').length : 0;
    if (textLen > 1800 || linkCount > 8 || videoLinkCount > 3) return true;
    return false;
  }

  function findBestHideTarget(el) { return findCollectionChild(el) || findWrapperTarget(el); }

  function findCollectionChild(el) {
    let node = el;
    for (let i = 0; i < 12 && node && node.parentElement; i++) {
      const parent = node.parentElement;
      if (!parent || parent === document.body || parent === document.documentElement || parent.closest('#rtst-panel')) break;
      const tag = parent.tagName ? parent.tagName.toLowerCase() : '';
      if (['main', 'header', 'footer', 'nav'].includes(tag)) break;
      if (isCollectionParent(parent)) return node;
      node = parent;
    }
    return null;
  }

  function isCollectionParent(parent) {
    const children = Array.from(parent.children || []);
    if (children.length < 2) return false;
    const contentChildren = children.filter(childLooksLikeFeedItem);
    if (contentChildren.length < 2) return false;
    const style = getComputedStyle(parent);
    const className = String(parent.className || '');
    return (style.display === 'grid' || style.display === 'inline-grid' || style.display === 'flex' || style.display === 'inline-flex' || /grid|list|row|items|cards|carousel|slider|swiper|feed/i.test(className));
  }

  function childLooksLikeFeedItem(child) {
    if (!child || child.closest('#rtst-panel')) return false;
    const textLen = (child.textContent || '').trim().length;
    if (textLen < 8 || textLen > 2600) return false;
    const hasVideo = Boolean(child.querySelector('a[href*="/video/"], a[href*="/shorts/"], a[href*="/plst/"]'));
    const hasChannel = Boolean(child.querySelector('a[href*="/channel/"], a[href*="/u/"], a[href*="/feeds/"]'));
    return hasVideo || hasChannel;
  }

  function findWrapperTarget(el) {
    let target = el;
    for (let i = 0; i < 8 && target && target.parentElement; i++) {
      const parent = target.parentElement;
      if (!parent || parent === document.body || parent === document.documentElement || parent.closest('#rtst-panel')) break;
      const tag = parent.tagName ? parent.tagName.toLowerCase() : '';
      if (['main', 'header', 'footer', 'nav', 'section'].includes(tag)) break;
      const targetTextLen = (target.textContent || '').trim().length;
      const parentTextLen = (parent.textContent || '').trim().length;
      const className = String(parent.className || '');
      const childCount = parent.children ? parent.children.length : 0;
      const wrapperByText = childCount <= 3 && parentTextLen <= Math.max(targetTextLen + 120, Math.round(targetTextLen * 1.35));
      const wrapperByClass = /item|tile|cell|card|slide|swiper-slide|column|col|wrapper/i.test(className);
      if (wrapperByText || wrapperByClass) { target = parent; continue; }
      break;
    }
    return target;
  }

  function applyHiddenVisibility() {
    document.querySelectorAll('[data-rtst-hidden="1"]').forEach((el) => {
      if (settings.showHidden) { el.classList.remove('rtst-hidden'); el.classList.add('rtst-dim'); }
      else { el.classList.remove('rtst-dim'); el.classList.add('rtst-hidden'); }
    });
  }

  function isSubscriptionsContext(el) {
    const path = normalize(location.pathname);
    if (/subscription|subscriptions|podpis|subscribe|subscribed/.test(path)) return true;
    const pageTitle = normalize((document.querySelector('h1') || {}).textContent || '');
    if (pageTitle.includes('подписки') || pageTitle.includes('мои подписки')) return true;
    const section = el.closest('section, [class*="Section"], [class*="section"], [class*="Block"], [class*="block"]');
    if (!section) return false;
    const heading = section.querySelector('h1,h2,h3,h4,[class*="Title"],[class*="title"]');
    const headingText = normalize(heading && heading.textContent);
    return headingText.includes('подписки') || headingText.includes('мои подписки');
  }

  function addBlockChannelButton(card, channel) {
    if (!channel || isWatchPage() || isSubscriptionsContext(card)) return;
    const existing = card.querySelector('.rtst-block-btn[data-rtst-action="block-card-channel"]');
    if (existing) {
      existing.textContent = '⊘'; existing.dataset.rtstChannel = channel; existing.title = `Скрыть канал: ${channel}`; existing.setAttribute('aria-label', `Скрыть канал: ${channel}`);
      return;
    }
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'rtst-block-btn'; btn.dataset.rtstAction = 'block-card-channel';
    btn.dataset.rtstChannel = channel; btn.textContent = '⊘'; btn.title = `Скрыть канал: ${channel}`; btn.setAttribute('aria-label', `Скрыть канал: ${channel}`);
    const channelLink = Array.from(card.querySelectorAll('a[href]')).find((a) => normalize(a.textContent) === normalize(channel));
    const host = (channelLink && channelLink.parentElement) || card;
    host.appendChild(btn);
  }

  function detectCurrentPageChannel() {
    const h1 = document.querySelector('h1');
    if (/\/channel\/|\/u\//.test(location.pathname) && h1) {
      const fromH1 = String(h1.textContent || '').trim();
      if (fromH1 && fromH1.length < 100) return fromH1;
    }
    const videoTitle = h1 ? normalize(h1.textContent) : '';
    const links = Array.from(document.querySelectorAll('a[href*="/channel/"], a[href*="/u/"], a[href*="/feeds/"]'));
    return links.map((a) => String(a.textContent || '').trim()).filter((text) => text && normalize(text) !== videoTitle && text.length >= 2 && text.length <= 80)[0] || '';
  }

  function addCurrentChannelButton() {
    // 1.1.17: плавающую кнопку «скрыть канал» убрали полностью.
    // На каналах, видео и выдачах она дублирует карточные кнопки и мешается в правом нижнем углу.
    const oldBtn = document.getElementById('rtst-current-channel-btn');
    if (oldBtn) oldBtn.remove();
  }

  function setupAutoplayGuard() {
    if (autoplayGuardInstalled) return;
    autoplayGuardInstalled = true;
    const markGesture = () => { lastUserGestureAt = Date.now(); };
    document.addEventListener('pointerdown', markGesture, true); document.addEventListener('keydown', markGesture, true); document.addEventListener('touchstart', markGesture, true);
    const originalPlay = HTMLMediaElement.prototype.play;
    if (!originalPlay || originalPlay.__rtstPatched) return;
    const patchedPlay = function (...args) {
      if (settings && settings.disableAutoplay && shouldBlockAutoplay(this)) {
        this.autoplay = false; this.removeAttribute('autoplay');
        try { this.pause(); } catch (e) {}
        return Promise.reject(new DOMException('Autoplay prevented by Рутубочист', 'AbortError'));
      }
      if (Date.now() - lastUserGestureAt < 1800) this.dataset.rtstManualStarted = '1';
      return originalPlay.apply(this, args);
    };
    patchedPlay.__rtstPatched = true; patchedPlay.__rtstOriginal = originalPlay; HTMLMediaElement.prototype.play = patchedPlay;
  }

  function isPinnedChannelVideo(video) {
    if (!video || !video.closest) return false;
    if (!/^\/(?:channel|u)\//.test(location.pathname)) return false;
    if (video.closest('[class*="user-channel-pinned-video"], [class*="PinnedVideo"], [class*="pinned-video"]')) return true;
    const section = video.closest('section[aria-label]');
    return Boolean(section && normalize(section.getAttribute('aria-label') || '').includes('закрепленное видео'));
  }

  function shouldBlockAutoplay(video) {
    if (!video || !(video instanceof HTMLMediaElement)) return false;
    if (!/rutube\.ru$/i.test(location.hostname) && !/rutube\.ru/i.test(location.hostname)) return false;

    const now = Date.now();
    const recentUserGesture = now - lastUserGestureAt < 1800;
    if (recentUserGesture) return false;

    // Закреплённое видео на странице канала не должно стартовать само.
    // Если пользователь нажал Play, recentUserGesture выше пропустит запуск.
    if (isPinnedChannelVideo(video)) return true;

    // Блокируем только автозапуск следующего ролика после реального завершения текущего.
    // Обычное воспроизведение не трогаем: Rutube не всегда надёжно помечает ручной запуск.
    return Boolean(lastVideoEndedAt && now < nextAutoplayBlockUntil);
  }

  function scanAutoplayVideos() {
    if (!settings.disableAutoplay) return;
    document.querySelectorAll('video').forEach((video) => {
      video.autoplay = false;
      video.removeAttribute('autoplay');
      video.setAttribute('preload', 'metadata');

      if (!video.dataset.rtstAutoplayWatched) {
        video.dataset.rtstAutoplayWatched = '1';

        video.addEventListener('play', () => {
          if (Date.now() - lastUserGestureAt < 1800) {
            video.dataset.rtstManualStarted = '1';
          }
        }, true);

        video.addEventListener('ended', () => {
          lastVideoEndedAt = Date.now();
          nextAutoplayBlockUntil = lastVideoEndedAt + 120000;
          delete video.dataset.rtstManualStarted;
          video.dataset.rtstEnded = '1';
          video.autoplay = false;
          video.removeAttribute('autoplay');
        }, true);

        const resetManualFlagForNextMedia = () => {
          video.autoplay = false;
          video.removeAttribute('autoplay');
          // Не сбрасываем rtstManualStarted во время обычной загрузки/буферизации.
          // Иначе через пару секунд честно запущенное пользователем видео может быть принято за автозапуск.
        };

        video.addEventListener('loadstart', resetManualFlagForNextMedia, true);
        video.addEventListener('loadedmetadata', resetManualFlagForNextMedia, true);
        video.addEventListener('emptied', resetManualFlagForNextMedia, true);

        video.addEventListener('playing', () => {
          const now = Date.now();
          if (
            settings.disableAutoplay &&
            isPinnedChannelVideo(video) &&
            now - lastUserGestureAt > 1800 &&
            video.dataset.rtstManualStarted !== '1'
          ) {
            try { video.pause(); } catch (e) {}
            return;
          }
          if (
            settings.disableAutoplay &&
            lastVideoEndedAt &&
            now < nextAutoplayBlockUntil &&
            now - lastUserGestureAt > 1800 &&
            video.dataset.rtstManualStarted !== '1'
          ) {
            try { video.pause(); } catch (e) {}
          }
        }, true);
      }

      if (!video.paused && shouldBlockAutoplay(video)) {
        try { video.pause(); } catch (e) {}
      }
    });
  }

  function boot() {
    setupAutoplayGuard(); addStyle(); bindEvents(); loadMovieDbFromLocalCache(); setTimeout(checkGithubAvailability, 1500); setTimeout(maybeUpdateMovieDbInBackground, 3500); scheduleScan();
    window.addEventListener('popstate', () => setTimeout(rescanNow, 250));
    setInterval(() => { if (location.href !== lastUrl) { scheduleScan(); return; } if (settings.enabled) scheduleScan(); }, 2500);
  }

  setupAutoplayGuard();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();

})();
