import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function chatHandler(req, res) {
  try {
    const { messages = [], mode = "Beginner", kind, code = "", language = "plaintext", preferences = {} } = req.body || {}

    console.log("POST /api/chat", {
      count: Array.isArray(messages) ? messages.length : 0,
      kind,
      mode
    })

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OpenAI API key not configured. Set OPENAI_API_KEY in your environment variables."
      })
    }

    // Level / explanation style system prompt
    const levelPrompt =
      mode === "Advanced"
        ? "Be concise and rigorous. Focus on nuances, performance and edge cases."
        : mode === "Intermediate"
        ? "Explain clearly with best practices. Include small examples."
        : "You are a patient tutor. Explain step-by-step with simple examples and avoid jargon."

    // Sanitize incoming messages
    const cleanMessages = Array.isArray(messages)
      ? messages
          .map(m => ({
            role: m.role === "user" ? "user" : "assistant",
            content: String(m.content ?? "")
          }))
          .filter(m => m.content.trim() !== "")
      : []

    // Base conversation (system + history)
    let modelMessages = [{ role: "system", content: levelPrompt }, ...cleanMessages]

    // Quiz mode – append quiz instruction
    if (kind === "quiz") {
      modelMessages = [
        ...modelMessages,
        {
          role: "user",
          content:
            "Create a short quiz (5 multiple-choice questions) about the topic above. " +
            "Output in Markdown with a numbered list. Each question should have options A–D and end with '**Answer:** X'."
        }
      ]
    }

    // Code assistant modes override the stack with a structured JSON instruction
    const isCodeMode = kind === "code-review" || kind === "code-improve" || kind === "tests"
    if (isCodeMode) {
      const clippedCode = String(code).slice(0, 12000)
      const persona =
        preferences.experienceLevel === "advanced"
          ? "Assume the user is experienced; be concise."
          : preferences.experienceLevel === "intermediate"
          ? "User is intermediate; include brief rationale."
          : "User is a beginner; explain clearly and avoid unexplained jargon."

      const taskInstruction =
        kind === "code-review"
          ? "Perform a code review. List issues (id, severity (info|minor|major|critical), type, message, lineHint). Then propose an improved full snippet."
          : kind === "code-improve"
          ? "Refactor / optimize the code. Explain key changes. Provide improved full snippet."
          : "Generate focused unit tests (same language if possible). Explain coverage. Provide test code."

      modelMessages = [
        {
          role: "system",
            content: `You are an expert software assistant.
${persona}
Return STRICT JSON only, matching this schema:
{
 "summary": "string",
 "issues": [ { "id": "string", "severity": "info|minor|major|critical", "type": "string", "message": "string", "lineHint": "string" } ],
 "improvedCode": "string",
 "tests": "string"
}
If a field is not applicable, use an empty string or empty array. Do not add ANY text outside the JSON.`
        },
        {
          role: "user",
          content: `${taskInstruction}
Language: ${language}
---BEGIN CODE---
${clippedCode}
---END CODE---`
        }
      ]
    }

    // Generate response with correct message set
    const result = await generateText({
      model: openai("gpt-4o-mini"),
      messages: modelMessages,
      maxTokens: isCodeMode ? 900 : 1000,
      temperature: isCodeMode ? 0.4 : 0.7
    })

    // Specialized JSON response for code assistant modes
    if (isCodeMode) {
      let parsed
      try {
        parsed = JSON.parse(result.text)
      } catch {
        parsed = {
          summary: "Failed to parse model JSON output.",
          issues: [],
          improvedCode: "",
          tests: "",
          raw: result.text
        }
      }
      return res.json(parsed)
    }

    // Normal / quiz / regular chat response
    return res.json({ content: result.text })
  } catch (error) {
    console.error("Chat API error:", error)
    return res.status(500).json({
      error: "Failed to generate response",
      message: "I encountered an error while processing your request. Please try again."
    })
  }
}