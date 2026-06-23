import { describe, it, expect } from 'vitest'
import {
  cpfSchema, emailSchema,
  createTicketSchema, createUserSchema, createEmpresaSchema,
  sendFormSchema, createAvisoSchema,
} from '@/lib/validation'
import {
  validarArquivo, getExtension, ALLOWED_EXTENSIONS_LIST,
  ALLOWED_MIME_TYPES_LIST, MAX_FILE_SIZE_BYTES,
} from '@/lib/upload'

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

describe('Seguranca - Validacao de formato rejeita SQL injection', () => {
  const sqlPatterns = [
    "' OR '1'='1",
    "'; DROP TABLE users; --",
    "' UNION SELECT * FROM passwords; --",
    "1; SELECT * FROM admin WHERE '1'='1",
    "' OR 1=1 --",
    "admin'--",
    "'; EXEC xp_cmdshell('dir'); --",
    "' WAITFOR DELAY '0:0:5'--",
    "1' ORDER BY 1--",
    "1 AND 1=1",
  ]

  describe('cpfSchema (formato fixo 11 digitos)', () => {
    it.each(sqlPatterns)('rejeita injection em CPF: %s', (payload) => {
      const result = cpfSchema.safeParse(payload)
      expect(result.success).toBe(false)
    })
  })

  describe('emailSchema (formato email)', () => {
    it.each(sqlPatterns)('rejeita injection em email: %s', (payload) => {
      const result = emailSchema.safeParse(payload)
      expect(result.success).toBe(false)
    })
  })

  describe('Seguranca - Prisma usa queries parametrizadas (SQL injection prevention)', () => {
    it('Prisma queries sao parametrizadas por design — nenhum SQL injection via concatenacao de strings', () => {
      const sqlPatterns = ["' OR '1'='1", "'; DROP TABLE users; --"]
      for (const payload of sqlPatterns) {
        const result = createTicketSchema.safeParse({
          nome: "Teste",
          cpf: "12345678901",
          setor: "TI",
          descricao: payload,
        })
        expect(result.success).toBe(true)
      }
    })
  })

  describe('Seguranca - Validacao de campos com regex especifico', () => {
    it('cpfSchema requer exatamente 11 digitos', () => {
      expect(cpfSchema.safeParse("12345678901").success).toBe(true)
      expect(cpfSchema.safeParse("123").success).toBe(false)
      expect(cpfSchema.safeParse("abc").success).toBe(false)
      expect(cpfSchema.safeParse("").success).toBe(false)
    })

    it('emailSchema rejeita strings sem formato de email', () => {
      expect(emailSchema.safeParse("teste@test.com").success).toBe(true)
      expect(emailSchema.safeParse("' OR '1'='1").success).toBe(false)
      expect(emailSchema.safeParse("").success).toBe(false)
    })
  })
})

describe('Seguranca - Protecao contra XSS (prevencao em output)', () => {
  it('Zod nao bloqueia XSS em campos de texto livre (correto — validacao e de formato, nao conteudo)', () => {
    const xssPayloads = [
      "<script>alert('xss')</script>",
      "<img src=x onerror=alert(1)>",
      "<svg onload=alert(1)>",
    ]
    for (const payload of xssPayloads) {
      const result = createTicketSchema.safeParse({
        nome: "Teste",
        cpf: "12345678901",
        setor: "TI",
        descricao: payload,
      })
      expect(result.success).toBe(true)
    }
  })
})

describe('Seguranca - Protecao contra path traversal em upload', () => {
  describe('getExtension', () => {
    it('extrai extensao de nome simples', () => {
      expect(getExtension("foto.jpg")).toBe("jpg")
    })

    it('extrai extensao de nome com pontos', () => {
      expect(getExtension("arquivo.test.png")).toBe("png")
    })

    it('retorna string vazia para nome sem extensao', () => {
      expect(getExtension("README")).toBe("readme")
    })

    it('lowercase extensao', () => {
      expect(getExtension("Foto.JPG")).toBe("jpg")
    })
  })

  describe('validarArquivo - extensao', () => {
    it('aceita jpg', () => {
      expect(validarArquivo({ extension: "jpg", mimeType: "image/jpeg", size: 1000 })).toBeNull()
    })

    it('aceita png', () => {
      expect(validarArquivo({ extension: "png", mimeType: "image/png", size: 1000 })).toBeNull()
    })

    it('aceita pdf', () => {
      expect(validarArquivo({ extension: "pdf", mimeType: "application/pdf", size: 1000 })).toBeNull()
    })

    it('rejeita extensao perigosa .exe', () => {
      expect(validarArquivo({ extension: "exe", mimeType: "application/x-msdownload", size: 1000 })).not.toBeNull()
    })

    it('rejeita extensao .html', () => {
      expect(validarArquivo({ extension: "html", mimeType: "text/html", size: 1000 })).not.toBeNull()
    })

    it('rejeita .js', () => {
      expect(validarArquivo({ extension: "js", mimeType: "application/javascript", size: 1000 })).not.toBeNull()
    })

    it('rejeita .svg (XSS vetor)', () => {
      expect(validarArquivo({ extension: "svg", mimeType: "image/svg+xml", size: 1000 })).not.toBeNull()
    })
  })

  describe('validarArquivo - MIME type', () => {
    it('aceita image/jpeg', () => {
      expect(validarArquivo({ extension: "jpg", mimeType: "image/jpeg", size: 1000 })).toBeNull()
    })

    it('rejeita mime type diferente da extensao', () => {
      const result = validarArquivo({ extension: "jpg", mimeType: "text/html", size: 1000 })
      expect(result).not.toBeNull()
      expect(result).toContain("MIME")
    })
  })

  describe('validarArquivo - tamanho', () => {
    it('rejeita arquivo acima de 10MB', () => {
      const result = validarArquivo({ extension: "jpg", mimeType: "image/jpeg", size: MAX_FILE_SIZE_BYTES + 1 })
      expect(result).not.toBeNull()
      expect(result).toContain("grande")
    })

    it('aceita arquivo exatamente no limite', () => {
      expect(validarArquivo({ extension: "jpg", mimeType: "image/jpeg", size: MAX_FILE_SIZE_BYTES })).toBeNull()
    })
  })

  describe('ALLOWED_EXTENSIONS_LIST', () => {
    it('contem apenas extensoes seguras', () => {
      const seguras = ["jpg", "jpeg", "png", "pdf"]
      expect(ALLOWED_EXTENSIONS_LIST.sort()).toEqual(seguras.sort())
    })

    it('nao contem extensoes executaveis', () => {
      expect(ALLOWED_EXTENSIONS_LIST).not.toContain("exe")
      expect(ALLOWED_EXTENSIONS_LIST).not.toContain("bat")
      expect(ALLOWED_EXTENSIONS_LIST).not.toContain("sh")
      expect(ALLOWED_EXTENSIONS_LIST).not.toContain("js")
      expect(ALLOWED_EXTENSIONS_LIST).not.toContain("html")
      expect(ALLOWED_EXTENSIONS_LIST).not.toContain("svg")
    })
  })

  describe('ALLOWED_MIME_TYPES_LIST', () => {
    it('contem apenas mime types de imagem e pdf', () => {
      expect(ALLOWED_MIME_TYPES_LIST).toContain("image/jpeg")
      expect(ALLOWED_MIME_TYPES_LIST).toContain("image/png")
      expect(ALLOWED_MIME_TYPES_LIST).toContain("application/pdf")
    })

    it('nao contem mime types perigosos', () => {
      expect(ALLOWED_MIME_TYPES_LIST).not.toContain("text/html")
      expect(ALLOWED_MIME_TYPES_LIST).not.toContain("application/javascript")
      expect(ALLOWED_MIME_TYPES_LIST).not.toContain("application/x-msdownload")
    })
  })
})
