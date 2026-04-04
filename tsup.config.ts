import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/vercel.ts' },
  format: ['esm'],
  target: 'node20',
  splitting: false,
  sourcemap: false,
  clean: true,
  minify: true,
  outDir: 'api',
  bundle: true,
  external: ['@prisma/client', '@prisma/client-runtime-utils', 'prisma'],
  outExtension() {
    return {
      js: `.mjs`,
    }
  }
});
