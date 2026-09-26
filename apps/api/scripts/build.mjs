import { build } from 'esbuild';

// api/index.js is committed rather than generated, because Vercel decides which serverless functions exist by scanning the source tree before this build runs
await build({
  // inlined rather than left to the runtime: the workspace packages ship extensionless TypeScript imports, and their own dependencies do not resolve from apps/api under pnpm's isolated node_modules
  entryPoints: ['src/vercel.ts'],
  outfile: 'api/server.js',
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  // inline, because a .map beside the bundle is imported by nothing and so never gets traced into the deployed function
  sourcemap: 'inline',
  // the original source text would treble the bundle, and a stack trace only needs the file and the position
  sourcesContent: false,
  // bundled CJS dependencies still call require() at runtime, and an ESM bundle has none until this defines one
  banner: {
    js: "import { createRequire as __createRequire } from 'node:module';\nconst require = __createRequire(import.meta.url);",
  },
});
