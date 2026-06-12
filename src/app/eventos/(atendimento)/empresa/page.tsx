'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Building2, Search, Pencil, Trash2, X, Check, Sparkles, Image, Loader2, Upload, Wrench, Headphones, CalendarCheck } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { ROLE } from '@prisma/client'
import { useHeader } from '../layout'
import toast from 'react-hot-toast'

interface Empresa {
  id: string
  nome: string
  cnpj: string
  setores: string[]
  modulos: string[]
  logoUrl?: string | null
  botName?: string | null
  botPresentation?: string | null
  botServiceDesc?: string | null
  botAvisosDesc?: string | null
  botPrompt?: string | null
}

const MODULOS_OPCOES = [
  { valor: 'CORPORATIVO', label: 'Corporativo', icon: Headphones, cor: 'var(--status-new)' },
  { valor: 'OFICINA', label: 'Operacional', icon: Wrench, cor: 'var(--status-in-progress)' },
  { valor: 'EVENTOS', label: 'Eventos', icon: CalendarCheck, cor: 'var(--status-waiting)' },
]

export default function EmpresaPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ nome: '', cnpj: '', setores: '', modulos: [] as string[] })
  const [editLogoFile, setEditLogoFile] = useState<File | null>(null)
  const [editLogoPreview, setEditLogoPreview] = useState<string | null>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)

  const [botConfigId, setBotConfigId] = useState<string | null>(null)
  const [botForm, setBotForm] = useState({
    botName: '',
    botPresentation: '',
    botServiceDesc: '',
    botAvisosDesc: '',
    botPrompt: '',
  })
  const [gerandoPrompt, setGerandoPrompt] = useState(false)

  const { setHeader } = useHeader()

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
      titulo: 'Empresas',
      descricao: 'Gerencie e visualize todas as empresas parceiras do sistema'
    })
  }, [setHeader])

  async function fetchEmpresas() {
    try {
      const res = await fetch('/api/empresa')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setEmpresas(data)
    } catch (error) {
      console.error('Erro ao buscar empresas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmpresas()
  }, [])

  function startEdit(emp: Empresa) {
    setEditingId(emp.id)
    setEditForm({
      nome: emp.nome,
      cnpj: emp.cnpj,
      setores: emp.setores.join(', '),
      modulos: emp.modulos || [],
    })
    setEditLogoFile(null)
    setEditLogoPreview(emp.logoUrl || null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm({ nome: '', cnpj: '', setores: '', modulos: [] })
    setEditLogoFile(null)
    setEditLogoPreview(null)
  }

  async function saveEdit(id: string) {
    try {
      let finalLogoUrl = editLogoPreview

      if (editLogoFile) {
        const formData = new FormData()
        formData.append('file', editLogoFile)
        formData.append('bucket', 'logo')
        formData.append('folder', 'empresas')

        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          finalLogoUrl = uploadData.url || editLogoPreview
        } else {
          const errData = await uploadRes.json().catch(() => ({}))
          toast.error(errData.error || 'Erro ao fazer upload da logo')
          return
        }
      }

      const res = await fetch(`/api/empresa?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: editForm.nome,
          cnpj: editForm.cnpj.replace(/\D/g, ''),
          setores: editForm.setores.split(',').map(s => s.trim()).filter(Boolean),
          modulos: editForm.modulos,
          logoUrl: finalLogoUrl || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Erro ao atualizar')
        return
      }

      toast.success('Empresa atualizada com sucesso')
      cancelEdit()
      fetchEmpresas()
    } catch {
      toast.error('Erro ao conectar com o servidor')
    }
  }

  async function handleDelete(id: string, nome: string) {
    if (!confirm(`Tem certeza que deseja excluir a empresa "${nome}"?\n\nEsta ação não pode ser desfeita.`)) return

    try {
      const res = await fetch(`/api/empresa?id=${id}`, { method: 'DELETE' })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Erro ao excluir')
        return
      }

      toast.success('Empresa excluída com sucesso')
      fetchEmpresas()
    } catch {
      toast.error('Erro ao conectar com o servidor')
    }
  }

  function openBotConfig(emp: Empresa) {
    setBotConfigId(emp.id)
    setBotForm({
      botName: emp.botName || '',
      botPresentation: emp.botPresentation || '',
      botServiceDesc: emp.botServiceDesc || '',
      botAvisosDesc: emp.botAvisosDesc || '',
      botPrompt: emp.botPrompt || '',
    })
  }

  function closeBotConfig() {
    setBotConfigId(null)
    setBotForm({ botName: '', botPresentation: '', botServiceDesc: '', botAvisosDesc: '', botPrompt: '' })
  }

  async function handleGerarPrompt() {
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
          empresaId: botConfigId,
          botPresentation: botForm.botPresentation,
          botServiceDesc: botForm.botServiceDesc,
          botAvisosDesc: botForm.botAvisosDesc,
          botName: botForm.botName,
        }),
      })
      if (!res.ok) { toast.error('Erro ao gerar prompt'); return }
      const data = await res.json()
      setBotForm(p => ({ ...p, botPrompt: data.botPrompt }))
      toast.success('Prompt gerado!')
    } catch {
      toast.error('Erro ao gerar prompt')
    } finally {
      setGerandoPrompt(false)
    }
  }

  async function handleSaveBotConfig() {
    try {
      const res = await fetch('/api/empresa/prompt', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresaId: botConfigId,
          botName: botForm.botName,
          botPresentation: botForm.botPresentation,
          botServiceDesc: botForm.botServiceDesc,
          botAvisosDesc: botForm.botAvisosDesc,
          botPrompt: botForm.botPrompt,
        }),
      })
      if (!res.ok) { toast.error('Erro ao salvar'); return }
      toast.success('Configuração salva!')
      closeBotConfig()
      fetchEmpresas()
    } catch {
      toast.error('Erro ao conectar')
    }
  }

  async function handleClearBotConfig() {
    if (!confirm('Remover toda a configuração do bot desta empresa?')) return
    try {
      const res = await fetch(`/api/empresa/prompt?empresaId=${botConfigId}`, { method: 'DELETE' })
      if (!res.ok) { toast.error('Erro ao limpar'); return }
      toast.success('Configuração removida')
      setBotForm({ botName: '', botPresentation: '', botServiceDesc: '', botAvisosDesc: '', botPrompt: '' })
      fetchEmpresas()
    } catch {
      toast.error('Erro ao conectar')
    }
  }

  const filteredEmpresas = empresas.filter(emp =>
    emp.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.cnpj.includes(searchTerm)
  )

  return (
    <main
      className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 sm:py-10 transition-colors duration-300"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-8">
          <button
            onClick={() => router.push("/corporativo/empresa/create")}
            className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95"
            style={{ backgroundColor: "var(--primary)" }}
          >
            <Plus size={18} />
            Nova Empresa
          </button>
        </div>

        <div className="mb-8">
          <div
            className="relative rounded-lg border shadow-md transition-colors duration-300"
            style={{
              borderColor: "var(--border-subtle)",
              backgroundColor: "var(--surface)",
            }}
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: "var(--foreground)", opacity: 0.5 }} />
            <input
              type="text"
              placeholder="Buscar por nome ou CNPJ..."
              className="w-full pl-12 pr-4 py-3 rounded-lg outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
              style={{
                backgroundColor: "var(--surface)",
                color: "var(--foreground)",
                "--tw-ring-color": "var(--primary)",
              } as never}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {loading ? (
            <SkeletonLoader />
          ) : filteredEmpresas.length > 0 ? (
            filteredEmpresas.map((empresa) => (
              <div
                key={empresa.id}
                className="rounded-2xl border shadow-lg p-5 sm:p-6 transition-all duration-300 relative cursor-pointer hover:scale-[1.02]"
                style={{
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--border-subtle)",
                  cursor: 'default',
                }}
              >
                {editingId === empresa.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Nome</label>
                      <input
                        value={editForm.nome}
                        onChange={e => setEditForm(p => ({ ...p, nome: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border outline-none text-sm"
                        style={{
                          backgroundColor: "var(--surface-elevated)",
                          borderColor: "var(--border-subtle)",
                          color: "var(--foreground)",
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">CNPJ</label>
                      <input
                        value={editForm.cnpj}
                        onChange={e => setEditForm(p => ({ ...p, cnpj: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border outline-none text-sm font-mono"
                        style={{
                          backgroundColor: "var(--surface-elevated)",
                          borderColor: "var(--border-subtle)",
                          color: "var(--foreground)",
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Setores (separados por vírgula)</label>
                      <input
                        value={editForm.setores}
                        onChange={e => setEditForm(p => ({ ...p, setores: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border outline-none text-sm"
                        style={{
                          backgroundColor: "var(--surface-elevated)",
                          borderColor: "var(--border-subtle)",
                          color: "var(--foreground)",
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Módulos</label>
                      <div className="flex flex-wrap gap-2">
                        {MODULOS_OPCOES.map(mod => {
                          const selected = editForm.modulos.includes(mod.valor)
                          const Icon = mod.icon
                          return (
                            <button
                              key={mod.valor}
                              type="button"
                              onClick={() => {
                                setEditForm(p => ({
                                  ...p,
                                  modulos: selected
                                    ? p.modulos.filter(m => m !== mod.valor)
                                    : [...p.modulos, mod.valor],
                                }))
                              }}
                              className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-full transition-all`}
                              style={{
                                backgroundColor: selected ? mod.cor + '30' : "var(--surface-elevated)",
                                color: selected ? mod.cor : "var(--foreground)",
                                border: selected ? `1px solid ${mod.cor}` : '1px solid transparent',
                              }}
                            >
                              <Icon size={12} />
                              {mod.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Logo</label>
                      <div className="flex items-center gap-3">
                        <div
                          onClick={() => editFileInputRef.current?.click()}
                          className="w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-all hover:brightness-110 overflow-hidden"
                          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-subtle)" }}
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
                            style={{ color: "var(--status-cancelled)" }}
                          >
                            Remover
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => saveEdit(empresa.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-medium"
                        style={{ backgroundColor: "var(--status-completed)" }}
                      >
                        <Check size={14} /> Salvar
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{ backgroundColor: "var(--surface-elevated)", color: "var(--foreground)" }}
                      >
                        <X size={14} /> Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg" style={{ backgroundColor: "var(--primary)", color: "#fff" }}>
                          {empresa.logoUrl ? (
                            <img src={empresa.logoUrl} alt="" className="w-6 h-6 object-contain" />
                          ) : (
                            <Building2 size={24} />
                          )}
                        </div>
                        {empresa.botPrompt && (
                          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium"
                            style={{ backgroundColor: "var(--surface-elevated)", color: "var(--primary)" }}>
                            <Sparkles size={12} />
                            Bot configurado
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded"
                        style={{ backgroundColor: "var(--surface-elevated)", color: "var(--foreground)", opacity: 0.6 }}>
                        ID: {empresa.id.slice(0, 8)}
                      </span>
                    </div>

                    <h2 className="text-lg sm:text-xl font-bold mb-1 transition-colors duration-300" style={{ color: "var(--primary)" }}>
                      {empresa.nome}
                    </h2>
                    <p className="text-sm font-mono opacity-70 mb-4">{empresa.cnpj}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {empresa.setores?.map((setor, index) => (
                        <span key={index}
                          className="text-xs font-medium px-2.5 py-1 rounded-md"
                          style={{ backgroundColor: "var(--surface-elevated)", color: "var(--foreground)" }}>
                          {setor}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {empresa.modulos?.map(mod => {
                        const config = MODULOS_OPCOES.find(m => m.valor === mod)
                        if (!config) return null
                        const Icon = config.icon
                        return (
                          <span key={mod}
                            className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: config.cor + '20', color: config.cor }}>
                            <Icon size={12} />
                            {config.label}
                          </span>
                        )
                      })}
                    </div>

                    <div className="flex gap-2 pt-2 border-t flex-wrap" style={{ borderColor: "var(--border-subtle)" }}>
                      <button
                        onClick={() => router.push(`/corporativo/empresa/${empresa.id}/usuarios`)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                        style={{ color: "var(--foreground)", backgroundColor: "var(--surface-elevated)" }}
                      >
                        <Building2 size={14} /> Usuários
                      </button>
                      <button
                        onClick={() => startEdit(empresa)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                        style={{ color: "var(--primary)", backgroundColor: "var(--surface-elevated)" }}
                      >
                        <Pencil size={14} /> Editar
                      </button>
                      <button
                        onClick={() => openBotConfig(empresa)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                        style={{ color: "var(--foreground)", backgroundColor: "var(--surface-elevated)" }}
                      >
                        <Sparkles size={14} /> Bot
                      </button>
                      <button
                        onClick={() => handleDelete(empresa.id, empresa.nome)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                        style={{ color: "var(--status-cancelled)", backgroundColor: "var(--surface-elevated)" }}
                      >
                        <Trash2 size={14} /> Excluir
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <div
              className="col-span-full py-16 sm:py-20 text-center rounded-2xl border border-dashed"
              style={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--border-subtle)",
              }}
            >
              <p className="opacity-70">Nenhuma empresa encontrada.</p>
            </div>
          )}
        </div>
      </div>

      {botConfigId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={closeBotConfig}
        >
          <div
            className="rounded-2xl border shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border-subtle)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "var(--border-subtle)" }}>
              <div className="flex items-center gap-2">
                <Sparkles size={20} style={{ color: "var(--primary)" }} />
                <h3 className="font-bold text-lg">Configuração do Assistente Virtual</h3>
              </div>
              <button
                onClick={closeBotConfig}
                className="p-2 rounded-lg transition-colors hover:brightness-90"
                style={{ backgroundColor: "var(--surface-elevated)" }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider opacity-70">Nome do Assistente</label>
                <input
                  type="text"
                  placeholder="Hevelyn"
                  value={botForm.botName}
                  onChange={e => setBotForm(p => ({ ...p, botName: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider opacity-70">Como se apresentar?</label>
                <textarea
                  value={botForm.botPresentation}
                  onChange={e => setBotForm(p => ({ ...p, botPresentation: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none"
                  style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider opacity-70">Como atender?</label>
                <textarea
                  value={botForm.botServiceDesc}
                  onChange={e => setBotForm(p => ({ ...p, botServiceDesc: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none"
                  style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider opacity-70">Como apresentar avisos?</label>
                <textarea
                  value={botForm.botAvisosDesc}
                  onChange={e => setBotForm(p => ({ ...p, botAvisosDesc: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none"
                  style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }}
                />
              </div>

              <button
                onClick={handleGerarPrompt}
                disabled={gerandoPrompt}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white transition-all duration-200 hover:brightness-110 hover:shadow-lg active:scale-[0.98] disabled:opacity-50"
                style={{ backgroundColor: "var(--primary)" }}
              >
                {gerandoPrompt ? <><Loader2 className="animate-spin" size={16} /> Gerando...</> : <><Sparkles size={16} /> Gerar Prompt com IA</>}
              </button>

              {botForm.botPrompt && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider opacity-70">Prompt Gerado</label>
                  <textarea
                    value={botForm.botPrompt}
                    onChange={e => setBotForm(p => ({ ...p, botPrompt: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border text-sm leading-relaxed outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none"
                    style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--status-completed)", color: "var(--foreground)" }}
                  />
                  <p className="text-xs opacity-50">Você pode editar o prompt manualmente se necessário.</p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                <button
                  onClick={handleSaveBotConfig}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all hover:brightness-110"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  <Check size={18} /> Salvar Configuração
                </button>
                <button
                  onClick={handleClearBotConfig}
                  className="px-4 py-3 rounded-xl font-bold transition-all hover:brightness-90"
                  style={{ backgroundColor: "var(--surface-elevated)", color: "var(--status-cancelled)" }}
                >
                  Limpar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

function SkeletonLoader() {
  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-gray-200 animate-pulse h-48 rounded-2xl" />
      ))}
    </>
  )
}
