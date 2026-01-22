import { createRoot } from 'react-dom/client'

import ErrorBoundary from './components/ErrorBoundary'
import Dashboard from './Dashboard'

import "../rendererPolyfills";
import "../shared/styles/_main.css";

const root = createRoot(document.getElementById('dashboard'))

root.render(
  <ErrorBoundary>
    <Dashboard />
  </ErrorBoundary>
)