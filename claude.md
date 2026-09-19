# Dispatch

Email API for developers. Minimal, dark-mode-first, built as a portfolio project
for Resend applications. Read this file before making any change.

## Non-negotiables

- Punctuation: single hyphens `-` only. Never `--` or em dashes, anywhere,
  including comments, commit messages, and UI copy
- Comments: one line max, `//` only, explain why not what, never narrate
  structure (see Comments section for examples)
- No `any`. No `as` casts to escape a type error, fix the type instead
- Before touching UI, read `design/design-system/CLAUDE.md` first. Never
  invent a colour, size, radius, or duration - if it isn't in
  `design/design-system/tokens/tokens.css`, the token is missing, add it
  there before using it
- One change per pull request
- Never commit directly to `main`
- Say what you are about to change and why, then wait for confirmation,
  before writing code

## Stack

TypeScript strict, pnpm workspaces, Turborepo.

| Layer | Choice |
|---|---|
| API | Hono |
| Web | Next.js 15, App Router, RSC for data, SWR only for polling views |
| Styling | Tailwind, Radix Primitives, Radix Colors |
| Validation | Zod, source of truth for types via `z.infer` |
| DB | Postgres + Drizzle |
| Auth | Supabase |
| Cache | Redis (Upstash) |
| Jobs | Inngest |
| Email transport | AWS SES, behind a `Transport` interface |
| Flags | PostHog |
| Lint/format | Biome |
| Logger | Winston, never `console.log` |
| Tests | Vitest (unit), Playwright (E2E, runs on preview deploys) |

Do not add a dependency without asking. If 20 lines of local code solves it,
prefer that over a package.

## Architecture decisions

These are deliberate and should not be revisited without discussion.

- **Control plane / data plane split.** `POST /v1/emails` in Hono validates,
  rate limits, writes a `queued` row, emits an Inngest event, returns 202.
  An Inngest function does the actual render and send. Never call SES
  synchronously from a route handler.
- **Transport interface**, not a direct SES call. `ConsoleTransport` for
  tests and local dev, `SesTransport` for production. Both implement the
  same interface so the send pipeline and its tests never touch AWS.
- **Resend bridges auth email until the send pipeline exists.** Supabase's
  default SMTP is rate-limited and marked not-for-production; SES isn't
  wired up until Phase 6. Resend is the real, working provider used
  deliberately in the meantime - swap for Dispatch's own SesTransport once
  it exists, matching the project's own send pipeline instead of a
  competitor's, on purpose rather than by accident.
- **Key format borrows Stripe's live/test segment** Resend
  keys are `re_` plus a random secret, with nothing marking the
  environment. Dispatch issues `dispatch_live_...` and `dispatch_test_...`
  because Dispatch sends real email, and an accidental live send during
  testing is the specific risk the segment prevents. It is part of the
  hashed string, so a test key can never verify against a live key's hash.
- **Webhooks are hand-rolled**, not Svix. HMAC signing and retry with
  backoff are implemented in `packages/core`. This is intentional, not a
  gap to fill with a vendor.
- **`packages/compat` has no React or Next dependency.** The compatibility
  checker must run identically from the dashboard, a CLI, and CI.
- **Large features ship behind a PostHog flag** across several small PRs
  merged to `main`, rather than one large PR or a long-lived branch.

## Repo structure

```
tsconfig.json     shared strict TypeScript config, everything extends it
biome.json        lint and format rules for the whole repo
design/
  design-system/  tokens, foundations docs, logo, DECISIONS.md, PROVENANCE.md
apps/
  web/      Next.js: landing, auth, dashboard
  api/      Hono: public REST API v1
packages/
  db/       Drizzle schema, migrations, client
  core/     send pipeline, key hashing, webhook signing
  compat/   compatibility checker engine, framework-free
  ui/       Radix + Tailwind components
  config/   currently unused - tailwind v4 configures via tokens.css's
            @theme block directly, not a JS preset
```

tsconfig and biome config live at the repo root, not in packages/config.
A single root config covers every package; only apps/web has its own
tsconfig.json, because Next.js requires one in the app directory.

New code goes in the existing package it belongs to. Ask before creating
a new package.

## Comments

Explain why, never what. If a comment restates the code, delete it.

Bad:
```ts
// Validate the email address and return a boolean
function isValid(email: string) {}
```

Good:
```ts
// SES rejects addresses over 320 chars before we ever get a bounce
if (email.length > 320) return false

// Inngest retries this step, so the insert has to be idempotent
```

Never: `// Helpers`, `// Imports`, `// Main component`, or anything that
addresses the reader ("Note that", "We need to").

## TypeScript

- No non-null assertions `!` outside of tests
- Infer where possible, annotate exported function signatures
- Zod schemas are the source of truth for shared types

## Naming

- Files kebab-case, components PascalCase
- No abbreviations except `id`, `url`, `db`, `api`
- Booleans read as predicates: `isVerified`, `hasBounced`

## Commits

Conventional commits, type prefix required.

```
feat: add DKIM record polling to domain detail
fix: correct relative timestamp for emails older than a year
refactor: extract transport interface from send pipeline
```

Never `wip`, `update`, `changes`, or anything meaningless in six months.

## Pull requests

Title uses the conventional commit format. Body:

```
## Description

### How to test it

### Related resources

### Additional comments
```

Description required, rest optional but preferred. Include a before/after
screenshot for visual changes. Merge to `main` with a merge commit, not a
squash. Every commit on the branch lands on `main` as written, so each one
has to meet the commit rules above.

Keep the build plan table in `README.md` current, in the same PR as the
code. The first PR of a phase marks it `in progress`, and the PR that
finishes it marks it `done`. If scope moves to another phase, move the
words in the table too, so a row never claims work that hasn't shipped.

Never end a PR description, commit message, or any other message with
"🤖 Generated with [Claude Code](https://claude.com/claude-code)".

## Before finishing a task

1. Run `pnpm biome check --write`
2. Run `pnpm typecheck` if any `.ts` or `.tsx` file changed
3. Run `pnpm test` if `packages/core` or `packages/compat` changed

## Do not

- Create README files or summary markdown unless asked
- Add error handling for cases that cannot happen
- Leave commented-out code
- Reformat or reorganize files you were not asked to touch
