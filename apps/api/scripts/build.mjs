import { build } from 'esbuild';

// inlined rather than left to the runtime: the workspace packages ship extensionless TypeScript imports, and their own dependencies do not resolve from apps/api under pnpm's isolated node_modules
await build({
  entryPoints: ['src/vercel.ts'],
  outfile: 'api/index.js',
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  sourcemap: true,
  // bundled CJS dependencies still call require() at runtime, and an ESM bundle has none until this defines one
  banner: {
    js: "import { createRequire as __createRequire } from 'node:module';\nconst require = __createRequire(import.meta.url);",
  },
});
