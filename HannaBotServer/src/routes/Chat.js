import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function chatHandler(req, res) {
  try {
    const { messages = [],  mode = "Beginner", kind } = req.body || {}
  console.log("POST /api/chat", { count: Array.isArray(messages) ? messages.length : 0 })
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OpenAI API key not configured. Set OPENAI_API_KEY in your environment variables.",
      })
    }

     const levelPrompt =
      mode === "Advanced"
        ? "Be concise and rigorous. Focus on nuances, performance and edge cases."
        : mode === "Intermediate"
        ? "Explain clearly with best practices. Include small examples."
        : "You are a patient tutor. Explain step-by-step with simple examples and avoid jargon."


    // Ensure messages are role/content pairs
    const cleanMessages = Array.isArray(messages)
      ? messages
          .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: String(m.content ?? "") }))
          .filter((m) => m.content.trim() !== "")
      : []
       let modelMessages = [{ role: "system", content: levelPrompt }, ...cleanMessages]

    if (kind === "quiz") {
      // Ask the model to generate a small quiz in Markdown
      modelMessages = [
        ...modelMessages,
        {
          role: "user",
          content:
            "Create a short quiz (5 multiple-choice questions) about the topic above. " +
            "Output in Markdown with a numbered list, each with options A–D and mark the correct option at the end of each question using '**Answer:** X'.",
        },
      ]
    }  

    const result = await generateText({
      model: openai("gpt-4o-mini"),
      messages: cleanMessages,
      maxTokens: 1000,
      temperature: 0.7,
    })

    return res.json({ content: result.text })
  } catch (error) {
    console.error("Chat API error:", error)
    return res.status(500).json({
      error: "Failed to generate response",
      message: "I encountered an error while processing your request. Please try again.",
    })
  }
}