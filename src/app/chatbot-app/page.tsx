'use client'

import { useState, useRef, useEffect } from 'react'

type Message = {
  id: number
  role: 'user' | 'assistant'
  content: string
}

export default function MobileHevelynChat() {
  const [messages, setMessages] = useState<Message[]>([
/*     {
      id: 1,
      role: 'assistant',
      content: 'Olá, eu sou a Hevelyn. Como posso ajudar você hoje?'
    } */
  ])

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [typing, setTyping] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage() {
    if (!input.trim() || loading) return

    const text = input

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: text
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      })

      const data = await res.json()

      const botMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.reply || 'Não consegui responder.'
      }

      setMessages(prev => [...prev, botMessage])
    } catch {
      const botMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Erro ao conectar com a Hevelyn.'
      }

      setMessages(prev => [...prev, botMessage])
    }

    setLoading(false)
  }

  return (
<div
  className="h-screen w-screen flex justify-center transition-colors duration-300"
  style={{
    backgroundColor: "var(--background)",
    color: "var(--foreground)",
  }}
>
  <div className="w-full max-w-3xl flex flex-col">
    <header
      className="h-16 sm:h-20 flex items-center justify-center border-b shadow-sm shrink-0 transition-colors duration-300"
      style={{
        backgroundColor: "var(--surface)",
        borderColor: "var(--border-subtle)",
      }}
    >
    </header>

    <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
      {messages.map((msg) => {
        const renderContent = (text: string) => {
          const urlRegex = /(https?:\/\/[^\s]+)/g
          const parts = text.split(urlRegex)

          return parts.map((part, index) => {
            if (part.match(urlRegex)) {
              return (
                <a
                  key={index}
                  href={part}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                  style={{ color: "var(--primary)" }}
                >
                  {part}
                </a>
              )
            }
            return <span key={index}>{part}</span>
          })
        }

        return (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className="max-w-xs sm:max-w-md md:max-w-lg px-4 sm:px-5 py-3 rounded-2xl text-base sm:text-lg leading-relaxed shadow-md transition-colors duration-300"
              style={{
                backgroundColor:
                  msg.role === 'user' ? 'var(--primary)' : 'var(--surface)',
                color:
                  msg.role === 'user' ? '#fff' : 'var(--foreground)',
                borderColor:
                  msg.role === 'user'
                    ? 'transparent'
                    : 'var(--border-subtle)',
                border: msg.role === 'user' ? 'none' : '1px solid',
              }}
            >
              {renderContent(msg.content)}
            </div>
          </div>
        )
      })}

      {loading && (
        <div
          className="px-4 sm:px-5 py-3 rounded-2xl shadow-md transition-colors duration-300 flex items-center gap-2 text-base sm:text-lg"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border-subtle)",
            border: '1px solid',
          }}
        >
          <svg className="w-5 h-5 animate-spin flex-shrink-0" style={{ color: "var(--primary)" }} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Hevelyn está digitando...
        </div>
      )}

      <div ref={bottomRef} />
    </main>

    <footer
      className={`px-4 sm:px-6 py-3 sm:py-4 flex gap-2 sm:gap-3 border-t shrink-0 transition-all duration-300 ${
        typing ? 'mb-[35vh] sm:mb-[30vh]' : 'mb-0'
      }`}
      style={{
        backgroundColor: "var(--surface)",
        borderColor: "var(--border-subtle)",
      }}
    >
      <input
        className="flex-1 text-base sm:text-lg md:text-xl px-4 py-3 rounded-xl border outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
        style={{
          borderColor: "var(--border-subtle)",
          backgroundColor: "var(--surface-elevated)",
          color: "var(--foreground)",
          "--tw-ring-color": "var(--primary)",
        } as never}
        placeholder="Digite sua mensagem..."
        value={input}
        onFocus={() => setTyping(true)}
        onBlur={() => setTyping(false)}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') sendMessage()
        }}
      />

      <button
        onClick={sendMessage}
        disabled={loading || !input.trim()}
        className="px-4 sm:px-6 py-3 rounded-lg text-white font-semibold text-base sm:text-lg transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex-shrink-0"
        style={{ backgroundColor: "var(--primary)" }}
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.9429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16346273 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.837654326,3.0486314 1.15159189,3.99721575 L3.03521743,10.4382088 C3.03521743,10.5953061 3.34915502,10.7524035 3.50612381,10.7524035 L16.6915026,11.5378905 C16.6915026,11.5378905 17.1624089,11.5378905 17.1624089,12.0091827 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z" />
        </svg>
      </button>
    </footer>
  </div>
</div>
  )
}
