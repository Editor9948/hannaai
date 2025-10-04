import "dotenv/config"
import express from "express"
import cors from "cors"
import { chatHandler } from "./routes/Chat.js"

const app = express()

// Enhanced CORS configuration for pxxl.app
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || "*"
app.use(cors({ 
  origin: ALLOW_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

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