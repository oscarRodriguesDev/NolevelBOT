"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ThemeToggle } from "@/app/components/theme-toggle";
import { getStatusColor } from "@/types/chamado";
import {
  FaTicketAlt,
  FaUser,
  FaIdCard,
  FaCalendarAlt,
  FaClipboardList,
  FaArrowLeft,
  FaTruck,
  FaWrench,
} from "react-icons/fa";

interface Solicitacao {
  ticket: string;
  nome: string;
  cpf: string;
  matricula: string;
  veiculo: string;
  categoria: string;
  discriminacao: string;
  setor: string;
  descricao: string;
  historico?: string;
  status: string;
  prioridade: string;
  atendente?: {
    id: string
    name: string
    email: string
    avatarUrl: string
  }
  createdAt: string;
}

export default function SolicitacaoDetalhePage() {
  const [solicitacao, setSolicitacao] = useState<Solicitacao | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const params = useParams();
  const ticket = params.ticket as string;

  useEffect(() => {
    async function fetchSolicitacao() {
      try {
        const res = await fetch(`/api/tickets/search?ticket=${ticket}`);

        if (!res.ok) {
          throw new Error("Erro ao buscar solicitação");
        }

        const raw: Solicitacao[] = await res.json();
        if (raw.length === 0) {
          setSolicitacao(null);
        } else {
          const item = raw[0]
          let veiculo = ''
          if (item.descricao) {
            try {
              const parsed = JSON.parse(item.descricao)
              veiculo = parsed.numeroOnibus || ''
            } catch {}
          }
          setSolicitacao({ ...item, veiculo: veiculo || item.veiculo || '' })
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
      fetchSolicitacao();
    }
  }, [ticket]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors duration-300" style={{ backgroundColor: "var(--background)" }}>
        <div className="absolute right-4 top-4 z-50">
          <ThemeToggle />
        </div>
        <div className="text-center space-y-4">
          <svg className="w-8 h-8 animate-spin mx-auto" style={{ color: "var(--primary)" }} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p style={{ color: "var(--foreground)" }}>Carregando solicitação...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors duration-300" style={{ backgroundColor: "var(--background)" }}>
        <div className="absolute right-4 top-4 z-50">
          <ThemeToggle />
        </div>
        <div className="text-center space-y-4" style={{ color: "var(--status-cancelled)" }}>
          <p className="text-lg font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (!solicitacao) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors duration-300" style={{ backgroundColor: "var(--background)" }}>
        <div className="absolute right-4 top-4 z-50">
          <ThemeToggle />
        </div>

        <div className="text-center space-y-4" style={{ color: "var(--foreground)" }}>
          <p className="text-lg">Solicitação não encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-10 transition-colors duration-300"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <div className="absolute right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      <div className="absolute left-4 top-4 z-50">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border-subtle)",
            color: "var(--foreground)",
          }}
        >
          <FaArrowLeft size={14} />
          Voltar
        </button>
      </div>
      <div
        className="w-full max-w-2xl rounded-2xl shadow-2xl border p-6 sm:p-8 space-y-6 transition-colors duration-300"
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
          <h1 className="text-xl font-semibold">Detalhe da Solicitação</h1>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm" style={{ opacity: 0.7 }}>
            <FaTicketAlt />
            <span>{solicitacao.ticket}</span>
          </div>
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold text-white"
            style={{
              backgroundColor: getStatusColor(solicitacao.status),
            }}
          >
            {solicitacao.status?.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <FaUser style={{ opacity: 0.6 }} />
            <span>{solicitacao.nome}</span>
          </div>

          <div className="flex items-center gap-2">
            <FaIdCard style={{ opacity: 0.6 }} />
            <span>Matrícula: {solicitacao.matricula || solicitacao.cpf || "—"}</span>
          </div>

          <div className="flex items-center gap-2">
            <FaTruck style={{ opacity: 0.6 }} />
            <span>Veículo: {solicitacao.veiculo || "—"}</span>
          </div>

          <div className="flex items-center gap-2">
            <FaWrench style={{ opacity: 0.6 }} />
            <span>Setor: {solicitacao.setor || "—"}</span>
          </div>

          <div className="flex items-center gap-2">
            <FaCalendarAlt style={{ opacity: 0.6 }} />
            <span>
              {new Date(solicitacao.createdAt).toLocaleString("pt-BR")}
            </span>
          </div>

          {(solicitacao.discriminacao || solicitacao.descricao) && (
            <div className="flex items-start gap-2">
              <FaClipboardList style={{ opacity: 0.6, marginTop: "0.25rem" }} />
              <span>{solicitacao.discriminacao || solicitacao.descricao}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
