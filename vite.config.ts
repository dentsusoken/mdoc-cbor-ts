import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './lib'),
    },
  },
  plugins: [
    dts({
      entryRoot: './lib',
      outDir: './dist',
      include: ['lib/**/*.ts'],
      exclude: ['lib/**/*.spec.ts', 'lib/**/__tests__/**'],
      rollupTypes: true,
      insertTypesEntry: true,
      bundledPackages: [],
      compilerOptions: {
        skipLibCheck: true,
      },
    }),
  ],
  build: {
    lib: {
      entry: {
        main: './lib/index.ts',
      },
      formats: ['es', 'cjs'],
      name: 'mdoc-cbor-ts',
      fileName: (format) => {
        return `index.${format === 'es' ? 'mjs' : 'cjs'}`;
      },
    },
    rollupOptions: {
      external: [
        'jsrsasign',
        'cbor-x',
        'zod',
        'u8a-utils',
        'noble-curves-extended',
        'node:crypto',
        'node:buffer',
        /^@noble\/curves($|\/)/,
        /^@noble\/hashes($|\/)/,
      ],
    },
  },
});
