import { describe, it, expect } from 'vitest'
import {
  podeCriarRole, podeDeletarRole, getSetorFilter,
  roleParaDisplay, rolesQuePodeCriar, rolesQuePodeVer,
  getTicketWhereClause, ROLES_HIERARCHY,
  CREATE_ROLE_MAP, DELETE_ROLE_MAP, VIEW_USERS_ROLES,
  CAN_VIEW_EMPRESAS, CAN_BATCH_CPF, CAN_CREATE_EMPRESA,
} from '@/lib/rbac'

type ROLE = 'GOD' | 'ADMIN' | 'GESTOR' | 'ATENDENTE'

describe('RBAC - CREATE_ROLE_MAP', () => {
  it('GOD pode criar apenas ADMIN', () => {
    expect(CREATE_ROLE_MAP.GOD).toEqual(['ADMIN'])
  })
  it('ADMIN pode criar GESTOR e ATENDENTE', () => {
    expect(CREATE_ROLE_MAP.ADMIN).toEqual(['GESTOR', 'ATENDENTE'])
  })
  it('GESTOR pode criar apenas ATENDENTE', () => {
    expect(CREATE_ROLE_MAP.GESTOR).toEqual(['ATENDENTE'])
  })
  it('ATENDENTE nao pode criar ninguem', () => {
    expect(CREATE_ROLE_MAP.ATENDENTE).toEqual([])
  })
})

describe('RBAC - podeCriarRole', () => {
  it('GOD pode criar ADMIN', () => {
    expect(podeCriarRole('GOD', 'ADMIN')).toBe(true)
  })
  it('GOD NAO pode criar GESTOR', () => {
    expect(podeCriarRole('GOD', 'GESTOR')).toBe(false)
  })
  it('GOD NAO pode criar ATENDENTE', () => {
    expect(podeCriarRole('GOD', 'ATENDENTE')).toBe(false)
  })
  it('GOD NAO pode criar GOD', () => {
    expect(podeCriarRole('GOD', 'GOD')).toBe(false)
  })
  it('ADMIN pode criar GESTOR', () => {
    expect(podeCriarRole('ADMIN', 'GESTOR')).toBe(true)
  })
  it('ADMIN pode criar ATENDENTE', () => {
    expect(podeCriarRole('ADMIN', 'ATENDENTE')).toBe(true)
  })
  it('ADMIN NAO pode criar GOD', () => {
    expect(podeCriarRole('ADMIN', 'GOD')).toBe(false)
  })
  it('ADMIN NAO pode criar ADMIN', () => {
    expect(podeCriarRole('ADMIN', 'ADMIN')).toBe(false)
  })
  it('GESTOR pode criar ATENDENTE', () => {
    expect(podeCriarRole('GESTOR', 'ATENDENTE')).toBe(true)
  })
  it('GESTOR NAO pode criar ADMIN', () => {
    expect(podeCriarRole('GESTOR', 'ADMIN')).toBe(false)
  })
  it('GESTOR NAO pode criar GOD', () => {
    expect(podeCriarRole('GESTOR', 'GOD')).toBe(false)
  })
  it('GESTOR NAO pode criar GESTOR', () => {
    expect(podeCriarRole('GESTOR', 'GESTOR')).toBe(false)
  })
  it('ATENDENTE NAO pode criar ninguem', () => {
    expect(podeCriarRole('ATENDENTE', 'ATENDENTE')).toBe(false)
    expect(podeCriarRole('ATENDENTE', 'GESTOR')).toBe(false)
    expect(podeCriarRole('ATENDENTE', 'ADMIN')).toBe(false)
    expect(podeCriarRole('ATENDENTE', 'GOD')).toBe(false)
  })
})

describe('RBAC - DELETE_ROLE_MAP', () => {
  it('GOD pode deletar ADMIN, GESTOR e ATENDENTE', () => {
    expect(DELETE_ROLE_MAP.GOD).toEqual(['ADMIN', 'GESTOR', 'ATENDENTE'])
  })
  it('ADMIN pode deletar GESTOR e ATENDENTE', () => {
    expect(DELETE_ROLE_MAP.ADMIN).toEqual(['GESTOR', 'ATENDENTE'])
  })
  it('GESTOR pode deletar apenas ATENDENTE', () => {
    expect(DELETE_ROLE_MAP.GESTOR).toEqual(['ATENDENTE'])
  })
  it('ATENDENTE nao pode deletar ninguem', () => {
    expect(DELETE_ROLE_MAP.ATENDENTE).toEqual([])
  })
})

describe('RBAC - podeDeletarRole', () => {
  it('GOD nunca pode ser deletado por ninguem', () => {
    expect(podeDeletarRole('GOD', 'GOD')).toBe(false)
    expect(podeDeletarRole('ADMIN', 'GOD')).toBe(false)
    expect(podeDeletarRole('GESTOR', 'GOD')).toBe(false)
    expect(podeDeletarRole('ATENDENTE', 'GOD')).toBe(false)
  })
  it('GOD pode deletar ADMIN', () => {
    expect(podeDeletarRole('GOD', 'ADMIN')).toBe(true)
  })
  it('GOD pode deletar GESTOR', () => {
    expect(podeDeletarRole('GOD', 'GESTOR')).toBe(true)
  })
  it('GOD pode deletar ATENDENTE', () => {
    expect(podeDeletarRole('GOD', 'ATENDENTE')).toBe(true)
  })
  it('ADMIN pode deletar GESTOR', () => {
    expect(podeDeletarRole('ADMIN', 'GESTOR')).toBe(true)
  })
  it('ADMIN pode deletar ATENDENTE', () => {
    expect(podeDeletarRole('ADMIN', 'ATENDENTE')).toBe(true)
  })
  it('ADMIN NAO pode deletar ADMIN', () => {
    expect(podeDeletarRole('ADMIN', 'ADMIN')).toBe(false)
  })
  it('GESTOR pode deletar ATENDENTE', () => {
    expect(podeDeletarRole('GESTOR', 'ATENDENTE')).toBe(true)
  })
  it('GESTOR NAO pode deletar ADMIN nem GESTOR', () => {
    expect(podeDeletarRole('GESTOR', 'GESTOR')).toBe(false)
    expect(podeDeletarRole('GESTOR', 'ADMIN')).toBe(false)
  })
  it('ATENDENTE NAO pode deletar ninguem', () => {
    expect(podeDeletarRole('ATENDENTE', 'ATENDENTE')).toBe(false)
    expect(podeDeletarRole('ATENDENTE', 'GESTOR')).toBe(false)
    expect(podeDeletarRole('ATENDENTE', 'ADMIN')).toBe(false)
    expect(podeDeletarRole('ATENDENTE', 'GOD')).toBe(false)
  })
})

describe('RBAC - getSetorFilter', () => {
  const empresaId = "emp-123"
  const setor = "Suporte"

  it('GOD nao tem filtro de setor', () => {
    const result = getSetorFilter('GOD', setor, empresaId)
    expect(result).toEqual({ empresaId })
    expect(result.setor).toBeUndefined()
  })

  it('ADMIN nao tem filtro de setor', () => {
    const result = getSetorFilter('ADMIN', setor, empresaId)
    expect(result).toEqual({ empresaId })
    expect(result.setor).toBeUndefined()
  })

  it('GESTOR tem filtro de setor', () => {
    const result = getSetorFilter('GESTOR', setor, empresaId)
    expect(result).toEqual({ empresaId, setor })
  })

  it('ATENDENTE tem filtro de setor', () => {
    const result = getSetorFilter('ATENDENTE', setor, empresaId)
    expect(result).toEqual({ empresaId, setor })
  })
})

describe('RBAC - getTicketWhereClause', () => {
  it('delega para getSetorFilter corretamente', () => {
    const r1 = getTicketWhereClause('GOD', 'X', 'e1')
    const r2 = getSetorFilter('GOD', 'X', 'e1')
    expect(r1).toEqual(r2)

    const r3 = getTicketWhereClause('ATENDENTE', 'Suporte', 'e1')
    expect(r3).toEqual({ empresaId: 'e1', setor: 'Suporte' })
  })
})

describe('RBAC - roleParaDisplay', () => {
  it('retorna nome amigavel para cada papel', () => {
    expect(roleParaDisplay('GOD')).toBe('Master')
    expect(roleParaDisplay('ADMIN')).toBe('Admin')
    expect(roleParaDisplay('GESTOR')).toBe('Gestor')
    expect(roleParaDisplay('ATENDENTE')).toBe('Atendente')
  })
})

describe('RBAC - rolesQuePodeCriar', () => {
  it('retorna lista de roles que pode criar', () => {
    expect(rolesQuePodeCriar('GOD')).toEqual(['ADMIN'])
    expect(rolesQuePodeCriar('ADMIN')).toEqual(['GESTOR', 'ATENDENTE'])
    expect(rolesQuePodeCriar('GESTOR')).toEqual(['ATENDENTE'])
    expect(rolesQuePodeCriar('ATENDENTE')).toEqual([])
  })
})

describe('RBAC - rolesQuePodeVer', () => {
  it('GOD ve todos os papeis', () => {
    expect(rolesQuePodeVer('GOD')).toEqual(['GOD', 'ADMIN', 'GESTOR', 'ATENDENTE'])
  })
  it('ADMIN ve ADMIN, GESTOR e ATENDENTE', () => {
    expect(rolesQuePodeVer('ADMIN')).toEqual(['ADMIN', 'GESTOR', 'ATENDENTE'])
  })
  it('GESTOR ve apenas ATENDENTE', () => {
    expect(rolesQuePodeVer('GESTOR')).toEqual(['ATENDENTE'])
  })
  it('ATENDENTE nao ve ninguem', () => {
    expect(rolesQuePodeVer('ATENDENTE')).toEqual([])
  })
})

describe('RBAC - permissoes especiais', () => {
  it('CAN_VIEW_EMPRESAS apenas GOD', () => {
    expect(CAN_VIEW_EMPRESAS).toEqual(['GOD'])
  })
  it('CAN_CREATE_EMPRESA apenas GOD', () => {
    expect(CAN_CREATE_EMPRESA).toEqual(['GOD'])
  })
  it('CAN_BATCH_CPF inclui GOD, ADMIN e GESTOR', () => {
    expect(CAN_BATCH_CPF).toEqual(['GOD', 'ADMIN', 'GESTOR'])
  })
  it('CAN_BATCH_CPF nao inclui ATENDENTE', () => {
    expect(CAN_BATCH_CPF.includes('ATENDENTE' as ROLE)).toBe(false)
  })
})

describe('RBAC - hierarquia de papeis', () => {
  it('GOD tem maior hierarquia (100)', () => {
    expect(ROLES_HIERARCHY.GOD).toBe(100)
  })
  it('ADMIN tem hierarquia 80', () => {
    expect(ROLES_HIERARCHY.ADMIN).toBe(80)
  })
  it('GESTOR tem hierarquia 60', () => {
    expect(ROLES_HIERARCHY.GESTOR).toBe(60)
  })
  it('ATENDENTE tem hierarquia 40', () => {
    expect(ROLES_HIERARCHY.ATENDENTE).toBe(40)
  })
  it('hierarquia respeita ordem GOD > ADMIN > GESTOR > ATENDENTE', () => {
    expect(ROLES_HIERARCHY.GOD).toBeGreaterThan(ROLES_HIERARCHY.ADMIN)
    expect(ROLES_HIERARCHY.ADMIN).toBeGreaterThan(ROLES_HIERARCHY.GESTOR)
    expect(ROLES_HIERARCHY.GESTOR).toBeGreaterThan(ROLES_HIERARCHY.ATENDENTE)
  })
})

describe('RBAC - consistencia dos mapas', () => {
  it('CREATE_ROLE_MAP e DELETE_ROLE_MAP tem as mesmas chaves', () => {
    expect(Object.keys(CREATE_ROLE_MAP).sort()).toEqual(Object.keys(DELETE_ROLE_MAP).sort())
  })
  it('nenhum role pode criar a si mesmo', () => {
    for (const role of Object.keys(CREATE_ROLE_MAP) as ROLE[]) {
      expect(CREATE_ROLE_MAP[role].includes(role)).toBe(false)
    }
  })
  it('nenhum role pode deletar a si mesmo (exceto implicitamente)', () => {
    for (const role of Object.keys(DELETE_ROLE_MAP) as ROLE[]) {
      expect(DELETE_ROLE_MAP[role].includes(role)).toBe(false)
    }
  })
  it('VIEW_USERS_ROLES contem todos os papeis', () => {
    expect(Object.keys(VIEW_USERS_ROLES).sort()).toEqual(['ADMIN', 'ATENDENTE', 'GESTOR', 'GOD'])
  })
  it('GOD ve GOD na propria lista', () => {
    expect(VIEW_USERS_ROLES.GOD.roles.includes('GOD')).toBe(true)
  })
})

describe('RBAC - VIEW_USERS_ROLES scopes', () => {
  it('GOD nao tem escopo de empresa (ve tudo)', () => {
    expect(VIEW_USERS_ROLES.GOD.empresaScope).toBe(false)
  })
  it('ADMIN tem escopo de empresa', () => {
    expect(VIEW_USERS_ROLES.ADMIN.empresaScope).toBe(true)
  })
  it('GESTOR tem escopo de empresa e setor', () => {
    expect(VIEW_USERS_ROLES.GESTOR.empresaScope).toBe(true)
    expect(VIEW_USERS_ROLES.GESTOR.setorScope).toBe(true)
  })
  it('ATENDENTE tem escopo de empresa mas lista vazia', () => {
    expect(VIEW_USERS_ROLES.ATENDENTE.empresaScope).toBe(true)
    expect(VIEW_USERS_ROLES.ATENDENTE.roles).toEqual([])
  })
})
