import { Routes, Route, Navigate, useNavigate } from "react-router-dom"
// Adjust these import paths to your actual file locations:
import Chat from "./pages/Chat"
import { ChatInterface } from "./components/chat-interface/chatInterface"
import { CodeAssistantPanel } from "./components/code-assistant/codeAssistant"

function AssistantRoute() {
  const navigate = useNavigate()
  return <ChatInterface onBack={() => navigate(-1)} />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/chat" replace />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/assistant" element={<AssistantRoute />} />
      <Route path="*" element={<Navigate to="/chat" replace />} />
      <Route path="/code-assistant" element={<CodeAssistantPanel />} />
    </Routes>
  )
}