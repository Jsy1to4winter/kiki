import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  base: './',
  resolve: { alias: { '@': fileURLToPath(new URL('./vendor/sticker-forge', import.meta.url)) } },
  define: { __BUILD_TARGET__: JSON.stringify('web'), __XHS_BUILD__: 'false' },
  build: { rollupOptions: { output: { manualChunks: { three: ['three'], 'sticker-forge': ['./vendor/sticker-forge/lib/sticker-forge.ts'] } } } },
});
