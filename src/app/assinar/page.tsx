"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { BtnVoltar } from "../components/back";
import { ThemeToggle } from "../components/theme-toggle";
import {
  LuBuilding2,
  LuUser,
  LuLoader,
  LuCheck,
  LuChevronLeft,
  LuShieldCheck,
  LuLayers,
  LuMail,
} from "react-icons/lu";
import { gerarEmailAdmin } from "@/lib/planos";

// Tipo de plano vindo da API (tabela planos)
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
};

const MODULOS_LABEL: Record<string, string> = {
  CORPORATIVO: "Corporativo",
  OFICINA: "Operacional",
  COMERCIAL: "Comercial",
};

const MODULOS_DESC: Record<string, string> = {
  CORPORATIVO: "Chamados, dashboard, avisos e CPFs",
  OFICINA: "Manutenção veicular e operações",
  COMERCIAL: "Atendimento comercial e leads",
};

const MODULOS_DISPONIVEIS = ["CORPORATIVO", "OFICINA", "COMERCIAL"];

function formatCNPJ(value: string) {
  return value
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, "$1.$2.$3/$4-$5")
    .substring(0, 18);
}

function formatCPF(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

// Conteudo principal (separado para usar useSearchParams dentro de Suspense)
function AssinarContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planoSlug = searchParams.get("plano") || "start";

  const [planos, setPlanos] = useState<PlanoApi[]>([]);
  const [carregandoPlanos, setCarregandoPlanos] = useState(true);

  // Carrega os planos ativos do banco
  useEffect(() => {
    fetch("/api/planos")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setPlanos(d || []))
      .catch(() => setPlanos([]))
      .finally(() => setCarregandoPlanos(false));
  }, []);

  const plano = useMemo<PlanoApi | null>(() => {
    return (
      planos.find(
        (p) => p.slug === planoSlug || p.slug.toUpperCase() === planoSlug.toUpperCase()
      ) || planos[0] || null
    );
  }, [planoSlug, planos]);

  const modulosDisponiveis = MODULOS_DISPONIVEIS;
  const moduloAutomatico = plano ? plano.maxModulos === -1 : false;

  const [loading, setLoading] = useState(false);
  const [modulosSel, setModulosSel] = useState<string[]>([]);
  const [empresa, setEmpresa] = useState({ nome: "", cnpj: "", setores: "" });
  const [admin, setAdmin] = useState({ nome: "", cpf: "", password: "" });
  const [emailPreview, setEmailPreview] = useState("");

  // Atualiza preview do email automatico
  function handleEmpresaNome(nome: string) {
    setEmpresa((prev) => ({ ...prev, nome }));
    if (admin.cpf) {
      setEmailPreview(gerarEmailAdmin(admin.cpf, nome || "empresa"));
    }
  }
  function handleAdminCpf(cpf: string) {
    const c = cpf.replace(/\D/g, "").slice(0, 11);
    setAdmin((prev) => ({ ...prev, cpf: formatCPF(cpf) }));
    if (empresa.nome) {
      setEmailPreview(gerarEmailAdmin(c || "00000000000", empresa.nome));
    }
  }

  function toggleModulo(m: string) {
    if (!plano || moduloAutomatico) return;

    // Remove módulo selecionado
    if (modulosSel.includes(m)) {
      setModulosSel((prev) => prev.filter((x) => x !== m));
      return;
    }

    // Valida limite do plano fora do updater (evita efeito colateral em render)
    if (modulosSel.length >= plano.maxModulos) {
      toast.error(`O plano ${plano.nome} permite no máximo ${plano.maxModulos} módulo(s).`);
      return;
    }

    setModulosSel((prev) => [...prev, m]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!plano) return;
    setLoading(true);

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plano: plano.slug,
          empresa: {
            nome: empresa.nome,
            cnpj: empresa.cnpj.replace(/\D/g, ""),
            setores: empresa.setores.split(",").map((s) => s.trim()).filter(Boolean),
          },
          admin: {
            nome: admin.nome,
            cpf: admin.cpf.replace(/\D/g, ""),
            password: admin.password,
          },
          modulos: modulosSel,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao criar conta");
      }

      toast.success("Conta criada! Conclua o pagamento com cartão.");
      setTimeout(() => {
        if (data.pagamentoUrl) {
          window.location.href = data.pagamentoUrl;
        } else {
          router.push("/");
        }
      }, 900);
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  }

  // enquanto carrega planos, mostra loader
  if (carregandoPlanos) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--background)" }}
      >
        <LuLoader size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
      </main>
    );
  }

  if (!plano) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--background)" }}
      >
        <p className="opacity-60">Nenhum plano disponível no momento.</p>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen transition-colors duration-300 py-10 sm:py-14 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--background)" }}
    >
      <BtnVoltar />
      <div className="absolute right-4 top-4 z-50">
        <ThemeToggle />
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <Link
            href="/planos"
            className="inline-flex items-center gap-1.5 text-sm font-bold opacity-50 hover:opacity-100 transition-opacity mb-4"
            style={{ color: "var(--primary)" }}
          >
            <LuChevronLeft size={16} />
            Voltar para planos
          </Link>
          <h1
            className="text-3xl sm:text-4xl font-black tracking-tight"
            style={{ color: "var(--foreground)" }}
          >
            Assinar plano{" "}
            <span style={{ color: "var(--primary)" }}>{plano.nome}</span>
          </h1>
          <p className="mt-2 text-sm font-medium opacity-50">
            Crie sua conta e conclua o pagamento com cartão de crédito em minutos.
          </p>
        </div>

        {/* Resumo do plano */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border p-5 mb-8 flex items-center gap-4"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--primary)",
            boxShadow: "0 8px 30px rgba(160,0,242,0.12)",
          }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0"
            style={{ backgroundColor: "var(--primary)" }}
          >
            <LuShieldCheck size={24} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-black" style={{ color: "var(--foreground)" }}>
              Plano {plano.nome} — R$ {plano.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/mês
            </p>
            <p className="text-xs font-medium opacity-50 mt-0.5">
              {moduloAutomatico
                ? "Todos os módulos liberados automaticamente."
                : `Escolha até ${plano.maxModulos} módulo(s) abaixo.`}{" "}
              · 7 dias grátis após o pagamento confirmar.
            </p>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados da empresa */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl border p-6 sm:p-8 space-y-5"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-subtle)" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <LuBuilding2 size={18} style={{ color: "var(--primary)" }} />
              <h2 className="text-sm font-black uppercase tracking-wider">Dados da Empresa</h2>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider opacity-70">Nome da Empresa</label>
              <input
                type="text"
                placeholder="Ex: Minha Empresa LTDA"
                value={empresa.nome}
                onChange={(e) => handleEmpresaNome(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider opacity-70">CNPJ</label>
                <input
                  type="text"
                  placeholder="00.000.000/0000-00"
                  value={empresa.cnpj}
                  onChange={(e) => setEmpresa((p) => ({ ...p, cnpj: formatCNPJ(e.target.value) }))}
                  required
                  className="w-full px-4 py-3 rounded-xl border font-mono outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider opacity-70">Setores (separados por vírgula)</label>
                <input
                  type="text"
                  placeholder="Suporte, Vendas, TI..."
                  value={empresa.setores}
                  onChange={(e) => setEmpresa((p) => ({ ...p, setores: e.target.value }))}
                  required
                  className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }}
                />
              </div>
            </div>

            {/* Módulos */}
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-3">
                <LuLayers size={18} style={{ color: "var(--primary)" }} />
                <h3 className="text-xs font-black uppercase tracking-wider">Módulos</h3>
              </div>

              {moduloAutomatico ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {modulosDisponiveis.map((m) => (
                    <div
                      key={m}
                      className="flex items-center gap-2.5 p-3 rounded-xl border"
                      style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--primary)" }}
                    >
                      <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--primary)" }}>
                        <LuCheck size={12} color="#fff" />
                      </span>
                      <div>
                        <p className="text-sm font-bold">{MODULOS_LABEL[m] || m}</p>
                        <p className="text-[10px] opacity-50">{MODULOS_DESC[m]}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <p className="text-xs font-medium opacity-50 mb-3">
                    Escolha até <b>{plano.maxModulos}</b> módulo(s) para sua empresa.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {modulosDisponiveis.map((m) => {
                      const selected = modulosSel.includes(m);
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => toggleModulo(m)}
                          className="text-left p-3 rounded-xl border-2 transition-all duration-200 hover:brightness-105"
                          style={{
                            backgroundColor: selected ? "var(--surface)" : "var(--surface-elevated)",
                            borderColor: selected ? "var(--primary)" : "var(--border-subtle)",
                          }}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-sm font-bold">{MODULOS_LABEL[m] || m}</p>
                            {selected && <LuCheck size={15} style={{ color: "var(--primary)" }} />}
                          </div>
                          <p className="text-[10px] opacity-50">{MODULOS_DESC[m]}</p>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </motion.section>

          {/* Dados do admin */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border p-6 sm:p-8 space-y-5"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-subtle)" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <LuUser size={18} style={{ color: "var(--primary)" }} />
              <h2 className="text-sm font-black uppercase tracking-wider">Administrador</h2>
            </div>
            <p className="text-xs font-medium opacity-50 -mt-3">
              O administrador gerencia os usuários da empresa. Seu email de acesso é gerado automaticamente.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider opacity-70">Nome Completo</label>
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={admin.nome}
                  onChange={(e) => setAdmin((p) => ({ ...p, nome: e.target.value }))}
                  required
                  className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider opacity-70">CPF</label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={admin.cpf}
                  onChange={(e) => handleAdminCpf(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border font-mono outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider opacity-70">Senha</label>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={admin.password}
                onChange={(e) => setAdmin((p) => ({ ...p, password: e.target.value }))}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }}
              />
            </div>

            {emailPreview && (
              <div
                className="flex items-start gap-2.5 p-3.5 rounded-xl border text-sm"
                style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)" }}
              >
                <LuMail size={16} className="mt-0.5 shrink-0" style={{ color: "var(--primary)" }} />
                <div>
                  <p className="font-bold">Seu email de acesso</p>
                  <p className="font-mono text-xs opacity-70 mt-0.5 break-all">{emailPreview}</p>
                </div>
              </div>
            )}
          </motion.section>

          {/* Submit */}
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            type="submit"
            disabled={loading || (plano.maxModulos !== -1 && modulosSel.length === 0)}
            className="w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] text-white transition-all duration-200 hover:brightness-110 hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "var(--primary)" }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <LuLoader size={18} className="animate-spin" />
                Criando sua conta...
              </span>
            ) : (
              `Liberar acesso ao plano ${plano.nome}`
            )}
          </motion.button>

          <p className="text-center text-xs font-medium opacity-40">
            Ao continuar você concorda com os termos de uso. 7 dias grátis após o pagamento.
          </p>
        </form>
      </div>
    </main>
  );
}

// Pagina de assinatura com fallback de suspense
export default function AssinarPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: "var(--background)" }}
        >
          <LuLoader size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
        </div>
      }
    >
      <AssinarContent />
    </Suspense>
  );
}
