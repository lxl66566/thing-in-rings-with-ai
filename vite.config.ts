import tailwindcss from '@tailwindcss/vite';
import type { UserConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import { defineConfig } from 'vitest/config';

const config: UserConfig = defineConfig({
  base: '/thing-in-rings-with-ai/',
  build: {
    target: 'esnext',
  },
  // https://github.com/andi23rosca/solid-markdown/issues/33
  optimizeDeps: {
    include: ['solid-markdown > micromark', 'solid-markdown > unified'],
  },
  plugins: [tailwindcss(), solidPlugin()],
  server: {
    port: 3000,
  },
  test: {
    environment: 'node',
  },
});

export default config;
