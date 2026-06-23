// ==UserScript==
// @name         Рутубочист: сборщик фильмов с Пикабу
// @namespace    https://github.com/npekpacHo/rutubochist
// @version      0.1.1
// @description  Извлекает из постов CentralZD названия фильмов, жанры и рейтинги в JSON-батч для Рутубочиста.
// @author       elekt_riki
// @license      MIT
// @match        https://pikabu.ru/story/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const UI_VERSION = '0.1.1';
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
      #${BUTTON_ID}:hover { background: #333 !important; }
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
      .rtpm-title { font: 800 17px/1.25 Arial, sans-serif !important; }
      .rtpm-subtitle { margin-top: 3px !important; color: #666 !important; font: 12px/1.35 Arial, sans-serif !important; }
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
      .rtpm-actions button.rtpm-light { background: #f4f4f4 !important; color: #111 !important; }
      .rtpm-grid {
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) minmax(320px, .9fr) !important;
        gap: 12px !important;
      }
      @media (max-width: 820px) { .rtpm-grid { grid-template-columns: 1fr !important; } }
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
      .rtpm-list { padding: 8px 10px !important; }
      .rtpm-item {
        padding: 7px 0 !important;
        border-bottom: 1px solid rgba(0,0,0,.07) !important;
      }
      .rtpm-item:last-child { border-bottom: 0 !important; }
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
      .rtpm-empty { padding: 14px !important; color: #666 !important; font: 13px/1.4 Arial, sans-serif !important; }
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
    return (root && root.innerText) || document.body.innerText || '';
  }

  function findPostRoot() {
    const selectors = [
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
      .map((el) => ({ el, text: String(el.innerText || '').trim() }))
      .filter((x) => x.text.length > 300);

    if (!usable.length) return document.body;

    // Берём самый насыщенный фильмами блок, а не просто самый большой кусок страницы с комментариями.
    usable.sort((a, b) => scorePostText(b.text) - scorePostText(a.text));
    return usable[0].el;
  }

  function scorePostText(text) {
    const titleMatches = (text.match(/\n\s*[^\n]{2,160}?\s*\((?:19|20)\d{2}\)\s*\n/g) || []).length;
    const genreMatches = (text.match(/\n\s*Жанр\s*:/gi) || []).length;
    const imdbMatches = (text.match(/\n\s*IMDb\s*:/gi) || []).length;
    return titleMatches * 8 + genreMatches * 5 + imdbMatches * 4 + Math.min(text.length / 1000, 4);
  }

  function normalizeLines(text) {
    return String(text || '')
      .replace(/\u00a0/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .split(/\r?\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  function parseMovies(lines, context) {
    const items = [];
    let current = null;

    for (const line of lines) {
      const title = parseTitleLine(line);
      if (title) {
        if (isUsefulMovieItem(current)) items.push(finalizeMovie(current, context));
        current = {
          title: title.title,
          originalTitle: title.originalTitle,
          year: title.year,
          genres: [],
          ratings: {}
        };
        continue;
      }

      if (!current) continue;

      const genres = parseGenres(line);
      if (genres.length) {
        current.genres = uniqueStrings([...current.genres, ...genres]);
        continue;
      }

      const imdb = parseImdb(line);
      if (imdb) {
        current.ratings.imdb = imdb;
        continue;
      }

      const rt = parseRottenTomatoes(line);
      if (rt) {
        current.ratings.rottenTomatoes = rt;
        continue;
      }

      const kinopoisk = parseKinopoisk(line);
      if (kinopoisk) {
        current.ratings.kinopoisk = kinopoisk;
      }
    }

    if (isUsefulMovieItem(current)) items.push(finalizeMovie(current, context));
    return dedupeMovies(items);
  }

  function parseTitleLine(line) {
    const clean = String(line || '').trim().replace(/[\u200b\u200c\u200d]/g, '');
    if (!clean || clean.length > 220) return null;
    if (/^(Жанр|Режиссер|Режиссёр|В главных ролях|Страна|IMDb|Rotten Tomatoes|Озвучка|Кинопоиск)\s*:/i.test(clean)) return null;
    if (/^(читать дальше|показать полностью|свернуть|комментарии|подписаться)$/i.test(clean)) return null;

    // Основной формат: Русское название / Original Title (2025)
    const full = clean.match(/^(.+?)(?:\s*\/\s*(.+?))?\s*\(((?:19|20)\d{2})\)\s*$/);
    if (!full) return null;

    const title = cleanTitle(full[1]);
    const originalTitle = cleanTitle(full[2] || '');
    const year = Number(full[3]);

    if (!title || title.length < 2 || !year) return null;
    if (/^(IMDb|Rotten Tomatoes|Кинопоиск)$/i.test(title)) return null;

    return { title, originalTitle, year };
  }

  function cleanTitle(value) {
    return String(value || '')
      .replace(/^[\-–—•\s]+/, '')
      .replace(/[\-–—•\s]+$/, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function parseGenres(line) {
    const m = String(line || '').match(/^Жанр(?:ы)?\s*:\s*(.+)$/i);
    if (!m) return [];
    return splitList(m[1]).map(normalizeGenre).filter(Boolean);
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
      .map((x) => x.trim())
      .filter(Boolean);
  }

  function parseImdb(line) {
    const m = String(line || '').match(/^IMDb\s*:\s*([\d.,]+)(?:\s*\(([^)]+)\))?/i);
    if (!m) return null;
    const value = parseFloat(String(m[1]).replace(',', '.'));
    if (!Number.isFinite(value)) return null;
    const votes = m[2] ? parseVotes(m[2]) : null;
    return {
      value: round(value, 1),
      votes: votes || undefined,
      percent: clamp(Math.round(value * 10), 0, 100)
    };
  }

  function parseKinopoisk(line) {
    const m = String(line || '').match(/^Кинопоиск\s*:\s*([\d.,]+)(?:\s*\(([^)]+)\))?/i);
    if (!m) return null;
    const value = parseFloat(String(m[1]).replace(',', '.'));
    if (!Number.isFinite(value)) return null;
    const votes = m[2] ? parseVotes(m[2]) : null;
    return {
      value: round(value, 1),
      votes: votes || undefined,
      percent: clamp(Math.round(value * 10), 0, 100)
    };
  }

  function parseRottenTomatoes(line) {
    const raw = String(line || '');
    if (!/^Rotten Tomatoes\s*:/i.test(raw)) return null;

    const out = {};
    const afterColon = raw.replace(/^Rotten Tomatoes\s*:\s*/i, '');
    const pairRe = /(\d{1,3})\s*%\s*\(([^)]+)\)/gi;
    let pair;
    while ((pair = pairRe.exec(afterColon))) {
      const value = clamp(Number(pair[1]), 0, 100);
      const label = normalizeText(pair[2]);
      if (label.includes('крит')) out.critics = value;
      else if (label.includes('зрит') || label.includes('аудит')) out.audience = value;
    }

    // Иногда может быть просто: Rotten Tomatoes: 96%
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
      year: item.year,
      query,
      genres: uniqueStrings(item.genres || []),
      ratings: compactObject(item.ratings || {})
    };
  }

  function isUsefulMovieItem(item) {
    if (!item || !item.title || !item.year) return false;
    const hasGenres = item.genres && item.genres.length;
    const hasRatings = item.ratings && Object.keys(item.ratings).length;
    return Boolean(hasGenres || hasRatings);
  }

  function dedupeMovies(items) {
    const seen = new Set();
    const out = [];
    for (const item of items) {
      const key = normalizeText(`${item.title} ${item.originalTitle || ''} ${item.year}`);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(item);
    }
    return out;
  }

  function makeMovieId(item) {
    const base = [item.title, item.originalTitle, item.year].filter(Boolean).join(' ');
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
      'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'e','ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'c','ч':'ch','ш':'sh','щ':'sch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya'
    };
    return String(value || '').replace(/[а-яё]/g, (ch) => map[ch] || ch);
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
            <button type="button" data-rtpm-action="copy-batch">Копировать batch JSON</button>
            <button type="button" data-rtpm-action="download-batch">Скачать ${escapeHtml(batch.date)}.json</button>
            <button type="button" data-rtpm-action="copy-index" class="rtpm-light">Копировать запись для index.json</button>
            <button type="button" data-rtpm-action="rescan" class="rtpm-light">Пересканировать</button>
          </div>
          <div class="rtpm-grid">
            <div class="rtpm-preview">
              <div class="rtpm-preview-head">
                <span>Предпросмотр</span>
                <span>${escapeHtml(shortUrl(batch.sourceUrl))}</span>
              </div>
              <div class="rtpm-list">
                ${batch.items.length ? batch.items.map(renderPreviewItem).join('') : '<div class="rtpm-empty">Фильмы не найдены. Выдели текст поста вручную и нажми «Пересканировать».</div>'}
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
    backdrop.dataset.rtpmIndexEntry = JSON.stringify(indexEntry, null, 2);
    document.documentElement.appendChild(backdrop);

    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop) closeModal();
      const actionEl = event.target && event.target.closest('[data-rtpm-action]');
      if (!actionEl) return;
      const action = actionEl.dataset.rtpmAction;
      if (action === 'close') closeModal();
      if (action === 'copy-batch') copyText(getCurrentJsonText() || backdrop.dataset.rtpmBatch, 'Batch JSON скопирован.');
      if (action === 'copy-index') copyText(backdrop.dataset.rtpmIndexEntry, 'Запись для index.json скопирована.');
      if (action === 'download-batch') downloadText(`${batch.date || 'movies'}-centralzd.json`, getCurrentJsonText() || backdrop.dataset.rtpmBatch);
      if (action === 'rescan') openModal(extractBatch());
    }, true);
  }

  function renderPreviewItem(item) {
    const fullTitle = [item.title, item.originalTitle && `/ ${item.originalTitle}`, item.year && `(${item.year})`].filter(Boolean).join(' ');
    const meta = [renderGenres(item.genres), renderRatings(item.ratings)].filter(Boolean).join('   ');
    return `
      <div class="rtpm-item" title="${escapeHtml(item.query || fullTitle)}">
        <div class="rtpm-movie-title">${escapeHtml(fullTitle)}</div>
        <div class="rtpm-meta">${escapeHtml(meta || 'без жанров и рейтингов')}</div>
      </div>
    `;
  }

  function renderGenres(genres) {
    if (!genres || !genres.length) return '';
    return genres.map((genre) => `${genreIcon(genre)} ${genre}`).join('   ');
  }

  function genreIcon(genre) {
    const g = normalizeText(genre);
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
    if (g.includes('музык') || g.includes('мюзик')) return '🎵';
    return '🎬';
  }

  function renderRatings(ratings) {
    if (!ratings) return '';
    const parts = [];
    if (ratings.imdb && Number.isFinite(ratings.imdb.value)) {
      parts.push(`IMDb ${ratingBar(ratings.imdb.percent)} ${ratings.imdb.value}/10`);
    }
    if (ratings.rottenTomatoes) {
      const rt = ratings.rottenTomatoes;
      const critics = rt.critics != null ? rt.critics : '–';
      const audience = rt.audience != null ? rt.audience : '–';
      parts.push(`🍅 ${critics}/${audience}`);
    }
    if (ratings.kinopoisk && Number.isFinite(ratings.kinopoisk.value)) {
      parts.push(`КП ${ratingBar(ratings.kinopoisk.percent)} ${ratings.kinopoisk.value}/10`);
    }
    return parts.join('   ');
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
      navigator.clipboard.writeText(value).then(() => toast(message)).catch(() => fallbackCopy(value, message));
      return;
    }
    fallbackCopy(value, message);
  }

  function fallbackCopy(text, message) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.documentElement.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand('copy');
      toast(message);
    } catch (e) {
      toast('Не удалось скопировать. Придётся врукопашную.');
    }
    ta.remove();
  }

  function downloadText(filename, text) {
    const blob = new Blob([String(text || '')], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.documentElement.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast(`Скачан файл ${filename}`);
  }

  function toast(message) {
    const old = document.querySelector('.rtpm-toast');
    if (old) old.remove();
    const el = document.createElement('div');
    el.className = 'rtpm-toast';
    el.textContent = message;
    document.documentElement.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }

  function detectSourceDate(url) {
    const m = String(url || '').match(/(?:_|-)na[_-]?(\d{2})(\d{2})(\d{4})(?:_|\D|$)/i)
      || String(url || '').match(/_(\d{2})(\d{2})(\d{4})(?:_|\D|$)/);
    if (!m) return '';
    const day = m[1];
    const month = m[2];
    const year = m[3];
    if (!day || !month || !year) return '';
    return `${year}-${month}-${day}`;
  }

  function todayIsoDate() {
    const d = new Date();
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  }

  function formatRuDate(iso) {
    const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return String(iso || '');
    return `${m[3]}.${m[2]}.${m[1]}`;
  }

  function parseVotes(value) {
    const n = String(value || '').replace(/[^\d]/g, '');
    return n ? Number(n) : null;
  }

  function round(value, digits) {
    const k = Math.pow(10, digits || 0);
    return Math.round(value * k) / k;
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

  function compactObject(obj) {
    const out = {};
    for (const [key, value] of Object.entries(obj || {})) {
      if (value == null) continue;
      if (typeof value === 'object' && !Object.keys(value).length) continue;
      out[key] = value;
    }
    return out;
  }

  function cleanUrl(url) {
    try {
      const u = new URL(url);
      u.search = '';
      u.hash = '';
      return u.toString();
    } catch (e) {
      return String(url || '').split('#')[0].split('?')[0];
    }
  }

  function shortUrl(url) {
    try {
      const u = new URL(url);
      return u.pathname.replace(/^\//, '');
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

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
