import "dotenv/config"
import express from "express"
import cors from "cors"
import { chatHandler } from "./routes/Chat.js"

const app = express()
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || "*"
app.use(cors({ origin: ALLOW_ORIGIN }))
app.use(express.json({ limit: "1mb" }))

app.post("/api/chat", chatHandler)

app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`)
  next()
})

app.get("/health", (_req, res) => res.json({ ok: true }))


const port = process.env.PORT || 4000
app.listen(port, () => {
  console.log(`HannaBotServer listening on http://localhost:${port}`)
})