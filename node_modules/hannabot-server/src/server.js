import "dotenv/config"
import express from "express"
import cors from "cors"
import { chatHandler } from "./routes/Chat.js"

const app = express()

// Enhanced CORS configuration
// - Supports comma-separated allowlist via ALLOW_ORIGIN
// - Falls back to reflecting the request origin (no wildcard) so credentials work
const allowOriginEnv = (process.env.ALLOW_ORIGIN || "").trim()
const allowList = allowOriginEnv
  ? allowOriginEnv.split(",").map((s) => s.trim()).filter(Boolean)
  : []

// Add common Vercel domains to allowlist if not already present
const vercelDomains = [
  "https://hannaai.vercel.app",
  "https://hannaai-git-main.vercel.app", 
  "https://hannaai-git-develop.vercel.app"
]

const allAllowedOrigins = [...new Set([...allowList, ...vercelDomains])]

const corsOptions = {
  origin: allAllowedOrigins.length
    ? allAllowedOrigins
    : (origin, callback) => {
        // If no allowlist provided, reflect any origin (avoids "*" when credentials are true)
        console.log("CORS request from origin:", origin)
        callback(null, true)
      },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}

app.use(cors(corsOptions))

app.use(express.json({ limit: "1mb" }))
app.use(express.urlencoded({ extended: true }))

app.post("/api/chat", chatHandler)

app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`)
  next()
})

app.get("/health", (_req, res) => res.json({ ok: true }))


const port = process.env.PORT || 4000
const host = process.env.HOST || '0.0.0.0'

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  process.exit(0)
})

app.listen(port, host, () => {
  console.log(`HannaBotServer listening on http://${host}:${port}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`OpenAI API Key configured: ${!!process.env.OPENAI_API_KEY}`)
})