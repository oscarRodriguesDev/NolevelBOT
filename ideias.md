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

