"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { BtnVoltar } from "../components/back";
import { ThemeToggle } from "../components/theme-toggle";
import {
  LuCheck,
  LuRocket,
  LuBriefcase,
  LuBuilding2,
  LuSparkles,
  LuUsers,
  LuBot,
  LuMessageCircle,
  LuRefreshCcw,
  LuLoader,
  LuSettings,
  LuLock,
} from "react-icons/lu";

// Tipos do plano vindos da API (tabela planos no banco)
type PlanoApi = {
  id: string;
  slug: string;
  nome: string;
  preco: number;
  descricao: string;
  maxModulos: number;
  maxUsuarios: number;
  botIA: boolean;
  canais: string[];
  modulosAutomaticos: string[];
  ativo: boolean;
  destaque: boolean;
  ordem: number;
  extincaoEm?: string | null;
};

const ICONES: Record<string, React.ReactNode> = {
  START: <LuRocket size={26} />,
  PROFISSIONAL: <LuBriefcase size={26} />,
  ENTERPRISE: <LuBuilding2 size={26} />,
};

const MODULOS_LABEL: Record<string, string> = {
  CORPORATIVO: "Corporativo",
  OFICINA: "Operacional",
  COMERCIAL: "Comercial",
};

function formatarPreco(valor: number) {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Recurso da lista de planos (disponivel = false deixa o item desativado/indisponível)
type Recurso = { texto: string; disponivel: boolean };

// Monta os recursos dinamicamente a partir do plano
function montarRecursos(p: PlanoApi): Recurso[] {
  const recursos: Recurso[] = [
    { texto: "Implantação + configuração guiada", disponivel: true },
    {
      texto: `Até ${p.maxUsuarios === -1 ? "∞" : p.maxUsuarios} usuários (gestores e atendentes)`,
      disponivel: true,
    },
    { texto: "Usuários que abrem chamados: ilimitados", disponivel: true },
  ];

  if (p.maxModulos === -1) {
    recursos.push({ texto: "Todos os módulos do sistema", disponivel: true });
  } else {
    recursos.push({ texto: `${p.maxModulos} módulo(s) à sua escolha`, disponivel: true });
  }

  if (p.canais.includes("app")) {
    recursos.push({ texto: "Abertura de chamados pelo App", disponivel: true });
  }
  if (p.canais.includes("whatsapp")) {
    // WhatsApp: recurso temporariamente indisponível (visualmente desativado)
    recursos.push({ texto: "Abertura de chamados pelo WhatsApp", disponivel: false });
  }
  if (p.canais.includes("telegram")) {
    recursos.push({ texto: "Abertura de chamados pelo Telegram (em breve)", disponivel: true });
  }

  if (p.botIA) {
    recursos.push({ texto: "Bot com IA (GPT-4o-mini)", disponivel: true });
  } else {
    recursos.push({ texto: "Bot automático (script sem IA)", disponivel: true });
  }

  recursos.push({ texto: "Dashboard e métricas", disponivel: true });
  recursos.push({ texto: "Suporte seg-sex, 08h-18h", disponivel: true });
  return recursos;
}

// Pagina de planos e contratacao
export default function PlanosPage() {
  const { data: session, status } = useSession();
  const isLogado = status === "authenticated";
  const podeTrocar = isLogado && !!session?.user?.empresaId;
  const isGod = (session?.user?.role as string) === "GOD";

  const [planos, setPlanos] = useState<PlanoApi[]>([]);
  const [loadingPlanos, setLoadingPlanos] = useState(true);
  const [planoAtual, setPlanoAtual] = useState<string | null>(null);
  const [trocando, setTrocando] = useState(false);

  // Carrega planos do banco (GOD vê todos, inclusive em extinção)
  useEffect(() => {
    fetch(`/api/planos${isGod ? "?todos=true" : ""}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => {
        setPlanos(d || []);
        setLoadingPlanos(false);
      })
      .catch(() => setLoadingPlanos(false));
  }, [isGod]);

  // Carrega o plano atual da empresa quando logado
  useEffect(() => {
    if (!podeTrocar) return;
    fetch("/api/empresa/plano")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.plano) setPlanoAtual(d.plano);
      })
      .catch(() => {});
  }, [podeTrocar]);

  // Troca o plano da empresa (simulado ate checkout real)
  async function handleTrocarPlano(planoId: string) {
    setTrocando(true);
    try {
      const res = await fetch("/api/empresa/plano", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plano: planoId.toLowerCase() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Erro ao trocar plano");
      setPlanoAtual(planoId.toLowerCase());
      toast.success(data.message || "Plano alterado!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao trocar plano");
    } finally {
      setTrocando(false);
    }
  }

  // Exclui (extingue em 30 dias) um plano — apenas GOD
  async function handleExcluirPlano(plano: PlanoApi) {
    const confirmado = confirm(
      `Solicitar a extinção do plano "${plano.nome}"?\n\n` +
        `• Todas as empresas com este plano serão notificadas via aviso.\n` +
        `• A exclusão efetiva ocorrerá em 30 dias.\n` +
        `• As empresas serão migradas para o plano mais vantajoso, sem aumento de custo.\n\n` +
        `Deseja continuar?`
    );
    if (!confirmado) return;
    try {
      const res = await fetch(`/api/planos?id=${plano.id}&action=extinguir`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Erro ao solicitar extinção");
      toast.success(data.message || "Extinção agendada!");
      setPlanos((prev) => prev.filter((p) => p.id !== plano.id));
    } catch (err: any) {
      toast.error(err.message || "Erro ao solicitar extinção");
    }
  }

  return (
    <main
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: "var(--background)" }}
    >
      <BtnVoltar />

      <div className="absolute right-4 top-4 z-50">
        <ThemeToggle />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest mb-5"
            style={{
              borderColor: "var(--border-subtle)",
              color: "var(--primary)",
              backgroundColor: "var(--surface)",
            }}
          >
            <LuSparkles size={14} />
            Planos e preços
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="text-4xl sm:text-5xl font-black tracking-tight"
            style={{ color: "var(--foreground)" }}
          >
            Escolha o plano ideal{" "}
            <span style={{ color: "var(--primary)" }}>para sua empresa</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-4 text-base sm:text-lg font-medium opacity-60"
          >
            Investimento que se paga em semanas. Preço único por empresa.
            Implantação guiada incluída em todos os planos.
          </motion.p>
        </div>

        {/* Gestao de planos (GOD) */}
        {isGod && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="max-w-2xl mx-auto mb-12 rounded-2xl border p-5 flex flex-col sm:flex-row items-center gap-4"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--primary)" }}
          >
            <div className="flex items-center gap-3 flex-1">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: "var(--primary)", color: "#fff" }}
              >
                <LuSettings size={18} />
              </div>
              <div>
                <p className="text-sm font-black" style={{ color: "var(--foreground)" }}>
                  Modo administrador (GOD)
                </p>
                <p className="text-xs font-medium opacity-50">
                  Edite valores, limites, destaque ou solicite a extinção dos planos atuais.
                </p>
              </div>
            </div>
            <Link
              href="/god/planos"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all hover:brightness-110"
              style={{ backgroundColor: "var(--primary)" }}
            >
              <LuSettings size={14} />
              Gerenciar planos
            </Link>
          </motion.div>
        )}

        {/* Troca de plano (usuarios logados) */}
        {podeTrocar && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="max-w-2xl mx-auto mb-12 rounded-2xl border p-5 flex flex-col sm:flex-row items-center gap-4"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-subtle)" }}
          >
            <div className="flex items-center gap-3 flex-1">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: "var(--primary)", color: "#fff" }}
              >
                <LuRefreshCcw size={18} />
              </div>
              <div>
                <p className="text-sm font-black" style={{ color: "var(--foreground)" }}>
                  Plano atual:{" "}
                  <span style={{ color: "var(--primary)" }}>
                    {planos.find((p) => p.slug === planoAtual)?.nome || "..."}
                  </span>
                </p>
                <p className="text-xs font-medium opacity-50">
                  Escolha outro plano para fazer upgrade ou downgrade (simulado por enquanto).
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {planos.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleTrocarPlano(p.slug)}
                  disabled={trocando || planoAtual === p.slug}
                  className="px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all hover:brightness-110 disabled:opacity-40"
                  style={{
                    backgroundColor: planoAtual === p.slug ? "var(--primary)" : "var(--surface-elevated)",
                    color: planoAtual === p.slug ? "#fff" : "var(--foreground)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  {trocando && planoAtual !== p.slug ? (
                    <LuLoader size={12} className="animate-spin" />
                  ) : (
                    p.nome
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Cards de planos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {loadingPlanos ? (
            <div className="col-span-full flex justify-center py-16">
              <LuLoader size={36} className="animate-spin" style={{ color: "var(--primary)" }} />
            </div>
          ) : planos.length === 0 ? (
            <p className="col-span-full text-center opacity-60 py-16">Nenhum plano disponível no momento.</p>
          ) : planos.map((plano, index) => {
            const destaque = plano.destaque;
            const recursos = montarRecursos(plano);

            return (
              <motion.div
                key={plano.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.08 }}
                className="relative flex flex-col rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{
                  backgroundColor: "var(--surface)",
                  borderColor: destaque ? "var(--primary)" : "var(--border-subtle)",
                  boxShadow: destaque ? "0 8px 30px rgba(160,0,242,0.18)" : undefined,
                }}
              >
                {/* Badge de destaque */}
                {destaque && (
                  <span
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest text-white shadow-lg"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    Recomendado
                  </span>
                )}

                {/* Badge de status para GOD */}
                {isGod && (
                  <span
                    className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow"
                    style={{
                      backgroundColor:
                        plano.extincaoEm
                          ? "var(--status-cancelled)"
                          : plano.ativo
                          ? "var(--status-completed)"
                          : "var(--surface-elevated)",
                      color: plano.ativo && !plano.extincaoEm ? "#fff" : "var(--foreground)",
                    }}
                  >
                    {plano.extincaoEm
                      ? `Extinção ${new Date(plano.extincaoEm).toLocaleDateString("pt-BR")}`
                      : plano.ativo
                      ? "Ativo"
                      : "Inativo"}
                  </span>
                )}

                {/* Icone + nome */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{
                    backgroundColor: "var(--primary)",
                    color: "#fff",
                    opacity: destaque ? 1 : 0.85,
                  }}
                >
                  {ICONES[plano.slug.toUpperCase()] || <LuRocket size={26} />}
                </div>

                <h2
                  className="text-2xl font-black tracking-tight"
                  style={{ color: "var(--foreground)" }}
                >
                  {plano.nome}
                </h2>

                <p className="mt-2 text-sm font-medium opacity-50 leading-relaxed">
                  {plano.descricao}
                </p>

                {/* Preco */}
                <div className="mt-6 mb-6">
                  <span
                    className="text-4xl font-black tracking-tight"
                    style={{ color: "var(--foreground)" }}
                  >
                    R$ {formatarPreco(plano.preco)}
                  </span>
                  <span className="text-sm font-bold opacity-40"> /mês</span>
                </div>

                {/* Recursos */}
                <ul className="space-y-3 mb-8 flex-1">
                  {recursos.map((recurso) =>
                    recurso.disponivel ? (
                      <li key={recurso.texto} className="flex items-start gap-2.5">
                        <span
                          className="mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: "var(--success-light)" }}
                        >
                          <LuCheck size={13} style={{ color: "var(--status-completed)" }} />
                        </span>
                        <span className="text-sm font-medium opacity-70 leading-snug">
                          {recurso.texto}
                        </span>
                      </li>
                    ) : (
                      <li key={recurso.texto} className="flex items-center gap-2.5">
                        <span
                          className="mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: "var(--surface-elevated)",
                            border: "1px solid var(--border-subtle)",
                          }}
                        >
                          <LuLock size={11} style={{ color: "var(--foreground)", opacity: 0.45 }} />
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            toast(`${recurso.texto}: temporariamente indisponível.`, {
                              icon: "🔒",
                            })
                          }
                          title="Recurso temporariamente indisponível"
                          className="text-sm font-medium text-left leading-snug cursor-not-allowed transition-opacity hover:opacity-70"
                          style={{ color: "var(--foreground)" }}
                        >
                          <span className="opacity-70">{recurso.texto}</span>{" "}
                          <span
                            className="inline-block align-middle ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider"
                            style={{
                              backgroundColor: "var(--surface-elevated)",
                              color: "var(--status-cancelled)",
                              border: "1px solid var(--border-subtle)",
                            }}
                          >
                            Indisponível
                          </span>
                        </button>
                      </li>
                    )
                  )}
                </ul>

                {/* CTA para assinatura */}
                <Link
                  href={`/assinar?plano=${plano.slug}`}
                  className="w-full py-3.5 rounded-xl text-center font-bold text-white transition-all duration-200 hover:brightness-110 hover:shadow-lg active:scale-[0.98]"
                  style={{
                    backgroundColor: destaque ? "var(--primary)" : "var(--surface-elevated)",
                    color: destaque ? "#fff" : "var(--foreground)",
                    border: destaque ? undefined : "1px solid var(--border-subtle)",
                  }}
                >
                  {destaque ? "Assinar agora" : `Assinar ${plano.nome}`}
                </Link>

                {/* Acoes de gestao (GOD) */}
                {isGod && (
                  <div className="flex gap-2 mt-3">
                    <Link
                      href="/god/planos"
                      className="flex-1 py-2.5 rounded-xl text-center text-xs font-black uppercase tracking-wider transition-all hover:brightness-90"
                      style={{
                        backgroundColor: "var(--surface-elevated)",
                        color: "var(--foreground)",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      Editar
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleExcluirPlano(plano)}
                      className="flex-1 py-2.5 rounded-xl text-center text-xs font-black uppercase tracking-wider transition-all hover:brightness-90"
                      style={{
                        backgroundColor: "var(--surface-elevated)",
                        color: "var(--status-cancelled)",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      Excluir
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Notas de rodape */}
        <div className="mt-12 text-center space-y-3">
          <p
            className="inline-flex flex-wrap items-center justify-center gap-x-5 gap-y-2 px-5 py-2.5 rounded-xl text-sm font-bold border"
            style={{
              borderColor: "var(--border-subtle)",
              backgroundColor: "var(--surface)",
              color: "var(--foreground)",
            }}
          >
            <span className="inline-flex items-center gap-1.5">
              <LuUsers size={15} style={{ color: "var(--primary)" }} />
              Gestores e atendentes por plano
            </span>
            <span className="inline-flex items-center gap-1.5">
              <LuBot size={15} style={{ color: "var(--primary)" }} />
              Bot com ou sem IA
            </span>
            <span className="inline-flex items-center gap-1.5">
              <LuMessageCircle size={15} style={{ color: "var(--primary)" }} />
              App e WhatsApp
            </span>
          </p>

          <p className="text-xs font-medium opacity-40">
            Teste grátis por 7 dias. Sem cartão de crédito. Sem multa contratual.
            Cancele quando quiser. Acesso liberado imediatamente.
          </p>
        </div>
      </div>
    </main>
  );
}
