# Memorias — Decisões e Alterações

> Autoria: VIBECODE

## Planejado para 2026-08-17 — Implementação ADM_CONTRATO + Testes em `dev`

### Feature em andamento: Nova role ADM_CONTRATO
- **Ponto de retorno**: commit `c38d92f` (branch `vibecode`)
- **O que é**: usuário da empresa terceirizada (prestadora de serviço) que lidera um contrato com outra empresa
- **Permissões**: apenas visualizar chamados da **própria empresa** (read-only) + pode abrir chamados para si
- **NÃO pode**: atender, editar, excluir chamados
- **Criação**: apenas ADMIN da empresa terceirizada
- **Banco**: tabelas `empresa_contrato` (relacionamento comercial) e `contrato_acesso` (permissões do ADM)
- **Decisão final**: o ADM Contrato vê APENAS os chamados da empresa dele (Empresa Y). Os setores da empresa contratante NÃO entram no sistema de visibilidade de chamados.
- **Pendente**: testes em `dev` + promoção para homologação (adiado para depois da feature)

## Sessão 2026-08-16 (análise de avisos por IA nos bots)

### Aviso correspondente ao motivo é apresentado antes de abrir chamado
- **Pedido**: ao relatar o motivo/defeito, o sistema analisa os avisos com OpenAI (mesma chave `OPENAI_API_KEY`) para buscar correspondência. Se houver aviso relacionado → apresenta aviso personalizado ao usuário e diz "se for só isso, pode encerrar". Só abre chamado se o usuário solicitar explicitamente (*abrir chamado*).
- **Comportamento**: se não houver correspondência → segue fluxo normal (abre chamado). Se houver → aviso personalizado + pergunta. Usuário pode: encerrar (`sair`) ou solicitar abertura (`abrir chamado`).
- **Arquivo novo**: `src/lib/analisar-aviso.ts` — função `analisarAvisoPorMotivo(motivo, avisos)` usa `gpt-4o-mini` com prompt focado em análise de correspondência. Retorna `{ corresponde: boolean; mensagem: string | null }`. Falha → fallback "sem correspondência".
- **Fluxos alterados**:
  - `chat-corporativo/route.ts` — `COLETAR_DESCRICAO` agora busca avisos (geral + específicos) e chama `analisarAvisoPorMotivo`. Novo estado `CONFIRMAR_AVISO`.
  - `chat-oficina/route.ts` — `COLETAR_DEFEITO` agora busca avisos e chama `analisarAvisoPorMotivo`. Novo estado `CONFIRMAR_AVISO`.
  - `webhook-corporativo/route.ts` — `COLETAR_MOTIVO` usa `analisarAvisoPorMotivo` em vez de `botIA` com `AVISO_RESOLVE:`. Novo estado `CONFIRMAR_AVISO`.
  - `webhook-oficina/route.ts` — `COLETAR_DEFEITO` agora busca avisos e chama `analisarAvisoPorMotivo`. Novo estado `CONFIRMAR_AVISO`.
  - `chat-handler.ts` (chat-operacional) — `COLETAR_MOTIVO` quando `AVISO_RESOLVE` agora vai para `VERIFICAR_AVISOS` (apresentar aviso e perguntar) em vez de encerrar direto.
  - `useIA-corporativa.ts` — `CONFIRMAR_AVISO` adicionado ao `FlowState`.
- **Estado `CONFIRMAR_AVISO`**: se usuário diz "abrir/quero/sim" → segue para anexo; se diz "sair/encerrar/não" → encerra; caso contrário → reitera a pergunta.
- **Testes**: 367 passando. **Build**: ok (75 rotas). Commit: `7b8df5b`.

## Sessão 2026-08-16 (entrega específica de aviso — campo destinatarioCpf)

### Aviso específico agora é configurado na tela (checkbox + CPF/matrícula)
- **Pedido**: poder marcar "entrega específica" ao criar/editar um aviso, informar CPF ou matrícula, o sistema identifica o usuário e o aviso vai só para ele.
- **Banco**: adicionada a coluna `destinatarioCpf String?` no model `avisos` (com `@@index([destinatarioCpf])`). Como matrícula da oficina = campo `cpf` da tabela `cpfs`, um único campo atende CPF (corporativo) e matrícula (oficina). Aplicado via `prisma db push` (o banco não usa migrações — não há `_prisma_migrations`).
- **Regra de entrega**:
  - Aviso **sem** `destinatarioCpf` = geral, para todos.
  - Aviso **com** `destinatarioCpf` = **só** para o usuário cujo CPF/matrícula bate (match exato). O critério legado (número no título/conteúdo) continua funcionando.
- **Alterados**:
  - `src/lib/usedata.ts` — `buscarAvisos` filtra `destinatarioCpf: null`; `buscarAvisosPorCpf` considera `destinatarioCpf === cpf` + legado.
  - `src/app/components/shared-avisos.tsx` — checkbox "Entrega específica", campo CPF/matrícula com botão **Identificar** (GET `/api/quadro-avisos?identificar=...` mostra o nome), badge "Específico" no card; bloqueia publicar sem destinatário identificado.
  - `src/app/api/quadro-avisos/route.ts` — POST/PUT salvam `destinatarioCpf` validando existência na tabela `cpfs`; GET aceita `?identificar=`; avisos específicos de outros usuários ficam ocultos para GESTOR/ATENDENTE.
  - `src/app/api/quadro-avisos/mostrar-avisos/route.ts` — avisos específicos só aparecem para o próprio destinatário.
  - `src/app/api/chat-oficina/route.ts` e `webhook-oficina/route.ts` — `buscarAvisosEspecificos` considera `destinatarioCpf`; `buscarAvisosDoVeiculo` ignora avisos específicos.
  - `src/lib/smartSearch.ts` — base de conhecimento só inclui avisos gerais + específicos do próprio CPF.
- **Testes**: 367 passando. **Build**: ok (75 rotas).

## Sessão 2026-08-16 (aviso específico no chat-corporativo — corrigido)

### Aviso específico por CPF agora é entregue no chatbot corporativo
- **Sintoma**: aviso específico para usuário da oficina era entregue pelo `chatbot-app` (assim que informava a matrícula), mas no **corporativo** não era entregue após informar o CPF.
- **Causa raiz**: o `chat-oficina/route.ts` chama `buscarAvisosEspecificos` (busca avisos da empresa cujo título/conteúdo contém a matrícula) e injeta na saudação; o `chat-corporativo/route.ts` **não tinha essa lógica** — após validar o CPF ia direto para coletar a descrição.
- **Correção**: `chat-corporativo/route.ts` agora chama a função canônica `buscarAvisosPorCpf(cpf)` de `@/lib/usedata` (a mesma usada no `webhook-corporativo`) após validar o CPF e, se houver avisos, adiciona `*📢 Aviso importante para você:*` na saudação antes de pedir a descrição.
- **Critério de match**: aviso específico = título ou conteúdo do aviso contendo os dígitos do CPF (mesma regra do WhatsApp corporativo).
- **Testes**: 367 passando. **Build**: ok (75 rotas).

## Sessão 2026-08-16 (confirmação de abertura de chamado — chatbot e formulários)

### Chamado aberto agora é confirmado ao usuário (com número TKT)
- **Causa raiz (chatbot)**: ao abrir um chamado, as APIs `chat-corporativo`/`chat-oficina` retornavam `done: true` com a confirmação no `reply`, mas o frontend (`chatbot-app` corporativo/oficina) **limpava todas as mensagens** (`setMessages([])`) ao receber `done` — o usuário nunca via a confirmação. A API também não distinguia sucesso de erro.
- **Correções**:
  - APIs `chat-corporativo`/`chat-oficina`: retorno do registro passou a incluir `ticket` (no sucesso) e `error: true` (na falha).
  - `chatbot-app` (2 arquivos): ao receber `done`, agora **exibe a mensagem final** (com o número do chamado) e mostra `toast.success("Chamado TKT-xxx aberto com sucesso!")` ou `toast.error(...)` na falha; o chat reinicia sozinho após 8s (tempo para o usuário ler a confirmação).
  - Formulários (5): `corporativo/chamado/page.tsx`, `corporativo/chamado/[ticket]/page.tsx`, `oficina/chamado/page.tsx`, `oficina/chamado/[ticket]/page.tsx` e `oficina/page.tsx` — passaram a capturar `data.ticket` da resposta, exibir o **número do chamado** em destaque na tela de sucesso e incluir o número no `toast.success`.
- **Testes**: 367 passando. **Build**: ok (75 rotas).

## Sessão 2026-08-16 (toasts padrão nas páginas Admin/Empresa)

### Feedback react-hot-toast padronizado (sucesso + erro) nas páginas de gestão
- **Padrão aplicado**: erro de API → `const err = await res.json().catch(() => ({}))` + `toast.error(err.error || "Mensagem específica")`; erro de rede → `toast.error("Erro ao conectar...")`; `toast.success` apenas quando a ação foi bem-sucedida e não há outro feedback equivalente.
- **Alterados**:
  - `src/app/minha-empresa/page.tsx` — salvar dados, regenerar token, salvar provedor (BYO), gerar prompt e salvar bot: erros de API passam a ler `err.error` (antes mensagem fixa).
  - `src/app/god/planos/page.tsx` — criar/editar plano, destacar, extinguir e cancelar extinção: `res.json()` protegido com `.catch(() => ({}))`.
  - `src/app/planos/page.tsx` — trocar plano e extinguir: `res.json()` protegido com `.catch(() => ({}))`.
  - `src/app/corporativo/(atendimento)/empresa/page.tsx` — salvar empresa, excluir, salvar provedor, gerar/salvar/limpar prompt e gerar/regenerar token (inline): erros leem `err.error`.
  - `src/app/corporativo/(atendimento)/empresa/create/page.tsx` — criar empresa: erro da API agora exibe `err.error` (antes `throw new Error()` genérico → mensagem fixa) e gerar prompt lê `err.error`.
  - `src/app/god/admins/page.tsx` e `src/app/god/usuarios/page.tsx` — `res.json()` protegido com `.catch(() => ({}))` nos erros de API.
  - `src/app/corporativo/(atendimento)/empresa/[id]/usuarios/page.tsx` — já tinha toast; `res.json()` protegido com `.catch(() => ({}))` (padrão unificado).
- **Sem alteração (já OK)**: `src/app/god/erros/page.tsx` (apenas listagem GET, sem mutação). Sucessos de criar empresa com token (create) mantêm o modal "Empresa Criada!" como feedback equivalente (sem toast duplicado).
- **Sem build/testes** (consolidação feita pelo usuário). Alterações não commitadas.

## Sessão 2026-08-16 (feedback toast em páginas públicas e componentes compartilhados)

### Feedback react-hot-toast (sucesso/erro) nas ações de usuário
- **Alterado** `src/app/components/shared-avisos.tsx` (quadro de avisos): adicionado import de `toast` (não existia). Criar/editar aviso → `toast.success("Aviso publicado/atualizado com sucesso")` (antes: sucesso silencioso) e `toast.error(error.message || "Erro ao salvar o aviso.")` (antes: `setErrorMessage` sem renderização = falha silenciosa). Excluir → `toast.success("Aviso excluído com sucesso")`; erros de permissão/exclusão trocaram `alert()` por `toast.error` (o `confirm()` de confirmação foi mantido).
- **Alterado** `src/app/components/modal-edit-user.tsx` (editar perfil/senha/avatar): adicionado import de `toast` + `toast.success` em "Senha alterada com sucesso!" e "Perfil atualizado com sucesso!" e `toast.error` no catch — mantido o banner inline `formMessage` existente.
- **Alterado** `src/app/contact/page.tsx` (contato): adicionado `toast.success("Mensagem enviada!")` e `toast.error` no catch (rede → "Erro ao conectar com o servidor" via `TypeError`; API/validação → mensagem específica). Mantidos banners inline.
- **Alterado** `src/app/pagamento/page.tsx` (pagamento): POST sem toast até então (só banner inline `resultado`) — agora `toast.success("Pagamento processado com sucesso!")`, `toast.error(msg)` na falha de API e no catch.
- **Verificados sem alteração (já OK)**: `shared-cpfs.tsx` (todas as ações com sucesso/erro), `shared-usuarios.tsx` (editar/excluir com sucesso/erro), `assinar/page.tsx` (cadastro com sucesso/erro em todos os caminhos), `page.tsx` login (falha NÃO é silenciosa — banner inline de erro; sem toast por regra), `testes/page.tsx` (item opcional; erros já exibidos inline), `sidebar.tsx`/`module-layout.tsx`/`dashboard/page.tsx` (apenas GETs — sem toast).
- **Não rodados**: build/testes (consolidação fica com o usuário).

## Sessão 2026-08-16 (react-hot-toast no módulo Oficina)

### Toasts adicionados/corrigidos
- `src/app/oficina/chamado/[ticket]/page.tsx`: erro de API agora lê `err.error` (`toast.error(err.error || "Erro ao registrar solicitação")`); falha de rede → `toast.error("Erro ao conectar com o servidor")`. Sucesso mantém a tela dedicada (feedback equivalente — sem toast duplicado).
- `src/app/oficina/(atendimento)/all-tickets/kanban-board.tsx`: troca de estágio via drag-and-drop (`handleDrop`) **não tinha feedback** — adicionado `toast.success("Status do chamado atualizado")` no 2xx, `toast.error(errData?.error || "Erro ao atualizar status")` no !ok e `toast.error("Erro ao conectar com o servidor")` no catch.
- Já OK (não alterados): `chamado/page.tsx`, `oficina/page.tsx`, `(atendimento)/components/modal_tandimento.tsx` (atualizar/fechar já com toast), consulta (GET com mensagens na tela), `chatbot-app` (feedback visual no chat).
- **Sem build/testes** (consolidação feita pelo usuário). Alterações não commitadas.

## Sessão 2026-08-16 (toasts no módulo corporativo)

### Feedback react-hot-toast no módulo corporativo
- **Alterado** `src/app/corporativo/chamado/[ticket]/page.tsx` (criar chamado): adicionado `toast.success("Chamado registrado com sucesso")` no sucesso (antes: só trocava a tela, sem toast); erro de API agora lê `res.json().catch(() => ({}))` e exibe `err.error || "Erro ao registrar o chamado"`; erro de rede → `toast.error("Erro ao conectar com o servidor")`.
- **Alterado** `src/app/corporativo/chamado/page.tsx`: falha de rede na validação de CPF (`validarCPF`) era silenciosa — adicionado `toast.error("Erro ao conectar com o servidor")`. O POST `/api/tickets` desta página já tinha toast de sucesso e erro.
- **Verificados sem alteração (já OK ou sem ação de mutação)**: `kanban-board.tsx` (drag entre estágios já com toast), `modal_tandimento.tsx` (atualizar/fechar já com toast), `all-tickets/page.tsx` (só listagem/GET), `consulta/page.tsx` e `consulta/[ticket]/page.tsx` (GET com feedback visual), `chatbot-app/page.tsx` (erro de envio já tem feedback visual em balão — não duplicar com toast).
- **Não rodados**: build/testes (consolidação fica com o usuário).

## Sessão 2026-08-16 (GOD de empresa específica)

### GOD de empresa específica não conseguia adicionar usuários — RESOLVIDO
- **Contexto**: um usuário com `role = GOD` e `empresaId = "1"` (empresa e usuário criados via SQL direto no banco, com id não-UUID) não conseguia adicionar usuários dentro da própria empresa.
- **Causa raiz**: `src/lib/validation.ts` validava `empresaId` como **UUID obrigatório** (`z.string().uuid()`). O `id` da `empresa` no schema é `String @id @default(uuid())` — o default é UUID, mas **qualquer string é aceita** (ex.: `"1"` criado via SQL). Ao criar um usuário com `empresaId = "1"`, o Zod rejeitava → `400 "Dados inválidos — empresaId: Empresa inválida"`. A criação nunca passava da validação.
- **Correções**:
  - `src/lib/validation.ts`: `createUserSchema.empresaId` e `updateUserSchema.empresaId` deixaram de exigir UUID (`z.string().min(1, ...)`). A existência da empresa continua validada na rota (`findUnique`).
  - `src/app/api/users/route.ts` (POST): GOD **sem** `empresaId` no formData agora usa a empresa da própria sessão (fallback); só retorna "GOD deve selecionar uma empresa" se o GOD não tiver empresa vinculada.
  - Frontend (`shared-gestao-usuarios.tsx` e `god/admins/page.tsx`): o select de empresas do GOD agora seleciona por padrão a **própria empresa do GOD** (antes: sempre a primeira da lista — risco de criar usuário na empresa errada).
  - **RBAC mantido**: `CREATE_ROLE_MAP.GOD = ["ADMIN"]` **inalterado** — o GOD (mesmo o vinculado à própria empresa) cria **apenas ADMIN**; o ADMIN criado é quem cria GESTOR/ATENDENTE. (Tentativa de ampliar para GOD criar todos os papéis foi descartada pelo usuário.)
- **Testes**: `validation.test.ts` (empresaId custom `"1"` aceito; vazio rejeitado) e `rbac.test.ts` (GOD cria apenas ADMIN; não cria GESTOR/ATENDENTE/GOD) mantidos coerentes. **367 passando**, build ok (75 rotas).
- **Lições**: (1) `z.string().uuid()` no id da empresa é restrição indevida — o schema Prisma aceita qualquer string; (2) o padrão "GOD global que só cria ADMINS" quebrou quando surgiu o caso "GOD vinculado a uma empresa específica".

## Sessão 2026-08-15

### Webhook "Token inválido" em produção (após pagamento real CONFIRMED) — diagnóstico adicionado
- **Contexto**: o pagamento chegou e foi CONFIRMED no Asaas (cartão 4444, `pay_72hi1vjm57sda6ok`, empresa `da544150-...`), mas o webhook respondeu `{"error": "Token inválido"}` mesmo com o token atualizado na Vercel.
- **Descoberta crítica**: `src/app/api/webhooks/asaas/route.ts` **só existe no branch `vibecode`** — em `origin/main` (commit `fe501ed`), `origin/dev` e `origin/hml` o arquivo não existe. O fix do header `asaas-access-token` (commit `479a670`) está apenas no `vibecode`. **A `main` NÃO deve ser alterada** — o deploy é feito a partir do `vibecode`.
- **Causa provável do 401**: o deploy atual na Vercel deve ser anterior ao `479a670` (o usuário atualizou a env var, mas mudança de env var não substitui o código). Código antigo → só lê `Authorization`/`x-asaas-token` → header `asaas-access-token` ignorado → token vazio → "Token inválido". (Alternativa: token da env var ≠ painel Asaas.)
- **Diagnóstico adicionado** (`route.ts`):
  - 401 diferenciado: **"Token do webhook não configurado no servidor"** (env ausente) / **"Token não enviado (header asaas-access-token ausente)"** (deploy antigo ou header não lido) / **"Token inválido"** (header chegou mas difere).
  - Log estruturado com **hashes** (nunca o token real) de recebido/esperado + quais headers chegaram.
  - `trim()` no token esperado e recebido (protege contra espaço acidental na env var da Vercel).
  - `GET /api/webhooks/asaas` agora responde `codigoVersao: "v2-header-asaas-access-token"`, `tokenConfigurado`, `tokenAmostra` (`****...`), `tokenHash` — permite confirmar qual código está no ar SEM expor o segredo.
- **Testes**: `asaas-webhook.test.ts` +5 (token errado → "Token inválido"; header ausente → "Token não enviado"; env ausente → "não configurado"; trim aceito; GET diagnóstico sem vazar segredo). **366 passando**, build ok.
- **Próximo passo**: redeploy do `vibecode` na Vercel → conferir `codigoVersao` no GET → re-testar. A resposta do 401 dirá exatamente o que ajustar.

### BUG 502 no POST /api/empresa/pagamento — RESOLVIDO (tokenização Asaas)
- **Sintoma reportado**: o Asaas logava 200 (customer criado `cus_000008727218`), mas `POST /api/empresa/pagamento` retornava 502 (`ERR-00001`/`ERR-00002`) para a empresa `59ff0fcf-...` no Vercel. O `storeError` é um Map em memória (TTL 24h, contador por instância) — código não recuperável depois.
- **Causa raiz**: tokenização com o endpoint errado. O app chamava `POST /creditCards` (inexistente → **404**). O endpoint oficial v3 é **`POST /creditCard/tokenizeCreditCard`**, com `remoteIp` **obrigatório** (IP do cliente, nunca do servidor) e `creditCardHolderInfo` completo (name, email, cpfCnpj, postalCode, addressNumber, phone). Resposta traz **`creditCardToken`** (não `id`). Sem os dados do titular a API rejeita (ex.: CEP inválido → 400 `invalid_holderInfo`).
- **Cartão de teste**: o correto da sandbox é **`4444 4444 4444 4444` · 12/27 · 123** (doc oficial). O `5162 3062 1493 2319` **não** é o de sucesso — usuário confirmou.
- **Correção**:
  - `src/lib/asaas.ts`: `POST /creditCard/tokenizeCreditCard`, body com `remoteIp` + `addressNumber`, resposta `card?.creditCardToken || card?.id`. Interface `DadosCriarAssinatura` + `titularAddressNumber?` e `remoteIp?`.
  - `src/app/api/empresa/pagamento/route.ts` (POST): valida `titular` (postalCode 8 dígitos, addressNumber, phone ≥10 → 400) e captura o `remoteIp` real do cliente (`x-forwarded-for` → `x-real-ip` → `x-vercel-forwarded-for`), repassando tudo ao `criarAssinatura`.
  - `src/app/pagamento/page.tsx`: cartão de teste novo + seção "Dados do Titular" (CEP/número/telefone, com máscaras `formatCEP`/`formatTelefone`) + `usarCartaoTeste` preenche o titular.
- **Testes**: `asaas.test.ts` (URL `/creditCard/tokenizeCreditCard`, `creditCardToken`, `remoteIp: "127.0.0.1"`), `pagamento-api.test.ts` (+1 caso titular incompleto → 400; titular normalizado repassado; remoteIp definido). **361 passando**, build ok.
- **E2E real validado** (sandbox + banco): tokenização 200 → assinatura `sub_hlvi5poh2zryl6zf` ACTIVE (trial 0) → cobrança `pay_s9upz0k475cu4gw5` **CONFIRMED** → empresa **PAGO**. Dados de teste limpos.
- **Lições**: (1) sempre conferir o endpoint oficial na doc do Asaas (não assumir REST `/creditCards`); (2) `remoteIp` na tokenização deve ser o IP do cliente (Vercel expõe via `x-forwarded-for`), jamais o IP do servidor; (3) o Asaas valida os dados do titular — o formulário precisa coletá-los.

### BUG do webhook Asaas "Token inválido" — RESOLVIDO
- **Sintoma reportado**: o Asaas envia o evento (ex.: `PAYMENT_RECEIVED`) para `/api/webhooks/asaas`, mas o endpoint responde `{"error": "Token inválido"}` mesmo com o token correto configurado na Vercel.
- **Causa raiz**: o código só lia o token dos headers `Authorization: Bearer ...` e `x-asaas-token`. **O Asaas envia o token de autenticação do webhook no header `asaas-access-token`** (docs.asaas.com → "What does the Authentication Token mean in the webhook settings?"). Como o token nunca era encontrado, o request caía no 401.
- **Correção** (`src/app/api/webhooks/asaas/route.ts`): a extração do token passou a aceitar, nesta ordem: `Authorization: Bearer`, `x-asaas-token`, **`asaas-access-token`** e `asaas_access_token` (variação usada pela central de ajuda).
- **Testes**: `asaas-webhook.test.ts` ganhou helper `criaRequestAsaas` (usa o header real `asaas-access-token`) + teste novo provando que `PAYMENT_RECEIVED` com esse header atualiza a empresa para PAGO. **360 passando** (23 arquivos), build ok.
- **Lições**: (1) a autenticação de webhook do Asaas NÃO usa `Authorization`/`x-asaas-token` — é `asaas-access-token`; (2) testar com o header real do provedor evita esse tipo de falso "token inválido" em produção.

### Escolha Trial vs Pagamento imediato
- **Demanda do usuário**: hoje o trial é sempre aplicado (assinatura Asaas com `paymentDelay`), mesmo para quem informa o cartão. Agora o usuário escolhe: **trial grátis** (pula o pagamento, conta liberada na hora) OU **pagamento imediato** (redireciona para `/pagamento` e cobra já). Quem já recebeu a degustação tem a escolha **indisponível** (pagamento obrigatório).
- **Schema**: `empresa.trialUsado Boolean @default(false)` — distingue "nunca usou trial" de "já consumiu a degustação". Migração `20260815150000_add_trial_usado`.
  - ⚠️ **Nota técnica**: `prisma migrate dev` falha na shadow database (migrações históricas `20260802192500`/`20260802213428` fora de ordem alfabética — a `02192500` roda antes da `02213428` na sombra). Solução usada: criar a migração manualmente e aplicar com `prisma migrate deploy` (não usa shadow).
- **Signup**: `usarTrial` default true. Trial → `trialAtivo=true`+`trialUsado=true`, resposta sem `pagamentoUrl`. Pagamento → `trialAtivo=false`+`trialUsado=false`, resposta com `pagamentoUrl`.
- **Pagamento**: `criarAssinatura({ trial: 0 })` (cobrança imediata, sem trial embutido) + `trialAtivo: false` no update. `GET` retorna `trialUsado`/`trialDisponivel`.
- **UX**: `/assinar` com checkbox (default trial; botão muda o texto); `/pagamento` com banner "trial já utilizado"; painel `minha-empresa` com card "Degustação utilizada".
- **Testes**: +6 (`signup-trial.test.ts`), `pagamento-api.test.ts` atualizado. Total 359, build ok.

### BUG do redirect pós-cadastro — RESOLVIDO
- **Sintoma reportado**: `/assinar` criava a conta mas não redirecionava para `/pagamento?t=<token>`.
- **Causa raiz**: a migração `20260814120000_add_asaas_pagamento` NÃO estava registrada em `_prisma_migrations` — as colunas e o tipo `statusPagamento` existiam no banco (aplicados manualmente no Supabase), mas o Prisma a tratava como pendente. `migrate deploy` quebrava (`type "statusPagamento" already exists`) e qualquer inconsistência/deploy antigo podia derrubar o signup sem devolver `pagamentoUrl`.
- **Correção**: `npx prisma migrate resolve --applied 20260814120000_add_asaas_pagamento` → banco consistente (`migrate status` up to date).
- **Validação**: fluxo completo testado de verdade contra o servidor dev (signup 201 + token → GET dados da cobrança → POST pagamento com cartão de teste → assinatura criada, mock local). Dados de teste removidos do banco após a validação.
- **Melhoria no front** (`src/app/assinar/page.tsx`): sem `pagamentoUrl` → toast de erro explícito (antes: `router.push("/")` silencioso, que parecia "não redirecionar"). Removido `useRouter` do componente.
- **Lições**: (1) banco aplicado manualmente sem registro em `_prisma_migrations` causa estado fantasma — sempre conferir `prisma migrate status`; (2) `prisma migrate resolve` é a ferramenta correta quando o SQL já está no banco; (3) fallbacks silenciosos de redirect são anti-diagnóstico.

### Pagamento real no Asaas — página própria (sem checkout do Asaas)
- **Decisão do usuário**: o fluxo deve chamar a API do Asaas de verdade (inclusive na sandbox) e o cliente paga em **página própria do app** (NÃO usar payment link/checkout hospedado do Asaas).
- **Causa do "parece mock"**: `criarAssinatura` enviava `value: 0` + `billingType: CREDIT_CARD` sem cartão → API rejeita (400) → `catch` silencioso no signup engolia o erro → nenhuma assinatura criada.
- **`src/lib/asaas.ts`** reescrito:
  - `criarAssinatura` agora recebe `valor` (preço real do plano) e `cartao` (DadosCartao). Fluxo: garante customer → **tokeniza cartão** (`POST /creditCards`) → **cria assinatura** (`POST /subscriptions`) com `creditCardToken`, `value` real, `paymentDelay` (trial), `cycle`.
  - Aceita `creditCardToken` pré-existente (pula tokenização).
  - Novos helpers: `getAsaasModo()` ("mock"|"sandbox"|"producao") e `mascararChave()`.
  - **PCI**: `cartao` é usado UMA vez para tokenizar; número NUNCA é persistido nem logado.
- **`src/lib/token-pagamento.ts`** (novo): token efêmero assinado HMAC-SHA256 (`NEXTAUTH_SECRET`) com validade de 1h — permite a página `/pagamento` identificar a empresa recém-criada SEM sessão e SEM migração de banco. `criarTokenPagamento`/`validarTokenPagamento` (timing-safe).
- **Signup** (`src/app/api/signup/route.ts`): NÃO cria mais assinatura (não há cartão no signup). Retorna `pagamentoUrl` (`/pagamento?t=<token>`). Conta nasce PENDENTE + trialAtivo.
- **`POST/GET /api/empresa/pagamento`** (novo):
  - `GET ?t=` → dados da cobrança (plano, valor, modo, trial) para montar a página.
  - `POST` → valida token + cartão (Luhn não aplicado; validações de formato) → busca plano (valor real) → `criarAssinatura` → salva `asaasCustomerId/asaasSubscriptionId/asaasPaymentId`.
  - Falha do Asaas → `storeError` (error-store) + resposta 502 com `codigo` rastreável (não expõe dado do cartão).
- **`/pagamento`** (`src/app/pagamento/page.tsx`): página própria de pagamento — resumo da cobrança, formulário com máscaras (número/validade/CVV), aviso + botão de **cartão de teste da sandbox** (5162 3062 1493 2319 · 08/29 · 318), feedback de sucesso/erro com código.
- **`/assinar`**: após criar conta, redireciona para `pagamentoUrl`.
- **`GET /api/asaas/diagnostico`** (novo, ADMIN/GOD): mostra `modo` (mock/sandbox/producao), base URL, chave mascarada, se webhook token existe e **testa a API real** (`GET /customers?limit=1`) — confirma se está em mock ou não.
- **Vercel**: precisa ter `ASAAS_API_KEY` com o nome EXATO. Chave sandbox (`$aact_hmlg_...`) funciona com a URL default sandbox; se um dia for chave de produção (`$aact_prod_...`), definir `ASAAS_BASE_URL=https://api.asaas.com/v3` (senão chama sandbox com chave prod e falha).
- **Testes**: `asaas.test.ts` reescrito (fluxo real: 4 chamadas, valor real, falha sem cartão, token pré-existente, helpers), `token-pagamento.test.ts` (5), `pagamento-api.test.ts` (9). **Total 353 passando**, build ok (**75 rotas**).

## Sessão 2026-08-14

### Mensagem de bloqueio no login (pagamento)
- **Problema**: quando o acesso estava bloqueado por pagamento, o login falhava com "Email ou senha incorretos" — sem explicar o motivo.
- **Criado** `POST /api/auth/verificar-acesso` — pré-verificação ANTES do `signIn`: informa motivo do bloqueio com mensagem específica (ATRASADO/CANCELADO/REEMBOLSADO/PENDENTE sem trial). Não revela existência de conta (email inexistente/GOD → `acessivel: true`). Em falha de banco, não bloqueia o fluxo. Rate limit 20/min.
- **Alterado** `src/app/page.tsx` (login): antes de chamar `signIn`, consulta `/api/auth/verificar-acesso`; se `acessivel === false`, exibe a mensagem do motivo e não tenta logar (também não incrementa `failedAttempts`/captcha).
- **Alterado** `src/lib/nextauth.ts`: bloqueio por pagamento NÃO chama mais `trackFailedLogin` (senão o usuário bloqueado acumulava tentativas e disparava Turnstile à toa).
- **Testes**: `verificar-acesso.test.ts` (9: inexistente, GOD, PAGO, trial, ATRASADO, CANCELADO, REEMBOLSADO, PENDENTE, falha de banco). Total 336 passando, build ok (72 rotas).

### Área "Assinatura e Financeiro" (ADMIN)
- **Decisão**: dados financeiros visíveis APENAS para o ADMIN da própria empresa (quem comprou) e GOD. GESTOR/ATENDENTE não veem.
- **Criado** `src/lib/assinatura.ts` — funções puras: `calcularTrialFim` (createdAt + TRIAL_DIAS), `calcularDiasRestantes`, `formatarDataBR`, `labelCiclo`, `montarResumoAssinatura` (plano, status, trial, vencimento, ciclo, ids Asaas).
- **Trial calculado por `createdAt` + 7 dias** (constante `TRIAL_DIAS` em `asaas.ts`) — não exigiu nova coluna no schema.
- **Criado** `GET /api/empresa/assinatura` — rate limit, RBAC `["ADMIN","GOD"]`, ADMIN restrito à própria empresa. Busca nome do plano dinâmico e, se houver `asaasSubscriptionId`, consulta o Asaas para `nextDueDate` (vencimento da recorrência) + ciclo.
- **Criado** `consultarAssinatura` em `asaas.ts` (GET /subscriptions/{id}; mock em dev).
- **UI** (`src/app/minha-empresa/page.tsx`): seção "Assinatura e Financeiro" renderizada só para `userRole === 'ADMIN'`. Cards: plano, status do pagamento (badge colorido), trial (dias restantes + data fim + aviso de 1ª cobrança) OU recorrência (próximo vencimento + ciclo) quando PAGO OU aviso de bloqueio quando ATRASADO/CANCELADO/REEMBOLSADO/PENDENTE.
- **Testes**: `assinatura.test.ts` (10) + `assinatura-api.test.ts` (9: permissões GESTOR/outra-empresa, GOD liberado, trial, vencimento, 404). Total 327 passando, build ok (71 rotas).

### Integração Asaas (assinaturas SaaS) + bloqueio por pagamento
- **Schema** (`prisma/schema.prisma`): enum `statusPagamento` (PENDENTE/PAGO/ATRASADO/CANCELADO/REEMBOLSADO) + campos em `empresa`: `statusPagamento` (default PENDENTE), `asaasCustomerId?`, `asaasSubscriptionId?`, `asaasPaymentId?`, `trialAtivo` (default true).
- **Migração**: `20260814120000_add_asaas_pagamento` (criada, NÃO aplicada no banco — aplicar com `npx prisma migrate deploy`).
- **Criado** `src/lib/asaas.ts`: `criarAssinatura` (trial=7, cycle, externalReference=empresaId, cliente por cpfCnpj), `consultarCobranca`, `cancelarAssinatura`, `mapearStatusAsaas`, `isAsaasConfigured`. Sem `ASAAS_API_KEY` → fallback mock (fluxo dev intacto).
- **Criado** `src/app/api/webhooks/asaas/route.ts`: valida token (`Authorization: Bearer` ou `x-asaas-token`), consulta reversa `GET /payments/{id}` (anti-spoofing), idempotência via `TTLMap` (24h), mapeia eventos (PAYMENT_CONFIRMED/RECEIVED→PAGO e trial off; PAYMENT_OVERDUE→ATRASADO; REFUNDED→REEMBOLSADO; CANCELLED/SUBSCRIPTION_CANCELLED→CANCELADO), localiza empresa por externalReference→subscription→customer→payment, invalida cache de módulos.
- **Bloqueio de acesso**: `src/lib/nextauth.ts` — login rejeitado se `statusPagamento ≠ PAGO` e fora do trial (GOD sempre liberado). `src/lib/usedata.ts` `checkEmpresaModule` — módulo só ativo com pagamento ok (PAGO ou trial).
- **Signup** (`src/app/api/signup/route.ts`): nova empresa nasce `PENDENTE` + `trialAtivo: true`; cria assinatura Asaas (fallback mock em dev); falha no Asaas não derruba o signup.
- **Env**: `.env.example` ganhou `ASAAS_API_KEY`, `ASAAS_BASE_URL`, `ASAAS_WEBHOOK_TOKEN` (o `.env` já tinha `ASAAS_API_KEY` e `ASAAS_TOKEN_WEBHOOK`; o código aceita ambos os nomes de token).
- **Testes**: `asaas.test.ts` (6), `asaas-webhook.test.ts` (7), `asaas-bloqueio.test.ts` (5), `usedata.test.ts` atualizado (+bloqueio por pagamento). Total: 308 passando, build ok (70 rotas).
- **Decisão**: durante o trial (`trialAtivo=true`) o acesso é permitido mesmo com `statusPagamento=PENDENTE` (senão o trial não teria utilidade). Bloqueio real vale para ATRASADO/CANCELADO/REEMBOLSADO.

### WhatsApp indisponível nos planos (`/planos`)
- Recurso WhatsApp agora aparece **visualmente desativado** nos cards de planos da página pública `/planos` (`src/app/planos/page.tsx`).
- `montarRecursos()` passou a retornar objetos `{ texto, disponivel }`; WhatsApp sai com `disponivel: false`.
- Na lista de recursos, item indisponível é renderizado com cadeado (`LuLock`), texto legível (sem riscado), badge "Indisponível" e `cursor-not-allowed`.
- Ao clicar no item, dispara `toast` informando: "Abertura de chamados pelo WhatsApp: temporariamente indisponível.".
- Demais recursos continuam com check verde e sem interação.
- **Ajuste pós-revisão**: recurso NÃO é riscado/removido — apenas inativo (cadeado + badge "Indisponível"), mantendo o texto legível.

## Sessão 2026-08-02

### Página de Planos (`/planos`)
- Criada a rota `src/app/planos/page.tsx` com página pública de compra de planos.
- Define 3 planos alinhados à landing page:
  - **Start** — R$ 299,99/mês
  - **Profissional** (destaque "Recomendado") — R$ 699,99/mês
  - **Enterprise** — R$ 989,90/mês
- Valores provisórios e centralizados em `src/lib/planos.ts` (fonte única).
- CTA "Assinar" aponta para `/assinar?plano=<slug>`.
- Usuários logados veem painel de **troca de plano** (upgrade/downgrade simulado).

### Página de Contato (`/contact`)
- Adicionado bloco com botão **"Ver planos e assinar"** que redireciona para `/planos`.

### Fluxo SaaS / Auto-onboarding (assinar)
- **Regras de negócio por plano** centralizadas em `src/lib/planos.ts`:
  - **START**: 1 módulo à escolha, até 5 usuários (gestores+atendentes), bot sem IA (script), abertura de chamados só pelo app.
  - **PROFISSIONAL**: 2 módulos à escolha, até 15 usuários, bot com IA (app + WhatsApp).
  - **ENTERPRISE**: todos os módulos, até 30 usuários, bot com IA, WhatsApp + Telegram (futuro).
  - Usuários que abrem chamados: ilimitados em todos os planos.
- **`POST /api/signup`** (pública): cria empresa + ADMIN em transação atômica. Sem pagamento por enquanto (acesso liberado simulado).
- **`/assinar?plano=<slug>`**: formulário com dados da empresa (nome, CNPJ, setores), escolha de módulos e dados do admin (nome, CPF, senha).
- **Email do admin gerado automaticamente**: `cpf@slug-empresa.com.br` (domínio via `APP_EMAIL_DOMAIN`, default `com.br`).
- **Limite de usuários**: aplicado no `POST /api/users` — conta GESTOR+ATENDENTE; ADMIN e GOD não consomem o limite.
- **Bot sem IA**: `src/lib/bot-script.ts` — respostas determinísticas/script para plano START; decidido via `responderBot` no `chat-handler.ts` com cache do plano na sessão.
- **Troca de plano**: `PUT /api/empresa/plano` (GOD qualquer empresa; ADMIN/GESTOR da própria). Atualiza plano e valida módulos.
- **Schema**: novo enum `plano` (START/PROFISSIONAL/ENTERPRISE) e campo `empresa.plano` default START. Migração `20260802213428_add_plano_empresa`.

### GOD
- Fluxo manual (criar empresa + admin) permanece intacto como opção.

### Painel "Minha Empresa" (ADMIN/GESTOR)
- Criada rota `src/app/minha-empresa/page.tsx` + `layout.tsx` (sidebar + header, sem exigir módulo contratado).
- O ADMIN/GESTOR da própria empresa pode:
  - Ver e copiar as **URLs dos webhooks** dos módulos que comprou.
  - Ver, copiar e **regenerar o token do webhook** (`evolution_token`).
  - Editar dados da empresa (nome, CNPJ, setores, logo) — mesmos campos do GOD, restrito à própria empresa.
  - Configurar provedor BYO (provider, evolution_url, api_key) e o assistente virtual (bot).
- Sidebar: nova seção fixa "Empresa → Minha Empresa" para ADMIN/GESTOR, visível independente dos módulos.
- Backend liberado:
  - `GET /api/empresa?id=` agora retorna `evolution_token` e `api_key` para ADMIN/GESTOR da própria empresa (antes só GOD).
  - `PUT /api/empresa` aceita ADMIN/GESTOR da própria empresa, mas **somente GOD altera `modulos`** (ADMIN/GESTOR mudam módulos via troca de plano).
  - `/api/empresa/prompt` (GET/POST/PUT/DELETE) aceita ADMIN/GESTOR da própria empresa.

### Planos dinâmicos (GOD pode criar/editar/extinguir)
- **Decisão do usuário**: planos saem do código estático e passam a viver na tabela `planos` do banco.
- ADMIN troca de plano apenas comprando/reduzindo (`PUT /api/empresa/plano`); **não edita valores**.
- **Exclusão de plano = extinção agendada (30 dias)**:
  1. GOD solicita via API (action `extinguir`).
  2. Plano fica `ativo=false` imediatamente (não é mais vendável).
  3. Todas as empresas do plano são notificadas via `avisos` (aviso na plataforma).
  4. Após 30 dias (`processarExtincoesVencidas`), empresas são migradas para o plano **mais vantajoso sem aumento de custo** (maior `ordem` com `preco <=` do extinto; senão o mais barato).
  5. GOD pode cancelar (action `cancelar_extincao`) ou forçar exclusão (action `forcar_exclusao`).
- **Destaque**: GOD decide qual plano é "Recomendado" (campo `destaque`).
- **Schema**: model `planos` (slug unique, nome, preco, descricao, maxModulos default -1 = ilimitado, maxUsuarios default 5, botIA, canais[], modulosAutomaticos[], ativo, destaque, ordem, extincaoEm, extincaoAvisadaEm, timestamps, index [ativo, ordem]). `empresa.plano` virou **String** (slug) default `"start"`; enum `plano` removido.
- **Migração**: `20260802192500_add_planos_dinamicos` (cria tabela, seed dos 3 planos com os mesmos valores provisórios, converte `empresa.plano` para slug lowercase, dropa enum).
- **`src/lib/planos.ts`**: agora só TIPOS (`Plano`) e funções PURAS sobre o objeto (`planoDaLinha`, `getModulosDisponiveis`, `validarModulos` com -1/modulosAutomaticos = todos, `dentroDoLimiteDeUsuarios`, `gerarSlug`, `gerarEmailAdmin`). `PLANOS`/`ORDEM_PLANOS`/`planoSlugParaId` removidos.
- **`src/lib/planos-server.ts`** (novo, acessa banco): `getTodosPlanos`, `getPlanosAtivos`, `getPlanoPorSlug`, `getPlanoMigracao`, `processarExtincoesVencidas`, `solicitarExtincao`, `cancelarExtincao`.
- **`src/app/api/planos/route.ts`** (novo): GET público (planos ativos; `?todos=true` GOD; roda `processarExtincoesVencidas` lazy), POST/PUT GOD-only, DELETE GOD-only (actions `extinguir`, `cancelar_extincao`, `forcar_exclusao`).
- **`src/lib/bot-script.ts`**: `PlanoBot = string` (slug); `planoTemBotIA` agora **async** (consulta `planos`, fallback legado PROFISSIONAL/ENTERPRISE). `chat-handler.ts` ajustado.
- **Consumidores refatorados**: `api/signup`, `api/users`, `api/empresa/plano`, `planos/page.tsx` (fetch `/api/planos`, tipo `PlanoApi`, troca com slug minúsculo), `assinar/page.tsx` (fetch `/api/planos`, `useEffect`, early returns), `minha-empresa/page.tsx` (nome do plano via `/api/planos`).
- **UI do GOD**: `src/app/god/planos/page.tsx` — CRUD completo (listar/buscar, criar, editar valores/limites/módulos/canais, toggle destaque, toggle ativo, solicitar extinção com confirmação detalhada, cancelar extinção). Item "Planos" adicionado na sidebar do GOD.
- **Testes**: `src/__tests__/planos.test.ts` reescrito para as funções puras com fixtures (7 testes). Build ok (69 rotas); 288 testes passando (Vitest).

### Acesso do GOD à gestão de planos pela página pública
- A página pública `/planos` agora detecta a role GOD (`useSession`):
  - **GOD** enxerga **todos** os planos (inclui inativos/em extinção via `/api/planos?todos=true`), com badge de status ("Ativo" / "Inativo" / "Extinção dd/mm") no card.
  - Banner "Modo administrador (GOD)" com link para `/god/planos`.
  - Botões **Editar** (→ `/god/planos`) e **Excluir** (solicita extinção em 30 dias via DELETE `/api/planos?id=&action=extinguir`) em cada card.
