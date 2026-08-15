import { NextResponse } from "next/server"
import { getServerSessionRBAC } from "@/lib/rbac-server"
import {
  getAsaasBaseUrl,
  getAsaasModo,
  isAsaasConfigured,
  mascararChave,
} from "@/lib/asaas"

// Diagnóstico da integração Asaas (ADMIN/GOD).
// Confirma se o fluxo está em mock, sandbox ou produção e testa a API real.
export async function GET() {
  const { session, error } = await getServerSessionRBAC(["ADMIN", "GOD"])
  if (error) return error

  const modo = getAsaasModo()
  const baseUrl = getAsaasBaseUrl()

  // Testa a API real (apenas quando configurado) com uma chamada inofensiva
  let teste: { ok: boolean; detalhe?: string } = { ok: false, detalhe: "Não configurado" }
  if (isAsaasConfigured()) {
    try {
      const res = await fetch(`${baseUrl}/customers?limit=1`, {
        headers: { access_token: process.env.ASAAS_API_KEY || "" },
        cache: "no-store",
      })
      if (res.ok) {
        teste = { ok: true }
      } else {
        const texto = await res.text().catch(() => "")
        teste = { ok: false, detalhe: `HTTP ${res.status}: ${texto.slice(0, 200)}` }
      }
    } catch (e: any) {
      teste = { ok: false, detalhe: e?.message || "Falha de rede" }
    }
  }

  return NextResponse.json({
    modo, // "mock" | "sandbox" | "producao"
    configurado: isAsaasConfigured(),
    baseUrl,
    chave: mascararChave(),
    webhookToken: Boolean(
      process.env.ASAAS_WEBHOOK_TOKEN || process.env.ASAAS_TOKEN_WEBHOOK
    ),
    testeApi: teste,
  })
}
