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

-- CreateIndex
CREATE INDEX "logs_de_acesso_cpf_idx" ON "logs_de_acesso"("cpf");

-- CreateIndex
CREATE INDEX "logs_de_acesso_empresa_idx" ON "logs_de_acesso"("empresa");

-- CreateIndex
CREATE INDEX "logs_de_acesso_modulo_idx" ON "logs_de_acesso"("modulo");
