import { z } from "zod"

export const cpfSchema = z.string().regex(/^\d{11}$/, "CPF deve conter 11 dígitos")

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
