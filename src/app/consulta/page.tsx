"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Chamado = {
  createdAt: string | number | Date
  descricao: string
  ticket: string
  status: string
  setor: string
  motivo: string
  abertura: string
}

export default function ConsultaTickets() {
  const [cpf, setCpf] = useState("")
  const [tickets, setTickets] = useState<Chamado[]>([])
 // const [selecionado, setSelecionado] = useState<Chamado | null>(null)
  const [loading, setLoading] = useState(false)
  const route  = useRouter() 

  async function buscarTickets() {
    if (!cpf) return

    setLoading(true)

    try {
      const res = await fetch(`/api/tickets?cpf=${cpf}`)
      const data = await res.json()

      const chamados: Chamado[] = data.map((c:Chamado) => ({
        ticket: c.ticket,
        status: c.status,
        setor: c.setor,
        motivo: c.descricao,
        abertura: new Date(c.createdAt).toLocaleDateString()
      }))

      setTickets(chamados)
     
    } catch (err) {
      console.error(err)
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-10 max-w-3xl mx-auto space-y-8">

      <div className="space-y-3">
        <h1 className="text-2xl font-semibold">Consultar chamados</h1>

        <input
          type="text"
          placeholder="Digite seu CPF"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          className="border p-2 w-full rounded"
        />

        <button
          onClick={buscarTickets}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Buscando..." : "Buscar chamados"}
        </button>
      </div>

      {tickets.length > 0 && (
        <div className="border rounded">

          <table className="w-full">

            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Ticket</th>
                <th className="p-2 border">Setor</th>
                <th className="p-2 border">Status</th>
              </tr>
            </thead>

            <tbody>
              {tickets.map((t) => (
                <tr
                  key={t.ticket}
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => route.push(`consulta/${t.ticket}`)}
                >
                  <td className="p-2 border">{t.ticket}</td>
                  <td className="p-2 border">{t.setor}</td>
                  <td className="p-2 border">{t.status}</td>
                </tr>
              ))}
            </tbody>

          </table>

        </div>
      )}


    </div>
  )
}