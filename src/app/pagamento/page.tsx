"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { BtnVoltar } from "../components/back";
import { ThemeToggle } from "../components/theme-toggle";
import {
  LuLoader,
  LuCreditCard,
  LuShieldCheck,
  LuLock,
  LuChevronLeft,
  LuCircleCheck,
  LuTriangleAlert,
} from "react-icons/lu";

// Cartão de teste da SANDBOX do Asaas (documentação oficial)
const CARTAO_TESTE = {
  number: "4444 4444 4444 4444",
  expiry: "12/27",
  ccv: "123",
  holderName: "NOLEVEL TESTE",
};

function formatNumero(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatValidade(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

function formatCEP(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

function formatTelefone(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function PagamentoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("t") || "";

  const [carregando, setCarregando] = useState(true);
  const [erroFatal, setErroFatal] = useState("");
  const [dados, setDados] = useState<{
    empresa: string;
    plano: string;
    valor: number;
    modo: string;
    asaasConfigurado: boolean;
    trialDias: number;
    trialAtivo: boolean;
    trialUsado: boolean;
    trialDisponivel: boolean;
  } | null>(null);

  const [cartao, setCartao] = useState({
    holderName: "",
    number: "",
    expiry: "",
    ccv: "",
  });
  const [titular, setTitular] = useState({
    postalCode: "",
    addressNumber: "",
    phone: "",
  });
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{ ok: boolean; msg: string; codigo?: string } | null>(null);

  // Busca os dados da cobrança
  useEffect(() => {
    if (!token) {
      setErroFatal("Link de pagamento inválido.");
      setCarregando(false);
      return;
    }
    fetch(`/api/empresa/pagamento?t=${encodeURIComponent(token)}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Link inválido");
        setDados(d);
      })
      .catch((e) => setErroFatal(e.message || "Link de pagamento inválido ou expirado."))
      .finally(() => setCarregando(false));
  }, [token]);

  const emSandbox = dados?.modo === "sandbox";
  const valorLabel = useMemo(() => {
    if (!dados) return "";
    return dados.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
  }, [dados]);

  function usarCartaoTeste() {
    setCartao({ holderName: CARTAO_TESTE.holderName, number: CARTAO_TESTE.number, expiry: CARTAO_TESTE.expiry, ccv: CARTAO_TESTE.ccv });
    setTitular({ postalCode: "01001-000", addressNumber: "100", phone: "(11) 99999-9999" });
    toast("Cartão de teste preenchido (sandbox).", { icon: "🧪" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dados || enviando) return;
    setEnviando(true);
    setResultado(null);

    const [mm, aa] = cartao.expiry.split("/");
    try {
      const res = await fetch("/api/empresa/pagamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          cartao: {
            holderName: cartao.holderName.trim(),
            number: cartao.number,
            expiryMonth: mm || "",
            expiryYear: aa ? `20${aa}` : "",
            ccv: cartao.ccv,
          },
          titular: {
            postalCode: titular.postalCode,
            addressNumber: titular.addressNumber,
            phone: titular.phone,
          },
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        const msg = data.error || "Não foi possível processar o pagamento."
        setResultado({
          ok: false,
          msg,
          codigo: data.codigo,
        })
        toast.error(msg)
        return;
      }

      const mock = data.mock ? " (ambiente de desenvolvimento)" : "";
      setResultado({
        ok: true,
        msg: `Pagamento processado${mock}. Sua assinatura será ativada em instantes após a confirmação.`,
      });
      toast.success("Pagamento processado com sucesso!");
      setTimeout(() => router.push("/"), 1800);
    } catch (err: any) {
      setResultado({ ok: false, msg: err.message || "Erro ao processar pagamento." });
      toast.error(err.message || "Erro ao processar pagamento.");
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--background)" }}
      >
        <LuLoader size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
      </main>
    );
  }

  if (erroFatal || !dados) {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center gap-4 px-6"
        style={{ backgroundColor: "var(--background)" }}
      >
        <LuTriangleAlert size={40} style={{ color: "var(--primary)" }} />
        <p className="font-bold text-lg">{erroFatal || "Link de pagamento inválido."}</p>
        <Link href="/" className="text-sm font-bold underline opacity-70 hover:opacity-100">
          Voltar ao início
        </Link>
      </main>
    );
  }

  const pagou = resultado?.ok;

  return (
    <main
      className="min-h-screen transition-colors duration-300 py-10 sm:py-14 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--background)" }}
    >
      <BtnVoltar />
      <div className="absolute right-4 top-4 z-50">
        <ThemeToggle />
      </div>

      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-bold opacity-50 hover:opacity-100 transition-opacity mb-4"
            style={{ color: "var(--primary)" }}
          >
            <LuChevronLeft size={16} />
            Início
          </Link>
          <h1
            className="text-2xl sm:text-3xl font-black tracking-tight"
            style={{ color: "var(--foreground)" }}
          >
            Pagamento <span style={{ color: "var(--primary)" }}>seguro</span>
          </h1>
          <p className="mt-2 text-sm font-medium opacity-50">
            Assine o plano e ative sua assinatura com cartão de crédito.
          </p>
        </div>

        {/* Resumo da cobrança */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border p-5 mb-6"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--primary)",
            boxShadow: "0 8px 30px rgba(160,0,242,0.12)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0"
              style={{ backgroundColor: "var(--primary)" }}
            >
              <LuCreditCard size={22} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-black" style={{ color: "var(--foreground)" }}>
                {dados.empresa}
              </p>
              <p className="text-xs font-medium opacity-50">
                Plano {dados.plano} · R$ {valorLabel}/mês
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 text-xs font-bold opacity-70">
            <LuShieldCheck size={15} style={{ color: "var(--primary)" }} />
            Assinatura mensal · Cancele quando quiser
          </div>
        </motion.div>

        {/* Aviso: trial já utilizado (degustação indisponível) */}
        {dados.trialUsado && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2.5 rounded-xl border p-4 mb-6 text-xs font-medium leading-relaxed"
            style={{ backgroundColor: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.4)" }}
          >
            <LuTriangleAlert size={16} className="shrink-0 mt-0.5" style={{ color: "#ef4444" }} />
            <div>
              <p className="font-black uppercase tracking-wider mb-0.5">Trial já utilizado</p>
              <p className="opacity-80">
                Você já recebeu seu período de teste grátis. Para continuar usando o sistema, o pagamento é obrigatório.
              </p>
            </div>
          </motion.div>
        )}

        {emSandbox && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border p-4 mb-6 text-xs font-medium leading-relaxed"
            style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)" }}
          >
            <p className="font-black uppercase tracking-wider mb-1">🧪 Ambiente de homologação</p>
            <p className="opacity-70">
              Use o cartão de teste: <b className="font-mono">{CARTAO_TESTE.number}</b> ·{" "}
              {CARTAO_TESTE.expiry} · CVV <b className="font-mono">{CARTAO_TESTE.ccv}</b>{" "}
              <button
                type="button"
                onClick={usarCartaoTeste}
                className="underline ml-1 opacity-80 hover:opacity-100"
                style={{ color: "var(--primary)" }}
              >
                preencher
              </button>
            </p>
          </motion.div>
        )}

        {resultado && (
          <div
            className={`flex items-start gap-2.5 rounded-xl border p-4 mb-6 text-sm ${
              pagou ? "" : ""
            }`}
            style={{
              backgroundColor: pagou ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
              borderColor: pagou ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)",
            }}
          >
            {pagou ? (
              <LuCircleCheck size={18} className="shrink-0 mt-0.5" style={{ color: "#22c55e" }} />
            ) : (
              <LuTriangleAlert size={18} className="shrink-0 mt-0.5" style={{ color: "#ef4444" }} />
            )}
            <div>
              <p className="font-bold">{pagou ? "Pagamento processado!" : "Não foi possível processar."}</p>
              <p className="opacity-80 mt-0.5">{resultado.msg}</p>
              {resultado.codigo && (
                <p className="opacity-60 mt-1 font-mono text-xs">
                  Código do erro: {resultado.codigo} — envie ao suporte.
                </p>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl border p-6 sm:p-7 space-y-5"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-subtle)" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LuCreditCard size={18} style={{ color: "var(--primary)" }} />
                <h2 className="text-sm font-black uppercase tracking-wider">Dados do Cartão</h2>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold opacity-50">
                <LuLock size={12} />
                Criptografado
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider opacity-70">Nome impresso no cartão</label>
              <input
                type="text"
                placeholder="Como está no cartão"
                value={cartao.holderName}
                onChange={(e) => setCartao((p) => ({ ...p, holderName: e.target.value.toUpperCase() }))}
                required
                autoComplete="cc-name"
                className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider opacity-70">Número do cartão</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0000 0000 0000 0000"
                value={cartao.number}
                onChange={(e) => setCartao((p) => ({ ...p, number: formatNumero(e.target.value) }))}
                required
                autoComplete="cc-number"
                className="w-full px-4 py-3 rounded-xl border font-mono outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }}
              />
            </div>

              <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider opacity-70">Validade</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="MM/AA"
                  value={cartao.expiry}
                  onChange={(e) => setCartao((p) => ({ ...p, expiry: formatValidade(e.target.value) }))}
                  required
                  autoComplete="cc-exp"
                  className="w-full px-4 py-3 rounded-xl border font-mono outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider opacity-70">CVV</label>
                <input
                  type="password"
                  inputMode="numeric"
                  placeholder="123"
                  value={cartao.ccv}
                  onChange={(e) => setCartao((p) => ({ ...p, ccv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                  required
                  autoComplete="cc-csc"
                  className="w-full px-4 py-3 rounded-xl border font-mono outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }}
                />
              </div>
            </div>
          </motion.section>

          {/* Dados do titular (obrigatórios na tokenização do Asaas) */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.07 }}
            className="rounded-2xl border p-6 sm:p-7 space-y-5"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-subtle)" }}
          >
            <div className="flex items-center gap-2">
              <LuShieldCheck size={18} style={{ color: "var(--primary)" }} />
              <h2 className="text-sm font-black uppercase tracking-wider">Dados do Titular</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider opacity-70">CEP</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="00000-000"
                  value={titular.postalCode}
                  onChange={(e) => setTitular((p) => ({ ...p, postalCode: formatCEP(e.target.value) }))}
                  required
                  autoComplete="postal-code"
                  className="w-full px-4 py-3 rounded-xl border font-mono outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider opacity-70">Número</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="123"
                  value={titular.addressNumber}
                  onChange={(e) => setTitular((p) => ({ ...p, addressNumber: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
                  required
                  className="w-full px-4 py-3 rounded-xl border font-mono outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider opacity-70">Telefone com DDD</label>
              <input
                type="tel"
                inputMode="tel"
                placeholder="(11) 99999-9999"
                value={titular.phone}
                onChange={(e) => setTitular((p) => ({ ...p, phone: formatTelefone(e.target.value) }))}
                required
                autoComplete="tel"
                className="w-full px-4 py-3 rounded-xl border font-mono outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }}
              />
            </div>
          </motion.section>

          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            type="submit"
            disabled={enviando || !!pagou}
            className="w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] text-white transition-all duration-200 hover:brightness-110 hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "var(--primary)" }}
          >
            {enviando ? (
              <span className="flex items-center justify-center gap-2">
                <LuLoader size={18} className="animate-spin" />
                Processando pagamento...
              </span>
            ) : (
              `Pagar R$ ${valorLabel}/mês`
            )}
          </motion.button>

          <p className="text-center text-xs font-medium opacity-40 flex items-center justify-center gap-1.5">
            <LuLock size={12} />
            Pagamento processado com segurança pelo Asaas. Seus dados não são armazenados.
          </p>
        </form>
      </div>
    </main>
  );
}

export default function PagamentoPage() {
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
      <PagamentoContent />
    </Suspense>
  );
}
