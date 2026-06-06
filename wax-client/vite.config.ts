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
            purpose: 'any',
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallbackDenylist: [/^\/api/, /^\/meshy-cdn/],
      },
      devOptions: {
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
      // routing, entry point, archivos barrel (re-exports), y megacomponentes que
      // requieren integration tests (Stripe Elements, model-viewer, SignalR, etc).
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
        'src/routes/RequiredAuth.tsx',
        'src/services/queryClient.ts',
        'src/lib/queryKeys.ts',
        'src/lib/types/**',
        'src/**/types/**',
        'src/**/index.ts',
        'src/app/**',
        // Megacomponentes con muchas dependencias externas (requieren integration tests):
        'src/features/atelier/components/AtelierChat.tsx',
        'src/features/atelier/components/GeneratorPanel.tsx',
        'src/features/atelier/components/ChatPanel.tsx',
        'src/features/atelier/components/CotizarFormModal.tsx',
        'src/features/atelier/hooks/useChat.ts',
        'src/features/atelier/hooks/useGenerate.ts',
        'src/features/atelier/hooks/useTaskStatus.ts',
        'src/features/atelier/hooks/useUsdzFromGlb.ts',
        'src/features/atelier/utils/atelierHelpers.ts',
        'src/layouts/MainLayout.tsx',
        'src/layouts/PwaInstallButton.tsx',
        'src/layouts/MenuToggle.tsx',
        'src/pages/HomePage.tsx',
        'src/pages/ProfilePage.tsx',
        'src/pages/AtelierPage.tsx',
        'src/pages/RegisterPage.tsx',
        'src/pages/CustomProductDetailPage.tsx',
        'src/pages/TicketDetailPage.tsx',
        // Stripe Elements no se mockea bien con unit tests:
        'src/features/checkout/components/CheckoutStepper.tsx',
        'src/features/checkout/components/AddressStep.tsx',
        'src/features/checkout/components/PaymentStep.tsx',
        'src/features/checkout/pages/CheckoutPageContent.tsx',
        'src/features/checkout/pages/CheckoutSuccessPageContent.tsx',
        // Model-viewer / WebGL requiere integration test:
        'src/features/customProducts/pages/CustomProductDetailPageContent.tsx',
        // SignalR hub requiere integration test:
        'src/features/support/hooks/useSupportHub.ts',
        'src/features/support/pages/SupportPageContent.tsx',
        'src/features/support/pages/TicketDetailPageContent.tsx',
        // Interceptors de axios (testeables, pero requieren entorno completo):
        'src/services/httpClient.ts',
        'src/lib/api/agent.ts',
        'src/lib/hooks/usePwaInstall.ts',
        // Pages wrappers (1-line components): trivial
        'src/pages/BasketPage.tsx',
        'src/pages/CatalogPage.tsx',
        'src/pages/CheckoutPage.tsx',
        'src/pages/CheckoutSuccessPage.tsx',
        'src/pages/MyCustomProductsPage.tsx',
        'src/pages/MyOrdersPage.tsx',
        'src/pages/SupportPage.tsx',
        'src/pages/NotFoundPage.tsx',
        'src/pages/NotFoundErrorPage.tsx',
        'src/pages/ServerErrorPage.tsx',
        'src/pages/ProductDetailsPage.tsx',
        'src/pages/LoginPage.tsx',
        'src/providers/**',
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
