// api/Ollama/ai.ts

export interface AskAIRequest {
  prompt: string
}

export interface CourseRecommendation {
  title: string
  category?: string
  level?: string
  rating?: number
  duration_hours?: number
  description?: string
  reason?: string
}

export interface AskAIResponse {
  success: 'true' | 'false'
  response?: string
  courses?: CourseRecommendation[]
  message?: string
}

const API_BASE_URL = 'http://localhost:8440/api/v2'

export const askAI = async (request: AskAIRequest): Promise<AskAIResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch AI response: ${response.status}`)
    }

    const data: AskAIResponse = await response.json()

    if (data.success === 'false') {
      throw new Error(data.message || 'AI request failed')
    }

    return data
  } catch (error) {
    console.error('AI request error:', error)
    throw error
  }
}
