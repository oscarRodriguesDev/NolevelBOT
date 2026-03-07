import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SETORES = ["RH","TI","Financeiro","Comercial","Vendas","Suporte","Manutenção","Logística","Medicina","Segurança","Limpeza","Juridico"]

type FlowState =
| "inicio"
| "identificacao_cpf"
| "identificacao_nome"
| "menu_principal"
| "coletar_motivo"
| "escolher_abertura"
| "coletar_setor"

type UserSession = {
  state: FlowState
  nome?: string
  cpf?: string
  resumoHistorico?: string
  motivoAtual?: string
  lastInteraction: number
}

const sessions = new Map<string, UserSession>()

function saudacao(){
  const hora = new Date().getHours()
  if(hora>=5 && hora<12) return "Bom dia"
  if(hora>=12 && hora<18) return "Boa tarde"
  if(hora>=18 || hora<5) return "Boa noite"
  return "Olá"
}

async function buscarAvisos(){
  try{
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/quadro-avisos`,{cache:"no-store"})
    const data = await res.json()
    return data.map((a:{titulo:string;conteudo:string})=>`📢 ${a.titulo}: ${a.conteudo}`).join("\n") || "Sem avisos"
  }catch{
    return "Sem avisos"
  }
}

async function hevelynIA(session:UserSession,userInput:string,instrucaoEtapa:string,avisos:string=""){
  try{
    const response = await openai.chat.completions.create({
      model:"gpt-3.5-turbo",
      messages:[
        {
          role:"system",
          content:`
Você é a Hevelyn, assistente virtual da Nolevel.

REGRAS
- Linguagem humana e profissional
- Máximo 4 linhas por resposta
- Se a dúvida estiver nos avisos responda diretamente
- Só sugira abrir chamado se não houver solução

Colaborador: ${session.nome || "não identificado"}
Histórico: ${session.resumoHistorico || "nenhum"}

Avisos atuais:
${avisos}

Missão atual:
${instrucaoEtapa}

Inicie com ${saudacao()}
`
        },
        { role:"user",content:userInput }
      ],
      temperature:0.7
    })

    return response.choices[0].message.content || "Pode repetir?"
  }catch{
    return "Estou com uma instabilidade no momento."
  }
}

async function enviarChamado(nome:string,cpf:string,setor:string,descricao:string){
  try{
    const formData=new FormData()
    formData.append("nome",nome)
    formData.append("cpf",cpf)
    formData.append("setor",setor)
    formData.append("descricao",descricao)

    const res=await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tickets`,{
      method:"POST",
      body:formData
    })

    return res.ok
  }catch{
    return false
  }
}

async function StatusChamado(filtro:string){
  try{
    const isTicket = filtro.toUpperCase().includes("TKT") || filtro.length>11
    const param = isTicket ? `ticket=${filtro}` : `cpf=${filtro}`

    const url=`${process.env.NEXT_PUBLIC_BASE_URL}/api/tickets?${param}`

    const response = await fetch(url,{method:"GET"})
    if(!response.ok) return null

    return await response.json()
  }catch{
    return null
  }
}

export async function POST(req:NextRequest){

  const body = await req.json()
  const userInput = body.message?.trim() || ""
  const sessionId = body.sessionId || "web-user"

  let session = sessions.get(sessionId)

  if(!session){
    session={state:"inicio",lastInteraction:Date.now()}
    sessions.set(sessionId,session)
  }

  session.lastInteraction=Date.now()

  const lowerInput=userInput.toLowerCase()
  const avisos = await buscarAvisos()

  if(["obrigado","tchau","sair"].some(w=>lowerInput.includes(w))){
    sessions.delete(sessionId)
    return NextResponse.json({reply:"Sessão encerrada. Até logo!"})
  }

  switch(session.state){

    case "inicio":{
      const resp = await hevelynIA(session,userInput,"Dê boas vindas e peça o CPF.")
      session.state="identificacao_cpf"
      return NextResponse.json({reply:resp})
    }

    case "identificacao_cpf":{
      const cpf = userInput.replace(/\D/g,"")

      if(cpf.length>=11){
        session.cpf=cpf
        session.state="identificacao_nome"
        return NextResponse.json({reply:"CPF validado. Como posso te chamar?"})
      }

      return NextResponse.json({reply:"Digite os 11 números do CPF."})
    }

    case "identificacao_nome":{
      session.nome=userInput
      session.state="menu_principal"

      const resp = await hevelynIA(
        session,
        userInput,
        "Apresente o menu: 1 abrir chamado, 2 status, 3 avisos."
      )

      return NextResponse.json({reply:resp})
    }

    case "menu_principal":{

      if(userInput==="1"){
        session.state="coletar_motivo"
        return NextResponse.json({reply:"Descreva o problema."})
      }

      if(userInput==="2"){
        if(!session.cpf) return NextResponse.json({reply:"CPF não identificado."})

        const status = await StatusChamado(session.cpf)

        if(status?.length){
          const lista = status.map((t:{ticket:string;status:string})=>`${t.ticket} - ${t.status}`).join("\n")
          return NextResponse.json({reply:`Status:\n${lista}`})
        }

        return NextResponse.json({reply:"Nenhum chamado encontrado."})
      }

      if(userInput==="3"){
        return NextResponse.json({reply:avisos})
      }

      const resp = await hevelynIA(session,userInput,"Responda a dúvida ou peça para escolher opção do menu.",avisos)
      return NextResponse.json({reply:resp})
    }

    case "coletar_motivo":{
      session.motivoAtual=userInput
      session.state="escolher_abertura"

      return NextResponse.json({
        reply:"Deseja abrir o chamado?\n1 Sim\n2 Cancelar"
      })
    }

    case "escolher_abertura":{
      if(userInput==="1"){
        session.state="coletar_setor"
        return NextResponse.json({reply:`Escolha o setor:\n${SETORES.join(", ")}`})
      }

      session.state="menu_principal"
      return NextResponse.json({reply:"Cancelado. Escolha:\n1 Abrir\n2 Status\n3 Avisos"})
    }

    case "coletar_setor":{
      const setor = SETORES.find(s=>lowerInput.includes(s.toLowerCase()))

      if(!setor){
        return NextResponse.json({reply:`Escolha um setor válido:\n${SETORES.join(", ")}`})
      }

      const ok = await enviarChamado(
        session.nome!,
        session.cpf!,
        setor,
        session.motivoAtual!
      )

      session.state="menu_principal"

      if(ok){
        return NextResponse.json({
          reply:`Chamado aberto para ${setor}.`
        })
      }

      return NextResponse.json({
        reply:"Erro ao criar chamado."
      })
    }

  }

  return NextResponse.json({reply:"Erro"})
}