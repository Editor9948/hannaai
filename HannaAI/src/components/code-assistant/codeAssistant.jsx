import { useState, useEffect, useCallback } from "react"
import { requestCodeAssistant } from "../../services/codeAssistant"
import { Button } from "../../components/ui/button"
import Editor from "@monaco-editor/react"

const MODES = [
  { id: "code-review", label: "Review" },
  { id: "code-improve", label: "Improve" },
  { id: "tests", label: "Tests" },
]

const EXP_LEVELS = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
]

const LANGS = ["javascript", "typescript", "python", "java", "cpp"]

export function CodeAssistantPanel() {
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [mode, setMode] = useState("code-review")
  const [experienceLevel, setExperienceLevel] = useState("intermediate")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")
  const [showDiff, setShowDiff] = useState(false)
  const [openSections, setOpenSections] = useState({
    summary: true,
    issues: true,
    improvedCode: true,
    tests: true,
  })

  // Persist state
  useEffect(() => {
    const saved = localStorage.getItem("code-assistant-state")
    if (saved) {
      try {
        const s = JSON.parse(saved)
        if (s.code) setCode(s.code)
        if (s.language) setLanguage(s.language)
        if (s.mode) setMode(s.mode)
        if (s.experienceLevel) setExperienceLevel(s.experienceLevel)
      } catch {}
    }
  }, [])
  useEffect(() => {
    localStorage.setItem(
      "code-assistant-state",
      JSON.stringify({ code, language, mode, experienceLevel })
    )
  }, [code, language, mode, experienceLevel])

  const toggleSection = (k) =>
    setOpenSections((prev) => ({ ...prev, [k]: !prev[k] }))

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {}
  }

  const lineDiff = useCallback(() => {
    if (!result?.improvedCode) return []
    const oldLines = code.split("\n")
    const newLines = result.improvedCode.split("\n")
    const max = Math.max(oldLines.length, newLines.length)
    const rows = []
    for (let i = 0; i < max; i++) {
      const a = oldLines[i] ?? ""
      const b = newLines[i] ?? ""
      let type = "same"
      if (a !== b) {
        if (!a.trim() && b.trim()) type = "add"
        else if (a.trim() && !b.trim()) type = "del"
        else type = "chg"
      }
      rows.push({ i: i + 1, a, b, type })
    }
    return rows
  }, [code, result])

   const run = useCallback(async () => {
    if (!code.trim()) return
    setError("")
    setResult(null)
    setLoading(true)
    try {
      const data = await requestCodeAssistant({
        kind: mode,
        code,
        language,
        preferences: { experienceLevel },
      })
      setResult(data)
      setShowDiff(false)
    } catch (e) {
      setError(e.message || "Request failed")
    } finally {
      setLoading(false)
    }
  }, [code, mode, language, experienceLevel])


  // Keyboard shortcut: Ctrl/Cmd + Enter
  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault()
        if (!loading) run()
      }
    }
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [run, loading])

  const codeLines = code ? code.split("\n").length : 0
  const codeChars = code.length

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:gap-2 md:flex-row md:items-center md:justify-between">
        {/* Brand group: logo + title */}
        <div className="flex items-center gap-2 md:gap-3">
          <img
            src="/hannaai-logo.png"
            alt="HannaAI"
            className="h-8 w-8 md:h-10 md:w-10 object-contain"
          />
          <h1 className="text-base md:text-lg font-semibold">HannaAI Code Assistant</h1>
        </div>
        {/* Actions group */}
        <div className="flex flex-wrap items-center gap-2">
          {MODES.map((m) => (
            <Button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`px-3 h-9 rounded text-sm font-medium border
                ${
                  mode === m.id
                    ? "bg-primary text-white border-primary/50"
                    : "bg-primary/20 hover:bg-emerald-50 border-emerald-200"
                }`}
            >
              {m.label}
            </Button>
          ))}

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="h-9 text-sm border rounded px-2 bg-white"
            title="Language"
          >
            {LANGS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>

            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="h-9 text-sm border rounded px-2 bg-white"
              title="Experience level"
            >
              {EXP_LEVELS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>

          <Button
            onClick={run}
            disabled={!code.trim() || loading}
            className="h-9 px-4 rounded text-sm font-medium bg-primary text-white disabled:opacity-50 hover:bg-primary/50"
          >
            {loading ? "Running..." : "Run (Ctrl+Enter)"}
          </Button>
              <Button
  onClick={() => { setCode(""); setResult(null); setError(""); }}
  disabled={loading}
  className="h-9 px-3 rounded text-sm border bg-primary text-white hover:bg-primary/50 disabled:opacity-50"
>
  Clear
</Button>
        </div>
      </div>

      {/* Editor */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-500">
          <span>
            Mode:{" "}
            <span className="font-medium">
              {MODES.find((m) => m.id === mode)?.label}
            </span>{" "}
            · Lang: <span className="font-medium">{language}</span> · Level:{" "}
            <span className="font-medium">
              {EXP_LEVELS.find((l) => l.id === experienceLevel)?.label}
            </span>
          </span>
          <span>
            {codeLines} lines · {codeChars} chars
          </span>
        </div>
        <div className="relative border rounded">
           <Editor
    height="320px"
    defaultLanguage={language}
    language={language === "cpp" ? "cpp" : language}
    value={code}
    onChange={(v) => setCode(v ?? "")}
    theme="vs-dark"
    options={{
      fontSize: 14,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
    }}
  />
          {code && (
            <Button
              type="button"
              onClick={() => {
                copy(code)
              }}
              className="absolute right-2 top-2 text-xs bg-black/70 text-white px-2 py-1 rounded hover:bg-black/80"
            >
              Copy
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 border border-red-200 bg-red-50 rounded p-2">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary */}
          {result.summary && (
            <Section
              title="Summary"
              open={openSections.summary}
              onToggle={() => toggleSection("summary")}
            >
              <p className="text-sm leading-relaxed">{result.summary}</p>
            </Section>
          )}

          {/* Issues */}
          {!!(result.issues || []).length && (
            <Section
              title={`Issues (${result.issues.length})`}
              open={openSections.issues}
              onToggle={() => toggleSection("issues")}
            >
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {result.issues.map((i) => (
                  <li key={i.id}>
                    <span
                      className={`font-semibold ${
                        i.severity === "critical"
                          ? "text-red-600"
                          : i.severity === "major"
                          ? "text-orange-600"
                          : i.severity === "minor"
                          ? "text-amber-600"
                          : "text-gray-700"
                      }`}
                    >
                      {i.severity.toUpperCase()}
                    </span>
                    : {i.message}
                    {i.lineHint && (
                      <span className="opacity-70"> ({i.lineHint})</span>
                    )}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Improved Code + Diff */}
          {result.improvedCode && result.improvedCode.trim() !== "" && (
            <Section
              title="Improved Code"
              open={openSections.improvedCode}
              onToggle={() => toggleSection("improvedCode")}
              extra={
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      copy(result.improvedCode)
                    }}
                    className="text-xs bg-emerald-600 text-white px-2 py-1 rounded hover:bg-emerald-700"
                  >
                    Copy
                  </Button>
                  <Button
                    onClick={() => {
                      try {
                        const extMap = { javascript: "js", typescript: "ts", python: "py", java: "java", cpp: "cpp" }
                        const ext = extMap[language] || "txt"
                        const blob = new Blob([result.improvedCode], { type: "text/plain;charset=utf-8" })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement("a")
                        a.href = url
                        const ts = new Date().toISOString().slice(0,19).replace(/[:T]/g, "-")
                        a.download = `improved-code-${ts}.${ext}`
                        a.click()
                        URL.revokeObjectURL(url)
                      } catch {}
                    }}
                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                  >
                    Download
                  </Button>
                  <Button
                    onClick={() => setShowDiff((d) => !d)}
                    className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                  >
                    {showDiff ? "Hide Diff" : "Show Diff"}
                  </Button>
                </div>
              }
            >
              {!showDiff && (
                <pre className="bg-black/80 text-white p-3 rounded text-xs overflow-auto">
                  <code>{result.improvedCode}</code>
                </pre>
              )}
              {showDiff && (
                <div className="border rounded overflow-hidden">
                  <div className="grid grid-cols-2 text-xs font-mono">
                    <div className="bg-gray-50 border-b px-2 py-1 font-semibold">
                      Original
                    </div>
                    <div className="bg-gray-50 border-b px-2 py-1 font-semibold">
                      Improved
                    </div>
                    {lineDiff().map((r) => (
                      <FragmentRow key={r.i} row={r} />
                    ))}
                  </div>
                </div>
              )}
            </Section>
          )}

          {/* Tests */}
          {result.tests && result.tests.trim() !== "" && (
            <Section
              title="Suggested Tests"
              open={openSections.tests}
              onToggle={() => toggleSection("tests")}
            >
              <pre className="bg-black/70 text-white p-3 rounded text-xs overflow-auto">
                <code>{result.tests}</code>
              </pre>
              <Button
                onClick={() => copy(result.tests)}
                className="mt-2 text-xs bg-emerald-600 text-white px-2 py-1 rounded hover:bg-emerald-700"
              >
                Copy Tests
              </Button>
            </Section>
          )}
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-md p-6 space-y-2 w-[260px] text-center">
            <div className="animate-spin h-5 w-5 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto" />
            <p className="text-sm font-medium">Analyzing…</p>
            <p className="text-xs text-gray-500">This may take a few seconds</p>
          </div>
        </div>
      )}
    </div>
  )
}

/* Collapsible section component */
function Section({ title, children, open, onToggle, extra }) {
  return (
    <div className="border rounded">
      <div
        className="flex items-center justify-between px-3 py-2 bg-gray-50 cursor-pointer select-none"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{title}</span>
          <span className="text-xs text-gray-500">{open ? "▼" : "►"}</span>
        </div>
        {extra}
      </div>
      {open && <div className="p-3">{children}</div>}
    </div>
  )
}

function FragmentRow({ row }) {
  const base = "px-2 py-0.5 border-b whitespace-pre-wrap break-all"
  const styleA =
    row.type === "del"
      ? "bg-red-50 text-red-700"
      : row.type === "chg"
      ? "bg-amber-50"
      : ""
  const styleB =
    row.type === "add"
      ? "bg-emerald-50 text-emerald-700"
      : row.type === "chg"
      ? "bg-amber-50"
      : ""
  return (
    <>
      <div className={`${base} border-r ${styleA}`}>
        <span className="opacity-40 mr-2 select-none">{row.i}</span>
        {row.a}
      </div>
      <div className={`${base} ${styleB}`}>
        <span className="opacity-40 mr-2 select-none">{row.i}</span>
        {row.b}
      </div>
    </>
  )
}