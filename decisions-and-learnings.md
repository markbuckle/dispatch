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

## Vercel discovers functions by reading the source tree, not the build output

Found in Phase 13, after several deploys that appeared to work.

A Vercel project with no framework decides which serverless functions exist by scanning `api/` in the
checked out source, before it runs the build command. A build that generates its own entry point into
`api/` is therefore too late: the directory is empty at the moment that decision is made, and the
deployment ends up containing no functions at all.

Nothing about this fails loudly. The build succeeds, the deployment reports Ready, and every route
returns `NOT_FOUND` from the edge because there is nothing behind it. The build log says nothing,
because from the build's point of view everything went fine.

CLI deploys hide it entirely. `vercel deploy` uploads the working tree, so anyone who has just run the
build locally uploads the generated entry along with everything else and the function is found. Every
deploy of this api was made that way, which is why a Git deployment that could never have worked went
unnoticed until a push produced one.

Naming the entry in `vercel.json` under `functions` does not rescue it and fails harder: the pattern is
checked against that same source scan, so the build stops with `The pattern "api/index.js" defined in
functions doesn't match any Serverless Functions inside the api directory`.

So `apps/api/api/index.js` is committed and the build generates only `api/server.js` beside it. Vercel
finds the entry when it scans, the build supplies the bundle, and `@vercel/nft` traces the entry's
dynamic import so the bundle travels with it. The check worth repeating after any change here is to
delete the bundle and deploy, because that is what a clean clone looks like; if the routes answer, the
arrangement holds.

## Node binds a module's sourcemap when it compiles it

Also Phase 13. `process.setSourceMapsEnabled(true)` governs only modules compiled after the call, so
throwing the switch from inside the bundle does nothing for the bundle's own stack traces, even though
`process.sourceMapsEnabled` reads `true` immediately afterwards. Moving the switch above a static
`import` does not help either, because an ESM graph is compiled in full before any of it is evaluated.

That is why the committed entry sets the flag and only then reaches for the bundle through a dynamic
`import`, which is the one ordering that leaves the bundle compiled after the switch is thrown. The
alternative is `NODE_OPTIONS=--enable-source-maps`, which works, but it lives in platform configuration
rather than in the repository, so a deployment created anywhere else loses it without saying so.
