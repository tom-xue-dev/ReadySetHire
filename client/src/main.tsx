import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { logEnvironmentInfo } from './config/api'

// Log environment information on startup
logEnvironmentInfo();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>
)