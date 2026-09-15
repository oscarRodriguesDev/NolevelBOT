-- CreateTable
CREATE TABLE "colaboradores" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "matricula" TEXT,
    "cpf" TEXT,
    "telefone" TEXT,
    "criadoPorUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "colaboradores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "colaboradores_empresaId_nome_idx" ON "colaboradores"("empresaId", "nome");

-- CreateIndex
CREATE INDEX "colaboradores_empresaId_cpf_idx" ON "colaboradores"("empresaId", "cpf");

-- AlterTable (Chamado: cpf opcional + tipo + colaboradorId)
ALTER TABLE "Chamado" ALTER COLUMN "cpf" DROP NOT NULL;
ALTER TABLE "Chamado" ADD COLUMN "tipo" TEXT NOT NULL DEFAULT 'COLABORADOR';
ALTER TABLE "Chamado" ADD COLUMN "colaboradorId" TEXT;

-- AlterTable (tickets_fechados: cpf opcional)
ALTER TABLE "tickets_fechados" ALTER COLUMN "cpf" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Chamado_empresaId_tipo_idx" ON "Chamado"("empresaId", "tipo");

-- CreateIndex
CREATE INDEX "Chamado_colaboradorId_idx" ON "Chamado"("colaboradorId");

-- AddForeignKey
ALTER TABLE "colaboradores" ADD CONSTRAINT "colaboradores_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colaboradores" ADD CONSTRAINT "colaboradores_criadoPorUserId_fkey" FOREIGN KEY ("criadoPorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chamado" ADD CONSTRAINT "Chamado_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "colaboradores"("id") ON DELETE SET NULL ON UPDATE CASCADE;