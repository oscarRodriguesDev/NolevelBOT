
const baseUrl = process.env.BASE_URL;
//buscar os avisos no banco
/* export async function buscarAvisos() {
  try {
    const res = await fetch(`${baseUrl}/api/quadro-avisos`);
    type Aviso = { titulo: string; conteudo: string };
    const data: Aviso[] = await res.json();
    return data
      .map(a => `📢 *${a.titulo}*: ${a.conteudo}`)
      .join("\n") || "Sem avisos.";
  } catch { return "Sem avisos no momento."; }
}
 */

export async function buscarAvisos(cpf?: string, _req?: Request) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { getEmpresaIdByCpf } = await import("@/lib/searchEmpresa");

    let empresaId: string | null = null;

    if (cpf) {
      empresaId = await getEmpresaIdByCpf(cpf);
    }

    const avisos = await prisma.avisos.findMany({
      where: empresaId ? { empresaId } : undefined,
      orderBy: { createdAt: "desc" },
    });

    const agora = new Date();
    const validos: { titulo: string; conteudo: string }[] = [];

    for (const aviso of avisos) {
      if (!aviso.duracao) {
        validos.push(aviso);
        continue;
      }
      const dias = Number(aviso.duracao);
      if (isNaN(dias)) {
        validos.push(aviso);
        continue;
      }
      const dataExpiracao = new Date(aviso.createdAt);
      dataExpiracao.setDate(dataExpiracao.getDate() + dias);
      if (agora <= dataExpiracao) {
        validos.push(aviso);
      }
    }

    if (validos.length === 0) return "Sem avisos.";

    return validos.map(a => `📢 *${a.titulo}*: ${a.conteudo}`).join("\n");
  } catch {
    return "Sem avisos no momento.";
  }
}



//gerador de tickets
export function generateRandomTicket() {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(-2);
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  const ms = String(now.getMilliseconds()).padStart(3, "0"); // milissegundos
  return `TKT-${dd}${mm}${yy}${hh}${min}${ss}${ms}`;
}

//buscar memoria do bot
export async function getMemoria(cpf: string) {
  try {
    
    const res = await fetch(`${baseUrl}/api/memories?cpf=${cpf}`, { cache: 'no-store' });
    return res.ok ? (await res.json())?.resumo : null;
  } catch { return null; }
}


//salvar memoria do bot
export async function saveMemoria(cpf: string, nome: string, resumo: string) {
  try {
   
    await fetch(`${baseUrl}/api/memories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cpf, nome, resumo }),
    });
  } catch { console.error("Erro ao salvar memória"); }
}


//saudação de acordo com o horario
export function saudacao() {
  const hora = new Date().getHours();

  if (hora >= 5 && hora < 12) return "Bom dia";
  if (hora >= 12 && hora < 18) return "Boa tarde";
  if (hora >= 18 || hora < 5) return "Boa noite";
  
  return "Olá"; 
}


//status dos chamados
export async function StatusChamado(filtro: string, _req?: Request) {
  try {
    const { prisma } = await import("@/lib/prisma");

    const isTicket = filtro.toUpperCase().includes("TKT") || filtro.length > 11;

    const where: Record<string, string> = isTicket
      ? { ticket: filtro }
      : { cpf: filtro };

    const chamados = await prisma.chamado.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        atendente: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    return chamados;
  } catch (error) {
    console.error("Erro ao buscar status do chamado:", error);
    return [];
  }
}


//enviar o chamado
export async function enviarChamado(nome: string, cpf: string, setor: string, descricao: string) {
  try {
    const { prisma } = await import("@/lib/prisma");

    const cpfRecord = await prisma.cpfs.findFirst({ where: { cpf } });
    if (!cpfRecord) return false;

    const ticket = `TKT-${Date.now()}`;

    await prisma.chamado.create({
      data: {
        ticket,
        nome,
        cpf,
        setor,
        descricao,
        prioridade: "normal",
        empresaId: cpfRecord.empresaId,
      },
    });

    return true;
  } catch {
    return false;
  }
}


//envio de mensagem para o whatsapp esta ok
export async function sendEvolutionText(instance: string, number: string, text: string) {
  const typingDelay = Math.min(Math.max(1000, text.length * 20), 3000);
  await fetch(`${process.env.EVOLUTION_API_URL}/message/sendText/${instance}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: process.env.EVOLUTION_API_KEY! },
    body: JSON.stringify({ number: number.replace("@s.whatsapp.net", ""), text, options: { delay: typingDelay, presence: "composing" } })
  });
}


//cpf funcionando corretamente
export async function validarCpf(cpf: string) {
  try {
    const cpfLimpo = cpf.replace(/\D/g, "");
    if (!cpfLimpo) return { valido: false };

    const { prisma } = await import("@/lib/prisma");

    const registro = await prisma.cpfs.findUnique({
      where: { cpf: cpfLimpo },
      select: { nome: true, cpf: true },
    });

    if (registro) {
      return { valido: true, nome: registro.nome, cpf: registro.cpf };
    }
    return { valido: false };
  } catch (err) {
    console.error("Erro ao validar CPF:", err);
    return { valido: false };
  }
}
 

