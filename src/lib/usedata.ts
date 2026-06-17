import crypto from "crypto";

const baseUrl = process.env.BASE_URL_WP||process.env.NEXT_PUBLIC_BASE_URL_WP;


async function filtrarAvisosValidos(avisos: { titulo: string; conteudo: string; createdAt: Date; duracao: string | null }[]) {
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

  return validos;
}

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

    const validos = await filtrarAvisosValidos(avisos);

    if (validos.length === 0) return "Sem avisos.";

    return validos.map(a => `📢 *${a.titulo}*: ${a.conteudo}`).join("\n");
  } catch {
    return "Sem avisos no momento.";
  }
}

export async function buscarAvisosPorCpf(cpf: string) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { getEmpresaIdByCpf } = await import("@/lib/searchEmpresa");

    const empresaId = await getEmpresaIdByCpf(cpf);
    if (!empresaId) return "Sem avisos.";

    const avisos = await prisma.avisos.findMany({
      where: { empresaId },
      orderBy: { createdAt: "desc" },
    });

    const validos = await filtrarAvisosValidos(avisos);

    const cpfNumbers = cpf.replace(/\D/g, "");
    const especificos = validos.filter(a =>
      a.titulo.includes(cpfNumbers) || a.conteudo.includes(cpfNumbers)
    );

    if (especificos.length === 0) return "Sem avisos.";

    return especificos.map(a => `📢 *${a.titulo}*: ${a.conteudo}`).join("\n");
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
    const headers: Record<string, string> = { "x-api-key": process.env.BOT_API_KEY || "" }
    const res = await fetch(`${baseUrl}/api/memories?cpf=${cpf}`, { cache: 'no-store', headers });
    return res.ok ? (await res.json())?.resumo : null;
  } catch { return null; }
}


//salvar memoria do bot
export async function saveMemoria(cpf: string, nome: string, resumo: string) {
  try {
    await fetch(`${baseUrl}/api/memories`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.BOT_API_KEY || "" },
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
export async function enviarChamado(nome: string, cpf: string, setor: string, descricao: string, anexoUrl?: string) {
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
        ...(anexoUrl && { anexoUrl }),
      },
    });

    return true;
  } catch {
    return false;
  }
}

const MEDIA_HKDF_MAP: Record<string, string> = {
  image: "Image", document: "Document", video: "Video",
  audio: "Audio", sticker: "Image", gif: "Video",
};

function toBuffer(val: any): Buffer | undefined {
  if (!val) return undefined;
  if (val instanceof Buffer) return val;
  if (val instanceof Uint8Array) return Buffer.from(val);
  if (typeof val === "string") return Buffer.from(val, "base64");
  if (Array.isArray(val)) return Buffer.from(val);
  if (val.type === "Buffer" && Array.isArray(val.data)) return Buffer.from(val.data);
  return undefined;
}

export async function downloadWhatsAppMedia(mediaMessage: any): Promise<Buffer | null> {
  try {
    const { url, directPath, mediaKey: rawKey, mimetype } = mediaMessage || {};
    if (!url && !directPath) { console.error("[WAMedia] No url/directPath"); return null; }
    const mediaKey = toBuffer(rawKey);
    if (!mediaKey) { console.error("[WAMedia] No mediaKey"); return null; }

    const type = mimetype?.startsWith("image") ? "image"
      : mimetype?.startsWith("video") ? "video"
      : mimetype?.startsWith("audio") ? "audio"
      : "document";
    const info = `WhatsApp ${MEDIA_HKDF_MAP[type] || "Document"} Keys`;

    const expanded = Buffer.from(crypto.hkdfSync("sha256", mediaKey, Buffer.alloc(0), info, 112));
    const iv = expanded.subarray(0, 16);
    const cipherKey = expanded.subarray(16, 48);

    const downloadUrl = url || (directPath
      ? `https://mmg.whatsapp.net${directPath.startsWith("/") ? "" : "/"}${directPath}`
      : null);
    if (!downloadUrl) { console.error("[WAMedia] No download URL"); return null; }

    console.error(`[WAMedia] Baixando ${downloadUrl}`);
    const res = await fetch(downloadUrl, { headers: { Origin: "https://web.whatsapp.com" } });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[WAMedia] HTTP ${res.status}, body=${text.substring(0, 200)}`);
      return null;
    }

    const encrypted = Buffer.from(await res.arrayBuffer());
    console.error(`[WAMedia] Baixado ${encrypted.length} bytes, content-type=${res.headers.get("content-type")}`);

    if (encrypted.length === 0 || encrypted.length % 16 !== 0) {
      console.error(`[WAMedia] Tamanho inválido: ${encrypted.length} (precisa ser múltiplo de 16)`);
      return null;
    }

    const decipher = crypto.createDecipheriv("aes-256-cbc", cipherKey, iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    const plaintext = decrypted.subarray(0, decrypted.length - 32);
    console.error(`[WAMedia] OK, ${plaintext.length} bytes`);
    return Buffer.from(plaintext);
  } catch (err: any) {
    console.error(`[WAMedia] Error: ${err.message}`);
    return null;
  }
}

export async function downloadEvolutionMedia(
  instance: string,
  key: { id: string; remoteJid: string; fromMe: boolean },
  base64Override?: string,
  mediaMessage?: any
): Promise<Buffer | null> {
  const msgId = key?.id || "unknown";
  console.error(`[downloadMedia] msgId=${msgId} hasBase64=${!!base64Override} hasMediaMsg=${!!mediaMessage}`);

  try {
    if (base64Override) {
      const buf = Buffer.from(base64Override, "base64");
      console.error(`[downloadMedia] base64 OK, ${buf.length} bytes`);
      return buf;
    }

    if (mediaMessage?.url || mediaMessage?.directPath) {
      const buf = await downloadWhatsAppMedia(mediaMessage);
      if (buf) return buf;
    }

    console.error(`[downloadMedia] REST Evolution...`);

    const headers = { "Content-Type": "application/json", apikey: process.env.EVOLUTION_API_KEY! };
    const urlEvolution = process.env.EVOLUTION_API_URL || "https://evolution.nolevel.hiskra.com.br/";

    // V1: /chat/downloadMediaMessage/{instance}
    const body = {
      key,
      message: { imageMessage: mediaMessage },
      contextInfo: undefined,
    };
    const res = await fetch(`${urlEvolution}/chat/downloadMediaMessage/${instance}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    if (res.ok) return Buffer.from(await res.arrayBuffer());

    console.error(`[downloadMedia] REST downloadMediaMessage falhou (${res.status}), tentando getBase64...`);

    // V2: /chat/getBase64FromMediaMessage/{instance}
    const res2 = await fetch(`${urlEvolution}/chat/getBase64FromMediaMessage/${instance}`, {
      method: "POST",
      headers,
      body: JSON.stringify({ message: { key } }),
    });
    if (res2.ok) {
      const data = await res2.json() as any;
      const b64 = data?.base64 || data?.media || (typeof data === "string" ? data : null);
      if (b64) return Buffer.from(b64, "base64");
      console.error(`[downloadMedia] getBase64 sem base64 no response`);
      return null;
    }

    console.error(`[downloadMedia] REST getBase64 falhou (${res2.status})`);
    return null;
  } catch (error) {
    console.error("Erro ao baixar mídia:", error);
    return null;
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



export async function checkEmpresaModule(
  empresaId: string,
  modulo: "OFICINA" | "CORPORATIVO" | "EVENTOS"
): Promise<{ hasModule: boolean; activeModules: string[] }> {
  try {
    const { prisma } = await import("@/lib/prisma");
    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
      select: { modulos: true },
    });
    if (!empresa) return { hasModule: false, activeModules: [] };
    const modulos = empresa.modulos as string[];
    return {
      hasModule: modulos.includes(modulo),
      activeModules: modulos,
    };
  } catch {
    return { hasModule: false, activeModules: [] };
  }
}

export async function getNomeBot(cpf: string) {
  try {
    const { prisma } = await import("@/lib/prisma");

    const cpfData = await prisma.cpfs.findUnique({
      where: { cpf },
      select: {
        Empresa: {
          select: {
            botName: true,
          },
        },
      },
    });

    return cpfData?.Empresa?.botName?.trim() || "Hevelyn";
  } catch (err) {
    console.error("Erro ao obter nome do bot:", err);
    return "Hevelyn";
  }
}

