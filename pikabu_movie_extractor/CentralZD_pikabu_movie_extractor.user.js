// ==UserScript==
// @name         Рутубочист: сборщик фильмов с Пикабу
// @namespace    https://github.com/npekpacHo/rutubochist
// @version      0.1.3
// @description  Извлекает из постов CentralZD названия фильмов, жанры и рейтинги в JSON-батч для Рутубочиста.
// @author       elekt_riki
// @license      MIT
// @match        https://pikabu.ru/story/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const UI_VERSION = '0.1.3';
  const BUTTON_ID = 'rtpm-extract-btn';
  const MODAL_ID = 'rtpm-modal';

  const GENRE_ALIASES = {
    'мелодрама': 'мелодрама',
    'драма': 'драма',
    'комедия': 'комедия',
    'боевик': 'боевик',
    'триллер': 'триллер',
    'ужасы': 'ужасы',
    'хоррор': 'ужасы',
    'фантастика': 'фантастика',
    'научная фантастика': 'фантастика',
    'фэнтези': 'фэнтези',
    'мультфильм': 'мультфильм',
    'анимация': 'мультфильм',
    'детектив': 'детектив',
    'криминал': 'криминал',
    'приключения': 'приключения',
    'семейный': 'семейный',
    'документальный': 'документальный',
    'биография': 'биография',
    'биографический': 'биография',
    'история': 'история',
    'исторический': 'история',
    'военный': 'военный',
    'вестерн': 'вестерн',
    'спорт': 'спорт',
    'музыка': 'музыка',
    'мюзикл': 'мюзикл'
  };

  const META_LABEL_SOURCE = '(?:Жанр(?:ы)?|Год|Режисс[её]р|В главных ролях|В ролях|Страна|IMDb|Rotten Tomatoes|Озвучка|КиноПоиск)';
  const META_LINE_RE = new RegExp(`^${META_LABEL_SOURCE}\\s*[:：]`, 'i');

  function addStyle() {
    if (document.getElementById('rtpm-style')) return;

    const style = document.createElement('style');
    style.id = 'rtpm-style';
    style.textContent = `
      #${BUTTON_ID} {
        position: fixed !important;
        right: 18px !important;
        bottom: 18px !important;
        z-index: 2147483000 !important;
        min-height: 38px !important;
        padding: 0 14px !important;
        border: 0 !important;
        border-radius: 999px !important;
        background: #1b1b1b !important;
        color: #fff !important;
        cursor: pointer !important;
        font: 700 13px/38px Arial, sans-serif !important;
        box-shadow: 0 8px 28px rgba(0,0,0,.28) !important;
      }

      #${BUTTON_ID}:hover {
        background: #333 !important;
      }

      .rtpm-backdrop {
        position: fixed !important;
        inset: 0 !important;
        z-index: 2147483100 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 18px !important;
        background: rgba(0,0,0,.58) !important;
        font-family: Arial, sans-serif !important;
      }

      .rtpm-modal {
        width: 920px !important;
        max-width: calc(100vw - 36px) !important;
        max-height: calc(100vh - 36px) !important;
        overflow: hidden !important;
        display: flex !important;
        flex-direction: column !important;
        border-radius: 12px !important;
        background: #fff !important;
        color: #111 !important;
        box-shadow: 0 22px 70px rgba(0,0,0,.42) !important;
      }

      .rtpm-head {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 12px !important;
        padding: 14px 16px !important;
        border-bottom: 1px solid rgba(0,0,0,.08) !important;
      }

      .rtpm-title {
        font: 800 17px/1.25 Arial, sans-serif !important;
      }

      .rtpm-subtitle {
        margin-top: 3px !important;
        color: #666 !important;
        font: 12px/1.35 Arial, sans-serif !important;
      }

      .rtpm-close {
        width: 32px !important;
        height: 32px !important;
        border: 0 !important;
        border-radius: 8px !important;
        background: #f0f0f0 !important;
        cursor: pointer !important;
        font: 800 18px/1 Arial, sans-serif !important;
      }

      .rtpm-body {
        overflow: auto !important;
        padding: 14px 16px 16px !important;
      }

      .rtpm-actions {
        display: flex !important;
        flex-wrap: wrap !important;
        gap: 8px !important;
        margin: 0 0 12px !important;
      }

      .rtpm-actions button {
        min-height: 32px !important;
        padding: 6px 10px !important;
        border: 1px solid rgba(0,0,0,.12) !important;
        border-radius: 8px !important;
        background: #111 !important;
        color: #fff !important;
        cursor: pointer !important;
        font: 700 12px/1.2 Arial, sans-serif !important;
      }

      .rtpm-actions button.rtpm-light {
        background: #f4f4f4 !important;
        color: #111 !important;
      }

      .rtpm-grid {
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) minmax(320px, .9fr) !important;
        gap: 12px !important;
      }

      @media (max-width: 820px) {
        .rtpm-grid {
          grid-template-columns: 1fr !important;
        }
      }

      .rtpm-preview {
        border: 1px solid rgba(0,0,0,.08) !important;
        border-radius: 10px !important;
        background: #fafafa !important;
        overflow: hidden !important;
      }

      .rtpm-preview-head {
        display: flex !important;
        justify-content: space-between !important;
        gap: 8px !important;
        padding: 9px 10px !important;
        border-bottom: 1px solid rgba(0,0,0,.06) !important;
        color: #555 !important;
        font: 700 12px/1.2 Arial, sans-serif !important;
      }

      .rtpm-list {
        padding: 8px 10px !important;
      }

      .rtpm-item {
        padding: 7px 0 !important;
        border-bottom: 1px solid rgba(0,0,0,.07) !important;
      }

      .rtpm-item:last-child {
        border-bottom: 0 !important;
      }

      .rtpm-movie-title {
        color: #111 !important;
        font: 800 13px/1.25 Arial, sans-serif !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }

      .rtpm-meta {
        margin-top: 3px !important;
        color: #444 !important;
        font: 12px/1.35 Arial, sans-serif !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }

      .rtpm-empty {
        padding: 14px !important;
        color: #666 !important;
        font: 13px/1.4 Arial, sans-serif !important;
      }

      .rtpm-textarea {
        width: 100% !important;
        min-height: 430px !important;
        resize: vertical !important;
        box-sizing: border-box !important;
        border: 1px solid rgba(0,0,0,.12) !important;
        border-radius: 10px !important;
        padding: 10px !important;
        background: #111 !important;
        color: #e8ffe8 !important;
        outline: none !important;
        font: 12px/1.4 Consolas, monospace !important;
      }

      .rtpm-note {
        margin: 10px 0 0 !important;
        color: #666 !important;
        font: 12px/1.35 Arial, sans-serif !important;
      }

      .rtpm-toast {
        position: fixed !important;
        right: 18px !important;
        bottom: 68px !important;
        z-index: 2147483200 !important;
        max-width: calc(100vw - 36px) !important;
        padding: 9px 12px !important;
        border-radius: 10px !important;
        background: rgba(0,0,0,.86) !important;
        color: #fff !important;
        font: 13px/1.35 Arial, sans-serif !important;
      }
    `;

    document.documentElement.appendChild(style);
  }

  function addButton() {
    if (document.getElementById(BUTTON_ID)) return;

    const btn = document.createElement('button');
    btn.id = BUTTON_ID;
    btn.type = 'button';
    btn.textContent = '🎬 Извлечь фильмы';
    btn.title = 'Собрать JSON-батч фильмов для Рутубочиста';
    btn.addEventListener('click', () => openModal(extractBatch()));
    document.documentElement.appendChild(btn);
  }

  function extractBatch() {
    const sourceUrl = cleanUrl(location.href);
    const sourceDate = detectSourceDate(sourceUrl) || todayIsoDate();
    const sourceTitle = `Что посмотреть от ${formatRuDate(sourceDate)}`;
    const text = pickPostText();
    const lines = normalizeLines(text);
    const items = parseMovies(lines, { sourceDate });

    return {
      version: 1,
      generator: `pikabu_movie_extractor ${UI_VERSION}`,
      id: `${sourceDate}-centralzd`,
      title: sourceTitle,
      date: sourceDate,
      sourceUrl,
      extractedAt: new Date().toISOString(),
      count: items.length,
      items
    };
  }

  function pickPostText() {
    const selected = String(window.getSelection && window.getSelection() || '').trim();
    if (selected.length > 80) return selected;

    const root = findPostRoot();
    if (!root) return document.body.innerText || document.body.textContent || '';

    const visible = String(root.innerText || '').trim();
    const complete = String(root.textContent || '').trim();

    // Иногда часть длинного поста остаётся в скрытом DOM. textContent берём
    // только тогда, когда в нём действительно найдено заметно больше карточек.
    return scorePostText(complete) > scorePostText(visible) + 12 ? complete : visible;
  }

  function findPostRoot() {
    const selectors = [
      '[itemprop="articleBody"]',
      '.story__content-inner',
      'article',
      '[data-testid*="story" i]',
      '[data-test-id*="story" i]',
      '.story',
      '.story__content',
      '.story__main',
      '.story-block',
      '.story-content',
      '[class*="story" i][class*="content" i]',
      '[class*="story" i][class*="main" i]'
    ];

    const candidates = [];

    for (const selector of selectors) {
      try {
        candidates.push(...document.querySelectorAll(selector));
      } catch (e) {}
    }

    const usable = uniqueElements(candidates)
      .filter((el) => el && !el.closest(`#${MODAL_ID}`) && !el.closest(`#${BUTTON_ID}`))
      .map((el) => ({
        el,
        text: String(el.innerText || el.textContent || '').trim()
      }))
      .filter((item) => item.text.length > 300);

    if (!usable.length) return document.body;

    // Главный признак нужного блока — количество реальных строк «Жанр:».
    // Идеально оформленные скобочки более не назначаются главным по посту.
    usable.sort((a, b) => {
      const scoreDiff = scorePostText(b.text) - scorePostText(a.text);
      return scoreDiff || b.text.length - a.text.length;
    });

    return usable[0].el;
  }

  function scorePostText(text) {
    const raw = String(text || '');
    const genreMatches = (raw.match(/(?:^|\n)\s*Жанр(?:ы)?\s*[:：]/gim) || []).length;
    const ratingMatches = (raw.match(/(?:^|\n)\s*(?:IMDb|КиноПоиск|Rotten Tomatoes)\s*[:：]/gim) || []).length;
    const titleHints = (raw.match(/(?:^|\n)[^\n]{2,180}\s+\/\s+[^\n]{2,180}(?:$|\n)/gm) || []).length;
    const yearMatches = (raw.match(/(?:19|20)\d{2}/g) || []).length;

    return genreMatches * 30
      + ratingMatches * 6
      + titleHints * 4
      + Math.min(yearMatches, 30)
      + Math.min(raw.length / 1000, 8);
  }

  function normalizeLines(text) {
    return String(text || '')
      .replace(/[\u00a0\u202f]/g, ' ')
      .replace(/[\u200b-\u200d\u2060\ufeff]/g, '')
      .replace(/\r/g, '\n')
      .split(/\n+/)
      .map((line) => line.replace(/[ \t]+/g, ' ').trim())
      .filter(Boolean);
  }

  function parseMovies(lines, context) {
    const items = [];
    let current = null;

    const pushCurrent = () => {
      if (isUsefulMovieItem(current)) {
        items.push(finalizeMovie(current, context));
      }
      current = null;
    };

    const startMovie = (title) => {
      pushCurrent();
      current = {
        title: title.title,
        originalTitle: title.originalTitle,
        year: title.year,
        genres: [],
        ratings: {}
      };
    };

    for (let i = 0; i < lines.length; i++) {
      const titleWindow = parseTitleWindow(lines, i);

      if (titleWindow) {
        startMovie(titleWindow.title);
        i += titleWindow.consumed - 1;
        continue;
      }

      const genres = parseGenres(lines[i]);

      // Если обычный проход не увидел заголовок, строка «Жанр:» помогает
      // восстановить его по ближайшим строкам выше. Служебные подписи
      // видеоплеера и разделители при этом полностью игнорируются.
      if (genres.length) {
        const recoveredTitle = findTitleBeforeMetadata(lines, i);

        if (recoveredTitle && !sameMovieTitle(current, recoveredTitle)) {
          startMovie(recoveredTitle);
        }
      }

      if (!current) continue;
      applyMetadata(current, lines[i]);
    }

    pushCurrent();
    return dedupeMovies(items);
  }

  function parseTitleWindow(lines, index) {
    const direct = parseTitleLine(cleanTitleSource(lines[index]));
    if (direct) {
      return { title: direct, consumed: 1 };
    }

    // Объединяем только соседние содержательные строки. Через длинный
    // разделитель, подпись YouTube или элементы видеоплеера склеивать нельзя:
    // именно так «Холод» однажды породил фильм «Холод Ястреб Лайфхак».
    for (let consumed = 2; consumed <= 3; consumed++) {
      const rawPart = lines.slice(index, index + consumed);
      if (rawPart.length < consumed) break;
      if (rawPart.some(isMetadataLine)) break;
      if (rawPart.some(isHardTitleBoundary)) break;

      const part = rawPart
        .map(cleanTitleSource)
        .filter(Boolean);

      if (part.length !== consumed) break;

      const combined = part.join(' ');
      const title = parseTitleLine(combined);

      if (title) {
        return { title, consumed };
      }
    }

    return null;
  }

  function findTitleBeforeMetadata(lines, index) {
    const candidates = [];

    for (let offset = 1; offset <= 7; offset++) {
      const raw = lines[index - offset];
      if (raw == null) break;
      if (isMetadataLine(raw)) break;

      const clean = cleanTitleSource(raw);

      if (clean) {
        const direct = parseTitleLine(clean);
        if (direct) return direct;
        candidates.unshift(clean);
      }

      if (isHardTitleBoundary(raw)) {
        break;
      }

      if (candidates.length >= 3) break;
    }

    // Редкий случай: русское и оригинальное названия реально лежат
    // в двух соседних текстовых узлах.
    for (let size = Math.min(3, candidates.length); size >= 2; size--) {
      const title = parseTitleLine(candidates.slice(-size).join(' '));
      if (title) return title;
    }

    return null;
  }

  function cleanTitleSource(line) {
    let clean = String(line || '')
      .replace(/[\u00a0\u202f]/g, ' ')
      .replace(/[\u200b-\u200d\u2060\ufeff]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!clean) return '';

    // Всё до последнего длинного разделителя относится к предыдущему
    // содержимому либо к оглавлению поста.
    const dividerRe = /(?:_{8,}|[━─]{8,}|[—–-]{10,})/g;
    const dividers = [...clean.matchAll(dividerRe)];

    if (dividers.length) {
      const divider = dividers[dividers.length - 1];
      clean = clean
        .slice(divider.index + divider[0].length)
        .trim();
    }

    clean = clean
      .replace(/^(?:YouTube|RUTUBE|Rutube|Видео)\s*[●•]?\s*\d{1,2}:\d{2}(?::\d{2})?\s*/i, '')
      .replace(/^[●•]\s*\d{1,2}:\d{2}(?::\d{2})?\s*/, '')
      .replace(/^(?:перейти к видео|воспроизвести видео|смотреть видео)\s*/i, '')
      .replace(/^(?:YouTube|RUTUBE|Rutube|Видео)\s*[●•]?\s*/i, '')
      .replace(/^(?:_{3,}|[━─]{3,}|[—–-]{6,})\s*/, '')
      .trim();

    if (isPlayerNoiseLine(clean)) return '';
    return clean;
  }

  function isHardTitleBoundary(line) {
    const raw = String(line || '').trim();

    return /(?:_{8,}|[━─]{8,}|[—–-]{10,})/.test(raw)
      || /^(?:YouTube|RUTUBE|Rutube|Видео)\s*[●•]?\s*\d{1,2}:\d{2}(?::\d{2})?/i.test(raw)
      || /^(?:перейти к видео|воспроизвести видео|смотреть видео)$/i.test(raw);
  }

  function isPlayerNoiseLine(line) {
    const clean = String(line || '').trim();

    return !clean
      || /^(?:YouTube|RUTUBE|Rutube|Видео)$/i.test(clean)
      || /^[●•]?\s*\d{1,2}:\d{2}(?::\d{2})?$/.test(clean)
      || /^(?:перейти к видео|воспроизвести видео|смотреть видео)$/i.test(clean)
      || /^(?:_{3,}|[━─]{3,}|[—–-]{6,})$/.test(clean);
  }

  function parseTitleLine(line) {
    const original = String(line || '').trim();
    let clean = cleanTitleSource(original);

    if (!clean || clean.length > 420 || isMetadataLine(clean)) return null;

    if (/^(?:читать дальше|показать полностью|свернуть|комментарии|подписаться|новинки кино|предыдущая часть|телеграм|в этом выпуске|бонус)\b/i.test(clean)) {
      return null;
    }

    if (/^(?:https?:\/\/|www\.)/i.test(clean)) return null;

    clean = clean
      .replace(/^(?:\d{1,2}\s*[.)]\s*|[-–—•]+\s*)/, '')
      .trim();

    // Год обязан находиться в последней скобочной группе. Поддерживаются:
    // (2026), (2025–2026), (2026 - ...), (2026 — …).
    const yearMatch = clean.match(
      /[\[(]\s*((?:19|20)\d{2})(?:\s*[-–—]\s*(?:(?:19|20)\d{2}|\.{3}|…))?\s*[\])]\s*(?:(?:WEB[- .]?DL|WEB[- .]?RIP|WEBRIP|BLU[- ]?RAY|BDRIP|HDRIP|дубляж|субтитры)\s*)*$/i
    );

    if (!yearMatch) return null;

    const year = Number(yearMatch[1]);
    let titlePart = clean
      .slice(0, yearMatch.index)
      .replace(/[\s,;:–—-]+$/g, '')
      .trim();

    if (!titlePart || /^\/|\/$/.test(titlePart)) return null;
    if (!looksLikeTitle(titlePart, true)) return null;

    const separator = titlePart.search(/\s+\/\s+/);
    const title = cleanTitle(
      separator >= 0 ? titlePart.slice(0, separator) : titlePart
    );
    const originalTitle = cleanTitle(
      separator >= 0 ? titlePart.slice(separator).replace(/^\s*\/\s*/, '') : ''
    );

    if (!title || title.length < 2) return null;

    return {
      title,
      originalTitle,
      year
    };
  }

  function looksLikeTitle(value, hasYear) {
    const clean = String(value || '').trim();

    if (!clean || clean.length < 2 || clean.length > 380) return false;
    if (isMetadataLine(clean)) return false;
    if (/[.!?]\s+[А-ЯA-ZЁ]/.test(clean)) return false;
    if (clean.split(/\s+/).length > (hasYear ? 42 : 20)) return false;
    if (!/[A-Za-zА-Яа-яЁё]/.test(clean)) return false;
    if (/^(?:описание|сюжет|трейлер|смотреть|скачать|источник|оценка|рейтинг)\b/i.test(clean)) return false;
    if (/^(?:сериал|мини-сериал|мультсериал|фильм|мультфильм|аниме)$/i.test(clean)) return false;
    if (/^(?:YouTube|RUTUBE|Rutube|Видео)\b/i.test(clean)) return false;

    return true;
  }

  function sameMovieTitle(current, candidate) {
    if (!current || !candidate) return false;

    return normalizeText(current.title) === normalizeText(candidate.title)
      && normalizeText(current.originalTitle || '') === normalizeText(candidate.originalTitle || '');
  }

  function isMetadataLine(line) {
    return META_LINE_RE.test(String(line || '').trim());
  }

  function metadataValue(line, labelPattern) {
    const re = new RegExp(
      `(?:^|\\s)${labelPattern}\\s*[:：]\\s*(.*?)(?=\\s+${META_LABEL_SOURCE}\\s*[:：]|$)`,
      'i'
    );

    const match = String(line || '').match(re);
    return match ? match[1].trim() : '';
  }

  function applyMetadata(item, line) {
    const genres = parseGenres(line);
    if (genres.length) {
      item.genres = uniqueStrings([...(item.genres || []), ...genres]);
    }

    const year = parseYear(line);
    if (!item.year && year) item.year = year;

    const imdb = parseImdb(line);
    if (imdb) item.ratings.imdb = imdb;

    const rottenTomatoes = parseRottenTomatoes(line);
    if (rottenTomatoes) {
      item.ratings.rottenTomatoes = rottenTomatoes;
    }

    const kinopoisk = parseKinopoisk(line);
    if (kinopoisk) item.ratings.kinopoisk = kinopoisk;
  }

  function cleanTitle(value) {
    return String(value || '')
      .replace(/^[\-–—•\s]+/, '')
      .replace(/[\-–—•\s]+$/, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function parseGenres(line) {
    const value = metadataValue(line, 'Жанр(?:ы)?');
    if (!value) return [];

    return splitList(value.replace(/[.;]+$/, ''))
      .map(normalizeGenre)
      .filter(Boolean);
  }

  function normalizeGenre(genre) {
    const clean = String(genre || '')
      .toLowerCase()
      .replace(/ё/g, 'е')
      .replace(/\s+/g, ' ')
      .trim();

    return GENRE_ALIASES[clean] || clean;
  }

  function splitList(value) {
    return String(value || '')
      .split(/[,;\/]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function parseYear(line) {
    const value = metadataValue(line, 'Год');
    const match = value.match(/(?:19|20)\d{2}/);
    return match ? Number(match[0]) : undefined;
  }

  function parseImdb(line) {
    const valueText = metadataValue(line, 'IMDb');
    const match = valueText.match(/([\d.,]+)(?:\s*\(([^)]+)\))?/i);
    if (!match) return null;

    const value = parseFloat(String(match[1]).replace(',', '.'));
    if (!Number.isFinite(value)) return null;

    const votes = match[2] ? parseVotes(match[2]) : null;

    return {
      value: round(value, 1),
      votes: votes || undefined,
      percent: clamp(Math.round(value * 10), 0, 100)
    };
  }

  function parseKinopoisk(line) {
    const valueText = metadataValue(line, 'КиноПоиск');
    const match = valueText.match(/([\d.,]+)(?:[^()]*)?(?:\(([^)]+)\))?/i);
    if (!match) return null;

    const value = parseFloat(String(match[1]).replace(',', '.'));
    if (!Number.isFinite(value)) return null;

    const votes = match[2] ? parseVotes(match[2]) : null;

    return {
      value: round(value, 1),
      votes: votes || undefined,
      percent: clamp(Math.round(value * 10), 0, 100)
    };
  }

  function parseRottenTomatoes(line) {
    const afterColon = metadataValue(line, 'Rotten Tomatoes');
    if (!afterColon) return null;

    const out = {};
    const pairRe = /(\d{1,3})\s*%\s*\(([^)]+)\)/gi;
    let pair;

    while ((pair = pairRe.exec(afterColon))) {
      const value = clamp(Number(pair[1]), 0, 100);
      const label = normalizeText(pair[2]);

      if (label.includes('крит')) {
        out.critics = value;
      } else if (label.includes('зрит') || label.includes('аудит')) {
        out.audience = value;
      }
    }

    if (out.critics == null && out.audience == null) {
      const single = afterColon.match(/(\d{1,3})\s*%/);
      if (single) out.critics = clamp(Number(single[1]), 0, 100);
    }

    return Object.keys(out).length ? out : null;
  }

  function finalizeMovie(item, context) {
    const titleParts = [item.title, item.originalTitle, item.year].filter(Boolean);
    const query = titleParts.join(' ');

    return {
      id: makeMovieId(item),
      title: item.title,
      originalTitle: item.originalTitle || undefined,
      year: item.year || undefined,
      query,
      genres: uniqueStrings(item.genres || []),
      ratings: compactObject(item.ratings || {})
    };
  }

  function isUsefulMovieItem(item) {
    if (!item || !item.title) return false;

    const hasGenres = Boolean(item.genres && item.genres.length);
    const hasRatings = Boolean(item.ratings && Object.keys(item.ratings).length);

    // Год полезен, но его отсутствие больше не уничтожает всю карточку.
    return hasGenres || hasRatings;
  }

  function dedupeMovies(items) {
    const seen = new Set();
    const out = [];

    for (const item of items) {
      const key = normalizeText(
        `${item.title} ${item.originalTitle || ''} ${item.year || ''}`
      );

      if (seen.has(key)) continue;
      seen.add(key);
      out.push(item);
    }

    return out;
  }

  function makeMovieId(item) {
    const base = [item.title, item.originalTitle, item.year]
      .filter(Boolean)
      .join(' ');

    return slugify(base);
  }

  function slugify(value) {
    return transliterate(String(value || '').toLowerCase())
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 90) || `movie-${Date.now()}`;
  }

  function transliterate(value) {
    const map = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
      'е': 'e', 'ё': 'e', 'ж': 'zh', 'з': 'z', 'и': 'i',
      'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
      'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
      'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch',
      'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '',
      'э': 'e', 'ю': 'yu', 'я': 'ya'
    };

    return String(value || '').replace(/[а-яё]/g, (char) => map[char] || char);
  }

  function openModal(batch) {
    closeModal();

    const json = JSON.stringify(batch, null, 2);
    const indexEntry = buildIndexEntry(batch);
    const backdrop = document.createElement('div');

    backdrop.id = MODAL_ID;
    backdrop.className = 'rtpm-backdrop';
    backdrop.innerHTML = `
      <div class="rtpm-modal" role="dialog" aria-modal="true">
        <div class="rtpm-head">
          <div>
            <div class="rtpm-title">Сборщик фильмов для Рутубочиста</div>
            <div class="rtpm-subtitle">${escapeHtml(batch.title)} · найдено: ${batch.items.length}</div>
          </div>
          <button class="rtpm-close" type="button" data-rtpm-action="close" title="Закрыть">×</button>
        </div>

        <div class="rtpm-body">
          <div class="rtpm-actions">
            <button type="button" data-rtpm-action="download-batch">Скачать JSON</button>
            <button type="button" data-rtpm-action="copy-index" class="rtpm-light">Копировать запись для index</button>
            <button type="button" data-rtpm-action="rescan" class="rtpm-light">Пересканировать</button>
          </div>

          <div class="rtpm-grid">
            <div class="rtpm-preview">
              <div class="rtpm-preview-head">
                <span>Предпросмотр</span>
                <span>${escapeHtml(shortUrl(batch.sourceUrl))}</span>
              </div>
              <div class="rtpm-list">
                ${batch.items.length
                  ? batch.items.map(renderPreviewItem).join('')
                  : '<div class="rtpm-empty">Фильмы не найдены. Выдели текст поста вручную и нажми «Пересканировать».</div>'}
              </div>
            </div>

            <div>
              <textarea class="rtpm-textarea" id="rtpm-json">${escapeHtml(json)}</textarea>
              <div class="rtpm-note">Совет: перед коммитом проверь названия, год и рейтинги глазами.</div>
            </div>
          </div>
        </div>
      </div>
    `;

    backdrop.dataset.rtpmBatch = json;
    backdrop.dataset.rtpmIndexEntry = `${JSON.stringify(indexEntry, null, 2)},`;
    document.documentElement.appendChild(backdrop);

    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop) closeModal();

      const actionEl = event.target && event.target.closest('[data-rtpm-action]');
      if (!actionEl) return;

      const action = actionEl.dataset.rtpmAction;

      if (action === 'close') closeModal();

      if (action === 'copy-index') {
        copyText(
          backdrop.dataset.rtpmIndexEntry,
          'Запись для index.json скопирована.'
        );
      }

      if (action === 'download-batch') {
        downloadText(
          `${batch.date || 'movies'}-centralzd.json`,
          getCurrentJsonText() || backdrop.dataset.rtpmBatch
        );
      }

      if (action === 'rescan') {
        openModal(extractBatch());
      }
    }, true);
  }

  function renderPreviewItem(item) {
    const fullTitle = [
      item.title,
      item.originalTitle && `/ ${item.originalTitle}`,
      item.year && `(${item.year})`
    ].filter(Boolean).join(' ');

    const meta = [
      renderGenres(item.genres),
      renderRatings(item.ratings)
    ].filter(Boolean).join(' ');

    return `
      <div class="rtpm-item" title="${escapeHtml(item.query || fullTitle)}">
        <div class="rtpm-movie-title">${escapeHtml(fullTitle)}</div>
        <div class="rtpm-meta">${escapeHtml(meta || 'без жанров и рейтингов')}</div>
      </div>
    `;
  }

  function renderGenres(genres) {
    if (!genres || !genres.length) return '';
    return genres.map((genre) => `${genreIcon(genre)} ${genre}`).join(' ');
  }

  function genreIcon(genre) {
    const value = normalizeText(genre);

    if (value.includes('драма')) return '🎭';
    if (value.includes('комед')) return '😄';
    if (value.includes('боев')) return '💥';
    if (value.includes('трилл')) return '⚡';
    if (value.includes('ужас')) return '👻';
    if (value.includes('фантаст')) return '🚀';
    if (value.includes('фэнт')) return '🧙';
    if (value.includes('мульт') || value.includes('анима')) return '🎨';
    if (value.includes('детектив')) return '🕵️';
    if (value.includes('криминал')) return '🔫';
    if (value.includes('приключ')) return '🧭';
    if (value.includes('мелодрам')) return '❤️';
    if (value.includes('документ')) return '🎥';
    if (value.includes('семейн')) return '👨‍👩‍👧‍👦';
    if (value.includes('вестерн')) return '🤠';
    if (value.includes('воен')) return '🪖';
    if (value.includes('биограф')) return '👤';
    if (value.includes('истор')) return '🏛️';
    if (value.includes('спорт')) return '🏆';
    if (value.includes('музык') || value.includes('мюзик')) return '🎵';

    return '🎬';
  }

  function renderRatings(ratings) {
    if (!ratings) return '';

    const parts = [];

    if (ratings.imdb && Number.isFinite(ratings.imdb.value)) {
      parts.push(`IMDb ${ratingBar(ratings.imdb.percent)} ${ratings.imdb.value}/10`);
    }

    if (ratings.rottenTomatoes) {
      const rottenTomatoes = ratings.rottenTomatoes;
      const critics = rottenTomatoes.critics != null
        ? rottenTomatoes.critics
        : '–';
      const audience = rottenTomatoes.audience != null
        ? rottenTomatoes.audience
        : '–';

      parts.push(`🍅 ${critics}/${audience}`);
    }

    if (ratings.kinopoisk && Number.isFinite(ratings.kinopoisk.value)) {
      parts.push(`КП ${ratingBar(ratings.kinopoisk.percent)} ${ratings.kinopoisk.value}/10`);
    }

    return parts.join(' ');
  }

  function ratingBar(percent) {
    const filled = clamp(Math.round((Number(percent) || 0) / 10), 0, 10);
    return '█'.repeat(filled) + '░'.repeat(10 - filled);
  }

  function buildIndexEntry(batch) {
    return {
      id: batch.id,
      title: batch.title,
      date: batch.date,
      sourceUrl: batch.sourceUrl,
      file: `batches/${batch.date}-centralzd.json`,
      count: batch.items.length
    };
  }

  function getCurrentJsonText() {
    const textarea = document.getElementById('rtpm-json');
    return textarea ? textarea.value : '';
  }

  function closeModal() {
    const old = document.getElementById(MODAL_ID);
    if (old) old.remove();
  }

  function copyText(text, message) {
    const value = String(text || '');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value)
        .then(() => toast(message))
        .catch(() => fallbackCopy(value, message));
      return;
    }

    fallbackCopy(value, message);
  }

  function fallbackCopy(text, message) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.documentElement.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      document.execCommand('copy');
      toast(message);
    } catch (e) {
      toast('Не удалось скопировать. Придётся врукопашную.');
    }

    textarea.remove();
  }

  function downloadText(filename, text) {
    const blob = new Blob([String(text || '')], {
      type: 'application/json;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    document.documentElement.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast(`Скачан файл ${filename}`);
  }

  function toast(message) {
    const old = document.querySelector('.rtpm-toast');
    if (old) old.remove();

    const element = document.createElement('div');
    element.className = 'rtpm-toast';
    element.textContent = message;
    document.documentElement.appendChild(element);

    setTimeout(() => element.remove(), 2600);
  }

  function detectSourceDate(url) {
    const source = String(url || '');
    const match = source.match(/(?:_|-)na[_-]?(\d{2})(\d{2})(\d{4})(?:_|\D|$)/i)
      || source.match(/_(\d{2})(\d{2})(\d{4})(?:_|\D|$)/);

    if (!match) return '';

    const day = match[1];
    const month = match[2];
    const year = match[3];

    if (!day || !month || !year) return '';
    return `${year}-${month}-${day}`;
  }

  function todayIsoDate() {
    const date = new Date();
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
  }

  function formatRuDate(iso) {
    const match = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return String(iso || '');
    return `${match[3]}.${match[2]}.${match[1]}`;
  }

  function parseVotes(value) {
    const number = String(value || '').replace(/[^\d]/g, '');
    return number ? Number(number) : null;
  }

  function round(value, digits) {
    const factor = Math.pow(10, digits || 0);
    return Math.round(value * factor) / factor;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function pad2(value) {
    return String(value).padStart(2, '0');
  }

  function normalizeText(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/ё/g, 'е')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function uniqueStrings(items) {
    const seen = new Set();
    const out = [];

    for (const item of items || []) {
      const clean = String(item || '').trim();
      const key = normalizeText(clean);

      if (!clean || seen.has(key)) continue;
      seen.add(key);
      out.push(clean);
    }

    return out;
  }

  function uniqueElements(items) {
    const seen = new Set();
    const out = [];

    for (const item of items || []) {
      if (!item || seen.has(item)) continue;
      seen.add(item);
      out.push(item);
    }

    return out;
  }

  function compactObject(object) {
    const out = {};

    for (const [key, value] of Object.entries(object || {})) {
      if (value == null) continue;
      if (typeof value === 'object' && !Object.keys(value).length) continue;
      out[key] = value;
    }

    return out;
  }

  function cleanUrl(url) {
    try {
      const parsed = new URL(url);
      parsed.search = '';
      parsed.hash = '';
      return parsed.toString();
    } catch (e) {
      return String(url || '').split('#')[0].split('?')[0];
    }
  }

  function shortUrl(url) {
    try {
      const parsed = new URL(url);
      return parsed.pathname.replace(/^\//, '');
    } catch (e) {
      return String(url || '');
    }
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function boot() {
    addStyle();
    addButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
