// Script de utilitário: cria chamados MOCK de terceiros (tipo TERCEIRO) para testes
// Uso:
//   node --env-file=.env scripts/mock-terceiros.mjs list
//   node --env-file=.env scripts/mock-terceiros.mjs insert --empresa=<id> [--atendente=<id>] [--quantidade=25] [--apagar]
//   node --env-file=.env scripts/mock-terceiros.mjs limpar --ticket-prefixo=TKT-MOCK
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const BASE_TICKET = "TKT-MOCK"

const NOMES = [
  "Carlos Andrade Nunes",
  "Fernanda Lima Ribeiro",
  "João Batista Oliveira",
  "Mariana Costa Duarte",
  "Roberto Almeida Santos",
  "Patrícia Souza Melo",
  "André Carvalho Pinto",
  "Juliana Ferreira Gomes",
  "Ricardo Barbosa Leal",
  "Camila Rocha Teixeira",
  "Eduardo Martins Correia",
  "Beatriz Mendes Barros",
  "Fábio Nogueira Sales",
  "Larissa Cardoso Freitas",
  "Gustavo Henrique Moura",
  "Aline Duarte Vasconcelos",
  "Thiago Augusto Farias",
  "Renata Prado Silveira",
  "Marcelo Vieira Castro",
  "Isabela Monteiro Dias",
  "Paulo César Ramos",
  "Vanessa Lopes Brito",
  "Sérgio Menezes Chaves",
  "Débora Campos Rezende",
  "Otávio Guedes Pires",
]

const DESCRICOES_CORPORATIVO = [
  "Computador não liga ao pressionar o botão de energia; já verifiquei a tomada e o cabo.",
  "Sem acesso ao sistema corporativo após alteração de senha; erro de credenciais.",
  "Impressora do setor está com atolamento de papel recorrente e trava a fila de impressão.",
  "Internet do ponto de trabalho cai várias vezes ao longo do dia.",
  "Preciso de treinamento no novo módulo de relatórios do sistema.",
  "Monitor apresenta linhas verticais na tela e pisca com frequência.",
  "E-mail corporativo não sincroniza no Outlook e fica offline.",
  "Solicito instalação do pacote Office no computador novo do setor.",
  "Acesso à pasta compartilhada da rede está negado para meu usuário.",
  "Mouse e teclado sem funcionamento após reinício da máquina.",
  "Sistema corporativo está lento ao abrir o cadastro de clientes.",
  "Dúvida sobre como lançar horas extras no novo fluxo de ponto.",
  "Notebook não conecta no Wi-Fi corporativo; rede não aparece.",
  "Preciso de segunda via do crachá de acesso ao prédio.",
  "Relatório mensal do setor não gera em PDF pelo sistema.",
  "Cabeamento da minha estação está solto e desconectando o teclado.",
  "Software de gestão fecha sozinho ao salvar um chamado.",
  "Solicito acesso de leitura ao dashboard financeiro.",
  "Telefone do setor está mudo no ramal de entrada.",
  "Arquivos da pasta de trabalho estão sumindo após atualização do sistema.",
  "Sistema não reconhece minha matrícula ao tentar recuperar senha.",
  "Preciso de ajuste de permissão para aprovar férias no portal.",
  "Escaneadora não comunica com o driver instalado.",
  "Problema com o certificado digital no navegador do posto.",
  "Solicitação de novo acessório (headset) para atendimento remoto.",
]

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function dataAleatoria(diasMax) {
  const d = new Date()
  d.setDate(d.getDate() - Math.floor(Math.random() * diasMax))
  d.setHours(Math.floor(Math.random() * 10) + 8, Math.floor(Math.random() * 60), 0, 0)
  return d
}

function cpfAleatorio() {
  let c = ""
  for (let i = 0; i < 11; i++) c += Math.floor(Math.random() * 10)
  return c
}

function gerarHistorico(dataCriacao, status) {
  const itens = [
    { data: dataCriacao.toISOString(), acao: "CRIADO", observacao: "Chamado registrado (mock)" },
  ]
  if (status !== "NOVO") {
    itens.push({
      data: new Date(dataCriacao.getTime() + 60 * 60 * 1000).toISOString(),
      acao: "EM_ATENDIMENTO",
      observacao: "Atendimento iniciado pelo suporte (mock)",
    })
  }
  if (status === "CONCLUIDO") {
    itens.push({
      data: new Date(dataCriacao.getTime() + 4 * 60 * 60 * 1000).toISOString(),
      acao: "CONCLUIDO",
      observacao: "Chamado finalizado (mock)",
    })
  }
  if (status === "CANCELADO") {
    itens.push({
      data: new Date(dataCriacao.getTime() + 2 * 60 * 60 * 1000).toISOString(),
      acao: "CANCELADO",
      observacao: "Chamado cancelado (mock)",
    })
  }
  return JSON.stringify(itens)
}

async function listar() {
  const empresas = await prisma.empresa.findMany({
    select: {
      id: true,
      nome: true,
      setores: true,
      modulos: true,
      _count: { select: { chamados: true, colaboradores: true } },
    },
  })

  console.log("\n=== EMPRESAS (não insere nada) ===\n")
  for (const e of empresas) {
    const atendentes = await prisma.user.findMany({
      where: { empresaId: e.id, role: { in: ["ATENDENTE", "GESTOR", "ADMIN", "GOD"] } },
      select: { id: true, name: true, role: true, setor: true },
    })
    console.log(`- ${e.nome} (id: ${e.id})`)
    console.log(`  modulos: ${(e.modulos || []).join(", ") || "nenhum"}`)
    console.log(`  chamados: ${e._count.chamados} | colaboradores: ${e._count.colaboradores}`)
    console.log(`  setores: ${e.setores.join(", ") || "—"}`)
    if (atendentes.length === 0) {
      console.log("  ⚠️  ATENDENTES: nenhum")
    } else {
      console.log(`  atendentes: ${atendentes.length}`)
      for (const a of atendentes.slice(0, 5)) {
        console.log(`    - ${a.name} (${a.role}, ${a.setor}) id: ${a.id}`)
      }
    }
    console.log("")
  }
}

async function inserir({ empresaParam, atendenteParam, quantidade, apagar }) {
  const empresa = await prisma.empresa.findFirst({
    where: { OR: [{ id: empresaParam }, { nome: { equals: empresaParam, mode: "insensitive" } }] },
    select: { id: true, nome: true, setores: true },
  })
  if (!empresa) {
    console.error(`❌ Empresa não encontrada: ${empresaParam}`)
    return
  }

  let atendente = null
  if (atendenteParam) {
    atendente = await prisma.user.findFirst({ where: { id: atendenteParam, empresaId: empresa.id } })
    if (!atendente) {
      console.error(`❌ Atendente não encontrado na empresa: ${atendenteParam}`)
      return
    }
  } else {
    atendente = await prisma.user.findFirst({
      where: { empresaId: empresa.id, role: { in: ["ATENDENTE", "GESTOR", "ADMIN", "GOD"] } },
    })
  }

  if (apagar) {
    const del = await prisma.chamado.deleteMany({
      where: { empresaId: empresa.id, ticket: { startsWith: BASE_TICKET } },
    })
    await prisma.colaboradores.deleteMany({
      where: { empresaId: empresa.id, criadoPorUserId: null },
    })
    console.log(`🗑️  Removidos ${del.count} chamados mock existentes (${empresa.nome})`)
  }

  const qtd = parseInt(quantidade, 10) || 25
  console.log(`\n✅ Inserindo ${qtd} chamados TERCEIRO mock em: ${empresa.nome}`)
  console.log(`   Atendente padrão: ${atendente ? `${atendente.name} (${atendente.id})` : "NENHUM (atendenteId nulo)"}`)
  console.log(`   Setores disponíveis: ${empresa.setores.join(", ") || "—"}`)

  const criar= []
  for (let i = 0; i < qtd; i++) {
    const nome = NOMES[i % NOMES.length]
    const comCpf = Math.random() > 0.35 // ~65% têm CPF cadastrado
    const comMatricula = Math.random() > 0.4
    const cpf = comCpf ? cpfAleatorio() : null

    const colaborador = await prisma.colaboradores.create({
      data: {
        empresaId: empresa.id,
        nome,
        matricula: comMatricula ? String(1000 + Math.floor(Math.random() * 9000)) : null,
        cpf,
        telefone: Math.random() > 0.7 ? "55" + String(Math.floor(Math.random() * 900000000) + 100000000) : null,
        criadoPorUserId: atendente?.id || null,
      },
    })

    const prioridades = ["baixa", "normal", "normal", "alta"]
    const prioridade = pick(prioridades)
    const setor = empresa.setores.length > 0 ? pick(empresa.setores) : "Geral"
    const status = pick(["NOVO", "NOVO", "EM_ATENDIMENTO", "EM_ATENDIMENTO", "AGUARDANDO", "CONCLUIDO", "CONCLUIDO", "CANCELADO"])
    const createdAt = dataAleatoria(45)

    const chamado = await prisma.chamado.create({
      data: {
        ticket: `${BASE_TICKET}-${1000 + i}`,
        nome,
        cpf,
        tipo: "TERCEIRO",
        colaboradorId: colaborador.id,
        setor,
        descricao: DESCRICOES_CORPORATIVO[i % DESCRICOES_CORPORATIVO.length],
        historico: gerarHistorico(createdAt, status),
        status,
        prioridade,
        atendenteId: atendente?.id || null,
        empresaId: empresa.id,
        createdAt,
        updatedAt: createdAt,
      },
    })
    criar.push({ ticket: chamado.ticket, nome, status, setor })
  }

  console.log(`\n${criar.length} chamados criados:`)
  for (const c of criar) console.log(`  - ${c.ticket} | ${c.nome} | ${c.status} | ${c.setor}`)
}

async function limpar(prefixo) {
  const delChamados = await prisma.chamado.deleteMany({
    where: { ticket: { startsWith: prefixo || BASE_TICKET } },
  })
  console.log(`🗑️  Removidos ${delChamados.count} chamados com ticket ${prefixo || BASE_TICKET}*`)
}

const [cmd, ...args] = process.argv.slice(2)
const opt = {}
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith("--")) {
    let key = args[i].slice(2)
    if (key.includes("=")) {
      const [k, v] = key.split("=")
      opt[k] = v
    } else {
      opt[key] = args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true
      if (opt[key] !== true) i++
    }
  }
}

;(async () => {
  try {
    if (cmd === "list") {
      await listar()
    } else if (cmd === "insert") {
      await inserir({
        empresaParam: opt.empresa,
        atendenteParam: opt.atendente,
        quantidade: opt.quantidade,
        apagar: opt.apagar === true,
      })
    } else if (cmd === "limpar") {
      await limpar(opt["ticket-prefixo"])
    } else {
      console.log("Comandos: list | insert --empresa=<id> [--atendente=<id>] [--quantidade=N] [--apagar] | limpar --ticket-prefixo=TKT-MOCK")
    }
  } catch (err) {
    console.error("❌ Erro:", err)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
})()