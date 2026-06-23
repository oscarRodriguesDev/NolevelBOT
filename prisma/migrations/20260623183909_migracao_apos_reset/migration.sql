-- CreateEnum
CREATE TYPE "ROLE" AS ENUM ('GOD', 'ADMIN', 'GESTOR', 'ATENDENTE');

-- CreateEnum
CREATE TYPE "modulo" AS ENUM ('OFICINA', 'CORPORATIVO', 'EVENTOS');

-- CreateTable
CREATE TABLE "empresa" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "setores" TEXT[],
    "logoUrl" TEXT,
    "botName" TEXT,
    "botPresentation" TEXT,
    "botServiceDesc" TEXT,
    "botAvisosDesc" TEXT,
    "botPrompt" TEXT,
    "modulos" "modulo"[],
    "databaseUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "ROLE" NOT NULL,
    "avatarUrl" TEXT,
    "setor" TEXT NOT NULL,
    "resumo" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chamado" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "ticket" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "setor" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "historico" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NOVO',
    "prioridade" TEXT NOT NULL DEFAULT 'normal',
    "anexoUrl" TEXT,
    "atendenteId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chamado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cpfs" (
    "id" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "telefone" TEXT,
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cpfs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets_fechados" (
    "id" TEXT NOT NULL,
    "ticket" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "setor" TEXT NOT NULL,
    "historico" TEXT,
    "prioridade" TEXT NOT NULL,
    "anexoUrl" TEXT,
    "atendente" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_fechados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avisos" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "prompt_bot" TEXT,
    "nome_bot" TEXT,
    "conteudo" TEXT NOT NULL,
    "setor" TEXT,
    "duracao" TEXT,
    "logoUrl" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resumoPersona" (
    "id" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "resumo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resumoPersona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cpfsLeads" (
    "id" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "empresa" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cpfsLeads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs_de_acesso" (
    "id" TEXT NOT NULL,
    "cpf" TEXT,
    "nome" TEXT,
    "empresa" TEXT NOT NULL,
    "modulo" "modulo" NOT NULL,
    "acao" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_de_acesso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets_evitados" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "setor" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "prioridade" TEXT NOT NULL,
    "anexoUrl" TEXT,
    "atendente" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_evitados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cache" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cache_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "empresa_nome_key" ON "empresa"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "empresa_cnpj_key" ON "empresa"("cnpj");

-- CreateIndex
CREATE INDEX "empresa_nome_idx" ON "empresa"("nome");

-- CreateIndex
CREATE INDEX "empresa_cnpj_idx" ON "empresa"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_cpf_key" ON "User"("cpf");

-- CreateIndex
CREATE INDEX "User_empresaId_idx" ON "User"("empresaId");

-- CreateIndex
CREATE INDEX "User_cpf_idx" ON "User"("cpf");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Chamado_ticket_key" ON "Chamado"("ticket");

-- CreateIndex
CREATE INDEX "Chamado_empresaId_idx" ON "Chamado"("empresaId");

-- CreateIndex
CREATE INDEX "Chamado_cpf_idx" ON "Chamado"("cpf");

-- CreateIndex
CREATE INDEX "Chamado_status_idx" ON "Chamado"("status");

-- CreateIndex
CREATE INDEX "Chamado_empresaId_status_idx" ON "Chamado"("empresaId", "status");

-- CreateIndex
CREATE INDEX "Chamado_ticket_idx" ON "Chamado"("ticket");

-- CreateIndex
CREATE UNIQUE INDEX "cpfs_cpf_key" ON "cpfs"("cpf");

-- CreateIndex
CREATE INDEX "cpfs_empresaId_idx" ON "cpfs"("empresaId");

-- CreateIndex
CREATE INDEX "cpfs_cpf_idx" ON "cpfs"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_fechados_ticket_key" ON "tickets_fechados"("ticket");

-- CreateIndex
CREATE INDEX "tickets_fechados_cpf_idx" ON "tickets_fechados"("cpf");

-- CreateIndex
CREATE INDEX "tickets_fechados_ticket_idx" ON "tickets_fechados"("ticket");

-- CreateIndex
CREATE INDEX "avisos_empresaId_idx" ON "avisos"("empresaId");

-- CreateIndex
CREATE INDEX "avisos_setor_idx" ON "avisos"("setor");

-- CreateIndex
CREATE UNIQUE INDEX "resumoPersona_cpf_key" ON "resumoPersona"("cpf");

-- CreateIndex
CREATE INDEX "resumoPersona_cpf_idx" ON "resumoPersona"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "cpfsLeads_cpf_key" ON "cpfsLeads"("cpf");

-- CreateIndex
CREATE INDEX "cpfsLeads_cpf_idx" ON "cpfsLeads"("cpf");

-- CreateIndex
CREATE INDEX "cpfsLeads_telefone_idx" ON "cpfsLeads"("telefone");

-- CreateIndex
CREATE INDEX "logs_de_acesso_cpf_idx" ON "logs_de_acesso"("cpf");

-- CreateIndex
CREATE INDEX "logs_de_acesso_empresa_idx" ON "logs_de_acesso"("empresa");

-- CreateIndex
CREATE INDEX "logs_de_acesso_modulo_idx" ON "logs_de_acesso"("modulo");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chamado" ADD CONSTRAINT "Chamado_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chamado" ADD CONSTRAINT "Chamado_atendenteId_fkey" FOREIGN KEY ("atendenteId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cpfs" ADD CONSTRAINT "cpfs_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avisos" ADD CONSTRAINT "avisos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
