import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import '@/app/index.css'
import { AppProviders } from '@/providers/AppProviders'
import { router } from '@/routes/router'
import { applyTheme, resolveInitialTheme } from '@/lib/utils/theme'

applyTheme(resolveInitialTheme())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
)
