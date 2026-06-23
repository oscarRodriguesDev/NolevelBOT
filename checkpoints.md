# Checkpoints do Projeto

## Sessão: 22/06/2026

### Estado Inicial
- **Branch:** `vibecode`
- **Working tree:** Limpo
- **Último commit antes da sessão:** `20fd864 testes`

### Tarefas Concluídas
- PED-027: /api/upload retornando 413 na Vercel (22/06/2026)
  - Criado `/api/upload-signed` — gera signed URL do Supabase, bypassando Vercel
  - Criado `src/lib/upload-client.ts` — helper client-side `uploadFileDirect()`
  - Atualizados 4 callers (2 chatbots + 2 empresa pages)
  - `/api/upload` mantido para compatibilidade
  - Build: ✅ sucesso

### Próximos Passos
- Aguardando instruções do usuário
