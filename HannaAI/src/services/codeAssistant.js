// ...existing code...
const RAW = (process.env.REACT_APP_API_URL || "").trim()
const API_BASE = RAW ? RAW.replace(/\/$/, "") : "http://localhost:4000"

async function post(path, body) {
  let res
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  } catch (e) {
    console.error("Network error:", e)
    throw new Error("Network error: " + e.message)
  }
  const text = await res.text()
  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try {
      const j = JSON.parse(text)
      if (j.error) msg += `: ${j.error}`
    } catch {
      if (text) msg += `: ${text.slice(0,120)}`
    }
    throw new Error(msg)
  }
  try {
    return JSON.parse(text)
  } catch {
    throw new Error("Invalid JSON from server")
  }
}

export async function requestCodeAssistant({ kind, code, language, preferences = {} }) {
  if (!kind) throw new Error("kind required")
  return post("/api/chat", { kind, code, language, preferences })
}