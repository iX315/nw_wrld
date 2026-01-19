import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StaticRouter } from 'react-router-dom/server'
import Dashboard from './dashboard/Dashboard'

export function App() {
  return (
    <main>
      <Routes>
        {/** TODO splash screen? */}
        <Route path={"/"} element={<div className='bg-black'></div>} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projector" element={(
          <div className='projector'>
            <div className="drag-region"/>
            <div className="modules" />
          </div>
        )} />
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
}

export async function prerender({url}: { url: string }) {
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
