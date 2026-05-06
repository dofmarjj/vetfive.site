# Vetfive — сайт + адмін-панель

Проєкт переведено зі статичного HTML у серверний рендеринг з кастомною адмінкою.

## Що реалізовано

- Редагування текстових блоків головної сторінки через адмінку
- Завантаження/заміна логотипа через адмінку
- CRUD для розділу `Лікарі` (створення, редагування, публікація/чернетка)
- Ролі адміністраторів: `owner`, `editor`
- Публічні сторінки рендеряться з БД (головна + `/doctors/:slug`)

## Технології

- Node.js + Express
- EJS-шаблони
- SQLite (`better-sqlite3`) для MVP
- `express-session` для авторизації
- `multer` для завантаження файлів

## Структура

- `server.js` — сервер, маршрути, auth, CRUD
- `views/` — публічні та адмінські шаблони
- `docs/content-model.md` — контент-модель
- `data/vetfive.db` — файл БД (створюється автоматично)
- `uploads/` — завантажені медіа

## Локальний запуск

```bash
npm install
npm start
```

Після запуску:

- Публічний сайт: `http://localhost:3000/`
- Адмінка: `http://localhost:3000/admin/login`

Стартовий owner-користувач (створюється автоматично, якщо БД порожня):

- Email: `owner@vetfive.local`
- Password: `vetfive123`

## Бекапи

Рекомендується щоденний бекап папок `data/` та `uploads/`.

Приклад ручного бекапу:

```bash
mkdir -p backups
tar -czf "backups/vetfive-$(date +%Y%m%d-%H%M).tar.gz" data uploads
```

## Деплой (базовий чек-лист)

- Виставити `SESSION_SECRET` у змінних оточення
- Налаштувати reverse proxy (Nginx/Caddy) на `localhost:3000`
- Додати restart policy через `pm2` або `systemd`
- Налаштувати регулярні бекапи `data/` та `uploads/`
- Обмежити доступ до `/admin/*` за потреби (IP allowlist/VPN)

Тестовый вход: owner@vetfive.local / vetfive123
