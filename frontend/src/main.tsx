import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerServiceWorker, setupInstallPrompt, setupOfflineDetection } from './utils/pwa'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Initialize PWA features
if (import.meta.env.PROD) {
  registerServiceWorker()
  setupInstallPrompt()
  setupOfflineDetection()
}
