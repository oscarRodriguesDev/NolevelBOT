import { buscarAvisos,StatusChamado,saudacao } from "./usedata";
import OpenAI from "openai";

// alterando config atoa
//tudo abaixo precisa começar a ser informado na rota, para que a função hevelynIA fique mais limpa e focada apenas em gerar a resposta da IA, recebendo o contexto já processado.
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const FlowState = {
  INICIO: "inicio",
  IDENTIFICACAO_CPF: "identificacao_cpf",
  IDENTIFICACAO_NOME: "identificacao_nome",
  MENU_PRINCIPAL: "menu_principal",
  COLETAR_MOTIVO: "coletar_motivo",
  VERIFICAR_AVISOS: "verificar_aviso",
  ESCOLHER_ABERTURA: "escolher_abertura",
  COLETAR_SETOR: "coletar_setor"
} as const;

const empresa = 'Nolevel'; //buscar o nome da empresa no bd
const LINK_PORTAL = process.env.NEXT_PUBLIC_BASE_URL
const LINK_CHAMADOS = `${LINK_PORTAL}/chamado`; 
const lINK_CONSULTA = `${LINK_PORTAL}/consulta`;

type FlowStateValues = typeof FlowState[keyof typeof FlowState];
type UserSession = {
  state: FlowStateValues;
  nome?: string;
  cpf?: string;
  resumoHistorico?: string;
  motivoAtual?: string;
  lastInteraction: number;
};


//função hevelynIA recebe o contexto já processado e gera a resposta da IA, mantendo a função limpa e focada apenas na geração de resposta, sem se preocupar com a lógica de negócios ou coleta de dados.   


/* 
export async function botIA(session: UserSession, userInput: string, instrucaoEtapa: string,avisos:string) {

  const statusAtual = session.cpf ? await StatusChamado(session.cpf) : "Nenhum CPF informado";
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
            Você é a Hevelyn, atendente virtual da ${empresa}. 
            PERSONA: Cordial, empática e direta. Use a saudação: ${saudacao()}.
            
            DIRETRIZ DE AVISOS (CRÍTICO):
          
            - Se o relato do usuário bater com um aviso, explique a situação e pergunte se quer continuar.
            - Se não houver aviso relacionado, responda apenas: PROSSEGUIR_FLUXO.

            CONTEXTO DO USUÁRIO:
            - Nome: ${session.nome || "Ainda não informado"}
            - CPF: ${session.cpf || "Ainda não informado"}
              Antes de qualquer abertura de chamado, verifique os avisos: ${avisos}.
            - Chamados Atuais: ${JSON.stringify(statusAtual)}
            
            ETAPA ATUAL: ${session.state}
            INSTRUÇÃO ESPECÍFICA: ${instrucaoEtapa}

           se na etapa de coleta de motivo, perceber que o usuario precisa fazer upload de qualquer documento ou arquivo, 
           diga a ele de forma clara e direta exatamente a seguinte frase: Para enviar o documento, acesse : ${LINK_CHAMADOS} 
            e clique em "Registrar Novo Chamado". Lá você poderá preencher os dados e anexar o arquivo necessário.

            ENCERRAMENTO E LINKS (IMPORTANTE):
            - Sempre que encerrar ou oferecer ajuda extra, apresente os links de forma clara e direta.
            - Para garantir que sejam clicáveis no chat, envie a URL completa e pura.
            - Link para abertura: ${LINK_CHAMADOS}
            - Link para consulta: ${lINK_CONSULTA}
            - Exemplo de formato: "Você também pode acessar nosso portal: ${LINK_CHAMADOS}"
          `
        },
        { role: "user", content: userInput }
      ],
      temperature: 0.5
    })
    return response.choices[0].message.content || "Pode repetir, por favor?"
  } catch { return "Tive um probleminha técnico, mas pode continuar." }
}

 */

export async function botIA(
  session: UserSession,
  userInput: string,
  instrucaoEtapa: string,
  avisos: string
) {
  const statusAtual = session.cpf
    ? await StatusChamado(session.cpf)
    : "Nenhum CPF informado"

  const isColetarMotivo = session.state === "coletar_motivo"

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Você é a Hevelyn, atendente virtual da ${empresa}.
PERSONA: cordial, empática e direta. Use a saudação: ${saudacao()}.

REGRAS GERAIS:
- Seja objetiva.
- Não invente informações.
- Siga exatamente a instrução da etapa.

${isColetarMotivo ? `
REGRA DE AVISOS (OBRIGATÓRIA NESTA ETAPA):
- Compare o relato do usuário com os avisos abaixo.
- Se houver relação clara, explique o aviso e pergunte se deseja continuar.
- Se NÃO houver relação, responda EXATAMENTE: PROSSEGUIR_FLUXO
- NÃO misture PROSSEGUIR_FLUXO com outras frases.

AVISOS:
${avisos}
` : ""}

CONTEXTO DO USUÁRIO:
- Nome: ${session.nome || "Não informado"}
- CPF: ${session.cpf || "Não informado"}
- Chamados atuais: ${JSON.stringify(statusAtual)}

ETAPA ATUAL: ${session.state}
INSTRUÇÃO: ${instrucaoEtapa}

UPLOAD:
Se o usuário precisar enviar arquivos, responda exatamente:
Para enviar o documento, acesse: ${LINK_CHAMADOS}
e clique em "Registrar Novo Chamado". Lá você poderá preencher os dados e anexar o arquivo necessário.

LINKS:
- Abertura: ${LINK_CHAMADOS}
- Consulta: ${lINK_CONSULTA}
- Sempre envie URLs completas.
          `
        },
        {
          role: "user",
          content: userInput
        }
      ],
      temperature: 0.3
    })

    return response.choices[0].message.content || "Pode repetir, por favor?"
  } catch {
    return "Tive um probleminha técnico, mas pode continuar."
  }
}