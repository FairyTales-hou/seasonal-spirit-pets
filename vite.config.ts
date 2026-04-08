import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [uni()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/qweather-geo': {
        target: 'https://mf3wt3a8u8.re.qweatherapi.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/qweather-geo/, ''),
      },
      '/qweather-weather': {
        target: 'https://mf3wt3a8u8.re.qweatherapi.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/qweather-weather/, ''),
      },
    },
  },
})
