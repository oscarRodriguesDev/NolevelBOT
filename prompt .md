leia todo me projeto- crie um arquivo chamado memorias.md e atualize nele tudo que fizer no projeto, a intenção é que ele sirva de guia para continuar com o mesmo sentido, manter consistencia entre seções, sua branch deve é a vibecode, tudo que fizer todo pedido que eu fizer quero que vc faça commit no git hub e crie um arquivo chamado checkpoint.md e registre todos os comits, esse arquivo servirá para que vc consulte e saiba exatametne onde parou na sessao anterior, tente não fazer nada que quebre o projeto, ao pecisar fazer mudanças drasticas semper me consulte, caso acredite que seja necessarios crie um arquivo chamado preferencias_do_usuario.md e registre as minhas preferencias

# Instruções Gerais do Projeto

## Objetivo

Antes de executar qualquer tarefa, você deve compreender completamente o contexto do projeto, respeitar as regras abaixo e seguir o fluxo de trabalho definido neste documento.

---

# Fluxo Obrigatório de Inicialização

Sempre que iniciar uma nova tarefa, execute obrigatoriamente as etapas abaixo, nesta ordem:

1. Analise toda a estrutura do projeto e identifique os principais arquivos e diretórios.
2. Leia integralmente o arquivo `memorias.md`.
3. Leia integralmente o arquivo `checkpoints.md`.
4. Leia integralmente o arquivo `instrucoes.md`.
5. Caso exista qualquer dúvida sobre como proceder e essa dúvida não esteja respondida em `instrucoes.md`, interrompa o trabalho e pergunte explicitamente ao usuário antes de continuar.
6. Após concluir a análise inicial, apresente um resumo detalhado do seu entendimento do projeto.
7. Aguarde a confirmação do usuário antes de realizar qualquer alteração.

---

# Regras Críticas

## Banco de Dados

- Nunca altere o schema do Prisma.
- Nunca edite arquivos relacionados ao schema do Prisma.
- Nunca execute migrações automaticamente.
- Nunca rode comandos como `prisma migrate`, `prisma db push` ou similares.
- Se alguma alteração no banco de dados for realmente necessária, informe exatamente o que deve ser alterado para que o usuário realize manualmente.
- Alterações no Prisma devem ser tratadas como último recurso.

## Segurança Operacional

- Nunca faça alterações sem compreender completamente o impacto.
- Sempre preserve compatibilidade com o código existente.
- Evite mudanças desnecessárias.
- Não remova funcionalidades existentes sem autorização explícita.
- Em caso de dúvida, pergunte antes de prosseguir.

---

# Fluxo de Execução de Tarefas

Ao receber uma solicitação de desenvolvimento, siga este processo:

1. Entenda o objetivo da solicitação.
2. Identifique todos os arquivos envolvidos.
3. Analise dependências e impactos da alteração.
4. Execute as mudanças necessárias.
5. Verifique se não houve regressões.
6. Execute o build do projeto para validar que a aplicação não foi quebrada.
7. Corrija automaticamente qualquer erro de build causado pelas alterações.
8. Somente finalize quando o build estiver concluído com sucesso.

---

# Validação Obrigatória

Antes de concluir qualquer trabalho, execute obrigatoriamente:

```bash
npm run build

