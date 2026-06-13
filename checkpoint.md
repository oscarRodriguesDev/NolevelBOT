# CHECKPOINT — NolevelBOT

## Sessao: 13/06/2026

### Branch Atual
`testes`

### Ultimo Commit (HEAD)
```
c42e525 added mescle
```

### Mudancas desta sessao (13/06/2026) — SEXTA RODADA (Correcao vulnerabilidades Grupo A)

| Arquivo | Alteracao |
|---------|-----------|
| `next.config.ts` | `poweredByHeader: false` + `headers()` com security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) |
| `proxy.ts` | `/api-docs` removido de publicRoutes e protegido (exige JWT). Rate limiting para `/` (60 req/min) e `/dashboard` (120 req/min). Tracking de brute force por IP (20 tentativas/15min). Adicionado `/api-docs/:path*` ao matcher |
| `pedidos.md` | PED-011 registrado |
| `memorias.md` | Registro de autoria |
| `src/app/api/cpfs/general_cpf/route.ts` | GET protegido com `X-API-Key` header (B1) |
| `.env` / `.env.example` | Adicionado `BOT_API_KEY` |
| `pedidos.md` | PED-012 registrado |
| `checkpoint.md` | Sessao 13/06 atualizada |
| `recomendações.md` | Substituído pelas diretrizes atuais |

## Sessao: 12/06/2026

### Ultimo Commit (HEAD)
```
da5f8eb revert: remove toda refatoracao dos dashboards (volta ao estado 2f0e380 antes de qualquer melhoria)
```

### Mudancas desta sessao (12/06/2026) — QUINTA RODADA (Fix proxy + atualizacao testes)

| Arquivo | Alteracao |
|---------|-----------|
| `src/proxy.ts` | Guard ENABLE_TESTES + `/testes` e `/api/testes` no matcher |
| `src/proxy.ts` | Fix redirect loop ERR_TOO_MANY_REDIRECTS (guard para pathname === "/") |
| `testes.md` | Seção 7 atualizada com proxy real (autenticação completa) |
| `memorias.md` | Registro de autoria |
| `pedidos.md` | PED-009 e PED-010 registrados |

### Mudancas desta sessao (12/06/2026) — QUARTA RODADA (Upload de fotos + avisos)

| Arquivo | Alteracao |
|---------|-----------|
| `src/app/api/oficina/tickets/route.ts` | POST aceita multipart/form-data com upload de anexo (Supabase Storage) |
| `src/app/oficina/chamado/page.tsx` | FileUpload, validacao de matricula, setor, avisos, API real |
| `src/app/corporativo/chatbot-app/page.tsx` | Upload de fotos, preview inline, botao avisos |
| `src/app/oficina/chatbot-app/page.tsx` | Upload de fotos, preview inline, botao avisos |
| `memorias.md` | Registro de autoria |
| `pedidos.md` | PED-008 registrado |
| `ideias.md` | REL-004 registrado |

### Mudancas desta sessao (12/06/2026) — TERCEIRA RODADA (Relatorios)

| Arquivo | Alteracao |
|---------|-----------|
| `src/app/corporativo/(atendimento)/dashboards/page.tsx` | CSV e PDF enriquecidos: KPIs, setores, status, prioridade, motivos, evolucao |
| `src/app/oficina/(atendimento)/dashboards/page.tsx` | CSV e PDF enriquecidos: KPIs, status, defeitos, funcoes, veiculos, evolucao |
| `src/app/eventos/(atendimento)/dashboards/page.tsx` | CSV e PDF enriquecidos: KPIs, status, setores, motivos, leads, evolucao |
| `memorias.md` | Registro de autoria |

### Mudancas desta sessao (12/06/2026) — SEGUNDA RODADA (RBAC)

| Arquivo | Alteracao |
|---------|-----------|
| `src/app/api/dashboards/route.ts` | Adicionado filtro `setor` via `getTicketWhereClause` para GESTOR |
| `src/app/api/cpfs/route.ts` | Removido ATENDENTE do POST (CPF é administrativo) |
| `src/app/api/quadro-avisos/route.ts` | GET filtra por `setor` para GESTOR/ATENDENTE |
| `src/app/api/tickets/search/route.ts` | GET usa `getTicketWhereClause` (filtro setor) |
| `src/app/eventos/(atendimento)/layout.tsx` | Adicionado check de modulo EVENTOS (redireciona se sem acesso) |
| `src/app/corporativo/(atendimento)/layout.tsx` | Adicionado check de modulo CORPORATIVO |
| `src/app/corporativo/(atendimento)/dashboards/page.tsx` | Adicionado redirect via `router.push` quando sem permissao |
| `src/app/eventos/(atendimento)/dashboards/page.tsx` | Adicionado redirect via `router.push` quando sem permissao |
| `src/app/eventos/(atendimento)/usuarios/page.tsx` | Redirecionamento corrigido para `/eventos/all-tickets` |
| `memorias.md` | Registro de autoria |
| `pedidos.md` | Pedido PED-001 registrado |
| `ideias.md` | Ideias REL-001 registradas |

### Estado do Projeto

- **GOD:** filtrando por `empresaId` nas rotas (CPFs, chamados, dashboards — só dados da própria empresa). Visão global apenas em `users/route.ts`.
- **ADMIN:** acesso total à própria empresa.
- **GESTOR:** filtro por `setor` aplicado em: tickets, dashboards, avisos, usuários.
- **ATENDENTE:** filtro por `setor` em tickets e avisos. Bloqueado de POST em CPFs e de acesso a dashboards.
- **Módulos:** Corporativo, Oficina e Eventos verificam permissão no layout (GOD bypass, demais checam módulo ativo na empresa).
- **Build:** compilado com sucesso

### Tarefas Pendentes (de tasks.txt)

1. ~~setar data e hora automatico pelo whats~~ ✅ Feito
2. ~~mudar as nomeclaturas necessarias no formulario e opcoes para oficina~~ ✅ Feito
3. ~~opcao de foto no modulo de oficina~~ ✅ Feito
4. ⬜ funcionalidade de entregar os avisos para os motoristas (parcial: avisos ja aparecem no formulario e chatbot)
5. ~~melhorar dashboards para visualizacao de oficina~~ ✅ Feito
6. ~~onde estiver apontando como motorista coloca colaborador~~ ✅ Feito
7. ~~quando logado como atendente deve redirecionar para os chamados~~ ✅ Feito
8. ~~mostrar nome da empresa em usuario ao inves do id~~ ✅ Feito

### Observacoes

- Os textos dos dashboards foram escritos sem acentos para evitar problemas de encoding no build/ runtime.
- `memorias.md` atualizado com registro de autoria.
