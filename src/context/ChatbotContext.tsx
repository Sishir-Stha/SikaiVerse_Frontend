import { createContext, useContext, useState } from 'react'

interface ChatbotContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  openChatbot: () => void
  closeChatbot: () => void
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined)

export function ChatbotProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const openChatbot = () => setIsOpen(true)
  const closeChatbot = () => setIsOpen(false)

  return (
    <ChatbotContext.Provider value={{ isOpen, setIsOpen, openChatbot, closeChatbot }}>
      {children}
    </ChatbotContext.Provider>
  )
}

export function useChatbot() {
  const context = useContext(ChatbotContext)
  if (!context) {
    throw new Error('useChatbot must be used within ChatbotProvider')
  }
  return context
}
