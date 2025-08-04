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
        return `${format}/index.js`;
      },
    },
    rollupOptions: {
      external: [
        '@auth0/cose',
        'cbor-x',
        'node:crypto',
        'node:buffer',
        'node:crypto',
      ],
    },
  },
});
