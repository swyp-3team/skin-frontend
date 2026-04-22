import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import './index.css'
import './lib/env'
import AppRouter from './app/router'
import GlobalErrorFallback from './components/GlobalErrorFallback'
import { Toaster } from './components/ui/sonner'
import { queryClient } from './lib/queryClient'

const bottomToasterOffset = { bottom: 140 }
const resultRoutineToasterOffset = { top: 28, left: 20, right: 20 }

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={GlobalErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <AppRouter />
        <Toaster
          position="bottom-center"
          offset={bottomToasterOffset}
          mobileOffset={bottomToasterOffset}
          visibleToasts={1}
          closeButton={false}
          expand
          containerAriaLabel="Notifications"
        />
        <Toaster
          id="result-routine-saved"
          position="top-center"
          offset={resultRoutineToasterOffset}
          mobileOffset={resultRoutineToasterOffset}
          visibleToasts={1}
          closeButton={false}
          containerAriaLabel="Result routine notifications"
        />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
)
