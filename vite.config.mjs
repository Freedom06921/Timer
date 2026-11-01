import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  // 必须使用相对路径，Electron 通过 file:// 加载构建产物
  base: './',
  build: {
    // 单独输出，避免与 electron-builder 的 dist 目录混在一起
    outDir: 'renderer-dist',
    emptyOutDir: true,
    assetsDir: 'assets',
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
