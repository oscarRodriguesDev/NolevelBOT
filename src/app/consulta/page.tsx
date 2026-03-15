"use client"

import { useState } from "react"

type Chamado = {
  ticket: string
  status: string
  setor: string
  motivo: string
  abertura: string
}

const mockTickets: Chamado[] = [
  {
    ticket: "TK-1001",
    status: "Aberto",
    setor: "TI",
    motivo: "Computador lento",
    abertura: "2026-03-10"
  },
  {
    ticket: "TK-1002",
    status: "Em andamento",
    setor: "RH",
    motivo: "Atualização de cadastro",
    abertura: "2026-03-09"
  },
  {
    ticket: "TK-1003",
    status: "Fechado",
    setor: "Financeiro",
    motivo: "Erro em reembolso",
    abertura: "2026-03-05"
  }
]

export default function ConsultaTickets() {
  const [cpf, setCpf] = useState("")
  const [tickets, setTickets] = useState<Chamado[]>([])
  const [selecionado, setSelecionado] = useState<Chamado | null>(null)

  function buscarTickets() {
    if (!cpf) return
    setTickets(mockTickets)
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
          Buscar chamados
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
                  onClick={() => setSelecionado(t)}
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

      {selecionado && (
        <div className="border rounded p-4 space-y-2">

          <h2 className="text-xl font-semibold">
            Ticket {selecionado.ticket}
          </h2>

          <p><strong>Status:</strong> {selecionado.status}</p>
          <p><strong>Setor:</strong> {selecionado.setor}</p>
          <p><strong>Motivo:</strong> {selecionado.motivo}</p>
          <p><strong>Abertura:</strong> {selecionado.abertura}</p>

        </div>
      )}

    </div>
  )
}