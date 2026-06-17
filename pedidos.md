# Pedidos e Solicitações do Usuário

## PED-021: Análise completa do sistema + página pública de ideias
**Data:** 17/06/2026
**Status:** ✅ Concluído
**Descrição:** Realizar análise minuciosa e detalhada de todo o sistema, registrar todas as oportunidades de melhoria no arquivo `ideias.md`, e criar uma página pública em `/ideias` para visualização estilizada.
**Commit:** `684f4e6`
**Entregues:**
- `ideias.md` reescrito com 32 itens em 6 categorias (Segurança, Arquitetura, Performance, UX, Infraestrutura, Testes)
- `src/lib/ideias-data.ts` — parser do markdown para dados estruturados
- `src/app/ideias/page.tsx` — server component que lê e parseia o arquivo
- `src/app/ideias/ideias-client.tsx` — componente cliente com:
  - Filtros por severidade (Crítico/Alto/Médio/Baixo)
  - Filtros por esforço (Pequeno/Médio/Grande)
  - Busca textual por ID, título, local ou descrição
  - Ordenação por severidade ou esforço
  - Cards expansíveis com detalhes completos
  - Tema claro/escuro via CSS variables
- `proxy.ts` — `/ideias` adicionado às rotas públicas
