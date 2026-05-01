
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
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

export async function buscarAvisos(cpf?: string, req?: Request) {
  try {
    const res = await fetch(`${baseUrl}/api/quadro-avisos/mostrar-avisos?cpf=${cpf || ""}`, {
      headers: {
        cookie: req?.headers.get("cookie") || "",
      },
    });

    if (!res.ok) return "Sem avisos no momento.";

    type Aviso = { titulo: string; conteudo: string };
    const data: Aviso[] = await res.json();

    return data.length > 0
      ? data.map(a => `📢 *${a.titulo}*: ${a.conteudo}`).join("\n")
      : "Sem avisos.";
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
export async function StatusChamado(filtro: string, req?: Request) {
  try {
    const isTicket = filtro.toUpperCase().includes("TKT") || filtro.length > 11;
    const param = isTicket ? `ticket=${filtro}` : `cpf=${filtro}`;
    const url = `${baseUrl}/api/tickets/search?${param}`;
    console.log(url)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        cookie: req?.headers.get("cookie") || "",
      },
    });

    if (!response.ok) return [];

    return await response.json();
  } catch (error) {

    console.error("Erro ao buscar status do chamado:", error);
    return [];
  }
}


//enviar o chamado
export async function enviarChamado(nome: string, cpf: string, setor: string, descricao: string) {
  try {
    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('cpf', cpf);
    formData.append('setor', setor);
    formData.append('descricao', descricao);
    const res = await fetch(`${baseUrl}/api/tickets`, { method: "POST", body: formData });
    return res.ok;
  } catch { return false; }
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

    const res = await fetch(`${baseUrl}/api/cpfs/general_cpf?cpf=${cpfLimpo}`);

    if (!res.ok) return { valido: false };

    const data = await res.json();

    // Lógica para lidar tanto com Array quanto com Objeto único
    if (Array.isArray(data)) {
      const registro = data.find(r => r.cpf.replace(/\D/g, "") === cpfLimpo);
      if (registro) {
        return { valido: true, nome: registro.nome, cpf: registro.cpf };
      }
    } else if (data && data.valido) {
      // Se a API já retorna o objeto no formato {"valido": true, ...}
      return {
        valido: true,
        nome: data.nome,
        cpf: data.cpf
      };
    }
    return { valido: false };
  } catch (err) {
    console.error("Erro ao validar CPF na API:", err);
    return { valido: false };
  }
}
 

