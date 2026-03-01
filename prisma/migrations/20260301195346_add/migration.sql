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

-- CreateIndex
CREATE UNIQUE INDEX "tickets_fechados_ticket_key" ON "tickets_fechados"("ticket");
