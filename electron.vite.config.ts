import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import 'dotenv/confirg'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],

    define: {
      'process.env.OPENAI_API_KEY': JSON.stringify(process.env.OPENAI_API_KEY)
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react()]
  }
})
