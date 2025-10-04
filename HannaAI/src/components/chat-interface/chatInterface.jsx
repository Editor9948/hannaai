import { useEffect, useRef, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"

import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Card } from "../ui/card"
import { ScrollArea } from "../ui/scroll-area"
import { ArrowLeft, Send,  User, Loader2, Trash2,ListChecks, Download, RefreshCw  } from "lucide-react"

// Prefer CRA-style env var for production, with a runtime fallback to current origin
const API_BASE = (process.env.REACT_APP_API_URL || "").replace(/\/$/, "")
const CHAT_ENDPOINT = API_BASE
  ? `${API_BASE}/api/chat`
  : (typeof window !== "undefined" ? `${window.location.origin}/api/chat` : "http://localhost:4000/api/chat")


const STORAGE_KEY = "chatbot-messages"

const toText = (v) => (typeof v === "string" ? v : "")
const normalizeMessage = (m = {}) => ({
  id: String(m.id ?? (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Date.now())),
  role: m.role === "user" ? "user" : "assistant",
  content: toText(m.content),
  createdAt: m.createdAt || Date.now(),
})

export function ChatInterface({ onBack }) {
  const scrollAreaRef = useRef(null)
  const [messages, setMessages] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
      const cleaned = (Array.isArray(raw) ? raw : []).map(normalizeMessage)
      if (cleaned.length) return cleaned
    } catch {}
    return [
      normalizeMessage({
        id: "1",
        role: "assistant",
        content: "Hello! I'm your AI assistant. How can I help you today?",
      }),
    ]
  })
  const [localInput, setLocalInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [regenLoading, setRegenLoading] = useState(false)

   const [level, setLevel] = useState("Beginner")
  
  // Persist messages
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch {}
  }, [messages])

  // Auto-scroll on new messages
  useEffect(() => {
    const el = scrollAreaRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  const clearChatHistory = () => {
    const base = [
      normalizeMessage({
        id: "1",
        role: "assistant",
        content: "Hello! I'm your AI assistant. How can I help you today?",
      }),
    ]
    setMessages(base)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(base))
    } catch {}
  }

  const exportChat = () => {
    const md = messages
      .map(m => {
        const who = m.role === "user" ? "User" : "Assistant"
        return `### ${who}\n\n${toText(m.content)}\n`
      })
      .join("\n")
    const blob = new Blob([`# HannaChatBot Transcript\n\n${md}`], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `hannabot-${new Date().toISOString().slice(0,19).replace(/[:T]/g,"-")}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const regenerateLast = async () => {
    if (isLoading || regenLoading) return
    // Find last user message before the last assistant message
    const lastAssistantIndex = [...messages].reverse().findIndex((m) => m.role === "assistant")
    if (lastAssistantIndex === -1) return
    const idxFromStart = messages.length - 1 - lastAssistantIndex
    // Find the nearest preceding user message
    let lastUserIdx = -1
    for (let i = idxFromStart - 1; i >= 0; i--) {
      if (messages[i].role === "user") { lastUserIdx = i; break; }
    }
    if (lastUserIdx === -1) return

    setRegenLoading(true)
    const assistantId = messages[idxFromStart]?.id || String(Date.now() + "-assistant-regen")
    // Replace/clear last assistant message content before refetch
    setMessages((prev) => prev.map((m, i) => (i === idxFromStart ? { ...m, content: "" } : m)))
    try {
      const res = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: level,
          messages: messages
            .slice(0, lastUserIdx + 1) // up to and including last user message
            .map((m) => ({ role: m.role, content: toText(m.content) })),
        }),
      })
      const ct = res.headers.get("content-type") || ""
      if (!res.ok) {
        const body = await res.text().catch(() => "")
        const msg = body || `Request failed (${res.status})`
        upsertAssistantMessage(assistantId, msg)
        return
      }
      if (ct.includes("application/json")) {
        const data = await res.json()
        const content = toText(data.content) || toText(data.reply) || toText(data.message?.content) || ""
        upsertAssistantMessage(assistantId, content)
      } else {
        const textBody = await res.text()
        upsertAssistantMessage(assistantId, textBody || "")
      }
    } catch (e) {
      upsertAssistantMessage(assistantId, "Regeneration failed. Please try again.")
    } finally {
      setRegenLoading(false)
    }
  }

  const upsertAssistantMessage = (id, content) => {
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === id)
      if (idx === -1) return [...prev, normalizeMessage({ id, role: "assistant", content })]
      const next = prev.slice()
      next[idx] = { ...next[idx], content: toText(content) }
      return next
    })
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const text = (localInput ?? "").trim()
    if (!text || isLoading) return

    // Add user message
    const userMsg = normalizeMessage({ role: "user", content: text })
    setMessages((prev) => [...prev, userMsg])
    setLocalInput("")
    setIsLoading(true)

    // Prepare assistant placeholder
    const assistantId = String(Date.now() + "-assistant")
    upsertAssistantMessage(assistantId, "")

    try {
     console.log("POST ->", CHAT_ENDPOINT)
      const res = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
           mode: level, 
          // Send only role/content to the server
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: toText(m.content) })),
        }),
      })

     const ct = res.headers.get("content-type") || ""
      if (!res.ok) {
        const body = await res.text().catch(() => "")
        const msg = body || `Request failed (${res.status})`
        upsertAssistantMessage(assistantId, msg)
        return
      }

 if (ct.includes("text/event-stream") || ct.includes("application/stream+json") || ct.includes("ndjson")) {
        if (res.body && typeof res.body.getReader === "function") {
          const reader = res.body.getReader()
          const decoder = new TextDecoder()
          let assistantText = ""
          while (true) {
            const { value, done } = await reader.read()
            if (done) break
            assistantText += decoder.decode(value, { stream: true })
            upsertAssistantMessage(assistantId, assistantText)
          }
          assistantText += decoder.decode()
          upsertAssistantMessage(assistantId, assistantText)
        } else {
          const textBody = await res.text()
          upsertAssistantMessage(assistantId, textBody || "Received response.")
        }
      } else if (ct.includes("application/json")) {
        const data = await res.json()
        const content =
          toText(data.content) ||
          toText(data.reply) ||
          toText(data.message?.content) ||
          "Received response."
        upsertAssistantMessage(assistantId, content)
      } else {
        const textBody = await res.text()
        upsertAssistantMessage(assistantId, textBody || "Received response.")
      }
    } catch (err) {
      console.error("Fetch error:", err)
      upsertAssistantMessage(assistantId, "Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  };

 const onQuiz = async () => {
    if (isLoading) return
    const context = messages.slice(-6) // last turns as context
    const userMsg = normalizeMessage({ role: "user", content: "Please quiz me on this topic." })
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)
    const assistantId = String(Date.now() + "-quiz")
    upsertAssistantMessage(assistantId, "Generating a quiz...")
    try {
      const res = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: level,
          kind: "quiz",               // tell server to produce a quiz
          messages: context.map(m => ({ role: m.role, content: toText(m.content) })),
        }),
      })
      const ct = res.headers.get("content-type") || ""
      const text = ct.includes("application/json") ? (await res.json()).content : await res.text()
      upsertAssistantMessage(assistantId, toText(text))
    } catch {
      upsertAssistantMessage(assistantId, "Failed to generate quiz. Please try again.")
    } finally {
      setIsLoading(false)
    }
  };


  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center  gap-2 md:gap-4">
            <Button variant="ghost" 
            size="sm"
            onClick={onBack}
            className="h-8 md:h-9 px-2 md:px-3 hover:bg-emerald-50 text-emerald-700"
              aria-label="Back">
              <ArrowLeft className="h-4 w-4 mr-0 md:mr-2" />
              <span className="hidden md:inline">Back</span>
            </Button>
            <div className="flex items-center gap-2">
               <img
               src="/hannaai-logo.png"
              alt="HannaAI"
              className="h-5 w-5 text-primary" />
              <h1 className="font-semibold text-sm md:text-base">Hanna AI Assistant</h1>
              {isLoading && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                  <div className="w-1 h-1 bg-primary rounded-full animate-pulse delay-100" />
                  <div className="w-1 h-1 bg-primary rounded-full animate-pulse delay-200" />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 md:gap-2 flex-wrap">
            {/* NEW: level selector */}
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="h-8 md:h-9 text-xs md:text-sm border rounded-md px-2 bg-background "
              title="Explanation level"
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
               <Button 
               variant="ghost"
                size="sm" 
                onClick={onQuiz} 
                disabled={isLoading} 
                title="Generate a short quiz"
                 className="h-8 md:h-9 px-2 md:px-3"
                 aria-label="Quiz me">
                <ListChecks className="h-4 w-4 mr-0 md:mr-2" />
                  <span className="hidden md:inline">Quiz me</span>
                </Button>

            <Button 
            variant="ghost" 
            size="sm" 
            onClick={exportChat} 
            title="Export chat as Markdown"
            className="h-8 md:h-9 px-2 md:px-3"
              aria-label="Export chat">
              <Download className="h-4 w-4 mr-0 md:mr-2" />
              <span className="hidden md:inline">Export</span>
            </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={clearChatHistory}
             className="h-8 md:h-9 px-2 md:px-3 text-muted-foreground hover:text-destructive"
              title="Clear chat"
              aria-label="Clear chat"
          >
            <Trash2 className="h-4 w-4 mr-0 md:mr-2" />
            <span className="hidden md:inline">Clear Chat</span>
          </Button>
        </div>
      </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        <ScrollArea className="h-[calc(100vh-200px)]" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                     <img
                      src="/hannaai-logo.png"
                       alt="HannaAI"
                     className="h-4 w-4 text-primary" />
                  </div>
                )}
                <Card
                  className={`max-w-[80%] p-4 ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary/50"
                  }`}
                >
                  {/* Render markdown for assistant; keep user as plain text if you prefer */}
                  {message.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ inline, className, children, ...props }) {
                           const language = /language-(\w+)/.exec(className || "")?.[1] || "plaintext"
                            const codeText = String(children).replace(/\n$/, "")
                           
                          if (inline) {
                            return (
                              <code className="px-1 py-0.5 rounded bg-black/10" {...props}>
                                {children}
                              </code>
                            )
                          }
                          const onCopy = async () => {
                              try {
                                await navigator.clipboard.writeText(codeText)
                              } catch {}
                            }
                          return (
                             <div className="relative">
                                <button
                                  type="button"
                                  onClick={onCopy}
                                  className="absolute right-2 top-2 text-xs bg-white/50 hover:bg-white/20 px-2 py-1 rounded"
                                  aria-label="Copy code"
                                >
                                  Copy
                                </button>
                            <SyntaxHighlighter
                                language={language}
                                style={oneDark}
                                PreTag="div"
                                customStyle={{
                                  borderRadius: "0.375rem",
                                  margin: 0,
                                }}
                                showLineNumbers={false}
                              >
                                {codeText}
                              </SyntaxHighlighter>
                              </div>
                          )
                        },
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                      }}
                    >
                      {toText(message.content)}
                    </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {toText(message.content)}
                    </p>
                  )}
                  {/* Regenerate button for the last assistant message */}
                  {message.role === "assistant" && messages[messages.length - 1]?.id === message.id && (
                    <div className="mt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isLoading || regenLoading}
                        onClick={regenerateLast}
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <RefreshCw className="h-3.5 w-3.5 mr-1" />
                        {regenLoading ? "Regenerating..." : "Regenerate"}
                      </Button>
                    </div>
                  )}
                  {message.createdAt && (
                    <p
                      className={`text-xs mt-2 opacity-70 ${
                        message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </p>
                  )}
                </Card>
                {message.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                   <img
                     src="/hannaai-logo.png"
                    alt="HannaAI"
                  className="h-4 w-4 text-primary" />
                </div>
                <Card className="bg-secondary/50 p-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <p className="text-sm text-muted-foreground">Thinking...</p>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input Form */}
      <div className="border-t bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={onSubmit} className="flex gap-2">
            <Input
              value={localInput}
              onChange={(e) => setLocalInput(e.target.value)}
               onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  onSubmit(e)
                }
              }}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!localInput.trim() || isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>

    
  );
  
}