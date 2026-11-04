# av.workspace

Портфолио и приватный дашборд проектов: публичные проекты, этапы, прогресс, заметки и редактируемая страница «Обо мне».

- React 19 + Vite 8 + TypeScript
- Tailwind CSS 4 + мягкий neumorphic UI
- Firebase Auth (email/password) + Cloud Firestore
- PWA: установка, офлайн-оболочка, синхронизация Firestore
- GitHub Pages + GitHub Actions

## Локальный запуск

Требования: Node.js 22+, pnpm 10+.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Заполните `.env.local` публичным Firebase web config. Эти значения не являются секретами и попадают в клиентский бандл.

## Firebase

1. Создайте Firebase-проект.
2. Authentication → Sign-in method → включите **Email/Password**.
3. Authentication → Users → **Add user**: email владельца и длинный уникальный пароль.
4. Authentication → Settings → Authorized domains: добавьте `localhost` и `<username>.github.io` (только хост, без `https://` и пути).
5. Firestore → **Create database** (production mode).
6. Скопируйте UID пользователя и замените `<OWNER_UID>` в `firestore.rules`. UID должен быть только в этом файле.
7. Задеплойте правила:

```bash
pnpm firebase:deploy:rules
```

Скрипт проверяет, что `.firebaserc` и `VITE_FIREBASE_PROJECT_ID` совпадают, а `<OWNER_UID>` заменён.

## Скрипты

```bash
pnpm dev                 # dev-сервер на 8443
pnpm build               # production build
pnpm preview             # preview production build
pnpm typecheck           # tsc --noEmit
pnpm test                # unit-тесты
pnpm test:rules          # Firestore Rules (нужен Java + emulator)
pnpm test:e2e            # Playwright smoke-тесты
pnpm firebase:emulators  # локальные эмуляторы
pnpm firebase:deploy:rules
```

## Деплой на GitHub Pages

Репозиторий должен быть публичным для бесплатного GitHub Pages.

1. Settings → Pages → Source: **GitHub Actions**.
2. Settings → Secrets and variables → Actions → **Variables**: добавьте:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - опционально `VITE_FIREBASE_MEASUREMENT_ID`, `VITE_FIREBASE_APP_CHECK_SITE_KEY`
3. Push в `main` запускает `.github/workflows/deploy.yml`.
4. Сайт: `https://<username>.github.io/<repo>/`.

`BASE_PATH` вычисляется автоматически через `actions/configure-pages`.

## Безопасность

- UID владельца хранится только в `firestore.rules`; в клиенте его нет.
- Признак админа в UI — успешное чтение защищённого `meta/owner`. Не-владелец разлогинивается.
- Гости видят только `visibility == 'public'`; запрос без этого фильтра Firestore отклоняет.
- Заметки и приватные проекты доступны только владельцу.
- `.env.local` в `.gitignore`. `VITE_*` — публичные значения, не секреты.
- Секретов в GitHub Actions нет: правила деплоятся вручную с машины владельца.
- При выходе очищается локальный Firestore-кэш (если не мешают другие вкладки).

## Ограничения Firebase-проекта

Репозиторий привязан к одному проекту из `.firebaserc`. Все Firebase-команды идут через `pnpm firebase:*` и guard-скрипт. Не запускайте `firebase projects:list`, `firebase use`, `firebase init` и не передавайте чужой `--project`.
