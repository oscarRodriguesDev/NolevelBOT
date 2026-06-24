// Remove caracteres nao numericos do CPF
export function limparCPF(cpf: string) {
  return cpf.replace(/\D/g, "")
}