import { describe, it, expect } from "vitest"
import {
  Plano,
  planoDaLinha,
  getModulosDisponiveis,
  validarModulos,
  dentroDoLimiteDeUsuarios,
  gerarEmailAdmin,
  gerarSlug,
} from "@/lib/planos"

function fazPlano(over: Partial<Plano> = {}): Plano {
  return {
    id: "1",
    slug: "start",
    nome: "Start",
    preco: 299.99,
    descricao: "",
    maxModulos: 1,
    maxUsuarios: 5,
    botIA: false,
    canais: ["app", "whatsapp"],
    modulosAutomaticos: [],
    ativo: true,
    destaque: false,
    ordem: 1,
    ...over,
  }
}

describe("PLANOS (SaaS dinâmico)", () => {
  it("planoDaLinha normaliza linha do banco em objeto Plano", () => {
    const p = planoDaLinha({
      id: "abc",
      slug: "pro",
      nome: "Profissional",
      preco: "699.99",
      descricao: "Para equipes",
      maxModulos: -1,
      maxUsuarios: -1,
      botIA: true,
      canais: ["app", "whatsapp", "telegram"],
      modulosAutomaticos: ["CORPORATIVO"],
      ativo: true,
      destaque: true,
      ordem: 2,
      extincaoEm: null,
      extincaoAvisadaEm: null,
    })
    expect(p.slug).toBe("pro")
    expect(p.preco).toBe(699.99)
    expect(p.maxModulos).toBe(-1)
    expect(p.maxUsuarios).toBe(-1)
    expect(p.botIA).toBe(true)
    expect(p.destaque).toBe(true)
    expect(p.modulosAutomaticos).toContain("CORPORATIVO")
  })

  it("getModulosDisponiveis libera todos os modulos do sistema", () => {
    const todos = getModulosDisponiveis(fazPlano())
    expect(todos).toEqual(expect.arrayContaining(["CORPORATIVO", "OFICINA", "COMERCIAL"]))
  })

  it("Start aceita no maximo 1 modulo", () => {
    const start = fazPlano({ nome: "Start", maxModulos: 1 })
    expect(validarModulos(start, ["CORPORATIVO"]).ok).toBe(true)
    const r = validarModulos(start, ["CORPORATIVO", "OFICINA"])
    expect(r.ok).toBe(false)
    expect(r.error).toContain("máximo 1")
    expect(validarModulos(start, []).ok).toBe(false)
  })

  it("Profissional aceita no maximo 2 modulos", () => {
    const pro = fazPlano({ nome: "Profissional", maxModulos: 2 })
    expect(validarModulos(pro, ["CORPORATIVO", "OFICINA"]).ok).toBe(true)
    const r = validarModulos(pro, ["CORPORATIVO", "OFICINA", "COMERCIAL"])
    expect(r.ok).toBe(false)
  })

  it("plano com maxModulos -1 ou modulosAutomaticos libera todos", () => {
    const ilimitado = fazPlano({ maxModulos: -1 })
    expect(validarModulos(ilimitado, ["CORPORATIVO", "OFICINA", "COMERCIAL"]).ok).toBe(true)

    const automatico = fazPlano({ maxModulos: 1, modulosAutomaticos: ["CORPORATIVO"] })
    const r = validarModulos(automatico, ["CORPORATIVO", "OFICINA", "COMERCIAL"])
    expect(r.ok).toBe(true)
    expect(r.modulos).toEqual(expect.arrayContaining(["CORPORATIVO", "OFICINA", "COMERCIAL"]))
  })

  it("valida limite de usuarios por plano (-1 = ilimitado)", () => {
    const start = fazPlano({ nome: "Start", maxUsuarios: 5 })
    expect(dentroDoLimiteDeUsuarios(start, 5).ok).toBe(false)
    expect(dentroDoLimiteDeUsuarios(start, 4).ok).toBe(true)

    const pro = fazPlano({ nome: "Profissional", maxUsuarios: 15 })
    expect(dentroDoLimiteDeUsuarios(pro, 15).ok).toBe(false)
    expect(dentroDoLimiteDeUsuarios(pro, 14).ok).toBe(true)

    const enterprise = fazPlano({ nome: "Enterprise", maxUsuarios: -1 })
    expect(dentroDoLimiteDeUsuarios(enterprise, 999).ok).toBe(true)
  })

  it("gera email automatico cpf + slug + dominio", () => {
    expect(gerarEmailAdmin("12345678901", "Minha Empresa LTDA")).toMatch(
      /^12345678901@minha-empresa-ltda\.com\.br$/
    )
    expect(gerarEmailAdmin("12345678901", "Transportadora Silva")).toMatch(
      /^12345678901@transportadora-silva\.com\.br$/
    )
    expect(gerarSlug("Transportadora Silva & Cia")).toBe("transportadora-silva-cia")
    expect(gerarSlug("  Ação Ltda  ")).toBe("acao-ltda")
  })
})
