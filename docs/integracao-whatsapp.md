# Integração WhatsApp — Guia de Configuração para Clientes

> **Modelo BYO API:** sua empresa usa a **própria API de WhatsApp** (Evolution API ou Meta Cloud API).
> O NoLevel serve apenas o **webhook** — recebe as mensagens, processa com o bot IA e responde usando a sua API.
> O NoLevel **não hospeda** sua conexão WhatsApp. Você mantém o controle total do número.

---

## Índice

1. [Visão geral](#1-visão-geral)
2. [O que você precisa](#2-o-que-você-precisa)
3. [Token secreto do webhook (obrigatório)](#3-token-secreto-do-webhook-obrigatório)
4. [Conexão com Meta Cloud API](#4-conexão-com-meta-cloud-api)
5. [Conexão com Evolution API](#5-conexão-com-evolution-api)
6. [Verificação de funcionamento](#6-verificação-de-funcionamento)
7. [Solução de problemas](#7-solução-de-problemas)

---

## 1. Visão geral

```
Cliente ──(WhatsApp)──▶ Sua API de WhatsApp (Meta/Evolution)
                              │  webhook (POST)
                              ▼
                        NoLevel ──▶ Bot IA + Chamados
                              │  resposta
                              ▼
Sua API de WhatsApp ──(WhatsApp)──▶ Cliente
```

- **Entrada:** sua API envia cada mensagem recebida para o webhook do NoLevel.
- **Saída:** o NoLevel responde de volta pela **sua** API (usando a URL e a chave de envio cadastradas).
- **Segurança:** cada webhook exige o **token secreto** da sua empresa. Sem token → **HTTP 401**.

### URLs do webhook (por módulo contratado)

| Módulo | URL do webhook |
|---|---|
| Corporativo (SAC) | `https://app.nolevel.com.br/api/webhook-corporativo` |
| Oficina (Operação) | `https://app.nolevel.com.br/api/webhook-oficina` |
| Comercial (Leads) | `https://app.nolevel.com.br/api/webhook-comercial` |

> ⚠️ **Disponibilidade por módulo:** só são liberadas as URLs dos **módulos que sua empresa adquiriu**.
> Empresas sem um módulo não conseguem receber mensagens daquele fluxo.
> Troque `app.nolevel.com.br` pelo domínio real da plataforma. As URLs exatas aparecem no painel
> **Empresas → Integração WhatsApp**.

---

## 2. O que você precisa

- Um **número de WhatsApp** (o que será atendido pelo bot).
- Uma **API de WhatsApp** de um destes provedores:
  - **Meta Cloud API** (recomendado — oficial, 1.000 conversas gratuitas/mês); ou
  - **Evolution API** (self-hosted — você roda no seu próprio servidor).
- O **token do webhook** da sua empresa (copie no painel: **Empresas → Integração WhatsApp → Token do Webhook**).

---

## 3. Token secreto do webhook (obrigatório)

O token é a "senha" que autoriza a sua API a falar com o webhook do NoLevel.

- Você copia o token no painel do NoLevel (só o administrador vê).
- Ele deve ser enviado **em toda requisição** ao webhook.
- Se quiser, pode **regenerar** a qualquer momento (isso derruba qualquer conexão antiga imediatamente).

**Formas de enviar o token (escolha UMA):**

| Forma | Onde | Exemplo |
|---|---|---|
| ✅ **Query param** (recomendado) | Na URL do webhook | `https://app.nolevel.com.br/api/webhook-corporativo?token=SEU_TOKEN` |
| Header custom | No cabeçalho `x-webhook-token` | `x-webhook-token: SEU_TOKEN` |
| Campo do corpo | Apenas Evolution | campo `apikey` do payload (quando o token da instância for o token do NoLevel) |

> ⚠️ A Meta exige o token **na URL** (`?token=`), pois não permite headers custom no webhook.

---

## 4. Conexão com Meta Cloud API

> Requisitos: conta no [Meta for Developers](https://developers.facebook.com/) + número validado no WhatsApp Business Platform.

### Passo 1 — Criar o app e conectar o WhatsApp

1. Acesse **Meta for Developers** → **My Apps** → **Create App** → tipo **Business**.
2. Adicione o produto **WhatsApp** → **Get Started**.
3. Em **API Setup**, adicione um número de telefone (ou use um de teste) e valide o QR Code no WhatsApp do celular.
4. Anote o **Phone Number ID** (ex: `1029384756`) e o **Token de Acesso Permanente** (Access Token).

### Passo 2 — Configurar o webhook no Meta

1. No app da Meta, vá em **WhatsApp → Configuration**.
2. Em **Webhook**, clique em **Edit**.
3. Preencha:
   - **Callback URL:** `https://app.nolevel.com.br/api/webhook-corporativo?token=SEU_TOKEN`
     (troque a rota conforme o módulo e o `SEU_TOKEN` pelo token do NoLevel)
   - **Verify token:** `SEU_TOKEN` (o **mesmo** token do NoLevel)
4. Clique em **Verify and Save**.

> O NoLevel responde o `challenge` da Meta automaticamente quando o token confere.
> Se der erro de verificação, confira se o token está idêntico ao do painel.

5. Em **Webhook fields**, assine:
   - ✅ `messages`
   - (os campos `message_template_status_update`, `account_alerts` etc. são opcionais)

### Passo 3 — Cadastrar as credenciais no NoLevel

No painel **Empresas → Integração WhatsApp → Provedor**:

| Campo | Valor |
|---|---|
| **Provedor** | `Meta Cloud API` |
| **URL da API do cliente** | pode deixar vazio (a Meta tem base fixa) |
| **API Key de envio** | o **Access Token** permanente do seu app |

> 👤 O envio de mensagens *iniciadas pela empresa* (ex: notificações) usa **template** aprovado.
> O bot do NoLevel só responde a mensagens recebidas (sem custo de template).

---

## 5. Conexão com Evolution API

> Requisitos: uma instância **Evolution API** rodando (servidor próprio) com o WhatsApp conectado (QR Code).

### Passo 1 — Conectar o número na Evolution

1. Crie uma instância na sua Evolution (ex: nome `meubot`).
2. Conecte o WhatsApp escaneando o **QR Code** (o número fica online).
3. Guarde o **apikey** da instância (será a chave de envio no NoLevel).

### Passo 2 — Configurar o webhook na Evolution

1. Na sua Evolution, acesse a instância → **Webhook / Configurações**.
2. Defina a **URL do webhook**:
   ```
   https://app.nolevel.com.br/api/webhook-corporativo?token=SEU_TOKEN
   ```
   (troque a rota conforme o módulo e o `SEU_TOKEN` pelo token do NoLevel)
3. Ative os **eventos** do tipo **`messages.upsert`** (mensagens recebidas).
4. Se sua versão da Evolution suportar **headers custom**, você pode usar
   `x-webhook-token: SEU_TOKEN` em vez do `?token=` na URL (opcional).

> 🔒 Importante: mantenha o **`?token=` na URL** mesmo que sua Evolution envie o
> `apikey` da instância no corpo — o token do NoLevel **prevalece** sobre o apikey.

### Passo 3 — Cadastrar as credenciais no NoLevel

No painel **Empresas → Integração WhatsApp → Provedor**:

| Campo | Valor |
|---|---|
| **Provedor** | `Evolution API (self-hosted do cliente)` |
| **URL da API do cliente** | `https://sua-evolution.com.br` (base da sua API) |
| **API Key de envio** | o **apikey** da sua instância |

> 📷 O NoLevel baixa imagens/documentos diretamente da sua Evolution usando a URL e a chave cadastradas.

---

## 6. Verificação de funcionamento

1. Abra o WhatsApp no celular e **envie uma mensagem** para o número conectado.
2. O bot deve responder em poucos segundos.
3. No painel do NoLevel, o chamado/ticket deve aparecer no **Kanban** do módulo.

**Teste rápido do token (linha de comando):**

```bash
# sem token → deve responder 401
curl -X POST https://app.nolevel.com.br/api/webhook-corporativo -H "Content-Type: application/json" -d "{}"

# com token → responde 200 {"ok":true}
curl -X POST "https://app.nolevel.com.br/api/webhook-corporativo?token=SEU_TOKEN" -H "Content-Type: application/json" -d "{}"
```

---

## 7. Solução de problemas

| Problema | Causa provável | Solução |
|---|---|---|
| **401 ao configurar o webhook** | Token errado/ausente | Copie o token novamente no painel e confira `?token=` na URL |
| **Meta: "Verification failed"** | `Verify token` diferente do token do NoLevel | Use **exatamente** o mesmo token nas duas caixas |
| **Bot não responde** | Webhook não está enviando eventos | Ative o evento `messages.upsert` na Evolution; assine `messages` na Meta |
| **Erro de envio de imagem** | URL/chave de envio incorretas | Confira "URL da API do cliente" e "API Key de envio" no painel |
| **Meta não envia mensagens** | Número ainda em modo de teste | Adicione números de teste ou publique o app |
| **Resposta 429 (muitas requisições)** | Volume acima do limite por empresa | O limite é 240 req/min — informe o suporte se precisar de mais |
| **Regenerou o token e parou de funcionar** | Conexões antigas usam token anterior | Atualize a URL/verify token na sua API |

---

*Precisa de ajuda? Fale com o suporte do NoLevel.*
