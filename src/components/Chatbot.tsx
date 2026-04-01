import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { CourseCard } from './CourseCard'
import { askAI } from '../api/ChatBot/ai'
import { useChatbot } from '../context/ChatbotContext'
import { parseCoursesFromResponse, isCourseResponse } from '../lib/courseParser'
import type { ChatMessage } from '../types'

const FIXED_RESPONSES: { [key: string]: string } = {
  hi: 'Hi there! 👋 How can I assist you today?',
  hello: 'Hello! 🎉 Welcome to Sikai Verse. What would you like to learn about?',
  hey: 'Hey! 👋 I\'m here to help. What can I do for you?',
  'how are you': 'I\'m doing great, thank you for asking! 😊 How can I help you with your learning journey?',
  thanks: 'You\'re welcome! 😊 Feel free to ask if you need anything else.',
  'thank you': 'You\'re welcome! 😊 Feel free to ask if you need anything else.',
  bye: 'Goodbye! 👋 Great learning with you!',
  'good bye': 'Goodbye! 👋 Great learning with you!',
  ok: 'Got it! Let me know if you need anything else.',
  'okay': 'Got it! Let me know if you need anything else.',
}

export default function Chatbot() {
  const { isOpen, setIsOpen } = useChatbot()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your Sikai Verse learning assistant. How can I help you today?',
      timestamp: new Date().toISOString(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Check if input matches any fixed responses (case-insensitive)
      const lowercaseInput = input.toLowerCase().trim()
      const fixedResponse = FIXED_RESPONSES[lowercaseInput]

      let response: string
      let courses = undefined

      if (fixedResponse) {
        // Use fixed response for common greetings
        response = fixedResponse
      } else {
        // Call AI endpoint for other prompts
        const aiResponse = await askAI({ prompt: input })

        if (aiResponse.courses && aiResponse.courses.length > 0) {
          courses = aiResponse.courses.map(course => ({
            name: course.title,
            description: course.description,
            level: course.level,
            rating: course.rating,
            category: course.category,
            duration: course.duration_hours != null ? `${course.duration_hours}h` : undefined,
          }))
          response = 'Here are the courses related to your query:'
        } else if (aiResponse.response) {
          response = aiResponse.response

          if (isCourseResponse(input)) {
            const parsedCourses = parseCoursesFromResponse(response)
            if (parsedCourses && parsedCourses.length > 0) {
              courses = parsedCourses
              response = 'Here are the courses related to your query:'
            }
          }
        } else {
          response = aiResponse.message || 'Sorry, I could not find relevant course recommendations.'
        }
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        courses,
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chatbot error:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 rounded-full bg-primary text-primary-foreground p-4 shadow-lg hover:bg-primary/90 transition-colors z-40"
          aria-label="Open chatbot"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-card border border-border rounded-lg shadow-xl flex flex-col z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Sikai Verse Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>

                  {/* Course Cards */}
                  {message.courses && message.courses.length > 0 && (
                    <div className="mt-3 max-h-64 overflow-y-auto">
                      {message.courses.map((course, idx) => (
                        <CourseCard key={idx} course={course} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted text-muted-foreground px-4 py-2 rounded-lg">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              placeholder="Type your question..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              size="icon"
            >
              <Send size={18} />
            </Button>
          </div>
        </div>
      )}
    </>
  )
}