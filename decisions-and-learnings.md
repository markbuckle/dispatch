# Decisions and learnings

Things worth knowing that the code does not say on its own. Architecture decisions live in
`CLAUDE.md`; this file is for what was learned the hard way.

## Extensionless relative imports only work because every consumer is a bundler

Found in Phase 13, deploying `apps/api`.

The repo writes relative imports without a file extension, `import { app } from './app'`, in 102
places across 30 files: 6 in `apps/api/src`, 44 in `packages/core`, 51 in `packages/db`. That is
not valid ESM. Node's ESM resolver requires the extension, and the repo declares `"type": "module"`.

It has never mattered because every consumer so far resolves imports itself. Next bundles
`apps/web`, `tsx` handles `apps/api` in development, Vitest handles the tests, and the root
`tsconfig.json` sets `moduleResolution: "bundler"`, which tells TypeScript to allow it. Nothing in
the toolchain objects.

Plain Node does object. Running the api's entry with `node` rather than `tsx` fails on the first
relative import, and once that one is fixed it fails on the next, down through `packages/core` and
`packages/db`. It is not a `node_modules` or TypeScript problem: Node loaded
`packages/core/src/index.ts` and stripped its types happily, then failed to resolve
`'./api-keys/generate'`.

This surfaced when the api was deployed to Vercel, whose Node runtime transpiles each file
separately and leaves the specifiers as written, so the deployed function died on
`ERR_MODULE_NOT_FOUND`. It was fixed by bundling `apps/api` with esbuild rather than by adding 102
extensions, on the grounds that the bundle is confined to the deployment boundary and leaves the
shared packages and their tests untouched.

**The learning is that the fix was local and the cause is not.** The next consumer that resolves
imports the way Node does, a CLI, a worker, a Lambda outside Vercel, anything run with `node`, hits
this again and gets the same confusing cascade. At that point adding the extensions repo-wide is
probably the right answer, because it is mechanical, removes a build step, and makes the packages
honest ESM. The reason not to do it in Phase 13 was scope, not correctness.

## Bundling for a Node runtime needs a require shim

Also Phase 13. An esbuild bundle in `esm` format cannot serve the `require()` calls that bundled
CommonJS dependencies still make at runtime, and `debug`, reached through Winston, calls
`require('tty')`. esbuild emits a shim that throws unless a real `require` is in scope, so
`apps/api/scripts/build.mjs` defines one from `node:module`'s `createRequire` in the output banner.

Everything is inlined rather than left external, because a dependency of `packages/db` such as
`drizzle-orm` does not resolve from `apps/api` under pnpm's isolated `node_modules`. Marking the
published packages external produced a function that could not find them.

## Vercel's Node runtime ignores what a default export returns

Also Phase 13, and the failure mode is a hang rather than an error. A default export is read as
`(req, res) => void`, so returning a `Response` from it means nothing is ever written and the
request sits until the platform gives up. `apps/api/src/vercel.ts` exports a named `fetch` instead,
which is the Web-standard signature the runtime looks for.

The general lesson is that this class of bug does not show up in a build log. Invoking the built
artifact with plain `node` before deploying caught two of these in a minute each, where a deploy
and a log read would have taken far longer per attempt.
