SELECT COUNT(*) as total FROM chamado;
SELECT ticket, cpf, setor, nome, "createdAt" FROM chamado ORDER BY "createdAt" DESC LIMIT 10;
