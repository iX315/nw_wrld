import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StaticRouter } from 'react-router-dom/server'

import Index from './routes/index'
import Dashboard from './routes/dashboard'
import Projector from './routes/projector'

import './app.css'

interface UrlProps { url: string }

interface AppProps extends Partial<UrlProps> {
  isBrowser?: boolean
}

export function App({ url, isBrowser = true }: AppProps) {
  const AppRouter = isBrowser ? BrowserRouter : StaticRouter

  return (
    <AppRouter location={url as string}>
      <main>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projector" element={<Projector />} />
        </Routes>
      </main>
    </AppRouter>
  )
}

if (typeof window !== 'undefined') {
  const target = document.getElementById('root')
  if (!target) throw new Error('No root container found')
  if (import.meta.env.DEV) {
    createRoot(target).render(<App />)
  } else {
    hydrateRoot(target, <App />)
  }

  // Use contextBridge
  window.ipcRenderer.on('main-process-message', (_event, message) => {
    console.log(message)
  })
}

export async function prerender(data: UrlProps) {
  const { renderToString } = await import('react-dom/server')

  const html = renderToString(<App isBrowser={false} {...data} />)

  return {
    html,
    links: new Set(['/', '/dashboard', '/projector'])
  }
}
