// ==UserScript==
// @name         Рутубочист
// @namespace    https://github.com/npekpacHo/rutubochist
// @version      1.4.7
// @description  Рутубочист: очищает интерфейс RUTUBE. Добавляет ЧС и возможности блокировки нежелательных каналов. Есть рекомендации того, что посмотреть.
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
  const VIEW_HISTORY_KEY = 'rtstViewHistory:v1';
  const VIEW_PARTIAL_TTL_MS = 120 * 24 * 60 * 60 * 1000;
  const VIEW_COMPLETED_TTL_MS = 730 * 24 * 60 * 60 * 1000;
  const VIEW_MAX_PARTIAL = 700;
  const VIEW_MAX_TOTAL = 2600;
  const UI_VERSION = '1.4.7';

  const DEFAULT_BLOCKED_CHANNELS = [
    // Телевизор и пропаганда
    'Первый канал', 'Россия 1', 'Россия 24', 'НТВ', 'Пятый канал', 'РЕН ТВ', 'ТВЦ', 'ТВ Центр',
    'Звезда', 'СПАС', 'RT', 'RTД на русском', 'РИА Новости', 'ТАСС', 'Известия', 'Комсомольская правда',
    'Царьград', 'Соловьёв LIVE', 'Соловьев LIVE', 'БесогонТВ', 'БесогонТВ | besogontv', 'Дмитрий Пучков', 
    'ЛДПР ТВ', 'Москва 24', '360', 'Sputnik', 'ВЕСТИ', 'СМЕРШ',
    'Кот Костян', 'РЕПОРТЁРЫ', 'Наизнанку', 'Стас Ай, Как Просто!', 'Разговоры Обо Всём', 
    'Тамир Шейх', 'Егор Мисливец', 'Дмитрий Василец', 'протоиерей Андрей Ткачев', 
    'ЭМПАТИЯ МАНУЧИ', 'Взгляд из Четвертого Измерения', 'Мир Михаила Онуфриенко', 
    'Александр Семченко', 'Metametrica', 'Подкаст Глеба Соломина',

    // Развлекательное ТВ
    'ТНТ', 'СТС', 'Пятница!', 'Муз-ТВ', 'Телеканал Ю', 'Домашний', 'МАТЧ!', 'МАТЧ ТВ',

    // Детский Треш
    'Влад А4', 'А4', 'Компот', 'Глент', 'Кобяков', '[NAGIB_PRO] NG', 'А ну-ка Давай-ка', 'Double Bubble', '7Я', 'WTFamily', 'Морковь PRO', 'Камон', 'Малевич', 'Ла-Ла Лайф', 'kotiynet', 'НАТУРАЛ АЛЬБЕРТОВИЧ ✔️', 'Смехо БУМС!', 'Луномосик', 'Олежэ', 'IAMMBLACK', 'Алексей Сова', 'BadVo1ce', 'CHERRY DADDY SHOW'
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

  const GOOGLE_SEARCH_EXCLUDE_WORDS = [
    'обзор', 'отзыв', 'трейлер', 'трейлеры', 'trailer', 'trailers', 'тизер', 'рецензия',
    'разбор', 'пересказ', 'сюжет', 'нарезка', 'фрагмент',
    'лучшие моменты', 'перезалив', 'перезалито'
  ];

  const SETTINGS_DEFAULTS = {
    enabled: true, showHidden: false, hideSideMenuPolitics: true, hideShorts: true, hardRemove: false,
    cleanRutubeChrome: true, cleanWatchPage: true, disableAutoplay: true, hideComments: false, hideVideoInfo: false,
    stripPlayerAds: true, unlockContextMenu: true, swipeVideoVolume: true, autoFullscreenOnRotate: false, hideVpnPopup: true, dimSearchTrash: true, markWatchedVideos: true,
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
  let modalOpenedAt = 0; 
  let panelSleepTimer = null;

  const MOVIE_DB_BASE_URLS = [
    'https://npekpacho.github.io/rutubochist/movies/',
    'https://raw.githubusercontent.com/npekpacHo/rutubochist/main/movies/'
  ];
  const MOVIE_DB_INDEX_FILE = 'index.json';
  const MOVIE_DB_CACHE_KEY = 'rtstMovieDbCache:v1';
  const MOVIE_DB_AUTO_CHECK_KEY = 'rtstMovieDbAutoCheck:v1';
  const MOVIE_DB_UPDATE_INTERVAL_MS = 3 * 24 * 60 * 60 * 1000;
  const MOVIE_DB_SATURDAY_CHECK_HOUR = 12;
  const PANEL_ICON_CACHE_KEY = 'rtstPanelIconCache:v1';
  const PANEL_ICON_MAX_CACHE_BYTES = 260 * 1024;
  const PANEL_ICON_CACHE_TTL_MS = 14 * 24 * 60 * 60 * 1000;
  const PANEL_ICON_URLS = [
    'https://npekpacho.github.io/rutubochist/rutubochist-icon.svg',
    'https://npekpacho.github.io/rutubochist/icon.svg',
    'https://raw.githubusercontent.com/npekpacHo/rutubochist/main/rutubochist-icon.svg',
    'https://raw.githubusercontent.com/npekpacHo/rutubochist/main/icon.svg'
  ];
  const PROJECT_URL = 'https://github.com/npekpacHo/rutubochist';
  const movieCache = { index: null, batches: new Map(), currentIndex: 0, currentBatch: null, source: 'none', savedAt: 0 };
  let githubState = { state: 'unknown', checkedAt: 0, message: '' };
  let panelIconCache = { src: '', source: 'fallback', savedAt: 0 };
  let panelIconFetchStarted = false;

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

      // В 1.3.34 поисковые минус-слова ошибочно попали в общий список фильтрации.
      // Держим их отдельно, чтобы Google-запрос не был простынёй, а лента не теряла
      // нормальные ролики только потому, что кто-то написал «трейлер» в названии.
      const googleExcludeSet = new Set(GOOGLE_SEARCH_EXCLUDE_WORDS.map((word) => normalize(word)));
      merged.blockedWords = unique(merged.blockedWords || DEFAULT_BLOCKED_WORDS).filter((word) => !googleExcludeSet.has(normalize(word)));

      if (typeof saved.cleanRutubeChrome !== 'boolean' && typeof saved.hideSideMenuPolitics === 'boolean') {
        merged.cleanRutubeChrome = saved.hideSideMenuPolitics;
      }
      if (typeof saved.hideSideMenuPolitics !== 'boolean' && typeof saved.cleanRutubeChrome === 'boolean') {
        merged.hideSideMenuPolitics = saved.cleanRutubeChrome;
      }
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

  function isRtstUiElement(el) {
    return Boolean(el && el.closest && el.closest('#rtst-panel, .rtst-modal-backdrop, .rtst-toast'));
  }

  const Dom = {
    qsa(selector, root = document) {
      try {
        const scope = root && root.querySelectorAll ? root : document;
        return Array.from(scope.querySelectorAll(selector));
      } catch (e) {
        return [];
      }
    },

    setReason(el, reason) {
      if (!el || !reason) return;
      el.dataset.rtstReason = reason.startsWith('скрыто') || reason.startsWith('мусор')
        ? reason
        : `скрыто, ${reason}`;
    },

    mark(el, {
      className = '',
      dataKey = '',
      reason = '',
      count = false,
      force = false
    } = {}) {
      if (!el || isRtstUiElement(el) || isProtectedHeader(el)) return false;
      if (!force && isDangerousHideTarget(el)) return false;

      if (dataKey && el.dataset[dataKey] === '1') return false;
      if (dataKey) el.dataset[dataKey] = '1';
      if (reason) this.setReason(el, reason);
      if (className) el.classList.add(className);
      if (count) hiddenCount += 1;
      return true;
    },

    applyHiddenMode(el) {
      if (!el) return;
      if (settings.showHidden) {
        el.classList.remove('rtst-hidden');
        el.classList.add('rtst-dim');
      } else {
        el.classList.remove('rtst-dim');
        el.classList.add('rtst-hidden');
      }
    }
  };

  function installPlayOptionsAdvertStripper() {
    const PATCHER_KEY = '__rtstPlayOptionsAdvertStripperV137';
    if (window[PATCHER_KEY]) return;
    window[PATCHER_KEY] = true;

    window.__rtstPlayOptionsStats = window.__rtstPlayOptionsStats || {
      seen: 0,
      patched: 0,
      errors: 0,
      lastSeenAt: null,
      lastPatchedAt: null
    };
    window.__rtstPlayOptionsHistory = Array.isArray(window.__rtstPlayOptionsHistory) ? window.__rtstPlayOptionsHistory : [];
    window.__rtstLastPlayOptionsSummary = window.__rtstLastPlayOptionsSummary || null;
    window.__rtstAdRequestStats = window.__rtstAdRequestStats || {
      total: 0,
      banner: 0,
      ssp: 0,
      yandexAdsSdk: 0,
      adfox: 0,
      rutubeAdApi: 0,
      bannerRules: 0,
      goyaBanner: 0,
      safeModeBanner: 0,
      otherAd: 0,
      blockedBanner: 0,
      lastSeenAt: null,
      lastUrls: []
    };

    const nativeFetch = window.fetch;
    const NativeXHR = window.XMLHttpRequest;

    function isStripEnabled() {
      try {
        return Boolean(settings && settings.enabled && settings.stripPlayerAds !== false);
      } catch (e) {
        return true;
      }
    }

    function getRequestUrl(input) {
      try {
        if (typeof input === 'string') return input;
        if (input instanceof URL) return input.href;
        if (input && typeof input.url === 'string') return input.url;
      } catch (e) {}
      return '';
    }

    function isPlayOptionsUrl(url) {
      try {
        const u = new URL(url, location.href);
        return /(^|\.)rutube\.ru$/i.test(u.hostname) && u.pathname.includes('/api/play/options');
      } catch (e) {
        return false;
      }
    }

    function classifyAdRequest(url) {
      if (!url) return null;

      try {
        const u = new URL(url, location.href);
        const host = u.hostname.toLowerCase();
        const path = u.pathname.toLowerCase();
        const full = u.href.toLowerCase();

        if (host === 'a.rutube.ru' && path.includes('/api/v1/ad/banner')) return 'banner';
        if (host === 'ac.rutube.ru' && path.includes('/api/v1/banner_rules')) return 'bannerRules';
        if (host === 'goya.rutube.ru' && path.includes('/v2/banner')) return 'goyaBanner';
        if (host === 'static.rtbcdn.ru' && path.includes('/static/img/safe-mode/')) return 'safeModeBanner';
        if (host === 'ssp.rutube.ru') return 'ssp';
        if ((host === 'yandex.ru' || host.endsWith('.yandex.ru')) && path.includes('/ads/system/adsdk')) return 'yandexAdsSdk';
        if (host.includes('adfox') || full.includes('adfox')) return 'adfox';
        if (host.endsWith('rutube.ru') && /\/api\/v\d+\/ad(\/|$)/i.test(path)) return 'rutubeAdApi';
        if (/(^|[./_-])(ads?|advert|banner|preroll|vast|ssp)([./_-]|$)/i.test(full)) return 'otherAd';
      } catch (e) {}

      return null;
    }

    function registerAdRequest(url, source = 'unknown') {
      const type = classifyAdRequest(url);
      if (!type) return;

      try {
        const u = new URL(url, location.href);
        const stats = window.__rtstAdRequestStats || (window.__rtstAdRequestStats = {
          total: 0,
          banner: 0,
          ssp: 0,
          yandexAdsSdk: 0,
          adfox: 0,
          rutubeAdApi: 0,
          bannerRules: 0,
          goyaBanner: 0,
          safeModeBanner: 0,
          otherAd: 0,
          blockedBanner: 0,
          lastSeenAt: null,
          lastUrls: []
        });

        stats.total += 1;
        stats[type] = Number(stats[type] || 0) + 1;
        stats.lastSeenAt = new Date().toISOString();

        const item = {
          at: stats.lastSeenAt,
          type,
          source,
          url: u.href
        };

        stats.lastUrls.unshift(item);
        stats.lastUrls = stats.lastUrls.slice(0, 16);
      } catch (e) {}
    }

    function isChromeCleanupEnabled() {
      try {
        return Boolean(settings && settings.enabled && (settings.cleanRutubeChrome || settings.hideSideMenuPolitics));
      } catch (e) {
        return true;
      }
    }

    function shouldSuppressShowcaseBannerRequest(url) {
      if (!isChromeCleanupEnabled()) return false;

      try {
        const u = new URL(url, location.href);
        const host = u.hostname.toLowerCase();
        const path = u.pathname.toLowerCase();
        const bannerType = String(u.searchParams.get('banner_type') || '').toLowerCase();
        const videoId = String(u.searchParams.get('video_id') || '');

        if (host === 'ac.rutube.ru' && path.includes('/api/v1/banner_rules')) return true;
        if (host === 'a.rutube.ru' && path.includes('/api/v1/ad/banner') && bannerType === 'html' && !videoId) return true;

        return false;
      } catch (e) {
        return false;
      }
    }

    function registerSuppressedBannerRequest(url, source = 'fetch-block') {
      try {
        const stats = window.__rtstAdRequestStats;
        if (!stats) return;

        stats.total += 1;
        stats.blockedBanner = Number(stats.blockedBanner || 0) + 1;
        stats.lastSeenAt = new Date().toISOString();

        const u = new URL(url, location.href);
        stats.lastUrls.unshift({
          at: stats.lastSeenAt,
          type: 'blockedBanner',
          source,
          url: u.href
        });
        stats.lastUrls = stats.lastUrls.slice(0, 16);
      } catch (e) {}
    }

    function emptyShowcaseBannerResponse(url) {
      let body = '';
      let contentType = 'text/html; charset=utf-8';

      try {
        const u = new URL(url, location.href);
        const host = u.hostname.toLowerCase();
        const path = u.pathname.toLowerCase();

        if (host === 'ac.rutube.ru' && path.includes('/api/v1/banner_rules')) {
          contentType = 'application/json; charset=utf-8';
          body = JSON.stringify({
            result: [],
            results: [],
            data: [],
            rules: [],
            banners: [],
            items: []
          });
        }
      } catch (e) {}

      const headers = new Headers();
      headers.set('content-type', contentType);
      headers.set('cache-control', 'no-store');

      const response = new Response(body, {
        status: 200,
        statusText: 'OK',
        headers
      });

      try {
        Object.defineProperty(response, 'url', { value: String(url || ''), configurable: true });
        Object.defineProperty(response, 'redirected', { value: false, configurable: true });
      } catch (e) {}

      return response;
    }

    function installAdRequestDiagnosticsObserver() {
      const KEY = '__rtstAdRequestDiagnosticsObserverV1312';
      if (window[KEY]) return;
      window[KEY] = true;

      try {
        if (performance && typeof performance.getEntriesByType === 'function') {
          performance.getEntriesByType('resource').forEach((entry) => {
            if (entry && entry.name) registerAdRequest(entry.name, 'performance-existing');
          });
        }
      } catch (e) {}

      try {
        if (typeof PerformanceObserver === 'function') {
          const observer = new PerformanceObserver((list) => {
            try {
              list.getEntries().forEach((entry) => {
                if (entry && entry.name) registerAdRequest(entry.name, 'performance');
              });
            } catch (e) {}
          });

          observer.observe({ entryTypes: ['resource'] });
        }
      } catch (e) {}
    }

    function getPlayOptionsVideoId(url) {
      try {
        const u = new URL(url, location.href);
        const match = u.pathname.match(/\/api\/play\/options\/([^/?#]+)/i);
        return match ? decodeURIComponent(match[1]) : '';
      } catch (e) {
        return '';
      }
    }

    function getRutubePageVideoInfo() {
      try {
        const u = new URL(location.href);
        const match = u.pathname.match(/\/video\/(private\/)?([a-z0-9_:-]+)/i);
        const queryKeys = [...u.searchParams.keys()].sort();

        return {
          url: u.href,
          pageType: match ? 'video' : currentRutubePageType(),
          videoId: match ? match[2] : '',
          isPrivate: Boolean(match && match[1]),
          queryKeys
        };
      } catch (e) {
        return {
          url: location.href,
          pageType: currentRutubePageType(),
          videoId: '',
          isPrivate: false,
          queryKeys: []
        };
      }
    }

    function hasOwn(obj, key) {
      return Boolean(obj && typeof obj === 'object' && Object.prototype.hasOwnProperty.call(obj, key));
    }

    function pickVideoBalancer(payload) {
      if (!payload || typeof payload !== 'object') return null;
      if (payload.video_balancer && typeof payload.video_balancer === 'object') return payload.video_balancer;
      if (payload.video && payload.video.video_balancer && typeof payload.video.video_balancer === 'object') return payload.video.video_balancer;
      return null;
    }

    function summarizePlayOptions(url, originalPayload, patchedPayload, changed) {
      const source = (patchedPayload && typeof patchedPayload === 'object') ? patchedPayload : originalPayload;
      const originalVideo = originalPayload && originalPayload.video && typeof originalPayload.video === 'object' ? originalPayload.video : null;
      const sourceVideo = source && source.video && typeof source.video === 'object' ? source.video : null;
      const balancer = pickVideoBalancer(source);
      const originalBalancer = pickVideoBalancer(originalPayload);
      let apiUrl = null;

      try { apiUrl = new URL(url, location.href); } catch (e) {}

      const summary = {
        capturedAt: new Date().toISOString(),
        source: 'api/play/options',
        requestUrl: apiUrl ? apiUrl.href : String(url || ''),
        apiVideoId: getPlayOptionsVideoId(url),
        page: getRutubePageVideoInfo(),
        title: String((source && source.title) || (sourceVideo && sourceVideo.title) || ''),
        hasVideoBalancer: Boolean(balancer),
        hasM3u8: Boolean(balancer && typeof balancer.m3u8 === 'string' && balancer.m3u8),
        hasOriginalM3u8: Boolean(originalBalancer && typeof originalBalancer.m3u8 === 'string' && originalBalancer.m3u8),
        m3u8Host: '',
        advertBefore: Boolean(hasOwn(originalPayload, 'advert') || (originalVideo && hasOwn(originalVideo, 'advert'))),
        advertAfter: Boolean(hasOwn(source, 'advert') || (sourceVideo && hasOwn(sourceVideo, 'advert'))),
        adBreaksBefore: Boolean(originalVideo && Array.isArray(originalVideo.ad_breaks) && originalVideo.ad_breaks.length),
        adBreaksAfter: Boolean(sourceVideo && Array.isArray(sourceVideo.ad_breaks) && sourceVideo.ad_breaks.length),
        patched: Boolean(changed),
        query: apiUrl ? {
          no_404: apiUrl.searchParams.get('no_404'),
          hasReferer: apiUrl.searchParams.has('referer'),
          keys: [...apiUrl.searchParams.keys()].sort()
        } : { no_404: null, hasReferer: false, keys: [] }
      };

      try {
        if (balancer && balancer.m3u8) summary.m3u8Host = new URL(balancer.m3u8, location.href).hostname;
      } catch (e) {}

      try {
        window.__rtstLastPlayOptionsSummary = summary;
        window.__rtstPlayOptionsHistory.unshift(summary);
        window.__rtstPlayOptionsHistory = window.__rtstPlayOptionsHistory.slice(0, 8);
      } catch (e) {}

      return summary;
    }

    function getCurrentHtmlVideoSummary() {
      const video = document.querySelector('video');
      if (!video) return null;

      let src = '';
      try { src = video.currentSrc || video.src || ''; } catch (e) {}

      return {
        present: true,
        currentTime: Number(video.currentTime) || 0,
        duration: Number(video.duration) || 0,
        volume: Number(video.volume),
        muted: Boolean(video.muted),
        playbackRate: Number(video.playbackRate) || 1,
        paused: Boolean(video.paused),
        readyState: Number(video.readyState),
        srcHost: (() => {
          try { return src ? new URL(src, location.href).hostname : ''; } catch (e) { return ''; }
        })()
      };
    }

    window.__rtstGetPlayerDiagnostics = function rtstGetPlayerDiagnostics() {
      return {
        app: 'Рутубочист',
        version: UI_VERSION,
        page: getRutubePageVideoInfo(),
        playOptionsStats: { ...(window.__rtstPlayOptionsStats || {}) },
        adRequests: { ...(window.__rtstAdRequestStats || {}) },
        lastPlayOptions: window.__rtstLastPlayOptionsSummary || null,
        playOptionsHistory: Array.isArray(window.__rtstPlayOptionsHistory) ? window.__rtstPlayOptionsHistory.slice(0, 8) : [],
        video: getCurrentHtmlVideoSummary(),
        backgroundModePopup: {
          present: Boolean(document.querySelector('[class*="background-view-popup-module__" i], a[href*="/promo/turnoffad/" i], a[href*="turnoffad" i]')),
          hidden: Boolean(document.querySelector('[data-rtst-background-mode-hidden="1"]'))
        },
        searchCleanup: {
          isSearchPage: isSearchPage(),
          shortsTabsHidden: document.querySelectorAll('[data-rtst-search-shorts-tab="1"]').length,
          searchTrashCards: document.querySelectorAll('[data-rtst-search-trash="1"]').length,
          showcaseBannerScanSkipped: isSearchPage()
        },
        viewHistory: {
          count: Object.keys(loadViewHistory()).length,
          key: VIEW_HISTORY_KEY
        },
        settings: {
          enabled: Boolean(settings && settings.enabled),
          stripPlayerAds: Boolean(settings && settings.stripPlayerAds !== false),
          swipeVideoVolume: Boolean(settings && settings.swipeVideoVolume !== false),
          autoFullscreenOnRotate: Boolean(settings && settings.autoFullscreenOnRotate),
          hideVpnPopup: Boolean(settings && settings.hideVpnPopup !== false),
          dimSearchTrash: Boolean(settings && settings.dimSearchTrash !== false),
          markWatchedVideos: Boolean(settings && settings.markWatchedVideos !== false),
          cleanWatchPage: Boolean(settings && settings.cleanWatchPage),
          disableAutoplay: Boolean(settings && settings.disableAutoplay)
        },
        fullscreen: typeof window.__rtstFullscreenDebug === 'function' ? window.__rtstFullscreenDebug() : null
      };
    };

    function stripAdvertPayload(payload) {
      if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return { payload, changed: false };
      }

      let changed = false;
      const out = { ...payload };

      if (Object.prototype.hasOwnProperty.call(out, 'advert')) {
        delete out.advert;
        changed = true;
      }

      if (out.video && typeof out.video === 'object' && !Array.isArray(out.video)) {
        const video = { ...out.video };

        if (Object.prototype.hasOwnProperty.call(video, 'advert')) {
          delete video.advert;
          changed = true;
        }

        if (Object.prototype.hasOwnProperty.call(video, 'ad_breaks')) {
          video.ad_breaks = [];
          changed = true;
        }

        out.video = video;
      }

      return { payload: out, changed };
    }

    function markSeen() {
      try {
        window.__rtstPlayOptionsStats.seen += 1;
        window.__rtstPlayOptionsStats.lastSeenAt = new Date().toISOString();
      } catch (e) {}
    }

    function markPatched() {
      try {
        window.__rtstPlayOptionsStats.patched += 1;
        window.__rtstPlayOptionsStats.lastPatchedAt = new Date().toISOString();
      } catch (e) {}
    }

    function markError() {
      try { window.__rtstPlayOptionsStats.errors += 1; } catch (e) {}
    }

    installAdRequestDiagnosticsObserver();

    if (typeof nativeFetch === 'function' && !nativeFetch.__rtstPlayOptionsPatched) {
      const patchedFetch = async function rtstPlayOptionsFetchPatch(input, init) {
        const url = getRequestUrl(input);
        registerAdRequest(url, 'fetch');

        if (shouldSuppressShowcaseBannerRequest(url)) {
          registerSuppressedBannerRequest(url, 'fetch-block');
          return emptyShowcaseBannerResponse(url);
        }

        const response = await nativeFetch.apply(this, arguments);

        if (!isStripEnabled() || !isPlayOptionsUrl(url)) return response;
        markSeen();

        try {
          const text = await response.clone().text();
          if (!text) return response;

          const originalPayload = JSON.parse(text);
          const patched = stripAdvertPayload(originalPayload);
          summarizePlayOptions(url, originalPayload, patched.payload, patched.changed);
          if (!patched.changed) return response;

          const headers = new Headers(response.headers);
          headers.delete('content-length');
          headers.delete('content-encoding');
          headers.set('content-type', 'application/json; charset=utf-8');

          const patchedResponse = new Response(JSON.stringify(patched.payload), {
            status: response.status,
            statusText: response.statusText,
            headers
          });

          try {
            Object.defineProperty(patchedResponse, 'url', { value: response.url, configurable: true });
            Object.defineProperty(patchedResponse, 'redirected', { value: response.redirected, configurable: true });
          } catch (e) {}

          markPatched();
          return patchedResponse;
        } catch (e) {
          markError();
          return response;
        }
      };

      patchedFetch.__rtstPlayOptionsPatched = true;
      patchedFetch.__rtstOriginal = nativeFetch;
      window.fetch = patchedFetch;
    }

    if (typeof NativeXHR === 'function' && NativeXHR.prototype && !NativeXHR.prototype.__rtstPlayOptionsPatched) {
      const nativeOpen = NativeXHR.prototype.open;
      const nativeSend = NativeXHR.prototype.send;

      NativeXHR.prototype.open = function rtstPlayOptionsOpen(method, url) {
        try {
          this.__rtstPlayOptionsUrl = getRequestUrl(url);
          registerAdRequest(this.__rtstPlayOptionsUrl, 'xhr');
        } catch (e) {
          this.__rtstPlayOptionsUrl = '';
        }
        return nativeOpen.apply(this, arguments);
      };

      NativeXHR.prototype.send = function rtstPlayOptionsSend() {
        const xhr = this;
        let patchedOnce = false;

        function tryPatchXhrResponse() {
          if (patchedOnce || !isStripEnabled() || !isPlayOptionsUrl(xhr.__rtstPlayOptionsUrl || '')) return;
          markSeen();

          try {
            let source;

            if (xhr.responseType === 'json' && xhr.response && typeof xhr.response === 'object') {
              source = xhr.response;
            } else if (!xhr.responseType || xhr.responseType === 'text') {
              source = JSON.parse(String(xhr.responseText || ''));
            } else {
              return;
            }

            const patched = stripAdvertPayload(source);
            summarizePlayOptions(xhr.__rtstPlayOptionsUrl || '', source, patched.payload, patched.changed);
            if (!patched.changed) return;

            const body = JSON.stringify(patched.payload);
            patchedOnce = true;

            try {
              Object.defineProperty(xhr, 'responseText', {
                configurable: true,
                get: () => body
              });
            } catch (e) {}

            try {
              Object.defineProperty(xhr, 'response', {
                configurable: true,
                get: () => xhr.responseType === 'json' ? patched.payload : body
              });
            } catch (e) {}

            markPatched();
          } catch (e) {
            markError();
          }
        }

        try {
          xhr.addEventListener('readystatechange', () => {
            if (xhr.readyState === 4) tryPatchXhrResponse();
          }, true);
          xhr.addEventListener('load', tryPatchXhrResponse, true);
        } catch (e) {}

        return nativeSend.apply(xhr, arguments);
      };

      NativeXHR.prototype.__rtstPlayOptionsPatched = true;
    }
  }


  function installVpnPopupSuppressor() {
    const PATCHER_KEY = '__rtstVpnPopupSuppressorV141';

    function isVpnPopupSuppressionEnabled() {
      try {
        return Boolean(settings && settings.enabled && settings.hideVpnPopup !== false);
      } catch (e) {
        return true;
      }
    }

    function disableVpnDetectionEnv(env) {
      if (!env || typeof env !== 'object') return env;
      try { env.VPN_DETECTION_ENABLED = 'false'; } catch (e) {}
      try { env.VPN_DETECTION_BLOCK_ON_ERROR = 'false'; } catch (e) {}
      try { env.RTST_VPN_DETECTION_DISABLED = true; } catch (e) {}
      return env;
    }

    function patchEnv() {
      try {
        if (window.__env__ && typeof window.__env__ === 'object') {
          disableVpnDetectionEnv(window.__env__);
          return;
        }
      } catch (e) {}

      try {
        const descriptor = Object.getOwnPropertyDescriptor(window, '__env__');
        if (descriptor && descriptor.configurable === false) return;

        let envValue;
        Object.defineProperty(window, '__env__', {
          configurable: true,
          enumerable: true,
          get() {
            return envValue;
          },
          set(value) {
            envValue = disableVpnDetectionEnv(value);
          }
        });
      } catch (e) {}
    }

    function looksLikeVpnPopup(el) {
      if (!el || isRtstUiElement(el)) return false;

      try {
        const raw = normalize([
          el.getAttribute && el.getAttribute('aria-label'),
          el.getAttribute && el.getAttribute('title'),
          el.getAttribute && el.getAttribute('role'),
          el.className,
          el.id,
          el.textContent
        ].join(' '));

        if (!/(vpn|прокси|proxy|впн)/i.test(raw)) return false;
        if (/(добавить|канал|комментар|рекомендац|поиск|rtst|рутубочист)/i.test(raw)) return false;

        const role = normalize(el.getAttribute && el.getAttribute('role') || '');
        const cls = normalize(String(el.className || ''));
        const id = normalize(String(el.id || ''));
        const popupLike = role === 'dialog' || /(modal|popup|dialog|overlay|vpn|proxy|detect)/i.test(`${cls} ${id}`);
        if (!popupLike) return false;

        const r = el.getBoundingClientRect ? el.getBoundingClientRect() : null;
        if (r && r.width < 120 && r.height < 80) return false;

        return true;
      } catch (e) {
        return false;
      }
    }

    function removeVpnPopup(root = document) {
      if (!isVpnPopupSuppressionEnabled()) return;
      patchEnv();

      const scope = root && root.querySelectorAll ? root : document;
      const selector = [
        '[role="dialog"]',
        '[class*="vpn" i]',
        '[id*="vpn" i]',
        '[class*="proxy" i]',
        '[id*="proxy" i]',
        '[class*="detect" i]',
        '[class*="modal" i]',
        '[class*="popup" i]'
      ].join(',');

      try {
        const candidates = [];
        if (looksLikeVpnPopup(scope)) candidates.push(scope);
        scope.querySelectorAll(selector).forEach((el) => {
          if (looksLikeVpnPopup(el)) candidates.push(el);
        });

        candidates.forEach((el) => {
          const target = el.closest && el.closest('[role="dialog"], [class*="modal" i], [class*="popup" i], [class*="overlay" i]') || el;
          if (!target || target === document.documentElement || target === document.body || isRtstUiElement(target)) return;
          try { target.dataset.rtstVpnPopupHidden = '1'; } catch (e) {}
          try { target.remove(); } catch (e) { try { target.classList.add('rtst-player-ad-hidden'); } catch (e2) {} }
        });
      } catch (e) {}
    }

    if (!isVpnPopupSuppressionEnabled()) return;

    patchEnv();

    if (window[PATCHER_KEY]) {
      removeVpnPopup(document);
      return;
    }
    window[PATCHER_KEY] = true;

    const startObserver = () => {
      const root = document.body || document.documentElement;
      if (!root || typeof MutationObserver !== 'function') {
        setTimeout(() => removeVpnPopup(document), 600);
        return;
      }

      const observer = new MutationObserver((mutations) => {
        if (!isVpnPopupSuppressionEnabled()) return;
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes || []) {
            if (node && node.nodeType === 1) removeVpnPopup(node);
          }
        }
      });

      observer.observe(root, { childList: true, subtree: true });
      removeVpnPopup(document);
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', startObserver, { once: true });
      setTimeout(() => removeVpnPopup(document), 900);
    } else {
      startObserver();
    }
  }


  function installRutubeContextMenuUnlocker() {
    const PATCHER_KEY = '__rtstContextMenuUnlockerV137';
    if (window[PATCHER_KEY]) return;
    window[PATCHER_KEY] = true;

    function isUnlockEnabled() {
      try {
        return Boolean(settings && settings.enabled && settings.unlockContextMenu !== false);
      } catch (e) {
        return true;
      }
    }

    function unlockElement(el) {
      if (!el || !el.removeAttribute) return;
      try {
        el.removeAttribute('oncontextmenu');
        if (el.oncontextmenu) el.oncontextmenu = null;
      } catch (e) {}
    }

    function unlockKnownTargets(root = document) {
      if (!isUnlockEnabled()) return;
      unlockElement(document.documentElement);
      unlockElement(document.body);
      const scope = root && root.querySelectorAll ? root : document;
      try {
        scope.querySelectorAll('video, [oncontextmenu], [class*="player" i], [data-testid*="player" i]').forEach(unlockElement);
      } catch (e) {}
    }

    function releaseContextMenu(event) {
      if (!isUnlockEnabled()) return;
      const target = event.target;
      if (!target) return;
      const isRutubePlayerArea = Boolean(
        target.closest && target.closest('video, [class*="wdp-player"], [class*="video-player"], [class*="VideoPlayer"], [id*="player"], [data-testid*="player" i]')
      );
      if (!isRutubePlayerArea) return;

      try { unlockKnownTargets(target.closest('[class*="player" i], [data-testid*="player" i]') || document); } catch (e) {}
      event.stopImmediatePropagation();
    }

    document.addEventListener('contextmenu', releaseContextMenu, true);
    document.addEventListener('mousedown', (event) => {
      if (event && event.button === 2) releaseContextMenu(event);
    }, true);

    const run = () => unlockKnownTargets(document);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
    else run();

    setInterval(run, 3000);
  }


  function installAutoFullscreenOnRotate() {
    const PATCHER_KEY = '__rtstAutoFullscreenOnRotateV1324';
    if (window[PATCHER_KEY]) return;
    window[PATCHER_KEY] = true;

    let autoFullscreenLockUntil = 0;
    let openedByRtst = false;
    let lastAttemptAt = 0;
    let lastToastAt = 0;
    let rotateClickLockUntil = 0;
    let landscapeSessionId = 0;
    let clickedInLandscapeSession = false;
    let lastLandscapeState = false;
    let lastDebug = { at: null, reason: 'never', candidates: [], exactButton: null, clicked: null, requestTarget: null, fullscreen: false };

    function isAutoFullscreenEnabled() {
      try {
        return Boolean(settings && settings.enabled && settings.autoFullscreenOnRotate);
      } catch (e) {
        return false;
      }
    }

    function isMobileAutoFullscreenContext() {
      try {
        const coarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
        const noHover = window.matchMedia && window.matchMedia('(hover: none)').matches;
        const touchCapable = 'ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
        const w = window.innerWidth || document.documentElement.clientWidth || 0;
        const h = window.innerHeight || document.documentElement.clientHeight || 0;
        const maxSide = Math.max(w, h);
        return Boolean(touchCapable && coarsePointer && noHover && maxSide <= 1180);
      } catch (e) {
        return false;
      }
    }

    function isLandscapeViewport() {
      try {
        if (screen && screen.orientation && typeof screen.orientation.type === 'string') {
          if (screen.orientation.type.includes('landscape')) return true;
          if (screen.orientation.type.includes('portrait')) return false;
        }
      } catch (e) {}

      const w = window.innerWidth || document.documentElement.clientWidth || 0;
      const h = window.innerHeight || document.documentElement.clientHeight || 0;
      return w > h && w >= 520;
    }

    function fullscreenElement() {
      return document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement || null;
    }

    function fullscreenPlayerSelector() {
      return 'video, [class*="wdp-player"], [class*="video-player"], [class*="VideoPlayer"], [id*="player"], [data-testid*="player" i]';
    }

    function findFullscreenPlayerRootForVideo(video) {
      if (!video || !video.closest) return null;

      return video.closest(
        '[class*="wdp-player"], ' +
        '[class*="video-player"], ' +
        '[class*="VideoPlayer"], ' +
        '[id*="player"], ' +
        '[data-testid*="player" i]'
      ) || video.parentElement || null;
    }

    function nodeLabel(el) {
      if (!el) return '';
      try {
        const tag = (el.tagName || '').toLowerCase();
        const id = el.id ? `#${el.id}` : '';
        const cls = String(el.className || '').trim().split(/\s+/).slice(0, 4).filter(Boolean).map((name) => `.${name}`).join('');
        const aria = el.getAttribute && (el.getAttribute('aria-label') || el.getAttribute('title') || el.getAttribute('name') || '');
        return `${tag}${id}${cls}${aria ? ` [${aria}]` : ''}`.slice(0, 220);
      } catch (e) {
        return String(el);
      }
    }

    function isVisibleCandidate(el) {
      if (!el || isRtstUiElement(el)) return false;

      try {
        if (el.disabled || el.getAttribute('aria-disabled') === 'true') return false;
        const r = el.getBoundingClientRect();
        if (r.width < 8 || r.height < 8) return false;
        if (r.bottom < 0 || r.right < 0 || r.top > window.innerHeight || r.left > window.innerWidth) return false;
        const style = getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
      } catch (e) {}

      return true;
    }

    function findFullscreenVideo() {
      const videos = [...document.querySelectorAll('video')].filter((video) => {
        try {
          const r = video.getBoundingClientRect();
          const duration = Number(video.duration) || 0;
          return r.width > 120 && r.height > 80 && r.bottom > 0 && r.right > 0 && r.top < window.innerHeight && r.left < window.innerWidth && duration > 0;
        } catch (e) {
          return false;
        }
      });

      if (!videos.length) return null;

      videos.sort((a, b) => {
        try {
          const ar = a.getBoundingClientRect();
          const br = b.getBoundingClientRect();
          const aScore = (ar.width * ar.height) + (a.paused ? 0 : 1000000);
          const bScore = (br.width * br.height) + (b.paused ? 0 : 1000000);
          return bScore - aScore;
        } catch (e) {
          return 0;
        }
      });

      return videos[0];
    }

    function getFullscreenTarget(video) {
      if (!video) return null;

      const root = findFullscreenPlayerRootForVideo(video);
      if (root && root.requestFullscreen) return root;
      if (video.requestFullscreen) return video;
      if (root && root.webkitRequestFullscreen) return root;
      if (video.webkitRequestFullscreen) return video;

      return root || video;
    }

    function fullscreenCandidateScore(el) {
      if (!el || !isVisibleCandidate(el)) return -999;

      const raw = normalize([
        el.getAttribute && el.getAttribute('aria-label'),
        el.getAttribute && el.getAttribute('title'),
        el.getAttribute && el.getAttribute('name'),
        el.getAttribute && el.getAttribute('data-testid'),
        el.id,
        el.className,
        el.textContent
      ].join(' '));

      let score = 0;

      const testId = normalize(el.getAttribute && el.getAttribute('data-testid') || '');
      const aria = normalize(el.getAttribute && el.getAttribute('aria-label') || '');
      const icon = normalize(String(el.innerHTML || ''));

      if (testId === 'ui-fullscreen') score += 10000;
      if (aria.includes('перейти в полноэкранный режим')) score += 6000;
      if (icon.includes('icondsplayerfullscreenmaximize')) score += 3000;

      if (/(fullscreen|full-screen|full_screen|полный экран|полноэкран|развернуть|во весь экран|на весь экран|expand|maximize)/i.test(raw)) score += 100;
      if (/(exit|выйти|свернуть|minimize|collapse)/i.test(raw) || icon.includes('icondsplayerfullscreenminimize')) score -= 9000;
      if (/screen|экран/i.test(raw)) score += 20;
      if (/button|control|icon|player|wdp/i.test(raw)) score += 10;

      const tag = (el.tagName || '').toLowerCase();
      if (tag === 'button') score += 18;
      if (el.getAttribute && el.getAttribute('role') === 'button') score += 12;

      try {
        const r = el.getBoundingClientRect();
        const vw = Math.max(1, window.innerWidth || document.documentElement.clientWidth || 1);
        const vh = Math.max(1, window.innerHeight || document.documentElement.clientHeight || 1);

        if (r.width >= 20 && r.width <= 96 && r.height >= 20 && r.height <= 96) score += 18;
        if (r.right > vw * 0.55 && r.bottom > vh * 0.42) score += 12;
      } catch (e) {}

      return score;
    }

    function collectFullscreenButtonCandidates(video = findFullscreenVideo()) {
      const exact = findExactRutubeFullscreenButton(video);
      if (!exact) return [];

      return [{
        el: exact,
        score: 10000,
        label: nodeLabel(exact)
      }];
    }

    function findRutubeFullscreenButton(video = findFullscreenVideo()) {
      return findExactRutubeFullscreenButton(video);
    }

    function findExactRutubeFullscreenButton(video = findFullscreenVideo()) {
      const root = (video && findFullscreenPlayerRootForVideo(video)) || document;
      const selectors = [
        'button[data-testid="ui-fullscreen"][aria-label*="Перейти" i]',
        'button[data-testid="ui-fullscreen"]:not([aria-label*="Выйти" i]):not([aria-label*="Свернуть" i])'
      ];

      for (const selector of selectors) {
        try {
          const btn = root.querySelector(selector);
          if (btn && isVisibleCandidate(btn)) return btn;
        } catch (e) {}
      }

      // Последний безопасный запасной вариант: SVG maximize внутри кнопки,
      // но только если рядом нет признаков кнопки "следующее"/"далее".
      try {
        const buttons = [...root.querySelectorAll('button')];
        for (const btn of buttons) {
          const raw = normalize([
            btn.getAttribute('aria-label'),
            btn.getAttribute('title'),
            btn.getAttribute('data-testid'),
            btn.className,
            btn.innerHTML
          ].join(' '));

          if (!raw.includes('icondsplayerfullscreenmaximize')) continue;
          if (/(след|далее|next|skip|forward|series|episode|playlist|право|right)/i.test(raw)) continue;
          if (/(minimize|exit|выйти|свернуть)/i.test(raw)) continue;
          if (isVisibleCandidate(btn)) return btn;
        }
      } catch (e) {}

      return null;
    }

    function dispatchPointerMouseClick(el) {
      if (!el || !isVisibleCandidate(el)) return false;

      try {
        el.dispatchEvent(new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          composed: true,
          view: window
        }));
        return true;
      } catch (e) {}

      try {
        el.click();
        return true;
      } catch (e) {}

      return false;
    }

    function canTryFullscreen() {
      if (fullscreenElement()) return false;
      if (Date.now() < autoFullscreenLockUntil) return false;

      try {
        if (document.fullscreenEnabled === false && !document.webkitFullscreenEnabled) return false;
      } catch (e) {}

      return true;
    }

    async function requestRtstFullscreen(target) {
      if (!target) return false;

      try {
        if (target.requestFullscreen) {
          await target.requestFullscreen({ navigationUI: 'hide' });
          openedByRtst = true;
          return true;
        }
      } catch (e) {}

      try {
        if (target.webkitRequestFullscreen) {
          target.webkitRequestFullscreen();
          openedByRtst = true;
          return true;
        }
      } catch (e) {}

      return false;
    }

    function maybeToastAutoFullscreenBlocked() {
      const now = Date.now();
      if (now - lastToastAt < 10000) return;
      lastToastAt = now;
      toast('Fullscreen при повороте сработает после касания плеера.');
    }

    async function tryRutubeFullscreenButton(video, reason = 'unknown') {
      const exactBtn = findExactRutubeFullscreenButton(video);
      const candidates = collectFullscreenButtonCandidates(video);
      const btn = exactBtn;

      lastDebug = {
        at: new Date().toISOString(),
        reason,
        candidates: candidates.map((item) => ({ score: item.score, label: item.label })),
        exactButton: exactBtn ? nodeLabel(exactBtn) : null,
        clicked: btn ? nodeLabel(btn) : null,
        requestTarget: null,
        fullscreen: Boolean(fullscreenElement()),
        safeMode: 'exact-ui-fullscreen-only',
        landscapeSessionId
      };

      if (!btn) return false;
      if (Date.now() < rotateClickLockUntil) return false;
      if (clickedInLandscapeSession && reason !== 'settings' && reason !== 'manual') return false;

      rotateClickLockUntil = Date.now() + 3500;
      clickedInLandscapeSession = true;
      dispatchPointerMouseClick(btn);

      await new Promise((resolve) => setTimeout(resolve, 260));

      if (fullscreenElement()) {
        openedByRtst = true;
        lastDebug.fullscreen = true;
        return true;
      }

      return false;
    }

    async function maybeEnterFullscreen(reason = 'unknown') {
      if (!isAutoFullscreenEnabled() || !isMobileAutoFullscreenContext() || !isLandscapeViewport() || isEmbeddedRutubePlayer()) return;

      const now = Date.now();
      if (now - lastAttemptAt < 1100) return;
      lastAttemptAt = now;

      const video = findFullscreenVideo();
      if (!video) return;

      const clicked = await tryRutubeFullscreenButton(video, reason);
      if (clicked) return;

      if (!canTryFullscreen()) {
        maybeToastAutoFullscreenBlocked();
        return;
      }

      const target = getFullscreenTarget(video);
      lastDebug.requestTarget = nodeLabel(target);

      const ok = await requestRtstFullscreen(target);

      if (!ok) {
        autoFullscreenLockUntil = Date.now() + 2500;
        maybeToastAutoFullscreenBlocked();
      }
    }

    function maybeExitFullscreen() {
      if (!openedByRtst || isLandscapeViewport()) return;
      const fs = fullscreenElement();
      if (!fs) {
        openedByRtst = false;
        return;
      }

      try {
        if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      } catch (e) {}

      openedByRtst = false;
    }

    function checkRotation(reason = 'unknown') {
      if (!isAutoFullscreenEnabled() || !isMobileAutoFullscreenContext()) return;

      const landscape = isLandscapeViewport();
      if (landscape !== lastLandscapeState) {
        lastLandscapeState = landscape;
        if (landscape) {
          landscapeSessionId += 1;
          clickedInLandscapeSession = false;
          rotateClickLockUntil = 0;
        }
      }

      if (landscape) {
        setTimeout(() => { try { maybeEnterFullscreen(reason).catch(() => {}); } catch (e) {} }, 160);
      } else {
        clickedInLandscapeSession = false;
        setTimeout(maybeExitFullscreen, 160);
      }
    }

    window.__rtstMaybeAutoFullscreenOnRotate = checkRotation;
    window.__rtstFullscreenDebug = function rtstFullscreenDebug() {
      const video = findFullscreenVideo();
      const candidates = collectFullscreenButtonCandidates(video).map((item) => ({ score: item.score, label: item.label }));
      const debug = {
        app: 'Рутубочист',
        version: UI_VERSION,
        enabled: isAutoFullscreenEnabled(),
        mobileContext: isMobileAutoFullscreenContext(),
        landscape: isLandscapeViewport(),
        fullscreen: Boolean(fullscreenElement()),
        userActivation: (() => {
          try {
            return navigator.userActivation ? {
              isActive: navigator.userActivation.isActive,
              hasBeenActive: navigator.userActivation.hasBeenActive
            } : null;
          } catch (e) {
            return null;
          }
        })(),
        video: video ? nodeLabel(video) : null,
        playerRoot: video ? nodeLabel(findFullscreenPlayerRootForVideo(video)) : null,
        exactButton: video ? nodeLabel(findExactRutubeFullscreenButton(video)) : null,
        lastDebug,
        candidates
      };

      try { console.log('[Рутубочист] Fullscreen debug:', debug); } catch (e) {}
      return debug;
    };

    window.addEventListener('orientationchange', () => checkRotation('orientationchange'), true);
    window.addEventListener('resize', () => checkRotation('resize'), true);

    document.addEventListener('fullscreenchange', () => {
      if (!fullscreenElement()) openedByRtst = false;
      try { console.log('[Рутубочист] fullscreenchange', window.__rtstFullscreenDebug && window.__rtstFullscreenDebug()); } catch (e) {}
    }, true);
    document.addEventListener('webkitfullscreenchange', () => {
      if (!fullscreenElement()) openedByRtst = false;
      try { console.log('[Рутубочист] webkitfullscreenchange', window.__rtstFullscreenDebug && window.__rtstFullscreenDebug()); } catch (e) {}
    }, true);

    document.addEventListener('pointerup', () => checkRotation('pointerup'), true);
    document.addEventListener('touchend', () => checkRotation('touchend'), true);
    document.addEventListener('play', () => checkRotation('play'), true);

    setTimeout(() => checkRotation('boot'), 1200);
  }

  function maybeAutoFullscreenOnRotate(reason = 'manual') {
    try {
      if (typeof window.__rtstMaybeAutoFullscreenOnRotate === 'function') {
        window.__rtstMaybeAutoFullscreenOnRotate(reason);
      }
    } catch (e) {}
  }


  function installMobileVideoVolumeSwipe() {
    const PATCHER_KEY = '__rtstMobileVideoVolumeSwipeV136';
    const VOLUME_STORE_KEY = 'rtstVideoVolume:v1';
    if (window[PATCHER_KEY]) return;
    window[PATCHER_KEY] = true;

    const gesture = {
      active: false,
      pointerId: null,
      startX: 0,
      startY: 0,
      startVolume: 1,
      startRate: 1,
      startTime: 0,
      video: null,
      target: null,
      moved: false,
      source: 'none',
      rutubeCancelSent: false
    };

    let overlayTimer = null;
    let lastAppliedSavedVolume = null;
    let rutubeGestureLockUntil = 0;
    let lastGestureVideo = null;
    let lastGestureRate = 1;
    let clearGestureFlagTimer = null;
    let clearTouchFlagTimer = null;
    let syntheticCancelUntil = 0;

    const rutubeGestureOverlaySelector = [
      '[class*="info-layer-module__wrapper" i]',
      '[class*="x2" i]',
      '[class*="double-speed" i]',
      '[class*="playback-rate" i]',
      '[class*="speed" i]'
    ].join(',');

    function isSwipeVolumeEnabled() {
      try {
        return Boolean(settings && settings.enabled && settings.swipeVideoVolume !== false);
      } catch (e) {
        return true;
      }
    }

    function clampVolume(value) {
      return Math.max(0, Math.min(1, Number(value) || 0));
    }

    function readSavedVolume() {
      try {
        const raw = localStorage.getItem(VOLUME_STORE_KEY);
        if (raw == null || raw === '') return null;
        const value = Number(raw);
        if (!Number.isFinite(value)) return null;
        return clampVolume(value);
      } catch (e) {
        return null;
      }
    }

    function saveVolume(value) {
      try {
        localStorage.setItem(VOLUME_STORE_KEY, String(clampVolume(value)));
      } catch (e) {}
    }

    function isTouchLike(event) {
      return event && (
        event.pointerType === 'touch' ||
        event.type === 'touchstart' ||
        event.type === 'touchmove' ||
        event.type === 'touchend' ||
        event.type === 'touchcancel' ||
        (event.pointerType === '' && window.matchMedia && window.matchMedia('(hover: none)').matches)
      );
    }

    function eventPoint(event) {
      const touch = event && event.touches && event.touches[0];
      const changedTouch = event && event.changedTouches && event.changedTouches[0];
      const point = touch || changedTouch || event;
      return {
        x: Number(point && point.clientX) || 0,
        y: Number(point && point.clientY) || 0,
        id: Number(point && point.identifier != null ? point.identifier : (event && event.pointerId != null ? event.pointerId : 1))
      };
    }

    function playerSelector() {
      return 'video, [class*="wdp-player"], [class*="video-player"], [class*="VideoPlayer"], [id*="player"], [data-testid*="player" i]';
    }

    function findPlayerRootForVideo(video) {
      if (!video || !video.closest) return null;
      return video.closest('[class*="wdp-player"], [class*="video-player"], [class*="VideoPlayer"], [id*="player"], [data-testid*="player" i]') || video.parentElement;
    }

    function findVideoForGesture(target) {
      if (!target) return null;

      const player = target.closest && target.closest(playerSelector());

      if (player) {
        if (player.tagName && player.tagName.toLowerCase() === 'video') return player;
        const localVideo = player.querySelector && player.querySelector('video');
        if (localVideo) return localVideo;
      }

      const videos = [...document.querySelectorAll('video')].filter((video) => {
        try {
          const r = video.getBoundingClientRect();
          return r.width > 80 && r.height > 60 && r.bottom >= 0 && r.right >= 0 && r.top <= window.innerHeight && r.left <= window.innerWidth;
        } catch (e) {
          return false;
        }
      });

      if (!videos.length) return null;

      videos.sort((a, b) => {
        const ar = a.getBoundingClientRect();
        const br = b.getBoundingClientRect();
        return (br.width * br.height) - (ar.width * ar.height);
      });

      return videos[0];
    }

    function isPointOnVisibleVideoOrPlayer(point, video) {
      if (!video) return true;

      try {
        const player = findPlayerRootForVideo(video) || video;
        const r = player.getBoundingClientRect();
        const w = Math.max(1, window.innerWidth || document.documentElement.clientWidth || 1);
        const h = Math.max(1, window.innerHeight || document.documentElement.clientHeight || 1);

        if (r.width >= w * 0.62 && r.height >= h * 0.42) return true;

        return point.x >= r.left - 10 && point.x <= r.right + 10 && point.y >= r.top - 10 && point.y <= r.bottom + 10;
      } catch (e) {
        return true;
      }
    }

    function isLandscapeOrFullscreen(video) {
      if (document.fullscreenElement || document.webkitFullscreenElement) return true;
      if (window.matchMedia && window.matchMedia('(orientation: landscape)').matches) return true;

      try {
        const r = video.getBoundingClientRect();
        const vw = Math.max(1, window.innerWidth || document.documentElement.clientWidth || 1);
        const vh = Math.max(1, window.innerHeight || document.documentElement.clientHeight || 1);
        return r.width >= vw * 0.62 && r.height >= vh * 0.32;
      } catch (e) {
        return false;
      }
    }

    function isPointInsideRect(point, rect, pad = 0) {
      if (!point || !rect) return false;
      return (
        point.x >= rect.left - pad &&
        point.x <= rect.right + pad &&
        point.y >= rect.top - pad &&
        point.y <= rect.bottom + pad
      );
    }

    function isPointInVolumeSwipeZone(point, video, target) {
      if (!point || !video) return false;

      const gradientSelector = '[class*="controls-gradient-module__gradient" i], [class*="controls-gradient" i]';
      const player = findPlayerRootForVideo(video) || video;

      // Основная зона для свайпа громкости: нижний градиент панели управления RUTUBE.
      // Это нижняя треть горизонтального/fullscreen-плеера, где свайп меньше конфликтует
      // со штатным двойным тапом по краям для перемотки ±10 секунд.
      try {
        if (target && target.closest && target.closest(gradientSelector)) return true;
      } catch (e) {}

      try {
        const scope = player && player.querySelectorAll ? player : document;
        const gradients = [...scope.querySelectorAll(gradientSelector)].filter((el) => {
          if (!el || !el.getBoundingClientRect) return false;
          const r = el.getBoundingClientRect();
          if (r.width < 80 || r.height < 12) return false;
          if (r.bottom < 0 || r.right < 0 || r.top > window.innerHeight || r.left > window.innerWidth) return false;
          return isPointInsideRect(point, r, 18);
        });
        if (gradients.length) return true;
      } catch (e) {}

      try {
        const r = (player && player.getBoundingClientRect ? player : video).getBoundingClientRect();
        const visibleWidth = Math.max(1, Math.min(r.right, window.innerWidth || document.documentElement.clientWidth || r.right) - Math.max(r.left, 0));
        const visibleHeight = Math.max(1, Math.min(r.bottom, window.innerHeight || document.documentElement.clientHeight || r.bottom) - Math.max(r.top, 0));
        const looksLikePlayer = r.width > 120 && r.height > 80 && visibleWidth > 80 && visibleHeight > 60;
        if (!looksLikePlayer) return false;

        const zoneTop = r.top + r.height * 0.64;
        return (
          point.x >= r.left - 12 &&
          point.x <= r.right + 12 &&
          point.y >= zoneTop &&
          point.y <= r.bottom + 18
        );
      } catch (e) {
        return false;
      }
    }

    function isInteractiveTarget(target, video) {
      if (!target || !target.closest) return false;
      if (target.closest('#rtst-panel, .rtst-modal-backdrop, input, textarea, select')) return true;

      const link = target.closest('a[href]');
      if (link && (!video || !link.closest(playerSelector()))) return true;

      return false;
    }

    function targetBelongsToActivePlayer(target) {
      if (!target || !target.closest) return true;
      if (!lastGestureVideo && !gesture.video) return false;
      const video = gesture.video || lastGestureVideo;
      const player = findPlayerRootForVideo(video);
      return Boolean(
        target === video ||
        (player && (target === player || player.contains(target))) ||
        target.closest(playerSelector())
      );
    }

    function setVolumeTouchFlag(on) {
      const root = document.documentElement;
      if (!root) return;

      if (clearTouchFlagTimer) clearTimeout(clearTouchFlagTimer);

      if (on) {
        root.dataset.rtstVolumeTouch = '1';
        return;
      }

      clearTouchFlagTimer = setTimeout(() => {
        if (!gesture.active && !isRutubeGestureLocked()) {
          delete root.dataset.rtstVolumeTouch;
        }
      }, 180);
    }

    function setVolumeGestureFlag(on) {
      const root = document.documentElement;
      if (!root) return;

      if (on) {
        root.dataset.rtstVolumeGesture = '1';
        if (clearGestureFlagTimer) clearTimeout(clearGestureFlagTimer);
      } else {
        if (clearGestureFlagTimer) clearTimeout(clearGestureFlagTimer);
        clearGestureFlagTimer = setTimeout(() => {
          if (Date.now() >= rutubeGestureLockUntil) {
            delete root.dataset.rtstVolumeGesture;
          }
        }, 80);
      }
    }

    function lockRutubeGestures(ms = 950) {
      rutubeGestureLockUntil = Math.max(rutubeGestureLockUntil, Date.now() + ms);
      setVolumeGestureFlag(true);
      hideRutubeGestureOverlays(document);

      if (clearGestureFlagTimer) clearTimeout(clearGestureFlagTimer);
      clearGestureFlagTimer = setTimeout(() => {
        if (Date.now() >= rutubeGestureLockUntil) {
          delete document.documentElement.dataset.rtstVolumeGesture;
        }
      }, ms + 80);
    }

    function isRutubeGestureLocked() {
      return Date.now() < rutubeGestureLockUntil;
    }

    function markSyntheticCancelEvent(event) {
      try {
        Object.defineProperty(event, '__rtstSyntheticVolumeCancel', {
          value: true,
          configurable: true
        });
      } catch (e) {
        try { event.__rtstSyntheticVolumeCancel = true; } catch (e2) {}
      }

      return event;
    }

    function isRtstSyntheticCancel(event) {
      return Boolean(
        event &&
        event.__rtstSyntheticVolumeCancel &&
        Date.now() < syntheticCancelUntil
      );
    }

    function createSyntheticCancelEvent(type, point) {
      const options = {
        bubbles: true,
        cancelable: true,
        composed: true
      };

      if (type === 'pointercancel') {
        try {
          return markSyntheticCancelEvent(new PointerEvent('pointercancel', {
            ...options,
            pointerId: gesture.pointerId || (point && point.id) || 1,
            pointerType: 'touch',
            isPrimary: true,
            clientX: point ? point.x : gesture.startX,
            clientY: point ? point.y : gesture.startY
          }));
        } catch (e) {
          return markSyntheticCancelEvent(new Event('pointercancel', options));
        }
      }

      try {
        return markSyntheticCancelEvent(new TouchEvent('touchcancel', options));
      } catch (e) {
        return markSyntheticCancelEvent(new Event('touchcancel', options));
      }
    }

    function dispatchSyntheticRutubeCancel(source, point) {
      if (gesture.rutubeCancelSent || !gesture.target) return;
      gesture.rutubeCancelSent = true;
      syntheticCancelUntil = Date.now() + 140;

      try {
        const type = source === 'touch' ? 'touchcancel' : 'pointercancel';
        const cancelEvent = createSyntheticCancelEvent(type, point);
        gesture.target.dispatchEvent(cancelEvent);
      } catch (e) {}
    }

    function stopGestureFromCancel(event) {
      if (isRtstSyntheticCancel(event)) return;
      stopGesture(event);
    }

    function blockEvent(event) {
      if (!event) return;
      try { event.preventDefault(); } catch (e) {}
      try { event.stopPropagation(); } catch (e) {}
      try { event.stopImmediatePropagation(); } catch (e) {}
    }

    function hideRutubeGestureOverlays(root = document) {
      const scope = root && root.querySelectorAll ? root : document;
      try {
        scope.querySelectorAll(rutubeGestureOverlaySelector).forEach((el) => {
          const txt = normalize(el.textContent || '');
          const cls = normalize(el.className || '');
          const looksLikeFastPlayback = (
            txt.includes('x2') ||
            txt.includes('2x') ||
            txt.includes('ускор') ||
            cls.includes('x2') ||
            cls.includes('double speed') ||
            cls.includes('double-speed') ||
            cls.includes('playback rate') ||
            cls.includes('playback-rate') ||
            cls.includes('speed')
          );

          // Важно: не трогаем mobile-seek-handler / tap-rewind.
          // Это штатная мобильная перемотка двойным тапом ±10 секунд.
          if (looksLikeFastPlayback) {
            el.classList.add('rtst-player-ad-hidden');
          }
        });
      } catch (e) {}
    }

    function getOverlayHost(video) {
      const fullscreen = document.fullscreenElement || document.webkitFullscreenElement;
      if (fullscreen && fullscreen.appendChild && !(fullscreen.tagName && fullscreen.tagName.toLowerCase() === 'video')) {
        return { el: fullscreen, type: 'player' };
      }

      const player = findPlayerRootForVideo(video);
      if (player && player.appendChild && !(player.tagName && player.tagName.toLowerCase() === 'video')) {
        return { el: player, type: 'player' };
      }

      return { el: document.documentElement, type: fullscreen ? 'video' : 'document' };
    }

    function ensureVolumeOverlay(video) {
      const host = getOverlayHost(video);
      let overlay = document.getElementById('rtst-volume-overlay');

      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'rtst-volume-overlay';
        overlay.className = 'rtst-volume-overlay';
      }

      if (overlay.parentElement !== host.el) {
        try { host.el.appendChild(overlay); } catch (e) { document.documentElement.appendChild(overlay); }
      }

      overlay.dataset.rtstHost = host.type;

      if (host.type === 'player') {
        try {
          const pos = getComputedStyle(host.el).position;
          if (!pos || pos === 'static') host.el.style.position = 'relative';
        } catch (e) {}
      }

      return overlay;
    }

    function showVideoVolumeOverlay(volume, muted, video) {
      const overlay = ensureVolumeOverlay(video);
      const percent = Math.round(clampVolume(volume) * 100);
      const icon = muted || percent <= 0 ? '🔇' : (percent < 50 ? '🔉' : '🔊');

      overlay.textContent = `${icon} ${percent}%`;
      overlay.dataset.visible = '1';

      try {
        overlay.style.display = 'block';
        overlay.style.opacity = '1';
        overlay.style.zIndex = '2147483647';
        overlay.style.pointerEvents = 'none';
      } catch (e) {}

      if (overlayTimer) clearTimeout(overlayTimer);
      overlayTimer = setTimeout(() => {
        const current = document.getElementById('rtst-volume-overlay');
        if (current) {
          current.dataset.visible = '0';
          try { current.style.opacity = '0'; } catch (e) {}
        }
      }, 950);
    }

    function applyVideoVolume(video, volume, options = {}) {
      if (!video) return;

      const nextVolume = clampVolume(volume);

      try {
        video.volume = nextVolume;
      } catch (e) {}

      if (options.fromGesture) {
        try {
          video.muted = nextVolume <= 0.001;
        } catch (e) {}
      } else if (nextVolume <= 0.001) {
        try {
          video.muted = true;
        } catch (e) {}
      }

      if (options.persist) saveVolume(nextVolume);
      if (options.showOverlay) showVideoVolumeOverlay(nextVolume, video.muted, video);
    }

    function applySavedVolumeToVideo(video) {
      if (!isSwipeVolumeEnabled() || !video) return;
      const saved = readSavedVolume();
      if (saved == null) return;

      try {
        const marker = Number(video.dataset.rtstSavedVolumeApplied || '-1');
        if (Math.abs(marker - saved) < 0.001 && lastAppliedSavedVolume === saved) return;
        video.dataset.rtstSavedVolumeApplied = String(saved);
        lastAppliedSavedVolume = saved;
      } catch (e) {}

      applyVideoVolume(video, saved, { persist: false, showOverlay: false, fromGesture: false });
    }

    function applySavedVolumeToVideos(root = document) {
      if (!isSwipeVolumeEnabled()) return;
      const scope = root && root.querySelectorAll ? root : document;
      try {
        scope.querySelectorAll('video').forEach(applySavedVolumeToVideo);
      } catch (e) {}
    }

    function startGesture(event, source = 'pointer') {
      if (!isSwipeVolumeEnabled() || !isTouchLike(event)) return;

      const point = eventPoint(event);
      const target = event.target;
      if (isRtstUiElement(target)) return;

      const video = findVideoForGesture(target);
      if (!video || !isLandscapeOrFullscreen(video)) return;
      if (!isPointOnVisibleVideoOrPlayer(point, video)) return;
      if (!isPointInVolumeSwipeZone(point, video, target)) return;
      if (isInteractiveTarget(target, video)) return;

      applySavedVolumeToVideo(video);
      hideRutubeGestureOverlays(document);

      gesture.active = true;
      gesture.pointerId = point.id;
      gesture.startX = point.x;
      gesture.startY = point.y;
      gesture.startVolume = clampVolume(video.muted ? 0 : video.volume);
      gesture.startRate = Number(video.playbackRate) || 1;
      gesture.startTime = Number(video.currentTime) || 0;
      gesture.video = video;
      gesture.target = target;
      gesture.moved = false;
      gesture.source = source;
      gesture.rutubeCancelSent = false;

      try {
        if (source === 'pointer' && event.target && event.target.setPointerCapture) event.target.setPointerCapture(event.pointerId);
      } catch (e) {}
    }

    function moveGesture(event, source = 'pointer') {
      if (!gesture.active || !gesture.video || gesture.source !== source) return;

      const point = eventPoint(event);
      if (source === 'pointer' && point.id !== gesture.pointerId) return;

      const dx = point.x - gesture.startX;
      const dyAbs = Math.abs(point.y - gesture.startY);
      const dxAbs = Math.abs(dx);

      if (!gesture.moved) {
        if (dxAbs < 10) return;

        if (dyAbs > dxAbs * 1.8 && dyAbs > 24) {
          stopGesture(event);
          return;
        }

        gesture.moved = true;
        setVolumeTouchFlag(true);
        dispatchSyntheticRutubeCancel(source, point);
      }

      lastGestureVideo = gesture.video;
      lastGestureRate = gesture.startRate || 1;
      lockRutubeGestures(1100);

      const width = Math.max(320, window.innerWidth || document.documentElement.clientWidth || 480);
      const delta = dx / (width * 0.62);
      const nextVolume = gesture.startVolume + delta;

      applyVideoVolume(gesture.video, nextVolume, {
        persist: true,
        showOverlay: true,
        fromGesture: true
      });

      hideRutubeGestureOverlays(document);
      blockEvent(event);
    }

    function stopGesture(event) {
      const shouldBlock = Boolean(gesture.moved && gesture.video);

      if (shouldBlock) {
        lastGestureVideo = gesture.video;
        lastGestureRate = gesture.startRate || 1;
        lockRutubeGestures(1200);

        try {
          if (Math.abs((gesture.video.playbackRate || 1) - (gesture.startRate || 1)) > 0.01) {
            gesture.video.playbackRate = gesture.startRate || 1;
          }
        } catch (e) {}

        blockEvent(event);
      }

      gesture.active = false;
      gesture.pointerId = null;
      gesture.video = null;
      gesture.target = null;
      gesture.moved = false;
      gesture.source = 'none';
      gesture.rutubeCancelSent = false;
      setVolumeTouchFlag(false);
    }

    function blockRutubeAfterVolumeGesture(event) {
      if (!isRutubeGestureLocked()) return;
      if (!targetBelongsToActivePlayer(event.target)) return;

      hideRutubeGestureOverlays(document);
      blockEvent(event);
    }

    document.addEventListener('pointerdown', (event) => startGesture(event, 'pointer'), true);
    document.addEventListener('pointermove', (event) => moveGesture(event, 'pointer'), { capture: true, passive: false });
    document.addEventListener('pointerup', (event) => stopGesture(event), true);
    document.addEventListener('pointercancel', stopGestureFromCancel, true);

    document.addEventListener('touchstart', (event) => startGesture(event, 'touch'), { capture: true, passive: true });
    document.addEventListener('touchmove', (event) => moveGesture(event, 'touch'), { capture: true, passive: false });
    document.addEventListener('touchend', (event) => stopGesture(event), { capture: true, passive: false });
    document.addEventListener('touchcancel', stopGestureFromCancel, { capture: true, passive: false });

    ['click', 'dblclick', 'contextmenu'].forEach((type) => {
      document.addEventListener(type, blockRutubeAfterVolumeGesture, true);
    });

    document.addEventListener('ratechange', (event) => {
      const video = event && event.target;
      if (!video || !(video instanceof HTMLMediaElement)) return;
      if (!isRutubeGestureLocked() && video !== lastGestureVideo) return;

      const desiredRate = Number(lastGestureRate) || 1;
      const currentRate = Number(video.playbackRate) || desiredRate;

      if (Math.abs(currentRate - desiredRate) > 0.01 && currentRate >= 1.5) {
        try { video.playbackRate = desiredRate; } catch (e) {}
        hideRutubeGestureOverlays(document);
      }
    }, true);

    const overlayObserver = new MutationObserver((mutations) => {
      const touchActive = document.documentElement && document.documentElement.dataset.rtstVolumeTouch === '1';
      if (!isRutubeGestureLocked() && !touchActive) return;
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLElement) hideRutubeGestureOverlays(node);
        }
      }
    });

    try {
      overlayObserver.observe(document.documentElement, { childList: true, subtree: true });
    } catch (e) {}

    document.addEventListener('play', (event) => {
      const target = event && event.target;
      if (target && target.tagName && target.tagName.toLowerCase() === 'video') {
        applySavedVolumeToVideo(target);
      }
    }, true);

    const run = () => applySavedVolumeToVideos(document);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
    else run();

    setInterval(run, 2500);
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
      html[data-rtst-enabled="1"][data-rtst-clean-watch="1"][data-rtst-page="video"] .video-page-layout-module__right,
      html[data-rtst-enabled="1"][data-rtst-clean-watch="1"][data-rtst-page="video"] .video-page-layout-module__side,
      html[data-rtst-enabled="1"][data-rtst-clean-watch="1"][data-rtst-page="video"] .wdp-see-also-module__wrapper,
      html[data-rtst-enabled="1"][data-rtst-clean-watch="1"][data-rtst-page="video"] .additional-recommendations-module__section,
      html[data-rtst-enabled="1"][data-rtst-clean-watch="1"][data-rtst-page="video"] section[aria-label="Рекомендации" i],
      html[data-rtst-enabled="1"][data-rtst-clean-watch="1"][data-rtst-page="video"] section[aria-label="Дополнительные рекомендации" i],
      html[data-rtst-enabled="1"][data-rtst-clean-watch="1"][data-rtst-page="video"] section[aria-label*="рекомендац" i][data-testid="grid"] {
        display: none !important;
      }
      html[data-rtst-enabled="1"][data-rtst-clean-watch="1"][data-rtst-page="video"] [class*="safe-mode-video-banner-module__banner"] {
        display: none !important;
      }

      html[data-rtst-enabled="1"][data-rtst-hide-comments="1"] a[href="/my/comments/"],
      html[data-rtst-enabled="1"][data-rtst-hide-comments="1"] a[href^="/my/comments/"],
      html[data-rtst-enabled="1"][data-rtst-hide-comments="1"] a.menu-item-module__menu-item[href="/my/comments/"],
      html[data-rtst-enabled="1"][data-rtst-hide-comments="1"] a.wdp-mobile-menu-module__mobile-menu-item[href="/my/comments/"],
      html[data-rtst-enabled="1"][data-rtst-hide-comments="1"] button[role="tab"][id^="tab-comments-"],
      html[data-rtst-enabled="1"][data-rtst-hide-comments="1"] button[role="tab"][aria-controls^="tabpanel-comments-"],
      html[data-rtst-enabled="1"][data-rtst-hide-comments="1"] [role="tab"][id^="tab-comments-"],
      html[data-rtst-enabled="1"][data-rtst-hide-comments="1"] [role="tab"][aria-controls^="tabpanel-comments-"],
      html[data-rtst-enabled="1"][data-rtst-hide-comments="1"][data-rtst-page="video"] section[aria-label*="комментар" i],
      html[data-rtst-enabled="1"][data-rtst-hide-comments="1"][data-rtst-page="video"] [data-testid*="comment" i],
      html[data-rtst-enabled="1"][data-rtst-hide-comments="1"][data-rtst-page="video"] [class*="comments-module" i],
      html[data-rtst-enabled="1"][data-rtst-hide-comments="1"][data-rtst-page="video"] [class*="comment-module" i],
      html[data-rtst-enabled="1"][data-rtst-hide-comments="1"][data-rtst-page="video"] [class*="comments" i],
      html[data-rtst-enabled="1"][data-rtst-hide-comments="1"][data-rtst-page="video"] textarea[placeholder*="комментар" i],
      html[data-rtst-enabled="1"][data-rtst-hide-comments="1"][data-rtst-page="video"] input[placeholder*="комментар" i] {
        display: none !important;
      }

      html[data-rtst-enabled="1"][data-rtst-hide-video-info="1"][data-rtst-page="video"] .video-pageinfo-container-module__pageInfoContainer,
      html[data-rtst-enabled="1"][data-rtst-hide-video-info="1"][data-rtst-page="video"] [class*="video-pageinfo-container-module__pageInfoContainer"],
      html[data-rtst-enabled="1"][data-rtst-hide-video-info="1"][data-rtst-page="video"] [class*="video-pageinfo-container-module__pageHeaderRow"],
      html[data-rtst-enabled="1"][data-rtst-hide-video-info="1"][data-rtst-page="video"] [class*="video-pageinfo-container-module__pageInfoContainerWrapperDescription"],
      html[data-rtst-enabled="1"][data-rtst-hide-video-info="1"][data-rtst-page="video"] section[aria-label="название" i],
      html[data-rtst-enabled="1"][data-rtst-hide-video-info="1"][data-rtst-page="video"] section[aria-label="описание видео" i],
      html[data-rtst-enabled="1"][data-rtst-hide-video-info="1"][data-rtst-page="video"] section[aria-label="информация о видео" i],
      html[data-rtst-enabled="1"][data-rtst-hide-video-info="1"][data-rtst-page="video"] section[aria-label="блок действий" i] {
        display: none !important;
      }

      html[data-rtst-enabled="1"][data-rtst-hide-shorts="1"] [data-rtst-search-shorts="1"],
      html[data-rtst-enabled="1"][data-rtst-hide-shorts="1"] .rtst-search-shorts-hidden {
        display: none !important;
      }

      html[data-rtst-enabled="1"][data-rtst-strip-player-ads="1"] [data-testid="advert"],
      html[data-rtst-enabled="1"][data-rtst-strip-player-ads="1"] [data-testid="advert-video"],
      html[data-rtst-enabled="1"][data-rtst-strip-player-ads="1"] [data-testid^="disclaimer-"],
      html[data-rtst-enabled="1"][data-rtst-strip-player-ads="1"] [class*="wdp-communication-banner"],
      html[data-rtst-enabled="1"][data-rtst-strip-player-ads="1"] [class*="premium-banner"],
      html[data-rtst-enabled="1"][data-rtst-strip-player-ads="1"] [class*="premium-popup"],
      html[data-rtst-enabled="1"][data-rtst-strip-player-ads="1"] [class*="subscription-popup"],
      html[data-rtst-enabled="1"][data-rtst-strip-player-ads="1"] [class*="wdp-player"] [class*="adfox" i],
      html[data-rtst-enabled="1"][data-rtst-strip-player-ads="1"] [class*="wdp-player"] [id*="adfox" i],
      html[data-rtst-enabled="1"][data-rtst-strip-player-ads="1"] [class*="wdp-player"] [class*="advert" i],
      html[data-rtst-enabled="1"][data-rtst-strip-player-ads="1"] [class*="wdp-player"] [id*="advert" i],
      html[data-rtst-enabled="1"][data-rtst-strip-player-ads="1"] [class*="wdp-player"] [aria-label*="реклам" i],
      html[data-rtst-enabled="1"][data-rtst-strip-player-ads="1"] [class*="wdp-player"] [class*="communication-banner-module__" i],
      html[data-rtst-enabled="1"][data-rtst-strip-player-ads="1"] [class*="wdp-player"] [class*="banner-picture-module__" i],
      html[data-rtst-enabled="1"][data-rtst-strip-player-ads="1"] [class*="wdp-player"] button[aria-label*="Закрыть баннер" i],
      html[data-rtst-enabled="1"][data-rtst-strip-player-ads="1"] [class*="video-player" i] [class*="adfox" i],
      html[data-rtst-enabled="1"][data-rtst-strip-player-ads="1"] [class*="video-player" i] [id*="adfox" i],
      html[data-rtst-enabled="1"][data-rtst-strip-player-ads="1"] [class*="video-player" i] [class*="advert" i],
      html[data-rtst-enabled="1"][data-rtst-strip-player-ads="1"] [class*="video-player" i] [id*="advert" i],
      html[data-rtst-enabled="1"][data-rtst-strip-player-ads="1"] [class*="video-player" i] [aria-label*="реклам" i],
      html[data-rtst-enabled="1"][data-rtst-strip-player-ads="1"] [class*="video-player" i] [class*="communication-banner-module__" i],
      html[data-rtst-enabled="1"][data-rtst-strip-player-ads="1"] [class*="video-player" i] [class*="banner-picture-module__" i],
      html[data-rtst-enabled="1"][data-rtst-strip-player-ads="1"] [class*="video-player" i] button[aria-label*="Закрыть баннер" i],
      html[data-rtst-enabled="1"][data-rtst-strip-player-ads="1"] .wdp-popup-overlay-module__overlay[data-testid="overlay-popup"]:has([class*="background-view-popup-module__" i]),
      html[data-rtst-enabled="1"][data-rtst-strip-player-ads="1"] .wdp-popup-overlay-module__overlay[data-testid="overlay-popup"]:has(a[href*="/promo/turnoffad/" i]),
      html[data-rtst-enabled="1"][data-rtst-strip-player-ads="1"] [class*="background-view-popup-module__" i],
      .rtst-player-ad-hidden {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }

      .rtst-showcase-banner-hidden {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        width: 0 !important;
        height: 0 !important;
        min-width: 0 !important;
        min-height: 0 !important;
        max-width: 0 !important;
        max-height: 0 !important;
        overflow: hidden !important;
        padding: 0 !important;
        margin: 0 !important;
        border: 0 !important;
      }

      .rtst-hidden {
        display: none !important; width: 0 !important; height: 0 !important;
        min-width: 0 !important; min-height: 0 !important; margin: 0 !important;
        padding: 0 !important; border: 0 !important; overflow: hidden !important;
      }
      .rtst-chrome-hidden, .rtst-view-hidden { display: none !important; }

      .rtst-search-trash {
        position: relative !important;
        opacity: .42 !important;
        filter: grayscale(1) saturate(.55) !important;
        transform: scale(.985) !important;
        transform-origin: left top !important;
        transition: opacity .16s ease, filter .16s ease, transform .16s ease !important;
      }
      .rtst-search-trash:hover {
        opacity: .78 !important;
        filter: grayscale(.35) saturate(.85) !important;
      }
      .rtst-search-trash::before {
        content: attr(data-rtst-search-trash-reason);
        position: absolute;
        z-index: 2147483001;
        left: 8px;
        top: 8px;
        max-width: calc(100% - 16px);
        padding: 5px 8px;
        border-radius: 999px;
        background: rgba(0,0,0,.78);
        color: #fff;
        font: 800 11px/1.2 Arial, sans-serif;
        pointer-events: none;
        box-shadow: 0 4px 12px rgba(0,0,0,.24);
      }

      .rtst-dim {
        opacity: .28 !important; filter: grayscale(1) blur(.4px) !important;
        outline: 2px dashed rgba(0,0,0,.28) !important; position: relative !important;
      }
      .rtst-dim::before {
        content: attr(data-rtst-reason); position: absolute; z-index: 2147483001;
        left: 8px; top: 8px; max-width: calc(100% - 16px); padding: 6px 9px;
        border-radius: 9px; background: rgba(0,0,0,.78); color: #fff;
        font: 11px/1.25 Arial, sans-serif; pointer-events: none;
      }
      .rtst-watch-badge {
        position: absolute !important;
        left: 8px !important;
        top: 8px !important;
        z-index: 2147483000 !important;
        display: inline-flex !important;
        align-items: center !important;
        gap: 5px !important;
        max-width: calc(100% - 16px) !important;
        padding: 4px 7px !important;
        border-radius: 999px !important;
        border: 1px solid rgba(88,255,149,.55) !important;
        background: rgba(5,24,13,.84) !important;
        color: #dfffe8 !important;
        box-shadow: 0 4px 12px rgba(0,0,0,.24) !important;
        font: 800 11px/1.15 Arial, sans-serif !important;
        white-space: nowrap !important;
        pointer-events: none !important;
        text-shadow: 0 1px 2px rgba(0,0,0,.45) !important;
      }
      .rtst-watch-badge[data-state="partial"] { border-color: rgba(106,226,255,.58) !important; background: rgba(5,21,32,.84) !important; color: #dff8ff !important; }
      [data-rtst-view-state="watched"], [data-rtst-view-state="complete"] { outline: 1px solid rgba(88,255,149,.34) !important; outline-offset: -1px !important; border-radius: 10px !important; }
      [data-rtst-view-state="partial"] { outline: 1px solid rgba(106,226,255,.30) !important; outline-offset: -1px !important; border-radius: 10px !important; }

      .rtst-block-btn {
        display: inline-flex !important; align-items: center !important; justify-content: center !important;
        width: 24px !important; height: 24px !important; min-width: 24px !important; min-height: 24px !important;
        margin: 3px 0 3px 8px !important; padding: 0 !important; border: 1px solid rgba(255,255,255,.55) !important;
        border-radius: 6px !important; background: rgba(18,18,18,.92) !important; color: #fff !important;
        cursor: pointer !important; font: 700 14px/1 Arial, sans-serif !important;
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
        font: 700 13px/1 Arial, sans-serif !important;
      }
      .rtst-home-link:not([class*="__wdp_"]):hover {
        background: var(--pen-button-primary-hover, #1EABE9) !important; color: var(--pen-button-primary-hover-text, #fff) !important;
      }
      .rtst-home-link .rtst-home-content { display: inline-flex !important; align-items: center !important; justify-content: center !important; gap: 4px !important; }
      
      /* --- ПАНЕЛЬ (ПК) --- */
      .rtst-panel {
        position: fixed !important; right: 14px !important; bottom: 14px !important; z-index: 2147483600 !important;
        width: 320px !important; max-width: calc(100vw - 28px) !important; max-height: calc(100vh - 28px) !important;
        overflow: auto !important; border: 1px solid rgba(186,242,198,.28) !important; border-radius: 8px !important;
        background: rgba(18,18,18,.97) !important; color: #f4fff7 !important; box-shadow: 0 14px 42px rgba(0,0,0,.42) !important;
        font: 12px/1.3 Arial, sans-serif !important; backdrop-filter: blur(10px) !important;
      }
      .rtst-panel * { box-sizing: border-box !important; }
      .rtst-panel { transition: opacity .28s ease, transform .28s ease !important; }
      .rtst-panel[data-collapsed="1"] { opacity: .42 !important; }
      .rtst-panel[data-collapsed="1"].rtst-awake,
      .rtst-panel[data-collapsed="1"]:hover,
      .rtst-panel[data-collapsed="1"]:focus-within { opacity: .96 !important; }
      .rtst-quick-actions { display: flex !important; flex-direction: column !important; gap: 7px !important; margin: 0 0 8px !important; }
      .rtst-quick-actions[hidden], .rtst-quick-btn[hidden], .rtst-quick-nav[hidden] { display: none !important; }
      .rtst-quick-nav { display: grid !important; grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 6px !important; }
      .rtst-quick-nav[data-has-channel="0"] { grid-template-columns: 1fr !important; }
      .rtst-panel .rtst-quick-btn {
        min-height: 30px !important; padding: 6px 9px !important; border-radius: 8px !important;
        border: 1px solid rgba(255,255,255,.14) !important; background: rgba(255,255,255,.10) !important;
        color: #f4fff7 !important; box-shadow: none !important; text-decoration: none !important;
        display: inline-flex !important; align-items: center !important; justify-content: center !important;
        font: 700 11px/1.2 Arial, sans-serif !important; cursor: pointer !important; text-align: center !important;
      }
      .rtst-panel .rtst-quick-movie {
        position: relative !important; overflow: hidden !important;
        min-height: 42px !important; padding: 9px 14px !important; border-radius: 12px !important;
        background: linear-gradient(120deg, #eefcf2 0%, #c9f5d4 34%, #d7f4ff 68%, #fff0cf 100%) !important;
        background-size: 220% 220% !important; color: #102617 !important;
        font: 800 13px/1.2 Arial, sans-serif !important; border-color: rgba(189,242,200,.54) !important;
        box-shadow: 0 8px 18px rgba(44, 190, 91, .18), inset 0 1px 0 rgba(255,255,255,.72) !important;
        animation: rtst-movie-shimmer 8s ease-in-out infinite !important;
      }
      .rtst-panel .rtst-quick-btn:hover { background: rgba(255,255,255,.18) !important; filter: none !important; }
      .rtst-panel .rtst-quick-movie:hover {
        background: linear-gradient(120deg, #f6fff8 0%, #bdf0ca 34%, #c8efff 68%, #ffe8b0 100%) !important;
        background-size: 220% 220% !important; filter: none !important;
        box-shadow: 0 10px 22px rgba(44, 190, 91, .24), inset 0 1px 0 rgba(255,255,255,.82) !important;
      }
      .rtst-panel[data-page="video"] .rtst-movie-cta { display: none !important; }
      .rtst-panel[data-collapsed="1"] { width: auto !important; min-width: 0 !important; max-width: none !important; overflow: visible !important; border: 0 !important; border-radius: 0 !important; background: transparent !important; box-shadow: none !important; backdrop-filter: none !important; }
      .rtst-panel[data-collapsed="1"] .rtst-panel-body, .rtst-panel[data-collapsed="1"] .rtst-panel-main, .rtst-panel[data-collapsed="1"] .rtst-panel-caret { display: none !important; }
      .rtst-panel[data-collapsed="1"] .rtst-panel-head { width: auto !important; min-width: 0 !important; height: 72px !important; padding: 4px !important; justify-content: center !important; gap: 0 !important; border: 0 !important; background: transparent !important; box-shadow: none !important; }
      .rtst-panel[data-collapsed="1"][data-page="video"] .rtst-panel-head { width: auto !important; min-width: 0 !important; padding: 4px !important; }
      .rtst-panel[data-collapsed="1"] .rtst-panel-compact { display: inline-flex !important; margin: 0 !important; }
      .rtst-panel[data-collapsed="1"][data-page="video"] .rtst-panel-compact-count { display: none !important; }
      .rtst-panel-main { min-width: 0 !important; }
      .rtst-panel-compact { display: none !important; align-items: center !important; justify-content: center !important; gap: 5px !important; font: 800 15px/1 Arial, sans-serif !important; color: #f4fff7 !important; white-space: nowrap !important; text-shadow: 0 1px 3px rgba(0,0,0,.62) !important; }
      .rtst-panel-compact-icon { display: inline-flex !important; align-items: center !important; justify-content: center !important; width: 64px !important; height: 64px !important; color: #f4fff7 !important; font-size: 54px !important; line-height: 1 !important; }
      .rtst-panel-compact-icon img { display: block !important; width: 64px !important; height: 64px !important; object-fit: contain !important; filter: drop-shadow(0 3px 7px rgba(0,0,0,.62)) !important; }
      .rtst-panel-compact-count { min-width: 1ch !important; color: #f4fff7 !important; font: 900 15px/1 Arial, sans-serif !important; text-shadow: 0 1px 4px rgba(0,0,0,.72) !important; }
      .rtst-app-icon { display: inline-flex !important; align-items: center !important; justify-content: center !important; flex: 0 0 auto !important; width: 16px !important; height: 16px !important; font-size: 14px !important; line-height: 1 !important; }
      .rtst-app-icon img { display: block !important; width: 100% !important; height: 100% !important; object-fit: contain !important; }
      .rtst-app-icon-title { width: 16px !important; height: 16px !important; margin-right: 0 !important; filter: drop-shadow(0 1px 2px rgba(0,0,0,.35)) !important; }
      .rtst-app-icon-footer { width: 18px !important; height: 18px !important; }
      .rtst-panel-head { display: flex !important; align-items: center !important; justify-content: space-between !important; gap: 8px !important; padding: 8px 12px !important; cursor: pointer !important; border-bottom: 1px solid rgba(255,255,255,.12) !important; background: rgba(255,255,255,.035) !important; }
      .rtst-panel-title { font-weight: 800 !important; font-size: 14px !important; letter-spacing: .2px !important; }
      .rtst-panel-subtitle { margin-top: 1px !important; opacity: .72 !important; font-size: 11px !important; }
      .rtst-panel-counter { margin-top: 3px !important; opacity: .78 !important; font-size: 11px !important; }
      .rtst-panel-caret { width: 24px !important; height: 24px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; border-radius: 6px !important; background: rgba(255,255,255,.08) !important; border: 1px solid rgba(255,255,255,.11) !important; }
      .rtst-panel .rtst-head-gear,
      .rtst-panel .rtst-head-bug { width: 24px !important; height: 24px !important; min-width: 24px !important; min-height: 24px !important; padding: 0 !important; border-radius: 6px !important; background: rgba(255,255,255,.08) !important; border: 1px solid rgba(255,255,255,.11) !important; color: #f4fff7 !important; box-shadow: none !important; font: 700 13px/1 Arial, sans-serif !important; }
      .rtst-panel .rtst-head-bug { opacity: .62 !important; font-size: 12px !important; }
      .rtst-panel .rtst-head-gear:hover,
      .rtst-panel .rtst-head-bug:hover { background: rgba(255,255,255,.16) !important; filter: none !important; opacity: 1 !important; }
      .rtst-panel[data-collapsed="1"] .rtst-head-gear,
      .rtst-panel[data-collapsed="1"] .rtst-head-bug { display: none !important; }
      
      .rtst-head-home { display: none !important; }

      .rtst-panel-body { padding: 8px 12px 12px !important; }
      .rtst-row { display: flex !important; gap: 6px !important; align-items: center !important; flex-wrap: wrap !important; margin: 4px 0 !important; }
      .rtst-panel label { display: flex !important; gap: 6px !important; align-items: center !important; cursor: pointer !important; font-size: 11px !important;}
      .rtst-panel input[type="text"],
      .rtst-modal input[type="text"] {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
        min-height: 26px !important;
        padding: 4px 8px !important;
        border-radius: 7px !important;
        border: 1px solid rgba(186,242,198,.22) !important;
        background: rgba(255,255,255,.08) !important;
        color: #f4fff7 !important;
        outline: none !important;
        font: 11px/1.3 Arial, sans-serif !important;
      }
      .rtst-panel textarea { width: 100% !important; min-height: 80px !important; padding: 6px 8px !important; border-radius: 7px !important; border: 1px solid rgba(186,242,198,.22) !important; background: rgba(255,255,255,.08) !important; color: #f4fff7 !important; outline: none !important; resize: vertical !important; font: 11px/1.3 Consolas, monospace !important; }
      .rtst-panel button { min-height: 26px !important; padding: 4px 10px !important; border: 0 !important; border-radius: 999px !important; background: linear-gradient(135deg, #e9ffed, #bdf2c8) !important; color: #122216 !important; cursor: pointer !important; font: 700 11px/1.2 Arial, sans-serif !important; box-shadow: 0 2px 6px rgba(0,0,0,.18) !important; }
      .rtst-panel button:hover { filter: brightness(.9) !important; }
      #rtst-import-file { display: none !important; }
      .rtst-panel .rtst-danger { background: linear-gradient(135deg, #ffe4e1, #ffb9b1) !important; color: #3b0d08 !important; }
      .rtst-small { opacity: .72 !important; font-size: 11px !important; }
      .rtst-section { margin: 6px 0 !important; padding: 8px 10px !important; border: 1px solid rgba(255,255,255,.10) !important; border-radius: 7px !important; background: rgba(255,255,255,.045) !important; }
      .rtst-section-title { margin: 0 0 6px !important; font: 700 11px/1.2 Arial, sans-serif !important; color: rgba(244,255,247,.86) !important; letter-spacing: .2px !important; }
      .rtst-radio-group { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 4px !important; }
      .rtst-radio { min-height: 26px !important; padding: 4px 6px !important; border: 1px solid rgba(255,255,255,.14) !important; border-radius: 6px !important; background: rgba(255,255,255,.055) !important; font-size: 11px !important;}
      .rtst-panel input[type="radio"], .rtst-panel input[type="checkbox"] { accent-color: #bdf2c8 !important; margin: 0 !important; }
      .rtst-actions { display: flex !important; gap: 4px !important; flex-wrap: wrap !important; margin-top: 6px !important; }
      @keyframes rtst-movie-shimmer {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
      .rtst-panel .rtst-movie-cta { margin: 8px 0 14px !important; padding: 0 !important; }
      .rtst-panel .rtst-movie-cta-btn {
        position: relative !important; overflow: hidden !important;
        width: 100% !important; min-height: 46px !important; padding: 11px 16px !important; border-radius: 12px !important;
        background: linear-gradient(120deg, #eefcf2 0%, #c9f5d4 34%, #d7f4ff 68%, #fff0cf 100%) !important;
        background-size: 220% 220% !important; color: #102617 !important;
        font: 850 14px/1.2 Arial, sans-serif !important; letter-spacing: .15px !important;
        border: 1px solid rgba(189,242,200,.54) !important;
        box-shadow: 0 9px 20px rgba(44, 190, 91, .19), inset 0 1px 0 rgba(255,255,255,.74) !important;
        animation: rtst-movie-shimmer 8s ease-in-out infinite !important;
      }
      .rtst-panel .rtst-movie-cta-btn:hover {
        filter: none !important;
        background: linear-gradient(120deg, #f6fff8 0%, #bdf0ca 34%, #c8efff 68%, #ffe8b0 100%) !important;
        background-size: 220% 220% !important;
        box-shadow: 0 11px 24px rgba(44, 190, 91, .25), inset 0 1px 0 rgba(255,255,255,.84) !important;
      }
      .rtst-panel .rtst-movie-cta-caption { margin-top: 5px !important; color: rgba(244,255,247,.66) !important; font: 11px/1.3 Arial, sans-serif !important; text-align: center !important; }
      .rtst-panel-footer { display: flex !important; align-items: center !important; justify-content: space-between !important; gap: 8px !important; margin-top: 10px !important; padding-top: 8px !important; border-top: 1px solid rgba(255,255,255,.10) !important; }
      .rtst-panel-footer .rtst-small { flex: 1 1 auto !important; }
      .rtst-version { display: inline-block !important; margin-top: 2px !important; color: rgba(244,255,247,.62) !important; font-size: 10px !important; }
      .rtst-panel .rtst-github-link {
        flex: 0 0 auto !important; width: 28px !important; height: 28px !important;
        min-width: 28px !important; min-height: 28px !important; padding: 0 !important;
        border: 0 !important; border-radius: 0 !important; background: transparent !important;
        box-shadow: none !important; color: #f4fff7 !important; font: 16px/1 Arial, sans-serif !important;
        display: flex !important; align-items: center !important; justify-content: center !important;
      }
      .rtst-panel .rtst-github-link:hover { filter: none !important; background: transparent !important; opacity: .82 !important; }
      .rtst-panel .rtst-github-link .rtst-app-icon { pointer-events: none !important; }
      .rtst-network-status {
        flex: 0 0 auto !important; display: inline-flex !important; align-items: center !important; justify-content: center !important;
        min-height: 24px !important; white-space: nowrap !important; color: rgba(244,255,247,.78) !important;
        font: 700 11px/1 Arial, sans-serif !important; cursor: default !important; user-select: none !important;
      }
      .rtst-network-status[data-state="ok"] { color: #dfffe6 !important; }
      .rtst-network-status[data-state="bad"] { color: #ffd9d9 !important; }
      .rtst-network-status[data-state="checking"] { color: #ffe8aa !important; }
      .rtst-network-status[data-state="unknown"] { color: rgba(244,255,247,.54) !important; }
      .rtst-panel .rtst-mini-btn { min-height: 24px !important; padding: 4px 8px !important; border-radius: 6px !important; background: rgba(255,255,255,.10) !important; color: #f4fff7 !important; border: 1px solid rgba(255,255,255,.14) !important; box-shadow: none !important; font-weight: 600 !important; font-size: 11px !important; }
      .rtst-panel .rtst-mini-btn:hover { background: rgba(255,255,255,.18) !important; }
      .rtst-count { opacity: .62 !important; font-weight: 400 !important; }
      
      /* --- МОДАЛЬНЫЕ ОКНА (ПК) --- */
      .rtst-modal-backdrop { position: fixed !important; inset: 0 !important; z-index: 2147483650 !important; display: flex !important; align-items: center !important; justify-content: center !important; padding: 12px !important; background: rgba(0,0,0,.58) !important; font: 12px/1.35 Arial, sans-serif !important; }
      .rtst-modal { width: 440px !important; max-width: calc(100vw - 24px) !important; max-height: calc(100vh - 24px) !important; overflow: hidden !important; display: flex !important; flex-direction: column !important; border: 1px solid rgba(255,255,255,.14) !important; border-radius: 10px !important; background: #171717 !important; color: #f4fff7 !important; box-shadow: 0 18px 56px rgba(0,0,0,.55) !important; font-size: 12px !important; }
      .rtst-modal-head { flex: 0 0 auto !important; display: flex !important; justify-content: space-between !important; align-items: center !important; gap: 10px !important; padding: 10px 14px !important; border-bottom: 1px solid rgba(255,255,255,.10) !important; background: rgba(255,255,255,.035) !important; }
      .rtst-modal-head > div:first-child { min-width: 0 !important; }
      .rtst-modal-title-row { display: flex !important; align-items: center !important; gap: 10px !important; min-width: 0 !important; }
      .rtst-modal-title { font: 800 14px/1.2 Arial, sans-serif !important; letter-spacing: .1px !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; }
      .rtst-enable-toggle { flex: 0 0 auto !important; min-width: 78px !important; min-height: 30px !important; padding: 4px 12px !important; border-radius: 999px !important; border: 1px solid rgba(186,242,198,.30) !important; background: rgba(83,255,124,.14) !important; color: #dfffe6 !important; box-shadow: none !important; font: 800 11px/1.2 Arial, sans-serif !important; }
      .rtst-enable-toggle[data-state="off"] { border-color: rgba(255,107,107,.36) !important; background: rgba(255,107,107,.13) !important; color: #ffd9d9 !important; }
      .rtst-enable-toggle:hover { filter: none !important; background: rgba(255,255,255,.15) !important; }
      .rtst-modal .rtst-title-icon-btn,
      .rtst-modal .rtst-mini-icon-btn { width: 30px !important; height: 30px !important; min-width: 30px !important; min-height: 30px !important; padding: 0 !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; border-radius: 8px !important; font: 14px/1 Arial, sans-serif !important; }
      .rtst-modal .rtst-title-icon-btn { background: rgba(255,255,255,.08) !important; color: #f4fff7 !important; }
      .rtst-modal .rtst-title-icon-btn:hover,
      .rtst-modal .rtst-mini-icon-btn:hover { filter: none !important; background: rgba(255,255,255,.17) !important; }
      .rtst-actions .rtst-mini-icon-btn { flex: 0 0 auto !important; }
      .rtst-actions.rtst-backup-actions .rtst-icon-actions {
        display: inline-flex !important;
        flex-direction: row !important;
        align-items: center !important;
        justify-content: flex-start !important;
        gap: 6px !important;
        flex: 0 0 auto !important;
      }
      .rtst-modal-body { flex: 1 1 auto !important; min-height: 0 !important; overflow-y: auto !important; padding: 10px 14px 14px !important; }
      .rtst-modal-fixed { flex: 0 0 auto !important; padding: 10px 14px !important; border-bottom: 1px solid rgba(255,255,255,.10) !important; background: rgba(255,255,255,.025) !important; }
      .rtst-modal-note { margin-top: 2px !important; color: rgba(244,255,247,.68) !important; font: 11px/1.3 Arial, sans-serif !important; }
      .rtst-modal textarea { width: 100% !important; min-height: 200px !important; padding: 8px !important; border: 1px solid rgba(255,255,255,.16) !important; border-radius: 6px !important; background: rgba(255,255,255,.06) !important; color: #f4fff7 !important; outline: none !important; resize: vertical !important; font: 11px/1.35 Consolas, monospace !important; }
      .rtst-modal-actions { display: flex !important; justify-content: space-between !important; gap: 6px !important; flex-wrap: wrap !important; margin-top: 10px !important; }
      .rtst-modal button { min-height: 26px !important; padding: 4px 10px !important; border: 1px solid rgba(255,255,255,.14) !important; border-radius: 8px !important; background: #ececec !important; color: #111 !important; cursor: pointer !important; font: 600 11px/1.2 Arial, sans-serif !important; }
      .rtst-modal-head > button[data-rtst-action="close-modal"] { flex: 0 0 auto !important; width: 32px !important; height: 32px !important; min-width: 32px !important; min-height: 32px !important; padding: 0 !important; border-radius: 8px !important; background: rgba(255,255,255,.08) !important; color: #f4fff7 !important; box-shadow: none !important; font: 800 18px/1 Arial, sans-serif !important; }
      .rtst-modal-head > button[data-rtst-action="close-modal"]:hover { background: rgba(255,255,255,.16) !important; filter: none !important; }
      .rtst-modal .rtst-danger { background: #ffcbc6 !important; color: #2a0805 !important; }
      .rtst-modal.rtst-movie-modal { width: 680px !important; max-width: calc(100vw - 24px) !important; }
      .rtst-movie-source { color: rgba(244,255,247,.76) !important; text-decoration: underline !important; }
      .rtst-modal .rtst-movie-source-btn { min-height: 0 !important; padding: 0 !important; border: 0 !important; border-radius: 0 !important; background: transparent !important; color: rgba(244,255,247,.76) !important; box-shadow: none !important; text-decoration: underline !important; font: 11px/1.3 Arial, sans-serif !important; cursor: pointer !important; }
      .rtst-modal .rtst-movie-source-btn:hover { color: #f4fff7 !important; filter: none !important; }
      .rtst-movie-toolbar { display: flex !important; align-items: center !important; justify-content: space-between !important; gap: 10px !important; flex-wrap: wrap !important; margin: 0 !important; }
      .rtst-movie-nav { display: flex !important; gap: 4px !important; flex-wrap: wrap !important; align-items: center !important; }
      .rtst-movie-status { color: rgba(244,255,247,.78) !important; font: 11px/1.3 Arial, sans-serif !important; }
      .rtst-movie-list { display: flex !important; flex-direction: column !important; gap: 4px !important; margin: 0 !important; }
      .rtst-modal .rtst-movie-row {
        display: block !important; position: relative !important; overflow: hidden !important; isolation: isolate !important; width: 100% !important; min-height: 0 !important;
        margin: 0 !important; padding: 6px 8px !important; border: 1px solid rgba(255,255,255,.10) !important; border-radius: 8px !important;
        background: rgba(255,255,255,.055) !important;
        color: #f4fff7 !important; cursor: pointer !important; text-align: left !important; box-shadow: none !important; font: 12px/1.35 Arial, sans-serif !important;
      }
      .rtst-modal .rtst-movie-row::before {
        content: '' !important; position: absolute !important; left: 0 !important; top: 0 !important; bottom: 0 !important; width: var(--rtst-movie-rating-pct, 0%) !important;
        background: var(--rtst-movie-rating-fill, linear-gradient(90deg, rgba(138, 196, 154, .22), rgba(138, 196, 154, .22))) !important;
        opacity: .94 !important; pointer-events: none !important; z-index: 0 !important;
      }
      .rtst-modal .rtst-movie-row:hover { background: rgba(255,255,255,.09) !important; filter: none !important; }
      .rtst-modal .rtst-movie-row:hover::before { opacity: 1 !important; filter: saturate(1.08) brightness(1.08) !important; }
      .rtst-modal .rtst-movie-row > span { position: relative !important; z-index: 1 !important; }
      .rtst-movie-title-line { display: block !important; color: #f4fff7 !important; font-weight: 800 !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; }
      .rtst-movie-meta-line { display: flex !important; flex-wrap: wrap !important; gap: 4px 12px !important; margin-top: 6px !important; color: rgba(244,255,247,.76) !important; font-size: 11px !important; }
      .rtst-movie-meta-line span { display: inline-flex !important; align-items: center !important; white-space: nowrap !important; }
      .rtst-movie-rating-line { display: flex !important; align-items: center !important; flex-wrap: wrap !important; gap: 4px 10px !important; margin-top: 5px !important; color: rgba(223,255,230,.90) !important; font: 800 11px/1.3 Arial, sans-serif !important; }
      .rtst-movie-rating-line span { display: inline-flex !important; align-items: center !important; white-space: nowrap !important; }
      .rtst-movie-search-line { display: flex !important; align-items: center !important; gap: 6px !important; flex-wrap: wrap !important; margin-top: 8px !important; color: rgba(244,255,247,.70) !important; font: 11px/1.3 Arial, sans-serif !important; }
      .rtst-movie-search-label { flex: 0 0 auto !important; opacity: .84 !important; }
      .rtst-modal .rtst-movie-search-btn {
        display: inline-flex !important; align-items: center !important; justify-content: center !important;
        min-height: 28px !important; padding: 5px 10px !important; border-radius: 8px !important;
        background: rgba(255,255,255,.10) !important; color: #f4fff7 !important;
        border: 1px solid rgba(255,255,255,.14) !important; box-shadow: none !important;
        font: 800 11px/1.2 Arial, sans-serif !important; text-decoration: none !important;
        white-space: nowrap !important; cursor: pointer !important; box-sizing: border-box !important;
        appearance: none !important; -webkit-appearance: none !important;
      }
      .rtst-modal a.rtst-movie-search-btn,
      .rtst-modal a.rtst-movie-search-btn:visited,
      .rtst-modal a.rtst-movie-search-btn:hover,
      .rtst-modal a.rtst-movie-search-btn:active { color: #f4fff7 !important; text-decoration: none !important; }
      .rtst-modal .rtst-movie-search-btn:hover { filter: none !important; background: rgba(255,255,255,.17) !important; }
      .rtst-modal .rtst-movie-rutube-btn,
      .rtst-modal .rtst-movie-google-btn[data-state="ok"] { border-color: rgba(83,255,124,.36) !important; background: rgba(83,255,124,.10) !important; }
      .rtst-modal .rtst-movie-google-btn:disabled { opacity: .42 !important; cursor: not-allowed !important; filter: grayscale(1) !important; }
      .rtst-movie-loading, .rtst-movie-error, .rtst-movie-empty { padding: 10px !important; border: 1px solid rgba(255,255,255,.10) !important; border-radius: 8px !important; background: rgba(255,255,255,.055) !important; color: rgba(244,255,247,.82) !important; font: 12px/1.4 Arial, sans-serif !important; }
      .rtst-movie-error { color: #ffd6d2 !important; }
      .rtst-toast { position: fixed !important; right: 14px !important; bottom: 14px !important; z-index: 2147483647 !important; max-width: calc(100vw - 28px) !important; padding: 8px 10px !important; border-radius: 8px !important; background: rgba(0,0,0,.86) !important; color: #fff !important; font: 12px/1.3 Arial, sans-serif !important; box-shadow: 0 8px 30px rgba(0,0,0,.3) !important; }
      .rtst-volume-overlay {
        position: fixed !important;
        left: 50% !important;
        top: calc(env(safe-area-inset-top, 0px) + 18px) !important;
        transform: translateX(-50%) !important;
        z-index: 2147483647 !important;
        min-width: 92px !important;
        padding: 11px 14px !important;
        border-radius: 15px !important;
        background: rgba(0,0,0,.82) !important;
        color: #fff !important;
        font: 800 20px/1.2 Arial, sans-serif !important;
        text-align: center !important;
        box-shadow: 0 10px 30px rgba(0,0,0,.42) !important;
        pointer-events: none !important;
        opacity: 0 !important;
        transition: opacity .12s ease !important;
        -webkit-user-select: none !important;
        user-select: none !important;
      }
      .rtst-volume-overlay[data-visible="1"] { opacity: 1 !important; }
      .rtst-volume-overlay[data-rtst-host="player"] {
        position: absolute !important;
        top: max(14px, env(safe-area-inset-top, 0px)) !important;
      }
      .rtst-volume-overlay[data-rtst-host="video"] {
        position: fixed !important;
        top: 14px !important;
      }
      html[data-rtst-volume-touch="1"] [class*="x2" i],
      html[data-rtst-volume-touch="1"] [class*="double-speed" i],
      html[data-rtst-volume-touch="1"] [class*="playback-rate" i],
      html[data-rtst-volume-gesture="1"] [class*="x2" i],
      html[data-rtst-volume-gesture="1"] [class*="double-speed" i],
      html[data-rtst-volume-gesture="1"] [class*="playback-rate" i] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
/* --- MOBILE OVERRIDES --- */
      @media (max-width: 680px) {
        /* Свернутая кнопка: Наверху по центру (чтобы не мешать просмотру) */
        .rtst-panel[data-collapsed="1"] {
          top: calc(env(safe-area-inset-top, 0px) + 12px) !important;
          bottom: auto !important;
          left: 50% !important;
          right: auto !important;
          transform: translateX(-50%) !important;
        }
        .rtst-panel[data-collapsed="1"] .rtst-panel-head { height: 48px !important; padding: 4px !important; }
        .rtst-panel[data-collapsed="1"] .rtst-panel-compact-icon { width: 40px !important; height: 40px !important; font-size: 34px !important; }
        .rtst-panel[data-collapsed="1"] .rtst-panel-compact-icon img { width: 40px !important; height: 40px !important; }

        /* Развернутая панель: Выезжает снизу (Bottom Sheet) для удобства пальца */
        .rtst-panel:not([data-collapsed="1"]) {
          top: auto !important;
          bottom: 0 !important;
          left: 0 !important;
          right: 0 !important;
          transform: none !important;
          width: 100vw !important; max-width: 100vw !important;
          border-radius: 16px 16px 0 0 !important;
          border-left: 0 !important; border-right: 0 !important; border-bottom: 0 !important;
          max-height: 85vh !important; font-size: 14px !important;
        }

        .rtst-panel:not([data-collapsed="1"]) .rtst-panel-head { padding: 14px 16px !important; }
        .rtst-panel:not([data-collapsed="1"]) .rtst-panel-title { font-size: 16px !important; }
        .rtst-panel:not([data-collapsed="1"]) .rtst-panel-subtitle { font-size: 13px !important; }
        .rtst-panel:not([data-collapsed="1"]) .rtst-panel-body { padding: 12px 16px 24px !important; }
        
        .rtst-panel[data-page="video"] .rtst-quick-nav { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        .rtst-panel[data-page="video"] .rtst-quick-btn { min-height: 38px !important; font-size: 13px !important; padding: 8px 12px !important; }
        .rtst-panel[data-page="video"] .rtst-quick-movie { min-height: 46px !important; font-size: 15px !important; }
        
        /* Увеличенные мишени для пальцев */
        .rtst-panel button, .rtst-modal button { min-height: 44px !important; font-size: 14px !important; padding: 10px 16px !important; }
        .rtst-panel input[type="text"], .rtst-modal input[type="text"] { min-height: 44px !important; font-size: 16px !important; padding: 8px 12px !important; }
        .rtst-panel textarea, .rtst-modal textarea { font-size: 14px !important; padding: 12px !important; }
        .rtst-radio, .rtst-panel label, .rtst-row { min-height: 44px !important; font-size: 14px !important; margin: 4px 0 !important; }
        .rtst-radio-group { grid-template-columns: 1fr !important; gap: 8px !important; }
        .rtst-section { padding: 12px !important; margin: 12px 0 !important; }
        .rtst-section-title { font-size: 13px !important; margin-bottom: 8px !important; }
        
        .rtst-actions, .rtst-modal-actions { flex-direction: column !important; gap: 8px !important; }
        .rtst-actions button, .rtst-modal-actions button, .rtst-modal-actions > div { width: 100% !important; }
        .rtst-modal-actions > div { display: flex !important; flex-direction: column !important; gap: 8px !important; }
        .rtst-actions.rtst-backup-actions .rtst-icon-actions {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 8px !important;
          width: 100% !important;
        }
        .rtst-actions.rtst-backup-actions .rtst-icon-actions .rtst-mini-icon-btn {
          flex: 0 0 44px !important;
          width: 44px !important;
          min-width: 44px !important;
          max-width: 44px !important;
          height: 44px !important;
          min-height: 44px !important;
          max-height: 44px !important;
          padding: 0 !important;
        }
        
        /* Модальные окна на весь экран */
        .rtst-modal-backdrop { padding: 0 !important; }
        .rtst-modal { width: 100vw !important; max-width: 100vw !important; height: 100vh !important; max-height: 100vh !important; border-radius: 0 !important; border: 0 !important; display: flex !important; flex-direction: column !important; font-size: 14px !important; }
        .rtst-modal-head { padding: 14px 16px !important; }
        .rtst-modal-head > button[data-rtst-action="close-modal"] { width: 40px !important; height: 40px !important; min-width: 40px !important; min-height: 40px !important; font-size: 22px !important; }
        .rtst-modal-title { font-size: 16px !important; }
        .rtst-modal-title-row { gap: 8px !important; }
        .rtst-enable-toggle { min-width: 74px !important; min-height: 38px !important; padding: 8px 10px !important; font-size: 13px !important; }
        .rtst-modal-body { flex: 1 !important; overflow-y: auto !important; padding: 16px !important; }
        .rtst-modal-fixed { padding: 12px 16px !important; }
        .rtst-modal textarea { min-height: 30vh !important; }
        .rtst-modal.rtst-movie-modal { width: 100vw !important; max-width: 100vw !important; }
        .rtst-modal .rtst-movie-row { min-height: 60px !important; font-size: 14px !important; padding: 12px !important; margin-bottom: 8px !important; }
        .rtst-movie-meta-line { gap: 6px 10px !important; margin-top: 8px !important; font-size: 12px !important; }
        .rtst-movie-rating-line { margin-top: 7px !important; gap: 6px 10px !important; font-size: 12px !important; }
        .rtst-movie-search-line { margin-top: 10px !important; gap: 8px !important; }
        .rtst-modal .rtst-movie-search-btn { flex: 1 1 120px !important; min-height: 42px !important; font-size: 13px !important; padding: 8px 10px !important; }
        .rtst-movie-toolbar { flex-direction: column !important; align-items: stretch !important; gap: 10px !important; }
        .rtst-movie-nav { display: grid !important; grid-template-columns: repeat(3, minmax(0, 1fr)) !important; gap: 8px !important; }
        .rtst-movie-nav button { width: 100% !important; padding-left: 8px !important; padding-right: 8px !important; }
        
        /* Тосты */
        .rtst-toast { right: 16px !important; left: 16px !important; bottom: 32px !important; max-width: none !important; text-align: center !important; font-size: 14px !important; padding: 12px !important; }
        .rtst-volume-overlay { top: calc(env(safe-area-inset-top, 0px) + 14px) !important; min-width: 92px !important; padding: 11px 14px !important; font-size: 20px !important; }
      }

      /* Мобильная альбомная ориентация часто шире 680px, поэтому базовый mobile-блок выше не срабатывает.
         Сенсорный смартфон остаётся смартфоном даже тогда, когда RUTUBE делает вид, что это ноутбук. */
      @media (hover: none) and (pointer: coarse), (max-height: 520px) and (orientation: landscape) {
        .rtst-panel[data-collapsed="1"] {
          top: calc(env(safe-area-inset-top, 0px) + 12px) !important;
          bottom: auto !important;
          left: 50% !important;
          right: auto !important;
          transform: translateX(-50%) !important;
        }
        .rtst-panel[data-collapsed="1"] .rtst-panel-head { height: 48px !important; padding: 4px !important; }
        .rtst-panel[data-collapsed="1"] .rtst-panel-compact-icon { width: 40px !important; height: 40px !important; font-size: 34px !important; }
        .rtst-panel[data-collapsed="1"] .rtst-panel-compact-icon img { width: 40px !important; height: 40px !important; }
      }

      @media (hover: none) and (pointer: coarse) and (orientation: landscape), (max-height: 520px) and (orientation: landscape) {
        .rtst-panel:not([data-collapsed="1"]) {
          top: auto !important;
          bottom: 0 !important;
          left: 0 !important;
          right: 0 !important;
          transform: none !important;
          width: 100vw !important;
          max-width: 100vw !important;
          max-height: calc(100vh - env(safe-area-inset-top, 0px)) !important;
          border-radius: 16px 16px 0 0 !important;
          border-left: 0 !important;
          border-right: 0 !important;
          border-bottom: 0 !important;
          font-size: 14px !important;
        }

        .rtst-panel:not([data-collapsed="1"]) .rtst-panel-head { padding: 12px 16px !important; }
        .rtst-panel:not([data-collapsed="1"]) .rtst-panel-title { font-size: 16px !important; }
        .rtst-panel:not([data-collapsed="1"]) .rtst-panel-subtitle { font-size: 13px !important; }
        .rtst-panel:not([data-collapsed="1"]) .rtst-panel-body {
          padding: 10px 16px calc(env(safe-area-inset-bottom, 0px) + 18px) !important;
          max-height: calc(100vh - 74px - env(safe-area-inset-top, 0px)) !important;
          overflow-y: auto !important;
        }

        .rtst-panel button,
        .rtst-modal button {
          min-height: 44px !important;
          font-size: 14px !important;
          padding: 10px 16px !important;
        }

        .rtst-panel input[type="text"],
        .rtst-modal input[type="text"] {
          min-height: 44px !important;
          font-size: 16px !important;
          padding: 8px 12px !important;
        }

        .rtst-panel textarea,
        .rtst-modal textarea {
          font-size: 14px !important;
          padding: 12px !important;
        }

        .rtst-radio,
        .rtst-panel label,
        .rtst-row {
          min-height: 44px !important;
          font-size: 14px !important;
          margin: 4px 0 !important;
        }

        .rtst-radio-group { grid-template-columns: 1fr !important; gap: 8px !important; }
        .rtst-section { padding: 12px !important; margin: 12px 0 !important; }
        .rtst-section-title { font-size: 13px !important; margin-bottom: 8px !important; }
        .rtst-actions,
        .rtst-modal-actions { flex-direction: column !important; gap: 8px !important; }
        .rtst-actions button,
        .rtst-modal-actions button,
        .rtst-modal-actions > div { width: 100% !important; }
        .rtst-modal-actions > div { display: flex !important; flex-direction: column !important; gap: 8px !important; }

        .rtst-modal-backdrop {
          padding: 0 !important;
          align-items: stretch !important;
          justify-content: stretch !important;
        }

        .rtst-modal {
          width: 100vw !important;
          max-width: 100vw !important;
          height: 100vh !important;
          max-height: 100vh !important;
          border-radius: 0 !important;
          border: 0 !important;
          display: flex !important;
          flex-direction: column !important;
          font-size: 14px !important;
        }

        .rtst-modal-head { padding: calc(env(safe-area-inset-top, 0px) + 10px) 16px 10px !important; }
        .rtst-modal-head > button[data-rtst-action="close-modal"] {
          width: 40px !important;
          height: 40px !important;
          min-width: 40px !important;
          min-height: 40px !important;
          font-size: 22px !important;
        }
        .rtst-modal-title { font-size: 16px !important; }
        .rtst-modal-title-row { gap: 8px !important; }
        .rtst-enable-toggle { min-width: 74px !important; min-height: 38px !important; padding: 8px 10px !important; font-size: 13px !important; }
        .rtst-modal-body {
          flex: 1 !important;
          overflow-y: auto !important;
          padding: 12px 16px calc(env(safe-area-inset-bottom, 0px) + 16px) !important;
        }
        .rtst-modal-fixed { padding: 10px 16px !important; }
        .rtst-modal textarea { min-height: 34vh !important; }
        .rtst-modal.rtst-movie-modal { width: 100vw !important; max-width: 100vw !important; }
        .rtst-modal .rtst-movie-row { min-height: 60px !important; font-size: 14px !important; padding: 12px !important; margin-bottom: 8px !important; }
        .rtst-movie-meta-line { gap: 6px 10px !important; margin-top: 8px !important; font-size: 12px !important; }
        .rtst-movie-rating-line { margin-top: 7px !important; gap: 6px 10px !important; font-size: 12px !important; }
        .rtst-movie-search-line { margin-top: 10px !important; gap: 8px !important; }
        .rtst-modal .rtst-movie-search-btn { flex: 1 1 120px !important; min-height: 42px !important; font-size: 13px !important; padding: 8px 10px !important; }
        .rtst-movie-toolbar { flex-direction: column !important; align-items: stretch !important; gap: 10px !important; }
        .rtst-movie-nav { display: grid !important; grid-template-columns: repeat(3, minmax(0, 1fr)) !important; gap: 8px !important; }
        .rtst-movie-nav button { width: 100% !important; padding-left: 8px !important; padding-right: 8px !important; }
        .rtst-toast { right: 16px !important; left: 16px !important; bottom: 32px !important; max-width: none !important; text-align: center !important; font-size: 14px !important; padding: 12px !important; }
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
    if (isEmbeddedRutubePlayer()) {
      if (oldPanel) oldPanel.remove();
      return;
    }
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
          <div class="rtst-panel-subtitle">фильтр интерфейса RUTUBE</div>
          <div class="rtst-panel-counter" id="rtst-counter" hidden></div>
        </div>
        <div class="rtst-panel-compact" aria-hidden="true">
          <span class="rtst-panel-compact-icon rtst-app-icon-target" id="rtst-panel-icon" data-rtst-app-icon="1" title="Рутубочист">🪠</span>
          <span class="rtst-panel-compact-count" id="rtst-compact-count" hidden></span>
        </div>
        <button type="button" class="rtst-head-bug" data-rtst-action="copy-player-diagnostics" title="Скопировать диагностику плеера">🐞</button>
        <button type="button" class="rtst-head-gear" data-rtst-action="open-settings-modal" title="Настройки">⚙</button>
        <div class="rtst-panel-caret">▾</div>
      </div>
      <div class="rtst-panel-body">
        <div class="rtst-quick-actions" id="rtst-quick-actions" hidden>
          <div class="rtst-quick-nav" id="rtst-quick-nav">
            <a href="/" class="rtst-quick-btn" id="rtst-quick-channel" title="Перейти на канал автора">в Канал</a>
            <a href="/" class="rtst-quick-btn" title="На главную RUTUBE">на Главную</a>
          </div>
          <button type="button" class="rtst-quick-btn rtst-quick-movie" data-rtst-action="open-movie-modal">Что посмотреть</button>
        </div>
        <div class="rtst-movie-cta">
          <button type="button" class="rtst-movie-cta-btn" data-rtst-action="open-movie-modal">Что посмотреть?</button>
          <div class="rtst-movie-cta-caption">подборки от CentralZD</div>
        </div>
        <div class="rtst-panel-footer">
          <div class="rtst-small">Кнопка «⊘» скрывает канал.<br>©2026 npekpacHo<br><span class="rtst-version" id="rtst-version">Версия ${UI_VERSION}</span></div>
          <button type="button" class="rtst-github-link" id="rtst-github-link" data-rtst-action="open-project" title="Открыть страницу проекта на GitHub"><span class="rtst-app-icon rtst-app-icon-footer" data-rtst-app-icon="1" aria-hidden="true">🪠</span></button>
          <span class="rtst-network-status" id="rtst-network-status" data-state="unknown" title="Доступ к интернету ещё не проверялся">⚪ сеть</span>
        </div>
      </div>
    `;

    document.documentElement.appendChild(panel);
    
    panel.addEventListener('mouseenter', () => wakePanel(30000));
    panel.addEventListener('mouseleave', () => wakePanel(4800));

    updatePanelRouteState();
    syncGithubBadge();
    syncPanel();
    wakePanel(5200);
  }

  function updatePanelRouteState() {
    const page = currentRutubePageType();
    if (document.body) document.body.dataset.page = page === 'video' ? 'video' : page;
    const panel = document.getElementById('rtst-panel');
    if (panel) panel.dataset.page = page;
    syncRootFlags(page);
  }

  function currentRutubePageType() {
    if (isEmbeddedRutubePlayer()) return 'embed';
    if (isVideoPage()) return 'video';
    if (isChannelPage()) return 'channel';
    if (isHomePage() || isHomeFeedPage()) return 'home';
    if (isPlaylistPage()) return 'playlist';
    if (isSearchPage()) return 'search';
    return 'other';
  }

  function syncRootFlags(page) {
    const root = document.documentElement;
    if (!root) return;
    const safePage = page || currentRutubePageType();
    root.dataset.rtstPage = safePage;
    root.dataset.rtstEnabled = settings.enabled ? '1' : '0';
    const cleanChromeOn = Boolean(settings.cleanRutubeChrome || settings.hideSideMenuPolitics);
    root.dataset.rtstCleanChrome = (settings.enabled && cleanChromeOn) ? '1' : '0';
    root.dataset.rtstHideShorts = (settings.enabled && settings.hideShorts) ? '1' : '0';
    root.dataset.rtstCleanWatch = (settings.enabled && settings.cleanWatchPage) ? '1' : '0';
    root.dataset.rtstStripPlayerAds = (settings.enabled && settings.stripPlayerAds !== false) ? '1' : '0';
    root.dataset.rtstUnlockContextMenu = (settings.enabled && settings.unlockContextMenu !== false) ? '1' : '0';
    root.dataset.rtstSwipeVideoVolume = (settings.enabled && settings.swipeVideoVolume !== false) ? '1' : '0';
    root.dataset.rtstAutoFullscreen = (settings.enabled && settings.autoFullscreenOnRotate) ? '1' : '0';
    root.dataset.rtstHideVpnPopup = (settings.enabled && settings.hideVpnPopup !== false) ? '1' : '0';
    root.dataset.rtstDimSearchTrash = (settings.enabled && settings.dimSearchTrash !== false) ? '1' : '0';
    root.dataset.rtstHideVideoInfo = (settings.enabled && settings.hideVideoInfo) ? '1' : '0';
    root.dataset.rtstHideComments = (settings.enabled && settings.hideComments) ? '1' : '0';
    root.dataset.rtstMarkWatched = (settings.enabled && settings.markWatchedVideos !== false) ? '1' : '0';
    updateDynamicCleanupStyle(cleanChromeOn);
  }

  function updateDynamicCleanupStyle(cleanChromeOn) {
    const styleId = 'rtst-dynamic-cleanup-style';
    const old = document.getElementById(styleId);
    const chromeOn = Boolean(cleanChromeOn != null ? cleanChromeOn : (settings.cleanRutubeChrome || settings.hideSideMenuPolitics));
    
    if (isEmbeddedRutubePlayer() || !settings.enabled || (!chromeOn && !settings.hideShorts && !settings.cleanWatchPage && !settings.hideVideoInfo && !settings.hideComments && settings.hideVpnPopup === false)) {
      if (old) old.remove();
      return;
    }

    const parts = [];

    if (settings.hideVpnPopup !== false) {
      parts.push(`
        html[data-rtst-enabled="1"][data-rtst-hide-vpn-popup="1"] [class*="vpn-popup" i],
        html[data-rtst-enabled="1"][data-rtst-hide-vpn-popup="1"] [class*="vpn-detect" i],
        html[data-rtst-enabled="1"][data-rtst-hide-vpn-popup="1"] [class*="proxy-popup" i] {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
      `);
    }

    if (chromeOn) {
      parts.push(`
        /* Рутубочист: глобальная зачистка интерфейса. */
        .wdp-popup-overlay-module__overlay[data-testid="overlay-popup"] .wdp-popup-module__popup[class*="onboardings-inventory-modal"],
        .wdp-popup-overlay-module__overlay[data-testid="overlay-popup"] [class*="onboardings-inventory-modal-module__popup"] {
          transform: scale(.72) !important;
          transform-origin: center center !important;
          max-width: min(92vw, 520px) !important;
          max-height: 78vh !important;
        }
        .wdp-popup-overlay-module__overlay[data-testid="overlay-popup"] button[aria-label="Закрыть попап"],
        .wdp-popup-overlay-module__overlay[data-testid="overlay-popup"] [class*="onboardings-inventory-modal-module__closeIcon"] {
          width: 180px !important;
          height: 180px !important;
          min-width: 180px !important;
          min-height: 180px !important;
          padding: 0 !important;
          border-radius: 24px !important;
          background: rgba(0,0,0,.88) !important;
          color: #fff !important;
          box-shadow: 0 10px 34px rgba(0,0,0,.78) !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          z-index: 2147483646 !important;
          position: absolute !important;
          top: 10px !important;
          right: 10px !important;
          opacity: 1 !important;
          filter: none !important;
        }
        .wdp-popup-overlay-module__overlay[data-testid="overlay-popup"] button[aria-label="Закрыть попап"] svg,
        .wdp-popup-overlay-module__overlay[data-testid="overlay-popup"] [class*="onboardings-inventory-modal-module__closeIcon"] svg,
        .wdp-popup-overlay-module__overlay[data-testid="overlay-popup"] .svg-icon--IconDsMainClose {
          --rutube-icon-custom-size: 108px !important;
          width: 108px !important;
          height: 108px !important;
          min-width: 108px !important;
          min-height: 108px !important;
        }
        @media (max-width: 680px) {
          .wdp-popup-overlay-module__overlay[data-testid="overlay-popup"] .wdp-popup-module__popup[class*="onboardings-inventory-modal"],
          .wdp-popup-overlay-module__overlay[data-testid="overlay-popup"] [class*="onboardings-inventory-modal-module__popup"] {
            transform: scale(.68) !important;
            max-height: 74vh !important;
          }
          .wdp-popup-overlay-module__overlay[data-testid="overlay-popup"] button[aria-label="Закрыть попап"],
          .wdp-popup-overlay-module__overlay[data-testid="overlay-popup"] [class*="onboardings-inventory-modal-module__closeIcon"] {
            width: 196px !important;
            height: 196px !important;
            min-width: 196px !important;
            min-height: 196px !important;
          }
          .wdp-popup-overlay-module__overlay[data-testid="overlay-popup"] button[aria-label="Закрыть попап"] svg,
          .wdp-popup-overlay-module__overlay[data-testid="overlay-popup"] [class*="onboardings-inventory-modal-module__closeIcon"] svg,
          .wdp-popup-overlay-module__overlay[data-testid="overlay-popup"] .svg-icon--IconDsMainClose {
            --rutube-icon-custom-size: 118px !important;
            width: 118px !important;
            height: 118px !important;
          }
        }

        .wdp-onboardings-inventory-banner-module__wrapper-section,
        section[class*="onboardings-inventory-banner-module__wrapper-section"],
        .wdp-header-right-module__wrapper .wdp-notification-bell-module__mobileS,
        .wdp-header-right-module__wrapper .wdp-notification-bell-module__desktop,
        .wdp-header-right-module__wrapper [class*="wdp-notification-bell-module__"],
        .wdp-header-right-module__wrapper [class*="safe-mode-header-entrypoint-module__button"],
        .wdp-header-right-module__wrapper [class*="premium-subscription-entrypoint-module__"],
        .menu-divider-module__divider,
        hr.menu-divider-module__divider,
        button.menu-collapse-module__collapse-trigger[name="По темам"],
        button[name="По темам"][aria-roledescription*="по темам" i],
        section.menu-auth-section-module__container:not(:has(a[href="/my/"])),
        button[aria-label*="уведом" i],
        button[aria-label*="безопасн" i],
        button[aria-label*="отключить рекламу" i],
        a[href^="https://rutube.sport/"],
        a[href^="//rutube.sport/"],
        a.wdp-mobile-menu-module__mobile-menu-item[href="/categories/"],
        a.menu-item-module__menu-item[href="/feeds/travel/"],
        a.menu-item-module__menu-item[href="/feeds/stream/"],
        a.menu-item-module__menu-item[href="/feeds/sport/"],
        a.menu-item-module__menu-item[href="/feeds/kids/"],
        a.menu-item-module__menu-item[href="/feeds/chempionat-mira-po-futbolu-2026/"],
        a.wdp-mobile-menu-module__mobile-menu-item[href="/feeds/travel/"],
        a.wdp-mobile-menu-module__mobile-menu-item[href="/feeds/stream/"],
        a.wdp-mobile-menu-module__mobile-menu-item[href="/feeds/sport/"],
        a.wdp-mobile-menu-module__mobile-menu-item[href="/feeds/kids/"],
        a.wdp-mobile-menu-module__mobile-menu-item[href="/feeds/chempionat-mira-po-futbolu-2026/"],
        a[href="/feeds/kids/"],
        a[href="/feeds/chempionat-mira-po-futbolu-2026/"],
        section[aria-label="Галерея Выбор RUTUBE" i] {
          display: none !important;
        }

        @supports selector(:has(*)) {
          .wdp-header-right-module__wrapper > div:has(button[aria-label*="уведом" i]),
          .wdp-header-right-module__wrapper > div:has(button[aria-label*="безопасн" i]),
          .wdp-header-right-module__wrapper > div:has(button[aria-label*="отключить рекламу" i]),
          .wdp-header-right-module__wrapper > div:has(img[src*="Icon_paid_subscription"]) {
            display: none !important;
          }
          .wdp-showcase-module__wdp-showcase:has(a[href="/tags/video/5989/"]),
          .wdp-video-carousel-module__outer:has(img[src*="/promoitem/"]),
          .wdp-video-carousel-module__outer:has([data-slide*="промобаннер" i]),
          .wdp-video-carousel-module__outer:has(a[href*="utm_medium=banner"]),
          .wdp-video-carousel-module__outer:has(a[href*="utm_campaign="]),
          .wdp-video-carousel-module__outer:has(a[href^="https://www.afisha.ru/"]) {
            display: none !important;
          }
        }

        /* Рутубочист: «Моё» оставляем живым в мобильном меню, но на ПК убираем дубль-ссылку. */
        a[href="/my/"],
        a.menu-item-module__menu-item[href="/my/"],
        a.wdp-mobile-menu-module__mobile-menu-item[href="/my/"] {
          visibility: visible !important;
          opacity: 1 !important;
          height: auto !important;
          min-height: 40px !important;
          pointer-events: auto !important;
        }
        a[href="/my/"] *,
        a.menu-item-module__menu-item[href="/my/"] *,
        a.wdp-mobile-menu-module__mobile-menu-item[href="/my/"] * {
          visibility: visible !important;
          opacity: 1 !important;
        }

        @supports selector(body:has(section)) {
          body:has(section[aria-label="Моё" i]) a.menu-item-module__menu-item[href="/my/"],
          body:has(section[aria-label="Моё" i]) a.wdp-mobile-menu-module__mobile-menu-item[href="/my/"],
          body:has(section[aria-label="Моё" i]) a[href="/my/"] {
            display: none !important;
          }
        }
        /* На поиске не даём зачистке chrome случайно превращать выдачу в чёрный экран. */
        html[data-rtst-page="search"] main.rtst-chrome-hidden,
        html[data-rtst-page="search"] [role="main"].rtst-chrome-hidden,
        html[data-rtst-page="search"] main .rtst-showcase-banner-hidden,
        html[data-rtst-page="search"] [role="main"] .rtst-showcase-banner-hidden {
          display: revert !important;
        }
      `);
    }

    if (settings.hideShorts) {
      parts.push(`
        html[data-rtst-page]:not([data-rtst-page="search"]) a.wdp-mobile-menu-module__mobile-menu-item[href^="/shorts/"],
        html[data-rtst-page]:not([data-rtst-page="search"]) section[aria-label="Shorts" i],
        html[data-rtst-page]:not([data-rtst-page="search"]) section[aria-label="Шортсы" i] {
          display: none !important;
        }
        @supports selector(:has(*)) {
          html[data-rtst-page]:not([data-rtst-page="search"]) article:has(a[href^="/shorts/"]),
          html[data-rtst-page]:not([data-rtst-page="search"]) [data-testid*="card" i]:has(a[href^="/shorts/"]),
          html[data-rtst-page]:not([data-rtst-page="search"]) .wdp-carousel-module__container:has(a[href^="/shorts/"]),
          html[data-rtst-page]:not([data-rtst-page="search"]) .wdp-slider-module__slider:has(a[href^="/shorts/"]) {
            display: none !important;
          }
        }
      `);
    }

    if (settings.cleanWatchPage) {
      parts.push(`
        body[data-page="video"] .video-page-layout-module__right,
        body[data-page="video"] .wdp-see-also-module__wrapper,
        body[data-page="video"] section[aria-label="Рекомендации" i] {
          display: none !important;
        }
        body[data-page="video"] [class*="safe-mode-video-banner-module__banner"] {
          display: none !important;
        }
      `);
    }

    if (settings.hideComments) {
      parts.push(`
        a[href="/my/comments/"],
        a[href^="/my/comments/"],
        a.menu-item-module__menu-item[href="/my/comments/"],
        a.wdp-mobile-menu-module__mobile-menu-item[href="/my/comments/"],
        button[role="tab"][id^="tab-comments-"],
        button[role="tab"][aria-controls^="tabpanel-comments-"],
        [role="tab"][id^="tab-comments-"],
        [role="tab"][aria-controls^="tabpanel-comments-"] {
          display: none !important;
        }
      `);
    }

    if (settings.hideVideoInfo) {
      parts.push(`
        body[data-page="video"] .video-pageinfo-container-module__pageInfoContainer,
        body[data-page="video"] [class*="video-pageinfo-container-module__pageInfoContainer"] {
          display: none !important;
        }
      `);
    }

    const css = parts.join('\n');
    const style = old || document.createElement('style');
    style.id = styleId;
    style.textContent = css;
    if (!old) (document.head || document.documentElement).appendChild(style);
  }


  function syncRutubePopupCloseProxy() {
    // Большую нижнюю кнопку «Закрыть» больше не создаём.
    // Оставляем только уборку хвостов от старых версий, если такая кнопка уже успела появиться.
    document.querySelectorAll('.rtst-popup-close-proxy').forEach((el) => el.remove());
  }

  function wakePanel(durationMs = 4800) {
    const panel = document.getElementById('rtst-panel');
    if (!panel) return;
    panel.classList.add('rtst-awake');
    if (panelSleepTimer) clearTimeout(panelSleepTimer);
    panelSleepTimer = setTimeout(() => {
      const current = document.getElementById('rtst-panel');
      if (current && current.dataset.collapsed === '1') current.classList.remove('rtst-awake');
    }, Math.max(1200, Number(durationMs) || 4800));
  }

  function syncQuickActions() {
    const quick = document.getElementById('rtst-quick-actions');
    if (!quick) return;
    const visible = isVideoPage();
    quick.hidden = !visible;
    const channelLink = document.getElementById('rtst-quick-channel');
    const quickNav = document.getElementById('rtst-quick-nav');
    if (!channelLink) return;
    const channelUrl = visible ? detectCurrentVideoChannelUrl() : '';
    if (channelUrl) {
      channelLink.href = channelUrl;
      channelLink.hidden = false;
      channelLink.title = 'Перейти на канал автора';
      if (quickNav) quickNav.dataset.hasChannel = '1';
    } else {
      channelLink.hidden = true;
      if (quickNav) quickNav.dataset.hasChannel = '0';
    }
  }

  function syncPanel() {
    updatePanelRouteState();
    const enabledOn = document.getElementById('rtst-enabled-on');
    const enabledOff = document.getElementById('rtst-enabled-off');
    if (enabledOn && enabledOff) {
      enabledOn.checked = Boolean(settings.enabled);
      enabledOff.checked = !settings.enabled;
    }
    const enabledToggle = document.getElementById('rtst-enabled-toggle');
    if (enabledToggle) {
      enabledToggle.dataset.state = settings.enabled ? 'on' : 'off';
      enabledToggle.setAttribute('aria-pressed', settings.enabled ? 'true' : 'false');
      enabledToggle.textContent = settings.enabled ? 'включён' : 'выключен';
      enabledToggle.title = settings.enabled ? 'Рутубочист включён. Нажмите, чтобы выключить.' : 'Рутубочист выключен. Нажмите, чтобы включить.';
    }
    const showHidden = document.getElementById('rtst-show-hidden');
    if (showHidden) showHidden.checked = Boolean(settings.showHidden);
    const hideMenu = document.getElementById('rtst-hide-menu');
    if (hideMenu) hideMenu.checked = Boolean(settings.hideSideMenuPolitics || settings.cleanRutubeChrome);
    const hideShorts = document.getElementById('rtst-hide-shorts');
    if (hideShorts) hideShorts.checked = Boolean(settings.hideShorts);
    const dimSearchTrashToggle = document.getElementById('rtst-dim-search-trash');
    if (dimSearchTrashToggle) dimSearchTrashToggle.checked = Boolean(settings.dimSearchTrash !== false);
    const markWatchedToggle = document.getElementById('rtst-mark-watched');
    if (markWatchedToggle) markWatchedToggle.checked = Boolean(settings.markWatchedVideos !== false);
    const cleanWatch = document.getElementById('rtst-clean-watch');
    if (cleanWatch) cleanWatch.checked = Boolean(settings.cleanWatchPage);
    const disableAutoplay = document.getElementById('rtst-disable-autoplay');
    if (disableAutoplay) disableAutoplay.checked = Boolean(settings.disableAutoplay);
    const hideCommentsToggle = document.getElementById('rtst-hide-comments');
    if (hideCommentsToggle) hideCommentsToggle.checked = Boolean(settings.hideComments);
    const hideVideoInfoToggle = document.getElementById('rtst-hide-video-info');
    if (hideVideoInfoToggle) hideVideoInfoToggle.checked = Boolean(settings.hideVideoInfo);
    const stripPlayerAdsToggle = document.getElementById('rtst-strip-player-ads');
    if (stripPlayerAdsToggle) stripPlayerAdsToggle.checked = Boolean(settings.stripPlayerAds !== false);
    const unlockContextMenuToggle = document.getElementById('rtst-unlock-context-menu');
    if (unlockContextMenuToggle) unlockContextMenuToggle.checked = Boolean(settings.unlockContextMenu !== false);
    const swipeVideoVolumeToggle = document.getElementById('rtst-swipe-video-volume');
    if (swipeVideoVolumeToggle) swipeVideoVolumeToggle.checked = Boolean(settings.swipeVideoVolume !== false);
    const autoFullscreenToggle = document.getElementById('rtst-auto-fullscreen-rotate');
    if (autoFullscreenToggle) autoFullscreenToggle.checked = Boolean(settings.autoFullscreenOnRotate);
    const hideVpnPopupToggle = document.getElementById('rtst-hide-vpn-popup');
    if (hideVpnPopupToggle) hideVpnPopupToggle.checked = Boolean(settings.hideVpnPopup !== false);
    
    const channelCount = document.getElementById('rtst-channel-count');
    if (channelCount) channelCount.textContent = `(${settings.userChannels.length})`;
    
    const wordCount = document.getElementById('rtst-word-count');
    if (wordCount) wordCount.textContent = `(${settings.userWords.length})`;
    updateMovieCacheStatusText();
    const versionEl = document.getElementById('rtst-version');
    if (versionEl) versionEl.textContent = `Версия ${UI_VERSION}`;
    syncGithubBadge();
    syncPanelIcon();
    syncQuickActions();
    syncRootFlags();
    
    updateCounter();
  }

  function shouldBlockRutubeSportLink(linkEl) {
    if (!settings.enabled || !settings.cleanRutubeChrome || !linkEl) return false;
    const href = String(linkEl.getAttribute('href') || linkEl.href || '').trim();
    return /^https?:\/\/rutube\.sport(?:\/|$)/i.test(href) || /^\/\/rutube\.sport(?:\/|$)/i.test(href);
  }

  function shouldBlockCleanedMenuLink(linkEl) {
    if (!settings.enabled || !settings.cleanRutubeChrome || !linkEl || linkEl.closest('#rtst-panel')) return false;
    const href = String(linkEl.getAttribute('href') || '').trim();
    return href === '/feeds/sport/' || href === '/feeds/stream/' || href === '/feeds/travel/' || href === '/feeds/chempionat-mira-po-futbolu-2026/';
  }

  function bindEvents() {
    document.addEventListener('change', (event) => {
      const target = event.target;
      if (!target) return;
      if (target.name === 'rtst-enabled-radio') { settings.enabled = target.value === 'on'; saveSettings(); syncRootFlags(); rescanNow(); }
      if (target.id === 'rtst-show-hidden') { settings.showHidden = target.checked; saveSettings(); applyHiddenVisibility(); }
      if (target.id === 'rtst-hide-menu') { settings.hideSideMenuPolitics = target.checked; settings.cleanRutubeChrome = target.checked; saveSettings(); syncRootFlags(); rescanNow(); }
      if (target.id === 'rtst-hide-shorts') { settings.hideShorts = target.checked; saveSettings(); syncRootFlags(); rescanNow(); }
      if (target.id === 'rtst-dim-search-trash') { settings.dimSearchTrash = target.checked; saveSettings(); syncRootFlags(); rescanNow(); }
      if (target.id === 'rtst-mark-watched') { settings.markWatchedVideos = target.checked; saveSettings(); syncRootFlags(); rescanNow(); }
      if (target.id === 'rtst-clean-watch') { settings.cleanWatchPage = target.checked; saveSettings(); syncRootFlags(); rescanNow(); }
      if (target.id === 'rtst-disable-autoplay') { settings.disableAutoplay = target.checked; saveSettings(); scanAutoplayVideos(); }
      if (target.id === 'rtst-hide-comments') { settings.hideComments = target.checked; saveSettings(); rescanNow(); }
      if (target.id === 'rtst-hide-video-info') { settings.hideVideoInfo = target.checked; saveSettings(); syncRootFlags(); rescanNow(); }
      if (target.id === 'rtst-strip-player-ads') { settings.stripPlayerAds = target.checked; saveSettings(); syncRootFlags(); rescanNow(); }
      if (target.id === 'rtst-unlock-context-menu') { settings.unlockContextMenu = target.checked; saveSettings(); syncRootFlags(); installRutubeContextMenuUnlocker(); rescanNow(); }
      if (target.id === 'rtst-swipe-video-volume') { settings.swipeVideoVolume = target.checked; saveSettings(); syncRootFlags(); installMobileVideoVolumeSwipe(); }
      if (target.id === 'rtst-auto-fullscreen-rotate') { settings.autoFullscreenOnRotate = target.checked; saveSettings(); syncRootFlags(); installAutoFullscreenOnRotate(); if (target.checked) maybeAutoFullscreenOnRotate('settings'); }
      if (target.id === 'rtst-hide-vpn-popup') { settings.hideVpnPopup = target.checked; saveSettings(); syncRootFlags(); installVpnPopupSuppressor(); rescanNow(); }
      if (target.id === 'rtst-import-file' && target.files && target.files[0]) { importSettingsFromFile(target.files[0]); target.value = ''; }
    }, true);

    document.addEventListener('pointerdown', (event) => {
      if (event.target && event.target.closest && event.target.closest('#rtst-panel')) wakePanel(7000);
    }, true);

    document.addEventListener('focusin', (event) => {
      if (event.target && event.target.closest && event.target.closest('#rtst-panel')) wakePanel(7000);
    }, true);

    document.addEventListener('click', (event) => {
      const linkEl = event.target && event.target.closest && event.target.closest('a[href]');
      if (linkEl && shouldBlockRutubeSportLink(linkEl)) {
        event.preventDefault();
        event.stopPropagation();
        toast('Переход на RUTUBE Спорт заблокирован.');
        return;
      }
      if (linkEl && shouldBlockCleanedMenuLink(linkEl)) {
        event.preventDefault();
        event.stopPropagation();
        toast('Переход по скрытому пункту меню заблокирован.');
        return;
      }
      if (linkEl && !linkEl.closest('#rtst-panel')) suspendScanUntil = Date.now() + 1400;
      
      if (event.target && event.target.classList && event.target.classList.contains('rtst-modal-backdrop')) {
        if (Date.now() - modalOpenedAt < 400) return; 
        closeModal(); return;
      }

      if (event.target && event.target.closest && event.target.closest('#rtst-panel')) wakePanel(8000);

      const actionEl = event.target && event.target.closest('[data-rtst-action]');
      if (!actionEl) return;
      const action = actionEl.dataset.rtstAction;

      if (action === 'toggle-panel') {
        const panel = document.getElementById('rtst-panel');
        if (panel) {
          panel.dataset.collapsed = panel.dataset.collapsed === '1' ? '0' : '1';
          wakePanel(panel.dataset.collapsed === '1' ? 5200 : 12000);
        }
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
        else toast('Канал не определён.');
        return;
      }
      if (action === 'open-movie-modal') { openMovieModal(); return; }
      if (action === 'open-settings-modal') { openSettingsModal(); return; }
      if (action === 'toggle-enabled') {
        event.preventDefault();
        event.stopPropagation();
        settings.enabled = !settings.enabled;
        saveSettings();
        syncPanel();
        syncRootFlags();
        rescanNow();
        toast(settings.enabled ? 'Рутубочист включён.' : 'Рутубочист выключен.');
        return;
      }
      if (action === 'open-project') { event.preventDefault(); event.stopPropagation(); openProjectPage(); return; }
      if (action === 'movie-newer') { switchMovieBatch(-1); return; }
      if (action === 'movie-older') { switchMovieBatch(1); return; }
      if (action === 'movie-refresh') { refreshMovieNavigator(); return; }
      if (action === 'movie-random') { openRandomMovieSearch(); return; }
      if (action === 'movie-search') { event.preventDefault(); event.stopPropagation(); openRutubeMovieSearch(actionEl.dataset.rtstQuery || '', actionEl.dataset.rtstTrailer === '1'); return; }
      if (action === 'movie-search-google') { event.preventDefault(); event.stopPropagation(); openGoogleMovieSearch(actionEl.dataset.rtstQuery || ''); return; }
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
      if (action === 'reset-view-history') { clearViewHistory(); return; }
      if (action === 'export-settings') { exportSettings(); return; }
      if (action === 'copy-player-diagnostics') { copyPlayerDiagnostics(); return; }
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
          <div class="rtst-modal-title-row">
            ${appIconHtml('rtst-app-icon-title')}
            <div class="rtst-modal-title">Рутубочист</div>
            <button type="button" class="rtst-enable-toggle" id="rtst-enabled-toggle" data-rtst-action="toggle-enabled" data-state="on" aria-pressed="true">включён</button>
          </div>
          <button type="button" data-rtst-action="close-modal" title="Закрыть">×</button>
        </div>
        <div class="rtst-modal-body">
          <div class="rtst-section">
            <div class="rtst-section-title">Что посмотреть</div>
            <div class="rtst-small" id="rtst-movie-cache-status">${escapeHtml(movieCacheStatusText())}</div>
            <div class="rtst-small" id="rtst-movie-auto-status">${escapeHtml(movieAutoUpdateStatusText())}</div>
            <div class="rtst-actions">
              <button type="button" class="rtst-mini-btn" data-rtst-action="update-movie-db">Обновить вручную</button>
            </div>
          </div>

          <div class="rtst-section">
            <div class="rtst-section-title">Лента и меню</div>
            <div class="rtst-row"><label><input type="checkbox" id="rtst-show-hidden"> показывать скрытые карточки бледным</label></div>
            <div class="rtst-row"><label><input type="checkbox" id="rtst-hide-menu"> чистить боковое меню, шапку и промо-блоки</label></div>
            <div class="rtst-row"><label><input type="checkbox" id="rtst-hide-shorts"> скрывать Шортсы</label></div>
            <div class="rtst-row"><label><input type="checkbox" id="rtst-dim-search-trash"> помечать мусор в поиске</label></div>
            <div class="rtst-row"><label><input type="checkbox" id="rtst-mark-watched"> помечать просмотренные видео</label></div>
          </div>

          <div class="rtst-section">
            <div class="rtst-section-title">Страница просмотра</div>
            <div class="rtst-row"><label><input type="checkbox" id="rtst-clean-watch"> скрывать рекомендации справа и под видео</label></div>
            <div class="rtst-row"><label><input type="checkbox" id="rtst-hide-video-info"> скрывать название, описание и информацию о видео</label></div>
			<div class="rtst-row"><label><input type="checkbox" id="rtst-hide-comments"> скрывать комментарии</label></div>
            <div class="rtst-row"><label><input type="checkbox" id="rtst-disable-autoplay"> подавлять автовоспроизведение</label></div>
          </div>

          <div class="rtst-section">
            <div class="rtst-section-title">Плеер</div>
            <div class="rtst-row"><label><input type="checkbox" id="rtst-strip-player-ads"> пытаться убирать рекламу</label></div>
            <div class="rtst-row"><label><input type="checkbox" id="rtst-hide-vpn-popup"> подавлять VPN/прокси-плашку</label></div>
            <div class="rtst-row"><label><input type="checkbox" id="rtst-unlock-context-menu"> включить системное меню по правой кнопке</label></div>
            <div class="rtst-row"><label><input type="checkbox" id="rtst-swipe-video-volume"> управлять громкостью свайпом по нижней трети плеера</label></div>
            <div class="rtst-row"><label><input type="checkbox" id="rtst-auto-fullscreen-rotate"> fullscreen при повороте после касания плеера</label></div>
          </div>

          <div class="rtst-section">
            <div class="rtst-section-title">Добавить в Чёрный список</div>
            <input type="text" id="rtst-add-input" placeholder="слово или фраза">
            <div class="rtst-actions">
              <button type="button" class="rtst-mini-btn" data-rtst-action="add-channel">Добавить в каналы</button>
              <button type="button" class="rtst-mini-btn" data-rtst-action="add-word">Добавить к фразам</button>
            </div>
          </div>

          <div class="rtst-section">
            <div class="rtst-section-title">Списки и резервная копия</div>
            <div class="rtst-actions rtst-backup-actions">
              <button type="button" class="rtst-mini-btn" data-rtst-action="open-list-modal" data-rtst-list="channels" title="Открыть список каналов">Каналы <span class="rtst-count" id="rtst-channel-count"></span></button>
              <button type="button" class="rtst-mini-btn" data-rtst-action="open-list-modal" data-rtst-list="words" title="Открыть список фраз">Фразы <span class="rtst-count" id="rtst-word-count"></span></button>
              <div class="rtst-icon-actions" aria-label="Импорт, экспорт и очистка списков">
                <button type="button" class="rtst-mini-btn rtst-mini-icon-btn" data-rtst-action="export-settings" title="Экспортировать настройки и списки">💾</button>
                <button type="button" class="rtst-mini-btn rtst-mini-icon-btn" data-rtst-action="import-settings" title="Импортировать настройки и списки">📂</button>
                <button type="button" class="rtst-mini-btn rtst-mini-icon-btn rtst-danger" data-rtst-action="reset-user" title="Очистить пользовательские списки">🗑</button>
				<button type="button" class="rtst-title-icon-btn" data-rtst-action="reset-view-history" title="Сбросить кэш просмотров">👁️‍🗨️</button>
              </div>
              <input type="file" id="rtst-import-file" accept="application/json,.json">
            </div>
          </div>
        </div>
      </div>`;
    document.documentElement.appendChild(modal);
    protectRtstUiFromCleanup(modal);
    syncPanelIcon();
    syncPanel();
    modalOpenedAt = Date.now();
  }

  function openMovieModal(index) {
    closeModal();
    movieCache.currentIndex = Number.isFinite(index) ? index : (movieCache.currentIndex || 0);
    const modal = document.createElement('div');
    modal.className = 'rtst-modal-backdrop';
    modal.innerHTML = `
      <div class="rtst-modal rtst-movie-modal" role="dialog" aria-modal="true">
        <div class="rtst-modal-head">
          <div>${modalTitleHtml('Что посмотреть?')}</div>
          <button type="button" data-rtst-action="close-modal" title="Закрыть">×</button>
        </div>
        <div class="rtst-modal-fixed" id="rtst-movie-fixed">
          <div class="rtst-movie-loading">Загрузка подборок...</div>
        </div>
        <div class="rtst-modal-body" id="rtst-movie-body">
          <div class="rtst-movie-loading">Подборка появится здесь.</div>
        </div>
      </div>`;
    document.documentElement.appendChild(modal);
    syncPanelIcon();
    renderMovieBatch(movieCache.currentIndex);
    modalOpenedAt = Date.now();
  }

  async function renderMovieBatch(index) {
    const fixed = document.getElementById('rtst-movie-fixed');
    const body = document.getElementById('rtst-movie-body');
    if (!body) return;
    if (fixed) fixed.innerHTML = '<div class="rtst-movie-loading">Загружаю подборку...</div>';
    body.innerHTML = '<div class="rtst-movie-loading">Загрузка списка фильмов...</div>';
    try {
      const result = await loadMovieBatch(index);
      const stillFixed = document.getElementById('rtst-movie-fixed');
      const stillBody = document.getElementById('rtst-movie-body');
      if (!stillBody) return;
      const html = renderMovieBatchHtml(result.batch, result.entry, result.indexData, result.index);
      if (stillFixed) stillFixed.innerHTML = html.toolbar;
      stillBody.innerHTML = html.list;
      stillBody.scrollTop = 0;
    } catch (e) {
      const stillFixed = document.getElementById('rtst-movie-fixed');
      const stillBody = document.getElementById('rtst-movie-body');
      if (stillFixed) stillFixed.innerHTML = '<div class="rtst-modal-title">База фильмов</div><div class="rtst-modal-note">База временно недоступна.</div>';
      if (!stillBody) return;
      stillBody.innerHTML = `
        <div class="rtst-movie-error">
          Не удалось загрузить базу фильмов.<br>
          Проверь локальный кэш или обнови базу в настройках.<br>
          <span class="rtst-small">${escapeHtml(e && e.message ? e.message : String(e))}</span>
        </div>`;
    }
  }

  function renderMovieBatchHtml(batch, entry, indexData, index) {
    const items = Array.isArray(batch.items) ? batch.items : [];
    const total = Array.isArray(indexData.batches) ? indexData.batches.length : 0;
    const title = formatMovieBatchTitle(batch.title || (entry && entry.title) || 'Подборка фильмов');
    const sourceUrl = batch.sourceUrl || (entry && entry.sourceUrl) || '';
    const sourceLink = sourceUrl ? `<button type="button" class="rtst-movie-source-btn" data-rtst-action="movie-source" data-rtst-url="${escapeAttribute(sourceUrl)}">пост на Пикабу</button>` : '';
    const rows = items.length ? items.map(renderMovieRow).join('') : '<div class="rtst-movie-empty">В этой подборке пусто.</div>';
    return {
      toolbar: `
        <div class="rtst-movie-toolbar">
          <div>
            <div class="rtst-modal-title">${escapeHtml(title)}</div>
            <div class="rtst-movie-status">${escapeHtml(String(index + 1))} из ${escapeHtml(String(total))} · фильмов: ${escapeHtml(String(items.length))}${sourceLink ? ' · ' + sourceLink : ''}</div>
          </div>
          <div class="rtst-movie-nav">
            <button type="button" data-rtst-action="movie-newer" ${index <= 0 ? 'disabled' : ''}>← Новее</button>
            <button type="button" data-rtst-action="movie-random">Случайный</button>
            <button type="button" data-rtst-action="movie-older" ${index >= total - 1 ? 'disabled' : ''}>Старше →</button>
          </div>
        </div>`,
      list: `<div class="rtst-movie-list">${rows}</div>`
    };
  }

  function formatMovieBatchTitle(title) {
    const text = String(title || '').trim();
    if (!text) return 'Подборка фильмов';
    return text.replace(/^что\s+посмотреть\s+от/iu, 'Подборка от');
  }

  function buildRutubeMovieSearchUrl(query, trailer) {
    const clean = String(query || '').trim();
    if (!clean) return '';
    const finalQuery = trailer ? `${clean} трейлер` : clean;

    // После деликатного скрытия Shorts возвращаем video-фильтр. Он нужен,
    // чтобы кнопка из «Что посмотреть» сразу вела в видеовыдачу, а не в общий
    // зоопарк результатов RUTUBE. Чёрный экран ловился не здесь, а в зачистке
    // мобильных Shorts-контейнеров, потому что интерфейс, конечно, хрупкий.
    const params = new URLSearchParams({ query: finalQuery, content_type: 'video' });
    return '/search/?' + params.toString();
  }

  function renderMovieRow(movie) {
    const query = movie && (movie.query || buildMovieQuery(movie));
    const title = movieTitleLine(movie);
    const genresHtml = renderMovieGenres(movie && movie.genres);
    const ratingsHtml = renderMovieRatings(movie && movie.ratings);
    const ratingPercent = movieRatingPercent(movie && movie.ratings);
    const ratingFill = movieGenreRatingFill(movie && movie.genres);
    const googleOk = isExternalSearchAvailable();
    const rutubeSearchUrl = buildRutubeMovieSearchUrl(query, false) || 'https://rutube.ru/search/';
    const googleTitle = googleOk
      ? `Искать через Google: ${query} · site:rutube.ru · без обзоров/трейлеров`
      : 'Google-поиск доступен только когда GitHub/интернет доступен.';
    return `
      <div class="rtst-movie-row" data-rtst-query="${escapeAttribute(query)}" style="--rtst-movie-rating-pct: ${escapeAttribute(String(ratingPercent))}%; --rtst-movie-rating-fill: ${escapeAttribute(ratingFill)};">
        <span class="rtst-movie-title-line">${escapeHtml(title)}</span>
        <span class="rtst-movie-meta-line">${genresHtml || '<span>жанры не указаны</span>'}</span>
        ${ratingsHtml ? `<span class="rtst-movie-rating-line">${ratingsHtml}</span>` : '<span class="rtst-movie-rating-line"><span>рейтингов пока нет</span></span>'}
        <span class="rtst-movie-search-line">
          <span class="rtst-movie-search-label">Искать в:</span>
          <a class="rtst-movie-search-btn rtst-movie-rutube-btn" href="${escapeAttribute(rutubeSearchUrl)}" target="_self" title="Искать на RUTUBE: ${escapeAttribute(query)}" rel="nofollow">▶ RUTUBE</a>
          <button type="button" class="rtst-movie-search-btn rtst-movie-google-btn" data-rtst-action="movie-search-google" data-rtst-query="${escapeAttribute(query)}" data-state="${googleOk ? 'ok' : 'bad'}" title="${escapeAttribute(googleTitle)}" ${googleOk ? '' : 'disabled'}>🔎 Google</button>
        </span>
      </div>`;
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
    const shown = genres.slice(0, 3).map((genre) => `<span>${movieGenreIcon(genre)} ${escapeHtml(genre)}</span>`);
    const rest = genres.length - shown.length;
    if (rest > 0) shown.push(`<span>+${rest}</span>`);
    return shown.join('');
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

  function movieGenreRatingColor(genre) {
    const g = normalize(genre);

    if (g.includes('ужас')) return 'rgba(180, 132, 206, .23)';
    if (g.includes('трилл')) return 'rgba(134, 165, 205, .23)';
    if (g.includes('боев')) return 'rgba(217, 132, 112, .23)';
    if (g.includes('криминал')) return 'rgba(145, 154, 180, .23)';
    if (g.includes('детектив')) return 'rgba(129, 148, 196, .23)';
    if (g.includes('драма')) return 'rgba(137, 158, 206, .22)';
    if (g.includes('комед')) return 'rgba(207, 188, 113, .23)';
    if (g.includes('приключ')) return 'rgba(111, 183, 169, .23)';
    if (g.includes('фантаст')) return 'rgba(109, 178, 199, .23)';
    if (g.includes('фэнт')) return 'rgba(168, 140, 205, .23)';
    if (g.includes('мульт') || g.includes('анима')) return 'rgba(198, 145, 190, .23)';
    if (g.includes('мелодрам')) return 'rgba(210, 139, 167, .23)';
    if (g.includes('документ')) return 'rgba(142, 174, 143, .22)';
    if (g.includes('семейн')) return 'rgba(151, 183, 130, .22)';
    if (g.includes('вестерн')) return 'rgba(201, 158, 110, .23)';
    if (g.includes('воен')) return 'rgba(150, 161, 125, .23)';
    if (g.includes('биограф')) return 'rgba(183, 166, 129, .22)';
    if (g.includes('истор')) return 'rgba(174, 151, 124, .23)';
    if (g.includes('спорт')) return 'rgba(128, 184, 171, .22)';
    if (g.includes('мюзикл') || g.includes('музык')) return 'rgba(197, 151, 199, .23)';

    return 'rgba(138, 196, 154, .22)';
  }

  function movieGenreRatingFill(genres) {
    const fallback = 'linear-gradient(90deg, rgba(138, 196, 154, .22), rgba(138, 196, 154, .22))';
    if (!Array.isArray(genres) || !genres.length) return fallback;

    const colors = [];
    const seen = new Set();

    for (const genre of genres) {
      const color = movieGenreRatingColor(genre);
      if (!color || seen.has(color)) continue;
      seen.add(color);
      colors.push(color);
      if (colors.length >= 3) break;
    }

    if (!colors.length) return fallback;
    if (colors.length === 1) return `linear-gradient(90deg, ${colors[0]}, ${colors[0]})`;
    if (colors.length === 2) return `linear-gradient(90deg, ${colors[0]} 0%, ${colors[1]} 100%)`;
    return `linear-gradient(90deg, ${colors[0]} 0%, ${colors[1]} 52%, ${colors[2]} 100%)`;
  }

  function renderMovieRatings(ratings) {
    if (!ratings || typeof ratings !== 'object') return '';
    const parts = [];
    if (ratings.imdb && Number.isFinite(Number(ratings.imdb.value))) {
      parts.push(`<span>IMDb ${formatMovieRatingValue(ratings.imdb.value)}/10</span>`);
    }
    if (ratings.kinopoisk && Number.isFinite(Number(ratings.kinopoisk.value))) {
      parts.push(`<span>КП ${formatMovieRatingValue(ratings.kinopoisk.value)}/10</span>`);
    }
    if (ratings.rottenTomatoes && typeof ratings.rottenTomatoes === 'object') {
      const critics = ratings.rottenTomatoes.critics != null ? ratings.rottenTomatoes.critics : '–';
      const audience = ratings.rottenTomatoes.audience != null ? ratings.rottenTomatoes.audience : '–';
      parts.push(`<span>🍅 ${escapeHtml(String(critics))}/${escapeHtml(String(audience))}</span>`);
    }
    return parts.join('');
  }

  function formatMovieRatingValue(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return String(value || '');
    return Number.isInteger(n) ? String(n) : String(Math.round(n * 10) / 10);
  }

  function clampMovieRatingPercent(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, Math.round(n)));
  }

  function movieRatingPercent(ratings) {
    if (!ratings || typeof ratings !== 'object') return 0;

    if (ratings.imdb && Number.isFinite(Number(ratings.imdb.value))) {
      const percent = Number.isFinite(Number(ratings.imdb.percent)) ? Number(ratings.imdb.percent) : Number(ratings.imdb.value) * 10;
      return clampMovieRatingPercent(percent);
    }

    if (ratings.kinopoisk && Number.isFinite(Number(ratings.kinopoisk.value))) {
      const percent = Number.isFinite(Number(ratings.kinopoisk.percent)) ? Number(ratings.kinopoisk.percent) : Number(ratings.kinopoisk.value) * 10;
      return clampMovieRatingPercent(percent);
    }

    if (ratings.rottenTomatoes && typeof ratings.rottenTomatoes === 'object') {
      const critics = Number(ratings.rottenTomatoes.critics);
      const audience = Number(ratings.rottenTomatoes.audience);
      const values = [critics, audience].filter(Number.isFinite);
      if (values.length) return clampMovieRatingPercent(values.reduce((sum, value) => sum + value, 0) / values.length);
    }

    return 0;
  }

  async function loadMovieBatch(index) {
    const indexData = await loadMovieIndex();
    const batches = Array.isArray(indexData.batches) ? indexData.batches : [];
    if (!batches.length) throw new Error('В локальной базе нет batches.');
    const safeIndex = Math.max(0, Math.min(batches.length - 1, Number(index) || 0));
    const entry = batches[safeIndex];
    const cacheKey = entry.id || entry.file || String(safeIndex);
    let batch = movieCache.batches.get(cacheKey);
    if (!batch) throw new Error(`В локальном кэше нет подборки ${entry.title || cacheKey}. Нажми «Обновить вручную» в настройках.`);
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
      console.warn('[Рутубочист] Не удалось прочитать локальную базу:', e);
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
      if (!batches.length) throw new Error('movies/index.json загружен, но в нём нет batches.');
      const packed = {};
      for (let i = 0; i < batches.length; i += 1) {
        const entry = batches[i];
        const cacheKey = entry.id || entry.file || String(i);
        if (!entry.file) continue;
        packed[cacheKey] = await loadMovieJsonRemote(entry.file);
      }
      saveMovieDbToLocalCache(indexData, packed, 'github');
      setGithubState('ok', `База обновлена: ${formatDateTime(new Date())}.`);
      if (!silent) toast('База обновлена и сохранена локально.');
      return true;
    } catch (e) {
      setGithubState('bad', e && e.message ? String(e.message) : String(e));
      if (!silent) toast('Не удалось обновить базу. Используется локальный кэш.');
      if (!movieCache.index) loadMovieDbFromLocalCache();
      return false;
    }
  }

  function movieAutoCheckState() {
    try {
      const raw = localStorage.getItem(MOVIE_DB_AUTO_CHECK_KEY);
      const data = raw ? JSON.parse(raw) : {};
      return {
        lastAutoCheckAt: Number(data.lastAutoCheckAt) || 0,
        lastAutoCheckReason: String(data.lastAutoCheckReason || '')
      };
    } catch (e) {
      return { lastAutoCheckAt: 0, lastAutoCheckReason: '' };
    }
  }

  function saveMovieAutoCheckState(reason) {
    try {
      localStorage.setItem(MOVIE_DB_AUTO_CHECK_KEY, JSON.stringify({
        lastAutoCheckAt: Date.now(),
        lastAutoCheckReason: String(reason || 'auto')
      }));
    } catch (e) {}
  }

  function saturdayAfternoonStart(date = new Date()) {
    const d = new Date(date.getTime());
    const day = d.getDay();
    const diff = (day - 6 + 7) % 7;
    d.setDate(d.getDate() - diff);
    d.setHours(MOVIE_DB_SATURDAY_CHECK_HOUR, 0, 0, 0);
    return d.getTime();
  }

  function isSaturdayAfternoon(date = new Date()) {
    return date.getDay() === 6 && date.getHours() >= MOVIE_DB_SATURDAY_CHECK_HOUR;
  }

  function movieAutoUpdateDecision(now = Date.now()) {
    if (!movieCache.savedAt) loadMovieDbFromLocalCache();

    const state = movieAutoCheckState();
    const currentSaturdayStart = saturdayAfternoonStart(new Date(now));
    const dueBySaturday = isSaturdayAfternoon(new Date(now)) && state.lastAutoCheckAt < currentSaturdayStart;
    const dueByInterval = !movieCache.savedAt || now - movieCache.savedAt >= MOVIE_DB_UPDATE_INTERVAL_MS;

    if (dueBySaturday) return { due: true, reason: 'субботняя проверка' };
    if (dueByInterval) return { due: true, reason: 'прошло 3 дня' };
    return { due: false, reason: '' };
  }

  function maybeUpdateMovieDbInBackground() {
    const decision = movieAutoUpdateDecision(Date.now());
    if (!decision.due) return;
    saveMovieAutoCheckState(decision.reason);
    refreshMovieDbCache({ silent: true }).finally(updateMovieCacheStatusText);
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
    if (button) { button.disabled = false; button.textContent = 'Обновить вручную'; }
  }

  function movieCacheStatusText() {
    if (!movieCache.index) loadMovieDbFromLocalCache();
    if (!movieCache.savedAt) return '📂 база ещё не загружена';
    const count = movieCache.index && Array.isArray(movieCache.index.batches) ? movieCache.index.batches.length : 0;
    return `📂 ${count} подборок · ⏱️ ${formatDateTime(new Date(movieCache.savedAt))}`;
  }

  function movieAutoUpdateStatusText() {
    const state = movieAutoCheckState();
    const decision = movieAutoUpdateDecision(Date.now());
    if (!state.lastAutoCheckAt) {
      return decision.due
        ? `🤖 автопроверка: ещё не было · статус: ${decision.reason}`
        : '🤖 автопроверка: ещё не было';
    }
    const status = state.lastAutoCheckReason || 'плановая проверка';
    const dueText = decision.due ? ` · готова: ${decision.reason}` : '';
    return `🤖 автопроверка: ${formatDateTime(new Date(state.lastAutoCheckAt))} · статус: ${status}${dueText}`;
  }

  function updateMovieCacheStatusText() {
    const el = document.getElementById('rtst-movie-cache-status');
    if (el) el.textContent = movieCacheStatusText();
    const autoEl = document.getElementById('rtst-movie-auto-status');
    if (autoEl) autoEl.textContent = movieAutoUpdateStatusText();
  }

  function formatDateTime(date) {
    try {
      return date.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return String(date);
    }
  }

  function appIconHtml(extraClass = '') {
    const cls = ['rtst-app-icon', extraClass].filter(Boolean).join(' ');
    return `<span class="${escapeAttribute(cls)}" data-rtst-app-icon="1" aria-hidden="true">🪠</span>`;
  }

  function modalTitleHtml(title) {
    return `<div class="rtst-modal-title-row">${appIconHtml('rtst-app-icon-title')}<div class="rtst-modal-title">${escapeHtml(title)}</div></div>`;
  }

  function loadPanelIconFromLocalCache() {
    try {
      const raw = localStorage.getItem(PANEL_ICON_CACHE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data || typeof data.src !== 'string' || !data.src.startsWith('data:image/')) return false;
      panelIconCache = {
        src: data.src,
        source: String(data.source || 'cache'),
        savedAt: Number(data.savedAt) || 0
      };
      return true;
    } catch (e) {
      return false;
    }
  }

  function syncPanelIcon() {
    const src = panelIconCache && panelIconCache.src ? panelIconCache.src : '';
    const title = src
      ? `Рутубочист · иконка из ${panelIconCache.source || 'кэша'}`
      : 'Рутубочист · иконка ещё не загружена';

    document.querySelectorAll('[data-rtst-app-icon="1"]').forEach((el) => {
      if (!el) return;
      if (src) {
        el.innerHTML = `<img alt="Рутубочист" src="${escapeAttribute(src)}">`;
      } else {
        el.textContent = '🪠';
      }
      if (el.id === 'rtst-panel-icon') el.title = title;
    });
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(reader.error || new Error('Не удалось прочитать иконку.'));
        reader.readAsDataURL(blob);
      } catch (e) {
        reject(e);
      }
    });
  }

  async function refreshPanelIconCacheInBackground(force = false) {
    if (panelIconFetchStarted && !force) return;
    panelIconFetchStarted = true;

    if (!force && panelIconCache.savedAt && Date.now() - panelIconCache.savedAt < PANEL_ICON_CACHE_TTL_MS) {
      syncPanelIcon();
      return;
    }

    for (const url of PANEL_ICON_URLS) {
      try {
        const response = await fetch(url + (url.includes('?') ? '&' : '?') + 'rtst=' + Date.now(), { cache: 'no-store' });
        if (!response.ok) continue;
        const blob = await response.blob();
        const type = String(blob.type || '').toLowerCase();
        if (blob.size > PANEL_ICON_MAX_CACHE_BYTES) continue;
        if (type && !type.startsWith('image/')) continue;
        const src = await blobToDataUrl(blob);
        if (!src || !src.startsWith('data:image/')) continue;

        panelIconCache = { src, source: url, savedAt: Date.now() };
        try { localStorage.setItem(PANEL_ICON_CACHE_KEY, JSON.stringify(panelIconCache)); } catch (e) {}
        syncPanelIcon();
        return;
      } catch (e) {}
    }

    syncPanelIcon();
  }

  function setGithubState(state, message) {
    githubState = { state, checkedAt: Date.now(), message: message || '' };
    syncGithubBadge();
    syncMovieExternalSearchButtons();
  }

  function isExternalSearchAvailable() {
    return githubState && githubState.state === 'ok';
  }

  function syncMovieExternalSearchButtons() {
    const ok = isExternalSearchAvailable();
    document.querySelectorAll('.rtst-movie-google-btn').forEach((btn) => {
      btn.disabled = !ok;
      btn.dataset.state = ok ? 'ok' : 'bad';
      const query = btn.dataset.rtstQuery || '';
      btn.title = ok
        ? `Искать через Google: ${query} · site:rutube.ru · без обзоров/трейлеров`
        : 'Google-поиск доступен только когда интернет доступен.';
    });
  }

  function syncGithubBadge() {
    const btn = document.getElementById('rtst-github-link');
    const status = document.getElementById('rtst-network-status');
    const state = githubState.state || 'unknown';

    if (btn) {
      const versionLine = `Версия ${UI_VERSION}`;
      btn.title = ['Открыть страницу проекта на GitHub.', versionLine].filter(Boolean).join('\n');
    }

    if (!status) return;
    status.dataset.state = state;
    if (state === 'ok') {
      status.textContent = '🟢 интернет';
      status.title = 'Интернет доступен. GitHub отвечает.';
    } else if (state === 'bad') {
      status.textContent = '🔴 чебурнет';
      status.title = ['GitHub недоступен. Возможен Чебурнет.', githubState.message ? `Ошибка: ${githubState.message}` : ''].filter(Boolean).join('\n');
    } else if (state === 'checking') {
      status.textContent = '🟡 проверка';
      status.title = 'Проверяю доступ к GitHub.';
    } else {
      status.textContent = '⚪ сеть';
      status.title = 'Доступ к интернету ещё не проверялся.';
    }
  }

  async function checkGithubAvailability() {
    setGithubState('checking', '');
    try {
      await loadMovieJsonRemote(MOVIE_DB_INDEX_FILE);
      setGithubState('ok', '');
    } catch (e) {
      setGithubState('bad', e && e.message ? e.message : String(e));
    }
  }

  function openProjectPage() {
    window.open(PROJECT_URL, '_blank', 'noopener,noreferrer');
  }

  async function openRandomMovieSearch() {
    try {
      if (!movieCache.index) {
        await loadMovieIndex();
      }
    } catch (e) {}

    const batches = movieCache.batches instanceof Map ? Array.from(movieCache.batches.values()) : [];
    let items = batches.flatMap((batch) => Array.isArray(batch && batch.items) ? batch.items : []);

    if (!items.length && movieCache.currentBatch && Array.isArray(movieCache.currentBatch.items)) {
      items = movieCache.currentBatch.items;
    }

    if (!items.length) { toast('В локальной базе нет фильмов.'); return; }
    const movie = items[Math.floor(Math.random() * items.length)];
    openRutubeMovieSearch(movie.query || buildMovieQuery(movie), false);
  }

  function openRutubeMovieSearch(query, trailer) {
    const url = buildRutubeMovieSearchUrl(query, trailer);
    if (!url) { toast('Поисковый запрос пуст.'); return; }
    // На реальных мобильных браузерах переход через location.href из модалки иногда
    // оставляет RUTUBE в состоянии чёрного экрана. Нативная ссылка используется
    // в карточках, а для программных переходов закрываем модалку перед навигацией.
    closeModal();
    setTimeout(() => {
      try { window.location.assign(url); }
      catch (e) { window.location.href = url; }
    }, 60);
  }

  function googleExcludeWordsForQuery(query) {
    const cleanQuery = String(query || '').trim();
    const normalizedQuery = normalize(cleanQuery);
    const queryNeedle = normalizedQuery ? ` ${normalizedQuery} ` : '';

    return unique(GOOGLE_SEARCH_EXCLUDE_WORDS).filter((word) => {
      const cleanWord = String(word || '').trim();
      const normalizedWord = normalize(cleanWord);
      if (!normalizedWord || normalizedWord.length < 3) return false;

      // Не исключаем слово, если оно само входит в название. Иначе Google честно
      // выполнит взаимоисключающий запрос и покажет пустоту, как будто ему мало поводов.
      if (queryNeedle && queryNeedle.includes(` ${normalizedWord} `)) return false;
      if (normalizedQuery && normalizedWord.includes(normalizedQuery)) return false;

      return true;
    });
  }

  function openGoogleMovieSearch(query) {
    const clean = String(query || '').trim();
    if (!clean) { toast('Поисковый запрос пуст.'); return; }
    if (!isExternalSearchAvailable()) {
      toast('Google-поиск отключён: GitHub недоступен. Похоже, Чебурнет.');
      return;
    }
    const params = new URLSearchParams({
      q: clean,
      as_sitesearch: 'rutube.ru',
      newwindow: '1'
    });
    const excludeWords = googleExcludeWordsForQuery(clean);
    if (excludeWords.length) params.set('as_eq', excludeWords.join(' '));

    const opened = window.open('https://www.google.com/search?' + params.toString(), '_blank', 'noopener,noreferrer');
    if (!opened) toast('Браузер заблокировал новую вкладку.');
  }

  function openExternalMovieSource(url) {
    const clean = String(url || '').trim();
    if (!/^https:\/\/pikabu\.ru\//i.test(clean)) { toast('Ссылка на источник не открыта.'); return; }
    const opened = window.open(clean, '_blank', 'noopener,noreferrer');
    if (!opened) toast('Браузер заблокировал новую вкладку.');
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
          <div>${modalTitleHtml(title)}<div class="rtst-small">${hint}</div></div>
          <button type="button" data-rtst-action="close-modal" title="Закрыть">×</button>
        </div>
        <div class="rtst-modal-body">
          <textarea id="rtst-modal-list" spellcheck="false">${escapeHtml(values.join('\n'))}</textarea>
          <div class="rtst-modal-actions">
            <div>
              <button type="button" data-rtst-action="modal-save-list" data-rtst-list="${isWords ? 'words' : 'channels'}">Сохранить список</button>
            </div>
            <button type="button" class="rtst-danger" data-rtst-action="modal-clear-list" data-rtst-list="${isWords ? 'words' : 'channels'}">Очистить этот список</button>
          </div>
        </div>
      </div>
    `;
    document.documentElement.appendChild(modal);
    syncPanelIcon();
    const textarea = document.getElementById('rtst-modal-list');
    if (textarea) textarea.focus();
    modalOpenedAt = Date.now();
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

  function loadViewHistory() {
    try {
      const raw = localStorage.getItem(VIEW_HISTORY_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function saveViewHistory(history) {
    try {
      localStorage.setItem(VIEW_HISTORY_KEY, JSON.stringify(history || {}));
    } catch (e) {}
  }

  function pruneViewHistory(history = loadViewHistory()) {
    const now = Date.now();
    const entries = Object.entries(history || {}).filter(([id, item]) => {
      if (!id || !item || typeof item !== 'object') return false;
      const updated = Date.parse(item.updatedAt || item.completedAt || '') || 0;
      if (!updated) return false;
      const status = String(item.status || '');
      const ttl = status === 'complete' || status === 'watched' ? VIEW_COMPLETED_TTL_MS : VIEW_PARTIAL_TTL_MS;
      return now - updated <= ttl;
    });

    entries.sort((a, b) => (Date.parse(b[1].updatedAt || '') || 0) - (Date.parse(a[1].updatedAt || '') || 0));

    const completed = [];
    const partial = [];

    for (const entry of entries) {
      const status = String(entry[1].status || '');
      if (status === 'complete' || status === 'watched') completed.push(entry);
      else partial.push(entry);
    }

    const limited = [...completed, ...partial.slice(0, VIEW_MAX_PARTIAL)]
      .sort((a, b) => (Date.parse(b[1].updatedAt || '') || 0) - (Date.parse(a[1].updatedAt || '') || 0))
      .slice(0, VIEW_MAX_TOTAL);

    return Object.fromEntries(limited);
  }

  function clearViewHistory() {
    try { localStorage.removeItem(VIEW_HISTORY_KEY); } catch (e) {}
    document.querySelectorAll('.rtst-watch-badge').forEach((el) => el.remove());
    document.querySelectorAll('[data-rtst-view-state]').forEach((el) => {
      el.removeAttribute('data-rtst-view-state');
      el.removeAttribute('data-rtst-view-percent');
    });
    toast('Локальный кэш просмотров очищен.');
    rescanNow();
  }

  function extractRutubeVideoIdFromUrl(url) {
    try {
      const u = new URL(url, location.href);
      const match = u.pathname.match(/\/video\/(?:private\/)?([a-z0-9_:-]+)/i);
      return match ? match[1] : '';
    } catch (e) {
      return '';
    }
  }

  function getCurrentVideoId() {
    const fromPage = extractRutubeVideoIdFromUrl(location.href);
    if (fromPage) return fromPage;
    try {
      const last = window.__rtstLastPlayOptionsSummary;
      if (last && last.apiVideoId) return String(last.apiVideoId);
    } catch (e) {}
    return '';
  }

  function getCurrentVideoTitle() {
    try {
      const last = window.__rtstLastPlayOptionsSummary;
      if (last && last.title) return String(last.title).slice(0, 240);
    } catch (e) {}

    const h1 = document.querySelector('h1');
    const title = h1 ? String(h1.textContent || '').trim() : '';
    return (title || document.title || '').slice(0, 240);
  }

  function viewPieIcon(percent) {
    const value = Math.max(0, Math.min(100, Number(percent) || 0));
    if (value >= 95) return '◉';
    if (value >= 75) return '◕';
    if (value > 25) return '◑';
    return '◔';
  }

  function viewProgressState(percent) {
    const value = Math.max(0, Math.min(100, Number(percent) || 0));
    if (value >= 95) return 'complete';
    if (value >= 80) return 'watched';
    return 'partial';
  }

  function viewProgressLabel(percent) {
    const value = Math.max(1, Math.min(100, Math.round(Number(percent) || 0)));
    const state = viewProgressState(value);
    return `${viewPieIcon(value)} просмотрено${state === 'complete' ? '' : ` ${value}%`}`;
  }

  function saveVideoProgress(video, force = false) {
    if (!settings.enabled || settings.markWatchedVideos === false || !video) return;

    let duration = Number(video.duration) || 0;
    let currentTime = Number(video.currentTime) || 0;

    if (!Number.isFinite(duration) || duration < 20 || !Number.isFinite(currentTime) || currentTime <= 0) return;

    let percent = Math.round((currentTime / duration) * 100);
    if (video.ended || percent >= 95) percent = 100;
    percent = Math.max(1, Math.min(100, percent));

    if (!force && currentTime < 30 && percent < 3) return;

    const id = getCurrentVideoId();
    if (!id) return;

    const nowIso = new Date().toISOString();
    const history = loadViewHistory();
    const old = history[id] || {};
    const oldPercent = Number(old.percent) || 0;
    const nextPercent = Math.max(oldPercent, percent);
    const state = viewProgressState(nextPercent);

    history[id] = {
      id,
      title: getCurrentVideoTitle() || old.title || '',
      duration: Math.round(duration),
      currentTime: Math.round(Math.max(Number(old.currentTime) || 0, currentTime)),
      percent: nextPercent,
      status: state,
      updatedAt: nowIso,
      completedAt: state === 'complete' ? (old.completedAt || nowIso) : old.completedAt || null
    };

    saveViewHistory(pruneViewHistory(history));
  }

  function installViewProgressTracker() {
    const KEY = '__rtstViewProgressTrackerV1312';
    if (window[KEY]) return;
    window[KEY] = true;

    function maybeSave(event, force = false) {
      const video = event && event.target instanceof HTMLMediaElement ? event.target : document.querySelector('video');
      if (!video) return;

      const now = Date.now();
      const last = Number(video.dataset.rtstViewSavedAt || '0');
      if (!force && now - last < 4500) return;

      video.dataset.rtstViewSavedAt = String(now);
      saveVideoProgress(video, force);
    }

    document.addEventListener('timeupdate', (event) => maybeSave(event, false), true);
    document.addEventListener('pause', (event) => maybeSave(event, true), true);
    document.addEventListener('ended', (event) => maybeSave(event, true), true);
    window.addEventListener('beforeunload', () => maybeSave(null, true), true);

    setInterval(() => maybeSave(null, false), 5000);
    setTimeout(() => saveViewHistory(pruneViewHistory(loadViewHistory())), 2500);
  }

  function getLocalViewProgress(videoId) {
    if (!videoId) return null;
    const history = loadViewHistory();
    const item = history[videoId];
    if (!item || typeof item !== 'object') return null;
    const percent = Math.max(0, Math.min(100, Math.round(Number(item.percent) || 0)));
    if (!percent) return null;
    return { ...item, percent, status: viewProgressState(percent) };
  }

  function hasRutubeWatchedMarker(card) {
    return Boolean(card && card.querySelector && card.querySelector('[class*="progress-bar__watched" i], [class*="watched" i][class*="progress" i]'));
  }

  function isVideoPageInfoElement(el) {
    if (!el || !el.closest) return false;

    return Boolean(el.closest(
      'h1, h2, h3, ' +
      '[class*="video-pageinfo" i], ' +
      '[class*="pageInfo" i], ' +
      '[class*="page-info" i], ' +
      '[class*="video-title" i], ' +
      '[class*="title-container" i], ' +
      'section[aria-label*="информация о видео" i], ' +
      'section[aria-label*="описание видео" i]'
    ));
  }

  function isLikelyCardForWatchBadge(card, link) {
    if (!card || !link || !card.querySelector || isRtstUiElement(card) || isProtectedHeader(card)) return false;
    if (isVideoPageInfoElement(card) || isVideoPageInfoElement(link)) return false;

    const videoId = extractRutubeVideoIdFromUrl(link.href || link.getAttribute('href') || '');
    const currentId = isVideoPage() ? getCurrentVideoId() : '';

    // На странице просмотра не ставим бейдж на заголовок/ссылку текущего видео.
    // Карточки рекомендаций и серий остаются: у них обычно есть превью или прогресс-бар.
    if (currentId && videoId && currentId === videoId && !hasCardVisualMarker(card)) return false;

    return hasCardVisualMarker(card) || hasRutubeWatchedMarker(card);
  }

  function hasCardVisualMarker(card) {
    if (!card || !card.querySelector) return false;

    return Boolean(card.querySelector(
      'img, picture, video, canvas, ' +
      '[class*="thumbnail" i], ' +
      '[class*="preview" i], ' +
      '[class*="poster" i], ' +
      '[class*="cover" i], ' +
      '[class*="image" i], ' +
      '[class*="progress-bar" i], ' +
      '[data-testid*="thumbnail" i], ' +
      '[data-testid*="preview" i]'
    ));
  }

  function applyWatchProgressBadge(card, link) {
    if (!card || !link || !card.querySelector || isRtstUiElement(card)) return;

    const oldBadges = Array.from(card.querySelectorAll(':scope > .rtst-watch-badge'));
    const oldBadge = oldBadges[0] || null;
    oldBadges.slice(1).forEach((badge) => badge.remove());

    if (!settings.enabled || settings.markWatchedVideos === false || !isLikelyCardForWatchBadge(card, link)) {
      oldBadges.forEach((badge) => badge.remove());
      card.removeAttribute('data-rtst-view-state');
      card.removeAttribute('data-rtst-view-percent');
      return;
    }

    const videoId = extractRutubeVideoIdFromUrl(link.href || link.getAttribute('href') || '');
    if (!videoId) {
      if (oldBadge) oldBadge.remove();
      return;
    }

    let progress = getLocalViewProgress(videoId);

    if (!progress && hasRutubeWatchedMarker(card)) {
      progress = { id: videoId, percent: 100, status: 'complete' };
    }

    if (!progress) {
      if (oldBadge) oldBadge.remove();
      card.removeAttribute('data-rtst-view-state');
      card.removeAttribute('data-rtst-view-percent');
      return;
    }

    const percent = Math.max(1, Math.min(100, Math.round(Number(progress.percent) || 0)));
    const state = viewProgressState(percent);
    const text = viewProgressLabel(percent);

    card.dataset.rtstViewState = state;
    card.dataset.rtstViewPercent = String(percent);

    try {
      const pos = getComputedStyle(card).position;
      if (!pos || pos === 'static') card.style.position = 'relative';
    } catch (e) {}

    const badge = oldBadge || document.createElement('div');
    badge.className = 'rtst-watch-badge';
    badge.dataset.state = state === 'partial' ? 'partial' : 'watched';
    badge.textContent = text;
    badge.title = text;

    if (!oldBadge) card.appendChild(badge);
  }

  function copyPlayerDiagnostics() {
    const fallback = {
      app: 'Рутубочист',
      version: UI_VERSION,
      url: location.href,
      error: 'Диагностическая функция ещё не готова. Откройте страницу видео и дождитесь загрузки плеера.'
    };

    let payload = fallback;

    try {
      if (typeof window.__rtstGetPlayerDiagnostics === 'function') {
        payload = window.__rtstGetPlayerDiagnostics();
      }
    } catch (e) {
      payload = { ...fallback, error: String(e && e.message ? e.message : e) };
    }

    const json = JSON.stringify(payload, null, 2);

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(json)
        .then(() => toast('Диагностика скопирована.'))
        .catch(() => {
          console.log('[Рутубочист] Диагностика плеера:', payload);
          toast('Буфер обмена недоступен. Диагностика выведена в консоль.');
        });
    } else {
      console.log('[Рутубочист] Диагностика плеера:', payload);
      toast('Диагностика выведена в консоль.');
    }
  }

  function exportSettings() {
    const payload = {
      app: 'RUTUBE Sans TV', version: UI_VERSION, exportedAt: new Date().toISOString(),
      settings: {
        enabled: settings.enabled, showHidden: settings.showHidden, hideSideMenuPolitics: settings.hideSideMenuPolitics,
        hideShorts: settings.hideShorts, hardRemove: settings.hardRemove, cleanRutubeChrome: settings.cleanRutubeChrome,
        cleanWatchPage: settings.cleanWatchPage, disableAutoplay: settings.disableAutoplay, hideComments: settings.hideComments,
        hideVideoInfo: settings.hideVideoInfo, stripPlayerAds: settings.stripPlayerAds, unlockContextMenu: settings.unlockContextMenu, swipeVideoVolume: settings.swipeVideoVolume, autoFullscreenOnRotate: settings.autoFullscreenOnRotate, hideVpnPopup: settings.hideVpnPopup, dimSearchTrash: settings.dimSearchTrash, markWatchedVideos: settings.markWatchedVideos,
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
      catch (e) { toast('JSON не прочитан.'); }
    };
    reader.readAsText(file, 'utf-8');
  }

  function importSettingsData(data) {
    const src = data && data.settings ? data.settings : data;
    if (!src || typeof src !== 'object') throw new Error('bad settings json');
    const next = { ...settings };
    for (const key of ['blockedChannels', 'blockedWords', 'userChannels', 'userWords']) { if (Array.isArray(src[key])) next[key] = unique(src[key]); }
    for (const key of ['enabled', 'showHidden', 'hideSideMenuPolitics', 'hideShorts', 'hardRemove', 'cleanRutubeChrome', 'cleanWatchPage', 'disableAutoplay', 'hideComments', 'hideVideoInfo', 'stripPlayerAds', 'unlockContextMenu', 'swipeVideoVolume', 'autoFullscreenOnRotate', 'hideVpnPopup', 'dimSearchTrash', 'markWatchedVideos']) {
      if (typeof src[key] === 'boolean') next[key] = src[key];
    }
    if (typeof src.cleanRutubeChrome === 'boolean' && typeof src.hideSideMenuPolitics !== 'boolean') next.hideSideMenuPolitics = src.cleanRutubeChrome;
    if (typeof src.hideSideMenuPolitics === 'boolean' && typeof src.cleanRutubeChrome !== 'boolean') next.cleanRutubeChrome = src.hideSideMenuPolitics;
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
    const count = Math.max(0, Number(hiddenCount) || 0);

    if (counter) {
      if (count > 0) {
        counter.hidden = false;
        counter.textContent = `скрыто на странице: ${count}`;
      } else {
        counter.hidden = true;
        counter.textContent = '';
      }
    }

    if (compactCounter) {
      if (count > 0) {
        compactCounter.hidden = false;
        compactCounter.textContent = String(count);
      } else {
        compactCounter.hidden = true;
        compactCounter.textContent = '';
      }
    }

    updatePanelRouteState();
  }

  function scheduleScan(reason = 'scheduled', delayMs = 180) {
    if (scanTimer) clearTimeout(scanTimer);

    const delay = Math.max(
      Number(delayMs) || 0,
      suspendScanUntil > Date.now() ? suspendScanUntil - Date.now() + 120 : 0
    );

    scanTimer = setTimeout(() => {
      scanTimer = null;
      scanPage(reason);
    }, delay);
  }

  function rescanNow() {
    clearAllMarks();
    scheduleScan('manual', 0);
  }

  function clearAllMarks() {
    hiddenCount = 0; removedCount = 0;
    document.querySelectorAll('.rtst-hidden,.rtst-dim,.rtst-chrome-hidden,.rtst-view-hidden,.rtst-player-ad-hidden,.rtst-showcase-banner-hidden,.rtst-search-trash,.rtst-search-shorts-hidden,[data-rtst-search-trash="1"],[data-rtst-search-shorts="1"]').forEach((el) => {
      el.classList.remove('rtst-hidden', 'rtst-dim', 'rtst-view-hidden', 'rtst-chrome-hidden', 'rtst-player-ad-hidden', 'rtst-showcase-banner-hidden', 'rtst-search-trash', 'rtst-search-shorts-hidden');
      el.removeAttribute('data-rtst-hidden'); el.removeAttribute('data-rtst-hide-target');
      el.removeAttribute('data-rtst-reason'); el.removeAttribute('data-rtst-chrome-hidden'); el.removeAttribute('data-rtst-view-hidden');
      el.removeAttribute('data-rtst-player-ad-hidden'); el.removeAttribute('data-rtst-showcase-banner-hidden'); el.removeAttribute('data-rtst-background-mode-hidden'); el.removeAttribute('data-rtst-search-trash'); el.removeAttribute('data-rtst-search-trash-reason'); el.removeAttribute('data-rtst-search-shorts'); el.removeAttribute('data-rtst-skip-clicked');
    });
    document.querySelectorAll('.rtst-watch-badge').forEach((el) => el.remove());
    document.querySelectorAll('[data-rtst-view-state],[data-rtst-processed]').forEach((el) => {
      el.removeAttribute('data-rtst-processed'); el.removeAttribute('data-rtst-card'); el.removeAttribute('data-rtst-hidden-child');
      el.removeAttribute('data-rtst-view-state'); el.removeAttribute('data-rtst-view-percent');
    });
    document.querySelectorAll('[data-rtst-search-shorts-tab="1"]').forEach((el) => {
      el.style.removeProperty('display');
      el.removeAttribute('data-rtst-search-shorts-tab');
      el.removeAttribute('data-rtst-reason');
    });
    updateCounter();
  }

  function protectRtstUiFromCleanup(root = document) {
    const scope = root && root.querySelectorAll ? root : document;
    const nodes = [];

    if (isRtstUiElement(scope)) nodes.push(scope);

    try {
      nodes.push(...scope.querySelectorAll('#rtst-panel, #rtst-panel *, .rtst-modal-backdrop, .rtst-modal-backdrop *, .rtst-toast, .rtst-popup-close-proxy'));
    } catch (e) {}

    nodes.forEach((el) => {
      try {
        el.classList.remove('rtst-hidden', 'rtst-dim', 'rtst-view-hidden', 'rtst-chrome-hidden', 'rtst-player-ad-hidden', 'rtst-showcase-banner-hidden', 'rtst-search-trash', 'rtst-search-shorts-hidden');
        el.removeAttribute('data-rtst-hidden');
        el.removeAttribute('data-rtst-hide-target');
        el.removeAttribute('data-rtst-reason');
        el.removeAttribute('data-rtst-card');
        el.removeAttribute('data-rtst-chrome-hidden');
        el.removeAttribute('data-rtst-view-hidden');
        el.removeAttribute('data-rtst-player-ad-hidden');
        el.removeAttribute('data-rtst-showcase-banner-hidden');
        el.removeAttribute('data-rtst-search-trash');
        el.removeAttribute('data-rtst-search-shorts');
        el.removeAttribute('data-rtst-search-trash-reason');
        el.removeAttribute('data-rtst-skip-clicked');
      } catch (e) {}
    });
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
    syncRootFlags();
  }

  function scanShowcaseBanners(root = document) {
    if (!settings.enabled || !(settings.cleanRutubeChrome || settings.hideSideMenuPolitics)) return;
    if (isEmbeddedRutubePlayer()) return;
    if (isSearchPage()) return;

    const scope = root && root.querySelectorAll ? root : document;
    if (scope !== document && isRtstUiElement(scope)) return;

    const selectors = [
      '[data-testid*="banner" i]',
      '[data-testid*="advert" i]',
      '[class*="banner" i]',
      '[id*="banner" i]',
      '[class*="advert" i]',
      '[id*="advert" i]',
      '[class*="adfox" i]',
      '[id*="adfox" i]',
      '[data-banner]',
      '[data-advert]',
      'iframe[src*="adfox" i]',
      'iframe[src*="a.rutube.ru" i]',
      'a[href*="adfox" i]',
      'a[href*="/ads/" i]'
    ];

    if (hasRecentShowcaseBannerActivity()) {
      selectors.push(
        'main > div',
        'main section > div',
        '[role="main"] > div',
        '[class*="layout" i] > div',
        '[class*="content" i] > div'
      );
    }

    try {
      scope.querySelectorAll(selectors.join(',')).forEach((el) => {
        if (shouldHideShowcaseBannerElement(el)) {
          const rootEl = findShowcaseBannerRoot(el);
          markShowcaseBannerHidden(rootEl || el);
        }
      });
    } catch (e) {}
  }

  function hasRecentShowcaseBannerActivity(maxAgeMs = 12000) {
    try {
      const stats = window.__rtstAdRequestStats;
      if (!stats || !stats.lastSeenAt) return false;
      const age = Date.now() - Date.parse(stats.lastSeenAt);
      if (!Number.isFinite(age) || age > maxAgeMs) return false;

      return Boolean(
        Number(stats.banner || 0) ||
        Number(stats.bannerRules || 0) ||
        Number(stats.goyaBanner || 0) ||
        Number(stats.safeModeBanner || 0) ||
        Number(stats.blockedBanner || 0)
      );
    } catch (e) {
      return false;
    }
  }

  function shouldHideShowcaseBannerElement(el) {
    if (!el || isRtstUiElement(el) || isProtectedHeader(el) || isInsidePlayer(el)) return false;
    if (el.closest && el.closest('[data-rtst-card="1"], .rtst-hidden, .rtst-dim')) return false;

    const tag = el.tagName ? el.tagName.toLowerCase() : '';
    if (['html', 'body', 'main', 'header', 'footer', 'nav', 'aside'].includes(tag)) return false;

    let rect;
    try { rect = el.getBoundingClientRect(); } catch (e) { return false; }

    const vw = Math.max(1, window.innerWidth || document.documentElement.clientWidth || 1);
    const vh = Math.max(1, window.innerHeight || document.documentElement.clientHeight || 1);
    const width = Number(rect.width) || 0;
    const height = Number(rect.height) || 0;

    if (width < Math.min(320, vw * 0.35) || height < 50 || height > 430) return false;

    const classId = normalize([
      el.className || '',
      el.id || '',
      el.getAttribute && el.getAttribute('data-testid') || '',
      el.getAttribute && el.getAttribute('aria-label') || ''
    ].join(' '));

    const text = compactText(el);
    const hrefs = el.querySelectorAll ? [...el.querySelectorAll('a[href], iframe[src], img[src], source[src]')]
      .slice(0, 12)
      .map((node) => node.getAttribute('href') || node.getAttribute('src') || '')
      .join(' ') : '';

    const suspectName = /(banner|advert|adfox|ads|promo|commercial|sponsor|реклам|промо)/i.test(classId);
    const suspectText = /(реклама|рекламный|спонсор|промо|партн[её]рский|advert|sponsor)/i.test(text);
    const suspectHref = /(adfox|a\.rutube\.ru\/api\/v1\/ad\/banner|goya\.rutube\.ru\/v2\/banner|\/ads\/|banner|advert)/i.test(hrefs);

    const linkCount = el.querySelectorAll ? el.querySelectorAll('a[href]').length : 0;
    const videoLinkCount = el.querySelectorAll ? el.querySelectorAll('a[href*="/video/"], a[href*="/shorts/"], a[href*="/plst/"]').length : 0;
    const textLen = (el.textContent || '').trim().length;
    const mediaCount = el.querySelectorAll ? el.querySelectorAll('img, picture, iframe, video, canvas, svg').length : 0;

    if (videoLinkCount > 2 || linkCount > 8 || textLen > 1800) return false;

    const looksLikeWideShowcaseBanner = width >= vw * 0.45 && height >= 80 && height <= 360;
    const isInTopShowcaseArea = rect.top >= 40 && rect.top <= Math.max(900, vh * 1.25);
    const recentBannerActivity = hasRecentShowcaseBannerActivity();
    const looksLikeEmptyBannerSlot = recentBannerActivity && looksLikeWideShowcaseBanner && isInTopShowcaseArea && videoLinkCount === 0 && linkCount <= 3 && textLen <= 700;
    const looksLikeBannerContent = looksLikeWideShowcaseBanner && (suspectName || suspectText || suspectHref);

    return looksLikeBannerContent || looksLikeEmptyBannerSlot || (suspectHref && mediaCount <= 4);
  }

  function findShowcaseBannerRoot(el) {
    if (!el || !el.parentElement) return el;

    let node = el.closest && el.closest(
      '[data-testid*="banner" i], [data-testid*="advert" i], [class*="banner" i], [id*="banner" i], [class*="advert" i], [id*="advert" i], [class*="adfox" i], [id*="adfox" i], [data-banner], [data-advert]'
    ) || el;

    for (let i = 0; i < 6 && node && node.parentElement; i++) {
      const parent = node.parentElement;
      if (!parent || parent === document.body || parent === document.documentElement || isRtstUiElement(parent) || isProtectedHeader(parent) || isInsidePlayer(parent)) break;

      const tag = parent.tagName ? parent.tagName.toLowerCase() : '';
      if (['main', 'header', 'footer', 'nav', 'aside'].includes(tag)) break;

      let pr, nr;
      try {
        pr = parent.getBoundingClientRect();
        nr = node.getBoundingClientRect();
      } catch (e) {
        break;
      }

      const parentWidth = Number(pr.width) || 0;
      const parentHeight = Number(pr.height) || 0;
      const nodeWidth = Number(nr.width) || 0;
      const nodeHeight = Number(nr.height) || 0;

      if (parentWidth < nodeWidth * 0.92) break;
      if (parentHeight > Math.max(430, nodeHeight * 2.4)) break;
      if ((parent.textContent || '').trim().length > 1800) break;
      if (parent.querySelectorAll && parent.querySelectorAll('a[href*="/video/"], a[href*="/shorts/"], a[href*="/plst/"]').length > 2) break;

      node = parent;
    }

    return node;
  }

  function markShowcaseBannerHidden(el) {
    if (!el || isInsidePlayer(el)) return;
    Dom.mark(el, {
      className: 'rtst-showcase-banner-hidden',
      dataKey: 'rtstShowcaseBannerHidden',
      reason: 'витринный баннер',
      count: true
    });
  }


  function isBackgroundModeSubscriptionPopup(el) {
    if (!el || isRtstUiElement(el)) return false;

    try {
      const node = el.closest && el.closest('.wdp-popup-overlay-module__overlay[data-testid="overlay-popup"], [data-testid="overlay-popup"], [data-testid="popup"]') || el;
      const cls = String(node.className || '') + ' ' + String(el.className || '');
      const text = compactText(node);
      const hasBgClass = /background-view-popup-module__/i.test(cls) || Boolean(node.querySelector && node.querySelector('[class*="background-view-popup-module__" i]'));
      const hasPromoLink = Boolean(node.querySelector && node.querySelector('a[href*="/promo/turnoffad/" i], a[href*="turnoffad" i]'));
      const hasKnownText = text.includes('смотрите в фоновом режиме') || text.includes('фоновый режим') || text.includes('внутри видео без рекламы');

      return Boolean(hasBgClass || hasPromoLink || hasKnownText);
    } catch (e) {
      return false;
    }
  }

  function hideBackgroundModeSubscriptionPopup(root = document) {
    const scope = root && root.querySelectorAll ? root : document;
    const candidates = [];

    try {
      candidates.push(...scope.querySelectorAll(
        '.wdp-popup-overlay-module__overlay[data-testid="overlay-popup"], ' +
        '[data-testid="overlay-popup"], ' +
        '[data-testid="popup"], ' +
        '[class*="background-view-popup-module__" i], ' +
        'a[href*="/promo/turnoffad/" i], ' +
        'a[href*="turnoffad" i]'
      ));
    } catch (e) {}

    for (const el of candidates) {
      if (!isBackgroundModeSubscriptionPopup(el)) continue;

      const popup = (el.closest && el.closest('.wdp-popup-overlay-module__overlay[data-testid="overlay-popup"], [data-testid="overlay-popup"]')) || el;
      if (!popup || isRtstUiElement(popup)) continue;

      try {
        const closeBtn = popup.querySelector(
          'button[aria-label*="Закрыть" i], ' +
          'button[class*="close" i], ' +
          '[class*="closeButton" i], ' +
          '.wdp-background-view-popup-module__closeButton'
        );
        if (closeBtn && closeBtn.dataset.rtstClicked !== '1') {
          closeBtn.dataset.rtstClicked = '1';
          closeBtn.click();
        }
      } catch (e) {}

      if (popup.dataset.rtstBackgroundModeHidden !== '1') hiddenCount += 1;
      popup.dataset.rtstBackgroundModeHidden = '1';
      popup.dataset.rtstReason = 'попап фонового режима RUTUBE';
      popup.classList.add('rtst-player-ad-hidden');
    }
  }

  function scanPlayerAds(root = document) {
    if (!settings.enabled || settings.stripPlayerAds === false) return;

    const scope = root && root.querySelectorAll ? root : document;
    if (scope !== document && isRtstUiElement(scope)) return;
    closeAndHidePlayerCommunicationBanners(scope);
    hidePlayerAdElements(scope);
    clickRutubeSkipButtons(scope);
  }

  function hidePlayerAdElements(scope) {
    const selectors = [
      '[data-testid="advert"]',
      '[data-testid="advert-video"]',
      '[data-testid^="disclaimer-"]',
      '[data-testid*="advert" i]',
      '[aria-label*="реклам" i]',
      'button[aria-label*="Закрыть баннер" i]',
      '[class*="communication-banner-module__" i]',
      '[class*="banner-picture-module__" i]',
      '[class*="wdp-communication-banner"]',
      '[class*="premium-banner"]',
      '[class*="premium-popup"]',
      '[class*="subscription-popup"]',
      '[class*="adfox" i]',
      '[id*="adfox" i]',
      '[class*="advert" i]',
      '[id*="advert" i]',
      'a[href*="adfox" i]',
      'a[href*="/ads/" i]'
    ];

    scope.querySelectorAll(selectors.join(',')).forEach((el) => {
      if (!el || isRtstUiElement(el) || isProtectedHeader(el) || isProtectedPlayerControl(el)) return;
      if (isInsidePlayer(el) || compactText(el).includes('реклам')) {
        markPlayerAdHidden(el);
      }
    });

    closeAndHidePlayerCommunicationBanners(scope);
    hideLikelyCornerAdOverlays(scope);
  }

  function closeAndHidePlayerCommunicationBanners(scope) {
    const source = scope && scope.querySelectorAll ? scope : document;
    if (isRtstUiElement(source)) return;

    const closeButtons = source.querySelectorAll('button[aria-label*="Закрыть баннер" i], [role="button"][aria-label*="Закрыть баннер" i]');
    closeButtons.forEach((btn) => {
      if (!btn || isRtstUiElement(btn)) return;

      const banner = findCommunicationBannerRoot(btn) || btn.parentElement;
      if (banner && !isRtstUiElement(banner)) {
        markPlayerAdHidden(banner);
      }

      if (btn.dataset.rtstBannerCloseClicked !== '1') {
        try {
          btn.dataset.rtstBannerCloseClicked = '1';
          btn.style.setProperty('pointer-events', 'auto', 'important');
          btn.click();
        } catch (e) {}
      }

      markPlayerAdHidden(btn);
    });

    const bannerParts = source.querySelectorAll('[class*="communication-banner-module__" i], [class*="banner-picture-module__" i]');
    bannerParts.forEach((el) => {
      if (!el || isRtstUiElement(el) || isProtectedHeader(el)) return;
      if (!isInsidePlayer(el)) return;

      const banner = findCommunicationBannerRoot(el);
      if (banner && !isRtstUiElement(banner)) {
        markPlayerAdHidden(banner);
      } else {
        markPlayerAdHidden(el);
      }
    });
  }

  function findCommunicationBannerRoot(el) {
    if (!el || !el.closest) return null;

    const exact = el.closest(
      '[class*="communication-banner-module__" i], ' +
      '[data-testid*="communication" i], ' +
      '[data-testid*="banner" i]'
    );
    if (exact && isInsidePlayer(exact)) return exact;

    let node = el.parentElement;
    let best = null;
    let steps = 0;

    while (node && steps < 6 && !isRtstUiElement(node)) {
      const text = normalize([node.className, node.id, node.getAttribute && node.getAttribute('aria-label')].join(' '));
      if (text.includes('communication-banner') || text.includes('banner')) best = node;
      if (node.querySelector && node.querySelector('button[aria-label*="Закрыть баннер" i], [class*="banner-picture-module__" i]')) {
        best = node;
      }
      if (isInsidePlayer(node) && best === node) return node;
      node = node.parentElement;
      steps += 1;
    }

    return best && isInsidePlayer(best) ? best : null;
  }

  function hideLikelyCornerAdOverlays(scope) {
    const playerRoots = findPlayerRoots(scope);
    playerRoots.forEach((player) => {
      if (!player || !player.querySelectorAll || isRtstUiElement(player)) return;
      const candidates = player.querySelectorAll([
        '[class*="banner" i]',
        '[class*="promo" i]',
        '[class*="advert" i]',
        '[class*="adfox" i]',
        '[id*="advert" i]',
        '[id*="adfox" i]',
        '[aria-label*="реклам" i]',
        'a[href*="adfox" i]',
        'a[href*="utm_medium=banner" i]',
        'a[href*="utm_campaign" i]'
      ].join(','));

      candidates.forEach((el) => {
        if (!el || isRtstUiElement(el) || isProtectedPlayerControl(el) || isProtectedHeader(el)) return;
        if (looksLikeCornerOverlayAd(el, player)) markPlayerAdHidden(el);
      });
    });
  }

  function findPlayerRoots(scope = document) {
    const roots = new Set();
    const source = scope && scope.querySelectorAll ? scope : document;
    if (isRtstUiElement(source)) return [];
    if (source !== document && containsVideoPlayer(source) && !isRtstUiElement(source)) roots.add(source);
    source.querySelectorAll('video, [class*="wdp-player"], [class*="video-player"], [class*="VideoPlayer"], [id*="player"], [data-testid*="player" i]').forEach((el) => {
      if (isRtstUiElement(el)) return;
      const root = el.closest('[class*="wdp-player"], [class*="video-player"], [class*="VideoPlayer"], [id*="player"], [data-testid*="player" i]') || el.parentElement;
      if (root && !isRtstUiElement(root)) roots.add(root);
    });
    return [...roots];
  }

  function looksLikeCornerOverlayAd(el, player) {
    const label = normalize([el.className, el.id, el.getAttribute && el.getAttribute('aria-label'), el.textContent].join(' '));
    const href = normalize(el.href || (el.getAttribute && el.getAttribute('href')) || '');
    const adWords = ['реклам', 'advert', 'adfox', 'promo', 'banner', 'sponsor', 'utm medium banner', 'utm campaign'];
    if (!adWords.some((word) => label.includes(word) || href.includes(word.replace(/ /g, '_')) || href.includes(word))) return false;

    try {
      const pr = player.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      if (!pr.width || !pr.height || !r.width || !r.height) return true;
      const inside = r.left >= pr.left - 6 && r.right <= pr.right + 6 && r.top >= pr.top - 6 && r.bottom <= pr.bottom + 6;
      if (!inside) return false;
      const smallEnough = r.width <= pr.width * 0.75 && r.height <= pr.height * 0.75;
      const inCorner = (r.left <= pr.left + pr.width * 0.38 || r.right >= pr.right - pr.width * 0.38) &&
        (r.top <= pr.top + pr.height * 0.38 || r.bottom >= pr.bottom - pr.height * 0.38);
      return smallEnough && inCorner;
    } catch (e) {
      return true;
    }
  }

  function isProtectedPlayerControl(el) {
    if (!el) return false;
    if (
      el.matches && (
        el.matches('button[aria-label*="Закрыть баннер" i], [role="button"][aria-label*="Закрыть баннер" i]') ||
        el.matches('[class*="communication-banner-module__" i], [class*="banner-picture-module__" i]')
      )
    ) return false;
    if (el.closest && el.closest('[class*="communication-banner-module__" i], [class*="banner-picture-module__" i]')) return false;
    return Boolean(el.closest('[class*="control" i], [class*="controls" i], [class*="progress" i], [class*="timeline" i], [class*="volume" i], [class*="fullscreen" i], [aria-label*="пауза" i], [aria-label*="воспроиз" i], [aria-label*="звук" i], [aria-label*="громк" i]'));
  }

  function markPlayerAdHidden(el) {
    Dom.mark(el, {
      className: 'rtst-player-ad-hidden',
      dataKey: 'rtstPlayerAdHidden',
      reason: 'реклама плеера',
      count: true,
      force: true
    });
  }

  function clickRutubeSkipButtons(root = document) {
    const scope = root && root.querySelectorAll ? root : document;
    const candidates = scope.querySelectorAll('button, [role="button"], a, [class*="activities-module__buttonSkip"]');

    for (const el of candidates) {
      if (!el || isRtstUiElement(el) || el.dataset.rtstSkipClicked === '1') continue;

      const text = normalize(el.textContent || '');
      const className = String(el.className || '');

      if (text === 'пропустить' || className.includes('activities-module__buttonSkip')) {
        try {
          el.dataset.rtstSkipClicked = '1';
          el.style.setProperty('pointer-events', 'auto', 'important');
          el.click();
          hiddenCount += 1;
        } catch (e) {}
      }
    }
  }

  function scanPage(reason = 'manual') {
    if (!document.body) return;
    if (Date.now() < suspendScanUntil) { scheduleScan('suspended', 120); return; }

    if (location.href !== lastUrl) {
      lastUrl = location.href;
      clearAllMarks();
      suspendScanUntil = Date.now() + 900;
      scheduleScan('route', 120);
      return;
    }

    syncRootFlags();
    createPanel();
    protectRtstUiFromCleanup(document);
    syncRutubePopupCloseProxy();
    hideBackgroundModeSubscriptionPopup(document);
    if (isEmbeddedRutubePlayer()) return;
    refreshLegacyControls();

    if (!settings.enabled) { syncRutubePopupCloseProxy(); clearAllMarks(); updateCounter(); return; }

    addCurrentChannelButton();
    addHomeButtonNearSubscribe();

    hiddenCount = removedCount;
    scanPlayerAds(document);
    hideBackgroundModeSubscriptionPopup(document);
    scanShowcaseBanners(document);

    if (isMyPage()) {
      if (settings.hideSideMenuPolitics || settings.cleanRutubeChrome) {
        scanNavigationLinks();
        cleanRutubeChrome();
        scanShowcaseBanners(document);
        reorderSidebar();
      }
      applyHiddenVisibility();
      updateCounter();
      return;
    }

    if (isSearchPage()) {
      scanCards({ skipShorts: true });
      scanSearchTrashCards();
      cleanSearchShortsTab();
      hideSearchShortsCardsSafe();
      if (settings.hideSideMenuPolitics || settings.cleanRutubeChrome) {
        cleanRutubeChromeSearchSafe();
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
      scanShowcaseBanners(document);
      reorderSidebar();
    }
    hideShortsBlocks();
    if (settings.cleanWatchPage) cleanWatchPage();
    if (settings.disableAutoplay) scanAutoplayVideos();

    applyHiddenVisibility();
    updateCounter();
  }

  function cleanSearchShortsTab() {
    if (!isSearchPage()) return;

    try {
      document.querySelectorAll('[data-rtst-search-shorts-tab="1"]').forEach((tab) => {
        if (!settings.enabled || !settings.hideShorts) {
          tab.style.removeProperty('display');
          tab.removeAttribute('data-rtst-search-shorts-tab');
          tab.removeAttribute('data-rtst-reason');
        }
      });
    } catch (e) {}

    if (!settings.enabled || !settings.hideShorts) return;

    try {
      document.querySelectorAll('.search-filters-module__searchFiltersBase button[role="tab"], .search-filters-module__searchFiltersBase [role="tab"]').forEach((tab) => {
        const text = normalize(tab.textContent || '');
        const id = normalize(tab.id || '');
        const controls = normalize(tab.getAttribute('aria-controls') || '');

        if (text !== 'shorts' && !id.includes('shorts') && !controls.includes('shorts')) return;

        // Нежно прячем только сам таб Shorts. Не трогаем общий контейнер фильтров,
        // иначе RUTUBE на первом рендере может решить, что результатов тоже не надо.
        tab.dataset.rtstSearchShortsTab = '1';
        tab.dataset.rtstReason = 'скрыто, вкладка Shorts в поиске';
        tab.style.setProperty('display', 'none', 'important');
      });
    } catch (e) {}
  }

  function clearSearchShortsMarks(root = document) {
    const scope = root && root.querySelectorAll ? root : document;
    try {
      scope.querySelectorAll('.rtst-search-shorts-hidden,[data-rtst-search-shorts="1"]').forEach((el) => {
        el.classList.remove('rtst-search-shorts-hidden', 'rtst-hidden', 'rtst-dim');
        el.removeAttribute('data-rtst-search-shorts');
        el.removeAttribute('data-rtst-hidden');
        el.removeAttribute('data-rtst-hide-target');
        el.removeAttribute('data-rtst-reason');
      });
    } catch (e) {}
  }

  function findSearchShortsHideTarget(card, link) {
    if (!card || !link || isRtstUiElement(card) || isRtstUiElement(link)) return null;

    const candidates = [
      link.closest('article'),
      link.closest('li'),
      link.closest('[data-testid*="card" i]'),
      link.closest('[class*="card" i]'),
      link.closest('[class*="tile" i]'),
      link.closest('[class*="item" i]'),
      card
    ].filter(Boolean);

    for (const candidate of candidates) {
      if (!candidate || isRtstUiElement(candidate) || isProtectedHeader(candidate) || isInsidePlayer(candidate)) continue;
      const tag = candidate.tagName ? candidate.tagName.toLowerCase() : '';
      if (['html', 'body', 'main', 'header', 'footer', 'nav', 'aside', 'section'].includes(tag)) continue;
      if (candidate.closest && candidate.closest('main.rtst-chrome-hidden, [role="main"].rtst-chrome-hidden')) continue;

      const linkCount = candidate.querySelectorAll ? candidate.querySelectorAll('a[href]').length : 0;
      const videoLinkCount = candidate.querySelectorAll ? candidate.querySelectorAll('a[href*="/video/"], a[href*="/shorts/"], a[href*="/plst/"]').length : 0;
      const shortsLinkCount = candidate.querySelectorAll ? candidate.querySelectorAll('a[href*="/shorts/"]').length : 0;
      const textLen = (candidate.textContent || '').trim().length;

      // На мобильном поиске RUTUBE легко спрятать весь контейнер выдачи.
      // Поэтому режем только явную маленькую карточку Shorts, а не общий список/секцию.
      if (shortsLinkCount < 1) continue;
      if (videoLinkCount > 1 || linkCount > 5 || textLen > 1200) continue;
      if (isDangerousHideTarget(candidate)) continue;

      return candidate;
    }

    return null;
  }

  function hideSearchShortsCardsSafe() {
    if (!isSearchPage()) return;

    if (!settings.enabled || !settings.hideShorts) {
      clearSearchShortsMarks(document);
      return;
    }

    Dom.qsa('a[href*="/shorts/"]').forEach((link) => {
      if (!link || isRtstUiElement(link) || link.closest('[data-rtst-search-shorts="1"]')) return;
      const card = findCard(link);
      const target = findSearchShortsHideTarget(card, link);
      if (!target) return;

      if (target.dataset.rtstSearchShorts !== '1') hiddenCount += 1;
      target.dataset.rtstSearchShorts = '1';
      target.dataset.rtstHidden = '1';
      target.dataset.rtstHideTarget = '1';
      target.dataset.rtstReason = 'скрыто, Shorts';
      target.classList.add('rtst-search-shorts-hidden');
      Dom.applyHiddenMode(target);
    });
  }

  function getSearchTrashReason(info) {
    if (!settings.dimSearchTrash || !isSearchPage() || !info) return '';

    const title = normalize(info.title || '');
    const text = normalize(info.text || '');
    const haystack = `${title} ${text}`;

    if (haystack.includes('стоит ли смотреть')) return 'стоит ли смотреть';

    const patterns = [
      { label: 'обзор', re: /(^|[^a-zа-я0-9])обзор(?:ы|ов|а|е)?([^a-zа-я0-9]|$)/i },
      { label: 'трейлер', re: /(^|[^a-zа-я0-9])трейлер(?:ы|ов|а|е)?([^a-zа-я0-9]|$)/i },
      { label: 'отзыв', re: /(^|[^a-zа-я0-9])отзыв(?:ы|ов|а|е)?([^a-zа-я0-9]|$)/i },
      { label: 'разбор', re: /(^|[^a-zа-я0-9])разбор(?:ы|ов|а|е)?([^a-zа-я0-9]|$)/i }
    ];

    const match = patterns.find((item) => item.re.test(haystack));
    return match ? match.label : '';
  }

  function markSearchTrashCard(card, reason) {
    if (!card || isRtstUiElement(card) || card.dataset.rtstHidden === '1') return;

    const target = findBestHideTarget(card) || card;
    if (!target || isRtstUiElement(target) || isDangerousHideTarget(target)) return;

    target.dataset.rtstSearchTrash = '1';
    target.dataset.rtstSearchTrashReason = `мусор: ${reason}`;
    target.classList.add('rtst-search-trash');
  }

  function clearSearchTrashMarks(root = document) {
    const scope = root && root.querySelectorAll ? root : document;
    try {
      scope.querySelectorAll('.rtst-search-trash,[data-rtst-search-trash="1"]').forEach((el) => {
        el.classList.remove('rtst-search-trash');
        el.removeAttribute('data-rtst-search-trash');
        el.removeAttribute('data-rtst-search-trash-reason');
      });
    } catch (e) {}
  }

  function scanSearchTrashCards() {
    if (!isSearchPage()) return;

    if (!settings.dimSearchTrash) {
      clearSearchTrashMarks(document);
      return;
    }

    const cards = [...document.querySelectorAll('article, [data-pos-num], [class*="card-wrapper" i], [class*="CardWrapper" i]')];

    for (const card of cards) {
      if (!card || isRtstUiElement(card) || card.dataset.rtstHidden === '1') continue;
      const link = [...card.querySelectorAll('a[href]')].find((a) => isVideoLikeLink(a));
      if (!link) continue;

      const info = readCardInfo(card, link);
      const reason = getSearchTrashReason(info);
      if (reason) markSearchTrashCard(card, reason);
      else {
        card.classList.remove('rtst-search-trash');
        card.removeAttribute('data-rtst-search-trash');
        card.removeAttribute('data-rtst-search-trash-reason');
      }
    }
  }

  function scanCards(options = {}) {
    const skipShorts = Boolean(options && options.skipShorts);
    const links = Array.from(document.querySelectorAll('a[href]')).filter((a) => isVideoLikeLink(a) || isChannelLikeLink(a));
    for (const link of links) {
      const card = findCard(link);
      if (!card || card.closest('#rtst-panel')) continue;
      applyWatchProgressBadge(card, link);
      if (card.dataset.rtstProcessed === '1') continue;
      card.dataset.rtstProcessed = '1'; card.dataset.rtstCard = '1';
      const info = readCardInfo(card, link);
      addBlockChannelButton(card, info.channel);
      const reason = getBlockReason(info, { skipShorts });
      if (reason) hideElement(card, reason);
    }
  }

  function containsVideoPlayer(el) {
    if (!el || !el.querySelector || isRtstUiElement(el)) return false;
    return Boolean(el.querySelector('video, iframe, [class*="wdp-player"], [class*="video-player"], [class*="VideoPlayer"]'));
  }

  function isInsidePlayer(el) { 
    if (!el || isRtstUiElement(el)) return false;
    return Boolean(el.closest('video, iframe, [class*="wdp-player"], [class*="video-player"], [class*="VideoPlayer"], [id*="player"], [data-testid*="player" i]')); 
  }

  function isVideoPage() { return /^\/video\//.test(location.pathname); }
  function isPlaylistPage() { return /^\/plst\//.test(location.pathname); }
  function isHomePage() { return location.pathname === '/' || location.pathname === ''; }
  function isHomeFeedPage() { return /^\/feeds\/new_main_page(?:\/|$)/.test(location.pathname); }
  function isMoviesSerialsPage() { return /^\/feeds\/movies-serials(?:\/|$)/.test(location.pathname); }
  function isChannelPage() { return /^\/channel\//.test(location.pathname) || /^\/video\/person\//.test(location.pathname) || /^\/u\//.test(location.pathname); }
  function isEmbeddedRutubePlayer() {
    try {
      return window.self !== window.top || /^\/play\/embed\//.test(location.pathname) || /^\/embed\//.test(location.pathname);
    } catch (e) {
      return true;
    }
  }
  function isWatchPage() { return isVideoPage() || isPlaylistPage(); }
  function isMyPage() { return /^\/my(?:\/|$)/.test(location.pathname); }
  function isSearchPage() { return /^\/search(?:\/|$)/.test(location.pathname); }
  function isProtectedHeader(el) { return Boolean(el && el.closest('header, [role="banner"], .wdp-header-module__header, [class*="header-module__header"], [class*="Header-module__header"]')); }

  function cleanWatchPage() {
    if (!isWatchPage()) return;
    addHomeButtonNearSubscribe();
    hideWatchRecommendationsBySelector();
    hideSafeModeVideoBanner();
    hideRutubeSelfPromo();
  }

  function hideWatchRecommendationsBySelector() {
    if (!isWatchPage()) return;
    const selectors = [
      '.wdp-see-also-module__wrapper', '.additional-recommendations-module__section',
      'section[aria-label="Рекомендации" i]', 'aside[aria-label="Рекомендации" i]',
      'section[aria-label="Дополнительные рекомендации" i]', 'aside[aria-label="Дополнительные рекомендации" i]',
      '.video-page-layout-module__right', '.video-page-layout-module__side'
    ];
    document.querySelectorAll(selectors.join(',')).forEach((el) => {
      if (!el || isRtstUiElement(el) || isInsidePlayer(el) || containsVideoPlayer(el) || isProtectedHeader(el)) return;
      if (el.closest('section[aria-label="блок действий" i], section[aria-label="информация о видео" i], section[aria-label="описание видео" i]')) return;
      const target =
        el.closest('.additional-recommendations-module__section') ||
        el.closest('.wdp-see-also-module__wrapper') ||
        el.closest('.video-page-layout-module__right') ||
        el.closest('.video-page-layout-module__side') ||
        el;
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

  function hideSafeModeVideoBanner() {
    if (!isWatchPage()) return;

    // Важно: скрываем только сам баннер безопасного режима.
    // Не ищем родителей через :has(img) и не используем findSmallViewTarget(),
    // иначе можно зацепить контейнер страницы и получить пустой экран вместо видео.
    document.querySelectorAll('[class*="safe-mode-video-banner-module__banner"]').forEach((el) => {
      if (!el || isRtstUiElement(el) || isInsidePlayer(el) || containsVideoPlayer(el) || isProtectedHeader(el)) return;
      softHideViewElement(el, 'баннер безопасного режима');
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

  function hideRutubeSelfPromo() {
    const promoWords = ['отключить рекламу', 'смотреть без рекламы', 'подписка', '99 ₽', '99 рублей', 'rutube premium', 'premium'];
    document.querySelectorAll('div,section,aside,article').forEach((el) => {
      if (isRtstUiElement(el) || isInsidePlayer(el) || containsVideoPlayer(el)) return;
      const text = normalize(el.textContent || '');
      if (!text || text.length > 900) return;
      const match = containsBlocked(text, promoWords);
      if (!match) return;
      const target = findSmallViewTarget(el);
      softHideViewElement(target, `самореклама: ${match}`);
    });
  }

  function findWatchBlockTarget(el) {
    let target = el;
    for (let i = 0; i < 6 && target && target.parentElement; i++) {
      const parent = target.parentElement;
      if (!parent || parent === document.body || parent === document.documentElement) break;
      if (isRtstUiElement(parent) || isInsidePlayer(parent) || containsVideoPlayer(parent)) break;
      
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
      if (isRtstUiElement(parent) || isInsidePlayer(parent) || containsVideoPlayer(parent)) break;
      
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
    if (!el || el === document.body || el === document.documentElement) return;
    const tag = el.tagName ? el.tagName.toLowerCase() : '';
    if (['main', 'header', 'footer', 'nav'].includes(tag) || isInsidePlayer(el) || containsVideoPlayer(el)) return;
    Dom.mark(el, { className: 'rtst-view-hidden', dataKey: 'rtstViewHidden', reason });
  }

  function scanNavigationLinks() {
    const navWords = ['новости и сми', 'разговоры о важном', 'тв онлайн', 'rutube tv', 'rutube x premier', 'rutube x start', 'телеканалы', 'чм-2026', 'чм 2026', 'чемпионат мира', 'первый канал', 'россия 1', 'россия 24', 'рен тв', 'звезда', 'нтв', 'известия', 'царьград', 'соловьев live', 'соловьёв live', 'лдпр тв'];
    if (settings.hideShorts) navWords.push('shorts', 'шортсы');
    document.querySelectorAll('a[href]').forEach((a) => {
      if (a.closest('#rtst-panel')) return;
      const match = containsBlocked(compactText(a), navWords);
      if (match) softHideChromeElement(a.closest('li, [role="listitem"], [class*="item"], [class*="Item"]') || a, `раздел: ${match}`);
    });
  }


  function hideDuplicateMyRootLink() {
    const mySection = document.querySelector('section[aria-label="Моё" i]');
    const links = document.querySelectorAll('a[href="/my/"], a[href^="/my/?"], a[href^="/my/#"]');

    links.forEach((a) => {
      if (!a || a.closest('#rtst-panel')) return;

      const wasHiddenByRtst = a.dataset && a.dataset.rtstReason === 'скрыто, дубль: Моё';

      if (!mySection) {
        if (wasHiddenByRtst) {
          a.classList.remove('rtst-chrome-hidden');
          a.removeAttribute('data-rtst-chrome-hidden');
          a.removeAttribute('data-rtst-reason');
        }
        return;
      }

      if (a.closest('section[aria-label="Моё" i]')) return;

      forceHideChromeElement(a, 'дубль: Моё');
    });
  }

  function cleanRutubeChromeSearchSafe() {
    // На странице поиска особенно на реальном мобильном RUTUBE нельзя запускать общую
    // зачистку chrome-элементов: широкие селекторы и подъём к родителям иногда цепляют
    // основной контейнер выдачи и оставляют чёрный экран. Здесь чистим только явно
    // служебные элементы шапки/меню, не трогая main и карточки результатов.
    const safeSelectors = [
      '.wdp-header-right-module__wrapper .wdp-notification-bell-module__mobileS',
      '.wdp-header-right-module__wrapper .wdp-notification-bell-module__desktop',
      '.wdp-header-right-module__wrapper [class*="wdp-notification-bell-module__"]',
      '.wdp-header-right-module__wrapper [class*="safe-mode-header-entrypoint-module__button"]',
      '.wdp-header-right-module__wrapper [class*="premium-subscription-entrypoint-module__"]',
      '.menu-divider-module__divider',
      'hr.menu-divider-module__divider',
      'button.menu-collapse-module__collapse-trigger[name="По темам"]',
      'button[name="По темам"][aria-roledescription*="по темам" i]',
      'section.menu-auth-section-module__container:not(:has(a[href="/my/"]))',
      'a[href^="https://rutube.sport/"]',
      'a[href^="//rutube.sport/"]',
      'a.menu-item-module__menu-item[href="/feeds/premier/"]',
      'a.menu-item-module__menu-item[href="/feeds/start/"]',
      'a.menu-item-module__menu-item[href="/for_creators"]',
      'a.menu-item-module__menu-item[href="/for_creators/"]',
      'a.menu-item-module__menu-item[href="/feeds/live/"]',
      'a.menu-item-module__menu-item[href="/feeds/travel/"]',
      'a.menu-item-module__menu-item[href="/feeds/stream/"]',
      'a.menu-item-module__menu-item[href="/feeds/sport/"]',
      'a.menu-item-module__menu-item[href="/feeds/kids/"]',
      'a.menu-item-module__menu-item[href="/feeds/chempionat-mira-po-futbolu-2026/"]',
      'a.menu-item-module__menu-item[href="/info/faq/"]',
      'a.menu-item-module__menu-item[href^="/forms/problem/"]',
      'a.menu-item-module__menu-item[href^="https://max.ru/rutube_support_bot"]',
      'a[href="/smarttv/"]',
      'a[href="/info/about_company/"]',
      'a[href="/info/activities/"]',
      'a[href="/info/agreement/"]',
      'a[href="/info/privacy/"]',
      'a[href="/info/legal/"]',
      'a[href="/info/recomlegal/"]',
      'a[href="https://rutube.ru/brand/"]',
      'a.wdp-mobile-menu-module__mobile-menu-item[href="/categories/"]',
      'a.wdp-mobile-menu-module__mobile-menu-item[href="/feeds/travel/"]',
      'a.wdp-mobile-menu-module__mobile-menu-item[href="/feeds/stream/"]',
      'a.wdp-mobile-menu-module__mobile-menu-item[href="/feeds/sport/"]',
      'a.wdp-mobile-menu-module__mobile-menu-item[href="/feeds/kids/"]',
      'a.wdp-mobile-menu-module__mobile-menu-item[href="/feeds/chempionat-mira-po-futbolu-2026/"]'
    ];

    try {
      document.querySelectorAll(safeSelectors.join(',')).forEach((el) => {
        if (!el || isRtstUiElement(el)) return;
        const target = el.matches('a[href], button, [role="link"], [role="button"]') ? findChromeItemTarget(el) : el;
        forceHideSearchChromeElement(target, 'элемент интерфейса rutube');
      });
    } catch (e) {}

    const searchBlockHeadings = ['rutube всегда с вами', 'cкачать приложения', 'скачать приложения', 'больше от rutube', 'rutube в других соцсетях'];

    document.querySelectorAll('section[aria-label*="качать приложения" i], section[aria-label*="скачать приложения" i], section[class*="menu-app-section" i]').forEach((section) => {
      forceHideSearchChromeElement(section, 'блок: rutube всегда с вами');
    });

    document.querySelectorAll('ul[class*="menu-guide-section" i], ul[class*="menu-info-section" i], ul[class*="menu-social" i], ul[aria-label="Секция инструкции" i], ul[aria-label*="социальных сетях" i]').forEach((list) => {
      const section = list.closest('section[class*="menu-section-module__section"], section') || list;
      forceHideSearchChromeElement(section, 'блок: приложения/справка rutube');
    });

    document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,div').forEach((el) => {
      if (!el || isRtstUiElement(el)) return;
      const raw = String(el.textContent || '').trim();
      if (!raw || raw.length > 80) return;
      const text = normalize(raw);
      const match = searchBlockHeadings.find((heading) => text === normalize(heading));
      if (!match) return;
      const section = el.closest('section[class*="menu-section-module__section"], section');
      forceHideSearchChromeElement(section || findChromeBlockTarget(el), `блок: ${match}`);
    });

    hideDuplicateMyRootLink();
  }

  function forceHideSearchChromeElement(el, reason) {
    if (!el || isRtstUiElement(el) || isProtectedHeader(el) || isInsidePlayer(el) || containsVideoPlayer(el)) return;
    const tag = el.tagName ? el.tagName.toLowerCase() : '';
    if (el === document.body || el === document.documentElement || tag === 'main' || el.getAttribute('role') === 'main') return;

    const className = String(el.className || '');
    const ariaLabel = normalize(el.getAttribute('aria-label') || '');
    const text = normalize(el.textContent || '');
    const isMenuish = /menu|sidebar|drawer|navigation|guide|info|app-section|links/i.test(className)
      || Boolean(el.closest('[class*="menu" i], [class*="sidebar" i], [class*="drawer" i], aside, nav'))
      || ariaLabel.includes('скачать приложения')
      || ariaLabel.includes('cкачать приложения')
      || text === 'rutube всегда с вами'
      || text === 'больше от rutube'
      || text === 'rutube в других соцсетях';

    if (tag === 'section' && !isMenuish) return;
    if (!isMenuish && isInsideSearchResults(el)) return;

    forceHideChromeElement(el, reason);
  }

  function isInsideSearchResults(el) {
    if (!el || !el.closest) return false;
    if (el.closest('[class*="menu" i], [class*="sidebar" i], [class*="drawer" i], aside, nav')) return false;
    return Boolean(el.closest(
      'main, [role="main"], [data-rtst-card="1"], article, [data-pos-num], [class*="search" i], [class*="Search"], [class*="card" i], [class*="Card"]'
    ));
  }

  function cleanRutubeChrome() {
    const exactItems = ['rutube для блогеров', 'rutube x premier', 'rutube x start', 'активировать промокод', 'по темам', 'детям', 'вопросы и ответы', 'сообщить о проблеме', 'письмо в поддержку', 'поддержка в max', 'help@rutube.ru', 'о rutube', 'направления деятельности', 'пользовательское соглашение', 'конфиденциальность', 'правовая информация', 'рекомендательная система', 'фирменный стиль'];
    const blockHeadings = ['rutube всегда с вами', 'cкачать приложения', 'скачать приложения', 'больше от rutube', 'rutube в других соцсетях'];

    document.querySelectorAll('.wdp-onboardings-inventory-banner-module__wrapper-section, section[class*="onboardings-inventory-banner-module__wrapper-section"]').forEach((banner) => {
      if (!isRtstUiElement(banner)) forceHideChromeElement(banner, 'баннер rutube');
    });

    document.querySelectorAll('.wdp-video-carousel-module__outer').forEach((carousel) => {
      if (isRtstUiElement(carousel)) return;
      const hasPromo = Boolean(carousel.querySelector(
        'img[src*="/promoitem/"], [data-slide*="промобаннер" i], a[href*="utm_medium=banner"], a[href*="utm_campaign="], a[href^="https://www.afisha.ru/"]'
      ));
      if (hasPromo) forceHideChromeElement(carousel, 'промо-карусель rutube');
    });

    document.querySelectorAll('a[href*="/feeds/start/"], a[href*="/feeds/premier/"]').forEach((a) => {
      if (!a.closest('#rtst-panel')) softHideChromeElement(findChromeItemTarget(a), 'пункт: rutube x start/premier');
    });

    document.querySelectorAll('a[href="/feeds/kids/"], a[href*="/feeds/kids/"]').forEach((a) => {
      if (!a.closest('#rtst-panel')) softHideChromeElement(findChromeItemTarget(a), 'пункт: детям');
    });

    hideDuplicateMyRootLink();

    document.querySelectorAll('a[href="/feeds/chempionat-mira-po-futbolu-2026/"], a[href*="/feeds/chempionat-mira-po-futbolu-2026/"]').forEach((a) => {
      if (!a.closest('#rtst-panel')) softHideChromeElement(findChromeItemTarget(a), 'пункт: чм-2026');
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
      if (isRtstUiElement(el)) return;
      const text = normalize(el.textContent || el.getAttribute('aria-label') || '');
      const match = text && exactItems.find((item) => text === normalize(item));
      if (match) softHideChromeElement(findChromeItemTarget(el), `пункт: ${match}`);
    });

    document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,div').forEach((el) => {
      if (isRtstUiElement(el)) return;
      const raw = String(el.textContent || '').trim();
      if (!raw || raw.length > 80) return;
      const text = normalize(raw);
      const match = blockHeadings.find((heading) => text === normalize(heading));
      if (match) softHideChromeElement(findChromeBlockTarget(el), `блок: ${match}`);
    });

    // Очистка нежелательных вкладок на главной странице (Оставляем только нужное)
    if (isHomePage() || isHomeFeedPage()) {
      const goodTabs = ['главная', 'фильмы', 'сериалы'];
      document.querySelectorAll('[role="tablist"] button[role="tab"]').forEach(tab => {
        const text = normalize(tab.textContent || '');
        // Если текст вкладки НЕ входит в белый список — скрываем её
        if (!goodTabs.includes(text) && text !== '') {
          tab.style.setProperty('display', 'none', 'important');
        }
      });
    }

    // Раздел «Кино и сериалы»: оставляем только базовые вкладки каталога.
    if (isMoviesSerialsPage()) {
      const goodMovieTabs = ['главная', 'фильмы', 'сериалы'];
      document.querySelectorAll('[role="tablist"] button[role="tab"]').forEach((tab) => {
        const text = normalize(tab.textContent || '');
        if (!text || goodMovieTabs.includes(text)) return;
        tab.style.setProperty('display', 'none', 'important');
        tab.dataset.rtstChromeHidden = '1';
        tab.dataset.rtstReason = 'скрыто, вкладка каталога';
      });
    }
  }

  function softHideChromeElement(el, reason) {
    if (!el || containsCoreMenuText(normalize(el.textContent || ''))) return;
    Dom.mark(el, { className: 'rtst-chrome-hidden', dataKey: 'rtstChromeHidden', reason });
  }

  function forceHideChromeElement(el, reason) {
    Dom.mark(el, {
      className: 'rtst-chrome-hidden',
      dataKey: 'rtstChromeHidden',
      reason,
      force: true
    });
  }

  function findChromeItemTarget(el) {
    const direct = el.closest('li, [role="listitem"]');
    if (direct && !containsCoreMenuText(normalize(direct.textContent || ''))) return direct;
    let target = el;
    for (let i = 0; i < 5 && target && target.parentElement; i++) {
      const parent = target.parentElement;
      if (!parent || parent === document.body || parent === document.documentElement || isRtstUiElement(parent)) break;
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
      if (!parent || parent === document.body || parent === document.documentElement || isRtstUiElement(parent)) break;
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
    if (el.id === 'rtst-panel' || isRtstUiElement(el)) return false;

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

  function getBlockReason(info, options = {}) {
    if (settings.hideShorts && info.isShort && !(options && options.skipShorts)) return 'shorts';
    const channelMatch = info.channel && containsBlocked(info.channel, allBlockedChannels());
    if (channelMatch) return `канал: ${channelMatch}`;
    const wordMatch = containsBlocked(info.text, allBlockedWords());
    if (wordMatch) return `слово: ${wordMatch}`;
    return '';
  }

  function hideElement(el, reason) {
    if (!el || isRtstUiElement(el) || isProtectedHeader(el)) return;
    const target = findBestHideTarget(el);
    if (!target || target.closest('#rtst-panel') || isDangerousHideTarget(target)) return;

    if (target.dataset.rtstHidden !== '1') hiddenCount += 1;
    target.dataset.rtstHidden = '1';
    target.dataset.rtstHideTarget = '1';
    Dom.setReason(target, reason);
    if (target !== el) el.dataset.rtstHiddenChild = '1';
    Dom.applyHiddenMode(target);
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
      if (!parent || parent === document.body || parent === document.documentElement || isRtstUiElement(parent)) break;
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
      if (!parent || parent === document.body || parent === document.documentElement || isRtstUiElement(parent)) break;
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
    Dom.qsa('[data-rtst-hidden="1"]').forEach((el) => Dom.applyHiddenMode(el));
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

  function detectCurrentVideoChannelUrl() {
    const selectors = [
      'section[aria-label="блок действий" i] a[href^="/video/person/"]',
      'section[aria-label="блок действий" i] a[href^="/channel/"]',
      'a[href^="/video/person/"]',
      'a[href^="/channel/"]'
    ];
    for (const selector of selectors) {
      const link = document.querySelector(selector);
      if (!link || isRtstUiElement(link) || isInsidePlayer(link)) continue;
      const href = String(link.getAttribute('href') || '').trim();
      const text = String(link.textContent || '').trim();
      if (href && href !== location.pathname && (text || /\/channel\/|\/video\/person\//.test(href))) return href;
    }
    return '';
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
    const oldBtn = document.getElementById('rtst-current-channel-btn');
    if (oldBtn) oldBtn.remove();
  }

  function mutationTouchesRutubeContent(mutations) {
    for (const mutation of mutations) {
      if (!mutation || mutation.type !== 'childList') continue;

      const nodes = [...(mutation.addedNodes || []), ...(mutation.removedNodes || [])];
      for (const node of nodes) {
        if (!node || node.nodeType !== 1) continue;
        if (isRtstUiElement(node)) continue;

        const tag = (node.tagName || '').toLowerCase();
        if (tag === 'script' || tag === 'style' || tag === 'link' || tag === 'meta') continue;

        return true;
      }
    }

    return false;
  }

  function installDomObserver() {
    if (observer) observer.disconnect();

    const root = document.body || document.documentElement;
    if (!root || typeof MutationObserver !== 'function') {
      setTimeout(() => scheduleScan('observer-fallback', 400), 400);
      return;
    }

    observer = new MutationObserver((mutations) => {
      if (!settings.enabled && location.href === lastUrl) return;
      if (!mutationTouchesRutubeContent(mutations)) return;
      scheduleScan('mutation', 140);
    });

    observer.observe(root, { childList: true, subtree: true });
  }

  function installRouteWatcher() {
    const KEY = '__rtstRouteWatcherV140';
    if (window[KEY]) return;
    window[KEY] = true;

    const notify = () => scheduleScan('route', 90);

    ['pushState', 'replaceState'].forEach((method) => {
      const nativeMethod = history[method];
      if (typeof nativeMethod !== 'function' || nativeMethod.__rtstPatched) return;

      history[method] = function rtstHistoryPatch() {
        const result = nativeMethod.apply(this, arguments);
        notify();
        return result;
      };

      history[method].__rtstPatched = true;
      history[method].__rtstOriginal = nativeMethod;
    });

    window.addEventListener('popstate', notify, true);
    window.addEventListener('hashchange', notify, true);
    window.addEventListener('focus', () => scheduleScan('focus', 260), true);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) scheduleScan('visible', 220);
    }, true);
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
        try { this.dataset.rtstAutoplayBlockedAt = String(Date.now()); } catch (e) {}
        try { this.pause(); } catch (e) {}
        return Promise.reject(new DOMException('Autoplay prevented by Рутубочист', 'AbortError'));
      }
      if (Date.now() - lastUserGestureAt < 5000) this.dataset.rtstManualStarted = '1';
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
    const recentUserGesture = now - lastUserGestureAt < 5000;
    if (recentUserGesture) return false;
    if (video.dataset && video.dataset.rtstManualStarted === '1') return false;

    if (isPinnedChannelVideo(video)) return true;
    if (lastVideoEndedAt && now < nextAutoplayBlockUntil) return true;

    // На странице просмотра RUTUBE часто стартует видео программно. Если пользователь
    // не касался плеера/клавиатуры, считаем это автовоспроизведением и гасим.
    if (isVideoPage() || isEmbeddedRutubePlayer()) return true;

    return false;
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
          if (Date.now() - lastUserGestureAt < 5000) {
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
        };

        video.addEventListener('loadstart', resetManualFlagForNextMedia, true);
        video.addEventListener('loadedmetadata', resetManualFlagForNextMedia, true);
        video.addEventListener('emptied', resetManualFlagForNextMedia, true);

        video.addEventListener('playing', () => {
          const now = Date.now();
          if (
            settings.disableAutoplay &&
            isPinnedChannelVideo(video) &&
            now - lastUserGestureAt > 5000 &&
            video.dataset.rtstManualStarted !== '1'
          ) {
            try { video.dataset.rtstAutoplayBlockedAt = String(Date.now()); } catch (e) {}
            try { video.pause(); } catch (e) {}
            return;
          }
          if (
            settings.disableAutoplay &&
            lastVideoEndedAt &&
            now < nextAutoplayBlockUntil &&
            now - lastUserGestureAt > 5000 &&
            video.dataset.rtstManualStarted !== '1'
          ) {
            try { video.dataset.rtstAutoplayBlockedAt = String(Date.now()); } catch (e) {}
            try { video.pause(); } catch (e) {}
          }
        }, true);
      }

      if (!video.paused && shouldBlockAutoplay(video)) {
        try { video.dataset.rtstAutoplayBlockedAt = String(Date.now()); } catch (e) {}
        try { video.pause(); } catch (e) {}
      }
    });
  }

  function boot() {
    installPlayOptionsAdvertStripper();
    installVpnPopupSuppressor();
    installRutubeContextMenuUnlocker();
    installMobileVideoVolumeSwipe();
    installAutoFullscreenOnRotate();
    installViewProgressTracker();
    loadPanelIconFromLocalCache();

    syncRootFlags();
    setupAutoplayGuard();
    addStyle();
    bindEvents();
    installRouteWatcher();
    installDomObserver();

    loadMovieDbFromLocalCache();
    setTimeout(checkGithubAvailability, 1500);
    setTimeout(() => refreshPanelIconCacheInBackground(false), 2200);
    setTimeout(maybeUpdateMovieDbInBackground, 3500);

    scheduleScan('boot', 0);
  }

  installPlayOptionsAdvertStripper();
  installRutubeContextMenuUnlocker();
  installMobileVideoVolumeSwipe();
  installAutoFullscreenOnRotate();
  installViewProgressTracker();
  loadPanelIconFromLocalCache();
  installVpnPopupSuppressor();
  setupAutoplayGuard();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();

})();
