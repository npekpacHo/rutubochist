# Рутубочист

**Рутубочист** — userscript для AdGuard/Tampermonkey, который делает RUTUBE более пригодным для просмотра.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![AdGuard](https://img.shields.io/badge/AdGuard-Compatible-67b279.svg)](https://adguard.com/)
[![Tampermonkey](https://img.shields.io/badge/Tampermonkey-Compatible-00485b.svg)](https://www.tampermonkey.net/)
[![Userscript](https://img.shields.io/badge/type-userscript-blue.svg)](https://en.wikipedia.org/wiki/Userscript)
[![RUTUBE](https://img.shields.io/badge/site-RUTUBE-111111.svg)](https://rutube.ru/)
[![Version](https://img.shields.io/badge/version-1.2-blue.svg)](https://github.com/npekpacHo/rutubochist)


Скрипт добавляет пользовательский контроль над лентой и страницей просмотра: позволяет скрывать нежелательные каналы, Shorts, рекомендации под видео, комментарии, телевизионные разделы, промо-блоки и лишние элементы бокового меню.

<img width="1672" height="763" alt="rtch" src="https://github.com/user-attachments/assets/4280ff28-489a-4690-bad5-d5835969d7c1" />

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

### Новое в версии 1.2
* рекомендации "Что посмотреть" ;
* переработанный интерфейс.

## Скриншоты

<img width="2169" height="1281" alt="Чистый плеер" src="https://github.com/user-attachments/assets/22f2c1de-7ec3-4dfa-a7fb-28e2fab41982" />
<img width="828" height="731" alt="Рекомендации" src="https://github.com/user-attachments/assets/76bef3a7-37d7-4474-ad93-5550072190a5" />
<img width="525" height="769" alt="Настройки" src="https://github.com/user-attachments/assets/5aaacbae-0c7a-4ef5-baf3-9b12d06849fe" />
<img width="338" height="211" alt="Гоавное окно Рутубочиста" src="https://github.com/user-attachments/assets/346fdfa9-7182-469a-8105-f599cbbeb893" />

