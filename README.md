# Рутубочист

**Рутубочист** — userscript для AdGuard/Tampermonkey, который делает RUTUBE более пригодным для просмотра.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![AdGuard](https://img.shields.io/badge/AdGuard-Compatible-67b279.svg)](https://adguard.com/)
[![Tampermonkey](https://img.shields.io/badge/Tampermonkey-Compatible-00485b.svg)](https://www.tampermonkey.net/)
[![Userscript](https://img.shields.io/badge/type-userscript-blue.svg)](https://en.wikipedia.org/wiki/Userscript)
[![RUTUBE](https://img.shields.io/badge/site-RUTUBE-111111.svg)](https://rutube.ru/)

[![Last commit](https://img.shields.io/github/last-commit/npekpacHo/rutubochist?label=last%20update)](https://github.com/npekpacHo/rutubochist/commits/main)
[![Version](https://img.shields.io/badge/version-1.1.19-blue.svg)](https://github.com/npekpacHo/rutubochist)


Скрипт добавляет пользовательский контроль над лентой и страницей просмотра: позволяет скрывать нежелательные каналы, Shorts, рекомендации под видео, комментарии, телевизионные разделы, промо-блоки и лишние элементы бокового меню.

Рутубочист не вмешивается в видеопотоки, не ломает плеер, ничего никуда не отправляет и работает только на стороне пользователя.

## Установка

Скрипт можно установить через AdGuard, Tampermonkey или другой менеджер userscript-ов.

### Установка в AdGuard

1. Откройте **Настройки → Расширения**.
2. Нажмите **Добавить**.
3. Выберите **Импортировать из файла или URL**.
4. Вставьте ссылку:

```text
https://npekpacho.github.io/rutubochist/rutube_sans_tv_adguard.user.js
```

5. Подтвердите установку.
6. Обновите страницу RUTUBE.

Если скрипт установлен по URL, он сможет обновляться с GitHub автоматически при изменении версии в metadata-блоке `@version`.

## Возможности

* скрытие нежелательных каналов;
* кнопка `⊘` для блокировки канала прямо в ленте;
* фильтрация по словам и фразам;
* скрытие Shorts;
* режим чистого просмотра видео;
* скрытие рекомендаций под видео;
* скрытие комментариев;
* отключение автозапуска;
* запрет автозапуска следующего видео после завершения текущего;
* очистка бокового меню от ТВ-разделов, промо и саморекламы RUTUBE;
* импорт и экспорт чёрного списка.

## Скриншоты

<img width="2134" height="1294" alt="rutubochist1" src="https://github.com/user-attachments/assets/cea0b098-3b2a-4870-b074-f02758733abb" />

<img width="338" height="753" alt="rutubochist2" src="https://github.com/user-attachments/assets/92231920-0e06-4986-82af-02db2eb2cea1" />
