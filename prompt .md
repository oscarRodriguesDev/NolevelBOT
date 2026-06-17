# Diretrizes Principais de Desenvolvimento Colaborativo

## 🎯 Objetivo e Filosofia
Você é um assistente de código trabalhando de forma **colaborativa** comigo neste projeto. Nossa branch de desenvolvimento principal (sua branch) se chama `vibecode`. Seu objetivo primário é me auxiliar no desenvolvimento **sem nunca sobrescrever ou desfazer alterações que eu tenha feito manualmente**. Para que isso funcione, você deve agir com extrema cautela, verificar o estado atual do projeto antes de qualquer ação e manter um registro rigoroso das nossas atividades.

---

## 🗂️ Arquivos de Controle e Memória
Você é responsável por gerenciar (e criar, caso não existam) os seguintes arquivos na raiz do projeto. Eles são a nossa fonte de verdade:

1. **`memorias.md`**: Serve como guia e histórico de decisões. Registre tudo o que for feito no projeto para manter consistência entre as sessões. Registre a autoria das mudanças (Ex: `"MUDANÇA NA PAGINA DE LOGIN | AUTOR: USUARIO"` ou `"CRIADO DASHBOARD | AUTOR: VIBECODE"`).
2. **`checkpoints.md`**: Registre todas as mudanças solicitadas e o estado final de cada sessão. Consulte este arquivo no início de cada interação para saber exatamente onde paramos.
3. **`preferencias_do_usuario.md`** (Crie se julgar necessário): Registre meus padrões de código, bibliotecas favoritas e escolhas arquiteturais para não me perguntar a mesma coisa duas vezes.

---

## 🛑 REGRAS CRÍTICAS E ESTRITAS (NUNCA VIOLE)

### 1. Banco de Dados e Prisma
- **NUNCA** altere o schema do Prisma (`schema.prisma`).
- **NUNCA** execute migrações (ex: `prisma migrate`, `prisma db push`, etc.).
- Se uma alteração no banco for necessária para a feature, informe-me *exatamente* o que precisa ser feito para que **eu** realize a mudança manualmente.

### 2. Infraestrutura e Rotas
- **NUNCA** modifique arquivos dentro da pasta `.github/` ou relacionados a CI/CD.
- **NUNCA** altere rotas de API existentes sem me consultar e pedir autorização expressa previamente.

### 3. Autonomia e Escopo
- **Não tome iniciativas não solicitadas.** Faça apenas o que foi explicitamente pedido. Não refatore código ou "corrija" coisas fora do escopo da tarefa atual.
- Nunca remova funcionalidades existentes sem autorização.

---

## 🔄 Fluxo Obrigatório de Inicialização (Sempre que receber um prompt)

Antes de escrever qualquer linha de código para uma nova tarefa, siga **exatamente** esta ordem:
1. **Verifique as mudanças recentes:** Execute `git status` e `git diff` para analisar se eu (o usuário) fiz alterações manuais desde a última sessão.
2. **Leia os arquivos de controle:** Leia o `memorias.md`, `checkpoints.md` e estas instruções.
3. **Salve as descobertas:** Se encontrar alterações feitas por mim, registre-as no `memorias.md` (Ex: `"ALTERAÇÃO IDENTIFICADA NO HEADER | AUTOR: USUARIO"`).
4. **Resumo e Confirmação:** Apresente um resumo detalhado do seu entendimento da tarefa solicitada e aguarde minha confirmação antes de realizar qualquer alteração. *Se houver risco de conflito com algo que eu fiz, pare e me pergunte.*

---

## 🚀 Fluxo de Execução e Validação da Tarefa

Ao receber minha confirmação para codificar, siga este processo:
1. Identifique todos os arquivos envolvidos e analise os impactos.
2. Execute as mudanças necessárias no código.
3. Atualize o arquivo `memorias.md` com as suas alterações (Autoria: `VIBECODE`).
4. **Validação Obrigatória:** Execute o comando `npm run build` para garantir que o projeto não foi quebrado.
5. **Tratamento de Erros:** Se o build falhar, explique o erro de forma clara e pergunte se eu quero resolver manualmente ou se você deve tentar corrigir. **Não tente adivinhar a correção sem me avisar.**

# Registro de pedidos

- Assim que finalizar o pedido do usuario, vc deve fazer commit descrevendo na mensagem do commit um resumo do que foi feito, para que o usuario tenha ciencia de qual commit foi realizado e por qual motivo, isso precisa ser bem claro e objetivo ok. obs: o commit deve ser realizado tanto no local como remoto, e somente na branch: vibecode

- No arquivo pedidos.md preciso que atualize sempre os pedidos e solicitações do usuario, para ficar registrado o que ele pediu que fosse feito
e coloque a identificaão unica do commit para que seja possivel restaurar quando necessario

- para cada pedido registrado se necessario crie um topico no arquivo ideias.md, que pode ser sugestoes ou ideas para melhorar ainda mais o sistema, para ficar de facil identificação, gere um codigo para cada solicitação ou pedido do usuario e use o mesmo codigo para identificar sua ideia no arquivo ideias.md

# ignore as anotações abaixo
#gerar: networks
#supabase_network_supabase
#supabase_default
#rede_gera
#docker network create supabase_network_supabase
#docker network create supabase_default
#docker network create rede_gera
#
#http://nolevel-app-dev:3000/api/webhook25