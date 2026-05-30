import { describe, it, expect } from 'vitest'
import {
  cpfSchema, emailSchema, passwordSchema, statusSchema,
  createUserSchema, createTicketSchema, createEmpresaSchema, createLeadSchema,
} from '@/lib/validation'

describe('Validacao - CPF', () => {
  it('aceita CPF com 11 digitos', () => {
    expect(cpfSchema.parse('12345678901')).toBe('12345678901')
  })
  it('rejeita CPF com letras', () => {
    expect(() => cpfSchema.parse('1234567890a')).toThrow()
  })
  it('rejeita CPF com menos de 11 digitos', () => {
    expect(() => cpfSchema.parse('123456789')).toThrow()
  })
  it('rejeita CPF com mais de 11 digitos', () => {
    expect(() => cpfSchema.parse('123456789012')).toThrow()
  })
  it('rejeita CPF vazio', () => {
    expect(() => cpfSchema.parse('')).toThrow()
  })
  it('rejeita CPF com caracteres especiais', () => {
    expect(() => cpfSchema.parse('123.456.789-01')).toThrow()
  })
})

describe('Validacao - Email', () => {
  it('aceita email valido', () => {
    expect(emailSchema.parse('teste@example.com')).toBe('teste@example.com')
  })
  it('aceita email com subdominio', () => {
    expect(emailSchema.parse('user@sub.example.com.br')).toBe('user@sub.example.com.br')
  })
  it('rejeita email sem @', () => {
    expect(() => emailSchema.parse('invalido')).toThrow()
  })
  it('rejeita email vazio', () => {
    expect(() => emailSchema.parse('')).toThrow()
  })
  it('rejeita email sem dominio', () => {
    expect(() => emailSchema.parse('user@')).toThrow()
  })
})

describe('Validacao - Senha', () => {
  it('aceita senha com 6 caracteres ou mais', () => {
    expect(passwordSchema.parse('123456')).toBe('123456')
    expect(passwordSchema.parse('senhaSegura123')).toBe('senhaSegura123')
  })
  it('rejeita senha com menos de 6 caracteres', () => {
    expect(() => passwordSchema.parse('12345')).toThrow()
  })
  it('rejeita senha vazia', () => {
    expect(() => passwordSchema.parse('')).toThrow()
  })
})

describe('Validacao - Status', () => {
  it('aceita status validos', () => {
    expect(statusSchema.parse('NOVO')).toBe('NOVO')
    expect(statusSchema.parse('EM_ATENDIMENTO')).toBe('EM_ATENDIMENTO')
    expect(statusSchema.parse('AGUARDANDO')).toBe('AGUARDANDO')
    expect(statusSchema.parse('CONCLUIDO')).toBe('CONCLUIDO')
    expect(statusSchema.parse('CANCELADO')).toBe('CANCELADO')
  })
  it('rejeita status com lower case', () => {
    expect(() => statusSchema.parse('novo')).toThrow()
  })
  it('rejeita status inexistente', () => {
    expect(() => statusSchema.parse('ABERTO')).toThrow()
  })
  it('rejeita string vazia', () => {
    expect(() => statusSchema.parse('')).toThrow()
  })
})

describe('Validacao - createUserSchema', () => {
  const validUser = {
    name: 'Joao Silva',
    email: 'joao@example.com',
    cpf: '12345678901',
    password: '123456',
    setor: 'Suporte',
    empresaId: '550e8400-e29b-41d4-a716-446655440000',
    role: 'ADMIN',
  }

  it('aceita usuario valido', () => {
    const result = createUserSchema.parse(validUser)
    expect(result.name).toBe('Joao Silva')
  })

  it('rejeita nome muito curto', () => {
    expect(() => createUserSchema.parse({ ...validUser, name: 'A' })).toThrow()
  })

  it('rejeita email invalido', () => {
    expect(() => createUserSchema.parse({ ...validUser, email: 'invalido' })).toThrow()
  })

  it('rejeita CPF invalido', () => {
    expect(() => createUserSchema.parse({ ...validUser, cpf: '123' })).toThrow()
  })

  it('rejeita senha curta', () => {
    expect(() => createUserSchema.parse({ ...validUser, password: '123' })).toThrow()
  })

  it('rejeita empresaId nao UUID', () => {
    expect(() => createUserSchema.parse({ ...validUser, empresaId: 'nao-e-uuid' })).toThrow()
  })

  it('rejeita setor vazio', () => {
    expect(() => createUserSchema.parse({ ...validUser, setor: '' })).toThrow()
  })

  it('rejeita role vazio', () => {
    expect(() => createUserSchema.parse({ ...validUser, role: '' })).toThrow()
  })
})

describe('Validacao - createTicketSchema', () => {
  const validTicket = {
    nome: 'Maria Souza',
    cpf: '98765432100',
    setor: 'Financeiro',
    descricao: 'Preciso de ajuda com meu boleto',
  }

  it('aceita ticket valido com prioridade default', () => {
    const result = createTicketSchema.parse(validTicket)
    expect(result.prioridade).toBe('normal')
  })

  it('aceita prioridade explicita', () => {
    expect(createTicketSchema.parse({ ...validTicket, prioridade: 'alta' }).prioridade).toBe('alta')
    expect(createTicketSchema.parse({ ...validTicket, prioridade: 'critica' }).prioridade).toBe('critica')
    expect(createTicketSchema.parse({ ...validTicket, prioridade: 'baixa' }).prioridade).toBe('baixa')
  })

  it('rejeita prioridade invalida', () => {
    expect(() => createTicketSchema.parse({ ...validTicket, prioridade: 'urgente' })).toThrow()
  })

  it('rejeita nome muito curto', () => {
    expect(() => createTicketSchema.parse({ ...validTicket, nome: 'A' })).toThrow()
  })

  it('rejeita CPF invalido', () => {
    expect(() => createTicketSchema.parse({ ...validTicket, cpf: '123' })).toThrow()
  })

  it('rejeita descricao muito curta', () => {
    expect(() => createTicketSchema.parse({ ...validTicket, descricao: 'abc' })).toThrow()
  })

  it('rejeita setor vazio', () => {
    expect(() => createTicketSchema.parse({ ...validTicket, setor: '' })).toThrow()
  })
})

describe('Validacao - createEmpresaSchema', () => {
  const validEmpresa = {
    nome: 'Empresa Teste Ltda',
    cnpj: '12345678901234',
    setores: ['Suporte', 'Financeiro'],
  }

  it('aceita empresa valida', () => {
    const result = createEmpresaSchema.parse(validEmpresa)
    expect(result.nome).toBe('Empresa Teste Ltda')
  })

  it('rejeita CNPJ com menos de 14 digitos', () => {
    expect(() => createEmpresaSchema.parse({ ...validEmpresa, cnpj: '123' })).toThrow()
  })

  it('rejeita CNPJ com letras', () => {
    expect(() => createEmpresaSchema.parse({ ...validEmpresa, cnpj: '1234567890123a' })).toThrow()
  })

  it('rejeita setores vazios', () => {
    expect(() => createEmpresaSchema.parse({ ...validEmpresa, setores: [] })).toThrow()
  })

  it('rejeita nome muito curto', () => {
    expect(() => createEmpresaSchema.parse({ ...validEmpresa, nome: 'A' })).toThrow()
  })
})

describe('Validacao - createLeadSchema', () => {
  const validLead = {
    nome: 'Carlos Lead',
    cpf: '11122233344',
    telefone: '11999999999',
  }

  it('aceita lead valido sem empresa', () => {
    const result = createLeadSchema.parse(validLead)
    expect(result.empresa).toBeUndefined()
  })

  it('aceita lead com empresa opcional', () => {
    const result = createLeadSchema.parse({ ...validLead, empresa: 'Minha Empresa' })
    expect(result.empresa).toBe('Minha Empresa')
  })

  it('rejeita nome curto', () => {
    expect(() => createLeadSchema.parse({ ...validLead, nome: 'A' })).toThrow()
  })

  it('rejeita CPF invalido', () => {
    expect(() => createLeadSchema.parse({ ...validLead, cpf: '123' })).toThrow()
  })

  it('rejeita telefone muito curto', () => {
    expect(() => createLeadSchema.parse({ ...validLead, telefone: '123' })).toThrow()
  })
})
