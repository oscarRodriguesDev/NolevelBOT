-- CreateEnum
CREATE TYPE "ROLE" AS ENUM ('GOD', 'ADMIN', 'GESTOR', 'ATENDENTE');

-- CreateTable
CREATE TABLE "empresa" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "setores" TEXT[],
    "databaseUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
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

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chamado" (
    "id" TEXT NOT NULL,
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
    "titulo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "setor" TEXT,
    "duracao" TEXT,
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
CREATE TABLE "CompanyConfig" (
    "id" TEXT NOT NULL,
    "databaseUrl" TEXT NOT NULL,
    "aiProvider" TEXT NOT NULL DEFAULT 'gpt',
    "aiModel" TEXT,
    "aiApiKey" TEXT,
    "companyName" TEXT,
    "companyLogo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "empresa_nome_key" ON "empresa"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "empresa_cnpj_key" ON "empresa"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_cpf_key" ON "user"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Chamado_ticket_key" ON "Chamado"("ticket");

-- CreateIndex
CREATE UNIQUE INDEX "cpfs_cpf_key" ON "cpfs"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_fechados_ticket_key" ON "tickets_fechados"("ticket");

-- CreateIndex
CREATE UNIQUE INDEX "resumoPersona_cpf_key" ON "resumoPersona"("cpf");

-- AddForeignKey
ALTER TABLE "Chamado" ADD CONSTRAINT "Chamado_atendenteId_fkey" FOREIGN KEY ("atendenteId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
