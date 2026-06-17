import { describe, it, expect } from 'vitest'

type ROLE = 'GOD' | 'ADMIN' | 'GESTOR' | 'ATENDENTE'

const ROLES_HIERARCHY: Record<ROLE, number> = {
  GOD: 100, ADMIN: 80, GESTOR: 60, ATENDENTE: 40,
}

const CREATE_ROLE_MAP: Record<ROLE, ROLE[]> = {
  GOD: ['ADMIN'],
  ADMIN: ['GESTOR', 'ATENDENTE'],
  GESTOR: ['ATENDENTE'],
  ATENDENTE: [],
}

const DELETE_ROLE_MAP: Record<ROLE, ROLE[]> = {
  GOD: ['ADMIN', 'GESTOR', 'ATENDENTE'],
  ADMIN: ['GESTOR', 'ATENDENTE'],
  GESTOR: ['ATENDENTE'],
  ATENDENTE: [],
}

const VIEW_USERS_ROLES: Record<ROLE, { empresaScope: boolean; setorScope?: boolean; roles: ROLE[] }> = {
  GOD: { empresaScope: false, roles: ['GOD', 'ADMIN', 'GESTOR', 'ATENDENTE'] },
  ADMIN: { empresaScope: true, roles: ['ADMIN', 'GESTOR', 'ATENDENTE'] },
  GESTOR: { empresaScope: true, setorScope: true, roles: ['ATENDENTE'] },
  ATENDENTE: { empresaScope: true, roles: [] },
}

const CAN_VIEW_EMPRESAS: ROLE[] = ['GOD']
const CAN_BATCH_CPF: ROLE[] = ['GOD', 'ADMIN', 'GESTOR']

function podeCriarRole(quemCria: ROLE, roleAlvo: ROLE): boolean {
  return CREATE_ROLE_MAP[quemCria].includes(roleAlvo)
}

function podeDeletarRole(quemDeleta: ROLE, roleAlvo: ROLE): boolean {
  if (roleAlvo === 'GOD') return false
  return DELETE_ROLE_MAP[quemDeleta].includes(roleAlvo)
}

describe('Seguranca - Principio do menor privilegio', () => {
  it('ATENDENTE tem permissoes minimas (nao cria, nao deleta)', () => {
    expect(CREATE_ROLE_MAP.ATENDENTE).toEqual([])
    expect(DELETE_ROLE_MAP.ATENDENTE).toEqual([])
  })

  it('GESTOR tem acesso limitado a ATENDENTE apenas', () => {
    expect(CREATE_ROLE_MAP.GESTOR).toEqual(['ATENDENTE'])
    expect(DELETE_ROLE_MAP.GESTOR).toEqual(['ATENDENTE'])
  })
})

describe('Seguranca - Protecao contra escalada de privilegio', () => {
  it('nenhum role pode criar papel superior a si mesmo na hierarquia', () => {
    const hierarchyOrder: ROLE[] = ['GOD', 'ADMIN', 'GESTOR', 'ATENDENTE']
    for (const quemCria of hierarchyOrder) {
      for (const roleAlvo of hierarchyOrder) {
        const pode = podeCriarRole(quemCria, roleAlvo)
        const idxCria = hierarchyOrder.indexOf(quemCria)
        const idxAlvo = hierarchyOrder.indexOf(roleAlvo)
        if (idxAlvo < idxCria) {
          expect(pode).toBe(false)
        }
      }
    }
  })
})

describe('Seguranca - GOD e indestrutivel', () => {
  it('GOD nao pode ser deletado por nenhum papel', () => {
    const allRoles: ROLE[] = ['GOD', 'ADMIN', 'GESTOR', 'ATENDENTE']
    for (const role of allRoles) {
      expect(podeDeletarRole(role, 'GOD')).toBe(false)
    }
  })
})

describe('Seguranca - Nenhum role deleta a si mesmo', () => {
  it('DELETE_ROLE_MAP nao contem auto-referencia', () => {
    const allRoles: ROLE[] = ['GOD', 'ADMIN', 'GESTOR', 'ATENDENTE']
    for (const role of allRoles) {
      expect(podeDeletarRole(role, role)).toBe(false)
    }
  })
})

describe('Seguranca - Escopo de dados por empresa', () => {
  it('GOD ve todas as empresas (sem escopo)', () => {
    expect(VIEW_USERS_ROLES.GOD.empresaScope).toBe(false)
  })
  it('ADMIN e limitado a propria empresa', () => {
    expect(VIEW_USERS_ROLES.ADMIN.empresaScope).toBe(true)
  })
  it('GESTOR e limitado a propria empresa e setor', () => {
    expect(VIEW_USERS_ROLES.GESTOR.empresaScope).toBe(true)
    expect(VIEW_USERS_ROLES.GESTOR.setorScope).toBe(true)
  })
  it('ATENDENTE e limitado a propria empresa', () => {
    expect(VIEW_USERS_ROLES.ATENDENTE.empresaScope).toBe(true)
  })
})

describe('Seguranca - Acesso a funcionalidades criticas', () => {
  it('apenas GOD pode ver empresas', () => {
    const allRoles: ROLE[] = ['GOD', 'ADMIN', 'GESTOR', 'ATENDENTE']
    for (const role of allRoles) {
      if (role === 'GOD') {
        expect(CAN_VIEW_EMPRESAS.includes(role)).toBe(true)
      } else {
        expect(CAN_VIEW_EMPRESAS.includes(role)).toBe(false)
      }
    }
  })

  it('ATENDENTE nao pode importar CPF em lote', () => {
    expect(CAN_BATCH_CPF.includes('ATENDENTE')).toBe(false)
  })

  it('GOD, ADMIN e GESTOR podem importar CPF em lote', () => {
    expect(CAN_BATCH_CPF.includes('GOD')).toBe(true)
    expect(CAN_BATCH_CPF.includes('ADMIN')).toBe(true)
    expect(CAN_BATCH_CPF.includes('GESTOR')).toBe(true)
  })
})

describe('Seguranca - Consistencia de regras de negocio', () => {
  it('cada role em VIEW_USERS_ROLES tem escopo de empresa definido', () => {
    const allRoles: ROLE[] = ['GOD', 'ADMIN', 'GESTOR', 'ATENDENTE']
    for (const role of allRoles) {
      expect(VIEW_USERS_ROLES[role]).toHaveProperty('empresaScope')
      expect(VIEW_USERS_ROLES[role]).toHaveProperty('roles')
    }
  })

  it('GESTOR e ATENDENTE tem setor definido como filtro', () => {
    expect(VIEW_USERS_ROLES.GESTOR.setorScope).toBe(true)
    expect(VIEW_USERS_ROLES.ATENDENTE.setorScope).toBeUndefined()
  })
})

describe('Seguranca - Validacao de hierarquia', () => {
  it('quanto maior o numero, maior o privilegio', () => {
    expect(ROLES_HIERARCHY.GOD).toBe(100)
    expect(ROLES_HIERARCHY.ADMIN).toBe(80)
    expect(ROLES_HIERARCHY.GESTOR).toBe(60)
    expect(ROLES_HIERARCHY.ATENDENTE).toBe(40)
  })

  it('diferenca entre niveis e consistente (20 pontos)', () => {
    expect(ROLES_HIERARCHY.GOD - ROLES_HIERARCHY.ADMIN).toBe(20)
    expect(ROLES_HIERARCHY.ADMIN - ROLES_HIERARCHY.GESTOR).toBe(20)
    expect(ROLES_HIERARCHY.GESTOR - ROLES_HIERARCHY.ATENDENTE).toBe(20)
  })
})

describe('Seguranca - Permissao de delecao segura', () => {
  it('ADMIN nao pode deletar ADMIN (evita empresa sem admin)', () => {
    expect(podeDeletarRole('ADMIN', 'ADMIN')).toBe(false)
  })
  it('GOD pode deletar admin (GOD supervisiona)', () => {
    expect(podeDeletarRole('GOD', 'ADMIN')).toBe(true)
  })
  it('GOD pode deletar qualquer role nao-GOD', () => {
    expect(podeDeletarRole('GOD', 'ADMIN')).toBe(true)
    expect(podeDeletarRole('GOD', 'GESTOR')).toBe(true)
    expect(podeDeletarRole('GOD', 'ATENDENTE')).toBe(true)
  })
})

describe('Seguranca - Nenhum papel pode se autopromover', () => {
  it('CREATE_ROLE_MAP nao permite autocriacao', () => {
    const allRoles: ROLE[] = ['GOD', 'ADMIN', 'GESTOR', 'ATENDENTE']
    for (const role of allRoles) {
      expect(podeCriarRole(role, role)).toBe(false)
    }
  })
})
