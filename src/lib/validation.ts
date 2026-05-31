import { z } from "zod"

export function isValidCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, "")
  if (digits.length !== 11) return false
  if (/^(\d)\1{10}$/.test(digits)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i)
  let remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  if (remainder !== parseInt(digits[9])) return false

  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i)
  remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  if (remainder !== parseInt(digits[10])) return false

  return true
}

export const cpfSchema = z.string().regex(/^\d{11}$/, "CPF deve conter 11 dígitos").refine(isValidCPF, "CPF inválido")

export const emailSchema = z.string().email("Email inválido")

export const passwordSchema = z.string().min(6, "Senha deve ter no mínimo 6 caracteres")

export const statusSchema = z.enum(["NOVO", "EM_ATENDIMENTO", "AGUARDANDO", "CONCLUIDO", "CANCELADO"])

export const createUserSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  email: emailSchema,
  cpf: cpfSchema,
  password: passwordSchema,
  setor: z.string().min(1, "Setor é obrigatório"),
  empresaId: z.string().uuid("Empresa inválida"),
  role: z.string().min(1, "Papel é obrigatório"),
})

export const createTicketSchema = z.object({
  nome: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  cpf: cpfSchema,
  setor: z.string().min(1, "Setor é obrigatório"),
  descricao: z.string().min(5, "Descreva o problema em detalhes"),
  prioridade: z.enum(["baixa", "normal", "alta", "critica"]).default("normal"),
})

export const createEmpresaSchema = z.object({
  nome: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  cnpj: z.string().regex(/^\d{14}$/, "CNPJ deve conter 14 dígitos"),
  setores: z.array(z.string()).min(1, "Adicione pelo menos um setor"),
})

export const createLeadSchema = z.object({
  nome: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  cpf: cpfSchema,
  telefone: z.string().min(8, "Telefone inválido"),
  empresa: z.string().optional(),
})
