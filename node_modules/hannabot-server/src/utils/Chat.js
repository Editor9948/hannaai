export function generateMessageId() {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function formatMessageForAPI(message) {
  return {
    role: message.role,
    content: message.content,
  }
}

export function saveMessagesToStorage(messages) {
  if (typeof window !== "undefined") {
    localStorage.setItem("chatbot-messages", JSON.stringify(messages))
  }
}

export function loadMessagesFromStorage() {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("chatbot-messages")
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (error) {
        console.error("Failed to parse stored messages:", error)
      }
    }
  }
  return []
}
