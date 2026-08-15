'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ROLE } from '@prisma/client'
import {
  Building2, Key, Copy, RotateCw, Check, X, Loader2, Image,
  Sparkles, Headphones, Wrench, CalendarCheck, Save, Link2,
  CreditCard, Timer, CalendarClock, AlertTriangle, CircleDollarSign, Ban,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { uploadFileDirect } from '@/lib/upload-client'

interface Assinatura {
  plano: string
  nomePlano: string | null
  statusPagamento: string
  trialAtivo: boolean
  trialUsado: boolean
  trialDias: number
  trialInicio: string | null
  trialFim: string | null
  trialDiasRestantes: number | null
  dataVencimento: string | null
  ciclo: string | null
  assinaturaId: string | null
  clienteId: string | null
  assinaturaAsaas: boolean
}

const STATUS_PAGAMENTO_LABEL: Record<string, string> = {
  PENDENTE: 'Pendente',
  PAGO: 'Pago',
  ATRASADO: 'Em atraso',
  CANCELADO: 'Cancelado',
  REEMBOLSADO: 'Reembolsado',
}

const CICLO_LABEL: Record<string, string> = {
  WEEKLY: 'Semanal',
  BIWEEKLY: 'Quinzenal',
  MONTHLY: 'Mensal',
  QUARTERLY: 'Trimestral',
  SEMIANNUALLY: 'Semestral',
  YEARLY: 'Anual',
}

function formatarDataBR(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('pt-BR')
}

function diasRestantesDe(iso: string | null): number | null {
  if (!iso) return null
  const alvo = new Date(iso).getTime()
  if (isNaN(alvo)) return null
  return Math.max(0, Math.ceil((alvo - Date.now()) / 86400000))
}

function corStatus(status: string): string {
  switch (status) {
    case 'PAGO': return 'var(--status-completed)'
    case 'PENDENTE': return 'var(--status-waiting)'
    case 'ATRASADO': return 'var(--status-cancelled)'
    case 'REEMBOLSADO': return 'var(--status-in-progress)'
    case 'CANCELADO': return 'var(--status-new)'
    default: return 'var(--status-waiting)'
  }
}

interface Empresa {
  id: string
  nome: string
  cnpj: string
  setores: string[]
  modulos: string[]
  logoUrl?: string | null
  evolution_token?: string | null
  provider?: string | null
  evolution_url?: string | null
  api_key?: string | null
  botName?: string | null
  botPresentation?: string | null
  botServiceDesc?: string | null
  botAvisosDesc?: string | null
  botPrompt?: string | null
}

const MODULOS_OPCOES = [
  { valor: 'CORPORATIVO', label: 'Corporativo', icon: Headphones, cor: 'var(--status-new)' },
  { valor: 'OFICINA', label: 'Operacional', icon: Wrench, cor: 'var(--status-in-progress)' },
  { valor: 'COMERCIAL', label: 'Comercial', icon: CalendarCheck, cor: 'var(--status-waiting)' },
]

// webhook de cada módulo — só são exibidas as URLs dos módulos que a empresa adquiriu
const WEBHOOKS_POR_MODULO = [
  { modulo: 'CORPORATIVO', rota: 'webhook-corporativo', label: 'Corporativo (SAC)' },
  { modulo: 'OFICINA', rota: 'webhook-oficina', label: 'Oficina (Operação)' },
  { modulo: 'COMERCIAL', rota: 'webhook-comercial', label: 'Comercial (Leads)' },
]

// Painel do ADMIN/GESTOR: dados da empresa, webhooks, token e provedor do próprio negócio
export default function MinhaEmpresaPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [loading, setLoading] = useState(true)
  const [plano, setPlano] = useState<string>('')
  const [nomePlano, setNomePlano] = useState('')

  // assinatura / financeiro (visível apenas para o ADMIN que comprou)
  const [assinatura, setAssinatura] = useState<Assinatura | null>(null)

  // edição dos dados da empresa
  const [editando, setEditando] = useState(false)
  const [editForm, setEditForm] = useState({ nome: '', cnpj: '', setores: '' })
  const [editLogoFile, setEditLogoFile] = useState<File | null>(null)
  const [editLogoPreview, setEditLogoPreview] = useState<string | null>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)
  const [savingDados, setSavingDados] = useState(false)

  // token do webhook
  const [regeneratingKey, setRegeneratingKey] = useState(false)
  const [keyCopied, setKeyCopied] = useState(false)

  // provedor (BYO API)
  const [currentProvider, setCurrentProvider] = useState('EVOLUTION')
  const [currentApiUrl, setCurrentApiUrl] = useState('')
  const [currentApiKey, setCurrentApiKey] = useState('')
  const [savingApiConfig, setSavingApiConfig] = useState(false)

  // bot
  const [botForm, setBotForm] = useState({
    botName: '',
    botPresentation: '',
    botServiceDesc: '',
    botAvisosDesc: '',
    botPrompt: '',
  })
  const [gerandoPrompt, setGerandoPrompt] = useState(false)
  const [savingBot, setSavingBot] = useState(false)

  const userRole = session?.user?.role as ROLE | undefined
  const isAdmin = userRole === 'ADMIN' || userRole === 'GESTOR'
  // dono = ADMIN (quem comprou a aplicação) — vê os dados financeiros
  const isOwner = userRole === 'ADMIN'

  useEffect(() => {
    if (status === 'loading') return
    if (!session || !isAdmin) {
      router.replace('/dashboard')
      return
    }
  }, [status, session, isAdmin, router])

  // carrega dados da empresa + plano
  useEffect(() => {
    if (status === 'loading' || !session?.user?.empresaId || !isAdmin) return

    const empresaId = session.user.empresaId

    fetch(`/api/empresa?id=${empresaId}`)
      .then((r) => r.json())
      .then((data) => {
        setEmpresa(data)
        setEditForm({ nome: data.nome || '', cnpj: data.cnpj || '', setores: (data.setores || []).join(', ') })
        setEditLogoPreview(data.logoUrl || null)
        setCurrentProvider(data.provider || 'EVOLUTION')
        setCurrentApiUrl(data.evolution_url || '')
        setCurrentApiKey(data.api_key || '')
        setBotForm({
          botName: data.botName || '',
          botPresentation: data.botPresentation || '',
          botServiceDesc: data.botServiceDesc || '',
          botAvisosDesc: data.botAvisosDesc || '',
          botPrompt: data.botPrompt || '',
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))

    fetch(`/api/empresa/plano?id=${empresaId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setPlano(data?.plano || '')
        // busca o nome do plano na tabela planos (suporta planos dinâmicos)
        fetch(`/api/planos`)
          .then((r) => (r.ok ? r.json() : []))
          .then((ps) => {
            const p = (ps || []).find((x: any) => x.slug === data?.plano)
            if (p) setNomePlano(p.nome)
          })
          .catch(() => {})
      })
      .catch(() => {})
  }, [status, session, isAdmin])

  // carrega dados de assinatura/financeiro — somente ADMIN
  useEffect(() => {
    if (status === 'loading' || !session?.user?.empresaId || !isOwner) return
    fetch(`/api/empresa/assinatura?id=${session.user.empresaId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setAssinatura(data))
      .catch(() => setAssinatura(null))
  }, [status, session, isOwner])

  async function reloadEmpresa() {
    if (!session?.user?.empresaId) return
    const res = await fetch(`/api/empresa?id=${session.user.empresaId}`)
    if (!res.ok) return
    const data = await res.json()
    setEmpresa(data)
    setCurrentProvider(data.provider || 'EVOLUTION')
    setCurrentApiUrl(data.evolution_url || '')
    setCurrentApiKey(data.api_key || '')
  }

  // salva dados básicos da empresa
  async function salvarDados() {
    if (!empresa) return
    setSavingDados(true)
    try {
      let finalLogoUrl = editLogoPreview

      if (editLogoFile) {
        const url = await uploadFileDirect(editLogoFile, 'logo', 'empresas')
        if (!url) {
          toast.error('Erro ao fazer upload da logo')
          return
        }
        finalLogoUrl = url
      }

      const res = await fetch(`/api/empresa?id=${empresa.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: editForm.nome,
          cnpj: editForm.cnpj.replace(/\D/g, ''),
          setores: editForm.setores.split(',').map((s) => s.trim()).filter(Boolean),
          logoUrl: finalLogoUrl || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Erro ao atualizar')
        return
      }
      toast.success('Dados da empresa atualizados!')
      setEditando(false)
      reloadEmpresa()
    } catch {
      toast.error('Erro ao conectar com o servidor')
    } finally {
      setSavingDados(false)
    }
  }

  // regenera o token do webhook
  async function regenerarToken() {
    if (!empresa) return
    setRegeneratingKey(true)
    try {
      const res = await fetch(`/api/empresa?id=${empresa.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regenerar_token: true }),
      })
      if (!res.ok) {
        toast.error('Erro ao regenerar chave')
        return
      }
      const data = await res.json()
      setEmpresa((prev) => (prev ? { ...prev, evolution_token: data.evolution_token } : prev))
      setKeyCopied(false)
      toast.success('Token regenerado!')
    } catch {
      toast.error('Erro ao conectar')
    } finally {
      setRegeneratingKey(false)
    }
  }

  // salva configuração do provedor (BYO API)
  async function salvarApiConfig() {
    if (!empresa) return
    setSavingApiConfig(true)
    try {
      const res = await fetch(`/api/empresa?id=${empresa.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: currentProvider,
          evolution_url: currentApiUrl,
          api_key: currentApiKey,
        }),
      })
      if (!res.ok) {
        toast.error('Erro ao salvar configuração')
        return
      }
      toast.success('Configuração de WhatsApp salva!')
      reloadEmpresa()
    } catch {
      toast.error('Erro ao conectar')
    } finally {
      setSavingApiConfig(false)
    }
  }

  // gera prompt do bot via IA
  async function gerarPrompt() {
    if (!empresa) return
    if (!botForm.botPresentation && !botForm.botServiceDesc && !botForm.botAvisosDesc) {
      toast.error('Preencha pelo menos uma descrição')
      return
    }
    setGerandoPrompt(true)
    try {
      const res = await fetch('/api/empresa/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresaId: empresa.id,
          botPresentation: botForm.botPresentation,
          botServiceDesc: botForm.botServiceDesc,
          botAvisosDesc: botForm.botAvisosDesc,
          botName: botForm.botName,
        }),
      })
      if (!res.ok) {
        toast.error('Erro ao gerar prompt')
        return
      }
      const data = await res.json()
      setBotForm((p) => ({ ...p, botPrompt: data.botPrompt }))
      toast.success('Prompt gerado!')
    } catch {
      toast.error('Erro ao gerar prompt')
    } finally {
      setGerandoPrompt(false)
    }
  }

  // salva configuração do bot
  async function salvarBot() {
    if (!empresa) return
    setSavingBot(true)
    try {
      const res = await fetch('/api/empresa/prompt', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresaId: empresa.id,
          botName: botForm.botName,
          botPresentation: botForm.botPresentation,
          botServiceDesc: botForm.botServiceDesc,
          botAvisosDesc: botForm.botAvisosDesc,
          botPrompt: botForm.botPrompt,
        }),
      })
      if (!res.ok) {
        toast.error('Erro ao salvar')
        return
      }
      toast.success('Configuração salva!')
      reloadEmpresa()
    } catch {
      toast.error('Erro ao conectar')
    } finally {
      setSavingBot(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!session || !isAdmin || !empresa) return null

  return (
    <main
      className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 sm:py-10 transition-colors duration-300"
      style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* cabeçalho da empresa */}
        <div
          className="rounded-3xl border p-6 sm:p-8"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div
              className="w-16 h-16 flex items-center justify-center rounded-2xl shrink-0 overflow-hidden"
              style={{ backgroundColor: 'var(--surface-elevated)' }}
            >
              {empresa.logoUrl ? (
                <img src={empresa.logoUrl} alt={`Logo da empresa ${empresa.nome}`} className="w-full h-full object-contain p-2" />
              ) : (
                <Building2 size={28} style={{ opacity: 0.5 }} />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--primary)' }}>
                {empresa.nome}
              </h1>
              <p className="text-sm font-mono opacity-70">{empresa.cnpj}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span
                className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full"
                style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
              >
                Plano {nomePlano || plano || '—'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-5">
            {empresa.modulos?.map((mod) => {
              const config = MODULOS_OPCOES.find((m) => m.valor === mod)
              if (!config) return null
              const Icon = config.icon
              return (
                <span
                  key={mod}
                  className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: config.cor + '20', color: config.cor }}
                >
                  <Icon size={12} />
                  {config.label}
                </span>
              )
            })}
          </div>
        </div>

        {/* Assinatura e Financeiro — visível apenas para o ADMIN que comprou */}
        {isOwner && assinatura && (
          <section
            className="rounded-3xl border p-6 sm:p-8"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-subtle)' }}
          >
            <div className="flex items-center gap-2 mb-1">
              <CreditCard size={18} style={{ color: 'var(--primary)' }} />
              <h2 className="text-lg font-bold">Assinatura e Financeiro</h2>
            </div>
            <p className="text-xs opacity-60 mb-5">
              Plano contratado, período de teste e vencimento da recorrência.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Plano */}
              <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--surface-elevated)' }}>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1">Plano</p>
                <p className="text-lg font-bold" style={{ color: 'var(--primary)' }}>
                  {assinatura.nomePlano || assinatura.plano || '—'}
                </p>
                <p className="text-xs opacity-60 font-mono">{assinatura.plano}</p>
              </div>

              {/* Status do pagamento */}
              <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--surface-elevated)' }}>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1">Status do pagamento</p>
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full"
                  style={{
                    backgroundColor: corStatus(assinatura.statusPagamento),
                    color: '#fff',
                  }}
                >
                  {STATUS_PAGAMENTO_LABEL[assinatura.statusPagamento] || assinatura.statusPagamento}
                </span>
              </div>

              {/* Trial */}
              {assinatura.trialAtivo ? (
                <div className="p-4 rounded-xl border-2 border-dashed" style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--status-waiting)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1 flex items-center gap-1">
                    <Timer size={12} /> Período de teste
                  </p>
                  <p className="text-2xl font-black" style={{ color: 'var(--status-waiting)' }}>
                    {assinatura.trialDiasRestantes ?? diasRestantesDe(assinatura.trialFim) ?? '—'}{' '}
                    <span className="text-sm font-semibold">dia(s) restantes</span>
                  </p>
                  <p className="text-xs opacity-60 mt-1">
                    Termina em <strong>{formatarDataBR(assinatura.trialFim)}</strong>
                  </p>
                  <p className="text-[11px] opacity-50 mt-2">
                    Ao final do teste, será cobrada a 1ª mensalidade do plano.
                  </p>
                </div>
              ) : assinatura.statusPagamento === 'PAGO' ? (
                <div className="p-4 rounded-xl border-2 border-dashed" style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--status-completed)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1 flex items-center gap-1">
                    <CalendarClock size={12} /> Recorrência
                  </p>
                  <p className="text-sm font-bold" style={{ color: 'var(--status-completed)' }}>
                    Próximo vencimento
                  </p>
                  <p className="text-lg font-bold">
                    {formatarDataBR(assinatura.dataVencimento)}
                  </p>
                  <p className="text-xs opacity-60 mt-1">
                    Cobrança {CICLO_LABEL[assinatura.ciclo?.toUpperCase() || ''] || assinatura.ciclo || '—'}
                  </p>
                </div>
              ) : assinatura.statusPagamento === 'ATRASADO' ? (
                <div className="p-4 rounded-xl border-2 border-dashed" style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--status-cancelled)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1 flex items-center gap-1">
                    <AlertTriangle size={12} /> Atenção
                  </p>
                  <p className="text-sm font-bold" style={{ color: 'var(--status-cancelled)' }}>
                    Pagamento em atraso
                  </p>
                  <p className="text-[11px] opacity-60 mt-2">
                    Regularize o pagamento para desbloquear o acesso da empresa.
                  </p>
                </div>
              ) : assinatura.trialUsado ? (
                <div className="p-4 rounded-xl border-2 border-dashed" style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--status-cancelled)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1 flex items-center gap-1">
                    <Ban size={12} /> Degustação utilizada
                  </p>
                  <p className="text-sm font-bold" style={{ color: 'var(--status-cancelled)' }}>
                    {STATUS_PAGAMENTO_LABEL[assinatura.statusPagamento] || assinatura.statusPagamento}
                  </p>
                  <p className="text-[11px] opacity-60 mt-2">
                    Você já utilizou seu período de teste. O pagamento é necessário para usar o sistema.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl border-2 border-dashed" style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--status-cancelled)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1 flex items-center gap-1">
                    <Ban size={12} /> Assinatura
                  </p>
                  <p className="text-sm font-bold" style={{ color: 'var(--status-cancelled)' }}>
                    {STATUS_PAGAMENTO_LABEL[assinatura.statusPagamento] || assinatura.statusPagamento}
                  </p>
                  <p className="text-[11px] opacity-60 mt-2">
                    Sua assinatura não está ativa no momento.
                  </p>
                </div>
              )}
            </div>

            {assinatura.assinaturaId && (
              <p className="text-[10px] opacity-40 font-mono mt-4">
                Assinatura: {assinatura.assinaturaId}
                {!assinatura.assinaturaAsaas && ' (ambiente de desenvolvimento)'}
              </p>
            )}
          </section>
        )}

        {/* Dados da empresa */}
        <section
          className="rounded-3xl border p-6 sm:p-8"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold">Dados da empresa</h2>
              <p className="text-xs opacity-60">Nome, CNPJ, setores e logo</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditando((v) => !v)
                if (!editando && empresa) {
                  setEditForm({ nome: empresa.nome, cnpj: empresa.cnpj, setores: (empresa.setores || []).join(', ') })
                  setEditLogoPreview(empresa.logoUrl || null)
                  setEditLogoFile(null)
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:brightness-110"
              style={{ backgroundColor: 'var(--surface-elevated)', color: 'var(--primary)' }}
            >
              {editando ? <X size={14} /> : <Sparkles size={14} />}
              {editando ? 'Cancelar' : 'Editar'}
            </button>
          </div>

          {editando ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Nome</label>
                <input
                  value={editForm.nome}
                  onChange={(e) => setEditForm((p) => ({ ...p, nome: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                  style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">CNPJ</label>
                <input
                  value={editForm.cnpj}
                  onChange={(e) => setEditForm((p) => ({ ...p, cnpj: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm font-mono"
                  style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Setores (separados por vírgula)</label>
                <input
                  value={editForm.setores}
                  onChange={(e) => setEditForm((p) => ({ ...p, setores: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                  style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Logo</label>
                <div className="flex items-center gap-3">
                  <div
                    onClick={() => editFileInputRef.current?.click()}
                    className="w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-all hover:brightness-110 overflow-hidden"
                    style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-subtle)' }}
                  >
                    {editLogoPreview ? (
                      <img src={editLogoPreview} alt="Logo" className="w-full h-full object-contain p-1" />
                    ) : (
                      <Image size={20} style={{ opacity: 0.4 }} />
                    )}
                  </div>
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setEditLogoFile(file)
                        setEditLogoPreview(URL.createObjectURL(file))
                      }
                    }}
                  />
                  {editLogoPreview && (
                    <button
                      type="button"
                      onClick={() => { setEditLogoFile(null); setEditLogoPreview(null) }}
                      className="text-xs"
                      style={{ color: 'var(--status-cancelled)' }}
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={salvarDados}
                disabled={savingDados}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white transition-all hover:brightness-110 disabled:opacity-50"
                style={{ backgroundColor: 'var(--status-completed)' }}
              >
                {savingDados ? <><Loader2 className="animate-spin" size={16} /> Salvando...</> : <><Check size={16} /> Salvar dados</>}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--surface-elevated)' }}>
                <p className="text-xs opacity-50 mb-1">Setores</p>
                <p>{empresa.setores?.length ? empresa.setores.join(', ') : '—'}</p>
              </div>
              <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--surface-elevated)' }}>
                <p className="text-xs opacity-50 mb-1">Módulos</p>
                <p>{empresa.modulos?.length || 0}</p>
              </div>
              <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--surface-elevated)' }}>
                <p className="text-xs opacity-50 mb-1">Bot</p>
                <p>{empresa.botPrompt ? 'Configurado' : 'Não configurado'}</p>
              </div>
            </div>
          )}
        </section>

        {/* Webhooks + token */}
        <section
          className="rounded-3xl border p-6 sm:p-8"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Link2 size={18} style={{ color: 'var(--primary)' }} />
            <h2 className="text-lg font-bold">Webhooks e Token</h2>
          </div>
          <p className="text-xs opacity-60 mb-5">
            Configure a API de WhatsApp (BYO) apontando para a rota do módulo contratado e use o token como autenticação do webhook.
          </p>

          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-2">URLs do webhook</p>
              {WEBHOOKS_POR_MODULO.filter((w) => (empresa.modulos || []).includes(w.modulo)).map((w) => {
                const url = `${window.location.origin}/api/${w.rota}`
                return (
                  <div key={w.rota} className="mb-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1">{w.label}</p>
                    <div
                      className="flex items-center gap-2 p-2.5 rounded-lg border font-mono text-xs"
                      style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-subtle)' }}
                    >
                      <span className="flex-1 truncate">{url}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(url)
                          toast.success('URL copiada!')
                        }}
                        className="p-1.5 rounded-md transition-all hover:brightness-110 flex-shrink-0"
                        style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
                        title="Copiar URL"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}
              {!empresa.modulos?.length && (
                <p className="text-xs" style={{ color: 'var(--status-waiting)' }}>
                  Sua empresa ainda não possui módulos ativos.
                </p>
              )}
            </div>

            <div className="border-t pt-4" style={{ borderColor: 'var(--border-subtle)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-2">Token do webhook (API Key)</p>
              {empresa.evolution_token ? (
                <>
                  <div
                    className="flex items-center gap-2 p-3 rounded-xl border font-mono text-xs break-all"
                    style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-subtle)' }}
                  >
                    <span className="flex-1 select-all">{empresa.evolution_token}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(empresa.evolution_token || '')
                        setKeyCopied(true)
                        setTimeout(() => setKeyCopied(false), 2000)
                      }}
                      className="p-2 rounded-lg transition-all hover:brightness-110 flex-shrink-0"
                      style={{ backgroundColor: keyCopied ? 'var(--status-completed)' : 'var(--primary)', color: '#fff' }}
                      title="Copiar"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                  {keyCopied && (
                    <p className="text-xs mt-1 text-center" style={{ color: 'var(--status-completed)' }}>
                      Copiado!
                    </p>
                  )}
                </>
              ) : (
                <p className="text-xs opacity-60 mb-2">Nenhum token gerado ainda.</p>
              )}
              <button
                type="button"
                onClick={regenerarToken}
                disabled={regeneratingKey}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:brightness-110 disabled:opacity-50"
                style={{ backgroundColor: 'var(--surface-elevated)', color: 'var(--foreground)' }}
              >
                <RotateCw size={14} className={regeneratingKey ? 'animate-spin' : ''} />
                {regeneratingKey ? 'Regenerando...' : empresa.evolution_token ? 'Regenerar Token' : 'Gerar Token'}
              </button>
            </div>
          </div>
        </section>

        {/* Provedor (BYO API) */}
        <section
          className="rounded-3xl border p-6 sm:p-8"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Key size={18} style={{ color: 'var(--primary)' }} />
            <h2 className="text-lg font-bold">Provedor de WhatsApp</h2>
          </div>
          <p className="text-xs opacity-60 mb-5">
            BYO API — use a sua própria API de WhatsApp para enviar mensagens do bot.
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider opacity-70">Provedor</label>
              <select
                value={currentProvider}
                onChange={(e) => setCurrentProvider(e.target.value)}
                className="w-full mt-1 px-3 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }}
              >
                <option value="EVOLUTION">Evolution API (self-hosted)</option>
                <option value="META">Meta Cloud API</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider opacity-70">URL da API</label>
              <input
                value={currentApiUrl}
                onChange={(e) => setCurrentApiUrl(e.target.value)}
                placeholder="https://evolution.minhaempresa.com.br"
                className="w-full mt-1 px-3 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-[var(--primary)] font-mono text-sm"
                style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }}
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider opacity-70">API Key de envio</label>
              <input
                value={currentApiKey}
                onChange={(e) => setCurrentApiKey(e.target.value)}
                placeholder="Chave de envio do provedor"
                className="w-full mt-1 px-3 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-[var(--primary)] font-mono text-sm"
                style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }}
              />
            </div>
            <button
              type="button"
              onClick={salvarApiConfig}
              disabled={savingApiConfig}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white transition-all hover:brightness-110 disabled:opacity-50"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {savingApiConfig ? <><Loader2 className="animate-spin" size={16} /> Salvando...</> : <><Save size={16} /> Salvar configuração</>}
            </button>
          </div>
        </section>

        {/* Bot */}
        <section
          className="rounded-3xl border p-6 sm:p-8"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={18} style={{ color: 'var(--primary)' }} />
            <h2 className="text-lg font-bold">Assistente Virtual</h2>
          </div>
          <p className="text-xs opacity-60 mb-5">
            Personalize o bot da sua empresa. Use a IA para gerar o prompt automaticamente.
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider opacity-70">Nome do assistente</label>
              <input
                type="text"
                placeholder="Hevelyn"
                value={botForm.botName}
                onChange={(e) => setBotForm((p) => ({ ...p, botName: e.target.value }))}
                className="w-full mt-1 px-3 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }}
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider opacity-70">Como se apresentar?</label>
              <textarea
                value={botForm.botPresentation}
                onChange={(e) => setBotForm((p) => ({ ...p, botPresentation: e.target.value }))}
                rows={2}
                className="w-full mt-1 px-3 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm resize-none"
                style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }}
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider opacity-70">Como atender?</label>
              <textarea
                value={botForm.botServiceDesc}
                onChange={(e) => setBotForm((p) => ({ ...p, botServiceDesc: e.target.value }))}
                rows={2}
                className="w-full mt-1 px-3 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm resize-none"
                style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }}
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider opacity-70">Como apresentar avisos?</label>
              <textarea
                value={botForm.botAvisosDesc}
                onChange={(e) => setBotForm((p) => ({ ...p, botAvisosDesc: e.target.value }))}
                rows={2}
                className="w-full mt-1 px-3 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm resize-none"
                style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }}
              />
            </div>

            <button
              type="button"
              onClick={gerarPrompt}
              disabled={gerandoPrompt}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white transition-all hover:brightness-110 disabled:opacity-50"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {gerandoPrompt ? <><Loader2 className="animate-spin" size={16} /> Gerando...</> : <><Sparkles size={16} /> Gerar Prompt com IA</>}
            </button>

            {botForm.botPrompt && (
              <div>
                <label className="text-xs font-bold uppercase tracking-wider opacity-70">Prompt gerado</label>
                <textarea
                  value={botForm.botPrompt}
                  onChange={(e) => setBotForm((p) => ({ ...p, botPrompt: e.target.value }))}
                  rows={4}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl border text-sm leading-relaxed outline-none focus:ring-2 focus:ring-[var(--status-completed)] resize-none"
                  style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--status-completed)', color: 'var(--foreground)' }}
                />
                <p className="text-xs opacity-50">Você pode editar o prompt manualmente se necessário.</p>
              </div>
            )}

            <button
              type="button"
              onClick={salvarBot}
              disabled={savingBot}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white transition-all hover:brightness-110 disabled:opacity-50"
              style={{ backgroundColor: 'var(--status-completed)' }}
            >
              {savingBot ? <><Loader2 className="animate-spin" size={16} /> Salvando...</> : <><Save size={16} /> Salvar configuração</>}
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}
