import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import path from 'path';

export default defineConfig({
  plugins: [
    vue(),
    electron([
      {
        // Main process entry point
        entry: 'electron/main.js',
        onstart(options) {
          // Only restart electron when main process changes
          options.startup();
        },
        vite: {
          build: {
            outDir: 'dist-electron',
            sourcemap: true,
          }
        }
      },
      {
        // Preload script
        entry: 'electron/preload.js',
        vite: {
          build: {
            outDir: 'dist-electron',
            sourcemap: true,
          }
        }
      }
    ]),
    renderer()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
