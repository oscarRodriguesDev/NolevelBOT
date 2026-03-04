"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ThemeToggle } from "@/app/components/theme-toggle";
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NOVO":
        return "var(--status-new)";
      case "EM_ANDAMENTO":
        return "var(--status-in-progress)";
      case "AGUARDANDO":
        return "var(--status-waiting)";
      case "CONCLUIDO":
      case "FINALIZADO":
        return "var(--status-completed)";
      case "CANCELADO":
        return "var(--status-cancelled)";
      default:
        return "var(--primary)";
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10 transition-colors duration-300"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <ThemeToggle />
      <div
        className="w-full max-w-lg rounded-2xl shadow-2xl border p-6 space-y-6 transition-colors duration-300"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <div
          className="flex items-center gap-3 border-b pb-4"
          style={{
            borderColor: "var(--border-subtle)",
          }}
        >
          <FaTicketAlt style={{ color: "var(--primary)", fontSize: "1.25rem" }} />
          <h1 className="text-xl font-semibold">Consulta de Chamado</h1>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm" style={{ opacity: 0.7 }}>
            <FaTicketAlt />
            <span>{chamado.ticket}</span>
          </div>
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold text-white"
            style={{
              backgroundColor: getStatusColor(chamado.status),
            }}
          >
            {chamado.status}
          </span>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <FaUser style={{ opacity: 0.6 }} />
            <span>{chamado.nome}</span>
          </div>

          <div className="flex items-center gap-2">
            <FaIdCard style={{ opacity: 0.6 }} />
            <span>{chamado.cpf}</span>
          </div>

          <div className="flex items-center gap-2">
            <FaBuilding style={{ opacity: 0.6 }} />
            <span>{chamado.setor}</span>
          </div>

          <div className="flex items-center gap-2">
            <FaCalendarAlt style={{ opacity: 0.6 }} />
            <span>
              {new Date(chamado.createdAt).toLocaleString("pt-BR")}
            </span>
          </div>

          <div className="flex items-start gap-2">
            <FaClipboardList style={{ opacity: 0.6, marginTop: "0.25rem" }} />
            <span>{chamado.descricao}</span>
          </div>

          {chamado.historico && (
            <div className="flex items-start gap-2">
              <FaInfoCircle style={{ opacity: 0.6, marginTop: "0.25rem" }} />
              <span>{chamado.historico}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <FaFlag style={{ opacity: 0.6 }} />
            <span>Prioridade: {chamado.prioridade}</span>
          </div>

          {chamado.atendente && (
            <div className="flex items-center gap-2">
              <FaUserTie style={{ opacity: 0.6 }} />
              <span>Atendente: {chamado.atendente}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
