# av.workspace PWA — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the Figma Make mock into a Firebase-backed PWA with public guest mode and an email/password owner admin mode.

**Architecture:** Static React SPA on GitHub Pages. Firebase Auth + Firestore are called directly from the client; Firestore Rules are the only access boundary. HashRouter, `vite-plugin-pwa`, Firestore persistent cache for offline sync.

**Tech Stack:** React 19, Vite 8, TypeScript, Tailwind CSS 4, Firebase 13, React Router 7, `vite-plugin-pwa`, Vitest, Playwright.

**Spec:** `C:\Users\barda\.opencode\plan\2026-11-04-pet-projects-app-design.md`

## Global Constraints

- Owner UID appears only in `firestore.rules`; never in `.env`, client code, tests, or docs.
- No service account; Firebase access is constrained at repo/OpenCode level only.
- No public sign-up UI; owner user is created manually in Firebase Console.
- Guest list query must include `where('visibility', '==', 'public')`.
- Private projects and all notes are admin-only.
- `VITE_*` values are public; no secrets in the client bundle.
- HashRouter; no GitHub Pages 404 fallback needed.
- Preserve the existing soft-UI visual language.

## Review Focus

- Guest tries a private project URL: must see "not found", not data or a hint of existence.
- Non-owner signs in with valid credentials: must be signed out and shown a denial.
- Owner goes offline, edits a stage, reloads, returns online: edit must sync and not be lost.
- Guest list query without the visibility filter: Firestore must deny it.
- Owner logs out on a shared device: private cached data must be cleared.

---

### Task 1: Repo hygiene and Firebase scope

**Files:** `.gitignore`, `.env.example`, `.firebaserc`, `firebase.json`, `firestore.rules`, `firestore.indexes.json`, `scripts/firebase-guard.mjs`, `package.json`, `AGENTS.md`

- [ ] Write `.gitignore` with env negation, Firebase keys, build/test artifacts.
- [ ] Create `.env.example` with `VITE_FIREBASE_*` only.
- [ ] Create `.firebaserc` from `VITE_FIREBASE_PROJECT_ID` without printing it.
- [ ] Create `firebase.json` (Firestore + emulators only).
- [ ] Create `firestore.rules` with `<OWNER_UID>` placeholder and `meta/owner`, `content/about`.
- [ ] Create `firestore.indexes.json`.
- [ ] Create guard script and package scripts.
- [ ] Add Firebase isolation section to `AGENTS.md`.
- [ ] Verify `.env.local` is ignored and guard passes (except owner placeholder for deploy).

### Task 2: Core library

**Files:** `src/lib/env.ts`, `src/lib/firebase.ts`, `src/lib/dates.ts`, `src/lib/validation.ts`, `src/types/models.ts`, `src/content/about.ts`

- [ ] Env parsing with a clear error screen when required values are missing.
- [ ] Firebase init with `initializeFirestore` persistent cache and emulator support.
- [ ] Model types and default about content.
- [ ] Date helpers and form validators.

### Task 3: Auth and routing

**Files:** `src/app/providers/AuthProvider.tsx`, `src/app/providers/ToastProvider.tsx`, `src/app/guards/RequireAdmin.tsx`, `src/app/router.tsx`, `src/App.tsx`, `src/main.tsx`, `src/features/auth/LoginPage.tsx`, `src/features/auth/AuthButton.tsx`

- [ ] AuthProvider: email/password sign-in, persisted session, `meta/owner` probe, signOut on denial, offline retry.
- [ ] Login page, no sign-up, password reset.
- [ ] HashRouter routes and layout.
- [ ] Admin guard.

### Task 4: Projects

**Files:** `src/features/projects/*`

- [ ] Repository: list, create, update, delete, visibility.
- [ ] Hooks: guest query with `where`, admin query.
- [ ] Projects page: search, filters, grid/list, private badge, create modal.
- [ ] Project details: read-only for guests, private URL → not found.
- [ ] Stages: add/edit/delete, progress recalculation, recalc action.

### Task 5: Notes and About

**Files:** `src/features/notes/*`, `src/features/about/*`

- [ ] Notes repository/hooks (admin-only).
- [ ] Per-project notes panel and global notes page.
- [ ] About read with fallback; admin editor.

### Task 6: PWA and offline UX

**Files:** `vite.config.ts`, `src/features/pwa/*`, `public/icons/*`, `src/index.css`, `index.html`, `.figma/make/site.json`

- [ ] Manifest, icons, service worker, update prompt, install prompt.
- [ ] Offline banner and sync status.
- [ ] Self-hosted fonts.
- [ ] Clear Firestore cache on logout.

### Task 7: Tests and CI

**Files:** `tests/rules/*`, `tests/unit/*`, `vitest.config.ts`, `playwright.config.ts`, `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`

- [ ] Unit tests for progress, search, validation.
- [ ] Rules tests for the access matrix.
- [ ] Playwright smoke/E2E scaffolding.
- [ ] CI and Pages deploy workflows.

### Task 8: Verification

- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm build`
- [ ] Start preview/dev and confirm the site renders, guest mode works, login page opens, manifest is served.
- [ ] Confirm no `.env.local` or secrets in `dist`.
