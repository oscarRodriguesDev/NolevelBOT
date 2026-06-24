import { ROLE } from "@prisma/client"

export const ROLES_HIERARCHY: Record<ROLE, number> = {
  GOD: 100,
  ADMIN: 80,
  GESTOR: 60,
  ATENDENTE: 40,
}

export const CREATE_ROLE_MAP: Record<ROLE, ROLE[]> = {
  GOD: ["ADMIN"],
  ADMIN: ["GESTOR", "ATENDENTE"],
  GESTOR: ["ATENDENTE"],
  ATENDENTE: [],
}

export const DELETE_ROLE_MAP: Record<ROLE, ROLE[]> = {
  GOD: ["ADMIN", "GESTOR", "ATENDENTE"], //pode ser que no futuro ele delete apenas o admin
  ADMIN: ["GESTOR", "ATENDENTE"],
  GESTOR: ["ATENDENTE"],
  ATENDENTE: [],
}

export const VIEW_USERS_ROLES: Record<ROLE, { empresaScope: boolean; setorScope?: boolean; roles: ROLE[] }> = {
  GOD: { empresaScope: false, roles: ["GOD", "ADMIN", "GESTOR", "ATENDENTE"] },
  ADMIN: { empresaScope: true, roles: ["ADMIN", "GESTOR", "ATENDENTE"] },
  GESTOR: { empresaScope: true, setorScope: true, roles: ["ATENDENTE"] },
  ATENDENTE: { empresaScope: true, roles: [] },
}

export const CAN_VIEW_EMPRESAS: ROLE[] = ["GOD"]
export const CAN_CREATE_EMPRESA: ROLE[] = ["GOD"]
export const CAN_BATCH_CPF: ROLE[] = ["GOD", "ADMIN", "GESTOR"]

// Verifica se um usuario pode criar outro com a role especificada
export function podeCriarRole(quemCria: ROLE, roleAlvo: ROLE): boolean {
  const permitidas = CREATE_ROLE_MAP[quemCria]
  return permitidas.includes(roleAlvo)
}

// Verifica se um usuario pode deletar outro com a role especificada
export function podeDeletarRole(quemDeleta: ROLE, roleAlvo: ROLE): boolean {
  if (roleAlvo === "GOD") return false
  const permitidas = DELETE_ROLE_MAP[quemDeleta]
  return permitidas.includes(roleAlvo)
}

// Retorna o filtro de empresa e setor baseado na role do usuario
export function getSetorFilter(
  userRole: ROLE,
  userSetor: string,
  userEmpresaId: string
): { empresaId: string; setor?: string } {
  const base = { empresaId: userEmpresaId }
  if (userRole === "ATENDENTE" || userRole === "GESTOR") {
    return { ...base, setor: userSetor }
  }
  return base
}

// Retorna a clausula WHERE para consultas de tickets conforme a role
export function getTicketWhereClause(
  userRole: ROLE,
  userSetor: string,
  userEmpresaId: string
): { empresaId: string; setor?: string } {
  return getSetorFilter(userRole, userSetor, userEmpresaId)
}

// Converte o enum ROLE para o nome de exibicao em portugues
export function roleParaDisplay(role: ROLE): string {
  const nomes: Record<ROLE, string> = {
    GOD: "Master",
    ADMIN: "Admin",
    GESTOR: "Gestor",
    ATENDENTE: "Atendente",
  }
  return nomes[role]
}

// Retorna a lista de roles que o usuario pode criar
export function rolesQuePodeCriar(quemCria: ROLE): ROLE[] {
  return CREATE_ROLE_MAP[quemCria] || []
}

// Retorna a lista de roles que o usuario pode visualizar
export function rolesQuePodeVer(quemVe: ROLE): ROLE[] {
  return VIEW_USERS_ROLES[quemVe]?.roles || []
}
