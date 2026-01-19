import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StaticRouter } from 'react-router-dom/server'
import {ProjectorWrapper} from './projector/ProjectorWrapper'
import Dashboard from './dashboard/Dashboard'
import ErrorBoundary from './dashboard/components/ErrorBoundary'

import "./rendererPolyfills";
import "./shared/styles/_main.css";

export function App() {
  return (
    <main>
      <Routes>
        {/** TODO splash screen? */}
        <Route path={"/"} element={<div className='bg-black'></div>} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projector" element={<ProjectorWrapper />} />
      </Routes>
    </main>
  )
}

if (typeof window !== 'undefined') {
  const target = document.getElementById('root')
  if (!target) throw new Error('No root container found')

  const root = (
    <BrowserRouter>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </BrowserRouter>
  )
  if (import.meta.env.DEV) {
    createRoot(target).render(root)
  } else {
    hydrateRoot(target, root)
  }
}

export async function prerender(data: { url: string }) {
  const { renderToString } = await import('react-dom/server')

  console.error(data)

  const html = renderToString(
    <StaticRouter location={data.url}>
      <App />
    </StaticRouter>
  )

  return {
    html,
    links: new Set(['/', '/dashboard', '/projector'])
  }
}
