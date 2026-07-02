import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StaticRouter } from 'react-router-dom/server'

import Index from './routes/index'
import Dashboard from './routes/dashboard'
import Projector from './routes/projector'

import './app.css'

interface UrlProps { url: string }

export function App() {
  return (
    <main>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projector" element={<Projector />} />
      </Routes>
    </main>
  )
}

if (typeof window !== 'undefined') {
  const target = document.getElementById('root')
  if (!target) throw new Error('No root container found')

  const root = (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
  if (import.meta.env.DEV) {
    createRoot(target).render(root)
  } else {
    hydrateRoot(target, root)
  }

  // Use contextBridge
  window.ipcRenderer.on('main-process-message', (_event, message) => {
    console.log(message)
  })
}

export async function prerender({url}: UrlProps) {
  const { renderToString } = await import('react-dom/server')

  const html = renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>
  )

  return {
    html,
    links: new Set(['/', '/dashboard', '/projector'])
  }
}
