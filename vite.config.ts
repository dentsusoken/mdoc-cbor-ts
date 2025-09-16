import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './lib'),
    },
  },
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
        'exact-key-map',
        'jsrsasign',
        'cbor-x',
        'zod',
        'u8a-utils',
        'node:crypto',
        'node:buffer',
      ],
    },
  },
});
