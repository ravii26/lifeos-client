import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { Toaster } from 'sonner'
import { ConfirmHost } from '@/components/ui/confirm'
import '@fontsource-variable/archivo'
import '@fontsource/space-mono'
import '@fontsource-variable/hanken-grotesk' // used by classic UI mode only
import './index.css'
import { store } from '@/store/store'
import { initTheme } from '@/features/tweaks/theme'
import { initUIMode } from '@/features/tweaks/uiMode'
import App from './App.tsx'

// Restore the saved theme (paper/night) + accent before first paint.
initTheme()
// Restore the saved UI mode (brutalist/classic) before first paint.
initUIMode()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
      <Toaster
        theme="light"
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--surface-2)',
            border: '2px solid var(--tx)',
            boxShadow: 'var(--shadow-1)',
            color: 'var(--tx)',
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: 600,
            borderRadius: 'var(--r-md)',
          },
        }}
      />
      <ConfirmHost />
    </Provider>
  </StrictMode>,
)
