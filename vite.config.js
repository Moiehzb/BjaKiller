import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  // base relative pour que les assets se chargent en file:// (APK Capacitor)
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        skins: resolve(__dirname, 'skin-showcase.html'),
      },
    },
  },
});
