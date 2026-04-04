"use client"

import { useEffect, useState } from "react"
import { useHeader } from "../layout"
import { FaTrash } from "react-icons/fa"

export default function CadastroCPFs() {
  const [nome, setNome] = useState("")
  const [cpf, setCpf] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [cpfs, setCpfs] = useState<{ id: string; nome: string; cpf: string }[]>([])
  const { setHeader } = useHeader()


//use efect para buscar os cpfs cadastrados
  useEffect(() => {
    async function fetchCpfs() {
      try {
        const res = await fetch("/api/cpfs")
        const data = await res.json()
        setCpfs(data)
      } catch (error) {
        console.error("Erro ao buscar CPFs")
      }
    }

    fetchCpfs()
  }, [])



  //deleta cpf selecionado
  async function handleDelete(cpf: string) {
    try {
      const res = await fetch("/api/cpfs", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cpf }),
      })

      const data = await res.json()

      //busca de cpss atualizada após modificação
      try {
        const res2 = await fetch("/api/cpfs")
        const data = await res2.json()
        setCpfs(data)
      } catch (error) {
        console.error("Erro ao buscar CPFs")
      }
    
    

      if (!res.ok) {
        alert(data.error || "Erro ao deletar")
        return
      }

      setCpfs(prev => prev.filter(item => item.cpf !== cpf))
      alert("CPF deletado com sucesso")
    } catch (error) {
      alert("Erro ao deletar CPF")
    }
  }


 
//apresentação do header
  useEffect(() => {
    setHeader({
      titulo: 'Cadastro de CPFS',
      descricao: 'Gerencie e importe CPFs autorizados'
    })
  }, [])


//cadastro manual de cpf
  async function cadastrarManual(e: React.FormEvent) {
    e.preventDefault()

    try {
      const res = await fetch("/api/cpfs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, cpf })
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || "Erro ao cadastrar")
        return
      }
       

      //busca de cpss atualizada após modificação
      try {
        const res2 = await fetch("/api/cpfs")
        const data = await res2.json()
        setCpfs(data)
      } catch (error) {
        console.error("Erro ao buscar CPFs")
      }

      alert("CPF cadastrado com sucesso")

      setNome("")
      setCpf("")
    } catch {
      alert("Erro ao conectar com o servidor")
    }
  }



//cadastro em lote de cpfs via arquivo
  async function enviarArquivo(e: React.FormEvent) {
    e.preventDefault()

    if (!file) {
      alert("Selecione um arquivo")
      return
    }

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/cpfs", {
        method: "POST",
        body: formData
      })

      const data = await res.json()


      //busca de cpss atualizada após modificação
      try {
        const res2 = await fetch("/api/cpfs")
        const data = await res2.json()
        setCpfs(data)
      } catch (error) {
        console.error("Erro ao buscar CPFs")
      }


      if (!res.ok) {
        alert(data.error || "Erro ao importar")
        return
      }

      alert(`Arquivo importado com sucesso (${data.inseridos ?? 0} registros)`)

      setFile(null)
    } catch {
      alert("Erro ao conectar com o servidor")
    }
  }



  return (
    <div
      className="flex items-start justify-center gap-8 px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-300"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >

      {/* cadastro de cpfs */}
      <div
        className="w-full max-w-lg p-6 sm:p-8 rounded-2xl shadow-lg space-y-8 border transition-colors duration-300"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <form onSubmit={cadastrarManual} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nome</label>
            <input
              placeholder="Nome completo"
              value={nome}
              onChange={e => setNome(e.target.value)}
              className="w-full p-3 rounded-lg border outline-none transition-colors duration-300"
              style={{
                backgroundColor: "var(--surface-elevated)",
                borderColor: "var(--border-subtle)",
                color: "var(--foreground)",
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">CPF</label>
            <input
              placeholder="000.000.000-00"
              value={cpf}
              onChange={e => setCpf(e.target.value)}
              className="w-full p-3 rounded-lg border outline-none transition-colors duration-300"
              style={{
                backgroundColor: "var(--surface-elevated)",
                borderColor: "var(--border-subtle)",
                color: "var(--foreground)",
              }}
            />
          </div>
          <button
            type="submit"
            className="w-full text-white py-3 rounded transition-all duration-300 hover:scale-105 active:scale-95 font-medium"
            style={{
              backgroundColor: "var(--primary)",
            }}
            onMouseEnter={e => {
              if (e.target instanceof HTMLElement) {
                e.target.style.backgroundColor = "var(--primary-hover)";
              }
            }}
            onMouseLeave={e => {
              if (e.target instanceof HTMLElement) {
                e.target.style.backgroundColor = "var(--primary)";
              }
            }}
          >
            Cadastrar
          </button>
        </form>

        <div className="border-t pt-6" style={{ borderColor: "var(--border-subtle)" }}>
          <h3 className="text-lg font-semibold mb-4">Ou importe em lote</h3>
          <form onSubmit={enviarArquivo} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Arquivo
              </label>

              <label className="flex items-center justify-between gap-4 w-full px-4 py-3 rounded-lg border transition-all cursor-pointer hover:opacity-80"
                style={{
                  borderColor: "var(--border-subtle)",
                  backgroundColor: "var(--surface-elevated)",
                }}>
                <span className="text-sm truncate flex-1">
                  {file ? file.name : "Selecione um arquivo (.csv, .txt, .xlsx)"}
                </span>

                <span className="px-3 py-1 text-xs font-medium rounded text-white flex-shrink-0"
                  style={{ backgroundColor: "var(--primary)" }}>
                  Escolher
                </span>

                <input
                  type="file"
                  accept=".csv,.txt,.xlsx"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>

              <p className="mt-2 text-xs opacity-60">
                Formatos aceitos: CSV, TXT ou XLSX
              </p>
            </div>

            <button
              type="submit"
              className="w-full text-white py-3 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 font-medium"
              style={{
                backgroundColor: "var(--status-completed)",
              }}
              onMouseEnter={e => {
                if (e.target instanceof HTMLElement) {
                  e.target.style.opacity = "0.8";
                }
              }}
              onMouseLeave={e => {
                if (e.target instanceof HTMLElement) {
                  e.target.style.opacity = "1";
                }
              }}
            >
              Importar Arquivo
            </button>
          </form>
        </div>
      </div>


      {/* cpfs cadastrados */}
      <div
        className="w-full max-w-md p-6 rounded-2xl shadow-lg border"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <h3 className="text-lg font-semibold mb-4">CPFs cadastrados</h3>

        <input
          placeholder="Buscar por CPF"
          onChange={(e) => {
            const value = e.target.value
            setCpfs(prev =>
              prev.filter(item =>
                item.cpf.toLowerCase().includes(value.toLowerCase())
              )
            )
          }}
          className="w-full p-2 mb-4 rounded-lg border outline-none"
          style={{
            backgroundColor: "var(--surface-elevated)",
            borderColor: "var(--border-subtle)",
            color: "var(--foreground)",
          }}
        />

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {cpfs.map(item => (
            <div
              key={item.id}
              className="p-3 rounded-lg border flex justify-between items-start"
              style={{
                borderColor: "var(--border-subtle)",
                backgroundColor: "var(--surface-elevated)",
              }}
            >
              <div>
                <p className="text-sm font-medium">{item.nome}</p>
                <p className="text-xs opacity-70">{item.cpf}</p>
              </div>

              <span className="text-xs cursor-pointer"><FaTrash onClick={() => handleDelete(item.cpf)} /></span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
