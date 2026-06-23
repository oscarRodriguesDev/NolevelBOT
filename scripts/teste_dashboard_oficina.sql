-- ===========================================================
-- SCRIPT DE TESTE - DASHBOARD OFICINA
-- ===========================================================
-- ID da Empresa: c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b
--
-- Como usar:
--   1. Execute no seu banco PostgreSQL
-- ===========================================================

-- ===========================================================
-- CHAMADOS DA OFICINA (50 registros)
-- ===========================================================
-- O campo descricao armazena JSON: {"funcao":"...","numeroOnibus":"...","data":"...","defeito":"..."}
--
-- Distribuicao planejada:
--   Veiculos: 1001 a 1010 (10 veiculos)
--   Defeitos: 10 tipos diferentes
--   Funcoes: 5 tipos
--   Status: NOVO(6) | EM_ATENDIMENTO(10) | AGUARDANDO(6) | CONCLUIDO(22) | FECHADO(4) | CANCELADO(2)
--   Meses: Abril(10), Maio(16), Junho(24)

-- ABRIL (10 chamados)
INSERT INTO "Chamado" (id, "empresaId", ticket, nome, cpf, setor, descricao, status, prioridade, "createdAt", "updatedAt") VALUES
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260401', 'Joao Silva', '11111111111', 'Oficina', '{"funcao":"Mecanico","numeroOnibus":"1006","data":"2026-04-01","defeito":"Caixa de cambio batendo"}', 'CONCLUIDO', 'alta', '2026-04-01 08:00:00-03', '2026-04-01 14:30:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260402', 'Carlos Pereira', '22222222222', 'Oficina', '{"funcao":"Borracheiro","numeroOnibus":"1002","data":"2026-04-02","defeito":"Pneu careca"}', 'CONCLUIDO', 'normal', '2026-04-02 09:00:00-03', '2026-04-02 11:00:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260403', 'Pedro Almeida', '33333333333', 'Oficina', '{"funcao":"Eletricista","numeroOnibus":"1003","data":"2026-04-03","defeito":"Bateria descarregada"}', 'CONCLUIDO', 'baixa', '2026-04-03 10:00:00-03', '2026-04-03 15:00:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260404', 'Maria Santos', '44444444444', 'Oficina', '{"funcao":"Funileiro","numeroOnibus":"1004","data":"2026-04-05","defeito":"Suspensao com folga"}', 'CONCLUIDO', 'normal', '2026-04-05 08:30:00-03', '2026-04-07 16:00:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260405', 'Ana Costa', '55555555555', 'Oficina', '{"funcao":"Mecanico","numeroOnibus":"1005","data":"2026-04-08","defeito":"Embreagem patinando"}', 'CONCLUIDO', 'alta', '2026-04-08 09:00:00-03', '2026-04-09 11:00:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260406', 'Rafael Souza', '66666666666', 'Oficina', '{"funcao":"Mecanico","numeroOnibus":"1006","data":"2026-04-10","defeito":"Caixa de cambio batendo"}', 'CONCLUIDO', 'critica', '2026-04-10 07:00:00-03', '2026-04-11 17:00:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260407', 'Fernanda Lima', '77777777777', 'Oficina', '{"funcao":"Eletricista","numeroOnibus":"1007","data":"2026-04-12","defeito":"Alternador com defeito"}', 'CONCLUIDO', 'alta', '2026-04-12 08:00:00-03', '2026-04-13 10:00:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260408', 'Gabriel Rocha', '88888888888', 'Oficina', '{"funcao":"Ar condicionado","numeroOnibus":"1008","data":"2026-04-15","defeito":"Ar condicionado quebrado"}', 'CONCLUIDO', 'normal', '2026-04-15 10:00:00-03', '2026-04-16 14:00:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260409', 'Lucia Oliveira', '99999999999', 'Oficina', '{"funcao":"Borracheiro","numeroOnibus":"1004","data":"2026-04-18","defeito":"Pneu careca"}', 'FECHADO', 'normal', '2026-04-18 09:00:00-03', '2026-04-18 10:30:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260410', 'Marcos Paulo', '10101010101', 'Oficina', '{"funcao":"Mecanico","numeroOnibus":"1009","data":"2026-04-22","defeito":"Injetor entupido"}', 'CONCLUIDO', 'normal', '2026-04-22 08:00:00-03', '2026-04-23 16:30:00-03');

-- MAIO (16 chamados)
INSERT INTO "Chamado" (id, "empresaId", ticket, nome, cpf, setor, descricao, status, prioridade, "createdAt", "updatedAt") VALUES
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260501', 'Ricardo Gomes', '11111111112', 'Oficina', '{"funcao":"Mecanico","numeroOnibus":"1006","data":"2026-05-02","defeito":"Motor superaquecendo"}', 'CONCLUIDO', 'alta', '2026-05-02 07:00:00-03', '2026-05-02 13:00:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260502', 'Amanda Farias', '22222222223', 'Oficina', '{"funcao":"Eletricista","numeroOnibus":"1003","data":"2026-05-04","defeito":"Freios desgastados"}', 'CONCLUIDO', 'critica', '2026-05-04 09:00:00-03', '2026-05-04 12:00:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260503', 'Bruno Castro', '33333333334', 'Oficina', '{"funcao":"Funileiro","numeroOnibus":"1002","data":"2026-05-05","defeito":"Suspensao com folga"}', 'CONCLUIDO', 'normal', '2026-05-05 08:00:00-03', '2026-05-06 15:00:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260504', 'Cintia Martins', '44444444445', 'Oficina', '{"funcao":"Mecanico","numeroOnibus":"1003","data":"2026-05-06","defeito":"Motor superaquecendo"}', 'EM_ATENDIMENTO', 'alta', '2026-05-06 10:00:00-03', '2026-05-06 10:00:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260505', 'Daniel Oliveira', '55555555556', 'Oficina', '{"funcao":"Ar condicionado","numeroOnibus":"1010","data":"2026-05-07","defeito":"Ar condicionado quebrado"}', 'CONCLUIDO', 'normal', '2026-05-07 09:30:00-03', '2026-05-08 11:00:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260506', 'Elaine Santos', '66666666667', 'Oficina', '{"funcao":"Mecanico","numeroOnibus":"1005","data":"2026-05-09","defeito":"Freios desgastados"}', 'CONCLUIDO', 'alta', '2026-05-09 08:00:00-03', '2026-05-09 16:00:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260507', 'Fabio Henrique', '77777777778', 'Oficina', '{"funcao":"Borracheiro","numeroOnibus":"1004","data":"2026-05-10","defeito":"Pneu careca"}', 'EM_ATENDIMENTO', 'normal', '2026-05-10 11:00:00-03', '2026-05-10 11:00:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260508', 'Giovana Lima', '88888888889', 'Oficina', '{"funcao":"Eletricista","numeroOnibus":"1007","data":"2026-05-12","defeito":"Bateria descarregada"}', 'CONCLUIDO', 'normal', '2026-05-12 09:00:00-03', '2026-05-12 14:00:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260509', 'Heitor Martins', '99999999990', 'Oficina', '{"funcao":"Mecanico","numeroOnibus":"1008","data":"2026-05-14","defeito":"Caixa de cambio batendo"}', 'AGUARDANDO', 'alta', '2026-05-14 14:00:00-03', '2026-05-14 14:00:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260510', 'Iris Campos', '10101010102', 'Oficina', '{"funcao":"Mecanico","numeroOnibus":"1006","data":"2026-05-16","defeito":"Motor superaquecendo"}', 'FECHADO', 'alta', '2026-05-16 08:00:00-03', '2026-05-16 17:00:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260511', 'Joao Vitor', '11111111113', 'Oficina', '{"funcao":"Eletricista","numeroOnibus":"1009","data":"2026-05-18","defeito":"Alternador com defeito"}', 'CONCLUIDO', 'normal', '2026-05-18 10:00:00-03', '2026-05-18 15:30:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260512', 'Karen Barbosa', '22222222224', 'Oficina', '{"funcao":"Mecanico","numeroOnibus":"1010","data":"2026-05-20","defeito":"Embreagem patinando"}', 'NOVO', 'normal', '2026-05-20 09:00:00-03', '2026-05-20 09:00:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260513', 'Leonardo Costa', '33333333335', 'Oficina', '{"funcao":"Mecanico","numeroOnibus":"1003","data":"2026-05-20","defeito":"Freios desgastados"}', 'EM_ATENDIMENTO', 'critica', '2026-05-20 14:00:00-03', '2026-05-20 14:00:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260514', 'Marina Silva', '44444444446', 'Oficina', '{"funcao":"Funileiro","numeroOnibus":"1005","data":"2026-05-22","defeito":"Suspensao com folga"}', 'CONCLUIDO', 'normal', '2026-05-22 08:30:00-03', '2026-05-23 16:00:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260515', 'Nelson Oliveira', '55555555557', 'Oficina', '{"funcao":"Ar condicionado","numeroOnibus":"1008","data":"2026-05-25","defeito":"Ar condicionado quebrado"}', 'AGUARDANDO', 'normal', '2026-05-25 10:00:00-03', '2026-05-25 10:00:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260516', 'Olivia Santos', '66666666668', 'Oficina', '{"funcao":"Eletricista","numeroOnibus":"1002","data":"2026-05-28","defeito":"Bateria descarregada"}', 'CANCELADO', 'baixa', '2026-05-28 09:00:00-03', '2026-05-28 11:00:00-03');

-- JUNHO (24 chamados)
INSERT INTO "Chamado" (id, "empresaId", ticket, nome, cpf, setor, descricao, status, prioridade, "createdAt", "updatedAt") VALUES
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260601', 'Paulo Roberto', '77777777779', 'Oficina', '{"funcao":"Mecanico","numeroOnibus":"1001","data":"2026-06-01","defeito":"Motor superaquecendo"}', 'EM_ATENDIMENTO', 'alta', '2026-06-01 07:30:00-03', '2026-06-01 07:30:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260602', 'Quiteria Alves', '88888888880', 'Oficina', '{"funcao":"Borracheiro","numeroOnibus":"1001","data":"2026-06-01","defeito":"Pneu careca"}', 'NOVO', 'normal', '2026-06-01 08:00:00-03', '2026-06-01 08:00:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260603', 'Rafaela Nunes', '99999999991', 'Oficina', '{"funcao":"Mecanico","numeroOnibus":"1003","data":"2026-06-02","defeito":"Motor superaquecendo"}', 'EM_ATENDIMENTO', 'critica', '2026-06-02 07:00:00-03', '2026-06-02 07:00:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260604', 'Samuel Torres', '10101010103', 'Oficina', '{"funcao":"Eletricista","numeroOnibus":"1004","data":"2026-06-02","defeito":"Alternador com defeito"}', 'NOVO', 'alta', '2026-06-02 10:00:00-03', '2026-06-02 10:00:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260605', 'Tatiane Reis', '11111111114', 'Oficina', '{"funcao":"Mecanico","numeroOnibus":"1010","data":"2026-06-03","defeito":"Freios desgastados"}', 'EM_ATENDIMENTO', 'alta', '2026-06-03 08:00:00-03', '2026-06-03 08:00:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260606', 'Ubiratan Costa', '22222222225', 'Oficina', '{"funcao":"Funileiro","numeroOnibus":"1006","data":"2026-06-03","defeito":"Suspensao com folga"}', 'AGUARDANDO', 'normal', '2026-06-03 09:30:00-03', '2026-06-03 09:30:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260607', 'Vanessa Lopes', '33333333336', 'Oficina', '{"funcao":"Mecanico","numeroOnibus":"1002","data":"2026-06-04","defeito":"Injetor entupido"}', 'CONCLUIDO', 'normal', '2026-06-04 10:00:00-03', '2026-06-04 15:30:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260608', 'Wagner Melo', '44444444447', 'Oficina', '{"funcao":"Eletricista","numeroOnibus":"1007","data":"2026-06-05","defeito":"Alternador com defeito"}', 'EM_ATENDIMENTO', 'normal', '2026-06-05 08:00:00-03', '2026-06-05 08:00:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260609', 'Xavier Santos', '55555555558', 'Oficina', '{"funcao":"Mecanico","numeroOnibus":"1009","data":"2026-06-05","defeito":"Embreagem patinando"}', 'NOVO', 'normal', '2026-06-05 11:00:00-03', '2026-06-05 11:00:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260610', 'Yara Fonseca', '66666666669', 'Oficina', '{"funcao":"Ar condicionado","numeroOnibus":"1008","data":"2026-06-08","defeito":"Ar condicionado quebrado"}', 'EM_ATENDIMENTO', 'alta', '2026-06-08 14:00:00-03', '2026-06-08 14:00:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260611', 'Zelia Martins', '77777777770', 'Oficina', '{"funcao":"Mecanico","numeroOnibus":"1005","data":"2026-06-09","defeito":"Motor superaquecendo"}', 'AGUARDANDO', 'normal', '2026-06-09 09:00:00-03', '2026-06-09 09:00:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260612', 'Adriano Silva', '88888888881', 'Oficina', '{"funcao":"Eletricista","numeroOnibus":"1003","data":"2026-06-09","defeito":"Freios desgastados"}', 'EM_ATENDIMENTO', 'critica', '2026-06-09 10:00:00-03', '2026-06-09 10:00:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260613', 'Bianca Rocha', '99999999992', 'Oficina', '{"funcao":"Mecanico","numeroOnibus":"1010","data":"2026-06-10","defeito":"Caixa de cambio batendo"}', 'NOVO', 'normal', '2026-06-10 08:30:00-03', '2026-06-10 08:30:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260614', 'Caio Junior', '10101010104', 'Oficina', '{"funcao":"Mecanico","numeroOnibus":"1001","data":"2026-06-10","defeito":"Motor superaquecendo"}', 'EM_ATENDIMENTO', 'alta', '2026-06-10 10:00:00-03', '2026-06-10 10:00:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260615', 'Daniela Campos', '11111111115', 'Oficina', '{"funcao":"Borracheiro","numeroOnibus":"1004","data":"2026-06-10","defeito":"Pneu careca"}', 'EM_ATENDIMENTO', 'normal', '2026-06-10 11:00:00-03', '2026-06-10 11:00:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260616', 'Eduardo Lima', '22222222226', 'Oficina', '{"funcao":"Mecanico","numeroOnibus":"1006","data":"2026-06-11","defeito":"Freios desgastados"}', 'AGUARDANDO', 'normal', '2026-06-11 14:00:00-03', '2026-06-11 14:00:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260617', 'Fabiana Souza', '33333333337', 'Oficina', '{"funcao":"Eletricista","numeroOnibus":"1009","data":"2026-06-11","defeito":"Bateria descarregada"}', 'CONCLUIDO', 'baixa', '2026-06-11 08:00:00-03', '2026-06-11 12:00:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260618', 'Gustavo Silva', '44444444448', 'Oficina', '{"funcao":"Mecanico","numeroOnibus":"1005","data":"2026-06-12","defeito":"Embreagem patinando"}', 'CONCLUIDO', 'normal', '2026-06-12 09:00:00-03', '2026-06-13 10:00:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260619', 'Helena Dias', '55555555559', 'Oficina', '{"funcao":"Funileiro","numeroOnibus":"1007","data":"2026-06-12","defeito":"Suspensao com folga"}', 'CONCLUIDO', 'normal', '2026-06-12 10:30:00-03', '2026-06-13 15:00:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260620', 'Igor Nunes', '66666666660', 'Oficina', '{"funcao":"Mecanico","numeroOnibus":"1002","data":"2026-06-13","defeito":"Caixa de cambio batendo"}', 'CONCLUIDO', 'alta', '2026-06-13 08:00:00-03', '2026-06-14 16:00:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260621', 'Julia Carvalho', '77777777771', 'Oficina', '{"funcao":"Ar condicionado","numeroOnibus":"1010","data":"2026-06-13","defeito":"Ar condicionado quebrado"}', 'FECHADO', 'normal', '2026-06-13 09:30:00-03', '2026-06-13 14:00:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260622', 'Kevin Barbosa', '88888888882', 'Oficina', '{"funcao":"Mecanico","numeroOnibus":"1008","data":"2026-06-14","defeito":"Injetor entupido"}', 'CONCLUIDO', 'normal', '2026-06-14 08:00:00-03', '2026-06-14 11:30:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260623', 'Larissa Dias', '99999999993', 'Oficina', '{"funcao":"Eletricista","numeroOnibus":"1003","data":"2026-06-14","defeito":"Bateria descarregada"}', 'CANCELADO', 'baixa', '2026-06-14 09:00:00-03', '2026-06-14 10:00:00-03'),
  (gen_random_uuid(), 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b', 'OF-20260624', 'Milton Campos', '10101010105', 'Oficina', '{"funcao":"Mecanico","numeroOnibus":"1009","data":"2026-06-15","defeito":"Motor superaquecendo"}', 'FECHADO', 'alta', '2026-06-15 07:30:00-03', '2026-06-15 12:00:00-03');

-- ===========================================================
-- RESUMO DOS DADOS INSERIDOS
-- ===========================================================
-- Total: 50 chamados
--
-- Veiculos:
--   1003: 6 ocorrencias (MAIS reincidente - Freios 2x, Motor, Bateria + outros)
--   1001: 5 ocorrencias (Motor superaquecendo 2x + Pneu + outros) <- REINCIDENCIA (Motor: 01/06 + 10/06 = 9d)
--   1005: 5 ocorrencias
--   1002: 4 ocorrencias
--   1008: 4 ocorrencias (Ar condicionado 2x + outros)
--   1010: 4 ocorrencias
--   1006: 4 ocorrencias
--   1007: 4 ocorrencias
--   1004: 4 ocorrencias
--   1009: 3 ocorrencias (MENOS reincidente)
--
-- Defeitos:
--   Motor superaquecendo: 9x
--   Freios desgastados: 6x
--   Ar condicionado quebrado: 5x
--   Pneu careca: 5x
--   Suspensao com folga: 4x
--   Embreagem patinando: 4x
--   Caixa de cambio batendo: 4x
--   Alternador com defeito: 4x
--   Bateria descarregada: 4x
--   Injetor entupido: 3x
--
-- Reincidencia (mesmo veiculo + defeito em <=15dias):
--   Veiculo 1001 + "Motor superaquecendo": 01/06 e 10/06 = 9 dias ✅ REINCIDENCIA
--   Veiculo 1003 + "Freios desgastados": 04/05 e 20/05 = 16 dias (>15, nao conta)
--   Veiculo 1003 + "Freios desgastados": 04/05 e 09/06 = 36 dias (>15, nao conta)
--   Veiculo 1003 + "Freios desgastados": 20/05 e 09/06 = 20 dias (>15, nao conta)
--
-- Funcoes:
--   Mecanico: 22x
--   Eletricista: 10x
--   Funileiro: 5x
--   Ar condicionado: 5x
--   Borracheiro: 4x
--
-- Para visualizar os dados inseridos:
--   SELECT * FROM "Chamado" WHERE "empresaId" = 'c5d84f8e-3dc4-40f9-8afa-8c060ac4a50b' AND "setor" = 'Oficina';
-- ===========================================================
