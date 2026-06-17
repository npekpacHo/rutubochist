// ==UserScript==
// @name         Рутубочист
// @namespace    https://github.com/npekpacHo/rutubochist
// @version      1.0.9
// @description  Рутубочист: прячет на RUTUBE политоту, телевизионщину, Shorts, нежелательные каналы, комментарии и лишнее вокруг просмотра. Есть чистый просмотр, анти-автозапуск, импорт/экспорт.
// @author       elekt_riki
// @match        https://rutube.ru/*
// @match        https://*.rutube.ru/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const STORE_KEY = 'rtSansTvSettings:v1';
  const UI_VERSION = '1.0.9';

  const DEFAULT_BLOCKED_CHANNELS = [
    // Телевизор  
    'Первый канал',
    'Россия 1',
    'Россия 24',
    'НТВ',
    'Пятый канал',
    'РЕН ТВ',
    'ТВЦ',
    'ТВ Центр',
    'Звезда',
    'СПАС',
    'RT',
    'RTД на русском',
    'РИА Новости',
    'ТАСС',
    'Известия',
    'Комсомольская правда',
    'Царьград',
    'Соловьёв LIVE',
    'Соловьев LIVE',
    'БесогонТВ',
    'БесогонТВ | besogontv',
    'Дмитрий Пучков',
    'ЛДПР ТВ'
  ];

  const DEFAULT_BLOCKED_WORDS = [
    // Деградация
	'мусагалиев',
    'дорохов',
	'шастун',
	'roblox',
	'шоу воли',
	'однажды в россии',
	'импровизация',
	'прожарка',
	'где логика',
	'решалы',
	'влад бумага',
	
	// Явная политика / новости
    'новости',
    'срочные новости',
    'политика',
    'геополитика',
    'госдума',
    'совфед',
    'кремль',
    'правительство',
    'минобороны',
    'мид россии',
    'песков',
    'медведев',
    'захарова',
    'лавров',
    'путин',
    'зеленский',
    'байден',
    'трамп',
    'нато',
    'санкции',
    'выборы',
    'депутат',
    'послание президента',
    'прямая линия',

    // Военная повестка
    'сво',
    'спецоперация',
    'специальная военная операция',
    'украина',
    'донбасс',
    'днр',
    'лнр',
    'фронт',
    'мобилизация',
    'контрнаступление',
    'всу',
    'вкс',
    'военкор',
    'военная хроника',
    'линия соприкосновения',
    'удар по',
    'ракетный удар',
    'дрон',
    'бпла',

    // ТВ форматы, которые тащат телевизор в интернет
    'время покажет',
    '60 минут',
    'вечер с владимиром соловьевым',
    'вечер с владимиром соловьёвым',
    'соловьев live',
    'соловьёв live',
    'бесогон',
    'место встречи',
    'открытый эфир',
    'разговоры о важном',
    'итоги недели',
    'вести недели',
    'вести',
    'события',
    'прямой эфир',
    'ток-шоу'
  ];

  const SETTINGS_DEFAULTS = {
    enabled: true,
    showHidden: false,
    hideSideMenuPolitics: true,
    hideShorts: false,
    hardRemove: false,
    cleanRutubeChrome: true,
    cleanWatchPage: true,
    disableAutoplay: true,
    hideComments: false,
    safeRouterPatch060: true,
    safeDelayedScan070: true,
    blockedChannels: DEFAULT_BLOCKED_CHANNELS,
    blockedWords: DEFAULT_BLOCKED_WORDS,
    userChannels: [],
    userWords: []
  };

  let settings = loadSettings();
  let scanTimer = null;
  let observer = null;
  let lastUrl = location.href;
  let hiddenCount = 0;
  let removedCount = 0;
  let suspendScanUntil = 0;
  let lastUserGestureAt = 0;
  let autoplayGuardInstalled = false;

  function loadSettings() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return structuredCloneSafe(SETTINGS_DEFAULTS);
      const saved = JSON.parse(raw);
      const merged = {
        ...structuredCloneSafe(SETTINGS_DEFAULTS),
        ...saved,
        blockedChannels: unique([...(saved.blockedChannels || DEFAULT_BLOCKED_CHANNELS)]),
        blockedWords: unique([...(saved.blockedWords || DEFAULT_BLOCKED_WORDS)]),
        userChannels: unique([...(saved.userChannels || [])]),
        userWords: unique([...(saved.userWords || [])])
      };

      if (!saved.safeRouterPatch060 || !saved.safeDelayedScan070) {
        merged.hardRemove = false;
        merged.safeRouterPatch060 = true;
        merged.safeDelayedScan070 = true;
        localStorage.setItem(STORE_KEY, JSON.stringify(merged));
      }

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
    return String(value || '')
      .toLowerCase()
      .replace(/ё/g, 'е')
      .replace(/[#«»"'`´“”„]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function compactText(el) {
    return normalize((el && (el.innerText || el.textContent)) || '');
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

      // Для коротких слов используем границы, иначе "сво" начнёт находиться в "свободный".
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
      .rtst-hidden {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
        min-width: 0 !important;
        min-height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        border: 0 !important;
        overflow: hidden !important;
      }
      .rtst-chrome-hidden,
      .rtst-view-hidden {
        display: none !important;
      }
      .rtst-dim {
        opacity: .28 !important;
        filter: grayscale(1) blur(.4px) !important;
        outline: 2px dashed rgba(0,0,0,.28) !important;
        position: relative !important;
      }
      .rtst-dim::before {
        content: attr(data-rtst-reason);
        position: absolute;
        z-index: 2147483001;
        left: 8px;
        top: 8px;
        max-width: calc(100% - 16px);
        padding: 6px 9px;
        border-radius: 9px;
        background: rgba(0,0,0,.78);
        color: #fff;
        font: 12px/1.25 Arial, sans-serif;
        pointer-events: none;
      }
      .rtst-block-btn {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: 24px !important;
        height: 24px !important;
        min-width: 24px !important;
        min-height: 24px !important;
        margin: 3px 0 3px 8px !important;
        padding: 0 !important;
        border: 1px solid rgba(255,255,255,.55) !important;
        border-radius: 6px !important;
        background: rgba(18,18,18,.92) !important;
        color: #fff !important;
        cursor: pointer !important;
        font: 700 15px/1 Arial, sans-serif !important;
        box-shadow: 0 1px 2px rgba(255,255,255,.18), 0 2px 7px rgba(0,0,0,.34) !important;
        text-decoration: none !important;
        user-select: none !important;
        vertical-align: middle !important;
        flex: 0 0 auto !important;
      }
      .rtst-block-btn:hover {
        background: #f2f2f2 !important;
        border-color: rgba(0,0,0,.45) !important;
        color: #111 !important;
      }
      .rtst-block-btn:active {
        transform: scale(.96) !important;
      }
      .rtst-home-link {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        min-height: 36px !important;
        min-width: 0 !important;
        margin: 0 8px 0 0 !important;
        text-decoration: none !important;
        white-space: nowrap !important;
        box-sizing: border-box !important;
        flex: 0 0 auto !important;
      }
      .rtst-home-link:not([class*="__wdp_"]) {
        padding: 0 14px !important;
        border: 1px solid rgba(255,255,255,.16) !important;
        border-radius: 6px !important;
        background: var(--pen-button-primary, #00A1E7) !important;
        color: var(--pen-button-primary-text, #fff) !important;
        font: 700 14px/1 Arial, sans-serif !important;
      }
      .rtst-home-link:not([class*="__wdp_"]):hover {
        background: var(--pen-button-primary-hover, #1EABE9) !important;
        color: var(--pen-button-primary-hover-text, #fff) !important;
      }
      .rtst-home-link .rtst-home-content {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 4px !important;
      }
      .rtst-panel {
        position: fixed !important;
        right: 14px !important;
        bottom: 14px !important;
        z-index: 2147483600 !important;
        width: 336px !important;
        max-width: calc(100vw - 28px) !important;
        max-height: calc(100vh - 28px) !important;
        overflow: auto !important;
        border: 1px solid rgba(186,242,198,.28) !important;
        border-radius: 8px !important;
        background: rgba(18,18,18,.97) !important;
        color: #f4fff7 !important;
        box-shadow: 0 14px 42px rgba(0,0,0,.42) !important;
        font: 13px/1.35 Arial, sans-serif !important;
        backdrop-filter: blur(10px) !important;
      }
      .rtst-panel * { box-sizing: border-box !important; }
      .rtst-panel[data-collapsed="1"] {
        width: auto !important;
        min-width: 0 !important;
        max-width: none !important;
        overflow: visible !important;
        border-radius: 6px !important;
      }
      .rtst-panel[data-collapsed="1"] .rtst-panel-body { display: none !important; }
      .rtst-panel[data-collapsed="1"] .rtst-panel-main,
      .rtst-panel[data-collapsed="1"] .rtst-panel-caret {
        display: none !important;
      }
      .rtst-panel[data-collapsed="1"] .rtst-panel-head {
        width: auto !important;
        min-width: 40px !important;
        height: 40px !important;
        padding: 0 9px !important;
        justify-content: center !important;
        gap: 6px !important;
        border-bottom: 0 !important;
      }
      .rtst-panel[data-collapsed="1"][data-page="video"] .rtst-panel-head {
        width: 40px !important;
        min-width: 40px !important;
        padding: 0 !important;
      }
      .rtst-panel[data-collapsed="1"] .rtst-panel-compact {
        display: inline-flex !important;
      }
      .rtst-panel[data-collapsed="1"][data-page="video"] .rtst-panel-compact-count {
        display: none !important;
      }
      .rtst-panel-main { min-width: 0 !important; }
      .rtst-panel-compact {
        display: none !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 5px !important;
        font: 800 14px/1 Arial, sans-serif !important;
        color: #f4fff7 !important;
        white-space: nowrap !important;
      }
      .rtst-panel-compact-icon {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: 18px !important;
        height: 18px !important;
        color: #f4fff7 !important;
      }
      .rtst-panel-compact-count {
        min-width: 1ch !important;
        color: rgba(244,255,247,.78) !important;
        font-weight: 800 !important;
      }
      .rtst-panel-head {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 10px !important;
        padding: 12px 14px !important;
        cursor: pointer !important;
        border-bottom: 1px solid rgba(255,255,255,.12) !important;
        background: rgba(255,255,255,.035) !important;
      }
      .rtst-panel-title {
        font-weight: 800 !important;
        font-size: 16px !important;
        letter-spacing: .2px !important;
      }
      .rtst-panel-subtitle {
        margin-top: 1px !important;
        opacity: .72 !important;
        font-size: 12px !important;
      }
      .rtst-panel-counter {
        margin-top: 3px !important;
        opacity: .78 !important;
        font-size: 12px !important;
      }
      .rtst-panel-caret {
        width: 28px !important;
        height: 28px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        border-radius: 6px !important;
        background: rgba(255,255,255,.08) !important;
        border: 1px solid rgba(255,255,255,.11) !important;
      }
      .rtst-panel-body { padding: 12px 14px 14px !important; }
      .rtst-row {
        display: flex !important;
        gap: 8px !important;
        align-items: center !important;
        flex-wrap: wrap !important;
        margin: 8px 0 !important;
      }
      .rtst-panel label {
        display: flex !important;
        gap: 7px !important;
        align-items: center !important;
        cursor: pointer !important;
      }
      .rtst-panel input[type="text"] {
        width: 100% !important;
        min-height: 32px !important;
        padding: 6px 8px !important;
        border-radius: 11px !important;
        border: 1px solid rgba(186,242,198,.22) !important;
        background: rgba(255,255,255,.08) !important;
        color: #f4fff7 !important;
        outline: none !important;
      }
      .rtst-panel textarea {
        width: 100% !important;
        min-height: 90px !important;
        padding: 7px 8px !important;
        border-radius: 11px !important;
        border: 1px solid rgba(186,242,198,.22) !important;
        background: rgba(255,255,255,.08) !important;
        color: #f4fff7 !important;
        outline: none !important;
        resize: vertical !important;
        font: 12px/1.35 Consolas, monospace !important;
      }
      .rtst-panel button {
        min-height: 30px !important;
        padding: 6px 9px !important;
        border: 0 !important;
        border-radius: 999px !important;
        background: linear-gradient(135deg, #e9ffed, #bdf2c8) !important;
        color: #122216 !important;
        cursor: pointer !important;
        font: 700 12px/1.2 Arial, sans-serif !important;
        box-shadow: 0 2px 8px rgba(0,0,0,.18) !important;
      }
      .rtst-panel button:hover { filter: brightness(.9) !important; }
      #rtst-import-file { display: none !important; }
      .rtst-panel .rtst-danger {
        background: linear-gradient(135deg, #ffe4e1, #ffb9b1) !important;
        color: #3b0d08 !important;
      }
      .rtst-small { opacity: .72 !important; font-size: 12px !important; }
      .rtst-section {
        margin: 10px 0 !important;
        padding: 10px !important;
        border: 1px solid rgba(255,255,255,.10) !important;
        border-radius: 7px !important;
        background: rgba(255,255,255,.045) !important;
      }
      .rtst-section-title {
        margin: 0 0 8px !important;
        font: 700 12px/1.2 Arial, sans-serif !important;
        color: rgba(244,255,247,.86) !important;
        letter-spacing: .2px !important;
      }
      .rtst-radio-group {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: 6px !important;
      }
      .rtst-radio {
        min-height: 30px !important;
        padding: 6px 8px !important;
        border: 1px solid rgba(255,255,255,.14) !important;
        border-radius: 6px !important;
        background: rgba(255,255,255,.055) !important;
      }
      .rtst-panel input[type="radio"], .rtst-panel input[type="checkbox"] {
        accent-color: #bdf2c8 !important;
      }
      .rtst-actions {
        display: flex !important;
        gap: 6px !important;
        flex-wrap: wrap !important;
        margin-top: 8px !important;
      }
      .rtst-panel .rtst-mini-btn {
        min-height: 28px !important;
        padding: 5px 8px !important;
        border-radius: 6px !important;
        background: rgba(255,255,255,.10) !important;
        color: #f4fff7 !important;
        border: 1px solid rgba(255,255,255,.14) !important;
        box-shadow: none !important;
        font-weight: 600 !important;
      }
      .rtst-panel .rtst-mini-btn:hover {
        background: rgba(255,255,255,.18) !important;
      }
      .rtst-count {
        opacity: .62 !important;
        font-weight: 400 !important;
      }
      .rtst-modal-backdrop {
        position: fixed !important;
        inset: 0 !important;
        z-index: 2147483650 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 16px !important;
        background: rgba(0,0,0,.58) !important;
        font-family: Arial, sans-serif !important;
      }
      .rtst-modal {
        width: 520px !important;
        max-width: calc(100vw - 32px) !important;
        max-height: calc(100vh - 32px) !important;
        overflow: auto !important;
        border: 1px solid rgba(255,255,255,.14) !important;
        border-radius: 8px !important;
        background: #171717 !important;
        color: #f4fff7 !important;
        box-shadow: 0 18px 56px rgba(0,0,0,.55) !important;
      }
      .rtst-modal-head {
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        gap: 10px !important;
        padding: 12px 14px !important;
        border-bottom: 1px solid rgba(255,255,255,.10) !important;
      }
      .rtst-modal-title {
        font: 700 15px/1.2 Arial, sans-serif !important;
      }
      .rtst-modal-body { padding: 12px 14px 14px !important; }
      .rtst-modal textarea {
        width: 100% !important;
        min-height: 260px !important;
        padding: 8px !important;
        border: 1px solid rgba(255,255,255,.16) !important;
        border-radius: 6px !important;
        background: rgba(255,255,255,.06) !important;
        color: #f4fff7 !important;
        outline: none !important;
        resize: vertical !important;
        font: 12px/1.35 Consolas, monospace !important;
      }
      .rtst-modal-actions {
        display: flex !important;
        justify-content: space-between !important;
        gap: 8px !important;
        flex-wrap: wrap !important;
        margin-top: 10px !important;
      }
      .rtst-modal button {
        min-height: 30px !important;
        padding: 6px 10px !important;
        border: 1px solid rgba(255,255,255,.14) !important;
        border-radius: 6px !important;
        background: #ececec !important;
        color: #111 !important;
        cursor: pointer !important;
        font: 600 12px/1.2 Arial, sans-serif !important;
      }
      .rtst-modal .rtst-danger {
        background: #ffcbc6 !important;
        color: #2a0805 !important;
      }
      .rtst-toast {
        position: fixed !important;
        right: 14px !important;
        bottom: 14px !important;
        z-index: 2147483647 !important;
        max-width: calc(100vw - 28px) !important;
        padding: 10px 12px !important;
        border-radius: 12px !important;
        background: rgba(0,0,0,.86) !important;
        color: #fff !important;
        font: 13px/1.35 Arial, sans-serif !important;
        box-shadow: 0 8px 30px rgba(0,0,0,.3) !important;
      }
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
      if (isWatchPage()) {
        btn.remove();
        return;
      }
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
          <div class="rtst-panel-subtitle">Мне это не нравится!</div>
          <div class="rtst-panel-counter" id="rtst-counter">скрыто: 0</div>
        </div>
        <div class="rtst-panel-compact" aria-hidden="true">
          <span class="rtst-panel-compact-icon">⊘</span>
          <span class="rtst-panel-compact-count" id="rtst-compact-count">0</span>
        </div>
        <div class="rtst-panel-caret">▾</div>
      </div>
      <div class="rtst-panel-body">
        <div class="rtst-section">
          <div class="rtst-section-title">Состояние фильтра</div>
          <div class="rtst-radio-group">
            <label class="rtst-radio"><input type="radio" name="rtst-enabled-radio" id="rtst-enabled-on" value="on"> включён</label>
            <label class="rtst-radio"><input type="radio" name="rtst-enabled-radio" id="rtst-enabled-off" value="off"> выключен</label>
          </div>
        </div>

        <div class="rtst-section">
          <div class="rtst-section-title">Настройки</div>
          <div class="rtst-row"><label><input type="checkbox" id="rtst-show-hidden"> показывать скрытое бледным</label></div>
          <div class="rtst-row"><label><input type="checkbox" id="rtst-hide-menu"> чистить боковое меню</label></div>
          <div class="rtst-row"><label><input type="checkbox" id="rtst-hide-shorts"> скрывать Shorts</label></div>
          <div class="rtst-row"><label><input type="checkbox" id="rtst-clean-watch"> чистый просмотр видео</label></div>
          <div class="rtst-row"><label><input type="checkbox" id="rtst-disable-autoplay"> отключать автозапуск</label></div>
          <div class="rtst-row"><label><input type="checkbox" id="rtst-hide-comments"> скрывать комментарии</label></div>
        </div>

        <div class="rtst-section">
          <div class="rtst-section-title">Быстро добавить</div>
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
          <div class="rtst-section-title">Резервная копия</div>
          <div class="rtst-actions">
            <button type="button" class="rtst-mini-btn" data-rtst-action="export-settings">Экспорт</button>
            <button type="button" class="rtst-mini-btn" data-rtst-action="import-settings">Импорт</button>
            <button type="button" class="rtst-mini-btn rtst-danger" data-rtst-action="reset-user">Очистить списки</button>
            <input type="file" id="rtst-import-file" accept="application/json,.json">
          </div>
        </div>

        <div class="rtst-small">Кнопка «⊘» скрывает канал. Чистый просмотр оставляет видео, описание и действия и точечно убирает рекомендательные секции.</div>
      </div>
    `;

    document.documentElement.appendChild(panel);
    updatePanelRouteState();
    syncPanel();
  }

  function updatePanelRouteState() {
    const panel = document.getElementById('rtst-panel');
    if (!panel) return;
    panel.dataset.page = /^\/video\//.test(location.pathname) ? 'video' : 'other';
  }

  function syncPanel() {
    updatePanelRouteState();
    const enabledOn = document.getElementById('rtst-enabled-on');
    const enabledOff = document.getElementById('rtst-enabled-off');
    const showHidden = document.getElementById('rtst-show-hidden');
    const hideMenu = document.getElementById('rtst-hide-menu');
    const hideShorts = document.getElementById('rtst-hide-shorts');
    const cleanWatch = document.getElementById('rtst-clean-watch');
    const disableAutoplay = document.getElementById('rtst-disable-autoplay');
    const hideComments = document.getElementById('rtst-hide-comments');
    const channelCount = document.getElementById('rtst-channel-count');
    const wordCount = document.getElementById('rtst-word-count');
    if (!enabledOn || !enabledOff) return;

    enabledOn.checked = Boolean(settings.enabled);
    enabledOff.checked = !settings.enabled;
    showHidden.checked = Boolean(settings.showHidden);
    hideMenu.checked = Boolean(settings.hideSideMenuPolitics || settings.cleanRutubeChrome);
    if (hideShorts) hideShorts.checked = Boolean(settings.hideShorts);
    if (cleanWatch) cleanWatch.checked = Boolean(settings.cleanWatchPage);
    if (disableAutoplay) disableAutoplay.checked = Boolean(settings.disableAutoplay);
    if (hideComments) hideComments.checked = Boolean(settings.hideComments);
    if (channelCount) channelCount.textContent = `(${settings.userChannels.length})`;
    if (wordCount) wordCount.textContent = `(${settings.userWords.length})`;
    updateCounter();
  }

  function bindEvents() {
    document.addEventListener('change', (event) => {
      const target = event.target;
      if (!target) return;

      if (target.name === 'rtst-enabled-radio') {
        settings.enabled = target.value === 'on';
        saveSettings();
        rescanNow();
      }
      if (target.id === 'rtst-show-hidden') {
        settings.showHidden = target.checked;
        saveSettings();
        applyHiddenVisibility();
      }
      if (target.id === 'rtst-hide-menu') {
        settings.hideSideMenuPolitics = target.checked;
        settings.cleanRutubeChrome = target.checked;
        saveSettings();
        rescanNow();
      }
      if (target.id === 'rtst-hide-shorts') {
        settings.hideShorts = target.checked;
        saveSettings();
        rescanNow();
      }
      if (target.id === 'rtst-clean-watch') {
        settings.cleanWatchPage = target.checked;
        saveSettings();
        rescanNow();
      }
      if (target.id === 'rtst-disable-autoplay') {
        settings.disableAutoplay = target.checked;
        saveSettings();
        scanAutoplayVideos();
      }
      if (target.id === 'rtst-hide-comments') {
        settings.hideComments = target.checked;
        saveSettings();
        rescanNow();
      }
      if (target.id === 'rtst-clean-chrome') {
        settings.cleanRutubeChrome = target.checked;
        saveSettings();
        rescanNow();
      }
      if (target.id === 'rtst-import-file' && target.files && target.files[0]) {
        importSettingsFromFile(target.files[0]);
        target.value = '';
      }
    }, true);

    document.addEventListener('click', (event) => {
      const linkEl = event.target && event.target.closest && event.target.closest('a[href]');
      if (linkEl && !linkEl.closest('#rtst-panel')) {
        suspendScanUntil = Date.now() + 1400;
      }

      if (event.target && event.target.classList && event.target.classList.contains('rtst-modal-backdrop')) {
        closeModal();
        return;
      }

      const actionEl = event.target && event.target.closest('[data-rtst-action]');
      if (!actionEl) return;

      const action = actionEl.dataset.rtstAction;

      if (action === 'toggle-panel') {
        const panel = document.getElementById('rtst-panel');
        if (panel) panel.dataset.collapsed = panel.dataset.collapsed === '1' ? '0' : '1';
        return;
      }

      if (action === 'block-card-channel') {
        event.preventDefault();
        event.stopPropagation();
        const channel = actionEl.dataset.rtstChannel || '';
        if (channel) blockChannel(channel);
        const card = actionEl.closest('[data-rtst-card="1"]');
        if (card) hideElement(card, `канал: ${channel}`);
        return;
      }

      if (action === 'block-current-channel') {
        event.preventDefault();
        event.stopPropagation();
        const channel = detectCurrentPageChannel();
        if (channel) blockChannel(channel);
        else toast('Не смог определить канал. Ну конечно, зачем сайту нормальная разметка. Добавь вручную в панели.');
        return;
      }

      if (action === 'open-list-modal') {
        openListModal(actionEl.dataset.rtstList || 'channels');
        return;
      }

      if (action === 'close-modal') {
        closeModal();
        return;
      }

      if (action === 'modal-save-list') {
        saveListFromModal(actionEl.dataset.rtstList || 'channels');
        return;
      }

      if (action === 'modal-clear-list') {
        clearListFromModal(actionEl.dataset.rtstList || 'channels');
        return;
      }

      if (action === 'add-channel') {
        const input = document.getElementById('rtst-add-input');
        const value = input ? input.value.trim() : '';
        if (value) {
          blockChannel(value);
          input.value = '';
        }
        return;
      }

      if (action === 'add-word') {
        const input = document.getElementById('rtst-add-input');
        const value = input ? input.value.trim() : '';
        if (value) {
          addUserWord(value);
          input.value = '';
        }
        return;
      }

      if (action === 'save-lists') {
        const userChannels = document.getElementById('rtst-user-channels');
        const userWords = document.getElementById('rtst-user-words');
        settings.userChannels = linesFromTextarea(userChannels && userChannels.value);
        settings.userWords = linesFromTextarea(userWords && userWords.value);
        saveSettings();
        toast('Списки сохранены. Телевизор слегка взвизгнул.');
        rescanNow();
        return;
      }

      if (action === 'reset-user') {
        settings.userChannels = [];
        settings.userWords = [];
        saveSettings();
        syncPanel();
        toast('Пользовательские списки очищены. Базовый фильтр остался.');
        rescanNow();
        return;
      }

      if (action === 'export-settings') {
        exportSettings();
        return;
      }

      if (action === 'import-settings') {
        const input = document.getElementById('rtst-import-file');
        if (input) input.click();
      }
    }, true);
  }

  function openListModal(type) {
    closeModal();
    const isWords = type === 'words';
    const title = isWords ? 'Слова и фразы' : 'Скрытые каналы';
    const hint = isWords
      ? 'По одному слову или фразе в строке. Слишком общие слова будут косить всё подряд, как чиновник нормативку.'
      : 'По одному названию канала в строке. Кнопка «⊘» добавляет канал сюда автоматически.';
    const values = isWords ? settings.userWords : settings.userChannels;

    const modal = document.createElement('div');
    modal.className = 'rtst-modal-backdrop';
    modal.innerHTML = `
      <div class="rtst-modal" role="dialog" aria-modal="true">
        <div class="rtst-modal-head">
          <div>
            <div class="rtst-modal-title">${title}</div>
            <div class="rtst-small">${hint}</div>
          </div>
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

  function closeModal() {
    document.querySelectorAll('.rtst-modal-backdrop').forEach((el) => el.remove());
  }

  function saveListFromModal(type) {
    const textarea = document.getElementById('rtst-modal-list');
    const values = linesFromTextarea(textarea && textarea.value);
    if (type === 'words') settings.userWords = values;
    else settings.userChannels = values;
    saveSettings();
    syncPanel();
    closeModal();
    toast('Список сохранён. Без фанфар, но с пользой.');
    rescanNow();
  }

  function clearListFromModal(type) {
    if (type === 'words') settings.userWords = [];
    else settings.userChannels = [];
    saveSettings();
    syncPanel();
    closeModal();
    toast(type === 'words' ? 'Список фраз очищен.' : 'Список каналов очищен.');
    rescanNow();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function linesFromTextarea(value) {
    return unique(String(value || '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean));
  }

  function blockChannel(channel) {
    const clean = String(channel || '').trim();
    if (!clean) return;
    settings.userChannels = unique([...settings.userChannels, clean]);
    saveSettings();
    syncPanel();
    toast(`Канал скрыт: ${clean}`);
    rescanNow();
  }

  function addUserWord(word) {
    const clean = String(word || '').trim();
    if (!clean) return;
    settings.userWords = unique([...settings.userWords, clean]);
    saveSettings();
    syncPanel();
    toast(`Фраза добавлена: ${clean}`);
    rescanNow();
  }

  function exportSettings() {
    const payload = {
      app: 'RUTUBE Sans TV',
      version: '0.9.0',
      exportedAt: new Date().toISOString(),
      settings: {
        enabled: settings.enabled,
        showHidden: settings.showHidden,
        hideSideMenuPolitics: settings.hideSideMenuPolitics,
        hideShorts: settings.hideShorts,
        hardRemove: settings.hardRemove,
        cleanRutubeChrome: settings.cleanRutubeChrome,
        blockedChannels: allBlockedChannels(),
        blockedWords: allBlockedWords(),
        userChannels: settings.userChannels,
        userWords: settings.userWords
      }
    };

    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rutube-sans-tv-blocklist.json';
    document.documentElement.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(json).catch(() => {});
    }

    toast('Экспорт готов: JSON скачан, а если браузер не вредничал — ещё и скопирован в буфер.');
  }

  function importSettingsFromFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result || '{}'));
        importSettingsData(data);
      } catch (e) {
        console.warn('[RUTUBE Sans TV] Ошибка импорта:', e);
        toast('Не смог прочитать JSON. Видимо, файл решил стать искусством.');
      }
    };
    reader.readAsText(file, 'utf-8');
  }

  function importSettingsData(data) {
    const src = data && data.settings ? data.settings : data;
    if (!src || typeof src !== 'object') throw new Error('bad settings json');

    const next = { ...settings };
    for (const key of ['blockedChannels', 'blockedWords', 'userChannels', 'userWords']) {
      if (Array.isArray(src[key])) next[key] = unique(src[key]);
    }
    for (const key of ['enabled', 'showHidden', 'hideSideMenuPolitics', 'hideShorts', 'hardRemove', 'cleanRutubeChrome', 'cleanWatchPage', 'disableAutoplay', 'hideComments']) {
      if (typeof src[key] === 'boolean') next[key] = src[key];
    }

    settings = next;
    saveSettings();
    syncPanel();
    toast('Импорт применён. Список блокировок вернулся из цифровой командировки.');
    rescanNow();
  }

  function toast(message) {
    const old = document.querySelector('.rtst-toast');
    if (old) old.remove();
    const el = document.createElement('div');
    el.className = 'rtst-toast';
    el.textContent = message;
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

  function rescanNow() {
    clearAllMarks();
    scanPage();
  }

  function clearAllMarks() {
    hiddenCount = 0;
    removedCount = 0;
    document.querySelectorAll('.rtst-hidden,.rtst-dim,.rtst-chrome-hidden,.rtst-view-hidden').forEach((el) => {
      el.classList.remove('rtst-hidden', 'rtst-dim', 'rtst-view-hidden', 'rtst-chrome-hidden');
      el.removeAttribute('data-rtst-hidden');
      el.removeAttribute('data-rtst-hide-target');
      el.removeAttribute('data-rtst-reason');
      el.removeAttribute('data-rtst-chrome-hidden');
      el.removeAttribute('data-rtst-view-hidden');
    });
    document.querySelectorAll('[data-rtst-processed]').forEach((el) => {
      el.removeAttribute('data-rtst-processed');
      el.removeAttribute('data-rtst-card');
      el.removeAttribute('data-rtst-hidden-child');
    });
    updateCounter();
  }

  function scanPage() {
    if (!document.body) return;
    if (Date.now() < suspendScanUntil) {
      scheduleScan();
      return;
    }

    if (location.href !== lastUrl) {
      lastUrl = location.href;
      clearAllMarks();
      suspendScanUntil = Date.now() + 2200;
      scheduleScan();
      return;
    }

    createPanel();
    refreshLegacyControls();
    restoreProtectedHeader();

    if (!settings.enabled) {
      clearAllMarks();
      updateCounter();
      return;
    }

    addCurrentChannelButton();
    addHomeButtonNearSubscribe();

    hiddenCount = removedCount;

    scanCards();
    if (settings.hideSideMenuPolitics || settings.cleanRutubeChrome) {
      scanNavigationLinks();
      cleanRutubeChrome();
    }
    if (settings.cleanWatchPage) cleanWatchPage();
    if (settings.hideComments) hideComments();
    if (settings.disableAutoplay) scanAutoplayVideos();
    applyHiddenVisibility();
    restoreProtectedHeader();
    updateCounter();
  }

  function scanCards() {
    const links = Array.from(document.querySelectorAll('a[href]'))
      .filter((a) => isVideoLikeLink(a) || isChannelLikeLink(a));

    for (const link of links) {
      const card = findCard(link);
      if (!card || card.dataset.rtstProcessed === '1') continue;
      if (card.closest('#rtst-panel')) continue;

      card.dataset.rtstProcessed = '1';
      card.dataset.rtstCard = '1';

      const info = readCardInfo(card, link);
      addBlockChannelButton(card, info.channel);

      const reason = getBlockReason(info);
      if (reason) hideElement(card, reason);
    }
  }


  function isWatchPage() {
    return /\/video\/|\/plst\//.test(location.pathname);
  }

  function isProtectedHeader(el) {
    if (!el) return false;
    return Boolean(el.closest('header, [role="banner"], .wdp-header-module__header, [class*="header-module__header"], [class*="Header-module__header"]'));
  }

  function restoreProtectedHeader() {
    // 1.0.3: больше не трогаем шапку. Rutube от таких ласк падает в «Что-то пошло не так».
  }


  function cleanWatchPage() {
    if (!isWatchPage()) return;

    // 1.0.4: чистый просмотр работает точечно.
    // Не трогаем шапку, заголовок, описание и блок действий, но убираем рекомендации под видео.
    addHomeButtonNearSubscribe();
    hideWatchRecommendationsBySelector();
    hideRutubeSelfPromo();
  }

  function hideWatchRecommendationsBySelector() {
    if (!isWatchPage()) return;

    const selectors = [
      '.wdp-see-also-module__wrapper',
      '.additional-recommendations-module__section',
      'section[aria-label="Рекомендации" i][data-testid="grid"]',
      'section[aria-label="Рекомендации" i]',
      '.video-page-layout-module__right',
      '.video-page-layout-module__side'
    ];

    document.querySelectorAll(selectors.join(',')).forEach((el) => {
      if (!el || el.closest('#rtst-panel')) return;
      if (isInsidePlayer(el) || isProtectedHeader(el)) return;
      if (el.closest('section[aria-label="блок действий" i], section[aria-label="информация о видео" i], section[aria-label="описание видео" i]')) return;

      const target =
        el.closest('.wdp-see-also-module__wrapper') ||
        el.closest('.video-page-layout-module__right') ||
        el;

      if (!target || target.closest('#rtst-panel')) return;
      if (target.querySelector && target.querySelector('#rtst-home-link')) return;
      if (isInsidePlayer(target) || isProtectedHeader(target)) return;

      const text = normalize(target.innerText || target.textContent || target.getAttribute('aria-label') || '');
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
    if (!isWatchPage()) {
      if (old) old.remove();
      return;
    }

    const subscribeButton = document.querySelector(
      'section[aria-label="блок действий" i] button[aria-label*="Подпис" i], ' +
      'button[class*="subscribe" i], ' +
      'button[aria-label*="Подпис" i]'
    );

    const toolbarRight =
      (subscribeButton && subscribeButton.closest('.wdp-video-options-row-module__wdpVideoOptionsRow__toolbar-right')) ||
      (subscribeButton && subscribeButton.parentElement) ||
      document.querySelector('section[aria-label="блок действий" i] .wdp-video-options-row-module__wdpVideoOptionsRow__toolbar-right');

    if (!toolbarRight || toolbarRight.closest('#rtst-panel')) return;

    let link = old;
    if (!link) {
      link = document.createElement('a');
      link.id = 'rtst-home-link';
      link.href = '/';
      link.title = 'На главную RUTUBE';
      link.setAttribute('aria-label', 'На главную RUTUBE');
    }

    syncHomeButtonStyle(link, subscribeButton);

    if (link.parentElement !== toolbarRight) {
      if (subscribeButton && subscribeButton.parentElement === toolbarRight) {
        toolbarRight.insertBefore(link, subscribeButton);
      } else {
        toolbarRight.insertBefore(link, toolbarRight.firstChild);
      }
    }
  }

  function syncHomeButtonStyle(link, subscribeButton) {
    if (!link) return;
    const baseClass = 'rtst-home-link';
    const subscribeClasses = subscribeButton && subscribeButton.className ? String(subscribeButton.className) : '';
    const content = subscribeButton && subscribeButton.querySelector('span') ? subscribeButton.querySelector('span') : null;
    const contentClass = content && content.className ? String(content.className) : '';

    link.className = `${baseClass}${subscribeClasses ? ' ' + subscribeClasses : ''}`;
    link.href = '/';
    link.title = 'На главную RUTUBE';
    link.setAttribute('aria-label', 'На главную RUTUBE');
    link.setAttribute('role', 'button');
    link.innerHTML = contentClass
      ? `<span class="rtst-home-content ${escapeAttribute(contentClass)}">⌂ Главная</span>`
      : '<span class="rtst-home-content">⌂ Главная</span>';
  }

  function escapeAttribute(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function hideRecommendationCardsOnWatchPage() {
    const links = Array.from(document.querySelectorAll('a[href*="/video/"], a[href*="/shorts/"], a[href*="/plst/"]'));
    for (const link of links) {
      if (link.closest('#rtst-panel')) continue;
      if (isInsidePlayer(link)) continue;
      if (isPrimaryVideoTitleLink(link)) continue;

      const card = findCard(link);
      if (!card || card.closest('#rtst-panel') || isInsidePlayer(card)) continue;
      if (isDangerousHideTarget(card)) continue;

      const headingParent = card.closest('main');
      if (!headingParent && !card.closest('aside, [class*="Aside"], [class*="aside"], [class*="Sidebar"], [class*="sidebar"], [class*="Recommend"], [class*="recommend"], [class*="Related"], [class*="related"]')) continue;

      hideElement(card, 'чистый просмотр');
    }
  }

  function hideWatchBlocksByText() {
    const watchBlockWords = [
      'смотрите также',
      'вам может понравиться',
      'похожие видео',
      'рекомендуем',
      'рекомендации',
      'следующее видео',
      'популярное',
      'сейчас смотрят',
      'больше видео',
      'ещё видео',
      'еще видео'
    ];

    document.querySelectorAll('h1,h2,h3,h4,h5,h6,span,p,div').forEach((el) => {
      if (el.closest('#rtst-panel')) return;
      if (isInsidePlayer(el)) return;
      const raw = String(el.innerText || el.textContent || '').trim();
      if (!raw || raw.length > 90) return;
      const text = normalize(raw);
      const match = watchBlockWords.find((word) => text === normalize(word) || text.includes(normalize(word)));
      if (!match) return;
      const target = findWatchBlockTarget(el);
      softHideViewElement(target, `чистый просмотр: ${match}`);
    });
  }

  function hideSideRecommendationRails() {
    document.querySelectorAll('aside, [class*="Aside"], [class*="aside"], [class*="Sidebar"], [class*="sidebar"], [class*="Right"], [class*="right"]').forEach((el) => {
      if (el.closest('#rtst-panel')) return;
      if (isInsidePlayer(el)) return;
      const videoLinks = el.querySelectorAll('a[href*="/video/"], a[href*="/shorts/"], a[href*="/plst/"]').length;
      if (videoLinks < 2) return;
      if (containsCoreMenuText(normalize(el.innerText || el.textContent || ''))) return;
      softHideViewElement(el, 'правая колонка рекомендаций');
    });
  }

  function hideRutubeSelfPromo() {
    const promoWords = [
      'отключить рекламу',
      'смотреть без рекламы',
      'подписка',
      '99 ₽',
      '99 рублей',
      'rutube premium',
      'premium'
    ];

    document.querySelectorAll('div,section,aside,article').forEach((el) => {
      if (el.closest('#rtst-panel')) return;
      if (isInsidePlayer(el)) return;
      const text = normalize(el.innerText || el.textContent || '');
      if (!text || text.length > 900) return;
      const match = containsBlocked(text, promoWords);
      if (!match) return;
      const target = findSmallViewTarget(el);
      softHideViewElement(target, `самореклама: ${match}`);
    });
  }

  function hideComments() {
    if (!isWatchPage()) return;

    const directSelectors = [
      'section[aria-label="комментарии" i]',
      '[aria-label="комментарии" i]',
      '[class*="comments-module" i]',
      '[class*="Comments" i]',
      '[class*="comments" i]'
    ];

    document.querySelectorAll(directSelectors.join(',')).forEach((el) => {
      if (el.closest('#rtst-panel')) return;
      if (isInsidePlayer(el)) return;
      const text = normalize(el.innerText || el.textContent || el.getAttribute('aria-label') || '');
      const className = String(el.className || '');
      const isLikelyComments =
        text.includes('коммент') ||
        normalize(el.getAttribute('aria-label') || '').includes('комментарии') ||
        /comments/i.test(className);
      if (!isLikelyComments) return;
      softHideViewElement(el, 'комментарии');
    });

    const commentWords = ['комментарии', 'оставить комментарий', 'написать комментарий', 'войдите, чтобы оставить комментарий'];

    document.querySelectorAll('section,article,div,h2,h3,h4').forEach((el) => {
      if (el.closest('#rtst-panel')) return;
      if (isInsidePlayer(el)) return;
      if (el.dataset.rtstViewHidden === '1') return;
      const raw = String(el.innerText || el.textContent || el.getAttribute('aria-label') || '').trim();
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
      if (parent.closest('#rtst-panel')) break;
      if (isInsidePlayer(parent)) break;
      const tag = parent.tagName ? parent.tagName.toLowerCase() : '';
      if (['main', 'header', 'footer', 'nav'].includes(tag)) break;

      const text = String(parent.innerText || parent.textContent || '').trim();
      const linkCount = parent.querySelectorAll ? parent.querySelectorAll('a[href]').length : 0;
      const videoLinkCount = parent.querySelectorAll ? parent.querySelectorAll('a[href*="/video/"], a[href*="/shorts/"], a[href*="/plst/"]').length : 0;
      const className = String(parent.className || '');
      const looksLikeBlock = /recommend|related|comment|feed|list|section|block|wrapper|aside|sidebar/i.test(className);

      if ((looksLikeBlock && text.length < 2600) || (videoLinkCount >= 2 && linkCount <= 30 && text.length < 3200)) {
        target = parent;
        continue;
      }
      break;
    }
    return target;
  }

  function findSmallViewTarget(el) {
    let target = el;
    for (let i = 0; i < 5 && target && target.parentElement; i++) {
      const parent = target.parentElement;
      if (!parent || parent === document.body || parent === document.documentElement) break;
      if (parent.closest('#rtst-panel')) break;
      if (isInsidePlayer(parent)) break;
      const tag = parent.tagName ? parent.tagName.toLowerCase() : '';
      if (['main', 'header', 'footer', 'nav'].includes(tag)) break;

      const text = String(parent.innerText || parent.textContent || '').trim();
      const linkCount = parent.querySelectorAll ? parent.querySelectorAll('a[href]').length : 0;
      if (text.length <= 1000 && linkCount <= 8) {
        target = parent;
        continue;
      }
      break;
    }
    return target;
  }

  function softHideViewElement(el, reason) {
    if (!el || el.closest('#rtst-panel')) return;
    if (isProtectedHeader(el)) return;
    if (el === document.body || el === document.documentElement) return;
    const tag = el.tagName ? el.tagName.toLowerCase() : '';
    if (['main', 'header', 'footer', 'nav'].includes(tag)) return;
    if (isInsidePlayer(el)) return;
    el.dataset.rtstViewHidden = '1';
    el.dataset.rtstReason = `скрыто, ${reason}`;
    el.classList.add('rtst-view-hidden');
  }

  function isInsidePlayer(el) {
    if (!el) return false;
    return Boolean(el.closest('video, iframe, [class*="Player"], [class*="player"], [id*="player"], [data-testid*="player" i]'));
  }

  function isPrimaryVideoTitleLink(link) {
    const h1 = document.querySelector('h1');
    if (!h1) return false;
    return h1.contains(link) || link.contains(h1);
  }

  function scanNavigationLinks() {
    const navWords = [
      'новости и сми',
      'разговоры о важном',
      'тв онлайн',
      'rutube tv',
      'rutube x premier',
      'rutube x start',
      'телеканалы',
      'первый канал',
      'россия 1',
      'россия 24',
      'рен тв',
      'звезда',
      'нтв',
      'известия',
      'царьград',
      'соловьев live',
      'соловьёв live',
      'лдпр тв'
    ];

    if (settings.hideShorts) navWords.push('shorts', 'шортсы');

    document.querySelectorAll('a[href]').forEach((a) => {
      if (a.closest('#rtst-panel')) return;
      const text = compactText(a);
      const match = containsBlocked(text, navWords);
      if (!match) return;

      const item = a.closest('li, [role="listitem"], [class*="item"], [class*="Item"]') || a;
      softHideChromeElement(item, `раздел: ${match}`);
    });
  }

  function cleanRutubeChrome() {
    const exactItems = [
      'rutube для блогеров',
      'rutube x premier',
      'rutube x start',
      'вопросы и ответы',
      'сообщить о проблеме',
      'письмо в поддержку',
      'поддержка в max',
      'help@rutube.ru',
      'о rutube',
      'направления деятельности',
      'пользовательское соглашение',
      'конфиденциальность',
      'правовая информация',
      'рекомендательная система',
      'фирменный стиль'
    ];

    const blockHeadings = [
      'rutube всегда с вами',
      'cкачать приложения',
      'скачать приложения',
      'больше от rutube',
      'rutube в других соцсетях'
    ];

    document.querySelectorAll('a[href*="/feeds/start/"], a[href*="/feeds/premier/"]').forEach((a) => {
      if (a.closest('#rtst-panel')) return;
      const target = findChromeItemTarget(a);
      softHideChromeElement(target, 'пункт: rutube x start/premier');
    });

    document.querySelectorAll('section[aria-label*="качать приложения" i], section[aria-label*="скачать приложения" i], section[class*="menu-app-section" i]').forEach((section) => {
      if (section.closest('#rtst-panel')) return;
      softHideChromeElement(section, 'блок: rutube всегда с вами');
    });

    document.querySelectorAll('a[href], button, [role="link"], [role="button"]').forEach((el) => {
      if (el.closest('#rtst-panel')) return;
      const text = normalize(el.innerText || el.textContent || el.getAttribute('aria-label') || '');
      if (!text) return;
      const match = exactItems.find((item) => text === normalize(item));
      if (!match) return;

      const target = findChromeItemTarget(el);
      softHideChromeElement(target, `пункт: ${match}`);
    });

    document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,div').forEach((el) => {
      if (el.closest('#rtst-panel')) return;
      const raw = String(el.innerText || el.textContent || '').trim();
      if (!raw || raw.length > 80) return;

      const text = normalize(raw);
      const match = blockHeadings.find((heading) => text === normalize(heading));
      if (!match) return;

      const target = findChromeBlockTarget(el);
      softHideChromeElement(target, `блок: ${match}`);
    });
  }

  function softHideChromeElement(el, reason) {
    if (!el || el.closest('#rtst-panel')) return;
    if (isProtectedHeader(el)) return;
    if (containsCoreMenuText(normalize(el.innerText || el.textContent || ''))) return;
    el.dataset.rtstChromeHidden = '1';
    el.dataset.rtstReason = `скрыто, ${reason}`;
    el.classList.add('rtst-chrome-hidden');
  }

  function findChromeItemTarget(el) {
    const direct = el.closest('li, [role="listitem"]');
    if (direct && !containsCoreMenuText(normalize(direct.innerText || direct.textContent || ''))) return direct;

    let target = el;
    for (let i = 0; i < 5 && target && target.parentElement; i++) {
      const parent = target.parentElement;
      if (!parent || parent === document.body || parent === document.documentElement) break;
      if (parent.closest('#rtst-panel')) break;

      const tag = parent.tagName ? parent.tagName.toLowerCase() : '';
      if (['main', 'header', 'footer', 'nav', 'aside', 'section'].includes(tag)) break;

      const targetText = String(target.innerText || target.textContent || '').trim();
      const parentText = String(parent.innerText || parent.textContent || '').trim();
      const parentNorm = normalize(parentText);
      if (containsCoreMenuText(parentNorm)) break;

      const className = String(parent.className || '');
      const compactWrapper = parent.children.length <= 3 && parentText.length <= Math.max(targetText.length + 90, 160);
      const classWrapper = /item|link|menu|row|cell|wrapper/i.test(className) && parentText.length <= 240;

      if (compactWrapper || classWrapper) {
        target = parent;
        continue;
      }
      break;
    }
    return target;
  }

  function findChromeBlockTarget(el) {
    let target = el;

    for (let i = 0; i < 5 && target && target.parentElement; i++) {
      const parent = target.parentElement;
      if (!parent || parent === document.body || parent === document.documentElement) break;
      if (parent.closest('#rtst-panel')) break;

      const tag = parent.tagName ? parent.tagName.toLowerCase() : '';
      if (['main', 'header', 'footer', 'nav', 'aside', 'section'].includes(tag)) break;

      const text = String(parent.innerText || parent.textContent || '').trim();
      const norm = normalize(text);
      if (containsCoreMenuText(norm)) break;

      const linkCount = parent.querySelectorAll ? parent.querySelectorAll('a[href]').length : 0;
      const className = String(parent.className || '');
      const looksLikeSmallBlock = text.length <= 520 && linkCount <= 8;
      const looksLikeNamedBlock = /block|section|footer|social|apps|links|group|wrapper/i.test(className) && text.length <= 700 && linkCount <= 10;

      if (looksLikeSmallBlock || looksLikeNamedBlock) {
        target = parent;
        continue;
      }
      break;
    }

    return target;
  }

  function containsCoreMenuText(text) {
    const core = [
      'главная',
      'подписки',
      'история просмотра',
      'плейлисты',
      'смотреть позже',
      'комментарии',
      'понравилось',
      'по темам',
      'каталог',
      'в топе',
      'трансляции',
      'мое',
      'моё'
    ];
    return core.some((word) => text.includes(word));
  }

  function isVideoLikeLink(a) {
    const href = a.href || '';
    return href.includes('/video/') || href.includes('/shorts/') || href.includes('/plst/');
  }

  function isChannelLikeLink(a) {
    const href = a.href || '';
    return href.includes('/channel/') || href.includes('/u/') || href.includes('/feeds/');
  }

  function findCard(startEl) {
    const hard = startEl.closest([
      'article',
      'li',
      '[data-testid*="card" i]',
      '[data-testid*="video" i]',
      '[class*="VideoCard"]',
      '[class*="video-card"]',
      '[class*="Card"]',
      '[class*="card"]',
      '[class*="Tile"]',
      '[class*="tile"]'
    ].join(','));

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
    if (['main', 'header', 'footer', 'nav'].includes(tag)) return false;

    const textLen = (el.innerText || el.textContent || '').trim().length;
    if (textLen < 3 || textLen > 2200) return false;

    const linkCount = el.querySelectorAll ? el.querySelectorAll('a[href]').length : 0;
    return linkCount >= 1;
  }

  function readCardInfo(card, primaryLink) {
    const text = compactText(card);
    const title = normalize(primaryLink && primaryLink.textContent);
    const channel = detectChannelName(card, title);
    const isShort = Boolean(
      (primaryLink && (primaryLink.href || '').includes('/shorts/')) ||
      card.querySelector('a[href*="/shorts/"]') ||
      /(^|\s)shorts(\s|$)/i.test(text)
    );
    return { text, title, channel, isShort, element: card };
  }

  function detectChannelName(card, title) {
    const channelSelectors = [
      'a[href*="/channel/"]',
      'a[href*="/u/"]',
      'a[href*="/feeds/"]',
      'a[href*="/metainfo/"]'
    ];

    const candidates = [];
    for (const a of card.querySelectorAll(channelSelectors.join(','))) {
      const text = String(a.innerText || a.textContent || a.getAttribute('aria-label') || '').trim();
      if (!text) continue;
      if (normalize(text) === normalize(title)) continue;
      if (text.length > 80) continue;
      candidates.push(text);
    }

    const imgAlt = Array.from(card.querySelectorAll('img[alt]'))
      .map((img) => String(img.getAttribute('alt') || '').trim())
      .find((alt) => /иконка канала|канал/i.test(alt) && alt.length < 120);

    if (imgAlt) {
      const cleaned = imgAlt
        .replace(/^иконка канала\s*/i, '')
        .replace(/^канал\s*/i, '')
        .trim();
      if (cleaned) candidates.push(cleaned);
    }

    const cleanCandidates = unique(candidates)
      .filter((name) => name.length >= 2 && name.length <= 80);

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
    if (!el || el.closest('#rtst-panel')) return;
    if (isProtectedHeader(el)) return;

    const target = findBestHideTarget(el);
    if (!target || target.closest('#rtst-panel')) return;
    if (isDangerousHideTarget(target)) return;

    if (target.dataset.rtstHidden !== '1') {
      hiddenCount += 1;
    }

    target.dataset.rtstHidden = '1';
    target.dataset.rtstHideTarget = '1';
    target.dataset.rtstReason = `скрыто, ${reason}`;

    if (target !== el) {
      el.dataset.rtstHiddenChild = '1';
    }

    // 0.7.1: физическое удаление DOM убрано. Rutube от него ломает SPA-переходы
    // и показывает пустой экран. Карточки скрываем только CSS-классом.

    if (settings.showHidden) {
      target.classList.remove('rtst-hidden');
      target.classList.add('rtst-dim');
    } else {
      target.classList.remove('rtst-dim');
      target.classList.add('rtst-hidden');
    }
  }

  function isDangerousHideTarget(target) {
    if (!target || target === document.body || target === document.documentElement) return true;
    const tag = target.tagName ? target.tagName.toLowerCase() : '';
    if (['main', 'header', 'footer', 'nav', 'aside', 'section'].includes(tag)) return true;
    if (target.id && /root|app|layout|page/i.test(target.id)) return true;

    const textLen = (target.innerText || target.textContent || '').trim().length;
    const linkCount = target.querySelectorAll ? target.querySelectorAll('a[href]').length : 0;
    const videoLinkCount = target.querySelectorAll ? target.querySelectorAll('a[href*="/video/"], a[href*="/shorts/"], a[href*="/plst/"]').length : 0;

    // Если это уже не карточка, а кусок страницы/ленты, не трогаем. Лучше оставить один телевизор,
    // чем превратить весь контент в белую пустыню, как завещали лучшие SPA-фреймворки.
    if (textLen > 1800 || linkCount > 8 || videoLinkCount > 3) return true;

    return false;
  }

  function findBestHideTarget(el) {
    const listItem = findCollectionChild(el);
    if (listItem) return listItem;

    return findWrapperTarget(el);
  }

  function findCollectionChild(el) {
    let node = el;

    for (let i = 0; i < 12 && node && node.parentElement; i++) {
      const parent = node.parentElement;
      if (!parent || parent === document.body || parent === document.documentElement) break;
      if (parent.closest('#rtst-panel')) break;

      const tag = parent.tagName ? parent.tagName.toLowerCase() : '';
      if (['main', 'header', 'footer', 'nav'].includes(tag)) break;

      if (isCollectionParent(parent)) {
        return node;
      }

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
    const looksLikeLayout = (
      style.display === 'grid' ||
      style.display === 'inline-grid' ||
      style.display === 'flex' ||
      style.display === 'inline-flex' ||
      /grid|list|row|items|cards|carousel|slider|swiper|feed/i.test(className)
    );

    return looksLikeLayout;
  }

  function childLooksLikeFeedItem(child) {
    if (!child || child.closest('#rtst-panel')) return false;

    const textLen = (child.innerText || child.textContent || '').trim().length;
    if (textLen < 8 || textLen > 2600) return false;

    const hasVideo = Boolean(child.querySelector('a[href*="/video/"], a[href*="/shorts/"], a[href*="/plst/"]'));
    const hasChannel = Boolean(child.querySelector('a[href*="/channel/"], a[href*="/u/"], a[href*="/feeds/"]'));

    return hasVideo || hasChannel;
  }

  function findWrapperTarget(el) {
    let target = el;

    for (let i = 0; i < 8 && target && target.parentElement; i++) {
      const parent = target.parentElement;
      if (!parent || parent === document.body || parent === document.documentElement) break;
      if (parent.closest('#rtst-panel')) break;

      const tag = parent.tagName ? parent.tagName.toLowerCase() : '';
      if (['main', 'header', 'footer', 'nav', 'section'].includes(tag)) break;

      const targetTextLen = (target.innerText || target.textContent || '').trim().length;
      const parentTextLen = (parent.innerText || parent.textContent || '').trim().length;
      const className = String(parent.className || '');
      const childCount = parent.children ? parent.children.length : 0;

      const wrapperByText = childCount <= 3 && parentTextLen <= Math.max(targetTextLen + 120, Math.round(targetTextLen * 1.35));
      const wrapperByClass = /item|tile|cell|card|slide|swiper-slide|column|col|wrapper/i.test(className);

      if (wrapperByText || wrapperByClass) {
        target = parent;
        continue;
      }

      break;
    }

    return target;
  }

  function applyHiddenVisibility() {
    document.querySelectorAll('[data-rtst-hidden="1"]').forEach((el) => {
      if (settings.showHidden) {
        el.classList.remove('rtst-hidden');
        el.classList.add('rtst-dim');
      } else {
        el.classList.remove('rtst-dim');
        el.classList.add('rtst-hidden');
      }
    });
  }

  function isSubscriptionsContext(el) {
    const path = normalize(location.pathname);
    if (/subscription|subscriptions|podpis|subscribe|subscribed/.test(path)) return true;

    const pageTitle = normalize((document.querySelector('h1') || {}).innerText || '');
    if (pageTitle.includes('подписки') || pageTitle.includes('мои подписки')) return true;

    const section = el.closest('section, [class*="Section"], [class*="section"], [class*="Block"], [class*="block"]');
    if (!section) return false;

    const heading = section.querySelector('h1,h2,h3,h4,[class*="Title"],[class*="title"]');
    const headingText = normalize(heading && (heading.innerText || heading.textContent));
    return headingText.includes('подписки') || headingText.includes('мои подписки');
  }

  function addBlockChannelButton(card, channel) {
    if (!channel) return;
    if (isWatchPage()) return;
    if (isSubscriptionsContext(card)) return;

    const existing = card.querySelector('.rtst-block-btn[data-rtst-action="block-card-channel"]');
    if (existing) {
      existing.textContent = '⊘';
      existing.dataset.rtstChannel = channel;
      existing.title = `Скрыть канал: ${channel}`;
      existing.setAttribute('aria-label', `Скрыть канал: ${channel}`);
      return;
    }

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'rtst-block-btn';
    btn.dataset.rtstAction = 'block-card-channel';
    btn.dataset.rtstChannel = channel;
    btn.textContent = '⊘';
    btn.title = `Скрыть канал: ${channel}`;
    btn.setAttribute('aria-label', `Скрыть канал: ${channel}`);

    const channelLink = Array.from(card.querySelectorAll('a[href]'))
      .find((a) => normalize(a.textContent) === normalize(channel));

    const host = (channelLink && channelLink.parentElement) || card;
    host.appendChild(btn);
  }

  function detectCurrentPageChannel() {
    const h1 = document.querySelector('h1');

    if (/\/channel\/|\/u\//.test(location.pathname) && h1) {
      const fromH1 = String(h1.innerText || h1.textContent || '').trim();
      if (fromH1 && fromH1.length < 100) return fromH1;
    }

    const videoTitle = h1 ? normalize(h1.innerText || h1.textContent) : '';
    const links = Array.from(document.querySelectorAll('a[href*="/channel/"], a[href*="/u/"], a[href*="/feeds/"]'));
    const candidate = links
      .map((a) => String(a.innerText || a.textContent || '').trim())
      .filter((text) => text && normalize(text) !== videoTitle && text.length >= 2 && text.length <= 80)[0];

    return candidate || '';
  }

  function addCurrentChannelButton() {
    const oldBtn = document.getElementById('rtst-current-channel-btn');
    if (isWatchPage()) {
      if (oldBtn) oldBtn.remove();
      return;
    }
    if (oldBtn) {
      oldBtn.textContent = '⊘ скрыть канал';
      oldBtn.title = 'Добавить текущий канал в скрытые';
      oldBtn.setAttribute('aria-label', 'Добавить текущий канал в скрытые');
      return;
    }
    if (!/\/channel\/|\/u\//.test(location.pathname)) return;

    const btn = document.createElement('button');
    btn.id = 'rtst-current-channel-btn';
    btn.type = 'button';
    btn.className = 'rtst-block-btn';
    btn.dataset.rtstAction = 'block-current-channel';
    btn.textContent = '⊘ скрыть канал';
    btn.title = 'Добавить текущий канал в скрытые';
    btn.setAttribute('aria-label', 'Добавить текущий канал в скрытые');
    btn.style.position = 'fixed';
    btn.style.right = '14px';
    btn.style.bottom = '74px';
    btn.style.zIndex = '2147483500';

    document.documentElement.appendChild(btn);
  }


  function setupAutoplayGuard() {
    if (autoplayGuardInstalled) return;
    autoplayGuardInstalled = true;

    const markGesture = () => {
      lastUserGestureAt = Date.now();
    };

    document.addEventListener('pointerdown', markGesture, true);
    document.addEventListener('keydown', markGesture, true);
    document.addEventListener('touchstart', markGesture, true);

    const originalPlay = HTMLMediaElement.prototype.play;
    if (!originalPlay || originalPlay.__rtstPatched) return;

    const patchedPlay = function (...args) {
      if (settings && settings.disableAutoplay && shouldBlockAutoplay(this)) {
        this.autoplay = false;
        this.removeAttribute('autoplay');
        try { this.pause(); } catch (e) {}
        return Promise.reject(new DOMException('Autoplay prevented by Рутубочист', 'AbortError'));
      }
      if (Date.now() - lastUserGestureAt < 1800) {
        this.dataset.rtstManualStarted = '1';
      }
      return originalPlay.apply(this, args);
    };

    patchedPlay.__rtstPatched = true;
    patchedPlay.__rtstOriginal = originalPlay;
    HTMLMediaElement.prototype.play = patchedPlay;
  }

  function shouldBlockAutoplay(video) {
    if (!video || !(video instanceof HTMLMediaElement)) return false;
    if (Date.now() - lastUserGestureAt < 1800) return false;
    if (video.dataset && video.dataset.rtstManualStarted === '1') return false;
    return /rutube\.ru$/i.test(location.hostname) || /rutube\.ru/i.test(location.hostname);
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
      }
      if (!video.paused && video.dataset.rtstManualStarted !== '1' && Date.now() - lastUserGestureAt > 1800) {
        try { video.pause(); } catch (e) {}
      }
    });
  }

  function watchDom() {
    // 0.7.0: MutationObserver оказался слишком назойливым для Rutube.
    // Вместо реакции на каждый чих DOM используем спокойный периодический скан.
    if (observer) observer.disconnect();
    observer = null;
  }

  function boot() {
    setupAutoplayGuard();
    addStyle();
    bindEvents();
    watchDom();
    scheduleScan();
    window.addEventListener('popstate', () => setTimeout(rescanNow, 250));
    setInterval(() => {
      if (location.href !== lastUrl) {
        scheduleScan();
        return;
      }
      if (settings.enabled) scheduleScan();
    }, 2500);
  }

  setupAutoplayGuard();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
