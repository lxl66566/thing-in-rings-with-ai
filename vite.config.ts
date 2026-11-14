import UnoCSS from 'unocss/vite';
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
  plugins: [UnoCSS(), solidPlugin()],
  server: {
    port: 3000,
    proxy: {
      // Multiplayer websocket handled by the node server (see server/index.ts).
      '/ws': { target: 'ws://localhost:8787', ws: true },
    },
  },
  test: {
    environment: 'node',
  },
});

export default config;
