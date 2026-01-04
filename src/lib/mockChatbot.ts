export async function mockChatbot(message: string): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 800))
  const lower = message.toLowerCase()
  if (lower.includes('hello') || lower.includes('hi')) {
    return "Hi there! 👋 I'm your Sikai Verse assistant."
  }

  if (lower.includes('course')) {
    return "Sikai Verse offers interactive learning experiences across multiple subjects."
  }

  if (lower.includes('help')) {
    return "Sure! You can ask me about courses, features, or how to use the platform."
  }

  return "This is a demo response 😊 The backend isn't connected yet."
}
