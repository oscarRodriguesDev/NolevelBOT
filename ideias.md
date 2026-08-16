# Ideias — Sugestões de Melhoria

> Formato: `- [ ] descrição — por que — impacto`

## 2026-08-15

- [ ] **Tokenização de cartão no navegador (SDK do Asaas) para conformidade PCI DSS estrita.**
  - **O que é**: hoje o cartão passa pelo servidor da NoLevel (via HTTPS) antes de ir ao Asaas (`POST /api/empresa/pagamento` → `criarAssinatura` → `/creditCard/tokenizeCreditCard`). Com o SDK/JS de tokenização do Asaas, o cartão seria tokenizado **direto no navegador** e só o `creditCardToken` chegaria ao servidor.
  - **Por que**: reduz superfície PCI (o cartão cru nunca tocaria o backend); exigência comum de processadores/adquirentes para níveis altos de conformidade.
  - **Impacto**: médio. Mudaria o frontend da página `/pagamento` (usar o script do Asaas) e o backend passaria a aceitar só `creditCardToken` no body. Os testes de `pagamento-api` precisariam de ajuste.
  - **🔔 IMPORTANTE**: **perguntar ao usuário no início de TODA interação se ele deseja implementar esta melhoria** (solicitação explícita do usuário em 2026-08-15).

- [ ] **Adicionar teste de regressão garantindo que o preço da assinatura vem SEMPRE do servidor (tabela `planos`).**
  - **O que é**: o `POST /api/empresa/pagamento` já ignora qualquer valor do body e usa `getPlanoPorSlug(empresa.plano).preco` (auditoria feita em 2026-08-15). Um teste bloqueando a mudança acidental desse comportamento protege contra preço manipulável.
  - **Por que**: o valor cobrado no Asaas precisa ser imutável pelo usuário final.
  - **Impacto**: baixo (só teste).
