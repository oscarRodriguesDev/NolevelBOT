'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ROLE } from '@prisma/client'
import {
  Plus, Search, Pencil, Trash2, X, Check, Loader2, Save, KeyRound,
  Bot, Users, Boxes, Layers, Star, Eye, EyeOff, CalendarClock, Ban,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useHeader } from '../layout'

interface Plano {
  id: string
  slug: string
  nome: string
  preco: number
  descricao: string
  maxModulos: number
  maxUsuarios: number
  botIA: boolean
  canais: string[]
  modulosAutomaticos: string[]
  ativo: boolean
  destaque: boolean
  ordem: number
  extincaoEm?: string | null
  extincaoAvisadaEm?: string | null
}

const CANAIS_OPCOES = [
  { valor: 'app', label: 'App' },
  { valor: 'whatsapp', label: 'WhatsApp' },
  { valor: 'telegram', label: 'Telegram' },
]

const MODULOS_OPCOES = [
  { valor: 'CORPORATIVO', label: 'Corporativo' },
  { valor: 'OFICINA', label: 'Operacional' },
  { valor: 'COMERCIAL', label: 'Comercial' },
]

const vazio = {
  nome: '',
  slug: '',
  preco: '299.99',
  descricao: '',
  maxModulos: '1',
  maxUsuarios: '5',
  botIA: false,
  canais: ['app'] as string[],
  modulosAutomaticos: [] as string[],
  ativo: true,
  destaque: false,
  ordem: '1',
}

// CRUD de planos (GOD): criar, editar, destacar e solicitar extinção (30 dias)
export default function GodPlanosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { setHeader } = useHeader()

  const [planos, setPlanos] = useState<Plano[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...vazio })

  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    const role = session?.user?.role as ROLE | undefined
    if (role !== 'GOD') {
      router.replace('/dashboard')
      return
    }
  }, [status, session, router])

  useEffect(() => {
    setHeader({
      titulo: 'Planos',
      descricao: 'Crie, edite e gerencie os planos de assinatura da plataforma',
    })
  }, [setHeader])

  async function carregarPlanos() {
    try {
      const res = await fetch('/api/planos?todos=true')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setPlanos(data || [])
    } catch (err) {
      console.error('Erro ao buscar planos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarPlanos()
  }, [])

  function abrirCriar() {
    setEditandoId('novo')
    setForm({ ...vazio })
  }

  function abrirEditar(p: Plano) {
    setEditandoId(p.id)
    setForm({
      nome: p.nome,
      slug: p.slug,
      preco: String(p.preco),
      descricao: p.descricao || '',
      maxModulos: String(p.maxModulos),
      maxUsuarios: String(p.maxUsuarios),
      botIA: p.botIA,
      canais: [...p.canais],
      modulosAutomaticos: [...p.modulosAutomaticos],
      ativo: p.ativo,
      destaque: p.destaque,
      ordem: String(p.ordem),
    })
  }

  function fecharForm() {
    setEditandoId(null)
    setForm({ ...vazio })
  }

  function toggleCanal(c: string) {
    setForm((prev) => {
      const tem = prev.canais.includes(c)
      const canais = tem ? prev.canais.filter((x) => x !== c) : [...prev.canais, c]
      if (canais.length === 0) return prev
      return { ...prev, canais }
    })
  }

  function toggleModulo(m: string) {
    setForm((prev) => {
      const tem = prev.modulosAutomaticos.includes(m)
      return {
        ...prev,
        modulosAutomaticos: tem
          ? prev.modulosAutomaticos.filter((x) => x !== m)
          : [...prev.modulosAutomaticos, m],
      }
    })
  }

  async function salvar() {
    if (!form.nome || !form.slug) {
      toast.error('Nome e slug são obrigatórios')
      return
    }
    setSalvando(true)
    try {
      const payload = {
        nome: form.nome,
        slug: form.slug,
        preco: Number(form.preco.replace(',', '.')),
        descricao: form.descricao,
        maxModulos: Number(form.maxModulos) || -1,
        maxUsuarios: Number(form.maxUsuarios) || 5,
        botIA: form.botIA,
        canais: form.canais,
        modulosAutomaticos: form.modulosAutomaticos,
        ativo: form.ativo,
        destaque: form.destaque,
        ordem: Number(form.ordem) || 0,
      }

      const isNovo = editandoId === 'novo'
      const res = await fetch(
        isNovo ? '/api/planos' : `/api/planos?id=${editandoId}`,
        {
          method: isNovo ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error || 'Erro ao salvar plano')
        return
      }
      toast.success(isNovo ? 'Plano criado!' : 'Plano atualizado!')
      fecharForm()
      carregarPlanos()
    } catch (err) {
      toast.error('Erro ao conectar com o servidor')
    } finally {
      setSalvando(false)
    }
  }

  async function handleDestaque(p: Plano) {
    try {
      const res = await fetch(`/api/planos?id=${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destaque: !p.destaque }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Erro ao atualizar')
        return
      }
      toast.success(p.destaque ? 'Destaque removido' : 'Plano definido como Recomendado')
      carregarPlanos()
    } catch {
      toast.error('Erro ao conectar')
    }
  }

  async function handleExtinguir(p: Plano) {
    const confirmado = confirm(
      `Solicitar a extinção do plano "${p.nome}"?\n\n` +
      `• Todas as empresas com este plano serão notificadas via aviso.\n` +
      `• A exclusão efetiva ocorrerá em 30 dias.\n` +
      `• As empresas serão migradas para o plano mais vantajoso, sem aumento de custo.\n\n` +
      `Deseja continuar?`
    )
    if (!confirmado) return

    try {
      const res = await fetch(`/api/planos?id=${p.id}&action=extinguir`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error || 'Erro ao solicitar extinção')
        return
      }
      toast.success(data.message || 'Extinção agendada!')
      carregarPlanos()
    } catch {
      toast.error('Erro ao conectar')
    }
  }

  async function handleCancelarExtincao(p: Plano) {
    if (!confirm(`Cancelar a extinção do plano "${p.nome}"?`)) return
    try {
      const res = await fetch(`/api/planos?id=${p.id}&action=cancelar_extincao`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error || 'Erro ao cancelar')
        return
      }
      toast.success(data.message || 'Extinção cancelada!')
      carregarPlanos()
    } catch {
      toast.error('Erro ao conectar')
    }
  }

  const filtrados = planos.filter((p) =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  function formatarData(d?: string | null) {
    if (!d) return ''
    return new Date(d).toLocaleDateString('pt-BR')
  }

  return (
    <main
      className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 sm:py-10 transition-colors duration-300"
      style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <button
            onClick={abrirCriar}
            className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Plus size={18} />
            Novo Plano
          </button>
        </div>

        <div className="mb-8">
          <div
            className="relative rounded-lg border shadow-md transition-colors duration-300"
            style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--surface)' }}
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--foreground)', opacity: 0.5 }} />
            <input
              type="text"
              placeholder="Buscar por nome ou slug..."
              className="w-full pl-12 pr-4 py-3 rounded-lg outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
              style={{
                backgroundColor: 'var(--surface)',
                color: 'var(--foreground)',
                '--tw-ring-color': 'var(--primary)',
              } as never}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin" size={32} style={{ color: 'var(--primary)' }} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {filtrados.map((plano) => (
              <div
                key={plano.id}
                className="rounded-2xl border shadow-lg p-5 sm:p-6 transition-all duration-300"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: plano.destaque ? 'var(--primary)' : 'var(--border-subtle)',
                }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold" style={{ color: 'var(--primary)' }}>
                      {plano.nome}
                    </h2>
                    {plano.destaque && (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: 'var(--primary)' }}>
                        <Star size={10} /> Recomendado
                      </span>
                    )}
                    {plano.extincaoEm && (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: 'var(--status-cancelled)', color: '#fff' }}>
                        <CalendarClock size={10} /> Extinção {formatarData(plano.extincaoEm)}
                      </span>
                    )}
                    {!plano.ativo && !plano.extincaoEm && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: 'var(--surface-elevated)', color: 'var(--foreground)', opacity: 0.6 }}>
                        Inativo
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono opacity-50">/{plano.slug}</span>
                </div>

                <p className="text-sm opacity-60 mb-4 line-clamp-2">{plano.descricao || 'Sem descrição'}</p>

                <div className="flex items-end gap-1 mb-4">
                  <span className="text-2xl font-black">R$ {plano.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  <span className="text-xs opacity-50 mb-1">/mês</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                  <div className="p-2.5 rounded-lg flex items-center gap-2" style={{ backgroundColor: 'var(--surface-elevated)' }}>
                    <Boxes size={13} style={{ color: 'var(--primary)' }} />
                    {plano.maxModulos === -1 ? 'Módulos: todos' : `${plano.maxModulos} módulo(s)`}
                  </div>
                  <div className="p-2.5 rounded-lg flex items-center gap-2" style={{ backgroundColor: 'var(--surface-elevated)' }}>
                    <Users size={13} style={{ color: 'var(--primary)' }} />
                    {plano.maxUsuarios === -1 ? 'Usuários: ∞' : `${plano.maxUsuarios} usuários`}
                  </div>
                  <div className="p-2.5 rounded-lg flex items-center gap-2" style={{ backgroundColor: 'var(--surface-elevated)' }}>
                    <Bot size={13} style={{ color: 'var(--primary)' }} />
                    {plano.botIA ? 'Bot com IA' : 'Bot script'}
                  </div>
                  <div className="p-2.5 rounded-lg flex items-center gap-2" style={{ backgroundColor: 'var(--surface-elevated)' }}>
                    <Layers size={13} style={{ color: 'var(--primary)' }} />
                    {plano.canais.length ? plano.canais.map((c) => c[0].toUpperCase()).join(' / ') : '—'}
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t flex-wrap" style={{ borderColor: 'var(--border-subtle)' }}>
                  <button
                    onClick={() => abrirEditar(plano)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                    style={{ color: 'var(--primary)', backgroundColor: 'var(--surface-elevated)' }}
                  >
                    <Pencil size={14} /> Editar
                  </button>
                  <button
                    onClick={() => handleDestaque(plano)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                    style={{ color: 'var(--foreground)', backgroundColor: 'var(--surface-elevated)' }}
                  >
                    <Star size={14} /> {plano.destaque ? 'Remover destaque' : 'Destacar'}
                  </button>
                  {plano.extincaoEm ? (
                    <button
                      onClick={() => handleCancelarExtincao(plano)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                      style={{ color: 'var(--status-completed)', backgroundColor: 'var(--surface-elevated)' }}
                    >
                      <Ban size={14} /> Cancelar extinção
                    </button>
                  ) : (
                    <button
                      onClick={() => handleExtinguir(plano)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                      style={{ color: 'var(--status-cancelled)', backgroundColor: 'var(--surface-elevated)' }}
                    >
                      <Trash2 size={14} /> Extinguir
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal criar/editar */}
      {editandoId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={fecharForm}
        >
          <div
            className="rounded-2xl border shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-subtle)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="border-b p-6 flex items-center justify-between shrink-0"
              style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--primary)', color: '#fff' }}>
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{editandoId === 'novo' ? 'Novo Plano' : 'Editar Plano'}</h3>
                  <p className="text-xs opacity-50">Defina valores, limites e recursos do plano</p>
                </div>
              </div>
              <button
                onClick={fecharForm}
                className="p-2 rounded-lg transition-colors hover:brightness-90"
                style={{ backgroundColor: 'var(--surface)' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Nome</label>
                  <input
                    value={form.nome}
                    onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
                    placeholder="Ex: Start"
                    className="w-full px-3 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                    style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Slug</label>
                  <input
                    value={form.slug}
                    onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                    placeholder="start"
                    className="w-full px-3 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm font-mono"
                    style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Descrição</label>
                <textarea
                  value={form.descricao}
                  onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))}
                  rows={2}
                  placeholder="Descreva o público e o propósito do plano"
                  className="w-full px-3 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm resize-none"
                  style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Preço (R$)</label>
                  <input
                    value={form.preco}
                    onChange={(e) => setForm((p) => ({ ...p, preco: e.target.value }))}
                    placeholder="299.99"
                    className="w-full px-3 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm font-mono"
                    style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Máx. módulos (-1 = todos)</label>
                  <input
                    value={form.maxModulos}
                    onChange={(e) => setForm((p) => ({ ...p, maxModulos: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm font-mono"
                    style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Máx. usuários</label>
                  <input
                    value={form.maxUsuarios}
                    onChange={(e) => setForm((p) => ({ ...p, maxUsuarios: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm font-mono"
                    style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Ordem de exibição</label>
                  <input
                    value={form.ordem}
                    onChange={(e) => setForm((p) => ({ ...p, ordem: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm font-mono"
                    style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Canais disponíveis</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {CANAIS_OPCOES.map((c) => {
                      const ativo = form.canais.includes(c.valor)
                      return (
                        <button
                          key={c.valor}
                          type="button"
                          onClick={() => toggleCanal(c.valor)}
                          className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-full transition-all"
                          style={{
                            backgroundColor: ativo ? 'var(--primary)' : 'var(--surface-elevated)',
                            color: ativo ? '#fff' : 'var(--foreground)',
                            border: `1px solid ${ativo ? 'var(--primary)' : 'var(--border-subtle)'}`,
                          }}
                        >
                          {c.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-1">
                  Módulos automáticos (vazio = cliente escolhe)
                </label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {MODULOS_OPCOES.map((m) => {
                    const ativo = form.modulosAutomaticos.includes(m.valor)
                    return (
                      <button
                        key={m.valor}
                        type="button"
                        onClick={() => toggleModulo(m.valor)}
                        className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-full transition-all"
                        style={{
                          backgroundColor: ativo ? 'var(--status-completed)' : 'var(--surface-elevated)',
                          color: ativo ? '#fff' : 'var(--foreground)',
                          border: `1px solid ${ativo ? 'var(--status-completed)' : 'var(--border-subtle)'}`,
                        }}
                      >
                        {m.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 p-3 rounded-xl border cursor-pointer text-sm"
                  style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-subtle)' }}>
                  <input
                    type="checkbox"
                    checked={form.botIA}
                    onChange={(e) => setForm((p) => ({ ...p, botIA: e.target.checked }))}
                  />
                  <Bot size={14} style={{ color: 'var(--primary)' }} />
                  Bot com IA
                </label>
                <label className="flex items-center gap-2 p-3 rounded-xl border cursor-pointer text-sm"
                  style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-subtle)' }}>
                  <input
                    type="checkbox"
                    checked={form.ativo}
                    onChange={(e) => setForm((p) => ({ ...p, ativo: e.target.checked }))}
                  />
                  <Eye size={14} style={{ color: 'var(--primary)' }} />
                  Plano ativo (vendável)
                </label>
                <label className="flex items-center gap-2 p-3 rounded-xl border cursor-pointer text-sm"
                  style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-subtle)' }}>
                  <input
                    type="checkbox"
                    checked={form.destaque}
                    onChange={(e) => setForm((p) => ({ ...p, destaque: e.target.checked }))}
                  />
                  <Star size={14} style={{ color: 'var(--primary)' }} />
                  Destaque "Recomendado"
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <button
                  onClick={salvar}
                  disabled={salvando}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all hover:brightness-110 disabled:opacity-50"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  {salvando ? <><Loader2 className="animate-spin" size={16} /> Salvando...</> : <><Save size={16} /> Salvar Plano</>}
                </button>
                <button
                  onClick={fecharForm}
                  className="px-4 py-3 rounded-xl font-bold transition-all hover:brightness-90"
                  style={{ backgroundColor: 'var(--surface-elevated)', color: 'var(--foreground)' }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
