import { defineConfig } from 'vitest/config'
import path from 'node:path'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
      // Solo medimos cobertura sobre componentes React (.tsx).
      // Los .ts (api, hooks, utils, types, services, lib) no cuentan contra
      // el porcentaje — sus tests siguen corriendo pero no afectan la métrica.
      include: ['src/**/*.tsx'],
      exclude: [
        'src/**/*.test.tsx',
        'src/**/*.spec.tsx',
        'src/test/**',
        'src/main.tsx',
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
