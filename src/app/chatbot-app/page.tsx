'use client'

import { useState, useRef, useEffect } from 'react'

type Message = {
  id: number
  role: 'user' | 'assistant'
  content: string
}

export default function MobileHevelynChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content: 'Olá, eu sou a Hevelyn. Como posso ajudar você hoje?'
    }
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
    <div className="h-screen w-screen flex flex-col bg-gray-50">

      <header className="h-16 flex items-center justify-center border-b bg-white shadow-sm shrink-0">
        <span className="text-lg font-semibold text-gray-800">
          Hevelyn
        </span>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-4">

        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[85%] px-5 py-3 rounded-2xl text-base leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-800 border'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border px-5 py-3 rounded-2xl text-base shadow-sm">
              Hevelyn está digitando...
            </div>
          </div>
        )}

        <div ref={bottomRef} />

      </main>

      <footer
        className={`p-3 bg-white border-t flex gap-2 transition-all duration-300 ${
          typing ? 'mb-[40vh]' : 'mb-0'
        }`}
      >

        <input
          className="flex-1 text-base text-black px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Digite sua mensagem"
          value={input}
          onFocus={() => setTyping(true)}
          onBlur={() => setTyping(false)}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') sendMessage()
          }}
        />

        <button
          onClick={sendMessage}
          className="px-5 py-3 bg-blue-600 text-white rounded-xl text-base font-medium active:scale-95"
        >
          Enviar
        </button>

      </footer>

    </div>
  )
}