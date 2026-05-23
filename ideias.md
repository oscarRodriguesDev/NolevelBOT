# Ideias de Melhorias — NolevelBOT

> Análise realizada em 19/05/2026 baseada em inspeção completa do código-fonte.
> Prioridade: 🔴 Crítica / 🟡 Alta / 🔵 Média / 🟢 Baixa

---

## 🔴 PRIORIDADE CRÍTICA — Segurança

### 1. Senha sendo logada em plaintext
**Arquivo:** `src/app/api/auth/[...nextauth]/route.ts:19`
**Problema:** `console.log('senha recebida', credentials.password)` — a senha do usuário é escrita nos logs do servidor em texto puro. Violação de boas práticas de segurança.
**Solução:** Remover este log imediatamente.

### 2. Autenticação ignorada em PUT/DELETE de tickets
**Arquivo:** `src/app/api/tickets/route.ts:254,347` e `src/app/api/tickets/search/route.ts:207,290`
**Problema:** `getSessionOrFail()` é chamado mas o retorno é descartado. Qualquer requisição com `userId` no body consegue alterar qualquer chamado.
**Solução:** Usar o retorno de `getSessionOrFail()` para verificar autenticação antes de prosseguir.

### 3. Rota GET de empresas sem autenticação
**Arquivo:** `src/app/api/empresa/route.ts:31`
**Problema:** Qualquer pessoa pode listar todas as empresas do sistema.
**Solução:** Adicionar verificação de sessão.

### 4. Rota GET de leads sem autenticação
**Arquivo:** `src/app/api/leads-network/route.ts:4`
**Problema:** Qualquer pessoa pode listar todos os leads cadastrados (nomes, CPFs, telefones).
**Solução:** Adicionar verificação de sessão com role apropriada.

### 5. Dependência suspeita `prisma-client` v0.0.0
**Arquivo:** `package.json:25`
**Problema:** `prisma-client` no npm NÃO é o Prisma Client oficial (que é `@prisma/client`). É uma dependência fantasma/typo-squatting.
**Solução:** Remover do `package.json`.

### 6. Dependência obscura `toast` v0.5.4
**Arquivo:** `package.json:31`
**Problema:** Pacote com ~7 downloads/semana. O `react-hot-toast` já está instalado e é a escolha correta.
**Solução:** Remover `toast` do `package.json` e usar `react-hot-toast`.

---

## 🟡 PRIORIDADE ALTA — Estabilidade & Profissionalismo

### 7. Zero testes automatizados
**Problema:** Não há nenhum teste (unitário, integração, e2e) em todo o projeto. Qualquer alteração depende de teste manual.
**Sugestão:** Configurar Vitest + Testing Library para testes unitários dos componentes e hooks. Começar pelos componentes críticos (modal, formulários, webhooks).

### 8. Nenhum error boundary (error.tsx)
**Problema:** Se qualquer exceção ocorrer em um componente cliente, a página inteira quebra com tela branca. Next.js 16 suporta `error.tsx` mas nenhum foi criado.
**Sugestão:** Criar `src/app/error.tsx` global e `src/app/(atendimento)/error.tsx` para a área logada.

### 9. `react-hot-toast` instalado mas NUNCA usado
**Arquivo:** `package.json` — presente. Uso: zero.
**Problema:** 26 chamadas de `alert()` nativo espalhadas pelo código, bloqueando a interação do usuário. A biblioteca está instalada, só não é utilizada.
**Sugestão:** Substituir todos os `alert()` por `toast.success()` / `toast.error()` / `toast()`. Estima-se ~2 horas de trabalho.

### 10. Validação de formulário inexistente
**Problema:** Toda validação é feita com `alert()` manuais ou `required` do HTML. Não há validação de CPF (apenas length === 11), email, senha forte, etc.
**Sugestão:** Adotar React Hook Form + Zod para validação declarativa com mensagens de erro inline nos campos.

### 11. Status dos chamados é String livre no banco
**Arquivo:** `prisma/schema.prisma:61`
**Problema:** O campo `status` em `Chamado` é `String` sem enum. Isso permite valores inconsistentes (`NOVO`, `novo`, `aberto`, `concluido`, `CONCLUIDO`, etc.).
**Sugestão:** Criar um enum `StatusChamado` no Prisma com: `NOVO`, `EM_ATENDIMENTO`, `AGUARDANDO`, `CONCLUIDO`, `CANCELADO`. (⚠️ Requer migração — consultar antes.)

### 12. Duplicação massiva de código
**Problemas identificados:**
- `webhook22/route.ts` (496 linhas), `webhook23/route.ts` (295 linhas), `webhook24/route.ts` (309 linhas) → ~90% idênticos
- `tickets/route.ts` e `tickets/search/route.ts` → PUT e DELETE copiados
- `cpfs/route.ts` e `cpfs/general_cpf/route.ts` → POST copiado integralmente
- `chamado/page.tsx` e `chamado/[ticket]/page.tsx` → ~90% idênticos
- `nextauth.ts` e `[...nextauth]/route.ts` → `authOptions` definido duas vezes
**Sugestão:** Refatorar webhooks para um handler centralizado com configuração por instância. Extrair lógica compartilhada de tickets. Unificar as páginas de chamado.

### 13. Sem índices no banco de dados
**Arquivo:** `prisma/schema.prisma`
**Problema:** Nenhum `@@index` em foreign keys ou colunas frequentemente consultadas (`empresaId`, `cpf`, `status`, `prioridade`). Performance degradará com crescimento.
**Sugestão:** Adicionar índices:
```prisma
@@index([empresaId])
@@index([cpf])
@@index([status])
@@index([empresaId, status])
```

### 14. Tema inconsistente em `modal-edit-user.tsx` e `userFacil/page.tsx`
**Problema:** `modal-edit-user.tsx` usa `dark:bg-zinc-900` (abordagem Tailwind antiga) em vez de `var(--surface)`. `userFacil/page.tsx` não usa variáveis CSS de tema nenhuma.
**Sugestão:** Padronizar todos os componentes para usar o sistema de `var(--background)`, `var(--surface)`, `var(--foreground)`, `var(--border-subtle)`.

---

## 🔵 PRIORIDADE MÉDIA — Experiência do Usuário

### 15. Skeleton loaders e loading.tsx
**Problema:** Nenhum skeleton loader no projeto. Apenas textos "Carregando..." e spinners inline. O Next.js 16 suporta `loading.tsx` para loading automático, mas não é usado.
**Sugestão:** Criar componentes `Skeleton` e `SkeletonTable` reutilizáveis. Adicionar `loading.tsx` nas rotas principais.

### 16. Biblioteca de componentes UI
**Problema:** Padrões de UI repetidos manualmente em todo o código:
- `getStatusColor` duplicado em 3 arquivos
- `getPriorityColor` duplicado em 2 arquivos
- Input styling repetido 60+ vezes
- Botões com `onMouseEnter`/`onMouseLeave` inline (anti-pattern Tailwind)
- Spinner SVG inlinado em 3+ arquivos
**Sugestão:** Extrair para `src/app/components/`:
  - `StatusBadge.tsx` — badge de status com cor
  - `PriorityBadge.tsx` — badge de prioridade com cor
  - `FormInput.tsx`, `FormSelect.tsx`, `FormTextarea.tsx` — inputs temáticos
  - `Button.tsx` — botão com variantes (primary, secondary, danger) e loading
  - `Spinner.tsx` — spinner reutilizável
  - `EmptyState.tsx` — estado vazio padronizado

### 17. Acessibilidade (ARIA)
**Problema:** Apenas 2 atributos `aria-label` em todo o projeto. Modais sem `role="dialog"`, sem focus trap, sem fechar com Escape. Drag and drop sem alternativa de teclado.
**Sugestão:** Adicionar `role="dialog"`, `aria-modal`, `aria-labelledby` nos modais. Implementar focus trap e fechamento com Escape. Adicionar `aria-label` em todos os botões de ação.

### 18. Webhooks poderiam ser unificados
**Sugestão:** Criar um handler central `webhook-core.ts` que recebe a instância como parâmetro. Os 3 webhooks atuais (22, 23, 24) são ~90% idênticos e qualquer bug precisa ser corrigido 3 vezes.

### 19. Containers Docker rodando como root
**Arquivo:** `dockerfile`
**Problema:** O container Next.js roda como root. Boa prática: usar `USER node` após instalar dependências.
**Sugestão:** Adicionar `USER node` antes do `CMD`.

### 20. CI/CD sem validação
**Arquivo:** `.github/workflows/deploy.yml`
**Problema:** O deploy sobe direto sem rodar `npm run build` ou `npm run lint` antes. Se o build quebrar, o deploy quebra no meio.
**Sugestão:** Adicionar etapas de `npm run build` e `npm run lint` antes do deploy no workflow.

---

## 🟢 PRIORIDADE BAIXA — Refinamentos

### 21. `layout.tsx` com typo
**Arquivo:** `src/app/layout.tsx:16`
**Problema:** `className={`ransition-colors duration-300`}` — digitado "ransition" em vez de "transition". A transição no body não funciona por causa disso.

### 22. Nenhum `.env.example`
**Problema:** Não há arquivo de exemplo documentando quais variáveis de ambiente são necessárias para rodar o projeto.
**Sugestão:** Criar `.env.example` com valores placeholder.

### 23. Typos no schema
**Arquivo:** `prisma/schema.prisma:25`
**Problema:** Campo `chammados` (dois 'm') no model `empresa`.
**Sugestão:** Renomear para `chamados`.

### 24. Sem formatação automática de código
**Problema:** Não há Prettier configurado. O estilo do código varia conforme o desenvolvedor.
**Sugestão:** Adicionar Prettier + `lint-staged` + Husky para formatar automaticamente no commit.

### 25. Sem página de documentação da API
**Problema:** Não há Swagger/OpenAPI docs para as rotas de API. Desenvolvedores precisam ler o código para entender os endpoints.
**Sugestão:** Adicionar `next-swagger-doc` ou similar.

### 26. Console.log de senha (já citado, mas importantíssimo)
Reiteração: remover `console.log('senha recebida', ...)` é a mudança mais urgente do projeto.

### 27. Tipos TypeScript duplicados
**Problema:** O tipo `Chamado` é redefinido em 4 arquivos diferentes. O tipo `HistoricoItem` é redefinido em 2 arquivos.
**Sugestão:** Centralizar em `src/types/chamado.ts` e importar onde necessário. Aproveitar tipos gerados pelo Prisma (`Prisma.ChamadoGetPayload`).

### 28. Notificações WhatsApp sem fallback para quem não interagiu com o bot
**Problema:** Atualmente, apenas quem interage com o webhook24 recebe notificações. Chamados abertos pelo portal web ficam sem notificação.
**Sugestão:** Adicionar campo `telefone` opcional no formulário de abertura de chamado do portal, para permitir notificação mesmo sem passar pelo bot.

---

## Resumo por Esforço

| Esforço | Itens | Impacto |
|---------|-------|---------|
| **1 hora** | 1, 21, 22, 23, 5, 6 | 🔴 Segurança + qualidade |
| **1 dia** | 2, 3, 4, 7 (parcial), 9 | 🔴 Segurança + UX |
| **2-3 dias** | 8, 10, 14, 16, 17, 24, 27 | 🟡 Profissionalismo |
| **1 semana** | 11, 12, 13 | 🟡 Arquitetura |
| **2+ semanas** | 7 (completo), 15, 18, 28 | 🔵 Escalabilidade |

---

## Recomendação de Próximos Passos

Sugiro começar pelos itens de **1 hora** (remoção de dependências fantasmas, correção do typo, remoção do log de senha) pois são mudanças seguras e de alto impacto na segurança/qualidade.

Depois, atacar os itens de **1 dia**: substituir `alert()` por toast, proteger as rotas vulneráveis, e configurar testes básicos.

Os itens arquiteturais (webhooks unificados, enums no schema, índices) devem ser discutidos antes de implementar, pois envolvem mudanças estruturais.
