const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://nolevel-bot.vercel.app";

// 1. Buscar os avisos no banco
export async function buscarAvisos() {
  try {
    const res = await fetch(`${baseUrl}/api/quadro-avisos`, { cache: 'no-store' });
    if (!res.ok) return "Sem avisos no momento.";
    
    type Aviso = { titulo: string; conteudo: string };
    const data: Aviso[] = await res.json();
    
    return data
      .map(a => `📢 *${a.titulo}*: ${a.conteudo}`)
      .join("\n") || "Sem avisos.";
  } catch (error) {
    console.error("Erro buscarAvisos:", error);
    return "Sem avisos no momento.";
  }
}

// 2. Gerador de tickets
export function generateRandomTicket() {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(-2);
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  const ms = String(now.getMilliseconds()).padStart(3, "0");
  return `TKT-${dd}${mm}${yy}${hh}${min}${ss}${ms}`;
}

// 3. Buscar memória do bot
export async function getMemoria(cpf: string) {
  try {
    const res = await fetch(`${baseUrl}/api/memories?cpf=${cpf}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.resumo || null;
  } catch (error) {
    console.error("Erro getMemoria:", error);
    return null;
  }
}

// 4. Salvar memória do bot
export async function saveMemoria(cpf: string, nome: string, resumo: string) {
  try {
    await fetch(`${baseUrl}/api/memories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cpf, nome, resumo }),
    });
  } catch (error) {
    console.error("Erro saveMemoria:", error);
  }
}

// 5. Saudação (Corrigida a lógica de retorno)
export function saudacao() {
  const hora = new Date().getHours();
  if (hora >= 5 && hora < 12) return "Bom dia";
  if (hora >= 12 && hora < 18) return "Boa tarde";
  return "Boa noite";
}

// 6. Status dos chamados
export async function StatusChamado(filtro: string) {
  try {
    const isTicket = filtro.toUpperCase().includes("TKT") || filtro.length > 11;
    const param = isTicket ? `ticket=${filtro}` : `cpf=${filtro}`;
    const res = await fetch(`${baseUrl}/api/tickets?${param}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Erro StatusChamado:", error);
    return null;
  }
}

// 7. Enviar o chamado (Ajustado FormData)
export async function enviarChamado(nome: string, cpf: string, setor: string, descricao: string) {
  try {
    // Se a sua API espera JSON em vez de FormData, mude aqui. 
    // Como você usou FormData, mantive, mas adicionei o ticket caso sua API exija.
    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('cpf', cpf);
    formData.append('setor', setor);
    formData.append('descricao', descricao);
    formData.append('ticket', generateRandomTicket());

    const res = await fetch(`${baseUrl}/api/tickets`, { 
      method: "POST", 
      body: formData 
    });
    return res.ok;
  } catch (error) {
    console.error("Erro enviarChamado:", error);
    return false;
  }
}

// 8. Enviar Evolution (WhatsApp)
export async function sendEvolutionText(instance: string, number: string, text: string) {
  try {
    const typingDelay = Math.min(Math.max(1000, text.length * 20), 3000);
    const cleanNumber = number.replace(/\D/g, ""); // Remove @s.whatsapp.net etc

    await fetch(`${process.env.EVOLUTION_API_URL}/message/sendText/${instance}`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        apikey: process.env.EVOLUTION_API_KEY || "" 
      },
      body: JSON.stringify({ 
        number: cleanNumber, 
        text, 
        options: { delay: typingDelay, presence: "composing" } 
      })
    });
  } catch (error) {
    console.error("Erro sendEvolutionText:", error);
  }
}

// 9. Validar CPF (Sua rota GET)
export async function validarCpf(cpf: string) {
  try {
    const cpfLimpo = cpf.replace(/\D/g, "");
    if (!cpfLimpo) return { valido: false };

    const res = await fetch(`${baseUrl}/api/cpfs?cpf=${cpfLimpo}`, { 
      cache: 'no-store',
      method: 'GET'
    });

    if (!res.ok) return { valido: false };

    const dados = await res.json();

    if (dados && dados.valido) {
      return { 
        valido: true, 
        nome: dados.nome, 
        cpf: dados.cpf 
      };
    }
    return { valido: false };
  } catch (err) {
    console.error("Erro validarCpf:", err);
    return { valido: false, error: "Erro de conexão" };
  }
}