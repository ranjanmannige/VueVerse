import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'; // Import path module

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: 
      {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        vue: path.resolve('./node_modules/vue')
      },
      //{find: /^~(.*)$/,replacement: 'node_modules/$1'},
  },
  //server:{ hmr:{ overlay: false }},
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
        @import "@/assets/css/main.scss";
        `
      }
    }
  }
})
