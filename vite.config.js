import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

// Vite configuration with explicit proxy to Spring Boot backend on port 3333
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'FortunAI — Assistente Financeiro',
        short_name: 'FortunAI',
        description: 'Gerencie suas finanças com inteligência artificial',
        theme_color: '#7C3AED',
        background_color: '#0a0a0f',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fortunai-production\.up\.railway\.app\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 300
              },
              networkTimeoutSeconds: 10
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      // Alias '@' -> /src (usado pelo design system D4: '@/theme', '@/components/ui')
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    // sockjs-client uses Node.js `global` — map it to browser globalThis
    global: 'globalThis',
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // React core — separated for long-term cache
          'vendor-react': ['react', 'react-dom', 'react-router-dom', '@emotion/react', '@emotion/styled'],

          // MUI — separate from main bundle
          'vendor-mui': ['@mui/material', '@mui/icons-material'],

          // Recharts — heavy, changes rarely, benefits from long cache
          'vendor-recharts': ['recharts'],

          // WebSocket — CJS bundle, not tree-shakeable, isolate
          'vendor-websocket': ['sockjs-client', '@stomp/stompjs'],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3333', // Backend Spring Boot server
        changeOrigin: true,
        secure: false,
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    exclude: ['e2e/**', 'node_modules/**'],
  }
})
