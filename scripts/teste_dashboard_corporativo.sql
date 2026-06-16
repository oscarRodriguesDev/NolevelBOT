-- ===========================================================
-- SCRIPT DE TESTE - DASHBOARD CORPORATIVO
-- ===========================================================
-- Substitua 'ba11f1db-b899-4faf-9417-22ce27f24917' pelo UUID da sua empresa
-- Exemplo: '123e4567-e89b-12d3-a456-426614174000'
--
-- Como usar:
--   1. Descubra o ID da empresa: SELECT id, nome FROM empresa;
--   2. Substitua 'ba11f1db-b899-4faf-9417-22ce27f24917' pelo ID real
--   3. Execute no seu banco PostgreSQL
-- ===========================================================

-- ===========================================================
-- 1. AVISOS (8 avisos para teste)
-- ===========================================================
INSERT INTO "avisos" (id, "empresaId", titulo, conteudo, setor, "createdAt", "updatedAt") VALUES
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'Novo sistema de ponto eletronico', 'O novo sistema de ponto eletronico entra em vigor no dia 01/07. Todos os funcionarios devem registrar a digital.', 'RH', '2026-04-01 08:00:00-03', '2026-04-01 08:00:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'Manutencao programada do servidor', 'O servidor passara por manutencao no sabado as 14h. Previsto retorno as 18h.', 'TI', '2026-04-05 10:00:00-03', '2026-04-05 10:00:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'Fechamento de folha antecipado', 'A folha de pagamento de junho sera fechada no dia 25. Enviem todas as horas extras ate o dia 24.', 'Financeiro', '2026-05-02 09:00:00-03', '2026-05-02 09:00:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'Campanha de vacinacao', 'A empresa iniciara campanha de vacinacao contra gripe na proxima semana. Procure o RH para agendar.', 'Administrativo', '2026-05-10 08:00:00-03', '2026-05-10 08:00:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'Novo uniforme obrigatorio', 'O novo uniforme de inverno sera distribuido a partir do dia 15. O uso e obrigatorio para todos.', 'RH', '2026-05-20 10:00:00-03', '2026-05-20 10:00:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'Sistema de chamados atualizado', 'O sistema de chamados foi atualizado. Agora e possivel anexar imagens e acompanhar em tempo real.', 'TI', '2026-06-01 08:00:00-03', '2026-06-01 08:00:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'Treinamento obrigatorio LGPD', 'Todos os funcionarios devem realizar o treinamento de LGPD ate o dia 30/06. Link no portal do RH.', 'Administrativo', '2026-06-05 09:00:00-03', '2026-06-05 09:00:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'Aviso: Ferias coletivas', 'A empresa entrara em ferias coletivas de 20/12 a 05/01. Planejem seus chamados com antecedencia.', 'RH', '2026-06-10 10:00:00-03', '2026-06-10 10:00:00-03');

-- ===========================================================
-- 2. CHAMADOS EVITADOS PELO BOT (20 registros)
-- ===========================================================
INSERT INTO "tickets_evitados" (id, nome, "empresaId", cpf, setor, descricao, prioridade, "createdAt", "updatedAt") VALUES
  -- Abril (5)
  (gen_random_uuid(), 'Carlos Silva', 'ba11f1db-b899-4faf-9417-22ce27f24917', '12345678901', 'RH', 'Qual o horario de funcionamento do RH?', 'baixa', '2026-04-02 09:15:00-03', '2026-04-02 09:15:00-03'),
  (gen_random_uuid(), 'Ana Oliveira', 'ba11f1db-b899-4faf-9417-22ce27f24917', '23456789012', 'TI', 'Como acesso o email corporativo no celular?', 'normal', '2026-04-08 10:30:00-03', '2026-04-08 10:30:00-03'),
  (gen_random_uuid(), 'Pedro Santos', 'ba11f1db-b899-4faf-9417-22ce27f24917', '34567890123', 'Financeiro', 'Qual a data de pagamento desse mes?', 'baixa', '2026-04-15 14:00:00-03', '2026-04-15 14:00:00-03'),
  (gen_random_uuid(), 'Maria Costa', 'ba11f1db-b899-4faf-9417-22ce27f24917', '45678901234', 'Administrativo', 'Preciso do comprovante de residencia para admissao', 'normal', '2026-04-22 11:00:00-03', '2026-04-22 11:00:00-03'),
  (gen_random_uuid(), 'Joao Pereira', 'ba11f1db-b899-4faf-9417-22ce27f24917', '56789012345', 'TI', 'Esqueci minha senha do sistema', 'alta', '2026-04-28 08:45:00-03', '2026-04-28 08:45:00-03'),
  -- Maio (7)
  (gen_random_uuid(), 'Lucia Mendes', 'ba11f1db-b899-4faf-9417-22ce27f24917', '67890123456', 'RH', 'Quantos dias de ferias eu tenho direito?', 'baixa', '2026-05-03 09:00:00-03', '2026-05-03 09:00:00-03'),
  (gen_random_uuid(), 'Rafael Lima', 'ba11f1db-b899-4faf-9417-22ce27f24917', '78901234567', 'TI', 'O sistema esta lento, o que fazer?', 'alta', '2026-05-07 10:15:00-03', '2026-05-07 10:15:00-03'),
  (gen_random_uuid(), 'Fernanda Rocha', 'ba11f1db-b899-4faf-9417-22ce27f24917', '89012345678', 'Financeiro', 'Meu holerite nao aparece no portal', 'normal', '2026-05-12 13:30:00-03', '2026-05-12 13:30:00-03'),
  (gen_random_uuid(), 'Gabriel Souza', 'ba11f1db-b899-4faf-9417-22ce27f24917', '90123456789', 'Administrativo', 'Como solicitar vale transporte?', 'baixa', '2026-05-14 15:00:00-03', '2026-05-14 15:00:00-03'),
  (gen_random_uuid(), 'Juliana Dias', 'ba11f1db-b899-4faf-9417-22ce27f24917', '01234567890', 'Marketing', 'Qual o prazo para entrega do material da campanha?', 'normal', '2026-05-18 11:30:00-03', '2026-05-18 11:30:00-03'),
  (gen_random_uuid(), 'Marcos Paulo', 'ba11f1db-b899-4faf-9417-22ce27f24917', '11223344556', 'TI', 'Preciso de acesso ao sistema de notas fiscais', 'normal', '2026-05-22 09:45:00-03', '2026-05-22 09:45:00-03'),
  (gen_random_uuid(), 'Patricia Alves', 'ba11f1db-b899-4faf-9417-22ce27f24917', '22334455667', 'RH', 'Como funciona o plano de saude?', 'baixa', '2026-05-27 14:30:00-03', '2026-05-27 14:30:00-03'),
  -- Junho (8)
  (gen_random_uuid(), 'Ricardo Gomes', 'ba11f1db-b899-4faf-9417-22ce27f24917', '33445566778', 'TI', 'Meu computador nao liga, tem algum procedimento?', 'alta', '2026-06-01 07:30:00-03', '2026-06-01 07:30:00-03'),
  (gen_random_uuid(), 'Amanda Farias', 'ba11f1db-b899-4faf-9417-22ce27f24917', '44556677889', 'Financeiro', 'Qual o codigo para pagamento do boleto?', 'normal', '2026-06-03 10:00:00-03', '2026-06-03 10:00:00-03'),
  (gen_random_uuid(), 'Bruno Castro', 'ba11f1db-b899-4faf-9417-22ce27f24917', '55667788990', 'Administrativo', 'Onde encontro o formulario de solicitacao de ferias?', 'baixa', '2026-06-05 08:30:00-03', '2026-06-05 08:30:00-03'),
  (gen_random_uuid(), 'Cintia Martins', 'ba11f1db-b899-4faf-9417-22ce27f24917', '66778899001', 'TI', 'Como configurar a VPN para home office?', 'normal', '2026-06-09 11:00:00-03', '2026-06-09 11:00:00-03'),
  (gen_random_uuid(), 'Daniel Oliveira', 'ba11f1db-b899-4faf-9417-22ce27f24917', '77889900112', 'Marketing', 'Preciso das artes da campanha de junho', 'normal', '2026-06-10 15:30:00-03', '2026-06-10 15:30:00-03'),
  (gen_random_uuid(), 'Elaine Santos', 'ba11f1db-b899-4faf-9417-22ce27f24917', '88990011223', 'RH', 'Como solicitar atestado medico?', 'baixa', '2026-06-12 09:15:00-03', '2026-06-12 09:15:00-03'),
  (gen_random_uuid(), 'Fabio Henrique', 'ba11f1db-b899-4faf-9417-22ce27f24917', '99001122334', 'Financeiro', 'Meu reembolso ainda nao foi pago', 'alta', '2026-06-14 16:00:00-03', '2026-06-14 16:00:00-03'),
  (gen_random_uuid(), 'Giovana Lima', 'ba11f1db-b899-4faf-9417-22ce27f24917', '00112233445', 'Administrativo', 'Como cadastrar meu dependente no plano?', 'normal', '2026-06-15 10:30:00-03', '2026-06-15 10:30:00-03');

-- ===========================================================
-- 3. CHAMADOS REAIS (50 chamados para testar metricas)
-- ===========================================================
-- Distribuicao planejada:
--   Status: NOVO(8) | EM_ATENDIMENTO(10) | AGUARDANDO(7) | CONCLUIDO(15) | FECHADO(7) | CANCELADO(3)
--   Setores: RH(10) | TI(10) | Financeiro(10) | Administrativo(10) | Marketing(5) | Comercial(5)
--   Prioridade: baixa(8) | normal(22) | alta(14) | critica(6)

-- Função auxiliar para gerar ticket numerico
-- (cada chamado precisa de um ticket unico - usaremos timestamp simulado)

-- ABRIL (12 chamados)
INSERT INTO "Chamado" (id, "empresaId", ticket, nome, cpf, setor, descricao, status, prioridade, "createdAt", "updatedAt") VALUES
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260401', 'Joao Silva', '11111111111', 'TI', 'Computador travando ao abrir o sistema', 'CONCLUIDO', 'alta', '2026-04-01 08:00:00-03', '2026-04-02 09:30:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260402', 'Maria Santos', '22222222222', 'RH', 'Erro no calculo das ferias', 'CONCLUIDO', 'alta', '2026-04-02 09:00:00-03', '2026-04-03 16:00:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260403', 'Carlos Pereira', '33333333333', 'Financeiro', 'Nota fiscal com valor incorreto', 'CONCLUIDO', 'critica', '2026-04-03 10:00:00-03', '2026-04-03 14:30:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260404', 'Ana Costa', '44444444444', 'Administrativo', 'Solicitacao de compra de material de escritorio', 'CONCLUIDO', 'baixa', '2026-04-05 08:30:00-03', '2026-04-08 10:00:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260405', 'Pedro Almeida', '55555555555', 'TI', 'Impressora nao funciona na rede', 'FECHADO', 'normal', '2026-04-07 11:00:00-03', '2026-04-09 13:00:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260406', 'Lucia Oliveira', '66666666666', 'Marketing', 'Criacao de banner para campanha', 'CONCLUIDO', 'normal', '2026-04-08 09:00:00-03', '2026-04-10 17:00:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260407', 'Rafael Souza', '77777777777', 'Financeiro', 'Reembolso de viagem nao processado', 'CONCLUIDO', 'normal', '2026-04-10 14:00:00-03', '2026-04-11 10:30:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260408', 'Fernanda Lima', '88888888888', 'RH', 'Admissao de novo funcionario - documento pendente', 'CONCLUIDO', 'normal', '2026-04-12 08:00:00-03', '2026-04-15 11:00:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260409', 'Gabriel Rocha', '99999999999', 'TI', 'Criar email para novo estagiario', 'FECHADO', 'baixa', '2026-04-15 10:00:00-03', '2026-04-15 15:00:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260410', 'Juliana Dias', '10101010101', 'Comercial', 'Proposta comercial com erro de precificacao', 'CONCLUIDO', 'critica', '2026-04-18 09:30:00-03', '2026-04-18 16:45:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260411', 'Marcos Paulo', '12121212121', 'Administrativo', 'Agendamento de sala de reuniao', 'FECHADO', 'baixa', '2026-04-20 08:00:00-03', '2026-04-20 09:00:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260412', 'Patricia Alves', '13131313131', 'TI', 'Acesso ao sistema bloqueado apos ferias', 'CANCELADO', 'normal', '2026-04-22 11:00:00-03', '2026-04-23 08:00:00-03');

-- MAIO (18 chamados)
INSERT INTO "Chamado" (id, "empresaId", ticket, nome, cpf, setor, descricao, status, prioridade, "createdAt", "updatedAt") VALUES
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260501', 'Ricardo Gomes', '14141414141', 'TI', 'Sistema ERP fora do ar', 'CONCLUIDO', 'critica', '2026-05-02 07:00:00-03', '2026-05-02 10:30:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260502', 'Amanda Farias', '15151515151', 'RH', 'Correcao no holerite - valor incorreto', 'CONCLUIDO', 'alta', '2026-05-04 09:00:00-03', '2026-05-05 14:00:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260503', 'Bruno Castro', '16161616161', 'Financeiro', 'Fornecedor nao recebeu pagamento', 'EM_ATENDIMENTO', 'critica', '2026-05-06 10:00:00-03', '2026-05-06 10:00:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260504', 'Cintia Martins', '17171717171', 'Marketing', 'Arte da campanha do dia das maes', 'CONCLUIDO', 'alta', '2026-05-07 08:30:00-03', '2026-05-08 16:00:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260505', 'Daniel Oliveira', '18181818181', 'Administrativo', 'Contrato de locacao - revisao de clausulas', 'CONCLUIDO', 'normal', '2026-05-08 09:00:00-03', '2026-05-12 11:00:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260506', 'Elaine Santos', '19191919191', 'TI', 'Notebook com defeito na tela', 'EM_ATENDIMENTO', 'alta', '2026-05-10 08:00:00-03', '2026-05-10 08:00:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260507', 'Fabio Henrique', '20202020202', 'Comercial', 'Sistema CRM travando ao gerar relatorio', 'AGUARDANDO', 'normal', '2026-05-11 11:00:00-03', '2026-05-11 11:00:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260508', 'Giovana Lima', '21212121212', 'RH', 'Beneficios nao estao aparecendo no portal', 'CONCLUIDO', 'normal', '2026-05-13 09:30:00-03', '2026-05-14 15:00:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260509', 'Heitor Martins', '22222222222', 'Financeiro', 'Concilicacao bancaria com divergencia', 'AGUARDANDO', 'alta', '2026-05-14 14:00:00-03', '2026-05-14 14:00:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260510', 'Iris Campos', '23232323232', 'TI', 'Mouse e teclado sem funcionar', 'FECHADO', 'baixa', '2026-05-16 08:00:00-03', '2026-05-16 10:00:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260511', 'Joao Vitor', '24242424242', 'Administrativo', 'Solicitacao de cartao corporativo', 'NOVO', 'normal', '2026-05-18 10:00:00-03', '2026-05-18 10:00:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260512', 'Karen Barbosa', '25252525252', 'Marketing', 'Post para redes sociais - revisao', 'CONCLUIDO', 'baixa', '2026-05-19 09:00:00-03', '2026-05-19 15:30:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260513', 'Leonardo Costa', '26262626262', 'Comercial', 'Contrato de cliente com clausula incorreta', 'EM_ATENDIMENTO', 'critica', '2026-05-20 14:00:00-03', '2026-05-20 14:00:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260514', 'Marina Silva', '27272727272', 'TI', 'Instalar software no computador', 'CONCLUIDO', 'normal', '2026-05-21 08:30:00-03', '2026-05-21 16:45:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260515', 'Nelson Oliveira', '28282828282', 'RH', 'Ferias nao registradas no sistema', 'CANCELADO', 'normal', '2026-05-22 09:00:00-03', '2026-05-25 11:00:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260516', 'Olivia Santos', '29292929292', 'Financeiro', 'Boleto com vencimento incorreto', 'FECHADO', 'alta', '2026-05-25 10:00:00-03', '2026-05-25 15:00:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260517', 'Paulo Roberto', '30303030303', 'Administrativo', 'Documentacao para licitacao', 'EM_ATENDIMENTO', 'alta', '2026-05-27 08:00:00-03', '2026-05-27 08:00:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260518', 'Quiteria Alves', '31313131313', 'TI', 'Senha do Wi-Fi corporativo expirou', 'FECHADO', 'baixa', '2026-05-29 09:00:00-03', '2026-05-29 09:30:00-03');

-- JUNHO (20 chamados)
INSERT INTO "Chamado" (id, "empresaId", ticket, nome, cpf, setor, descricao, status, prioridade, "createdAt", "updatedAt") VALUES
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260601', 'Rafaela Nunes', '32323232323', 'TI', 'Servidor de arquivos inacessivel', 'EM_ATENDIMENTO', 'critica', '2026-06-01 07:30:00-03', '2026-06-01 07:30:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260602', 'Samuel Torres', '33333333333', 'Financeiro', 'Nota fiscal eletronica com erro de destinatario', 'NOVO', 'alta', '2026-06-02 10:00:00-03', '2026-06-02 10:00:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260603', 'Tatiane Reis', '34343434343', 'RH', 'Folha de pagamento - desconto incorreto de INSS', 'EM_ATENDIMENTO', 'critica', '2026-06-03 08:00:00-03', '2026-06-03 08:00:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260604', 'Ubiratan Costa', '35353535353', 'Comercial', 'Sistema de propostas nao esta enviando email', 'AGUARDANDO', 'alta', '2026-06-04 09:30:00-03', '2026-06-04 09:30:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260605', 'Vanessa Lopes', '36363636363', 'Administrativo', 'Solicitacao de reforma do escritorio', 'NOVO', 'normal', '2026-06-05 10:00:00-03', '2026-06-05 10:00:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260606', 'Wagner Melo', '37373737373', 'TI', 'Monitor com pixels queimados - garantia', 'EM_ATENDIMENTO', 'normal', '2026-06-06 08:00:00-03', '2026-06-06 08:00:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260607', 'Xavier Santos', '38383838383', 'Marketing', 'Criacao de landing page para promocao', 'NOVO', 'normal', '2026-06-07 11:00:00-03', '2026-06-07 11:00:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260608', 'Yara Fonseca', '39393939393', 'Financeiro', 'Pagamento a fornecedor atrasado por erro de boleto', 'EM_ATENDIMENTO', 'alta', '2026-06-08 14:00:00-03', '2026-06-08 14:00:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260609', 'Zelia Martins', '40404040404', 'RH', 'Contratacao de estagiario - documentacao', 'AGUARDANDO', 'normal', '2026-06-09 09:00:00-03', '2026-06-09 09:00:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260610', 'Adriano Silva', '41414141414', 'TI', 'Antivirus corporativo bloqueando sistema legitimo', 'EM_ATENDIMENTO', 'alta', '2026-06-10 08:30:00-03', '2026-06-10 08:30:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260611', 'Bianca Rocha', '42424242424', 'Administrativo', 'Compra de moveis para nova sala', 'NOVO', 'normal', '2026-06-10 10:00:00-03', '2026-06-10 10:00:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260612', 'Caio Junior', '43434343433', 'Comercial', 'Proposta personalizada para cliente VIP', 'EM_ATENDIMENTO', 'alta', '2026-06-11 11:00:00-03', '2026-06-11 11:00:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260613', 'Daniela Campos', '44444444444', 'Financeiro', 'Relatorio de despesas do mes nao fecha', 'NOVO', 'normal', '2026-06-12 09:00:00-03', '2026-06-12 09:00:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260614', 'Eduardo Lima', '45454545455', 'TI', 'Configuracao de novo colaborador - notebook e acessos', 'AGUARDANDO', 'normal', '2026-06-12 14:00:00-03', '2026-06-12 14:00:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260615', 'Fabiana Souza', '46464646466', 'RH', 'Programa de estagio - duvidas sobre vagas', 'NOVO', 'baixa', '2026-06-13 08:00:00-03', '2026-06-13 08:00:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260616', 'Gustavo Silva', '47474747477', 'Administrativo', 'Solicitacao de visitas para cliente externo', 'AGUARDANDO', 'baixa', '2026-06-13 10:30:00-03', '2026-06-13 10:30:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260617', 'Helena Dias', '48484848488', 'Marketing', 'Relatorio de metricas das redes sociais', 'NOVO', 'normal', '2026-06-14 09:00:00-03', '2026-06-14 09:00:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260618', 'Igor Nunes', '49494949499', 'Financeiro', 'Nota fiscal de servico com ISS incorreto', 'EM_ATENDIMENTO', 'alta', '2026-06-14 15:00:00-03', '2026-06-14 15:00:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260619', 'Julia Carvalho', '50505050500', 'Comercial', 'Contrato de renovacao com clausula de reajuste', 'NOVO', 'normal', '2026-06-15 08:30:00-03', '2026-06-15 08:30:00-03'),
  (gen_random_uuid(), 'ba11f1db-b899-4faf-9417-22ce27f24917', 'TKT-20260620', 'Kevin Barbosa', '51515151511', 'TI', 'Sistema de telefonia IP com problemas de audio', 'EM_ATENDIMENTO', 'alta', '2026-06-15 10:00:00-03', '2026-06-15 10:00:00-03');

-- ===========================================================
-- RESUMO DOS DADOS INSERIDOS
-- ===========================================================
-- Avisos: 8 (2 RH, 2 TI, 1 Financeiro, 2 Administrativo, 1 Geral)
-- Chamados Evitados: 20 (Abril:5, Maio:7, Junho:8)
-- Chamados Reais: 50 (Abril:12, Maio:18, Junho:20)
--   Status: NOVO(8) | EM_ATENDIMENTO(10) | AGUARDANDO(7) | CONCLUIDO(15) | FECHADO(7) | CANCELADO(3)
--   Setores: RH(6) | TI(12) | Financeiro(9) | Administrativo(8) | Marketing(5) | Comercial(5) | Geral(5)
--
-- Para visualizar os dados inseridos:
--   SELECT * FROM "Chamado" WHERE "empresaId" = 'ba11f1db-b899-4faf-9417-22ce27f24917';
--   SELECT * FROM "tickets_evitados" WHERE "empresaId" = 'ba11f1db-b899-4faf-9417-22ce27f24917';
--   SELECT * FROM "avisos" WHERE "empresaId" = 'ba11f1db-b899-4faf-9417-22ce27f24917';
-- ===========================================================
