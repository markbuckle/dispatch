# Dispatch

Minimal email API for developers, built as a portfolio project for Resend
applications. See `CLAUDE.md` for engineering rules and
`design/design-system/CLAUDE.md` for design rules.

## Build plan

| Phase | What | Status |
|---|---|---|
| 0 | Repo, Turborepo, Biome, TS strict, CLAUDE.md, PR template, CI | done |
| 1 | Design system in Claude Design, tokens, logo | done |
| 2 | Landing page: header, hero, footer | next |
| 3 | Supabase auth, signup and login pages, session middleware | |
| 4 | Dashboard shell: sidebar, search, routing, empty states | |
| 5 | API keys: generation, hashing, one-time reveal, rate limiting | |
| 6 | Domains: SES identity, DKIM records, verification polling | |
| 7 | Send pipeline + Emails list and detail | |
| 8 | Templates: CRUD, variable interpolation, live preview | |
| 9 | Compatibility checker, shipped behind a PostHog flag | |
| 10 | Webhooks: signing, retries, delivery log, SNS bounce ingestion | |
| 11 | Metrics and Logs | |
| 12 | Settings and Profile | |
| 13 | Polish, Playwright E2E, case study writeup | |

## Architecture

| Layer | Choice |
|---|---|
| API | Hono |
| Web | Next.js 15, App Router |
| Styling | Tailwind, Radix Primitives, Radix Colors |
| Validation | Zod |
| DB | Postgres + Drizzle |
| Auth | Supabase |
| Jobs | Inngest |
| Email transport | AWS SES, behind a `Transport` interface |
| Flags | PostHog |
| Lint/format | Biome |

Key decisions:

- **Control plane / data plane split.** Hono validates and queues,
  Inngest sends. Never call SES synchronously from a route handler.
- **Transport interface.** `ConsoleTransport` for tests/dev,
  `SesTransport` for production.
- **Webhooks are hand-rolled** in `packages/core`, not Svix.
- **`packages/compat` has no React or Next dependency.**
- **Large features ship behind a PostHog flag**, several small PRs.

```
tsconfig.json / biome.json   root config, everything extends it
design/design-system/        tokens, foundations, logo, decisions
apps/web                     Next.js: landing, auth, dashboard
apps/api                     Hono: public REST API v1
packages/db                  Drizzle schema, migrations
packages/core                send pipeline, key hashing, webhooks
packages/compat              compatibility checker, framework-free
packages/ui                  Radix + Tailwind components
packages/config              currently unused - tailwind v4 configures
                             via tokens.css's @theme block directly,
                             not a JS preset
```

## Opening and merging a PR

```powershell
git checkout main
git pull

git checkout -b feat/short-description
# make one change

git add <files>
git commit -m "feat: short description"

git push -u origin feat/short-description
```

Open the PR on GitHub (the push output prints a direct link). Title
matches the commit format, body auto-fills from the PR template. Wait
for the Checks tab to go green, then **Squash and merge**.

Clean up after merging:

```powershell
git checkout main
git pull

git branch -D feat/short-description
git push origin --delete feat/short-description
```

**Use `-D`, not `-d`.** After a squash merge, git doesn't recognize the
branch as merged by commit hash, so the safe lowercase delete refuses.
That's expected, not a bug.

**Never reuse an old branch for new work, even one you think is
finished with.** If it was already squash-merged, its commits will
still show as unmerged, and a fresh PR from it may drag in old,
already-landed changes by mistake. Delete it and branch fresh instead.

`main` has GitHub branch protection requiring a PR - direct pushes to
`main` fail for everyone, from any tool. Claude Code also has its own
`.claude/hooks/block-main-commit.sh`, but that only applies when Claude
Code itself runs the git command, not manual terminal use. Branch
protection is the real, universal guard.

## What CI checks

On every PR and every push to `main`: `pnpm lint`, `pnpm typecheck`
(skipped until real `.ts` files exist to check), `pnpm test`,
`pnpm build`.

## Local commands

| Command | What |
|---|---|
| `pnpm dev` | run all dev servers |
| `pnpm build` | build all packages |
| `pnpm lint` | Biome check |
| `pnpm format` | Biome check --write |
| `pnpm typecheck` | tsc --noEmit |
| `pnpm test` | run tests |
