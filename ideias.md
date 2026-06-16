# Ideias e Melhorias

## REL-001: Central de auditoria de acesso (relacionado ao PED-001)
**Ideia:** Criar um log centralizado de acessos a rotas administrativas (quem acessou o que, quando) para auditoria de segurança. Poderia ser uma tabela `access_log` no banco ou simplesmente logs estruturados no servidor. 
**resposta:** boa ideia vou gerar o model no prisma, depois vc pode criar as rotas para gerar os logs no banco vou chamar o model de logs_de_acesso, porem somente o god podera acessar esses logs


## REL-001: Middleware global de RBAC (relacionado ao PED-001)
**Ideia:** Em vez de proteger rota por rota individualmente, criar um middleware global que leia a role do usuário e o pathname e aplique as regras de forma centralizada. Isso reduziria duplicação e risco de esquecer uma rota. 
**resposta:** agora o antigo middleware se chama proxy e quando pesquisei descobri que a melhor forma de proteger é individualmente, porque o proxy  não protege

## REL-002: Logs de acesso com fallback (relacionado ao PED-002)
**Ideia:** A tabela logs_de_acesso pode não existir no banco (sem migration). A rota do dashboard GOD agora trata isso com try-catch para não crashar.
**Status:** Implementado 
**resposta** a tabela ja existe no banco de dados!

## REL-003: Badge visual "all" para ADMIN sem setor (relacionado ao PED-007)
**Ideia:** Em vez de apenas texto "all", usar um badge visual (tag estilizada) para destacar que o administrador tem acesso a todos os setores, similar ao "Todos os setores" usado na página de criação de usuários.

## REL-004: Preview ampliado de imagem no chatbot (relacionado ao PED-008)
**Ideia:** Ao clicar na imagem preview no chat, abrir um modal/lightbox com a foto em tamanho original para melhor visualização do problema/documentação.

## REL-009: Alertas automáticos de reincidência (relacionado ao PED-019)
**Ideia:** Quando um veículo atingir 3+ reincidências no mesmo defeito em 30 dias, disparar notificação para o gestor da oficina informando que o reparo anterior pode não ter sido eficaz.

## REL-010: Previsão de defeitos por sazonalidade (relacionado ao PED-019)
**Ideia:** Usar os dados de sazonalidade para prever quais defeitos tendem a aumentar no próximo mês (ex: superaquecimento no verão) e sugerir manutenção preventiva.

## REL-006: Mesmo padrão de indicadores para Oficina e Eventos (relacionado ao PED-018)
**Ideia:** Os mesmos indicadores de tickets_evitados, taxa de automação e economia podem ser aplicados aos dashboards de Oficina e Eventos, já que o model tickets_evitados é multi-módulo (tem setor e empresaId). Bastaria replicar a lógica nos endpoints e páginas correspondentes.

## REL-007: Notificação quando taxa de automação cai (relacionado ao PED-018)
**Ideia:** Se a taxa de automação cair abaixo de um threshold (ex: 10%), enviar notificação para o ADMIN/GESTOR sugerindo revisar/criar mais avisos para melhorar a taxa de resolução automática do bot.

## REL-008: Sugestão automática de avisos baseada em motivos evitados (relacionado ao PED-018)
**Ideia:** Analisar os motivos mais frequentes em `tickets_evitados.descricao` e sugerir ao ADMIN a criação de avisos para esses tópicos, aumentando ainda mais a taxa de automação.

## REL-005: Mesmo padrão de loop pode existir em outros webhooks (relacionado ao PED-017)
**Ideia:** Webhook26 e webhook-oficina podem ter o mesmo problema no COLETAR_MOTIVO quando não há avisos, pois compartilham a mesma lógica de fallback para MENU_PRINCIPAL. Se ocorrer loop semelhante, aplicar o mesmo fix.

