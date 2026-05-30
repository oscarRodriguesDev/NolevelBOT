type FileIntent = "send_file" | "no_file" | "continue";

export function detectFileIntent(input: string): FileIntent {
  const lower = input.toLowerCase();
  const palavrasEnvio = [
    "foto", "fotos", "imagem", "print", "printar", "captura",
    "comprovante", "documento", "anexo", "anexar", "pdf",
    "atestado", "atestados", "laudo", "laudos", "receita", "receitas",
    "enviar", "mandar", "subir", "upload", "arquivo", "arquivos",
    "scan", "scanner", "digitalizar", "doc", "docs",
  ];
  const palavrasNegacao = ["não", "nao", "sem", "nenhum", "precisar", "preciso"];
  const palavrasConfirmacao = ["sim", "quero", "ok", "claro", "pode", "mando", "vou enviar", "tenho"];

  const hasFileWord = palavrasEnvio.some(p => lower.includes(p));
  const hasNegacao = palavrasNegacao.some(p => lower.includes(p));
  const hasConfirmacao = palavrasConfirmacao.some(p => lower.includes(p));

  if (hasNegacao && hasFileWord) return "no_file";
  if (hasFileWord && hasConfirmacao) return "send_file";
  if (["sim", "quero", "ok", "claro", "pode ser", "mando", "vou"].some(v => v === lower || lower.includes(v))) return "send_file";
  if (["não", "nao", "sem arquivo", "nenhum", "sem", "nada", "só descrição", "só o problema", "sem foto", "sem documento", "sem comprovante", "sem anexo"].some(v => lower.includes(v))) return "no_file";

  return hasFileWord ? "send_file" : "continue";
}
