"use client"

export default function LeadForm() {

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    alert(baseUrl)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)

    const data = {
      nome: formData.get("nome"),
      cpf: formData.get("cpf"),
      telefone: formData.get("telefone"),
      empresa: formData.get("empresa"),
    }

    try {
      const response = await fetch(`${baseUrl}/api/leads-network`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Erro ao enviar lead")
      }

      const numeroWhatsapp = "5527998982410"

      const mensagem = encodeURIComponent(
        `Olá, meu nome é ${data.nome}. Acabei de realizar meu cadastro e gostaria de conversar com o bot.\n\nCPF: ${data.cpf}\nTelefone: ${data.telefone}\nEmpresa: ${data.empresa || "Não informado"}`
      )

      window.location.href = `https://wa.me/${numeroWhatsapp}?text=${mensagem}`
    } catch (error) {
      alert("Erro ao enviar formulário")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-6">
      <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Fale com nosso bot</h1>

        <p className="text-sm text-[var(--foreground)]/70 mb-6">
          Preencha os dados abaixo para iniciar o atendimento.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nome</label>
            <input
              type="text"
              name="nome"
              required
              className="w-full mt-1 bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[var(--foreground)] rounded-xl px-4 py-3 outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div>
            <label className="text-sm font-medium">CPF</label>
            <input
              type="text"
              name="cpf"
              required
              className="w-full mt-1 bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[var(--foreground)] rounded-xl px-4 py-3 outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Telefone</label>
            <input
              type="text"
              name="telefone"
              required
              className="w-full mt-1 bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[var(--foreground)] rounded-xl px-4 py-3 outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Empresa</label>
            <input
              type="text"
              name="empresa"
              className="w-full mt-1 bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[var(--foreground)] rounded-xl px-4 py-3 outline-none focus:border-[var(--primary)]"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-xl py-3 font-medium transition-colors"
          >
            Conversar no WhatsApp
          </button>
        </form>
      </div>
    </div>
  )
}
