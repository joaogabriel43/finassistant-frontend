import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const baseTarget = (env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '')
  const apiTarget = baseTarget
  const headers = {}
  if (env.NGROK_BASIC_AUTH) {
    // Expect NGROK_BASIC_AUTH in the form "user:password"
    const encoded = Buffer.from(env.NGROK_BASIC_AUTH, 'utf8').toString('base64')
    headers['Authorization'] = `Basic ${encoded}`
  }
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
          headers,
          // rewrite: (path) => path.replace(/^\/api/, ''),
        }
      }
    }
  }
})
