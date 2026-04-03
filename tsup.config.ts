import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'api/_index.ts' },
  format: ['esm'],
  target: 'node20',
  splitting: false,
  sourcemap: false,
  clean: false, // Don't clean api/ because it contains index.ts
  minify: true,
  outDir: 'api',
  bundle: true,
  noExternal: [/.*/], // Bundle all dependencies
  external: ['@prisma/client'], // Keep Prisma client external if needed, but often bundling is better
});
