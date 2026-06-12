# CHECKPOINT — NolevelBOT

## Sessao: 12/06/2026

### Branch Atual
`vibecode` (sincronizada com `origin/vibecode`)

### Ultimo Commit (HEAD)
```
da5f8eb revert: remove toda refatoracao dos dashboards (volta ao estado 2f0e380 antes de qualquer melhoria)
```

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
3. ⬜ opcao de foto no modulo de oficina (parcial: webhook-oficina ja coleta foto opcional)
4. ⬜ funcionalidade de entregar os avisos para os motoristas
5. ~~melhorar dashboards para visualizacao de oficina~~ ✅ Feito
6. ~~onde estiver apontando como motorista coloca colaborador~~ ✅ Feito
7. ~~quando logado como atendente deve redirecionar para os chamados~~ ✅ Feito
8. ~~mostrar nome da empresa em usuario ao inves do id~~ ✅ Feito

### Observacoes

- Os textos dos dashboards foram escritos sem acentos para evitar problemas de encoding no build/ runtime.
- `memorias.md` atualizado com registro de autoria.
