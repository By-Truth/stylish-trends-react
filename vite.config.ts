import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env / .env.local so VITE_API_PROXY_TARGET is available here too —
  // Vite only auto-exposes VITE_-prefixed vars to client code via
  // import.meta.env, not to this config file, so it has to be loaded explicitly.
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:8000'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      proxy: {
        // Forwards to the PHP API so the browser only ever talks to one
        // origin (this dev server) — no CORS, no cross-site cookie issues.
        // Point VITE_API_PROXY_TARGET (.env.local) at your XAMPP host.
        '/api': { target: apiTarget, changeOrigin: true },
        '/images': { target: apiTarget, changeOrigin: true },
      },
    },
  }
})
