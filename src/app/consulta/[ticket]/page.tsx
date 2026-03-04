"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  FaTicketAlt,
  FaUser,
  FaIdCard,
  FaBuilding,
  FaCalendarAlt,
  FaInfoCircle,
  FaFlag,
  FaUserTie,
  FaClipboardList,
} from "react-icons/fa";

interface Chamado {
  ticket: string;
  nome: string;
  cpf: string;
  setor: string;
  descricao: string;
  historico?: string;
  status: string;
  prioridade: string;
  atendente?: string;
  createdAt: string;
}

export default function TicketPage() {
  const [chamado, setChamado] = useState<Chamado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const params = useParams();
  const ticket = params.ticket as string;

  useEffect(() => {
    async function fetchChamado() {
      try {
        const res = await fetch(`/api/tickets?ticket=${ticket}`);

        if (!res.ok) {
          throw new Error("Erro ao buscar chamado");
        }

        const data: Chamado[] = await res.json();
        if (data.length === 0) {
          setChamado(null);
        } else {
          setChamado(data[0]);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Erro desconhecido");
        }
      } finally {
        setLoading(false);
      }
    }

    if (ticket) {
      fetchChamado();
    }
  }, [ticket]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-200">
        Carregando chamado...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-red-400">
        {error}
      </div>
    );
  }

  if (!chamado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-300">
        Chamado não encontrado
      </div>
    );
  }

  const statusColor =
    chamado.status === "CONCLUIDO"
      ? "bg-green-600"
      : chamado.status === "EM_ANDAMENTO"
      ? "bg-yellow-500"
      : "bg-blue-600";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 py-10">
      <div className="w-full max-w-lg bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 p-6 space-y-6 text-gray-200">
        <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
          <FaTicketAlt className="text-indigo-400 text-xl" />
          <h1 className="text-xl font-semibold">Consulta de Chamado</h1>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <FaTicketAlt />
            <span>{chamado.ticket}</span>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${statusColor}`}
          >
            {chamado.status}
          </span>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <FaUser className="text-gray-400" />
            <span>{chamado.nome}</span>
          </div>

          <div className="flex items-center gap-2">
            <FaIdCard className="text-gray-400" />
            <span>{chamado.cpf}</span>
          </div>

          <div className="flex items-center gap-2">
            <FaBuilding className="text-gray-400" />
            <span>{chamado.setor}</span>
          </div>

          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-gray-400" />
            <span>
              {new Date(chamado.createdAt).toLocaleString("pt-BR")}
            </span>
          </div>

          <div className="flex items-start gap-2">
            <FaClipboardList className="text-gray-400 mt-1" />
            <span>{chamado.descricao}</span>
          </div>

          {chamado.historico && (
            <div className="flex items-start gap-2">
              <FaInfoCircle className="text-gray-400 mt-1" />
              <span>{chamado.historico}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <FaFlag className="text-gray-400" />
            <span>Prioridade: {chamado.prioridade}</span>
          </div>

          {chamado.atendente && (
            <div className="flex items-center gap-2">
              <FaUserTie className="text-gray-400" />
              <span>Atendente: {chamado.atendente}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}