
import { useState } from "react"
import { ChatInterface } from "../components/chat-interface/chatInterface"
import { Button } from "../components/ui/button"
import { Sparkles } from "lucide-react"

export default function Home() {
  const [showChat, setShowChat] = useState(false)

  if (showChat) {
    return <ChatInterface onBack={() => setShowChat(false)} />
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-secondary/20 to-background flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-full">
             <img
          src="/hannaai-logo.png"
          alt="HannaAI"
          className="h-14 w-14 object-fill-contain text-primary"
        />
      
            </div>
          </div>
          <h1 className="text-4xl font-bold text-balance">Hanna AI Assistant</h1>
          <p className="text-xl text-muted-foreground text-pretty">
            Powered by OpenAI, ready to help you with any questions or tasks you have in mind.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => setShowChat(true)}
            size="lg"
            className="text-lg px-8 py-6 bg-primary hover:bg-primary/90"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Start Chatting
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="p-4 bg-card border rounded-lg">
              <h3 className="font-semibold mb-2">Ask Questions</h3>
              <p className="text-sm text-muted-foreground">Get instant answers to any topic</p>
            </div>
            <div className="p-4 bg-card border rounded-lg">
              <h3 className="font-semibold mb-2">Creative Writing</h3>
              <p className="text-sm text-muted-foreground">Generate stories, emails, and content</p>
            </div>
            <div className="p-4 bg-card border rounded-lg">
              <h3 className="font-semibold mb-2">Problem Solving</h3>
              <p className="text-sm text-muted-foreground">Get help with coding and analysis</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
