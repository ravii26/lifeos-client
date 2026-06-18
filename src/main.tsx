import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { Toaster } from 'sonner'
import { ConfirmHost } from '@/components/ui/confirm'
import '@fontsource-variable/hanken-grotesk'
import '@fontsource-variable/jetbrains-mono'
import './index.css'
import { store } from '@/store/store'
import { initTheme } from '@/features/tweaks/theme'
import App from './App.tsx'

// Restore the saved accent before first paint.
initTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--surface-2)',
            border: '1px solid var(--line-2)',
            color: 'var(--tx)',
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            borderRadius: 'var(--r-md)',
          },
        }}
      />
      <ConfirmHost />
    </Provider>
  </StrictMode>,
)
