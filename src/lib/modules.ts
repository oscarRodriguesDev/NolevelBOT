export type ModuleSlug = "corporativo" | "oficina" | "comercial"

export interface ModuleConfig {
  slug: ModuleSlug
  moduleLabel: string
  description: string
  moduleCheck: string
  redirectBase: string
}

export const MODULES: Record<ModuleSlug, ModuleConfig> = {
  corporativo: {
    slug: "corporativo",
    moduleLabel: "Atendimento",
    description: "Suporte Tecnico",
    moduleCheck: "CORPORATIVO",
    redirectBase: "/corporativo",
  },
  oficina: {
    slug: "oficina",
    moduleLabel: "Operacional",
    description: "Gestão de Manutenção",
    moduleCheck: "OFICINA",
    redirectBase: "/oficina",
  },
  comercial: {
    slug: "comercial",
    moduleLabel: "Comercial",
    description: "Atendimento Comercial",
    moduleCheck: "COMERCIAL",
    redirectBase: "/comercial",
  },
}
