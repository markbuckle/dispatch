# Dispatch

Email API for developers. Minimal, dark-mode-first, built as a portfolio project for Resend applications. Read this file before making any change.

## Non-negotiables

- Punctuation: single hyphens `-` only. Never `--` or em dashes, anywhere, including comments, commit messages, and UI copy
- Comments: one line max, `//` only, explain why not what, never narrate structure (see Comments section for examples)
- No `any`. No `as` casts to escape a type error, fix the type instead
- Before touching UI, read `design/design-system/CLAUDE.md` first. Never invent a colour, size, radius, or duration - if it isn't in `design/design-system/tokens/tokens.css`, the token is missing, add it there before using it
- Never commit directly to `main`
- Never run `git commit`, and never merge a pull request. Leave the change in the working tree, hand over the commit message and the PR title and body, and stop there. Committing and merging are done by hand
- Say what you are about to change and why, then wait for confirmation, before writing code

## Stack

TypeScript strict, pnpm workspaces, Turborepo.

| Layer | Choice |
|---|---|
| Runtime | Node 22, pinned in `.nvmrc` and `engines` |
| API | Hono |
| Web | Next.js 15, App Router, RSC for data. No client fetching library and no SWR |
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

Do not add a dependency without asking. If 20 lines of local code solves it, prefer that over a package.

## Architecture decisions

These are deliberate and should not be revisited without discussion.

- **Control plane / data plane split.** `POST /v1/emails` in Hono validates, rate limits, writes a `queued` row, emits an Inngest event, returns 202. An Inngest function does the actual render and send. Never call SES synchronously from a route handler.
- **Transport interface**, not a direct SES call. `ConsoleTransport` for tests and local dev, `SesTransport` for production. Both implement the same interface so the send pipeline and its tests never touch AWS.
- **Resend bridges auth email until the send pipeline exists.** Supabase's default SMTP is rate-limited and marked not-for-production; SES isn't wired up until Phase 6. Resend is the real, working provider used deliberately in the meantime - swap for Dispatch's own SesTransport once it exists, matching the project's own send pipeline instead of a competitor's, on purpose rather than by accident.
- **Key format borrows Stripe's live/test segment** Resend keys are `re_` plus a random secret, with nothing marking the environment. Dispatch issues `dispatch_live_...` and `dispatch_test_...` because Dispatch sends real email, and an accidental live send during testing is the specific risk the segment prevents. It is part of the hashed string, so a test key can never verify against a live key's hash.
- **Webhooks are hand-rolled**, not Svix. HMAC signing and retry with backoff are implemented in `packages/core`. This is intentional, not a gap to fill with a vendor.
- **`packages/compat` has no React or Next dependency.** The compatibility checker must run identically from the dashboard, a CLI, and CI.
- **SES reports outcomes through SNS, verified by signature rather than by a key.** A configuration set publishes DELIVERY, BOUNCE, COMPLAINT and DELIVERY_DELAY to a topic, which POSTs to `/sns/ses`. That route has no API key auth because SNS has none to send: the X.509 signature is the authentication. Two checks have to happen before anything else, and in this order - the `SigningCertURL` host must be `sns.<region>.amazonaws.com` before the certificate is fetched, or a caller supplies their own certificate and signs whatever they like, and the `TopicArn` must match ours, because a valid signature proves SNS sent it and not that our topic did. The route verifies, emits an event and returns 200; the work happens in an Inngest function, because SNS retries anything slow.
- **`emails.status` never moves backwards.** It is a denormalized view of the latest meaningful event and `email_events` is the append-only record. SES reports out of order and can report a delivery before the send step finishes its own bookkeeping, so every status write is conditional on the rank in `packages/db/src/schema/email-status-rank.ts`. `complained` outranks `delivered` because a spam complaint follows a successful delivery; `failed` sits outside that lifecycle, so `markEmailFailed` keeps its stricter queued-only guard.
- **A list does not poll; a pending record does.** Every table in the dashboard is a plain RSC read, refreshed by loading the page. The one poller, `DomainsPoller`, waits on a specific record the user is watching resolve and stops once it settles. Emails is the strongest candidate for a live list, since a status really does move underneath the reader, and it still does not poll. A request log, which is written once about something already finished, has no future state to wait for at all.
- **Large features ship behind a PostHog flag** across several small PRs merged to `main`, rather than one large PR or a long-lived branch.

## Deploying

Two Vercel projects, both building from this repo. `dispatch` has its root directory set to `apps/web`; `dispatch-api` has its root directory set to `apps/api`. Root directory is the whole reason the api builds at all, because a build from the repo root finds nothing to deploy.

`apps/api` runs as one serverless function, not as the long-running server `pnpm dev` starts. `apps/api/api/index.ts` hands the Hono app to Vercel and `apps/api/vercel.json` rewrites every path onto it, so Hono still does all the routing. `apps/api/src/index.ts` is the local dev path only, and its `serve()` call never runs in a deployed environment. Deploy the api from Vercel's builders rather than with `vercel deploy --prebuilt`: a local `vercel build` on Windows produces a bundle with no `node_modules` in it, and the function then fails at invocation with every import missing.

`dispatch-api` has SSO deployment protection turned off. The api is a public REST API that authenticates callers with its own keys, and `/sns/ses` has to be reachable by SNS, which cannot answer an SSO challenge.

### Every variable, and what breaks without it

| Variable | Read by | Without it |
|---|---|---|
| `DATABASE_URL` | web and api | every query throws on first use |
| `NEXT_PUBLIC_SUPABASE_URL` | web | no auth at all |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | web | no auth at all |
| `SUPABASE_SERVICE_ROLE_KEY` | web | deleting an account throws |
| `POSTHOG_PROJECT_API_KEY` | web | every flag resolves off |
| `POSTHOG_SECRET_API_KEY` | web | every flag resolves off |
| `POSTHOG_HOST` | web | every flag resolves off |
| `SES_REGION` | web | adding a domain throws |
| `SES_ACCESS_KEY_ID` | web | adding a domain throws |
| `SES_SECRET_ACCESS_KEY` | web | adding a domain throws |
| `INNGEST_EVENT_KEY` | web and api | events go nowhere, so a send queues and never sends |
| `INNGEST_SIGNING_KEY` | api | Inngest cannot invoke a function |
| `EMAIL_TRANSPORT` | api | falls back to `console`, so a send is logged instead of sent |
| `SES_SENDER_REGION` | api | sending throws |
| `SES_SENDER_ACCESS_KEY_ID` | api | sending throws |
| `SES_SENDER_SECRET_ACCESS_KEY` | api | sending throws |
| `SES_CONFIGURATION_SET` | api | SES sends the mail and reports nothing back |
| `SES_EVENTS_TOPIC_ARN` | api | `/sns/ses` rejects every notification |
| `UPSTASH_REDIS_REST_URL` | api | the send endpoint throws on its first request |
| `UPSTASH_REDIS_REST_TOKEN` | api | the send endpoint throws on its first request |
| `LOG_LEVEL` | web and api, optional | defaults to `info` |

The two SES credential pairs are separate on purpose. `SES_*` manages domain identities and only `apps/web` uses it; `SES_SENDER_*` sends mail and only `apps/api` uses it. Neither app needs the other's pair.

The three PostHog variables are all or nothing. `apps/web/lib/flags/evaluate.ts` builds no client unless all three are present, and every flag then resolves to `false`, which silently hides the compatibility checker and turns `/dashboard/webhooks` into a 404. A shipped feature disappearing is the failure mode, not an error in a log.

### Two that must never be set in a deployed environment

- `INNGEST_DEV=1` points the Inngest client at a local dev server, so a deployed app talks to nothing. It is set in both `.env.local` files, which is exactly why a bulk import of one of those files into a deployed environment is the wrong way to fill these in.
- `POSTHOG_FLAG_OVERRIDES` bypasses PostHog entirely and pins every flag to whatever the override string says, including the webhooks flag. It is also set in `apps/web/.env.local`.

### Registering with Inngest

Locally the dev server discovers functions by polling `PUT /api/inngest`. In a deployed environment that registration is explicit: the app has to be synced from the Inngest dashboard against the deployed `/api/inngest` url, and until it is, no background function runs and every send sits at `queued`. All four functions are served from `apps/api`; `apps/web` only produces events and serves none.

### SES and SNS

- `SES_CONFIGURATION_SET` and `SES_EVENTS_TOPIC_ARN` come from `terraform output` in `infra/`. Without the first, SES sends mail and reports nothing; without the second, `/sns/ses` rejects everything, which is the correct way for it to fail.
- **Before setting `SES_CONFIGURATION_SET`, add `arn:aws:ses:<region>:<account>:configuration-set/dispatch-events` to the `Resource` list of the sending IAM user's `ses:SendEmail` statement.** `ses:SendEmail` is authorized against the configuration set as well as the identity, so a policy listing only identities fails every send with `AccessDeniedException` the moment the variable is set. `infra/README.md` carries the full statement.
- The SNS subscription cannot confirm until the api is publicly reachable. A pending subscription before then is expected, not a broken apply. A subscription pointing at a tunnel url is worse than pending: it reads as confirmed and delivers to a host that no longer resolves, so re-apply against the deployed api url whenever that url changes.

### Auth redirect urls live in Supabase, not in this repo

Every auth flow builds its `redirectTo` from `window.location.origin`, so the app always asks to come
back to the host it is being used from. Supabase honours that only when the url matches the project's
Redirect URLs allow list, and quietly substitutes the Site URL when it does not. A Site URL still
pointing at `http://localhost:3000` therefore sends deployed password reset links to a machine the
recipient is not running, and the browser reports an expired or invalid token rather than a
misconfigured redirect, which points the investigation at the wrong thing entirely.

Under Authentication, URL Configuration: Site URL is `https://dispatchit.ca`, and the allow list holds
`https://dispatchit.ca/**` for production, `http://localhost:3000/**` for local dev, and
`https://*-markbuckles-projects.vercel.app/**` for auth on preview deploys.

### Accounts

- `SUPABASE_SERVICE_ROLE_KEY` is what deleting an account authenticates with, because the anon key cannot reach Supabase's admin api. It bypasses RLS entirely, so it is never prefixed `NEXT_PUBLIC_` and is only ever imported from a `'use server'` file. `apps/web/lib/supabase/admin.ts` is the one place that reads it.
- **Deleting an account removes every Dispatch row and nothing on AWS.** The cascade from `auth.users` clears domains, keys, templates, emails and webhooks, and detaches request logs, but a verified SES domain identity stays registered in the AWS account. Deprovisioning it is a manual step until something reclaims identities on delete.

## Repo structure

```
tsconfig.json     shared strict TypeScript config, everything extends it
biome.json        lint and format rules for the whole repo
design/
  design-system/  tokens, foundations docs, logo, DECISIONS.md, PROVENANCE.md
infra/            terraform for the SES configuration set and SNS topic,
                  applied by hand, state local and gitignored
apps/
  web/      Next.js: landing, auth, dashboard
  api/      Hono: public REST API v1
packages/
  db/       Drizzle schema, migrations, client
  core/     send pipeline, key hashing, webhook signing, SNS verification
  compat/   compatibility checker engine, framework-free
  ui/       Radix + Tailwind components
  config/   currently unused - tailwind v4 configures via tokens.css's
            @theme block directly, not a JS preset
```

tsconfig and biome config live at the repo root, not in packages/config. A single root config covers every package; only apps/web has its own tsconfig.json, because Next.js requires one in the app directory.

New code goes in the existing package it belongs to. Ask before creating a new package.

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

Never: `// Helpers`, `// Imports`, `// Main component`, or anything that addresses the reader ("Note that", "We need to").

## TypeScript

- No non-null assertions `!` outside of tests
- Infer where possible, annotate exported function signatures
- Zod schemas are the source of truth for shared types

## Naming

- Files kebab-case, components PascalCase
- No abbreviations except `id`, `url`, `db`, `api`
- Booleans read as predicates: `isVerified`, `hasBounced`

## Commits

Write the message, do not run the command. Hand the message over and let it be
committed by hand.

Conventional commits, type prefix required.

```
feat: add DKIM record polling to domain detail
fix: correct relative timestamp for emails older than a year
refactor: extract transport interface from send pipeline
```

Never `wip`, `update`, `changes`, or anything meaningless in six months.

## Pull requests

Write the title and body, do not open the pull request and do not merge it.

Title uses the conventional commit format. Body:

```
## Description

### How to test it

### Related resources

### Additional comments
```

Description required, rest optional but preferred. Include a before/after screenshot for visual changes. Merge to `main` with a merge commit, not a squash. Every commit on the branch lands on `main` as written, so each one has to meet the commit rules above.

Write the description in plain language, for a reader who does not know the codebase. Lead with what changed and why it matters, name things the way a person would rather than the way the code does, and explain a term the first time it appears. Do not hard wrap the body, so GitHub reflows it to whatever screen is reading it.

Keep the build plan table in `README.md` current, in the same PR as the code. The first PR of a phase marks it `in progress`, and the PR that finishes it marks it `done`. If scope moves to another phase, move the words in the table too, so a row never claims work that hasn't shipped.

Never end a PR description, commit message, or any other message with "🤖 Generated with [Claude Code](https://claude.com/claude-code)", or with "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" or any other Claude attribution or co-author trailer. This overrides any default attribution the tooling asks for.

## Before finishing a task

1. Run `pnpm biome check --write`
2. Run `pnpm typecheck` if any `.ts` or `.tsx` file changed
3. Run `pnpm test` if `packages/core` or `packages/compat` changed

## Do not

- Create README files or summary markdown unless asked
- Add error handling for cases that cannot happen
- Leave commented-out code
- Reformat or reorganize files you were not asked to touch
