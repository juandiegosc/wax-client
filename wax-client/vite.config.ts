import { defineConfig } from 'vitest/config'
import path from 'node:path'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['LogoWax.svg', 'favicon.ico'],
      manifest: {
        name: 'WAX Studio',
        short_name: 'WAX',
        description: 'Maison 3D a medida — diseña tu accesorio con IA y vélo en realidad aumentada',
        theme_color: '#0f0f10',
        background_color: '#faf9f6',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/LogoWax.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Permitimos archivos grandes (modelos 3D, bocetos base64) en el caché
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallbackDenylist: [
          // No interceptar las rutas de la API ni de n8n/Meshy
          /^\/api/,
          /^\/meshy-cdn/,
        ],
      },
      devOptions: {
        // Permite probar la PWA en local con `npm run dev`
        enabled: true,
        type: 'module',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      // Medimos cobertura sobre código con lógica (componentes, hooks, utils, api clients).
      // Excluimos lo que NO es testeable unitariamente: tipos puros, configs estáticas,
      // routing, entry point, archivos barrel (re-exports).
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/test/**',
        'src/**/*.d.ts',
        'src/main.tsx',
        'src/types/**',
        'src/config/**',
        'src/routes/routePaths.ts',
        'src/routes/router.tsx',
        'src/services/queryClient.ts',
        'src/lib/queryKeys.ts',
        'src/lib/types/**',
        'src/**/types/**',
        'src/**/index.ts',
      ],
    },
  },
  server: {
    port: 5006,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5005',
        changeOrigin: true,
        secure: false,
      },
      '/meshy-cdn': {
        target: 'https://assets.meshy.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/meshy-cdn/, ''),
        secure: true,
      },
    },
  },
})
