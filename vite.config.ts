import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build:{
    lib:{
      entry:"./src/main.ts",
      name:"BetterScroll",
      formats:['es','iife']
    },
    rollupOptions:{
      external:['vue','lodash-es'],
      output:{
        globals:{
          vue:"Vue",
          'lodash-es':"_"
        }
      }
    }
  }
})
