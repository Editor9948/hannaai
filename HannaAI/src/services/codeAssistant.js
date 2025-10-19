// Prefer relative path in-browser so CRA proxy (package.json: proxy) handles dev
/* eslint-env browser */
// Note: If your editor still flags `fetch` as undefined, either add the DOM lib
// to your editor/tsconfig, or install a polyfill (cross-fetch) for SSR.
const RAW = (process.env.REACT_APP_API_URL || "").trim()
const isBrowser = typeof window !== "undefined"
// If an explicit env URL is provided, use it; otherwise use relative when in browser, or localhost for non-browser
const API_BASE = RAW
  ? RAW.replace(/\/$/, "")
  : (isBrowser ? "" : "http://localhost:4000")

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