# CHECKPOINT - Histórico de Commits

## Branch: `vibecode`

## Commits Anteriores (até 14/05/2026)

| # | Hash | Mensagem | Data |
|---|------|----------|------|
| 1 | `6f5ecf5` | voltando as config de um bd apenas | - |
| 2 | `4ff2732` | esqueci de salvar rota de cpf | - |
| 3 | `a6a6213` | teste | - |
| 4 | `9d74606` | teste deploy | - |
| 5 | `3fac21d` | teste deploy 2 | - |
| 6 | `ada13b0` | Merge branch 'oscar' of https://github.com/oscarRodriguesDev/NolevelBOT | - |
| 7 | `fd46790` | hotfix:ajustando post de cpfs | - |
| 8 | `ceb5b69` | create enviroment - homologação | - |
| 9 | `4233f7e` | tentativa 2 deploy homologação | - |
| 10 | `5ded5cf` | terceira tentativa | - |
| 11 | `b9e649c` | quarta tentativa | - |
| 12 | `705abd2` | quinta tentativa | - |
| 13 | `fed26e6` | sexta tentativa | - |
| 14 | `ecc69f2` | fix: atualizações do projeto, vai quebrar pois a url base para o bot ainda não foi atualizada no server | - |
| 15 | `e79d9da` | completion | - |
| 16 | `89b862e` | fix: tentando solucionar problema no bot whatsapp | - |
| 17 | `976dca4` | fix:rota para consulta de cpfs alterada | - |
| 18 | `937c9db` | fix: corrigindo problema de busca de setores | - |
| 19 | `1ba4ce8` | ajuste na busca por setores | - |
| 20 | `27d7ef6` | fix: todas as referencias a url da vercel, removidas | - |
| 21 | `ec2fbfb` | fix: problemas de chamada de api resolvidos | - |
| 22 | `0c52e50` | fix: problemas de chamada de api resolvidos | - |
| 23 | `9ba6480` | tentado subir conrainer corrigido | - |
| 24 | `de9b533` | fix: mudanças para tentar conexão com rota | - |
| 25 | `89ba539` | tentando corrigir rotas erradas 1 | - |
| 26 | `066e5f7` | logando em auth | - |
| 27 | `92b3208` | fix: ultimo antes do opencode | - |
| 28 | `357365b` | melhorarando adição de priemeiro usuraio | - |
| 29 | `61196c0` | fix: resolve problem in webhook and in chat' | - |
| 30 | `38d7684` | final | - |

## Commits em outros branches (não mesclados)

| Hash | Mensagem |
|------|----------|
| `393e193` | testes |
| `45afbea` | alteração muito importante |
| `548e04c` | alterando nome do container |
| `ee89008` | acerto |
| `25417bb` | teste |

---

## Sessão Atual: 17/05/2026

### Pendentes antes do commit:
- ~~`src/app/api/leads-network/route.ts` - POST agora detecta eventos Evolution e faz proxy para webhook-leads~~ ✅
- ~~`src/app/api/webhook-leads/route.ts` - Corrigido fetch relativo para URL absoluta~~ ✅
- ~~`memorias.md` - Adicionada seção 15 com documentação das correções~~ ✅
- ~~`src/app/api/webhook-leads/route.ts` - Refatorado: bot vira representante NoLevel, matching inteligente PT-BR~~ ✅
- ~~`src/app/api/webhook-leads/route.ts` - IA resume/naturaliza respostas dos avisos (gerarRespostaComAviso + gerarRespostaFallback)~~ ✅
- ~~`memorias.md` - Seção 16 atualizada com nova estratégia de IA~~ ✅

### Commits realizados nesta sessão:

| # | Hash | Mensagem | Data |
|---|------|----------|------|
| 1 | `f20b837` | feat: captura de leads, docs do projeto, e melhorias no modal de usuario | 14/05/2026 |
| 2 | `adac2df` | fix: renomeia routes.ts para route.ts e corrige fetch em /leads | 14/05/2026 |
| 3 | `18ae14b` | feat: webhook-leads para captacao de leads em eventos/feiras | 14/05/2026 |
| 4 | `7b12a7d` | fix: leads-network reconhece webhook Evolution + fetch absoluto webhook-leads | 17/05/2026 |
| 5 | `8f34c05` | docs: atualiza checkpoint com hash do commit 7b12a7d | 17/05/2026 |
| 6 | `c367506` | refactor: webhook-leads como representante NoLevel, matching PT-BR inteligente, economia de IA | 17/05/2026 |
| 7 | `1060981` | docs: atualiza checkpoint com hash do commit c367506 | 17/05/2026 |
| 8 | `958a120` | refactor: webhook-leads IA resume e naturaliza respostas dos avisos | 17/05/2026 |
| 9 | `ed354d0` | fix: webhook-leads sempre resume - max 2 frases, sem fallback literal | 17/05/2026 |
| 10 | `41d9058` | fix: webhook-leads usa system role para parafrasear sem copiar texto literal | 17/05/2026 |

---

## Sessão: 19/05/2026

### Pendentes antes do commit:
- ~~`src/lib/phoneMap.ts` - Mapa CPF → telefone + instância, persistência em JSON~~ ✅
- ~~`src/app/api/webhook24/route.ts` - Registrar telefone ao validar CPF~~ ✅
- ~~`src/app/api/tickets/route.ts` - Notificações proativas no POST/PUT/DELETE~~ ✅
- ~~`memorias.md` - Seção 17 documentando notificações proativas~~ ✅

### Commits realizados nesta sessão:

| # | Hash | Mensagem | Data |
|---|------|----------|------|
| 1 | `36e530a` | feat: notificacoes proativas no webhook24 - avisa cliente quando chamado e criado, tratado e finalizado | 19/05/2026 |
| 2 | `a6d255a` | fix: matching bidirecional de setores - reconhece setor mesmo quando nome nao contem exatamente o input | 19/05/2026 |
| 3 | `06a1d43` | fix: notificacao PUT usa 'em_atendimento' (valor real do frontend) e notifica em 'concluido' | 19/05/2026 |
| 4 | `16e5834` | feat: notifica usuario em toda atualizacao do chamado com observacao | 19/05/2026 |
| 5 | `3699ded` | feat: consulta de chamados mostra resumo completo com status, atendente, historico e observacoes | 19/05/2026 |

---

## Sessão: 19/05/2026 (Kanban Board)

### Pendentes antes do commit:
- ~~`src/app/(atendimento)/all-tickets/kanban-board.tsx` - Componente KanbanBoard com 3 colunas~~ ✅
- ~~`src/app/(atendimento)/all-tickets/page.tsx` - Alternância Lista/Kanban + toggle~~ ✅
- ~~`src/app/(atendimento)/components/modal_tandimento.tsx` - Status padronizados~~ ✅
- ~~`memorias.md` - Seção 19 documentando Kanban~~ ✅

### Commits realizados nesta sessão:

| # | Hash | Mensagem | Data |
|---|------|----------|------|
| 1 | `3cb83f9` | feat: visualizacao Kanban com alternancia lista/kanban e status padronizados | 19/05/2026 |
| 2 | `dc7b270` | docs: atualiza checkpoint com hash 3cb83f9 | 19/05/2026 |

---

---

## Sessão: 19/05/2026 (Kanban - Drag & Drop + 5 Colunas)

### Pendentes antes do commit:
- ~~`src/app/(atendimento)/all-tickets/kanban-board.tsx` - 5 colunas + drag and drop~~ ✅
- ~~`memorias.md` - Seção 19 atualizada com drag and drop~~ ✅

### Commits realizados nesta sessão:

| # | Hash | Mensagem | Data |
|---|------|----------|------|
| 1 | `b334756` | feat: kanban com 5 colunas e drag-and-drop para mover chamados entre status | 19/05/2026 |

---

## Próximos Passos (planejados)
- (a definir)
