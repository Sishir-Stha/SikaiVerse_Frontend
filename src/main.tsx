import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChatbotProvider } from './context/ChatbotContext'
import './globals.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
     <ChatbotProvider>
    <App />
    </ChatbotProvider>
  </StrictMode>,
)
