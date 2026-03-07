'use client'

import { useState, useRef, useEffect } from 'react'
import { ThemeToggle } from '@/app/components/theme-toggle'

type Message = {
  id: number
  role: 'user' | 'assistant'
  content: string
}

export default function MobileHevelynChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

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
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: text })
      })

      const data = await res.json()

      const botMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.reply || 'Erro ao responder'
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
    <div className="h-screen w-screen flex flex-col bg-neutral-950 text-white">
        <ThemeToggle />

      <div className="flex items-center justify-center h-14 border-b border-neutral-800 text-sm font-semibold">
        Hevelyn
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">

        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-xl text-sm break-words ${
                msg.role === 'user'
                  ? 'bg-blue-600'
                  : 'bg-neutral-800'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-neutral-800 px-4 py-2 rounded-xl text-sm">
              digitando...
            </div>
          </div>
        )}

        <div ref={bottomRef} />

      </div>

      <div className="border-t border-neutral-800 p-2 flex gap-2">

        <input
          className="flex-1 bg-neutral-900 rounded-lg px-3 py-2 text-sm outline-none"
          placeholder="Digite sua mensagem"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') sendMessage()
          }}
        />

        <button
          onClick={sendMessage}
          className="bg-blue-600 px-4 rounded-lg text-sm active:scale-95"
        >
          Enviar
        </button>

      </div>

    </div>
  )
}