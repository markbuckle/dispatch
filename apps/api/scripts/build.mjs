import { writeFile } from 'node:fs/promises';
import { build } from 'esbuild';

// inlined rather than left to the runtime: the workspace packages ship extensionless TypeScript imports, and their own dependencies do not resolve from apps/api under pnpm's isolated node_modules
await build({
  entryPoints: ['src/vercel.ts'],
  outfile: 'api/server.js',
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

// node binds a module's sourcemap as it compiles it, so the switch has to be thrown from outside the bundle and the import has to be dynamic to stay below it
await writeFile(
  'api/index.js',
  `process.setSourceMapsEnabled(true);
export const fetch = async (request) => (await import('./server.js')).fetch(request);
`,
);
